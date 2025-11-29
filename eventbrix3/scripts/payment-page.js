import { auth, db } from "/scripts/firebase.js";
import {
  collection,
  getDocs,
  query,
  where,
  doc,
  updateDoc
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

import { openCheckout } from "./payment.js"; // Razorpay core file

const box = document.getElementById("paymentList");

// GLOBAL for refund popup
let CURRENT_REFUND_BOOKING = null;

/* ================================
   ON USER LOGIN
================================ */
auth.onAuthStateChanged(async (user) => {
  if (!user) return (location.href = "/customer/customer-login.html");
  loadPaymentItems(user.uid);
});

/* ================================
   LOAD PAYMENTS FOR USER
================================ */
async function loadPaymentItems(uid) {
  const snap = await getDocs(
    query(collection(db, "bookings"), where("customerId", "==", uid))
  );

  box.innerHTML = "";

  if (snap.empty) {
    box.innerHTML = `<p style="color:gray;text-align:center;margin-top:25px;">
      No payment or refund records found.
    </p>`;
    return;
  }

  snap.forEach((b) => {
    const d = b.data();
    box.innerHTML += buildPaymentCard(b.id, d);
  });
}

/* ================================
   BUILD EACH PAYMENT CARD (UI)
================================ */
function buildPaymentCard(id, d) {
  const now = Date.now();
  let controls = "";

  /* ---------------------------------------
     1) REFUND REQUEST ALREADY SENT
  ---------------------------------------- */
  if (d.refundStatus === "requested") {
    controls = `<p style="color:orange;"><b>Refund Requested — Pending Review</b></p>`;
  }

  /* ---------------------------------------
     2) PAYMENT COMPLETED
  ---------------------------------------- */
  else if (d.paymentStatus === "paid") {
    controls = `
      <p style="color:green;font-weight:bold;">Payment Completed ✔</p>
      <button class="secondary-btn" onclick="openRefundPopup('${id}')">
        Cancel & Refund
      </button>
    `;
  }

  /* ---------------------------------------
     3) AFTER VISIT FLOW
  ---------------------------------------- */
  else if (d.paymentStatus === "after_visit") {
    const ts = d.afterVisitTimestamp || 0;
    const hrs = (now - ts) / (1000 * 60 * 60);

    if (hrs > 24) {
      controls = `
        <button class="pay-btn" onclick="payNow('${id}', ${d.amount})">Pay Now</button>
        <p class="expired"><b>Pay After Visit Expired</b></p>
      `;
    } else {
      const left = Math.ceil(24 - hrs);
      controls = `
        <button class="pay-btn" onclick="payNow('${id}', ${d.amount})">Pay Now</button>
        <p class="active"><b>Pay After Visit Active (${left} hours left)</b></p>
      `;
    }
  }

  /* ---------------------------------------
     4) APPROVED BUT UNPAID
  ---------------------------------------- */
  else if (d.status === "approved") {
    controls = `
      <button class="pay-btn" onclick="payNow('${id}', ${d.amount})">Pay Now</button>
      <button class="secondary-btn" onclick="choosePayLater('${id}')">
        Pay After Visit
      </button>
    `;
  }

  /* ---------------------------------------
     5) WAITING FOR APPROVAL
  ---------------------------------------- */
  else {
    controls = `<p style="color:gray;">Waiting for admin approval...</p>`;
  }

  return `
    <div class="payment-card">
      <h3>${d.vendorName}</h3>
      <p><b>Amount:</b> ₹${d.amount}</p>
      <p><b>Date:</b> ${d.eventDate}</p>
      <p><b>Payment Status:</b> ${d.paymentStatus}</p>
      ${controls}
    </div>
  `;
}

/* ================================
   PAY NOW (RAZORPAY)
================================ */
window.payNow = (id, amt) => {
  openCheckout(id, amt);
};

/* ================================
   PAY AFTER VISIT
================================ */
window.choosePayLater = async (id) => {
  await updateDoc(doc(db, "bookings", id), {
    paymentStatus: "after_visit",
    afterVisitTimestamp: Date.now(),
    updatedAt: Date.now()
  });

  alert("Pay After Visit Activated");
  location.reload();
};

/* ================================
   OPEN REFUND POPUP
================================ */
window.openRefundPopup = function (id) {
  CURRENT_REFUND_BOOKING = id;
  document.getElementById("refundPopup").style.display = "flex";
};

/* ================================
   CLOSE REFUND POPUP
================================ */
document.getElementById("closeRefundPopup").onclick = () => {
  document.getElementById("refundPopup").style.display = "none";
};

/* ================================
   SUBMIT REFUND REQUEST
================================ */
document.getElementById("submitRefundBtn").onclick = async () => {
  const reason = document.getElementById("refundReason").value;
  const details = document.getElementById("refundDetails").value;

  if (!CURRENT_REFUND_BOOKING) return;

  await updateDoc(doc(db, "bookings", CURRENT_REFUND_BOOKING), {
    refundRequest: true,
    refundStatus: "requested",
    refundReason: reason,
    refundDetails: details,
    refundRequestedAt: Date.now()
  });

  alert("Refund request submitted! The admin will review it.");
  document.getElementById("refundPopup").style.display = "none";
  location.reload();
};
