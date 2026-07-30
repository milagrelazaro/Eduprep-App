/**
 * Script para verificar dados no Firebase
 * Verifica se exames e universidades estão cadastrados
 */

import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../src/config/firebase';

interface ExamSummary {
  id: string;
  institution: string;
  subject: string;
  year: number;
  questionsCount: number;
  status: string;
}

interface UniversitySummary {
  id: string;
  name: string;
  fullName: string;
  location: string;
}

async function checkExams() {
  console.log('\n=== VERIFICANDO EXAMES NO FIREBASE ===\n');
  
  try {
    const examsSnapshot = await getDocs(collection(db, 'exams'));
    
    if (examsSnapshot.empty) {
      console.log('❌ NENHUM EXAME ENCONTRADO NO FIREBASE!');
      console.log('\n📋 AÇÃO NECESSÁRIA:');
      console.log('   - Cadastrar exames baseados nos PDFs compartilhados');
      console.log('   - Usar AdminExamsScreen para criar exames');
      console.log('   - Ou executar script de importação\n');
      return [];
    }
    
    const exams: ExamSummary[] = [];
    
    for (const examDoc of examsSnapshot.docs) {
      const examData = examDoc.data();
      
      // Buscar questões da subcoleção
      const questionsSnapshot = await getDocs(
        collection(db, 'exams', examDoc.id, 'questions')
      );
      
      exams.push({
        id: examDoc.id,
        institution: examData.institution || 'N/A',
        subject: examData.subject || 'N/A',
        year: examData.year || 0,
        questionsCount: questionsSnapshot.size,
        status: examData.status || 'unknown',
      });
    }
    
    console.log(`✅ ${exams.length} EXAMES ENCONTRADOS:\n`);
    
    // Agrupar por instituição
    const byInstitution: { [key: string]: ExamSummary[] } = {};
    exams.forEach(exam => {
      if (!byInstitution[exam.institution]) {
        byInstitution[exam.institution] = [];
      }
      byInstitution[exam.institution].push(exam);
    });
    
    Object.entries(byInstitution).forEach(([institution, institutionExams]) => {
      console.log(`\n📚 ${institution}:`);
      institutionExams.forEach(exam => {
        console.log(`   - ${exam.subject} (${exam.year}) - ${exam.questionsCount} questões - Status: ${exam.status}`);
      });
    });
    
    // Verificar exames aprovados
    const approvedExams = exams.filter(e => e.status === 'approved');
    console.log(`\n✅ ${approvedExams.length} exames APROVADOS (visíveis no simulador)`);
    console.log(`⏳ ${exams.length - approvedExams.length} exames PENDENTES/REJEITADOS\n`);
    
    return exams;
  } catch (error) {
    console.error('❌ Erro ao verificar exames:', error);
    return [];
  }
}

async function checkUniversities() {
  console.log('\n=== VERIFICANDO UNIVERSIDADES NO FIREBASE ===\n');
  
  try {
    const universitiesSnapshot = await getDocs(
      query(collection(db, 'universities'), where('active', '==', true))
    );
    
    if (universitiesSnapshot.empty) {
      console.log('❌ NENHUMA UNIVERSIDADE ENCONTRADA NO FIREBASE!');
      console.log('\n📋 UNIVERSIDADES NECESSÁRIAS (baseadas nos exames):');
      console.log('   1. UEM - Universidade Eduardo Mondlane');
      console.log('   2. UP - Universidade Pedagógica');
      console.log('   3. ISRI - Instituto Superior de Relações Internacionais');
      console.log('   4. UCM - Universidade Católica de Moçambique');
      console.log('   5. UniLúrio - Universidade Lúrio');
      console.log('   6. UniZambeze - Universidade Zambeze');
      console.log('   7. ISCTEM - Instituto Superior de Ciências e Tecnologia\n');
      return [];
    }
    
    const universities: UniversitySummary[] = universitiesSnapshot.docs.map(doc => ({
      id: doc.id,
      name: doc.data().name,
      fullName: doc.data().fullName,
      location: doc.data().location,
    }));
    
    console.log(`✅ ${universities.length} UNIVERSIDADES ENCONTRADAS:\n`);
    universities.forEach(uni => {
      console.log(`   - ${uni.name}: ${uni.fullName} (${uni.location})`);
    });
    console.log('');
    
    return universities;
  } catch (error) {
    console.error('❌ Erro ao verificar universidades:', error);
    return [];
  }
}

async function generateReport() {
  console.log('\n╔════════════════════════════════════════════════════════╗');
  console.log('║     RELATÓRIO DE DADOS DO FIREBASE - SIMULAPASS       ║');
  console.log('╚════════════════════════════════════════════════════════╝');
  
  const exams = await checkExams();
  const universities = await checkUniversities();
  
  console.log('\n=== RESUMO FINAL ===\n');
  
  if (exams.length === 0) {
    console.log('⚠️  CRÍTICO: Nenhum exame cadastrado!');
    console.log('   → O simulador não terá questões para exibir');
    console.log('   → É necessário cadastrar exames baseados nos PDFs\n');
  } else {
    const approvedCount = exams.filter(e => e.status === 'approved').length;
    if (approvedCount === 0) {
      console.log('⚠️  ATENÇÃO: Nenhum exame aprovado!');
      console.log('   → Exames existem mas não estão visíveis no simulador');
      console.log('   → Admin precisa aprovar os exames\n');
    } else {
      console.log(`✅ ${approvedCount} exames prontos para uso no simulador\n`);
    }
  }
  
  if (universities.length === 0) {
    console.log('⚠️  AVISO: Nenhuma universidade cadastrada!');
    console.log('   → Tela de favoritos usará fallback local');
    console.log('   → Recomendado cadastrar no Firebase\n');
  } else {
    console.log(`✅ ${universities.length} universidades disponíveis\n`);
  }
  
  console.log('\n=== PRÓXIMOS PASSOS ===\n');
  
  if (exams.length === 0) {
    console.log('1. 📝 Cadastrar exames dos PDFs no Firebase');
    console.log('   - Opção A: Usar AdminExamsScreen manualmente');
    console.log('   - Opção B: Executar script de importação');
    console.log('   - Opção C: Importar JSON com os dados dos PDFs\n');
  }
  
  if (universities.length === 0) {
    console.log('2. 🏛️  Cadastrar universidades no Firebase');
    console.log('   - Executar script: npm run seed:universities\n');
  }
  
  console.log('3. ✅ Aprovar exames pendentes (se houver)');
  console.log('4. 🧪 Testar simulador com dados reais\n');
  
  console.log('═══════════════════════════════════════════════════════\n');
}

// Executar relatório
generateReport().catch(console.error);
