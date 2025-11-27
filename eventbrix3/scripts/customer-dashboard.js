import { auth, db } from "/scripts/firebase.js";
import {
  doc,
  getDoc,
  getDocs,
  collection,
  query,
  where
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

import { signOut } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

/* LOAD ON LOGIN */
auth.onAuthStateChanged(async (user) => {
  if (!user) return location.href = "/customer/customer-login.html";

  loadProfile(user.uid);
  loadSummary(user.uid);
  loadCompactUpcoming(user.uid);
});

/* LOAD PROFILE */
async function loadProfile(uid) {
  const snap = await getDoc(doc(db, "customers", uid));
  if (!snap.exists()) return;

  const d = snap.data();

  document.getElementById("pName").innerText = d.name;
  document.getElementById("pEmail").innerText = d.email;
  document.getElementById("pPhone").innerText = d.phone;
  document.getElementById("pCity").innerText = d.city;
  document.getElementById("pJoined").innerText =
    "Joined " + new Date(d.createdAt).toDateString();

  document.getElementById("greeting").innerText =
    "Hi " + d.name.split(" ")[0] + " 👋";
}

/* LOAD SUMMARY (stats) */
async function loadSummary(uid) {
  const qSnap = await getDocs(
    query(collection(db, "bookings"), where("customerId", "==", uid))
  );

  let upcoming = 0;
  let pending = 0;
  let spent = 0;
  const now = Date.now();

  qSnap.forEach((b) => {
    const d = b.data();
    const date = new Date(d.eventDate).getTime();

    if (date >= now) upcoming++;
    if (d.paymentStatus !== "paid" && d.status === "approved") pending++;
    if (d.paymentStatus === "paid") spent += Number(d.amount);
  });

  document.getElementById("statUpcoming").innerText = upcoming;
  document.getElementById("statPending").innerText = pending;
  document.getElementById("statSpent").innerText =
    "₹" + spent.toLocaleString();
}

/* LOAD COMPACT UPCOMING EVENTS */
async function loadCompactUpcoming(uid) {
  const box = document.getElementById("compactUpcoming");
  box.innerHTML = "";

  const snap = await getDocs(
    query(collection(db, "bookings"), where("customerId", "==", uid))
  );

  let list = [];
  const now = Date.now();

  snap.forEach((b) => {
    const d = b.data();
    const t = new Date(d.eventDate).getTime();
    if (t > now)
      list.push({
        id: b.id,
        vendorName: d.vendorName,
        date: d.eventDate,
        status: d.status,
        amount: d.amount
      });
  });

  // sort by nearest event
  list.sort((a, b) => new Date(a.date) - new Date(b.date));

  const show = list.slice(0, 3);

  if (show.length === 0) {
    box.innerHTML = `<p style="color:gray;margin-left:15px;">No upcoming events</p>`;
    return;
  }

  show.forEach((e) => {
    box.innerHTML += `
      <div>
        <div>
          <strong>${e.vendorName}</strong><br>
          <small>${e.date} • ${e.status}</small>
        </div>
        <div>
          ₹${e.amount}
        </div>
      </div>
    `;
  });
}

/* QUICK ACTIONS */
document.getElementById("openBookings").onclick = () =>
  location.href = "/customer/bookings.html";

document.getElementById("openPayments").onclick = () =>
  location.href = "/customer/payments.html";

document.getElementById("openChats").onclick = () =>
  location.href = "/customer/chat-list.html";

document.getElementById("openWishlist").onclick = () =>
  location.href = "/customer/wishlist.html";

document.getElementById("openRecent").onclick = () =>
  location.href = "/customer/recent.html";

document.getElementById("openAccount").onclick = () =>
  location.href = "/customer/profile.html";

document.getElementById("openHomePage").onclick = () =>
  location.href = "/index.html";

/* HEADER HOME BUTTON */
document.getElementById("goHomePage").onclick = () =>
  location.href = "/index.html";

/* LOGOUT */
document.getElementById("logoutBtn").onclick = async () => {
  await signOut(auth);
  location.href = "/index.html";
};

/* CHAT SLIDER */
document.getElementById("openChatPanel").onclick = () => {
  document.getElementById("chatPanel").classList.add("open");
  document.getElementById("overlay").classList.add("show");
};

document.getElementById("closeChatPanel").onclick = () => {
  document.getElementById("chatPanel").classList.remove("open");
  document.getElementById("overlay").classList.remove("show");
};
