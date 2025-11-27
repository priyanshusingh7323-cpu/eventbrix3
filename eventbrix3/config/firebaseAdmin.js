const admin = require("firebase-admin");
const path = require("path");

// Secret file ka correct absolute path on Render
const serviceAccountPath = path.resolve("/etc/secrets/service-account-key.json");

// Load JSON key
const serviceAccount = require(serviceAccountPath);

// Initialize Firebase Admin
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

// Export admin instance
module.exports = admin;
