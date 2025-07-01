import React, { useEffect, useState } from 'react';
import {
  AppState,
  AppStateStatus,
  BackHandler,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { SPACING } from '../styles/theme';
import { endFocusSession, getActiveFocusSession } from '../utils/focusMode';

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
    const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
      if (visible) {
        handleEndSession();
        return true;
      }
      return false;
    });
    
    return () => {
      subscription?.remove();
      backHandler.remove();
    };
  }, [visible]);

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
      if (!session) {
        handleEndSession();
      }
    }
    setAppState(nextAppState);
  };

  const updateTimeRemaining = async () => {
    const session = await getActiveFocusSession();
    if (session) {
      setTimeRemaining(Math.max(0, session.timeRemaining));
      if (session.timeRemaining <= 0) {
        handleEndSession();
      }
    }
  };

  const handleEndSession = async () => {
    await endFocusSession();
    onEndSession();
  };

  const formatTime = (ms: number): string => {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  if (!visible) return null;

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={handleEndSession}
    >
      <View style={[styles.overlay, { backgroundColor: theme.colors.background.dark }]}>
        <View style={styles.content}>
          <Text style={[styles.title, { color: theme.colors.text.primary }]}>
            Focus Mode Active
          </Text>
          <Text style={[styles.timer, { color: theme.colors.text.primary }]}>
            {formatTime(timeRemaining)}
          </Text>
          <Text style={[styles.description, { color: theme.colors.text.secondary }]}>
            Stay focused on your reading. Take a deep breath and return to your book.
          </Text>
          <TouchableOpacity
            style={[styles.button, { backgroundColor: theme.colors.error }]}
            onPress={handleEndSession}
          >
            <Text style={styles.buttonText}>End Session</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    padding: SPACING.xl,
    borderRadius: 16,
    alignItems: 'center',
    width: '80%',
  },
  title: {
    fontSize: 24,
    fontWeight: '600',
    marginBottom: SPACING.lg,
    textAlign: 'center',
  },
  timer: {
    fontSize: 48,
    fontWeight: '700',
    marginBottom: SPACING.xl,
  },
  description: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: SPACING.xl,
    lineHeight: 24,
  },
  button: {
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.xl,
    borderRadius: 8,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
}); 