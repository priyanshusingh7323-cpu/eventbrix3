// File 39: scripts/category-catering.js

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

// MAIN LOADER FUNCTION
async function loadVendors() {
  vendorList.innerHTML = "<p style='color:white;'>Loading...</p>";

  const selectedCity = cityFilter.value.trim().toLowerCase();
  const searchTerm = searchBar.value.trim().toLowerCase();
  const sortOption = sortFilter.value;

  // FIREBASE WHERE CONDITIONS
  let conditions = [
    where("mainCategory", "==", "catering"),
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

  // 🔍 LOCAL SEARCH FILTER
  if (searchTerm) {
    vendors = vendors.filter(v =>
      v.businessName.toLowerCase().includes(searchTerm) ||
      v.services.join(" ").toLowerCase().includes(searchTerm)
    );
  }

  // 💰 PRICE SORT
  if (sortOption === "low") {
    vendors.sort((a, b) => Number(a.startingPrice) - Number(b.startingPrice));
  }
  if (sortO
