import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

type ThemeMode = 'dark' | 'light';

interface ThemeColors {
  background: string;
  surface: string;
  surfaceHover: string;
  card: string;
  text: string;
  textSecondary: string;
  textMuted: string;
  primary: string;
  primaryText: string;
  border: string;
  danger: string;
  success: string;
  warning: string;
}

interface ThemeContextType {
  theme: ThemeMode;
  colors: ThemeColors;
  isDark: boolean;
  toggleTheme: () => void;
  setTheme: (theme: ThemeMode) => void;
}

const darkColors: ThemeColors = {
  background: '#1a2332',
  surface: '#2d3748',
  surfaceHover: '#374151',
  text: '#ffffff',
  textSecondary: '#b0c4de',
  textMuted: '#9ca3af',
  primary: '#4a90e2',
  primaryText: '#ffffff',
  border: '#4a5568',
  danger: '#cc0000',
  success: '#2d4a3e',
  warning: '#4a3a2d',
};

const lightColors: ThemeColors = {
  background: '#f5f7fa',
  surface: '#ffffff',
  surfaceHover: '#f0f0f0',
  text: '#1a2332',
  textSecondary: '#4a5568',
  textMuted: '#6b7280',
  primary: '#3b82f6',
  primaryText: '#ffffff',
  border: '#e5e7eb',
  danger: '#dc2626',
  success: '#dcfce7',
  warning: '#fef3c7',
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const THEME_STORAGE_KEY = '@veterans_app_theme';

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<ThemeMode>('light');

  useEffect(() => {
    loadStoredTheme();
  }, []);

  const loadStoredTheme = async () => {
    try {
      const storedTheme = await AsyncStorage.getItem(THEME_STORAGE_KEY);
      if (storedTheme === 'light' || storedTheme === 'dark') {
        setThemeState(storedTheme);
      }
    } catch (error) {
      console.error('Error loading theme:', error);
    }
  };

  const setTheme = async (newTheme: ThemeMode) => {
    try {
      await AsyncStorage.setItem(THEME_STORAGE_KEY, newTheme);
      setThemeState(newTheme);
    } catch (error) {
      console.error('Error saving theme:', error);
    }
  };

  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
  };

  const colors = theme === 'dark' ? darkColors : lightColors;

  return (
    <ThemeContext.Provider value={{ theme, colors, toggleTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
