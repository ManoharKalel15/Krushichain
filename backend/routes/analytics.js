const express = require('express'); const router = express.Router();
const { User, Land, Crop, MarketListing, InsuranceClaim, SubsidyApplication } = require('../models');
const { protect, collectorOnly } = require('../middleware/auth');
router.use(protect);

router.get('/farmer', async (req, res) => {
  try {
    const uid = req.user._id;
    const [lands, crops, claims, subsidies] = await Promise.all([
      Land.find({ userId:uid, isActive:true }).select('areaAcres cropType createdAt'),
      Crop.find({ userId:uid, isActive:true }).select('cropType status expectedYield actualYield createdAt'),
      InsuranceClaim.find({ userId:uid }).select('status lossAmount approvedAmount createdAt'),
      SubsidyApplication.find({ userId:uid }).select('status schemeName approvedAmt createdAt'),
    ]);
    const totalArea   = lands.reduce((s,l) => s + (l.areaAcres||0), 0);
    const totalIncome = subsidies.filter(s=>s.status==='paid').reduce((s,x) => s + (x.approvedAmt||0), 0);
    const claimsPaid  = claims.filter(c=>c.status==='paid').reduce((s,c) => s + (c.approvedAmount||0), 0);
    res.json({ success:true, analytics:{ totalArea, totalLands:lands.length, totalCrops:crops.length, totalClaims:claims.length, totalSubsidies:subsidies.length, totalIncome: totalIncome + claimsPaid, lands, crops, claims, subsidies } });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.get('/district', collectorOnly, async (req, res) => {
  try {
    const [farmers, lands, crops, claims, subsidies] = await Promise.all([
      User.countDocuments({ role:'shetkari' }),
      Land.countDocuments({ isActive:true }),
      Crop.countDocuments({ isActive:true }),
      InsuranceClaim.find().select('status lossAmount approvedAmount'),
      SubsidyApplication.find().select('status approvedAmt'),
    ]);
    const claimAmt = claims.filter(c=>c.status==='paid').reduce((s,c)=>s+(c.approvedAmount||0),0);
    const subAmt   = subsidies.filter(s=>s.status==='paid').reduce((s,x)=>s+(x.approvedAmt||0),0);
    const cropDist = await Crop.aggregate([{ $group:{ _id:'$cropType', count:{$sum:1} } }]);
    const villageDist = await User.aggregate([{ $match:{role:'shetkari'} },{ $group:{_id:'$village', count:{$sum:1}} },{ $sort:{count:-1} },{ $limit:10 }]);
    res.json({ success:true, analytics:{ farmers, lands, crops, totalClaims:claims.length, totalSubsidies:subsidies.length, totalDisbursed: claimAmt+subAmt, cropDistribution:cropDist, villageDistribution:villageDist } });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

module.exports = router;
