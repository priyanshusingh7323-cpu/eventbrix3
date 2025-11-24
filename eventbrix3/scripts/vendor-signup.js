// updated vendor-signup.js
import { auth, db } from "/scripts/firebase.js";
import { RecaptchaVerifier, signInWithPhoneNumber, createUserWithEmailAndPassword } 
from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { doc, setDoc } 
from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import { signOut } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { getNextVendorId } from "/scripts/vendor-id.js";

signOut(auth);

function formatPhone(n){
  n=n.trim();
  if(n.startsWith("+91")) return n;
  if(n.startsWith("91")) return "+"+n;
  return "+91"+n;
}

window.recaptchaVerifier=new RecaptchaVerifier(auth,"sendOtpBtn",{size:"invisible"});
let confirmationResult;

document.getElementById("sendOtpBtn").onclick=async()=>{
  let phone=formatPhone(document.getElementById("phone").value);
  confirmationResult=await signInWithPhoneNumber(auth,phone,window.recaptchaVerifier);
  document.getElementById("otpCode").style.display="block";
  document.getElementById("verifyOtpBtn").style.display="block";
};

document.getElementById("verifyOtpBtn").onclick=async()=>{
  await confirmationResult.confirm(document.getElementById("otpCode").value);
  document.getElementById("email").style.display="block";
  document.getElementById("password").style.display="block";
  document.getElementById("createAccountBtn").style.display="block";
};

document.getElementById("vendorSignupForm").addEventListener("submit",async(e)=>{
  e.preventDefault();
  const userCred=await createUserWithEmailAndPassword(auth,e.target.email.value,e.target.password.value);
  const vendorId=await getNextVendorId();
  await setDoc(doc(db,"vendors",vendorId),{
    vendorId,
    uid:userCred.user.uid,
    name:e.target.name.value,
    email:e.target.email.value,
    phone:formatPhone(document.getElementById("phone").value),
    createdAt:Date.now(),
    status:"incomplete"
  });
  location.href="vendor-register.html";
});
