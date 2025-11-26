const express = require("express");
const cors = require("cors");
require("dotenv").config();

const app = express();

// FIXED CORS (Allow Vercel + localhost)
app.use(cors({
  origin: [
    "http://localhost:3000",
    "http://127.0.0.1:5500",
    "https://eventbrix3.vercel.app",
    "https://eventbrix3-jrjb.vercel.app"
  ]
}));

app.use(express.json());

// ROUTES (FIXED PATHS)
app.use("/api/bookings", require("./routes/booking"));   // <— FIXED (was /api/booking)
app.use("/api/payment", require("./routes/payment"));
app.use("/api/refund", require("./routes/refund"));
app.use("/api/payout", require("./routes/payout"));

// ROOT TEST ROUTE
app.get("/", (req, res) => {
  res.send("EventBrix Backend Running Successfully!");
});

// START SERVER
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log("Backend Live on Port:", PORT));
