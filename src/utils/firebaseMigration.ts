import AsyncStorage from '@react-native-async-storage/async-storage';
import { userService, examService, postService, examResultService } from '../services/firebaseService';
import { MOCK_TUTORS, MOCK_EXAMS, MOCK_LESSONS } from '../data/mockData';

export const migrateFromAsyncStorage = async () => {
  console.log('🔄 Starting migration from AsyncStorage to Firestore...');
  
  try {
    // 1. Migrate users
    const savedUsers = await AsyncStorage.getItem('eduprep_users');
    if (savedUsers) {
      const users = JSON.parse(savedUsers);
      console.log(`📤 Migrating ${users.length} users...`);
      
      for (const user of users) {
        try {
          await userService.createUser(user);
        } catch (error) {
          console.log(`⚠️ User ${user.email} might already exist, skipping...`);
        }
      }
    }

    // 2. Migrate mock tutors as users with tutor role
    console.log('📤 Migrating mock tutors...');
    for (const tutor of MOCK_TUTORS) {
      try {
        await userService.createUser({
          name: tutor.name,
          email: tutor.email,
          role: 'tutor',
          avatar: tutor.avatar,
          status: 'active',
          bio: tutor.bio,
          subjects: [tutor.subject],
          level: tutor.level,
          verified: tutor.verified,
          rating: parseFloat(tutor.rating),
          pricePerHour: tutor.price,
          availability: [],
          examExpert: tutor.examExpert,
        });
      } catch (error) {
        console.log(`⚠️ Tutor ${tutor.email} might already exist, skipping...`);
      }
    }

    // 3. Migrate exams
    const savedExams = await AsyncStorage.getItem('eduprep_exams');
    if (savedExams) {
      const exams = JSON.parse(savedExams);
      console.log(`📤 Migrating ${exams.length} exams...`);
      
      for (const exam of exams) {
        try {
          await examService.createExam(exam);
        } catch (error) {
          console.log(`⚠️ Exam ${exam.id} might already exist, skipping...`);
        }
      }
    } else {
      // Migrate mock exams if no saved exams
      console.log('📤 Migrating mock exams...');
      for (const exam of MOCK_EXAMS) {
        try {
          await examService.createExam(exam);
        } catch (error) {
          console.log(`⚠️ Mock exam might already exist, skipping...`);
        }
      }
    }

    // 4. Migrate lessons
    const savedLessons = await AsyncStorage.getItem('eduprep_lessons');
    if (savedLessons) {
      const lessons = JSON.parse(savedLessons);
      console.log(`📤 Migrating ${lessons.length} lessons...`);
      
      for (const lesson of lessons) {
        try {
          await addDoc(collection(db, LESSONS_COLLECTION), lesson);
        } catch (error) {
          console.log(`⚠️ Lesson ${lesson.id} might already exist, skipping...`);
        }
      }
    } else {
      // Migrate mock lessons
      console.log('📤 Migrating mock lessons...');
      for (const lesson of MOCK_LESSONS) {
        try {
          await addDoc(collection(db, LESSONS_COLLECTION), lesson);
        } catch (error) {
          console.log(`⚠️ Mock lesson might already exist, skipping...`);
        }
      }
    }

    // 5. Migrate posts
    const savedPosts = await AsyncStorage.getItem('eduprep_posts');
    if (savedPosts) {
      const posts = JSON.parse(savedPosts);
      console.log(`📤 Migrating ${posts.length} posts...`);
      
      for (const post of posts) {
        try {
          await postService.createPost(post);
        } catch (error) {
          console.log(`⚠️ Post ${post.id} might already exist, skipping...`);
        }
      }
    }

    // 6. Migrate exam results
    const savedResults = await AsyncStorage.getItem('eduprep_exam_results');
    if (savedResults) {
      const results = JSON.parse(savedResults);
      console.log(`📤 Migrating ${results.length} exam results...`);
      
      for (const result of results) {
        try {
          await examResultService.saveExamResult(result);
        } catch (error) {
          console.log(`⚠️ Result ${result.id} might already exist, skipping...`);
        }
      }
    }

    console.log('✅ Migration completed successfully!');
    
    // Optional: Clear AsyncStorage after successful migration
    const shouldClear = await AsyncStorage.getItem('firebase_migration_completed');
    if (!shouldClear) {
      console.log('🧹 Clearing AsyncStorage...');
      const keys = [
        'eduprep_users',
        'eduprep_all_tutors',
        'eduprep_exams',
        'eduprep_lessons',
        'eduprep_posts',
        'eduprep_exam_results',
        'eduprep_user',
      ];
      
      for (const key of keys) {
        await AsyncStorage.removeItem(key);
      }
      
      await AsyncStorage.setItem('firebase_migration_completed', 'true');
    }
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
    throw error;
  }
};

export const checkMigrationStatus = async (): Promise<boolean> => {
  try {
    const migrated = await AsyncStorage.getItem('firebase_migration_completed');
    return migrated === 'true';
  } catch (error) {
    return false;
  }
};

export const forceMigration = async () => {
  await AsyncStorage.removeItem('firebase_migration_completed');
  await migrateFromAsyncStorage();
};
