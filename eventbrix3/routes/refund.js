const express = require("express");
const router = express.Router();
const admin = require("../config/firebaseAdmin");
const Razorpay = require("razorpay");

// Razorpay instance (same keys as payment.js)
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET
});

/* =====================================================
      PROCESS REFUND (Triggered by Customer or Admin)
   ===================================================== */
router.post("/process", async (req, res) => {
  try {
    const { bookingId, reason } = req.body;

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
      return res.json({ success: false, error: "Already refunded" });
    }

    if (d.paymentStatus !== "paid") {
      return res.json({
        success: false,
        error: "Payment not completed. Cannot refund."
      });
    }

    if (!d.paymentTimestamp) {
      return res.json({
        success: false,
        error: "Missing payment timestamp"
      });
    }

    if (!d.paymentId) {
      return res.json({
        success: false,
        error: "Missing paymentId for Razorpay refund"
      });
    }

    /* ===========================
        CALCULATE REFUND SLAB
       =========================== */
    const now = Date.now();
    const hrs =
      (now - Number(d.paymentTimestamp)) / (1000 * 60 * 60);

    const amount = Number(d.amount);
    const gatewayFee = amount * 0.02; // 2% Razorpay fee
    let refundAmount = 0;
    let vendorFee = 0;

    if (hrs <= 24) {
      refundAmount = amount;
      vendorFee = 0;
    } else if (hrs <= 48) {
      refundAmount = amount * 0.5 - gatewayFee;
      vendorFee = amount * 0.02;
    } else if (hrs <= 168) {
      refundAmount = amount * 0.2 - gatewayFee;
      vendorFee = amount * 0.02;
    } else {
      refundAmount = 0;
      vendorFee = 0;
    }

    if (refundAmount < 0) refundAmount = 0;

    const payoutAdjustment = vendorFee ? -vendorFee : 0;

    /* ===========================
       RAZORPAY REAL REFUND CALL
       =========================== */
    let razorRefund = null;

    if (refundAmount > 0) {
      razorRefund = await razorpay.payments.refund(d.paymentId, {
        amount: Math.round(refundAmount * 100), // ₹ → paise
      });
    }

    /* ===========================
        FIRESTORE UPDATE
       =========================== */
    await ref.update({
      status: "refunded",
      refundAmount,
      platformFee: vendorFee,
      vendorPayoutAdjustment: payoutAdjustment,
      refundedAt: admin.firestore.FieldValue.serverTimestamp(),
      refundReason: reason || "No reason provided",
      refundLog: {
        hrsPassed: Number(hrs.toFixed(2)),
        refundAmount,
        vendorFee,
        gatewayFee,
        razorRefundId: razorRefund?.id || null,
      },
    });

    return res.json({
      success: true,
      refundAmount,
      razorRefundId: razorRefund?.id || null,
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
