// ========================================
// payout.js (FULL WORKING SYSTEM)
// ========================================

import { db } from "./firebase.js";

import {
  doc,
  getDoc,
  updateDoc,
  Timestamp
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";


// ------------------------------------------------------
// MAIN VENDOR PAYOUT FUNCTION
// Called from admin panel: payoutStage = 50, 80, 100
// ------------------------------------------------------
export async function processPayout(bookingId, payoutStage) {
  try {
    const ref = doc(db, "bookings", bookingId);
    const snap = await getDoc(ref);

    if (!snap.exists()) {
      alert("Booking not found!");
      return;
    }

    const d = snap.data();

    // Payment must be done
    if (d.paymentStatus !== "paid") {
      alert("Customer has not paid yet — no payout possible!");
      return;
    }

    const amount = d.amount;
    const platformFee = amount * 0.02; // 2% vendor side
    let payoutAmount = 0;

    // ------------------------------------------------------
    // STAGE WISE PAYOUT CALCULATION
    // ------------------------------------------------------
    if (payoutStage === 50) {
      payoutAmount = (amount * 0.5) - platformFee;
    }
    else if (payoutStage === 80) {
      payoutAmount = (amount * 0.8) - platformFee;
    }
    else if (payoutStage === 100) {
      payoutAmount = amount - platformFee;
    }
    else {
      alert("Invalid payout stage!");
      return;
    }

    if (payoutAmount < 0) payoutAmount = 0;

    // ------------------------------------------------------
    // FIRESTORE UPDATE
    // ------------------------------------------------------
    await updateDoc(ref, {
      payoutStage: payoutStage,
      vendorPayoutAmount: Math.round(payoutAmount),
      vendorPayoutTimestamp: Timestamp.now()
    });

    alert(`Payout Stage ${payoutStage}% Released: ₹${Math.round(payoutAmount)}`);

  } catch (err) {
    console.log(err);
    alert("Payout failed. Check console.");
  }
}
