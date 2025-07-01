import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { SafeAreaView, ScrollView, StyleSheet, Switch, Text, TouchableOpacity, View } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { SPACING } from '../../styles/theme';
import { FocusModeSettings, getFocusModeSettings, openFocusSettings, restoreNotifications, saveFocusModeSettings, suppressNotifications } from '../../utils/focusMode';

export default function FocusMode() {
  const { theme } = useTheme();
  const router = useRouter();
  const [settings, setSettings] = useState<FocusModeSettings>({
    enabled: true,
    doNotDisturb: true
  });

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const currentSettings = await getFocusModeSettings();
      setSettings(currentSettings);
    } catch (error) {
      console.error('Error loading focus mode settings:', error);
    }
  };

  const updateSettings = async (newSettings: Partial<FocusModeSettings>) => {
    const updatedSettings = { ...settings, ...newSettings };
    setSettings(updatedSettings);
    await saveFocusModeSettings(updatedSettings);

    // Handle Do Not Disturb setting
    if ('doNotDisturb' in newSettings) {
      if (newSettings.doNotDisturb) {
        openFocusSettings();
      }
    }

    // Handle notifications based on focus mode state
    if ('enabled' in newSettings) {
      if (newSettings.enabled) {
        await suppressNotifications();
      } else {
        await restoreNotifications();
      }
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background.dark }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Text style={[styles.backButtonText, { color: theme.colors.text.primary }]}>← Back</Text>
        </TouchableOpacity>
        <Text style={[styles.title, { color: theme.colors.text.primary }]}>Focus Mode</Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.section}>
          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Text style={[styles.settingTitle, { color: theme.colors.text.primary }]}>
                Enable Focus Mode
              </Text>
              <Text style={[styles.settingDescription, { color: theme.colors.text.secondary }]}>
                Block distractions during reading sessions
              </Text>
            </View>
            <Switch
              value={settings.enabled}
              onValueChange={(enabled) => updateSettings({ enabled })}
              trackColor={{ false: theme.colors.divider, true: theme.colors.primary }}
              thumbColor="#FFFFFF"
            />
          </View>
        </View>

        {settings.enabled && (
          <>
            <View style={styles.section}>
              <View style={styles.settingRow}>
                <View style={styles.settingInfo}>
                  <Text style={[styles.settingTitle, { color: theme.colors.text.primary }]}>
                    Do Not Disturb
                  </Text>
                  <Text style={[styles.settingDescription, { color: theme.colors.text.secondary }]}>
                    Enable system Focus mode during reading sessions
                  </Text>
                </View>
                <Switch
                  value={settings.doNotDisturb}
                  onValueChange={(doNotDisturb) => updateSettings({ doNotDisturb })}
                  trackColor={{ false: theme.colors.divider, true: theme.colors.primary }}
                  thumbColor="#FFFFFF"
                />
              </View>
            </View>
          </>
        )}

        <View style={styles.infoSection}>
          <Text style={[styles.infoTitle, { color: theme.colors.text.primary }]}>
            How Focus Mode Works
          </Text>
          <Text style={[styles.infoText, { color: theme.colors.text.secondary }]}>
            When you start a reading timer, Focus Mode helps you stay concentrated by suppressing notifications and optionally enabling system Focus mode. The app will show a full-screen overlay when you try to leave, helping you maintain your reading flow.
          </Text>
        </View>
      </ScrollView>
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
  section: {
    marginBottom: SPACING.xl,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: SPACING.md,
  },
  settingInfo: {
    flex: 1,
    marginRight: SPACING.md,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: SPACING.xs,
  },
  settingDescription: {
    fontSize: 14,
  },
  infoSection: {
    backgroundColor: 'rgba(139, 92, 246, 0.1)',
    borderRadius: 12,
    padding: SPACING.lg,
    borderLeftWidth: 4,
    borderLeftColor: '#8B5CF6',
    marginTop: SPACING.lg,
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