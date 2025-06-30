import { useRouter } from 'expo-router';
import React from 'react';
import { SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { SPACING } from '../../styles/theme';

export default function Settings() {
  const { theme } = useTheme();
  const { user } = useAuth();
  const router = useRouter();

  const handleBack = () => {
    router.back();
  };

  const navigateToNotifications = () => {
    router.push('/(screens)/settings/Notifications');
  };

  const handleTheme = () => {
    router.push('/(screens)/settings/Theme');
  };

  const handleAccount = () => {
    if (user?.provider === 'guest') {
      router.push('/(screens)/auth/SignIn');
    } else {
      router.push('/(screens)/settings/Account');
    }
  };

  const settingsOptions = [
    {
      title: 'Notifications',
      description: 'Manage reading reminders and alerts',
      onPress: navigateToNotifications,
      icon: '🔔',
    },
    {
      title: 'Theme',
      description: 'Customize app appearance',
      onPress: handleTheme,
      icon: '🎨',
    },
    {
      title: user?.provider === 'guest' ? 'Sign In' : 'Account',
      description: user?.provider === 'guest' 
        ? 'Sign in for cloud sync and premium features'
        : `${user?.email} ${user?.isPremium ? '(Premium)' : ''}`,
      onPress: handleAccount,
      icon: user?.provider === 'guest' ? '👤' : '⭐',
    },
    {
      title: 'Focus Mode',
      description: 'Block distractions during reading',
      onPress: () => router.push('/(screens)/settings/FocusMode'),
      icon: '🎯',
    },
  ];

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background.dark }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBack} style={styles.backButton}>
          <Text style={[styles.backButtonText, { color: theme.colors.text.primary }]}>← Back</Text>
        </TouchableOpacity>
        <Text style={[styles.title, { color: theme.colors.text.primary }]}>Settings</Text>
      </View>

      <View style={styles.content}>
        {settingsOptions.map((option, index) => (
          <TouchableOpacity
            key={index}
            style={[styles.settingItem, { backgroundColor: theme.colors.background.card }]}
            onPress={option.onPress}
          >
            <View style={styles.settingIcon}>
              <Text style={styles.iconText}>{option.icon}</Text>
            </View>
            <View style={styles.settingContent}>
              <Text style={[styles.settingTitle, { color: theme.colors.text.primary }]}>
                {option.title}
              </Text>
              <Text style={[styles.settingDescription, { color: theme.colors.text.secondary }]}>
                {option.description}
              </Text>
            </View>
            <View style={styles.settingArrow}>
              <Text style={[styles.arrowText, { color: theme.colors.text.tertiary }]}>›</Text>
            </View>
          </TouchableOpacity>
        ))}
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
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.lg,
    borderRadius: 12,
    marginBottom: SPACING.md,
  },
  settingIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  iconText: {
    fontSize: 20,
  },
  settingContent: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: SPACING.xs,
  },
  settingDescription: {
    fontSize: 14,
  },
  settingArrow: {
    marginLeft: SPACING.sm,
  },
  arrowText: {
    fontSize: 20,
    fontWeight: '300',
  },
});
