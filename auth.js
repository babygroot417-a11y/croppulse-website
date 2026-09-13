import { initializeApp } from 'https://www.gstatic.com/firebasejs/12.3.0/firebase-app.js';
import { getAuth, GoogleAuthProvider, signInWithPopup, RecaptchaVerifier, signInWithPhoneNumber, onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/12.3.0/firebase-auth.js';

const config=window.CROPULSE_FIREBASE_CONFIG||{};
const valid=config.apiKey && config.apiKey!=="REPLACE_ME";
const message=document.getElementById('authMessage');
const phoneBox=document.getElementById('phoneBox');
const otpBox=document.getElementById('otpBox');
const phoneInput=document.getElementById('phone');
const otpInput=document.getElementById('otp');
let confirmationResult=null; let verifier=null;
function show(msg,error=true){message.textContent=msg;message.style.color=error?'#ff8580':'#86e589';}
function goDashboard(){window.location.href='index.html';}
if(!valid){show('Firebase is not configured yet. Add your Firebase Web App config to firebase-config.js.');}
else{
 const app=initializeApp(config); const auth=getAuth(app); const provider=new GoogleAuthProvider();
 window.recaptchaVerifier=new RecaptchaVerifier(auth,'recaptcha-container',{size:'invisible'});
 document.getElementById('sendOtp').addEventListener('click',async()=>{
  const phone=phoneInput.value.trim(); if(!/^\+[1-9]\d{7,14}$/.test(phone)){show('Enter the full number with country code, e.g. +919876543210.');return;}
  try{show('Sending verification code…',false); document.getElementById('sendOtp').disabled=true; confirmationResult=await signInWithPhoneNumber(auth,phone,window.recaptchaVerifier); phoneBox.style.display='none';otpBox.style.display='block';show('OTP sent to your phone.',false);}
  catch(e){show(e.message||'Unable to send OTP.');document.getElementById('sendOtp').disabled=false;try{window.recaptchaVerifier.clear();window.recaptchaVerifier=new RecaptchaVerifier(auth,'recaptcha-container',{size:'invisible'});}catch(_){} }
 });
 document.getElementById('verifyOtp').addEventListener('click',async()=>{if(!confirmationResult){show('Request an OTP first.');return;}const code=otpInput.value.trim();if(!/^\d{6}$/.test(code)){show('Enter the 6-digit OTP.');return;}try{show('Verifying…',false);await confirmationResult.confirm(code);goDashboard();}catch(e){show('Invalid or expired OTP. Please try again.');}});
 document.getElementById('changeNumber').addEventListener('click',()=>{phoneBox.style.display='block';otpBox.style.display='none';show('');document.getElementById('sendOtp').disabled=false;});
 document.getElementById('googleBtn').addEventListener('click',async()=>{try{show('Opening Google sign-in…',false);await signInWithPopup(auth,provider);goDashboard();}catch(e){show(e.message||'Google sign-in failed.');}});
 onAuthStateChanged(auth,user=>{if(user && location.pathname.endsWith('login.html')){/* stay on page until redirect */}});
}
