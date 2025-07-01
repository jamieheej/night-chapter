import AsyncStorage from "@react-native-async-storage/async-storage";
import { Session } from "../types/reading";

export interface ReadingStats {
  totalSessions: number;
  totalMinutes: number;
  averageSessionLength: number;
  lastSessionDate: string | null;
}

export const getReadingStats = async (): Promise<ReadingStats> => {
  try {
    const savedSessions = await AsyncStorage.getItem("completedSessions");
    const sessions: Session[] = savedSessions ? JSON.parse(savedSessions) : [];

    if (sessions.length === 0) {
      return {
        totalSessions: 0,
        totalMinutes: 0,
        averageSessionLength: 0,
        lastSessionDate: null,
      };
    }

    const totalSeconds = sessions.reduce(
      (sum, session) => sum + session.duration,
      0
    );

    // Calculate times with better precision
    const totalMinutes = Math.round(totalSeconds / 60);
    const averageMinutes = totalSeconds / (60 * sessions.length);
    const averageSessionLength = Math.round(averageMinutes * 10) / 10; // Round to 1 decimal place

    const lastSession = sessions[sessions.length - 1];

    return {
      totalSessions: sessions.length,
      totalMinutes,
      averageSessionLength,
      lastSessionDate: lastSession.completedAt,
    };
  } catch (error) {
    console.error("Error getting reading stats:", error);
    return {
      totalSessions: 0,
      totalMinutes: 0,
      averageSessionLength: 0,
      lastSessionDate: null,
    };
  }
};
