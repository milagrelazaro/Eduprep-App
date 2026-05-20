import { initializeApp } from 'firebase/app';
import { getAuth, signInWithEmailAndPassword, updatePassword } from 'firebase/auth';
import { getFirestore, collection, addDoc, query, where, getDocs, serverTimestamp } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyDkrZwgzFDb8x_aCaD-XCVFXDokrJiQGDE",
  authDomain: "fitness-app-realtime.firebaseapp.com",
  projectId: "fitness-app-realtime",
  storageBucket: "fitness-app-realtime.firebasestorage.app",
  messagingSenderId: "962229257480",
  appId: "1:962229257480:web:e94524524db339e889d8bd",
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

async function resetAdminPassword() {
  const email = 'admin@eduprep.co.mz';
  const possiblePasswords = [
    'admin123456',
    'admin123',
    '123456',
    'password',
    'eduprep123',
  ];
  
  console.log('🔐 Tentando fazer login com senhas comuns...\n');
  
  let firebaseUser = null;
  let usedPassword = '';
  
  // Tentar senhas comuns
  for (const password of possiblePasswords) {
    try {
      console.log(`Tentando senha: ${password}...`);
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      firebaseUser = userCredential.user;
      usedPassword = password;
      console.log(`✅ Login bem-sucedido com senha: ${password}\n`);
      break;
    } catch (error: any) {
      if (error.code === 'auth/wrong-password') {
        console.log(`❌ Senha incorreta`);
      } else if (error.code === 'auth/user-not-found') {
        console.log(`❌ Usuário não encontrado no Firebase Auth\n`);
        console.log('⚠️  O admin precisa ser criado primeiro.');
        console.log('📝 Vá ao Firebase Console > Authentication > Users');
        console.log('➕ Adicione um usuário com email: admin@eduprep.co.mz\n');
        return;
      }
    }
  }
  
  if (!firebaseUser) {
    console.log('\n❌ Nenhuma senha funcionou!');
    console.log('\n📝 Opções:');
    console.log('1. Vá ao Firebase Console > Authentication');
    console.log('2. Encontre o usuário admin@eduprep.co.mz');
    console.log('3. Redefina a senha manualmente');
    console.log('4. Ou delete o usuário e execute: npx ts-node scripts/createAdminUser.ts\n');
    return;
  }
  
  // Verificar se existe documento no Firestore
  const usersRef = collection(db, 'users');
  const q = query(usersRef, where('firebaseUid', '==', firebaseUser.uid));
  const querySnapshot = await getDocs(q);
  
  if (querySnapshot.empty) {
    console.log('📝 Criando documento do admin no Firestore...');
    const userDoc = await addDoc(usersRef, {
      name: 'Administrador',
      email,
      role: 'admin',
      avatar: 'https://ui-avatars.com/api/?name=Administrador&background=1f2937&color=fff',
      status: 'active',
      firebaseUid: firebaseUser.uid,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    console.log('✅ Documento criado:', userDoc.id);
  } else {
    console.log('✅ Documento do admin já existe:', querySnapshot.docs[0].id);
  }
  
  console.log('\n✅ ADMIN CONFIGURADO COM SUCESSO!\n');
  console.log('═══════════════════════════════════');
  console.log('📧 Email: admin@eduprep.co.mz');
  console.log(`🔑 Senha: ${usedPassword}`);
  console.log('═══════════════════════════════════\n');
  console.log('⚠️  Faça login no app agora!\n');
}

resetAdminPassword();
