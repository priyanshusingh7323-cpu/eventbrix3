// firebase.js (FINAL ✓ FIXED FOR OTP + RECAPTCHA ENTERPRISE)

// IMPORTS
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


// FIREBASE CONFIG
const firebaseConfig = {
  apiKey: "AIzaSyBV5XvzfX-h0gEbGSaXpF1fCdvo3m9SsDk",
  authDomain: "eventbrix-87889.firebaseapp.com",
  projectId: "eventbrix-87889",
  storageBucket: "eventbrix-87889.firebasestorage.app",
  messagingSenderId: "917179166642",
  appId: "1:917179166642:web:7092e379ec8f8a93353eab",
  measurementId: "G-5LGVD5BENS"
};

// INITIALIZE
export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

// PROVIDERS
export const googleProvider = new GoogleAuthProvider();
export const appleProvider = new OAuthProvider("apple.com");


// ⭐ REQUIRED FOR OTP (Recaptcha Enterprise v10+)  
auth.settings.appVerificationDisabledForTesting = false;


// EXPORTS
export { 
  signInWithPopup,
  RecaptchaVerifier,
  signInWithPhoneNumber,
  onAuthStateChanged
};
