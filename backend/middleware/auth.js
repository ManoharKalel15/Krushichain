// middleware/auth.js
const jwt  = require('jsonwebtoken');
const { User } = require('../models');

const protect = async (req, res, next) => {
  const auth = req.headers.authorization;
  if (!auth || !auth.startsWith('Bearer ')) return res.status(401).json({ error: 'लॉगिन आवश्यक आहे.' });
  try {
    const decoded = jwt.verify(auth.split(' ')[1], process.env.JWT_SECRET);
    req.user = await User.findById(decoded.id).select('-__v');
    if (!req.user || !req.user.isActive) return res.status(401).json({ error: 'Invalid token.' });
    next();
  } catch (e) {
    res.status(401).json({ error: 'Token expire झाला. पुन्हा login करा.' });
  }
};

const collectorOnly = (req, res, next) => {
  if (!['collector','minister'].includes(req.user?.role)) return res.status(403).json({ error: 'Collector/Minister only.' });
  next();
};

module.exports = { protect, collectorOnly };
