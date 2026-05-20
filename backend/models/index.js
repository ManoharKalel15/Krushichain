const mongoose = require('mongoose');
const { Schema } = mongoose;

// ── User ──────────────────────────────────────────
const userSchema = new Schema({
  name:         { type: String, required: true, trim: true },
  mobile:       { type: String, unique: true, sparse: true, default: null },
  email:        { type: String, unique: true, sparse: true, default: null },
  googleId:     { type: String, default: '' },
  aadhaarLast4: { type: String, default: '' },
  role:         { type: String, enum: ['shetkari','collector','minister'], default: 'shetkari' },
  village:      { type: String, default: 'Online' },
  taluka:       { type: String, default: '' },
  district:     { type: String, default: '' },
  bankAccount:  { type: String, default: '' },
  ifscCode:     { type: String, default: '' },
  bankName:     { type: String, default: '' },
  krushiId:     { type: String, unique: true },
  isVerified:   { type: Boolean, default: false },
  isActive:     { type: Boolean, default: true },
  totalLands:   { type: Number, default: 0 },
  totalCrops:   { type: Number, default: 0 },
  lastLat:      { type: Number, default: null },
  lastLng:      { type: Number, default: null },
  lastLocation: { type: String, default: '' },
  assignedArea: { type: [String], default: [] },
  fcmToken:     { type: String, default: '' },
}, { timestamps: true });

userSchema.pre('save', async function(next) {
  if (!this.krushiId) {
    const count = await mongoose.model('User').countDocuments();
    const dist  = (this.district || 'MH').substring(0,2).toUpperCase();
    this.krushiId = `KC-${dist}-${String(count + 1).padStart(5,'0')}`;
  }
  next();
});
const User = mongoose.model('User', userSchema);

// ── OTP ───────────────────────────────────────────
const otpSchema = new Schema({
  mobile:    { type: String, required: true },
  otp:       { type: String, required: true },
  purpose:   { type: String, default: 'login' },
  attempts:  { type: Number, default: 0 },
  verified:  { type: Boolean, default: false },
  expiresAt: { type: Date, default: () => new Date(Date.now() + 10*60*1000) }
}, { timestamps: true });
otpSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
const OTP = mongoose.model('OTP', otpSchema);

// ── Land ──────────────────────────────────────────
const landSchema = new Schema({
  userId:       { type: Schema.Types.ObjectId, ref: 'User', required: true },
  ownerName:    { type: String, required: true },
  ownerMobile:  { type: String, required: true },
  surveyNumber: { type: String, required: true },
  areaAcres:    { type: Number, required: true },
  cropType:     { type: String, required: true },
  village:      { type: String, required: true },
  taluka:       { type: String, default: '' },
  district:     { type: String, default: '' },
  utara712:     { type: String, default: '' },
  documentUrl:  { type: String, default: '' },
  latitude:     { type: Number, default: null },
  longitude:    { type: Number, default: null },
  txHash:       { type: String, default: '' },
  blockNumber:  { type: Number, default: null },
  contractAddr: { type: String, default: '' },
  status:       { type: String, enum: ['pending','verified','rejected'], default: 'pending' },
  verifiedBy:   { type: Schema.Types.ObjectId, ref: 'User', default: null },
  verifiedAt:   { type: Date, default: null },
  remarks:      { type: String, default: '' },
  isActive:     { type: Boolean, default: true },
}, { timestamps: true });
const Land = mongoose.model('Land', landSchema);

// ── Crop ──────────────────────────────────────────
const cropSchema = new Schema({
  userId:        { type: Schema.Types.ObjectId, ref: 'User', required: true },
  landId:        { type: Schema.Types.ObjectId, ref: 'Land', default: null },
  farmerName:    { type: String, required: true },
  cropType:      { type: String, required: true },
  variety:       { type: String, default: '' },
  sowingDate:    { type: Date, required: true },
  harvestDate:   { type: Date, default: null },
  areaAcres:     { type: Number, default: 0 },
  fertilizer:    { type: String, default: '' },
  pesticide:     { type: String, default: '' },
  irrigation:    { type: String, default: '' },
  expectedYield: { type: Number, default: 0 },
  actualYield:   { type: Number, default: 0 },
  sellRate:      { type: Number, default: 0 },
  nftTokenId:    { type: String, default: '' },
  txHash:        { type: String, default: '' },
  diseaseAlerts: { type: [{ disease: String, confidence: Number, remedy: String, detectedAt: Date }], default: [] },
  status:        { type: String, enum: ['growing','ready','harvested','sold'], default: 'growing' },
  isActive:      { type: Boolean, default: true },
}, { timestamps: true });
const Crop = mongoose.model('Crop', cropSchema);

// ── MarketListing ─────────────────────────────────
const listingSchema = new Schema({
  userId:      { type: Schema.Types.ObjectId, ref: 'User', required: true },
  farmerName:  { type: String, required: true },
  village:     { type: String, required: true },
  district:    { type: String, default: '' },
  mobile:      { type: String, required: true },
  cropType:    { type: String, required: true },
  quantity:    { type: Number, required: true },
  unit:        { type: String, enum: ['kg','quintal','ton'], default: 'kg' },
  price:       { type: Number, required: true },
  minQty:      { type: Number, default: 1 },
  grade:       { type: String, enum: ['A','B','C','mixed'], default: 'A' },
  description: { type: String, default: '' },
  availableFrom:{ type: Date, default: Date.now },
  expiresAt:   { type: Date, default: () => new Date(Date.now() + 7*24*60*60*1000) },
  latitude:    { type: Number, default: null },
  longitude:   { type: Number, default: null },
  status:      { type: String, enum: ['active','sold','expired','cancelled'], default: 'active' },
  views:       { type: Number, default: 0 },
  inquiries:   { type: Number, default: 0 },
  isActive:    { type: Boolean, default: true },
}, { timestamps: true });
const MarketListing = mongoose.model('MarketListing', listingSchema);

