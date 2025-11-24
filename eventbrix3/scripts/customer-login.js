// IMPORTS MUST ALWAYS BE AT TOP
import {
  auth, db, googleProvider, appleProvider,
  RecaptchaVerifier, signInWithPhoneNumber,
  signInWithPopup
} from "../scripts/firebase.js";

import { doc, getDoc }
from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

import { signOut }
from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";


// WAIT FOR DOM
document.addEventListener("DOMContentLoaded", () => {

(async () => {

console.log("customer-login.js loaded");

// LOGOUT OLD USER
await signOut(auth);

let loginConfirmation;


// RECAPTCHA
window.recaptchaLoginVerifier = new RecaptchaVerifier(
  auth,
  "recaptcha-login-container",
  { size: "invisible" }
);

await window.recaptchaLoginVerifier.render();


// CHECK CUSTOMER
async function verifyCustomer() {
  const user = auth.currentUser;
  if (!user) return false;

  const snap = await getDoc(doc(db, "customers", user.uid));

  if (!snap.exists()) {
    alert("Customer not registered!");
    await signOut(auth);
    return false;
  }

  return true;
}


// OTP LOGIN
document.getElementById("otpLoginBtn").onclick = async () => {
  const phone = "+91" + prompt("Enter phone number:");

  try {
    loginConfirmation = await signInWithPhoneNumber(
      auth,
      phone,
      window.recaptchaLoginVerifier
    );

    document.getElementById("otpLoginBox").style.display = "block";
    alert("OTP sent!");
  } catch (e) {
    alert("OTP failed: " + e.message);
  }
};


// OTP VERIFY
document.getElementById("verifyOtpLoginBtn").onclick = async () => {
  try {
    await loginConfirmation.confirm(
      document.getElementById("otpLoginInput").value
    );

    if (await verifyCustomer()) {
      window.location.href = "../customer/customer-dashboard.html";
    }
  } catch {
    alert("Wrong OTP!");
  }
};


// GOOGLE LOGIN
document.getElementById("googleLoginBtn").onclick = async () => {
  try {
    await signInWithPopup(auth, googleProvider);

    if (await verifyCustomer()) {
      window.location.href = "../customer/customer-dashboard.html";
    }
  } catch (e) {
    alert("Google login failed: " + e.message);
  }
};

})();
});
