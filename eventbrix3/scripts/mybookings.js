import { db } from "./firebase.js";
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  updateDoc,
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

import { openCheckout } from "./payment.js";

/* =========================================================
   LOAD BOOKINGS INTO CUSTOMER DASHBOARD
========================================================= */
export async function loadBookingsUI(userId) {
  const snap = await getDocs(
    query(collection(db, "bookings"), where("customerId", "==", userId))
  );

  let html = "";
  snap.forEach((b) => {
    html += bookingCard(b.id, b.data());
  });

  document.getElementById("myBookings").innerHTML = html;
}

/* =========================================================
   BOOKING CARD UI
========================================================= */
function bookingCard(id, d) {
  return `
    <div class="booking-card" onclick="toggleBooking('${id}')">
      <p><b>${d.vendorName}</b></p>
      <p>${d.eventDate}</p>
      <p style="color:#777;">${d.status}</p>
    </div>

    <div id="${id}" class="booking-details" style="display:none;">
      <p><b>Event Type:</b> ${d.eventType}</p>
      <p><b>Amount:</b> ₹${d.amount ?? "-"}</p>
      <p><b>Status:</b> ${d.status}</p>
      <p><b>Payment Status:</b> ${paymentStatusBadge(d)}</p>

      ${paymentControls(id, d)}
      ${refundSection(id, d)}
    </div>
  `;
}

/* =========================================================
   PAYMENT STATUS BADGE
========================================================= */
function paymentStatusBadge(d) {
  if (d.refundStatus === "requested")
    return `<span style="color:orange;">Refund Requested</span>`;

  if (d.paymentStatus === "paid")
    return `<span style="color:#00ff8c;">Paid ✔</span>`;

  if (d.paymentStatus === "after_visit")
    return `<span style="color:#3aa6ff;">Pay After Visit</span>`;

  return `<span style="color:#ff4444;">Unpaid</span>`;
}

/* =========================================================
   PAYMENT CONTROLS
========================================================= */
function paymentControls(id, d) {
  const now = Date.now();

  // If refund already requested → no payment allowed
  if (d.refundStatus === "requested") return "";

  // Already Paid
  if (d.paymentStatus === "paid") return "";

  // Pay After Visit
  if (d.paymentStatus === "after_visit") {
    const ts = d.afterVisitTimestamp || 0;
    const hrs = (now - ts) / (1000 * 60 * 60);

    if (hrs > 24) {
      return `
        <p style="color:red;"><b>Pay After Visit Expired</b></p>
        <button class="pay-btn" onclick="payNow('${id}')">Pay Now</button>
      `;
    }

    return `
      <button class="pay-btn" onclick="payNow('${id}')">Pay Now</button>
      <p style="color:#3aa6ff;"><b>${Math.ceil(24 - hrs)} hrs left</b></p>
    `;
  }

  // Pending Approval → no actions
  if (d.status !== "approved")
    return `<p style="color:gray;">Waiting for approval...</p>`;

  // Approved → both options available
  return `
    <button class="pay-btn" onclick="payNow('${id}')">Pay Now</button>
    <button class="secondary-btn" onclick="choosePayLater('${id}')">Pay After Visit</button>
  `;
}

/* =========================================================
   REFUND SECTION (NEW POPUP SYSTEM)
========================================================= */
function refundSection(id, d) {
  if (d.refundStatus === "requested") {
    return `<p style="color:orange;"><b>Refund Requested — Pending Review</b></p>`;
  }

  if (d.paymentStatus !== "paid") return "";

  return `
    <button class="secondary-btn" onclick="openRefundPopup('${id}')">
      Cancel & Refund
    </button>
  `;
}

/* =========================================================
   PAY NOW (Customer Chooses Amount)
========================================================= */
window.payNow = async (id) => {
  const amt = prompt("Enter amount to pay (₹):");

  if (!amt || amt < 1) return alert("Enter valid amount");

  await updateDoc(doc(db, "bookings", id), {
    amount: Number(amt),
    finalAmountSetAt: Date.now(),
  });

  openCheckout(id, Number(amt));
};

/* =========================================================
   PAY AFTER VISIT
========================================================= */
window.choosePayLater = async (id) => {
  await updateDoc(doc(db, "bookings", id), {
    paymentStatus: "after_visit",
    afterVisitTimestamp: Date.now(),
  });

  alert("Pay After Visit selected!");
  location.reload();
};

/* =========================================================
   OPEN REFUND POPUP (SHARED POPUP FROM payments.html)
========================================================= */
window.openRefundPopup = (id) => {
  window.CURRENT_REFUND_BOOKING = id; // used by payment-page.js
  document.getElementById("refundPopup").style.display = "flex";
};

/* =========================================================
   TOGGLE BOOKING DETAILS
========================================================= */
window.toggleBooking = (id) => {
  const box = document.getElementById(id);
  box.style.display = box.style.display === "none" ? "block" : "none";
};
