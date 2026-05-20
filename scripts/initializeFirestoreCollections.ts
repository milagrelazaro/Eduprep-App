import { initializeApp } from 'firebase/app';
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
const db = getFirestore(app);

async function initializeCollections() {
  console.log('🔥 Inicializando coleções do Firestore...\n');

  try {
    // 1. Tutors collection
    console.log('📚 Criando coleção "tutors"...');
    await addDoc(collection(db, 'tutors'), {
      tutorId: 'sample-tutor-id',
      subjects: ['Matemática', 'Física'],
      pricePerHour: 450,
      bio: 'Tutor de exemplo para inicializar a coleção',
      availability: {
        'Segunda': ['08:00', '10:00'],
        'Terça': ['14:00', '16:00'],
      },
      status: 'active',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    console.log('✅ Coleção "tutors" criada\n');

    // 2. Lessons collection
    console.log('📅 Criando coleção "lessons"...');
    await addDoc(collection(db, 'lessons'), {
      studentId: 'sample-student-id',
      tutorId: 'sample-tutor-id',
      subject: 'Matemática',
      scheduledDate: serverTimestamp(),
      duration: 1,
      price: 450,
      status: 'pending',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    console.log('✅ Coleção "lessons" criada\n');

    // 3. Notifications collection
    console.log('🔔 Criando coleção "notifications"...');
    await addDoc(collection(db, 'notifications'), {
      userId: 'sample-user-id',
      title: 'Bem-vindo ao EduPrep!',
      message: 'Esta é uma notificação de exemplo para inicializar a coleção.',
      type: 'system',
      read: false,
      createdAt: serverTimestamp(),
    });
    console.log('✅ Coleção "notifications" criada\n');

    // 4. Posts collection
    console.log('📝 Criando coleção "posts"...');
    await addDoc(collection(db, 'posts'), {
      userId: 'sample-user-id',
      userName: 'Sistema',
      userAvatar: 'https://ui-avatars.com/api/?name=Sistema&background=4f46e5&color=fff',
      content: 'Post de exemplo para inicializar a coleção.',
      likes: 0,
      comments: 0,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    console.log('✅ Coleção "posts" criada\n');

    // 5. Messages collection
    console.log('💬 Criando coleção "messages"...');
    await addDoc(collection(db, 'messages'), {
      senderId: 'sample-user-1',
      receiverId: 'sample-user-2',
      message: 'Mensagem de exemplo para inicializar a coleção.',
      read: false,
      createdAt: serverTimestamp(),
    });
    console.log('✅ Coleção "messages" criada\n');

    // 6. Payments collection (para futuro)
    console.log('💰 Criando coleção "payments"...');
    await addDoc(collection(db, 'payments'), {
      userId: 'sample-user-id',
      lessonId: 'sample-lesson-id',
      amount: 450,
      method: 'M-Pesa',
      status: 'pending',
      createdAt: serverTimestamp(),
    });
    console.log('✅ Coleção "payments" criada\n');

    console.log('═══════════════════════════════════════════');
    console.log('✅ TODAS AS COLEÇÕES FORAM CRIADAS COM SUCESSO!');
    console.log('═══════════════════════════════════════════\n');
    
    console.log('📊 Coleções criadas:');
    console.log('  ✅ users (já existia)');
    console.log('  ✅ exams (já existia)');
    console.log('  ✅ examResults (já existia)');
    console.log('  ✅ tutors');
    console.log('  ✅ lessons');
    console.log('  ✅ notifications');
    console.log('  ✅ posts');
    console.log('  ✅ messages');
    console.log('  ✅ payments\n');

    console.log('⚠️  IMPORTANTE:');
    console.log('Os documentos de exemplo podem ser deletados manualmente');
    console.log('no Firebase Console se desejar.\n');

    console.log('🔗 Firebase Console:');
    console.log('https://console.firebase.google.com/project/fitness-app-realtime/firestore\n');

  } catch (error: any) {
    console.error('❌ Erro ao criar coleções:', error.message);
    process.exit(1);
  }
}

initializeCollections();
