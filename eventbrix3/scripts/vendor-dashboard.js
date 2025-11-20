import { auth, db } from "/scripts/firebase.js";
import {
  doc,
  getDoc,
  collection,
  getDocs
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

let vendorId = null;

auth.onAuthStateChanged(async (user) => {
  if (!user) {
    location.href = "vendor-login.html";
    return;
  }

  // Find vendorId
  const q = await db.collection("vendors")
    .where("uid", "==", user.uid)
    .get();

  if (q.empty) {
    alert("Vendor not found!");
    return;
  }

  vendorId = q.docs[0].id;

  loadVendorDashboard();
});

async function loadVendorDashboard() {
  const snap = await getDoc(doc(db, "vendors", vendorId));

  if (!snap.exists()) {
    alert("Vendor data missing!");
    return;
  }

  const v = snap.data();

  // Show vendor data
  document.getElementById("vendorName").innerText = v.businessName || v.name;
  document.getElementById("vendorCity").innerText = v.city || "";
  document.getElementById("vendorID").innerText = vendorId;
  document.getElementById("vendorStatus").innerText = v.status;

  // Load listings (if enabled)
  const listRef = collection(db, "vendors", vendorId, "listings");
  const listSnap = await getDocs(listRef);

  const box = document.getElementById("vendorListings");
  box.innerHTML = "";

  listSnap.forEach((d) => {
    const L = d.data();
    box.innerHTML += `
      <div class="listing-card">
        <h4>${L.title}</h4>
        <p>₹${L.price}</p>
      </div>
    `;
  });
}
