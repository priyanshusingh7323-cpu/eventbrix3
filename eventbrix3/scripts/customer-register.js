// updated customer-register.js
import { 
  auth, db, googleProvider, appleProvider,
  RecaptchaVerifier, signInWithPhoneNumber,
  signInWithPopup 
} from "../scripts/firebase.js";
import { doc, setDoc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import { signOut } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

signOut(auth);

let confirmationResult;
window.recaptchaVerifier = new RecaptchaVerifier(auth,"recaptcha-container",{size:"invisible"});
await window.recaptchaVerifier.render();

document.getElementById("otpSignupBtn").onclick = async () => {
  const phone=document.getElementById("phone").value;
  if(!phone) return alert("Enter phone number!");
  const full="+91"+phone;
  confirmationResult=await signInWithPhoneNumber(auth,full,window.recaptchaVerifier);
  document.getElementById("otpBox").style.display="block";
  alert("OTP sent!");
};

document.getElementById("verifyOtpBtn").onclick = async () => {
  const otp=document.getElementById("otpInput").value;
  const result=await confirmationResult.confirm(otp);
  const user=result.user;
  await setDoc(doc(db,"customers",user.uid),{
    uid:user.uid,
    name:document.getElementById("name").value,
    email:document.getElementById("email").value,
    phone:"+91"+document.getElementById("phone").value,
    city:document.getElementById("city").value,
    createdAt:Date.now()
  });
  location.href="../customer/customer-dashboard.html";
};
