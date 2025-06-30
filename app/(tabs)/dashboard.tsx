import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { SPACING } from '../styles/theme';
import { getReadingStreak, ReadingStreak } from '../utils/streakUtils';

export default function DashboardScreen() {
  const { theme } = useTheme();
  const router = useRouter();
  const [streak, setStreak] = useState<ReadingStreak | null>(null);

  useEffect(() => {
    loadStreak();
  }, []);

  const loadStreak = async () => {
    try {
      const currentStreak = await getReadingStreak();
      setStreak(currentStreak);
    } catch (error) {
      console.error('Error loading streak:', error);
    }
  };

  const handleStartReadingSession = () => {
    router.push('/(screens)/reading/Timer');
  };

  const handleSettings = () => {
    router.push('/(screens)/settings/Settings');
  };

  const handleReadingJournal = () => {
    router.push('/(screens)/journal/Journals');
  };
  
  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background.dark }]}>
      <View style={styles.content}>
        <Text style={[styles.welcomeText, { color: theme.colors.text.primary }]}>
          Welcome to NightChapter!
        </Text>
        <Text style={[styles.infoText, { color: theme.colors.text.secondary }]}>
          Your mindful reading companion for better sleep.
        </Text>
        
        {streak && (
          <View style={[styles.streakCard, { backgroundColor: theme.colors.background.card }]}>
            <Text style={[styles.streakTitle, { color: theme.colors.text.primary }]}>
              Reading Streak 🔥
            </Text>
            <Text style={[styles.streakCurrent, { color: theme.colors.primary }]}>
              {streak.currentStreak} {streak.currentStreak === 1 ? 'day' : 'days'}
            </Text>
            <Text style={[styles.streakLongest, { color: theme.colors.text.secondary }]}>
              Longest: {streak.longestStreak} {streak.longestStreak === 1 ? 'day' : 'days'}
            </Text>
          </View>
        )}

        <View style={styles.cardContainer}>
          <TouchableOpacity 
            style={[styles.card, { backgroundColor: theme.colors.background.card }]}
            onPress={handleStartReadingSession}
          >
            <Text style={[styles.cardTitle, { color: theme.colors.text.primary }]}>
              Start Reading Session
            </Text>
            <Text style={[styles.cardDescription, { color: theme.colors.text.secondary }]}>
              Set your timer and begin reading
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.card, { backgroundColor: theme.colors.background.card }]}
            onPress={handleReadingJournal}
          >
            <Text style={[styles.cardTitle, { color: theme.colors.text.primary }]}>
              Reading Journal
            </Text>
            <Text style={[styles.cardDescription, { color: theme.colors.text.secondary }]}>
              View your reading notes and progress
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.card, { backgroundColor: theme.colors.background.card }]}
            onPress={handleSettings}
          >
            <Text style={[styles.cardTitle, { color: theme.colors.text.primary }]}>
              Settings
            </Text>
            <Text style={[styles.cardDescription, { color: theme.colors.text.secondary }]}>
              Customize your reading experience
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: SPACING.lg,
  },
  welcomeText: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: SPACING.sm,
  },
  infoText: {
    fontSize: 16,
    marginBottom: SPACING.xl,
  },
  cardContainer: {
    marginTop: SPACING.lg,
  },
  card: {
    borderRadius: 12,
    padding: SPACING.lg,
    marginBottom: SPACING.md,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: SPACING.xs,
  },
  cardDescription: {
    fontSize: 14,
  },
  streakCard: {
    borderRadius: 12,
    padding: SPACING.lg,
    marginBottom: SPACING.lg,
    alignItems: 'center',
  },
  streakTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: SPACING.sm,
  },
  streakCurrent: {
    fontSize: 32,
    fontWeight: '700',
    marginBottom: SPACING.xs,
  },
  streakLongest: {
    fontSize: 14,
  },
}); 