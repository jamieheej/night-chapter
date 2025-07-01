import * as Notifications from "expo-notifications";
import { DateTriggerInput } from "expo-notifications";
import { Platform } from "react-native";

// Define the TimerSchedule interface
interface TimerSchedule {
  time: string;
  days: string[];
  repeat: boolean;
  alarm: boolean;
  createdAt: string;
  isTestMode?: boolean; // Add test mode flag
}

// Configure notifications for both foreground and background behavior
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true, // Show alert even when app is in foreground
    shouldPlaySound: true, // Play sound if enabled
    shouldSetBadge: true, // Show badge count
    shouldShowBanner: true, // Show banner notification
    shouldShowList: true, // Show in notification list
  }),
});

// Request permissions with all necessary options
export const requestNotificationPermissions = async (): Promise<boolean> => {
  try {
    if (Platform.OS === "android") {
      await Notifications.setNotificationChannelAsync("reading-timer", {
        name: "Reading Timer",
        importance: Notifications.AndroidImportance.HIGH,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: "#FF231F7C",
        lockscreenVisibility:
          Notifications.AndroidNotificationVisibility.PUBLIC,
        showBadge: true,
      });
    }

    const { status } = await Notifications.requestPermissionsAsync({
      ios: {
        allowAlert: true,
        allowBadge: true,
        allowSound: true,
        allowCriticalAlerts: true,
        provideAppNotificationSettings: true,
      },
    });

    return status === "granted";
  } catch (error) {
    console.error("Failed to request notification permissions:", error);
    return false;
  }
};

// Schedule a notification
export const scheduleReadingTimerNotification = async (
  schedule: TimerSchedule
): Promise<string[]> => {
  // Cancel any existing notifications first
  await cancelAllScheduledNotifications();

  const hasPermission = await requestNotificationPermissions();
  if (!hasPermission) {
    console.log("No notification permission");
    return [];
  }

  try {
    if (schedule.isTestMode) {
      // For testing: Schedule only one notification 30 seconds from now
      const notificationDate = new Date(Date.now() + 30 * 1000);
      const id = await Notifications.scheduleNotificationAsync({
        content: {
          title: "Test Notification",
          body: "This is a test notification for your reading reminder.",
          sound: schedule.alarm ? true : undefined,
        },
        trigger: {
          date: notificationDate,
          repeats: false,
        } as unknown as DateTriggerInput,
      });
      return [id];
    }

    // For regular scheduling, handle each selected day
    const time = new Date(schedule.time);
    const notificationPromises = schedule.days.map(async (day) => {
      const dayIndex = [
        "Sunday",
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday",
      ].indexOf(day);
      if (dayIndex === -1) return null;

      const notificationDate = getNextDayOfWeek(dayIndex, time);

      return await Notifications.scheduleNotificationAsync({
        content: {
          title: "Time to Read!",
          body: "Your scheduled reading session is starting now.",
          sound: schedule.alarm ? true : undefined,
        },
        trigger: {
          date: notificationDate,
          repeats: schedule.repeat,
        } as unknown as DateTriggerInput,
      });
    });

    const notificationIds = await Promise.all(notificationPromises);
    return notificationIds.filter((id): id is string => id !== null);
  } catch (error) {
    console.error("Failed to schedule notifications:", error);
    throw error;
  }
};

// Helper function to get the next occurrence of a specific day of the week
const getNextDayOfWeek = (dayIndex: number, time: Date): Date => {
  const result = new Date();
  result.setDate(result.getDate() + ((dayIndex + 7 - result.getDay()) % 7));
  result.setHours(time.getHours());
  result.setMinutes(time.getMinutes());
  result.setSeconds(0);
  result.setMilliseconds(0);

  // If the calculated date is in the past, add 7 days
  if (result < new Date()) {
    result.setDate(result.getDate() + 7);
  }

  return result;
};

// Cancel all scheduled notifications
export const cancelAllScheduledNotifications = async (): Promise<void> => {
  await Notifications.cancelAllScheduledNotificationsAsync();
};
