const express = require("express");
const router = express.Router();
const admin = require("../config/firebaseAdmin");
const razorpay = require("../config/razorpay");

// REFUND PROCESS
router.post("/", async (req, res) => {
  try {
    const { bookingId } = req.body;

    const db = admin.firestore();
    const ref = db.collection("bookings").doc(bookingId);
    const snap = await ref.get();

    if (!snap.exists) return res.json({ success: false, message: "Booking not found" });

    const d = snap.data();
    const amount = d.amount;
    const payTime = d.paymentTimestamp;

    if (!payTime) return res.json({ success: false, message: "Payment not found" });

    const hrs = (Date.now() - payTime) / (1000 * 60 * 60);

    let refundAmount = 0;
    let vendorFee = 0;
    const gatewayFee = amount * 0.02;

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

    // UPDATE BOOKING
    await ref.update({
      status: "refunded",
      refundAmount,
      platformFee: vendorFee,
      vendorPayoutAdjustment: -vendorFee,
      refundedAt: Date.now()
    });

    res.json({ success: true, refundAmount });
  } catch (err) {
    res.json({ success: false, error: err.message });
  }
});

module.exports = router;
