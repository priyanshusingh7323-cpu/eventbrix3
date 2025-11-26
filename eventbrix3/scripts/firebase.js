// firebase.js (FINAL FIXED)

import { initializeApp } 
from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";

import { 
  getAuth,
  onAuthStateChanged,
  GoogleAuthProvider,
  OAuthProvider,
  signInWithPopup,
  RecaptchaVerifier,
  signInWithPhoneNumber
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

import { getFirestore } 
from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

import { getStorage } 
from "https://www.gstatic.com/firebasejs/10.7.1/firebase-storage.js";

// CORRECT CONFIG ✔️
const firebaseConfig = {
  apiKey: "AIzaSyBV5XvzfX-h0gEbGSaXpF1fCdvo3m9SsDk",
  authDomain: "eventbrix-87889.firebaseapp.com",
  projectId: "eventbrix-87889",
  storageBucket: "eventbrix-87889.appspot.com",   // ✔️ FIXED
  messagingSenderId: "917179166642",
  appId: "1:917179166642:web:7092e379ec8f8a93353eab",
  measurementId: "G-5LGVD5BENS"
};

export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

// PROVIDERS
export const googleProvider = new GoogleAuthProvider();
export const appleProvider = new OAuthProvider("apple.com");

// OTP requirement
auth.settings.appVerificationDisabledForTesting = false;

export { 
  signInWithPopup,
  RecaptchaVerifier,
  signInWithPhoneNumber,
  onAuthStateChanged
};
