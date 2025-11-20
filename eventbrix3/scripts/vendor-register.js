<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Vendor Register</title>
  <link rel="stylesheet" href="../styles.css">
</head>
<body>

<div class="form-box">
  <h2>Complete Vendor Profile</h2>

  <form id="vendorRegisterForm">

    <input type="text" name="businessName" placeholder="Business Name *" required />

    <input type="text" name="city" placeholder="City *" required />

    <input type="text" name="category" placeholder="Category *" required />

    <input type="text" name="subcategory" placeholder="Sub Category *" required />

    <input type="number" name="price" placeholder="Starting Price *" required />

    <textarea name="about" placeholder="About your service *" required></textarea>

    <button type="submit">Submit</button>
  </form>

</div>

<script type="module" src="../scripts/vendor-register.js"></script>
</body>
</html>
