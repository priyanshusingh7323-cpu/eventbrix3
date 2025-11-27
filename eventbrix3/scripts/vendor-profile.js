/* ======================================
   IMPORTS
====================================== */
import { db, auth } from "/scripts/firebase.js";
import {
  doc,
  getDoc,
  collection,
  getDocs,
  setDoc,
  updateDoc,
  query,
  where,
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

/* ======================================
   BACKEND BASE URL
====================================== */
const BASE_URL = "https://eventbrix3.onrender.com";

/* ======================================
   GET VENDOR ID
====================================== */
const params = new URLSearchParams(window.location.search);
const vendorId = params.get("id");

/* ======================================
   LOAD VENDOR PROFILE
====================================== */
async function loadVendorProfile() {
  const vendorDoc = await getDoc(doc(db, "vendors", vendorId));
  if (!vendorDoc.exists()) return;

  const vendorData = vendorDoc.data();

  const listings = await getDocs(
    collection(db, "vendors", vendorId, "listings")
  );

  if (listings.empty) {
    document.getElementById("vendorName").innerText = "Vendor Not Found";
    return;
  }

  const L = listings.docs[0].data();

  loadSlider(L.photos || []);

  document.getElementById("vendorName").innerText = L.businessName || "Vendor";
  document.getElementById("drawerVendorName").innerText =
    L.businessName || "Vendor";

  document.getElementById("vendorCategory").innerText = `${L.category || ""} → ${
    L.subcategory || ""
  }`;

  document.getElementById("vendorCity").innerText = L.city || "";
  document.getElementById("vendorPrice").innerText = `₹${L.price}`;
  document.getElementById("vendorAbout").innerText = L.about || "";

  loadSuggested(vendorData.mainCategory);
}
loadVendorProfile();

/* ======================================
   SLIDER
====================================== */
let slideIndex = 0;

function loadSlider(images) {
  const box = document.getElementById("sliderImages");
  box.innerHTML = "";
  if (!images.length) images = ["/images/default.jpg"];

  images.forEach((img) => (box.innerHTML += `<img src="${img}">`));

  document.getElementById("nextSlide").onclick = () =>
    nextSlide(images.length);
  document.getElementById("prevSlide").onclick = () =>
    prevSlide(images.length);
}

function nextSlide(t) {
  slideIndex = (slideIndex + 1) % t;
  updateSlider();
}
function prevSlide(t) {
  slideIndex = (slideIndex - 1 + t) % t;
  updateSlider();
}

function updateSlider() {
  document.getElementById(
    "sliderImages"
  ).style.transform = `translateX(-${slideIndex * 100}%)`;
}

/* ======================================
   LOAD SUGGESTED VENDORS
====================================== */
async function loadSuggested(mainCategory) {
  if (!mainCategory) return;

  const q = query(
    collection(db, "vendors"),
    where("status", "==", "approved"),
    where("mainCategory", "==", mainCategory)
  );

  const snap = await getDocs(q);
  const box = document.getElementById("suggestedVendors");
  box.innerHTML = "";

  for (const docx of snap.docs) {
    if (docx.id === vendorId) continue;

    const vendorData = docx.data();
    const listSnap = await getDocs(
      collection(db, "vendors", docx.id, "listings")
    );

    if (listSnap.empty) continue;

    const L = listSnap.docs[0].data();
    const img = L.photos?.[0] || "/images/default.jpg";

    box.innerHTML += `
      <div class="suggest-card"
        onclick="location.href='vendor-profile.html?id=${docx.id}'">
        <img src="${img}">
        <h4>${vendorData.businessName}</h4>
        <p>${L.city}</p>
        <p>₹${L.price}</p>
      </div>`;
  }
}

/* ======================================
   SAVE VENDOR (Wishlist)
====================================== */
document.getElementById("saveVendorBtn").onclick = async () => {
  const user = auth.currentUser;
  if (!user) return alert("Login first!");

  await setDoc(doc(db, "customers", user.uid, "wishlist", vendorId), {
    vendorId,
    savedAt: Date.now(),
  });

  alert("Saved ❤️");
};

/* ======================================
   BOOKING POPUP
====================================== */
const popup = document.getElementById("bookingPopup");
const overlay = document.getElementById("popupOverlay");
const thankBox = document.getElementById("thankYouBox");

document.getElementById("bookNowBtn").onclick = () => {
  popup.style.display = "block";
  overlay.style.display = "block";
};

document.getElementById("closePopupBtn").onclick = () => {
  popup.style.display = "none";
  overlay.style.display = "none";
};

/* ======================================
   FINAL BOOKING SUBMIT (BUG-FREE)
====================================== */
document.getElementById("submitBookingBtn").onclick = async () => {
  const user = auth.currentUser;
  if (!user) return alert("Please login first!");

  // SAFE amount
  let amountText = document
    .getElementById("vendorPrice")
    .innerText.replace("₹", "")
    .replace(/,/g, "");

  const amount = Number(amountText);

  // SAFE eventType handling
  const categoryText = document.getElementById("vendorCategory").innerText;
  let eventType = "General";

  if (categoryText.includes("→")) {
    eventType = categoryText.split("→")[1].trim() || "General";
  }

  const data = {
    vendorId,
    vendorName: document.getElementById("vendorName").innerText,
    customerId: user.uid,
    customerName: cName.value.trim(),
    amount,
    eventDate: cDate.value,
    eventCity: cCity.value.trim(),
    venueLocation: cVenue.value.trim(),
    guests: cGuests.value.trim(),
    message: cMsg.value.trim(),
    eventType,
  };

  // REQUIRED FIELD VALIDATION
  if (!data.customerName) return alert("Enter your name");
  if (!data.eventDate) return alert("Select event date");
  if (!data.amount) return alert("Invalid vendor price");

  // SEND TO BACKEND
  const res = await fetch(`${BASE_URL}/api/booking/create`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  const result = await res.json();
  if (!result.success) {
    console.log(result);
    return alert("Booking failed");
  }

  popup.style.display = "none";
  overlay.style.display = "none";
  thankBox.style.display = "block";

  setTimeout(() => (thankBox.style.display = "none"), 2000);
};

/* ======================================
   CHAT SYSTEM (UNCHANGED)
====================================== */
// Tumhara chat code same rehne do
