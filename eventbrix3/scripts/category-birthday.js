import { db } from "/scripts/firebase.js";
import { collection, query, where, getDocs }
from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

async function loadVendors() {
  const list = document.getElementById("vendorList");
  list.innerHTML = "Loading...";

  const q = query(
    collection(db, "vendors"),
    where("status", "==", "approved"),
    where("mainCategory", "==", "Birthday")
  );

  const snap = await getDocs(q);
  list.innerHTML = "";

  snap.forEach((docx)=>{
    const v = docx.data();
    list.innerHTML += `
      <div class="vendor-card" onclick="location.href='/vendor/vendor-profile.html?id=${docx.id}'">
        <img src="${v.photos?.[0] || '/images/default.jpg'}">
        <h3>${v.businessName}</h3>
        <p>${v.city}</p>
        <p>₹${v.price}</p>
      </div>`;
  });
}

loadVendors();
