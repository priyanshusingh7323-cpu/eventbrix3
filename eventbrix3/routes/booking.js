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
      venueLocation,
      guests,
      phone        // NEW
    } = req.body;

    // Basic validation
    if (!vendorId || !customerId || !amount || !eventDate) {
      return res.json({ success: false, error: "Missing required fields" });
    }

    // Save booking in Firestore
    const ref = await db.collection("bookings").add({
      vendorId,
      vendorName,
      customerId,
      customerName,
      phone: phone || "",       // NEW
      amount,
      eventDate,
      eventCity,
      eventType,
      message,
      venueLocation: venueLocation || "",
      guests: guests || "",
      status: "pending",
      paymentStatus: "unpaid",
      createdAt: admin.firestore.FieldValue.serverTimestamp() // BETTER
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
