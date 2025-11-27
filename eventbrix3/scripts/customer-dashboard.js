import { auth, db } from "/scripts/firebase.js";
import {
  collection,
  getDocs,
  getDoc,
  doc,
  query,
  where,
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

import { signOut } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

/* ======================================
   IMPORT BOOKING SYSTEM
====================================== */
import { loadBookingsUI } from "../scripts/mybookings.js";

/* ======================================
   CHECK LOGIN STATE
====================================== */
auth.onAuthStateChanged(async (user) => {
  if (!user) {
    location.href = "/customer/customer-login.html";
    return;
  }

  loadProfile(user.uid);
  loadWishlist(user.uid);
  loadRecent(user.uid);
  loadChats(user.uid);
  loadReviews(user.uid);

  // ⭐ NEW BOOKING UI (correct)
  loadBookingsUI(user.uid);
});

/* ======================================
   TAB SWITCHER
====================================== */
document.querySelectorAll(".tabBtn").forEach((btn) => {
  btn.addEventListener("click", () => {
    document
      .querySelectorAll(".section")
      .forEach((sec) => (sec.style.display = "none"));

    document.getElementById(btn.dataset.tab).style.display = "block";
  });
});

/* ======================================
   LOAD PROFILE
====================================== */
async function loadProfile(uid) {
  const snap = await getDoc(doc(db, "customers", uid));
  if (!snap.exists()) return;

  const d = snap.data();

  document.getElementById("pName").innerText = d.name;
  document.getElementById("pEmail").innerText = d.email;
  document.getElementById("pPhone").innerText = d.phone || "-";
  document.getElementById("pCity").innerText = d.city || "-";
  document.getElementById("pJoined").innerText = new Date(
    d.createdAt
  ).toDateString();
}

/* ======================================
   LOAD WISHLIST
====================================== */
async function loadWishlist(uid) {
  const box = document.getElementById("wishlistBox");
  box.innerHTML = "";

  const snap = await getDocs(collection(db, "customers", uid, "wishlist"));

  snap.forEach((d) => {
    const v = d.data();

    box.innerHTML += `
      <div class="vendor-card">
        <img src="/images/default.jpg">
        <h3>${v.businessName || "Vendor"}</h3>
        <p>${v.city || ""}</p>
        <a href="/vendor/vendor-profile.html?id=${v.vendorId}" class="view-btn">View</a>
      </div>
    `;
  });
}

/* ======================================
   LOAD RECENT
====================================== */
async function loadRecent(uid) {
  const box = document.getElementById("recentBox");
  box.innerHTML = "";

  const snap = await getDocs(collection(db, "customers", uid, "recent"));

  snap.forEach((d) => {
    const v = d.data();

    box.innerHTML += `
      <div class="vendor-card">
        <img src="/images/default.jpg">
        <h3>${v.businessName || "Vendor"}</h3>
        <p>${v.city || ""}</p>
        <a href="/vendor/vendor-profile.html?id=${v.vendorId}" class="view-btn">View</a>
      </div>
    `;
  });
}

/* ======================================
   LOAD CHATS
====================================== */
async function loadChats(uid) {
  const box = document.getElementById("chatBox");
  box.innerHTML = "";

  const qSnap = await getDocs(
    query(collection(db, "chats"), where("customerId", "==", uid))
  );

  qSnap.forEach((c) => {
    const d = c.data();

    box.innerHTML += `
      <div class="chat-card">
        <p><strong>Vendor:</strong> ${d.vendorId}</p>
        <p>${d.lastMessage || "No messages yet"}</p>
        <a href="/customer/chat.html?vendor=${d.vendorId}" style="color:#d4a017;">Open Chat</a>
      </div>
    `;
  });
}

/* ======================================
   LOAD REVIEWS
====================================== */
async function loadReviews(uid) {
  const box = document.getElementById("reviewBox");
  box.innerHTML = "";

  const qSnap = await getDocs(
    query(collection(db, "reviews"), where("customerId", "==", uid))
  );

  qSnap.forEach((r) => {
    const d = r.data();

    box.innerHTML += `
      <div class="booking-card">
        <p><strong>Vendor:</strong> ${d.vendorId}</p>
        <p>${d.rating} ⭐</p>
        <p>${d.review}</p>
      </div>
    `;
  });
}

/* ======================================
   LOGOUT BUTTON
====================================== */
document.getElementById("logoutBtn")?.addEventListener("click", async () => {
  await signOut(auth);
  localStorage.clear();
  location.href = "/index.html";
});
