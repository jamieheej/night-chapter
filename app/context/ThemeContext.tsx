import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, ReactNode, useContext, useEffect, useState } from 'react';
import { useColorScheme } from 'react-native';
import { darkTheme, lightTheme } from '../styles/theme';

// Define ThemeType locally
type ThemeType = typeof darkTheme;

type ThemeContextType = {
  theme: ThemeType;
  isDark: boolean;
  themeMode: string;
  toggleTheme: () => Promise<void>;
  setThemeMode: (mode: 'dark' | 'light' | 'system') => Promise<void>;
};

const ThemeContext = createContext<ThemeContextType>({
  theme: darkTheme,
  isDark: true,
  themeMode: 'system',
  toggleTheme: async () => {},
  setThemeMode: async () => {},
});

type ThemeProviderProps = {
  children: ReactNode;
};

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const deviceTheme = useColorScheme();
  const [themeMode, setThemeModeState] = useState<'dark' | 'light' | 'system'>('system');
  const [theme, setTheme] = useState<ThemeType>(deviceTheme === 'dark' ? darkTheme : lightTheme);
  
  // Load saved theme preference
  useEffect(() => {
    const loadThemePreference = async () => {
      try {
        const savedThemeMode = await AsyncStorage.getItem('themeMode');
        if (savedThemeMode && (savedThemeMode === 'dark' || savedThemeMode === 'light' || savedThemeMode === 'system')) {
          setThemeModeState(savedThemeMode);
          
          if (savedThemeMode === 'dark') {
            setTheme(darkTheme);
          } else if (savedThemeMode === 'light') {
            setTheme(lightTheme);
          } else {
            // System default
            setTheme(deviceTheme === 'dark' ? darkTheme : lightTheme);
          }
        }
      } catch (error) {
        console.error('Error loading theme preference:', error);
      }
    };
    
    loadThemePreference();
  }, [deviceTheme]);
  
  // Update theme when device theme changes (if using system preference)
  useEffect(() => {
    if (themeMode === 'system') {
      setTheme(deviceTheme === 'dark' ? darkTheme : lightTheme);
    }
  }, [deviceTheme, themeMode]);
  
  const toggleTheme = async (): Promise<void> => {
    const newThemeMode = theme.isDark ? 'light' : 'dark';
    setThemeModeState(newThemeMode as 'dark' | 'light' | 'system');
    setTheme(theme.isDark ? lightTheme : darkTheme);
    
    try {
      await AsyncStorage.setItem('themeMode', newThemeMode);
    } catch (error) {
      console.error('Error saving theme preference:', error);
    }
  };
  
  const setThemeMode = async (mode: 'dark' | 'light' | 'system'): Promise<void> => {
    try {
      await AsyncStorage.setItem('themeMode', mode);
      
      if (mode === 'dark') {
        setTheme(darkTheme);
      } else if (mode === 'light') {
        setTheme(lightTheme);
      } else {
        // System default
        setTheme(deviceTheme === 'dark' ? darkTheme : lightTheme);
      }
      
      setThemeModeState(mode);
    } catch (error) {
      console.error('Error setting theme mode:', error);
    }
  };
  
  return (
    <ThemeContext.Provider
      value={{
        theme,
        isDark: theme.isDark,
        themeMode,
        toggleTheme,
        setThemeMode,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext); 