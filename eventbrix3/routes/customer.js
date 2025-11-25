const express = require("express");
const router = express.Router();
const admin = require("../config/firebaseAdmin");


// CUSTOMER REGISTER
router.post("/customer/register", async (req, res) => {
  const { name, email, password, phone } = req.body;

  try {
    // Firebase Auth → create user
    const userRecord = await admin.auth().createUser({
      email: email,
      password: password,
      displayName: name,
    });

    // Firestore store (optional – if you want)
    const db = admin.firestore();
    await db.collection("customers").doc(userRecord.uid).set({
      uid: userRecord.uid,
      name,
      email,
      phone,
      createdAt: Date.now(),
    });

    res.json({
      success: true,
      message: "Customer Registered Successfully",
      uid: userRecord.uid,
    });

  } catch (error) {
    res.json({ success: false, error: error.message });
  }
});


module.exports = router;
// CUSTOMER LOGIN
router.post("/customer/login", async (req, res) => {
  const { email } = req.body;

  try {
    const user = await admin.auth().getUserByEmail(email);

    res.json({
      success: true,
      uid: user.uid,
      email: user.email,
      name: user.displayName,
    });

  } catch (error) {
    res.json({ success: false, error: error.message });
  }
});
