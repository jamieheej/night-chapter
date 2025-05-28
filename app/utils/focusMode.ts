import AsyncStorage from "@react-native-async-storage/async-storage";
import { Alert } from "react-native";

export interface FocusModeSettings {
  enabled: boolean;
  blockLevel: "gentle" | "moderate" | "strict";
  allowedApps: string[];
  breakReminders: boolean;
}

const FOCUS_MODE_KEY = "focusModeSettings";
const FOCUS_SESSION_KEY = "activeFocusSession";

export const getFocusModeSettings = async (): Promise<FocusModeSettings> => {
  try {
    const settings = await AsyncStorage.getItem(FOCUS_MODE_KEY);
    if (settings) {
      return JSON.parse(settings);
    }
    return {
      enabled: true,
      blockLevel: "moderate",
      allowedApps: [],
      breakReminders: true,
    };
  } catch (error) {
    console.error("Error getting focus mode settings:", error);
    return {
      enabled: true,
      blockLevel: "moderate",
      allowedApps: [],
      breakReminders: true,
    };
  }
};

export const saveFocusModeSettings = async (
  settings: FocusModeSettings
): Promise<void> => {
  try {
    await AsyncStorage.setItem(FOCUS_MODE_KEY, JSON.stringify(settings));
  } catch (error) {
    console.error("Error saving focus mode settings:", error);
  }
};

export const startFocusSession = async (duration: number): Promise<void> => {
  try {
    const session = {
      startTime: Date.now(),
      duration: duration * 1000, // Convert to milliseconds
      active: true,
    };
    await AsyncStorage.setItem(FOCUS_SESSION_KEY, JSON.stringify(session));
  } catch (error) {
    console.error("Error starting focus session:", error);
  }
};

export const endFocusSession = async (): Promise<void> => {
  try {
    await AsyncStorage.removeItem(FOCUS_SESSION_KEY);
  } catch (error) {
    console.error("Error ending focus session:", error);
  }
};

export const getActiveFocusSession = async () => {
  try {
    const session = await AsyncStorage.getItem(FOCUS_SESSION_KEY);
    if (session) {
      const parsed = JSON.parse(session);
      const now = Date.now();
      const elapsed = now - parsed.startTime;

      if (elapsed < parsed.duration && parsed.active) {
        return {
          ...parsed,
          timeRemaining: parsed.duration - elapsed,
        };
      } else {
        // Session expired, clean up
        await endFocusSession();
        return null;
      }
    }
    return null;
  } catch (error) {
    console.error("Error getting active focus session:", error);
    return null;
  }
};

export const showFocusBreakWarning = (blockLevel: string) => {
  const messages = {
    gentle: {
      title: "Stay Focused! 📚",
      message:
        "You're in the middle of a reading session. Consider staying focused to get the most out of your reading time.",
      buttons: ["Continue Reading", "Take a Break"],
    },
    moderate: {
      title: "Focus Mode Active ⏰",
      message:
        "You're currently in a reading session. Breaking focus now might disrupt your flow. Are you sure you want to leave?",
      buttons: ["Stay Focused", "Leave Anyway"],
    },
    strict: {
      title: "Reading Session in Progress 🔒",
      message:
        "You're in strict focus mode. Leaving now will end your reading session. This action cannot be undone.",
      buttons: ["Continue Reading", "End Session"],
    },
  };

  const config =
    messages[blockLevel as keyof typeof messages] || messages.moderate;

  return new Promise((resolve) => {
    Alert.alert(config.title, config.message, [
      {
        text: config.buttons[0],
        style: "cancel",
        onPress: () => resolve(false),
      },
      {
        text: config.buttons[1],
        style: blockLevel === "strict" ? "destructive" : "default",
        onPress: () => resolve(true),
      },
    ]);
  });
};
