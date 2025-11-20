// Vendor ID Auto Increment System
import { db } from "/scripts/firebase.js";
import {
  doc,
  getDoc,
  setDoc
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// Yeh database me vendor ka counter rakhega:
// config/vendorCounter → { count: 1000 }

export async function getNextVendorId() {
  const counterRef = doc(db, "config", "vendorCounter");
  const snap = await getDoc(counterRef);

  let current = 1000;

  if (snap.exists()) {
    current = snap.data().count;
  }

  const next = current + 1;

  await setDoc(counterRef, { count: next });

  return `VEN-${next}`;
}
