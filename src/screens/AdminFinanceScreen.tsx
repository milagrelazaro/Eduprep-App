import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Text, Card, IconButton, Button, Chip } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';

const MOCK_PAYMENTS = [
  { id: '1', tutor: 'Pedro Sambo', student: 'João Sitoe', amount: 550, fee: 50, status: 'completed', date: '18/02/2026' },
  { id: '2', tutor: 'Mário Langa', student: 'Ana Machava', amount: 700, fee: 70, status: 'escrow', date: '17/02/2026' },
  { id: '3', tutor: 'Ana Vilanculos', student: 'Carlos Tembe', amount: 450, fee: 45, status: 'completed', date: '16/02/2026' },
  { id: '4', tutor: 'Pedro Sambo', student: 'Fátima Nhaca', amount: 550, fee: 50, status: 'refunded', date: '15/02/2026' },
  { id: '5', tutor: 'Mário Langa', student: 'Maria Cossa', amount: 700, fee: 70, status: 'completed', date: '14/02/2026' },
];

const MOCK_WITHDRAWALS = [
  { id: '1', tutor: 'Pedro Sambo', amount: 2500, method: 'M-Pesa', status: 'pending', date: '18/02/2026' },
  { id: '2', tutor: 'Mário Langa', amount: 3800, method: 'e-Mola', status: 'completed', date: '15/02/2026' },
  { id: '3', tutor: 'Ana Vilanculos', amount: 1200, method: 'M-Pesa', status: 'completed', date: '12/02/2026' },
];

