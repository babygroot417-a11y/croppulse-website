import { initializeApp } from 'https://www.gstatic.com/firebasejs/12.3.0/firebase-app.js';
import { getAuth, GoogleAuthProvider, signInWithPopup, createUserWithEmailAndPassword, RecaptchaVerifier, PhoneAuthProvider, linkWithCredential, updateProfile } from 'https://www.gstatic.com/firebasejs/12.3.0/firebase-auth.js';
import { getFirestore, doc, setDoc, getDoc } from 'https://www.gstatic.com/firebasejs/12.3.0/firebase-firestore.js';

const config = window.CROPULSE_FIREBASE_CONFIG || {};
const message = document.getElementById('signupMessage');
const valid = config.apiKey && config.apiKey !== 'REPLACE_ME';
const show = (msg, error=true) => { message.textContent = msg; message.style.color = error ? '#ff8580' : '#86e589'; };
const dashboard = () => window.location.href = 'index.html';

if (!valid) show('Firebase is not configured.');
else {
  const app = initializeApp(config);
  const auth = getAuth(app);
  const db = getFirestore(app);
  const provider = new GoogleAuthProvider();
  let verifier = new RecaptchaVerifier(auth, 'signupRecaptcha', { size: 'invisible' });
  let verificationId = null;

  const phoneValue = () => {
    const raw = document.getElementById('signupPhone').value.trim();
    return raw.startsWith('+') ? raw : document.getElementById('signupCountry').value + raw.replace(/\D/g,'');
  };

  document.getElementById('signupSendOtp').addEventListener('click', async () => {
    const username = document.getElementById('signupUsername').value.trim();
    const email = document.getElementById('signupEmail').value.trim();
    const password = document.getElementById('signupPassword').value;
    const phone = phoneValue();
    if (!/^[a-zA-Z0-9_.-]{3,30}$/.test(username)) return show('Username must be 3–30 characters: letters, numbers, _, ., or -.');
    if (!/^\S+@\S+\.\S+$/.test(email)) return show('Enter a valid email address.');
    if (password.length < 6) return show('Password must be at least 6 characters.');
    if (!/^\+[1-9]\d{7,14}$/.test(phone)) return show('Enter a valid mobile number.');
    if (!document.getElementById('terms').checked) return show('Please accept the Terms and Conditions.');
    try {
      show('Creating account and sending OTP…', false);
      const usernameRef = doc(db, 'usernames', username.toLowerCase());
      if ((await getDoc(usernameRef)).exists()) return show('That username is already taken.');
      const cred = await createUserWithEmailAndPassword(auth, email, password);
      await updateProfile(cred.user, { displayName: username });
      const providerPhone = new PhoneAuthProvider(auth);
      verificationId = await providerPhone.verifyPhoneNumber({ phoneNumber: phone, session: cred.user }, verifier);
      await setDoc(doc(db, 'users', cred.user.uid), { username, email, phone, termsAccepted: true, createdAt: new Date().toISOString() });
      await setDoc(usernameRef, { uid: cred.user.uid, email });
      document.getElementById('signupForm').hidden = true;
      document.getElementById('signupOtpBox').hidden = false;
      document.getElementById('signupOtpBox').classList.add('show');
      show('OTP sent. Enter it to verify your mobile.', false);
    } catch (e) {
      show(e.code === 'auth/email-already-in-use' ? 'An account already exists with this email.' : (e.message || 'Unable to create account.'));
      try { verifier.clear(); verifier = new RecaptchaVerifier(auth, 'signupRecaptcha', { size: 'invisible' }); } catch (_) {}
    }
  });

  document.getElementById('signupVerifyOtp').addEventListener('click', async () => {
    const code = document.getElementById('signupOtp').value.trim();
    if (!verificationId) return show('Request an OTP first.');
    if (!/^\d{6}$/.test(code)) return show('Enter the 6-digit OTP.');
    try {
      show('Verifying mobile…', false);
      const credential = PhoneAuthProvider.credential(verificationId, code);
      await linkWithCredential(auth.currentUser, credential);
      dashboard();
    } catch (e) {
      show(e.code === 'auth/credential-already-in-use' ? 'This mobile number is already linked to another account.' : 'Invalid or expired OTP. Please try again.');
    }
  });

  document.getElementById('signupChange').addEventListener('click', e => {
    e.preventDefault(); document.getElementById('signupForm').hidden = false; document.getElementById('signupOtpBox').hidden = true; document.getElementById('signupOtp').value = ''; show('');
  });

  document.getElementById('signupGoogle').addEventListener('click', async () => {
    try {
      show('Opening Google sign-in…', false);
      const result = await signInWithPopup(auth, provider);
      const u = result.user;
      const base = (u.displayName || u.email?.split('@')[0] || 'farmer').replace(/[^a-zA-Z0-9_.-]/g,'').slice(0,30) || 'farmer';
      const usernameRef = doc(db, 'usernames', base.toLowerCase());
      let username = base;
      if ((await getDoc(usernameRef)).exists() && (await getDoc(usernameRef)).data().uid !== u.uid) username = `${base}${Math.floor(Math.random()*900+100)}`;
      await setDoc(doc(db, 'users', u.uid), { username, email: u.email || '', phone: u.phoneNumber || '', termsAccepted: false, provider: 'google' }, { merge: true });
      await setDoc(doc(db, 'usernames', username.toLowerCase()), { uid: u.uid, email: u.email || '' }, { merge: true });
      await updateProfile(u, { displayName: username });
      dashboard();
    } catch (e) { show(e.code === 'auth/popup-blocked' ? 'Allow popups for Google sign-in.' : (e.message || 'Google sign-in failed.')); }
  });
}
