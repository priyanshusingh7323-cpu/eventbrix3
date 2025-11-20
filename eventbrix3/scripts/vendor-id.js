import { db } from "/scripts/firebase.js";
import {
  collection,
  getDocs
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

export async function getNextVendorId() {
  const snap = await getDocs(collection(db, "vendors"));
  return "VEN-" + (snap.size + 1001);
}
