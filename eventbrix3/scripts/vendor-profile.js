import { db } from "/scripts/firebase.js";
import {
  doc,
  getDoc,
  collection,
  getDocs
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// --------------------------------------
// GET vendorId FROM URL
// Example: vendor-profile.html?id=VEN-1001
// --------------------------------------

const params = new URLSearchParams(window.location.search);
const vendorId = params.get("id");

if (!vendorId) {
  alert("Vendor ID missing!");
  throw new Error("Vendor ID missing");
}


// --------------------------------------
// LOAD VENDOR PROFILE
// --------------------------------------

async function loadVendorProfile() {
  const snap = await getDoc(doc(db, "vendors", vendorId));

  if (!snap.exists()) {
    document.getElementById("vendorName").innerText = "Vendor Not Found!";
    return;
  }

  const v = snap.data();

  document.getElementById("vendorName").innerText = v.businessName || v.name;
  document.getElementById("vendorCategory").innerText = v.category || "—";
  document.getElementById("vendorCity").innerText = v.city || "—";
  document.getElementById("vendorPrice").innerText = v.price ? `₹${v.price}` : "—";
  document.getElementById("vendorAbout").innerText = v.about || "No description added.";

  // Set Chat button
  document.getElementById("chatBtn").href = `/customer/chat.html?vendor=${vendorId}`;

  loadListings();
}


// --------------------------------------
// LOAD VENDOR LISTINGS (If Enabled)
// --------------------------------------

async function loadListings() {
  const listRef = collection(db, "vendors", vendorId, "listings");
  const snap = await getDocs(listRef);

  const box = document.getElementById("vendorListings");
  box.innerHTML = "";

  if (snap.empty) {
    box.innerHTML = "<p>No listings added yet.</p>";
    return;
  }

  snap.forEach((docx) => {
    const L = docx.data();

    box.innerHTML += `
      <div class="listing-card">
        <img src="${L.photo || '/images/default.jpg'}" />
        <h3>${L.title}</h3>
        <p>₹${L.price}</p>
        <p>${L.city}</p>
      </div>
    `;
  });
}

loadVendorProfile();
