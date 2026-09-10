# CropPulse Firebase Authentication Setup

The website now contains real Firebase Authentication code for both **phone OTP** and **Google sign-in**. The repository did not contain a Firebase Web App configuration, so complete these one-time steps before deployment.

1. Open Firebase Console and create/select your CropPulse project.
2. Project settings > Your apps > Add Web App. Copy the web configuration into `firebase-config.js`.
3. Authentication > Sign-in method:
   - Enable **Phone**.
   - Enable **Google** and choose a support email.
4. Authentication > Settings > Authorized domains. Add the domains you actually use, including:
   - `thecroppulse.in`
   - your `*.github.io` domain if you test through GitHub Pages
   - `localhost` for local testing (Firebase may add this automatically depending on the project)
5. For phone authentication, ensure the Firebase project/billing/SMS region settings allow SMS to the countries you plan to support. Use Firebase test phone numbers during development to avoid unnecessary SMS sends.
6. Deploy over HTTPS. GitHub Pages/custom domains are suitable once configured correctly.

## Important
- Do **not** use `OTP.txt`; hard-coded OTP lists are not secure authentication. The new login page does not use it.
- Firebase Web App config values are not secrets. Protect data with Firebase Security Rules and only enable required providers/domains.
- The health-check values are deterministic **sample data**, not live sensor readings. Replace `health-data.js` with your backend/drone/rover feed when hardware integration is ready.
- Since the current CropPulse concept uses an RGB camera, the demo shows **VARI**, not true NDVI. True NDVI requires a near-infrared channel.
