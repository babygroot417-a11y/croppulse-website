import { initializeApp } from 'https://www.gstatic.com/firebasejs/12.3.0/firebase-app.js';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  createUserWithEmailAndPassword,
  RecaptchaVerifier,
  PhoneAuthProvider,
  linkWithCredential,
  updateProfile
} from 'https://www.gstatic.com/firebasejs/12.3.0/firebase-auth.js';
import {
  getFirestore,
  doc,
  setDoc,
  getDoc
} from 'https://www.gstatic.com/firebasejs/12.3.0/firebase-firestore.js';

const config = window.CROPULSE_FIREBASE_CONFIG || {};
const message = document.getElementById('signupMessage');
const valid = config.apiKey && config.apiKey !== 'REPLACE_ME';

const show = (msg, error = true) => {
  message.textContent = msg;
  message.style.color = error ? '#ff8580' : '#86e589';
};

const dashboard = () => {
  window.location.href = 'index.html';
};

if (!valid) {
  show('Firebase is not configured.');
} else {
  const app = initializeApp(config);
  const auth = getAuth(app);
  const db = getFirestore(app);
  const googleProvider = new GoogleAuthProvider();

  let verifier = new RecaptchaVerifier(auth, 'signupRecaptcha', {
    size: 'invisible'
  });

  let verificationId = null;
  let pending = null;

  const phoneValue = () => {
    const raw = document.getElementById('signupPhone').value.trim();
    return raw.startsWith('+')
      ? raw
      : document.getElementById('signupCountry').value + raw.replace(/\D/g, '');
  };

  const resetRecaptcha = () => {
    try { verifier.clear(); } catch (_) {}
    verifier = new RecaptchaVerifier(auth, 'signupRecaptcha', {
      size: 'invisible'
    });
  };

  document.getElementById('signupSendOtp').addEventListener('click', async () => {
    const username = document.getElementById('signupUsername').value.trim();
    const email = document.getElementById('signupEmail').value.trim();
    const password = document.getElementById('signupPassword').value;
    const phone = phoneValue();

    if (!/^[a-zA-Z0-9_.-]{3,30}$/.test(username)) {
      return show('Username must be 3–30 characters: letters, numbers, _, ., or -.');
    }
    if (!/^\S+@\S+\.\S+$/.test(email)) {
      return show('Enter a valid email address.');
    }
    if (password.length < 6) {
      return show('Password must be at least 6 characters.');
    }
    if (!/^\+[1-9]\d{7,14}$/.test(phone)) {
      return show('Enter a valid mobile number.');
    }
    if (!document.getElementById('terms').checked) {
      return show('Please accept the Terms and Conditions.');
    }

    try {
      show('Checking username and sending OTP…', false);

      const usernameRef = doc(db, 'usernames', username.toLowerCase());
      const usernameSnap = await getDoc(usernameRef);

      if (usernameSnap.exists()) {
        return show('That username is already taken.');
      }

      // IMPORTANT:
      // Verify the phone BEFORE creating the email/password account.
      // PhoneAuthProvider.verifyPhoneNumber() takes the phone number
      // directly for a normal phone verification flow. Passing
      // {phoneNumber, session: user} here causes auth/internal-error.
      const phoneProvider = new PhoneAuthProvider(auth);
      verificationId = await phoneProvider.verifyPhoneNumber(phone, verifier);

      pending = { username, email, password, phone };

      document.getElementById('signupForm').hidden = true;
      document.getElementById('signupOtpBox').hidden = false;
      document.getElementById('signupOtpBox').classList.add('show');

      show('OTP sent to your mobile. Enter it to finish creating your account.', false);
    } catch (e) {
      console.error('Signup OTP error:', e);
      show(
        e.code === 'auth/operation-not-allowed'
          ? 'Phone sign-in is not enabled in Firebase Authentication.'
          : e.code === 'auth/quota-exceeded'
            ? 'SMS quota exceeded. Please try again later.'
            : e.code === 'auth/invalid-phone-number'
              ? 'Enter a valid mobile number with country code.'
              : (e.message || 'Unable to send OTP.')
      );
      resetRecaptcha();
    }
  });

  document.getElementById('signupVerifyOtp').addEventListener('click', async () => {
    const code = document.getElementById('signupOtp').value.trim();

    if (!verificationId || !pending) {
      return show('Request an OTP first.');
    }
    if (!/^\d{6}$/.test(code)) {
      return show('Enter the 6-digit OTP.');
    }

    try {
      show('Verifying OTP and creating your account…', false);

      const phoneCredential = PhoneAuthProvider.credential(
        verificationId,
        code
      );

      // Create the email/password account only after the mobile OTP is valid.
      const cred = await createUserWithEmailAndPassword(
        auth,
        pending.email,
        pending.password
      );

      await updateProfile(cred.user, {
        displayName: pending.username
      });

      await linkWithCredential(cred.user, phoneCredential);

      await setDoc(
        doc(db, 'users', cred.user.uid),
        {
          username: pending.username,
          email: pending.email,
          phone: pending.phone,
          termsAccepted: true,
          createdAt: new Date().toISOString()
        }
      );

      await setDoc(
        doc(db, 'usernames', pending.username.toLowerCase()),
        {
          uid: cred.user.uid,
          email: pending.email
        }
      );

      dashboard();
    } catch (e) {
      console.error('Signup verification error:', e);

      if (e.code === 'auth/email-already-in-use') {
        show('An account already exists with this email. Please sign in instead.');
      } else if (e.code === 'auth/credential-already-in-use') {
        show('This mobile number is already linked to another account.');
      } else if (e.code === 'auth/invalid-verification-code') {
        show('The OTP is incorrect. Please try again.');
      } else if (e.code === 'auth/code-expired') {
        show('The OTP has expired. Please request a new one.');
      } else {
        show(e.message || 'Unable to complete signup.');
      }
    }
  });

  document.getElementById('signupChange').addEventListener('click', (e) => {
    e.preventDefault();
    document.getElementById('signupForm').hidden = false;
    document.getElementById('signupOtpBox').hidden = true;
    document.getElementById('signupOtp').value = '';
    verificationId = null;
    pending = null;
    show('');
    resetRecaptcha();
  });

  document.getElementById('signupGoogle').addEventListener('click', async () => {
    if (!document.getElementById('terms').checked) {
      return show('Please accept the Terms and Conditions before continuing with Google.');
    }

    try {
      show('Opening Google sign-in…', false);

      const result = await signInWithPopup(auth, googleProvider);
      const u = result.user;

      const base =
        (u.displayName || u.email?.split('@')[0] || 'farmer')
          .replace(/[^a-zA-Z0-9_.-]/g, '')
          .slice(0, 30) || 'farmer';

      let username = base;
      const baseRef = doc(db, 'usernames', base.toLowerCase());
      const baseSnap = await getDoc(baseRef);

      if (baseSnap.exists() && baseSnap.data().uid !== u.uid) {
        username = `${base}${Math.floor(Math.random() * 900 + 100)}`;
      }

      await updateProfile(u, { displayName: username });

      await setDoc(
        doc(db, 'users', u.uid),
        {
          username,
          email: u.email || '',
          phone: u.phoneNumber || '',
          termsAccepted: true,
          provider: 'google',
          createdAt: new Date().toISOString()
        },
        { merge: true }
      );

      await setDoc(
        doc(db, 'usernames', username.toLowerCase()),
        {
          uid: u.uid,
          email: u.email || ''
        },
        { merge: true }
      );

      dashboard();
    } catch (e) {
      console.error('Google signup error:', e);
      show(
        e.code === 'auth/popup-blocked'
          ? 'Allow popups for Google sign-in.'
          : (e.message || 'Google sign-in failed.')
      );
    }
  });
}
