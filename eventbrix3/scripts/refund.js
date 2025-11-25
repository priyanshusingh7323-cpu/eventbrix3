// ========================================
// refund.js (FULL WORKING SYSTEM)
// ========================================

import { db } from "./firebase.js";

import {
  doc,
  getDoc,
  updateDoc,
  Timestamp
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";


// ------------------------------------------------------
// MAIN REFUND FUNCTION (Called by Admin Panel)
// ------------------------------------------------------
export async function processRefund(bookingId) {
  try {
    const ref = doc(db, "bookings", bookingId);
    const snap = await getDoc(ref);

    if (!snap.exists()) {
      alert("Booking not found!");
      return;
    }

    const d = snap.data();
    const amount = d.amount;
    const paymentTime = d.paymentTimestamp;
    const now = Date.now();

    if (!paymentTime) {
      alert("This booking has no payment record.");
      return;
    }

    let hrs = (now - paymentTime.toMillis()) / (1000 * 60 * 60);
    let refundAmount = 0;

    // gateway MDR charges (approx 2%)
    let gatewayFee = amount * 0.02;

    // ---------------------------------------------------
    // REFUND LOGIC
    // ---------------------------------------------------
    if (hrs <= 24) {
      // FULL refund (gateway MDR returned automatically by Razorpay)
      refundAmount = amount;
      gatewayFee = 0;
    }
    else if (hrs <= 48) {
      // 50% refund - gateway fee
      refundAmount = (amount * 0.5) - gatewayFee;
    }
    else if (hrs <= 168) { // 7 days = 168 hrs
      // 20% refund - gateway fee
      refundAmount = (amount * 0.2) - gatewayFee;
    }
    else {
      refundAmount = 0;  // No refund window
    }

    if (refundAmount < 0) refundAmount = 0;

    // ---------------------------------------------------
    // FIRESTORE UPDATE
    // ---------------------------------------------------
    await updateDoc(ref, {
      status: "refunded",
      refundAmount: Math.round(refundAmount),
      refundedAt: Timestamp.now()
    });

    alert("Refund processed: ₹" + Math.round(refundAmount));

  } catch (err) {
    console.log(err);
    alert("Refund failed. Check console.");
  }
}
