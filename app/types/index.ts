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

export type RootStackParamList = {
  Home: undefined;
  ReadingTimer: undefined;
  dashboard: undefined;
  "reading/ReadingTimerScreen": undefined;
  "(screens)/reading/Timer": undefined;
  "(screens)/reading/journal": {
    totalDuration: string;
    sessionsCount: string;
  };
  "(screens)/settings/Settings": undefined;
  "(screens)/settings/Notifications": undefined;
  "(screens)/settings/Theme": undefined;
  "(screens)/settings/SignIn": undefined;
  "(screens)/journal/Journals": undefined;
  "(screens)/journal/CreateJournal": undefined;
  "(screens)/journal/Notes": {
    bookTitle: string;
    bookData: string;
  };
  "(screens)/journal/NoteDetail": {
    noteId: string;
    noteData: string;
  };
  "(screens)/journal/EditNote": {
    noteId: string;
    noteData: string;
  };
};
