import { auth, db } from "/scripts/firebase.js";
import { 
  createUserWithEmailAndPassword 
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

import { 
  doc, 
  setDoc 
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

import { getNextVendorId } from "/scripts/vendor-id.js";

document.getElementById("vendorSignupForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  const name = e.target.name.value;
  const email = e.target.email.value;
  const phone = e.target.phone.value;
  const password = e.target.password.value;

  try {
    // 1) Create Firebase Auth user
    const userCred = await createUserWithEmailAndPassword(auth, email, password);
    const uid = userCred.user.uid;

    // 2) Generate short VendorID: VEN-1001
    const vendorId = await getNextVendorId();

    // 3) Create vendor profile using UID as the document ID
    await setDoc(doc(db, "vendors", uid), {
      vendorId,
      uid,
      name,
      email,
      phone,
      createdAt: Date.now(),
      status: "incomplete",
    });

    alert("Signup Successful!");
    location.href = "vendor-register.html";

  } catch (err) {
    alert(err.message);
  }
});
