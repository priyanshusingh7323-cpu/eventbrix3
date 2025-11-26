import { db } from "./firebase.js";
import {
  collection,
  query,
  where,
  getDocs
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

import { openCheckout, payAfterVisit } from "./payment.js";

/* =====================================
   BACKEND BASE URL (REQUIRED)
===================================== */
const BASE_URL = "https://eventbrix3.onrender.com";

/* ============================
   LOAD USER BOOKINGS
============================ */
export async function loadBookings(userId) {
  const q = query(collection(db, "bookings"), where("customerId", "==", userId));
  const snap = await getDocs(q);

  let html = "";
  snap.forEach((b) => {
    const d = b.data();
    html += cardUI(b.id, d);
  });

  document.getElementById("myBookings").innerHTML = html;
}

/* ============================
   BOOKING CARD UI
============================ */
function cardUI(id, d) {
  return `
    <div class="booking-card" onclick="toggleBooking('${id}')">
      <p><b>${d.vendorName}</b></p>
      <p>${d.eventDate}</p>
    </div>

    <div id="${id}" class="booking-details" style="display:none;">
      <p><b>Event Type:</b> ${d.eventType}</p>
      <p><b>Amount:</b> ₹${d.amount}</p>
      <p><b>Status:</b> ${d.status}</p>

      ${buttons(id, d)}
    </div>
  `;
}

/* ============================
   BUTTON LOGIC
============================ */
function buttons(id, d) {
  // Already paid
  if (d.paymentStatus === "paid") {
    return `<p style="color:green;"><b>Payment Completed</b></p>`;
  }

  // Not approved yet
  if (d.status !== "approved") {
    return `<p style="color:gray;">Waiting for approval...</p>`;
  }

  // Approved → show payment options
  return `
    <button onclick="payNow('${id}', ${d.amount})" class="pay-btn">Pay Now</button>
    <button onclick="payLater('${id}')" class="secondary-btn">Pay After Visit</button>
  `;
}

/* ============================
   GLOBAL FUNCS
============================ */
window.toggleBooking = function (id) {
  let box = document.getElementById(id);
  box.style.display = box.style.display === "none" ? "block" : "none";
};

window.payNow = (id, amount) => openCheckout(id, amount);
window.payLater = (id) => payAfterVisit(id);
