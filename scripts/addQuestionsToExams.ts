/**
 * Script para adicionar questões aos exames existentes no Firebase
 * Útil quando os exames já foram criados mas sem questões
 * 
 * Para executar:
 * npx ts-node scripts/addQuestionsToExams.ts
 */

import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, addDoc, query, where } from 'firebase/firestore';
import { MOCK_EXAMS } from '../src/data/mockData';

// Firebase config
const firebaseConfig = {
  apiKey: 'AIzaSyDkrZwgzFDb8x_aCaD-XCVFXDokrJiQGDE',
  authDomain: 'fitness-app-realtime.firebaseapp.com',
  projectId: 'fitness-app-realtime',
  storageBucket: 'fitness-app-realtime.firebasestorage.app',
  messagingSenderId: '1091076858406',
  appId: '1:1091076858406:web:3e0c5c1e7f8b9d0e1f2a3b',
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function addQuestions() {
  console.log('📝 Adicionando questões aos exames existentes...\n');

  const examsCollection = collection(db, 'exams');
  const snapshot = await getDocs(examsCollection);

  console.log(`📊 Total de exames encontrados: ${snapshot.size}\n`);

  let totalQuestionsAdded = 0;

  for (const examDoc of snapshot.docs) {
    const examData = examDoc.data();
    const examId = examDoc.id;

    // Encontrar exame correspondente no MOCK_EXAMS
    const mockExam = MOCK_EXAMS.find(
      (e) =>
        e.subject === examData.subject &&
        e.institution === examData.institution &&
        e.year === examData.year
    );

    if (!mockExam || !mockExam.questions || mockExam.questions.length === 0) {
      console.log(`⏭️  Sem questões para: ${examData.title}`);
      continue;
    }

    // Verificar se já tem questões
    const questionsSnapshot = await getDocs(collection(db, 'exams', examId, 'questions'));
    
    if (questionsSnapshot.size > 0) {
      console.log(`✅ ${examData.title} já tem ${questionsSnapshot.size} questões`);
      continue;
    }

    // Adicionar questões
    const questionsCollection = collection(db, 'exams', examId, 'questions');
    let questionCount = 0;

    const referenceDate = examData.createdAt?.toDate ? examData.createdAt.toDate() : new Date();

    for (const question of mockExam.questions) {
      await addDoc(questionsCollection, {
        text: question.text,
        options: question.options,
        correctOption: question.correctOption,
        explanation: question.explanation || '',
        correctFeedback: question.correctFeedback || 'Resposta correta!',
        incorrectFeedback: question.incorrectFeedback || 'Resposta incorreta. Revise o conteúdo.',
        topic: question.topic || examData.subject,
        createdAt: referenceDate,
      });
      questionCount++;
    }

    console.log(`✅ ${examData.title}: ${questionCount} questões adicionadas`);
    totalQuestionsAdded += questionCount;
  }

  console.log(`\n📊 Resumo:`);
  console.log(`   Total de questões adicionadas: ${totalQuestionsAdded}`);
  console.log(`   Média por exame: ${Math.round(totalQuestionsAdded / snapshot.size)}`);
  
  console.log('\n✅ Questões adicionadas com sucesso!');
  process.exit(0);
}

addQuestions().catch((error) => {
  console.error('❌ Erro ao adicionar questões:', error);
  process.exit(1);
});
