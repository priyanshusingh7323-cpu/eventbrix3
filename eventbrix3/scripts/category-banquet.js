import { db } from "/scripts/firebase.js";
import {
  collection,
  query,
  where,
  getDocs
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

async function loadVendors() {

  const list = document.getElementById("vendorList");
  list.innerHTML = "Loading...";

  const q = query(
    collection(db, "vendors"),
    where("status", "==", "approved"),
    where("mainCategory", "==", "Banquet / Venue")
  );

  const snap = await getDocs(q);
  list.innerHTML = "";

  if (snap.empty) {
    list.innerHTML = "<p style='text-align:center;color:#ccc;'>No vendors found</p>";
    return;
  }

  snap.forEach((docx) => {
    const v = docx.data();

    const img = v.photos?.[0] || "/images/default.jpg";
    const rating = v.rating || "4.7";
    const verified = v.isVerified !== false;

    // ⭐ LOCALITY ONLY
    let locationText = v.locality || "Location";

    list.innerHTML += `
      <div class="vendor-card-adv" onclick="location.href='/vendor/vendor-profile.html?id=${docx.id}'">

        ${verified ? `<div class="vendor-badge">✔ Verified</div>` : ""}

        <div class="vendor-img-box">
          <img src="${img}">
        </div>

        <div class="vendor-details">

          <div class="vendor-name">${v.businessName}</div>

          <div class="vendor-sub">${v.subcategory || "Banquet / Venue"}</div>

          <div class="vendor-row">
            <span>📍 ${locationText}</span>
            <span>⭐ ${rating}</span>
          </div>

          <div class="vendor-price">₹${v.price?.toLocaleString() || "—"}</div>

          <div class="vendor-view-btn">View Details</div>
        </div>

      </div>
    `;
  });
}

loadVendors();
