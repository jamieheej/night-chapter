import React from 'react';
import { SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useTheme } from './context/ThemeContext';
import { SPACING } from './styles/theme';

export default function DashboardScreen() {
  const { theme } = useTheme();
  
  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background.dark }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: theme.colors.text.primary }]}>
          NightChapter
        </Text>
      </View>
      
      <View style={styles.content}>
        <Text style={[styles.welcomeText, { color: theme.colors.text.primary }]}>
          Welcome to NightChapter!
        </Text>
        <Text style={[styles.infoText, { color: theme.colors.text.secondary }]}>
          Your mindful reading companion for better sleep.
        </Text>
        
        <View style={styles.cardContainer}>
          <TouchableOpacity 
            style={[styles.card, { backgroundColor: theme.colors.background.card }]}
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
}); 