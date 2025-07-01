import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Alert, AppState, Modal, SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import FocusOverlay from '../../components/FocusOverlay';
import { useTheme } from '../../context/ThemeContext';
import { SPACING } from '../../styles/theme';
import { endFocusSession, getFocusModeSettings, startFocusSession } from '../../utils/focusMode';
import { getStreakMessage, updateReadingStreak } from '../../utils/streakUtils';

interface Session {
  duration: number;
  completedAt: string;
}

const DEFAULT_TIME = 30 * 60; // 30 minutes in seconds

const ReadingTimerScreen: React.FC = () => {
  const { theme } = useTheme();
  const router = useRouter();
  const [timeRemaining, setTimeRemaining] = useState(DEFAULT_TIME);
  const [originalTime, setOriginalTime] = useState(DEFAULT_TIME);
  const [isRunning, setIsRunning] = useState(false);
  const [showTimeSelector, setShowTimeSelector] = useState(false);
  const [completedSessions, setCompletedSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [showFocusOverlay, setShowFocusOverlay] = useState(false);
  const [focusModeEnabled, setFocusModeEnabled] = useState(false);

  const timeOptions = [
    { label: '15 min', value: 15 * 60 },
    { label: '30 min', value: 30 * 60 },
    { label: '45 min', value: 45 * 60 },
    { label: '60 min', value: 60 * 60 },
  ];

  // Load focus settings and completed sessions on mount
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        // Load focus mode settings
        const settings = await getFocusModeSettings();
        setFocusModeEnabled(settings.enabled);

        // Load completed sessions
        const savedSessions = await AsyncStorage.getItem('completedSessions');
        if (savedSessions) {
          setCompletedSessions(JSON.parse(savedSessions));
        }

        // Load last used timer duration
        const savedDuration = await AsyncStorage.getItem('lastTimerDuration');
        if (savedDuration) {
          const duration = parseInt(savedDuration, 10);
          setTimeRemaining(duration);
          setOriginalTime(duration);
        }
      } catch (error) {
        console.error('Error loading initial data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadInitialData();
  }, []);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isRunning && timeRemaining > 0) {
      interval = setInterval(() => {
        setTimeRemaining(prev => prev - 1);
      }, 1000);
    } else if (timeRemaining === 0 && isRunning) {
      handleSessionComplete();
    }
    
    return () => clearInterval(interval);
  }, [isRunning, timeRemaining]);

  useEffect(() => {
    const subscription = AppState.addEventListener('change', handleAppStateChange);
    return () => subscription?.remove();
  }, [isRunning, focusModeEnabled]);

  const handleAppStateChange = (nextAppState: string) => {
    if (isRunning && focusModeEnabled && nextAppState === 'background') {
      setShowFocusOverlay(true);
    }
  };

  const handleSessionComplete = async () => {
    setIsRunning(false);
    
    // Save completed session with actual time spent
    const newSession = {
      duration: originalTime - timeRemaining,
      completedAt: new Date().toISOString(),
    };
    
    const updatedSessions = [...completedSessions, newSession];
    setCompletedSessions(updatedSessions);
    await AsyncStorage.setItem('completedSessions', JSON.stringify(updatedSessions));
    
    // Update streak
    const updatedStreak = await updateReadingStreak();
    
    // Show completion message
    const streakMessage = getStreakMessage(updatedStreak);
    Alert.alert(
      'Reading Session Complete! 🎉',
      streakMessage,
      [{ text: 'OK' }]
    );
    
    // End focus session if active
    if (focusModeEnabled) {
      await endFocusSession();
      setShowFocusOverlay(false);
    }
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
        const settings = await getFocusModeSettings();
        if (settings.doNotDisturb) {
          try {
            await Notifications.setNotificationHandler({
              handleNotification: async () => ({
                shouldShowAlert: false,
                shouldPlaySound: false,
                shouldSetBadge: false,
                shouldShowBanner: false,
                shouldShowList: false,
              }),
            });
          } catch (error) {
            console.error('Failed to enable Do Not Disturb:', error);
          }
        }
        await startFocusSession(timeRemaining);
        setShowFocusOverlay(true);
      }
    } else {
      // Pausing timer - save the partial session
      setIsRunning(false);
      const timeSpent = originalTime - timeRemaining;
      if (timeSpent > 60) { // Only save if at least 1 minute was spent
        const partialSession = {
          duration: timeSpent,
          completedAt: new Date().toISOString(),
        };
        const updatedSessions = [...completedSessions, partialSession];
        setCompletedSessions(updatedSessions);
        await AsyncStorage.setItem('completedSessions', JSON.stringify(updatedSessions));
      }
      
      if (focusModeEnabled) {
        try {
          await Notifications.setNotificationHandler({
            handleNotification: async () => ({
              shouldShowAlert: true,
              shouldPlaySound: true,
              shouldSetBadge: true,
              shouldShowBanner: true,
              shouldShowList: true,
            }),
          });
        } catch (error) {
          console.error('Failed to disable Do Not Disturb:', error);
        }
        await endFocusSession();
        setShowFocusOverlay(false);
      }
    }
  };

  const handleReset = async () => {
    if (isRunning) {
      // Save partial session if resetting while running
      const timeSpent = originalTime - timeRemaining;
      if (timeSpent > 60) { // Only save if at least 1 minute was spent
        const partialSession = {
          duration: timeSpent,
          completedAt: new Date().toISOString(),
        };
        const updatedSessions = [...completedSessions, partialSession];
        setCompletedSessions(updatedSessions);
        await AsyncStorage.setItem('completedSessions', JSON.stringify(updatedSessions));
      }
    }
    setIsRunning(false);
    setTimeRemaining(originalTime);
    if (focusModeEnabled) {
      await endFocusSession();
      setShowFocusOverlay(false);
    }
  };

  const handleTimeSelect = async (newTime: number) => {
    if (!isRunning) {
      setTimeRemaining(newTime);
      setOriginalTime(newTime);
      // Save selected duration for next time
      await AsyncStorage.setItem('lastTimerDuration', newTime.toString());
    }
    setShowTimeSelector(false);
  };

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background.dark }]}>
        <View style={styles.loadingContainer}>
          <Text style={[styles.loadingText, { color: theme.colors.text.primary }]}>
            Loading timer...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background.dark }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
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
              Total time: {formatDuration(completedSessions.reduce((sum, session) => sum + session.duration, 0))}
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
          </View>
        </View>
      </Modal>

      <FocusOverlay
        visible={showFocusOverlay}
        onRequestClose={() => setShowFocusOverlay(false)}
        onEndSession={(remainingTime) => {
          // Save partial session if at least 1 minute was spent
          const timeSpent = originalTime - Math.floor(remainingTime / 1000);
          if (timeSpent > 60) {
            const partialSession = {
              duration: timeSpent,
              completedAt: new Date().toISOString(),
            };
            const updatedSessions = [...completedSessions, partialSession];
            setCompletedSessions(updatedSessions);
            AsyncStorage.setItem('completedSessions', JSON.stringify(updatedSessions))
              .catch(error => console.error('Error saving partial session:', error));
          }
          
          setShowFocusOverlay(false);
          setIsRunning(false);
          setTimeRemaining(originalTime);
        }}
      />
    </SafeAreaView>
  );
};

export default ReadingTimerScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
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
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.xl,
  },
  timeSelector: {
    alignItems: 'center',
  },
  timer: {
    fontSize: 64,
    fontWeight: '300',
    fontFamily: 'monospace',
  },
  changeTimeHint: {
    marginTop: SPACING.sm,
    fontSize: 14,
  },
  sessionInfo: {
    marginTop: SPACING.xl,
    alignItems: 'center',
  },
  sessionText: {
    fontSize: 14,
    marginBottom: SPACING.xs,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: SPACING.md,
    marginTop: SPACING.xl,
  },
  button: {
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.xl,
    borderRadius: 8,
    minWidth: 100,
    alignItems: 'center',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  instructions: {
    marginTop: SPACING.xl,
    textAlign: 'center',
    fontSize: 14,
    lineHeight: 20,
    maxWidth: 300,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    padding: SPACING.xl,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: SPACING.lg,
    textAlign: 'center',
  },
  timeOption: {
    paddingVertical: SPACING.lg,
    paddingHorizontal: SPACING.xl,
    borderRadius: 8,
    marginBottom: SPACING.sm,
  },
  timeOptionText: {
    fontSize: 16,
    fontWeight: '500',
    textAlign: 'center',
  },
});
