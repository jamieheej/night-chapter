import AsyncStorage from "@react-native-async-storage/async-storage";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "../firebase/config";
import { FocusModeSettings } from "../types/focus";
import { Session } from "../types/reading";
import { ReadingStreak } from "../utils/streakUtils";

// Keys for AsyncStorage
const STORAGE_KEYS = {
  SESSIONS: "completedSessions",
  STREAK: "readingStreak",
  FOCUS_SETTINGS: "focusModeSettings",
  LAST_SYNC: "lastSyncTimestamp",
};

export const syncToFirebase = async (userId: string): Promise<void> => {
  try {
    // Get last sync timestamp
    const lastSync = await AsyncStorage.getItem(STORAGE_KEYS.LAST_SYNC);
    const lastSyncTime = lastSync ? parseInt(lastSync) : 0;
    const currentTime = Date.now();

    // Sync sessions
    const sessionsData = await AsyncStorage.getItem(STORAGE_KEYS.SESSIONS);
    if (sessionsData) {
      const sessions: Session[] = JSON.parse(sessionsData);
      await setDoc(doc(db, "sessions", userId), {
        sessions,
        updatedAt: new Date().toISOString(),
      });
    }

    // Sync streak
    const streakData = await AsyncStorage.getItem(STORAGE_KEYS.STREAK);
    if (streakData) {
      const streak: ReadingStreak = JSON.parse(streakData);
      await setDoc(doc(db, "streaks", userId), {
        ...streak,
        updatedAt: new Date().toISOString(),
      });
    }

    // Sync focus mode settings
    const settingsData = await AsyncStorage.getItem(
      STORAGE_KEYS.FOCUS_SETTINGS
    );
    if (settingsData) {
      const settings: FocusModeSettings = JSON.parse(settingsData);
      await setDoc(doc(db, "settings", userId), {
        focusMode: settings,
        updatedAt: new Date().toISOString(),
      });
    }

    // Update last sync timestamp
    await AsyncStorage.setItem(STORAGE_KEYS.LAST_SYNC, currentTime.toString());
  } catch (error) {
    console.error("Error syncing to Firebase:", error);
    throw error;
  }
};

export const syncFromFirebase = async (userId: string): Promise<void> => {
  try {
    // Fetch sessions
    const sessionsDoc = await getDoc(doc(db, "sessions", userId));
    if (sessionsDoc.exists()) {
      const { sessions } = sessionsDoc.data();
      await AsyncStorage.setItem(
        STORAGE_KEYS.SESSIONS,
        JSON.stringify(sessions)
      );
    }

    // Fetch streak
    const streakDoc = await getDoc(doc(db, "streaks", userId));
    if (streakDoc.exists()) {
      const streak = streakDoc.data();
      await AsyncStorage.setItem(STORAGE_KEYS.STREAK, JSON.stringify(streak));
    }

    // Fetch settings
    const settingsDoc = await getDoc(doc(db, "settings", userId));
    if (settingsDoc.exists()) {
      const { focusMode } = settingsDoc.data();
      if (focusMode) {
        await AsyncStorage.setItem(
          STORAGE_KEYS.FOCUS_SETTINGS,
          JSON.stringify(focusMode)
        );
      }
    }

    // Update last sync timestamp
    await AsyncStorage.setItem(STORAGE_KEYS.LAST_SYNC, Date.now().toString());
  } catch (error) {
    console.error("Error syncing from Firebase:", error);
    throw error;
  }
};
