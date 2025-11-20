import { auth } from "/scripts/firebase.js";
import {
  signInWithEmailAndPassword
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

document.getElementById("customerLoginForm")
.addEventListener("submit", async (e) => {
  e.preventDefault();

  const email = e.target.email.value;
  const password = e.target.password.value;

  try {
    await signInWithEmailAndPassword(auth, email, password);
    location.href = "/customer/customer-dashboard.html";
  } 
  catch (err) {
    alert(err.message);
  }
});
