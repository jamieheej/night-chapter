import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  GoogleSignin,
  statusCodes
} from '@react-native-google-signin/google-signin';
import * as AppleAuthentication from 'expo-apple-authentication';
import {
  signOut as firebaseSignOut,
  User as FirebaseUser,
  GoogleAuthProvider,
  OAuthProvider,
  onAuthStateChanged,
  signInWithCredential
} from 'firebase/auth';
import React, { createContext, ReactNode, useContext, useEffect, useState } from 'react';
import { auth } from '../firebase/config';
import * as JournalStorage from '../services/journalStorage';

// Configure Google Sign-In
GoogleSignin.configure({
  iosClientId: '317821380334-e4f00v7sune7r2tt3len5flo0qak11gt.apps.googleusercontent.com',
  webClientId: '317821380334-b46b3qi81a4dlof59jmdnfk63gtu7mgr.apps.googleusercontent.com',
});

export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  provider: 'google' | 'apple' | 'guest';
  isPremium: boolean;
  premiumExpiry?: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isGuest: boolean;
  signInWithGoogle: () => Promise<void>;
  signInWithApple: () => Promise<void>;
  signInAsGuest: () => Promise<void>;
  signOut: () => Promise<void>;
  upgradeToPremium: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Listen to Firebase auth state changes
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        await handleFirebaseUser(firebaseUser);
      } else {
        // Check for guest user in local storage
        await loadStoredUser();
      }
      setIsLoading(false);
    });

    return unsubscribe;
  }, []);

  const handleFirebaseUser = async (firebaseUser: FirebaseUser) => {
    const provider = firebaseUser.providerData[0]?.providerId;
    let providerName: 'google' | 'apple' = 'google';
    
    if (provider === 'apple.com') {
      providerName = 'apple';
    } else if (provider === 'google.com') {
      providerName = 'google';
    }

    const userData: User = {
      id: firebaseUser.uid,
      email: firebaseUser.email || '',
      name: firebaseUser.displayName || 'User',
      avatar: firebaseUser.photoURL || undefined,
      provider: providerName,
      isPremium: false, // TODO: Check from Firestore
    };

    // Check if there was a guest user and migrate their data
    const storedUser = await AsyncStorage.getItem('user');
    if (storedUser) {
      const previousUser = JSON.parse(storedUser);
      if (previousUser.provider === 'guest') {
        try {
          await JournalStorage.migrateGuestEntriesToFirestore(userData.id);
        } catch (error) {
          console.error('Error migrating guest data:', error);
        }
      }
    }

    await saveUser(userData);
  };

  const loadStoredUser = async () => {
    try {
      const storedUser = await AsyncStorage.getItem('user');
      if (storedUser) {
        const userData = JSON.parse(storedUser);
        // Only load guest users from storage, Firebase users are handled above
        if (userData.provider === 'guest') {
          setUser(userData);
        }
      }
    } catch (error) {
      console.error('Error loading stored user:', error);
    }
  };

  const saveUser = async (userData: User) => {
    try {
      await AsyncStorage.setItem('user', JSON.stringify(userData));
      setUser(userData);
    } catch (error) {
      console.error('Error saving user:', error);
    }
  };

  const signInWithGoogle = async () => {
    try {
      setIsLoading(true);
      console.log('Starting Google sign-in process...');

      // Check if already signed in
      await GoogleSignin.hasPlayServices();
      
      console.log('Attempting to open auth prompt...');
      const userInfo = await GoogleSignin.signIn();
      const { accessToken, idToken } = await GoogleSignin.getTokens();
      
      if (idToken) {
        console.log('Got ID token, creating credential...');
        const credential = GoogleAuthProvider.credential(idToken, accessToken);
        await signInWithCredential(auth, credential);
        console.log('Successfully signed in with credential');
      }
    } catch (error) {
      console.error('Google sign-in error:', error);
      if (error instanceof Error) {
        console.error('Error message:', error.message);
        console.error('Error stack:', error.stack);
      }
      if (error === statusCodes.SIGN_IN_CANCELLED) {
        console.log('User cancelled the sign-in flow');
      }
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const signInWithApple = async () => {
    try {
      setIsLoading(true);

      const nonce = Math.random().toString(36).substring(2, 10);
      // const hashedNonce = await Crypto.digestStringAsync(
      //   Crypto.CryptoDigestAlgorithm.SHA256,
      //   nonce
      // );

      const appleCredential = await AppleAuthentication.signInAsync({
        requestedScopes: [
          AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
          AppleAuthentication.AppleAuthenticationScope.EMAIL,
        ],
        //nonce: hashedNonce,
      });

      const { identityToken } = appleCredential;

      if (identityToken) {
        // Create Firebase credential
        const provider = new OAuthProvider('apple.com');
        const credential = provider.credential({
          idToken: identityToken,
          rawNonce: nonce,
        });

        // Sign in to Firebase
        await signInWithCredential(auth, credential);
      }
    } catch (error) {
      console.error('Apple sign-in error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const signInAsGuest = async () => {
    try {
      const guestUser: User = {
        id: 'guest_' + Date.now(),
        email: '',
        name: 'Guest User',
        provider: 'guest',
        isPremium: false,
      };
      await saveUser(guestUser);
    } catch (error) {
      console.error('Guest sign-in error:', error);
    }
  };

  const signOut = async () => {
    try {
      if (user?.provider !== 'guest') {
        await firebaseSignOut(auth);
      }
      await AsyncStorage.removeItem('user');
      setUser(null);
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  const upgradeToPremium = async () => {
    if (user) {
      const updatedUser = {
        ...user,
        isPremium: true,
        premiumExpiry: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
      };
      await saveUser(updatedUser);
    }
  };

  const value = {
    user,
    isLoading,
    isGuest: user?.provider === 'guest',
    signInWithGoogle,
    signInWithApple,
    signInAsGuest,
    signOut,
    upgradeToPremium,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}; 