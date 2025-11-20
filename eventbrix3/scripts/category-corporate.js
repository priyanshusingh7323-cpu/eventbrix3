// File 35: scripts/category-corporate.js

import { db } from "../firebase.js";
import {
  collection,
  getDocs,
  query,
  where
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

const vendorList = document.getElementById("vendorList");
const cityFilter = document.getElementById("cityFilter");
const searchBar = document.getElementById("searchBar");
const sortFilter = document.getElementById("sortFilter");

// MAIN FUNCTION
async function loadVendors() {
  vendorList.innerHTML = "<p style='color:white;'>Loading...</p>";

  const selectedCity = cityFilter.value.trim().toLowerCase();
  const searchTerm = searchBar.value.trim().toLowerCase();
  const sortOption = sortFilter.value;

  // FIREBASE QUERY CONDITIONS
  let conditions = [
    where("mainCategory", "==", "corporate"),
    where("approved", "==", true)
  ];

  if (selectedCity) {
    conditions.push(where("city", "==", selectedCity));
  }

  const q = query(collection(db, "vendors"), ...conditions);
  const snap = await getDocs(q);

  let vendors = [];

  snap.forEach(doc => {
    vendors.push({ id: doc.id, ...doc.data() });
  });

  // 🔍 SEARCH FILTER (local)
  if (searchTerm) {
    vendors = vendors.filter(v =>
      v.businessName.toLowerCase().includes(searchTerm) ||
      v.services.join(" ").toLowerCase().includes(searchTerm)
    );
  }

  // 💰 PRICE SORTING
  if (sortOption === "low") {
    vendors.sort((a, b) => Number(a.startingPrice) - Number(b.startingPrice));
  }
  if (sortOption === "high") {
    vendors.sort((a, b) => Number(b.startingPrice) - Number(a.startingPrice));
  }

  renderVendors(vendors);
}

// RENDER VENDORS
function renderVendors(vendors) {
  vendorList.innerHTML = "";

  if (vendors.length === 0) {
    vendorList.innerHTML = `<p style="color:white; text-align:center;">No vendors found</p>`;
    return;
  }

  vendors.forEach(v => {
    vendorList.innerHTML += `
      <div class='vendor-card'>
        <img src='${v.photos[0]}' alt='Vendor Image' />
        <h3>${v.businessName}</h3>
        <p>${v.city}</p>
        <p>Starting: ₹${v.startingPrice}</p>
        <a href="vendor.html?id=${v.id}" class="view-btn">View Details</a>
      </div>
    `;
  });
}

// EVENTS
cityFilter.addEventListener("change", loadVendors);
searchBar.addEventListener("input", loadVendors);
sortFilter.addEventListener("change", loadVendors);

// INITIAL LOAD
loadVendors();
