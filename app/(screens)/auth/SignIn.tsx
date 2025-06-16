import { useRouter } from 'expo-router';
import React from 'react';
import {
  Alert,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { SPACING } from '../../styles/theme';

export default function SignIn() {
  const { theme } = useTheme();
  const { signInWithGoogle, signInWithApple, signInAsGuest, isLoading } = useAuth();
  const router = useRouter();

  const handleGoogleSignIn = async () => {
    try {
      console.log('Starting Google sign-in from SignIn screen...');
      await signInWithGoogle();
      console.log('Google sign-in successful, navigating to dashboard...');
      router.replace('/dashboard');
    } catch (error) {
      console.error('Google sign-in error in SignIn screen:', error);
      if (error instanceof Error) {
        console.error('Error message:', error.message);
        console.error('Error stack:', error.stack);
      }
      console.error('Full error object:', JSON.stringify(error, null, 2));
      Alert.alert('Error', 'Failed to sign in with Google. Please try again.');
    }
  };

  const handleAppleSignIn = async () => {
    try {
      await signInWithApple();
      router.replace('/dashboard');
    } catch (error) {
      Alert.alert('Error', 'Failed to sign in with Apple. Please try again.');
      console.error('Apple sign-in error:', error);
    }
  };

  const handleGuestMode = async () => {
    try {
      await signInAsGuest();
      router.replace('/dashboard');
    } catch (error) {
      Alert.alert('Error', 'Failed to continue as guest');
    }
  };

  const handleBack = () => {
    router.back();
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background.dark }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBack} style={styles.backButton}>
          <Text style={[styles.backButtonText, { color: theme.colors.text.primary }]}>← Back</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        <View style={styles.logoContainer}>
          <Text style={styles.logo}>📚</Text>
          <Text style={[styles.appName, { color: theme.colors.text.primary }]}>
            NightChapter
          </Text>
          <Text style={[styles.tagline, { color: theme.colors.text.secondary }]}>
            Your personal reading companion
          </Text>
        </View>

        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[styles.signInButton, styles.googleButton]}
            onPress={handleGoogleSignIn}
            disabled={isLoading}
          >
            <Text style={styles.googleIcon}>G</Text>
            <Text style={styles.googleButtonText}>Continue with Google</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.signInButton, styles.appleButton, { backgroundColor: theme.colors.text.primary }]}
            onPress={handleAppleSignIn}
            disabled={isLoading}
          >
            <Text style={[styles.appleIcon, { color: theme.colors.background.dark }]}>🍎</Text>
            <Text style={[styles.appleButtonText, { color: theme.colors.background.dark }]}>
              Continue with Apple
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.signInButton, styles.guestButton, { borderColor: theme.colors.divider }]}
            onPress={handleGuestMode}
            disabled={isLoading}
          >
            <Text style={[styles.guestButtonText, { color: theme.colors.text.secondary }]}>
              Continue as Guest
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.benefitsContainer}>
          <Text style={[styles.benefitsTitle, { color: theme.colors.text.primary }]}>
            Why sign in?
          </Text>
          <View style={styles.benefit}>
            <Text style={styles.benefitIcon}>☁️</Text>
            <Text style={[styles.benefitText, { color: theme.colors.text.secondary }]}>
              Sync your reading data across devices
            </Text>
          </View>
          <View style={styles.benefit}>
            <Text style={styles.benefitIcon}>📊</Text>
            <Text style={[styles.benefitText, { color: theme.colors.text.secondary }]}>
              Advanced reading analytics
            </Text>
          </View>
          <View style={styles.benefit}>
            <Text style={styles.benefitIcon}>🔒</Text>
            <Text style={[styles.benefitText, { color: theme.colors.text.secondary }]}>
              Secure backup of your reading journey
            </Text>
          </View>
        </View>

        <Text style={[styles.disclaimer, { color: theme.colors.text.tertiary }]}>
          Guest mode stores data locally only. Sign in for cloud sync and premium features.
        </Text>
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
  },
  backButton: {
    alignSelf: 'flex-start',
  },
  backButtonText: {
    fontSize: 16,
  },
  content: {
    flex: 1,
    padding: SPACING.xl,
    justifyContent: 'center',
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: SPACING.xl * 2,
  },
  logo: {
    fontSize: 64,
    marginBottom: SPACING.md,
  },
  appName: {
    fontSize: 32,
    fontWeight: '700',
    marginBottom: SPACING.sm,
  },
  tagline: {
    fontSize: 16,
    textAlign: 'center',
  },
  buttonContainer: {
    marginBottom: SPACING.xl,
  },
  signInButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.lg,
    paddingHorizontal: SPACING.xl,
    borderRadius: 12,
    marginBottom: SPACING.md,
  },
  googleButton: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#DADCE0',
  },
  googleIcon: {
    fontSize: 18,
    fontWeight: '600',
    marginRight: SPACING.md,
    color: '#4285F4',
  },
  googleButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#3C4043',
  },
  appleButton: {
    // backgroundColor set dynamically
  },
  appleIcon: {
    fontSize: 18,
    marginRight: SPACING.md,
  },
  appleButtonText: {
    fontSize: 16,
    fontWeight: '500',
  },
  guestButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
  },
  guestButtonText: {
    fontSize: 16,
    fontWeight: '500',
  },
  benefitsContainer: {
    marginBottom: SPACING.xl,
  },
  benefitsTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: SPACING.lg,
    textAlign: 'center',
  },
  benefit: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  benefitIcon: {
    fontSize: 20,
    marginRight: SPACING.md,
    width: 30,
  },
  benefitText: {
    fontSize: 14,
    flex: 1,
  },
  disclaimer: {
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 18,
  },
}); 