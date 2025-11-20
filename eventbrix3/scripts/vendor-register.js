import { auth, db } from "/scripts/firebase.js";
import {
  doc,
  updateDoc,
  getDocs,
  collection,
  query,
  where
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

let vendorDocId = null;

// ============ FIND THE VENDOR DOCUMENT USING UID ============
auth.onAuthStateChanged(async (user) => {
  if (!user) {
    location.href = "vendor-login.html";
    return;
  }

  try {
    const q = query(collection(db, "vendors"), where("uid", "==", user.uid));
    const snap = await getDocs(q);

    if (snap.empty) {
      alert("Vendor record missing in Firestore!");
      return;
    }

    vendorDocId = snap.docs[0].id;
    console.log("Vendor Doc ID:", vendorDocId);

  } catch (err) {
    alert(err.message);
  }
});


// ============ FORM SUBMIT ============
document.getElementById("vendorRegisterForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  if (!vendorDocId) {
    alert("Vendor not found. Reload page!");
    return;
  }

  const data = {
    businessName: e.target.businessName.value,
    city: e.target.city.value,
    category: e.target.category.value,
    subcategory: e.target.subcategory.value,
    price: e.target.price.value,
    about: e.target.about.value,
    status: "pending"
  };

  try {
    await updateDoc(doc(db, "vendors", vendorDocId), data);

    alert("Vendor Profile Submitted!");
    location.href = "vendor-dashboard.html";

  } catch (err) {
    alert("ERROR: " + err.message);
  }
});
