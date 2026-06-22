function sendOTP() {
  var phoneNumber = document.getElementById("phone");
  var loader = document.getElementById("loader");
  var btn = document.getElementById("sendBtn");

  if (!phoneNumber || !loader || !btn) {
    alert("Error: Required page elements are missing.");
    return;
  }

  phoneNumber = phoneNumber.value;
  loader.style.display = "block";
  btn.disabled = true;
  btn.innerText = "Sending...";

  if (typeof firebase === "undefined" || typeof firebase.auth !== "function") {
    loader.style.display = "none";
    btn.disabled = false;
    btn.innerText = "Send OTP";
    alert("Error: Firebase is not loaded. Please refresh the page and try again.");
    return;
  }

  if (!window.recaptchaVerifier) {
    loader.style.display = "none";
    btn.disabled = false;
    btn.innerText = "Send OTP";
    alert("Error: reCAPTCHA verification failed to initialize. Please refresh the page.");
    return;
  }

  firebase.auth().signInWithPhoneNumber(phoneNumber, window.recaptchaVerifier)
    .then(function (confirmationResult) {
      window.confirmationResult = confirmationResult;
      loader.style.display = "none";
      btn.innerText = "OTP Sent";
      alert("OTP Sent Successfully!");
    })
    .catch(function (error) {
      loader.style.display = "none";
      btn.disabled = false;
      btn.innerText = "Send OTP";
      alert("Error: " + (error.message || "Failed to send OTP. Please try again."));
    });
}

var fullLoader = document.getElementById("fullLoader");
if (fullLoader) {
  fullLoader.style.display = "flex";
}
