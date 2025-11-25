const express = require("express");
const cors = require("cors");
require("dotenv").config();

const app = express();
app.use(express.json());
app.use(cors());

// ROUTES
app.use("/api/booking", require("./routes/booking"));
app.use("/api/payment", require("./routes/payment"));
app.use("/api/refund", require("./routes/refund"));
app.use("/api/payout", require("./routes/payout"));

app.get("/", (req, res) => {
  res.send("EventBrix Backend Running Successfully!");
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log("Backend Live on Port:", PORT));
