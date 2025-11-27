import { db } from "./firebase.js";
import { doc, updateDoc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

const BASE_URL = "https://eventbrix3.onrender.com";
const RAZORPAY_KEY_ID = "rzp_test_Rjy29zTH71OIkZ";

/* =====================================
   LOAD RAZORPAY SDK
===================================== */
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

/* =====================================
   PAY NOW — OPEN CHECKOUT
===================================== */
export async function openCheckout(bookingId, amount) {
  try {
    await loadRazorpay();

    // Remove commas from amount
    const cleanAmount = Number(String(amount).replace(/,/g, ""));

    // Create order
    const orderRes = await fetch(`${BASE_URL}/api/payment/create-order`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ amount: cleanAmount })
    });

    const orderData = await orderRes.json();
    if (!orderData.success || !orderData.order) {
      return alert("Order creation failed");
    }

    const order = orderData.order;

    const options = {
      key: RAZORPAY_KEY_ID,
      amount: order.amount,
      currency: "INR",
      name: "EventBrix",
      description: "Vendor Booking Payment",
      order_id: order.id,

      handler: async function (response) {
        // verify backend
        const verifyRes = await fetch(`${BASE_URL}/api/payment/verify`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ...response,
            bookingId
          })
        });

        const verifyData = await verifyRes.json();

        if (!verifyData.success) {
          alert("Payment verification failed!");
          return;
        }

        alert("Payment Successful!");
        location.reload();
      },

      theme: { color: "#d4a017" }
    };

    new Razorpay(options).open();

  } catch (err) {
    console.error("PAYMENT ERROR:", err);
    alert("Payment Failed!");
  }
}

/* =====================================
   PAY AFTER VISIT
===================================== */
export async function payAfterVisit(bookingId) {
  try {
    await updateDoc(doc(db, "bookings", bookingId), {
      paymentStatus: "after_visit",  // FIXED (was pay_later)
      updatedAt: Date.now()
    });

    alert("Pay After Visit selected!");
    location.reload();

  } catch (err) {
    console.error(err);
    alert("Failed to update status");
  }
}
