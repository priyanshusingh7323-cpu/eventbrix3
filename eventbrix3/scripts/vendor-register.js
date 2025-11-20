// Vendor Registration – EventBrix (FINAL FIXED VERSION)

// 🔐 LOGIN CHECK (no one can open this page without login)
import { auth, db, onAuthStateChanged } from "/scripts/firebase.js";
onAuthStateChanged(auth, (user) => {
  if (!user) {
    window.location.href = "vendor-login.html"; // redirect if not logged in
  }
});

import { collection, addDoc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// Cloudinary
const cloudName = "dbxt5tgze";
const uploadPreset = "eventbrix_uploads";

const form = document.getElementById("vendorRegisterForm");
const uploadStatus = document.getElementById("uploadStatus");

// Subcategories
const subCategories = {
  wedding: ["All Services", "Planner", "Photography", "Decor", "Catering", "Makeup"],
  birthday: ["All Services", "Decor", "Cake", "Event Planner", "Photography"],
  corporate: ["All Services", "Event Planner", "AV Setup", "Banquet", "Catering"],
  banquet: ["All Services", "Indoor", "Outdoor", "AC Hall", "Non-AC Hall", "Small (100-200)", "Medium (200-500)", "Large (500+)"],
  photo: ["All Services", "Candid", "Traditional", "Cinematic", "Drone", "Album Only"],
  catering: ["All Services", "Veg", "Non-Veg", "Live Counters", "Buffet"],
  decoration: ["All Services", "Wedding Decor", "Birthday Decor", "Stage Decor", "Theme Based"],
  makeup: ["All Services", "Bridal", "Party", "HD Makeup", "Airbrush"]
};

// MAIN CATEGORY CHANGE
document.getElementById("mainCategory").addEventListener("change", function () {
  const selected = this.value;
  const box = document.getElementById("subCategoryBox");
  const sub = document.getElementById("subCategory");

  document.getElementById("perPlate").style.display = 
    selected === "banquet" ? "block" : "none";

  if (!selected) {
    box.style.display = "none";
    return;
  }

  sub.innerHTML = `<option value="">Select Sub-Category *</option>`;
  subCategories[selected].forEach(item => {
    sub.innerHTML += `<option value="${item}">${item}</option>`;
  });

  box.style.display = "block";
});

// SUBMIT FORM
form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const name = document.getElementById("name").value;
  const owner = document.getElementById("owner").value;
  const city = document.getElementById("city").value;
  const mainCategory = document.getElementById("mainCategory").value;
  const subCategory = document.getElementById("subCategory").value;
  const price = document.getElementById("price").value;
  const perPlate = document.getElementById("perPlate").value;
  const services = document.getElementById("services").value;
  const files = document.getElementById("photos").files;

  if (files.length < 1) {
    alert("Please upload at least 10 photo.");
    return;
  }

  uploadStatus.textContent = "Uploading Photos...";

  const photoURLs = [];

  for (let i = 0; i < files.length; i++) {
    const data = new FormData();
    data.append("file", files[i]);
    data.append("upload_preset", uploadPreset);

    const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
      method: "POST",
      body: data
    });

    const fileData = await res.json();
    photoURLs.push(fileData.secure_url);
  }

  uploadStatus.textContent = "Saving Vendor...";

  await addDoc(collection(db, "vendors"), {
    businessName: name,
    ownerName: owner,
    city,
    mainCategory,
    subCategory,
    startingPrice: price,
    perPlate,
    services,
    photos: photoURLs,
    email: auth.currentUser.email,
    status: "pending",
    createdAt: Date.now()
  });

  uploadStatus.textContent = "Vendor Registered Successfully!";
  alert("Vendor Registered Successfully!");

  // ✔ Redirect to Dashboard (FINAL FIX)
  window.location.href = "vendor-dashboard.html";
});
