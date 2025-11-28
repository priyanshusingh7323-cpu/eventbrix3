import { auth, db } from "/scripts/firebase.js";
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  getDoc,
  onSnapshot
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

import {
  signOut
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

let CURRENT_VENDOR_ID = null;

/* -----------------------------------------
   LOGIN CHECK + LOAD VENDOR PROFILE
------------------------------------------ */
auth.onAuthStateChanged(async (user) => {
  if (!user) return location.href = "vendor-login.html";

  const q = query(collection(db, "vendors"), where("uid", "==", user.uid));
  const snap = await getDocs(q);

  if (snap.empty) return alert("Vendor profile not found!");

  const vendorDoc = snap.docs[0];
  const vendorId = vendorDoc.id;
  CURRENT_VENDOR_ID = vendorId;

  const data = vendorDoc.data();

  document.getElementById("vendorName").innerText = data.businessName || "Vendor";
  document.getElementById("vendorCity").innerText = data.city || "Not Set";
  document.getElementById("vendorID").innerText = vendorId;
  document.getElementById("vendorStatus").innerText = data.status || "pending";

  loadListings(vendorId);
  loadApprovedLeads(vendorId);
  loadAnalytics(vendorId);

  // NEW: Earnings & payouts
  loadEarnings(vendorId);
  loadPayoutHistory(vendorId);

  liveMessageCounter(vendorId);
});

/* -----------------------------------------
   NAVBAR
------------------------------------------ */
document.getElementById("homeBtn").onclick = () => {
  location.href = "/index.html";
};

document.getElementById("logoutTopBtn").onclick = async () => {
  await signOut(auth);
  location.href = "vendor-login.html";
};

/* -----------------------------------------
   QUICK ACTION BUTTONS
------------------------------------------ */
document.getElementById("qaListings").onclick = () => {
  scrollToTarget("#vendorListings");
};

document.getElementById("qaLeads").onclick = () => {
  scrollToTarget("#vendorLeads");
};

document.getElementById("qaMessages").onclick = () => {
  openChatDrawer();
};

document.getElementById("qaProfile").onclick = () => {
  alert("Profile editing coming soon!");
};

function scrollToTarget(id) {
  window.scrollTo({
    top: document.querySelector(id).offsetTop - 30,
    behavior: "smooth"
  });
}

/* -----------------------------------------
   CREATE LISTING
------------------------------------------ */
document.getElementById("newListingBtn").onclick = () => {
  window.location.href = "vendor-register.html?mode=new";
};

/* -----------------------------------------
   LOAD LISTINGS
------------------------------------------ */
async function loadListings(vendorId) {
  const listRef = collection(db, "vendors", vendorId, "listings");
  const snap = await getDocs(listRef);

  const box = document.getElementById("vendorListings");
  box.innerHTML = "";

  snap.forEach((docx) => {
    const L = docx.data();
    const img = (L.photos && L.photos.length > 0) ? L.photos[0] : "/noimg.png";

    box.innerHTML += `
      <div class="listing-card">
        <img src="${img}">
        <h3>${L.category} – ${L.subcategory}</h3>
        <p><strong>Price:</strong> ₹${L.price}</p>
        <p><strong>City:</strong> ${L.city}</p>
        <p><strong>Status:</strong> ${L.status}</p>
      </div>
    `;
  });
}

/* -----------------------------------------
   LOAD APPROVED LEADS
------------------------------------------ */
async function loadApprovedLeads(vendorId) {
  const leadsRef = collection(db, "leads_approved", vendorId, "items");
  const snap = await getDocs(leadsRef);

  const box = document.getElementById("vendorLeads");
  box.innerHTML = snap.empty ? "No approved leads yet." : "";

  snap.forEach((d) => {
    const L = d.data();

    box.innerHTML += `
      <div class="lead-card">
        <h3>${L.customerName}</h3>
        <p><strong>Phone:</strong> ${L.phone}</p>
        <p><strong>Event Date:</strong> ${L.eventDate}</p>
        <p><strong>City:</strong> ${L.eventCity}</p>
        <p><strong>Venue:</strong> ${L.venueLocation}</p>
        <p><strong>Guests:</strong> ${L.guestCount}</p>
        <p><strong>Message:</strong> ${L.message}</p>
      </div>
    `;
  });
}

/* -----------------------------------------
   ANALYTICS
------------------------------------------ */
async function loadAnalytics(vendorId) {
  document.getElementById("statViews").innerText = 12;

  const leadsRef = collection(db, "leads_approved", vendorId, "items");
  const leadsSnap = await getDocs(leadsRef);
  document.getElementById("statLeads").innerText = leadsSnap.size;

  const msgRef = collection(db, "chats");
  const q = query(msgRef, where("vendorId", "==", vendorId));
  const msgSnap = await getDocs(q);
  document.getElementById("statMessages").innerText = msgSnap.size;
}

/* -----------------------------------------
   LIVE CHAT
------------------------------------------ */
function liveMessageCounter(vendorId) {
  const q = query(collection(db, "chats"), where("vendorId","==",vendorId));

  onSnapshot(q, (snap) => {
    let unread = 0;

    snap.forEach(doc => {
      const c = doc.data();
      if (c.lastSender === "customer" && c.seenByVendor === false)
        unread++;
    });

    document.getElementById("messagesBtn").innerText =
      unread > 0 ? `Messages (${unread})` : "Messages";
  });
}

/* -----------------------------------------
   CHAT DRAWER
------------------------------------------ */
function openChatDrawer() {
  loadChatList();
  document.getElementById("vdChatDrawer").style.right = "0px";
}

document.getElementById("vdChatClose").onclick = () => {
  document.getElementById("vdChatDrawer").style.right = "-360px";
};

async function loadChatList() {
  const box = document.getElementById("vdChatList");
  box.innerHTML = "Loading...";

  const q = query(collection(db,"chats"), where("vendorId","==",CURRENT_VENDOR_ID));
  const snap = await getDocs(q);

  box.innerHTML = "";

  snap.forEach(docx => {
    const C = docx.data();

    box.innerHTML += `
      <div style="
        padding:12px;
        border-bottom:1px solid #222;
        cursor:pointer;">
        <p><strong>${C.customerId}</strong></p>
        <p>${C.lastMessage}</p>
      </div>
    `;
  });
}

/* -----------------------------------------
   LOAD EARNINGS SUMMARY
------------------------------------------ */
async function loadEarnings(vendorId) {
  const qSnap = await getDocs(
    query(collection(db, "bookings"), where("vendorId", "==", vendorId))
  );

  let total = 0;
  let pending = 0;
  let paid = 0;
  let adjust = 0;
  let lastPayout = "--";

  qSnap.forEach((b) => {
    const d = b.data();
    const amt = Number(d.amount);

    if (d.paymentStatus === "paid") total += amt;

    if (d.vendorPayoutAdjustment) adjust += Number(d.vendorPayoutAdjustment);

    if (d.payoutStage && d.vendorPayoutAmount) {
      paid += Number(d.vendorPayoutAmount);
      lastPayout = new Date(d.vendorPayoutAt?.seconds * 1000).toDateString();
    } else {
      if (d.paymentStatus === "paid") pending += amt;
    }
  });

  document.getElementById("earnTotal").innerText = "₹" + total.toLocaleString();
  document.getElementById("earnPending").innerText = "₹" + pending.toLocaleString();
  document.getElementById("earnPaid").innerText = "₹" + paid.toLocaleString();
  document.getElementById("earnAdjust").innerText = adjust.toLocaleString();
  document.getElementById("lastPayout").innerText = lastPayout;
}

/* -----------------------------------------
   LOAD PAYOUT HISTORY
------------------------------------------ */
async function loadPayoutHistory(vendorId) {
  const snap = await getDocs(
    query(collection(db,"bookings"), where("vendorId","==",vendorId))
  );

  const box = document.getElementById("vdPayoutHistory");
  box.innerHTML = "";

  snap.forEach((b) => {
    const d = b.data();

    if (!d.payoutStage) return; // skip bookings with no payout

    box.innerHTML += `
      <div style="
        padding:12px;
        margin-bottom:10px;
        border-bottom:1px solid rgba(255,210,74,0.2);
      ">
        <p><strong>Booking:</strong> ${b.id}</p>
        <p><strong>Payout Stage:</strong> ${d.payoutStage}%</p>
        <p><strong>Base Amount:</strong> ₹${d.amount}</p>
        <p><strong>Payout Released:</strong> ₹${d.vendorPayoutAmount}</p>
        <p><strong>Adjustment:</strong> ${d.vendorPayoutAdjustment || 0}</p>
        <p><strong>Date:</strong> ${
          d.vendorPayoutAt
            ? new Date(d.vendorPayoutAt.seconds * 1000).toLocaleString()
            : "--"
        }</p>
      </div>
    `;
  });

  if (box.innerHTML.trim() === "") {
    box.innerHTML = "<p style='color:gray;'>No payouts released yet.</p>";
  }
}
