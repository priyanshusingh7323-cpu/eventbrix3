const express = require("express");
const router = express.Router();
const admin = require("../config/firebaseAdmin");

router.post("/", async (req, res) => {
  try {
    const { bookingId, stage } = req.body;

    const db = admin.firestore();
    const ref = db.collection("bookings").doc(bookingId);
    const snap = await ref.get();

    if (!snap.exists) return res.json({ success: false, message: "Booking not found" });

    const d = snap.data();
    const amount = d.amount;

    if (d.paymentStatus !== "paid")
      return res.json({ success: false, message: "Customer not paid yet" });

    let adjustment = d.vendorPayoutAdjustment || 0;

    const payoutAmount = Math.round(amount * (stage / 100) + adjustment);

    await ref.update({
      payoutStage: stage,
      vendorPayoutAmount: payoutAmount,
      vendorPayoutAt: Date.now()
    });

    res.json({ success: true, payoutAmount });
  } catch (err) {
    res.json({ success: false, error: err.message });
  }
});

module.exports = router;
