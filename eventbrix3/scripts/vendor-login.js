// updated vendor-login.js
import { auth, db } from "/scripts/firebase.js";
import { signInWithEmailAndPassword, RecaptchaVerifier, signInWithPhoneNumber } 
from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { collection, query, where, getDocs } 
from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import { signOut } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

signOut(auth);

function formatPhone(num){
  num=num.trim();
  if(num.startsWith("+91")) return num;
  if(num.startsWith("91")) return "+"+num;
  return "+91"+num;
}

document.getElementById("vendorLoginForm").addEventListener("submit",async(e)=>{
  e.preventDefault();
  const user=(await signInWithEmailAndPassword(auth,e.target.email.value,e.target.password.value)).user;
  const snap=await getDocs(query(collection(db,"vendors"),where("uid","==",user.uid)));
  if(snap.empty) return alert("Vendor not found");
  const V=snap.docs[0].data();
  location.href = V.status==="incomplete"?"vendor-register.html":"vendor-dashboard.html";
});

let confirmationResult;
window.recaptchaVerifier=new RecaptchaVerifier(auth,"sendOtpBtn",{size:"invisible"});

document.getElementById("sendOtpBtn").onclick=async()=>{
  let phone=formatPhone(document.getElementById("phoneLogin").value);
  confirmationResult=await signInWithPhoneNumber(auth,phone,window.recaptchaVerifier);
  document.getElementById("otpInput").style.display="block";
  document.getElementById("verifyOtpBtn").style.display="block";
};

document.getElementById("verifyOtpBtn").onclick=async()=>{
  const result=await confirmationResult.confirm(document.getElementById("otpInput").value);
  const user=result.user;
  const snap=await getDocs(query(collection(db,"vendors"),where("phone","==",user.phoneNumber)));
  if(snap.empty) return alert("Vendor not found");
  const V=snap.docs[0].data();
  location.href = V.status==="incomplete"?"vendor-register.html":"vendor-dashboard.html";
};
