import { useRouter } from 'expo-router';
import React from 'react';
import { SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { SPACING } from '../../styles/theme';

export default function ThemeSettings() {
  const { theme, isDark, toggleTheme } = useTheme();
  const router = useRouter();

  const handleBack = () => {
    router.back();
  };

  const handleThemeToggle = () => {
    toggleTheme();
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background.dark }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBack} style={styles.backButton}>
          <Text style={[styles.backButtonText, { color: theme.colors.text.primary }]}>← Back</Text>
        </TouchableOpacity>
        <Text style={[styles.title, { color: theme.colors.text.primary }]}>Theme</Text>
      </View>

      <View style={styles.content}>
        <Text style={[styles.sectionTitle, { color: theme.colors.text.primary }]}>
          Appearance
        </Text>
        <Text style={[styles.sectionDescription, { color: theme.colors.text.secondary }]}>
          Choose how NightChapter looks on your device
        </Text>

        <View style={styles.themeOptions}>
          <TouchableOpacity
            style={[
              styles.themeOption,
              { backgroundColor: theme.colors.background.card },
              isDark && { borderColor: theme.colors.primary, borderWidth: 2 }
            ]}
            onPress={isDark ? undefined : handleThemeToggle}
          >
            <View style={styles.themePreview}>
              <View style={[styles.previewHeader, { backgroundColor: '#000000' }]} />
              <View style={[styles.previewContent, { backgroundColor: '#1C1C1E' }]} />
            </View>
            <Text style={[styles.themeLabel, { color: theme.colors.text.primary }]}>
              Dark
            </Text>
            <Text style={[styles.themeDescription, { color: theme.colors.text.secondary }]}>
              Easy on the eyes in low light
            </Text>
            {isDark && (
              <View style={[styles.selectedIndicator, { backgroundColor: theme.colors.primary }]}>
                <Text style={styles.checkmark}>✓</Text>
              </View>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.themeOption,
              { backgroundColor: theme.colors.background.card },
              !isDark && { borderColor: theme.colors.primary, borderWidth: 2 }
            ]}
            onPress={!isDark ? undefined : handleThemeToggle}
          >
            <View style={styles.themePreview}>
              <View style={[styles.previewHeader, { backgroundColor: '#FFFFFF' }]} />
              <View style={[styles.previewContent, { backgroundColor: '#F2F2F7' }]} />
            </View>
            <Text style={[styles.themeLabel, { color: theme.colors.text.primary }]}>
              Light
            </Text>
            <Text style={[styles.themeDescription, { color: theme.colors.text.secondary }]}>
              Classic bright appearance
            </Text>
            {!isDark && (
              <View style={[styles.selectedIndicator, { backgroundColor: theme.colors.primary }]}>
                <Text style={styles.checkmark}>✓</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

        <View style={styles.infoSection}>
          <Text style={[styles.infoTitle, { color: theme.colors.text.primary }]}>
            About Themes
          </Text>
          <Text style={[styles.infoText, { color: theme.colors.text.secondary }]}>
            Dark theme is recommended for evening reading sessions as it reduces eye strain and helps maintain your natural sleep cycle. Light theme works well for daytime use.
          </Text>
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
  sectionTitle: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: SPACING.xs,
  },
  sectionDescription: {
    fontSize: 16,
    marginBottom: SPACING.xl,
  },
  themeOptions: {
    marginBottom: SPACING.xl,
  },
  themeOption: {
    borderRadius: 12,
    padding: SPACING.lg,
    marginBottom: SPACING.md,
    position: 'relative',
  },
  themePreview: {
    height: 60,
    borderRadius: 8,
    overflow: 'hidden',
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  previewHeader: {
    height: 20,
  },
  previewContent: {
    flex: 1,
  },
  themeLabel: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: SPACING.xs,
  },
  themeDescription: {
    fontSize: 14,
  },
  selectedIndicator: {
    position: 'absolute',
    top: SPACING.md,
    right: SPACING.md,
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkmark: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  infoSection: {
    backgroundColor: 'rgba(139, 92, 246, 0.1)',
    borderRadius: 12,
    padding: SPACING.lg,
    borderLeftWidth: 4,
    borderLeftColor: '#8B5CF6',
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: SPACING.sm,
  },
  infoText: {
    fontSize: 14,
    lineHeight: 20,
  },
});
