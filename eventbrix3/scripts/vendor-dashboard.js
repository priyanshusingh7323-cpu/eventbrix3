import { auth, db } from "/scripts/firebase.js";
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  getDoc
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// LOGIN CHECK
auth.onAuthStateChanged(async (user) => {
  if (!user) return location.href = "vendor-login.html";

  const q = query(collection(db, "vendors"), where("uid", "==", user.uid));
  const snap = await getDocs(q);

  if (snap.empty) return alert("Vendor profile not found!");

  const vendorDoc = snap.docs[0];
  const vendorId = vendorDoc.id;
  const data = vendorDoc.data();

  // Render main info
  document.getElementById("vendorName").innerText = data.businessName || "Vendor";
  document.getElementById("vendorCity").innerText = data.city || "Not Set";
  document.getElementById("vendorID").innerText = vendorId;
  document.getElementById("vendorStatus").innerText = data.status || "pending";

  loadListings(vendorId);
  loadApprovedLeads(vendorId);

  // Logout
  document.getElementById("logoutBtn").onclick = () => {
    auth.signOut();
    location.href = "vendor-login.html";
  };

  // New Listing Button
  document.getElementById("newListingBtn").onclick = () => {
    window.location.href = "vendor-register.html?mode=new";
  };
});

// LOAD LISTINGS
async function loadListings(vendorId) {
  const listRef = collection(db, "vendors", vendorId, "listings");
  const snap = await getDocs(listRef);

  const box = document.getElementById("vendorListings");
  box.innerHTML = "";

  snap.forEach((docx) => {
    const L = docx.data();

    const img = (L.photos && L.photos.length > 0) ? L.photos[0] : "/noimg.png";

    box.innerHTML += `
      <div class="listing-card" style="
        background:#1a1a1a;
        padding:15px;
        border-radius:12px;
        margin-bottom:15px;
        border:1px solid #333;
      ">
        
        <img src="${img}" style="width:100%; height:160px; object-fit:cover; border-radius:10px; margin-bottom:10px;">

        <h3>${L.category} – ${L.subcategory}</h3>

        <p><strong>Price:</strong> ₹${L.price}</p>
        <p><strong>City:</strong> ${L.city}</p>
        <p><strong>Status:</strong> ${L.status}</p>

        <button class="btn-secondary" style="margin-top:10px;">View More</button>
      </div>
    `;
  });
}

// LOAD APPROVED LEADS
async function loadApprovedLeads(vendorId) {
  const leadsRef = collection(db, "leads_approved", vendorId, "items");
  const snap = await getDocs(leadsRef);

  const box = document.getElementById("vendorLeads");
  box.innerHTML = snap.empty ? "No approved leads yet." : "";

  snap.forEach((d) => {
    const L = d.data();

    box.innerHTML += `
      <div class="lead-card" style="
        background:#121212;
        padding:15px;
        border-radius:12px;
        margin-bottom:12px;
        border:1px solid #444;
      ">
        <h3>${L.customerName}</h3>
        <p><strong>Phone:</strong> ${L.phone}</p>
        <p><strong>Event Date:</strong> ${L.eventDate}</p>
        <p><strong>City:</strong> ${L.eventCity}</p>
        <p><strong>Venue:</strong> ${L.venueLocation}</p>
        <p><strong>Guests:</strong> ${L.guestCount}</p>
        <p><strong>Message:</strong> ${L.message}</p>
      </div>
    `;
  });
}
