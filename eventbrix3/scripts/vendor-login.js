import { auth, db } from "/scripts/firebase.js";
import {
  signInWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
  RecaptchaVerifier,
  signInWithPhoneNumber
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

import {
  collection,
  query,
  where,
  getDocs
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";


// ===============================
// EMAIL PASSWORD LOGIN
// ===============================
document.getElementById("vendorLoginForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  try {
    const user = (await signInWithEmailAndPassword(auth, e.target.email.value, e.target.password.value)).user;

    const q = query(collection(db, "vendors"), where("uid", "==", user.uid));
    const snap = await getDocs(q);

    if (snap.empty) return alert("Vendor not found");

    const V = snap.docs[0].data();
    if (V.status === "incomplete") return location.href = "vendor-register.html";

    return location.href = "vendor-dashboard.html";

  } catch (err) {
    alert(err.message);
  }
});


// ===============================
// SIMPLE PHONE OTP LOGIN
// ===============================
let confirmationResult;

window.recaptchaVerifier = new RecaptchaVerifier(auth, "sendOtpBtn", { size: "invisible" });

document.getElementById("sendOtpBtn").onclick = async () => {
  const phone = document.getElementById("phoneLogin").value;

  if (!phone) return alert("Enter phone number");

  try {
    confirmationResult = await signInWithPhoneNumber(auth, phone, window.recaptchaVerifier);

    document.getElementById("otpInput").style.display = "block";
    document.getElementById("verifyOtpBtn").style.display = "block";

    alert("OTP sent!");
  } catch (err) {
    alert(err.message);
  }
};


document.getElementById("verifyOtpBtn").onclick = async () => {
  const otp = document.getElementById("otpInput").value;

  if (!otp) return alert("Enter OTP");

  try {
    const result = await confirmationResult.confirm(otp);
    const user = result.user;

    const q = query(collection(db, "vendors"), where("phone", "==", user.phoneNumber));
    const snap = await getDocs(q);

    if (snap.empty) return alert("Vendor not found");

    const V = snap.docs[0].data();

    if (V.status === "incomplete") return location.href = "vendor-register.html";

    return location.href = "vendor-dashboard.html";

  } catch (err) {
    alert(err.message);
  }
};
