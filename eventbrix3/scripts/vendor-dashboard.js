import { auth, db } from "/scripts/firebase.js";
import {
  collection,
  query,
  where,
  getDocs,
  doc
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// When user is logged in
auth.onAuthStateChanged(async (user) => {
  if (!user) {
    location.href = "vendor-login.html";
    return;
  }

  // Find vendor by UID
  const q = query(collection(db, "vendors"), where("uid", "==", user.uid));
  const snap = await getDocs(q);

  if (snap.empty) {
    alert("Vendor profile not found!");
    return;
  }

  const vendorDoc = snap.docs[0];
  const vendorData = vendorDoc.data();

  // SHOW vendor data box
  document.getElementById("vendorData").style.display = "block";

  // Fill details
  document.getElementById("vendorName").innerText =
    vendorData.businessName || vendorData.name || "No Name";

  document.getElementById("vendorCity").innerText =
    vendorData.city || "Not Set";

  document.getElementById("vendorID").innerText =
    vendorData.vendorId || vendorDoc.id;

  document.getElementById("vendorStatus").innerText =
    vendorData.status || "pending";

  // Listings
  loadListings(vendorDoc.id);
});

// LOAD listings from vendors/{vendorId}/listings
async function loadListings(docId) {
  const listRef = collection(db, "vendors", docId, "listings");
  const snap = await getDocs(listRef);

  const box = document.getElementById("vendorListings");
  box.innerHTML = "";

  if (snap.empty) {
    box.innerHTML = "<p>No listings added.</p>";
    return;
  }

  snap.forEach((d) => {
    const L = d.data();
    box.innerHTML += `
      <div class="listing-card">
        <h4>${L.title}</h4>
        <p>₹${L.price}</p>
      </div>
    `;
  });
}
