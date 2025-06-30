import { Stack } from 'expo-router';
import React from 'react';

export default function ScreenLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen name="reading" />
      <Stack.Screen name="settings" />
      <Stack.Screen name="journal" />
      <Stack.Screen name="auth" />
    </Stack>
  );
} 