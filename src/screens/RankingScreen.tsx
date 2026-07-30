import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Text, Card, Chip, Avatar } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { useAuthStore } from '../store/authStore';
import { colors, borderRadius, spacing, shadows } from '../theme/colors';
import { collection, query, getDocs, orderBy, limit } from 'firebase/firestore';
import { db } from '../config/firebase';

interface RankingUser {
  id: string;
  name: string;
  university: string;
  score: number;
  simulationsCount: number;
  position: number;
}

export default function RankingScreen() {
  const navigation = useNavigation();
  const { user } = useAuthStore();
  const [filter, setFilter] = useState<'all' | 'my_university'>('all');
  const [ranking, setRanking] = useState<RankingUser[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadRanking();
  }, []);

  const loadRanking = async () => {
    try {
      setLoading(true);
      const resultsRef = collection(db, 'examResults');
      const resultsSnapshot = await getDocs(resultsRef);
      
      const userScores: { [userId: string]: { total: number; count: number; name: string; university: string } } = {};
      
      resultsSnapshot.forEach((doc) => {
        const data = doc.data();
        if (!userScores[data.userId]) {
          userScores[data.userId] = {
            total: 0,
            count: 0,
            name: data.userName || 'Usuário',
            university: data.userUniversity || 'N/A'
          };
        }
        userScores[data.userId].total += data.score;
        userScores[data.userId].count += 1;
      });
      
      const rankingData: RankingUser[] = Object.entries(userScores)
        .map(([userId, data]) => ({
          id: userId,
          name: data.name,
          university: data.university,
          score: (data.total / data.count),
          simulationsCount: data.count,
          position: 0
        }))
        .sort((a, b) => b.score - a.score)
        .map((item, index) => ({ ...item, position: index + 1 }));
      
      setRanking(rankingData);
    } catch (error) {
      console.error('Erro ao carregar ranking:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredRanking = filter === 'my_university'
    ? ranking.filter(u => u.university === user?.intendedCourse)
    : ranking;

  const userPosition = ranking.findIndex(u => u.id === user?.id) + 1;

  const getMedalEmoji = (position: number) => {
    switch (position) {
      case 1: return '🥇';
      case 2: return '🥈';
      case 3: return '🥉';
      default: return '';
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 85) return colors.success;
    if (score >= 70) return colors.warning;
    return colors.error;
  };

  if (loading) {
    return (
      <View style={[styles.screen, { backgroundColor: colors.background, justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={{ marginTop: spacing.md, color: colors.textSecondary }}>Carregando ranking...</Text>
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
          <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>Ranking Nacional</Text>
          <Text style={[styles.headerSubtitle, { color: colors.textSecondary }]}>
            Veja sua posição entre os candidatos
          </Text>
        </View>
      </View>

      {userPosition > 0 && (
        <Card style={[styles.userCard, { backgroundColor: colors.primaryLight, borderRadius: borderRadius.xl, ...shadows.small }]}>
          <Card.Content style={styles.userCardContent}>
            <View style={styles.userLeft}>
              <View style={[styles.positionBadge, { backgroundColor: colors.primary }]}>
                <Text style={styles.positionText}>#{userPosition}</Text>
              </View>
              <View>
                <Text style={[styles.userCardTitle, { color: colors.primary }]}>Sua Posição</Text>
                <Text style={[styles.userCardName, { color: colors.textPrimary }]}>{user?.name}</Text>
              </View>
            </View>
            <Text style={[styles.userCardScore, { color: colors.primary }]}>
              {ranking[userPosition - 1]?.score.toFixed(1)}%
            </Text>
          </Card.Content>
        </Card>
      )}

      <View style={styles.filterRow}>
        <Chip
          selected={filter === 'all'}
          onPress={() => setFilter('all')}
          style={[styles.filterChip, filter === 'all' && { backgroundColor: colors.primary }]}
          textStyle={[styles.filterChipText, filter === 'all' && { color: colors.white }]}
        >
          Todos
        </Chip>
        <Chip
          selected={filter === 'my_university'}
          onPress={() => setFilter('my_university')}
          style={[styles.filterChip, filter === 'my_university' && { backgroundColor: colors.primary }]}
          textStyle={[styles.filterChipText, filter === 'my_university' && { color: colors.white }]}
        >
          Minha Universidade
        </Chip>
      </View>

      <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
        Top {filteredRanking.length} Candidatos
      </Text>

      {filteredRanking.map((item, index) => (
        <Card 
          key={item.id} 
          style={[
            styles.rankCard,
            { backgroundColor: colors.white, borderRadius: borderRadius.md, ...shadows.small },
            item.id === user?.id && { borderWidth: 2, borderColor: colors.primary }
          ]}
        >
          <Card.Content style={styles.rankCardContent}>
            <View style={styles.rankLeft}>
              <View style={[
                styles.positionCircle,
                { backgroundColor: index < 3 ? colors.warningLight : colors.grayLight }
              ]}>
                <Text style={[styles.positionNumber, { color: index < 3 ? colors.warning : colors.textSecondary }]}>
                  {getMedalEmoji(item.position) || `#${item.position}`}
                </Text>
              </View>
              <View style={styles.rankInfo}>
                <Text style={[styles.rankName, { color: colors.textPrimary }]}>{item.name}{item.id === user?.id && (<Text style={{ color: colors.primary }}> (Você)</Text>)}</Text>
                <View style={styles.rankMeta}>
                  <Text style={[styles.rankUniversity, { color: colors.textSecondary }]}>🎓 {item.university}</Text>
                  <Text style={[styles.rankSims, { color: colors.textTertiary }]}>• {item.simulationsCount} simulados</Text>
                </View>
              </View>
            </View>
            <View style={styles.rankRight}>
              <Text style={[styles.rankScore, { color: getScoreColor(item.score) }]}>
                {item.score.toFixed(1)}%
              </Text>
            </View>
          </Card.Content>
        </Card>
      ))}

      <Card style={[styles.infoCard, { backgroundColor: colors.secondary, borderRadius: borderRadius.md }]}>
        <Card.Content>
          <Text style={[styles.infoTitle, { color: colors.info }]}>ℹ️ Como funciona o ranking?</Text>
          <Text style={[styles.infoText, { color: colors.info }]}>
            • Baseado na média de todos os simulados realizados{'\n'}
            • Atualizado em tempo real{'\n'}
            • Filtrado por universidade pretendida{'\n'}
            • Quanto mais simulados, mais preciso
          </Text>
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
  userCard: { marginBottom: spacing.lg },
  userCardContent: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: spacing.lg },
  userLeft: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  positionBadge: { width: 48, height: 48, borderRadius: borderRadius.round, alignItems: 'center', justifyContent: 'center' },
  positionText: { fontSize: 16, fontWeight: '800', color: colors.white },
  userCardTitle: { fontSize: 12, fontWeight: '600', marginBottom: 2 },
  userCardName: { fontSize: 16, fontWeight: '700' },
  userCardScore: { fontSize: 28, fontWeight: '800' },
  filterRow: { flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.lg },
  filterChip: { backgroundColor: colors.grayLight },
  filterChipText: { fontSize: 13, fontWeight: '600' },
  sectionTitle: { fontSize: 16, fontWeight: '700', marginBottom: spacing.md },
  rankCard: { marginBottom: spacing.sm },
  rankCardContent: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: spacing.md },
  rankLeft: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  positionCircle: { width: 40, height: 40, borderRadius: borderRadius.round, alignItems: 'center', justifyContent: 'center', marginRight: spacing.md },
  positionNumber: { fontSize: 16, fontWeight: '700' },
  rankInfo: { flex: 1 },
  rankName: { fontSize: 14, fontWeight: '600', marginBottom: 4 },
  rankMeta: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  rankUniversity: { fontSize: 11, fontWeight: '500' },
  rankSims: { fontSize: 11 },
  rankRight: {},
  rankScore: { fontSize: 20, fontWeight: '800' },
  infoCard: { marginTop: spacing.lg },
  infoTitle: { fontSize: 14, fontWeight: '700', marginBottom: spacing.sm },
  infoText: { fontSize: 12, lineHeight: 18 },
});
