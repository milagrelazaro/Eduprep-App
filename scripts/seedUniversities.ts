/**
 * Script para popular universidades no Firebase
 * Baseado nos exames de admissão de Moçambique
 */

import { collection, addDoc, getDocs, query, where } from 'firebase/firestore';
import { db } from '../src/config/firebase';

const UNIVERSITIES = [
  {
    name: 'UEM',
    fullName: 'Universidade Eduardo Mondlane',
    location: 'Maputo',
    icon: '🎓',
    active: true,
    description: 'A primeira e maior universidade pública de Moçambique',
    website: 'https://www.uem.mz',
  },
  {
    name: 'UP',
    fullName: 'Universidade Pedagógica',
    location: 'Maputo',
    icon: '📚',
    active: true,
    description: 'Especializada na formação de professores',
    website: 'https://www.up.ac.mz',
  },
  {
    name: 'ISRI',
    fullName: 'Instituto Superior de Relações Internacionais',
    location: 'Maputo',
    icon: '🌍',
    active: true,
    description: 'Formação em relações internacionais e diplomacia',
    website: 'https://www.isri.ac.mz',
  },
  {
    name: 'UCM',
    fullName: 'Universidade Católica de Moçambique',
    location: 'Beira',
    icon: '⛪',
    active: true,
    description: 'Universidade privada católica com vários campi',
    website: 'https://www.ucm.ac.mz',
  },
  {
    name: 'UniLúrio',
    fullName: 'Universidade Lúrio',
    location: 'Nampula',
    icon: '🏛️',
    active: true,
    description: 'Universidade pública do norte de Moçambique',
    website: 'https://www.unilurio.ac.mz',
  },
  {
    name: 'UniZambeze',
    fullName: 'Universidade Zambeze',
    location: 'Beira',
    icon: '🌊',
    active: true,
    description: 'Universidade pública da região central',
    website: 'https://www.unizambeze.ac.mz',
  },
  {
    name: 'ISCTEM',
    fullName: 'Instituto Superior de Ciências e Tecnologia de Moçambique',
    location: 'Maputo',
    icon: '💻',
    active: true,
    description: 'Especializado em ciências e tecnologia',
    website: 'https://www.isctem.ac.mz',
  },
];

async function seedUniversities() {
  console.log('\n=== CADASTRANDO UNIVERSIDADES NO FIREBASE ===\n');
  
  try {
    // Verificar se já existem universidades
    const existingSnapshot = await getDocs(collection(db, 'universities'));
    
    if (!existingSnapshot.empty) {
      console.log(`⚠️  Já existem ${existingSnapshot.size} universidades cadastradas.`);
      console.log('   Deseja continuar e adicionar mais? (pode causar duplicatas)\n');
      
      // Listar existentes
      console.log('Universidades existentes:');
      existingSnapshot.docs.forEach(doc => {
        const data = doc.data();
        console.log(`   - ${data.name}: ${data.fullName}`);
      });
      console.log('');
      
      // Em produção, você pode querer pular ou atualizar
      // Por agora, vamos continuar
    }
    
    let added = 0;
    let skipped = 0;
    
    for (const university of UNIVERSITIES) {
      try {
        // Verificar se já existe pelo nome
        const existingQuery = query(
          collection(db, 'universities'),
          where('name', '==', university.name)
        );
        const existing = await getDocs(existingQuery);
        
        if (!existing.empty) {
          console.log(`⏭️  ${university.name} já existe, pulando...`);
          skipped++;
          continue;
        }
        
        // Adicionar universidade
        const docRef = await addDoc(collection(db, 'universities'), {
          ...university,
          createdAt: new Date(),
          updatedAt: new Date(),
        });
        
        console.log(`✅ ${university.name} cadastrada (ID: ${docRef.id})`);
        added++;
        
      } catch (error) {
        console.error(`❌ Erro ao cadastrar ${university.name}:`, error);
      }
    }
    
    console.log(`\n=== RESUMO ===`);
    console.log(`✅ ${added} universidades adicionadas`);
    console.log(`⏭️  ${skipped} universidades já existiam`);
    console.log(`📊 Total no Firebase: ${added + existingSnapshot.size}\n`);
    
  } catch (error) {
    console.error('❌ Erro ao popular universidades:', error);
  }
}

// Executar
seedUniversities().catch(console.error);
