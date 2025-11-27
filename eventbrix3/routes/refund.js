const express = require("express");
const router = express.Router();
const admin = require("../config/firebaseAdmin");

// ================================
//  PROCESS REFUND (Admin Only)
// ================================
router.post("/process", async (req, res) => {
  try {
    const { bookingId } = req.body;

    if (!bookingId) {
      return res.json({ success: false, error: "BookingId missing" });
    }

    const db = admin.firestore();
    const ref = db.collection("bookings").doc(bookingId);
    const snap = await ref.get();

    if (!snap.exists) {
      return res.json({ success: false, error: "Booking not found" });
    }

    const d = snap.data();

    // Already refunded protection
    if (d.status === "refunded") {
      return res.json({
        success: false,
        error: "Booking already refunded",
      });
    }

    // Payment status check
    if (d.paymentStatus !== "paid") {
      return res.json({
        success: false,
        error: "Payment not completed. Cannot refund.",
      });
    }

    // Payment timestamp check
    if (!d.paymentTimestamp) {
      return res.json({
        success: false,
        error: "Missing payment timestamp",
      });
    }

    const amount = d.amount;

    // Time difference in hours
    const hrs =
      (Date.now() - Number(d.paymentTimestamp)) / (1000 * 60 * 60);

    let refundAmount = 0;
    let vendorFee = 0;
    let gatewayFee = amount * 0.02; // 2% gateway fee

    // ===============================
    // REFUND SLAB LOGIC
    // ===============================
    if (hrs <= 24) {
      // Full refund, vendor pays nothing
      refundAmount = amount;
      vendorFee = 0;
    } else if (hrs <= 48) {
      // 50% refund - gateway fee, vendor pays 2%
      refundAmount = amount * 0.5 - gatewayFee;
      vendorFee = amount * 0.02;
    } else if (hrs <= 168) {
      // 20% refund - gateway fee, vendor pays 2%
      refundAmount = amount * 0.2 - gatewayFee;
      vendorFee = amount * 0.02;
    } else {
      // No refund
      refundAmount = 0;
      vendorFee = 0;
    }

    // Refund can't be negative
    if (refundAmount < 0) refundAmount = 0;

    // Vendor payout adjustment must be number
    const payoutAdjustment = vendorFee > 0 ? -vendorFee : 0;

    // ===============================
    // UPDATE FIRESTORE
    // ===============================
    await ref.update({
      status: "refunded",
      refundAmount,
      platformFee: vendorFee,
      vendorPayoutAdjustment: payoutAdjustment,
      refundedAt: admin.firestore.FieldValue.serverTimestamp(),

      // Keep a refund log under same document
      refundLog: {
        hrsPassed: Number(hrs.toFixed(2)),
        refundAmount,
        vendorFee,
        gatewayFee,
      },
    });

    return res.json({
      success: true,
      refundAmount,
      vendorFee,
    });
  } catch (err) {
    console.error("REFUND ERROR:", err);
    return res.json({
      success: false,
      error: err.message,
    });
  }
});

module.exports = router;
