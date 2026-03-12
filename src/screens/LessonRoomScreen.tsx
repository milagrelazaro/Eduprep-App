import React, { useState } from 'react';
import { View, StyleSheet, Image, TextInput, Alert } from 'react-native';
import { Text, IconButton } from 'react-native-paper';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import AsyncStorage from '@react-native-async-storage/async-storage';

type Nav = NativeStackNavigationProp<RootStackParamList, 'LessonRoom'>;
type RouteType = RouteProp<RootStackParamList, 'LessonRoom'>;

export default function LessonRoomScreen() {
  const navigation = useNavigation<Nav>();
  const route = useRoute<RouteType>();
  const [micOn, setMicOn] = useState(true);
  const [videoOn, setVideoOn] = useState(true);
  const [message, setMessage] = useState('');

  const endLessonAndReleasePayment = async () => {
    Alert.alert(
      'Finalizar Aula',
      'Tem certeza que deseja finalizar a aula? O pagamento será liberado para o tutor.',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Finalizar',
          onPress: async () => {
            // Liberar pagamento do escrow
            const saved = await AsyncStorage.getItem('eduprep_payments');
            if (saved) {
              const payments = JSON.parse(saved);
              const updated = payments.map((p: any) => {
                if (p.lessonId === route.params?.id && p.status === 'escrow') {
                  return {
                    ...p,
                    status: 'completed',
                    escrowReleaseDate: new Date().toLocaleDateString(),
                  };
                }
                return p;
              });
              await AsyncStorage.setItem('eduprep_payments', JSON.stringify(updated));
            }
            
            Alert.alert('Sucesso', 'Aula finalizada! O pagamento foi liberado para o tutor.');
            navigation.goBack();
          },
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      {/* Video Area */}
      <View style={styles.videoArea}>
        <View style={styles.mainVideo}>
          <View style={styles.whiteboardOverlay}>
            <IconButton icon="presentation" iconColor="rgba(255,255,255,0.5)" size={48} />
            <Text style={styles.whiteboardTitle}>Quadro Branco</Text>
            <Text style={styles.whiteboardSub}>O Professor Silva está a partilhar o quadro.</Text>
          </View>
          {/* Small user video */}
          <View style={styles.smallVideo}>
            <Image source={{ uri: 'https://ui-avatars.com/api/?name=Tu&background=4f46e5&color=fff' }} style={styles.smallVideoImg} />
            <View style={styles.smallVideoLabel}>
              <Text style={{ color: '#fff', fontSize: 9, fontWeight: '700' }}>Tu</Text>
            </View>
          </View>
        </View>

        {/* Controls */}
        <View style={styles.controls}>
          <View style={{ flexDirection: 'row', gap: 8 }}>
            <IconButton
              icon={micOn ? 'microphone' : 'microphone-off'}
              iconColor="#fff"
              size={24}
              style={[styles.controlBtn, !micOn && styles.controlBtnOff]}
              onPress={() => setMicOn(!micOn)}
            />
            <IconButton
              icon={videoOn ? 'video' : 'video-off'}
              iconColor="#fff"
              size={24}
              style={[styles.controlBtn, !videoOn && styles.controlBtnOff]}
              onPress={() => setVideoOn(!videoOn)}
            />
          </View>
          <View style={{ flexDirection: 'row', gap: 8 }}>
            <IconButton icon="account-group" iconColor="#fff" size={24} style={styles.controlBtn} />
            <View style={styles.handBtn}>
              <Text style={{ color: '#fff', fontWeight: '700', fontSize: 13 }}>Levantar Mão</Text>
            </View>
          </View>
          <IconButton
            icon="close-circle"
            iconColor="#fff"
            size={24}
            style={[styles.controlBtn, { backgroundColor: '#ef4444' }]}
            onPress={endLessonAndReleasePayment}
          />
        </View>
      </View>

      {/* Chat Sidebar */}
      <View style={styles.chatPanel}>
        <View style={styles.chatHeader}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <IconButton icon="message-text" iconColor="#4f46e5" size={20} style={{ margin: 0 }} />
            <Text style={{ fontWeight: '700' }}>Chat da Aula</Text>
          </View>
          <View style={styles.activeBadge}>
            <Text style={{ fontSize: 9, fontWeight: '700', color: '#10b981' }}>Ativo</Text>
          </View>
        </View>

        <View style={styles.chatMessages}>
          <View style={styles.msgBubbleOther}>
            <Text style={{ fontSize: 11, fontWeight: '700', color: '#9ca3af', marginBottom: 2 }}>Prof. Silva</Text>
            <Text style={{ fontSize: 13 }}>Olá João! Consegues ver bem o quadro?</Text>
          </View>
          <View style={styles.msgBubbleSelf}>
            <Text style={{ fontSize: 13, color: '#fff' }}>Sim professor, está perfeito. Podemos rever a parte da derivada?</Text>
          </View>
        </View>

        <View style={styles.chatInput}>
          <TextInput
            placeholder="Escrever mensagem..."
            value={message}
            onChangeText={setMessage}
            style={styles.chatTextInput}
          />
          <IconButton icon="send" iconColor="#fff" size={18} style={styles.sendBtn} />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#111827' },
  videoArea: { flex: 1, padding: 12 },
  mainVideo: { flex: 1, backgroundColor: '#000', borderRadius: 20, overflow: 'hidden', justifyContent: 'center', alignItems: 'center' },
  whiteboardOverlay: { alignItems: 'center', padding: 24 },
  whiteboardTitle: { color: '#fff', fontSize: 20, fontWeight: '700', marginTop: 8 },
  whiteboardSub: { color: 'rgba(255,255,255,0.6)', fontSize: 13, marginTop: 4 },
  smallVideo: { position: 'absolute', bottom: 16, right: 16, width: 100, height: 70, borderRadius: 12, overflow: 'hidden', borderWidth: 2, borderColor: 'rgba(255,255,255,0.2)' },
  smallVideoImg: { width: '100%', height: '100%' },
  smallVideoLabel: { position: 'absolute', bottom: 4, left: 4, backgroundColor: 'rgba(0,0,0,0.5)', paddingHorizontal: 6, paddingVertical: 1, borderRadius: 4 },
  controls: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#1f2937', borderRadius: 20, padding: 8, marginTop: 12 },
  controlBtn: { backgroundColor: '#374151', borderRadius: 16 },
  controlBtnOff: { backgroundColor: '#ef4444' },
  handBtn: { backgroundColor: '#4f46e5', borderRadius: 16, paddingHorizontal: 20, justifyContent: 'center', height: 44 },
  chatPanel: { height: 280, backgroundColor: '#fff', borderTopLeftRadius: 24, borderTopRightRadius: 24 },
  chatHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, borderBottomWidth: 1, borderBottomColor: '#f3f4f6' },
  activeBadge: { backgroundColor: '#ecfdf5', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 10 },
  chatMessages: { flex: 1, padding: 12, gap: 8 },
  msgBubbleOther: { backgroundColor: '#f9fafb', padding: 12, borderRadius: 16, borderTopLeftRadius: 4, maxWidth: '80%' },
  msgBubbleSelf: { backgroundColor: '#4f46e5', padding: 12, borderRadius: 16, borderTopRightRadius: 4, maxWidth: '80%', alignSelf: 'flex-end' },
  chatInput: { flexDirection: 'row', alignItems: 'center', padding: 12, borderTopWidth: 1, borderTopColor: '#f3f4f6', gap: 8 },
  chatTextInput: { flex: 1, backgroundColor: '#f9fafb', borderRadius: 16, paddingHorizontal: 16, paddingVertical: 10, fontSize: 13 },
  sendBtn: { backgroundColor: '#4f46e5', borderRadius: 12 },
});
