import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getAnalytics, isSupported } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyAfzpb1lgEFrn18Z5VQpU4LnTvyxDRvczc",
  authDomain: "golpobari-cced2.firebaseapp.com",
  databaseURL: "https://golpobari-cced2-default-rtdb.firebaseio.com",
  projectId: "golpobari-cced2",
  storageBucket: "golpobari-cced2.firebasestorage.app",
  messagingSenderId: "966698503373",
  appId: "1:966698503373:web:76ff488918287e291fed84",
  measurementId: "G-DCW2LLK7MT"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Services
export const auth = getAuth(app);
export const db = getFirestore(app);

// Safe Analytics Initialization
export let analytics: any = null;
if (typeof window !== "undefined") {
  isSupported().then((supported) => {
    if (supported) {
      analytics = getAnalytics(app);
    }
  }).catch((err) => {
    console.warn("Firebase Analytics is not supported in this environment:", err);
  });
}
