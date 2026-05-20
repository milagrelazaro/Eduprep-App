import AsyncStorage from '@react-native-async-storage/async-storage';
import { MOCK_TUTORS, MOCK_EXAMS, MOCK_LESSONS } from '../data/mockData';
import { TEST_CREDENTIALS, DEMO_ACCOUNTS, VIDEO_LESSON_CONFIG } from '../config/testCredentials';
import { examCatalogService } from '../services/examCatalogService';

export const initializeAppData = async () => {
  try {
    // Initialize tutors if not exists
    const savedTutors = await AsyncStorage.getItem('eduprep_all_tutors');
    if (!savedTutors) {
      await AsyncStorage.setItem('eduprep_all_tutors', JSON.stringify(MOCK_TUTORS));
      console.log('✅ Tutors initialized');
    }

    // Initialize exams if not exists
    const savedExams = await AsyncStorage.getItem('eduprep_exams');
    if (!savedExams) {
      await AsyncStorage.setItem('eduprep_exams', JSON.stringify(MOCK_EXAMS));
      console.log('✅ Exams initialized');
    }

    // Seed catalog from local data only (no Firebase calls before login)
    await examCatalogService.seedCatalogIfNeeded();

    // Initialize lessons if not exists
    const savedLessons = await AsyncStorage.getItem('eduprep_lessons');
    if (!savedLessons) {
      await AsyncStorage.setItem('eduprep_lessons', JSON.stringify(MOCK_LESSONS));
      console.log('✅ Lessons initialized');
    }

    // Initialize test credentials for video lessons
    const savedTestCreds = await AsyncStorage.getItem('eduprep_test_credentials');
    if (!savedTestCreds) {
      await AsyncStorage.setItem('eduprep_test_credentials', JSON.stringify(TEST_CREDENTIALS));
      console.log('✅ Test credentials initialized');
    }

    // Initialize video lesson config
    const savedVideoConfig = await AsyncStorage.getItem('eduprep_video_config');
    if (!savedVideoConfig) {
      await AsyncStorage.setItem('eduprep_video_config', JSON.stringify(VIDEO_LESSON_CONFIG));
      console.log('✅ Video lesson config initialized');
    }

    // Initialize demo accounts
    const savedDemoAccounts = await AsyncStorage.getItem('eduprep_demo_accounts');
    if (!savedDemoAccounts) {
      await AsyncStorage.setItem('eduprep_demo_accounts', JSON.stringify(DEMO_ACCOUNTS));
      console.log('✅ Demo accounts initialized');
    }

    const catalog = await examCatalogService.getCatalog();

    console.log('✅ App data initialized successfully');
    console.log('📚', catalog.length, 'exams catalogados');
    console.log('🎥 Video lessons:', TEST_CREDENTIALS.videoCall.freeLessonsLimit, 'free lessons available');
  } catch (error) {
    console.error('❌ Error initializing app data:', error);
  }
};

// Função para obter credenciais de teste
export const getTestCredentials = async () => {
  try {
    const creds = await AsyncStorage.getItem('eduprep_test_credentials');
    return creds ? JSON.parse(creds) : TEST_CREDENTIALS;
  } catch {
    return TEST_CREDENTIALS;
  }
};

// Função para verificar se ainda há aulas gratuitas disponíveis
export const hasFreeLessonsAvailable = async (): Promise<boolean> => {
  try {
    const creds = await getTestCredentials();
    return creds.videoCall.currentUsage < creds.videoCall.freeLessonsLimit;
  } catch {
    return false;
  }
};

// Função para incrementar uso de aulas
export const incrementLessonUsage = async (): Promise<void> => {
  try {
    const creds = await getTestCredentials();
    creds.videoCall.currentUsage += 1;
    await AsyncStorage.setItem('eduprep_test_credentials', JSON.stringify(creds));
  } catch (error) {
    console.error('Error incrementing lesson usage:', error);
  }
};
