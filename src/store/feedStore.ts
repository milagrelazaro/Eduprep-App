import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { FeedPost, FeedComment, UserRole } from '../types';
import { postService } from '../services/firebaseService';

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

const FEED_STORAGE_KEY = 'eduprep_feed_posts';

const mapFirebasePostToFeed = (post: any): FeedPost => {
  const createdAtValue = post.createdAt;
  const createdAt = createdAtValue instanceof Date
    ? createdAtValue.toISOString()
    : typeof createdAtValue === 'string'
    ? createdAtValue
    : new Date().toISOString();

  return {
    id: post.id,
    userId: post.authorId || post.userId || 'eduprep',
    userName: post.authorName || post.userName || 'Membro EduPrep',
    userAvatar: post.authorAvatar || post.userAvatar || undefined,
    userRole: post.userRole || UserRole.STUDENT,
    content: post.content || '',
    image: post.image,
    createdAt,
    likes: Array.isArray(post.likes) ? post.likes : [],
    comments: Array.isArray(post.comments) ? post.comments : [],
    shares: Array.isArray(post.shares) ? post.shares : [],
    type: post.type || 'news',
    achievementData: post.achievementData,
  };
};

export const useFeedStore = create<FeedState>((set, get) => ({
  posts: [],
  isLoading: false,

  loadPosts: async () => {
    set({ isLoading: true });
    try {
      const remotePosts = await postService.getAllPosts();
      const mapped = remotePosts.map(mapFirebasePostToFeed);
      const sorted = mapped.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      set({ posts: sorted, isLoading: false });
      await AsyncStorage.setItem(FEED_STORAGE_KEY, JSON.stringify(sorted));
    } catch (error) {
      console.error('Error loading posts:', error);
      const saved = await AsyncStorage.getItem(FEED_STORAGE_KEY);
      if (saved) {
        set({ posts: JSON.parse(saved), isLoading: false });
      } else {
        set({ posts: [], isLoading: false });
      }
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
    try {
      await postService.createPost({
        authorId: postData.userId,
        authorName: postData.userName,
        authorAvatar: postData.userAvatar,
        userRole: postData.userRole,
        content: postData.content,
        image: postData.image,
        type: postData.type,
        achievementData: postData.achievementData,
      });
      await get().loadPosts();
    } catch (error) {
      console.error('Error creating post:', error);
      const updatedPosts = [newPost, ...get().posts];
      set({ posts: updatedPosts });
      await AsyncStorage.setItem(FEED_STORAGE_KEY, JSON.stringify(updatedPosts));
    }
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
    await AsyncStorage.setItem(FEED_STORAGE_KEY, JSON.stringify(posts));
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
    await AsyncStorage.setItem(FEED_STORAGE_KEY, JSON.stringify(posts));
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
    await AsyncStorage.setItem(FEED_STORAGE_KEY, JSON.stringify(posts));
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
    await AsyncStorage.setItem(FEED_STORAGE_KEY, JSON.stringify(posts));
  },

  deletePost: async (postId) => {
    const posts = get().posts.filter(post => post.id !== postId);
    set({ posts });
    await AsyncStorage.setItem(FEED_STORAGE_KEY, JSON.stringify(posts));
  },
}));
