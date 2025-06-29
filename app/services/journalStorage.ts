import AsyncStorage from "@react-native-async-storage/async-storage";
import { collection, doc, getDocs, query, setDoc } from "firebase/firestore";
import { db } from "../firebase/config";
import { JournalEntry } from "../types";

// Helper function to remove undefined fields from an object
const removeUndefinedFields = (obj: any) => {
  const cleanObj = { ...obj };
  Object.keys(cleanObj).forEach((key) => {
    if (cleanObj[key] === undefined) {
      delete cleanObj[key];
    }
  });
  return cleanObj;
};

export const saveJournalEntry = async (
  entry: JournalEntry,
  userId: string,
  isGuest: boolean
) => {
  try {
    if (isGuest) {
      // For guest users, save to AsyncStorage
      const existingEntries = await AsyncStorage.getItem("journalEntries");
      const entries = existingEntries ? JSON.parse(existingEntries) : [];
      entries.push(entry);
      await AsyncStorage.setItem("journalEntries", JSON.stringify(entries));
    } else {
      // For authenticated users, save to Firestore
      // Remove any undefined fields before saving
      const cleanEntry = removeUndefinedFields({
        ...entry,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });

      const entryRef = doc(db, `users/${userId}/journals/${entry.id}`);
      await setDoc(entryRef, cleanEntry);
    }
  } catch (error) {
    console.error("Error saving journal entry:", error);
    throw error;
  }
};

export const loadJournalEntries = async (
  userId: string,
  isGuest: boolean
): Promise<JournalEntry[]> => {
  try {
    if (isGuest) {
      // For guest users, load from AsyncStorage
      const entriesData = await AsyncStorage.getItem("journalEntries");
      const entries = entriesData ? JSON.parse(entriesData) : [];
      // Filter out deleted entries for guest users
      return entries.filter((entry: JournalEntry) => !entry.deleted);
    } else {
      // For authenticated users, load from Firestore
      const journalsRef = collection(db, `users/${userId}/journals`);
      const q = query(journalsRef);
      const querySnapshot = await getDocs(q);

      return querySnapshot.docs
        .map(
          (doc) =>
            ({
              ...doc.data(),
              id: doc.id,
            } as JournalEntry)
        )
        .filter((entry) => !entry.deleted);
    }
  } catch (error) {
    console.error("Error loading journal entries:", error);
    throw error;
  }
};

export const updateJournalEntry = async (
  entry: JournalEntry,
  userId: string,
  isGuest: boolean
) => {
  try {
    if (isGuest) {
      // For guest users, update in AsyncStorage
      const existingEntries = await AsyncStorage.getItem("journalEntries");
      const entries = existingEntries ? JSON.parse(existingEntries) : [];
      const index = entries.findIndex((e: JournalEntry) => e.id === entry.id);

      if (index !== -1) {
        entries[index] = entry;
        await AsyncStorage.setItem("journalEntries", JSON.stringify(entries));
      }
    } else {
      // For authenticated users, update in Firestore
      // Remove any undefined fields before saving
      const cleanEntry = removeUndefinedFields({
        ...entry,
        updatedAt: new Date().toISOString(),
      });

      const entryRef = doc(db, `users/${userId}/journals/${entry.id}`);
      await setDoc(entryRef, cleanEntry, { merge: true });
    }
  } catch (error) {
    console.error("Error updating journal entry:", error);
    throw error;
  }
};

export const deleteJournalEntry = async (
  entryId: string,
  userId: string,
  isGuest: boolean
) => {
  try {
    if (isGuest) {
      // For guest users, delete from AsyncStorage
      const existingEntries = await AsyncStorage.getItem("journalEntries");
      let entries = existingEntries ? JSON.parse(existingEntries) : [];

      // Mark the entry as deleted instead of removing it
      entries = entries.map((entry: JournalEntry) =>
        entry.id === entryId
          ? { ...entry, deleted: true, deletedAt: new Date().toISOString() }
          : entry
      );

      await AsyncStorage.setItem("journalEntries", JSON.stringify(entries));
    } else {
      // For authenticated users, mark as deleted in Firestore
      const entryRef = doc(db, `users/${userId}/journals/${entryId}`);
      await setDoc(
        entryRef,
        {
          deleted: true,
          deletedAt: new Date().toISOString(),
        },
        { merge: true }
      );
    }
  } catch (error) {
    console.error("Error deleting journal entry:", error);
    throw error;
  }
};

export const migrateGuestEntriesToFirestore = async (userId: string) => {
  try {
    // Load guest entries from AsyncStorage
    const entriesData = await AsyncStorage.getItem("journalEntries");
    const guestEntries = entriesData ? JSON.parse(entriesData) : [];

    // Save each entry to Firestore
    for (const entry of guestEntries) {
      await saveJournalEntry(entry, userId, false);
    }

    // Clear AsyncStorage after successful migration
    await AsyncStorage.removeItem("journalEntries");
  } catch (error) {
    console.error("Error migrating guest entries:", error);
    throw error;
  }
};
