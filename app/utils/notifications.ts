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
}

// Configure notifications
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

// Request permissions
export const requestNotificationPermissions = async (): Promise<boolean> => {
  if (Platform.OS === "android") {
    await Notifications.setNotificationChannelAsync("reading-timer", {
      name: "Reading Timer",
      importance: Notifications.AndroidImportance.HIGH,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: "#FF231F7C",
    });
  }

  const { status } = await Notifications.requestPermissionsAsync();
  return status === "granted";
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

  const time = new Date(schedule.time);

  // For each selected day, schedule a notification
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

    // Calculate next occurrence of this day
    const notificationDate = getNextDayOfWeek(dayIndex, time);

    // Schedule the notification
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
