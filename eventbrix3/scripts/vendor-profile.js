import { db, auth } from "/scripts/firebase.js";
import {
  doc, getDoc, collection, getDocs,
  setDoc, addDoc, query, where
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

const params = new URLSearchParams(window.location.search);
const vendorId = params.get("id");

if (!vendorId) {
  alert("Vendor ID missing!");
  throw new Error("Vendor ID missing");
}

/* ============================
   LOAD MAIN PROFILE
============================ */
async function loadVendorProfile() {
  const listRef = collection(db, "vendors", vendorId, "listings");
  const snap = await getDocs(listRef);

  if (snap.empty) return;

  const L = snap.docs[0].data();

  // multiple image slider
  loadSlider(L.photos || []);

  document.getElementById("vendorName").innerText = L.businessName;
  document.getElementById("vendorCategory").innerText = `${L.category} → ${L.subcategory}`;
  document.getElementById("vendorCity").innerText = L.city;
  document.getElementById("vendorPrice").innerText = `₹${L.price}`;
  document.getElementById("vendorAbout").innerText = L.about;

  document.getElementById("chatBtn").href = `/customer/chat.html?vendor=${vendorId}`;

  loadSuggested(L.category);
}

loadVendorProfile();

/* ============================
   SLIDER LOGIC
============================ */
let slideIndex = 0;

function loadSlider(images) {
  const box = document.getElementById("sliderImages");
  box.innerHTML = "";

  if (images.length === 0) {
    images = ["/images/default.jpg"];
  }

  images.forEach(img => {
    box.innerHTML += `<img src="${img}">`;
  });

  document.getElementById("nextSlide").onclick = () => nextSlide(images.length);
  document.getElementById("prevSlide").onclick = () => prevSlide(images.length);
}

function nextSlide(total) {
  slideIndex = (slideIndex + 1) % total;
  updateSlider();
}

function prevSlide(total) {
  slideIndex = (slideIndex - 1 + total) % total;
  updateSlider();
}

function updateSlider() {
  document.getElementById("sliderImages").style.transform =
    `translateX(-${slideIndex * 100}%)`;
}

/* ============================
   SUGGESTED VENDORS
============================ */
async function loadSuggested(category) {
  const q = query(
    collection(db, "vendors"),
    where("status", "==", "approved"),
    where("mainCategory", "==", category)
  );

  const snap = await getDocs(q);
  const box = document.getElementById("suggestedVendors");
  box.innerHTML = "";

  snap.forEach(docx => {
    if (docx.id === vendorId) return;

    const v = docx.data();
    const img = v.photos?.[0] || "/images/default.jpg";

    box.innerHTML += `
      <div class="suggest-card"
           onclick="location.href='vendor-profile.html?id=${docx.id}'">
        <img src="${img}">
        <h4>${v.businessName}</h4>
        <p>${v.city}</p>
        <p>₹${v.price}</p>
      </div>
    `;
  });
}

/* ============================
 SAVE TO WISHLIST
============================ */
document.getElementById("saveVendorBtn").onclick = async () => {
  const user = auth.currentUser;
  if (!user) return alert("Login as customer first!");

  await setDoc(doc(db, "customers", user.uid, "wishlist", vendorId), {
    vendorId,
    savedAt: Date.now()
  });

  alert("Vendor saved ❤️");
};

/* ============================
  BOOKING POPUP
============================ */
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

/* ============================
  SUBMIT BOOKING
============================ */
document.getElementById("submitBookingBtn").onclick = async () => {
  const data = {
    vendorId,
    customerName: cName.value,
    phone: cPhone.value,
    eventDate: cDate.value,
    eventCity: cCity.value,
    venueLocation: cVenue.value,
    guestCount: cGuests.value,
    message: cMsg.value,
    createdAt: Date.now(),
    status: "pending"
  };

  if (!data.customerName || !data.phone) {
    return alert("Name & phone required!");
  }

  await addDoc(collection(db, "adminRequests"), data);

  popup.style.display = "none";
  overlay.style.display = "none";

  thankBox.style.display = "block";
  setTimeout(() => thankBox.style.display = "none", 2000);
};
