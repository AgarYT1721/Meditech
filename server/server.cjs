require('dotenv').config();
const express = require('express');
const cors = require('cors');
const nodemailer = require('nodemailer');
const { initializeApp, cert } = require('firebase-admin/app');
const { getAuth } = require('firebase-admin/auth');

// Initialize Firebase Admin
try {
  const serviceAccount = require('./meditech-fd422-firebase-adminsdk-fbsvc-9e8472a079.json');
  initializeApp({
    credential: cert(serviceAccount)
  });
  console.log("✅ Firebase Admin SDK initialized successfully.");
} catch (err) {
  console.error("⚠️ Failed to initialize Firebase Admin SDK. Please ensure the serviceAccountKey is present.", err.message);
}

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

// In-memory store for OTPs: Map<email, { code, expiresAt }>
const otpStore = new Map();

// Configure the email transporter
// Many users paste the App Password with spaces; we remove them here to prevent auth errors.
const safePass = process.env.EMAIL_PASS ? process.env.EMAIL_PASS.replace(/\s+/g, '') : '';

const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 465,
  secure: true,
  auth: {
    user: process.env.EMAIL_USER,
    pass: safePass,
  },
});

app.post('/api/send-otp', async (req, res) => {
  console.log(`\n📬 Received OTP request for: ${req.body.email}`);
  const { email, name } = req.body;
  if (!email) {
    console.log("❌ Missing email in request body!");
    return res.status(400).json({ success: false, message: 'Email is required' });
  }

  // Generate a random 6-digit code
  const code = Math.floor(100000 + Math.random() * 900000).toString();
  
  // Store the code, valid for 5 minutes
  const expiresAt = Date.now() + 5 * 60 * 1000;
  otpStore.set(email, { code, expiresAt });

  try {
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      console.warn("⚠️  Email credentials not found in .env! Simulating email send...");
      console.log(`[SIMULATED EMAIL] To: ${email} | Code: ${code}`);
      return res.json({ success: true, simulated: true, message: 'OTP Simulated (No Credentials)' });
    }

    const mailOptions = {
      from: `"MediTech Auth" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: 'Your MediTech Verification Code',
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; max-width: 500px; margin: 0 auto; border: 1px solid #eee; border-radius: 10px;">
          <h2 style="color: #0066ff;">MediTech Verification</h2>
          <p>Hi ${name || 'there'},</p>
          <p>Use the following 6-digit code to verify your MediTech account:</p>
          <div style="background: #f0f7ff; padding: 15px; text-align: center; font-size: 24px; font-weight: bold; letter-spacing: 5px; border-radius: 8px; color: #181818;">
            ${code}
          </div>
          <p style="margin-top: 20px; color: #666; font-size: 0.9em;">This code will expire in 5 minutes.</p>
        </div>
      `
    };

    const isMockDomain = email.endsWith('@meditech.com') || email.endsWith('@mock.com');

    if (isMockDomain) {
      console.log(`⚠️ Mock domain detected. Skipping actual email delivery to ${email} (Code: ${code})`);
      return res.json({ success: true, message: 'OTP simulated for mock domain' });
    }

    await transporter.sendMail(mailOptions);
    console.log(`✅ Real OTP sent to ${email} (Code: ${code})`);
    res.json({ success: true, message: 'OTP sent to email' });
  } catch (error) {
    console.error('❌ Error sending email:', error);
    res.status(500).json({ success: false, message: 'Failed to send OTP email. Make sure App Password is correct.' });
  }
});

app.post('/api/verify-otp', (req, res) => {
  const { email, code } = req.body;
  if (!email || !code) {
    return res.status(400).json({ success: false, message: 'Email and code are required' });
  }

  const record = otpStore.get(email);
  if (!record) {
    return res.status(400).json({ success: false, message: 'No OTP requested for this email' });
  }

  if (Date.now() > record.expiresAt) {
    otpStore.delete(email);
    return res.status(400).json({ success: false, message: 'OTP has expired' });
  }

  if (record.code === code) {
    otpStore.delete(email); // Clean up after successful verification
    return res.json({ success: true, message: 'OTP verified successfully' });
  } else {
    return res.status(400).json({ success: false, message: 'Invalid OTP code' });
  }
});

// Admin SDK Endpoint to update user auth credentials
app.post('/api/admin/update-user', async (req, res) => {
  const { uid, email, password } = req.body;
  if (!uid) {
    return res.status(400).json({ success: false, message: 'UID is required' });
  }

  try {
    const updateData = {};
    if (email) updateData.email = email;
    if (password) updateData.password = password;

    if (Object.keys(updateData).length > 0) {
      try {
        await getAuth().updateUser(uid, updateData);
        console.log(`✅ Admin SDK updated auth credentials for UID: ${uid}`);
      } catch (authErr) {
        if (authErr.code === 'auth/user-not-found') {
          console.log(`⚠️ User ${uid} not found in Auth. Materializing mock user...`);
          // A password is required to create an email/password user
          if (!updateData.password) {
            updateData.password = "DefaultPass123!"; 
          }
          await getAuth().createUser({ uid, ...updateData });
          console.log(`✅ Admin SDK materialized mock user into real Auth user for UID: ${uid}`);
        } else {
          throw authErr;
        }
      }
    }

    res.json({ success: true, message: 'User auth credentials updated securely' });
  } catch (error) {
    console.error('❌ Error updating user auth credentials:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Custom OTP Server running on http://localhost:${PORT}`);
});
