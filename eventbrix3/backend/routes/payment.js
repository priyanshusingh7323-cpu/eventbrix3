const express = require("express");
const router = express.Router();
const razorpay = require("../config/razorpay");
const crypto = require("crypto");

// CREATE ORDER
router.post("/payment/create-order", async (req, res) => {
  try {
    const { amount } = req.body;

    const order = await razorpay.orders.create({
      amount: amount * 100, // paise me convert
      currency: "INR",
      receipt: "receipt_" + Date.now()
    });

    res.json({ success: true, order });
  } catch (err) {
    res.json({ success: false, error: err.message });
  }
});

// VERIFY PAYMENT
router.post("/payment/verify", async (req, res) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

  const sign = razorpay_order_id + "|" + razorpay_payment_id;

  const expected = crypto
    .createHmac("sha256", razorpay.key_secret)
    .update(sign)
    .digest("hex");

  if (expected === razorpay_signature) {
    res.json({ success: true, message: "Payment Verified" });
  } else {
    res.json({ success: false, message: "Verification Failed" });
  }
});

module.exports = router;