export default function AdminFinanceScreen() {
  const navigation = useNavigation();
  const [tab, setTab] = useState<'payments' | 'withdrawals' | 'commissions'>('payments');
  const [withdrawals, setWithdrawals] = useState(MOCK_WITHDRAWALS);

  const totalRevenue = MOCK_PAYMENTS.filter(p => p.status === 'completed').reduce((a, p) => a + p.amount, 0);
  const totalFees = MOCK_PAYMENTS.filter(p => p.status === 'completed').reduce((a, p) => a + p.fee, 0);
  const escrowTotal = MOCK_PAYMENTS.filter(p => p.status === 'escrow').reduce((a, p) => a + p.amount, 0);
  const pendingWithdrawals = withdrawals.filter(w => w.status === 'pending').reduce((a, w) => a + w.amount, 0);

  const approveWithdrawal = (id: string) => {
    setWithdrawals(withdrawals.map(w => w.id === id ? { ...w, status: 'completed' } : w));
  };

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <IconButton 
            icon="arrow-left" 
            onPress={() => navigation.goBack()} 
            style={styles.backButton}
          />
          <View style={styles.headerContent}>
            <Text variant="headlineSmall" style={{ fontWeight: '800', color: '#111827' }}>Gestão Financeira</Text>
            <Text variant="bodyMedium" style={{ color: '#6b7280' }}>Comissões, pagamentos e levantamentos.</Text>
          </View>
        </View>
      </View>

      {/* Stats */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 20 }}>
        <View style={{ flexDirection: 'row', gap: 12, paddingRight: 16 }}>
          <Card style={[styles.statCard, { backgroundColor: '#4f46e5' }]}>
            <Card.Content>
              <Text style={{ fontSize: 11, color: 'rgba(255,255,255,0.6)', fontWeight: '700', letterSpacing: 1 }}>RECEITA TOTAL</Text>
              <Text style={{ fontSize: 28, fontWeight: '800', color: '#fff', marginTop: 4 }}>{totalRevenue.toLocaleString()} MT</Text>
            </Card.Content>
          </Card>
          <Card style={[styles.statCard, { backgroundColor: '#10b981' }]}>
            <Card.Content>
              <Text style={{ fontSize: 11, color: 'rgba(255,255,255,0.6)', fontWeight: '700', letterSpacing: 1 }}>COMISSÕES</Text>
              <Text style={{ fontSize: 28, fontWeight: '800', color: '#fff', marginTop: 4 }}>{totalFees.toLocaleString()} MT</Text>
            </Card.Content>
          </Card>
          <Card style={[styles.statCard, { backgroundColor: '#f97316' }]}>
            <Card.Content>
              <Text style={{ fontSize: 11, color: 'rgba(255,255,255,0.6)', fontWeight: '700', letterSpacing: 1 }}>EM ESCROW</Text>
              <Text style={{ fontSize: 28, fontWeight: '800', color: '#fff', marginTop: 4 }}>{escrowTotal.toLocaleString()} MT</Text>
            </Card.Content>
          </Card>
          <Card style={[styles.statCard, { backgroundColor: '#ef4444' }]}>
            <Card.Content>
              <Text style={{ fontSize: 11, color: 'rgba(255,255,255,0.6)', fontWeight: '700', letterSpacing: 1 }}>LEVANT. PENDENTES</Text>
              <Text style={{ fontSize: 28, fontWeight: '800', color: '#fff', marginTop: 4 }}>{pendingWithdrawals.toLocaleString()} MT</Text>
            </Card.Content>
          </Card>
        </View>
      </ScrollView>

      {/* Tabs */}
      <View style={styles.tabRow}>
        {(['payments', 'withdrawals', 'commissions'] as const).map(t => (
          <TouchableOpacity key={t} onPress={() => setTab(t)} style={[styles.tabBtn, tab === t && styles.tabBtnActive]}>
            <Text style={[styles.tabText, tab === t && styles.tabTextActive]}>
              {t === 'payments' ? 'Pagamentos' : t === 'withdrawals' ? 'Levantamentos' : 'Comissões'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Payments Tab */}
      {tab === 'payments' && (
        <Card style={styles.listCard}>
          <Card.Content>
            {MOCK_PAYMENTS.map(p => (
              <View key={p.id} style={styles.payRow}>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontWeight: '700', fontSize: 14, color: '#111827' }}>{p.student} → {p.tutor}</Text>
                  <Text style={{ fontSize: 11, color: '#9ca3af' }}>{p.date}</Text>
                </View>
                <View style={{ alignItems: 'flex-end' }}>
                  <Text style={{ fontWeight: '800', color: '#111827' }}>{p.amount} MT</Text>
                  <Chip compact textStyle={{ fontSize: 9, fontWeight: '700', color: p.status === 'completed' ? '#10b981' : p.status === 'escrow' ? '#f97316' : '#ef4444' }} style={{ backgroundColor: p.status === 'completed' ? '#ecfdf5' : p.status === 'escrow' ? '#fff7ed' : '#fef2f2' }}>
                    {p.status === 'completed' ? 'Pago' : p.status === 'escrow' ? 'Escrow' : 'Reembolsado'}
                  </Chip>
                </View>
              </View>
            ))}
          </Card.Content>
        </Card>
      )}

      {/* Withdrawals Tab */}
      {tab === 'withdrawals' && (
        <Card style={styles.listCard}>
          <Card.Content>
            {withdrawals.map(w => (
              <View key={w.id} style={styles.payRow}>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontWeight: '700', fontSize: 14, color: '#111827' }}>{w.tutor}</Text>
                  <Text style={{ fontSize: 11, color: '#9ca3af' }}>{w.method} • {w.date}</Text>
                </View>
                <View style={{ alignItems: 'flex-end', gap: 4 }}>
                  <Text style={{ fontWeight: '800', color: '#111827' }}>{w.amount} MT</Text>
                  {w.status === 'pending' ? (
                    <Button mode="contained" compact onPress={() => approveWithdrawal(w.id)} style={{ backgroundColor: '#10b981', borderRadius: 8 }} labelStyle={{ fontSize: 10, fontWeight: '700', color: '#fff' }}>
                      Aprovar
                    </Button>
                  ) : (
                    <Chip compact textStyle={{ fontSize: 9, fontWeight: '700', color: '#10b981' }} style={{ backgroundColor: '#ecfdf5' }}>Pago</Chip>
                  )}
                </View>
              </View>
            ))}
          </Card.Content>
        </Card>
      )}

      {/* Commissions Tab */}
      {tab === 'commissions' && (
        <Card style={styles.listCard}>
          <Card.Content>
            <View style={styles.commissionInfo}>
              <IconButton icon="information" iconColor="#4f46e5" size={20} style={{ margin: 0 }} />
              <Text style={{ flex: 1, fontSize: 13, color: '#4b5563', lineHeight: 20 }}>
                A comissão actual é de <Text style={{ fontWeight: '800' }}>10%</Text> sobre cada transação. O valor é retido automaticamente no momento do pagamento.
              </Text>
            </View>
            <View style={styles.commissionStats}>
              <View style={styles.commStatItem}>
                <Text style={{ fontSize: 11, color: '#9ca3af', fontWeight: '600' }}>Este mês</Text>
                <Text style={{ fontSize: 22, fontWeight: '800', color: '#4f46e5' }}>{totalFees} MT</Text>
              </View>
              <View style={styles.commStatItem}>
                <Text style={{ fontSize: 11, color: '#9ca3af', fontWeight: '600' }}>Mês anterior</Text>
                <Text style={{ fontSize: 22, fontWeight: '800', color: '#6b7280' }}>12.450 MT</Text>
              </View>
              <View style={styles.commStatItem}>
                <Text style={{ fontSize: 11, color: '#9ca3af', fontWeight: '600' }}>Crescimento</Text>
                <Text style={{ fontSize: 22, fontWeight: '800', color: '#10b981' }}>+8.2%</Text>
              </View>
            </View>
          </Card.Content>
        </Card>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#f9fafb' },
  content: { padding: 16, paddingBottom: 32 },
  header: { marginBottom: 20 },
  headerTop: { flexDirection: 'row', alignItems: 'center' },
  backButton: { margin: 0 },
  headerContent: { flex: 1, marginLeft: 8 },
  statCard: { width: 170, borderRadius: 20, elevation: 2 },
  tabRow: { flexDirection: 'row', gap: 8, marginBottom: 16 },
  tabBtn: { flex: 1, paddingVertical: 10, borderRadius: 12, backgroundColor: '#fff', alignItems: 'center', borderWidth: 1, borderColor: '#f3f4f6' },
  tabBtnActive: { backgroundColor: '#4f46e5', borderColor: '#4f46e5' },
  tabText: { fontSize: 12, fontWeight: '700', color: '#6b7280' },
  tabTextActive: { color: '#fff' },
  listCard: { backgroundColor: '#fff', borderRadius: 20, elevation: 0, borderWidth: 1, borderColor: '#f3f4f6' },
  payRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#f9fafb' },
  commissionInfo: { flexDirection: 'row', gap: 12, backgroundColor: '#eef2ff', borderRadius: 16, padding: 16, marginBottom: 20 },
  commissionStats: { flexDirection: 'row', gap: 12 },
  commStatItem: { flex: 1, alignItems: 'center', backgroundColor: '#f9fafb', borderRadius: 16, padding: 16, gap: 4 },
});
