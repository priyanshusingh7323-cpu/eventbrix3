// File 15: scripts/vendor-profile.js

import { db } from "/scripts/firebase.js";
import { doc, getDoc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

const vendorProfile = document.getElementById("vendorProfile");

// Get vendor ID from URL
const urlParams = new URLSearchParams(window.location.search);
const vendorId = urlParams.get("id");

async function loadVendorProfile() {
  const docRef = doc(db, "vendors", vendorId);
  const snap = await getDoc(docRef);

  if (!snap.exists()) {
    vendorProfile.innerHTML = "<h2>Vendor Not Found</h2>";
    return;
  }

  const d = snap.data();

  vendorProfile.innerHTML = `
    <div class='vendor-header'>
      <h2>${d.businessName}</h2>
      <p>${d.city}</p>
    </div>

    <div class='photo-gallery'>
      ${d.photos.map(url => `<img src='${url}' class='vendor-photo' />`).join('')}
    </div>

    <div class='vendor-details'>
      <h3>Services Offered</h3>
      <p>${d.services}</p>

      <h3>Pricing</h3>
      <p>Starting Price: ₹${d.startingPrice}</p>
      ${d.perPlate ? `<p>Per Plate: ₹${d.perPlate}</p>` : ""}
    </div>

    <div class='contact-box'>
      <a href="../customer/chat.html?vendor=${vendorId}" class="chat-btn">Free Chat</a>
      <a href="../customer/reveal-number.html?vendor=${vendorId}" class="reveal-btn">Pay ₹99 to Reveal Number</a>
    </div>
  `;
}

loadVendorProfile();
