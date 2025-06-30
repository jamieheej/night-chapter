import { useFocusEffect, useRouter } from 'expo-router';
import React, { useCallback, useState } from 'react';
import { FlatList, Image, SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import * as JournalStorage from '../../services/journalStorage';
import { SPACING } from '../../styles/theme';
import { JournalEntry } from '../../types';

interface BookGroup {
  title: string;
  author?: string;
  thumbnail?: string;
  entries: JournalEntry[];
  totalSessions: number;
  totalDuration: number;
  tags: string[];
}

export default function Journals() {
  const { theme } = useTheme();
  const router = useRouter();
  const { user } = useAuth();
  const [bookGroups, setBookGroups] = useState<BookGroup[]>([]);
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      loadEntries();
    }, [user])
  );

  const loadEntries = async () => {
    try {
      setLoading(true);
      if (!user) return;

      const entries = await JournalStorage.loadJournalEntries(user.id, user.provider === 'guest');
      const grouped = groupEntriesByBook(entries);
      setBookGroups(grouped);
    } catch (error) {
      console.error('Error loading journal entries:', error);
      setBookGroups([]);
    } finally {
      setLoading(false);
    }
  };

  const groupEntriesByBook = (entries: JournalEntry[]): BookGroup[] => {
    const groups: { [key: string]: BookGroup } = {};

    // Filter out deleted entries before grouping
    entries.filter(entry => !entry.deleted).forEach(entry => {
      const key = entry.title.toLowerCase();
      if (!groups[key]) {
        groups[key] = {
          title: entry.title,
          author: entry.author,
          thumbnail: entry.thumbnail,
          entries: [],
          totalSessions: 0,
          totalDuration: 0,
          tags: [],
        };
      }

      groups[key].entries.push(entry);
      groups[key].totalSessions += entry.sessionsCount || 1;
      groups[key].totalDuration += entry.duration;
      
      // Merge tags
      entry.tags.forEach(tag => {
        if (!groups[key].tags.includes(tag)) {
          groups[key].tags.push(tag);
        }
      });
    });

    return Object.values(groups).sort((a, b) => 
      new Date(b.entries[0].date).getTime() - new Date(a.entries[0].date).getTime()
    );
  };

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    
    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    return `${mins}m`;
  };

  const handleBookPress = (book: BookGroup) => {
    router.push({
      pathname: '/(screens)/journal/Notes',
      params: { 
        bookTitle: book.title,
        bookData: JSON.stringify(book)
      }
    });
  };

  const handleAddJournal = () => {
    router.push('/(screens)/journal/CreateJournal');
  };

  const handleBack = () => {
    router.back();
  };

  const renderBookItem = ({ item }: { item: BookGroup }) => (
    <TouchableOpacity
      style={[styles.bookItem, { backgroundColor: theme.colors.background.card }]}
      onPress={() => handleBookPress(item)}
    >
      <View style={styles.bookThumbnail}>
        {item.thumbnail ? (
          <Image source={{ uri: item.thumbnail }} style={styles.thumbnailImage} />
        ) : (
          <View style={[styles.placeholderThumbnail, { backgroundColor: theme.colors.primary }]}>
            <Text style={styles.placeholderText}>📚</Text>
          </View>
        )}
      </View>
      
      <View style={styles.bookInfo}>
        <Text style={[styles.bookTitle, { color: theme.colors.text.primary }]} numberOfLines={2}>
          {item.title}
        </Text>
        {item.author && (
          <Text style={[styles.bookAuthor, { color: theme.colors.text.secondary }]} numberOfLines={1}>
            by {item.author}
          </Text>
        )}
        
        <View style={styles.bookStats}>
          <Text style={[styles.statText, { color: theme.colors.text.tertiary }]}>
            {item.entries.length} notes • {formatDuration(item.totalDuration)}
          </Text>
        </View>
        
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
                +{item.tags.length - 3}
              </Text>
            )}
          </View>
        )}
      </View>
      
      <View style={styles.chevron}>
        <Text style={[styles.chevronText, { color: theme.colors.text.tertiary }]}>›</Text>
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background.dark }]}>
        <View style={styles.loadingContainer}>
          <Text style={[styles.loadingText, { color: theme.colors.text.primary }]}>
            Loading your journals...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background.dark }]}>
      <View style={styles.titleContainer}>
        <View style={styles.headerRow}>
          <TouchableOpacity onPress={handleBack} style={styles.backButton}>
            <Text style={[styles.backButtonText, { color: theme.colors.text.primary }]}>← Back</Text>
          </TouchableOpacity>
          <Text style={[styles.title, { color: theme.colors.text.primary }]}>Reading Journal</Text>
        </View>
      </View>

      {bookGroups.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={[styles.emptyTitle, { color: theme.colors.text.primary }]}>
            No Reading Journals Yet
          </Text>
          <Text style={[styles.emptyDescription, { color: theme.colors.text.secondary }]}>
            Start your first reading session to create journal entries
          </Text>
        </View>
      ) : (
        <FlatList
          data={bookGroups}
          renderItem={renderBookItem}
          keyExtractor={(item) => item.title}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
        />
      )}

      {/* Floating Add Button */}
      <TouchableOpacity
        style={[styles.floatingButton, { backgroundColor: theme.colors.primary }]}
        onPress={handleAddJournal}
      >
        <Text style={styles.floatingButtonText}>+</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  titleContainer: {
    padding: SPACING.lg,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
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
  listContainer: {
    padding: SPACING.lg,
  },
  bookItem: {
    flexDirection: 'row',
    padding: SPACING.lg,
    borderRadius: 12,
    marginBottom: SPACING.md,
    alignItems: 'flex-start',
  },
  bookThumbnail: {
    marginRight: SPACING.md,
  },
  thumbnailImage: {
    width: 60,
    height: 80,
    borderRadius: 8,
  },
  placeholderThumbnail: {
    width: 60,
    height: 80,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    fontSize: 24,
  },
  bookInfo: {
    flex: 1,
    marginRight: SPACING.sm,
  },
  bookTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: SPACING.xs,
  },
  bookAuthor: {
    fontSize: 14,
    marginBottom: SPACING.sm,
  },
  bookStats: {
    marginBottom: SPACING.sm,
  },
  statText: {
    fontSize: 12,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
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
    justifyContent: 'center',
  },
  chevronText: {
    fontSize: 20,
    fontWeight: '300',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.xl,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: SPACING.sm,
    textAlign: 'center',
  },
  emptyDescription: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
  },
  floatingButton: {
    position: 'absolute',
    bottom: SPACING.xl,
    right: SPACING.xl,
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  floatingButtonText: {
    fontSize: 24,
    fontWeight: '300',
    color: '#FFFFFF',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
  },
}); 