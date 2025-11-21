import { auth, db } from "/scripts/firebase.js";
import {
  doc,
  setDoc,
  collection,
  query,
  where,
  getDocs,
  getDoc
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// CLOUDINARY CONFIG
const CLOUD_NAME = "dbxt5tgze";
const UPLOAD_PRESET = "eventbrix_uploads";

// GLOBAL STORE
let vendorId = null;
let uploadedImages = [];  // URLs of uploaded photos

// LOGIN CHECK
auth.onAuthStateChanged(async (user) => {
  if (!user) location.href = "vendor-login.html";

  const q = query(collection(db, "vendors"), where("uid", "==", user.uid));
  const snap = await getDocs(q);

  if (snap.empty) return alert("Vendor not found!");

  vendorId = snap.docs[0].id;
});

// CLOUDINARY UPLOAD FUNCTION
async function uploadToCloudinary(file) {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", UPLOAD_PRESET);

  const res = await fetch(
    `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
    {
      method: "POST",
      body: formData,
    }
  );

  const data = await res.json();
  return data.secure_url;
}

// MULTIPLE IMAGE UPLOAD HANDLER
document.getElementById("photoUpload").addEventListener("change", async (e) => {
  uploadedImages = []; // reset everytime
  const files = [...e.target.files];
  const previewBox = document.getElementById("previewBox");
  previewBox.innerHTML = "<p>Uploading...</p>";

  let html = "";

  for (let f of files) {
    const url = await uploadToCloudinary(f);
    uploadedImages.push(url);
    html += `<img src="${url}" style="width:80px;height:80px;border-radius:8px;">`;
  }

  previewBox.innerHTML = html;
});

// SUBMIT FORM
document.getElementById("vendorRegisterForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  if (!vendorId) return alert("Vendor ID missing!");

  // FETCH FORM VALUES
  const businessName = e.target.businessName.value;
  const ownerName = e.target.ownerName?.value || "";
  const city = e.target.city.value;
  const category = e.target.category.value;
  const subcategory = e.target.subcategory.value;
  const price = Number(e.target.price.value);
  const services = e.target.services.value;
  const about = e.target.about.value;

  const perPlate =
    category === "Banquet"
      ? Number(e.target.perPlate.value || 0)
      : null;

  const serviceArea = e.target.serviceArea.value || "";
  const experience = Number(e.target.experience.value || 0);
  const teamSize = Number(e.target.teamSize.value || 0);

  if (uploadedImages.length === 0) {
    return alert("Please upload at least 1 photo.");
  }

  // DUPLICATE LISTING CHECK
  const listRef = collection(db, "vendors", vendorId, "listings");
  const listSnap = await getDocs(listRef);

  for (let docx of listSnap.docs) {
    if (docx.id === category) {
      return alert("You already have a listing in this category.");
    }
  }

  // DATA OBJECT TO SAVE
  const listingData = {
    businessName,
    ownerName,
    city,
    category,
    subcategory,
    price,
    perPlate,
    services,
    about,
    serviceArea,
    experience,
    teamSize,
    photos: uploadedImages,
    status: "pending",
    createdAt: Date.now()
  };

  try {
    await setDoc(doc(db, "vendors", vendorId, "listings", category), listingData);

    alert("Listing submitted for approval!");
    location.href = "vendor-dashboard.html";
  } catch (err) {
    alert(err.message);
  }
});
