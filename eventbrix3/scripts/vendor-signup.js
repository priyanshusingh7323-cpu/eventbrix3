import { auth, db } from "/scripts/firebase.js";
import {
  RecaptchaVerifier,
  signInWithPhoneNumber,
  createUserWithEmailAndPassword
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

import {
  doc,
  setDoc
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

import { getNextVendorId } from "/scripts/vendor-id.js";


// ------------------------------
// RECAPTCHA INVISIBLE
// ------------------------------
window.recaptchaVerifier = new RecaptchaVerifier(auth, "sendOtpBtn", {
  size: "invisible",
});

let confirmationResult;


// ------------------------------
// SEND OTP
// ------------------------------
document.getElementById("sendOtpBtn").onclick = async () => {
  const phone = document.getElementById("phone").value;

  if (!phone) return alert("Enter phone number");

  try {
    confirmationResult = await signInWithPhoneNumber(
      auth,
      phone,
      window.recaptchaVerifier
    );

    document.getElementById("otpCode").style.display = "block";
    document.getElementById("verifyOtpBtn").style.display = "block";

    alert("OTP sent!");
  
  } catch (err) {
    alert(err.message);
  }
};


// ------------------------------
// VERIFY OTP
// ------------------------------
document.getElementById("verifyOtpBtn").onclick = async () => {
  const otp = document.getElementById("otpCode").value;
  if (!otp) return alert("Enter OTP");

  try {
    const result = await confirmationResult.confirm(otp);
    const user = result.user;

    // Show email + password fields
    document.getElementById("email").style.display = "block";
    document.getElementById("password").style.display = "block";
    document.getElementById("createAccountBtn").style.display = "block";

    alert("OTP Verified! Now complete your signup.");

  } catch (err) {
    alert("Invalid OTP");
  }
};


// ------------------------------
// FINAL EMAIL + PASSWORD ACCOUNT CREATE
// ------------------------------
document.getElementById("vendorSignupForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  const name = e.target.name.value;
  const email = e.target.email.value;
  const password = e.target.password.value;
  const phone = document.getElementById("phone").value;

  try {
    const cred = await createUserWithEmailAndPassword(auth, email, password);
    const uid = cred.user.uid;

    const vendorId = await getNextVendorId();

    await setDoc(doc(db, "vendors", vendorId), {
      vendorId,
      uid,
      name,
      email,
      phone,
      createdAt: Date.now(),
      status: "incomplete"
    });

    alert("Account Created!");
    location.href = "vendor-register.html";

  } catch (err) {
    alert(err.message);
  }
});
