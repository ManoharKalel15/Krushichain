const express = require('express'); const router = express.Router();
const { Land, User } = require('../models');
const { protect } = require('../middleware/auth');
const { blockchain } = require('../utils/index');
router.use(protect);

router.post('/', async (req, res) => {
  try {
    const { surveyNumber, areaAcres, cropType, village, taluka, district, utara712, latitude, longitude } = req.body;
    if (!surveyNumber||!areaAcres||!cropType||!village) return res.status(400).json({ error: 'Survey नंबर, क्षेत्र, पीक, गाव आवश्यक.' });
    const bc = await blockchain.executeContract(req.user._id, 'LandRegistry', 'registerLand', { surveyNumber, areaAcres, cropType, village });
    const land = await Land.create({ userId: req.user._id, ownerName: req.user.name, ownerMobile: req.user.mobile, surveyNumber, areaAcres: Number(areaAcres), cropType, village, taluka: taluka||req.user.taluka||'', district: district||req.user.district||'', utara712: utara712||'', latitude: latitude||null, longitude: longitude||null, txHash: bc.txHash, blockNumber: bc.blockNumber, contractAddr: bc.contractAddr });
    await User.findByIdAndUpdate(req.user._id, { $inc: { totalLands: 1 } });
    res.status(201).json({ success: true, land });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.get('/', async (req, res) => {
  try {
    const lands = await Land.find({ userId: req.user._id, isActive: true }).sort({ createdAt: -1 });
    res.json({ success: true, lands, total: lands.length });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.put('/:id', async (req, res) => {
  try {
    const land = await Land.findOneAndUpdate({ _id: req.params.id, userId: req.user._id }, req.body, { new: true });
    if (!land) return res.status(404).json({ error: 'जमीन नाही.' });
    res.json({ success: true, land });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.delete('/:id', async (req, res) => {
  try {
    await Land.findOneAndUpdate({ _id: req.params.id, userId: req.user._id }, { isActive: false });
    await User.findByIdAndUpdate(req.user._id, { $inc: { totalLands: -1 } });
    res.json({ success: true });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

module.exports = router;
