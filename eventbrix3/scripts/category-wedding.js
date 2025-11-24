import { db } from "/scripts/firebase.js";
import {
  collection,
  query,
  where,
  getDocs
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

/* -----------------------
   FIND DISTANCE FORMULA
------------------------- */
function haversine(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * Math.PI / 180) *
    Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) ** 2;

  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

/* -----------------------
   LOAD VENDORS
------------------------- */
let userLat = null;
let userLng = null;

document.getElementById("detectLocationBtn").onclick = () => {
  navigator.geolocation.getCurrentPosition((pos) => {
    userLat = pos.coords.latitude;
    userLng = pos.coords.longitude;
    alert("Location detected!");
    loadVendors();
  });
};

async function loadVendors() {
  const list = document.getElementById("vendorList");
  list.innerHTML = "Loading...";

  const q = query(
    collection(db, "vendors"),
    where("status", "==", "approved"),
    where("mainCategory", "==", "Wedding Services")
  );

  const snap = await getDocs(q);
  list.innerHTML = "";

  if (snap.empty) {
    list.innerHTML = "<p style='text-align:center;color:#ccc;'>No vendors found</p>";
    return;
  }

  snap.forEach((docx) => {
    const v = docx.data();

    const img      = v.photos?.[0] || "/images/default.jpg";
    const rating   = v.rating || "4.8";
    const verified = v.isVerified !== false;

    /* ⭐ NEW: LOCALITY TEXT BUILD */
    let locationText = "";
    if (v.locality) {
      // Example: Chattarpur, Delhi
      const cityName = v.city?.split(" ")[0] || "Delhi";  
      locationText = `${v.locality}, ${cityName}`;
    } else {
      // fallback
      locationText = v.city || "Location not available";
    }

    let distance = "";
    if (userLat && userLng && v.latitude && v.longitude) {
      const d = haversine(userLat, userLng, v.latitude, v.longitude);
      distance = `${d.toFixed(1)} km away`;
    }

    list.innerHTML += `
      <div class="vendor-card-adv" onclick="location.href='/vendor/vendor-profile.html?id=${docx.id}'">

        ${verified ? `<div class="vendor-badge">✔ Verified</div>` : ""}

        <div class="vendor-img-box">
          <img src="${img}">
        </div>

        <div class="vendor-details">

          <div class="vendor-name">${v.businessName}</div>

          <div class="vendor-sub">${v.subcategory}</div>

          <div class="vendor-row">
            <span>📍 ${locationText}</span>   <!-- ⭐ UPDATED -->
            <span>⭐ ${rating}</span>
          </div>

          ${distance ? `<div class="vendor-distance">📌 ${distance}</div>` : ""}

          <div class="vendor-price">₹${v.price?.toLocaleString() || "--"}</div>

          <div class="vendor-view-btn">View Details</div>
        </div>
      </div>
    `;
  });
}

loadVendors();
