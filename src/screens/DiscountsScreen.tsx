import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Alert, TouchableOpacity } from 'react-native';
import { Text, Card, Button, TextInput } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { useAuthStore } from '../store/authStore';
import { referralService } from '../services/referralService';
import { DeviceFingerprint } from '../types';
import { Dimensions } from 'react-native';
import { colors, spacing, borderRadius, shadows } from '../theme/colors';

export default function DiscountsScreen() {
  const navigation = useNavigation();
  const { user, updateUser } = useAuthStore();
  const [referralCode, setReferralCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [validationResult, setValidationResult] = useState<{
    isValid: boolean;
    message: string;
  } | null>(null);

  const getDeviceFingerprint = (): DeviceFingerprint => {
    const { width, height } = Dimensions.get('window');
    return {
      imei: 'mock-imei-' + Math.random().toString(36).substring(7), // Em produção, usar IMEI real
      platform: 'android', // Detectar dinamicamente
      osVersion: '12', // Detectar dinamicamente
      appVersion: '1.0.0',
      screenWidth: width,
      screenHeight: height,
      language: 'pt',
      timezone: 'Africa/Maputo',
      createdAt: new Date(),
    };
  };

  const handleValidateCode = async () => {
    if (!referralCode.trim()) {
      Alert.alert('Erro', 'Por favor, insere um código de referral');
      return;
    }

    if (!user?.email || !user?.name) {
      Alert.alert('Erro', 'Dados do usuário incompletos');
      return;
    }

    setLoading(true);
    setValidationResult(null);

    try {
      const deviceFingerprint = getDeviceFingerprint();
      
      const validation = await referralService.validateReferralCode(
        referralCode.trim().toUpperCase(),
        user.id,
        user.email,
        '',
        deviceFingerprint
      );

      setValidationResult({
        isValid: validation.isValid,
        message: validation.reason || (validation.isValid ? 'Código válido!' : 'Código inválido'),
      });
    } catch (error) {
      setValidationResult({
        isValid: false,
        message: 'Erro ao validar código. Tenta novamente.',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleActivateCode = async () => {
    if (!referralCode.trim()) {
      Alert.alert('Erro', 'Por favor, insere um código de referral');
      return;
    }

    if (!user?.email || !user?.name) {
      Alert.alert('Erro', 'Dados do usuário incompletos');
      return;
    }

    setLoading(true);

    try {
      const deviceFingerprint = getDeviceFingerprint();
      
      await referralService.activateReferralCode(
        referralCode.trim().toUpperCase(),
        user.id,
        user.name,
        user.email,
        '',
        deviceFingerprint
      );

      // Update user with referral code
      await updateUser({
        referredBy: referralCode.trim().toUpperCase(),
      });

      Alert.alert(
        'Sucesso!',
        'Código ativado com sucesso! Recebeste um desconto no teu plano.',
        [{ text: 'OK' }]
      );

      setReferralCode('');
      setValidationResult(null);
    } catch (error: any) {
      Alert.alert('Erro', error.message || 'Não foi possível ativar o código');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      {/* Header estilo Yango */}
      <View style={styles.header}><TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}><Text style={styles.backIcon}>←</Text></TouchableOpacity><View style={styles.headerContent}><Text style={[styles.headerTitle, { color: colors.textPrimary }]}>🎁 Descontos e Bônus
          </Text>
          <Text style={[styles.headerSubtitle, { color: colors.textSecondary }]}>
            Usa códigos de referral para obter descontos
          </Text>
        </View>
      </View>

      {/* Referral Code Input */}
      <Card style={[styles.inputCard, { backgroundColor: colors.white, borderRadius: borderRadius.xl, ...shadows.small }]}>
        <Card.Content style={styles.cardContent}>
          <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
            Código Referral
          </Text>
          <Text style={[styles.sectionSubtitle, { color: colors.textSecondary }]}>
            Insere o código do teu promotor para obter desconto
          </Text>
          <TextInput
            label="Código de Referral"
            value={referralCode}
            onChangeText={setReferralCode}
            mode="outlined"
            style={styles.input}
            autoCapitalize="characters"
            placeholder="Ex: ANA-2025"
          />

          {validationResult && (
            <View style={[
              styles.validationBox,
              { backgroundColor: validationResult.isValid ? colors.successLight : colors.errorLight }
            ]}>
              <Text style={[
                styles.validationText,
                { color: validationResult.isValid ? colors.success : colors.error }
              ]}>
                {validationResult.isValid ? '✅' : '⚠️'} {validationResult.message}
              </Text>
            </View>
          )}

          <View style={styles.buttonRow}>
            <Button
              mode="outlined"
              onPress={handleValidateCode}
              disabled={loading}
              style={[styles.validateButton, { borderColor: colors.primary }]}
              textColor={colors.primary}
            >
              Validar
            </Button>
            <Button
              mode="contained"
              onPress={handleActivateCode}
              disabled={loading || !validationResult?.isValid}
              style={[styles.activateButton, { backgroundColor: colors.primary, borderRadius: borderRadius.md }]}
              loading={loading}
            >
              Ativar
            </Button>
          </View>
        </Card.Content>
      </Card>

      {/* Info Cards */}
      <Card style={[styles.infoCard, { backgroundColor: colors.white, borderRadius: borderRadius.xl, ...shadows.small }]}>
        <Card.Content style={styles.cardContent}>
          <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
            ℹ️ Como Funciona
          </Text>
          <View style={styles.infoItem}>
            <Text style={[styles.infoNumber, { backgroundColor: colors.secondary, color: colors.primary }]}>1</Text>
            <Text style={[styles.infoText, { color: colors.textPrimary }]}>
              Obtém um código de referral de um promotor
            </Text>
          </View>
          <View style={styles.infoItem}>
            <Text style={[styles.infoNumber, { backgroundColor: colors.secondary, color: colors.primary }]}>2</Text>
            <Text style={[styles.infoText, { color: colors.textPrimary }]}>
              Insere o código acima e valida
            </Text>
          </View>
          <View style={styles.infoItem}>
            <Text style={[styles.infoNumber, { backgroundColor: colors.secondary, color: colors.primary }]}>3</Text>
            <Text style={[styles.infoText, { color: colors.textPrimary }]}>
              Ativa o código e recebe desconto no plano
            </Text>
          </View>
        </Card.Content>
      </Card>

      {/* Anti-Fraud Notice */}
      <Card style={[styles.noticeCard, { backgroundColor: colors.warningLight, borderRadius: borderRadius.lg, borderWidth: 1, borderColor: colors.borderLight }]}>
        <Card.Content style={styles.cardContent}>
          <Text style={[styles.noticeTitle, { color: colors.warning }]}>
            🛡️ Proteção Anti-Fraude
          </Text>
          <Text style={[styles.noticeText, { color: colors.textPrimary }]}>
            Por segurança, cada código só pode ser ativado uma vez por dispositivo, email ou número de telefone.
          </Text>
        </Card.Content>
      </Card>

      {/* Current Referral Status */}
      {user?.referredBy && (
        <Card style={[styles.statusCard, { backgroundColor: colors.successLight, borderRadius: borderRadius.lg, borderWidth: 1, borderColor: colors.borderLight }]}>
          <Card.Content style={styles.cardContent}>
            <Text style={[styles.sectionTitle, { color: colors.success }]}>
              ✅ Código Ativado
            </Text>
            <View style={styles.statusRow}>
              <Text style={[styles.statusLabel, { color: colors.success }]}>Código usado:</Text>
              <Text style={[styles.statusValue, { color: colors.success }]}>{user.referredBy}</Text>
            </View>
            <Text style={[styles.statusNote, { color: colors.success }]}>
              Estás a beneficiar de desconto no teu plano!
            </Text>
          </Card.Content>
        </Card>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.md, paddingBottom: spacing.lg },
  header: { flexDirection: 'row', alignItems: 'center', marginBottom: spacing.xl },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.md,
    backgroundColor: colors.grayLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  backIcon: { fontSize: 24, color: colors.textPrimary },
  headerContent: { flex: 1 },
  headerTitle: { fontWeight: '800', fontSize: 18, marginBottom: 2 },
  headerSubtitle: { fontSize: 12, fontWeight: '400' },
  headerCard: { marginBottom: spacing.lg },
  cardContent: { padding: spacing.md },
  inputCard: { marginBottom: spacing.lg },
  sectionTitle: { fontWeight: '700', fontSize: 14, marginBottom: spacing.sm },
  sectionSubtitle: { fontSize: 12, marginBottom: spacing.md },
  input: { marginBottom: spacing.md },
  validationBox: { padding: spacing.md, borderRadius: borderRadius.md, marginBottom: spacing.md },
  validationText: { fontSize: 14, fontWeight: '600' },
  buttonRow: { flexDirection: 'row', gap: spacing.md },
  validateButton: { flex: 1 },
  activateButton: { flex: 1 },
  infoCard: { marginBottom: spacing.lg },
  infoItem: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, paddingVertical: spacing.sm },
  infoNumber: {
    width: 28,
    height: 28,
    borderRadius: 14,
    fontWeight: '700',
    textAlign: 'center',
    lineHeight: 28,
  },
  infoText: { flex: 1, fontSize: 14 },
  noticeCard: { marginBottom: spacing.lg },
  noticeTitle: { fontWeight: '700', fontSize: 14, marginBottom: spacing.sm },
  noticeText: { fontSize: 13 },
  statusCard: {},
  statusRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: spacing.sm },
  statusLabel: { fontSize: 14 },
  statusValue: { fontWeight: '700' },
  statusNote: { fontSize: 12, marginTop: spacing.sm },
});
