// src/firebase.js
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyC-eQTFgV_VsHrIWKxqp_txqNvFJOV8h_c",
  authDomain: "meditech-656be.firebaseapp.com",
  projectId: "meditech-656be",
  storageBucket: "meditech-656be.firebasestorage.app",
  messagingSenderId: "1070665745248",
  appId: "1:1070665745248:web:4f4d2d49fedeabbbad9405",
  measurementId: "G-LCR14W2LV8"
};

const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);       // ⬅️ make sure this line exists
export const auth = getAuth(app);          // ⬅️ and this one