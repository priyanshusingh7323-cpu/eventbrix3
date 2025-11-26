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
      eventType,
      message,
      venueLocation,   // NEW
      guests           // NEW
    } = req.body;

    // Basic validation
    if (!vendorId || !customerId || !amount || !eventDate) {
      return res.json({ success: false, error: "Missing required fields" });
    }

    // Save booking
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
      venueLocation: venueLocation || "",
      guests: guests || "",
      status: "pending",
      paymentStatus: "unpaid",
      createdAt: Date.now()
    });

    res.json({
      success: true,
      bookingId: ref.id
    });

  } catch (err) {
    console.error("BOOKING ERROR:", err);
    res.json({ success: false, error: err.message });
  }
});

module.exports = router;
