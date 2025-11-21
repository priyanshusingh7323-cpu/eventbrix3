try {

  // UPDATE MAIN VENDOR PROFILE DOCUMENT
  await setDoc(doc(db, "vendors", vendorId), {
    businessName,
    ownerName,
    city,
    mainCategory: category,
    subcategory,
    price,
    perPlate,
    services,
    about,
    serviceArea,
    experience,
    teamSize,
    photos: uploadedImages,
    status: "pending",
    updatedAt: Date.now()
  }, { merge: true });

  // ALSO SAVE LISTING
  await setDoc(
    doc(db, "vendors", vendorId, "listings", category),
    listingData
  );

  alert("Listing submitted for approval!");
  location.href = "vendor-dashboard.html";

} catch (err) {
  alert(err.message);
}
