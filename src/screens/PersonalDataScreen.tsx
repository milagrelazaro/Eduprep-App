import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import { Text, TextInput, Button, Card, Avatar, IconButton } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useAuthStore } from '../store/authStore';

export default function PersonalDataScreen() {
  const navigation = useNavigation();
  const { user, updateUser } = useAuthStore();
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSave = async () => {
    if (!name.trim() || !email.trim()) {
      Alert.alert('Erro', 'Nome e email são obrigatórios.');
      return;
    }

    setIsSubmitting(true);
    try {
      await updateUser({ name, email, phone });
      Alert.alert('✅ Sucesso', 'Dados atualizados com sucesso!');
      navigation.goBack();
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível atualizar os dados.');
      setIsSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <View style={styles.headerTop}>
            <IconButton 
              icon="arrow-left" 
              onPress={() => navigation.goBack()} 
              style={styles.backButton}
            />
            <Text variant="headlineSmall" style={styles.title}>Dados Pessoais</Text>
            <View style={styles.placeholder} />
          </View>
        </View>

        <Card style={styles.card}>
          <Card.Content style={styles.avatarSection}>
            <Avatar.Image
              size={80}
              source={{ uri: user?.avatar || 'https://ui-avatars.com/api/?name=User' }}
            />
            <Button mode="text" onPress={() => Alert.alert('Em breve', 'Funcionalidade de alterar foto em desenvolvimento.')}>
              Alterar Foto
            </Button>
          </Card.Content>
        </Card>

        <Card style={styles.card}>
          <Card.Content>
            <Text variant="titleMedium" style={styles.sectionTitle}>Informações Básicas</Text>
            
            <TextInput
              mode="outlined"
              label="Nome Completo"
              value={name}
              onChangeText={setName}
              style={styles.input}
            />

            <TextInput
              mode="outlined"
              label="Email"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              style={styles.input}
            />

            <TextInput
              mode="outlined"
              label="Telefone"
              value={phone}
              onChangeText={setPhone}
              keyboardType="phone-pad"
              placeholder="+258 84 123 4567"
              style={styles.input}
            />
          </Card.Content>
        </Card>

        <View style={styles.actions}>
          <Button
            mode="outlined"
            onPress={() => navigation.goBack()}
            disabled={isSubmitting}
            style={styles.cancelButton}
          >
            Cancelar
          </Button>
          <Button
            mode="contained"
            onPress={handleSave}
            loading={isSubmitting}
            disabled={isSubmitting}
            style={styles.saveButton}
          >
            Salvar Alterações
          </Button>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  content: {
    padding: 16,
  },
  header: {
    marginBottom: 20,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  backButton: {
    margin: 0,
  },
  placeholder: {
    width: 48, // Same width as back button for centering
  },
  title: {
    fontWeight: '700',
    color: '#111827',
    flex: 1,
    textAlign: 'center',
  },
  card: {
    marginBottom: 16,
    borderRadius: 12,
  },
  avatarSection: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  sectionTitle: {
    fontWeight: '600',
    color: '#111827',
    marginBottom: 16,
  },
  input: {
    backgroundColor: '#fff',
    marginBottom: 12,
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  cancelButton: {
    flex: 1,
    borderRadius: 12,
  },
  saveButton: {
    flex: 2,
    borderRadius: 12,
    backgroundColor: '#4f46e5',
  },
});
