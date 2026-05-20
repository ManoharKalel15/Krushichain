const express = require('express'); 
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { SubsidyApplication } = require('../models');
const { protect, collectorOnly } = require('../middleware/auth');

// Multer configuration for document uploads
const uploadDir = path.join(__dirname, '../uploads/subsidy');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => cb(null, `${Date.now()}_${req.user._id}_${Math.random().toString(36).substr(2,9)}_${file.originalname}`)
});

const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/') || file.mimetype === 'application/pdf') cb(null, true);
    else cb(new Error('Only images and PDF allowed'), false);
  },
  limits: { fileSize: 5 * 1024 * 1024, files: 5 }
});

router.use(protect);

router.post('/', upload.array('documents', 5), async (req, res) => {
  try {
    const { schemeName, schemeCode, amount, description, bankName, bankAccount, ifscCode } = req.body;
    if (!schemeName || !bankAccount || !ifscCode) return res.status(400).json({ error: 'सर्व आवश्यक fields भरा.' });
    
    const docPaths = req.files ? req.files.map(f => `/uploads/subsidy/${f.filename}`) : [];
    
    const app = await SubsidyApplication.create({ 
      userId: req.user._id, 
      farmerName: req.user.name, 
      farmerMobile: req.user.mobile, 
      village: req.user.village, 
      district: req.user.district||'', 
      schemeName, 
      schemeCode: schemeCode||'', 
      amount: Number(amount)||0, 
      description: description||'', 
      bankAccount: bankAccount||'',
      ifscCode: ifscCode||'',
      documents: docPaths,
      bankName: bankName||''
    });
    res.status(201).json({ success: true, application: app });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.get('/', async (req, res) => {
  try {
    const apps = await SubsidyApplication.find({ userId: req.user._id }).sort({ createdAt: -1 });
    res.json({ success: true, applications: apps });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.put('/:id/status', collectorOnly, async (req, res) => {
  try {
    const { status, approvedAmt, remarks, utrNumber } = req.body;
    const upd = { status, remarks: remarks||'', reviewedBy: req.user._id, reviewedAt: new Date() };
    if (approvedAmt) upd.approvedAmt = Number(approvedAmt);
    if (utrNumber)   upd.utrNumber = utrNumber;
    if (status === 'paid') upd.paidAt = new Date();
    const app = await SubsidyApplication.findByIdAndUpdate(req.params.id, upd, { new: true });
    res.json({ success: true, application: app });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.get('/all', collectorOnly, async (req, res) => {
  try {
    const { status, page=1, limit=20 } = req.query;
    const filter = status ? { status } : {};
    const apps = await SubsidyApplication.find(filter).populate('userId','name mobile village district').sort({ createdAt: -1 }).limit(Number(limit)).skip((Number(page)-1)*Number(limit));
    const total = await SubsidyApplication.countDocuments(filter);
    res.json({ success: true, applications: apps, total });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

module.exports = router;
