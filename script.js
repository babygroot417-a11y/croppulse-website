// Firebase Config (Replace with your details from Firebase console)
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID"
};

// Initialize Firebase
if (typeof firebase !== "undefined") {
  firebase.initializeApp(firebaseConfig);
  window.recaptchaVerifier = new firebase.auth.RecaptchaVerifier('recaptcha-container');
}

// Send OTP
function sendOTP() {
  const phoneNumber = document.getElementById("phone").value;
  firebase.auth().signInWithPhoneNumber(phoneNumber, window.recaptchaVerifier)
    .then(confirmationResult => {
      window.confirmationResult = confirmationResult;
      alert("OTP Sent!");
    }).catch(err => alert(err));
}

// Verify OTP
function verifyOTP() {
  const code = document.getElementById("otp").value;
  window.confirmationResult.confirm(code).then(result => {
    alert("Login Successful!");
    window.location.href = "dashboard.html";
  }).catch(err => alert(err));
}

// Chatbot mock
function sendMessage() {
  let input = document.getElementById("userInput").value;
  let msgBox = document.getElementById("messages");
  msgBox.innerHTML += `<p><b>You:</b> ${input}</p>`;
  msgBox.innerHTML += `<p><b>Bot:</b> (AI response for "${input}")</p>`;
  document.getElementById("userInput").value = "";
}
