const express = require("express");
const router = express.Router();
const admin = require("../config/firebaseAdmin");

// ================================
// PROCESS PAYOUT
// ================================
router.post("/process", async (req, res) => {
  try {
    const { bookingId, stage } = req.body;

    if (!bookingId || !stage) {
      return res.json({ success: false, error: "Missing bookingId or stage" });
    }

    const db = admin.firestore();
    const ref = db.collection("bookings").doc(bookingId);
    const snap = await ref.get();

    if (!snap.exists) {
      return res.json({ success: false, error: "Booking not found" });
    }

    const d = snap.data();

    // payment completed or not?
    if (d.paymentStatus !== "paid") {
      return res.json({
        success: false,
        error: "Customer has not completed payment yet"
      });
    }

    const amount = d.amount;
    let adjustment = d.vendorPayoutAdjustment || 0;

    // calculate payout
    const payoutAmount = Math.round(amount * (stage / 100) + adjustment);

    // update booking doc
    await ref.update({
      payoutStage: stage,
      vendorPayoutAmount: payoutAmount,
      vendorPayoutAt: admin.firestore.FieldValue.serverTimestamp()
    });

    return res.json({
      success: true,
      payoutAmount
    });

  } catch (err) {
    console.error("PAYOUT ERROR:", err);
    return res.json({ success: false, error: err.message });
  }
});

module.exports = router;
