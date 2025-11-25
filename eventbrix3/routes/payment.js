const express = require("express");
const router = express.Router();
const razorpay = require("../config/razorpay");
const crypto = require("crypto");
const admin = require("../config/firebaseAdmin");

// CREATE ORDER
router.post("/create-order", async (req, res) => {
  try {
    const { amount } = req.body;

    const order = await razorpay.orders.create({
      amount: amount * 100,
      currency: "INR",
      receipt: "EBX_" + Date.now(),
    });

    res.json({ success: true, order });
  } catch (err) {
    res.json({ success: false, error: err.message });
  }
});

// VERIFY PAYMENT
router.post("/verify", async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      bookingId
    } = req.body;

    const sign = razorpay_order_id + "|" + razorpay_payment_id;

    const expected = crypto
      .createHmac("sha256", process.env.RZP_KEY_SECRET)
      .update(sign)
      .digest("hex");

    if (expected !== razorpay_signature) {
      return res.json({ success: false, message: "Signature mismatch" });
    }

    // SAVE PAYMENT STATUS IN FIRESTORE
    const db = admin.firestore();
    await db.collection("bookings").doc(bookingId).update({
      paymentStatus: "paid",
      paymentInfo: req.body,
      paymentTimestamp: Date.now(),
    });

    res.json({ success: true, message: "Payment Verified" });
  } catch (err) {
    res.json({ success: false, error: err.message });
  }
});

module.exports = router;
