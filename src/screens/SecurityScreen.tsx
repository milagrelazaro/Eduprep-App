import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Alert, Switch } from 'react-native';
import { Text, Card, TextInput, Button } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { colors, borderRadius, spacing, shadows } from '../theme/colors';

export default function SecurityScreen() {
  const navigation = useNavigation();
  const [biometricEnabled, setBiometricEnabled] = useState(false);
  const [pinEnabled, setPinEnabled] = useState(false);
  const [currentPin, setCurrentPin] = useState('');
  const [newPin, setNewPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [showPinSetup, setShowPinSetup] = useState(false);

  const handleSavePin = () => {
    if (newPin.length < 4) {
      Alert.alert('Erro', 'O PIN deve ter pelo menos 4 dígitos');
      return;
    }
    if (newPin !== confirmPin) {
      Alert.alert('Erro', 'Os PINs não coincidem');
      return;
    }
    setPinEnabled(true);
    setShowPinSetup(false);
    setNewPin('');
    setConfirmPin('');
    Alert.alert('Sucesso', 'PIN configurado com sucesso!');
  };

  const handleToggleBiometric = (value: boolean) => {
    if (value) {
      Alert.alert(
        'Ativar Biometria',
        'Deseja ativar o desbloqueio por impressão digital?',
        [
          { text: 'Cancelar', style: 'cancel' },
          { 
            text: 'Ativar', 
            onPress: () => setBiometricEnabled(true)
          }
        ]
      );
    } else {
      setBiometricEnabled(false);
    }
  };

  return (
    <ScrollView style={[styles.screen, { backgroundColor: colors.background }]} contentContainerStyle={styles.content}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>Segurança</Text>
          <Text style={[styles.headerSubtitle, { color: colors.textSecondary }]}>Proteja sua conta</Text>
        </View>
      </View>

      {/* Biometria */}
      <Card style={[styles.card, { backgroundColor: colors.white, borderRadius: borderRadius.xl, ...shadows.small }]}>
        <Card.Content style={styles.cardContent}>
          <View style={styles.settingRow}>
            <View style={styles.settingLeft}>
              <View style={[styles.settingIcon, { backgroundColor: colors.successLight }]}>
                <Text style={styles.settingEmoji}>👆</Text>
              </View>
              <View style={styles.settingInfo}>
                <Text style={[styles.settingTitle, { color: colors.textPrimary }]}>Biometria</Text>
                <Text style={[styles.settingDesc, { color: colors.textSecondary }]}>
                  Desbloqueio por impressão digital
                </Text>
              </View>
            </View>
            <Switch
              value={biometricEnabled}
              onValueChange={handleToggleBiometric}
              trackColor={{ false: colors.borderLight, true: colors.success }}
              thumbColor={biometricEnabled ? colors.white : colors.grayMedium}
            />
          </View>
        </Card.Content>
      </Card>

      {/* PIN */}
      <Card style={[styles.card, { backgroundColor: colors.white, borderRadius: borderRadius.xl, ...shadows.small }]}>
        <Card.Content style={styles.cardContent}>
          <View style={styles.settingRow}><View style={styles.settingLeft}><View style={[styles.settingIcon, { backgroundColor: colors.warningLight }]}><Text style={styles.settingEmoji}>🔐</Text></View><View style={styles.settingInfo}><Text style={[styles.settingTitle, { color: colors.textPrimary }]}>PIN de Segurança</Text><Text style={[styles.settingDesc, { color: colors.textSecondary }]}>{pinEnabled ? 'PIN ativado' : 'Configurar código PIN'}</Text></View></View><TouchableOpacity onPress={() => setShowPinSetup(!showPinSetup)} style={[styles.actionButton, { backgroundColor: colors.secondary }]}><Text style={[styles.actionButtonText, { color: colors.info }]}>{pinEnabled ? 'Alterar' : 'Configurar'}</Text></TouchableOpacity></View>

          {showPinSetup && (
            <View style={styles.pinSetup}>
              <TextInput
                label="Novo PIN"
                value={newPin}
                onChangeText={setNewPin}
                mode="outlined"
                secureTextEntry
                keyboardType="numeric"
                maxLength={6}
                style={styles.input}
              />
              <TextInput
                label="Confirmar PIN"
                value={confirmPin}
                onChangeText={setConfirmPin}
                mode="outlined"
                secureTextEntry
                keyboardType="numeric"
                maxLength={6}
                style={styles.input}
              />
              <Button
                mode="contained"
                onPress={handleSavePin}
                style={[styles.saveButton, { backgroundColor: colors.primary }]}
              >
                Salvar PIN
              </Button>
            </View>
          )}
        </Card.Content>
      </Card>

      {/* Sessões Ativas */}
      <Card style={[styles.card, { backgroundColor: colors.white, borderRadius: borderRadius.xl, ...shadows.small }]}>
        <Card.Content style={styles.cardContent}>
          <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Sessões Ativas</Text>
          <Text style={[styles.sectionDesc, { color: colors.textSecondary }]}>
            Gerencie os dispositivos conectados à sua conta
          </Text>

          <View style={styles.sessionItem}>
            <View style={styles.sessionLeft}>
              <View style={[styles.sessionIcon, { backgroundColor: colors.secondary }]}>
                <Text style={styles.sessionEmoji}>📱</Text>
              </View>
              <View>
                <Text style={[styles.sessionDevice, { color: colors.textPrimary }]}>Este dispositivo</Text>
                <Text style={[styles.sessionTime, { color: colors.textSecondary }]}>Ativo agora</Text>
              </View>
            </View>
            <View style={[styles.activeBadge, { backgroundColor: colors.successLight }]}>
              <Text style={[styles.activeBadgeText, { color: colors.success }]}>Ativo</Text>
            </View>
          </View>

          <Button
            mode="outlined"
            onPress={() => Alert.alert('Terminar Sessões', 'Deseja terminar todas as outras sessões?')}
            style={[styles.terminateButton, { borderColor: colors.error }]}
            textColor={colors.error}
          >
            Terminar Outras Sessões
          </Button>
        </Card.Content>
      </Card>

      {/* Alterar Senha */}
      <Card style={[styles.card, { backgroundColor: colors.white, borderRadius: borderRadius.xl, ...shadows.small }]}>
        <Card.Content style={styles.cardContent}>
          <TouchableOpacity 
            style={styles.settingRow}
            onPress={() => Alert.alert('Alterar Senha', 'Será enviado um email para redefinir a senha')}
          >
            <View style={styles.settingLeft}>
              <View style={[styles.settingIcon, { backgroundColor: colors.errorLight }]}>
                <Text style={styles.settingEmoji}>🔑</Text>
              </View>
              <View style={styles.settingInfo}>
                <Text style={[styles.settingTitle, { color: colors.textPrimary }]}>Alterar Senha</Text>
                <Text style={[styles.settingDesc, { color: colors.textSecondary }]}>
                  Redefinir senha de acesso
                </Text>
              </View>
            </View>
            <Text style={[styles.arrow, { color: colors.textTertiary }]}>›</Text>
          </TouchableOpacity>
        </Card.Content>
      </Card>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  content: { padding: spacing.lg, paddingBottom: 32 },
  
  // Header
  header: { flexDirection: 'row', alignItems: 'center', marginBottom: spacing.xl },
  backButton: { marginRight: spacing.md },
  backIcon: { fontSize: 28, color: colors.textPrimary },
  headerContent: { flex: 1 },
  headerTitle: { fontSize: 24, fontWeight: '800', marginBottom: 2 },
  headerSubtitle: { fontSize: 13, fontWeight: '400' },
  
  // Card
  card: { marginBottom: spacing.md, borderWidth: 1, borderColor: colors.borderLight },
  cardContent: { padding: spacing.md },
  
  // Setting Row
  settingRow: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'space-between',
  },
  settingLeft: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  settingIcon: { 
    width: 40, 
    height: 40, 
    borderRadius: borderRadius.md, 
    alignItems: 'center', 
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  settingEmoji: { fontSize: 20 },
  settingInfo: { flex: 1 },
  settingTitle: { fontSize: 14, fontWeight: '600', marginBottom: 2 },
  settingDesc: { fontSize: 12, fontWeight: '400' },
  
  // Action Button
  actionButton: { 
    paddingHorizontal: spacing.md, 
    paddingVertical: spacing.sm, 
    borderRadius: borderRadius.md,
  },
  actionButtonText: { fontSize: 14, fontWeight: '600' },
  
  // PIN Setup
  pinSetup: { marginTop: spacing.lg, paddingTop: spacing.lg, borderTopWidth: 1, borderTopColor: colors.borderLight },
  input: { marginBottom: spacing.md },
  saveButton: { borderRadius: borderRadius.md },
  
  // Section
  sectionTitle: { fontSize: 18, fontWeight: '700', marginBottom: spacing.sm },
  sectionDesc: { fontSize: 13, marginBottom: spacing.lg },
  
  // Session Item
  sessionItem: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'space-between',
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
    marginBottom: spacing.md,
  },
  sessionLeft: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  sessionIcon: { 
    width: 40, 
    height: 40, 
    borderRadius: borderRadius.md, 
    alignItems: 'center', 
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  sessionEmoji: { fontSize: 20 },
  sessionDevice: { fontSize: 14, fontWeight: '600', marginBottom: 2 },
  sessionTime: { fontSize: 12 },
  activeBadge: { paddingHorizontal: spacing.sm, paddingVertical: 4, borderRadius: borderRadius.sm },
  activeBadgeText: { fontSize: 11, fontWeight: '600' },
  
  // Terminate Button
  terminateButton: { marginTop: spacing.sm, borderRadius: borderRadius.md },
  
  // Arrow
  arrow: { fontSize: 24, fontWeight: '300' },
});
