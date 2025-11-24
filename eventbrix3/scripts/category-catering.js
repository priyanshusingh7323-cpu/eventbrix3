import { db } from "/scripts/firebase.js";
import {
  collection,
  query,
  where,
  getDocs
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

let allVendors = [];

async function loadVendors() {
  const list = document.getElementById("vendorList");
  list.innerHTML = "Loading...";

  const q = query(
    collection(db, "vendors"),
    where("status", "==", "approved"),
    where("mainCategory", "==", "Catering")
  );

  const snap = await getDocs(q);

  allVendors = [];
  snap.forEach((docx) => {
    allVendors.push({
      id: docx.id,
      ...docx.data()
    });
  });

  renderVendors(allVendors);
}

function renderVendors(data) {
  const list = document.getElementById("vendorList");
  list.innerHTML = "";

  if (!data.length) {
    list.innerHTML = "<p style='text-align:center;color:#ccc;'>No vendors found.</p>";
    return;
  }

  data.forEach((v) => {

    const img = v.photos?.[0] || "/images/default.jpg";

    // ⭐ NEW: locality merge
    let locationText = v.locality
      ? `${v.locality}, ${v.city}`
      : v.city;

    list.innerHTML += `
      <div class="vendor-card" onclick="location.href='/vendor/vendor-profile.html?id=${v.id}'">
        <div class="v-img">
          <img src="${img}">
        </div>

        <div class="v-info">
          <h3>${v.businessName}</h3>

          <p class="v-city">📍 ${locationText}</p>

          <div class="v-bottom">
            <span class="v-price">₹${v.price}</span>
            <span class="v-rating">⭐ 4.8</span>
          </div>
        </div>
      </div>
    `;
  });
}

document.getElementById("searchBar").addEventListener("input", (e) => {
  const text = e.target.value.toLowerCase();
  const filtered = allVendors.filter((v) =>
    v.businessName.toLowerCase().includes(text)
  );
  renderVendors(filtered);
});

document.getElementById("cityFilter").addEventListener("change", (e) => {
  const city = e.target.value;
  if (!city) return renderVendors(allVendors);
  const filtered = allVendors.filter(
    (v) => v.city.toLowerCase() === city.toLowerCase()
  );
  renderVendors(filtered);
});

document.getElementById("sortFilter").addEventListener("change", (e) => {
  const type = e.target.value;
  let sorted = [...allVendors];

  if (type === "low") sorted.sort((a, b) => a.price - b.price);
  else if (type === "high") sorted.sort((a, b) => b.price - a.price);

  renderVendors(sorted);
});

loadVendors();
