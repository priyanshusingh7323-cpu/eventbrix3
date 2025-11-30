import { auth, db } from "/scripts/firebase.js";
import {
  doc,
  setDoc
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

/* CLOUDINARY */
const CLOUD_NAME = "dbxt5tgze";
const UPLOAD_PRESET = "eventbrix_uploads";

async function uploadToCloudinary(file) {
  const fd = new FormData();
  fd.append("file", file);
  fd.append("upload_preset", UPLOAD_PRESET);

  const res = await fetch(
    `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/auto/upload`,
    { method: "POST", body: fd }
  );

  const data = await res.json();
  return data.secure_url;
}

/* MAIN */
auth.onAuthStateChanged(async (user) => {
  if (!user) return location.href = "vendor-login.html";

  document.getElementById("kycForm").onsubmit = async (e) => {
    e.preventDefault();

    const regDoc = document.getElementById("regDoc").files[0];
    const addressDoc = document.getElementById("addressDoc").files[0];
    const selfieDoc = document.getElementById("selfieDoc").files[0];

    if (!regDoc || !addressDoc || !selfieDoc) {
      return alert("Please upload all required documents.");
    }

    const regURL = await uploadToCloudinary(regDoc);
    const addrURL = await uploadToCloudinary(addressDoc);
    const selfieURL = await uploadToCloudinary(selfieDoc);

    const kycData = {
      aadhaar: e.target.aadhaar.value,
      pan: e.target.pan.value,
      gst: e.target.gst.value || "",
      bankAccount: e.target.bankAccount.value,
      ifsc: e.target.ifsc.value,
      bankName: e.target.bankName.value,

      regDoc: regURL,
      addressProof: addrURL,
      selfie: selfieURL,

      status: "submitted",
      submittedAt: Date.now()
    };

    const vendorId = "VEN-" + user.uid;

    await setDoc(doc(db, "vendors", vendorId, "kyc", "details"), kycData);

    await setDoc(
      doc(db, "vendors", vendorId),
      { kycStatus: "submitted" },
      { merge: true }
    );

    alert("KYC Submitted Successfully!");
    location.href = "vendor-dashboard.html";
  };
});
