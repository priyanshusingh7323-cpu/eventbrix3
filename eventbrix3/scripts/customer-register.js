import { auth } from "./firebase.js";
import {
  createUserWithEmailAndPassword
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

const form = document.getElementById("customerRegisterForm");

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const name = document.getElementById("name").value.trim();
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value;

  try {
    await createUserWithEmailAndPassword(auth, email, password);

    alert("Account created!");
    window.location.href = "/customer/customer-dashboard.html";
  } catch (error) {
    console.error(error);
    alert("Registration failed.");
  }
});
