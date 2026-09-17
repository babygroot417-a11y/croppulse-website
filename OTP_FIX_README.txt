CropPulse OTP fix

The OTP form is now explicitly revealed after Firebase signInWithPhoneNumber succeeds.

Deployment:
1. Replace your current website files with this folder contents.
2. Push to GitHub/hosting.
3. Open https://thecroppulse.in/login.html
4. Hard refresh (Ctrl+Shift+R).
5. Send OTP once, complete reCAPTCHA, then enter the 6-digit code.

Firebase configuration is retained from the uploaded project.
