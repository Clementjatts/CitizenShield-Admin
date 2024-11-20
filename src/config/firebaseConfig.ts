import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
    apiKey: "AIzaSyC5-_OKCyzSaMAJRWa2ROa4fclWTInLSOo",
    authDomain: "citizenshield-78464.firebaseapp.com",
    projectId: "citizenshield-78464",
    storageBucket: "citizenshield-78464.appspot.com",
    messagingSenderId: "362496878607",
    appId: "1:362496878607:web:8070266a408db2e1591b7a",
    measurementId: "G-404WETDQQY",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

// Export Firebase instance
export default app;