import { db, auth } from "/scripts/firebase.js";
import {
  doc,
  getDoc,
  collection,
  getDocs,
  setDoc,
  addDoc
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// Get vendor ID from URL
const params = new URLSearchParams(window.location.search);
const vendorId = params.get("id");

if (!vendorId) {
  alert("Vendor ID missing!");
  throw new Error("Vendor ID missing");
}

// LOAD VENDOR DETAILS (FROM FIRST LISTING)
async function loadVendorProfile() {
  const listingsRef = collection(db, "vendors", vendorId, "listings");
  const snap = await getDocs(listingsRef);

  if (snap.empty) {
    document.getElementById("vendorName").innerText = "No Listings Found!";
    return;
  }

  // Pick FIRST listing as primary
  const L = snap.docs[0].data();

  // HEADER IMAGE
  if (L.photos && L.photos.length > 0) {
    document.getElementById("headerImg").src = L.photos[0];
  }

  // MAIN DETAILS
  document.getElementById("vendorName").innerText = L.businessName;
  document.getElementById("vendorCategory").innerText = `${L.category} → ${L.subcategory}`;
  document.getElementById("vendorCity").innerText = L.city;
  document.getElementById("vendorPrice").innerText = `₹${L.price}`;
  document.getElementById("vendorAbout").innerText = L.about;

  // CHAT BUTTON
  document.getElementById("chatBtn").href = `/customer/chat.html?vendor=${vendorId}`;

  loadAllListings();
}

// SHOW ALL LISTINGS ON PROFILE PAGE
async function loadAllListings() {
  const listRef = collection(db, "vendors", vendorId, "listings");
  const snap = await getDocs(listRef);

  const box = document.getElementById("vendorListings");
  box.innerHTML = "";

  snap.forEach((docx) => {
    const L = docx.data();
    const img = (L.photos && L.photos.length > 0) ? L.photos[0] : "/images/default.jpg";

    box.innerHTML += `
      <div class="vendor-card">
        <img src="${img}">
        <h3>${L.category} – ${L.subcategory}</h3>
        <p>₹${L.price}</p>
        <p>${L.city}</p>
      </div>
    `;
  });
}

loadVendorProfile();


// -------------------------------
// SAVE TO WISHLIST
// -------------------------------
document.getElementById("saveVendorBtn").addEventListener("click", async () => {
  const user = auth.currentUser;
  if (!user) return alert("Login as customer first!");

  await setDoc(doc(db, "customers", user.uid, "wishlist", vendorId), {
    vendorId,
    savedAt: Date.now()
  });

  alert("Vendor saved ❤️");
});

// -------------------------------
// BOOK NOW POPUP HANDLING
// -------------------------------
const popup = document.getElementById("bookingPopup");
const overlay = document.getElementById("popupOverlay");
const thankBox = document.getElementById("thankYouBox");

// Open popup
document.getElementById("bookNowBtn").onclick = () => {
  popup.classList.add("show");
  overlay.style.display = "block";
};

// Close popup
document.getElementById("closePopupBtn").onclick = () => {
  popup.classList.remove("show");
  overlay.style.display = "none";
};


// -------------------------------
// SUBMIT BOOKING → Firebase
// -------------------------------
document.getElementById("submitBookingBtn").onclick = async () => {

  const lead = {
    vendorId,
    customerName: document.getElementById("cName").value,
    phone: document.getElementById("cPhone").value,
    eventDate: document.getElementById("cDate").value,
    eventCity: document.getElementById("cCity").value,
    venueLocation: document.getElementById("cVenue").value,
    guestCount: document.getElementById("cGuests").value,
    message: document.getElementById("cMsg").value,
    createdAt: Date.now(),
    status: "pending"
  };

  if (!lead.customerName || !lead.phone) {
    return alert("Name & phone are required!");
  }

  // SAVE TO leads_pending/vendorId/items
  await addDoc(collection(db, "leads_pending", vendorId, "items"), lead);

  // CLOSE POPUP + SHOW THANK YOU
  popup.classList.remove("show");
  overlay.style.display = "none";

  thankBox.style.display = "block";
  setTimeout(() => {
    thankBox.style.display = "none";
  }, 2000);
};
