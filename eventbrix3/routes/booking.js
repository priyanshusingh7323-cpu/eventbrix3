const express = require("express");
const router = express.Router();
const admin = require("../config/firebaseAdmin");

router.post("/create", async (req, res) => {
  try {
    const db = admin.firestore();

    const {
      vendorId,
      vendorName,
      customerId,
      customerName,
      amount,
      eventDate,
      eventCity,
      message,
      eventType
    } = req.body;

    const ref = await db.collection("bookings").add({
      vendorId,
      vendorName,
      customerId,
      customerName,
      amount,
      eventDate,
      eventCity,
      eventType,
      message,
      status: "pending",
      paymentStatus: "unpaid",
      createdAt: Date.now()
    });

    res.json({ success: true, bookingId: ref.id });
  } catch (err) {
    res.json({ success: false, error: err.message });
  }
});

module.exports = router;
