/* ======================================
   ORIGINAL IMPORTS
====================================== */
import { db, auth } from "/scripts/firebase.js";
import {
  doc,
  getDoc,
  collection,
  getDocs,
  setDoc,
  addDoc,
  query,
  where,
  updateDoc,
  onSnapshot,
  orderBy
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

/* ======================================
   GET VENDOR ID
====================================== */
const params = new URLSearchParams(window.location.search);
const vendorId = params.get("id");

/* ======================================
   LOAD PROFILE
====================================== */
async function loadVendorProfile() {
  const vendorDoc = await getDoc(doc(db, "vendors", vendorId));
  if (!vendorDoc.exists()) return;

  const vendorData = vendorDoc.data();
  const listings = await getDocs(collection(db, "vendors", vendorId, "listings"));
  const L = listings.docs[0].data();

  loadSlider(L.photos || []);

  document.getElementById("vendorName").innerText = L.businessName;
  document.getElementById("drawerVendorName").innerText = L.businessName;

  document.getElementById("vendorCategory").innerText =
    `${L.category} → ${L.subcategory}`;

  document.getElementById("vendorCity").innerText = L.city;
  document.getElementById("vendorPrice").innerText = `₹${L.price}`;
  document.getElementById("vendorAbout").innerText = L.about;

  loadSuggested(vendorData.mainCategory);
}
loadVendorProfile();

/* ======================================
   SLIDER
====================================== */
let slideIndex = 0;
function loadSlider(images) {
  const box = document.getElementById("sliderImages");
  box.innerHTML = "";
  if (!images.length) images = ["/images/default.jpg"];

  images.forEach(img => box.innerHTML += `<img src="${img}">`);

  document.getElementById("nextSlide").onclick = () => nextSlide(images.length);
  document.getElementById("prevSlide").onclick = () => prevSlide(images.length);
}
function nextSlide(t){ slideIndex=(slideIndex+1)%t; updateSlider(); }
function prevSlide(t){ slideIndex=(slideIndex-1+t)%t; updateSlider(); }
function updateSlider(){
  document.getElementById("sliderImages").style.transform =
    `translateX(-${slideIndex * 100}%)`;
}

/* ======================================
   SUGGESTED VENDORS
====================================== */
async function loadSuggested(mainCategory) {
  if (!mainCategory) return;

  const q = query(
    collection(db, "vendors"),
    where("status", "==", "approved"),
    where("mainCategory", "==", mainCategory)
  );

  const snap = await getDocs(q);
  const box = document.getElementById("suggestedVendors");
  box.innerHTML = "";

  for (const docx of snap.docs) {
    if (docx.id === vendorId) continue;

    const vendorData = docx.data();
    const listSnap = await getDocs(collection(db, "vendors", docx.id, "listings"));
    const L = listSnap.docs[0].data();

    const img = L.photos?.[0] || "/images/default.jpg";

    box.innerHTML += `
      <div class="suggest-card"
        onclick="location.href='vendor-profile.html?id=${docx.id}'">
        <img src="${img}">
        <h4>${vendorData.businessName}</h4>
        <p>${L.city}</p>
        <p>₹${L.price}</p>
      </div>`;
  }
}

/* ======================================
   SAVE
====================================== */
document.getElementById("saveVendorBtn").onclick = async () => {
  const user = auth.currentUser;
  if (!user) return alert("Login first!");

  await setDoc(doc(db, "customers", user.uid, "wishlist", vendorId), {
    vendorId,
    savedAt: Date.now()
  });

  alert("Saved ❤️");
};

/* ======================================
   BOOKING POPUP
====================================== */
const popup = document.getElementById("bookingPopup");
const overlay = document.getElementById("popupOverlay");
const thankBox = document.getElementById("thankYouBox");

document.getElementById("bookNowBtn").onclick = () => {
  popup.style.display = "block";
  overlay.style.display = "block";
};

document.getElementById("closePopupBtn").onclick = () => {
  popup.style.display = "none";
  overlay.style.display = "none";
};

document.getElementById("submitBookingBtn").onclick = async () => {
  const data = {
    vendorId,
    customerName: cName.value,
    phone: cPhone.value,
    eventDate: cDate.value,
    eventCity: cCity.value,
    venueLocation: cVenue.value,
    guestCount: cGuests.value,
    message: cMsg.value,
    createdAt: Date.now(),
    status: "pending"
  };

  if (!data.customerName || !data.phone) return alert("Required!");

  await addDoc(collection(db, "adminRequests"), data);
  popup.style.display = "none";
  overlay.style.display = "none";

  thankBox.style.display = "block";
  setTimeout(() => thankBox.style.display = "none", 2000);
};

/* ======================================================
   CHAT DRAWER (FULL PREMIUM WITH TYPING, SEEN, TIME)
====================================================== */

const drawer = document.getElementById("chatDrawer");
const chatBtn = document.getElementById("chatBtn");
const drawerClose = document.getElementById("chatCloseBtn");
const drawerInput = document.getElementById("drawerMsgInput");
const drawerSend = document.getElementById("drawerSendBtn");
const drawerMessages = document.getElementById("drawerMessages");
const typingStatus = document.getElementById("typingStatus");

let drawerChatId = null;
let typingTimeout = null;

/* OPEN */
chatBtn.onclick = () => {
  drawer.style.right = "0";
  startDrawerChat();
};

/* CLOSE */
drawerClose.onclick = () => {
  drawer.style.right = "-360px";
};

/* FETCH OR CREATE CHAT */
async function startDrawerChat() {
  auth.onAuthStateChanged(async (user) => {
    if (!user) return alert("Login required!");

    const q = query(
      collection(db, "chats"),
      where("customerId", "==", user.uid),
      where("vendorId", "==", vendorId)
    );

    const snap = await getDocs(q);

    if (!snap.empty) {
      drawerChatId = snap.docs[0].id;
    } else {
      const c = await addDoc(collection(db, "chats"), {
        customerId: user.uid,
        vendorId,
        lastMessage: "",
        lastMsgTime: Date.now(),
        lastSender: "",
        vendorTyping: false,
        customerTyping: false
      });
      drawerChatId = c.id;
      await updateDoc(doc(db, "chats", drawerChatId), { chatId: drawerChatId });
    }

    listenMessages();
    listenTyping();
    listenSeen();
  });
}

/* REALTIME MESSAGES */
function listenMessages() {
  const q = query(
    collection(db, "chats", drawerChatId, "messages"),
    orderBy("timestamp", "asc")
  );

  onSnapshot(q, (snap) => {
    drawerMessages.innerHTML = "";
    snap.forEach((d) => {
      const m = d.data();
      const time = new Date(m.timestamp).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit"
      });

      drawerMessages.innerHTML += `
        <div class="${m.sender === "customer" ? "myMsg" : "theirMsg"}">
          ${m.text}
          <div class="time">
            ${time}
            ${
              m.sender === "customer"
                ? `<span class="tick ${m.seenByVendor ? "seen" : ""}">
                    ${m.seenByVendor ? "✓✓" : "✓"}
                   </span>`
                : ""
            }
          </div>
        </div>
      `;
    });

    drawerMessages.scrollTop = drawerMessages.scrollHeight;
  });
}

