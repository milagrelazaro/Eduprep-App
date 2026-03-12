import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Text, Card, IconButton, Button } from 'react-native-paper';

const MOCK_NOTIFICATIONS = [
  { id: '1', type: 'lesson', title: 'Aula Confirmada', body: 'Pedro Sambo aceitou a sua aula de Matemática para amanhã às 10:00.', time: 'Agora', read: false, icon: 'check-circle', color: '#10b981', bg: '#ecfdf5' },
  { id: '2', type: 'payment', title: 'Pagamento Recebido', body: 'Recebeu 550 MT pela aula com João Sitoe.', time: '2h atrás', read: false, icon: 'cash', color: '#4f46e5', bg: '#eef2ff' },
  { id: '3', type: 'exam', title: 'Novo Simulado Disponível', body: 'Exame de Física da UEM 2024 já está disponível. Teste os seus conhecimentos!', time: '5h atrás', read: false, icon: 'school', color: '#f97316', bg: '#fff7ed' },
  { id: '4', type: 'system', title: 'Bem-vindo ao EduPrep!', body: 'A sua conta foi criada com sucesso. Explore tutores e simulados.', time: 'Ontem', read: true, icon: 'party-popper', color: '#8b5cf6', bg: '#f5f3ff' },
  { id: '5', type: 'lesson', title: 'Lembrete de Aula', body: 'A sua aula de Português com Ana Vilanculos começa em 30 minutos.', time: 'Ontem', read: true, icon: 'clock-alert', color: '#eab308', bg: '#fefce8' },
  { id: '6', type: 'exam', title: 'Resultado do Simulado', body: 'Obteve 16/20 no simulado de Matemática. Parabéns!', time: '2 dias', read: true, icon: 'trophy', color: '#10b981', bg: '#ecfdf5' },
  { id: '7', type: 'payment', title: 'Reembolso Processado', body: 'O reembolso de 450 MT foi creditado na sua carteira.', time: '3 dias', read: true, icon: 'cash-refund', color: '#ef4444', bg: '#fef2f2' },
];

export default function NotificationsScreen() {
  const [notifications, setNotifications] = useState(MOCK_NOTIFICATIONS);

  const unreadCount = notifications.filter(n => !n.read).length;

  const markAllRead = () => {
    setNotifications(notifications.map(n => ({ ...n, read: true })));
  };

  const markRead = (id: string) => {
    setNotifications(notifications.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const clearAll = () => {
    setNotifications([]);
  };

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <View>
          <Text variant="headlineSmall" style={{ fontWeight: '800', color: '#111827' }}>Notificações</Text>
          {unreadCount > 0 && (
            <Text variant="bodySmall" style={{ color: '#4f46e5', fontWeight: '700' }}>{unreadCount} não lidas</Text>
          )}
        </View>
        <View style={{ flexDirection: 'row', gap: 8 }}>
          {unreadCount > 0 && (
            <Button mode="text" compact onPress={markAllRead} labelStyle={{ fontSize: 12, fontWeight: '700', color: '#4f46e5' }}>
              Marcar todas
            </Button>
          )}
          {notifications.length > 0 && (
            <Button mode="text" compact onPress={clearAll} labelStyle={{ fontSize: 12, fontWeight: '700', color: '#ef4444' }}>
              Limpar
            </Button>
          )}
        </View>
      </View>

      {notifications.length > 0 ? (
        notifications.map(notif => (
          <TouchableOpacity key={notif.id} onPress={() => markRead(notif.id)} activeOpacity={0.7}>
            <Card style={[styles.notifCard, !notif.read && styles.notifCardUnread]}>
              <Card.Content style={styles.notifContent}>
                <View style={[styles.notifIcon, { backgroundColor: notif.bg }]}>
                  <IconButton icon={notif.icon} iconColor={notif.color} size={20} style={{ margin: 0 }} />
                </View>
                <View style={{ flex: 1 }}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 2 }}>
                    <Text style={{ fontWeight: '700', fontSize: 14, color: '#111827' }}>{notif.title}</Text>
                    {!notif.read && <View style={styles.unreadDot} />}
                  </View>
                  <Text style={{ fontSize: 13, color: '#6b7280', lineHeight: 18, marginBottom: 4 }}>{notif.body}</Text>
                  <Text style={{ fontSize: 11, color: '#9ca3af', fontWeight: '600' }}>{notif.time}</Text>
                </View>
              </Card.Content>
            </Card>
          </TouchableOpacity>
        ))
      ) : (
        <View style={styles.emptyState}>
          <IconButton icon="bell-off" iconColor="#d1d5db" size={48} />
          <Text variant="titleMedium" style={{ fontWeight: '700', color: '#111827', marginBottom: 4 }}>Sem notificações</Text>
          <Text variant="bodySmall" style={{ color: '#9ca3af', textAlign: 'center' }}>
            Quando houver novidades sobre aulas, exames ou pagamentos, aparecerão aqui.
          </Text>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#f9fafb' },
  content: { padding: 16, paddingBottom: 32 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  notifCard: { backgroundColor: '#fff', borderRadius: 16, elevation: 0, borderWidth: 1, borderColor: '#f3f4f6', marginBottom: 8 },
  notifCardUnread: { borderColor: '#e0e7ff', backgroundColor: '#fafaff' },
  notifContent: { flexDirection: 'row', gap: 14 },
  notifIcon: { width: 44, height: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  unreadDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#4f46e5' },
  emptyState: { alignItems: 'center', paddingVertical: 64 },
});
