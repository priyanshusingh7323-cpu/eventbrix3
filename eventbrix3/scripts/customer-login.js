<script type="module">
import {
  auth, db, googleProvider, appleProvider,
  RecaptchaVerifier, signInWithPhoneNumber,
  signInWithPopup
} from "../scripts/firebase.js";

import { doc, getDoc }
from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

import { signOut }
from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

// 🔥 AUTO LOGOUT (STOP AUTO-LOGIN)
await signOut(auth);

let loginConfirmation;

// SETUP RECAPTCHA
window.recaptchaLoginVerifier = new RecaptchaVerifier(
  auth,
  "recaptcha-login-container",
  { size: "invisible" }
);

await window.recaptchaLoginVerifier.render();

// 🔍 CHECK IF CUSTOMER ACCOUNT EXISTS
async function verifyCustomer() {
  const user = auth.currentUser;
  if (!user) return false;

  const snap = await getDoc(doc(db, "customers", user.uid));

  if (!snap.exists()) {
    alert("Customer account not found!");
    await signOut(auth);
    return false;
  }

  return true;
}

// OTP LOGIN
document.getElementById("otpLoginBtn").onclick = async () => {
  const phoneRaw = prompt("Enter phone number:");
  if (!phoneRaw) return;

  const phone = "+91" + phoneRaw;

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

// APPLE LOGIN
document.getElementById("appleLoginBtn").onclick = async () => {
  try {
    await signInWithPopup(auth, appleProvider);

    if (await verifyCustomer()) {
      window.location.href = "../customer/customer-dashboard.html";
    }
  } catch (e) {
    alert("Apple login failed: " + e.message);
  }
};
</script>
