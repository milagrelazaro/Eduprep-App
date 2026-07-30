import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useAuthStore } from '../store/authStore';
import { UserRole } from '../types';
import { Text, View } from 'react-native';
import { colors } from '../theme/colors';

import OnboardingScreen from '../screens/OnboardingScreen';
import LoginScreen from '../screens/LoginScreen';
import DashboardScreen from '../screens/DashboardScreen';
import ProfileScreen from '../screens/ProfileScreen';
import AdminPanelScreen from '../screens/AdminPanelScreen';
import PromoterPanelScreen from '../screens/PromoterPanelScreen';
import DiscountsScreen from '../screens/DiscountsScreen';
import SubscriptionScreen from '../screens/SubscriptionScreen';
import EnhancedSimulatorScreen from '../screens/EnhancedSimulatorScreen';
import AdminExamsScreen from '../screens/AdminExamsScreen';
import AcademicSetupScreen from '../screens/AcademicSetupScreen';
import ExamHistoryScreen from '../screens/ExamHistoryScreen';
import ExamReviewScreen from '../screens/ExamReviewScreen';
import ExamManagementScreen from '../screens/ExamManagementScreen';
import CreateExamManualScreen from '../screens/CreateExamManualScreen';
import SecurityScreen from '../screens/SecurityScreen';
import FavoriteUniversitiesScreen from '../screens/FavoriteUniversitiesScreen';
import ReportIssueScreen from '../screens/ReportIssueScreen';
import SupportScreen from '../screens/SupportScreen';
import RankingScreen from '../screens/RankingScreen';
import NotificationsScreen from '../screens/NotificationsScreen';

export type RootStackParamList = {
  Login: undefined;
  Onboarding: undefined;
  Main: undefined;
  MainTabs: undefined;
  EnhancedSimulator: undefined;
  AdminExams: undefined;
  ExamManagement: undefined;
  CreateExamManual: undefined;
  AcademicSetup: undefined;
  ExamHistory: undefined;
  ExamReview: { resultId: string };
  Discounts: undefined;
  Subscription: undefined;
  Security: undefined;
  FavoriteUniversities: undefined;
  ReportIssue: undefined;
  Support: undefined;
  Ranking: undefined;
  Notifications: undefined;
};

export type MainTabParamList = {
  Dashboard: undefined;
  Simulator: undefined;
  Profile: undefined;
  Admin: undefined;
  Promoter: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<MainTabParamList>();

function MainTabs() {
  const { user } = useAuthStore();

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.grayMedium,
        tabBarStyle: {
          borderTopWidth: 1,
          borderTopColor: colors.borderLight,
          backgroundColor: colors.white,
          paddingBottom: 8,
          paddingTop: 8,
          height: 65,
          elevation: 0,
          shadowOpacity: 0,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
        },
      }}
    >
      <Tab.Screen
        name="Dashboard"
        component={DashboardScreen}
        options={{
          tabBarLabel: 'Início',
          tabBarIcon: ({ color }: { color: string }) => (
            <Text style={{ fontSize: 24 }}>🏠</Text>
          ),
        }}
      />
      <Tab.Screen
        name="Simulator"
        component={EnhancedSimulatorScreen}
        options={{
          tabBarLabel: 'Simulador',
          tabBarIcon: ({ color }: { color: string }) => (
            <Text style={{ fontSize: 24 }}>🎓</Text>
          ),
        }}
      />
      {user?.role === UserRole.STUDENT && (
        <Tab.Screen
          name="Profile"
          component={ProfileScreen}
          options={{
            tabBarLabel: 'Perfil',
            tabBarIcon: ({ color }: { color: string }) => (
              <Text style={{ fontSize: 24 }}>👤</Text>
            ),
          }}
        />
      )}
      {user?.role === UserRole.ADMIN && (
        <Tab.Screen
          name="Admin"
          component={AdminPanelScreen}
          options={{
            tabBarLabel: 'Admin',
            tabBarIcon: ({ color }: { color: string }) => (
              <Text style={{ fontSize: 24 }}>🛡️</Text>
            ),
          }}
        />
      )}
      {user?.role === UserRole.PROMOTER && (
        <Tab.Screen
          name="Promoter"
          component={PromoterPanelScreen}
          options={{
            tabBarLabel: 'Promotor',
            tabBarIcon: ({ color }: { color: string }) => (
              <Text style={{ fontSize: 24 }}>📣</Text>
            ),
          }}
        />
      )}
    </Tab.Navigator>
  );
}

export default function AppNavigator() {
  const { user } = useAuthStore();
  
  // Verificar se o usuário precisa completar o onboarding
  const needsOnboarding = user && (!user.intendedCourse || !user.competingDisciplines || user.competingDisciplines.length === 0);

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {!user ? (
        <>
          <Stack.Screen name="Login" component={LoginScreen} />
        </>
      ) : needsOnboarding ? (
        <>
          <Stack.Screen name="Onboarding" component={OnboardingScreen} />
        </>
      ) : (
        <>
          <Stack.Screen name="Main" component={MainTabs} />
          <Stack.Screen name="EnhancedSimulator" component={EnhancedSimulatorScreen} options={{ headerShown: false }} />
          <Stack.Screen name="AdminExams" component={AdminExamsScreen} />
          <Stack.Screen name="ExamManagement" component={ExamManagementScreen} />
          <Stack.Screen name="CreateExamManual" component={CreateExamManualScreen} />
          <Stack.Screen name="AcademicSetup" component={AcademicSetupScreen} />
          <Stack.Screen name="ExamHistory" component={ExamHistoryScreen} />
          <Stack.Screen name="ExamReview" component={ExamReviewScreen} />
          <Stack.Screen name="Discounts" component={DiscountsScreen} />
          <Stack.Screen name="Subscription" component={SubscriptionScreen} />
          <Stack.Screen name="Security" component={SecurityScreen} />
          <Stack.Screen name="FavoriteUniversities" component={FavoriteUniversitiesScreen} />
          <Stack.Screen name="ReportIssue" component={ReportIssueScreen} />
          <Stack.Screen name="Support" component={SupportScreen} />
          <Stack.Screen name="Ranking" component={RankingScreen} />
          <Stack.Screen name="Notifications" component={NotificationsScreen} />
        </>
      )}
    </Stack.Navigator>
  );
}
