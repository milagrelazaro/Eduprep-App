import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, RefreshControl, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { FAB, Searchbar } from 'react-native-paper';
import { useFeedStore } from '../store/feedStore';
import { useAuthStore } from '../store/authStore';
import PostCard from '../components/PostCard';
import { FeedPost } from '../types';
import { useNavigation } from '@react-navigation/native';

export default function FeedScreen() {
  const navigation = useNavigation();
  const { posts, loadPosts, isLoading } = useFeedStore();
  const { user } = useAuthStore();
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState<'all' | 'news' | 'achievement' | 'announcement'>('all');

  useEffect(() => {
    loadPosts();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadPosts();
    setRefreshing(false);
  };

  const handleCommentPress = (post: FeedPost) => {
    navigation.navigate('Comments' as never, { post } as never);
  };

  const filteredPosts = posts.filter(post => {
    const matchesSearch = post.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         post.userName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filter === 'all' || post.type === filter;
    return matchesSearch && matchesFilter;
  });

  const renderHeader = () => (
    <View style={styles.header}>
      <Text style={styles.title}>Feed de Notícias</Text>
      <Searchbar
        placeholder="Pesquisar publicações..."
        onChangeText={setSearchQuery}
        value={searchQuery}
        style={styles.searchBar}
      />
      <View style={styles.filterContainer}>
        <TouchableOpacity
          style={[styles.filterButton, filter === 'all' && styles.filterButtonActive]}
          onPress={() => setFilter('all')}
        >
          <Text style={[styles.filterText, filter === 'all' && styles.filterTextActive]}>
            Todos
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.filterButton, filter === 'news' && styles.filterButtonActive]}
          onPress={() => setFilter('news')}
        >
          <Text style={[styles.filterText, filter === 'news' && styles.filterTextActive]}>
            Notícias
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.filterButton, filter === 'achievement' && styles.filterButtonActive]}
          onPress={() => setFilter('achievement')}
        >
          <Text style={[styles.filterText, filter === 'achievement' && styles.filterTextActive]}>
            Conquistas
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.filterButton, filter === 'announcement' && styles.filterButtonActive]}
          onPress={() => setFilter('announcement')}
        >
          <Text style={[styles.filterText, filter === 'announcement' && styles.filterTextActive]}>
            Avisos
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Text style={styles.emptyStateIcon}>📰</Text>
      <Text style={styles.emptyStateTitle}>Nenhuma publicação encontrada</Text>
      <Text style={styles.emptyStateText}>
        {searchQuery
          ? 'Tente pesquisar com outros termos'
          : 'Seja o primeiro a publicar algo!'}
      </Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <FlatList
        data={filteredPosts}
        renderItem={({ item }) => (
          <PostCard post={item} onCommentPress={handleCommentPress} />
        )}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={renderEmptyState}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#4f46e5']} />
        }
      />
      <FAB
        icon="plus"
        style={styles.fab}
        onPress={() => navigation.navigate('CreatePost' as never)}
        label="Publicar"
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f2f5',
  },
  header: {
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    marginBottom: 12,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: 16,
  },
  searchBar: {
    elevation: 0,
    backgroundColor: '#f3f4f6',
    marginBottom: 12,
  },
  filterContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#f3f4f6',
  },
  filterButtonActive: {
    backgroundColor: '#4f46e5',
  },
  filterText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#6b7280',
  },
  filterTextActive: {
    color: '#fff',
  },
  listContent: {
    paddingBottom: 80,
    paddingHorizontal: 12,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    paddingHorizontal: 32,
  },
  emptyStateIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 8,
  },
  emptyStateText: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
  },
  fab: {
    position: 'absolute',
    right: 16,
    bottom: 16,
    backgroundColor: '#4f46e5',
  },
});
