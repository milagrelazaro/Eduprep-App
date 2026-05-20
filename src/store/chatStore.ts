import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Chat, ChatMessage } from '../types';

interface ChatState {
  chats: Chat[];
  activeChat: Chat | null;
  messages: ChatMessage[];
  isLoading: boolean;
  loadChats: (userId: string) => Promise<void>;
  loadMessages: (chatId: string) => Promise<void>;
  createChat: (payload: { participantId: string; participantName: string; participantAvatar?: string }) => Promise<Chat>;
  sendMessage: (chatId: string, text: string, senderId: string, senderName: string) => Promise<void>;
  markAsRead: (chatId: string, userId: string) => Promise<void>;
  deleteChat: (chatId: string) => Promise<void>;
  setActiveChat: (chat: Chat | null) => void;
  getUnreadCount: (userId: string) => number;
  seedDemoConversation: (userId: string) => Promise<void>;
}

const CHATS_STORAGE_KEY = 'eduprep_chats';
const MESSAGES_STORAGE_KEY = 'eduprep_messages';

const buildDemoChat = (userId: string): Chat => ({
  id: `demo-${userId}`,
  participantId: 'support',
  participantName: 'EduPrep Suporte',
  participantAvatar: 'https://ui-avatars.com/api/?name=EduPrep&background=1f2937&color=fff',
  lastMessage: 'Bem-vindo ao EduPrep! Como posso ajudar?',
  lastMessageTime: new Date().toISOString(),
  unreadCount: 1,
  online: true,
});

const buildDemoMessages = (chatId: string): ChatMessage[] => [
  {
    id: `${chatId}-welcome`,
    chatId,
    text: 'Olá! Somos a equipa EduPrep. Envie dúvidas sobre exames ou explicadores por aqui.',
    senderId: 'support',
    senderName: 'EduPrep Suporte',
    time: new Date().toISOString(),
    read: false,
  },
];

export const useChatStore = create<ChatState>((set, get) => ({
  chats: [],
  activeChat: null,
  messages: [],
  isLoading: false,

  loadChats: async (userId: string) => {
    set({ isLoading: true });
    try {
      const savedChats = await AsyncStorage.getItem(`${CHATS_STORAGE_KEY}_${userId}`);
      if (savedChats) {
        const chats = JSON.parse(savedChats);
        set({ chats, isLoading: false });
      } else {
        await get().seedDemoConversation(userId);
        set({ isLoading: false });
      }
    } catch (error) {
      console.error('Error loading chats:', error);
      set({ isLoading: false });
    }
  },

  loadMessages: async (chatId: string) => {
    try {
      const savedMessages = await AsyncStorage.getItem(`${MESSAGES_STORAGE_KEY}_${chatId}`);
      if (savedMessages) {
        const messages = JSON.parse(savedMessages);
        set({ messages });
      } else {
        set({ messages: [] });
      }
    } catch (error) {
      console.error('Error loading messages:', error);
    }
  },

  createChat: async ({ participantId, participantName, participantAvatar }: { participantId: string; participantName: string; participantAvatar?: string }) => {
    const newChat: Chat = {
      id: `chat-${Date.now()}`,
      participantId,
      participantName,
      participantAvatar,
      lastMessage: '',
      lastMessageTime: new Date().toISOString(),
      unreadCount: 0,
      online: false,
    };

    const updatedChats = [newChat, ...get().chats];
    set({ chats: updatedChats });
    
    // Persistir
    const { user } = require('./authStore').useAuthStore.getState();
    if (user) {
      await AsyncStorage.setItem(`${CHATS_STORAGE_KEY}_${user.id}`, JSON.stringify(updatedChats));
    }
    
    return newChat;
  },

  sendMessage: async (chatId: string, text: string, senderId: string, senderName: string) => {
    const newMessage: ChatMessage = {
      id: `msg-${Date.now()}`,
      chatId,
      text,
      senderId,
      senderName,
      time: new Date().toISOString(),
      read: false,
    };

    // Atualizar mensagens
    const updatedMessages = [...get().messages, newMessage];
    set({ messages: updatedMessages });
    
    // Persistir mensagens
    await AsyncStorage.setItem(`${MESSAGES_STORAGE_KEY}_${chatId}`, JSON.stringify(updatedMessages));

    // Atualizar última mensagem no chat
    const updatedChats = get().chats.map(chat => {
      if (chat.id === chatId) {
        return {
          ...chat,
          lastMessage: text,
          lastMessageTime: newMessage.time,
        };
      }
      return chat;
    });
    
    set({ chats: updatedChats });
    
    // Persistir chats
    const { user } = require('./authStore').useAuthStore.getState();
    if (user) {
      await AsyncStorage.setItem(`${CHATS_STORAGE_KEY}_${user.id}`, JSON.stringify(updatedChats));
    }
  },

  markAsRead: async (chatId: string, userId: string) => {
    // Marcar mensagens como lidas
    const updatedMessages = get().messages.map(msg => ({
      ...msg,
      read: true,
    }));
    set({ messages: updatedMessages });
    await AsyncStorage.setItem(`${MESSAGES_STORAGE_KEY}_${chatId}`, JSON.stringify(updatedMessages));

    // Resetar contador de não lidas
    const updatedChats = get().chats.map(chat => {
      if (chat.id === chatId) {
        return { ...chat, unreadCount: 0 };
      }
      return chat;
    });
    
    set({ chats: updatedChats });
    await AsyncStorage.setItem(`${CHATS_STORAGE_KEY}_${userId}`, JSON.stringify(updatedChats));
  },

  deleteChat: async (chatId: string) => {
    const updatedChats = get().chats.filter(chat => chat.id !== chatId);
    set({ chats: updatedChats, activeChat: null });
    
    // Remover mensagens
    await AsyncStorage.removeItem(`${MESSAGES_STORAGE_KEY}_${chatId}`);
    
    // Persistir chats
    const { user } = require('./authStore').useAuthStore.getState();
    if (user) {
      await AsyncStorage.setItem(`${CHATS_STORAGE_KEY}_${user.id}`, JSON.stringify(updatedChats));
    }
  },

  setActiveChat: (chat: Chat | null) => {
    set({ activeChat: chat });
    if (chat) {
      get().loadMessages(chat.id);
    }
  },

  getUnreadCount: (userId: string) => {
    return get().chats.reduce((total, chat) => total + (chat.unreadCount || 0), 0);
  },

  seedDemoConversation: async (userId: string) => {
    const demoChat = buildDemoChat(userId);
    const demoMessages = buildDemoMessages(demoChat.id);
    await AsyncStorage.setItem(`${CHATS_STORAGE_KEY}_${userId}`, JSON.stringify([demoChat]));
    await AsyncStorage.setItem(`${MESSAGES_STORAGE_KEY}_${demoChat.id}`, JSON.stringify(demoMessages));
    set({ chats: [demoChat], messages: demoMessages });
  },
}));
