import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView, Image } from 'react-native';
import { Text, Card, IconButton } from 'react-native-paper';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuthStore } from '../store/authStore';

const MOCK_RANKING = [
  { id: '1', name: 'Ana Machava', score: 19, subject: 'Matemática', avatar: '' },
  { id: '2', name: 'Carlos Tembe', score: 18, subject: 'Matemática', avatar: '' },
  { id: '3', name: 'Fátima Nhaca', score: 18, subject: 'Física', avatar: '' },
  { id: '4', name: 'João Sitoe', score: 17, subject: 'Português', avatar: '' },
  { id: '5', name: 'Maria Cossa', score: 17, subject: 'Matemática', avatar: '' },
  { id: '6', name: 'Pedro Langa', score: 16, subject: 'Química', avatar: '' },
  { id: '7', name: 'Rita Mondlane', score: 16, subject: 'Biologia', avatar: '' },
  { id: '8', name: 'Samuel Bila', score: 15, subject: 'Física', avatar: '' },
];

export default function RankingScreen() {
  const { user } = useAuthStore();
  const [myResults, setMyResults] = useState<any[]>([]);

  useEffect(() => {
    loadResults();
  }, []);

  const loadResults = async () => {
    const saved = await AsyncStorage.getItem('eduprep_exams');
    setMyResults(saved ? JSON.parse(saved) : []);
  };

  const myBestScore = myResults.length > 0 ? Math.max(...myResults.map((r: any) => r.score)) : 0;
  const fullRanking = [
    ...MOCK_RANKING,
    ...(myBestScore > 0 ? [{ id: 'me', name: user?.name || 'Tu', score: myBestScore, subject: 'Matemática', avatar: user?.avatar || '' }] : []),
  ].sort((a, b) => b.score - a.score);

  const getMedalColor = (pos: number) => {
    if (pos === 0) return '#eab308';
    if (pos === 1) return '#9ca3af';
    if (pos === 2) return '#b45309';
    return undefined;
  };

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Text variant="headlineSmall" style={{ fontWeight: '800', color: '#111827' }}>Ranking de Simulados</Text>
        <Text variant="bodyMedium" style={{ color: '#6b7280' }}>Os melhores resultados da plataforma</Text>
      </View>

      {/* Top 3 Podium */}
      <View style={styles.podium}>
        {[1, 0, 2].map((pos) => {
          const entry = fullRanking[pos];
          if (!entry) return <View key={pos} style={{ flex: 1 }} />;
          const isCenter = pos === 0;
          return (
            <View key={pos} style={[styles.podiumItem, isCenter && styles.podiumCenter]}>
              <View style={[styles.podiumMedal, { backgroundColor: getMedalColor(pos) || '#e5e7eb' }]}>
                <Text style={{ color: '#fff', fontWeight: '800', fontSize: 14 }}>{pos + 1}</Text>
              </View>
              <Image
                source={{ uri: entry.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(entry.name)}&background=4f46e5&color=fff` }}
                style={[styles.podiumAvatar, isCenter && { width: 72, height: 72 }]}
              />
              <Text style={{ fontWeight: '700', fontSize: 12, color: '#111827', textAlign: 'center' }} numberOfLines={1}>{entry.name}</Text>
              <Text style={{ fontWeight: '800', fontSize: 18, color: '#4f46e5' }}>{entry.score}/20</Text>
              <Text style={{ fontSize: 10, color: '#9ca3af' }}>{entry.subject}</Text>
            </View>
          );
        })}
      </View>

      {/* Full List */}
      <Card style={styles.listCard}>
        <Card.Content>
          {fullRanking.map((entry, i) => {
            const isMe = entry.id === 'me';
            return (
              <View key={entry.id} style={[styles.rankRow, isMe && styles.rankRowMe]}>
                <View style={styles.rankPos}>
                  <Text style={[styles.rankPosText, i < 3 && { color: getMedalColor(i) }]}>
                    {i < 3 ? '' : `${i + 1}º`}
                  </Text>
                  {i < 3 && <IconButton icon="trophy" iconColor={getMedalColor(i)} size={16} style={{ margin: 0 }} />}
                </View>
                <Image
                  source={{ uri: entry.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(entry.name)}&background=4f46e5&color=fff` }}
                  style={styles.rankAvatar}
                />
                <View style={{ flex: 1 }}>
                  <Text style={{ fontWeight: '700', fontSize: 14, color: isMe ? '#4f46e5' : '#111827' }}>
                    {entry.name} {isMe ? '(Tu)' : ''}
                  </Text>
                  <Text style={{ fontSize: 11, color: '#9ca3af' }}>{entry.subject}</Text>
                </View>
                <View style={styles.scoreBadge}>
                  <Text style={{ fontWeight: '800', fontSize: 16, color: '#4f46e5' }}>{entry.score}</Text>
                  <Text style={{ fontSize: 10, color: '#9ca3af' }}>/20</Text>
                </View>
              </View>
            );
          })}
        </Card.Content>
      </Card>

      {/* My Stats */}
      {myResults.length > 0 && (
        <Card style={styles.myStatsCard}>
          <Card.Content>
            <Text variant="titleMedium" style={styles.sectionTitle}>As Tuas Estatísticas</Text>
            <View style={styles.statsRow}>
              <View style={styles.statItem}>
                <Text style={{ fontSize: 28, fontWeight: '800', color: '#4f46e5' }}>{myResults.length}</Text>
                <Text style={{ fontSize: 11, color: '#9ca3af', fontWeight: '600' }}>Simulados</Text>
              </View>
              <View style={[styles.statItem, { borderLeftWidth: 1, borderRightWidth: 1, borderColor: '#f3f4f6' }]}>
                <Text style={{ fontSize: 28, fontWeight: '800', color: '#10b981' }}>{myBestScore}</Text>
                <Text style={{ fontSize: 11, color: '#9ca3af', fontWeight: '600' }}>Melhor Nota</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={{ fontSize: 28, fontWeight: '800', color: '#f97316' }}>
                  {(myResults.reduce((a: number, r: any) => a + r.score, 0) / myResults.length).toFixed(1)}
                </Text>
                <Text style={{ fontSize: 11, color: '#9ca3af', fontWeight: '600' }}>Média</Text>
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
  header: { marginBottom: 24 },
  podium: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'center', marginBottom: 24, gap: 8 },
  podiumItem: { flex: 1, alignItems: 'center', backgroundColor: '#fff', borderRadius: 20, padding: 12, paddingTop: 28, borderWidth: 1, borderColor: '#f3f4f6', gap: 4, position: 'relative' },
  podiumCenter: { paddingTop: 32, marginTop: -16, elevation: 2, borderColor: '#eef2ff', borderWidth: 2 },
  podiumMedal: { position: 'absolute', top: -12, width: 28, height: 28, borderRadius: 14, alignItems: 'center', justifyContent: 'center', elevation: 2 },
  podiumAvatar: { width: 56, height: 56, borderRadius: 16, backgroundColor: '#f3f4f6' },
  listCard: { backgroundColor: '#fff', borderRadius: 20, elevation: 0, borderWidth: 1, borderColor: '#f3f4f6', marginBottom: 16 },
  rankRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#f9fafb' },
  rankRowMe: { backgroundColor: '#eef2ff', marginHorizontal: -16, paddingHorizontal: 16, borderRadius: 12 },
  rankPos: { width: 36, alignItems: 'center' },
  rankPosText: { fontWeight: '800', fontSize: 14, color: '#9ca3af' },
  rankAvatar: { width: 40, height: 40, borderRadius: 12, backgroundColor: '#f3f4f6' },
  scoreBadge: { flexDirection: 'row', alignItems: 'baseline', gap: 1 },
  myStatsCard: { backgroundColor: '#fff', borderRadius: 20, elevation: 0, borderWidth: 1, borderColor: '#f3f4f6' },
  sectionTitle: { fontWeight: '800', color: '#111827', marginBottom: 16 },
  statsRow: { flexDirection: 'row' },
  statItem: { flex: 1, alignItems: 'center', paddingVertical: 8 },
});
