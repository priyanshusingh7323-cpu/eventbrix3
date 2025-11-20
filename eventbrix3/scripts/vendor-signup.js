import { auth, db } from "/scripts/firebase.js";
import {
  createUserWithEmailAndPassword
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

import {
  doc,
  setDoc
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

import { getNextVendorId } from "/scripts/vendor-id.js";

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
