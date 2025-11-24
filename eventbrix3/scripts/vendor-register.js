import { auth, db } from "/scripts/firebase.js";
import {
  doc,
  setDoc,
  getDocs,
  collection,
  query,
  where
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

/* ------------------------------------------
   CLOUDINARY CONFIG
------------------------------------------- */
const CLOUD_NAME = "dbxt5tgze";
const UPLOAD_PRESET = "eventbrix_uploads";

/* GLOBAL */
let vendorId = null;
let uploadedImages = [];

/* ------------------------------------------
   LOGIN CHECK + CREATE VENDOR DOCUMENT
------------------------------------------- */
auth.onAuthStateChanged(async (user) => {
  if (!user) return (location.href = "vendor-login.html");

  const q = query(collection(db, "vendors"), where("uid", "==", user.uid));
  const snap = await getDocs(q);

  if (snap.empty) {
    vendorId = "VEN-" + user.uid;

    await setDoc(doc(db, "vendors", vendorId), {
      uid: user.uid,
      vendorId,
      createdAt: Date.now(),
      approved: false
    });

  } else {
    vendorId = snap.docs[0].id;
  }
});

/* ------------------------------------------
   CLOUDINARY IMAGE UPLOAD
------------------------------------------- */
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

/* MULTI-IMAGE UPLOAD PREVIEW */
document.getElementById("photoUpload").addEventListener("change", async (e) => {
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

/* ------------------------------------------
   SUBMIT FORM
------------------------------------------- */
document.getElementById("vendorRegisterForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  if (!vendorId) return alert("Vendor ID missing!");

  /* READ FORM VALUES */
  const businessName = e.target.businessName.value;
  const ownerName = e.target.ownerName.value;
  const city = e.target.city.value;
  const category = e.target.category.value;
  const subcategory = e.target.subcategory.value;
  const price = Number(e.target.price.value);
  const services = e.target.services.value;
  const about = e.target.about.value;
  const serviceArea = e.target.serviceArea.value || "";
  const experience = Number(e.target.experience.value || 0);
  const teamSize = Number(e.target.teamSize.value || 0);

  // ⭐ NEW LOCATION FIELDS
  const latitude = Number(document.getElementById("vendorLat").value || 0);
  const longitude = Number(document.getElementById("vendorLng").value || 0);

  // ⭐⭐⭐ NEW FEATURE: AUTO LOCALITY EXTRACT (Chattarpur / Dwarka / Munirka etc.)
  let locality = "";
  const cityLower = city.toLowerCase();

  if (cityLower.includes("chattarpur")) locality = "Chattarpur";
  else if (cityLower.includes("dwarka")) locality = "Dwarka";
  else if (cityLower.includes("munirka")) locality = "Munirka";
  else if (cityLower.includes("rohini")) locality = "Rohini";
  else if (cityLower.includes("saket")) locality = "Saket";
  else if (cityLower.includes("noida")) locality = "Noida";
  else if (cityLower.includes("gurgaon")) locality = "Gurgaon";
  else if (cityLower.includes("janakpuri")) locality = "Janakpuri";
  else if (cityLower.includes("lajpat")) locality = "Lajpat Nagar";
  else if (cityLower.includes("karol")) locality = "Karol Bagh";
  else locality = city; // fallback

  const perPlate =
    category === "Banquet / Venue" ? Number(e.target.perPlate.value || 0) : null;

  if (uploadedImages.length === 0) {
    return alert("Please upload at least 1 image.");
  }

  /* ------------------------------------------
     DUPLICATE LISTING CHECK
  ------------------------------------------- */
  const listRef = collection(db, "vendors", vendorId, "listings");
  const listSnap = await getDocs(listRef);

  for (let docx of listSnap.docs) {
    if (docx.id === category) {
      return alert("You already have a listing in this category.");
    }
  }

  /* LISTING DATA */
  const listingData = {
    vendorId,
    businessName,
    ownerName,
    city,
    locality,   // ⭐ ADDED
    latitude,
    longitude,
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
    /* ------------------------------------------
       UPDATE MAIN VENDOR PROFILE (MERGE)
    ------------------------------------------- */
    await setDoc(
      doc(db, "vendors", vendorId),
      {
        vendorId,
        ownerName,
        businessName,
        city,
        locality,    // ⭐ ADDED
        latitude,
        longitude,
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
      },
      { merge: true }
    );

    /* ------------------------------------------
       CREATE LISTING DOCUMENT
    ------------------------------------------- */
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
