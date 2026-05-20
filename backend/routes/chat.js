// routes/chat.js
const express = require('express'); const chatRouter = express.Router();
const { ChatMessage } = require('../models');
const { protect } = require('../middleware/auth');
chatRouter.get('/:room', async (req, res) => {
  try {
    const msgs = await ChatMessage.find({ roomId: req.params.room }).sort({ createdAt: -1 }).limit(60).lean();
    res.json({ success: true, messages: msgs.reverse() });
  } catch (e) { res.status(500).json({ error: e.message }); }
});
chatRouter.post('/', protect, async (req, res) => {
  try {
    const { message, roomId='general' } = req.body;
    if (!message?.trim()) return res.status(400).json({ error: 'Message आवश्यक.' });
    const msg = await ChatMessage.create({ userId: req.user._id, name: req.user.name, village: req.user.village, role: req.user.role, message: message.trim(), roomId });
    const io = req.app.get('io');
    if (io) io.to(roomId).emit('newMessage', msg);
    res.status(201).json({ success: true, message: msg });
  } catch (e) { res.status(500).json({ error: e.message }); }
});
module.exports = chatRouter;
