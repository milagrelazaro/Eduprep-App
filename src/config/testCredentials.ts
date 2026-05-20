// Credenciais de teste para video aulas EduPrep
// 1000 aulas gratuitas para demonstração e teste

export const TEST_CREDENTIALS = {
  // Credenciais para teste de video chamadas
  videoCall: {
    appId: 'eduprep-test-video-2024',
    apiKey: 'test-api-key-eduprep-video-demo',
    // 1000 aulas gratuitas para teste
    freeLessonsLimit: 1000,
    currentUsage: 0,
    expiresAt: '2025-12-31T23:59:59Z',
  },
  
  // Credenciais para teste de streaming
  streaming: {
    enabled: true,
    maxResolution: '1080p',
    maxDuration: 120, // minutos
    supportsRecording: true,
  },
  
  // Configurações de teste
  testMode: {
    enabled: true,
    bypassPayment: true, // Em modo teste, não requer pagamento real
    mockDelay: false, // Simular delay de rede
    debugLogs: true,
  },
};

// Lista de credenciais pré-configuradas para demonstração
export const DEMO_ACCOUNTS = [
  {
    role: 'student',
    email: 'estudante@teste.eduprep',
    password: 'teste123',
    name: 'Estudante Demo',
    course: 'Medicina',
    subjects: ['Matemática', 'Física', 'Química'],
  },
  {
    role: 'tutor',
    email: 'professor@teste.eduprep',
    password: 'teste123',
    name: 'Professor Demo',
    subject: 'Matemática',
    price: 500,
  },
  {
    role: 'admin',
    email: 'admin@eduprep.com',
    password: 'admin123',
    name: 'Administrador',
  },
];

// Configuração de video aulas para teste
export const VIDEO_LESSON_CONFIG = {
  maxParticipants: 2, // Estudante + Professor
  features: {
    screenShare: true,
    whiteboard: true,
    chat: true,
    recording: true,
    raiseHand: true,
  },
  quality: {
    video: '720p',
    audio: 'high',
  },
  limits: {
    maxDuration: 120, // minutos por aula
    dailyLimit: 8, // aulas por dia
    weeklyLimit: 40, // aulas por semana
  },
};
