import { RootStackParamList } from '@/app/types';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Alert, AppState, Modal, SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import FocusOverlay from '../../components/FocusOverlay';
import { useTheme } from '../../context/ThemeContext';
import { SPACING } from '../../styles/theme';
import { endFocusSession, getFocusModeSettings, startFocusSession } from '../../utils/focusMode';
import { getStreakMessage, updateReadingStreak } from '../../utils/streakUtils';

type ReadingTimerScreenNavigationProp = StackNavigationProp<RootStackParamList, 'ReadingTimer'>;

interface TimerSchedule {
  time: string;
  days: string[];
  repeat: boolean;
  alarm: boolean;
  createdAt: string;
}

interface Session {
  duration: number;
  completedAt: string;
}

const ReadingTimerScreen: React.FC = () => {
  const navigation = useNavigation<ReadingTimerScreenNavigationProp>();
  const { theme } = useTheme();
  const router = useRouter();
  const [timeRemaining, setTimeRemaining] = useState(30 * 60); // 30 minutes in seconds
  const [originalTime, setOriginalTime] = useState(30 * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [showTimeSelector, setShowTimeSelector] = useState(false);
  const [completedSessions, setCompletedSessions] = useState<Session[]>([]);
  const [showTimePicker, setShowTimePicker] = useState<boolean>(false);
  const [selectedDays, setSelectedDays] = useState<string[]>([]);
  const [repeat, setRepeat] = useState<boolean>(false);
  const [alarm, setAlarm] = useState<boolean>(true);
  const [existingSchedule, setExistingSchedule] = useState<TimerSchedule | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [showFocusOverlay, setShowFocusOverlay] = useState(false);
  const [focusModeEnabled, setFocusModeEnabled] = useState(false);

  const timeOptions = [
    { label: '15 min', value: 15 * 60 },
    { label: '30 min', value: 30 * 60 },
    { label: '45 min', value: 45 * 60 },
    { label: '60 min', value: 60 * 60 },
    { label: '90 min', value: 90 * 60 },
  ];

  // Load existing schedule on component mount
  useEffect(() => {
    const loadSchedule = async (): Promise<void> => {
      try {
        const savedSchedule = await AsyncStorage.getItem('readingTimerSchedule');
        if (savedSchedule) {
          const schedule: TimerSchedule = JSON.parse(savedSchedule);
          setTimeRemaining(schedule.time ? parseInt(schedule.time) : 30 * 60);
          setOriginalTime(schedule.time ? parseInt(schedule.time) : 30 * 60);
          setSelectedDays(schedule.days);
          setRepeat(schedule.repeat);
          setAlarm(schedule.alarm);
          setExistingSchedule(schedule);
        }
      } catch (error) {
        console.error('Failed to load schedule:', error);
      } finally {
        setLoading(false);
      }
    };

    loadSchedule();
  }, []);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isRunning && timeRemaining > 0) {
      interval = setInterval(() => {
        setTimeRemaining(prev => prev - 1);
      }, 1000);
    } else if (timeRemaining === 0 && isRunning) {
      // Timer finished
      setIsRunning(false);
      handleSessionComplete();
    }
    
    return () => clearInterval(interval);
  }, [isRunning, timeRemaining]);

  useEffect(() => {
    loadFocusSettings();
  }, []);

  useEffect(() => {
    const subscription = AppState.addEventListener('change', handleAppStateChange);
    return () => subscription?.remove();
  }, [isRunning, focusModeEnabled]);

  const loadFocusSettings = async () => {
    try {
      const settings = await getFocusModeSettings();
      setFocusModeEnabled(settings.enabled);
    } catch (error) {
      console.error('Error loading focus settings:', error);
    }
  };

  const handleAppStateChange = (nextAppState: string) => {
    if (isRunning && focusModeEnabled && nextAppState === 'background') {
      // Show focus overlay when app goes to background during timer
      setShowFocusOverlay(true);
    }
  };

  const handleSessionComplete = async () => {
    const newSession: Session = {
      duration: originalTime,
      completedAt: new Date().toISOString(),
    };
    
    setCompletedSessions(prev => [...prev, newSession]);
    
    try {
      // Update reading streak
      const updatedStreak = await updateReadingStreak();
      const streakMessage = getStreakMessage(updatedStreak);
      
      Alert.alert(
        'Session Complete! 🎉',
        `Congratulations! You've completed your reading session.\n\n${streakMessage}`,
        [
          {
            text: 'Add Journal Entry',
            onPress: () => {
              const totalDuration = getTotalCompletedTime();
              router.push({
                pathname: '/(screens)/reading/Journal',
                params: {
                  totalDuration: totalDuration.toString(),
                  sessionsCount: completedSessions.length.toString(),
                },
              });
            },
          },
          {
            text: 'Finish',
            onPress: () => router.back(),
          },
        ]
      );
    } catch (error) {
      console.error('Error updating streak:', error);
      // Fallback to original alert
      Alert.alert(
        'Session Complete!',
        'Congratulations! You\'ve completed your reading session.',
        [
          {
            text: 'Add Journal Entry',
            onPress: () => {
              const totalDuration = getTotalCompletedTime();
              router.push({
                pathname: '/(screens)/reading/Journal',
                params: {
                  totalDuration: totalDuration.toString(),
                  sessionsCount: completedSessions.length.toString(),
                },
              });
            },
          },
          {
            text: 'Finish',
            onPress: () => router.back(),
          },
        ]
      );
    }
    
    // End focus session
    if (focusModeEnabled) {
      await endFocusSession();
      setShowFocusOverlay(false);
    }
  };
  
  const handleReadMore = () => {
    setTimeRemaining(originalTime);
    setIsRunning(false);
  };
  
  const handleEndSession = () => {
    const totalDuration = completedSessions.reduce((sum, session) => sum + session.duration, 0) + originalTime;
    router.push({
      pathname: '/(screens)/reading/Journal',
      params: { 
        totalDuration: totalDuration.toString(),
        sessionsCount: (completedSessions.length + 1).toString()
      }
    });
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    return `${mins} min`;
  };

  const handleStartPause = async () => {
    if (!isRunning) {
      // Starting timer
      setIsRunning(true);
      if (focusModeEnabled) {
        await startFocusSession(timeRemaining);
        setShowFocusOverlay(true);
      }
    } else {
      // Pausing timer
      setIsRunning(false);
      if (focusModeEnabled) {
        await endFocusSession();
        setShowFocusOverlay(false);
      }
    }
  };
  
  const handleReset = async () => {
    setIsRunning(false);
    setTimeRemaining(originalTime);
    if (focusModeEnabled) {
      await endFocusSession();
      setShowFocusOverlay(false);
    }
  };
  
  const handleTimeSelect = (newTime: number) => {
    if (!isRunning) {
      setTimeRemaining(newTime);
      setOriginalTime(newTime);
    }
    setShowTimeSelector(false);
  };
  
  const handleBack = () => {
    if (isRunning || timeRemaining !== originalTime) {
      Alert.alert(
        'Session in Progress',
        'Your current session might be lost. What would you like to do?',
        [
          {
            text: 'Continue Reading',
            style: 'cancel',
          },
          {
            text: 'End Session',
            style: 'destructive',
            onPress: () => router.back(),
          },
        ]
      );
    } else {
      router.back();
    }
  };
  
  const getTotalCompletedTime = () => {
    return completedSessions.reduce((sum, session) => sum + session.duration, 0);
  };

  const handleFocusOverlayClose = () => {
    setShowFocusOverlay(false);
  };

  const handleEndFocusSession = async () => {
    await endFocusSession();
    setShowFocusOverlay(false);
    setIsRunning(false);
    setTimeRemaining(originalTime);
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Loading schedule...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background.dark }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBack} style={styles.backButton}>
          <Text style={[styles.backButtonText, { color: theme.colors.text.primary }]}>← Back</Text>
        </TouchableOpacity>
        <Text style={[styles.title, { color: theme.colors.text.primary }]}>Reading Timer</Text>
      </View>
      
      <View style={styles.timerContainer}>
        <TouchableOpacity 
          onPress={() => setShowTimeSelector(true)}
          disabled={isRunning}
          style={styles.timeSelector}
        >
          <Text style={[styles.timer, { color: theme.colors.text.primary }]}>
            {formatTime(timeRemaining)}
          </Text>
          {!isRunning && (
            <Text style={[styles.changeTimeHint, { color: theme.colors.text.secondary }]}>
              Tap to change time
            </Text>
          )}
        </TouchableOpacity>
        
        {completedSessions.length > 0 && (
          <View style={styles.sessionInfo}>
            <Text style={[styles.sessionText, { color: theme.colors.text.secondary }]}>
              Previous sessions: {completedSessions.length}
            </Text>
            <Text style={[styles.sessionText, { color: theme.colors.text.secondary }]}>
              Total time: {formatDuration(getTotalCompletedTime())}
            </Text>
          </View>
        )}
        
        <View style={styles.buttonContainer}>
          <TouchableOpacity 
            style={[styles.button, { backgroundColor: theme.colors.primary }]}
            onPress={handleStartPause}
          >
            <Text style={[styles.buttonText, { color: '#FFFFFF' }]}>
              {isRunning ? 'Pause' : 'Start'}
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.button, { backgroundColor: theme.colors.background.card }]}
            onPress={handleReset}
          >
            <Text style={[styles.buttonText, { color: theme.colors.text.primary }]}>
              Reset
            </Text>
          </TouchableOpacity>
        </View>
        
        <Text style={[styles.instructions, { color: theme.colors.text.secondary }]}>
          Start the timer and begin reading. The app will notify you when your reading session is complete.
        </Text>
      </View>
      
      {/* Time Selector Modal */}
      <Modal
        visible={showTimeSelector}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowTimeSelector(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: theme.colors.background.card }]}>
            <Text style={[styles.modalTitle, { color: theme.colors.text.primary }]}>
              Select Reading Time
            </Text>
            
            {timeOptions.map((option) => (
              <TouchableOpacity
                key={option.value}
                style={[
                  styles.timeOption,
                  originalTime === option.value && { backgroundColor: theme.colors.primary }
                ]}
                onPress={() => handleTimeSelect(option.value)}
              >
                <Text style={[
                  styles.timeOptionText,
                  { color: originalTime === option.value ? '#FFFFFF' : theme.colors.text.primary }
                ]}>
                  {option.label}
                </Text>
              </TouchableOpacity>
            ))}
            
            <TouchableOpacity
              style={[styles.cancelButton, { backgroundColor: theme.colors.background.dark }]}
              onPress={() => setShowTimeSelector(false)}
            >
              <Text style={[styles.cancelButtonText, { color: theme.colors.text.primary }]}>
                Cancel
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
      
      <FocusOverlay
        visible={showFocusOverlay}
        onRequestClose={handleFocusOverlayClose}
        onEndSession={handleEndFocusSession}
      />
    </SafeAreaView>
  );
};

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
  timerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.lg,
  },
  timeSelector: {
    alignItems: 'center',
    marginBottom: SPACING.xl,
  },
  timer: {
    fontSize: 72,
    fontWeight: '700',
  },
  changeTimeHint: {
    fontSize: 14,
    marginTop: SPACING.xs,
  },
  sessionInfo: {
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  sessionText: {
    fontSize: 14,
    marginBottom: SPACING.xs,
  },
  buttonContainer: {
    flexDirection: 'row',
    marginBottom: SPACING.xl,
  },
  button: {
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.lg,
    borderRadius: 8,
    marginHorizontal: SPACING.sm,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  instructions: {
    textAlign: 'center',
    marginTop: SPACING.xl,
    paddingHorizontal: SPACING.xl,
    fontSize: 14,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '80%',
    borderRadius: 12,
    padding: SPACING.lg,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: SPACING.lg,
  },
  timeOption: {
    padding: SPACING.md,
    borderRadius: 8,
    marginBottom: SPACING.sm,
    alignItems: 'center',
  },
  timeOptionText: {
    fontSize: 16,
    fontWeight: '500',
  },
  cancelButton: {
    padding: SPACING.md,
    borderRadius: 8,
    marginTop: SPACING.md,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default ReadingTimerScreen;
