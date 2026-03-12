import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useAuthStore } from '../store/authStore';
import { UserRole } from '../types';
import { IconButton } from 'react-native-paper';

import OnboardingScreen from '../screens/OnboardingScreen';
import LoginScreen from '../screens/LoginScreen';
import DashboardScreen from '../screens/DashboardScreen';
import MarketplaceScreen from '../screens/MarketplaceScreen';
import ExamCenterScreen from '../screens/ExamCenterScreen';
import MessagesScreen from '../screens/MessagesScreen';
import ProfileScreen from '../screens/ProfileScreen';
import AdminPanelScreen from '../screens/AdminPanelScreen';
import LessonRoomScreen from '../screens/LessonRoomScreen';
import TutorProfileScreen from '../screens/TutorProfileScreen';
import RankingScreen from '../screens/RankingScreen';
import PaymentScreen from '../screens/PaymentScreen';
import TutorAvailabilityScreen from '../screens/TutorAvailabilityScreen';
import AdminExamsScreen from '../screens/AdminExamsScreen';
import AdminFinanceScreen from '../screens/AdminFinanceScreen';
import AdminReportsScreen from '../screens/AdminReportsScreen';
import NotificationsScreen from '../screens/NotificationsScreen';
import PerformanceScreen from '../screens/PerformanceScreen';
import ImprovedSimulatorScreen from '../screens/ImprovedSimulatorScreen';
import UploadExamScreen from '../screens/UploadExamScreen';
import FeedScreen from '../screens/FeedScreen';
import CreatePostScreen from '../screens/CreatePostScreen';
import CommentsScreen from '../screens/CommentsScreen';
import EditPostScreen from '../screens/EditPostScreen';
import AcademicSetupScreen from '../screens/AcademicSetupScreen';
import LessonReviewScreen from '../screens/LessonReviewScreen';
import ImprovedPerformanceScreen from '../screens/ImprovedPerformanceScreen';
import EnhancedSimulatorScreen from '../screens/EnhancedSimulatorScreen';
import CreateExamScreen from '../screens/CreateExamScreen';
import PersonalDataScreen from '../screens/PersonalDataScreen';
import FirebaseToggleScreen from '../screens/FirebaseToggleScreen';

export type RootStackParamList = {
  Onboarding: undefined;
  Login: { role?: UserRole };
  Main: undefined;
  LessonRoom: { id: string };
  TutorProfile: { tutor: any };
  Ranking: undefined;
  Payment: { lesson?: any };
  TutorAvailability: undefined;
  AdminExams: undefined;
  AdminFinance: undefined;
  AdminReports: undefined;
  Notifications: undefined;
  Performance: undefined;
  ImprovedSimulator: undefined;
  UploadExam: undefined;
  CreatePost: undefined;
  EditPost: { post: any };
  Comments: { post: any };
  AcademicSetup: undefined;
  LessonReview: { lesson: any };
  ImprovedPerformance: undefined;
  EnhancedSimulator: undefined;
  CreateExam: undefined;
  PersonalData: undefined;
  FirebaseToggle: undefined;
};

