const express = require("express");
const router = express.Router();
const razorpay = require("../config/razorpay");
const crypto = require("crypto");
const admin = require("../config/firebaseAdmin");

// =====================================
//   CREATE ORDER
// =====================================
router.post("/create-order", async (req, res) => {
  try {
    const { amount } = req.body;

    if (!amount) {
      return res.json({ success: false, error: "Amount missing" });
    }

    // Fix: remove commas from price like "15,000"
    const finalAmount = parseInt(amount.toString().replace(/,/g, ""));
    if (isNaN(finalAmount)) {
      return res.json({ success: false, error: "Invalid amount" });
    }

    if (!razorpay) {
      return res.json({
        success: false,
        error: "Razorpay configuration failed",
      });
    }

    const order = await razorpay.orders.create({
      amount: finalAmount * 100, // convert to paise
      currency: "INR",
      receipt: "EBX_" + Date.now(),
    });

    return res.json({ success: true, order });
  } catch (err) {
    console.error("ORDER ERROR:", err);
    return res.json({ success: false, error: err.message });
  }
});

// =====================================
//   VERIFY PAYMENT
// =====================================
router.post("/verify", async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      bookingId,
    } = req.body;

    // Safety validation
    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.json({
        success: false,
        error: "Missing payment fields",
      });
    }

    if (!bookingId) {
      return res.json({
        success: false,
        error: "BookingId missing",
      });
    }

    const body = `${razorpay_order_id}|${razorpay_payment_id}`;

    // Using your hardcoded secret
    const expectedSignature = crypto
      .createHmac("sha256", "jSMZLXdOax7nxW4r0a6T1Dcl")
      .update(body)
      .digest("hex");

    if (expectedSignature !== razorpay_signature) {
      console.log("SIGNATURE EXPECTED:", expectedSignature);
      console.log("SIGNATURE RECEIVED:", razorpay_signature);

      return res.json({
        success: false,
        error: "Signature mismatch",
      });
    }

    // Update Firestore
    const db = admin.firestore();

    await db.collection("bookings").doc(bookingId).update({
      paymentStatus: "paid",
      paymentId: razorpay_payment_id,
      orderId: razorpay_order_id,
      signature: razorpay_signature,
      paymentTimestamp: Date.now(), // important for refund slabs
      paymentVerifiedAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    return res.json({
      success: true,
      message: "Payment Verified Successfully",
    });
  } catch (err) {
    console.error("VERIFY ERROR:", err);
    return res.json({ success: false, error: err.message });
  }
});

module.exports = router;
