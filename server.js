// Simple SMS OTP server for CropPulse
// - Reads candidate OTPs from a text file named `OTP` (one OTP per line)
// - Picks a random OTP and sends via Twilio SMS
// - Stores phone→otp mapping in-memory with a short TTL for verification

const express = require('express');
const fs = require('fs');
const path = require('path');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5173;

// CORS: allow same-origin and typical local dev origins
app.use(cors({
  origin: process.env.CORS_ORIGIN ? process.env.CORS_ORIGIN.split(',') : true,
  credentials: false
}));
app.use(express.json());

// Serve static site
app.use(express.static(__dirname));

// Load OTP pool from file
const otpFilePath = path.join(__dirname, 'OTP');
let otpPool = [];
function loadOtpPool() {
  try {
    const text = fs.readFileSync(otpFilePath, 'utf8');
    otpPool = text
      .split(/\r?\n/)
      .map(s => s.trim())
      .filter(s => s.length > 0 && /^\d+$/.test(s));
    if (otpPool.length === 0) {
      console.warn('OTP file is empty or has no numeric lines.');
    }
  } catch (e) {
    console.warn('Could not read OTP file at', otpFilePath, e.message);
    otpPool = [];
  }
}
loadOtpPool();

// Reload OTP pool on file change
try {
  fs.watch(otpFilePath, { persistent: false }, () => {
    loadOtpPool();
    console.log('Reloaded OTP pool. Size:', otpPool.length);
  });
} catch {}

// In-memory store for issued OTPs with TTL
const issuedOtps = new Map(); // key: phone, value: { otp, expiresAt }
const OTP_TTL_MS = parseInt(process.env.OTP_TTL_MS || '300000', 10); // default 5 minutes

function setOtpForPhone(phone, otp) {
  const expiresAt = Date.now() + OTP_TTL_MS;
  issuedOtps.set(phone, { otp, expiresAt });
}

function verifyOtpForPhone(phone, code) {
  const record = issuedOtps.get(phone);
  if (!record) return false;
  if (Date.now() > record.expiresAt) {
    issuedOtps.delete(phone);
    return false;
  }
  const ok = record.otp === code;
  if (ok) issuedOtps.delete(phone);
  return ok;
}

// Twilio setup (optional in dev). If not configured, we mock-send and log.
const TWILIO_SID = process.env.TWILIO_ACCOUNT_SID || '';
const TWILIO_TOKEN = process.env.TWILIO_AUTH_TOKEN || '';
const TWILIO_FROM = process.env.TWILIO_FROM || '';
let twilioClient = null;
if (TWILIO_SID && TWILIO_TOKEN) {
  try {
    // eslint-disable-next-line global-require
    twilioClient = require('twilio')(TWILIO_SID, TWILIO_TOKEN);
  } catch (e) {
    console.warn('Failed to initialize Twilio SDK:', e.message);
  }
}

function isPhoneValidE164(value) {
  return /^\+[1-9]\d{6,15}$/.test(value);
}

// API: send OTP
app.post('/api/send-otp', async (req, res) => {
  try {
    const { phone } = req.body || {};
    if (!phone || !isPhoneValidE164(phone)) {
      return res.status(400).json({ ok: false, error: 'invalid_phone' });
    }
    if (!otpPool.length) {
      return res.status(500).json({ ok: false, error: 'otp_pool_empty' });
    }
    const otp = otpPool[Math.floor(Math.random() * otpPool.length)];
    setOtpForPhone(phone, otp);

    const messageText = `Your CropPulse login code is ${otp}`;

    if (twilioClient && TWILIO_FROM) {
      await twilioClient.messages.create({
        body: messageText,
        from: TWILIO_FROM,
        to: phone
      });
    } else {
      console.log(`[MOCK SMS] to=${phone} body="${messageText}"`);
    }

    return res.json({ ok: true });
  } catch (e) {
    console.error('send-otp failed', e);
    return res.status(500).json({ ok: false, error: 'send_failed' });
  }
});

// API: verify OTP
app.post('/api/verify-otp', (req, res) => {
  try {
    const { phone, code } = req.body || {};
    if (!phone || !isPhoneValidE164(phone) || !code) {
      return res.status(400).json({ ok: false, error: 'invalid_input' });
    }
    const ok = verifyOtpForPhone(phone, String(code).trim());
    return res.json({ ok });
  } catch (e) {
    console.error('verify-otp failed', e);
    return res.status(500).json({ ok: false, error: 'verify_failed' });
  }
});

app.listen(PORT, () => {
  console.log(`CropPulse server running at http://localhost:${PORT}`);
});


