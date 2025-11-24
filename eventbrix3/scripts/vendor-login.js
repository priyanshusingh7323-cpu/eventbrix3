import { auth, db } from "/scripts/firebase.js";
import {
  signInWithEmailAndPassword,
  RecaptchaVerifier,
  signInWithPhoneNumber
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

import {
  collection,
  query,
  where,
  getDocs
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";


// -------------------------------------------------
// PHONE FORMAT FIX
// -------------------------------------------------
function formatPhone(num) {
  num = num.trim();

  if (num.startsWith("+91")) return num;
  if (num.startsWith("91")) return "+" + num;

  return "+91" + num;
}



// -------------------------------------------------
// EMAIL LOGIN
// -------------------------------------------------
document.getElementById("vendorLoginForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  try {
    const user = (await signInWithEmailAndPassword(
      auth,
      e.target.email.value,
      e.target.password.value
    )).user;

    const q = query(collection(db, "vendors"), where("uid", "==", user.uid));
    const snap = await getDocs(q);

    if (snap.empty) return alert("Vendor not found");

    const V = snap.docs[0].data();

    if (V.status === "incomplete")
      return (location.href = "vendor-register.html");

    return (location.href = "vendor-dashboard.html");

  } catch (err) {
    alert(err.message);
  }
});



// -------------------------------------------------
// OTP LOGIN
// -------------------------------------------------
let confirmationResult;

// Recaptcha (Firebase v10 syntax)
window.recaptchaVerifier = new RecaptchaVerifier(
  auth,
  "sendOtpBtn",
  {
    size: "invisible",
    callback: () => {
      console.log("Recaptcha ready");
    }
  }
);



document.getElementById("sendOtpBtn").onclick = async () => {
  let phone = document.getElementById("phoneLogin").value.trim();
  phone = formatPhone(phone);

  if (!phone) return alert("Enter phone number");

  try {
    const appVerifier = window.recaptchaVerifier;

    confirmationResult = await signInWithPhoneNumber(
      auth,
      phone,
      appVerifier
    );

    document.getElementById("otpBox").style.display = "block";
    alert("OTP sent!");

  } catch (err) {
    console.error(err);
    alert("Failed to send OTP: " + err.message);
  }
};


// -------------------------------------------------
// VERIFY OTP
// -------------------------------------------------
document.getElementById("verifyOtpBtn").onclick = async () => {
  const otp = document.getElementById("otpInput").value.trim();

  if (!otp) return alert("Enter OTP");

  try {
    const result = await confirmationResult.confirm(otp);
    const user = result.user;

    const q = query(
      collection(db, "vendors"),
      where("phone", "==", user.phoneNumber)
    );

    const snap = await getDocs(q);

    if (snap.empty) return alert("Vendor not found");

    const V = snap.docs[0].data();

    if (V.status === "incomplete")
      return (location.href = "vendor-register.html");

    return (location.href = "vendor-dashboard.html");

  } catch (err) {
    console.error(err);
    alert("Invalid OTP");
  }
};
