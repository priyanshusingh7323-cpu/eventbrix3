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
  const data = vendorDoc.data();

  document.getElementById("vendorName").innerText = data.businessName || data.name;
  document.getElementById("vendorCity").innerText = data.city || "Not Set";
  document.getElementById("vendorID").innerText = data.vendorId;
  document.getElementById("vendorStatus").innerText = data.status;

  loadListings(data.vendorId);
});

async function loadListings(vendorId) {
  const listRef = collection(db, "vendors", vendorId, "listings");
  const snap = await getDocs(listRef);

  const box = document.getElementById("vendorListings");
  box.innerHTML = "";

  snap.forEach(doc => {
    const L = doc.data();
    box.innerHTML += `
      <div class="listing-card">
        <h4>${L.title}</h4>
        <p>₹${L.price}</p>
      </div>
    `;
  });
}
