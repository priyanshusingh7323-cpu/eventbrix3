const Razorpay = require("razorpay");

let razorpay;

try {
  razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
  });

  console.log("✔ Razorpay initialized with ENV keys");
} catch (err) {
  console.error("❌ Razorpay Initialization Error:", err.message);
}

module.exports = razorpay;
