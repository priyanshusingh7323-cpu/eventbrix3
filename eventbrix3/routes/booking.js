const express = require("express");
const router = express.Router();
const admin = require("../config/firebaseAdmin");

// ================================
// CREATE BOOKING (POST)
// ================================
router.post("/create", async (req, res) => {
  try {
    const db = admin.firestore();

    const {
      vendorId,
      vendorName,
      customerId,
      customerName,
      phone,
      amount,
      eventDate,
      eventCity,
      eventType,
      message,
      venueLocation,
      guests
    } = req.body;

    // ----------------------------
    // VALIDATION (basic)
    // ----------------------------
    if (!vendorId || !customerId || !amount || !eventDate) {
      return res.json({
        success: false,
        error: "Missing required fields"
      });
    }

    // ----------------------------
    // SAVE BOOKING IN FIRESTORE
    // ----------------------------
    const ref = await db.collection("bookings").add({
      vendorId,
      vendorName,
      customerId,
      customerName,
      phone: phone || "",
      amount,
      eventDate,
      eventCity,
      eventType,
      message: message || "",
      venueLocation: venueLocation || "",
      guests: guests || "",
      
      status: "pending",
      paymentStatus: "unpaid",

      createdAt: admin.firestore.FieldValue.serverTimestamp()
    });

    // ----------------------------
    // RESPONSE
    // ----------------------------
    return res.json({
      success: true,
      bookingId: ref.id
    });

  } catch (err) {
    console.error("BOOKING ERROR:", err);
    return res.json({
      success: false,
      error: err.message
    });
  }
});

module.exports = router;
