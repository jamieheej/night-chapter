import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Alert, SafeAreaView, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import * as JournalStorage from '../../services/journalStorage';
import { SPACING } from '../../styles/theme';
import { JournalEntry } from '../../types';

const MOOD_OPTIONS = ['😊', '😌', '🤔', '😴', '📚', '💭', '✨', '🔥'];

export default function CreateJournal() {
  const { theme } = useTheme();
  const router = useRouter();
  const { user } = useAuth();
  const [bookTitle, setBookTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [content, setContent] = useState('');
  const [tags, setTags] = useState('');
  const [selectedMood, setSelectedMood] = useState('');
  const [sessionTime, setSessionTime] = useState('30');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleBack = () => {
    router.back();
  };

  const handleSubmit = async () => {
    if (!bookTitle.trim()) {
      Alert.alert('Missing Title', 'Please enter a book title.');
      return;
    }

    if (!content.trim()) {
      Alert.alert('Missing Content', 'Please add some notes about your reading session.');
      return;
    }

    if (!user) {
      Alert.alert('Error', 'You must be signed in to create a journal entry.');
      return;
    }

    setIsSubmitting(true);

    try {
      const journalEntry: JournalEntry = {
        id: Date.now().toString(),
        title: bookTitle.trim(),
        author: author.trim() || undefined,
        tags: tags.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0),
        notes: content.trim(),
        duration: parseInt(sessionTime) * 60, // Convert minutes to seconds
        sessionsCount: 1,
        date: new Date().toISOString(),
        mood: selectedMood || undefined,
      };

      await JournalStorage.saveJournalEntry(journalEntry, user.id, user.provider === 'guest');

      Alert.alert(
        'Journal Saved!',
        'Your reading journal entry has been saved successfully.',
        [
          {
            text: 'OK',
            onPress: () => router.back(),
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
        <TouchableOpacity onPress={handleBack} style={styles.backButton}>
          <Text style={[styles.backButtonText, { color: theme.colors.text.primary }]}>← Back</Text>
        </TouchableOpacity>
        <Text style={[styles.title, { color: theme.colors.text.primary }]}>New Journal Entry</Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.form}>
          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: theme.colors.text.primary }]}>
              Book Title *
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
              value={bookTitle}
              onChangeText={setBookTitle}
              placeholder="What book are you reading?"
              placeholderTextColor={theme.colors.text.tertiary}
              maxLength={100}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: theme.colors.text.primary }]}>
              Author
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
              value={author}
              onChangeText={setAuthor}
              placeholder="Author name"
              placeholderTextColor={theme.colors.text.tertiary}
              maxLength={100}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: theme.colors.text.primary }]}>
              Session Time (minutes)
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
              value={sessionTime}
              onChangeText={setSessionTime}
              placeholder="30"
              placeholderTextColor={theme.colors.text.tertiary}
              keyboardType="numeric"
              maxLength={3}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: theme.colors.text.primary }]}>
              Mood
            </Text>
            <View style={styles.moodContainer}>
              {MOOD_OPTIONS.map((mood, index) => (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.moodButton,
                    selectedMood === mood && { backgroundColor: theme.colors.primary + '30' }
                  ]}
                  onPress={() => setSelectedMood(selectedMood === mood ? '' : mood)}
                >
                  <Text style={styles.moodEmoji}>{mood}</Text>
                </TouchableOpacity>
              ))}
            </View>
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
              Notes *
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
              value={content}
              onChangeText={setContent}
              placeholder="How was your reading session? Any thoughts, insights, or reflections?"
              placeholderTextColor={theme.colors.text.tertiary}
              multiline
              numberOfLines={8}
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
            {isSubmitting ? 'Saving...' : 'Save Journal Entry'}
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
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.lg,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  backButton: {
    marginRight: SPACING.md,
  },
  backButtonText: {
    fontSize: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
  },
  content: {
    flex: 1,
    padding: SPACING.lg,
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
  moodContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  moodButton: {
    padding: SPACING.sm,
    borderRadius: 8,
    marginRight: SPACING.sm,
    marginBottom: SPACING.sm,
  },
  moodEmoji: {
    fontSize: 24,
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