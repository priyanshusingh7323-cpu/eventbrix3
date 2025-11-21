// ===============================
// SECURED ADMIN DASHBOARD
// ===============================

import { auth, db } from "./firebase.js";
import {
  collection,
  getDocs,
  updateDoc,
  doc
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";


// SECURITY CHECK
auth.onAuthStateChanged((user) => {
  if (!user) {
    window.location.href = "/admin/admin-login.html";
  } else if (user.email !== "admin@eventbrix.com") {
    auth.signOut();
    alert("Unauthorized access!");
    window.location.href = "/admin/admin-login.html";
  }
});


// ===============================
// LOAD PENDING VENDORS
// ===============================

const pendingBox = document.getElementById("pendingVendors");

async function loadPendingVendors() {
  const snapshot = await getDocs(collection(db, "vendors"));
  pendingBox.innerHTML = "";

  snapshot.forEach((v) => {
    const d = v.data();

    if (d.status === "pending") {
      const card = document.createElement("div");
      card.classList.add("admin-card");

      card.innerHTML = `
        <h3>${d.businessName}</h3>
        <p>${d.city}</p>
        <p>Category: ${d.mainCategory || "N/A"}</p>

        <button class="approve-btn">Approve</button>
        <button class="reject-btn">Reject</button>
      `;

      // APPROVE VENDOR
      card.querySelector(".approve-btn").onclick = async () => {
        await updateDoc(doc(db, "vendors", v.id), { status: "approved" });
        alert("Vendor Approved");
        loadDashboard();
      };

      // REJECT VENDOR
      card.querySelector(".reject-btn").onclick = async () => {
        await updateDoc(doc(db, "vendors", v.id), { status: "rejected" });
        alert("Vendor Rejected");
        loadDashboard();
      };

      pendingBox.appendChild(card);
    }
  });
}



// ===============================
// LOAD PENDING BOOKINGS (adminRequests)
// ===============================

const bookingBox = document.createElement("div");
bookingBox.innerHTML = `<h3 style="margin-top:30px;">Pending Bookings</h3>`;
document.body.appendChild(bookingBox);

async function loadPendingBookings() {
  bookingBox.innerHTML = `<h3 style="margin-top:30px;">Pending Bookings</h3>`;

  const snap = await getDocs(collection(db, "adminRequests"));

  snap.forEach((req) => {
    const L = req.data();
    if (L.status !== "pending") return;

    const card = document.createElement("div");
    card.classList.add("admin-card");

    card.innerHTML = `
      <h3>${L.vendorName}</h3>

      <p><strong>Customer:</strong> ${L.customerName}</p>
      <p><strong>Phone:</strong> ${L.phone}</p>
      <p><strong>Event:</strong> ${L.eventCity} — ${L.eventDate}</p>
      <p><strong>Venue:</strong> ${L.venueLocation}</p>
      <p><strong>Guests:</strong> ${L.guestCount}</p>
      <p><strong>Message:</strong> ${L.message}</p>

      <button class="approve-btn">Approve Booking</button>
      <button class="reject-btn">Reject Booking</button>
    `;

    // APPROVE BOOKING
    card.querySelector(".approve-btn").onclick = async () => {
      await updateDoc(doc(db, "adminRequests", req.id), {
        status: "approved"
      });

      alert("Booking Approved");
      loadDashboard();
    };

    // REJECT BOOKING
    card.querySelector(".reject-btn").onclick = async () => {
      await updateDoc(doc(db, "adminRequests", req.id), {
        status: "rejected"
      });

      alert("Booking Rejected");
      loadDashboard();
    };

    bookingBox.appendChild(card);
  });
}



// ===============================
// LOAD EVERYTHING
// ===============================

function loadDashboard() {
  loadPendingVendors();
  loadPendingBookings();
}

loadDashboard();