export type MainTabParamList = {
  Dashboard: undefined;
  Feed: undefined;
  Marketplace: undefined;
  ExamCenter: undefined;
  Messages: undefined;
  Profile: undefined;
  Admin: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<MainTabParamList>();

function MainTabs() {
  const { user } = useAuthStore();

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#4f46e5',
        tabBarInactiveTintColor: '#9ca3af',
        tabBarStyle: {
          borderTopWidth: 1,
          borderTopColor: '#e5e7eb',
          paddingBottom: 8,
          paddingTop: 8,
          height: 65,
        },
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: '600',
        },
      }}
    >
      <Tab.Screen
        name="Dashboard"
        component={DashboardScreen}
        options={{
          tabBarLabel: 'Início',
          tabBarIcon: ({ color, size }: { color: string; size: number }) => (
            <IconButton icon="home" iconColor={color} size={size} />
          ),
        }}
      />
      <Tab.Screen
        name="Feed"
        component={FeedScreen}
        options={{
          tabBarLabel: 'Feed',
          tabBarIcon: ({ color, size }: { color: string; size: number }) => (
            <IconButton icon="newspaper-variant" iconColor={color} size={size} />
          ),
        }}
      />
      <Tab.Screen
        name="Marketplace"
        component={MarketplaceScreen}
        options={{
          tabBarLabel: 'Explicações',
          tabBarIcon: ({ color, size }: { color: string; size: number }) => (
            <IconButton icon="book-open-variant" iconColor={color} size={size} />
          ),
        }}
      />
      <Tab.Screen
        name="ExamCenter"
        component={ExamCenterScreen}
        options={{
          tabBarLabel: 'Exames',
          tabBarIcon: ({ color, size }: { color: string; size: number }) => (
            <IconButton icon="school" iconColor={color} size={size} />
          ),
        }}
      />
      <Tab.Screen
        name="Messages"
        component={MessagesScreen}
        options={{
          tabBarLabel: 'Mensagens',
          tabBarIcon: ({ color, size }: { color: string; size: number }) => (
            <IconButton icon="message-text" iconColor={color} size={size} />
          ),
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          tabBarLabel: 'Perfil',
          tabBarIcon: ({ color, size }: { color: string; size: number }) => (
            <IconButton icon="account" iconColor={color} size={size} />
          ),
        }}
      />
      {user?.role === UserRole.ADMIN && (
        <Tab.Screen
          name="Admin"
          component={AdminPanelScreen}
          options={{
            tabBarLabel: 'Admin',
            tabBarIcon: ({ color, size }: { color: string; size: number }) => (
              <IconButton icon="shield-account" iconColor={color} size={size} />
            ),
          }}
        />
      )}
    </Tab.Navigator>
  );
}

export default function AppNavigator() {
  const { user } = useAuthStore();

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {!user ? (
        <>
          <Stack.Screen name="Onboarding" component={OnboardingScreen} />
          <Stack.Screen name="Login" component={LoginScreen} />
        </>
      ) : (
        <>
          <Stack.Screen name="Main" component={MainTabs} />
          <Stack.Screen name="LessonRoom" component={LessonRoomScreen} options={{ presentation: 'fullScreenModal' }} />
          <Stack.Screen name="TutorProfile" component={TutorProfileScreen} />
          <Stack.Screen name="Ranking" component={RankingScreen} />
          <Stack.Screen name="Payment" component={PaymentScreen} />
          <Stack.Screen name="TutorAvailability" component={TutorAvailabilityScreen} />
          <Stack.Screen name="AdminExams" component={AdminExamsScreen} />
          <Stack.Screen name="AdminFinance" component={AdminFinanceScreen} />
          <Stack.Screen name="AdminReports" component={AdminReportsScreen} />
          <Stack.Screen name="Notifications" component={NotificationsScreen} />
          <Stack.Screen name="Performance" component={PerformanceScreen} />
          <Stack.Screen name="ImprovedSimulator" component={ImprovedSimulatorScreen} />
          <Stack.Screen name="UploadExam" component={UploadExamScreen} />
          <Stack.Screen name="CreatePost" component={CreatePostScreen} options={{ presentation: 'modal' }} />
          <Stack.Screen name="EditPost" component={EditPostScreen} options={{ presentation: 'modal' }} />
          <Stack.Screen name="Comments" component={CommentsScreen} />
          <Stack.Screen name="AcademicSetup" component={AcademicSetupScreen} options={{ headerShown: false }} />
          <Stack.Screen name="LessonReview" component={LessonReviewScreen} />
          <Stack.Screen name="ImprovedPerformance" component={ImprovedPerformanceScreen} />
          <Stack.Screen name="EnhancedSimulator" component={EnhancedSimulatorScreen} options={{ headerShown: false }} />
          <Stack.Screen name="CreateExam" component={CreateExamScreen} />
          <Stack.Screen name="PersonalData" component={PersonalDataScreen} />
          <Stack.Screen name="FirebaseToggle" component={FirebaseToggleScreen} />
        </>
      )}
    </Stack.Navigator>
  );
}
