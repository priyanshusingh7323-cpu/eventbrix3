import { auth, db } from "/scripts/firebase.js";
import {
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

import {
  doc,
  setDoc,
  getDocs,
  collection,
  query,
  where
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

import { getNextVendorId } from "/scripts/vendor-id.js";


// ======================================
// EMAIL + PASSWORD SIGNUP
// ======================================
document.getElementById("vendorSignupForm")
.addEventListener("submit", async (e) => {
  e.preventDefault();

  const name = e.target.name.value;
  const email = e.target.email.value;
  const password = e.target.password.value;

  try {
    const userCred = await createUserWithEmailAndPassword(auth, email, password);
    const uid = userCred.user.uid;

    const vendorId = await getNextVendorId();

    await setDoc(doc(db, "vendors", vendorId), {
      vendorId,
      uid,
      name,
      email,
      createdAt: Date.now(),
      status: "incomplete"
    });

    alert("Account created!");
    location.href = "vendor-register.html";

  } catch (err) {
    alert(err.message);
  }
});


// ======================================
// ⭐ GOOGLE SIGNUP ADDED HERE ⭐
// ======================================
const googleBtn = document.createElement("button");
googleBtn.innerText = "Sign up with Google";
googleBtn.style = `
  width:100%;
  padding:10px;
  margin-top:10px;
  background:#db4437;
  color:white;
  border:none;
  border-radius:8px;
  font-size:16px;
  cursor:pointer;
`;
document.querySelector(".form-box").appendChild(googleBtn);

googleBtn.onclick = googleSignup;

async function googleSignup() {
  const provider = new GoogleAuthProvider();

  try {
    const result = await signInWithPopup(auth, provider);
    const user = result.user;

    // 1. Check if vendor already exists
    const q = query(collection(db, "vendors"), where("uid", "==", user.uid));
    const snap = await getDocs(q);

    if (!snap.empty) {
      // Vendor already has an account
      alert("Welcome back!");
      return location.href = "vendor-dashboard.html";
    }

    // 2. New Vendor → assign new Vendor ID
    const vendorId = await getNextVendorId();

    await setDoc(doc(db, "vendors", vendorId), {
      vendorId,
      uid: user.uid,
      name: user.displayName || "",
      email: user.email,
      photo: user.photoURL || "",
      createdAt: Date.now(),
      status: "incomplete"
    });

    alert("Google Signup Successful!");
    location.href = "vendor-register.html";

  } catch (err) {
    alert(err.message);
  }
}
