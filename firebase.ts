import AsyncStorage from '@react-native-async-storage/async-storage';
import { getApp, getApps, initializeApp } from 'firebase/app';
import {
  getAuth,
  getReactNativePersistence,
  initializeAuth,
  type Auth,
} from 'firebase/auth';

const firebaseConfig = {
  apiKey: 'AIzaSyDglf-AI90sldXVgYoxGbp-H8RqUE_mDoQ',
  authDomain: 'proaiapp3.firebaseapp.com',
  projectId: 'homeaiproject-64fcf',
  storageBucket: 'homeaiproject-64fcf.firebasestorage.app',
  messagingSenderId: '621606733956',
  appId: '1:1:621606733956:ios:c50b48af5536c610a45ad1',
};

export const isFirebaseConfigured = Boolean(
  firebaseConfig.apiKey &&
    firebaseConfig.authDomain &&
    firebaseConfig.projectId &&
    firebaseConfig.storageBucket &&
    firebaseConfig.messagingSenderId &&
    firebaseConfig.appId
);

export const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

let auth: Auth;
const hasReactNativePersistence = typeof getReactNativePersistence === 'function';

if (hasReactNativePersistence) {
  try {
    const persistence = getReactNativePersistence(AsyncStorage);
    auth = initializeAuth(app, { persistence });
  } catch {
    auth = getAuth(app);
  }
} else {
  auth = getAuth(app);
}

export { auth };

