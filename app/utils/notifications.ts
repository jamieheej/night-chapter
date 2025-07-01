import * as Notifications from "expo-notifications";
import { Platform } from "react-native";

// Define the TimerSchedule interface
interface TimerSchedule {
  time: string;
  days: string[];
  repeat: boolean;
  alarm: boolean;
  createdAt: string;
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

// Helper function to get the next occurrence of a specific day of the week
const getNextDayOfWeek = (dayIndex: number, selectedTime: Date): Date => {
  const now = new Date();
  const result = new Date(now); // Create from current date to handle timezone correctly

  // Set the time components from the selected time
  result.setHours(selectedTime.getHours());
  result.setMinutes(selectedTime.getMinutes());
  result.setSeconds(0);
  result.setMilliseconds(0);

  // Calculate days to add
  const currentDay = result.getDay();
  let daysToAdd = dayIndex - currentDay;

  // If it's today and the time has passed, or if it's a past day, schedule for next week
  if (daysToAdd < 0 || (daysToAdd === 0 && result <= now)) {
    daysToAdd += 7;
  }

  result.setDate(result.getDate() + daysToAdd);
  console.log(`Scheduling notification:
    Selected day: ${dayIndex} (${
    ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][dayIndex]
  })
    Current day: ${currentDay} (${
    ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][currentDay]
  })
    Days to add: ${daysToAdd}
    Current time: ${now.toLocaleString()}
    Scheduled for: ${result.toLocaleString()}
  `);

  return result;
};

// Cancel all scheduled notifications
export const cancelAllScheduledNotifications = async (): Promise<void> => {
  try {
    await Notifications.cancelAllScheduledNotificationsAsync();
  } catch (error) {
    console.error("Failed to cancel notifications:", error);
    throw error;
  }
};

// Schedule a notification
export const scheduleReadingTimerNotification = async (
  schedule: TimerSchedule
): Promise<string[]> => {
  console.log("Starting notification scheduling...");

  // Cancel any existing notifications first
  await cancelAllScheduledNotifications();
  console.log("Cancelled existing notifications");

  const hasPermission = await requestNotificationPermissions();
  if (!hasPermission) {
    console.log("No notification permission");
    return [];
  }

  try {
    // For regular scheduling, handle each selected day
    const selectedTime = new Date(schedule.time);
    console.log(
      "Selected time for notifications:",
      selectedTime.toLocaleTimeString()
    );

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

      if (dayIndex === -1) {
        console.log(`Invalid day: ${day}`);
        return null;
      }

      const notificationDate = getNextDayOfWeek(dayIndex, selectedTime);

      if (notificationDate.getTime() <= Date.now()) {
        console.log(`Skipping past notification for ${day}`);
        return null;
      }

      console.log(
        `Scheduling notification for ${day} at ${notificationDate.toLocaleString()}`
      );

      // For non-repeating notifications
      if (!schedule.repeat) {
        return await Notifications.scheduleNotificationAsync({
          content: {
            title: "Time to Read!",
            body: "Your scheduled reading session is starting now.",
            sound: schedule.alarm ? true : undefined,
          },
          trigger: {
            type: Notifications.SchedulableTriggerInputTypes.DATE,
            date: notificationDate,
          },
        });
      }

      // For repeating notifications, schedule for next 4 occurrences
      const nextDates = [];
      let currentDate = notificationDate;
      for (let i = 0; i < 4; i++) {
        nextDates.push(currentDate);
        currentDate = new Date(currentDate);
        currentDate.setDate(currentDate.getDate() + 7);
      }

      const ids = await Promise.all(
        nextDates.map((date) =>
          Notifications.scheduleNotificationAsync({
            content: {
              title: "Time to Read!",
              body: "Your scheduled reading session is starting now.",
              sound: schedule.alarm ? true : undefined,
            },
            trigger: {
              type: Notifications.SchedulableTriggerInputTypes.DATE,
              date: date,
            },
          })
        )
      );

      return ids[0]; // Return the first ID for tracking
    });

    const notificationIds = await Promise.all(notificationPromises);
    const validIds = notificationIds.filter((id): id is string => id !== null);
    console.log(`Successfully scheduled ${validIds.length} notifications`);

    // Log all scheduled notifications
    const scheduledNotifications =
      await Notifications.getAllScheduledNotificationsAsync();
    console.log(
      "All scheduled notifications:",
      scheduledNotifications.map((n) => ({
        trigger: n.trigger,
        title: n.content.title,
        body: n.content.body,
      }))
    );

    return validIds;
  } catch (error) {
    console.error("Failed to schedule notifications:", error);
    throw error;
  }
};
