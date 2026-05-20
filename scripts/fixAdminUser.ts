import { initializeApp } from 'firebase/app';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';
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

async function fixAdminUser() {
  try {
    const email = 'admin@eduprep.co.mz';
    const password = 'admin123456'; // Use a senha correta do admin
    
    console.log('🔐 Fazendo login como admin...');
    
    // Fazer login para obter o UID
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const firebaseUser = userCredential.user;
    
    console.log('✅ Login bem-sucedido! UID:', firebaseUser.uid);
    
    // Verificar se já existe documento
    const usersRef = collection(db, 'users');
    const q = query(usersRef, where('firebaseUid', '==', firebaseUser.uid));
    const querySnapshot = await getDocs(q);
    
    if (!querySnapshot.empty) {
      console.log('✅ Documento do admin já existe no Firestore!');
      console.log('📄 ID do documento:', querySnapshot.docs[0].id);
      console.log('📊 Dados:', querySnapshot.docs[0].data());
      return;
    }
    
    // Criar documento no Firestore
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

    console.log('✅ Documento criado com sucesso!');
    console.log('📄 ID do documento:', userDoc.id);
    console.log('\n✅ Admin configurado com sucesso!');
    console.log('📧 Email:', email);
    console.log('🔑 Senha:', password);
    console.log('\n⚠️  Agora você pode fazer login no app!\n');
    
  } catch (error: any) {
    console.error('❌ Erro:', error.message);
    
    if (error.code === 'auth/wrong-password') {
      console.log('\n⚠️  Senha incorreta! Atualize a senha no script.\n');
    } else if (error.code === 'auth/user-not-found') {
      console.log('\n⚠️  Usuário não encontrado no Firebase Auth.');
      console.log('Execute: npx ts-node scripts/createAdminUser.ts\n');
    }
  }
}

fixAdminUser();
