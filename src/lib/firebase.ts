import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getAnalytics, isSupported } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyDQJECtLbSE_FvCkc8b445YapFSAjrBMAU",
  authDomain: "financeiro-d492c.firebaseapp.com",
  projectId: "financeiro-d492c",
  storageBucket: "financeiro-d492c.firebasestorage.app",
  messagingSenderId: "205858296622",
  appId: "1:205858296622:web:655fec58b99dd9786b20bf",
  measurementId: "G-MTWRN32L5L"
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);
const db = getFirestore(app);

let analytics;
if (typeof window !== "undefined") {
  isSupported().then((supported) => {
    if (supported) {
      analytics = getAnalytics(app);
    }
  });
}

export { app, auth, db, analytics };
