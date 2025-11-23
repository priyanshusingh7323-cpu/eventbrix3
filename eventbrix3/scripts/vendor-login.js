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


// ------------------------------------
// FIX PHONE FORMAT
// ------------------------------------
function formatPhone(num) {
  num = num.trim();

  if (num.startsWith("+91")) return num;
  if (num.startsWith("91")) return "+" + num;

  return "+91" + num;
}


// ------------------------------------
// EMAIL LOGIN
// ------------------------------------
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
      return location.href = "vendor-register.html";

    return location.href = "vendor-dashboard.html";

  } catch (err) {
    alert(err.message);
  }
});


// ------------------------------------
// OTP LOGIN
// ------------------------------------
let confirmationResult;

window.recaptchaVerifier = new RecaptchaVerifier(auth, "sendOtpBtn", {
  size: "invisible",
});

document.getElementById("sendOtpBtn").onclick = async () => {
  let phone = document.getElementById("phoneLogin").value;
  phone = formatPhone(phone);

  if (!phone) return alert("Enter p
