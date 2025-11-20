// File 19: scripts/customer-register.js

import { auth, db } from "../firebase.js";
import { createUserWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { doc, setDoc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

const form = document.getElementById("customerRegisterForm");

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const name = document.getElementById("name").value;
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    await setDoc(doc(db, "customers", user.uid), {
      name: name,
      email: email,
      createdAt: new Date()
    });

    alert("Account created successfully");
    window.location.href = "customer-login.html";
  }
  catch (error) {
    alert("Registration failed");
  }
});