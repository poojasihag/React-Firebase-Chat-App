import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_API_KEY,
  authDomain: "realtime-chat-app-c244e.firebaseapp.com",
  projectId: "realtime-chat-app-c244e",
  storageBucket: "realtime-chat-app-c244e.appspot.com",
  messagingSenderId: "38292610042",
  appId: "1:38292610042:web:fcc34fc1a224c3b040a243",
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth()
export const db = getFirestore()
export const storage = getStorage()