import { auth } from "./firebase.js";
import {
  signInWithEmailAndPassword
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

document.getElementById("customerLoginForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value;

  try {
    await signInWithEmailAndPassword(auth, email, password);

    alert("Login successful!");
    window.location.href = "/customer/customer-dashboard.html";
  } catch (error) {
    console.error(error);
    alert("Invalid email or password.");
  }
});
