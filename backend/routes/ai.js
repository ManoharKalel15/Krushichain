const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');

// GET /api/ai/predict
router.get('/predict', protect, async (req, res) => {
  try {
    const { crop } = req.query;
    
    // Base simulation logic combining Mock Sensor + APMC Data
    const marketRates = {
      'कांदा': { rate: 2500, history: 'down', demand: 90, risk: 'High', profitMargin: '40%' },
      'सोयाबीन': { rate: 4500, history: 'stable', demand: 70, risk: 'Low', profitMargin: '25%' },
      'कापूस': { rate: 7100, history: 'up', demand: 85, risk: 'Medium', profitMargin: '55%' },
      'गहू': { rate: 2200, history: 'stable', demand: 95, risk: 'Very Low', profitMargin: '20%' },
      'टोमॅटो': { rate: 1200, history: 'down', demand: 60, risk: 'High', profitMargin: '10%' }
    };

    const target = marketRates[crop] || marketRates['कापूस'];
    
    // Generative insights
    const riskScore = target.risk === 'High' ? 85 : target.risk === 'Medium' ? 50 : 20;

    const mockData = {
      cropAnalysis: {
        name: crop || 'कापूस',
        demandMeter: target.demand, // percentage
        profitPrediction: target.profitMargin,
        riskAlert: target.risk,
        riskScore: riskScore,
        districtHeatmap: 'जळगाव, अकोला, यवतमाळ मध्ये जास्त लागवड (Over-supply Expected)',
        priceCrashRisk: target.history === 'down',
        waterPrediction: '२०,००० लिटर / एकर',
        bestSellingTime: target.risk === 'High' ? 'लगेच विका' : '२ महिने साठवणूक करा (Storage Advice)'
      },
      nearbyFarmers: [
        { crop: 'सोयाबीन', percentage: 45 },
        { crop: 'कापूस', percentage: 35 },
        { crop: 'कांदा', percentage: 20 }
      ],
      aiSuggestions: {
        bestCropRecommendation: 'सध्याच्या हवामानानुसार "हरभरा (Gram)" लावणे अधिक नफ्याचे ठरू शकते.',
        fertilizer: 'DAP २५ किलो / एकर + सेंद्रिय खत',
        diseaseAlert: 'पुढील ४ दिवसात पाऊस अपेक्षित असल्याने "मर रोग (Wilt)" येण्याची शक्यता आहे.' // AI Disease Detection mock
      },
      smartContract: {
        available: true,
        company: 'ITC Agri / Mahyco',
        preBookingPrice: target.rate + 300,
        unit: 'per quintal'
      }
    };

    res.json({ success: true, aiData: mockData });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

module.exports = router;
