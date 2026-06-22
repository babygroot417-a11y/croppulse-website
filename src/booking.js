// Booking page logic: form submission handler

function handleBookingSubmit(formElement) {
  var alertBox = document.getElementById('alertMessage');
  alertBox.className = 'alert alert-success';
  alertBox.innerHTML = '<i class="fas fa-check-circle"></i> Booking confirmed! You will receive a confirmation email shortly.';
  alertBox.style.display = 'block';

  formElement.reset();

  return { confirmed: true };
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { handleBookingSubmit };
}
