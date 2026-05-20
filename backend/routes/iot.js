const express = require('express'); const router = express.Router();
const { IoTReading } = require('../models');
const { protect } = require('../middleware/auth');

router.post('/', protect, async (req, res) => {
  try {
    const reading = await IoTReading.create({ ...req.body, userId: req.user._id });
    const io = req.app.get('io');
    if (io) io.emit('iotUpdate', { ...reading.toObject(), farmerName: req.user.name });
    res.status(201).json({ success: true, reading });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.get('/latest', protect, async (req, res) => {
  try {
    const reading = await IoTReading.findOne({ userId: req.user._id }).sort({ createdAt: -1 });
    if (!reading) {
      return res.json({ success: true, reading: { temperature: (25 + Math.random()*8).toFixed(1), humidity: (60 + Math.random()*30).toFixed(0), soilMoisture: (30 + Math.random()*40).toFixed(0), soilPH: (6.2 + Math.random()*1.2).toFixed(1), lightLevel: (600 + Math.random()*500).toFixed(0), windSpeed: (5 + Math.random()*20).toFixed(1), rainfall: 0, simulated: true }, simulated: true });
    }
    res.json({ success: true, reading });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.get('/live', protect, async (req, res) => {
  const temp = (25 + Math.random() * 12); // 25 to 37
  const soilMois = (20 + Math.random() * 60); // 20 to 80
  
  // Smart Motor Logic: IF moisture < 40 = ON, IF > 65 = OFF. Since it's randomized, we'll just check soilMois threshold.
  const isMotorOn = soilMois < 45;
  const isRainning = Math.random() > 0.8; // 20% chance of rain

  const r = { 
    temperature: temp.toFixed(1),
    humidity: (50 + Math.random() * 40).toFixed(0),
    soilMoisture: soilMois.toFixed(0),
    soilPH: (6.2 + Math.random() * 1.5).toFixed(1),
    lightLevel: (400 + Math.random() * 800).toFixed(0),
    windSpeed: (5 + Math.random() * 25).toFixed(1),
    waterLevel: (isMotorOn ? (20 + Math.random()*20) : (60 + Math.random()*40)).toFixed(0), // If motor is on, means pumping from tank
    rainStatus: isRainning ? 'Yes' : 'No',
    motorStatus: isMotorOn ? 'ON' : 'OFF',
    gps: '19.0760° N, 72.8777° E',
    simulated: true, 
    time: new Date() 
  };
  res.json({ success: true, reading: r });
});

router.get('/history', protect, async (req, res) => {
  try {
    const readings = await IoTReading.find({ userId: req.user._id }).sort({ createdAt: -1 }).limit(24).lean();
    res.json({ success: true, readings });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

module.exports = router;
