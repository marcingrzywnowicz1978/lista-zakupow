import { initializeApp, getApps } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyB-6tuiLX9aVF6IC9nlqU10n6RL-Rwl0D4",
  authDomain: "lista-zakupow-c3a6e.firebaseapp.com",
  projectId: "lista-zakupow-c3a6e",
  storageBucket: "lista-zakupow-c3a6e.firebasestorage.app",
  messagingSenderId: "113665945418",
  appId: "1:113665945418:web:712aca479225c75a131bb3"
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export const googleProvider = new GoogleAuthProvider();
