import { db, auth } from "./firebase.js";
import {
  collection,
  addDoc,
  query,
  orderBy,
  onSnapshot,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// Get Vendor ID from URL
const params = new URLSearchParams(window.location.search);
const vendorId = params.get("vendor");

// Logged-in customer
let customer = auth.currentUser;

auth.onAuthStateChanged(u => {
  if (!u) {
    alert("Please login first!");
    window.location.href = "/customer/customer-login.html";
    return;
  }
  customer = u;
  startChat();
});

function startChat() {
  loadMessages();
  document.getElementById("sendBtn").addEventListener("click", sendMessage);
}

function loadMessages() {
  const msgBox = document.getElementById("messages");

  const q = query(
    collection(db, "chats", `${customer.uid}_${vendorId}`, "messages"),
    orderBy("time")
  );

  onSnapshot(q, snap => {
    msgBox.innerHTML = "";
    snap.forEach(doc => {
      const d = doc.data();
      msgBox.innerHTML += `
        <p class="msg ${d.from === customer.uid ? 'me' : 'them'}">
          ${d.text}
        </p>
      `;
    });

    msgBox.scrollTop = msgBox.scrollHeight;
  });
}

async function sendMessage() {
  const input = document.getElementById("msgInput");
  const text = input.value.trim();

  if (!text) return;

  await addDoc(collection(db, "chats", `${customer.uid}_${vendorId}`, "messages"), {
    text,
    from: customer.uid,
    vendor: vendorId,
    customer: customer.uid,
    time: serverTimestamp()
  });

  input.value = "";
}
