import { initializeApp, getApps, getApp, type FirebaseApp, type FirebaseOptions } from 'firebase/app';
import { getAuth, type Auth } from 'firebase/auth';
import { getFirestore, type Firestore } from 'firebase/firestore';

/**
 * Firebase Web App Configuration for existing project "hackathon-project".
 *
 * Values are retrieved from Vite environment variables (VITE_*) to avoid exposing
 * or hardcoding sensitive credentials in source code.
 */
const firebaseConfig: FirebaseOptions = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || 'hackathon-project.firebaseapp.com',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || 'hackathon-project',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || 'hackathon-project.firebasestorage.app',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

// Initialize Firebase modular app (prevent duplicate instances during HMR)
export const app: FirebaseApp = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

/**
 * Setup for Firebase Authentication and Cloud Firestore:
 * These instances are cleanly prepared so they can be readily used across
 * services and components as authentication and database features are built out.
 */

// Cloud Firestore instance
export const db: Firestore = getFirestore(app);

// Firebase Authentication instance (initialized when API key is provided)
export const auth: Auth | null = firebaseConfig.apiKey ? getAuth(app) : null;

// Getter helper for Firebase Auth when credentials are confirmed
export const getFirebaseAuth = (): Auth => getAuth(app);

export default app;
