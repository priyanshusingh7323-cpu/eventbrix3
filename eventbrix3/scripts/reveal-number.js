// File 25: scripts/reveal-number.js
// Razorpay payment + reveal vendor number

import { db, auth } from "../firebase.js";
import { doc, getDoc, setDoc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// Vendor ID from URL
const urlParams = new URLSearchParams(window.location.search);
const vendorId = urlParams.get("vendor");

const payBtn = document.getElementById("payBtn");
const numberBox = document.getElementById("numberBox");

// Fetch vendor number after payment
async function showVendorNumber() {
  const snap = await getDoc(doc(db, "vendors", vendorId));
  if (snap.exists()) {
    numberBox.style.display = "block";
    numberBox.innerHTML = `<h3>Vendor Number:</h3><p>${snap.data().phone || "Not Provided"}</p>`;
  }
}

// Razorpay Payment
payBtn.addEventListener("click", async () => {
  const options = {
    key: "rzp_test_1234567890", // replace with your real key later
    amount: 9900,
    currency: "INR",
    name: "EventBrix",
    description: "Vendor Contact Reveal",

    handler: async function () {
      // Save payment record
      await setDoc(doc(db, "reveals", `${auth.currentUser.uid}_${vendorId}`), {
        customer: auth.currentUser.uid,
        vendor: vendorId,
        amount: 99,
        timestamp: new Date()
      });

      alert("Payment successful! Number revealed.");
      showVendorNumber();
    },

    theme: { color: "#ffd34f" }
  };

  const razor = new Razorpay(options);
  razor.open();
});