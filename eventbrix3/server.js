const express = require("express");
const cors = require("cors");
require("dotenv").config();

const app = express();

// =========================
// CORS (STABLE CONFIG)
// =========================
app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// =========================
// JSON PARSER (SAFE LIMIT)
// =========================
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

// =========================
// ROUTES
// =========================
try {
  app.use("/api/booking", require("./routes/booking"));
  app.use("/api/payment", require("./routes/payment"));
  app.use("/api/refund", require("./routes/refund"));
  app.use("/api/payout", require("./routes/payout"));
  app.use("/api/receipt", require("./routes/receipt"));

} catch (err) {
  console.error("❌ Route Loading Error:", err.message);
}

// =========================
// BASE URL TEST
// =========================
app.get("/", (req, res) => {
  res.send("EventBrix Backend Running Successfully!");
});

// =========================
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Backend Live on Port: ${PORT}`);
});
