// scripts/payment.js
import { db } from "./firebase.js";
import { doc, updateDoc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// Your PUBLIC Razorpay Key ID:
const RAZORPAY_KEY_ID = "rzp_test_Rjy29zTH71OIkZ";

// BACKEND BASE URL (Render)
const BASE_URL = "https://eventbrix3.onrender.com";

/* Load Razorpay script */
function loadRazorpay() {
  return new Promise((resolve, reject) => {
    if (window.Razorpay) return resolve();
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = resolve;
    script.onerror = reject;
    document.body.appendChild(script);
  });
}

/* ---------------- PAY NOW (open Razorpay) ---------------- */
export async function openCheckout(bookingId, amount) {
  try {
    await loadRazorpay();

    // 1) CREATE ORDER from backend
    const orderRes = await fetch(`${BASE_URL}/api/payment/create-order`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ amount })
    });

    const { success, order } = await orderRes.json();
    if (!success) return alert("Failed to create order");

    // 2) Razorpay options
    const options = {
      key: RAZORPAY_KEY_ID,
      amount: order.amount,
      currency: "INR",
      name: "EventBrix",
      description: "Booking Payment",
      order_id: order.id,

      handler: async function (response) {
        // 3) VERIFY PAYMENT
        const verifyRes = await fetch(`${BASE_URL}/api/payment/verify`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(response)
        });

        const verifyData = await verifyRes.json();

        if (verifyData.success) {
          // 4) UPDATE BOOKING IN FIRESTORE
          await updateDoc(doc(db, "bookings", bookingId), {
            paymentStatus: "paid",
            paidAt: Date.now(),
            paymentInfo: response
          });

          alert("Payment Successful!");
          location.reload();
        } else {
          alert("Payment verification failed.");
        }
      },

      theme: {
        color: "#d4a017"
      }
    };

    const rzp = new Razorpay(options);
    rzp.open();

  } catch (err) {
    console.error(err);
    alert("Payment failed to start.");
  }
}

/* ---------------- PAY LATER ---------------- */
export async function payAfterVisit(bookingId) {
  try {
    await updateDoc(doc(db, "bookings", bookingId), {
      paymentStatus: "pay_later",
      payAfterVisit: true,
      updatedAt: Date.now()
    });

    alert("Marked as Pay After Visit");
    location.reload();
  } catch (e) {
    alert("Error updating booking.");
  }
}

