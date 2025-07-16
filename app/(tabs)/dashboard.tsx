import { useFocusEffect } from '@react-navigation/native';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { SPACING } from '../styles/theme';
import { getReadingStats, ReadingStats } from '../utils/readingStats';
import { getReadingStreak, ReadingStreak } from '../utils/streakUtils';

export default function DashboardScreen() {
  const { theme } = useTheme();
  const router = useRouter();
  const [streak, setStreak] = useState<ReadingStreak | null>(null);
  const [stats, setStats] = useState<ReadingStats | null>(null);

  // Refresh data when screen comes into focus
  useFocusEffect(
    React.useCallback(() => {
      let isActive = true;

      const loadDataSafely = async () => {
        try {
          const [currentStreak, readingStats] = await Promise.all([
            getReadingStreak(),
            getReadingStats(),
          ]);
          
          if (isActive) {
            setStreak(currentStreak);
            setStats(readingStats);
          }
        } catch (error) {
          console.error('Error loading data:', error);
        }
      };

      loadDataSafely();

      return () => {
        isActive = false;
      };
    }, [])
  );

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
        
        <View style={styles.statsContainer}>
          {streak && (
            <View style={[styles.statsCard, { backgroundColor: theme.colors.background.card }]}>
              <View style={styles.statsContent}>
                <Text style={[styles.statsTitle, { color: theme.colors.text.primary }]}>
                  Reading Streak
                </Text>
                <Text style={[styles.statsPrimary, { color: theme.colors.primary }]}>
                  {streak.currentStreak} {streak.currentStreak === 1 ? 'day' : 'days'}
                </Text>
                <Text style={[styles.statsSecondary, { color: theme.colors.text.secondary }]}>
                  Longest: {streak.longestStreak} {streak.longestStreak === 1 ? 'day' : 'days'}
                </Text>
              </View>
            </View>
          )}

          {stats && (
            <View style={[styles.statsCard, { backgroundColor: theme.colors.background.card }]}>
              <View style={styles.statsContent}>
                <Text style={[styles.statsTitle, { color: theme.colors.text.primary }]}>
                  Reading Time
                </Text>
                <Text style={[styles.statsPrimary, { color: theme.colors.primary }]}>
                  {stats.totalMinutes} min
                </Text>
                <Text style={[styles.statsSecondary, { color: theme.colors.text.secondary }]}>
                  {stats.totalSessions} {stats.totalSessions === 1 ? 'session' : 'sessions'}
                  {' • '}
                  Avg {stats.averageSessionLength === 0 ? '< 1' : stats.averageSessionLength} min
                </Text>
              </View>
            </View>
          )}
        </View>

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
  statsContainer: {
    flexDirection: 'row',
    gap: SPACING.lg,
    marginBottom: SPACING.xl,
    paddingHorizontal: SPACING.sm,
  },
  statsCard: {
    flex: 1,
    borderRadius: 16,
    padding: SPACING.lg,
    minHeight: 140,
    justifyContent: 'center',
  },
  statsContent: {
    alignItems: 'center',
    width: '100%',
  },
  statsTitle: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: SPACING.md,
    textAlign: 'center',
    lineHeight: 20,
    width: '100%',
  },
  statsPrimary: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: SPACING.sm,
    textAlign: 'center',
    width: '100%',
  },
  statsSecondary: {
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 18,
    width: '100%',
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
}); 