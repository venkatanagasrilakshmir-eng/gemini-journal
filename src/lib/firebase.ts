import { initializeApp, getApps, getApp, type FirebaseApp } from 'firebase/app';
import { 
  getAuth, 
  GoogleAuthProvider, 
  signInWithPopup, 
  signOut as fbSignOut, 
  onAuthStateChanged as fbOnAuthStateChanged,
  type User,
  signInAnonymously
} from 'firebase/auth';
import { 
  getFirestore, 
  type Firestore 
} from 'firebase/firestore';

// Default config from firebase-applet-config.json
const firebaseConfig = {
  projectId: "valiant-catbird-4dtd0",
  appId: "1:96902585955:web:32fc6a6e1acaafe3552256",
  apiKey: "AIzaSyAQ0aG_NvXNaZwshQv8xk9T2gFiMasBzQU",
  authDomain: "valiant-catbird-4dtd0.firebaseapp.com",
  firestoreDatabaseId: "ai-studio-15f2349f-87bb-468d-a02a-e50267248ab8",
  storageBucket: "valiant-catbird-4dtd0.firebasestorage.app",
  messagingSenderId: "96902585955",
  measurementId: "",
  oAuthClientId: "96902585955-ccb8kddihvurvtsse8vvct1ehfba6vm9.apps.googleusercontent.com",
};

const app: FirebaseApp = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

export const auth = getAuth(app);

// Use provisioned firestore database ID
export const db: Firestore = firebaseConfig.firestoreDatabaseId && firebaseConfig.firestoreDatabaseId !== '(default)'
  ? getFirestore(app, firebaseConfig.firestoreDatabaseId)
  : getFirestore(app);

const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
  prompt: 'select_account'
});

export async function signInWithGoogle(): Promise<User> {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    return result.user;
  } catch (error: any) {
    // If popup blocked or iframe restricted, surface readable explanation
    console.error("Google sign in error:", error);
    throw error;
  }
}

export async function signInAsGuest(): Promise<User> {
  const result = await signInAnonymously(auth);
  return result.user;
}

export async function signOutUser(): Promise<void> {
  await fbSignOut(auth);
}

export function onAuthChanged(callback: (user: User | null) => void) {
  return fbOnAuthStateChanged(auth, callback);
}
