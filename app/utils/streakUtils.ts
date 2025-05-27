import AsyncStorage from "@react-native-async-storage/async-storage";

export interface ReadingStreak {
  currentStreak: number;
  longestStreak: number;
  lastReadDate: string | null;
}

const STREAK_STORAGE_KEY = "readingStreak";

export const getReadingStreak = async (): Promise<ReadingStreak> => {
  try {
    const streakData = await AsyncStorage.getItem(STREAK_STORAGE_KEY);
    if (streakData) {
      return JSON.parse(streakData);
    }
    return {
      currentStreak: 0,
      longestStreak: 0,
      lastReadDate: null,
    };
  } catch (error) {
    console.error("Error getting reading streak:", error);
    return {
      currentStreak: 0,
      longestStreak: 0,
      lastReadDate: null,
    };
  }
};

export const updateReadingStreak = async (): Promise<ReadingStreak> => {
  try {
    const currentStreak = await getReadingStreak();
    const today = new Date().toDateString();

    if (!currentStreak.lastReadDate) {
      // First time reading
      const newStreak: ReadingStreak = {
        currentStreak: 1,
        longestStreak: 1,
        lastReadDate: today,
      };
      await AsyncStorage.setItem(STREAK_STORAGE_KEY, JSON.stringify(newStreak));
      return newStreak;
    }

    const lastReadDate = new Date(currentStreak.lastReadDate);
    const todayDate = new Date(today);
    const diffTime = todayDate.getTime() - lastReadDate.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    let newStreak: ReadingStreak;

    if (diffDays === 0) {
      // Same day, no change to streak
      return currentStreak;
    } else if (diffDays === 1) {
      // Consecutive day, increment streak
      newStreak = {
        currentStreak: currentStreak.currentStreak + 1,
        longestStreak: Math.max(
          currentStreak.longestStreak,
          currentStreak.currentStreak + 1
        ),
        lastReadDate: today,
      };
    } else {
      // Streak broken, reset to 1
      newStreak = {
        currentStreak: 1,
        longestStreak: currentStreak.longestStreak,
        lastReadDate: today,
      };
    }

    await AsyncStorage.setItem(STREAK_STORAGE_KEY, JSON.stringify(newStreak));
    return newStreak;
  } catch (error) {
    console.error("Error updating reading streak:", error);
    throw error;
  }
};

export const getStreakMessage = (streak: ReadingStreak): string => {
  if (streak.currentStreak === 1) {
    return "Great start! You've begun your reading journey! 📚";
  } else if (streak.currentStreak < 7) {
    return `Amazing! ${streak.currentStreak} days in a row! Keep it up! 🔥`;
  } else if (streak.currentStreak < 30) {
    return `Incredible! ${streak.currentStreak} day streak! You're building a great habit! ⭐`;
  } else {
    return `Phenomenal! ${streak.currentStreak} days straight! You're a reading champion! 🏆`;
  }
};
