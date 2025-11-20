// OPEN POPUP
document.getElementById("openEventPopup").onclick = () =>
  document.getElementById("eventPopup").style.display = "flex";

document.getElementById("openEventPopup2").onclick = () =>
  document.getElementById("eventPopup").style.display = "flex";

// CLOSE POPUP
document.getElementById("closePopup").onclick = () =>
  document.getElementById("eventPopup").style.display = "none";

// SUBMIT FORM → SEND EMAIL
document.getElementById("eventForm").addEventListener("submit", function (e) {
  e.preventDefault();

  const name = document.getElementById("custName").value;
  const phone = document.getElementById("custPhone").value;
  const service = document.getElementById("custService").value;
  const desc = document.getElementById("custDesc").value;

  const mailBody =
    `New Booking Request:%0A%0A` +
    `Name: ${name}%0A` +
    `Phone: ${phone}%0A` +
    `Service: ${service}%0A` +
    `Description: ${desc}%0A`;

  // SEND EMAIL
  window.location.href =
    `mailto:priyanshusingh7323@gmail.com?subject=New Event Booking&body=${mailBody}`;

  alert("Request sent successfully!");
  document.getElementById("eventPopup").style.display = "none";
  this.reset();
});
