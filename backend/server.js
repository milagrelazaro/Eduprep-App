require('dotenv').config();
const express = require('express');
const multer = require('multer');
const cors = require('cors');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const admin = require('firebase-admin');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Configuração do Multer para upload de PDFs
const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Apenas arquivos PDF são permitidos'));
    }
  },
});

// Inicializar Firebase Admin
let db;
try {
  const serviceAccount = require('../firebase-service-account.json');
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
  db = admin.firestore();
  console.log('✅ Firebase Admin inicializado');
} catch (error) {
  console.warn('⚠️ Firebase Admin não inicializado (firebase-service-account.json não encontrado)');
  console.warn('⚠️ O backend funcionará em modo de teste sem persistência no Firebase');
}

// Google Gemini API
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);
const model = genAI.getGenerativeModel({ model: 'gemini-1.5-pro' });

// Colunas do CSV
const CSV_COLUMNS = [
  'institution',
  'subject',
  'year',
  'duration',
  'status',
  'topic',
  'question_text',
  'option_a',
  'option_b',
  'option_c',
  'option_d',
  'correct_option',
  'explanation',
  'correct_feedback',
  'incorrect_feedback',
  'learn_more_url',
];

// Endpoint de upload de exame
app.post('/api/upload-exam', upload.single('file'), async (req, res) => {
  try {
    console.log('📥 Requisição recebida');
    console.log('Body:', req.body);
    console.log('File:', req.file);
    
    const { institution, subject, year, duration } = req.body;
    const file = req.file;

    if (!file) {
      console.log('❌ Nenhum arquivo enviado');
      return res.status(400).json({ error: 'Nenhum arquivo enviado' });
    }

    if (!institution || !subject || !year) {
      console.log('❌ Campos obrigatórios faltando:', { institution, subject, year });
      return res.status(400).json({ error: 'Campos obrigatórios faltando: institution, subject, year' });
    }

    console.log(`📄 Processando exame: ${institution} - ${subject} ${year}`);

    // Converter PDF para base64
    const pdfBase64 = file.buffer.toString('base64');

    // Prompt para Claude
    const prompt = `Analise este PDF de exame e extraia todas as questões de múltipla escolha.

INSTITUIÇÃO: ${institution}
DISCIPLINA: ${subject}
ANO: ${year}
DURAÇÃO: ${duration || 90} minutos
STATUS: approved

Para cada questão, extraia:
- topic: Tópico da questão (Álgebra, Geometria, Mecânica, etc.)
- question_text: Texto completo da pergunta
- option_a: Opção A
- option_b: Opção B  
- option_c: Opção C
- option_d: Opção D
- correct_option: Índice da resposta correta (0=A, 1=B, 2=C, 3=D)
- explanation: Explicação breve do porquê da resposta
- correct_feedback: Feedback positivo para resposta correta
- incorrect_feedback: Feedback construtivo para resposta incorreta
- learn_more_url: URL opcional para mais informações (deixe vazio se não houver)

Retorne APENAS em formato CSV válido com cabeçalho:
${CSV_COLUMNS.join(',')}

Não inclua explicações adicionais. Apenas o CSV.`;

    console.log('🤖 Enviando para Google Gemini API...');
    
    // Chamar Google Gemini API
    const result = await model.generateContent([
      {
        inlineData: {
          mimeType: 'application/pdf',
          data: pdfBase64,
        },
      },
      prompt,
    ]);

    // Extrair CSV da resposta
    const response = await result.response;
    const csvText = response.text();
    console.log('✅ CSV gerado com sucesso');

    // Parsear CSV
    const questions = parseCSV(csvText);
    console.log(`📊 ${questions.length} questões extraídas`);

    // Importar para Firebase
    if (db) {
      console.log('💾 Importando para Firebase...');
      await importToFirebase(questions, institution, subject, year, duration);
      console.log('✅ Importação para Firebase concluída');
    } else {
      console.warn('⚠️ Firebase não disponível, pulando importação');
    }

    res.json({
      success: true,
      questionsCount: questions.length,
      csv: csvText,
      message: 'Exame processado e importado com sucesso',
    });
  } catch (error) {
    console.error('❌ Erro ao processar exame:', error);
    res.status(500).json({
      error: 'Erro ao processar exame',
      details: error.message,
    });
  }
});

// Função para parsear CSV
function parseCSV(csvText) {
  const lines = csvText.trim().split('\n');
  const headers = lines[0].split(',');
  const questions = [];

  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(',');
    if (values.length === headers.length) {
      const question = {};
      headers.forEach((header, index) => {
        question[header.trim()] = values[index]?.trim() || '';
      });
      questions.push(question);
    }
  }

  return questions;
}

// Função para importar para Firebase
async function importToFirebase(questions, institution, subject, year, duration) {
  // Criar documento do exame
  const examRef = db.collection('exams').doc();
  const examData = {
    institution,
    subject,
    year: parseInt(year),
    duration: parseInt(duration) || 90,
    status: 'approved',
    totalQuestions: questions.length,
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
  };

  await examRef.set(examData);

  // Adicionar questões como subcoleção
  const questionsRef = examRef.collection('questions');
  const batch = db.batch();

  questions.forEach((question, index) => {
    const questionRef = questionsRef.doc();
    const questionData = {
      ...question,
      questionNumber: index + 1,
      correct_option: parseInt(question.correct_option) || 0,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    };
    batch.set(questionRef, questionData);
  });

  await batch.commit();
}

// Endpoint de health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    firebase: !!db,
    anthropic: !!anthropic,
  });
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando na porta ${PORT}`);
  console.log(`📡 API: http://localhost:${PORT}`);
  console.log(`🔍 Health: http://localhost:${PORT}/api/health`);
});
