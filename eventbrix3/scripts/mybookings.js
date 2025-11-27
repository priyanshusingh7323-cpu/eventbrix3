import { db } from "./firebase.js";
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  updateDoc
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

import { openCheckout, payAfterVisit } from "./payment.js";

/* =====================================
   BACKEND BASE URL
===================================== */
const BASE_URL = "https://eventbrix3.onrender.com";

/* ============================
   LOAD USER BOOKINGS (UI)
============================ */
export async function loadBookingsUI(userId) {
  const q = query(
    collection(db, "bookings"),
    where("customerId", "==", userId)
  );

  const snap = await getDocs(q);

  let html = "";

  snap.forEach((b) => {
    const d = b.data();
    html += bookingCard(b.id, d);
  });

  document.getElementById("myBookings").innerHTML = html;
}

/* ============================
   BOOKING CARD UI
============================ */
function bookingCard(id, d) {
  return `
    <div class="booking-card" onclick="toggleBooking('${id}')">
      <p><b>${d.vendorName || "Vendor"}</b></p>
      <p>${d.eventDate}</p>
      <p style="color:#777;">${d.status}</p>
    </div>

    <div id="${id}" class="booking-details" style="display:none;">
      <p><b>Event Type:</b> ${d.eventType}</p>
      <p><b>Amount:</b> ₹${d.amount}</p>
      <p><b>Status:</b> ${d.status}</p>
      <p><b>Payment:</b> ${d.paymentStatus}</p>

      ${renderButtons(id, d)}
    </div>
  `;
}

/* ============================
   BUTTON LOGIC WITH 24-HOUR EXPIRY
============================ */
function renderButtons(id, d) {
  const now = Date.now();

  // 1) Already Paid
  if (d.paymentStatus === "paid") {
    return `<p style="color:green;"><b>Payment Completed ✔</b></p>`;
  }

  // 2) Pay After Visit already chosen
  if (d.paymentStatus === "after_visit") {
    const selectedAt = d.afterVisitTimestamp || 0;
    const hoursPassed = (now - selectedAt) / (1000 * 60 * 60);

    // EXPIRED (after 24 hours)
    if (hoursPassed > 24) {
      return `
        <button class="pay-btn" onclick="payNow('${id}', ${d.amount})">Pay Now</button>
        <p style="color:red;margin-top:8px;"><b>Pay After Visit Expired</b></p>
      `;
    }

    // ACTIVE
    const left = Math.ceil(24 - hoursPassed);

    return `
      <button class="pay-btn" onclick="payNow('${id}', ${d.amount})">Pay Now</button>
      <p style="color:blue;margin-top:8px;"><b>Pay After Visit Active (${left} hours left)</b></p>
    `;
  }

  // 3) Booking not yet approved
  if (d.status !== "approved") {
    return `<p style="color:gray;">Waiting for Admin Approval...</p>`;
  }

  // 4) Approved → both options available
  return `
    <button class="pay-btn" onclick="payNow('${id}', ${d.amount})">Pay Now</button>
    <button class="secondary-btn" onclick="choosePayLater('${id}')">Pay After Visit</button>
  `;
}

/* ============================
   GLOBAL FUNCTIONS
============================ */
window.toggleBooking = function (id) {
  const box = document.getElementById(id);
  box.style.display = box.style.display === "none" ? "block" : "none";
};

// PAY NOW (Razorpay)
window.payNow = (id, amt) => {
  openCheckout(id, amt);
};

// PAY AFTER VISIT (store timestamp)
window.choosePayLater = async (id) => {
  await updateDoc(doc(db, "bookings", id), {
    paymentStatus: "after_visit",
    afterVisitTimestamp: Date.now(),
    updatedAt: Date.now()
  });

  alert("Pay After Visit selected!");
  location.reload();
};
