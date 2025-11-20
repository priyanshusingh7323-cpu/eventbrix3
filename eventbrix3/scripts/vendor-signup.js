import { auth } from "/scripts/firebase.js";
import {
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

const form = document.getElementById("vendorSignupForm");

// SIGNUP FORM SUBMIT
form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value;

  try {
    await createUserWithEmailAndPassword(auth, email, password);
    alert("Account created!");

    // Redirect to Vendor Registration Form
    window.location.href = "vendor-register.html";

  } catch (err) {
    alert("Signup failed.");
    console.error(err);
  }
});

// GOOGLE SIGNUP
const provider = new GoogleAuthProvider();
document.getElementById("googleSignupBtn").addEventListener("click", async () => {
  try {
    await signInWithPopup(auth, provider);
    alert("Account created!");

    window.location.href = "vendor-register.html";

  } catch (error) {
    console.error(error);
    alert("Google signup failed.");
  }
});
