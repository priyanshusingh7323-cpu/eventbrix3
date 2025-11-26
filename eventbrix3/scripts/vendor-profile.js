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
  addDoc,
  query,
  where,
  updateDoc,
  onSnapshot,
  orderBy
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

/* ======================================
   BACKEND BASE URL (FIXED)
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
  const listings = await getDocs(collection(db, "vendors", vendorId, "listings"));
  const L = listings.docs[0].data();

  loadSlider(L.photos || []);

  document.getElementById("vendorName").innerText = L.businessName;
  document.getElementById("drawerVendorName").innerText = L.businessName;

  document.getElementById("vendorCategory").innerText =
    `${L.category} → ${L.subcategory}`;

  document.getElementById("vendorCity").innerText = L.city;
  document.getElementById("vendorPrice").innerText = `₹${L.price}`;
  document.getElementById("vendorAbout").innerText = L.about;

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

  images.forEach(img => box.innerHTML += `<img src="${img}">`);

  document.getElementById("nextSlide").onclick = () => nextSlide(images.length);
  document.getElementById("prevSlide").onclick = () => prevSlide(images.length);
}
function nextSlide(t){ slideIndex=(slideIndex+1)%t; updateSlider(); }
function prevSlide(t){ slideIndex=(slideIndex-1+t)%t; updateSlider(); }
function updateSlider(){
  document.getElementById("sliderImages").style.transform =
    `translateX(-${slideIndex * 100}%)`;
}

/* ======================================
   SUGGESTED VENDORS
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
    const listSnap = await getDocs(collection(db, "vendors", docx.id, "listings"));
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
   SAVE VENDOR
====================================== */
document.getElementById("saveVendorBtn").onclick = async () => {
  const user = auth.currentUser;
  if (!user) return alert("Login first!");

  await setDoc(doc(db, "customers", user.uid, "wishlist", vendorId), {
    vendorId,
    savedAt: Date.now()
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
   BACKEND BOOKING SUBMIT (FINAL FIXED)
====================================== */
document.getElementById("submitBookingBtn").onclick = async () => {
  const user = auth.currentUser;
  if (!user) return alert("Please login first!");

  const vendorName = document.getElementById("vendorName").innerText;
  const amount = parseInt(
    document.getElementById("vendorPrice")
      .innerText.replace("₹", "")
  );

  const data = {
    vendorId,
    vendorName,
    customerId: user.uid,
    customerName: cName.value,
    amount,
    eventDate: cDate.value,
    eventCity: cCity.value,
    venueLocation: cVenue.value,
    guests: cGuests.value,
    message: cMsg.value,
    eventType: document.getElementById("vendorCategory").innerText
  };

  if (!data.customerName || !data.eventDate || !data.amount) {
    return alert("Fill required fields");
  }

  const res = await fetch(`${BASE_URL}/api/booking/create`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data)
  });

  const result = await res.json();
  if (!result.success) {
    console.log(result);
    return alert("Booking failed");
  }

  popup.style.display = "none";
  overlay.style.display = "none";
  thankBox.style.display = "block";
  setTimeout(() => thankBox.style.display = "none", 2000);
};

/* ======================================
   CHAT SYSTEM
====================================== */
/* (UNCHANGED CODE — SAME AS YOUR VERSION) */
