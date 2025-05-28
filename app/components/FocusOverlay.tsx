import React, { useEffect, useState } from 'react';
import {
    AppState,
    AppStateStatus,
    Dimensions,
    Modal,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { SPACING } from '../styles/theme';
import { endFocusSession, getActiveFocusSession, showFocusBreakWarning } from '../utils/focusMode';

interface FocusOverlayProps {
  visible: boolean;
  onRequestClose: () => void;
  onEndSession: () => void;
}

export default function FocusOverlay({ visible, onRequestClose, onEndSession }: FocusOverlayProps) {
  const { theme } = useTheme();
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [appState, setAppState] = useState(AppState.currentState);

  useEffect(() => {
    const subscription = AppState.addEventListener('change', handleAppStateChange);
    return () => subscription?.remove();
  }, []);

  useEffect(() => {
    if (visible) {
      const interval = setInterval(updateTimeRemaining, 1000);
      return () => clearInterval(interval);
    }
  }, [visible]);

  const handleAppStateChange = async (nextAppState: AppStateStatus) => {
    if (appState.match(/inactive|background/) && nextAppState === 'active' && visible) {
      // App came back to foreground during focus session
      const session = await getActiveFocusSession();
      if (session) {
        const shouldBreak = await showFocusBreakWarning(session.blockLevel || 'moderate');
        if (shouldBreak) {
          handleEndSession();
        }
      }
    }
    setAppState(nextAppState);
  };

  const updateTimeRemaining = async () => {
    const session = await getActiveFocusSession();
    if (session) {
      setTimeRemaining(Math.max(0, Math.floor(session.timeRemaining / 1000)));
    } else {
      // Session ended
      onRequestClose();
    }
  };

  const handleEndSession = async () => {
    await endFocusSession();
    onEndSession();
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleBreakFocus = async () => {
    const shouldBreak = await showFocusBreakWarning('moderate');
    if (shouldBreak) {
      handleEndSession();
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent={false}
      onRequestClose={onRequestClose}
    >
      <View style={[styles.container, { backgroundColor: theme.colors.background.dark }]}>
        <View style={styles.content}>
          <View style={styles.iconContainer}>
            <Text style={styles.icon}>📚</Text>
          </View>
          
          <Text style={[styles.title, { color: theme.colors.text.primary }]}>
            Focus Mode Active
          </Text>
          
          <Text style={[styles.subtitle, { color: theme.colors.text.secondary }]}>
            You&apos;re in a reading session
          </Text>

          <View style={[styles.timerContainer, { backgroundColor: theme.colors.background.card }]}>
            <Text style={[styles.timeLabel, { color: theme.colors.text.secondary }]}>
              Time Remaining
            </Text>
            <Text style={[styles.timeDisplay, { color: theme.colors.primary }]}>
              {formatTime(timeRemaining)}
            </Text>
          </View>
          
          <View style={styles.messageContainer}>
            <Text style={[styles.message, { color: theme.colors.text.secondary }]}>
              Stay focused on your reading. Minimize distractions and immerse yourself in your book.
            </Text>
          </View>
          
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[styles.button, styles.primaryButton, { backgroundColor: theme.colors.primary }]}
              onPress={onRequestClose}
            >
              <Text style={styles.primaryButtonText}>Return to Reading</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.button, styles.secondaryButton, { borderColor: theme.colors.divider }]}
              onPress={handleBreakFocus}
            >
              <Text style={[styles.secondaryButtonText, { color: theme.colors.text.secondary }]}>
                End Session
              </Text>
            </TouchableOpacity>
          </View>
        </View>
        
        <View style={styles.footer}>
          <Text style={[styles.footerText, { color: theme.colors.text.tertiary }]}>
            NightChapter Focus Mode
          </Text>
        </View>
      </View>
    </Modal>
  );
}

const { height } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.xl,
  },
  content: {
    alignItems: 'center',
    maxWidth: 320,
  },
  iconContainer: {
    marginBottom: SPACING.xl,
  },
  icon: {
    fontSize: 64,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: SPACING.sm,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: SPACING.xl,
  },
  timerContainer: {
    borderRadius: 16,
    padding: SPACING.xl,
    alignItems: 'center',
    marginBottom: SPACING.xl,
    minWidth: 200,
  },
  timeLabel: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: SPACING.sm,
  },
  timeDisplay: {
    fontSize: 48,
    fontWeight: '300',
    fontFamily: 'monospace',
  },
  messageContainer: {
    marginBottom: SPACING.xl,
  },
  message: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
  },
  buttonContainer: {
    width: '100%',
    gap: SPACING.md,
  },
  button: {
    borderRadius: 12,
    paddingVertical: SPACING.lg,
    paddingHorizontal: SPACING.xl,
    alignItems: 'center',
  },
  primaryButton: {
    // backgroundColor set dynamically
  },
  secondaryButton: {
    borderWidth: 1,
    backgroundColor: 'transparent',
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  secondaryButtonText: {
    fontSize: 16,
    fontWeight: '500',
  },
  footer: {
    position: 'absolute',
    bottom: SPACING.xl,
  },
  footerText: {
    fontSize: 12,
  },
}); 