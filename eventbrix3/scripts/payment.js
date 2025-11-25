import { db } from "./firebase.js";
import { doc, updateDoc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

const BASE_URL = "https://eventbrix3.onrender.com"; 
const RAZORPAY_KEY_ID = "rzp_test_Rjy29zTH71OIkZ";

function loadRazorpay() {
  return new Promise((resolve, reject) => {
    if (window.Razorpay) return resolve();
    const s = document.createElement("script");
    s.src = "https://checkout.razorpay.com/v1/checkout.js";
    s.onload = resolve;
    s.onerror = reject;
    document.body.appendChild(s);
  });
}

/* ------------------- PAY NOW ------------------- */
export async function openCheckout(bookingId, amount) {
  try {
    await loadRazorpay();

    // Create order
    const orderRes = await fetch(`${BASE_URL}/api/payment/create-order`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ amount })
    });

    const { success, order } = await orderRes.json();
    if (!success) return alert("Order create failed");

    const options = {
      key: RAZORPAY_KEY_ID,
      amount: order.amount,
      currency: "INR",
      name: "EventBrix",
      description: "Vendor Booking Payment",
      order_id: order.id,

      handler: async function (response) {
        // VERIFY + SAVE TIMESTAMP
        const verify = await fetch(`${BASE_URL}/api/payment/verify`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...response, bookingId })
        });

        const vr = await verify.json();
        if (!vr.success) return alert("Payment verification failed");

        alert("Payment Successful!");
        location.reload();
      },

      theme: { color: "#d4a017" }
    };

    new Razorpay(options).open();
  } catch (err) {
    console.error(err);
    alert("Payment Failed");
  }
}

/* ------------------- PAY AFTER VISIT ------------------- */
export async function payAfterVisit(bookingId) {
  try {
    await updateDoc(doc(db, "bookings", bookingId), {
      paymentStatus: "pay_later",
      updatedAt: Date.now()
    });

    alert("Marked as Pay After Visit");
    location.reload();
  } catch (err) {
    alert("Failed");
  }
}
