import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Text, Card, Chip, Switch } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { colors, borderRadius, spacing, shadows } from '../theme/colors';
import { useAuthStore } from '../store/authStore';
import { notificationService } from '../services/notificationService';

interface Notification {
  id: string;
  title: string;
  message: string;
  time: string;
  type: string;
  read?: boolean;
}

export default function NotificationsScreen() {
  const navigation = useNavigation();
  const { user } = useAuthStore();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [filter, setFilter] = useState<'all' | 'unread'>('all');
  const [pushEnabled, setPushEnabled] = useState(true);
  const [emailEnabled, setEmailEnabled] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadNotifications();
  }, [user?.id]);

  const loadNotifications = async () => {
    if (!user?.id) return;
    
    try {
      setLoading(true);
      const data = await notificationService.getUserNotifications(user.id);
      
      // Formatar tempo relativo
      const formatted = data.map(n => ({
        ...n,
        time: getRelativeTime(n.createdAt || new Date()),
      }));
      
      setNotifications(formatted);
    } catch (error) {
      console.error('Erro ao carregar notificações:', error);
      // Fallback para notificações de exemplo se falhar
      setNotifications([
        {
          id: '1',
          userId: user.id,
          title: 'Bem-vindo ao SimulaPass!',
          message: 'Comece a fazer simulados para se preparar melhor.',
          time: 'Agora',
          type: 'info',
          read: false,
          createdAt: new Date(),
        } as any,
      ]);
    } finally {
      setLoading(false);
    }
  };

  const getRelativeTime = (date: Date): string => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Agora';
    if (minutes < 60) return `Há ${minutes} minuto${minutes > 1 ? 's' : ''}`;
    if (hours < 24) return `Há ${hours} hora${hours > 1 ? 's' : ''}`;
    if (days === 1) return 'Ontem';
    return `Há ${days} dias`;
  };

  const filteredNotifications = filter === 'unread'
    ? notifications.filter(n => !n.read)
    : notifications;

  const unreadCount = notifications.filter(n => !n.read).length;

  const markAsRead = (id: string) => {
    setNotifications(notifications.map(n =>
      n.id === id ? { ...n, read: true } : n
    ));
  };

  const markAllAsRead = () => {
    setNotifications(notifications.map(n => ({ ...n, read: true })));
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'info': return '📢';
      case 'success': return '✅';
      case 'warning': return '⚠️';
      case 'promo': return '🎁';
      default: return '📬';
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'info': return colors.info;
      case 'success': return colors.success;
      case 'warning': return colors.warning;
      case 'promo': return colors.primary;
      default: return colors.textSecondary;
    }
  };

  if (loading) {
    return (
      <View style={[styles.screen, { backgroundColor: colors.background, justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={{ marginTop: spacing.md, color: colors.textSecondary }}>Carregando notificações...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={[styles.screen, { backgroundColor: colors.background }]} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>Notificações</Text>
          <Text style={[styles.headerSubtitle, { color: colors.textSecondary }]}>
            {unreadCount} não lidas
          </Text>
        </View>
        {unreadCount > 0 && (
          <TouchableOpacity onPress={markAllAsRead}>
            <Text style={[styles.markAllButton, { color: colors.primary }]}>Marcar todas</Text>
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.filterRow}>
        <Chip
          selected={filter === 'all'}
          onPress={() => setFilter('all')}
          style={[styles.filterChip, filter === 'all' && { backgroundColor: colors.primary }]}
          textStyle={[styles.filterChipText, filter === 'all' && { color: colors.white }]}
        >
          Todas ({notifications.length})
        </Chip>
        <Chip
          selected={filter === 'unread'}
          onPress={() => setFilter('unread')}
          style={[styles.filterChip, filter === 'unread' && { backgroundColor: colors.primary }]}
          textStyle={[styles.filterChipText, filter === 'unread' && { color: colors.white }]}
        >
          Não Lidas ({unreadCount})
        </Chip>
      </View>

      {filteredNotifications.map(notification => (
        <Card
          key={notification.id}
          style={[
            styles.notificationCard,
            { backgroundColor: colors.white, borderRadius: borderRadius.md, ...shadows.small },
            !notification.read && { borderLeftWidth: 4, borderLeftColor: getNotificationColor(notification.type) }
          ]}
        >
          <TouchableOpacity onPress={() => markAsRead(notification.id)}>
            <Card.Content style={styles.notificationContent}>
              <View style={styles.notificationLeft}>
                <View style={[styles.notificationIcon, { backgroundColor: colors.grayLight }]}>
                  <Text style={styles.notificationEmoji}>{getNotificationIcon(notification.type)}</Text>
                </View>
                <View style={styles.notificationInfo}>
                  <View style={styles.notificationHeader}>
                    <Text style={[styles.notificationTitle, { color: colors.textPrimary }]}>{notification.title}</Text>
                    {!notification.read && (<View style={[styles.unreadDot, { backgroundColor: colors.primary }]} />)}
                  </View>
                  <Text style={[styles.notificationMessage, { color: colors.textSecondary }]}>{notification.message}</Text>
                  <Text style={[styles.notificationTime, { color: colors.textTertiary }]}>{notification.time}</Text>
                </View>
              </View>
            </Card.Content>
          </TouchableOpacity>
        </Card>
      ))}

      {filteredNotifications.length === 0 && (
        <Card style={[styles.emptyCard, { backgroundColor: colors.white, borderRadius: borderRadius.xl }]}>
          <Card.Content style={styles.emptyContent}>
            <Text style={styles.emptyEmoji}>📭</Text>
            <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
              {filter === 'unread' ? 'Nenhuma notificação não lida' : 'Nenhuma notificação'}
            </Text>
          </Card.Content>
        </Card>
      )}

      <Card style={[styles.settingsCard, { backgroundColor: colors.white, borderRadius: borderRadius.xl, ...shadows.small }]}>
        <Card.Content style={styles.settingsContent}>
          <Text style={[styles.settingsTitle, { color: colors.textPrimary }]}>Preferências de Notificação</Text>
          
          <View style={styles.settingRow}>
            <View style={styles.settingLeft}>
              <Text style={styles.settingEmoji}>📱</Text>
              <View>
                <Text style={[styles.settingLabel, { color: colors.textPrimary }]}>Notificações Push</Text>
                <Text style={[styles.settingDesc, { color: colors.textSecondary }]}>
                  Receba alertas no dispositivo
                </Text>
              </View>
            </View>
            <Switch
              value={pushEnabled}
              onValueChange={setPushEnabled}
              trackColor={{ false: colors.borderLight, true: colors.success }}
              thumbColor={pushEnabled ? colors.white : colors.grayMedium}
            />
          </View>

          <View style={styles.settingRow}>
            <View style={styles.settingLeft}>
              <Text style={styles.settingEmoji}>📧</Text>
              <View>
                <Text style={[styles.settingLabel, { color: colors.textPrimary }]}>Notificações por Email</Text>
                <Text style={[styles.settingDesc, { color: colors.textSecondary }]}>
                  Receba resumos semanais
                </Text>
              </View>
            </View>
            <Switch
              value={emailEnabled}
              onValueChange={setEmailEnabled}
              trackColor={{ false: colors.borderLight, true: colors.success }}
              thumbColor={emailEnabled ? colors.white : colors.grayMedium}
            />
          </View>
        </Card.Content>
      </Card>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  content: { padding: spacing.lg, paddingBottom: 32 },
  header: { flexDirection: 'row', alignItems: 'center', marginBottom: spacing.lg },
  backButton: { marginRight: spacing.md },
  backIcon: { fontSize: 28, color: colors.textPrimary },
  headerContent: { flex: 1 },
  headerTitle: { fontSize: 24, fontWeight: '800', marginBottom: 2 },
  headerSubtitle: { fontSize: 13, fontWeight: '400' },
  markAllButton: { fontSize: 13, fontWeight: '600' },
  filterRow: { flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.lg },
  filterChip: { backgroundColor: colors.grayLight },
  filterChipText: { fontSize: 13, fontWeight: '600' },
  notificationCard: { marginBottom: spacing.sm },
  notificationContent: { padding: spacing.md },
  notificationLeft: { flexDirection: 'row', gap: spacing.md },
  notificationIcon: { width: 40, height: 40, borderRadius: borderRadius.md, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  notificationEmoji: { fontSize: 20 },
  notificationInfo: { flex: 1 },
  notificationHeader: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginBottom: 4 },
  notificationTitle: { fontSize: 14, fontWeight: '600', flex: 1 },
  unreadDot: { width: 8, height: 8, borderRadius: 4 },
  notificationMessage: { fontSize: 13, marginBottom: 6, lineHeight: 18 },
  notificationTime: { fontSize: 11 },
  emptyCard: { marginTop: spacing.xl },
  emptyContent: { alignItems: 'center', padding: spacing.xl },
  emptyEmoji: { fontSize: 64, marginBottom: spacing.md },
  emptyText: { fontSize: 14 },
  settingsCard: { marginTop: spacing.lg },
  settingsContent: { padding: spacing.lg },
  settingsTitle: { fontSize: 16, fontWeight: '700', marginBottom: spacing.lg },
  settingRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: spacing.lg },
  settingLeft: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, flex: 1 },
  settingEmoji: { fontSize: 24 },
  settingLabel: { fontSize: 14, fontWeight: '600', marginBottom: 2 },
  settingDesc: { fontSize: 12 },
});
