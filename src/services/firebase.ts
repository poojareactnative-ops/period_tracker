// src/config/firebase.ts

import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: 'AIzaSyBpw8laS02ksvFak_hR7bIFGlhm97ZlYA4',
  authDomain: 'periodtracker-39e63.firebaseapp.com',
  projectId: 'periodtracker-39e63',
  storageBucket: 'periodtracker-39e63.appspot.com', // ✅ fixed (important)
  messagingSenderId: '1054162026875',
  appId: '1:1054162026875:android:51729f06abac127f0abdde',
};

// ✅ Prevent multiple initialization (important for Expo)
const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);

export default app;