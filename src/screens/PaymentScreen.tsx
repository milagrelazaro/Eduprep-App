import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Text, Card, IconButton, Button, RadioButton } from 'react-native-paper';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';

type PaymentRoute = RouteProp<{ Payment: { lesson?: any } }, 'Payment'>;

const PAYMENT_METHODS = [
  { id: 'mpesa', label: 'M-Pesa', icon: 'cellphone', desc: '**** 84 123 4567' },
  { id: 'emola', label: 'e-Mola', icon: 'cellphone-wireless', desc: '**** 86 987 6543' },
  { id: 'card', label: 'Cartão Visa', icon: 'credit-card', desc: '**** **** **** 4521' },
  { id: 'wallet', label: 'Carteira EduPrep', icon: 'wallet', desc: 'Saldo: 4.200 MT' },
];

export default function PaymentScreen() {
  const navigation = useNavigation();
  const route = useRoute<PaymentRoute>();
  const lesson = route.params?.lesson;
  const [method, setMethod] = useState('mpesa');
  const [step, setStep] = useState<'select' | 'confirm' | 'success'>('select');
  const [walletBalance, setWalletBalance] = useState(4200);
  const [payments, setPayments] = useState<any[]>([]);

  const price = lesson?.price || 550;
  const fee = 50;
  const total = price + fee;

  useEffect(() => {
    loadPayments();
  }, []);

  const loadPayments = async () => {
    const saved = await AsyncStorage.getItem('eduprep_payments');
    setPayments(saved ? JSON.parse(saved) : []);
    const bal = await AsyncStorage.getItem('eduprep_wallet');
    if (bal) setWalletBalance(parseInt(bal));
  };

  const handleConfirm = async () => {
    const payment = {
      id: Date.now().toString(),
      lessonId: lesson?.id || 'unknown',
      amount: total,
      method,
      status: 'escrow', // Pagamento em escrow até conclusão da aula
      date: new Date().toLocaleDateString(),
      description: lesson ? `Aula de ${lesson.subject} com ${lesson.tutorName}` : 'Pagamento EduPrep',
      escrowReleaseDate: null, // Será preenchido quando a aula terminar
    };
    const updated = [payment, ...payments];
    await AsyncStorage.setItem('eduprep_payments', JSON.stringify(updated));

    if (method === 'wallet') {
      const newBal = walletBalance - total;
      setWalletBalance(newBal);
      await AsyncStorage.setItem('eduprep_wallet', newBal.toString());
    }

    setStep('success');
  };

  if (step === 'success') {
    return (
      <View style={styles.successContainer}>
        <View style={styles.successIcon}>
          <IconButton icon="check-circle" iconColor="#10b981" size={56} />
        </View>
        <Text variant="headlineSmall" style={{ fontWeight: '800', color: '#111827', marginBottom: 8 }}>Pagamento Confirmado!</Text>
        <Text variant="bodyMedium" style={{ color: '#6b7280', textAlign: 'center', marginBottom: 8 }}>
          {total} MT via {PAYMENT_METHODS.find(m => m.id === method)?.label}
        </Text>
        <Text variant="bodySmall" style={{ color: '#9ca3af', textAlign: 'center', marginBottom: 32 }}>
          O valor ficará em escrow até a conclusão da aula.
        </Text>
        <Button mode="contained" onPress={() => navigation.goBack()} style={{ backgroundColor: '#111827', borderRadius: 16, width: '100%' }} labelStyle={{ fontWeight: '800', color: '#fff' }} contentStyle={{ paddingVertical: 8 }}>
          Voltar
        </Button>
      </View>
    );
  }

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 24 }}>
        <IconButton icon="arrow-left" onPress={() => navigation.goBack()} />
        <Text variant="headlineSmall" style={{ fontWeight: '800', color: '#111827' }}>Pagamento</Text>
      </View>

      {/* Order Summary */}
      <Card style={styles.summaryCard}>
        <Card.Content>
          <Text variant="titleMedium" style={styles.sectionTitle}>Resumo</Text>
          {lesson && (
            <View style={styles.lessonInfo}>
              <IconButton icon="book-open-variant" iconColor="#4f46e5" size={20} style={{ margin: 0 }} />
              <View style={{ flex: 1 }}>
                <Text style={{ fontWeight: '700', fontSize: 14, color: '#111827' }}>{lesson.subject}</Text>
                <Text style={{ fontSize: 12, color: '#9ca3af' }}>Com {lesson.tutorName} • {lesson.date}</Text>
              </View>
            </View>
          )}
          <View style={styles.priceRow}>
            <Text style={{ color: '#6b7280', fontSize: 14 }}>Preço da sessão</Text>
            <Text style={{ fontWeight: '700', color: '#111827' }}>{price} MT</Text>
          </View>
          <View style={styles.priceRow}>
            <Text style={{ color: '#6b7280', fontSize: 14 }}>Taxa EduPrep</Text>
            <Text style={{ fontWeight: '700', color: '#111827' }}>{fee} MT</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.priceRow}>
            <Text style={{ fontWeight: '800', color: '#111827', fontSize: 16 }}>Total</Text>
            <Text style={{ fontWeight: '800', color: '#4f46e5', fontSize: 20 }}>{total} MT</Text>
          </View>
        </Card.Content>
      </Card>

      {/* Payment Method */}
      <Card style={styles.methodCard}>
        <Card.Content>
          <Text variant="titleMedium" style={styles.sectionTitle}>Método de Pagamento</Text>
          {PAYMENT_METHODS.map((pm) => (
            <TouchableOpacity key={pm.id} onPress={() => setMethod(pm.id)} style={[styles.methodRow, method === pm.id && styles.methodRowActive]}>
              <View style={[styles.methodIcon, method === pm.id && { backgroundColor: '#eef2ff' }]}>
                <IconButton icon={pm.icon} iconColor={method === pm.id ? '#4f46e5' : '#9ca3af'} size={20} style={{ margin: 0 }} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ fontWeight: '700', fontSize: 14, color: '#111827' }}>{pm.label}</Text>
                <Text style={{ fontSize: 12, color: '#9ca3af' }}>{pm.desc}</Text>
              </View>
              <RadioButton value={pm.id} status={method === pm.id ? 'checked' : 'unchecked'} onPress={() => setMethod(pm.id)} color="#4f46e5" />
            </TouchableOpacity>
          ))}
        </Card.Content>
      </Card>

      {/* Escrow Info */}
      <Card style={styles.escrowCard}>
        <Card.Content style={{ flexDirection: 'row', gap: 12 }}>
          <IconButton icon="shield-check" iconColor="#10b981" size={24} style={{ margin: 0 }} />
          <View style={{ flex: 1 }}>
            <Text style={{ fontWeight: '700', fontSize: 13, color: '#111827', marginBottom: 2 }}>Pagamento Seguro (Escrow)</Text>
            <Text style={{ fontSize: 12, color: '#6b7280', lineHeight: 18 }}>
              O valor é retido até a conclusão da aula. Se a aula for cancelada, receberá reembolso total.
            </Text>
          </View>
        </Card.Content>
      </Card>

      {/* Confirm Button */}
      <Button
        mode="contained"
        onPress={step === 'select' ? () => setStep('confirm') : handleConfirm}
        style={styles.confirmBtn}
        labelStyle={{ fontWeight: '800', color: '#fff', fontSize: 16 }}
        contentStyle={{ paddingVertical: 10 }}
      >
        {step === 'select' ? `Pagar ${total} MT` : 'Confirmar Pagamento'}
      </Button>

      {/* Payment History */}
      {payments.length > 0 && (
        <Card style={[styles.methodCard, { marginTop: 24 }]}>
          <Card.Content>
            <Text variant="titleMedium" style={styles.sectionTitle}>Histórico de Pagamentos</Text>
            {payments.slice(0, 5).map((p: any) => (
              <View key={p.id} style={styles.historyRow}>
                <View style={[styles.historyIcon, { backgroundColor: p.status === 'completed' ? '#ecfdf5' : '#fef2f2' }]}>
                  <IconButton icon={p.status === 'completed' ? 'check' : 'clock-outline'} iconColor={p.status === 'completed' ? '#10b981' : '#f97316'} size={16} style={{ margin: 0 }} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontWeight: '700', fontSize: 13, color: '#111827' }}>{p.description}</Text>
                  <Text style={{ fontSize: 11, color: '#9ca3af' }}>{p.date}</Text>
                </View>
                <Text style={{ fontWeight: '800', color: '#111827' }}>-{p.amount} MT</Text>
              </View>
            ))}
          </Card.Content>
        </Card>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#f9fafb' },
  content: { padding: 16, paddingBottom: 32 },
  sectionTitle: { fontWeight: '800', color: '#111827', marginBottom: 16 },
  summaryCard: { backgroundColor: '#fff', borderRadius: 20, elevation: 0, borderWidth: 1, borderColor: '#f3f4f6', marginBottom: 16 },
  lessonInfo: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: '#f9fafb', borderRadius: 16, padding: 14, marginBottom: 16 },
  priceRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 6 },
  divider: { height: 1, backgroundColor: '#f3f4f6', marginVertical: 8 },
  methodCard: { backgroundColor: '#fff', borderRadius: 20, elevation: 0, borderWidth: 1, borderColor: '#f3f4f6', marginBottom: 16 },
  methodRow: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14, borderRadius: 16, marginBottom: 8, borderWidth: 1, borderColor: '#f3f4f6' },
  methodRowActive: { borderColor: '#4f46e5', backgroundColor: '#fafaff' },
  methodIcon: { width: 44, height: 44, borderRadius: 12, backgroundColor: '#f9fafb', alignItems: 'center', justifyContent: 'center' },
  escrowCard: { backgroundColor: '#ecfdf5', borderRadius: 20, elevation: 0, borderWidth: 1, borderColor: '#d1fae5', marginBottom: 24 },
  confirmBtn: { backgroundColor: '#4f46e5', borderRadius: 20, elevation: 4 },
  historyRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#f9fafb' },
  historyIcon: { width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  successContainer: { flex: 1, backgroundColor: '#fff', justifyContent: 'center', alignItems: 'center', padding: 32 },
  successIcon: { width: 96, height: 96, backgroundColor: '#ecfdf5', borderRadius: 28, alignItems: 'center', justifyContent: 'center', marginBottom: 24 },
});
