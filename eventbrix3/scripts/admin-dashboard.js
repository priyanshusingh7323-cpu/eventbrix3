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
// 1 — Pending Vendors
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

          <textarea id="remark-${v.id}" placeholder="Add remark (optional)" 
            style="width:100%;padding:6px;border-radius:8px;margin-top:6px;background:#333;color:white;"></textarea>

          <button class="green" onclick="approveVendor('${v.id}')">Approve</button>
          <button class="danger" onclick="rejectVendor('${v.id}')">Reject</button>
        </div>
      `;
    }
  });
}

window.approveVendor = async (id) => {
  const remark = document.getElementById(`remark-${id}`).value || "";
  await updateDoc(doc(db, "vendors", id), {
    status: "approved",
    adminRemark: remark,
  });
  loadDashboard();
};

window.rejectVendor = async (id) => {
  const remark = document.getElementById(`remark-${id}`).value || "";
  await updateDoc(doc(db, "vendors", id), {
    status: "rejected",
    adminRemark: remark,
  });
  loadDashboard();
};

// ===============================
// 2 — Pending Bookings
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
// 3 — Approved Bookings
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
};

// ===============================
// 4 — Refund Requests
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

window.approveRefund = async (id) => {
  await processRefund(id);
  alert("Refund Approved & Processed!");
  loadDashboard();
};

// ===============================
// 5 — Payout Panel
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
// 6 — KYC PANEL (NEW)
// ===============================
export async function loadKYCPending() {
  const box = document.getElementById("kycBox");
  box.innerHTML = "";

  const snap = await getDocs(collection(db, "vendors"));

  snap.forEach((v) => {
    const d = v.data();

    if (d.kycStatus === "submitted") {
      box.innerHTML += `
        <div class="admin-card">
          <h3>${d.businessName}</h3>
          <p>${d.city}</p>

          <p><b>Aadhaar:</b> ${d.aadhaar}</p>
          <p><b>PAN:</b> ${d.pan}</p>

          <img src="${d.aadhaarImg}" style="width:120px;border-radius:10px;">
          <img src="${d.panImg}" style="width:120px;border-radius:10px;">

          <textarea id="kyc-remark-${v.id}" placeholder="Remark (optional)"
            style="width:100%;padding:6px;border-radius:8px;margin-top:6px;background:#333;color:white;"></textarea>

          <button class="green" onclick="approveKYC('${v.id}')">Approve KYC</button>
          <button class="danger" onclick="rejectKYC('${v.id}')">Reject KYC</button>
        </div>
      `;
    }
  });
}

window.approveKYC = async (id) => {
  const remark = document.getElementById(`kyc-remark-${id}`).value || "";
  await updateDoc(doc(db, "vendors", id), {
    kycStatus: "verified",
    status: "verified",
    kycRemark: remark,
  });
  loadDashboard();
};

window.rejectKYC = async (id) => {
  const remark = document.getElementById(`kyc-remark-${id}`).value || "";
  await updateDoc(doc(db, "vendors", id), {
    kycStatus: "rejected",
    kycRemark: remark,
  });
  loadDashboard();
};

// ===============================
// 7 — Analytics & Charts
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
// MAIN LOAD FUNCTION
// ===============================
export async function loadDashboard() {
  loadPendingVendors();
  loadPendingBookings();
  loadApprovedBookings();
  loadRefundPanel();
  loadPayoutPanel();
  loadKYCPending();
  loadAnalyticsCards();
}

loadDashboard();
