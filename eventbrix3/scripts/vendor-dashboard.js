// Vendor Dashboard – Integrated Version

import { auth, db, onAuthStateChanged } from "/scripts/firebase.js";

import {
  collection,
  query,
  where,
  getDocs,
  addDoc
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// Cloudinary
const cloudName = "dbxt5tgze";
const uploadPreset = "eventbrix_uploads";

// DOM elements
const vendorFormBox = document.getElementById("vendorFormBox");
const vendorData = document.getElementById("vendorData");
const logoutBtn = document.getElementById("logoutBtn");
const uploadStatus = document.getElementById("uploadStatus");

// FORM ELEMENTS
const form = document.getElementById("vendorForm");

// SUBCATEGORY LISTS
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

// CATEGORY CHANGE HANDLER
document.getElementById("mainCategory").addEventListener("change", () => {
  const selected = mainCategory.value;

  document.getElementById("perPlate").style.display =
    selected === "banquet" ? "block" : "none";

  const box = document.getElementById("subCategoryBox");
  const sub = document.getElementById("subCategory");

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

// AUTH CHECK
onAuthStateChanged(auth, (user) => {
  if (!user) {
    window.location.href = "vendor-login.html";
  } else {
    loadVendorDashboard(user.email);
  }
});

// LOAD VENDOR DETAILS OR FORM
async function loadVendorDashboard(email) {
  const q = query(collection(db, "vendors"), where("email", "==", email));
  const snap = await getDocs(q);

  // If first-time vendor → Show Form
  if (snap.empty) {
    vendorFormBox.style.display = "block";
    return;
  }

  // Vendor exists → Show data
  vendorFormBox.style.display = "none";
  vendorData.style.display = "block";

  snap.forEach(docSnap => {
    const d = docSnap.data();

    vendorData.innerHTML = `
      <h3>${d.businessName}</h3>
      <p><strong>Owner:</strong> ${d.ownerName}</p>
      <p><strong>City:</strong> ${d.city}</p>
      <p><strong>Main Category:</strong> ${d.mainCategory}</p>
      <p><strong>Subcategory:</strong> ${d.subCategory}</p>
      <p><strong>Starting Price:</strong> ₹${d.startingPrice}</p>
      <p><strong>Status:</strong> ${
        d.status === "approved"
          ? "<span style='color:lightgreen;'>Approved ✔</span>"
          : "<span style='color:yellow;'>Pending Approval ⏳</span>"
      }</p>
    `;

    // ⭐ Enable vendor chat panel
    const chatBtn = document.getElementById("vendorChatBtn");
    chatBtn.style.display = "block";
    chatBtn.href = `/vendor/vendor-chat.html?vendor=${docSnap.id}`;
  });
}

// FORM SUBMISSION INSIDE DASHBOARD
form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const nameValue = document.getElementById("name").value;
  const ownerValue = document.getElementById("owner").value;
  const cityValue = document.getElementById("city").value;
  const mainCategory = document.getElementById("mainCategory").value;
  const subCategory = document.getElementById("subCategory").value;
  const price = document.getElementById("price").value;
  const perPlate = document.getElementById("perPlate").value;
  const services = document.getElementById("services").value;
  const files = document.getElementById("photos").files;

  if (files.length < 1) {
    alert("Please upload at least 1 image.");
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

  uploadStatus.textContent = "Saving Info...";

  await addDoc(collection(db, "vendors"), {
    businessName: nameValue,
    ownerName: ownerValue,
    city: cityValue,
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

  alert("Profile Submitted Successfully!");
  location.reload();
});
