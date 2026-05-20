import { initializeApp } from 'firebase/app';
import { getAuth, createUserWithEmailAndPassword } from 'firebase/auth';
import { getFirestore, collection, addDoc, serverTimestamp } from 'firebase/firestore';

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

async function createAdminUser() {
  try {
    console.log('🔐 Criando usuário admin...');
    
    const email = 'admin@eduprep.co.mz';
    const password = 'admin123456'; // ALTERE ESTA SENHA!
    const name = 'Administrador';

    // Criar usuário no Firebase Auth
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const firebaseUser = userCredential.user;
    
    console.log('✅ Usuário criado no Firebase Auth:', firebaseUser.uid);

    // Criar documento no Firestore
    const userDoc = await addDoc(collection(db, 'users'), {
      name,
      email,
      role: 'admin',
      avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=1f2937&color=fff`,
      status: 'active',
      firebaseUid: firebaseUser.uid,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    console.log('✅ Documento criado no Firestore:', userDoc.id);
    console.log('\n📧 Email:', email);
    console.log('🔑 Senha:', password);
    console.log('\n⚠️  IMPORTANTE: Altere a senha após o primeiro login!\n');

    process.exit(0);
  } catch (error: any) {
    console.error('❌ Erro ao criar admin:', error.message);
    
    if (error.code === 'auth/email-already-in-use') {
      console.log('\n✅ Usuário admin já existe no Firebase Auth.');
      console.log('📧 Email: admin@eduprep.co.mz');
      console.log('🔑 Use a senha que você definiu anteriormente.\n');
    }
    
    process.exit(1);
  }
}

createAdminUser();
