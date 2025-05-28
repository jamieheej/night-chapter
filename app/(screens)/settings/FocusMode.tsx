import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { SafeAreaView, ScrollView, StyleSheet, Switch, Text, TouchableOpacity, View } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { SPACING } from '../../styles/theme';
import { FocusModeSettings, getFocusModeSettings, saveFocusModeSettings } from '../../utils/focusMode';

export default function FocusMode() {
  const { theme } = useTheme();
  const router = useRouter();
  const [settings, setSettings] = useState<FocusModeSettings>({
    enabled: true,
    blockLevel: 'moderate',
    allowedApps: [],
    breakReminders: true,
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
  };

  const handleBack = () => {
    router.back();
  };

  const blockLevels = [
    {
      id: 'gentle',
      title: 'Gentle',
      description: 'Friendly reminders to stay focused',
    },
    {
      id: 'moderate',
      title: 'Moderate',
      description: 'Warnings when leaving the app',
    },
    {
      id: 'strict',
      title: 'Strict',
      description: 'Strong deterrents and session ending',
    },
  ];

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background.dark }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBack} style={styles.backButton}>
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
              <Text style={[styles.sectionTitle, { color: theme.colors.text.primary }]}>
                Block Level
              </Text>
              <Text style={[styles.sectionDescription, { color: theme.colors.text.secondary }]}>
                Choose how strictly to enforce focus
              </Text>
              
              {blockLevels.map((level) => (
                <TouchableOpacity
                  key={level.id}
                  style={[
                    styles.optionRow,
                    { backgroundColor: theme.colors.background.card },
                    settings.blockLevel === level.id && { 
                      borderColor: theme.colors.primary, 
                      borderWidth: 2,
                      backgroundColor: `${theme.colors.primary}15`
                    }
                  ]}
                  onPress={() => updateSettings({ blockLevel: level.id as any })}
                >
                  <View style={styles.optionContent}>
                    <Text style={[
                      styles.optionTitle, 
                      { color: theme.colors.text.primary }
                    ]}>
                      {level.title}
                    </Text>
                    <Text style={[
                      styles.optionDescription, 
                      { color: theme.colors.text.secondary }
                    ]}>
                      {level.description}
                    </Text>
                  </View>
                  {settings.blockLevel === level.id && (
                    <View style={[styles.selectedIndicator, { backgroundColor: theme.colors.primary }]}>
                      <Text style={styles.checkmark}>✓</Text>
                    </View>
                  )}
                </TouchableOpacity>
              ))}
            </View>

            <View style={styles.section}>
              <View style={styles.settingRow}>
                <View style={styles.settingInfo}>
                  <Text style={[styles.settingTitle, { color: theme.colors.text.primary }]}>
                    Break Reminders
                  </Text>
                  <Text style={[styles.settingDescription, { color: theme.colors.text.secondary }]}>
                    Show reminders when taking breaks
                  </Text>
                </View>
                <Switch
                  value={settings.breakReminders}
                  onValueChange={(breakReminders) => updateSettings({ breakReminders })}
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
            When you start a reading timer, Focus Mode helps you stay concentrated by showing reminders when you try to leave the app. This helps build better reading habits and reduces digital distractions.
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
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: SPACING.xs,
  },
  sectionDescription: {
    fontSize: 14,
    marginBottom: SPACING.lg,
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
  optionRow: {
    borderRadius: 12,
    padding: SPACING.lg,
    marginBottom: SPACING.md,
    position: 'relative',
    minHeight: 80,
    justifyContent: 'center',
  },
  optionContent: {
    flex: 1,
    paddingRight: SPACING.xl,
    justifyContent: 'center',
  },
  optionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: SPACING.xs,
  },
  optionDescription: {
    fontSize: 14,
    lineHeight: 20,
  },
  selectedIndicator: {
    position: 'absolute',
    top: 28,
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