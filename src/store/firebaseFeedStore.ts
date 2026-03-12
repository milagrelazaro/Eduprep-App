import { create } from 'zustand';
import { postService } from '../services/firebaseService';

interface FeedPost {
  id: string;
  authorId: string;
  authorName: string;
  authorAvatar: string;
  content: string;
  image?: string;
  likes: string[];
  comments: any[];
  shares: number;
  createdAt: Date;
  updatedAt: Date;
}

interface FeedState {
  posts: FeedPost[];
  isLoading: boolean;
  loadPosts: () => Promise<void>;
  createPost: (postData: any) => Promise<void>;
  updatePost: (postId: string, updates: any) => Promise<void>;
  deletePost: (postId: string) => Promise<void>;
  likePost: (postId: string, userId: string) => Promise<void>;
  unlikePost: (postId: string, userId: string) => Promise<void>;
  addComment: (postId: string, comment: any) => Promise<void>;
}

export const useFirebaseFeedStore = create<FeedState>((set, get) => ({
  posts: [],
  isLoading: false,

  loadPosts: async () => {
    try {
      set({ isLoading: true });
      const posts = await postService.getAllPosts();
      set({ posts, isLoading: false });
    } catch (error) {
      console.error('Error loading posts:', error);
      set({ isLoading: false });
    }
  },

  createPost: async (postData) => {
    try {
      const newPost = await postService.createPost(postData);
      set({ posts: [newPost, ...get().posts] });
    } catch (error) {
      console.error('Error creating post:', error);
    }
  },

  updatePost: async (postId: string, updates: any) => {
    try {
      await postService.updatePost(postId, updates);
      set({
        posts: get().posts.map(post =>
          post.id === postId ? { ...post, ...updates } : post
        )
      });
    } catch (error) {
      console.error('Error updating post:', error);
    }
  },

  deletePost: async (postId: string) => {
    try {
      await postService.deletePost(postId);
      set({
        posts: get().posts.filter(post => post.id !== postId)
      });
    } catch (error) {
      console.error('Error deleting post:', error);
    }
  },

  likePost: async (postId: string, userId: string) => {
    try {
      const post = get().posts.find(p => p.id === postId);
      if (!post || post.likes.includes(userId)) return;

      const updatedPost = {
        ...post,
        likes: [...post.likes, userId]
      };

      await postService.updatePost(postId, { likes: updatedPost.likes });
      set({
        posts: get().posts.map(p =>
          p.id === postId ? updatedPost : p
        )
      });
    } catch (error) {
      console.error('Error liking post:', error);
    }
  },

  unlikePost: async (postId: string, userId: string) => {
    try {
      const post = get().posts.find(p => p.id === postId);
      if (!post || !post.likes.includes(userId)) return;

      const updatedPost = {
        ...post,
        likes: post.likes.filter(id => id !== userId)
      };

      await postService.updatePost(postId, { likes: updatedPost.likes });
      set({
        posts: get().posts.map(p =>
          p.id === postId ? updatedPost : p
        )
      });
    } catch (error) {
      console.error('Error unliking post:', error);
    }
  },

  addComment: async (postId: string, comment: any) => {
    try {
      const post = get().posts.find(p => p.id === postId);
      if (!post) return;

      const updatedPost = {
        ...post,
        comments: [...post.comments, comment]
      };

      await postService.updatePost(postId, { comments: updatedPost.comments });
      set({
        posts: get().posts.map(p =>
          p.id === postId ? updatedPost : p
        )
      });
    } catch (error) {
      console.error('Error adding comment:', error);
    }
  },
}));

export default useFirebaseFeedStore;
