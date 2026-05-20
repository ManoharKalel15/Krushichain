// routes/collector.js
const express = require('express'); const router = express.Router();
const { User, Land, Crop, InsuranceClaim, SubsidyApplication } = require('../models');
const { protect, collectorOnly } = require('../middleware/auth');
router.use(protect, collectorOnly);

router.get('/dashboard', async (req, res) => {
  try {
    const [totalFarmers, totalLands, totalCrops, pendingClaims, pendingSubsidies, approvedClaims, paidSubsidies] = await Promise.all([
      User.countDocuments({ role:'shetkari', isActive:true }),
      Land.countDocuments({ isActive:true }),
      Crop.countDocuments({ isActive:true }),
      InsuranceClaim.countDocuments({ status:'submitted' }),
      SubsidyApplication.countDocuments({ status:'submitted' }),
      InsuranceClaim.countDocuments({ status:'approved' }),
      SubsidyApplication.countDocuments({ status:'paid' }),
    ]);
    res.json({ success:true, stats:{ totalFarmers, totalLands, totalCrops, pendingClaims, pendingSubsidies, approvedClaims, paidSubsidies } });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.get('/farmers', async (req, res) => {
  try {
    const { village, district, search, page=1, limit=25 } = req.query;
    const filter = { role:'shetkari', isActive:true };
    if (village)  filter.village  = new RegExp(village,'i');
    if (district) filter.district = new RegExp(district,'i');
    if (search)   filter.$or = [{ name: new RegExp(search,'i') }, { mobile: new RegExp(search,'i') }, { krushiId: new RegExp(search,'i') }];
    const farmers = await User.find(filter).select('-__v').sort({ createdAt:-1 }).limit(Number(limit)).skip((Number(page)-1)*Number(limit));
    const total = await User.countDocuments(filter);
    res.json({ success:true, farmers, total });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.get('/farmer/:id', async (req, res) => {
  try {
    const [farmer, lands, crops] = await Promise.all([
      User.findById(req.params.id).select('-__v'),
      Land.find({ userId:req.params.id, isActive:true }),
      Crop.find({ userId:req.params.id, isActive:true }),
    ]);
    if (!farmer) return res.status(404).json({ error: 'शेतकरी नाही.' });
    res.json({ success:true, farmer, lands, crops });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.put('/verify-land/:id', async (req, res) => {
  try {
    const land = await Land.findByIdAndUpdate(req.params.id, { status: req.body.status, remarks: req.body.remarks||'', verifiedBy: req.user._id, verifiedAt: new Date() }, { new:true });
    res.json({ success:true, land });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.get('/claims', async (req, res) => {
  try {
    const { status='submitted', page=1, limit=20 } = req.query;
    const filter = status === 'all' ? {} : { status };
    const claims = await InsuranceClaim.find(filter).populate('userId','name mobile village district').sort({ createdAt:-1 }).limit(Number(limit)).skip((Number(page)-1)*Number(limit));
    const total = await InsuranceClaim.countDocuments(filter);
    res.json({ success:true, claims, total });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.get('/subsidies', async (req, res) => {
  try {
    const { status='submitted', page=1, limit=20 } = req.query;
    const filter = status === 'all' ? {} : { status };
    const apps = await SubsidyApplication.find(filter).populate('userId','name mobile village district').sort({ createdAt:-1 }).limit(Number(limit)).skip((Number(page)-1)*Number(limit));
    const total = await SubsidyApplication.countDocuments(filter);
    res.json({ success:true, applications:apps, total });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

module.exports = router;
