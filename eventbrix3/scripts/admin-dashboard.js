// ===============================
// ADMIN AUTH CHECK
// ===============================
import { auth, db } from "./firebase.js";
import {
  collection,
  getDocs,
  updateDoc,
  doc,
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

import { processRefund } from "./refund.js";
import { processPayout } from "./payout.js";

// ===============================
// BACKEND BASE URL
// ===============================
const BASE_URL = "https://eventbrix3.onrender.com";

// ===============================
// ADMIN LOGIN CHECK
// ===============================
auth.onAuthStateChanged((user) => {
  if (!user || user.email !== "admin@eventbrix.com") {
    alert("Unauthorized!");
    window.location.href = "/admin/admin-login.html";
  }
});

// ===============================
// 1) LOAD PENDING VENDORS
// ===============================
export async function loadPendingVendors() {
  const box = document.getElementById("vendorsBox");
  box.innerHTML = "";

  const snap = await getDocs(collection(db, "vendors"));

  snap.forEach((v) => {
    const d = v.data();

    if (d.status === "pending") {
      box.innerHTML += `
        <div class="admin-card">
          <h3>${d.businessName}</h3>
          <p>${d.city}</p>

          <button class="green" onclick="approveVendor('${v.id}')">Approve</button>
          <button class="danger" onclick="rejectVendor('${v.id}')">Reject</button>
        </div>
      `;
    }
  });
}

window.approveVendor = async (id) => {
  await updateDoc(doc(db, "vendors", id), { status: "approved" });
  loadDashboard();
};

window.rejectVendor = async (id) => {
  await updateDoc(doc(db, "vendors", id), { status: "rejected" });
  loadDashboard();
};

// ===============================
// 2) LOAD PENDING BOOKINGS
// ===============================
export async function loadPendingBookings() {
  const box = document.getElementById("pendingBookingsBox");
  box.innerHTML = "";

  const snap = await getDocs(collection(db, "bookings"));

  snap.forEach((b) => {
    const d = b.data();

    if (d.status === "pending") {
      box.innerHTML += `
        <div class="admin-card">

          <h3>${d.vendorName}</h3>
          <p><strong>${d.customerName}</strong></p>

          <p>City: ${d.eventCity}</p>
          <p>Date: ${d.eventDate}</p>

          <button class="green" onclick="approveBooking('${b.id}')">Approve</button>
          <button class="danger" onclick="rejectBooking('${b.id}')">Reject</button>
        </div>
      `;
    }
  });
}

window.approveBooking = async (id) => {
  await updateDoc(doc(db, "bookings", id), { status: "approved" });
  loadDashboard();
};

window.rejectBooking = async (id) => {
  await updateDoc(doc(db, "bookings", id), { status: "rejected" });
  loadDashboard();
};

// ===============================
// 3) APPROVED BOOKINGS
// ===============================
export async function loadApprovedBookings() {
  const box = document.getElementById("approvedBookingsBox");
  box.innerHTML = "";

  const snap = await getDocs(collection(db, "bookings"));

  snap.forEach((b) => {
    const d = b.data();

    if (d.status === "approved") {
      box.innerHTML += `
        <div class="admin-card">
          <h3>${d.vendorName}</h3>
          <p>${d.customerName}</p>

          <p><b>Date:</b> ${d.eventDate}</p>
          <p><b>Payment:</b> ${d.paymentStatus}</p>
          <p><b>Amount:</b> ₹${d.amount}</p>
        </div>
      `;
    }
  });
}

// ===============================
// 4) REFUND PANEL
// ===============================
export async function loadRefundPanel() {
  const box = document.getElementById("refundBox");
  box.innerHTML = "";

  const snap = await getDocs(collection(db, "bookings"));

  snap.forEach((b) => {
    const d = b.data();

    // Refund only for PAID + NOT refunded bookings
    if (d.paymentStatus === "paid" && d.status !== "refunded") {
      box.innerHTML += `
        <div class="admin-card">
          <h3>${d.vendorName}</h3>
          <p>${d.customerName}</p>
          <p><b>Amount:</b> ₹${d.amount}</p>

          <button onclick="refundBooking('${b.id}')" class="danger">
            Process Refund
          </button>
        </div>
      `;
    }
  });
}

window.refundBooking = async (id) => {
  await processRefund(id);
  alert("Refund Calculated & Applied!");
  loadDashboard();
};

// ===============================
// 5) PAYOUT PANEL
// ===============================
export async function loadPayoutPanel() {
  const box = document.getElementById("payoutBox");
  box.innerHTML = "";

  const snap = await getDocs(collection(db, "bookings"));

  snap.forEach((b) => {
    const d = b.data();

    // Payout only if PAID and NOT refunded
    if (d.paymentStatus === "paid" && d.status !== "refunded") {
      box.innerHTML += `
        <div class="admin-card">

          <h3>${d.vendorName}</h3>
          <p>${d.customerName}</p>

          <button onclick="payout('${b.id}', 50)">Payout 50%</button>
          <button onclick="payout('${b.id}', 80)">Payout 80%</button>
          <button onclick="payout('${b.id}', 100)">Payout 100%</button>
        </div>
      `;
    }
  });
}

window.payout = async (id, stage) => {
  await processPayout(id, stage);
  alert("Payout Processed!");
  loadDashboard();
};

// ===============================
// LOAD ALL SECTIONS
// ===============================
export function loadDashboard() {
  loadPendingVendors();
  loadPendingBookings();
  loadApprovedBookings();
  loadRefundPanel();
  loadPayoutPanel();
}

loadDashboard();
