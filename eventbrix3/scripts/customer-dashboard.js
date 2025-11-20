import { auth, db } from "/scripts/firebase.js";
import {
  doc,
  getDoc,
  collection,
  getDocs,
  query,
  where,
  orderBy
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

auth.onAuthStateChanged(async (user) => {
  if (!user) {
    location.href = "/customer/customer-login.html";
    return;
  }

  loadProfile(user.uid);
  loadWishlist(user.uid);
  loadRecent(user.uid);
  loadBookings(user.uid);
  loadChats(user.uid);
  loadReviews(user.uid);
});

/* TABS */
document.querySelectorAll(".tabBtn").forEach(btn => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".section").forEach(sec => sec.style.display = "none");
    document.getElementById(btn.dataset.tab).style.display = "block";
  });
});

/* PROFILE */
async function loadProfile(uid) {
  const snap = await getDoc(doc(db, "customers", uid));
  const d = snap.data();

  document.getElementById("pName").innerText = d.name;
  document.getElementById("pEmail").innerText = d.email;
  document.getElementById("pPhone").innerText = d.phone;
  document.getElementById("pCity").innerText = d.city;
  document.getElementById("pJoined").innerText = new Date(d.createdAt).toDateString();
}

/* WISHLIST */
async function loadWishlist(uid) {
  const box = document.getElementById("wishlistBox");
  const snap = await getDocs(collection(db, "customers", uid, "wishlist"));

  box.innerHTML = "";

  snap.forEach(d => {
    const v = d.data();
    box.innerHTML += `
      <div class="vendor-card">
        <img src="/images/default.jpg">
        <h3>${v.businessName}</h3>
        <p>${v.city}</p>
        <a href="/vendor/vendor.html?id=${v.vendorId}" class="view-btn">View</a>
      </div>
    `;
  });
}

/* RECENT */
async function loadRecent(uid) {
  const box = document.getElementById("recentBox");
  const snap = await getDocs(collection(db, "customers", uid, "recent"));

  box.innerHTML = "";

  snap.forEach(d => {
    const v = d.data();
    box.innerHTML += `
      <div class="vendor-card">
        <img src="/images/default.jpg">
        <h3>${v.businessName}</h3>
        <p>${v.city}</p>
        <a href="/vendor/vendor.html?id=${v.vendorId}" class="view-btn">View</a>
      </div>
    `;
  });
}

/* BOOKINGS */
async function loadBookings(uid) {
  const box = document.getElementById("bookingBox");

  const qSnap = await getDocs(
    query(collection(db, "bookings"), where("customerId", "==", uid))
  );

  box.innerHTML = "";

  qSnap.forEach(b => {
    const d = b.data();
    box.innerHTML += `
      <div class="booking-card">
        <p><strong>Vendor:</strong> ${d.vendorId}</p>
        <p><strong>Date:</strong> ${d.eventDate}</p>
        <p><strong>Status:</strong> ${d.status}</p>
      </div>
    `;
  });
}

/* CHATS */
async function loadChats(uid) {
  const box = document.getElementById("chatBox");

  const qSnap = await getDocs(
    query(collection(db, "chats"), where("customerId", "==", uid))
  );

  box.innerHTML = "";

  qSnap.forEach(c => {
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

/* REVIEWS */
async function loadReviews(uid) {
  const box = document.getElementById("reviewBox");

  const qSnap = await getDocs(
    query(collection(db, "reviews"), where("customerId", "==", uid))
  );

  box.innerHTML = "";

  qSnap.forEach(r => {
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
