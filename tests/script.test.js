// Tests for script.js (Firebase OTP sending)
const fs = require('fs');
const path = require('path');

describe('script.js - sendOTP with Firebase', () => {
  beforeEach(() => {
    document.body.innerHTML = `
      <input id="phone" value="+911234567890" />
      <div id="loader" style="display:none"></div>
      <button id="sendBtn">Send OTP</button>
      <div id="fullLoader" style="display:none"></div>
    `;

    window.recaptchaVerifier = {};
    window.confirmationResult = null;
    window.alert = jest.fn();
  });

  afterEach(() => {
    delete window.firebase;
    document.body.innerHTML = '';
  });

  function loadScript(mockSignIn) {
    window.firebase = {
      auth: jest.fn(() => ({
        signInWithPhoneNumber: mockSignIn
      }))
    };

    const code = fs.readFileSync(path.join(__dirname, '..', 'script.js'), 'utf8');
    // Use indirect eval to execute in the global (jsdom) scope
    const indirectEval = eval;
    indirectEval(code);
  }

  test('sendOTP shows loader and disables button', () => {
    const mockSignIn = jest.fn(() => Promise.resolve({ verificationId: 'test' }));
    loadScript(mockSignIn);

    window.sendOTP();

    expect(document.getElementById('loader').style.display).toBe('block');
    expect(document.getElementById('sendBtn').disabled).toBe(true);
    expect(document.getElementById('sendBtn').innerText).toBe('Sending...');
  });

  test('sendOTP calls firebase signInWithPhoneNumber', () => {
    const mockSignIn = jest.fn(() => Promise.resolve({ verificationId: 'test' }));
    loadScript(mockSignIn);

    window.sendOTP();

    expect(mockSignIn).toHaveBeenCalledWith('+911234567890', window.recaptchaVerifier);
  });

  test('successful OTP hides loader and updates button text', async () => {
    const confirmResult = { verificationId: 'test123' };
    const mockSignIn = jest.fn(() => Promise.resolve(confirmResult));
    loadScript(mockSignIn);

    window.sendOTP();

    await new Promise(r => setTimeout(r, 0));

    expect(document.getElementById('loader').style.display).toBe('none');
    expect(document.getElementById('sendBtn').innerText).toBe('OTP Sent \u2705');
    expect(window.confirmationResult).toBe(confirmResult);
  });

  test('failed OTP re-enables button and shows error', async () => {
    const mockSignIn = jest.fn(() => Promise.reject({ message: 'Network error' }));
    loadScript(mockSignIn);

    window.sendOTP();

    await new Promise(r => setTimeout(r, 0));

    expect(document.getElementById('loader').style.display).toBe('none');
    expect(document.getElementById('sendBtn').disabled).toBe(false);
    expect(document.getElementById('sendBtn').innerText).toBe('Send OTP');
  });

  test('fullLoader is set to flex on script load', () => {
    const mockSignIn = jest.fn(() => Promise.resolve({}));
    loadScript(mockSignIn);
    expect(document.getElementById('fullLoader').style.display).toBe('flex');
  });
});
