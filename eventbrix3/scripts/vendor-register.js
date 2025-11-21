import { auth, db } from "/scripts/firebase.js";
import {
  doc,
  setDoc,
  updateDoc,
  collection,
  query,
  where,
  getDocs
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// CLOUDINARY CONFIG
const CLOUD_NAME = "dbxt5tgze";
const UPLOAD_PRESET = "eventbrix_uploads";

// GLOBAL STATE
let vendorId = null;
let uploadedImages = [];

// LOGIN CHECK – FETCH vendorId
auth.onAuthStateChanged(async (user) => {
  if (!user) return (location.href = "vendor-login.html");

  const q = query(collection(db, "vendors"), where("uid", "==", user.uid));
  const snap = await getDocs(q);

  if (snap.empty) return alert("Vendor not found!");

  vendorId = snap.docs[0].id; // Example: VEN-1009
});

// CLOUDINARY UPLOAD FUNCTION
async function uploadToCloudinary(file) {
  const fd = new FormData();
  fd.append("file", file);
  fd.append("upload_preset", UPLOAD_PRESET);

  const res = await fetch(
    `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
    { method: "POST", body: fd }
  );

  const data = await res.json();
  return data.secure_url;
}

// MULTI IMAGE UPLOAD
document
  .getElementById("photoUpload")
  .addEventListener("change", async (e) => {
    uploadedImages = [];
    const files = [...e.target.files];

    const box = document.getElementById("previewBox");
    box.innerHTML = "<p>Uploading...</p>";

    let html = "";

    for (let f of files) {
      const url = await uploadToCloudinary(f);
      uploadedImages.push(url);
      html += `<img src="${url}" style="width:80px;height:80px;border-radius:8px;margin:5px;">`;
    }

    box.innerHTML = html;
  });

// SUBMIT FORM
document
  .getElementById("vendorRegisterForm")
  .addEventListener("submit", async (e) => {
    e.preventDefault();

    if (!vendorId) return alert("Vendor ID missing!");

    // GET FORM VALUES
    const businessName = e.target.businessName.value;
    const ownerName = e.target.ownerName.value;
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
      return alert("Please upload at least 1 image.");
    }

    // CHECK DUPLICATE LISTING (same category)
    const listRef = collection(db, "vendors", vendorId, "listings");
    const listSnap = await getDocs(listRef);

    for (let docx of listSnap.docs) {
      if (docx.id === category) {
        return alert("You already have a listing in this category.");
      }
    }

    // LISTING DATA
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
      // 1️⃣ UPDATE MAIN VENDOR PROFILE
      await updateDoc(doc(db, "vendors", vendorId), {
        businessName,
        ownerName,
        city,
        mainCategory: category,
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
        updatedAt: Date.now()
      });

      // 2️⃣ STORE LISTING UNDER THE VENDOR
      await setDoc(
        doc(db, "vendors", vendorId, "listings", category),
        listingData
      );

      alert("Listing submitted for approval!");
      location.href = "vendor-dashboard.html";

    } catch (err) {
      console.error(err);
      alert("Error: " + err.message);
    }
  });
