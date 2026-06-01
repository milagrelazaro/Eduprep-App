import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { Text, TextInput, Button, Chip } from 'react-native-paper';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useNavigation } from '@react-navigation/native';
import { RootStackParamList } from '../navigation/AppNavigator';
import { useAuthStore } from '../store/authStore';
import { UserRole } from '../types';

type Nav = NativeStackNavigationProp<RootStackParamList, 'Login'>;

export default function LoginScreen() {
  const navigation = useNavigation<Nav>();
  const { login, register } = useAuthStore();

  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState('');
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>([]);

  const COURSES = ['Medicina', 'Engenharia Civil', 'Direito', 'Economia', 'Informática', 'Arquitectura', 'Gestão', 'Contabilidade'];
  const SUBJECTS = ['Matemática', 'Física', 'Química', 'Biologia', 'Português', 'Inglês', 'História', 'Geografia'];

  const toggleSubject = (subject: string) => {
    setSelectedSubjects(prev => 
      prev.includes(subject) ? prev.filter(s => s !== subject) : [...prev, subject]
    );
  };

  const handleAuth = async () => {
    if (!email || !password) {
      Alert.alert('Erro', 'Por favor, preencha email e senha.');
      return;
    }

    if (!isLogin && !name) {
      Alert.alert('Erro', 'Por favor, preencha seu nome.');
      return;
    }

    setLoading(true);
    try {
      if (isLogin) {
        // Modo LOGIN - apenas autentica
        await login(email, password);
      } else {
        // Modo REGISTRO - cria novo usuário (sempre como STUDENT)
        await register(email, password, name, UserRole.STUDENT, selectedCourse, selectedSubjects);
      }
    } catch (e: any) {
      console.error(isLogin ? 'Login error:' : 'Register error:', e);
      
      let errorMessage = isLogin ? 'Erro ao fazer login.' : 'Erro ao criar conta.';
      
      if (e?.code === 'auth/invalid-email') {
        errorMessage = 'Email inválido.';
      } else if (e?.code === 'auth/user-not-found') {
        errorMessage = 'Usuário não encontrado. Crie uma conta primeiro.';
      } else if (e?.code === 'auth/wrong-password') {
        errorMessage = 'Senha incorreta.';
      } else if (e?.code === 'auth/email-already-in-use') {
        errorMessage = 'Este email já está em uso. Faça login.';
      } else if (e?.code === 'auth/weak-password') {
        errorMessage = 'A senha deve ter pelo menos 6 caracteres.';
      } else if (e?.code === 'auth/network-request-failed') {
        errorMessage = 'Erro de conexão. Verifique sua internet.';
      } else if (e?.message) {
        errorMessage = e.message;
      }
      
      Alert.alert('Erro', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.header}>
          <View style={styles.iconBox}>
            <Text style={{ fontSize: 32 }}>🛡️</Text>
          </View>
          <Text variant="headlineMedium" style={styles.title}>
            {isLogin ? 'Bem-vindo de volta' : 'Crie a sua conta'}
          </Text>
          <Text variant="labelMedium" style={styles.subtitle}>
            {isLogin ? 'Faça login para continuar' : 'Cadastre-se como estudante'}
          </Text>
        </View>

        <View style={styles.formCard}>
          {!isLogin && (
            <>
              <TextInput
                label="Nome Completo"
                value={name}
                onChangeText={setName}
                mode="outlined"
                style={styles.input}
                outlineStyle={styles.inputOutline}
                placeholder="Seu nome"
              />

              <Text style={styles.sectionLabel}>Curso que pretende fazer</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 16 }}>
                <View style={{ flexDirection: 'row', gap: 8 }}>
                  {COURSES.map(course => (
                    <Chip
                      key={course}
                      selected={selectedCourse === course}
                      onPress={() => setSelectedCourse(course)}
                      style={[styles.chip, selectedCourse === course && styles.chipSelected]}
                      textStyle={{ fontSize: 12, fontWeight: '700', color: selectedCourse === course ? '#fff' : '#374151' }}
                    >
                      {course}
                    </Chip>
                  ))}
                </View>
              </ScrollView>

              <Text style={styles.sectionLabel}>Disciplinas que irá concorrer</Text>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 16 }}>
                {SUBJECTS.map(subject => (
                  <Chip
                    key={subject}
                    selected={selectedSubjects.includes(subject)}
                    onPress={() => toggleSubject(subject)}
                    style={[styles.chip, selectedSubjects.includes(subject) && styles.chipSelected]}
                    textStyle={{ fontSize: 12, fontWeight: '700', color: selectedSubjects.includes(subject) ? '#fff' : '#374151' }}
                  >
                    {subject}
                  </Chip>
                ))}
              </View>
            </>
          )}

          <TextInput
            label="Email"
            value={email}
            onChangeText={setEmail}
            mode="outlined"
            style={styles.input}
            outlineStyle={styles.inputOutline}
            placeholder="exemplo@gmail.com"
            keyboardType="email-address"
            autoCapitalize="none"
          />

          <TextInput
            label="Palavra-passe"
            value={password}
            onChangeText={setPassword}
            mode="outlined"
            style={styles.input}
            outlineStyle={styles.inputOutline}
            placeholder="••••••••"
            secureTextEntry
          />

          <Button
            mode="contained"
            onPress={handleAuth}
            loading={loading}
            style={styles.submitBtn}
            labelStyle={styles.submitLabel}
            contentStyle={{ paddingVertical: 8 }}
          >
            {isLogin ? 'Entrar no Sistema' : 'Finalizar Cadastro'}
          </Button>

          <View style={styles.footerRow}>
            <Button
              mode="text"
              compact
              onPress={() => setIsLogin(!isLogin)}
              labelStyle={{ color: '#4f46e5', fontWeight: '700', fontSize: 12 }}
            >
              {isLogin ? 'Criar nova conta' : 'Já tenho conta'}
            </Button>
            <Button
              mode="text"
              compact
              labelStyle={{ color: '#9ca3af', fontSize: 12 }}
            >
              Esqueceu a senha?
            </Button>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: '#f9fafb',
    justifyContent: 'center',
    padding: 24,
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  iconBox: {
    width: 56,
    height: 56,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    backgroundColor: '#4f46e5',
  },
  title: {
    fontWeight: '800',
    color: '#111827',
    textAlign: 'center',
  },
  subtitle: {
    color: '#6b7280',
    marginTop: 8,
    fontWeight: '500',
  },
  formCard: {
    backgroundColor: '#fff',
    borderRadius: 24,
    padding: 24,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
  },
  input: {
    marginBottom: 16,
    backgroundColor: '#f9fafb',
  },
  inputOutline: {
    borderRadius: 16,
    borderColor: '#f3f4f6',
  },
  submitBtn: {
    borderRadius: 16,
    marginTop: 8,
    elevation: 4,
    backgroundColor: '#4f46e5',
  },
  submitLabel: {
    color: '#fff',
    fontWeight: '800',
    fontSize: 14,
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 16,
  },
  sectionLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: '#374151',
    marginBottom: 8,
  },
  chip: {
    backgroundColor: '#f3f4f6',
    borderRadius: 12,
  },
  chipSelected: {
    backgroundColor: '#4f46e5',
  },
});
