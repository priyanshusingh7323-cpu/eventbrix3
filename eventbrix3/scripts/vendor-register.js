import { auth, db } from "/scripts/firebase.js";
import {
  doc,
  updateDoc,
  collection,
  query,
  where,
  getDocs
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

let vendorId = null;

auth.onAuthStateChanged(async (user) => {
  if (!user) return location.href = "vendor-login.html";

  const q = query(
    collection(db, "vendors"),
    where("uid", "==", user.uid)
  );
  const snap = await getDocs(q);

  vendorId = snap.docs[0].id;
});

document.getElementById("vendorRegisterForm")
.addEventListener("submit", async (e) => {
  e.preventDefault();

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
    await updateDoc(doc(db, "vendors", vendorId), data);
    alert("Profile submitted!");
    location.href = "vendor-dashboard.html";
  }
  catch (err) {
    alert(err.message);
  }
});
