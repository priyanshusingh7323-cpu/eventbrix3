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
    // VALIDATION
    // ----------------------------
    if (!vendorId || !customerId || !amount || !eventDate) {
      return res.json({
        success: false,
        error: "Missing required fields",
      });
    }

    // customer name must exist
    if (!customerName || customerName.trim().length < 1) {
      return res.json({
        success: false,
        error: "Customer name is required",
      });
    }

    // Fix: amount must be number
    const finalAmount = Number(String(amount).replace(/,/g, ""));
    if (isNaN(finalAmount) || finalAmount <= 0) {
      return res.json({
        success: false,
        error: "Invalid amount value",
      });
    }

    // Safe event type
    const safeEventType = eventType || "General";

    // ----------------------------
    // SAVE BOOKING IN FIRESTORE
    // ----------------------------
    const ref = await db.collection("bookings").add({
      vendorId,
      vendorName: vendorName || "Unknown Vendor",

      customerId,
      customerName: customerName.trim(),

      phone: phone || "",
      amount: finalAmount,   // numeric amount FIXED
      eventDate,
      eventCity: eventCity || "",
      eventType: safeEventType,
      message: message || "",
      venueLocation: venueLocation || "",
      guests: guests || "",

      status: "pending",
      paymentStatus: "unpaid",

      createdAt: admin.firestore.FieldValue.serverTimestamp(),

      // Debug log
      systemLog: {
        createdAt: Date.now(),
        createdFrom: "Vendor Profile → Booking Popup",
      },
    });

    // ----------------------------
    // RESPONSE
    // ----------------------------
    return res.json({
      success: true,
      bookingId: ref.id,
    });

  } catch (err) {
    console.error("BOOKING ERROR:", err);
    return res.json({
      success: false,
      error: err.message,
    });
  }
});

module.exports = router;
