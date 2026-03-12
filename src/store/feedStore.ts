import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { FeedPost, FeedComment } from '../types';

interface FeedState {
  posts: FeedPost[];
  isLoading: boolean;
  loadPosts: () => Promise<void>;
  createPost: (post: Omit<FeedPost, 'id' | 'createdAt' | 'likes' | 'comments' | 'shares'>) => Promise<void>;
  toggleLike: (postId: string, userId: string) => Promise<void>;
  addComment: (postId: string, comment: Omit<FeedComment, 'id' | 'createdAt' | 'likes'>) => Promise<void>;
  toggleCommentLike: (postId: string, commentId: string, userId: string) => Promise<void>;
  sharePost: (postId: string, userId: string) => Promise<void>;
  deletePost: (postId: string) => Promise<void>;
}

const INITIAL_POSTS: FeedPost[] = [
  {
    id: 'post-1',
    userId: 'user-demo',
    userName: 'Maria Santos',
    userAvatar: 'https://ui-avatars.com/api/?name=Maria+Santos&background=4f46e5&color=fff',
    userRole: 'student' as any,
    content: 'Acabei de passar no exame de admissão da UEM com 16 valores! 🎉 Obrigada a todos os explicadores que me ajudaram nesta jornada!',
    image: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=800',
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    likes: ['user-1', 'user-2', 'user-3'],
    comments: [
      {
        id: 'comment-1',
        postId: 'post-1',
        userId: 'user-2',
        userName: 'João Macamo',
        userAvatar: 'https://ui-avatars.com/api/?name=João+Macamo&background=10b981&color=fff',
        content: 'Parabéns! Bem merecido! 👏',
        createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
        likes: ['user-1'],
      },
    ],
    shares: ['user-4'],
    type: 'achievement',
    achievementData: {
      examName: 'Exame de Admissão UEM',
      score: 16,
      institution: 'Universidade Eduardo Mondlane',
    },
  },
  {
    id: 'post-2',
    userId: 'tutor-1',
    userName: 'Prof. Pedro Sambo',
    userAvatar: 'https://ui-avatars.com/api/?name=Pedro+Sambo&background=f59e0b&color=fff',
    userRole: 'tutor' as any,
    content: 'Dicas para o exame de Matemática: Pratiquem derivadas e integrais todos os dias! A consistência é a chave para o sucesso. 📚',
    createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
    likes: ['user-1', 'user-5'],
    comments: [],
    shares: [],
    type: 'news',
  },
  {
    id: 'post-3',
    userId: 'admin-1',
    userName: 'EduPrep Admin',
    userAvatar: 'https://ui-avatars.com/api/?name=EduPrep&background=1f2937&color=fff',
    userRole: 'admin' as any,
    content: 'Novos exames de simulação disponíveis! Teste seus conhecimentos em Física, Química e Biologia. Boa sorte a todos! 🚀',
    image: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=800',
    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    likes: ['user-1', 'user-2', 'user-3', 'user-4', 'user-5'],
    comments: [
      {
        id: 'comment-2',
        postId: 'post-3',
        userId: 'user-3',
        userName: 'Ana Silva',
        userAvatar: 'https://ui-avatars.com/api/?name=Ana+Silva&background=ec4899&color=fff',
        content: 'Excelente iniciativa!',
        createdAt: new Date(Date.now() - 20 * 60 * 60 * 1000).toISOString(),
        likes: [],
      },
    ],
    shares: ['user-2', 'user-3'],
    type: 'announcement',
  },
];

export const useFeedStore = create<FeedState>((set, get) => ({
  posts: [],
  isLoading: false,

  loadPosts: async () => {
    set({ isLoading: true });
    try {
      const saved = await AsyncStorage.getItem('eduprep_feed_posts');
      if (saved) {
        const posts = JSON.parse(saved);
        set({ posts: posts.sort((a: FeedPost, b: FeedPost) => 
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        ), isLoading: false });
      } else {
        await AsyncStorage.setItem('eduprep_feed_posts', JSON.stringify(INITIAL_POSTS));
        set({ posts: INITIAL_POSTS, isLoading: false });
      }
    } catch (error) {
      console.error('Error loading posts:', error);
      set({ posts: INITIAL_POSTS, isLoading: false });
    }
  },

  createPost: async (postData) => {
    const newPost: FeedPost = {
      ...postData,
      id: 'post-' + Date.now(),
      createdAt: new Date().toISOString(),
      likes: [],
      comments: [],
      shares: [],
    };

    const updatedPosts = [newPost, ...get().posts];
    set({ posts: updatedPosts });
    await AsyncStorage.setItem('eduprep_feed_posts', JSON.stringify(updatedPosts));
  },

  toggleLike: async (postId, userId) => {
    const posts = get().posts.map(post => {
      if (post.id === postId) {
        const likes = post.likes.includes(userId)
          ? post.likes.filter(id => id !== userId)
          : [...post.likes, userId];
        return { ...post, likes };
      }
      return post;
    });

    set({ posts });
    await AsyncStorage.setItem('eduprep_feed_posts', JSON.stringify(posts));
  },

  addComment: async (postId, commentData) => {
    const newComment: FeedComment = {
      ...commentData,
      id: 'comment-' + Date.now(),
      createdAt: new Date().toISOString(),
      likes: [],
    };

    const posts = get().posts.map(post => {
      if (post.id === postId) {
        return { ...post, comments: [...post.comments, newComment] };
      }
      return post;
    });

    set({ posts });
    await AsyncStorage.setItem('eduprep_feed_posts', JSON.stringify(posts));
  },

  toggleCommentLike: async (postId, commentId, userId) => {
    const posts = get().posts.map(post => {
      if (post.id === postId) {
        const comments = post.comments.map(comment => {
          if (comment.id === commentId) {
            const likes = comment.likes.includes(userId)
              ? comment.likes.filter(id => id !== userId)
              : [...comment.likes, userId];
            return { ...comment, likes };
          }
          return comment;
        });
        return { ...post, comments };
      }
      return post;
    });

    set({ posts });
    await AsyncStorage.setItem('eduprep_feed_posts', JSON.stringify(posts));
  },

  sharePost: async (postId, userId) => {
    const posts = get().posts.map(post => {
      if (post.id === postId) {
        const shares = post.shares.includes(userId)
          ? post.shares
          : [...post.shares, userId];
        return { ...post, shares };
      }
      return post;
    });

    set({ posts });
    await AsyncStorage.setItem('eduprep_feed_posts', JSON.stringify(posts));
  },

  deletePost: async (postId) => {
    const posts = get().posts.filter(post => post.id !== postId);
    set({ posts });
    await AsyncStorage.setItem('eduprep_feed_posts', JSON.stringify(posts));
  },
}));
