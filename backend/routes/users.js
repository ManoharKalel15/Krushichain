// routes/users.js
const express = require('express'); const r1 = express.Router();
const { User, Land, Crop } = require('../models');
const { protect } = require('../middleware/auth');
r1.put('/profile', protect, async (req, res) => {
  try {
    const allowed = ['name','village','taluka','district','bankAccount','ifscCode','bankName','lastLat','lastLng','lastLocation'];
    const upd = {}; allowed.forEach(k => { if (req.body[k] !== undefined) upd[k] = req.body[k]; });
    const user = await User.findByIdAndUpdate(req.user._id, upd, { new: true }).select('-__v');
    res.json({ success: true, user });
  } catch (e) { res.status(500).json({ error: e.message }); }
});
r1.get('/stats', protect, async (req, res) => {
  try {
    const [lands, crops] = await Promise.all([Land.countDocuments({ userId: req.user._id, isActive: true }), Crop.countDocuments({ userId: req.user._id, isActive: true })]);
    res.json({ success: true, stats: { lands, crops } });
  } catch (e) { res.status(500).json({ error: e.message }); }
});
r1.get('/public/:krushiId', async (req, res) => {
  try {
    const user = await User.findOne({ krushiId: req.params.krushiId }).lean();
    if (!user) return res.status(404).json({ error: 'Farmer not found' });
    
    // Fetch associated data
    const lands = await Land.find({ userId: user._id }).lean();
    const crops = await Crop.find({ userId: user._id }).lean();
    
    // Filter sensitive info from User
    const publicProfile = {
      krushiId: user.krushiId,
      name: user.name,
      village: user.village,
      district: user.district,
      mobile: user.mobile ? 'xxxxxx' + user.mobile.slice(-4) : 'N/A', // Masked
      aadhaar: user.aadhaar ? 'xxxx-xxxx-' + user.aadhaar.slice(-4) : 'Not Provided',
      bankName: user.bankName,
      createdAt: user.createdAt,
      // Aggregates
      lands,
      crops,
      // Mocks for IoT & Financials
      iotData: {
        soilMoisture: (30 + Math.random()*20).toFixed(0) + '%',
        temperature: (25 + Math.random()*10).toFixed(1) + '°C',
        humidity: (50 + Math.random()*20).toFixed(0) + '%',
        waterLevel: '80%',
        motorStatus: Math.random() > 0.5 ? 'ON' : 'OFF'
      },
      schemes: {
        pmKisan: 'Active',
        subsidyEligible: 'Yes',
        soilHealthCard: 'Available'
      },
      production: {
        expectedQuintal: '45 Q',
        soldQuantity: '30 Q',
        buyerDetails: 'ITC Agri Ltd.'
      }
    };
    
    res.json({ success: true, profile: publicProfile });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

module.exports = r1;
