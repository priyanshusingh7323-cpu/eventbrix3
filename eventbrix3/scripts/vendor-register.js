import { auth, db } from "/scripts/firebase.js";
import {
  doc,
  updateDoc,
  collection,
  query,
  where,
  getDocs
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

let vendorUID = null;  // This is the document ID

auth.onAuthStateChanged(async (user) => {
  if (!user) {
    location.href = "vendor-login.html";
    return;
  }

  // find vendor document using UID
  const q = query(
    collection(db, "vendors"),
    where("uid", "==", user.uid)
  );

  const snap = await getDocs(q);

  if (snap.empty) {
    alert("Vendor profile missing!");
    return;
  }

  vendorUID = snap.docs[0].id;  // This IS the UID (document ID)
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
    await updateDoc(doc(db, "vendors", vendorUID), {
      businessName,
      city,
      category,
      subcategory,
      price,
      about,
      status: "pending"  // waiting for admin approval
    });

    alert("Vendor Profile Submitted!");
    location.href = "vendor-dashboard.html";

  } catch (err) {
    alert(err.message);
  }
});
