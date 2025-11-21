// File: scripts/admin-dashboard.js

import { db } from "./firebase.js";
import {
  collection,
  getDocs,
  updateDoc,
  doc,
  deleteDoc,
  setDoc
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";


// ===============================
// PENDING VENDORS (ALREADY IN YOUR SYSTEM)
// ===============================
const pendingBox = document.getElementById("pendingVendors");

async function loadPendingVendors() {
  const snapshot = await getDocs(collection(db, "vendors"));

  pendingBox.innerHTML = ""; // clear

  snapshot.forEach((v) => {
    const d = v.data();
    if (d.status === "pending") {
      const vendorCard = document.createElement("div");
      vendorCard.classList.add("admin-card");

      vendorCard.innerHTML = `
        <h3>${d.businessName}</h3>
        <p>${d.city}</p>
        <p>Category: ${d.mainCategory || "N/A"}</p>

        <button class="approve-btn">Approve</button>
        <button class="reject-btn">Reject</button>
      `;

      // APPROVE VENDOR
      vendorCard.querySelector(".approve-btn").onclick = async () => {
        await updateDoc(doc(db, "vendors", v.id), { status: "approved" });
        alert("Vendor Approved");
        loadPendingVendors();
      };

      // REJECT VENDOR
      vendorCard.querySelector(".reject-btn").onclick = async () => {
        await updateDoc(doc(db, "vendors", v.id), { status: "rejected" });
        alert("Vendor Rejected");
        loadPendingVendors();
      };

      pendingBox.appendChild(vendorCard);
    }
  });
}

loadPendingVendors();


// ========================================================
// ⭐⭐ ADMIN LEAD APPROVAL SYSTEM ⭐⭐
// ========================================================

// Create container for leads
let leadContainer = document.createElement("div");
leadContainer.id = "pendingLeads";
leadContainer.style.marginTop = "30px";
leadContainer.innerHTML = `<h3>Pending Leads</h3>`;
document.body.appendChild(leadContainer);

// Load ALL Pending Leads
async function loadPendingLeads() {
  leadContainer.innerHTML = `<h3>Pending Leads</h3>`;

  const leadsPendingSnap = await getDocs(collection(db, "leads_pending"));

  // Each vendor folder = vendor ID
  for (let vendorFolder of leadsPendingSnap.docs) {
    const vendorId = vendorFolder.id;

    // Get items inside vendor folder
    const itemsRef = collection(db, "leads_pending", vendorId, "items");
    const itemsSnap = await getDocs(itemsRef);

    itemsSnap.forEach((leadDoc) => {
      const L = leadDoc.data();

      const card = document.createElement("div");
      card.classList.add("admin-card");

      card.innerHTML = `
        <h3>${L.customerName}</h3>
        <p><strong>Phone:</strong> ${L.phone}</p>
        <p><strong>Event Date:</strong> ${L.eventDate}</p>
        <p><strong>City:</strong> ${L.eventCity}</p>
        <p><strong>Venue:</strong> ${L.venueLocation}</p>
        <p><strong>Guests:</strong> ${L.guestCount}</p>
        <p><strong>Message:</strong> ${L.message}</p>
        <p><strong>Vendor ID:</strong> ${vendorId}</p>

        <button class="approve-btn">Approve Lead</button>
        <button class="reject-btn">Reject Lead</button>
      `;

      // APPROVE LEAD
      card.querySelector(".approve-btn").onclick = async () => {
        await setDoc(
          doc(db, "leads_approved", vendorId, "items", leadDoc.id),
          L
        );

        await deleteDoc(doc(db, "leads_pending", vendorId, "items", leadDoc.id));

        alert("Lead Approved!");
        loadPendingLeads();
      };

      // REJECT LEAD
      card.querySelector(".reject-btn").onclick = async () => {
        await setDoc(
          doc(db, "leads_rejected", vendorId, "items", leadDoc.id),
          L
        );

        await deleteDoc(doc(db, "leads_pending", vendorId, "items", leadDoc.id));

        alert("Lead Rejected!");
        loadPendingLeads();
      };

      leadContainer.appendChild(card);
    });
  }
}

loadPendingLeads();