// ── InsuranceClaim ────────────────────────────────
const claimSchema = new Schema({
  userId:        { type: Schema.Types.ObjectId, ref: 'User', required: true },
  cropId:        { type: Schema.Types.ObjectId, ref: 'Crop', default: null },
  landId:        { type: Schema.Types.ObjectId, ref: 'Land', default: null },
  farmerName:    { type: String, required: true },
  farmerMobile:  { type: String, required: true },
  village:       { type: String, required: true },
  district:      { type: String, default: '' },
  claimType:     { type: String, required: true },
  cropType:      { type: String, required: true },
  affectedArea:  { type: Number, default: 0 },
  lossAmount:    { type: Number, required: true },
  damagePercent: { type: Number, default: 0 },
  photos:        { type: [String], default: [] },
  description:   { type: String, default: '' },
  incidentDate:  { type: Date, required: true },
  txHash:        { type: String, default: '' },
  contractRef:   { type: String, default: '' },
  status:        { type: String, enum: ['submitted','under_review','approved','rejected','paid'], default: 'submitted' },
  approvedAmount:{ type: Number, default: 0 },
  reviewedBy:    { type: Schema.Types.ObjectId, ref: 'User', default: null },
  reviewedAt:    { type: Date, default: null },
  remarks:       { type: String, default: '' },
  paidAt:        { type: Date, default: null },
}, { timestamps: true });
const InsuranceClaim = mongoose.model('InsuranceClaim', claimSchema);

// ── SubsidyApplication ────────────────────────────
const subsidySchema = new Schema({
  userId:       { type: Schema.Types.ObjectId, ref: 'User', required: true },
  farmerName:   { type: String, required: true },
  farmerMobile: { type: String, required: true },
  village:      { type: String, required: true },
  district:     { type: String, default: '' },
  schemeName:   { type: String, required: true },
  schemeCode:   { type: String, default: '' },
  amount:       { type: Number, default: 0 },
  description:  { type: String, default: '' },
  documents:    { type: [{ name: String, url: String }], default: [] },
  bankAccount:  { type: String, default: '' },
  ifscCode:     { type: String, default: '' },
  status:       { type: String, enum: ['submitted','under_review','approved','rejected','paid'], default: 'submitted' },
  approvedAmt:  { type: Number, default: 0 },
  reviewedBy:   { type: Schema.Types.ObjectId, ref: 'User', default: null },
  reviewedAt:   { type: Date, default: null },
  remarks:      { type: String, default: '' },
  paidAt:       { type: Date, default: null },
  utrNumber:    { type: String, default: '' },
}, { timestamps: true });
const SubsidyApplication = mongoose.model('SubsidyApplication', subsidySchema);

// ── ChatMessage ───────────────────────────────────
const chatSchema = new Schema({
  userId:  { type: Schema.Types.ObjectId, ref: 'User', default: null },
  name:    { type: String, required: true },
  village: { type: String, default: '' },
  role:    { type: String, default: 'shetkari' },
  message: { type: String, required: true, maxlength: 500 },
  roomId:  { type: String, default: 'general' },
  likes:   { type: Number, default: 0 },
}, { timestamps: true });
chatSchema.index({ roomId: 1, createdAt: -1 });
const ChatMessage = mongoose.model('ChatMessage', chatSchema);

// ── IoTReading ────────────────────────────────────
const iotSchema = new Schema({
  userId:       { type: Schema.Types.ObjectId, ref: 'User', required: true },
  landId:       { type: Schema.Types.ObjectId, ref: 'Land', default: null },
  deviceId:     { type: String, required: true },
  temperature:  { type: Number, default: 0 },
  humidity:     { type: Number, default: 0 },
  soilMoisture: { type: Number, default: 0 },
  soilPH:       { type: Number, default: 0 },
  lightLevel:   { type: Number, default: 0 },
  windSpeed:    { type: Number, default: 0 },
  rainfall:     { type: Number, default: 0 },
  latitude:     { type: Number, default: null },
  longitude:    { type: Number, default: null },
}, { timestamps: true });
const IoTReading = mongoose.model('IoTReading', iotSchema);

// ── BlockchainTx ──────────────────────────────────
const txSchema = new Schema({
  userId:     { type: Schema.Types.ObjectId, ref: 'User' },
  txHash:     { type: String, required: true, unique: true },
  contract:   { type: String, required: true },
  method:     { type: String, required: true },
  params:     { type: Schema.Types.Mixed },
  blockNumber:{ type: Number },
  gasUsed:    { type: Number },
  status:     { type: String, enum: ['pending','confirmed','failed'], default: 'confirmed' },
  network:    { type: String, default: 'KrushiChain-Testnet' },
}, { timestamps: true });
const BlockchainTx = mongoose.model('BlockchainTx', txSchema);

module.exports = { User, OTP, Land, Crop, MarketListing, InsuranceClaim, SubsidyApplication, ChatMessage, IoTReading, BlockchainTx };
