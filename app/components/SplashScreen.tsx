import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { COLORS, FONTS, SPACING } from '../styles/theme';

const SplashScreen: React.FC = () => {

const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: COLORS.background.dark,
      alignItems: 'center',
      justifyContent: 'center',
    },
    title: {
      fontSize: 36,
      fontWeight: '700',
      color: COLORS.text.primary,
      marginBottom: SPACING.md,
    },
    subtitle: {
      fontSize: FONTS.sizes.md,
      color: COLORS.text.secondary,
    },
  });
  return (
    <View style={styles.container}>
      <Text style={styles.title}>NightChapter</Text>
      <Text style={styles.subtitle}>Read to Sleep, Mindfully</Text>
    </View>
  );
};


export default SplashScreen; 