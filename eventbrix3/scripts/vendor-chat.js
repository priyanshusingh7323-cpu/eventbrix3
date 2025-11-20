import { auth, db } from "/scripts/firebase.js";
import {
  doc, getDocs, collection, query, where,
  onSnapshot, addDoc, updateDoc, orderBy
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

const params = new URLSearchParams(window.location.search);
const customerId = params.get("customer");
let chatId = null;

const box = document.getElementById("messagesBox");

auth.onAuthStateChanged(async (user) => {
  if (!user) return location.href = "vendor-login.html";

  const q = query(
    collection(db, "chats"),
    where("customerId", "==", customerId),
    where("vendorId", "==", user.uid)
  );

  const snap = await getDocs(q);
  chatId = snap.docs[0].id;

  listenMessages();
});

document.getElementById("sendBtn").onclick = sendMsg;

async function sendMsg() {
  const txt = document.getElementById("msgInput").value.trim();
  if (!txt) return;

  document.getElementById("msgInput").value = "";

  await addDoc(collection(db, "chats", chatId, "messages"), {
    sender: "vendor",
    text: txt,
    timestamp: Date.now(),
    seenByVendor: true,
    seenByCustomer: false
  });

  await updateDoc(doc(db, "chats", chatId), {
    lastMessage: txt,
    lastMsgTime: Date.now(),
    lastSender: "vendor"
  });
}

function listenMessages() {
  const q = query(
    collection(db, "chats", chatId, "messages"),
    orderBy("timestamp", "asc")
  );

  onSnapshot(q, (snap) => {
    box.innerHTML = "";

    snap.forEach((d) => {
      const m = d.data();
      box.innerHTML += `
        <div class="${m.sender === 'vendor' ? 'myMsg' : 'theirMsg'}">
          ${m.text}
        </div>
      `;
    });

    box.scrollTop = box.scrollHeight;
  });
}
