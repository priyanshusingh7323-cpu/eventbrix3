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

  // 🔥 Load only approved Makeup Artists
  const q = query(
    collection(db, "vendors"),
    where("status", "==", "approved"),
    where("mainCategory", "==", "Makeup Artists")
  );

  const snap = await getDocs(q);
  list.innerHTML = "";

  snap.forEach((docx) => {
    const v = docx.data();

    list.innerHTML += `
      <div class="vendor-card" onclick="location.href='/vendor/vendor-profile.html?id=${docx.id}'">

        <div class="vendor-card-img">
          <img src="${v.photos?.[0] || '/images/default.jpg'}">
          <span class="vendor-badge">💄 Makeup Pro</span>
        </div>

        <div class="vendor-card-content">
          <h3>${v.businessName}</h3>

          <p class="vendor-city">📍 ${v.city}</p>

          <p class="vendor-price">
            Starting at <strong>₹${v.price}</strong>
          </p>

          <button class="vendor-view-btn">View Details</button>
        </div>

      </div>
    `;
  });
}

loadVendors();
