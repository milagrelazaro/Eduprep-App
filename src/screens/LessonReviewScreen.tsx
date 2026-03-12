import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import { Text, Button, TextInput, Card, IconButton } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuthStore } from '../store/authStore';
import { Lesson } from '../types';

export default function LessonReviewScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { lesson } = route.params as { lesson: Lesson };
  const { user } = useAuthStore();
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (rating === 0) {
      Alert.alert('Erro', 'Por favor, selecione uma avaliação.');
      return;
    }

    setIsSubmitting(true);

    try {
      const review = {
        id: Date.now().toString(),
        lessonId: lesson.id,
        rating,
        comment: comment.trim(),
        createdAt: new Date().toISOString(),
      };

      // Update lesson with review
      const savedLessons = await AsyncStorage.getItem('eduprep_lessons');
      const lessons = savedLessons ? JSON.parse(savedLessons) : [];
      const updatedLessons = lessons.map((l: Lesson) =>
        l.id === lesson.id ? { ...l, review } : l
      );
      await AsyncStorage.setItem('eduprep_lessons', JSON.stringify(updatedLessons));

      // Update tutor rating
      const savedTutors = await AsyncStorage.getItem('eduprep_all_tutors');
      if (savedTutors) {
        const tutors = JSON.parse(savedTutors);
        const tutorIndex = tutors.findIndex((t: any) => t.id === lesson.tutorId);
        if (tutorIndex !== -1) {
          const tutor = tutors[tutorIndex];
          const currentRating = parseFloat(tutor.rating || '0');
          const reviewCount = tutor.reviews || 0;
          const newRating = ((currentRating * reviewCount) + rating) / (reviewCount + 1);
          
          tutors[tutorIndex] = {
            ...tutor,
            rating: newRating.toFixed(1),
            reviews: reviewCount + 1,
          };
          
          await AsyncStorage.setItem('eduprep_all_tutors', JSON.stringify(tutors));
        }
      }

      Alert.alert(
        '✅ Avaliação Enviada',
        'Obrigado pelo seu feedback!',
        [{ text: 'OK', onPress: () => navigation.goBack() }]
      );
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível enviar a avaliação. Tente novamente.');
      setIsSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <View style={styles.headerTop}>
            <IconButton 
              icon="arrow-left" 
              onPress={() => navigation.goBack()} 
              style={styles.backButton}
            />
            <Text variant="headlineSmall" style={styles.title}>
              Avaliar Aula
            </Text>
            <View style={styles.placeholder} />
          </View>
          <Text style={styles.subtitle}>
            Como foi sua experiência com {lesson.tutorName}?
          </Text>
        </View>

        <Card style={styles.card}>
          <Card.Content>
            <Text variant="titleMedium" style={styles.sectionTitle}>
              ⭐ Avaliação
            </Text>
            <View style={styles.ratingContainer}>
              {[1, 2, 3, 4, 5].map((star) => (
                <Button
                  key={star}
                  mode={rating >= star ? 'contained' : 'outlined'}
                  onPress={() => setRating(star)}
                  style={[
                    styles.starButton,
                    rating >= star && { backgroundColor: '#f59e0b' },
                  ]}
                  labelStyle={[
                    styles.starLabel,
                    rating >= star && { color: '#fff' },
                  ]}
                >
                  ★
                </Button>
              ))}
            </View>
            <Text style={styles.ratingText}>
              {rating === 0 && 'Selecione uma avaliação'}
              {rating === 1 && 'Muito Ruim'}
              {rating === 2 && 'Ruim'}
              {rating === 3 && 'Regular'}
              {rating === 4 && 'Bom'}
              {rating === 5 && 'Excelente'}
            </Text>
          </Card.Content>
        </Card>

        <Card style={styles.card}>
          <Card.Content>
            <Text variant="titleMedium" style={styles.sectionTitle}>
              💬 Comentário (Opcional)
            </Text>
            <TextInput
              mode="outlined"
              placeholder="Compartilhe sua experiência com outros estudantes..."
              value={comment}
              onChangeText={setComment}
              multiline
              numberOfLines={6}
              style={styles.textArea}
            />
          </Card.Content>
        </Card>

        <Card style={styles.infoCard}>
          <Card.Content>
            <Text style={styles.infoText}>
              💡 Sua avaliação ajuda outros estudantes a escolherem os melhores tutores
              e contribui para melhorar a qualidade do ensino na plataforma.
            </Text>
          </Card.Content>
        </Card>

        <View style={styles.actions}>
          <Button
            mode="outlined"
            onPress={() => navigation.goBack()}
            disabled={isSubmitting}
            style={styles.cancelButton}
          >
            Cancelar
          </Button>
          <Button
            mode="contained"
            onPress={handleSubmit}
            loading={isSubmitting}
            disabled={isSubmitting || rating === 0}
            style={styles.submitButton}
          >
            Enviar Avaliação
          </Button>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  content: {
    padding: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 24,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    width: '100%',
  },
  backButton: {
    margin: 0,
  },
  placeholder: {
    width: 48, // Same width as back button for centering
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 8,
    flex: 1,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
  },
  card: {
    marginBottom: 16,
    borderRadius: 12,
  },
  sectionTitle: {
    fontWeight: '600',
    color: '#111827',
    marginBottom: 16,
  },
  ratingContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12,
    marginBottom: 12,
  },
  starButton: {
    minWidth: 50,
    borderRadius: 8,
  },
  starLabel: {
    fontSize: 24,
    color: '#f59e0b',
  },
  ratingText: {
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '600',
    color: '#4f46e5',
  },
  textArea: {
    backgroundColor: '#fff',
    minHeight: 120,
  },
  infoCard: {
    backgroundColor: '#eff6ff',
    borderRadius: 12,
    marginBottom: 24,
  },
  infoText: {
    fontSize: 13,
    color: '#1e40af',
    lineHeight: 20,
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    borderRadius: 12,
  },
  submitButton: {
    flex: 2,
    borderRadius: 12,
    backgroundColor: '#4f46e5',
  },
});
