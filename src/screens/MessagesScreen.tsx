import React, { useState } from 'react';
import { View, StyleSheet, FlatList, Image, TouchableOpacity, TextInput, KeyboardAvoidingView, Platform } from 'react-native';
import { Text, IconButton } from 'react-native-paper';

const mockChats = [
  { id: '1', name: 'Dr. Ricardo Silva', lastMsg: 'Combinado, amanhã às 10h.', time: '14:20', unread: 0, online: true },
  { id: '2', name: 'Dra. Maria Antónia', lastMsg: 'Podes enviar o PDF do exame?', time: 'Ontem', unread: 2, online: false },
  { id: '3', name: 'EduPrep Suporte', lastMsg: 'O seu pagamento foi confirmado.', time: 'Terça', unread: 0, online: true },
];

const initialMessages = [
  { id: '1', text: 'Olá professor, já comecei a estudar as funções.', sender: 'me', time: '14:15' },
  { id: '2', text: 'Excelente! Tens alguma dúvida específica?', sender: 'them', time: '14:18' },
  { id: '3', text: 'Combinado, amanhã às 10h.', sender: 'them', time: '14:20' },
];

export default function MessagesScreen() {
  const [activeChat, setActiveChat] = useState<any>(mockChats[0]);
  const [msg, setMsg] = useState('');
  const [chatHistory, setChatHistory] = useState(initialMessages);
  const [showChat, setShowChat] = useState(false);

  const handleSend = () => {
    if (!msg.trim()) return;
    setChatHistory([...chatHistory, {
      id: Date.now().toString(),
      text: msg,
      sender: 'me',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    }]);
    setMsg('');
  };

  const openChat = (chat: any) => {
    setActiveChat(chat);
    setShowChat(true);
  };

  if (showChat && activeChat) {
    return (
      <KeyboardAvoidingView style={styles.screen} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        {/* Chat Header */}
        <View style={styles.chatHeader}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
            <IconButton icon="arrow-left" onPress={() => setShowChat(false)} />
            <Image
              source={{ uri: `https://ui-avatars.com/api/?name=${encodeURIComponent(activeChat.name)}&background=4f46e5&color=fff` }}
              style={styles.chatAvatar}
            />
            <View>
              <Text style={{ fontWeight: '700', fontSize: 14 }}>{activeChat.name}</Text>
              <Text style={{ fontSize: 10, color: activeChat.online ? '#10b981' : '#9ca3af', fontWeight: '700' }}>
                {activeChat.online ? 'Online' : 'Offline'}
              </Text>
            </View>
          </View>
          <View style={{ flexDirection: 'row' }}>
            <IconButton icon="phone" iconColor="#9ca3af" size={20} />
            <IconButton icon="video" iconColor="#9ca3af" size={20} />
          </View>
        </View>

        {/* Messages */}
        <FlatList
          data={chatHistory}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.messagesList}
          renderItem={({ item }) => (
            <View style={[styles.msgRow, item.sender === 'me' ? styles.msgRowSelf : styles.msgRowOther]}>
              <View style={[styles.msgBubble, item.sender === 'me' ? styles.bubbleSelf : styles.bubbleOther]}>
                <Text style={[styles.msgText, item.sender === 'me' && { color: '#fff' }]}>{item.text}</Text>
                <View style={styles.msgMeta}>
                  <Text style={[styles.msgTime, item.sender === 'me' && { color: 'rgba(255,255,255,0.6)' }]}>{item.time}</Text>
                  {item.sender === 'me' && <IconButton icon="check-all" iconColor="rgba(255,255,255,0.6)" size={12} style={{ margin: 0 }} />}
                </View>
              </View>
            </View>
          )}
        />

        {/* Input */}
        <View style={styles.inputBar}>
          <TextInput
            value={msg}
            onChangeText={setMsg}
            placeholder="Escreva a sua mensagem..."
            style={styles.textInput}
            onSubmitEditing={handleSend}
          />
          <IconButton icon="send" iconColor="#fff" size={20} style={styles.sendBtn} onPress={handleSend} />
        </View>
      </KeyboardAvoidingView>
    );
  }

  return (
    <View style={styles.screen}>
      <View style={styles.listHeader}>
        <Text variant="headlineSmall" style={{ fontWeight: '800', color: '#111827' }}>Mensagens</Text>
      </View>

      <FlatList
        data={mockChats}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[styles.contactRow, activeChat?.id === item.id && { backgroundColor: '#eef2ff' }]}
            onPress={() => openChat(item)}
          >
            <View style={{ position: 'relative' }}>
              <Image
                source={{ uri: `https://ui-avatars.com/api/?name=${encodeURIComponent(item.name)}&background=4f46e5&color=fff` }}
                style={styles.contactAvatar}
              />
              {item.online && <View style={styles.onlineDot} />}
            </View>
            <View style={{ flex: 1 }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 2 }}>
                <Text style={{ fontWeight: '700', fontSize: 14 }}>{item.name}</Text>
                <Text style={{ fontSize: 10, color: '#9ca3af' }}>{item.time}</Text>
              </View>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <Text style={{ fontSize: 12, color: '#6b7280' }} numberOfLines={1}>{item.lastMsg}</Text>
                {item.unread > 0 && (
                  <View style={styles.unreadBadge}>
                    <Text style={{ fontSize: 10, fontWeight: '700', color: '#fff' }}>{item.unread}</Text>
                  </View>
                )}
              </View>
            </View>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#fff' },
  listHeader: { padding: 16, borderBottomWidth: 1, borderBottomColor: '#f3f4f6' },
  contactRow: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 16, borderBottomWidth: 1, borderBottomColor: '#f9fafb' },
  contactAvatar: { width: 48, height: 48, borderRadius: 12, backgroundColor: '#f3f4f6' },
  onlineDot: { position: 'absolute', bottom: -1, right: -1, width: 12, height: 12, borderRadius: 6, backgroundColor: '#10b981', borderWidth: 2, borderColor: '#fff' },
  unreadBadge: { backgroundColor: '#4f46e5', width: 20, height: 20, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  chatHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 8, borderBottomWidth: 1, borderBottomColor: '#f3f4f6', backgroundColor: '#fff' },
  chatAvatar: { width: 36, height: 36, borderRadius: 10, backgroundColor: '#f3f4f6' },
  messagesList: { padding: 16, gap: 8 },
  msgRow: { marginBottom: 8 },
  msgRowSelf: { alignItems: 'flex-end' },
  msgRowOther: { alignItems: 'flex-start' },
  msgBubble: { maxWidth: '75%', padding: 12, borderRadius: 16 },
  bubbleSelf: { backgroundColor: '#4f46e5', borderTopRightRadius: 4 },
  bubbleOther: { backgroundColor: '#f9fafb', borderTopLeftRadius: 4, borderWidth: 1, borderColor: '#f3f4f6' },
  msgText: { fontSize: 14, lineHeight: 20, color: '#1f2937' },
  msgMeta: { flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end', marginTop: 4, gap: 2 },
  msgTime: { fontSize: 10, color: '#9ca3af' },
  inputBar: { flexDirection: 'row', alignItems: 'center', padding: 12, borderTopWidth: 1, borderTopColor: '#f3f4f6', backgroundColor: '#fff', gap: 8 },
  textInput: { flex: 1, backgroundColor: '#f9fafb', borderRadius: 16, paddingHorizontal: 16, paddingVertical: 10, fontSize: 14 },
  sendBtn: { backgroundColor: '#4f46e5', borderRadius: 12 },
});
