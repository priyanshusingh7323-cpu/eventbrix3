import { db } from "./firebase.js";
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  updateDoc,
  getDoc,
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

import { openCheckout } from "./payment.js";

const BASE_URL = "https://eventbrix3.onrender.com";

/* ===========================================
   LOAD BOOKINGS INTO DASHBOARD
=========================================== */
export async function loadBookingsUI(userId) {
  const q = query(collection(db, "bookings"), where("customerId", "==", userId));
  const snap = await getDocs(q);

  let html = "";
  snap.forEach((b) => {
    const d = b.data();
    html += bookingCard(b.id, d);
  });

  document.getElementById("myBookings").innerHTML = html;
}

/* ===========================================
   BOOKING CARD UI (FINAL PREMIUM VERSION)
=========================================== */
function bookingCard(id, d) {
  const payNowBtn = `
      <button class="pay-btn" onclick="payNow('${id}')">Pay Now</button>
  `;

  const payLaterBtn = `
      <button class="secondary-btn" onclick="choosePayLater('${id}')">
        Pay After Visit
      </button>
  `;

  const receiptBtn = `
      <button class="gold-btn" onclick="downloadReceipt('${id}')">
        Download Receipt (PDF)
      </button>
  `;

  return `
    <div class="booking-card" onclick="toggleBooking('${id}')">
      <p><b>${d.vendorName}</b></p>
      <p>${d.eventDate}</p>
      <p style="color:#777;">${d.status}</p>
    </div>

    <div id="${id}" class="booking-details" style="display:none;">
      <p><b>Event Type:</b> ${d.eventType}</p>
      <p><b>Amount:</b> ₹${d.amount || "-"}</p>
      <p><b>Status:</b> ${d.status}</p>
      <p><b>Payment Status:</b> ${statusBadge(d)}</p>

      ${paymentControls(id, d)}
      ${refundSection(id, d)}
      ${paymentDetails(d)}
      ${d.paymentStatus === "paid" ? receiptBtn : ""}
    </div>
  `;
}

/* ===========================================
   PAYMENT STATUS BADGE
=========================================== */
function statusBadge(d) {
  if (d.paymentStatus === "paid")
    return `<span style="color:#00ff8c;">Paid ✔</span>`;

  if (d.paymentStatus === "after_visit")
    return `<span style="color:#3aa6ff;">Pay After Visit Active</span>`;

  return `<span style="color:#ff4444;">Unpaid</span>`;
}

/* ===========================================
   PAYMENT CONTROLS (BUTTONS LOGIC)
=========================================== */
function paymentControls(id, d) {
  const now = Date.now();

  if (d.paymentStatus === "paid") return "";

  if (d.paymentStatus === "after_visit") {
    const start = d.afterVisitTimestamp || 0;
    const hrs = (now - start) / (1000 * 60 * 60);

    if (hrs > 24) {
      return `
        <p style="color:red;"><b>Pay After Visit Expired</b></p>
        <button class="pay-btn" onclick="payNow('${id}')">Pay Now</button>
      `;
    }

    const left = Math.ceil(24 - hrs);
    return `
      <button class="pay-btn" onclick="payNow('${id}')">Pay Now</button>
      <p style="color:#3aa6ff;"><b>${left} hrs left to pay</b></p>
    `;
  }

  if (d.status !== "approved")
    return `<p style="color:gray;">Waiting for approval...</p>`;

  return `
    <button class="pay-btn" onclick="payNow('${id}')">Pay Now</button>
    <button class="secondary-btn" onclick="choosePayLater('${id}')">
      Pay After Visit
    </button>
  `;
}

/* ===========================================
   REFUND SYSTEM (FULL LOGIC)
=========================================== */
function refundSection(id, d) {
  if (d.paymentStatus !== "paid") return "";
  if (!d.paymentTimestamp) return "";

  const now = Date.now();
  const hrs = (now - d.paymentTimestamp) / (1000 * 60 * 60);

  let msg = "";
  let allowed = true;

  if (hrs <= 24) {
    msg = `Full Refund Eligible (${Math.ceil(24 - hrs)} hrs left)`;
  } else if (hrs <= 48) {
    msg = `50% Refund Eligible (${Math.ceil(48 - hrs)} hrs left)`;
  } else if (hrs <= 168) {
    msg = `20% Refund Eligible (${Math.ceil(168 - hrs)} hrs left)`;
  } else {
    msg = "Not Eligible for Refund";
    allowed = false;
  }

  return `
    <p style="color:gold;"><b>${msg}</b></p>
    ${
      allowed
        ? `<button class="danger-btn" onclick="requestRefund('${id}')">
             Request Refund
           </button>`
        : ""
    }
  `;
}

/* ===========================================
   PAYMENT DETAILS SECTION
=========================================== */
function paymentDetails(d) {
  if (d.paymentStatus !== "paid") return "";

  return `
    <p><b>Payment ID:</b> ${d.paymentId}</p>
    <p><b>Order ID:</b> ${d.orderId}</p>
    <p><b>Paid At:</b> ${new Date(d.paymentTimestamp).toLocaleString()}</p>
  `;
}

/* ===========================================
   GLOBAL FUNCTIONS
=========================================== */
window.toggleBooking = (id) => {
  const box = document.getElementById(id);
  box.style.display = box.style.display === "none" ? "block" : "none";
};

/* PAY NOW → customer enters amount */
window.payNow = async (id) => {
  const amt = prompt("Enter amount to pay (₹):");

  if (!amt || amt < 1) return alert("Enter valid amount");

  await updateDoc(doc(db, "bookings", id), {
    amount: Number(amt),
    finalAmountSetAt: Date.now(),
  });

  openCheckout(id, Number(amt));
};

/* PAY AFTER VISIT */
window.choosePayLater = async (id) => {
  await updateDoc(doc(db, "bookings", id), {
    paymentStatus: "after_visit",
    afterVisitTimestamp: Date.now(),
  });

  alert("Pay After Visit selected!");
  location.reload();
};

/* REFUND REQUEST */
window.requestRefund = async (id) => {
  const res = await fetch(`${BASE_URL}/api/refund/process`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ bookingId: id }),
  });

  const r = await res.json();
  if (r.success) {
    alert("Refund processed: ₹" + r.refundAmount);
    location.reload();
  } else {
    alert("Refund failed: " + r.error);
  }
};

/* DOWNLOAD RECEIPT */
window.downloadReceipt = async (id) => {
  window.open(`${BASE_URL}/api/receipt/download/${id}`, "_blank");
};
