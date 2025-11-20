// Google Auth for Customer Login + Signup

import { auth } from "./firebase.js";
import {
  GoogleAuthProvider,
  signInWithPopup
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

const provider = new GoogleAuthProvider();

// -----------------------------
// Customer LOGIN with Google
// -----------------------------
const loginBtn = document.getElementById("googleLoginBtn");
if (loginBtn) {
  loginBtn.addEventListener("click", async () => {
    try {
      await signInWithPopup(auth, provider);
      alert("Login successful!");
      window.location.href = "/customer/customer-dashboard.html";
    } catch (error) {
      console.error(error);
      alert("Google login failed.");
    }
  });
}

// -----------------------------
// Customer SIGNUP with Google
// -----------------------------
const signupBtn = document.getElementById("googleSignupBtn");
if (signupBtn) {
  signupBtn.addEventListener("click", async () => {
    try {
      await signInWithPopup(auth, provider);
      alert("Account created!");
      window.location.href = "/customer/customer-dashboard.html";
    } catch (error) {
      console.error(error);
      alert("Google signup failed.");
    }
  });
}
