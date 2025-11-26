import { db } from "./firebase.js";
import {
  doc,
  updateDoc,
  getDoc,
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

const BASE_URL = "https://eventbrix3.onrender.com";

/* ================================
   PROCESS REFUND (ADMIN)
================================ */
export async function processRefund(bookingId) {
  try {
    const res = await fetch(`${BASE_URL}/api/refund/process`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ bookingId }),
    });

    const data = await res.json();

    if (!data.success) {
      return alert("Refund Failed: " + (data.error || "Unknown Error"));
    }

    alert("Refund Processed Successfully: ₹" + data.refundAmount);
    location.reload();

  } catch (err) {
    console.error(err);
    alert("Refund Failed: Server Error");
  }
}
