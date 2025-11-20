import { auth, db } from "/scripts/firebase.js";
import {
  collection,
  query,
  where,
  getDocs
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

auth.onAuthStateChanged(async (user) => {
  if (!user) {
    location.href = "vendor-login.html";
    return;
  }

  // Find vendor profile by UID
  const q = query(
    collection(db, "vendors"),
    where("uid", "==", user.uid)
  );

  const snap = await getDocs(q);

  if (snap.empty) {
    alert("Vendor profile missing!");
    return;
  }

  const vendorDoc = snap.docs[0];
  const vendorData = vendorDoc.data();

  // Correct vendorId
  const vendorId = vendorData.vendorId;

  // Dashboard UI updates
  document.getElementById("vendorName").innerText =
    vendorData.businessName || vendorData.name;

  document.getElementById("vendorCity").innerText =
    vendorData.city || "Not set";

  document.getElementById("vendorID").innerText = vendorId;

  document.getElementById("vendorStatus").innerText =
    vendorData.status || "pending";

  // Load listings
  loadListings(vendorId);
});

async function loadListings(vendorId) {
  const listingsRef = collection(db, "vendors", vendorId, "listings");
  const listingsSnap = await getDocs(listingsRef);

  const box = document.getElementById("vendorListings");
  box.innerHTML = "";

  listingsSnap.forEach((item) => {
    const L = item.data();
    box.innerHTML += `
      <div class="listing-card">
        <h4>${L.title || "Untitled"}</h4>
        <p>₹${L.price || 0}</p>
      </div>
    `;
  });
}
