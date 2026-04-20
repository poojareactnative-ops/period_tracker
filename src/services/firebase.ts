import { FirebaseOptions, getApp, getApps, initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig: FirebaseOptions = {
  apiKey: 'AIzaSyBpw8laS02ksvFak_hR7bIFGlhm97ZlYA4',
  authDomain: 'periodtracker-39e63.firebaseapp.com',
  projectId: 'periodtracker-39e63',
  storageBucket: 'periodtracker-39e63.firebasestorage.app',
  messagingSenderId: '1054162026875',
  appId: '1:1054162026875:android:51729f06abac127f0abdde',
};

const requiredConfig: (keyof FirebaseOptions)[] = ['apiKey', 'authDomain', 'projectId', 'appId'];
const missingConfig = requiredConfig.filter((key) => !firebaseConfig[key]);

if (missingConfig.length > 0) {
  throw new Error(`Missing Firebase config keys: ${missingConfig.join(', ')}`);
}

const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);

export default app;
