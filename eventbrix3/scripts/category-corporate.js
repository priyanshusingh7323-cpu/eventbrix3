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
    where("mainCategory", "==", "Corporate Events")
  );

  const snap = await getDocs(q);
  list.innerHTML = "";

  if (snap.empty) {
    list.innerHTML = `<p style="text-align:center;color:#ccc;">No vendors found.</p>`;
    return;
  }

  snap.forEach((docx) => {
    const v = docx.data();

    const photo = v.photos?.[0] || "/images/default.jpg";
    const price = v.price ? `₹${v.price}` : "Price Not Set";

    // ⭐ NEW: locality added
    let locationText = v.locality
      ? `${v.locality}, ${v.city}`
      : v.city;

    list.innerHTML += `
      <div class="vendor-card" onclick="location.href='/vendor/vendor-profile.html?id=${docx.id}'">

        <div class="v-img-box">
          <img src="${photo}">
          <span class="v-badge">Corporate</span>
        </div>

        <div class="v-info">
          <h3>${v.businessName || "Vendor Name"}</h3>

          <p class="v-city">
            📍 ${locationText}
          </p>

          <p class="v-price">
            <i class="fa-solid fa-indian-rupee-sign"></i> ${price}
          </p>

          <button class="v-btn">View Profile</button>
        </div>
      </div>
    `;
  });
}

loadVendors();
