// Login page logic: theme toggle, alerts, OTP send/verify, navigation

function toggleTheme() {
  const isDarkMode = document.documentElement.classList.toggle('dark-mode');
  localStorage.setItem('theme', isDarkMode ? 'dark' : 'light');
  return isDarkMode;
}

function loadTheme() {
  const savedTheme = localStorage.getItem('theme') || 'light';
  if (savedTheme === 'dark') {
    document.documentElement.classList.add('dark-mode');
  }
  return savedTheme;
}

function showAlert(message, type) {
  type = type || 'info';
  const alertBox = document.getElementById('alertBox');
  alertBox.className = 'alert alert-' + type;
  alertBox.textContent = message;
  alertBox.style.display = 'block';
  setTimeout(function () {
    alertBox.style.display = 'none';
  }, 4000);
}

function sendOTP() {
  const phone = document.getElementById('phone').value.trim();

  if (!phone) {
    showAlert('Please enter a phone number', 'error');
    return false;
  }

  if (phone.length < 10) {
    showAlert('Please enter a valid phone number (10+ digits)', 'error');
    return false;
  }

  showAlert('\u2713 Demo OTP sent: 1234', 'success');

  document.getElementById('phoneBox').style.display = 'none';
  document.getElementById('otpBox').style.display = 'block';
  return true;
}

function verifyOTP() {
  const otp = document.getElementById('otp').value.trim();

  if (!otp) {
    showAlert('Please enter the OTP', 'error');
    return { success: false, reason: 'empty' };
  }

  if (otp === '1234') {
    showAlert('\u2713 Login successful! Redirecting...', 'success');
    return { success: true };
  } else {
    showAlert('Invalid OTP. Please try again', 'error');
    return { success: false, reason: 'invalid' };
  }
}

function goBack() {
  document.getElementById('phone').value = '';
  document.getElementById('otp').value = '';
  document.getElementById('phoneBox').style.display = 'block';
  document.getElementById('otpBox').style.display = 'none';
}

function handleKeypress(e) {
  if (e.key === 'Enter') {
    var otpBox = document.getElementById('otpBox');
    if (otpBox.style.display !== 'none') {
      verifyOTP();
    } else {
      sendOTP();
    }
  }
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { toggleTheme, loadTheme, showAlert, sendOTP, verifyOTP, goBack, handleKeypress };
}
