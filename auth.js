import { initializeApp } from 'https://www.gstatic.com/firebasejs/12.3.0/firebase-app.js';
import { getAuth, GoogleAuthProvider, signInWithPopup, RecaptchaVerifier, signInWithPhoneNumber, signInWithEmailAndPassword, sendPasswordResetEmail } from 'https://www.gstatic.com/firebasejs/12.3.0/firebase-auth.js';

const config=window.CROPULSE_FIREBASE_CONFIG||{};
const valid=config.apiKey && config.apiKey!=="REPLACE_ME";
const message=document.getElementById('authMessage');
const phoneBox=document.getElementById('phoneBox');
const otpBox=document.getElementById('otpBox');
const phoneInput=document.getElementById('phone');
const country=document.getElementById('country');
const otpInput=document.getElementById('otp');
function show(msg,error=true){message.textContent=msg;message.style.color=error?'#ff8580':'#86e589';}
function goDashboard(){window.location.href='index.html';}
if(!valid){show('Firebase is not configured.');}
else{
 const app=initializeApp(config); const auth=getAuth(app); const provider=new GoogleAuthProvider();
 let confirmationResult=null;
 let verifier=new RecaptchaVerifier(auth,'recaptcha-container',{size:'invisible'});
 const fullPhone=()=>{let p=phoneInput.value.trim().replace(/\D/g,''); if(phoneInput.value.trim().startsWith('+')) return phoneInput.value.trim(); return country.value+p;};
 document.getElementById('sendOtp').addEventListener('click',async()=>{
   const phone=fullPhone();
   if(!/^\+[1-9]\d{7,14}$/.test(phone)){show('Enter a valid phone number with country code.');return;}
   try{show('Sending verification code…',false); const btn=document.getElementById('sendOtp');btn.disabled=true; confirmationResult=await signInWithPhoneNumber(auth,phone,verifier); phoneBox.hidden=true;otpBox.hidden=false;otpBox.classList.add('show');otpInput.focus();show('OTP sent. Check your phone.',false);}
   catch(e){otpBox.hidden=true;otpBox.classList.remove('show');phoneBox.hidden=false;show(e.code==='auth/operation-not-allowed'?'Phone sign-in is not enabled in Firebase Console.':(e.message||'Unable to send OTP.'));document.getElementById('sendOtp').disabled=false;try{verifier.clear();verifier=new RecaptchaVerifier(auth,'recaptcha-container',{size:'invisible'});}catch(_){} }
 });
 document.getElementById('verifyOtp').addEventListener('click',async()=>{if(!confirmationResult){show('Request an OTP first.');return;}const code=otpInput.value.trim();if(!/^\d{6}$/.test(code)){show('Enter the 6-digit OTP.');return;}try{show('Verifying…',false);await confirmationResult.confirm(code);goDashboard();}catch(e){show('Invalid or expired OTP. Please try again.');}});
 document.getElementById('changeNumber').addEventListener('click',e=>{e.preventDefault();phoneBox.hidden=false;otpBox.hidden=true;otpBox.classList.remove('show');otpInput.value='';document.getElementById('sendOtp').disabled=false;show('');});
 document.getElementById('googleBtn').addEventListener('click',async()=>{try{show('Opening Google sign-in…',false);await signInWithPopup(auth,provider);goDashboard();}catch(e){show(e.code==='auth/popup-blocked'?'Allow popups for Google sign-in.':(e.message||'Google sign-in failed.'));}});
 document.getElementById('emailSignIn').addEventListener('click',async()=>{const email=document.getElementById('email').value.trim();const password=document.getElementById('password').value;if(!email||!password){show('Enter your email and password.');return;}try{show('Signing in…',false);await signInWithEmailAndPassword(auth,email,password);goDashboard();}catch(e){show('Email or password is incorrect, or email sign-in is not enabled.');}});
 document.getElementById('forgotPassword').addEventListener('click',async e=>{e.preventDefault();const email=document.getElementById('email').value.trim();if(!email){show('Enter your email first, then click Forgot password.');return;}try{await sendPasswordResetEmail(auth,email);show('Password reset link sent. Check your email.',false);}catch(e){otpBox.hidden=true;otpBox.classList.remove('show');phoneBox.hidden=false;show(e.code==='auth/operation-not-allowed'?'Email/password sign-in is not enabled in Firebase Console.':(e.message||'Unable to send reset email.'));}});
}
