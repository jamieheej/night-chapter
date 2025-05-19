// Global type definitions

export interface User {
  id: string;
  email?: string;
  displayName?: string;
  isGuest?: boolean;
  photoURL?: string;
}

export interface ReadingSession {
  id: string;
  date: string;
  duration: number; // in minutes
  completed: boolean;
  bookTitle?: string;
  notes?: string;
}

export interface JournalEntry {
  id: string;
  date: string;
  content: string;
  bookTitle?: string;
  mood?: string;
  tags?: string[];
}

export interface ReadingStreak {
  currentStreak: number;
  longestStreak: number;
  lastReadDate: string | null;
}

export interface UserSettings {
  bedtime: {
    hour: number;
    minute: number;
  };
  readingDuration: number; // in minutes
  notifications: {
    enabled: boolean;
    reminderTime: number; // minutes before bedtime
  };
  focusMode: {
    blockLevel: "gentle" | "moderate" | "strict";
    autoEnable: boolean;
  };
  theme: "dark" | "light" | "system";
}
