import { db } from "./firebase.js";

const BASE_URL = "https://eventbrix3.onrender.com";

/* ================================
   PROCESS PAYOUT (ADMIN)
================================ */
export async function releasePayout(bookingId, stage) {
  try {
    const res = await fetch(`${BASE_URL}/api/payout`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ bookingId, stage }),
    });

    const data = await res.json();
    if (!data.success) return alert("Payout Failed: " + data.message);

    alert(`Payout Released: ₹${data.payoutAmount}`);
    location.reload();
  } catch (err) {
    alert("Payout Error");
  }
}
