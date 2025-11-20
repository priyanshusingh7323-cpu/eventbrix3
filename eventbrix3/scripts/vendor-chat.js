import { auth, db, onAuthStateChanged } from "../scripts/firebase.js";
import {
  collection, addDoc, query, orderBy, onSnapshot, serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

let vendor = null;

// CHECK LOGIN
onAuthStateChanged(auth, (u) => {
  if (!u) return (window.location.href = "vendor-login.html");
  vendor = u;
  loadMessages();
});

// LOAD CHAT WITH ALL CUSTOMERS WHO CHATTED
function loadMessages() {
  const msgBox = document.getElementById("messages");

  const chatIdPrefix = `${vendor.uid}_`;  // chats where vendor is second part

  const q = query(collection(db, "chats"), orderBy("time"));

  onSnapshot(q, (snap) => {
    msgBox.innerHTML = "";

    snap.forEach((c) => {
      if (!c.id.includes(chatIdPrefix)) return;

      const d = c.data();
      msgBox.innerHTML += `
        <p class="msg ${d.from === vendor.uid ? 'me' : 'them'}">
          ${d.text}
        </p>
      `;
    });

    msgBox.scrollTop = msgBox.scrollHeight;
  });
}

// SEND MESSAGE
document.getElementById("sendBtn").onclick = async () => {
  const input = document.getElementById("msgInput");
  const text = input.value.trim();
  if (!text) return;

  const chatId = `${vendor.uid}_${vendor.uid}`;  // vendor side same thread

  await addDoc(collection(db, "chats", chatId, "messages"), {
    text,
    from: vendor.uid,
    time: serverTimestamp()
  });

  input.value = "";
};
