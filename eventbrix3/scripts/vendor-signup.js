import { auth, db } from "/scripts/firebase.js";
import { 
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

import { 
  doc, 
  setDoc 
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

import { getNextVendorId } from "/scripts/vendor-id.js";

// FORM SUBMIT
document.getElementById("vendorSignupForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  const name = e.target.name.value;
  const email = e.target.email.value;
  const phone = e.target.phone.value;
  const password = e.target.password.value;

  try {
    // Create Account
    const userCred = await createUserWithEmailAndPassword(auth, email, password);
    const uid = userCred.user.uid;

    // Generate VendorID
    const vendorId = await getNextVendorId();

    // Create vendor document in Firestore
    await setDoc(doc(db, "vendors", uid), {
      vendorId,
      uid,
      name,
      email,
      phone,
      status: "incomplete",
      createdAt: Date.now()
    });

    alert("Signup Successful!");
    location.href = "vendor-register.html";

  } catch (err) {
    alert(err.message);
  }
});

// GOOGLE SIGNUP
document.getElementById("googleSignupBtn").addEventListener("click", async () => {
  try {
    const provider = new GoogleAuthProvider();
    const result = await signInWithPopup(auth, provider);

    const user = result.user;
    const uid = user.uid;

    const vendorId = await getNextVendorId();

    await setDoc(doc(db, "vendors", uid), {
      vendorId,
      uid,
      name: user.displayName || "",
      email: user.email,
      phone: "",
      status: "incomplete",
      createdAt: Date.now()
    });

    alert("Signup Successful!");
    location.href = "vendor-register.html";

  } catch (err) {
    alert(err.message);
  }
});
