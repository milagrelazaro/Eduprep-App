import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { Text, Card, Searchbar } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { colors, borderRadius, spacing, shadows } from '../theme/colors';
import { universityService, University } from '../services/universityService';

export default function FavoriteUniversitiesScreen() {
  const navigation = useNavigation();
  const [searchQuery, setSearchQuery] = useState('');
  const [favorites, setFavorites] = useState<string[]>([]);
  const [universities, setUniversities] = useState<University[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUniversities();
  }, []);

  const loadUniversities = async () => {
    try {
      setLoading(true);
      const data = await universityService.getUniversities();
      setUniversities(data);
    } catch (error) {
      console.error('Erro ao carregar universidades:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleFavorite = (id: string) => {
    if (favorites.includes(id)) {
      setFavorites(favorites.filter(f => f !== id));
    } else {
      if (favorites.length >= 3) {
        Alert.alert('Limite Atingido', 'Você pode ter no máximo 3 universidades favoritas');
        return;
      }
      setFavorites([...favorites, id]);
    }
  };

  const filteredUniversities = universities.filter(uni =>
    uni.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    uni.fullName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const favoriteUniversities = filteredUniversities.filter(uni => favorites.includes(uni.id));
  const otherUniversities = filteredUniversities.filter(uni => !favorites.includes(uni.id));

  if (loading) {
    return (
      <View style={[styles.screen, { backgroundColor: colors.background, justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={{ marginTop: spacing.md, color: colors.textSecondary }}>Carregando universidades...</Text>
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
          <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>Universidades Favoritas</Text>
          <Text style={[styles.headerSubtitle, { color: colors.textSecondary }]}>Atalhos rápidos ({favorites.length}/3)</Text>
        </View>
      </View>

      <Searchbar
        placeholder="Pesquisar universidade..."
        onChangeText={setSearchQuery}
        value={searchQuery}
        style={[styles.searchBar, { backgroundColor: colors.white, borderRadius: borderRadius.md }]}
      />

      <Card style={[styles.infoCard, { backgroundColor: colors.secondary, borderRadius: borderRadius.md }]}>
        <Card.Content style={styles.infoContent}>
          <Text style={styles.infoEmoji}>💡</Text>
          <Text style={[styles.infoText, { color: colors.info }]}>
            Adicione até 3 universidades favoritas para acesso rápido
          </Text>
        </Card.Content>
      </Card>

      {favoriteUniversities.length > 0 && (
        <>
          <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Minhas Favoritas</Text>
          {favoriteUniversities.map(uni => (
            <Card key={uni.id} style={[styles.uniCard, { backgroundColor: colors.white, borderRadius: borderRadius.xl, borderWidth: 2, borderColor: colors.primary }]}>
              <Card.Content style={styles.uniCardContent}>
                <View style={styles.uniLeft}>
                  <View style={[styles.uniIcon, { backgroundColor: colors.primaryLight }]}>
                    <Text style={styles.uniEmoji}>{uni.icon}</Text>
                  </View>
                  <View style={styles.uniInfo}>
                    <Text style={[styles.uniName, { color: colors.textPrimary }]}>{uni.name}</Text>
                    <Text style={[styles.uniFullName, { color: colors.textSecondary }]}>{uni.fullName}</Text>
                    <Text style={[styles.uniLocation, { color: colors.textTertiary }]}>📍 {uni.location}</Text>
                  </View>
                </View>
                <TouchableOpacity onPress={() => toggleFavorite(uni.id)} style={[styles.favoriteButton, { backgroundColor: colors.primaryLight }]}>
                  <Text style={styles.favoriteIcon}>⭐</Text>
                </TouchableOpacity>
              </Card.Content>
            </Card>
          ))}
        </>
      )}

      {otherUniversities.length > 0 && (
        <>
          <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Outras Universidades</Text>
          {otherUniversities.map(uni => (
            <Card key={uni.id} style={[styles.uniCard, { backgroundColor: colors.white, borderRadius: borderRadius.xl }]}>
              <Card.Content style={styles.uniCardContent}>
                <View style={styles.uniLeft}>
                  <View style={[styles.uniIcon, { backgroundColor: colors.grayLight }]}>
                    <Text style={styles.uniEmoji}>{uni.icon}</Text>
                  </View>
                  <View style={styles.uniInfo}>
                    <Text style={[styles.uniName, { color: colors.textPrimary }]}>{uni.name}</Text>
                    <Text style={[styles.uniFullName, { color: colors.textSecondary }]}>{uni.fullName}</Text>
                    <Text style={[styles.uniLocation, { color: colors.textTertiary }]}>📍 {uni.location}</Text>
                  </View>
                </View>
                <TouchableOpacity onPress={() => toggleFavorite(uni.id)} style={[styles.favoriteButton, { backgroundColor: colors.grayLight }]}>
                  <Text style={styles.favoriteIconInactive}>☆</Text>
                </TouchableOpacity>
              </Card.Content>
            </Card>
          ))}
        </>
      )}
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
  searchBar: { marginBottom: spacing.lg },
  infoCard: { marginBottom: spacing.lg },
  infoContent: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  infoEmoji: { fontSize: 20 },
  infoText: { flex: 1, fontSize: 13, fontWeight: '500' },
  sectionTitle: { fontSize: 16, fontWeight: '700', marginBottom: spacing.md, marginTop: spacing.sm },
  uniCard: { marginBottom: spacing.md },
  uniCardContent: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: spacing.md },
  uniLeft: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  uniIcon: { width: 48, height: 48, borderRadius: borderRadius.md, alignItems: 'center', justifyContent: 'center', marginRight: spacing.md },
  uniEmoji: { fontSize: 24 },
  uniInfo: { flex: 1 },
  uniName: { fontSize: 16, fontWeight: '700', marginBottom: 2 },
  uniFullName: { fontSize: 12, marginBottom: 4 },
  uniLocation: { fontSize: 11 },
  favoriteButton: { width: 40, height: 40, borderRadius: borderRadius.md, alignItems: 'center', justifyContent: 'center' },
  favoriteIcon: { fontSize: 20 },
  favoriteIconInactive: { fontSize: 20, color: colors.textTertiary },
});
