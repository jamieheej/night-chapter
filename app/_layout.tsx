import { Stack } from 'expo-router';
import React, { useEffect, useState } from 'react';
import SplashScreen from './components/SplashScreen';
import { ThemeProvider } from './context/ThemeContext';

export default function RootLayout() {
  const [isLoading, setIsLoading] = useState<boolean>(true);
  
  useEffect(() => {
    // Simulate loading time for splash screen
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 2000);
    
    return () => clearTimeout(timer);
  }, []);
  
  if (isLoading) {
    return <SplashScreen />;
  }
  
  return (
    <ThemeProvider>
      <Stack
        screenOptions={{
          headerShown: false,
        }}
      />
    </ThemeProvider>
  );
}
