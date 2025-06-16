import { User as FirebaseUser } from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "../firebase/config";

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string;
  isPremium: boolean;
  premiumExpiry?: string;
  createdAt: string;
  lastLoginAt: string;
}

export const createUserProfile = async (user: FirebaseUser): Promise<void> => {
  if (!user) return;

  const userRef = doc(db, "users", user.uid);
  const userSnap = await getDoc(userRef);

  if (!userSnap.exists()) {
    const { displayName, email, photoURL } = user;
    const createdAt = new Date().toISOString();

    try {
      await setDoc(userRef, {
        uid: user.uid,
        displayName: displayName || "User",
        email,
        photoURL,
        isPremium: false,
        createdAt,
        lastLoginAt: createdAt,
      });
    } catch (error) {
      console.error("Error creating user profile:", error);
    }
  } else {
    // Update last login
    try {
      await setDoc(
        userRef,
        {
          lastLoginAt: new Date().toISOString(),
        },
        { merge: true }
      );
    } catch (error) {
      console.error("Error updating last login:", error);
    }
  }
};

export const getUserProfile = async (
  uid: string
): Promise<UserProfile | null> => {
  try {
    const userRef = doc(db, "users", uid);
    const userSnap = await getDoc(userRef);

    if (userSnap.exists()) {
      return userSnap.data() as UserProfile;
    }
    return null;
  } catch (error) {
    console.error("Error getting user profile:", error);
    return null;
  }
};

export const updateUserPremiumStatus = async (
  uid: string,
  isPremium: boolean
): Promise<void> => {
  try {
    const userRef = doc(db, "users", uid);
    const updateData: Partial<UserProfile> = {
      isPremium,
    };

    if (isPremium) {
      updateData.premiumExpiry = new Date(
        Date.now() + 365 * 24 * 60 * 60 * 1000
      ).toISOString();
    }

    await setDoc(userRef, updateData, { merge: true });
  } catch (error) {
    console.error("Error updating premium status:", error);
  }
};
