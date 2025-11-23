import { auth, db } from "/scripts/firebase.js";
import {
  RecaptchaVerifier,
  signInWithPhoneNumber,
  createUserWithEmailAndPassword
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

import { doc, setDoc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

import { getNextVendorId } from "/scripts/vendor-id.js";


// ------------------------------------
// FIX: PHONE FORMAT TO E.164 (+91...)
// ------------------------------------
function formatPhone(num) {
  num = num.trim();

  if (num.startsWith("+91")) return num;
  if (num.startsWith("91")) return "+" + num;
  return "+91" + num;
}


// ------------------------------------
// RECAPTCHA
// ------------------------------------
window.recaptchaVerifier = new RecaptchaVerifier(auth, "sendOtpBtn", {
  size: "invisible",
});

let confirmationResult;


// ------------------------------------
// SEND OTP
// ------------------------------------
document.getElementById("sendOtpBtn").onclick = async () => {
  let phone = document.getElementById("phone").value;
  phone = formatPhone(phone);

  if (!phone) return alert("Enter phone number");

  try {
    confirmationResult = await signInWithPhoneNumber(
      auth,
      phone,
      window.recaptchaVerifier
    );

    document.getElementById("otpCode").style.display = "block";
    document.getElementById("verifyOtpBtn").style.display = "block";

    alert("OTP Sent!");

  } catch (err) {
    alert(err.message);
  }
};


// ------------------------------------
// VERIFY OTP
// ------------------------------------
document.getElementById("verifyOtpBtn").onclick = async () => {
  const otp = document.getElementById("otpCode").value;

  if (!otp) return alert("Enter OTP");

  try {
    await confirmationResult.confirm(otp);

    // Show remaining inputs
    document.getElementById("email").style.display = "block";
    document.getElementById("password").style.display = "block";
    document.getElementById("createAccountBtn").style.display = "block";

    alert("OTP Verified! Complete your signup.");

  } catch (err) {
    alert("Invalid OTP");
  }
};


// ------------------------------------
// FINAL ACCOUNT CREATION
// ------------------------------------
document.getElementById("vendorSignupForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  const name = e.target.name.value;
  const email = e.target.email.value;
  const password = e.target.password.value;
  let phone = document.getElementById("phone").value;
  phone = formatPhone(phone);

  try {
    const userCred = await createUserWithEmailAndPassword(auth, email, password);

    const vendorId = await getNextVendorId();

    await setDoc(doc(db, "vendors", vendorId), {
      vendorId,
      uid: userCred.user.uid,
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
