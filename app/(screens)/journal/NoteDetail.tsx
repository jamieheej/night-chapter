import { useFocusEffect, useLocalSearchParams, useRouter } from "expo-router";
import React, { useCallback, useState } from "react";
import {
  Alert,
  SafeAreaView,
  ScrollView,
  Share,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useAuth } from "../../context/AuthContext";
import { useTheme } from "../../context/ThemeContext";
import * as JournalStorage from "../../services/journalStorage";
import { SPACING } from "../../styles/theme";
import { JournalEntry } from "../../types";

export default function NoteDetail() {
  const { theme } = useTheme();
  const router = useRouter();
  const params = useLocalSearchParams();
  const { user } = useAuth();
  const [isDeleting, setIsDeleting] = useState(false);
  const [noteData, setNoteData] = useState<JournalEntry | null>(null);

  // Reload note data when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      if (params.noteData) {
        // Initialize with data from params first
        setNoteData(JSON.parse(params.noteData as string));
      }
      loadNoteData();
    }, [params.noteId, params.noteData])
  );

  const loadNoteData = async () => {
    try {
      if (!user) return;

      const entries = await JournalStorage.loadJournalEntries(user.id, user.provider === 'guest');
      const updatedNote = entries.find((entry) => entry.id === params.noteId);
      
      if (updatedNote) {
        setNoteData(updatedNote);
      } else if (!params.noteData) {
        // Only go back if we don't have initial data from params
        router.back();
      }
    } catch (error) {
      console.error("Error loading note data:", error);
    }
  };

  const handleBack = () => {
    router.back();
  };

  const handleEdit = () => {
    router.push({
      pathname: "/(screens)/journal/EditNote",
      params: {
        noteId: noteData?.id,
        noteData: JSON.stringify(noteData),
      },
    });
  };

  const handleShare = async () => {
    try {
      if (!noteData) return;

      const shareContent = `📚 Reading Journal Entry

Book: ${noteData.title}${noteData.author ? `\nAuthor: ${noteData.author}` : ""}
Date: ${formatDate(noteData.date)}
Reading Time: ${formatDuration(noteData.duration)}${
        noteData.mood ? `\nMood: ${noteData.mood}` : ""
      }

Notes:
${noteData.notes}${
        noteData.tags.length > 0 ? `\n\nTags: ${noteData.tags.join(", ")}` : ""
      }

Shared from NightChapter`;

      await Share.share({
        message: shareContent,
        title: `Reading Notes: ${noteData.title}`,
      });
    } catch (error) {
      console.error("Error sharing note:", error);
    }
  };

  const handleDelete = () => {
    if (!noteData) return;

    Alert.alert(
      "Delete Note",
      "Are you sure you want to delete this journal entry? This action cannot be undone.",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Delete",
          style: "destructive",
          onPress: confirmDelete,
        },
      ]
    );
  };

  const confirmDelete = async () => {
    if (!user || !noteData) return;
    
    setIsDeleting(true);

    try {
      await JournalStorage.deleteJournalEntry(noteData.id, user.id, user.provider === 'guest');

      Alert.alert(
        "Note Deleted",
        "Your journal entry has been deleted successfully.",
        [
          {
            text: "OK",
            onPress: () => {
              router.back();
            },
          },
        ]
      );
    } catch (error) {
      console.error("Error deleting journal entry:", error);
      Alert.alert(
        "Error",
        "Failed to delete the journal entry. Please try again."
      );
    } finally {
      setIsDeleting(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);

    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    return `${mins}m`;
  };

  if (!noteData) {
    return (
      <SafeAreaView
        style={[
          styles.container,
          { backgroundColor: theme.colors.background.dark },
        ]}
      >
        <View style={styles.titleContainer}>
          <View style={styles.titleRow}>
            <TouchableOpacity onPress={handleBack} style={styles.backButton}>
              <Text
                style={[
                  styles.backButtonText,
                  { color: theme.colors.text.primary },
                ]}
              >
                ← Back
              </Text>
            </TouchableOpacity>
            <View style={styles.headerActions}>
              <TouchableOpacity onPress={handleShare} style={styles.actionButton}>
                <Text
                  style={[
                    styles.actionButtonText,
                    { color: theme.colors.text.primary },
                  ]}
                >
                  Share
                </Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={handleEdit} style={styles.actionButton}>
                <Text
                  style={[
                    styles.actionButtonText,
                    { color: theme.colors.text.primary },
                  ]}
                >
                  Edit
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
        <View style={[styles.content, styles.loadingContainer]}>
          <Text style={[styles.loadingText, { color: theme.colors.text.primary }]}>
            Loading note...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView
      style={[
        styles.container,
        { backgroundColor: theme.colors.background.dark },
      ]}
    >
      <View style={styles.titleContainer}>
        <View style={styles.titleRow}>
          <TouchableOpacity onPress={handleBack} style={styles.backButton}>
            <Text
              style={[
                styles.backButtonText,
                { color: theme.colors.text.primary },
              ]}
            >
              ← Back
            </Text>
          </TouchableOpacity>
          <View style={styles.headerActions}>
            <TouchableOpacity onPress={handleShare} style={styles.actionButton}>
              <Text
                style={[
                  styles.actionButtonText,
                  { color: theme.colors.text.primary },
                ]}
              >
                Share
              </Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={handleEdit} style={styles.actionButton}>
              <Text
                style={[
                  styles.actionButtonText,
                  { color: theme.colors.text.primary },
                ]}
              >
                Edit
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View
          style={[
            styles.noteCard,
            { backgroundColor: theme.colors.background.card },
          ]}
        >
          <View style={styles.noteHeader}>
            <View style={styles.bookInfo}>
              <Text
                style={[styles.bookTitle, { color: theme.colors.text.primary }]}
              >
                {noteData.title}
              </Text>
              {noteData.author && (
                <Text
                  style={[
                    styles.bookAuthor,
                    { color: theme.colors.text.secondary },
                  ]}
                >
                  by {noteData.author}
                </Text>
              )}
            </View>
            {noteData.mood && <Text style={styles.mood}>{noteData.mood}</Text>}
          </View>

          <View style={styles.metadata}>
            <Text style={[styles.date, { color: theme.colors.text.secondary }]}>
              {formatDate(noteData.date)}
            </Text>
            <Text
              style={[styles.duration, { color: theme.colors.text.secondary }]}
            >
              Reading time: {formatDuration(noteData.duration)}
            </Text>
          </View>

          {noteData.tags.length > 0 && (
            <View style={styles.tagsContainer}>
              {noteData.tags.map((tag, index) => (
                <View
                  key={index}
                  style={[
                    styles.tag,
                    { backgroundColor: theme.colors.primary + "20" },
                  ]}
                >
                  <Text
                    style={[styles.tagText, { color: theme.colors.primary }]}
                  >
                    {tag}
                  </Text>
                </View>
              ))}
            </View>
          )}

          <View style={styles.notesSection}>
            <Text
              style={[styles.notesLabel, { color: theme.colors.text.primary }]}
            >
              Notes
            </Text>
            <Text
              style={[
                styles.notesContent,
                { color: theme.colors.text.secondary },
              ]}
            >
              {noteData.notes}
            </Text>
          </View>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={[
            styles.deleteButton,
            { backgroundColor: theme.colors.error },
            isDeleting && { opacity: 0.6 },
          ]}
          onPress={handleDelete}
          disabled={isDeleting}
        >
          <Text style={[styles.deleteButtonText, { color: "#FFFFFF" }]}>
            {isDeleting ? "Deleting..." : "Delete Note"}
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
  titleContainer: {
    padding: SPACING.lg,
  },
  titleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  backButton: {
    marginRight: SPACING.md,
  },
  backButtonText: {
    fontSize: 16,
  },
  headerActions: {
    flexDirection: "row",
  },
  actionButton: {
    marginLeft: SPACING.lg,
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: "500",
  },
  content: {
    flex: 1,
    padding: SPACING.lg,
  },
  noteCard: {
    borderRadius: 12,
    padding: SPACING.lg,
  },
  noteHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: SPACING.lg,
  },
  bookInfo: {
    flex: 1,
  },
  bookTitle: {
    fontSize: 20,
    fontWeight: "700",
    marginBottom: SPACING.xs,
  },
  bookAuthor: {
    fontSize: 16,
  },
  mood: {
    fontSize: 32,
    marginLeft: SPACING.md,
  },
  metadata: {
    marginBottom: SPACING.lg,
  },
  date: {
    fontSize: 16,
    marginBottom: SPACING.xs,
  },
  duration: {
    fontSize: 14,
  },
  tagsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: SPACING.lg,
  },
  tag: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: 6,
    marginRight: SPACING.sm,
    marginBottom: SPACING.sm,
  },
  tagText: {
    fontSize: 12,
    fontWeight: "500",
  },
  notesSection: {
    marginTop: SPACING.md,
  },
  notesLabel: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: SPACING.md,
  },
  notesContent: {
    fontSize: 16,
    lineHeight: 24,
  },
  footer: {
    padding: SPACING.lg,
    borderTopWidth: 1,
    borderTopColor: "rgba(255, 255, 255, 0.1)",
  },
  deleteButton: {
    borderRadius: 8,
    paddingVertical: SPACING.md,
    alignItems: "center",
  },
  deleteButtonText: {
    fontSize: 16,
    fontWeight: "600",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    fontSize: 16,
    fontWeight: "500",
  },
});
