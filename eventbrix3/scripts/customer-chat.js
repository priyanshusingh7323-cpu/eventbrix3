import { auth, db } from "/scripts/firebase.js";
import {
  doc, setDoc, addDoc, collection, getDocs,
  onSnapshot, query, where, orderBy, updateDoc
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

const params = new URLSearchParams(window.location.search);
const vendorId = params.get("vendor");

let chatId = null;
const box = document.getElementById("messagesBox");

// AUTH
auth.onAuthStateChanged(async (user) => {
  if (!user) return location.href = "customer-login.html";

  await getOrCreateChat(user.uid);
  listenMessages();
});

async function getOrCreateChat(uid) {
  const qSnap = await getDocs(
    query(collection(db,"chats"),
    where("customerId","==", uid),
    where("vendorId","==", vendorId))
  );

  if (!qSnap.empty) { chatId = qSnap.docs[0].id; return; }

  const newChat = await addDoc(collection(db,"chats"),{
    customerId: uid,
    vendorId,
    lastMessage: "",
    lastMsgTime: Date.now(),
    lastSender: ""
  });

  chatId = newChat.id;

  await updateDoc(doc(db,"chats",chatId),{chatId});
}

document.getElementById("sendBtn").addEventListener("click", sendMsg);

async function sendMsg() {
  const text = document.getElementById("msgInput").value.trim();
  if (!text) return;

  document.getElementById("msgInput").value = "";

  await addDoc(collection(db,"chats",chatId,"messages"),{
    sender:"customer",
    text,
    timestamp:Date.now(),
    seenByVendor:false,
    seenByCustomer:true
  });

  await updateDoc(doc(db,"chats",chatId),{
    lastMessage:text,
    lastMsgTime:Date.now(),
    lastSender:"customer"
  });
}

function listenMessages() {
  const q = query(collection(db,"chats",chatId,"messages"), orderBy("timestamp","asc"));

  onSnapshot(q, snap => {
    box.innerHTML = "";
    snap.forEach(d => {
      const m = d.data();
      box.innerHTML += `
        <div class="${m.sender==="customer" ? "myMsg" : "theirMsg"}">
          ${m.text}
        </div>`;
    });

    box.scrollTop = box.scrollHeight;
  });
}
