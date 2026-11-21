import { initializeApp, getApps } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

// Your Official Firebase Project Configuration
export const DEFAULT_FIREBASE_CONFIG = {
  apiKey: "AIzaSyD4OEbg0CetzwNiMJbSzWl6OXU_tu0NQ_Q",
  authDomain: "hrsystem-b0734.firebaseapp.com",
  projectId: "hrsystem-b0734",
  storageBucket: "hrsystem-b0734.firebasestorage.app",
  messagingSenderId: "741990666455",
  appId: "1:741990666455:web:a42496dd8fe251fe526092",
  measurementId: "G-17QTPWLXZ6"
};

// Retrieve custom saved config from localStorage if user updated it, else use user's official config
export function getStoredFirebaseConfig() {
  try {
    const saved = localStorage.getItem('pulsehr_firebase_config');
    if (saved) {
      const parsed = JSON.parse(saved);
      // Ensure we use the real project ID if saved had an older dummy one
      if (parsed.projectId === 'pulsehr-enterprise-db') {
        localStorage.setItem('pulsehr_firebase_config', JSON.stringify(DEFAULT_FIREBASE_CONFIG));
        return DEFAULT_FIREBASE_CONFIG;
      }
      return parsed;
    }
    return DEFAULT_FIREBASE_CONFIG;
  } catch {
    return DEFAULT_FIREBASE_CONFIG;
  }
}

// Initialize Firebase App
export function initFirebase() {
  const config = getStoredFirebaseConfig();
  const apps = getApps();
  const app = apps.length > 0 ? apps[0] : initializeApp(config);
  const db = getFirestore(app);
  return { app, db, config };
}

export const { app, db } = initFirebase();
