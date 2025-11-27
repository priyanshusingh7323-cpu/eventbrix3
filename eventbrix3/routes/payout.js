const express = require("express");
const router = express.Router();
const admin = require("../config/firebaseAdmin");

// ================================
// PROCESS PAYOUT (Admin Controlled)
// ================================
router.post("/process", async (req, res) => {
  try {
    const { bookingId, stage } = req.body;

    // Safe validation
    if (!bookingId || stage === undefined || stage === null) {
      return res.json({
        success: false,
        error: "Missing bookingId or stage value",
      });
    }

    // Stage must be 50, 80, or 100
    const allowedStages = [50, 80, 100];
    if (!allowedStages.includes(Number(stage))) {
      return res.json({
        success: false,
        error: "Invalid payout stage. Allowed: 50, 80, 100",
      });
    }

    const db = admin.firestore();
    const ref = db.collection("bookings").doc(bookingId);
    const snap = await ref.get();

    if (!snap.exists) {
      return res.json({
        success: false,
        error: "Booking not found",
      });
    }

    const d = snap.data();

    // Payment check
    if (d.paymentStatus !== "paid") {
      return res.json({
        success: false,
        error: "Payment not completed. Cannot payout.",
      });
    }

    // Prevent payout after refund
    if (d.status === "refunded") {
      return res.json({
        success: false,
        error: "Booking already refunded. Cannot payout.",
      });
    }

    const amount = Number(d.amount);

    // FIX: vendorPayoutAdjustment safe conversion
    const adjustment = Number(d.vendorPayoutAdjustment || 0);

    // FIX: safe payout calculation
    let payoutAmount = Math.round(amount * (stage / 100) + adjustment);

    // No negative payout
    if (payoutAmount < 0) payoutAmount = 0;

    // Update Firestore
    await ref.update({
      payoutStage: Number(stage),
      vendorPayoutAmount: payoutAmount,
      vendorPayoutAt: admin.firestore.FieldValue.serverTimestamp(),

      payoutLog: {
        stage: Number(stage),
        baseAmount: amount,
        adjustment,
        finalPayout: payoutAmount,
        timestamp: Date.now(),
      },
    });

    return res.json({
      success: true,
      payoutAmount,
    });
  } catch (err) {
    console.error("PAYOUT ERROR:", err);
    return res.json({
      success: false,
      error: err.message,
    });
  }
});

module.exports = router;
