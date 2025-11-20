import { auth, db } from "/scripts/firebase.js";
import {
  createUserWithEmailAndPassword
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

import {
  doc, setDoc
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

document.getElementById("customerRegisterForm")
.addEventListener("submit", async (e) => {
  e.preventDefault();

  const name = e.target.name.value;
  const email = e.target.email.value;
  const phone = e.target.phone.value;
  const city = e.target.city.value;
  const password = e.target.password.value;

  try {
    const userCred = await createUserWithEmailAndPassword(auth, email, password);

    await setDoc(doc(db, "customers", userCred.user.uid), {
      uid: userCred.user.uid,
      name,
      email,
      phone,
      city,
      createdAt: Date.now(),
    });

    alert("Account created!");
    location.href = "/customer/customer-dashboard.html";
  }
  catch (err) {
    alert(err.message);
  }
});
