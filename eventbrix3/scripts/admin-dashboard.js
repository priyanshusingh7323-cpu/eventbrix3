// SECURED ADMIN DASHBOARD

import { auth, db } from "./firebase.js";
import {
  collection,
  getDocs,
  updateDoc,
  doc,
  deleteDoc,
  setDoc
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";


// ===============================
// 🔥 SECURITY: Allow ONLY the real admin
// ===============================
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
// PENDING VENDORS
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

      vendorCard.querySelector(".approve-btn").onclick = async () => {
        await updateDoc(doc(db, "vendors", v.id), { status: "approved" });
        alert("Vendor Approved");
        loadPendingVendors();
      };

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


// ===============================
// LEAD APPROVAL SYSTEM (Already Added Earlier)
// ===============================

let leadContainer = document.createElement("div");
leadContainer.id = "pendingLeads";
leadContainer.style.marginTop = "30px";
leadContainer.innerHTML = `<h3>Pending Leads</h3>`;
document.body.appendChild(leadContainer);

async function loadPendingLeads() {
  leadContainer.innerHTML = `<h3>Pending Leads</h3>`;

  const leadsPendingSnap = await getDocs(collection(db, "leads_pending"));

  for (let vendorFolder of leadsPendingSnap.docs) {
    const vendorId = vendorFolder.id;
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

      card.querySelector(".approve-btn").onclick = async () => {
        await setDoc(
          doc(db, "leads_approved", vendorId, "items", leadDoc.id),
          L
        );
        await deleteDoc(doc(db, "leads_pending", vendorId, "items", leadDoc.id));
        alert("Lead Approved!");
        loadPendingLeads();
      };

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
