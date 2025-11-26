const express = require("express");
const router = express.Router();
const admin = require("../config/firebaseAdmin");

// ================================
//  PROCESS REFUND
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
    const amount = d.amount;

    if (!d.paymentTimestamp) {
      return res.json({ success: false, error: "Payment not found" });
    }

    // Time difference in hours
    const hrs = (Date.now() - d.paymentTimestamp) / (1000 * 60 * 60);

    let refundAmount = 0;
    let vendorFee = 0;
    const gatewayFee = amount * 0.02;

    // ===============================
    // REFUND LOGIC (Same as yours)
    // ===============================
    if (hrs <= 24) {
      refundAmount = amount;
      vendorFee = 0;
    } 
    else if (hrs <= 48) {
      refundAmount = amount * 0.5 - gatewayFee;
      vendorFee = amount * 0.02;
    } 
    else if (hrs <= 168) {
      refundAmount = amount * 0.2 - gatewayFee;
      vendorFee = amount * 0.02;
    } 
    else {
      refundAmount = 0;
      vendorFee = 0;
    }

    if (refundAmount < 0) refundAmount = 0;

    // UPDATE FIRESTORE
    await ref.update({
      status: "refunded",
      refundAmount,
      platformFee: vendorFee,
      vendorPayoutAdjustment: -vendorFee,
      refundedAt: admin.firestore.FieldValue.serverTimestamp()
    });

    return res.json({
      success: true,
      refundAmount
    });

  } catch (err) {
    console.error("REFUND ERROR:", err);
    return res.json({
      success: false,
      error: err.message
    });
  }
});

module.exports = router;
