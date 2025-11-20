import { auth, db } from "/scripts/firebase.js";
import {
  doc,
  updateDoc
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

let vendorId = null;

// Vendor UID → VendorID find
auth.onAuthStateChanged(async (user) => {
  if (!user) {
    location.href = "vendor-login.html";
    return;
  }

  // vendorId find through "uid"
  const q = await db.collection("vendors")
    .where("uid", "==", user.uid)
    .get();

  if (q.empty) {
    alert("Vendor profile missing!");
    return;
  }

  vendorId = q.docs[0].id; // example: VEN-1001
});


document.getElementById("vendorRegisterForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  const businessName = e.target.businessName.value;
  const city = e.target.city.value;
  const category = e.target.category.value;
  const subcategory = e.target.subcategory.value;
  const price = e.target.price.value;
  const about = e.target.about.value;

  try {
    await updateDoc(doc(db, "vendors", vendorId), {
      businessName,
      city,
      category,
      subcategory,
      price,
      about,
      status: "pending"   // admin approval system
    });

    alert("Vendor Profile Submitted!");
    location.href = "vendor-dashboard.html";

  } catch (err) {
    alert(err.message);
  }
});
