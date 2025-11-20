// File 13: scripts/category-wedding.js

import { db } from "../firebase.js";
import {
  collection,
  getDocs,
  query,
  where,
  orderBy
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

const vendorList = document.getElementById("vendorList");
const cityFilter = document.getElementById("cityFilter");
const searchBar = document.getElementById("searchBar");
const sortFilter = document.getElementById("sortFilter");

// 🔥 MAIN FUNCTION — LOAD VENDORS WITH FILTERS
async function loadVendors() {
  vendorList.innerHTML = "<p style='color:white;'>Loading...</p>";

  const selectedCity = cityFilter.value.trim().toLowerCase();
  const searchTerm = searchBar.value.trim().toLowerCase();
  const sortOption = sortFilter.value;

  // Firebase conditions
  let conditions = [
    where("mainCategory", "==", "wedding"),
    where("status", "==", "approved")

  ];

  // CITY FILTER
  if (selectedCity) {
    conditions.push(where("city", "==", selectedCity));
  }

  // Build query (without order first)
  const q = query(collection(db, "vendors"), ...conditions);
  const snapshot = await getDocs(q);

  let vendors = [];

  snapshot.forEach(doc => {
    const d = doc.data();
    vendors.push({ id: doc.id, ...d });
  });

  // 🔍 SEARCH FILTER (local filtering)
  if (searchTerm) {
    vendors = vendors.filter(v =>
      v.businessName.toLowerCase().includes(searchTerm) ||
      v.services.join(" ").toLowerCase().includes(searchTerm)
    );
  }

  // 💰 SORT FILTER
  if (sortOption === "low") {
    vendors.sort((a, b) => Number(a.startingPrice) - Number(b.startingPrice));
  }
  if (sortOption === "high") {
    vendors.sort((a, b) => Number(b.startingPrice) - Number(a.startingPrice));
  }

  // RENDER
  renderVendors(vendors);
}

function renderVendors(vendors) {
  vendorList.innerHTML = "";

  if (vendors.length === 0) {
    vendorList.innerHTML = `<p style="color:white; text-align:center;">No vendors found</p>`;
    return;
  }

  vendors.forEach(d => {
    vendorList.innerHTML += `
      <div class='vendor-card'>
        <img src='${d.photos[0]}' alt='Vendor Image' />
        <h3>${d.businessName}</h3>
        <p>${d.city}</p>
        <p>Starting: ₹${d.startingPrice}</p>
        <a href="../vendor/vendor.html?id=${d.id}" class="view-btn">View Details</a>
      </div>
    `;
  });
}

// EVENT LISTENERS
cityFilter.addEventListener("change", loadVendors);
searchBar.addEventListener("input", loadVendors);
sortFilter.addEventListener("change", loadVendors);

// INITIAL LOAD
loadVendors();
