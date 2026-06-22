const { toggleTheme, loadTheme, showAlert, sendOTP, verifyOTP, goBack, handleKeypress } = require('../src/login');

beforeEach(() => {
  document.documentElement.className = '';
  localStorage.clear();

  document.body.innerHTML = `
    <div id="alertBox" style="display:none"></div>
    <input id="phone" value="" />
    <input id="otp" value="" />
    <div id="phoneBox" style="display:block"></div>
    <div id="otpBox" style="display:none"></div>
  `;

  jest.useFakeTimers();
});

afterEach(() => {
  jest.useRealTimers();
});

describe('toggleTheme', () => {
  test('adds dark-mode class on first toggle', () => {
    const result = toggleTheme();
    expect(result).toBe(true);
    expect(document.documentElement.classList.contains('dark-mode')).toBe(true);
  });

  test('removes dark-mode class on second toggle', () => {
    toggleTheme();
    const result = toggleTheme();
    expect(result).toBe(false);
    expect(document.documentElement.classList.contains('dark-mode')).toBe(false);
  });

  test('persists dark theme to localStorage', () => {
    toggleTheme();
    expect(localStorage.getItem('theme')).toBe('dark');
  });

  test('persists light theme to localStorage', () => {
    toggleTheme();
    toggleTheme();
    expect(localStorage.getItem('theme')).toBe('light');
  });
});

describe('loadTheme', () => {
  test('defaults to light theme when no saved preference', () => {
    const result = loadTheme();
    expect(result).toBe('light');
    expect(document.documentElement.classList.contains('dark-mode')).toBe(false);
  });

  test('applies dark-mode class when dark theme is saved', () => {
    localStorage.setItem('theme', 'dark');
    const result = loadTheme();
    expect(result).toBe('dark');
    expect(document.documentElement.classList.contains('dark-mode')).toBe(true);
  });

  test('does not add dark-mode class when light theme is saved', () => {
    localStorage.setItem('theme', 'light');
    loadTheme();
    expect(document.documentElement.classList.contains('dark-mode')).toBe(false);
  });
});

describe('showAlert', () => {
  test('displays alert with correct message and type', () => {
    showAlert('Test message', 'error');
    const alertBox = document.getElementById('alertBox');
    expect(alertBox.textContent).toBe('Test message');
    expect(alertBox.className).toBe('alert alert-error');
    expect(alertBox.style.display).toBe('block');
  });

  test('defaults to info type when not specified', () => {
    showAlert('Info message');
    const alertBox = document.getElementById('alertBox');
    expect(alertBox.className).toBe('alert alert-info');
  });

  test('hides alert after 4 seconds', () => {
    showAlert('Temporary', 'success');
    const alertBox = document.getElementById('alertBox');
    expect(alertBox.style.display).toBe('block');

    jest.advanceTimersByTime(4000);
    expect(alertBox.style.display).toBe('none');
  });

  test('alert remains visible before timeout', () => {
    showAlert('Visible', 'warning');
    const alertBox = document.getElementById('alertBox');

    jest.advanceTimersByTime(3999);
    expect(alertBox.style.display).toBe('block');
  });
});

describe('sendOTP', () => {
  test('returns false and shows error for empty phone', () => {
    document.getElementById('phone').value = '';
    const result = sendOTP();
    expect(result).toBe(false);
    expect(document.getElementById('alertBox').textContent).toBe('Please enter a phone number');
  });

  test('returns false and shows error for short phone number', () => {
    document.getElementById('phone').value = '12345';
    const result = sendOTP();
    expect(result).toBe(false);
    expect(document.getElementById('alertBox').textContent).toBe('Please enter a valid phone number (10+ digits)');
  });

  test('returns false for whitespace-only phone input', () => {
    document.getElementById('phone').value = '   ';
    const result = sendOTP();
    expect(result).toBe(false);
  });

  test('succeeds with valid 10-digit phone number', () => {
    document.getElementById('phone').value = '1234567890';
    const result = sendOTP();
    expect(result).toBe(true);
  });

  test('hides phone box and shows OTP box on success', () => {
    document.getElementById('phone').value = '1234567890';
    sendOTP();
    expect(document.getElementById('phoneBox').style.display).toBe('none');
    expect(document.getElementById('otpBox').style.display).toBe('block');
  });

  test('shows success alert on valid phone', () => {
    document.getElementById('phone').value = '+911234567890';
    sendOTP();
    expect(document.getElementById('alertBox').className).toBe('alert alert-success');
  });
});

describe('verifyOTP', () => {
  test('returns error for empty OTP', () => {
    document.getElementById('otp').value = '';
    const result = verifyOTP();
    expect(result).toEqual({ success: false, reason: 'empty' });
  });

  test('returns success for correct OTP (1234)', () => {
    document.getElementById('otp').value = '1234';
    const result = verifyOTP();
    expect(result).toEqual({ success: true });
  });

  test('returns invalid for wrong OTP', () => {
    document.getElementById('otp').value = '0000';
    const result = verifyOTP();
    expect(result).toEqual({ success: false, reason: 'invalid' });
  });

  test('shows success alert for correct OTP', () => {
    document.getElementById('otp').value = '1234';
    verifyOTP();
    expect(document.getElementById('alertBox').className).toBe('alert alert-success');
  });

  test('shows error alert for invalid OTP', () => {
    document.getElementById('otp').value = '9999';
    verifyOTP();
    expect(document.getElementById('alertBox').className).toBe('alert alert-error');
  });

  test('trims whitespace from OTP input', () => {
    document.getElementById('otp').value = ' 1234 ';
    const result = verifyOTP();
    expect(result).toEqual({ success: true });
  });
});

describe('goBack', () => {
  test('clears phone and OTP fields', () => {
    document.getElementById('phone').value = '1234567890';
    document.getElementById('otp').value = '1234';
    goBack();
    expect(document.getElementById('phone').value).toBe('');
    expect(document.getElementById('otp').value).toBe('');
  });

  test('shows phone box and hides OTP box', () => {
    document.getElementById('phoneBox').style.display = 'none';
    document.getElementById('otpBox').style.display = 'block';
    goBack();
    expect(document.getElementById('phoneBox').style.display).toBe('block');
    expect(document.getElementById('otpBox').style.display).toBe('none');
  });
});

describe('handleKeypress', () => {
  test('calls sendOTP when Enter pressed and OTP box is hidden', () => {
    document.getElementById('phone').value = '1234567890';
    document.getElementById('otpBox').style.display = 'none';
    handleKeypress({ key: 'Enter' });
    expect(document.getElementById('phoneBox').style.display).toBe('none');
    expect(document.getElementById('otpBox').style.display).toBe('block');
  });

  test('calls verifyOTP when Enter pressed and OTP box is visible', () => {
    document.getElementById('otpBox').style.display = 'block';
    document.getElementById('otp').value = '1234';
    handleKeypress({ key: 'Enter' });
    expect(document.getElementById('alertBox').className).toBe('alert alert-success');
  });

  test('does nothing for non-Enter keys', () => {
    const phoneBox = document.getElementById('phoneBox');
    const originalDisplay = phoneBox.style.display;
    handleKeypress({ key: 'a' });
    expect(phoneBox.style.display).toBe(originalDisplay);
  });
});
