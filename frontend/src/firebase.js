// Firebase configuration and initialization
import { initializeApp } from "firebase/app";
import { getAuth, onAuthStateChanged, createUserWithEmailAndPassword, signInWithEmailAndPassword, GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyChEmy98kxsPneCwXKaE2PDlOx9I2JhwE0",
  authDomain: "fintech-f6f51.firebaseapp.com",
  projectId: "fintech-f6f51",
  storageBucket: "fintech-f6f51.appspot.com",
  messagingSenderId: "331684385229",
  appId: "1:331684385229:web:ee4908d594ca05e487f484",
  measurementId: "G-F614J0TCT8"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const auth = getAuth(app);
export const analytics = getAnalytics(app);
export const db = getFirestore(app);

export { onAuthStateChanged, createUserWithEmailAndPassword, signInWithEmailAndPassword, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';

export default app;
