// Import the functions you need from the SDKs you need
import { getApps, initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyD4POvRysZYg-xfVW0X16CdYZE28jL4P9s",
  authDomain: "night-chapter-d527e.firebaseapp.com",
  projectId: "night-chapter-d527e",
  storageBucket: "night-chapter-d527e.firebasestorage.app",
  messagingSenderId: "317821380334",
  appId: "1:317821380334:web:c09dd52770725ae2d675ff",
  measurementId: "G-WXVHE5BDRR",
};

// Initialize Firebase only if no apps exist
const app =
  getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

export const auth = getAuth(app);
export const db = getFirestore(app);
