import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import React, { useCallback, useState } from 'react';
import { FlatList, SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { SPACING } from '../../styles/theme';

interface JournalEntry {
  id: string;
  title: string;
  author?: string;
  tags: string[];
  notes: string;
  duration: number;
  sessionsCount: number;
  date: string;
  mood?: string;
}

export default function Notes() {
  const { theme } = useTheme();
  const router = useRouter();
  const params = useLocalSearchParams();
  const [notes, setNotes] = useState<JournalEntry[]>([]);
  const [bookData, setBookData] = useState<any>(null);
  
  const bookTitle = params.bookTitle as string;
  
  // Reload data when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      loadNotesForBook();
    }, [bookTitle])
  );

  const loadNotesForBook = async () => {
    try {
      const entriesData = await AsyncStorage.getItem('journalEntries');
      if (entriesData) {
        const entries: JournalEntry[] = JSON.parse(entriesData);
        const bookEntries = entries.filter(entry => 
          entry.title.toLowerCase() === bookTitle.toLowerCase()
        );
        
        if (bookEntries.length > 0) {
          const sortedNotes = bookEntries.sort((a, b) => 
            new Date(b.date).getTime() - new Date(a.date).getTime()
          );
          setNotes(sortedNotes);
          
          // Recalculate book data
          const totalDuration = bookEntries.reduce((sum, entry) => sum + entry.duration, 0);
          const allTags = [...new Set(bookEntries.flatMap(entry => entry.tags))];
          
          setBookData({
            title: bookTitle,
            author: bookEntries[0].author,
            entries: bookEntries,
            totalSessions: bookEntries.length,
            totalDuration,
            tags: allTags,
          });
        } else {
          // No entries found, go back to journals
          router.back();
        }
      }
    } catch (error) {
      console.error('Error loading notes:', error);
    }
  };

  const handleBack = useCallback(() => {
    router.back();
  }, [router]);

  const handleNotePress = useCallback((note: JournalEntry) => {
    router.push({
      pathname: '/(screens)/journal/NoteDetail',
      params: { 
        noteId: note.id,
        noteData: JSON.stringify(note)
      }
    });
  }, [router]);

  const formatDate = useCallback((dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    });
  }, []);

  const formatDuration = useCallback((seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    
    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    return `${mins}m`;
  }, []);

  const renderNoteItem = useCallback(({ item }: { item: JournalEntry }) => (
    <TouchableOpacity
      style={[styles.noteItem, { backgroundColor: theme.colors.background.card }]}
      onPress={() => handleNotePress(item)}
    >
      <View style={styles.noteHeader}>
        <View style={styles.noteInfo}>
          <Text style={[styles.noteDate, { color: theme.colors.text.primary }]}>
            {formatDate(item.date)}
          </Text>
          <Text style={[styles.noteDuration, { color: theme.colors.text.secondary }]}>
            {formatDuration(item.duration)}
          </Text>
        </View>
        {item.mood && (
          <Text style={styles.noteMood}>{item.mood}</Text>
        )}
      </View>
      
      <Text 
        style={[styles.noteContent, { color: theme.colors.text.secondary }]} 
        numberOfLines={3}
      >
        {item.notes}
      </Text>
      
      {item.tags.length > 0 && (
        <View style={styles.tagsContainer}>
          {item.tags.slice(0, 3).map((tag, index) => (
            <View key={index} style={[styles.tag, { backgroundColor: theme.colors.primary + '20' }]}>
              <Text style={[styles.tagText, { color: theme.colors.primary }]}>
                {tag}
              </Text>
            </View>
          ))}
          {item.tags.length > 3 && (
            <Text style={[styles.moreTagsText, { color: theme.colors.text.tertiary }]}>
              +{item.tags.length - 3} more
            </Text>
          )}
        </View>
      )}
      
      <View style={styles.chevron}>
        <Text style={[styles.chevronText, { color: theme.colors.text.tertiary }]}>›</Text>
      </View>
    </TouchableOpacity>
  ), [theme, handleNotePress, formatDate, formatDuration]);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background.dark }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBack} style={styles.backButton}>
          <Text style={[styles.backButtonText, { color: theme.colors.text.primary }]}>← Back</Text>
        </TouchableOpacity>
        <View style={styles.titleContainer}>
          <Text style={[styles.title, { color: theme.colors.text.primary }]}>
            {bookTitle}
          </Text>
          <Text style={[styles.subtitle, { color: theme.colors.text.secondary }]}>
            {notes.length} {notes.length === 1 ? 'entry' : 'entries'}
          </Text>
        </View>
      </View>

      {bookData && (
        <View style={[styles.bookSummary, { backgroundColor: theme.colors.background.card }]}>
          <Text style={[styles.summaryText, { color: theme.colors.text.secondary }]}>
            {bookData.totalSessions} sessions • {formatDuration(bookData.totalDuration)} total
          </Text>
        </View>
      )}

      <FlatList
        data={notes}
        renderItem={renderNoteItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
      />
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
  titleContainer: {
    flex: 1,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
  },
  subtitle: {
    fontSize: 14,
    marginTop: 2,
  },
  bookSummary: {
    padding: SPACING.lg,
    marginHorizontal: SPACING.lg,
    marginTop: SPACING.sm,
    borderRadius: 8,
  },
  summaryText: {
    fontSize: 14,
    textAlign: 'center',
  },
  listContainer: {
    padding: SPACING.lg,
  },
  noteItem: {
    padding: SPACING.lg,
    borderRadius: 12,
    marginBottom: SPACING.md,
    position: 'relative',
  },
  noteHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SPACING.sm,
  },
  noteInfo: {
    flex: 1,
  },
  noteDate: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  noteDuration: {
    fontSize: 12,
  },
  noteMood: {
    fontSize: 20,
    marginLeft: SPACING.sm,
  },
  noteContent: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: SPACING.sm,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  tag: {
    paddingHorizontal: SPACING.xs,
    paddingVertical: 2,
    borderRadius: 4,
    marginRight: SPACING.xs,
    marginBottom: SPACING.xs,
  },
  tagText: {
    fontSize: 10,
    fontWeight: '500',
  },
  moreTagsText: {
    fontSize: 10,
    marginLeft: SPACING.xs,
  },
  chevron: {
    position: 'absolute',
    right: SPACING.lg,
    top: '50%',
    transform: [{ translateY: -10 }],
  },
  chevronText: {
    fontSize: 20,
    fontWeight: '300',
  },
}); 