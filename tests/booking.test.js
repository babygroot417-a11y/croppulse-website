const { handleBookingSubmit } = require('../src/booking');

describe('handleBookingSubmit', () => {
  let form;

  beforeEach(() => {
    document.body.innerHTML = `
      <div id="alertMessage" style="display:none" class=""></div>
      <form id="bookingForm">
        <input name="name" value="Test User" />
        <input name="date" value="2025-01-01" />
      </form>
    `;
    form = document.getElementById('bookingForm');
  });

  afterEach(() => {
    document.body.innerHTML = '';
  });

  test('shows success alert on form submission', () => {
    handleBookingSubmit(form);
    const alertBox = document.getElementById('alertMessage');
    expect(alertBox.style.display).toBe('block');
    expect(alertBox.className).toBe('alert alert-success');
  });

  test('alert contains confirmation message', () => {
    handleBookingSubmit(form);
    const alertBox = document.getElementById('alertMessage');
    expect(alertBox.innerHTML).toContain('Booking confirmed');
    expect(alertBox.innerHTML).toContain('confirmation email');
  });

  test('alert contains check-circle icon', () => {
    handleBookingSubmit(form);
    const alertBox = document.getElementById('alertMessage');
    expect(alertBox.innerHTML).toContain('fa-check-circle');
  });

  test('resets the form after submission', () => {
    const resetSpy = jest.spyOn(form, 'reset');
    handleBookingSubmit(form);
    expect(resetSpy).toHaveBeenCalled();
  });

  test('returns confirmed status', () => {
    const result = handleBookingSubmit(form);
    expect(result).toEqual({ confirmed: true });
  });
});
