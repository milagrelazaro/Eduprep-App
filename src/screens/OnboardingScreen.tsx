import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Text, Button, Card, IconButton } from 'react-native-paper';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useNavigation } from '@react-navigation/native';
import { RootStackParamList } from '../navigation/AppNavigator';
import { UserRole } from '../types';

type Nav = NativeStackNavigationProp<RootStackParamList, 'Onboarding'>;

export default function OnboardingScreen() {
  const navigation = useNavigation<Nav>();

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.logoContainer}>
        <View style={styles.logoBox}>
          <IconButton icon="school" iconColor="#fff" size={40} />
        </View>
      </View>

      <Text variant="headlineLarge" style={styles.title}>EduPrep SaaS</Text>
      <Text variant="bodyLarge" style={styles.subtitle}>
        Aprenda, prepare-se e passe nos exames de admissão com os melhores tutores.
      </Text>

      <View style={styles.optionsContainer}>
        <Card
          style={styles.optionCard}
          onPress={() => navigation.navigate('Login', { role: UserRole.STUDENT })}
        >
          <Card.Content style={styles.optionContent}>
            <View style={[styles.iconBox, { backgroundColor: '#eef2ff' }]}>
              <IconButton icon="book-open-variant" iconColor="#4f46e5" size={24} />
            </View>
            <View style={styles.optionText}>
              <Text variant="titleMedium" style={styles.optionTitle}>Sou Estudante</Text>
              <Text variant="bodySmall" style={styles.optionDesc}>Quero aprender e passar nos exames.</Text>
            </View>
          </Card.Content>
        </Card>

        <Card
          style={styles.optionCard}
          onPress={() => navigation.navigate('Login', { role: UserRole.TUTOR })}
        >
          <Card.Content style={styles.optionContent}>
            <View style={[styles.iconBox, { backgroundColor: '#ecfdf5' }]}>
              <IconButton icon="account-group" iconColor="#10b981" size={24} />
            </View>
            <View style={styles.optionText}>
              <Text variant="titleMedium" style={styles.optionTitle}>Sou Tutor</Text>
              <Text variant="bodySmall" style={styles.optionDesc}>Quero dar explicações e ajudar alunos.</Text>
            </View>
          </Card.Content>
        </Card>

        <Card
          style={[styles.optionCard, { backgroundColor: '#f9fafb', marginTop: 16 }]}
          onPress={() => navigation.navigate('Login', { role: UserRole.ADMIN })}
        >
          <Card.Content style={styles.optionContent}>
            <View style={[styles.iconBox, { backgroundColor: '#e5e7eb' }]}>
              <IconButton icon="shield-alert" iconColor="#6b7280" size={20} />
            </View>
            <View style={styles.optionText}>
              <Text variant="titleSmall" style={{ fontWeight: '700', color: '#374151' }}>Administração</Text>
              <Text variant="labelSmall" style={{ color: '#9ca3af', letterSpacing: 2 }}>ACESSO RESTRITO</Text>
            </View>
          </Card.Content>
        </Card>
      </View>

      <View style={styles.footer}>
        <Text variant="bodySmall" style={{ color: '#9ca3af' }}>Já tem uma conta? </Text>
        <Button
          mode="text"
          compact
          onPress={() => navigation.navigate('Login', {})}
          labelStyle={{ color: '#4f46e5', fontWeight: '700' }}
        >
          Fazer Login
        </Button>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  logoContainer: {
    marginBottom: 24,
  },
  logoBox: {
    width: 64,
    height: 64,
    backgroundColor: '#4f46e5',
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontWeight: '800',
    color: '#111827',
    marginBottom: 8,
  },
  subtitle: {
    color: '#6b7280',
    textAlign: 'center',
    maxWidth: 320,
    marginBottom: 40,
  },
  optionsContainer: {
    width: '100%',
    maxWidth: 400,
    gap: 12,
  },
  optionCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#f3f4f6',
    elevation: 0,
  },
  optionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    paddingVertical: 8,
  },
  iconBox: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  optionText: {
    flex: 1,
  },
  optionTitle: {
    fontWeight: '700',
    color: '#111827',
  },
  optionDesc: {
    color: '#6b7280',
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 40,
  },
});
