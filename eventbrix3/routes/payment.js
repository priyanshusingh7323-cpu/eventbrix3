const express = require("express");
const router = express.Router();
const razorpay = require("../config/razorpay");
const crypto = require("crypto");
const admin = require("../config/firebaseAdmin");

// ============================
//   CREATE ORDER
// ============================
router.post("/create-order", async (req, res) => {
  try {
    const { amount } = req.body;

    if (!amount) {
      return res.json({ success: false, error: "Amount missing" });
    }

    const order = await razorpay.orders.create({
      amount: amount * 100,
      currency: "INR",
      receipt: "EBX_" + Date.now(),
    });

    res.json({ success: true, order });

  } catch (err) {
    console.error("ORDER ERROR:", err);
    res.json({ success: false, error: err.message });
  }
});

// ============================
//   VERIFY PAYMENT
// ============================
router.post("/verify", async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      bookingId,
    } = req.body;

    if (!bookingId) {
      return res.json({ success: false, error: "BookingId missing" });
    }

    const body = razorpay_order_id + "|" + razorpay_payment_id;

    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)   // FIXED
      .update(body)
      .digest("hex");

    if (expectedSignature !== razorpay_signature) {
      return res.json({ success: false, error: "Signature mismatch" });
    }

    // SAVE PAYMENT STATUS
    const db = admin.firestore();

    await db.collection("bookings").doc(bookingId).update({
      paymentStatus: "paid",
      paymentId: razorpay_payment_id,
      orderId: razorpay_order_id,
      signature: razorpay_signature,
      paymentVerifiedAt: admin.firestore.FieldValue.serverTimestamp(), // FIXED
    });

    res.json({ success: true, message: "Payment Verified" });

  } catch (err) {
    console.error("VERIFY ERROR:", err);
    res.json({ success: false, error: err.message });
  }
});

module.exports = router;
