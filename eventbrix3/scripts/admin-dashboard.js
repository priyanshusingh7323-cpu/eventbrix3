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

auth.onAuthStateChanged((user) => {
  if (!user || user.email !== "admin@eventbrix.com") {
    alert("Unauthorized!");
    window.location.href = "/admin/admin-login.html";
  }
});

// ===============================
// LOAD 1 — Pending Vendors
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
// LOAD 2 — Pending Bookings
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
          <p>${d.customerName}</p>
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
// LOAD 3 — Approved Bookings
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
// LOAD 4 — Refund Panel
// ===============================
export async function loadRefundPanel() {
  const box = document.getElementById("refundBox");
  box.innerHTML = "";

  const snap = await getDocs(collection(db, "bookings"));

  snap.forEach((b) => {
    const d = b.data();

    if (d.paymentStatus === "paid" && d.status !== "refunded") {
      box.innerHTML += `
        <div class="admin-card">
          <h3>${d.vendorName}</h3>
          <p>${d.customerName}</p>
          <p><b>Amount:</b> ₹${d.amount}</p>
          <button onclick="refundBooking('${b.id}')" class="danger">Process Refund</button>
        </div>
      `;
    }
  });
}

window.refundBooking = async (id) => {
  await processRefund(id);
  alert("Refund Processed!");
  loadDashboard();
};

// ===============================
// LOAD 5 — Payout Panel
// ===============================
export async function loadPayoutPanel() {
  const box = document.getElementById("payoutBox");
  box.innerHTML = "";
  const snap = await getDocs(collection(db, "bookings"));

  snap.forEach((b) => {
    const d = b.data();
    if (d.paymentStatus === "paid" && d.status !== "refunded") {
      box.innerHTML += `
        <div class="admin-card">
          <h3>${d.vendorName}</h3>
          <p>${d.customerName}</p>
          <button onclick="payout('${b.id}',50)">Payout 50%</button>
          <button onclick="payout('${b.id}',80)">Payout 80%</button>
          <button onclick="payout('${b.id}',100)">Payout 100%</button>
        </div>
      `;
    }
  });
}

window.payout = async (id, stage) => {
  await processPayout(id, stage);
  loadDashboard();
};

// ===============================
// LOAD 6 — ANALYTICS CARDS
// ===============================
async function loadAnalyticsCards() {
  const bSnap = await getDocs(collection(db, "bookings"));
  const vSnap = await getDocs(collection(db, "vendors"));
  const cSnap = await getDocs(collection(db, "customers"));

  let totalPayments = 0, totalRefunds = 0, totalPayouts = 0;

  bSnap.forEach((b) => {
    const d = b.data();
    totalPayments += d.paymentStatus === "paid" ? Number(d.amount) : 0;
    totalRefunds += d.status === "refunded" ? Number(d.refundAmount || 0) : 0;
    totalPayouts += Number(d.vendorPayoutAmount || 0);
  });

  const earnings = totalPayments - (totalRefunds + totalPayouts);
  const profit = earnings;

  document.getElementById("anlPayments").innerText = "₹" + totalPayments;
  document.getElementById("anlRefunds").innerText = "₹" + totalRefunds;
  document.getElementById("anlPayouts").innerText = "₹" + totalPayouts;
  document.getElementById("anlEarnings").innerText = "₹" + earnings;
  document.getElementById("anlProfit").innerText = "₹" + profit;
  document.getElementById("anlVendors").innerText = vSnap.size;
  document.getElementById("anlCustomers").innerText = cSnap.size;

  const active = bSnap.docs.filter(b => b.data().status === "approved").length;
  document.getElementById("anlActive").innerText = active;
}

// ===============================
// LOAD 7 — ANALYTICS CHARTS
// ===============================
async function loadCharts() {
  const snap = await getDocs(collection(db, "bookings"));

  const payments = {};
  const refundCount = { refunded: 0, not_refunded: 0 };
  const payoutStages = { "50%": 0, "80%": 0, "100%": 0 };
  const bookingFlow = { pending: 0, approved: 0, paid: 0, completed: 0, refunded: 0 };

  const today = new Date();

  snap.forEach((b) => {
    const d = b.data();

    // MONTHLY PAYMENTS
    const month = new Date(d.eventDate).toLocaleString("default", { month: "short" });
    if (d.paymentStatus === "paid")
      payments[month] = (payments[month] || 0) + Number(d.amount);

    // REFUNDS
    if (d.status === "refunded") refundCount.refunded++;
    else refundCount.not_refunded++;

    // PAYOUTS
    if (d.payoutStage === 50) payoutStages["50%"]++;
    if (d.payoutStage === 80) payoutStages["80%"]++;
    if (d.payoutStage === 100) payoutStages["100%"]++;

    // BOOKINGS FLOW
    bookingFlow[d.status] = (bookingFlow[d.status] || 0) + 1;
    if (d.paymentStatus === "paid") bookingFlow.paid++;
    if (new Date(d.eventDate) < today && d.status === "approved")
      bookingFlow.completed++;
  });

  new Chart(document.getElementById("chartPayments"), {
    type: "line",
    data: {
      labels: Object.keys(payments),
      datasets: [{ label: "Payments (₹)", data: Object.values(payments), borderColor: "#ffd24a", backgroundColor: "rgba(255,210,74,0.3)" }]
    }
  });

  new Chart(document.getElementById("chartRefunds"), {
    type: "pie",
    data: {
      labels: ["Refunded", "Active"],
      datasets: [{ data: Object.values(refundCount), backgroundColor: ["#ff4d4d", "#4caf50"] }]
    }
  });

  new Chart(document.getElementById("chartPayouts"), {
    type: "doughnut",
    data: {
      labels: ["50%", "80%", "100%"],
      datasets: [{ data: Object.values(payoutStages), backgroundColor: ["#ffd24a", "#ff9f1a", "#ffc34d"] }]
    }
  });

  new Chart(document.getElementById("chartBookings"), {
    type: "bar",
    data: {
      labels: Object.keys(bookingFlow),
      datasets: [{ label: "Bookings", data: Object.values(bookingFlow), backgroundColor: "#ffd24a" }]
    }
  });
}

// ===============================
// MASTER LOADER
// ===============================
export function loadDashboard() {
  loadPendingVendors();
  loadPendingBookings();
  loadApprovedBookings();
  loadRefundPanel();
  loadPayoutPanel();
  loadAnalyticsCards();
  loadCharts();
}

loadDashboard();
