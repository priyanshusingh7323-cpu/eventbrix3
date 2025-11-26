import { db } from "./firebase.js";

const BASE_URL = "https://eventbrix3.onrender.com";

/* ================================
   PROCESS PAYOUT (ADMIN)
================================ */
export async function processPayout(bookingId, stage) {
  try {
    const res = await fetch(`${BASE_URL}/api/payout/process`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ bookingId, stage }),
    });

    const data = await res.json();

    if (!data.success) {
      return alert("Payout Failed: " + (data.error || "Unknown Error"));
    }

    alert(`Payout Released Successfully: ₹${data.payoutAmount}`);
    location.reload();
    
  } catch (err) {
    console.error(err);
    alert("Payout Failed: Server Error");
  }
}
