import { auth, db } from "/scripts/firebase.js";

import {
  signInWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

import {
  doc, setDoc, getDoc
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";


// ==============================
// EMAIL LOGIN
// ==============================
document.getElementById("customerLoginForm")
.addEventListener("submit", async (e) => {
  e.preventDefault();

  const email = e.target.email.value;
  const password = e.target.password.value;

  try {
    await signInWithEmailAndPassword(auth, email, password);

    // Redirect to HOME
    location.href = "/index.html";
  } 
  catch (err) {
    alert(err.message);
  }
});


// ==============================
// GOOGLE LOGIN
// ==============================
const provider = new GoogleAuthProvider();

document.getElementById("googleLoginBtn")?.addEventListener("click", async () => {
  try {
    const result = await signInWithPopup(auth, provider);

    // Create profile if new user
    const ref = doc(db, "customers", result.user.uid);
    const snap = await getDoc(ref);

    if (!snap.exists()) {
      await setDoc(ref, {
        uid: result.user.uid,
        name: result.user.displayName || "",
        email: result.user.email,
        phone: "",
        city: "",
        createdAt: Date.now()
      });
    }

    location.href = "/index.html";
  }
  catch (err) {
    alert("Google login failed!");
  }
});
