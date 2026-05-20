import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import api from '../config/api';
import { LoadingCenter, EmptyState, StatusBadge, BlockchainBadge, SectionTitle } from '../components/UI';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, ShieldAlert, CloudRain, Thermometer, Wind, Zap, Camera, X, CheckCircle2, ChevronRight, FileScan, Activity, Map, Cpu } from 'lucide-react';

const TYPES = ['पूर','दुष्काळ','गारपीट','कीड','आग','वादळ','करपा','इतर'];
const CROPS = ['सोयाबीन','गहू','कांदा','द्राक्षे','ऊस','कापूस','तूर','हरभरा','मका','टोमॅटो'];

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.15 } }
};

const itemVariants = {
  hidden: { opacity: 0, y: 30, scale: 0.95 },
  show: { opacity: 1, y: 0, scale: 1, transition: { type: "spring", stiffness: 300, damping: 25 } }
};

// IoT Scan Simulation Animation
const ScanOverlay = ({ scanning }) => (
  <AnimatePresence>
    {scanning && (
      <motion.div 
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(5px)', zIndex: 50, borderRadius: '24px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#00ff88', overflow: 'hidden' }}
      >
        <motion.div animate={{ y: ['-100%', '100%'] }} transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }} style={{ position: 'absolute', width: '100%', height: '4px', background: '#00ff88', boxShadow: '0 0 15px #00ff88', opacity: 0.8 }} />
        <Cpu size={48} className="anim-spin" style={{ marginBottom: 20 }} />
        <h3 style={{ fontSize: '20px', letterSpacing: '2px', fontFamily: 'monospace' }}>🛰️ CONNECTING TO SATELLITE...</h3>
        <motion.p animate={{ opacity: [0.5, 1, 0.5] }} transition={{ duration: 1, repeat: Infinity }} style={{ fontSize: '13px', fontFamily: 'monospace', marginTop: '10px' }}>
          Fetch IoT sensor data & scanning geo-coordinates...
        </motion.p>
      </motion.div>
    )}
  </AnimatePresence>
);

