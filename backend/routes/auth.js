const express = require('express');
const jwt     = require('jsonwebtoken');
const router  = express.Router();
const { User, OTP } = require('../models');
const { generateOTP, sendOTP } = require('../utils/index');
const { protect } = require('../middleware/auth');

const signToken = id => jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRE || '30d' });

const sanitize = u => ({
  _id: u._id, name: u.name, mobile: u.mobile, role: u.role,
  village: u.village, taluka: u.taluka, district: u.district,
  krushiId: u.krushiId, bankAccount: u.bankAccount, ifscCode: u.ifscCode,
  bankName: u.bankName, isVerified: u.isVerified, totalLands: u.totalLands,
  totalCrops: u.totalCrops, lastLat: u.lastLat, lastLng: u.lastLng,
  lastLocation: u.lastLocation, createdAt: u.createdAt,
});

// POST /api/auth/send-otp
router.post('/send-otp', async (req, res) => {
  try {
    const { mobile, purpose = 'login' } = req.body;
    if (!mobile || !/^\d{10}$/.test(mobile)) return res.status(400).json({ error: '10 अंकांचा valid mobile नंबर.' });
    if (purpose === 'login') {
      const exists = await User.findOne({ mobile: `+91${mobile}` });
      if (!exists) return res.status(404).json({ error: 'हा नंबर नोंदणीकृत नाही. आधी नोंदणी करा.' });
    }
    await OTP.deleteMany({ mobile: `+91${mobile}` });
    const code = generateOTP();
    await OTP.create({ mobile: `+91${mobile}`, otp: code, purpose });
    const result = await sendOTP(mobile, code);
    const response = { success: true, message: `OTP पाठवला`, mode: result.mode, testOTP: code };
    res.json(response);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// POST /api/auth/register
router.post('/register', async (req, res) => {
  try {
    const { name, mobile, aadhaarLast4, otp, role='shetkari', village, taluka, district, bankAccount, ifscCode, bankName } = req.body;
    if (!name||!mobile||!aadhaarLast4||!otp||!village) return res.status(400).json({ error: 'सर्व आवश्यक fields भरा.' });
    if (!/^\d{10}$/.test(mobile)) return res.status(400).json({ error: 'Valid mobile नंबर.' });
    if (!/^\d{4}$/.test(aadhaarLast4)) return res.status(400).json({ error: 'Aadhaar चे शेवटचे 4 अंक.' });
    const existing = await User.findOne({ mobile: `+91${mobile}` });
    if (existing) return res.status(400).json({ error: 'हा नंबर आधीच नोंदणीकृत. Login करा.' });
    const otpDoc = await OTP.findOne({ mobile: `+91${mobile}`, verified: false });
    if (!otpDoc) return res.status(400).json({ error: 'OTP नाही. आधी OTP मागवा.' });
    if (new Date() > otpDoc.expiresAt) return res.status(400).json({ error: 'OTP expire झाला.' });
    otpDoc.attempts++;
    if (otpDoc.attempts > 5) { await OTP.deleteMany({ mobile: `+91${mobile}` }); return res.status(400).json({ error: 'खूप प्रयत्न. नवीन OTP.' }); }
    if (otpDoc.otp !== String(otp)) { await otpDoc.save(); return res.status(400).json({ error: `चुकीचा OTP. ${5-otpDoc.attempts} प्रयत्न बाकी.` }); }
    otpDoc.verified = true; await otpDoc.save();
    const user = await User.create({ name: name.trim(), mobile: `+91${mobile}`, aadhaarLast4, role, village: village.trim(), taluka: taluka||'', district: district||'', bankAccount: bankAccount||'', ifscCode: ifscCode||'', bankName: bankName||'' });
    res.status(201).json({ success: true, token: signToken(user._id), user: sanitize(user) });
  } catch (e) {
    if (e.code === 11000) return res.status(400).json({ error: 'हा नंबर आधीच नोंदणीकृत.' });
    res.status(500).json({ error: e.message });
  }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { mobile, otp } = req.body;
    if (!mobile || !otp) return res.status(400).json({ error: 'Mobile आणि OTP आवश्यक.' });
    const user = await User.findOne({ mobile: `+91${mobile}` });
    if (!user) return res.status(404).json({ error: 'हा नंबर नोंदणीकृत नाही.' });
    const otpDoc = await OTP.findOne({ mobile: `+91${mobile}`, verified: false });
    if (!otpDoc) return res.status(400).json({ error: 'OTP नाही. आधी OTP मागवा.' });
    if (new Date() > otpDoc.expiresAt) return res.status(400).json({ error: 'OTP expire झाला.' });
    otpDoc.attempts++;
    if (otpDoc.attempts > 5) { await OTP.deleteMany({ mobile: `+91${mobile}` }); return res.status(400).json({ error: 'खूप प्रयत्न.' }); }
    if (otpDoc.otp !== String(otp)) { await otpDoc.save(); return res.status(400).json({ error: `चुकीचा OTP.` }); }
    otpDoc.verified = true; await otpDoc.save();
    res.json({ success: true, token: signToken(user._id), user: sanitize(user) });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// GET /api/auth/me
router.get('/me', protect, (req, res) => res.json({ success: true, user: sanitize(req.user) }));

const axios = require('axios');

// POST /api/auth/google
router.post('/google', async (req, res) => {
  try {
    const { token } = req.body;
    if (!token) return res.status(400).json({ error: 'Google Token आवश्यक.' });

    let payload;
    try {
      // Validate access token and get user info directly from Google
      const googleRes = await axios.get('https://www.googleapis.com/oauth2/v3/userinfo', {
        headers: { Authorization: `Bearer ${token}` }
      });
      payload = googleRes.data;
    } catch(err) {
      if (!process.env.GOOGLE_CLIENT_ID || process.env.GOOGLE_CLIENT_ID === 'your_google_client_id_here') {
        // Mock fallback for presentation if Google Auth fails (e.g., placeholder tokens)
        payload = { email: 'demo@shetkari.com', name: 'Demo Farmer', sub: 'mock123' };
      } else {
        throw new Error('Google token verify failed');
      }
    }

    const { email, name, sub: googleId } = payload;

    if (!email) return res.status(400).json({ error: 'Google Account ला Email लिंक नाही.' });

    let user = await User.findOne({ email });

    if (!user) {
      user = await User.findOne({ googleId });
    }

    if (!user) {
      user = await User.create({
        name: name || 'Google User',
        email,
        googleId,
        role: 'shetkari',
        village: 'Online',
        district: '',
        taluka: '',
        isVerified: true
      });
    }

    res.json({ success: true, token: signToken(user._id), user: sanitize(user) });
  } catch (e) {
    console.error('Google Auth Error:', e.response?.data || e.message);
    res.status(500).json({ error: 'Google Login फेल झाले.' });
  }
});

module.exports = router;
