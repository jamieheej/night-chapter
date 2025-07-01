import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Notifications from "expo-notifications";
import { Alert, Linking, Platform } from "react-native";

export interface FocusModeSettings {
  enabled: boolean;
  doNotDisturb: boolean;
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
      doNotDisturb: true,
    };
  } catch (error) {
    console.error("Error getting focus mode settings:", error);
    return {
      enabled: true,
      doNotDisturb: true,
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

export const showFocusBreakWarning = () => {
  return new Promise((resolve) => {
    Alert.alert(
      "Focus Mode Active 📚",
      "You're in the middle of a reading session. Breaking focus now might disrupt your flow. Are you sure you want to leave?",
      [
        {
          text: "Stay Focused",
          style: "cancel",
          onPress: () => resolve(false),
        },
        {
          text: "Leave Anyway",
          style: "destructive",
          onPress: () => resolve(true),
        },
      ]
    );
  });
};

export const suppressNotifications = async () => {
  if (Platform.OS !== "ios") return;

  try {
    await Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowAlert: false,
        shouldPlaySound: false,
        shouldSetBadge: false,
        shouldShowBanner: false,
        shouldShowList: false,
      }),
    });
  } catch (error) {
    console.error("Failed to suppress notifications:", error);
  }
};

export const restoreNotifications = async () => {
  if (Platform.OS !== "ios") return;

  try {
    await Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: true,
        shouldShowBanner: true,
        shouldShowList: true,
      }),
    });
  } catch (error) {
    console.error("Failed to restore notifications:", error);
  }
};

export const openFocusSettings = () => {
  if (Platform.OS !== "ios") return;

  Alert.alert(
    "Enable Focus Mode",
    "To minimize distractions during reading, we recommend enabling Focus mode. Would you like to open Focus settings?",
    [
      {
        text: "Cancel",
        style: "cancel",
      },
      {
        text: "Open Settings",
        onPress: () => {
          // This URL scheme opens Focus settings on iOS
          Linking.openURL("App-prefs:root=FOCUS");
        },
      },
    ]
  );
};
