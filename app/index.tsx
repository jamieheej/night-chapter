import { useRouter } from 'expo-router';
import React from 'react';
import { SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useAuth } from './context/AuthContext';
import { useTheme } from './context/ThemeContext';
import { SPACING } from './styles/theme';

export default function HomeScreen() {
  const router = useRouter();
  const { theme } = useTheme();
  const { signInWithApple, signInWithGoogle, signInAsGuest } = useAuth();
  
  const handleAppleLogin = async () => {
    try {
      await signInWithApple();
      router.replace('/dashboard');
    } catch (error) {
      console.error('Apple login error:', error);
    }
  };
  
  const handleGoogleLogin = async () => {
    try {
      await signInWithGoogle();
      router.replace('/dashboard');
    } catch (error) {
      console.error('Google login error:', error);
    }
  };
  
  const handleGuestMode = async () => {
    try {
      await signInAsGuest();
      router.replace('/dashboard');
    } catch (error) {
      console.error('Guest mode error:', error);
    }
  };
  
  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background.dark }]}>
      <View style={styles.content}>
        <View style={styles.logoContainer}>
          <Text style={styles.logo}>📚</Text>
          <Text style={[styles.appName, { color: theme.colors.text.primary }]}>
            NightChapter
          </Text>
          <Text style={[styles.tagline, { color: theme.colors.text.secondary }]}>
            Your mindful reading companion for better sleep
          </Text>
        </View>
        
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[styles.button, { backgroundColor: '#000000' }]}
            onPress={handleAppleLogin}
          >
            <Text style={[styles.buttonText, { color: '#FFFFFF' }]}>
              Continue with Apple
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.button, { backgroundColor: '#4285F4' }]}
            onPress={handleGoogleLogin}
          >
            <Text style={[styles.buttonText, { color: '#FFFFFF' }]}>
              Continue with Google
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.button, { backgroundColor: theme.colors.background.card }]}
            onPress={handleGuestMode}
          >
            <Text style={[styles.buttonText, { color: theme.colors.text.primary }]}>
              Continue as Guest
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: SPACING.lg,
    justifyContent: 'space-between',
  },
  logoContainer: {
    alignItems: 'center',
    marginTop: SPACING.xxl * 2,
  },
  logo: {
    fontSize: 64,
    marginBottom: SPACING.lg,
  },
  appName: {
    fontSize: 32,
    fontWeight: '700',
    marginBottom: SPACING.sm,
  },
  tagline: {
    fontSize: 16,
    textAlign: 'center',
    maxWidth: '80%',
  },
  buttonContainer: {
    marginBottom: SPACING.xl,
  },
  button: {
    borderRadius: 12,
    paddingVertical: SPACING.lg,
    marginBottom: SPACING.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
  },
}); 