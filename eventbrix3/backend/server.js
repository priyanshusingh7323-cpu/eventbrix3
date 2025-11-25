const customerRoutes = require("./routes/customer");
const express = require("express");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

// Test backend
app.get("/", (req, res) => {
  res.send("Backend Running Successfully!");
});

app.listen(5000, () => {
  console.log("Backend started on port 5000");
});
app.use("/api", customerRoutes);
const paymentRoutes = require("./routes/payment");
app.use("/api", paymentRoutes);
