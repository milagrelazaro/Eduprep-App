/**
 * Script para importar exames e questões de um arquivo CSV usando Firebase Admin SDK
 * Bypassa as regras de segurança do Firestore (não precisa de auth)
 * Uso: npx ts-node scripts/importExamsAdmin.ts <caminho-do-arquivo.csv> [--force]
 */

import * as fs from 'fs';
import * as path from 'path';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const admin = require('firebase-admin');
// eslint-disable-next-line @typescript-eslint/no-var-requires
const { getFirestore, FieldValue } = require('firebase-admin/firestore');

interface CSVQuestion {
  institution: string;
  subject: string;
  year: string;
  duration: string;
  status: string;
  topic: string;
  question_text: string;
  option_a: string;
  option_b: string;
  option_c: string;
  option_d: string;
  option_e: string;
  correct_option: string;
  explanation: string;
  correct_feedback: string;
  incorrect_feedback: string;
  learn_more_url: string;
}

interface ExamData {
  institution: string;
  subject: string;
  year: number;
  duration: number;
  status: string;
  questions: any[];
}

const serviceAccount = require('../firebase-service-account.json');

admin.initializeApp({
  credential: admin.cert(serviceAccount),
  projectId: serviceAccount.project_id,
});

const db = getFirestore();

// Parser de linha CSV que respeita campos entre aspas
function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];

    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      result.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  result.push(current.trim());
  return result;
}

