/**
 * Script para limpar todas as questões dos exames no Firebase
 * Útil antes de adicionar questões atualizadas
 * 
 * Para executar:
 * npx ts-node scripts/cleanExamQuestions.ts
 */

import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, deleteDoc, doc } from 'firebase/firestore';

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

async function cleanQuestions() {
  console.log('🧹 Limpando questões dos exames...\n');

  const examsCollection = collection(db, 'exams');
  const snapshot = await getDocs(examsCollection);

  console.log(`📊 Total de exames: ${snapshot.size}\n`);

  let totalQuestionsDeleted = 0;

  for (const examDoc of snapshot.docs) {
    const examData = examDoc.data();
    const examId = examDoc.id;

    // Buscar questões do exame
    const questionsSnapshot = await getDocs(collection(db, 'exams', examId, 'questions'));
    
    if (questionsSnapshot.size === 0) {
      console.log(`⏭️  ${examData.title || 'Sem título'}: sem questões`);
      continue;
    }

    // Deletar todas as questões
    let deletedCount = 0;
    for (const questionDoc of questionsSnapshot.docs) {
      await deleteDoc(doc(db, 'exams', examId, 'questions', questionDoc.id));
      deletedCount++;
    }

    console.log(`🗑️  ${examData.title || 'Sem título'}: ${deletedCount} questões deletadas`);
    totalQuestionsDeleted += deletedCount;
  }

  console.log(`\n📊 Resumo:`);
  console.log(`   Total de questões deletadas: ${totalQuestionsDeleted}`);
  
  console.log('\n✅ Limpeza concluída!');
  process.exit(0);
}

cleanQuestions().catch((error) => {
  console.error('❌ Erro na limpeza:', error);
  process.exit(1);
});
