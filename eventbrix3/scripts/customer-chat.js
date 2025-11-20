import { auth, db } from "/scripts/firebase.js";
import {
  doc,
  getDoc,
  addDoc,
  collection,
  query,
  orderBy,
  onSnapshot,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

let customerId = null;
let vendorId = null;
let chatId = null;

// ----------------------------
// AUTH CHECK
// ----------------------------
auth.onAuthStateChanged(async (user) => {
  if (!user) {
    alert("Please Login First");
    location.href = "/customer/customer-login.html";
    return;
  }

  customerId = user.uid;  // unique customer ID

  // vendorID from URL
  const params = new URLSearchParams(window.location.search);
  vendorId = params.get("vendor");

  if (!vendorId) {
    alert("Vendor ID Missing");
    return;
  }

  chatId = `${customerId}_${vendorId}`;
  document.getElementById("chatIdBox").innerText = chatId;

  loadMessages();
});


// ----------------------------
// LOAD MESSAGES (REALTIME)
// ----------------------------
function loadMessages() {
  const msgRef = collection(db, "chats", chatId, "messages");
  const q = query(msgRef, orderBy("time", "asc"));

  onSnapshot(q, (snap) => {
    const box = document.getElementById("chatMessages");
    box.innerHTML = "";

    snap.forEach((m) => {
      const data = m.data();
      const side = data.sender === customerId ? "me" : "other";

      box.innerHTML += `
        <div class="msg ${side}">
          ${data.text}
        </div>
      `;
    });

    box.scrollTop = box.scrollHeight;
  });
}


// ----------------------------
// SEND MESSAGE
// ----------------------------
document.getElementById("sendBtn").onclick = async () => {
  const input = document.getElementById("msgInput");
  const text = input.value.trim();

  if (!text) return;

  await addDoc(collection(db, "chats", chatId, "messages"), {
    text,
    sender: customerId,
    receiver: vendorId,
    time: serverTimestamp()
  });

  input.value = "";
};
