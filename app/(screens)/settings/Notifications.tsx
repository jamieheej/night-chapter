import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Alert, SafeAreaView, ScrollView, StyleSheet, Switch, Text, TouchableOpacity, View } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { SPACING } from '../../styles/theme';
import { cancelAllScheduledNotifications, requestNotificationPermissions, scheduleReadingTimerNotification } from '../../utils/notifications';

const DAYS_OF_WEEK: string[] = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

interface TimerSchedule {
  time: string;
  days: string[];
  repeat: boolean;
  alarm: boolean;
  createdAt: string;
}

export default function Notifications() {
  const { theme } = useTheme();
  const router = useRouter();
  const [time, setTime] = useState<Date>(new Date());
  const [selectedDays, setSelectedDays] = useState<string[]>([]);
  const [repeat, setRepeat] = useState<boolean>(false);
  const [alarm, setAlarm] = useState<boolean>(true);
  const [existingSchedule, setExistingSchedule] = useState<TimerSchedule | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [notificationsEnabled, setNotificationsEnabled] = useState<boolean>(false);

  // Load existing schedule on component mount
  useEffect(() => {
    const loadSchedule = async (): Promise<void> => {
      try {
        const savedSchedule = await AsyncStorage.getItem('readingTimerSchedule');
        if (savedSchedule) {
          const schedule: TimerSchedule = JSON.parse(savedSchedule);
          setTime(new Date(schedule.time));
          setSelectedDays(schedule.days);
          setRepeat(schedule.repeat);
          setAlarm(schedule.alarm);
          setExistingSchedule(schedule);
        }
        
        // Check notification permissions
        const hasPermission = await requestNotificationPermissions();
        setNotificationsEnabled(hasPermission);
      } catch (error) {
        console.error('Failed to load schedule:', error);
      } finally {
        setLoading(false);
      }
    };

    loadSchedule();
  }, []);

  const handleBack = () => {
    router.back();
  };

  const toggleDay = (day: string): void => {
    if (selectedDays.includes(day)) {
      setSelectedDays(selectedDays.filter(d => d !== day));
    } else {
      setSelectedDays([...selectedDays, day]);
    }
  };

  const saveSchedule = async (): Promise<void> => {
    if (!notificationsEnabled) {
      Alert.alert(
        'Notifications Disabled',
        'Please enable notifications to set reading reminders.',
        [
          {
            text: 'Enable Notifications',
            onPress: async () => {
              const hasPermission = await requestNotificationPermissions();
              setNotificationsEnabled(hasPermission);
            },
          },
          { text: 'Cancel', style: 'cancel' },
        ]
      );
      return;
    }

    if (selectedDays.length === 0) {
      Alert.alert('No Days Selected', 'Please select at least one day for your reading reminder.');
      return;
    }

    try {
      const schedule: TimerSchedule = {
        time: time.toISOString(),
        days: selectedDays,
        repeat,
        alarm,
        createdAt: new Date().toISOString()
      };
      
      await AsyncStorage.setItem('readingTimerSchedule', JSON.stringify(schedule));
      
      // Schedule notification
      await scheduleReadingTimerNotification(schedule);
      
      Alert.alert(
        'Schedule Saved!',
        'Your reading timer notifications have been scheduled successfully.',
        [
          {
            text: 'OK',
            onPress: () => router.back(),
          },
        ]
      );
    } catch (error) {
      console.error('Failed to save schedule:', error);
      Alert.alert('Error', 'Failed to save schedule. Please try again.');
    }
  };

  const clearSchedule = async (): Promise<void> => {
    Alert.alert(
      'Clear Schedule',
      'Are you sure you want to clear your reading timer schedule?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Clear',
          style: 'destructive',
          onPress: async () => {
            try {
              await AsyncStorage.removeItem('readingTimerSchedule');
              await cancelAllScheduledNotifications();
              
              // Reset state
              setTime(new Date());
              setSelectedDays([]);
              setRepeat(false);
              setAlarm(true);
              setExistingSchedule(null);
              
              Alert.alert('Schedule Cleared', 'Your reading timer schedule has been cleared.');
            } catch (error) {
              console.error('Failed to clear schedule:', error);
              Alert.alert('Error', 'Failed to clear schedule. Please try again.');
            }
          },
        },
      ]
    );
  };

  const formatTime = (date: Date): string => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background.dark }]}>
        <View style={styles.loadingContainer}>
          <Text style={[styles.loadingText, { color: theme.colors.text.primary }]}>
            Loading notifications...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background.dark }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBack} style={styles.backButton}>
          <Text style={[styles.backButtonText, { color: theme.colors.text.primary }]}>← Back</Text>
        </TouchableOpacity>
        <Text style={[styles.title, { color: theme.colors.text.primary }]}>Notifications</Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={[styles.section, { backgroundColor: theme.colors.background.card }]}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text.primary }]}>
            Reading Reminders
          </Text>
          <Text style={[styles.sectionDescription, { color: theme.colors.text.secondary }]}>
            Set up notifications to remind you when it&apos;s time to read
          </Text>
        </View>

        <View style={[styles.section, { backgroundColor: theme.colors.background.card }]}>
          <View style={styles.settingRow}>
            <Text style={[styles.settingLabel, { color: theme.colors.text.primary }]}>
              Enable Notifications
            </Text>
            <Switch
              value={notificationsEnabled}
              onValueChange={async (value) => {
                if (value) {
                  const hasPermission = await requestNotificationPermissions();
                  setNotificationsEnabled(hasPermission);
                } else {
                  setNotificationsEnabled(false);
                  await cancelAllScheduledNotifications();
                }
              }}
              trackColor={{ false: theme.colors.divider, true: theme.colors.primary }}
              thumbColor={notificationsEnabled ? '#FFFFFF' : theme.colors.text.tertiary}
            />
          </View>
        </View>

        {notificationsEnabled && (
          <>
            <View style={[styles.section, { backgroundColor: theme.colors.background.card }]}>
              <Text style={[styles.sectionTitle, { color: theme.colors.text.primary }]}>
                Reminder Time
              </Text>
              <TouchableOpacity style={styles.timeSelector}>
                <Text style={[styles.timeText, { color: theme.colors.text.primary }]}>
                  {formatTime(time)}
                </Text>
              </TouchableOpacity>
            </View>

            <View style={[styles.section, { backgroundColor: theme.colors.background.card }]}>
              <Text style={[styles.sectionTitle, { color: theme.colors.text.primary }]}>
                Days of the Week
              </Text>
              <View style={styles.daysContainer}>
                {DAYS_OF_WEEK.map((day) => (
                  <TouchableOpacity
                    key={day}
                    style={[
                      styles.dayButton,
                      selectedDays.includes(day) && { backgroundColor: theme.colors.primary }
                    ]}
                    onPress={() => toggleDay(day)}
                  >
                    <Text style={[
                      styles.dayText,
                      { color: selectedDays.includes(day) ? '#FFFFFF' : theme.colors.text.primary }
                    ]}>
                      {day.substring(0, 3)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={[styles.section, { backgroundColor: theme.colors.background.card }]}>
              <View style={styles.settingRow}>
                <View>
                  <Text style={[styles.settingLabel, { color: theme.colors.text.primary }]}>
                    Repeat Weekly
                  </Text>
                  <Text style={[styles.sectionDescription, { color: theme.colors.text.secondary }]}>
                    Automatically repeat this schedule every week
                  </Text>
                </View>
                <Switch
                  value={repeat}
                  onValueChange={setRepeat}
                  trackColor={{ false: theme.colors.divider, true: theme.colors.primary }}
                  thumbColor={repeat ? '#FFFFFF' : theme.colors.text.tertiary}
                />
              </View>
            </View>

            <View style={[styles.section, { backgroundColor: theme.colors.background.card }]}>
              <View style={styles.settingRow}>
                <View>
                  <Text style={[styles.settingLabel, { color: theme.colors.text.primary }]}>
                    Sound Alert
                  </Text>
                  <Text style={[styles.sectionDescription, { color: theme.colors.text.secondary }]}>
                    Play a sound when the notification appears
                  </Text>
                </View>
                <Switch
                  value={alarm}
                  onValueChange={setAlarm}
                  trackColor={{ false: theme.colors.divider, true: theme.colors.primary }}
                  thumbColor={alarm ? '#FFFFFF' : theme.colors.text.tertiary}
                />
              </View>
            </View>
          </>
        )}
      </ScrollView>

      <View style={styles.footer}>
        {existingSchedule && (
          <TouchableOpacity
            style={[styles.clearButton, { backgroundColor: theme.colors.error }]}
            onPress={clearSchedule}
          >
            <Text style={[styles.clearButtonText, { color: '#FFFFFF' }]}>
              Clear Schedule
            </Text>
          </TouchableOpacity>
        )}
        
        <TouchableOpacity
          style={[
            styles.saveButton,
            { backgroundColor: theme.colors.primary },
            !notificationsEnabled && { opacity: 0.5 }
          ]}
          onPress={saveSchedule}
          disabled={!notificationsEnabled}
        >
          <Text style={[styles.saveButtonText, { color: '#FFFFFF' }]}>
            {existingSchedule ? 'Update Schedule' : 'Save Schedule'}
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
    borderRadius: 12,
    padding: SPACING.lg,
    marginBottom: SPACING.md,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: SPACING.sm,
  },
  sectionDescription: {
    fontSize: 14,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  settingLabel: {
    fontSize: 16,
    fontWeight: '500',
  },
  timeSelector: {
    padding: SPACING.md,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    marginTop: SPACING.sm,
  },
  timeText: {
    fontSize: 24,
    fontWeight: '600',
    textAlign: 'center',
  },
  daysContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: SPACING.sm,
  },
  dayButton: {
    padding: SPACING.sm,
    borderRadius: 8,
    marginRight: SPACING.sm,
    marginBottom: SPACING.sm,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    minWidth: 45,
    alignItems: 'center',
  },
  dayText: {
    fontSize: 14,
    fontWeight: '500',
  },
  footer: {
    padding: SPACING.lg,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
  },
  clearButton: {
    borderRadius: 8,
    paddingVertical: SPACING.md,
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  clearButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  saveButton: {
    borderRadius: 8,
    paddingVertical: SPACING.md,
    alignItems: 'center',
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
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
