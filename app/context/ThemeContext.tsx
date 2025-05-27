import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, ReactNode, useContext, useEffect, useState } from 'react';

// Define your theme types
interface Theme {
  colors: {
    primary: string;
    background: {
      dark: string;
      card: string;
    };
    text: {
      primary: string;
      secondary: string;
      tertiary: string;
    };
    divider: string;
    error: string;
  };
}

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
  isDark: boolean;
}

// Default dark theme
const defaultTheme: Theme = {
  colors: {
    primary: '#8B5CF6',
    background: {
      dark: '#000000',
      card: '#1C1C1E',
    },
    text: {
      primary: '#FFFFFF',
      secondary: '#8E8E93',
      tertiary: '#48484A',
    },
    divider: '#38383A',
    error: '#FF3B30',
  },
};

// Light theme
const lightTheme: Theme = {
  colors: {
    primary: '#8B5CF6',
    background: {
      dark: '#FFFFFF',
      card: '#F2F2F7',
    },
    text: {
      primary: '#000000',
      secondary: '#3C3C43',
      tertiary: '#8E8E93',
    },
    divider: '#C6C6C8',
    error: '#FF3B30',
  },
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isDark, setIsDark] = useState(true);
  const [theme, setTheme] = useState<Theme>(defaultTheme);

  useEffect(() => {
    loadTheme();
  }, []);

  const loadTheme = async () => {
    try {
      const savedTheme = await AsyncStorage.getItem('theme');
      if (savedTheme) {
        const isDarkMode = savedTheme === 'dark';
        setIsDark(isDarkMode);
        setTheme(isDarkMode ? defaultTheme : lightTheme);
      }
    } catch (error) {
      console.error('Error loading theme:', error);
    }
  };

  const toggleTheme = async () => {
    try {
      const newIsDark = !isDark;
      setIsDark(newIsDark);
      setTheme(newIsDark ? defaultTheme : lightTheme);
      await AsyncStorage.setItem('theme', newIsDark ? 'dark' : 'light');
    } catch (error) {
      console.error('Error saving theme:', error);
    }
  };

  const value = {
    theme,
    toggleTheme,
    isDark,
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}; 