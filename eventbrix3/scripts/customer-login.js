// updated customer-login.js
import { auth, db, googleProvider, RecaptchaVerifier, signInWithPhoneNumber, signInWithPopup } 
  from "../scripts/firebase.js";
import { doc, getDoc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import { signOut } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

signOut(auth);

let loginConfirmation;
window.recaptchaLoginVerifier=new RecaptchaVerifier(auth,"recaptcha-login-container",{size:"invisible"});
await window.recaptchaLoginVerifier.render();

async function verifyCustomer(){
  const ref=doc(db,"customers",auth.currentUser.uid);
  const snap=await getDoc(ref);
  if(!snap.exists()){ alert("Account not found!"); await signOut(auth); return false; }
  return true;
}

document.getElementById("otpLoginBtn").onclick=async()=>{
  const phone="+91"+prompt("Enter phone");
  loginConfirmation=await signInWithPhoneNumber(auth,phone,window.recaptchaLoginVerifier);
  document.getElementById("otpLoginBox").style.display="block";
};

document.getElementById("verifyOtpLoginBtn").onclick=async()=>{
  await loginConfirmation.confirm(document.getElementById("otpLoginInput").value);
  if(await verifyCustomer()) location.href="../customer/customer-dashboard.html";
};

document.getElementById("googleLoginBtn").onclick=async()=>{
  await signInWithPopup(auth,googleProvider);
  if(await verifyCustomer()) location.href="../customer/customer-dashboard.html";
};
