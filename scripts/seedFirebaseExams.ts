/**
 * Script para fazer seed dos 14 exames reais no Firebase Firestore
 * Executa apenas uma vez para popular a coleção 'exams'
 * 
 * Para executar:
 * npx ts-node scripts/seedFirebaseExams.ts
 */

import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc, getDocs, query, where, doc, setDoc } from 'firebase/firestore';
import { MOCK_EXAMS, AVAILABLE_PDF_EXAMS } from '../src/data/mockData';

// Firebase config (mesmo do app)
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

async function seedExams() {
  console.log('🌱 Iniciando seed de exames no Firebase...\n');

  const examsCollection = collection(db, 'exams');

  for (const exam of MOCK_EXAMS) {
    const pdfMeta = AVAILABLE_PDF_EXAMS.find((item) => item.filename === exam.pdfUrl);
    const referenceDate = exam.year ? new Date(`${exam.year}-01-01T00:00:00Z`) : new Date();

    // Verificar se já existe (por título e instituição)
    const q = query(
      examsCollection,
      where('subject', '==', exam.subject),
      where('institution', '==', exam.institution),
      where('year', '==', exam.year || new Date().getFullYear())
    );
    const existingDocs = await getDocs(q);

    if (existingDocs.size > 0) {
      console.log(`⏭️  Exame já existe: ${exam.subject} ${exam.year} - ${exam.institution}`);
      continue;
    }

    // Criar documento no Firestore
    const examData = {
      title: `${exam.subject} ${exam.year ?? new Date().getFullYear()} - ${exam.institution}`,
      subject: exam.subject,
      institution: exam.institution,
      year: exam.year ?? new Date().getFullYear(),
      fileName: exam.pdfUrl || `${exam.subject}.pdf`,
      pdfUrl: exam.pdfUrl,
      size: pdfMeta?.size || '1.2 MB',
      description: `Exame oficial ${exam.institution} ${exam.year ?? ''}`.trim(),
      duration: exam.duration || 90,
      status: exam.status || 'approved',
      uploadSource: 'pdf',
      aiProcessed: !!exam.aiGenerated,
      createdAt: referenceDate,
      updatedAt: referenceDate,
    };

    try {
      const docRef = await addDoc(examsCollection, examData);
      console.log(`✅ Exame criado: ${examData.title} (ID: ${docRef.id})`);

      // Adicionar questões do exame como subcoleção
      if (exam.questions && exam.questions.length > 0) {
        const questionsCollection = collection(db, 'exams', docRef.id, 'questions');
        let questionCount = 0;
        
        for (const question of exam.questions) {
          await addDoc(questionsCollection, {
            text: question.text,
            options: question.options,
            correctOption: question.correctOption,
            explanation: question.explanation || '',
            correctFeedback: question.correctFeedback || 'Resposta correta!',
            incorrectFeedback: question.incorrectFeedback || 'Resposta incorreta. Revise o conteúdo.',
            topic: question.topic || exam.subject,
            createdAt: referenceDate,
          });
          questionCount++;
        }
        
        console.log(`   📝 ${questionCount} questões adicionadas`);
      }
    } catch (error) {
      console.error(`❌ Erro ao criar exame ${examData.title}:`, error);
    }
  }

  console.log('\n✅ Seed concluído!');
  process.exit(0);
}

seedExams().catch((error) => {
  console.error('❌ Erro no seed:', error);
  process.exit(1);
});
