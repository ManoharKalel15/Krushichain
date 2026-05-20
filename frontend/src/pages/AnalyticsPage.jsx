import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend, AreaChart, Area } from 'recharts';
import api from '../config/api';
import { LoadingCenter } from '../components/UI';
import { motion, AnimatePresence } from 'framer-motion';
import { BarChart3, PieChart as PieIcon, TrendingUp, Activity, Layers, Shield, Coins, Map, Leaf, Clock, ChevronRight, Zap } from 'lucide-react';

const COLORS = ['#10b981','#f59e0b','#3b82f6','#ef4444','#8b5cf6','#14b8a6','#f97316','#64748b'];
const GRADIENT_COLORS = [
  ['#10b981','#059669'],
  ['#f59e0b','#d97706'],
  ['#3b82f6','#2563eb'],
  ['#ef4444','#dc2626']
];

// Animated counter component
function AnimatedNumber({ value, prefix = '', suffix = '' }) {
  const [display, setDisplay] = useState(0);
  useEffect(() => {
    const num = typeof value === 'number' ? value : parseFloat(String(value).replace(/[^\d.]/g, '')) || 0;
    let start = 0;
    const duration = 1200;
    const startTime = Date.now();
    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(Math.floor(eased * num));
      if (progress < 1) requestAnimationFrame(animate);
      else setDisplay(num);
    };
    animate();
  }, [value]);
  return <>{prefix}{typeof value === 'number' ? display.toLocaleString('mr-IN') : display}{suffix}</>;
}

// Custom Tooltip
const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: 'rgba(15,23,42,0.95)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', padding: '14px 18px', color: '#fff', boxShadow: '0 20px 40px rgba(0,0,0,0.3)' }}>
      <div style={{ fontSize: '13px', fontWeight: 800, marginBottom: '8px' }}>{label}</div>
      {payload.map((p, i) => (
        <div key={i} style={{ fontSize: '12px', display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
          <div style={{ width: 10, height: 10, borderRadius: '50%', background: p.color }} />
          <span style={{ opacity: 0.8 }}>{p.name}:</span>
          <span style={{ fontWeight: 700 }}>{p.value}</span>
        </div>
      ))}
    </div>
  );
};

// Variants
const containerVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.12 } }
};
const itemVariants = {
  hidden: { opacity: 0, y: 30, scale: 0.95 },
  show: { opacity: 1, y: 0, scale: 1, transition: { type: 'spring', stiffness: 300, damping: 25 } }
};

