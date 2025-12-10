
import firebase from "firebase/compat/app";
import "firebase/compat/auth";
import "firebase/compat/firestore";

// 2. Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY || "AIzaSyC1xAe4CYOVIaW60HtJvV_0hQAkmmXJTBU",
  authDomain: process.env.FIREBASE_AUTH_DOMAIN || "gen-lang-client-0891844007.firebaseapp.com",
  projectId: process.env.FIREBASE_PROJECT_ID || "gen-lang-client-0891844007",
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET || "gen-lang-client-0891844007.firebasestorage.app",
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID || "185017446343",
  appId: process.env.FIREBASE_APP_ID || "1:185017446343:web:9fc46eb7dcb6f9751933e2"
};

// 3. Initialize Firebase
const app = !firebase.apps.length ? firebase.initializeApp(firebaseConfig) : firebase.app();

// 4. Initialize Services
export const auth = app.auth();
export const db = app.firestore();

// 5. Enable Offline Persistence
db.enablePersistence().catch((err: any) => {
  if (err.code == 'failed-precondition') {
      console.warn('Persistence failed: Multiple tabs open.');
  } else if (err.code == 'unimplemented') {
      console.warn('Persistence failed: Browser not supported.');
  }
});
