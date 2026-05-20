// routes/insurance.js
const express = require('express'); 
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { InsuranceClaim } = require('../models');
const { protect, collectorOnly } = require('../middleware/auth');
const { blockchain } = require('../utils/index');

// Multer configuration for photo uploads
const uploadDir = path.join(__dirname, '../uploads/insurance');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => cb(null, `${Date.now()}_${req.user._id}_${Math.random().toString(36).substr(2,9)}_${file.originalname}`)
});

const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) cb(null, true);
    else cb(new Error('Only images allowed'), false);
  },
  limits: { fileSize: 5 * 1024 * 1024, files: 5 }
});

router.use(protect);

router.post('/', upload.array('photos', 5), async (req, res) => {
  try {
    const { claimType, cropType, affectedArea, lossAmount, damagePercent, description, incidentDate, landId, cropId } = req.body;
    if (!claimType||!cropType||!lossAmount||!incidentDate) return res.status(400).json({ error: 'सर्व आवश्यक fields भरा.' });
    
    const photoPaths = req.files ? req.files.map(f => `/uploads/insurance/${f.filename}`) : [];
    
    const bc = await blockchain.executeContract(req.user._id, 'Insurance', 'fileClaim', { claimType, cropType, lossAmount });
    const claim = await InsuranceClaim.create({ 
      userId: req.user._id, 
      farmerName: req.user.name, 
      farmerMobile: req.user.mobile, 
      village: req.user.village, 
      district: req.user.district||'', 
      claimType, 
      cropType, 
      affectedArea: Number(affectedArea)||0, 
      lossAmount: Number(lossAmount), 
      damagePercent: Number(damagePercent)||0, 
      description: description||'', 
      incidentDate: new Date(incidentDate),
      photos: photoPaths,
      landId: landId||null, 
      cropId: cropId||null, 
      txHash: bc.txHash, 
      contractRef: 'KC_INS_'+Date.now() 
    });
    res.status(201).json({ success: true, claim });
  } catch (e) { res.status(500).json({ error: e.message }); }
});
router.get('/', async (req, res) => {
  try {
    const claims = await InsuranceClaim.find({ userId: req.user._id }).sort({ createdAt: -1 });
    res.json({ success: true, claims });
  } catch (e) { res.status(500).json({ error: e.message }); }
});
router.put('/:id/status', collectorOnly, async (req, res) => {
  try {
    const { status, approvedAmount, remarks } = req.body;
    const upd = { status, remarks: remarks||'', reviewedBy: req.user._id, reviewedAt: new Date() };
    if (approvedAmount) upd.approvedAmount = Number(approvedAmount);
    if (status === 'paid') upd.paidAt = new Date();
    const claim = await InsuranceClaim.findByIdAndUpdate(req.params.id, upd, { new: true });
    res.json({ success: true, claim });
  } catch (e) { res.status(500).json({ error: e.message }); }
});
router.get('/all', collectorOnly, async (req, res) => {
  try {
    const { status, page=1, limit=20 } = req.query;
    const filter = status ? { status } : {};
    const claims = await InsuranceClaim.find(filter).populate('userId','name mobile village district').sort({ createdAt: -1 }).limit(Number(limit)).skip((Number(page)-1)*Number(limit));
    const total = await InsuranceClaim.countDocuments(filter);
    res.json({ success: true, claims, total });
  } catch (e) { res.status(500).json({ error: e.message }); }
});
module.exports = router;
