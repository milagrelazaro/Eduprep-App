import AsyncStorage from '@react-native-async-storage/async-storage';
import { MOCK_TUTORS, MOCK_EXAMS, MOCK_LESSONS } from '../data/mockData';

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

    // Initialize lessons if not exists
    const savedLessons = await AsyncStorage.getItem('eduprep_lessons');
    if (!savedLessons) {
      await AsyncStorage.setItem('eduprep_lessons', JSON.stringify(MOCK_LESSONS));
      console.log('✅ Lessons initialized');
    }

    console.log('✅ App data initialized successfully');
  } catch (error) {
    console.error('❌ Error initializing app data:', error);
  }
};
