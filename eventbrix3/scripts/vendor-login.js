import { auth } from "/scripts/firebase.js";
import {
  signInWithEmailAndPassword
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

document.getElementById("vendorLoginForm")
.addEventListener("submit", async (e) => {
  e.preventDefault();

  try {
    await signInWithEmailAndPassword(
      auth,
      e.target.email.value,
      e.target.password.value
    );

    location.href = "vendor-dashboard.html";
  }
  catch (err) {
    alert(err.message);
  }
});
