import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Alert, SafeAreaView, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import * as JournalStorage from '../../services/journalStorage';
import { SPACING } from '../../styles/theme';
import { getStreakMessage, updateReadingStreak } from '../../utils/streakUtils';

export default function Journal() {
  const { theme } = useTheme();
  const router = useRouter();
  const params = useLocalSearchParams();
  const { user } = useAuth();
  const [title, setTitle] = useState('');
  const [tags, setTags] = useState('');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const totalDuration = parseInt(params.totalDuration as string) || 0;
  const sessionsCount = parseInt(params.sessionsCount as string) || 1;
  
  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    
    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    return `${mins}m`;
  };
  
  const handleSubmit = async () => {
    if (!title.trim()) {
      Alert.alert('Missing Title', 'Please enter a book title.');
      return;
    }

    if (!user) {
      Alert.alert('Error', 'You must be signed in to create a journal entry.');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const journalEntry = {
        id: Date.now().toString(),
        title: title.trim(),
        author: '', // Can be added later via edit
        tags: tags.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0),
        notes: notes.trim(),
        duration: totalDuration,
        sessionsCount: sessionsCount,
        date: new Date().toISOString(),
        mood: undefined, // Can be added later via edit
      };
      
      // Save entry using JournalStorage service
      await JournalStorage.saveJournalEntry(journalEntry, user.id, user.provider === 'guest');
      
      // Update reading streak using the utility function
      const updatedStreak = await updateReadingStreak();
      const streakMessage = getStreakMessage(updatedStreak);
      
      // Show success message with streak info
      Alert.alert(
        'Great job! 🎉',
        `You've completed your reading session and saved your journal!\n\n${streakMessage}`,
        [
          {
            text: 'Go to Dashboard',
            onPress: () => router.push('/dashboard'),
          },
        ]
      );
    } catch (error) {
      console.error('Error saving journal entry:', error);
      Alert.alert('Error', 'Failed to save your journal entry. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  
  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background.dark }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: theme.colors.text.primary }]}>Reading Journal</Text>
      </View>
      
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.sessionSummary}>
          <Text style={[styles.summaryTitle, { color: theme.colors.text.primary }]}>
            Session Summary
          </Text>
          <Text style={[styles.summaryText, { color: theme.colors.text.secondary }]}>
            Duration: {formatDuration(totalDuration)}
          </Text>
          <Text style={[styles.summaryText, { color: theme.colors.text.secondary }]}>
            Sessions: {sessionsCount}
          </Text>
        </View>
        
        <View style={styles.form}>
          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: theme.colors.text.primary }]}>
              Title *
            </Text>
            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: theme.colors.background.card,
                  color: theme.colors.text.primary,
                  borderColor: theme.colors.divider,
                }
              ]}
              value={title}
              onChangeText={setTitle}
              placeholder="What did you read today?"
              placeholderTextColor={theme.colors.text.tertiary}
              maxLength={100}
            />
          </View>
          
          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: theme.colors.text.primary }]}>
              Tags
            </Text>
            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: theme.colors.background.card,
                  color: theme.colors.text.primary,
                  borderColor: theme.colors.divider,
                }
              ]}
              value={tags}
              onChangeText={setTags}
              placeholder="fiction, mystery, self-help (comma separated)"
              placeholderTextColor={theme.colors.text.tertiary}
            />
          </View>
          
          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: theme.colors.text.primary }]}>
              Notes
            </Text>
            <TextInput
              style={[
                styles.textArea,
                {
                  backgroundColor: theme.colors.background.card,
                  color: theme.colors.text.primary,
                  borderColor: theme.colors.divider,
                }
              ]}
              value={notes}
              onChangeText={setNotes}
              placeholder="How was your reading session? Any thoughts or reflections?"
              placeholderTextColor={theme.colors.text.tertiary}
              multiline
              numberOfLines={6}
              textAlignVertical="top"
            />
          </View>
        </View>
      </ScrollView>
      
      <View style={styles.footer}>
        <TouchableOpacity
          style={[
            styles.submitButton,
            { backgroundColor: theme.colors.primary },
            isSubmitting && { opacity: 0.6 }
          ]}
          onPress={handleSubmit}
          disabled={isSubmitting}
        >
          <Text style={[styles.submitButtonText, { color: '#FFFFFF' }]}>
            {isSubmitting ? 'Saving...' : 'Save Session'}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: SPACING.lg,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
  },
  content: {
    flex: 1,
    padding: SPACING.lg,
  },
  sessionSummary: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    padding: SPACING.lg,
    marginBottom: SPACING.xl,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: SPACING.sm,
  },
  summaryText: {
    fontSize: 14,
    marginBottom: SPACING.xs,
  },
  form: {
    flex: 1,
  },
  inputGroup: {
    marginBottom: SPACING.lg,
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: SPACING.sm,
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    padding: SPACING.md,
    fontSize: 16,
  },
  textArea: {
    borderWidth: 1,
    borderRadius: 8,
    padding: SPACING.md,
    fontSize: 16,
    minHeight: 120,
  },
  footer: {
    padding: SPACING.lg,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
  },
  submitButton: {
    borderRadius: 8,
    paddingVertical: SPACING.md,
    alignItems: 'center',
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
});
