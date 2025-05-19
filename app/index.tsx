import { useRouter } from 'expo-router';
import React from 'react';
import { SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useTheme } from './context/ThemeContext';
import { SPACING } from './styles/theme';

export default function HomeScreen() {
  const router = useRouter();
  const { theme } = useTheme();
  
  const handleAppleLogin = () => {
    // Implement Apple login logic
    console.log('Apple login pressed');
    // After successful login:
    router.replace('/dashboard');
  };
  
  const handleGoogleLogin = () => {
    // Implement Google login logic
    console.log('Google login pressed');
    // After successful login:
    router.replace('/dashboard');
  };
  
  const handleGuestMode = () => {
    // Implement guest mode logic
    console.log('Guest mode pressed');
    router.replace('/dashboard');
  };
  
  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background.dark }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: theme.colors.text.primary }]}>
          NightChapter
        </Text>
        <Text style={[styles.subtitle, { color: theme.colors.text.secondary }]}>
          Read to Sleep, Mindfully
        </Text>
      </View>
      
      <View style={styles.imageContainer}>
        {/* You can add an illustration or logo here */}
        <View style={[styles.imagePlaceholder, { backgroundColor: theme.colors.background.card }]}>
          <Text style={{ color: theme.colors.text.secondary }}>App Logo/Illustration</Text>
        </View>
      </View>
      
      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.button, { backgroundColor: '#000000' }]}
          onPress={handleAppleLogin}
        >
          <Text style={[styles.buttonText, { color: '#FFFFFF' }]}>
            Sign in with Apple
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.button, { backgroundColor: '#4285F4' }]}
          onPress={handleGoogleLogin}
        >
          <Text style={[styles.buttonText, { color: '#FFFFFF' }]}>
            Sign in with Google
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.button, { backgroundColor: theme.colors.background.card }]}
          onPress={handleGuestMode}
        >
          <Text style={[styles.buttonText, { color: theme.colors.text.primary }]}>
            Try Guest Mode
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: SPACING.lg,
  },
  header: {
    alignItems: 'center',
    marginTop: SPACING.xxl,
  },
  title: {
    fontSize: 36,
    fontWeight: '700',
    marginBottom: SPACING.xs,
  },
  subtitle: {
    fontSize: 16,
    fontWeight: '400',
  },
  imageContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  imagePlaceholder: {
    width: 200,
    height: 200,
    borderRadius: 100,
    justifyContent: 'center',
    alignItems: 'center',
  },
  footer: {
    marginBottom: SPACING.xl,
  },
  button: {
    borderRadius: 8,
    paddingVertical: SPACING.md,
    marginBottom: SPACING.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
  },
}); 