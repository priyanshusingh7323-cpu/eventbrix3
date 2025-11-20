import { auth, db } from "/scripts/firebase.js";
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  getDoc
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

auth.onAuthStateChanged(async (user) => {
  if (!user) return location.href = "vendor-login.html";

  const q = query(
    collection(db, "vendors"),
    where("uid", "==", user.uid)
  );

  const snap = await getDocs(q);
  if (snap.empty) return alert("Vendor profile missing!");

  const vendorDoc = snap.docs[0];
  const data = vendorDoc.data();
  const vendorId = vendorDoc.id;

  document.getElementById("vendorName").innerText = data.businessName || data.name;
  document.getElementById("vendorCity").innerText = data.city || "Not Set";
  document.getElementById("vendorID").innerText = vendorId;
  document.getElementById("vendorStatus").innerText = data.status;

  loadListings(vendorId);

  document.getElementById("logoutBtn").onclick = () => {
    auth.signOut();
    location.href = "vendor-login.html";
  };
});

async function loadListings(vendorId) {
  const listRef = collection(db, "vendors", vendorId, "listings");
  const snap = await getDocs(listRef);

  const box = document.getElementById("vendorListings");
  box.innerHTML = "";

  snap.forEach((docx) => {
    const L = docx.data();

    box.innerHTML += `
      <div class="listing-card">
        <h3>${L.title}</h3>
        <p>₹${L.price}</p>
        <p>${L.city}</p>
      </div>
    `;
  });
}
