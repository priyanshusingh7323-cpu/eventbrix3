const express = require("express");
const router = express.Router();
const admin = require("../config/firebaseAdmin");
const PDFDocument = require("pdfkit");

/* ==========================================
   DOWNLOAD RECEIPT (PDF)
   URL → /api/receipt/download/:bookingId
========================================== */
router.get("/download/:bookingId", async (req, res) => {
  try {
    const bookingId = req.params.bookingId;

    if (!bookingId) {
      return res.status(400).send("Invalid Booking ID");
    }

    const db = admin.firestore();
    const snap = await db.collection("bookings").doc(bookingId).get();

    if (!snap.exists) {
      return res.status(404).send("Booking not found");
    }

    const d = snap.data();

    // Payment must exist
    if (d.paymentStatus !== "paid") {
      return res
        .status(400)
        .send("Receipt available only after payment is completed.");
    }

    // Prepare PDF
    const doc = new PDFDocument({
      size: "A4",
      margin: 40,
    });

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `inline; filename=EventBrix-Receipt-${bookingId}.pdf`
    );

    doc.pipe(res);

    /* ============================
       HEADER (Premium Gold Theme)
    ============================ */
    doc
      .fillColor("#D4A017")
      .fontSize(28)
      .text("EventBrix", { align: "center" });

    doc.moveDown(0.5);
    doc
      .fillColor("#ffffff")
      .fontSize(14)
      .text("Booking Payment Receipt", { align: "center" });

    doc.moveDown(1.5);

    /* ============================
       RECEIPT INFO
    ============================ */
    doc.fontSize(12).fillColor("white");

    doc.text(`Receipt ID: ${bookingId}`);
    doc.text(`Customer: ${d.customerName || ""}`);
    doc.text(`Vendor: ${d.vendorName || ""}`);
    doc.text(`Event Date: ${d.eventDate}`);
    doc.text(`Event City: ${d.eventCity}`);
    doc.text(`Venue: ${d.venueLocation || "-"}`);
    doc.text(`Guests: ${d.guests || "-"}`);

    doc.moveDown(1);

    /* ============================
       PAYMENT INFO (Gold Theme)
    ============================ */
    doc
      .fontSize(16)
      .fillColor("#D4A017")
      .text("Payment Details", { underline: true });

    doc.moveDown(0.7);

    doc.fontSize(12).fillColor("white");
    doc.text(`Amount Paid: ₹${d.amount}`);
    doc.text(`Payment ID: ${d.paymentId}`);
    doc.text(`Order ID: ${d.orderId}`);
    doc.text(
      `Paid At: ${new Date(d.paymentTimestamp).toLocaleString("en-IN")}`
    );

    doc.moveDown(1);

    /* ============================
       REFUND POLICY
    ============================ */
    doc
      .fontSize(16)
      .fillColor("#D4A017")
      .text("Refund Policy", { underline: true });

    doc.moveDown(0.7);

    doc
      .fontSize(12)
      .fillColor("white")
      .text("✔ 0–24 hours: Full refund")
      .text("✔ 24–48 hours: 50% refund (minus gateway fee)")
      .text("✔ 48 hrs – 7 days: 20% refund (minus gateway fee)")
      .text("✔ 7 days+: No refund");

    doc.moveDown(1.5);

    /* ============================
       FOOTER
    ============================ */
    doc
      .fillColor("#D4A017")
      .fontSize(12)
      .text("Thank you for choosing EventBrix ❤️", { align: "center" });

    doc.end();
  } catch (err) {
    console.error("RECEIPT ERROR:", err);
    return res.status(500).send("Server Error");
  }
});

module.exports = router;
