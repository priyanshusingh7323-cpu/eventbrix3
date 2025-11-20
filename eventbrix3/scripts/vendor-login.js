// vendor-login.js
// Firebase Auth Login + Google Login

import { auth } from "/scripts/firebase.js";
import {
  signInWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

// Login form
const form = document.getElementById("vendorLoginForm");

// Email/Password Login
form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value;

  try {
    await signInWithEmailAndPassword(auth, email, password);
    alert("Login successful!");

    // Save email for next time
    localStorage.setItem("vendorEmail", email);

    // Redirect
    window.location.href = "vendor-dashboard.html";

  } catch (err) {
    alert("Invalid email or password.");
    console.error(err);
  }
});

// Restore saved email
window.addEventListener("DOMContentLoaded", () => {
  const savedEmail = localStorage.getItem("vendorEmail");
  if (savedEmail) {
    document.getElementById("email").value = savedEmail;
  }
});

// ------------------------------
// GOOGLE LOGIN
// ------------------------------

const provider = new GoogleAuthProvider();
const googleBtn = document.getElementById("googleLoginBtn");

googleBtn.addEventListener("click", async () => {
  try {
    await signInWithPopup(auth, provider);
    alert("Login successful!");

    // Redirect
    window.location.href = "vendor-dashboard.html";

  } catch (error) {
    console.error(error);
    alert("Google login failed.");
  }
});