// Parser CSV completo que respeita campos multi-linha entre aspas
function parseCSV(filePath: string): CSVQuestion[] {
  const fileContent = fs.readFileSync(filePath, 'utf-8');

  // Encontrar linha de cabeçalho
  const allLines = fileContent.split('\n');
  const headerIndex = allLines.findIndex(line => line.trim().startsWith('institution'));
  if (headerIndex === -1) {
    throw new Error('Cabeçalho não encontrado no arquivo CSV');
  }

  const headers = parseCSVLine(allLines[headerIndex]);

  // Reconstruir linhas respeitando aspas multi-linha
  const dataLines: string[] = [];
  let buffer = '';
  let inQuotes = false;

  for (let i = headerIndex + 1; i < allLines.length; i++) {
    const line = allLines[i];

    if (!buffer) {
      buffer = line;
    } else {
      buffer += '\n' + line;
    }

    // Contar aspas na linha acumulada
    const quoteCount = (buffer.match(/"/g) || []).length;
    inQuotes = quoteCount % 2 !== 0;

    if (!inQuotes) {
      if (buffer.trim() && !buffer.trim().startsWith('#')) {
        dataLines.push(buffer);
      }
      buffer = '';
    }
  }

  if (buffer.trim() && !buffer.trim().startsWith('#')) {
    dataLines.push(buffer);
  }

  const questions: CSVQuestion[] = [];

  for (const line of dataLines) {
    const values = parseCSVLine(line);
    const question: any = {};

    headers.forEach((header, index) => {
      question[header] = values[index] || '';
    });

    questions.push(question as CSVQuestion);
  }

  return questions;
}

// Agrupar questões por exame
function groupQuestionsByExam(questions: CSVQuestion[]): Map<string, ExamData> {
  const examsMap = new Map<string, ExamData>();

  questions.forEach(q => {
    if (!q.institution || !q.question_text) return;

    const examKey = `${q.institution}-${q.subject}-${q.year}`;

    if (!examsMap.has(examKey)) {
      examsMap.set(examKey, {
        institution: q.institution,
        subject: q.subject,
        year: parseInt(q.year) || new Date().getFullYear(),
        duration: parseInt(q.duration) || 90,
        status: q.status || 'pending',
        questions: []
      });
    }

    const exam = examsMap.get(examKey)!;

    exam.questions.push({
      text: q.question_text,
      options: [q.option_a, q.option_b, q.option_c, q.option_d, q.option_e].filter(o => o),
      correctOption: parseInt(q.correct_option) || 0,
      explanation: q.explanation || '',
      correctFeedback: q.correct_feedback || 'Resposta correta!',
      incorrectFeedback: q.incorrect_feedback || 'Resposta incorreta.',
      topic: q.topic || q.subject,
      learnMoreUrl: q.learn_more_url || ''
    });
  });

  return examsMap;
}

// Verificar se exame já existe
async function examExists(institution: string, subject: string, year: number): Promise<boolean> {
  const snapshot = await db.collection('exams')
    .where('institution', '==', institution)
    .where('subject', '==', subject)
    .where('year', '==', year)
    .get();

  return !snapshot.empty;
}

// Importar exame para Firebase
async function importExam(examData: ExamData, skipExisting: boolean = true): Promise<string> {
  const { institution, subject, year, duration, status, questions } = examData;

  if (skipExisting && await examExists(institution, subject, year)) {
    console.log(`⏭️  Exame já existe: ${institution} - ${subject} (${year}) - pulando`);
    return 'skipped';
  }

  try {
    const examRef = await db.collection('exams').add({
      institution,
      subject,
      year,
      duration,
      status,
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp()
    });

    console.log(`✅ Exame criado: ${institution} - ${subject} (${year}) - ID: ${examRef.id}`);

    const batch = db.batch();
    for (const question of questions) {
      const qRef = db.collection('exams').doc(examRef.id).collection('questions').doc();
      batch.set(qRef, {
        ...question,
        createdAt: FieldValue.serverTimestamp()
      });
    }
    await batch.commit();

    console.log(`   📝 ${questions.length} questões adicionadas`);

    return examRef.id;
  } catch (error) {
    console.error(`❌ Erro ao importar exame ${institution} - ${subject} (${year}):`, error);
    throw error;
  }
}

// Função principal
async function importFromCSV(filePath: string, options: { skipExisting?: boolean; force?: boolean } = {}) {
  console.log('\n╔════════════════════════════════════════════════════════╗');
  console.log('║     IMPORTAÇÃO DE EXAMES - SIMULAPASS (Admin SDK)     ║');
  console.log('╚════════════════════════════════════════════════════════╝\n');

  const { skipExisting = true, force = false } = options;

  try {
    if (!fs.existsSync(filePath)) {
      throw new Error(`Arquivo não encontrado: ${filePath}`);
    }

    console.log(`📂 Lendo arquivo: ${filePath}`);

    const questions = parseCSV(filePath);
    console.log(`📊 ${questions.length} questões encontradas no CSV\n`);

    if (questions.length === 0) {
      console.log('⚠️  Nenhuma questão encontrada no arquivo');
      return;
    }

    const examsMap = groupQuestionsByExam(questions);
    console.log(`📚 ${examsMap.size} exames identificados:\n`);

    examsMap.forEach((exam, key) => {
      console.log(`   - ${exam.institution} - ${exam.subject} (${exam.year}) - ${exam.questions.length} questões`);
    });

    console.log('\n🚀 Iniciando importação...\n');

    let imported = 0;
    let skipped = 0;
    let errors = 0;

    for (const [key, examData] of examsMap) {
      try {
        const result = await importExam(examData, skipExisting && !force);

        if (result === 'skipped') {
          skipped++;
        } else {
          imported++;
        }
      } catch (error) {
        errors++;
        console.error(`   ❌ Erro ao importar: ${error}`);
      }
    }

    console.log('\n═══════════════════════════════════════════════════════');
    console.log('📊 RESUMO DA IMPORTAÇÃO:');
    console.log(`   ✅ Importados: ${imported}`);
    console.log(`   ⏭️  Pulados: ${skipped}`);
    console.log(`   ❌ Erros: ${errors}`);
    console.log('═══════════════════════════════════════════════════════\n');

  } catch (error) {
    console.error('\n❌ Erro fatal durante importação:', error);
    process.exit(1);
  }
}

// Executar script
const args = process.argv.slice(2);
const filePath = args[0];

if (!filePath) {
  console.log('\n❌ Erro: Caminho do arquivo CSV não fornecido');
  console.log('\nUso: npx ts-node scripts/importExamsAdmin.ts <caminho-do-arquivo.csv> [--force]');
  console.log('\nExemplo:');
  console.log('  npx ts-node scripts/importExamsAdmin.ts data/exames_import.csv');
  console.log('  npx ts-node scripts/importExamsAdmin.ts data/exames_import.csv --force\n');
  process.exit(1);
}

const force = args.includes('--force');
importFromCSV(filePath, { skipExisting: !force, force }).then(() => {
  process.exit(0);
}).catch(console.error);
