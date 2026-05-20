import React, { useState, useEffect } from 'react';
import { View, FlatList, Image, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Modal, Portal, Text, Searchbar, Button, IconButton } from 'react-native-paper';
import { userService } from '../services/firebaseService';
import { useAuthStore } from '../store/authStore';

interface NewChatModalProps {
  visible: boolean;
  onDismiss: () => void;
  onSelect: (participantId: string, participantName: string, avatar?: string) => void;
}

export function NewChatModal({ visible, onDismiss, onSelect }: NewChatModalProps) {
  const { user } = useAuthStore();
  const [search, setSearch] = useState('');
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (visible) {
      loadUsers();
    }
  }, [visible]);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const allUsers = await userService.getAllUsers();
      // Filtrar o próprio usuário
      const otherUsers = allUsers.filter((u: any) => u.id !== user?.id);
      setUsers(otherUsers);
    } catch (error) {
      console.error('Erro ao carregar usuários:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers = users.filter((u) =>
    u.name.toLowerCase().includes(search.toLowerCase()) ||
    (u.subject && u.subject.toLowerCase().includes(search.toLowerCase())) ||
    (u.role && u.role.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <Portal>
      <Modal
        visible={visible}
        onDismiss={onDismiss}
        contentContainerStyle={{ margin: 16, backgroundColor: '#fff', borderRadius: 24, padding: 16 }}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
          <IconButton icon="account-plus" size={24} />
          <Text style={{ fontWeight: '800', fontSize: 16 }}>Nova Conversa</Text>
        </View>

        <Searchbar
          value={search}
          onChangeText={setSearch}
          placeholder="Pesquisar usuário"
          style={{ borderRadius: 16, marginBottom: 16 }}
        />

        {loading ? (
          <View style={{ paddingVertical: 40, alignItems: 'center' }}>
            <ActivityIndicator size="large" color="#4f46e5" />
            <Text style={{ marginTop: 12, color: '#6b7280' }}>Carregando usuários...</Text>
          </View>
        ) : (
          <FlatList
            data={filteredUsers}
            keyExtractor={(item) => item.id}
            ItemSeparatorComponent={() => <View style={{ height: 1, backgroundColor: '#f3f4f6' }} />}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 10, gap: 12 }}
                onPress={() => {
                  const avatar = item.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(item.name)}&background=4f46e5&color=fff`;
                  onSelect(item.id, item.name, avatar);
                  onDismiss();
                }}
              >
                <Image 
                  source={{ uri: item.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(item.name)}&background=4f46e5&color=fff` }} 
                  style={{ width: 48, height: 48, borderRadius: 16 }} 
                />
                <View style={{ flex: 1 }}>
                  <Text style={{ fontWeight: '700', color: '#111827' }}>{item.name}</Text>
                  <Text style={{ color: '#6b7280', fontSize: 12 }}>
                    {item.role === 'tutor' ? '🎓 Tutor' : item.role === 'admin' ? '🔑 Admin' : '🎓 Estudante'}
                    {item.subject && ` • ${item.subject}`}
                  </Text>
                </View>
                <Button mode="contained-tonal" compact style={{ borderRadius: 12 }}>Iniciar</Button>
              </TouchableOpacity>
            )}
            ListEmptyComponent={() => (
              <View style={{ paddingVertical: 20, alignItems: 'center' }}>
                <Text style={{ color: '#6b7280' }}>Nenhum usuário encontrado.</Text>
              </View>
            )}
          />
        )}
      </Modal>
    </Portal>
  );
}
