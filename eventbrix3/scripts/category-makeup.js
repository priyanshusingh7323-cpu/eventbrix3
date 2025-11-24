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
    where("mainCategory", "==", "Makeup Artists")
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
    const rating = v.rating || "4.9";

    // ⭐ LOCALITY ONLY
    let locationText = v.locality || "Location";

    list.innerHTML += `
      <div class="vendor-card" onclick="location.href='/vendor/vendor-profile.html?id=${docx.id}'">

        <div class="v-img">
          <img src="${img}">
        </div>

        <div class="v-info">
          <h3>${v.businessName}</h3>

          <p class="v-city">📍 ${locationText}</p>

          <div class="v-bottom">
            <span class="v-price">₹${v.price}</span>
            <span class="v-rating">⭐ ${rating}</span>
          </div>
        </div>

      </div>
    `;
  });
}

loadVendors();
