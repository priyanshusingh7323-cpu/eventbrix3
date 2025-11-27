const Razorpay = require("razorpay");

let razorpay;

// ================================
//  RAZORPAY HARDCODED (Option A)
// ================================
try {
  razorpay = new Razorpay({
    key_id: "rzp_test_Rjy29zTH71OIkZ",        // SAME KEY
    key_secret: "jSMZLXdOax7nxW4r0a6T1Dcl",   // SAME SECRET
  });

  console.log("✔ Razorpay initialized successfully");
} catch (err) {
  console.error("❌ Razorpay Initialization Error:", err.message);
}

module.exports = razorpay;
