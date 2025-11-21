import { auth, db } from "/scripts/firebase.js";
import {
  signInWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

import {
  collection,
  query,
  where,
  getDocs
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";


// ===============================
// EMAIL + PASSWORD LOGIN
// ===============================
document.getElementById("vendorLoginForm")
.addEventListener("submit", async (e) => {
  e.preventDefault();

  try {
    const cred = await signInWithEmailAndPassword(
      auth,
      e.target.email.value,
      e.target.password.value
    );

    const user = cred.user;

    // Find vendor doc linked to this UID
    const q = query(collection(db, "vendors"), where("uid", "==", user.uid));
    const snap = await getDocs(q);

    if (snap.empty) {
      alert("Vendor account not found!");
      return;
    }

    const V = snap.docs[0].data();

    // REDIRECT BASED ON STATUS
    if (V.status === "incomplete") {
      return location.href = "vendor-register.html";
    }

    return location.href = "vendor-dashboard.html";

  } catch (err) {
    alert(err.message);
  }
});


// ===============================
// ⭐ GOOGLE LOGIN BUTTON ADDED ⭐
// ===============================
const googleBtn = document.createElement("button");
googleBtn.innerText = "Login with Google";
googleBtn.style = `
  width:100%;
  padding:10px;
  margin-top:10px;
  background:#4285f4;
  color:white;
  border:none;
  border-radius:8px;
  font-size:16px;
  cursor:pointer;
`;
document.querySelector(".form-box").appendChild(googleBtn);

googleBtn.onclick = googleLogin;

async function googleLogin() {
  const provider = new GoogleAuthProvider();

  try {
    const result = await signInWithPopup(auth, provider);
    const user = result.user;

    // Find vendor linked to this google uid
    const q = query(collection(db, "vendors"), where("uid", "==", user.uid));
    const snap = await getDocs(q);

    if (snap.empty) {
      // No vendor created yet → go to signup
      alert("No vendor account found. Please sign up first.");
      return location.href = "vendor-signup.html";
    }

    const V = snap.docs[0].data();

    // REDIRECT BASED ON STATUS
    if (V.status === "incomplete") {
      return location.href = "vendor-register.html";
    }

    return location.href = "vendor-dashboard.html";

  } catch (err) {
    alert(err.message);
  }
}
