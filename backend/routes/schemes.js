// routes/schemes.js
const express = require('express'); const sRouter = express.Router();
const SCHEMES = [
  { code:'PMKISAN',  name:'PM किसान निधी',              benefit:'₹6,000/वर्ष थेट बँकेत',       deadline:'31 Jan 2025', category:'income',      amount:6000 },
  { code:'SOLAR',    name:'मुख्यमंत्री सौर कृषी वाहिनी', benefit:'सौर पंपावर 90% सबसिडी',       deadline:'28 Feb 2025', category:'equipment',   amount:50000 },
  { code:'GOPINATH', name:'गोपीनाथ मुंडे अपघात विमा',   benefit:'₹2 लाख अपघात सहाय्य',        deadline:'सदैव',       category:'insurance',   amount:200000 },
  { code:'KCC',      name:'KCC कर्ज योजना',             benefit:'4% व्याजदरात ₹3 लाख कर्ज',   deadline:'वर्षभर',      category:'loan',        amount:300000 },
  { code:'DRIP',     name:'ड्रीप सिंचन सबसिडी',          benefit:'55% सबसिडी ड्रीप वर',         deadline:'31 Mar 2025', category:'irrigation',  amount:25000 },
  { code:'YANTRA',   name:'कृषी यंत्र सबसिडी',           benefit:'ट्रॅक्टर/यंत्रावर 50% अनुदान', deadline:'15 Feb 2025', category:'equipment',   amount:75000 },
  { code:'PMFBY',    name:'PMFBY पीक विमा',             benefit:'मामुली प्रीमियमवर संरक्षण',   deadline:'Dec 31',      category:'insurance',   amount:30000 },
  { code:'NANO',     name:'नानाजी देशमुख कृषी संजीवनी', benefit:'पाणलोट आणि आधुनिकीकरण',      deadline:'वर्षभर',      category:'development', amount:40000 },
];
sRouter.get('/', (req, res) => res.json({ success: true, schemes: SCHEMES }));
sRouter.get('/:code', (req, res) => {
  const s = SCHEMES.find(x => x.code === req.params.code.toUpperCase());
  if (!s) return res.status(404).json({ error: 'योजना नाही.' });
  res.json({ success: true, scheme: s });
});
module.exports = sRouter;