/* SEND MESSAGE */
drawerSend.onclick = async () => {
  const text = drawerInput.value.trim();
  if (!text) return;

  drawerInput.value = "";

  await addDoc(collection(db, "chats", drawerChatId, "messages"), {
    sender: "customer",
    text,
    timestamp: Date.now(),
    seenByCustomer: true,
    seenByVendor: false
  });

  await updateDoc(doc(db, "chats", drawerChatId), {
    lastMessage: text,
    lastMsgTime: Date.now(),
    lastSender: "customer",
    customerTyping: false
  });
};

/* TYPING INDICATOR */
drawerInput.addEventListener("input", async () => {
  const user = auth.currentUser;
  if (!user) return;

  await updateDoc(doc(db, "chats", drawerChatId), {
    customerTyping: true
  });

  clearTimeout(typingTimeout);
  typingTimeout = setTimeout(async () => {
    await updateDoc(doc(db, "chats", drawerChatId), {
      customerTyping: false
    });
  }, 2000);
});

function listenTyping() {
  onSnapshot(doc(db, "chats", drawerChatId), (d) => {
    const data = d.data();
    if (!data) return;

    if (data.vendorTyping) {
      typingStatus.style.display = "inline";
    } else {
      typingStatus.style.display = "none";
    }
  });
}

/* SEEN SYSTEM */
function listenSeen() {
  onSnapshot(
    query(
      collection(db, "chats", drawerChatId, "messages"),
      orderBy("timestamp", "asc")
    ),
    async (snap) => {
      snap.forEach(async (m) => {
        const msg = m.data();
        if (msg.sender === "vendor" && !msg.seenByCustomer) {
          await updateDoc(
            doc(db, "chats", drawerChatId, "messages", m.id),
            { seenByCustomer: true }
          );
        }
      });
    }
  );
}
