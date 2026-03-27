function sendOTP() {
  const phoneNumber = document.getElementById("phone").value;
  const loader = document.getElementById("loader");
  const btn = document.getElementById("sendBtn");

  loader.style.display = "block";
  btn.disabled = true;
  btn.innerText = "Sending...";

  firebase.auth().signInWithPhoneNumber(phoneNumber, window.recaptchaVerifier)
    .then(function (confirmationResult) {
      window.confirmationResult = confirmationResult;
      loader.style.display = "none";
      btn.innerText = "OTP Sent ✅";
      alert("OTP Sent Successfully!");
    })
    .catch(function (error) {
      loader.style.display = "none";
      btn.disabled = false;
      btn.innerText = "Send OTP";
      alert("Error: " + error.message);
    });
}
document.getElementById("fullLoader").style.display = "flex";