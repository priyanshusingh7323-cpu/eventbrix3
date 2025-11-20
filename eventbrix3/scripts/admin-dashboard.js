// File 29: scripts/admin-dashboard.js

import { db } from "./firebase.js";
import { collection, getDocs, updateDoc, doc } 
from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

const pendingBox = document.getElementById("pendingVendors");

async function loadPendingVendors() {
  const snapshot = await getDocs(collection(db, "vendors"));

  pendingBox.innerHTML = ""; // clear

  snapshot.forEach(v => {
    const d = v.data();
    if (d.status === "pending") {
      const vendorCard = document.createElement("div");
      vendorCard.classList.add("admin-card");

      vendorCard.innerHTML = `
        <h3>${d.businessName}</h3>
        <p>${d.city}</p>
        <p>Category: ${d.mainCategory}</p>
        <button class="approve-btn">Approve</button>
        <button class="reject-btn">Reject</button>
      `;

      vendorCard.querySelector(".approve-btn").addEventListener("click", async () => {
        await updateDoc(doc(db, "vendors", v.id), { status: "approved" });
        alert("Vendor Approved");
        loadPendingVendors();
      });

      vendorCard.querySelector(".reject-btn").addEventListener("click", async () => {
        await updateDoc(doc(db, "vendors", v.id), { status: "rejected" });
        alert("Vendor Rejected");
        loadPendingVendors();
      });

      pendingBox.appendChild(vendorCard);
    }
  });
}

loadPendingVendors();
