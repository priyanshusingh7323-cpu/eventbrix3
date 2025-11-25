// ================================
// payment.js (FINAL CLEAN VERSION)
// ================================

import { db } from './firebase.js';

import {
  doc,
  updateDoc,
  Timestamp,
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";


// --------------------------------------------------
//  MAIN Razorpay Checkout Popup
// --------------------------------------------------
export async function openCheckout(bookingId, amount) {

  console.log("Opening Razorpay Checkout:", bookingId);

  var options = {
    key: "rzp_test_dummykey123",
    amount: amount * 100,
    currency: "INR",
    name: "EventBrix",
    description: "Booking Payment",

    handler: async function (response) {
      console.log("Payment Success:", response.razorpay_payment_id);

      await updateDoc(doc(db, "bookings", bookingId), {
        paymentStatus: "paid",
        status: "paid",
        paymentId: response.razorpay_payment_id,
        paymentTimestamp: Timestamp.now(),
        refundEligibleUntil: Date.now() + (24 * 60 * 60 * 1000) // 24 hours
      });

      alert("Payment successful!");
      window.location.reload();
    },

    prefill: {
      name: "Customer",
      email: "test@example.com",
      contact: "9999999999",
    },

    theme: { color: "#F37254" },
  };

  var rzp = new Razorpay(options);
  rzp.open();
}



// --------------------------------------------------
// CUSTOMER chooses "Pay After Vendor Visit"
// --------------------------------------------------
export async function payAfterVisit(bookingId) {
  await updateDoc(doc(db, "bookings", bookingId), {
    visitChoice: "after_visit"
  });

  alert("Okay! You can pay anytime — after vendor visit.");
  // NO reload needed actually — but safe
  window.location.reload();
}
