# CropPulse real OTP setup

The login page now uses Firebase Authentication for real SMS OTP and Google sign-in. It does **not** use a hard-coded OTP.

1. Create/select a Firebase project.
2. Add a Web App and copy its Firebase config into `firebase-config.js`.
3. In Firebase Console → Authentication → Sign-in method, enable **Phone** and **Google**.
4. Add your production domains (including `thecroppulse.in`) under Authentication → Settings → Authorized domains.
5. Phone authentication sends a real SMS. Firebase may require billing/SMS region setup depending on your account and country.
6. Test with Firebase's test phone numbers during development if available.

Never place a Firebase Admin SDK private key in this website. The browser config is intended for the client SDK; protect application data with Firebase Security Rules.
