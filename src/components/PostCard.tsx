import React, { useState } from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity, TextInput, Alert, Share } from 'react-native';
import { Card, Avatar, IconButton, Chip, Menu } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { FeedPost } from '../types';
import { useFeedStore } from '../store/feedStore';
import { useAuthStore } from '../store/authStore';

interface PostCardProps {
  post: FeedPost;
  onCommentPress: (post: FeedPost) => void;
}

export default function PostCard({ post, onCommentPress }: PostCardProps) {
  const navigation = useNavigation();
  const { user } = useAuthStore();
  const { toggleLike, addComment, sharePost, deletePost } = useFeedStore();
  const [showCommentInput, setShowCommentInput] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [menuVisible, setMenuVisible] = useState(false);

  const isLiked = user ? post.likes.includes(user.id) : false;
  const likesCount = post.likes.length;
  const commentsCount = post.comments.length;
  const sharesCount = post.shares.length;

  const handleLike = () => {
    if (user) {
      toggleLike(post.id, user.id);
    }
  };

  const handleComment = async () => {
    if (!user || !commentText.trim()) return;

    await addComment(post.id, {
      postId: post.id,
      userId: user.id,
      userName: user.name,
      userAvatar: user.avatar,
      content: commentText.trim(),
    });

    setCommentText('');
    setShowCommentInput(false);
  };

  const handleShare = async () => {
    if (!user) return;

    try {
      await Share.share({
        message: `${post.userName}: ${post.content}`,
        title: 'Partilhar publicação',
      });
      await sharePost(post.id, user.id);
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  const handleDelete = () => {
    if (!user) return;
    setMenuVisible(false);

    Alert.alert(
      'Eliminar Publicação',
      'Tem certeza que deseja eliminar esta publicação?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: () => deletePost(post.id),
        },
      ]
    );
  };

  const handleEdit = () => {
    setMenuVisible(false);
    navigation.navigate('EditPost' as never, { post } as never);
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

  const getRoleBadgeColor = () => {
    switch (post.userRole) {
      case 'admin': return '#1f2937';
      case 'tutor': return '#f59e0b';
      case 'student': return '#4f46e5';
      default: return '#6b7280';
    }
  };

  const getRoleLabel = () => {
    switch (post.userRole) {
      case 'admin': return 'Admin';
      case 'tutor': return 'Explicador';
      case 'student': return 'Estudante';
      default: return '';
    }
  };

  return (
    <Card style={styles.card}>
      <View style={styles.header}>
        <View style={styles.userInfo}>
          <Avatar.Image
            size={48}
            source={{ uri: post.userAvatar || 'https://ui-avatars.com/api/?name=' + encodeURIComponent(post.userName) }}
          />
          <View style={styles.userDetails}>
            <View style={styles.nameRow}>
              <Text style={styles.userName}>{post.userName}</Text>
              <Chip
                mode="flat"
                style={[styles.roleBadge, { backgroundColor: getRoleBadgeColor() }]}
                textStyle={styles.roleBadgeText}
              >
                {getRoleLabel()}
              </Chip>
            </View>
            <Text style={styles.timestamp}>{getTimeAgo(post.createdAt)}</Text>
          </View>
        </View>
        {user && user.id === post.userId && (
          <Menu
            visible={menuVisible}
            onDismiss={() => setMenuVisible(false)}
            anchor={
              <IconButton
                icon="dots-horizontal"
                size={20}
                onPress={() => setMenuVisible(true)}
              />
            }
          >
            <Menu.Item onPress={handleEdit} leadingIcon="pencil" title="Editar" />
            <Menu.Item onPress={handleDelete} leadingIcon="delete" title="Eliminar" />
          </Menu>
        )}
      </View>

      {post.type === 'achievement' && post.achievementData && (
        <View style={styles.achievementBanner}>
          <Text style={styles.achievementIcon}>🎉</Text>
          <View style={styles.achievementInfo}>
            <Text style={styles.achievementTitle}>Conquista Desbloqueada!</Text>
            <Text style={styles.achievementText}>
              {post.achievementData.examName} - {post.achievementData.score} valores
            </Text>
          </View>
        </View>
      )}

      <Card.Content style={styles.content}>
        <Text style={styles.postContent}>{post.content}</Text>
      </Card.Content>

      {post.image && (
        <Image
          source={{ uri: post.image }}
          style={styles.postImage}
          resizeMode="cover"
        />
      )}

      <View style={styles.stats}>
        <Text style={styles.statsText}>
          {likesCount > 0 && `${likesCount} ${likesCount === 1 ? 'gosto' : 'gostos'}`}
        </Text>
        <View style={styles.statsRight}>
          {commentsCount > 0 && (
            <Text style={styles.statsText}>{commentsCount} {commentsCount === 1 ? 'comentário' : 'comentários'}</Text>
          )}
          {sharesCount > 0 && (
            <Text style={styles.statsText}> • {sharesCount} {sharesCount === 1 ? 'partilha' : 'partilhas'}</Text>
          )}
        </View>
      </View>

      <View style={styles.actions}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={handleLike}
        >
          <IconButton
            icon={isLiked ? 'heart' : 'heart-outline'}
            iconColor={isLiked ? '#ef4444' : '#6b7280'}
            size={22}
          />
          <Text style={[styles.actionText, isLiked && styles.actionTextActive]}>
            Gosto
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => onCommentPress(post)}
        >
          <IconButton icon="comment-outline" iconColor="#6b7280" size={22} />
          <Text style={styles.actionText}>Comentar</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionButton}
          onPress={handleShare}
        >
          <IconButton icon="share-outline" iconColor="#6b7280" size={22} />
          <Text style={styles.actionText}>Partilhar</Text>
        </TouchableOpacity>
      </View>

      {post.comments.length > 0 && (
        <View style={styles.commentsPreview}>
          {post.comments.slice(0, 2).map((comment) => (
            <View key={comment.id} style={styles.comment}>
              <Avatar.Image
                size={32}
                source={{ uri: comment.userAvatar || 'https://ui-avatars.com/api/?name=' + encodeURIComponent(comment.userName) }}
              />
              <View style={styles.commentContent}>
                <Text style={styles.commentUserName}>{comment.userName}</Text>
                <Text style={styles.commentText}>{comment.content}</Text>
              </View>
            </View>
          ))}
          {post.comments.length > 2 && (
            <TouchableOpacity onPress={() => onCommentPress(post)}>
              <Text style={styles.viewMoreComments}>
                Ver todos os {post.comments.length} comentários
              </Text>
            </TouchableOpacity>
          )}
        </View>
      )}

      {showCommentInput && (
        <View style={styles.commentInputContainer}>
          <Avatar.Image
            size={32}
            source={{ uri: user?.avatar || 'https://ui-avatars.com/api/?name=User' }}
          />
          <TextInput
            style={styles.commentInput}
            placeholder="Escreva um comentário..."
            value={commentText}
            onChangeText={setCommentText}
            multiline
          />
          <IconButton
            icon="send"
            iconColor="#4f46e5"
            size={24}
            onPress={handleComment}
            disabled={!commentText.trim()}
          />
        </View>
      )}
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    marginHorizontal: 0,
    marginBottom: 8,
    backgroundColor: '#fff',
    borderRadius: 8,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  userDetails: {
    marginLeft: 12,
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
  },
  roleBadge: {
    height: 20,
    paddingHorizontal: 6,
    borderRadius: 4,
  },
  roleBadgeText: {
    fontSize: 10,
    color: '#fff',
    fontWeight: '600',
  },
  timestamp: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 2,
  },
  achievementBanner: {
    backgroundColor: '#fef3c7',
    padding: 12,
    marginHorizontal: 16,
    marginBottom: 12,
    borderRadius: 6,
    flexDirection: 'row',
    alignItems: 'center',
  },
  achievementIcon: {
    fontSize: 32,
    marginRight: 12,
  },
  achievementInfo: {
    flex: 1,
  },
  achievementTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#92400e',
    marginBottom: 2,
  },
  achievementText: {
    fontSize: 12,
    color: '#78350f',
  },
  content: {
    paddingTop: 0,
  },
  postContent: {
    fontSize: 15,
    lineHeight: 22,
    color: '#1f2937',
  },
  postImage: {
    width: '100%',
    height: 300,
    marginTop: 12,
  },
  stats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  statsText: {
    fontSize: 13,
    color: '#6b7280',
  },
  statsRight: {
    flexDirection: 'row',
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 4,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
  },
  actionText: {
    fontSize: 14,
    color: '#6b7280',
    fontWeight: '500',
    marginLeft: -8,
  },
  actionTextActive: {
    color: '#ef4444',
  },
  commentsPreview: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  comment: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  commentContent: {
    flex: 1,
    marginLeft: 8,
    backgroundColor: '#f3f4f6',
    borderRadius: 18,
    padding: 8,
  },
  commentUserName: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 2,
  },
  commentText: {
    fontSize: 13,
    color: '#374151',
    lineHeight: 18,
  },
  viewMoreComments: {
    fontSize: 13,
    color: '#6b7280',
    marginTop: 4,
    marginLeft: 40,
  },
  commentInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6',
  },
  commentInput: {
    flex: 1,
    backgroundColor: '#f3f4f6',
    borderRadius: 18,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginHorizontal: 8,
    maxHeight: 100,
  },
});
