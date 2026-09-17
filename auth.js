import { initializeApp } from 'https://www.gstatic.com/firebasejs/12.3.0/firebase-app.js';
import { getAuth, GoogleAuthProvider, signInWithPopup, RecaptchaVerifier, signInWithPhoneNumber, signInWithEmailAndPassword, sendPasswordResetEmail } from 'https://www.gstatic.com/firebasejs/12.3.0/firebase-auth.js';
import { getFirestore, doc, getDoc } from 'https://www.gstatic.com/firebasejs/12.3.0/firebase-firestore.js';

const config = window.CROPULSE_FIREBASE_CONFIG || {};
const valid = config.apiKey && config.apiKey !== 'REPLACE_ME';
const message = document.getElementById('authMessage');
function show(msg, error = true) { message.textContent = msg; message.style.color = error ? '#ff8580' : '#86e589'; }
function goDashboard() { window.location.href = 'overview.html'; }

if (!valid) { show('Firebase is not configured.'); } else {
  const app = initializeApp(config);
  const auth = getAuth(app);
  const db = getFirestore(app);
  auth.languageCode = 'en';
  const provider = new GoogleAuthProvider();
  const phoneBox = document.getElementById('phoneBox'), otpBox = document.getElementById('otpBox'), phoneInput = document.getElementById('phone'), country = document.getElementById('country'), otpInput = document.getElementById('otp'), emailInput = document.getElementById('email'), passwordInput = document.getElementById('password');
  let confirmationResult = null;
  let verifier = new RecaptchaVerifier(auth, 'recaptcha-container', { size: 'invisible' });
  const resetRecaptcha = () => { try { verifier.clear(); } catch (_) {} verifier = new RecaptchaVerifier(auth, 'recaptcha-container', { size: 'invisible' }); };
  const fullPhone = () => { const raw = phoneInput.value.trim(); if (raw.startsWith('+')) return raw; return country.value + raw.replace(/\D/g, ''); };

  document.getElementById('sendOtp').addEventListener('click', async () => {
    const phone = fullPhone(); if (!/^\+[1-9]\d{7,14}$/.test(phone)) { show('Enter a valid phone number with country code.'); return; }
    const btn = document.getElementById('sendOtp');
    try { btn.disabled = true; show('Sending verification code…', false); confirmationResult = await signInWithPhoneNumber(auth, phone, verifier); phoneBox.hidden = true; otpBox.hidden = false; otpBox.classList.add('show'); otpInput.focus(); show('OTP sent. Check your phone.', false); }
    catch (e) { console.error('Login OTP error:', e); btn.disabled = false; show(e.code === 'auth/operation-not-allowed' ? 'Phone sign-in is not enabled in Firebase Console.' : e.code === 'auth/too-many-requests' ? 'Too many OTP requests. Please wait and try again later.' : e.code === 'auth/quota-exceeded' ? 'SMS quota exceeded. Please try again later.' : e.code === 'auth/invalid-phone-number' ? 'Enter a valid mobile number with country code.' : (e.message || 'Unable to send OTP.')); resetRecaptcha(); }
  });
  document.getElementById('verifyOtp').addEventListener('click', async () => { if (!confirmationResult) { show('Request an OTP first.'); return; } const code = otpInput.value.trim(); if (!/^\d{6}$/.test(code)) { show('Enter the 6-digit OTP.'); return; } try { show('Verifying…', false); await confirmationResult.confirm(code); goDashboard(); } catch (e) { show(e.code === 'auth/code-expired' ? 'This OTP has expired. Request a new one.' : 'Invalid OTP. Please check the code and try again.'); } });
  document.getElementById('changeNumber').addEventListener('click', e => { e.preventDefault(); phoneBox.hidden = false; otpBox.hidden = true; otpBox.classList.remove('show'); otpInput.value = ''; document.getElementById('sendOtp').disabled = false; confirmationResult = null; show(''); resetRecaptcha(); });
  document.getElementById('googleBtn').addEventListener('click', async () => { try { show('Opening Google sign-in…', false); await signInWithPopup(auth, provider); goDashboard(); } catch (e) { console.error('Google sign-in error:', e); show(e.code === 'auth/popup-blocked' ? 'Allow popups for Google sign-in.' : e.code === 'auth/popup-closed-by-user' ? 'Google sign-in was cancelled.' : (e.message || 'Google sign-in failed.')); } });
  async function resolveEmail(identifier) { const value = identifier.trim(); if (value.includes('@')) return value; const usernameSnap = await getDoc(doc(db, 'usernames', value.toLowerCase())); if (!usernameSnap.exists()) return null; return usernameSnap.data().email || null; }
  document.getElementById('emailSignIn').addEventListener('click', async () => { const identifier = emailInput.value.trim(), password = passwordInput.value; if (!identifier || !password) { show('Enter your email/username and password.'); return; } try { show('Signing in…', false); const email = await resolveEmail(identifier); if (!email) { show('No account was found for that email or username.'); return; } await signInWithEmailAndPassword(auth, email, password); goDashboard(); } catch (e) { console.error('Email sign-in error:', e); show(e.code === 'auth/operation-not-allowed' ? 'Email/password sign-in is not enabled in Firebase Authentication.' : e.code === 'auth/invalid-credential' ? 'Incorrect email/username or password.' : (e.message || 'Unable to sign in.')); } });
  const resetModal = document.getElementById('resetModal'), resetEmail = document.getElementById('resetEmail'), resetMessage = document.getElementById('resetMessage');
  function openReset() { resetModal.hidden = false; resetEmail.value = emailInput.value.includes('@') ? emailInput.value.trim() : ''; resetMessage.textContent = ''; resetMessage.className = 'reset-message'; setTimeout(() => resetEmail.focus(), 0); }
  function closeReset() { resetModal.hidden = true; }
  document.getElementById('forgotPassword').addEventListener('click', e => { e.preventDefault(); openReset(); });
  document.getElementById('closeReset').addEventListener('click', closeReset); resetModal.addEventListener('click', e => { if (e.target === resetModal) closeReset(); });
  document.getElementById('sendReset').addEventListener('click', async () => { const email = resetEmail.value.trim(); if (!/^\S+@\S+\.\S+$/.test(email)) { resetMessage.textContent = 'Enter a valid email address.'; resetMessage.className = 'reset-message error'; return; } const btn = document.getElementById('sendReset'); try { btn.disabled = true; resetMessage.textContent = 'Sending reset link…'; resetMessage.className = 'reset-message'; await sendPasswordResetEmail(auth, email, { url: `${window.location.origin}/login.html`, handleCodeInApp: false }); resetMessage.textContent = 'Reset link sent. Check your inbox and spam folder.'; resetMessage.className = 'reset-message success'; } catch (e) { console.error('Password reset error:', e); resetMessage.textContent = e.code === 'auth/operation-not-allowed' ? 'Email/password authentication is disabled. Enable Email/Password in Firebase Authentication.' : e.code === 'auth/invalid-email' ? 'That email address is invalid.' : e.code === 'auth/unauthorized-continue-uri' ? 'Add thecroppulse.in to Firebase Authentication → Authorized domains.' : e.code === 'auth/network-request-failed' ? 'Network error. Check your connection and try again.' : (e.message || 'Unable to send the reset email.'); resetMessage.className = 'reset-message error'; } finally { btn.disabled = false; } });
}
