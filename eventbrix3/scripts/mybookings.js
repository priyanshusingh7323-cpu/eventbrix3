// =====================================
// mybookings.js (FULL WORKING VERSION)
// =====================================

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


// Load bookings for current user
export async function loadBookings(userId) {
  const q = query(collection(db, "bookings"), where("customerId", "==", userId));
  const snap = await getDocs(q);

  let html = "";

  snap.forEach((b) => {
    const d = b.data();
    const id = b.id;

    html += bookingCard(id, d);
  });

  document.getElementById("myBookings").innerHTML = html;
}



// =====================================
// BOOKING CARD UI (accordion style)
// =====================================
function bookingCard(id, d) {
  return `
    <div class="booking-card" onclick="toggleBooking('${id}')">
        <p><b>${d.vendorName}</b></p>
        <p>${d.eventDate}</p>
    </div>

    <div id="${id}" class="booking-details" style="display:none; padding:15px; background:#f3f3f3; border-radius:10px;">

        <p><b>Event Type:</b> ${d.eventType}</p>
        <p><b>Amount:</b> ₹${d.amount}</p>
        <p><b>Status:</b> ${d.status}</p>

        ${d.visitStatus === "visited" ? `<p style="color:green;"><b>Vendor Visit Completed</b></p>` : ""}

        ${renderPaymentButtons(id, d)}

    </div>
  `;
}



// =====================================
// PAYMENT BUTTON LOGIC (when to show)
// =====================================
function renderPaymentButtons(id, d) {

  // Already paid → no buttons
  if (d.paymentStatus === "paid") {
    return `<p style="color:green;"><b>Payment Completed</b></p>`;
  }

  // Not approved → no payment options
  if (d.status !== "approved") {
    return `<p style="color:gray;">Waiting for admin approval...</p>`;
  }

  // Vendor visit done → only Pay Now needed BUT Pay After Visit can stay optional
  if (d.visitStatus === "visited") {
    return `
      <button onclick="payNow('${id}', ${d.amount})" class="pay-btn">Pay Now</button>
    `;
  }

  // Default → BOTH buttons show
  return `
      <button onclick="payNow('${id}', ${d.amount})" class="pay-btn">Pay Now</button>
      <button onclick="payLater('${id}')" class="secondary-btn">Pay After Vendor Visit</button>
  `;
}



// =====================================
// GLOBAL FUNCTIONS FOR HTML BUTTONS
// =====================================
window.toggleBooking = function (id) {
  let box = document.getElementById(id);
  box.style.display = box.style.display === "none" ? "block" : "none";
};

window.payNow = function (id, amount) {
  openCheckout(id, amount);
};

window.payLater = function (id) {
  payAfterVisit(id);
};
