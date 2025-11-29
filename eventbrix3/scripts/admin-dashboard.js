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
// LOAD 4 — Refund Requests (NEW)
// ===============================
export async function loadRefundPanel() {
  const box = document.getElementById("refundBox");
  box.innerHTML = "";

  const snap = await getDocs(collection(db, "bookings"));

  snap.forEach((b) => {
    const d = b.data();

    if (d.refundStatus === "requested") {
      box.innerHTML += `
        <div class="admin-card">
          <h3>${d.vendorName}</h3>
          <p>${d.customerName}</p>
          <p><b>Paid Amount:</b> ₹${d.amount}</p>
          <p><b>Reason:</b> ${d.refundReason || "No reason given"}</p>

          <button onclick="approveRefund('${b.id}')" class="green">
            Approve Refund
          </button>
        </div>
      `;
    }
  });
}

// 🔥 Admin Approves Refund → Calls processRefund()
window.approveRefund = async (id) => {
  await processRefund(id);
  alert("Refund Approved & Processed!");
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
          <p><b>Amount:</b> ₹${d.amount}</p>

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
  alert("Payout Processed!");
  loadDashboard();
};

// ===============================
// LOAD 6 — Analytics Cards
// ===============================
async function loadAnalyticsCards() {
  const bSnap = await getDocs(collection(db, "bookings"));
  const vSnap = await getDocs(collection(db, "vendors"));
  const cSnap = await getDocs(collection(db, "customers"));

  let totalPayments = 0,
    totalRefunds = 0,
    totalPayouts = 0;

  bSnap.forEach((b) => {
    const d = b.data();
    if (d.paymentStatus === "paid") totalPayments += Number(d.amount);
    if (d.status === "refunded") totalRefunds += Number(d.refundAmount || 0);
    totalPayouts += Number(d.vendorPayoutAmount || 0);
  });

  const earnings = totalPayments - (totalRefunds + totalPayouts);

  document.getElementById("anlPayments").innerText = "₹" + totalPayments;
  document.getElementById("anlRefunds").innerText = "₹" + totalRefunds;
  document.getElementById("anlPayouts").innerText = "₹" + totalPayouts;
  document.getElementById("anlEarnings").innerText = "₹" + earnings;
  document.getElementById("anlProfit").innerText = "₹" + earnings;
  document.getElementById("anlVendors").innerText = vSnap.size;
  document.getElementById("anlCustomers").innerText = cSnap.size;
}

// ===============================
// LOAD 7 — CHARTS (Chart.js)
// ===============================
async function loadCharts() {
  const snap = await getDocs(collection(db, "bookings"));

  const payments = {};
  const refundStats = { refunded: 0, not_refunded: 0 };
  const payoutStats = { "50%": 0, "80%": 0, "100%": 0 };

  snap.forEach((b) => {
    const d = b.data();

    const month = new Date(d.eventDate).toLocaleString("default", {
      month: "short",
    });

    if (d.paymentStatus === "paid") {
      payments[month] = (payments[month] || 0) + Number(d.amount);
    }

    if (d.status === "refunded") refundStats.refunded++;
    else refundStats.not_refunded++;

    if (d.payoutStage === 50) payoutStats["50%"]++;
    if (d.payoutStage === 80) payoutStats["80%"]++;
    if (d.payoutStage === 100) payoutStats["100%"]++;
  });

  // CHART 1 — Payments Trend
  new Chart(document.getElementById("chartPayments"), {
    type: "line",
    data: {
      labels: Object.keys(payments),
      datasets: [
        {
          label: "Monthly Payments",
          data: Object.values(payments),
          borderColor: "gold",
          borderWidth: 2,
        },
      ],
    },
    options: { responsive: true },
  });

  // CHART 2 — Refunds
  new Chart(document.getElementById("chartRefunds"), {
    type: "pie",
    data: {
      labels: ["Refunded", "Not Refunded"],
      datasets: [
        {
          data: [refundStats.refunded, refundStats.not_refunded],
          backgroundColor: ["red", "green"],
        },
      ],
    },
    options: { responsive: true },
  });

  // CHART 3 — Payout Stages
  new Chart(document.getElementById("chartPayouts"), {
    type: "bar",
    data: {
      labels: ["50%", "80%", "100%"],
      datasets: [
        {
          label: "Payout Count",
          data: [
            payoutStats["50%"],
            payoutStats["80%"],
            payoutStats["100%"],
          ],
          backgroundColor: ["#ffcc00", "#ffaa00", "#dd8800"],
        },
      ],
    },
    options: { responsive: true },
  });
}

// ===============================
// MAIN LOAD FUNCTION
// ===============================
export async function loadDashboard() {
  loadPendingVendors();
  loadPendingBookings();
  loadApprovedBookings();
  loadRefundPanel();
  loadPayoutPanel();
  loadAnalyticsCards();
  loadCharts();
}

loadDashboard();
