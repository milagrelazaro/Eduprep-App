/**
 * Script para limpar exames duplicados ou de teste no Firebase Firestore
 * Útil para remover aqueles exames de Matemática que aparecem para todas as instituições
 * 
 * Para executar:
 * npx ts-node scripts/cleanDuplicateExams.ts
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

async function cleanDuplicates() {
  console.log('🧹 Iniciando limpeza de exames duplicados...\n');

  const examsCollection = collection(db, 'exams');
  const snapshot = await getDocs(examsCollection);

  console.log(`📊 Total de exames encontrados: ${snapshot.size}\n`);

  // Agrupar por subject + institution + year
  const examGroups = new Map<string, any[]>();

  snapshot.docs.forEach((docSnapshot) => {
    const data = docSnapshot.data();
    const key = `${data.subject}-${data.institution}-${data.year}`;
    
    if (!examGroups.has(key)) {
      examGroups.set(key, []);
    }
    
    examGroups.get(key)!.push({
      id: docSnapshot.id,
      ...data,
    });
  });

  // Encontrar duplicados
  let duplicatesFound = 0;
  let duplicatesDeleted = 0;

  for (const [key, exams] of examGroups.entries()) {
    if (exams.length > 1) {
      console.log(`⚠️  Duplicados encontrados para: ${key}`);
      console.log(`   Total: ${exams.length} documentos`);
      
      // Manter o mais recente, deletar os outros
      const sorted = exams.sort((a, b) => {
        const dateA = a.createdAt?.toDate ? a.createdAt.toDate() : new Date(a.createdAt);
        const dateB = b.createdAt?.toDate ? b.createdAt.toDate() : new Date(b.createdAt);
        return dateB.getTime() - dateA.getTime();
      });

      const toKeep = sorted[0];
      const toDelete = sorted.slice(1);

      console.log(`   ✅ Mantendo: ${toKeep.id} (${toKeep.createdAt})`);
      
      for (const exam of toDelete) {
        try {
          await deleteDoc(doc(db, 'exams', exam.id));
          console.log(`   ❌ Deletado: ${exam.id}`);
          duplicatesDeleted++;
        } catch (error) {
          console.error(`   ⚠️  Erro ao deletar ${exam.id}:`, error);
        }
      }
      
      duplicatesFound += exams.length - 1;
      console.log('');
    }
  }

  console.log(`\n📊 Resumo:`);
  console.log(`   Duplicados encontrados: ${duplicatesFound}`);
  console.log(`   Duplicados deletados: ${duplicatesDeleted}`);
  console.log(`   Exames únicos restantes: ${examGroups.size}`);
  
  console.log('\n✅ Limpeza concluída!');
  process.exit(0);
}

cleanDuplicates().catch((error) => {
  console.error('❌ Erro na limpeza:', error);
  process.exit(1);
});
