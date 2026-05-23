import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { initializeFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_API_KEY,
  authDomain: "chattie-a46f9.firebaseapp.com",
  projectId: "chattie-a46f9",
  storageBucket: "chattie-a46f9.firebasestorage.app",
  messagingSenderId: "302936652118",
  appId: "1:302936652118:web:0331248cb8553e7e593ef7",
  measurementId: "G-CBDLVGE35C"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth();
export const db = initializeFirestore(app, {
  experimentalForceLongPolling: true,
});