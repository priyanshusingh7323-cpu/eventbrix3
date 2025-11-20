import { auth } from "/scripts/firebase.js";
import { signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

const form = document.getElementById("adminLoginForm");

form.addEventListener("submit", (e) => {
  e.preventDefault();

  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  signInWithEmailAndPassword(auth, email, password)
    .then(() => {
      alert("Admin Login Successful");
      window.location.href = "/admin/admin-dashboard.html";
    })
    .catch(() => alert("Invalid admin credentials"));
});
