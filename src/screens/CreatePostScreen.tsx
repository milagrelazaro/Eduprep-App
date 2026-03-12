import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, TextInput, Image, ScrollView, TouchableOpacity, Alert, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button, IconButton, Avatar } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { useFeedStore } from '../store/feedStore';
import { useAuthStore } from '../store/authStore';
import * as ImagePicker from 'expo-image-picker';

export default function CreatePostScreen() {
  const navigation = useNavigation();
  const { user } = useAuthStore();
  const { createPost } = useFeedStore();
  const [content, setContent] = useState('');
  const [image, setImage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const pickImage = async () => {
    if (Platform.OS === 'web') {
      if (fileInputRef.current) {
        fileInputRef.current.click();
      }
      return;
    }

    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (permissionResult.granted === false) {
      Alert.alert('Permissão Negada', 'É necessário permitir acesso à galeria de fotos.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [16, 9],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      setImage(result.assets[0].uri);
    }
  };

  const handleWebImageChange = (event: any) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        Alert.alert('Erro', 'A imagem não pode ter mais de 5MB.');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const takePhoto = async () => {
    if (Platform.OS === 'web') {
      Alert.alert('Não Disponível', 'A câmera não está disponível na versão web. Use "Escolher da Galeria".');
      return;
    }

    const permissionResult = await ImagePicker.requestCameraPermissionsAsync();
    
    if (permissionResult.granted === false) {
      Alert.alert('Permissão Negada', 'É necessário permitir acesso à câmera.');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [16, 9],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      setImage(result.assets[0].uri);
    }
  };

  const handleSubmit = async () => {
    if (!content.trim() && !image) {
      Alert.alert('Erro', 'Por favor, adicione texto ou uma imagem à sua publicação.');
      return;
    }

    if (!user) return;

    setIsSubmitting(true);

    try {
      await createPost({
        userId: user.id,
        userName: user.name,
        userAvatar: user.avatar,
        userRole: user.role,
        content: content.trim(),
        image: image || undefined,
        type: 'news',
      });

      navigation.goBack();
      
      setTimeout(() => {
        Alert.alert('✅ Sucesso', 'Publicação criada com sucesso!');
      }, 300);
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível criar a publicação. Tente novamente.');
      setIsSubmitting(false);
    }
  };

  const showImageOptions = () => {
    if (Platform.OS === 'web') {
      pickImage();
      return;
    }

    Alert.alert(
      'Adicionar Imagem',
      'Escolha uma opção',
      [
        { text: 'Tirar Foto', onPress: takePhoto },
        { text: 'Escolher da Galeria', onPress: pickImage },
        { text: 'Cancelar', style: 'cancel' },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <IconButton icon="close" size={24} onPress={() => navigation.goBack()} />
        <Text style={styles.headerTitle}>Nova Publicação</Text>
        <Button
          mode="contained"
          onPress={handleSubmit}
          loading={isSubmitting}
          disabled={isSubmitting || (!content.trim() && !image)}
          style={styles.publishButton}
          labelStyle={styles.publishButtonText}
        >
          Publicar
        </Button>
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.userInfo}>
          <Avatar.Image
            size={48}
            source={{ uri: user?.avatar || 'https://ui-avatars.com/api/?name=User' }}
          />
          <View style={styles.userDetails}>
            <Text style={styles.userName}>{user?.name}</Text>
            <Text style={styles.userRole}>
              {user?.role === 'admin' ? 'Administrador' : 
               user?.role === 'tutor' ? 'Explicador' : 'Estudante'}
            </Text>
          </View>
        </View>

        <TextInput
          style={styles.textInput}
          placeholder="O que você quer compartilhar?"
          placeholderTextColor="#9ca3af"
          multiline
          value={content}
          onChangeText={setContent}
          autoFocus
        />

        {image && (
          <View style={styles.imageContainer}>
            <Image source={{ uri: image }} style={styles.image} resizeMode="cover" />
            <IconButton
              icon="close-circle"
              size={32}
              iconColor="#fff"
              style={styles.removeImageButton}
              onPress={() => setImage(null)}
            />
          </View>
        )}

        <View style={styles.actions}>
          <TouchableOpacity style={styles.actionItem} onPress={showImageOptions}>
            <IconButton icon="image" iconColor="#4f46e5" size={24} />
            <Text style={styles.actionText}>Foto/Vídeo</Text>
          </TouchableOpacity>
        </View>

        {Platform.OS === 'web' && (
          <input
            ref={fileInputRef as any}
            type="file"
            accept="image/*"
            style={{ display: 'none' }}
            onChange={handleWebImageChange}
          />
        )}

        <View style={styles.tips}>
          <Text style={styles.tipsTitle}>💡 Dicas para uma boa publicação:</Text>
          <Text style={styles.tipText}>• Seja claro e objetivo</Text>
          <Text style={styles.tipText}>• Compartilhe conquistas e experiências</Text>
          <Text style={styles.tipText}>• Ajude outros estudantes com dicas úteis</Text>
          <Text style={styles.tipText}>• Use imagens para ilustrar melhor</Text>
        </View>
      </ScrollView>
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
    flex: 1,
    textAlign: 'center',
  },
  publishButton: {
    borderRadius: 20,
  },
  publishButtonText: {
    fontSize: 14,
  },
  content: {
    flex: 1,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  userDetails: {
    marginLeft: 12,
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
  },
  userRole: {
    fontSize: 13,
    color: '#6b7280',
    marginTop: 2,
  },
  textInput: {
    fontSize: 16,
    color: '#1f2937',
    paddingHorizontal: 16,
    paddingVertical: 12,
    minHeight: 150,
    textAlignVertical: 'top',
  },
  imageContainer: {
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 12,
    overflow: 'hidden',
    position: 'relative',
  },
  image: {
    width: '100%',
    height: 250,
  },
  removeImageButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  actions: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    marginTop: 16,
  },
  actionItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionText: {
    fontSize: 15,
    color: '#4f46e5',
    fontWeight: '500',
    marginLeft: -8,
  },
  tips: {
    margin: 16,
    padding: 16,
    backgroundColor: '#f0fdf4',
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#10b981',
  },
  tipsTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#065f46',
    marginBottom: 8,
  },
  tipText: {
    fontSize: 13,
    color: '#047857',
    marginBottom: 4,
  },
});
