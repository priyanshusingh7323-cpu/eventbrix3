import { db, auth } from "/scripts/firebase.js";
import {
  doc,
  getDoc,
  collection,
  getDocs,
  setDoc
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

const params = new URLSearchParams(window.location.search);
const vendorId = params.get("id");

if (!vendorId) {
  alert("Vendor ID missing!");
  throw new Error("Vendor ID missing");
}

async function loadVendorProfile() {
  const snap = await getDoc(doc(db, "vendors", vendorId));

  if (!snap.exists()) {
    document.getElementById("vendorName").innerText = "Vendor Not Found!";
    return;
  }

  const v = snap.data();

  document.getElementById("vendorName").innerText = v.businessName || v.name;
  document.getElementById("vendorCategory").innerText = v.category;
  document.getElementById("vendorCity").innerText = v.city;
  document.getElementById("vendorPrice").innerText = `₹${v.price}`;
  document.getElementById("vendorAbout").innerText = v.about;

  document.getElementById("chatBtn").href = `/customer/chat.html?vendor=${vendorId}`;

  loadListings();
}

async function loadListings() {
  const snap = await getDocs(collection(db, "vendors", vendorId, "listings"));
  const box = document.getElementById("vendorListings");
  box.innerHTML = "";

  snap.forEach((d) => {
    const L = d.data();
    box.innerHTML += `
      <div class="vendor-card">
        <img src="${L.photo || '/images/default.jpg'}">
        <h3>${L.title}</h3>
        <p>₹${L.price}</p>
        <p>${L.city}</p>
      </div>
    `;
  });
}

loadVendorProfile();

/* SAVE WISHLIST */
document.getElementById("saveVendorBtn").addEventListener("click", async () => {
  const user = auth.currentUser;
  if (!user) return alert("Login as customer first!");

  await setDoc(doc(db, "customers", user.uid, "wishlist", vendorId), {
    vendorId,
    savedAt: Date.now()
  });

  alert("Vendor saved ❤️");
});