export default function InsurancePage() {
  const [claims,  setClaims]  = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving,  setSaving]  = useState(false);
  const [scanning, setScanning]= useState(false);
  const [show,    setShow]    = useState(false);
  
  const [type,    setType]    = useState('पूर');
  const [ct,      setCt]      = useState('सोयाबीन');
  const [area,    setArea]    = useState('');
  const [loss,    setLoss]    = useState('');
  const [damage,  setDamage]  = useState('');
  const [desc,    setDesc]    = useState('');
  const [date,    setDate]    = useState('');
  const [photos,  setPhotos]  = useState([]);
  const [photoPreview, setPhotoPreview] = useState([]);

  const load = async () => {
    try { const r = await api.get('/insurance'); setClaims(r.data.claims); } catch(e){}
    setLoading(false);
  };
  
  const handlePhotoSelect = (e) => {
    const files = Array.from(e.target.files);
    if (files.length + photos.length > 5) {
      toast.error('Maximum 5 photos'); return;
    }
    setPhotos([...photos, ...files]);
    const previews = files.map(f => URL.createObjectURL(f));
    setPhotoPreview([...photoPreview, ...previews]);
    toast.success(`${files.length} फोटो जोडले`);
  };

  const removePhoto = (idx) => {
    setPhotos(photos.filter((_, i) => i !== idx));
    setPhotoPreview(photoPreview.filter((_, i) => i !== idx));
  };

  useEffect(()=>{load()},[]);

  const initiateSave = () => {
    if(!type||!ct||!loss||!date){toast.error('सर्व आवश्यक fields भरा');return;}
    
    // Simulate Satellite and IoT scanning before submit
    setScanning(true);
    setTimeout(() => {
      setScanning(false);
      save();
    }, 3500);
  };

  const save = async () => {
    setSaving(true);
    try {
      const formData = new FormData();
      formData.append('claimType', type);
      formData.append('cropType', ct);
      formData.append('affectedArea', Number(area) || 0);
      formData.append('lossAmount', Number(loss));
      formData.append('damagePercent', Number(damage) || 0);
      formData.append('description', desc);
      formData.append('incidentDate', date);
      photos.forEach(p => formData.append('photos', p));
      
      await api.post('/insurance', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      toast.success('✅ विमा दावा Satellite Valuation द्वारे Smart Contract वर नोंदवला!');
      setShow(false); 
      setType('पूर'); setCt('सोयाबीन'); setArea(''); setLoss(''); setDamage(''); setDesc(''); setDate('');
      setPhotos([]); setPhotoPreview([]);
      load();
    } catch(e){toast.error(e.response?.data?.error||'Error');}
    setSaving(false);
  };

  if(loading) return <LoadingCenter text="विमा दावे लोड होत आहेत..." />;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      {/* 3D Dashboard Header */}
      <motion.div 
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="banner" 
        style={{ 
          background: 'linear-gradient(135deg, #0f2027 0%, #203a43 50%, #2c5364 100%)',
          marginBottom: '24px', 
          boxShadow: '0 20px 40px rgba(0,0,0,0.4)',
          position: 'relative',
          overflow: 'hidden',
          border: '1px solid rgba(255,255,255,0.1)'
        }}
      >
        <div style={{ position: 'relative', zIndex: 2, color: '#fff' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <div style={{ background: 'rgba(0, 255, 136, 0.2)', padding:'4px 10px', borderRadius:'20px', display:'inline-flex', alignItems:'center', gap:'6px', marginBottom:'12px', border:'1px solid rgba(0,255,136,0.4)' }}>
                <div style={{ width:8, height:8, borderRadius:'50%', background:'#00ff88', boxShadow:'0 0 10px #00ff88', animation:'blink 1.5s infinite' }} />
                <span style={{ fontSize:'11px', fontWeight:800, color:'#00ff88', letterSpacing:'1px' }}>SATELLITE SYNC ACTIVE</span>
              </div>
              <h1 style={{ fontSize: '30px', fontWeight: 900, display: 'flex', alignItems: 'center', gap: '12px' }}>
                <ShieldAlert size={34} color="#00ff88" /> स्मार्ट विमा आणि नुकसान भरपाई 
              </h1>
              <p style={{ marginTop: '8px', opacity: 0.9, fontSize: '15px', maxWidth: '600px' }}>
                ISRO सॅटेलाईट डेटा आणि तुमच्या शेतातील IoT सेन्सर वापरून नुकसानीचे अचूक मूल्यांकन आणि ऑटोमॅटिक क्लेम सेटलमेंट.
              </p>
            </div>
            
            {/* Hologram aesthetic on the right */}
            <div style={{ display: 'flex', gap: '20px', opacity: 0.8, display: window.innerWidth > 900 ? 'flex' : 'none' }}>
              <div style={{ textAlign: 'center' }}>
                <CloudRain size={40} color="#64b5f6" />
                <div style={{ fontSize: '12px', fontFamily: 'monospace', marginTop: '6px' }}>METEOROLOGY</div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <Map size={40} color="#4caf50" />
                <div style={{ fontSize: '12px', fontFamily: 'monospace', marginTop: '6px' }}>GEO-MAP</div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Radar Effect background */}
        <div style={{ position: 'absolute', top: '50%', left: '80%', transform: 'translate(-50%, -50%)', width: '300px', height: '300px', borderRadius: '50%', border: '1px solid rgba(0, 255, 136, 0.2)', zIndex: 0 }}>
            <div style={{ position: 'absolute', inset: '10px', borderRadius: '50%', border: '1px solid rgba(0, 255, 136, 0.1)' }} />
            <motion.div animate={{ rotate: 360 }} transition={{ duration: 4, repeat: Infinity, ease: 'linear' }} style={{ position: 'absolute', top: 0, left: '50%', width: '50%', height: '50%', background: 'linear-gradient(90deg, transparent, rgba(0, 255, 136, 0.2))', transformOrigin: 'bottom left' }} />
        </div>
      </motion.div>

      {/* Action Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div style={{ fontWeight: 800, fontSize: '18px', color: 'var(--text)' }}>
          तुमचे विमा दावे: <span style={{ color: 'var(--blue)' }}>{claims.length}</span>
        </div>
        {!show && (
          <motion.button 
            whileHover={{ scale: 1.05 }} 
            whileTap={{ scale: 0.95 }}
            className="btn btn-primary btn-lg" 
            onClick={() => setShow(true)}
            style={{ borderRadius: '30px', background: 'var(--text)', boxShadow: '0 8px 25px rgba(0,0,0,0.3)', border: 'none' }}
          >
            <FileScan size={20} /> नवीन IoT आधारित क्लेम 
          </motion.button>
        )}
      </div>

      <AnimatePresence mode="wait">
        {show && (
          <motion.div 
            initial={{ opacity: 0, height: 0, scale: 0.95 }}
            animate={{ opacity: 1, height: 'auto', scale: 1 }}
            exit={{ opacity: 0, height: 0, scale: 0.95 }}
            transition={{ duration: 0.4, type: "spring", bounce: 0.2 }}
            style={{ overflow: 'hidden', position: 'relative' }}
          >
            {/* The Form Card */}
            <div className="card" style={{ 
              background: '#fff', 
              border: '2px solid #e0e0e0', 
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.2)',
              borderRadius: '24px',
              padding: '28px',
              marginBottom: '28px',
              position: 'relative',
              overflow: 'hidden'
            }}>
              
              <ScanOverlay scanning={scanning} />

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <div style={{ fontSize: '20px', fontWeight: 900, color: 'var(--text)', display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <Activity size={26} color="#f44336" /> नुकसान भरपाई क्लेम – Smart Contract
                </div>
                <button className="btn btn-ghost btn-icon" onClick={() => setShow(false)} style={{ borderRadius: '50%', background: 'var(--gray1)' }}>
                  <X size={20} />
                </button>
              </div>

              {/* Status Indicator inside form */}
              <div style={{ background: 'linear-gradient(90deg, var(--gray1), transparent)', padding: '12px 16px', borderRadius: '12px', borderLeft: '4px solid #f44336', marginBottom: '24px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', fontWeight: 700, color: 'var(--text2)' }}>
                  <ShieldAlert size={16} color="#f44336" /> माहिती सबमिट करताच स्मार्ट कॉन्ट्रॅक्ट द्वारे ऑटो-सॅटेलाईट आणि IoT चेकिंग सुरु होईल.
                </div>
              </div>

              <div className="form-group mb-12">
                <label className="form-label">नुकसान प्रकार (AI Detection Type) *</label>
                <div style={{ display:'flex', flexWrap:'wrap', gap:'10px' }}>
                  {TYPES.map(t=>(
                    <motion.button 
                      key={t} 
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className={`btn`} 
                      style={{ 
                        borderRadius: '20px', padding: '8px 18px', 
                        background: type===t ? '#f44336' : 'transparent', 
                        color: type===t ? '#fff' : 'var(--text2)',
                        border: type===t ? 'none' : '1px solid var(--border)',
                        fontWeight: 700, boxShadow: type===t ? '0 4px 10px rgba(244,67,54,0.3)' : 'none'
                      }}
                      onClick={()=>setType(t)}
                    >
                      {t}
                    </motion.button>
                  ))}
                </div>
              </div>

              <div className="grid-2">
                <div className="form-group">
                  <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Shield size={14} /> पीक प्रकार *</label>
                  <select className="form-control" value={ct} onChange={e=>setCt(e.target.value)} style={{ borderRadius: '12px' }}>{CROPS.map(c=><option key={c}>{c}</option>)}</select>
                </div>
                <div className="form-group">
                  <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><CheckCircle2 size={14} /> घटना तारीख *</label>
                  <input className="form-control" type="date" value={date} onChange={e=>setDate(e.target.value)} style={{ borderRadius: '12px' }}/>
                </div>
              </div>

              <div className="grid-2">
                <div className="form-group">
                  <label className="form-label">बाधित क्षेत्र (एकर)</label>
                  <input className="form-control" type="number" value={area} onChange={e=>setArea(e.target.value)} placeholder="3.5" step="0.1" style={{ borderRadius: '12px' }}/>
                </div>
                <div className="form-group">
                  <label className="form-label">नुकसान (%) <span style={{ color: 'var(--text3)', fontWeight: 'normal' }}>(सॅटेलाईट कडून पडताळणी होईल)</span></label>
                  <div style={{ position: 'relative' }}>
                    <input className="form-control" type="number" value={damage} onChange={e=>setDamage(e.target.value)} placeholder="75" max="100" style={{ borderRadius: '12px', paddingRight: '30px' }}/>
                    <span style={{ position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)', fontWeight: 800, color: 'var(--text3)' }}>%</span>
                  </div>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">अंदाजे नुकसान (₹) *</label>
                <div style={{ position: 'relative' }}>
                  <span style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', fontWeight: 800, color: 'var(--text2)' }}>₹</span>
                  <input className="form-control" type="number" value={loss} onChange={e=>setLoss(e.target.value)} placeholder="50000" style={{ borderRadius: '12px', paddingLeft: '34px', fontSize: '16px', fontWeight: 700 }}/>
                </div>
              </div>
              
              <div className="form-group">
                <label className="form-label">विस्तृत वर्णन</label>
                <textarea className="form-control" value={desc} onChange={e=>setDesc(e.target.value)} placeholder="तुफान पावसामुळे शेतातील पिकाचे अतोनात नुकसान..." rows={3} style={{ borderRadius: '12px', resize: 'none' }} />
              </div>
              
              {/* Futuristic Photo Uploader */}
              <div className="form-group mt-16" style={{ background: '#fafafa', border: '2px dashed var(--border)', borderRadius: '16px', padding: '20px', textAlign: 'center' }}>
                <label className="form-label" style={{ fontSize: '14px', marginBottom: '14px' }}>🛰️ जिओ-टॅग केलेले नुकसानाचे फोटो (up to 5)</label>
                <input type="file" multiple accept="image/*" onChange={handlePhotoSelect} style={{display:'none'}} id="photo-input" />
                
                {photoPreview.length === 0 ? (
                  <motion.button 
                    whileHover={{ scale: 1.02 }}
                    className="btn btn-outline" 
                    onClick={() => document.getElementById('photo-input').click()}
                    style={{ borderRadius: '12px', padding: '12px 24px', margin: '0 auto', display: 'inline-flex' }}
                  >
                    <Camera size={20} /> क्लिक करा आणि फोटो अपलोड करा
                  </motion.button>
                ) : (
                  <div>
                    <div style={{ display:'flex', flexWrap:'wrap', gap:'12px', justifyContent: 'center', marginBottom: '16px' }}>
                      <AnimatePresence>
                        {photoPreview.map((p, i) => (
                          <motion.div 
                            initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0, opacity: 0 }}
                            key={i} 
                            style={{ position:'relative', width:90, height:90, borderRadius: '12px', overflow: 'hidden', boxShadow: '0 4px 10px rgba(0,0,0,0.1)' }}
                          >
                            <img src={p} alt={`preview-${i}`} style={{ width:'100%', height:'100%', objectFit:'cover' }} />
                            {/* Scanning HUD effect on image */}
                            <div style={{ position: 'absolute', inset: 0, border: '2px solid rgba(0,255,136,0.5)', zIndex: 2, pointerEvents: 'none' }}></div>
                            <button className="btn btn-sm" style={{ position:'absolute', top:4, right:4, background:'rgba(244,67,54,0.9)', color:'white', border:'none', borderRadius:'50%', width:24, height:24, padding:0, zIndex: 10 }} onClick={() => removePhoto(i)}>✕</button>
                          </motion.div>
                        ))}
                      </AnimatePresence>
                    </div>
                    {photos.length < 5 && (
                      <button className="btn btn-ghost btn-sm" onClick={() => document.getElementById('photo-input').click()}>
                        + आणखी फोटो जोडा
                      </button>
                    )}
                  </div>
                )}
              </div>

              <div style={{ display: 'flex', gap: 12, marginTop: 30, justifyContent: 'flex-end', borderTop: '1px solid var(--border)', paddingTop: '24px' }}>
                <button className="btn btn-ghost" onClick={()=>setShow(false)} style={{ borderRadius: '12px', padding: '0 24px' }}>रद्द करा</button>
                <motion.button 
                  whileHover={{ scale: 1.02 }} 
                  whileTap={{ scale: 0.98 }}
                  className="btn btn-primary" 
                  onClick={initiateSave} 
                  disabled={saving || scanning}
                  style={{ borderRadius: '12px', background: '#000', color: '#00ff88', border: '1px solid #00ff88', boxShadow: '0 10px 20px rgba(0,0,0,0.2)', padding: '0 32px', display: 'flex', alignItems: 'center', gap: '8px', minWidth: '280px', justifyContent: 'center' }}
                >
                  {scanning ? (
                    <span style={{ display:'flex', alignItems:'center', gap:8, fontFamily: 'monospace' }}>
                       SATELLITE CHECK RUNNING...
                    </span>
                  ) : (
                    <span style={{ display:'flex', alignItems:'center', gap:8, fontWeight: 800, letterSpacing: '0.5px' }}>
                      <Activity size={18} /> क्लेम Smart Contract वर सबमिट करा
                    </span>
                  )}
                </motion.button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Grid of Advanced Claims */}
      {claims.length === 0 && !show ? (
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.2 }}>
           <EmptyState icon="🛰️" title="कोणताही विमा दावा नाही" subtitle="ISRO सॅटेलाईट व सेन्सर्स द्वारे ऑटोमॅटिक व्हेरिफिकेशन करून रक्कम थेट बँक खात्यात मिळवा." action="+ स्मार्ट विमा दावा करा" onAction={()=>setShow(true)} />
        </motion.div>
      ) : (
        <motion.div 
          className="grid-2" 
          variants={containerVariants} 
          initial="hidden" 
          animate="show"
        >
          {claims.map(c => (
            <motion.div 
              key={c._id} 
              variants={itemVariants}
              whileHover={{ y: -8, boxShadow: '0 20px 40px rgba(0,0,0,0.15)' }}
              className="card"
              style={{ 
                borderRadius: '20px', 
                border: 'none',
                background: '#fff',
                padding: '0',
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column'
              }}
            >
              {/* Claim Header with Tech Aesthetics */}
              <div style={{ background: '#111827', color: '#fff', padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2px solid #374151' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ background: '#374151', padding: '8px', borderRadius: '10px' }}>
                    <ShieldAlert size={20} color="#f87171" />
                  </div>
                  <div>
                    <div style={{ fontWeight: 800, fontSize: '16px', letterSpacing: '0.5px' }}>{c.claimType} – {c.cropType}</div>
                    <div style={{ fontSize: '11px', fontFamily: 'monospace', color: '#9ca3af', marginTop: '2px' }}>ID: {c._id.slice(-8).toUpperCase()}</div>
                  </div>
                </div>
                <StatusBadge status={c.status} />
              </div>

              {/* Main Content inside card */}
              <div style={{ padding: '20px', flex: 1 }}>
                
                {/* Advanced Data visualization look */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '20px' }}>
                  <div style={{ background: 'var(--gray1)', padding: '12px', borderRadius: '12px' }}>
                    <div style={{ fontSize: '11px', color: 'var(--text3)', fontWeight: 700, textTransform: 'uppercase', marginBottom: '4px' }}>Claimed Loss</div>
                    <div style={{ fontSize: '20px', fontWeight: 900, color: 'var(--text)' }}>₹{Number(c.lossAmount).toLocaleString('mr-IN')}</div>
                  </div>
                  <div style={{ background: 'var(--gray1)', padding: '12px', borderRadius: '12px' }}>
                    <div style={{ fontSize: '11px', color: 'var(--text3)', fontWeight: 700, textTransform: 'uppercase', marginBottom: '4px' }}>Area & Damage</div>
                    <div style={{ fontSize: '16px', fontWeight: 800, color: 'var(--text)' }}>{c.affectedArea} <span style={{ fontSize:'12px', fontWeight:600 }}>एकर</span> | {c.damagePercent}%</div>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: 'var(--text2)', marginBottom: '16px', paddingBottom: '16px', borderBottom: '1px dashed var(--border)' }}>
                  <Activity size={16} /> <b>घटना दिनांक:</b> {new Date(c.incidentDate).toLocaleDateString('mr-IN')}
                </div>

                {/* IoT and Satellite Verification UI */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '20px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '12px', fontFamily: 'monospace', background: 'var(--blue2)', padding: '8px 12px', borderRadius: '8px', border: '1px solid #bbdefb' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--blue)' }}><CloudRain size={14} /> SATELLITE WEATHER SYNC</span>
                    <span style={{ color: 'var(--blue)', fontWeight: 800 }}>VERIFIED</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '12px', fontFamily: 'monospace', background: 'var(--green3)', padding: '8px 12px', borderRadius: '8px', border: '1px solid #bbf7d0' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--green)' }}><Thermometer size={14} /> IOT SOIL ANALYSIS</span>
                    <span style={{ color: 'var(--green)', fontWeight: 800 }}>CONNECTED</span>
                  </div>
                </div>

                {/* Images */}
                {c.photos && c.photos.length > 0 && (
                  <div>
                     <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text3)', marginBottom: '8px' }}>EVIDENCE PHOTOS</div>
                     <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '8px' }}>
                      {c.photos.map((p, i) => (
                        <div key={i} style={{ width: 60, height: 60, flexShrink: 0, borderRadius: '8px', overflow: 'hidden', border: '1px solid var(--border)' }}>
                           <img src={p} alt={`claim-${i}`} style={{ width: '100%', height: '100%', objectFit: 'cover', cursor: 'pointer' }} onClick={() => window.open(p, '_blank')} />
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Status Messages */}
                {(c.status==='approved'||c.status==='paid') && (
                  <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} className="alert alert-green" style={{ marginTop: '16px', background: '#dcfce7', border: '1px solid #86efac', borderRadius: '12px' }}>
                    <div style={{ fontSize: '20px', marginRight: '8px' }}>💸</div>
                    <div>
                      <div style={{ fontWeight: 800, fontSize: '14px', color: '#166534' }}>मंजूर रक्कम: ₹{Number(c.approvedAmount||0).toLocaleString('mr-IN')}</div>
                      {c.remarks && <div style={{ fontSize: '12px', color: '#15803d', marginTop: '2px' }}>{c.remarks}</div>}
                    </div>
                  </motion.div>
                )}
                {c.status==='rejected' && c.remarks && (
                  <div className="alert alert-red" style={{ marginTop: '16px', borderRadius: '12px' }}>
                    <ShieldAlert size={16} style={{ marginTop: '2px' }} /> <span style={{ fontWeight: 600 }}>{c.remarks}</span>
                  </div>
                )}
              </div>

              {/* Blockchain Footer */}
              <div style={{ background: '#f8fafc', padding: '16px 20px', borderTop: '1px solid var(--border)' }}>
                <BlockchainBadge txHash={c.txHash} />
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '10px', fontSize: '11px', color: 'var(--text3)', fontFamily: 'monospace' }}>
                   <span>Smart Contract Ref: {c.contractRef || 'PENDING'}</span>
                   <span>{new Date(c.createdAt).toLocaleDateString('mr-IN')}</span>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      )}
    </motion.div>
  );
}
