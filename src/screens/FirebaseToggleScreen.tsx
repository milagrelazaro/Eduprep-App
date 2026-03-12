import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Text, Card, Button, Switch, List, Divider, IconButton } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useHybridStore } from '../store/hybridStore';

export default function FirebaseToggleScreen() {
  const navigation = useNavigation();
  const { user, firebaseEnabled, toggleFirebase } = useHybridStore();

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
            <Text variant="headlineSmall" style={styles.title}>Configurações Firebase</Text>
            <View style={styles.placeholder} />
          </View>
          <Text variant="bodyMedium" style={styles.subtitle}>
            Gerencie a sincronização com a nuvem
          </Text>
        </View>

        <Card style={styles.card}>
          <Card.Content>
            <List.Item
              title="Sincronização Firebase"
              description={firebaseEnabled ? "Ativada - Dados sincronizados" : "Desativada - Apenas local"}
              left={(props) => <List.Icon {...props} icon="cloud-sync" />}
              right={() => (
                <Switch
                  value={firebaseEnabled}
                  onValueChange={toggleFirebase}
                />
              )}
            />
          </Card.Content>
        </Card>

        <Card style={styles.card}>
          <Card.Content>
            <Text variant="titleMedium" style={styles.sectionTitle}>📊 Status do Sistema</Text>
            
            <View style={styles.statusItem}>
              <Text style={styles.statusLabel}>Usuário atual:</Text>
              <Text style={styles.statusValue}>{user?.name || 'Não logado'}</Text>
            </View>
            
            <View style={styles.statusItem}>
              <Text style={styles.statusLabel}>Modo de armazenamento:</Text>
              <Text style={styles.statusValue}>
                {firebaseEnabled ? 'Híbrido (Local + Firebase)' : 'Local (AsyncStorage)'}
              </Text>
            </View>
            
            <View style={styles.statusItem}>
              <Text style={styles.statusLabel}>Banco de dados:</Text>
              <Text style={styles.statusValue}>
                {firebaseEnabled ? 'Firestore + Local' : 'Apenas Local'}
              </Text>
            </View>
          </Card.Content>
        </Card>

        <Card style={styles.card}>
          <Card.Content>
            <Text variant="titleMedium" style={styles.sectionTitle}>🔥 Como Funciona</Text>
            
            <Text style={styles.description}>
              <Text style={{ fontWeight: 'bold' }}>Modo Local (Atual):</Text> Todos os dados ficam no dispositivo. Funciona offline, mas não compartilha entre dispositivos.
            </Text>
            
            <Text style={styles.description}>
              <Text style={{ fontWeight: 'bold' }}>Modo Híbrido:</Text> Usa localStorage para velocidade e Firebase para sincronização. Dados compartilhados entre todos os usuários.
            </Text>
            
            <Text style={styles.description}>
              <Text style={{ fontWeight: 'bold' }}>Vantagens Firebase:</Text>
            </Text>
            
            <Text style={styles.bullet}>• Dados compartilhados globalmente</Text>
            <Text style={styles.bullet}>• Backup automático na nuvem</Text>
            <Text style={styles.bullet}>• Sincronização em tempo real</Text>
            <Text style={styles.bullet}>• Multi-dispositivo</Text>
            <Text style={styles.bullet}>• Persistência de dados</Text>
          </Card.Content>
        </Card>

        <Card style={styles.card}>
          <Card.Content>
            <Text variant="titleMedium" style={styles.sectionTitle}>⚙️ Configurações Firebase</Text>
            
            <Text style={styles.description}>
              <Text style={{ fontWeight: 'bold' }}>Projeto:</Text> fitness-app-realtime
            </Text>
            
            <Text style={styles.description}>
              <Text style={{ fontWeight: 'bold' }}>Status:</Text> {firebaseEnabled ? '✅ Conectado' : '❌ Desconectado'}
            </Text>
            
            <Text style={styles.description}>
              <Text style={{ fontWeight: 'bold' }}>Coleções:</Text> users, exams, posts, lessons, results
            </Text>
            
            {firebaseEnabled && (
              <Button
                mode="outlined"
                onPress={() => console.log('Testar conexão Firebase')}
                style={styles.testButton}
              >
                Testar Conexão
              </Button>
            )}
          </Card.Content>
        </Card>
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
    marginBottom: 4,
    flex: 1,
    textAlign: 'center',
  },
  subtitle: {
    color: '#6b7280',
    textAlign: 'center',
  },
  card: {
    marginBottom: 16,
    borderRadius: 12,
  },
  sectionTitle: {
    fontWeight: '600',
    color: '#111827',
    marginBottom: 12,
  },
  statusItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  statusLabel: {
    fontSize: 14,
    color: '#6b7280',
    flex: 1,
  },
  statusValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
    flex: 2,
    textAlign: 'right',
  },
  description: {
    fontSize: 14,
    color: '#374151',
    lineHeight: 20,
    marginBottom: 12,
  },
  bullet: {
    fontSize: 14,
    color: '#374151',
    marginLeft: 16,
    marginBottom: 4,
  },
  testButton: {
    marginTop: 12,
    borderRadius: 12,
  },
});