export default function AnalyticsPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/analytics/farmer')
      .then(r => setData(r.data.analytics))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingCenter text="Analytics लोड होत आहे..." />;
  if (!data) return (
    <div className="card" style={{ textAlign: 'center', padding: '60px' }}>
      <BarChart3 size={48} style={{ color: 'var(--text3)', margin: '0 auto 16px' }} />
      <div style={{ fontSize: '18px', fontWeight: 700 }}>Analytics उपलब्ध नाही.</div>
    </div>
  );

  const cropDist = data.crops.reduce((acc, c) => {
    const ex = acc.find(a => a.name === c.cropType);
    if (ex) ex.value++; else acc.push({ name: c.cropType, value: 1 });
    return acc;
  }, []);

  const statusData = [
    {
      name: 'विमा दावे',
      submitted: data.claims.filter(c => c.status === 'submitted').length,
      approved: data.claims.filter(c => c.status === 'approved').length,
      paid: data.claims.filter(c => c.status === 'paid').length
    },
    {
      name: 'अनुदान',
      submitted: data.subsidies.filter(s => s.status === 'submitted').length,
      approved: data.subsidies.filter(s => s.status === 'approved').length,
      paid: data.subsidies.filter(s => s.status === 'paid').length
    }
  ];

  const allActivity = [
    ...data.lands.map(l => ({ ...l, icon: '🌍', text: `जमीन: Survey ${l.surveyNumber || '—'}`, type: 'land' })),
    ...data.crops.map(c => ({ ...c, icon: '🌾', text: `पीक: ${c.cropType}`, type: 'crop' })),
    ...data.claims.map(cl => ({ ...cl, icon: '🛡️', text: `विमा: ${cl.claimType || cl.status}`, type: 'claim' })),
    ...data.subsidies.map(s => ({ ...s, icon: '💰', text: `अनुदान: ${s.schemeName || '—'}`, type: 'subsidy' }))
  ].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 15);

  const statCards = [
    { icon: <Map size={28} />, val: `${data.totalArea.toFixed(1)}`, unit: 'एकर', label: 'एकूण जमीन', gradient: GRADIENT_COLORS[0], trend: '+12%' },
    { icon: <Leaf size={28} />, val: `${data.totalCrops}`, unit: 'पिके', label: 'एकूण पिके', gradient: GRADIENT_COLORS[1], trend: '+8%' },
    { icon: <Shield size={28} />, val: `${data.totalClaims}`, unit: 'दावे', label: 'विमा दावे', gradient: GRADIENT_COLORS[2], trend: '+5%' },
    { icon: <Coins size={28} />, val: `₹${data.totalIncome.toLocaleString('mr-IN')}`, unit: '', label: 'एकूण मिळालेले', gradient: GRADIENT_COLORS[3], trend: '+23%' }
  ];

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      {/* Header Banner */}
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        style={{
          background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #334155 100%)',
          borderRadius: '20px',
          padding: '28px 32px',
          marginBottom: '28px',
          boxShadow: '0 20px 40px rgba(15, 23, 42, 0.4)',
          position: 'relative',
          overflow: 'hidden',
          color: '#fff'
        }}
      >
        <div style={{ position: 'relative', zIndex: 2 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '6px' }}>
            <div style={{ background: 'rgba(16, 185, 129, 0.2)', padding: '4px 12px', borderRadius: '20px', display: 'inline-flex', alignItems: 'center', gap: '6px', border: '1px solid rgba(16,185,129,0.4)' }}>
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#10b981', boxShadow: '0 0 10px #10b981', animation: 'blink 1.5s infinite' }} />
              <span style={{ fontSize: '11px', fontWeight: 800, color: '#10b981', letterSpacing: '1px' }}>REAL-TIME DATA</span>
            </div>
          </div>
          <h1 style={{ fontSize: '30px', fontWeight: 900, display: 'flex', alignItems: 'center', gap: '12px', marginTop: '10px' }}>
            <BarChart3 size={34} color="#10b981" /> शेतकरी Analytics डॅशबोर्ड
          </h1>
          <p style={{ fontSize: '14px', opacity: 0.7, marginTop: '8px' }}>तुमच्या संपूर्ण कृषी व्यवहारांचे विश्लेषण एका ठिकाणी.</p>
        </div>
        
        {/* Abstract Grid BG */}
        <div style={{ position: 'absolute', inset: 0, backgroundImage: 'radial-gradient(rgba(16,185,129,0.15) 1px, transparent 1px)', backgroundSize: '30px 30px', zIndex: 0 }} />
        <motion.div animate={{ rotate: 360 }} transition={{ duration: 60, repeat: Infinity, ease: 'linear' }} style={{ position: 'absolute', top: '-40%', right: '-10%', width: '300px', height: '300px', background: 'rgba(16,185,129,0.08)', borderRadius: '50%', zIndex: 0 }} />
      </motion.div>

      {/* Stat Cards with 3D Hover */}
      <motion.div
        className="stat-cards"
        variants={containerVariants}
        initial="hidden"
        animate="show"
        style={{ marginBottom: '28px' }}
      >
        {statCards.map((s, i) => (
          <motion.div
            key={s.label}
            variants={itemVariants}
            whileHover={{ y: -8, scale: 1.03, rotateY: 3, rotateX: 3, boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)' }}
            style={{
              background: '#fff',
              borderRadius: '20px',
              padding: '24px',
              boxShadow: '0 4px 15px rgba(0,0,0,0.06)',
              position: 'relative',
              overflow: 'hidden',
              cursor: 'pointer',
              borderTop: 'none',
              perspective: '1000px'
            }}
          >
            {/* Gradient accent line at top */}
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '4px', background: `linear-gradient(90deg, ${s.gradient[0]}, ${s.gradient[1]})` }} />

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
              <div style={{ background: `linear-gradient(135deg, ${s.gradient[0]}22, ${s.gradient[0]}11)`, padding: '12px', borderRadius: '14px', color: s.gradient[0] }}>
                {s.icon}
              </div>
              <div style={{ background: '#dcfce7', color: '#16a34a', padding: '3px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '3px' }}>
                <TrendingUp size={12} /> {s.trend}
              </div>
            </div>

            <div style={{ fontSize: '28px', fontWeight: 900, color: '#0f172a', lineHeight: 1 }}>
              {s.val} <span style={{ fontSize: '14px', color: 'var(--text3)', fontWeight: 600 }}>{s.unit}</span>
            </div>
            <div style={{ fontSize: '13px', color: 'var(--text3)', marginTop: '6px', fontWeight: 600 }}>{s.label}</div>
          </motion.div>
        ))}
      </motion.div>

      {/* Charts Grid */}
      <motion.div
        className="grid-2"
        variants={containerVariants}
        initial="hidden"
        animate="show"
        style={{ marginBottom: '28px' }}
      >
        {/* Pie Chart */}
        {cropDist.length > 0 && (
          <motion.div
            variants={itemVariants}
            whileHover={{ y: -5, boxShadow: '0 20px 40px rgba(0,0,0,0.1)' }}
            className="card"
            style={{ borderRadius: '20px', padding: '24px', border: '1px solid var(--border)' }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
              <div style={{ background: 'linear-gradient(135deg, #f59e0b22, #f59e0b11)', padding: '10px', borderRadius: '12px', color: '#f59e0b' }}>
                <PieIcon size={22} />
              </div>
              <div>
                <div style={{ fontWeight: 800, fontSize: '16px' }}>🌾 पीक वितरण</div>
                <div style={{ fontSize: '12px', color: 'var(--text3)' }}>Crop Distribution Analysis</div>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie
                  data={cropDist}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  innerRadius={55}
                  paddingAngle={3}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  strokeWidth={0}
                >
                  {cropDist.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          </motion.div>
        )}

        {/* Bar Chart */}
        <motion.div
          variants={itemVariants}
          whileHover={{ y: -5, boxShadow: '0 20px 40px rgba(0,0,0,0.1)' }}
          className="card"
          style={{ borderRadius: '20px', padding: '24px', border: '1px solid var(--border)' }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
            <div style={{ background: 'linear-gradient(135deg, #3b82f622, #3b82f611)', padding: '10px', borderRadius: '12px', color: '#3b82f6' }}>
              <BarChart3 size={22} />
            </div>
            <div>
              <div style={{ fontWeight: 800, fontSize: '16px' }}>📊 Status Overview</div>
              <div style={{ fontSize: '12px', color: 'var(--text3)' }}>Claims & Subsidies Tracker</div>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={statusData} barCategoryGap="30%">
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="name" tick={{ fontSize: 13, fontWeight: 600 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ paddingTop: '10px' }} />
              <Bar dataKey="submitted" fill="#3b82f6" name="सादर" radius={[6, 6, 0, 0]} />
              <Bar dataKey="approved" fill="#10b981" name="मंजूर" radius={[6, 6, 0, 0]} />
              <Bar dataKey="paid" fill="#f59e0b" name="Paid" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>
      </motion.div>

      {/* Activity Timeline */}
      <motion.div
        variants={itemVariants}
        initial="hidden"
        animate="show"
        whileHover={{ y: -3, boxShadow: '0 15px 30px rgba(0,0,0,0.08)' }}
        className="card"
        style={{ borderRadius: '20px', padding: '24px', border: '1px solid var(--border)' }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ background: 'linear-gradient(135deg, #8b5cf622, #8b5cf611)', padding: '10px', borderRadius: '12px', color: '#8b5cf6' }}>
              <Clock size={22} />
            </div>
            <div>
              <div style={{ fontWeight: 800, fontSize: '16px' }}>📅 अलीकडील क्रियाकलाप</div>
              <div style={{ fontSize: '12px', color: 'var(--text3)' }}>Latest Farm Activities Timeline</div>
            </div>
          </div>
          <span style={{ fontSize: '12px', color: 'var(--text3)', background: 'var(--gray1)', padding: '4px 12px', borderRadius: '20px', fontWeight: 700 }}>
            {allActivity.length} items
          </span>
        </div>

        <div style={{ maxHeight: 400, overflowY: 'auto', paddingRight: '8px' }}>
          {allActivity.map((item, i) => {
            const typeColors = { land: '#3b82f6', crop: '#10b981', claim: '#ef4444', subsidy: '#f59e0b' };
            const col = typeColors[item.type] || '#64748b';
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                whileHover={{ x: 4, background: 'var(--gray1)' }}
                style={{
                  display: 'flex',
                  gap: '16px',
                  padding: '14px 12px',
                  borderRadius: '12px',
                  cursor: 'pointer',
                  transition: 'background 0.2s',
                  position: 'relative'
                }}
              >
                {/* Timeline line */}
                {i < allActivity.length - 1 && (
                  <div style={{ position: 'absolute', left: '29px', top: '42px', width: '2px', height: 'calc(100% - 14px)', background: '#e2e8f0' }} />
                )}

                <div style={{
                  width: 40, height: 40,
                  borderRadius: '12px',
                  background: `${col}15`,
                  border: `2px solid ${col}40`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '20px',
                  flexShrink: 0,
                  position: 'relative',
                  zIndex: 2
                }}>
                  {item.icon}
                </div>

                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text)' }}>{item.text}</div>
                  <div style={{ fontSize: '12px', color: 'var(--text3)', marginTop: '2px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Clock size={12} />
                    {item.createdAt ? new Date(item.createdAt).toLocaleDateString('mr-IN') : ''}
                  </div>
                </div>

                <ChevronRight size={16} style={{ color: 'var(--text3)', alignSelf: 'center' }} />
              </motion.div>
            );
          })}
        </div>
      </motion.div>
    </motion.div>
  );
}
