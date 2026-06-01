import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useAuthStore } from '../store/authStore';
import { UserRole } from '../types';
import { Text, View } from 'react-native';

import OnboardingScreen from '../screens/OnboardingScreen';
import LoginScreen from '../screens/LoginScreen';
import DashboardScreen from '../screens/DashboardScreen';
import ProfileScreen from '../screens/ProfileScreen';
import AdminPanelScreen from '../screens/AdminPanelScreen';
import EnhancedSimulatorScreen from '../screens/EnhancedSimulatorScreen';
import AdminExamsScreen from '../screens/AdminExamsScreen';
import AcademicSetupScreen from '../screens/AcademicSetupScreen';
import ExamHistoryScreen from '../screens/ExamHistoryScreen';

export type RootStackParamList = {
  Login: undefined;
  Onboarding: undefined;
  Main: undefined;
  MainTabs: undefined;
  EnhancedSimulator: undefined;
  AdminExams: undefined;
  AcademicSetup: undefined;
  ExamHistory: undefined;
};

export type MainTabParamList = {
  Dashboard: undefined;
  Simulator: undefined;
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
          <Stack.Screen name="AcademicSetup" component={AcademicSetupScreen} />
          <Stack.Screen name="ExamHistory" component={ExamHistoryScreen} />
        </>
      )}
    </Stack.Navigator>
  );
}
