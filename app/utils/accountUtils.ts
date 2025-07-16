import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";
import { deleteUser } from "firebase/auth";
import { deleteDoc, doc } from "firebase/firestore";
import { auth, db } from "../firebase/config";

// Keys for all data stored in AsyncStorage
const STORAGE_KEYS = [
  "completedSessions",
  "readingStreak",
  "focusModeSettings",
  "lastTimerDuration",
  "theme",
  // Add any other storage keys used in the app
];

export const deleteAccount = async (): Promise<void> => {
  try {
    const currentUser = auth.currentUser;
    if (!currentUser) {
      throw new Error("No user is currently signed in");
    }

    // Delete user data from Firestore
    const userDoc = doc(db, "users", currentUser.uid);
    await deleteDoc(userDoc);

    // Delete user's reading data collections
    const collections = ["sessions", "streaks", "settings"];
    await Promise.all(
      collections.map(async (collection) => {
        const docRef = doc(db, collection, currentUser.uid);
        await deleteDoc(docRef);
      })
    );

    // Delete Firebase user account
    await deleteUser(currentUser);

    // Clear all local data from AsyncStorage
    await Promise.all(STORAGE_KEYS.map((key) => AsyncStorage.removeItem(key)));

    // Reset navigation to the sign in screen
    console.log("Deleting account- redirecting to sign in");
    router.dismissAll();
    router.push("/");
  } catch (error) {
    console.error("Error deleting account:", error);
    throw new Error("Failed to delete account. Please try again.");
  }
};
