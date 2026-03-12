import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TextInput, KeyboardAvoidingView, Platform, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { IconButton, Avatar } from 'react-native-paper';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useFeedStore } from '../store/feedStore';
import { useAuthStore } from '../store/authStore';
import { FeedPost, FeedComment } from '../types';

export default function CommentsScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { post } = route.params as { post: FeedPost };
  const { user } = useAuthStore();
  const { addComment, toggleCommentLike, posts } = useFeedStore();
  const [commentText, setCommentText] = useState('');

  const currentPost = posts.find(p => p.id === post.id) || post;

  const handleAddComment = async () => {
    if (!user || !commentText.trim()) return;

    await addComment(post.id, {
      postId: post.id,
      userId: user.id,
      userName: user.name,
      userAvatar: user.avatar,
      content: commentText.trim(),
    });

    setCommentText('');
  };

  const handleLikeComment = (commentId: string) => {
    if (user) {
      toggleCommentLike(post.id, commentId, user.id);
    }
  };

  const getTimeAgo = (dateString: string) => {
    const now = new Date();
    const date = new Date(dateString);
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (seconds < 60) return 'Agora mesmo';
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h`;
    if (seconds < 604800) return `${Math.floor(seconds / 86400)}d`;
    return date.toLocaleDateString('pt-PT');
  };

  const renderComment = ({ item }: { item: FeedComment }) => {
    const isLiked = user ? item.likes.includes(user.id) : false;

    return (
      <View style={styles.commentItem}>
        <Avatar.Image
          size={40}
          source={{ uri: item.userAvatar || 'https://ui-avatars.com/api/?name=' + encodeURIComponent(item.userName) }}
        />
        <View style={styles.commentContent}>
          <View style={styles.commentBubble}>
            <Text style={styles.commentUserName}>{item.userName}</Text>
            <Text style={styles.commentText}>{item.content}</Text>
          </View>
          <View style={styles.commentActions}>
            <Text style={styles.commentTime}>{getTimeAgo(item.createdAt)}</Text>
            <TouchableOpacity onPress={() => handleLikeComment(item.id)}>
              <Text style={[styles.commentAction, isLiked && styles.commentActionActive]}>
                Gosto
              </Text>
            </TouchableOpacity>
            {item.likes.length > 0 && (
              <Text style={styles.commentLikes}>
                {item.likes.length} {item.likes.length === 1 ? 'gosto' : 'gostos'}
              </Text>
            )}
          </View>
        </View>
      </View>
    );
  };

  const renderHeader = () => (
    <View style={styles.postHeader}>
      <View style={styles.postUserInfo}>
        <Avatar.Image
          size={48}
          source={{ uri: currentPost.userAvatar || 'https://ui-avatars.com/api/?name=' + encodeURIComponent(currentPost.userName) }}
        />
        <View style={styles.postUserDetails}>
          <Text style={styles.postUserName}>{currentPost.userName}</Text>
          <Text style={styles.postTime}>{getTimeAgo(currentPost.createdAt)}</Text>
        </View>
      </View>
      <Text style={styles.postContent}>{currentPost.content}</Text>
      <View style={styles.commentsHeader}>
        <Text style={styles.commentsCount}>
          {currentPost.comments.length} {currentPost.comments.length === 1 ? 'Comentário' : 'Comentários'}
        </Text>
      </View>
    </View>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Text style={styles.emptyStateIcon}>💬</Text>
      <Text style={styles.emptyStateText}>Seja o primeiro a comentar!</Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <IconButton icon="arrow-left" size={24} onPress={() => navigation.goBack()} />
        <Text style={styles.headerTitle}>Comentários</Text>
        <View style={{ width: 48 }} />
      </View>

      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        <FlatList
          data={currentPost.comments}
          renderItem={renderComment}
          keyExtractor={(item) => item.id}
          ListHeaderComponent={renderHeader}
          ListEmptyComponent={renderEmptyState}
          contentContainerStyle={styles.listContent}
        />

        <View style={styles.inputContainer}>
          <Avatar.Image
            size={36}
            source={{ uri: user?.avatar || 'https://ui-avatars.com/api/?name=User' }}
          />
          <TextInput
            style={styles.input}
            placeholder="Escreva um comentário..."
            placeholderTextColor="#9ca3af"
            value={commentText}
            onChangeText={setCommentText}
            multiline
            maxLength={500}
          />
          <IconButton
            icon="send"
            iconColor="#4f46e5"
            size={24}
            onPress={handleAddComment}
            disabled={!commentText.trim()}
          />
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 8,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
  },
  keyboardView: {
    flex: 1,
  },
  listContent: {
    paddingBottom: 16,
  },
  postHeader: {
    padding: 16,
    borderBottomWidth: 8,
    borderBottomColor: '#f3f4f6',
  },
  postUserInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  postUserDetails: {
    marginLeft: 12,
  },
  postUserName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
  },
  postTime: {
    fontSize: 13,
    color: '#6b7280',
    marginTop: 2,
  },
  postContent: {
    fontSize: 15,
    lineHeight: 22,
    color: '#1f2937',
  },
  commentsHeader: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  commentsCount: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1f2937',
  },
  commentItem: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  commentContent: {
    flex: 1,
    marginLeft: 12,
  },
  commentBubble: {
    backgroundColor: '#f3f4f6',
    borderRadius: 16,
    padding: 12,
  },
  commentUserName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 4,
  },
  commentText: {
    fontSize: 14,
    color: '#374151',
    lineHeight: 20,
  },
  commentActions: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
    marginLeft: 12,
    gap: 12,
  },
  commentTime: {
    fontSize: 12,
    color: '#9ca3af',
  },
  commentAction: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6b7280',
  },
  commentActionActive: {
    color: '#ef4444',
  },
  commentLikes: {
    fontSize: 12,
    color: '#9ca3af',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyStateIcon: {
    fontSize: 48,
    marginBottom: 12,
  },
  emptyStateText: {
    fontSize: 15,
    color: '#6b7280',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    backgroundColor: '#fff',
  },
  input: {
    flex: 1,
    backgroundColor: '#f3f4f6',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginHorizontal: 8,
    maxHeight: 100,
    fontSize: 15,
    color: '#1f2937',
  },
});
