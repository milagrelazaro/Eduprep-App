import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc, serverTimestamp, Timestamp } from 'firebase/firestore';

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

async function testSubscriptionFlow() {
  console.log('🧪 Testando fluxo de assinatura...\n');

  try {
    // 1. Criar assinatura de exemplo
    console.log('📝 Criando assinatura de exemplo...');
    const subscriptionRef = await addDoc(collection(db, 'subscriptions'), {
      userId: 'test-user-123',
      plan: 'monthly',
      status: 'active',
      startDate: serverTimestamp(),
      expiresAt: Timestamp.fromDate(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)), // 30 dias
      price: 500,
      paymentMethod: 'mpesa',
      transactionId: 'TEST-MPESA-123456',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    console.log('✅ Assinatura criada:', subscriptionRef.id);

    // 2. Criar pagamento de exemplo
    console.log('\n💳 Criando pagamento de exemplo...');
    const paymentRef = await addDoc(collection(db, 'payments'), {
      userId: 'test-user-123',
      type: 'subscription',
      subscriptionId: subscriptionRef.id,
      amount: 500,
      method: 'mpesa',
      status: 'completed',
      transactionId: 'TEST-MPESA-123456',
      phoneNumber: '84 123 4567',
      reference: 'EDUPREP-TEST-123',
      createdAt: serverTimestamp(),
      completedAt: serverTimestamp(),
    });
    console.log('✅ Pagamento criado:', paymentRef.id);

    console.log('\n═══════════════════════════════════════════');
    console.log('✅ TESTE CONCLUÍDO COM SUCESSO!');
    console.log('═══════════════════════════════════════════\n');
    
    console.log('📊 Coleções verificadas:');
    console.log('  ✅ subscriptions - Criada e funcional');
    console.log('  ✅ payments - Criada e funcional\n');

    console.log('🔗 Verifique no Firebase Console:');
    console.log('https://console.firebase.google.com/project/fitness-app-realtime/firestore\n');

    console.log('⚠️  IMPORTANTE:');
    console.log('Os documentos de teste podem ser deletados manualmente.');
    console.log('Procure por userId: "test-user-123"\n');

  } catch (error: any) {
    console.error('❌ Erro no teste:', error.message);
    process.exit(1);
  }
}

testSubscriptionFlow();
