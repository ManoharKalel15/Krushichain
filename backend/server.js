const path = require('path')
require('dotenv').config({ path: path.join(__dirname, '.env') })

// ── Direct hardcoded fallback (works without .env) ───
if (!process.env.MONGO_URI) {
  process.env.MONGO_URI    = 'mongodb://krushi:krushi123@ac-zvaq6pz-shard-00-00.qnymvvv.mongodb.net:27017,ac-zvaq6pz-shard-00-01.qnymvvv.mongodb.net:27017,ac-zvaq6pz-shard-00-02.qnymvvv.mongodb.net:27017/krushichain?ssl=true&replicaSet=atlas-e3evtn-shard-0&authSource=admin&appName=Cluster0'
  process.env.JWT_SECRET   = 'krushichain_pilot_secret_2024'
  process.env.JWT_EXPIRE   = '30d'
  process.env.PORT         = '5001'
  process.env.SMS_PROVIDER = 'test'
  process.env.NODE_ENV     = 'development'
  process.env.FRONTEND_URL = 'http://localhost:5173'
  console.log('ℹ️  .env file नाही – hardcoded values वापरत आहे')
}

const express    = require('express')
const http       = require('http')
const { Server } = require('socket.io')
const mongoose   = require('mongoose')
const cors       = require('cors')
const helmet     = require('helmet')
const morgan     = require('morgan')
const rateLimit  = require('express-rate-limit')

const app    = express()
const server = http.createServer(app)
const io     = new Server(server, {
  cors: { origin: process.env.FRONTEND_URL || '*', credentials: true }
})

app.use(helmet({ contentSecurityPolicy: false }))
app.use(cors({ origin: process.env.FRONTEND_URL || '*', credentials: true }))
app.use(express.json({ limit: '10mb' }))
app.use(morgan('dev'))
app.use(rateLimit({ windowMs: 15 * 60 * 1000, max: 500 }))

// Serve uploaded files statically
app.use('/uploads', express.static(path.join(__dirname, 'uploads')))

let isDbConnecting = false;
async function connectDB() {
  if (mongoose.connection.readyState >= 1) return;
  if (isDbConnecting) return;
  isDbConnecting = true;
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 8000
    });
    console.log('✅ MongoDB Connected!');
  } catch (err) {
    console.error('❌ MongoDB:', err.message);
  } finally {
    isDbConnecting = false;
  }
}

connectDB();

// Middleware ensuring DB connection for serverless/cold starts
app.use(async (req, res, next) => {
  if (mongoose.connection.readyState === 0) {
    await connectDB();
  }
  next();
});

// Initialize Blockchain
require('./utils/blockchain').initBlockchain();

app.use('/api/auth',      require('./routes/auth'))
app.use('/api/users',     require('./routes/users'))
app.use('/api/lands',     require('./routes/lands'))
app.use('/api/crops',     require('./routes/crops'))
app.use('/api/market',    require('./routes/market'))
app.use('/api/insurance', require('./routes/insurance'))
app.use('/api/subsidy',   require('./routes/subsidy'))
app.use('/api/schemes',   require('./routes/schemes'))
app.use('/api/chat',      require('./routes/chat'))
app.use('/api/iot',       require('./routes/iot'))
app.use('/api/collector', require('./routes/collector'))
app.use('/api/analytics', require('./routes/analytics'))
app.use('/api/ai',        require('./routes/ai'))
app.use('/api/blockchain',require('./routes/blockchain'))
app.get('/api/health', (req, res) =>
  res.json({
    status: 'ok',
    app: 'KrushiChain Pilot',
    db: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
    time: new Date()
  })
)

const onlineUsers = new Map()
io.on('connection', (socket) => {
  socket.on('join', (userData) => {
    onlineUsers.set(socket.id, userData)
    io.emit('onlineCount', onlineUsers.size)
    socket.broadcast.emit('userJoined', userData)
  })
  socket.on('joinRoom',  (room) => socket.join(room))
  socket.on('leaveRoom', (room) => socket.leave(room))
  socket.on('chatMessage', async (data) => {
    try {
      const ChatMessage = require('./models').ChatMessage
      const msg = await ChatMessage.create({ ...data })
      io.to(data.roomId || 'general').emit('newMessage', msg)
    } catch(e) { console.error('Chat error:', e.message) }
  })
  socket.on('iotReading', (data) => io.emit('iotUpdate', data))
  socket.on('disconnect', () => {
    onlineUsers.delete(socket.id)
    io.emit('onlineCount', onlineUsers.size)
  })
})

app.set('io', io)

app.use((err, req, res, next) => {
  console.error(err.stack)
  res.status(500).json({ error: 'Server error', message: err.message })
})

const PORT = process.env.PORT || 5001

if (!process.env.VERCEL) {
  server.listen(PORT, () => {
    console.log(`\n🌾 KrushiChain Backend: http://localhost:${PORT}`)
    console.log(`📡 Socket.IO ready\n`)
  })
}

module.exports = app
module.exports.server = server