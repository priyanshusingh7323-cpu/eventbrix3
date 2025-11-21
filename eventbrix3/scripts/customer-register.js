import { auth, db } from "/scripts/firebase.js";

import {
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

import {
  doc, setDoc
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";


// ==============================
// EMAIL REGISTER
// ==============================
document.getElementById("customerRegisterForm")
.addEventListener("submit", async (e) => {
  e.preventDefault();

  const name = e.target.name.value;
  const email = e.target.email.value;
  const phone = e.target.phone.value;
  const city = e.target.city.value;
  const password = e.target.password.value;

  try {
    const userCred = await createUserWithEmailAndPassword(auth, email, password);

    await setDoc(doc(db, "customers", userCred.user.uid), {
      uid: userCred.user.uid,
      name,
      email,
      phone,
      city,
      createdAt: Date.now()
    });

    alert("Account created!");
    location.href = "/index.html";   // GO TO HOME
  }
  catch (err) {
    alert(err.message);
  }
});


// ==============================
// GOOGLE REGISTER
// ==============================
const provider = new GoogleAuthProvider();

document.getElementById("googleRegisterBtn")?.addEventListener("click", async () => {
  try {
    const result = await signInWithPopup(auth, provider);

    // Auto-create profile
    await setDoc(doc(db, "customers", result.user.uid), {
      uid: result.user.uid,
      name: result.user.displayName || "",
      email: result.user.email,
      phone: "",
      city: "",
      createdAt: Date.now()
    });

    alert("Account created!");
    location.href = "/index.html";
  }
  catch (err) {
    alert("Google Signup failed!");
  }
});
