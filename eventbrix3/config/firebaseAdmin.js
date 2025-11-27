const admin = require("firebase-admin");
const path = require("path");

// ALWAYS load from Render secret files folder
const serviceAccountPath = "/etc/secrets/service-account-key.json";

const serviceAccount = require(serviceAccountPath);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

module.exports = admin;
