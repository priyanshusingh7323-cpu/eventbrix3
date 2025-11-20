// File 21: scripts/customer-dashboard.js

import { auth, db } from "../firebase.js";
import { signOut } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { doc, getDoc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

const customerData = document.getElementById("customerData");
const logoutBtn = document.getElementById("logoutBtn");

async function loadCustomer() {
  const user = auth.currentUser;
  if (!user) return;

  const docRef = doc(db, "customers", user.uid);
  const snap = await getDoc(docRef);

  if (snap.exists()) {
    const d = snap.data();
    customerData.innerHTML = `
      <h3>${d.name}</h3>
      <p>${d.email}</p>
      <p>Member since: ${d.createdAt.toDate().toLocaleDateString()}</p>`;
  }
}

logoutBtn.addEventListener("click", () => {
  signOut(auth).then(() => {
    window.location.href = "customer-login.html";
  });
});

window.onload = loadCustomer;