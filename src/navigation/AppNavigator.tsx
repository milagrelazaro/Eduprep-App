import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useAuthStore } from '../store/authStore';
import { UserRole } from '../types';
import { Text, View, StyleSheet, TouchableOpacity } from 'react-native';
import { colors, shadows, borderRadius } from '../theme/colors';

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
  CreateExamManual: { examId?: string } | undefined;
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

function FloatingTabBar({ state, descriptors, navigation }: any) {
  return (
    <View style={styles.tabBarContainer} pointerEvents="box-none">
      <View style={styles.floatingBar}>
        {state.routes.map((route: any, index: number) => {
          const { options } = descriptors[route.key];
          const label = options.tabBarLabel ?? route.name;
          const isFocused = state.index === index;
          const icon = options.tabBarIcon?.({ color: isFocused ? colors.black : colors.grayMedium, focused: isFocused }) ?? null;
          const onPress = () => {
            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });
            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name, route.params);
            }
          };
          return (
            <TouchableOpacity
              key={route.key}
              onPress={onPress}
              style={styles.tabItem}
              activeOpacity={0.7}
            >
              <View style={[styles.tabIconWrap, isFocused && styles.tabIconActive]}>
                {icon}
              </View>
              <Text style={[styles.tabLabel, { color: isFocused ? colors.black : colors.grayMedium }]}>
                {label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

function MainTabs() {
  const { user } = useAuthStore();

  return (
    <Tab.Navigator
      tabBar={(props) => <FloatingTabBar {...props} />}
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.black,
        tabBarInactiveTintColor: colors.grayMedium,
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
  
  // Verificar se o usuário precisa completar o onboarding (apenas estudantes)
  const needsOnboarding = user && user.role === UserRole.STUDENT && (!user.intendedCourse || !user.competingDisciplines || user.competingDisciplines.length === 0);

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

const styles = StyleSheet.create({
  tabBarContainer: {
    position: 'absolute',
    bottom: 20,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  floatingBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    width: '88%',
    maxWidth: 440,
    height: 68,
    backgroundColor: colors.white,
    borderRadius: 34,
    borderWidth: 1,
    borderColor: colors.borderLight,
    paddingHorizontal: 6,
    ...shadows.large,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
  },
  tabIconWrap: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.round,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabIconActive: {
    backgroundColor: colors.primaryLight,
  },
  tabLabel: {
    fontSize: 10,
    fontWeight: '600',
  },
});
