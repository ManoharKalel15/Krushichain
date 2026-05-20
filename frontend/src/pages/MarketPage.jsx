import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import api from '../config/api';
import { LoadingCenter, EmptyState, SectionTitle, StatusBadge } from '../components/UI';
import { motion, AnimatePresence } from 'framer-motion';
import { Store, ShoppingBag, Search, Plus, X, Tag, Package, Box, Filter, User, MapPin, Eye, CheckCircle2, TrendingUp } from 'lucide-react';

const CROP_ICONS = {'सोयाबीन':'🫘','गहू':'🌾','कांदा':'🧅','द्राक्षे':'🍇','ऊस':'🎋','कापूस':'🌿','तूर':'🌱','हरभरा':'🟤','मका':'🌽','टोमॅटो':'🍅'};

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.1 } }
};

const itemVariants = {
  hidden: { opacity: 0, y: 30, scale: 0.95 },
  show: { opacity: 1, y: 0, scale: 1, transition: { type: "spring", stiffness: 350, damping: 25 } }
};

export default function MarketPage() {
  const [listings, setListings] = useState([]);
  const [mine,     setMine]     = useState([]);
  const [tab,      setTab]      = useState('all');
  const [loading,  setLoading]  = useState(true);
  const [saving,   setSaving]   = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [search,   setSearch]   = useState('');
  
  const [ct,  setCt]  = useState('');
  const [qty, setQty] = useState('');
  const [unit,setUnit]= useState('kg');
  const [price,setPrice]=useState('');
  const [grade,setGrade]=useState('A');
  const [desc, setDesc]=useState('');

  const load = async () => {
    try {
      const [a,m] = await Promise.all([api.get('/market'),api.get('/market/mine')]);
      setListings(a.data.listings||[]); setMine(m.data.listings||[]);
    } catch(e){} finally{setLoading(false)}
  };
  useEffect(()=>{load()},[]);

  const save = async () => {
    if (!ct||!qty||!price){toast.error('पीक, प्रमाण, दर आवश्यक');return;}
    setSaving(true);
    try{
      await api.post('/market',{cropType:ct,quantity:Number(qty),unit,price:Number(price),grade,description:desc});
      toast.success('✅ जाहिरात दिली!'); 
      setShowForm(false); setCt(''); setQty(''); setPrice(''); setDesc(''); 
      load();
    }catch(e){toast.error(e.response?.data?.error||'Error')}
    setSaving(false);
  };

  const markSold = async id => { 
    await api.put(`/market/${id}`,{status:'sold'}); 
    toast.success('विकले!'); 
    load();
  };

  const shown = (tab==='all'?listings:mine).filter(l=>!search||(l.cropType+l.village+l.farmerName).toLowerCase().includes(search.toLowerCase()));

  if(loading) return <LoadingCenter text="बाजारपेठ लोड होत आहे..." />;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      {/* 3D Header Banner */}
      <motion.div 
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="banner" 
        style={{ 
          background: 'linear-gradient(135deg, #e65100 0%, #ff8f00 100%)',
          marginBottom: '24px', 
          boxShadow: '0 15px 35px rgba(230, 81, 0, 0.25)',
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        <div style={{ position: 'relative', zIndex: 1, color: '#fff' }}>
          <h1 style={{ fontSize: '32px', fontWeight: 900, display: 'flex', alignItems: 'center', gap: '12px' }}>
            <Store size={36} /> जागतिक बाजारपेठ 
          </h1>
          <p style={{ marginTop: '8px', opacity: 0.95, fontSize: '15px' }}>
            थेट शेतातील माल योग्य दराने खरेदी करा आणि विका. मध्यस्थांशिवाय फायदेशीर व्यवसाय!
          </p>
        </div>
        
        {/* Abstract 3D Shapes Simulation */}
        <motion.div animate={{ rotate: 360 }} transition={{ duration: 50, repeat: Infinity, ease: "linear" }} style={{ position: 'absolute', top: '-50%', right: '-5%', width: '300px', height: '300px', background: 'rgba(255,255,255,0.1)', borderRadius: '40%', zIndex: 0 }} />
        <motion.div animate={{ rotate: -360 }} transition={{ duration: 40, repeat: Infinity, ease: "linear" }} style={{ position: 'absolute', bottom: '-50%', right: '15%', width: '200px', height: '200px', background: 'rgba(255,255,255,0.05)', borderRadius: '30%', zIndex: 0 }} />
        <div style={{ position: 'absolute', right: '5%', top: '50%', transform: 'translateY(-50%)', opacity: 0.15, fontSize: '120px', zIndex: 0 }}>
          🛒
        </div>
      </motion.div>

      {/* Controls: Search & Tabs */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '24px' }}>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <div style={{ position: 'relative', flex: 1 }}>
            <Search size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text3)' }} />
            <input 
              className="form-control" 
              style={{ width: '100%', paddingLeft: '44px', borderRadius: '30px', border: '1.5px solid var(--border)', boxShadow: '0 4px 15px rgba(0,0,0,0.03)', height: '50px', fontSize: '15px' }} 
              value={search} 
              onChange={e=>setSearch(e.target.value)} 
              placeholder="🔍 कोणते पीक, गाव किंवा शेतकरी शोधायचे आहे?" 
            />
          </div>
          
          {!showForm && (
            <motion.button 
              whileHover={{ scale: 1.05 }} 
              whileTap={{ scale: 0.95 }}
              className="btn btn-primary btn-lg" 
              onClick={() => setShowForm(true)}
              style={{ borderRadius: '30px', background: 'linear-gradient(135deg, #e65100, #ff8f00)', border: 'none', boxShadow: '0 8px 20px rgba(230, 81, 0, 0.3)', whiteSpace: 'nowrap', height: '50px' }}
            >
              <Plus size={20} /> जाहिरात द्या
            </motion.button>
          )}
        </div>

        <div style={{ display: 'flex', gap: '10px', background: 'var(--white)', padding: '6px', borderRadius: '20px', boxShadow: '0 2px 10px rgba(0,0,0,0.02)', width: 'fit-content' }}>
          {[{id:'all',label:'🌾 सर्व जाहिराती'},{id:'mine',label:'📋 माझ्या जाहिराती'}].map(t=>(
            <button 
              key={t.id} 
              className={`btn ${tab===t.id?'btn-primary':''}`} 
              onClick={()=>setTab(t.id)}
              style={{ 
                borderRadius: '14px', 
                background: tab===t.id ? 'var(--orange2)' : 'transparent', 
                color: tab===t.id ? 'var(--orange)' : 'var(--text2)',
                border: 'none',
                fontWeight: tab===t.id ? 800 : 600,
                padding: '8px 20px',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
              }}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      <AnimatePresence mode="wait">
        {showForm && (
          <motion.div 
            initial={{ opacity: 0, height: 0, scale: 0.95 }}
            animate={{ opacity: 1, height: 'auto', scale: 1 }}
            exit={{ opacity: 0, height: 0, scale: 0.95 }}
            transition={{ duration: 0.4, type: "spring", bounce: 0.25 }}
            style={{ overflow: 'hidden' }}
          >
            <div className="card" style={{ 
              background: 'linear-gradient(135deg, #ffffff 0%, #fff3e0 100%)', 
              border: '2px solid #ffe0b2', 
              boxShadow: '0 20px 40px rgba(230, 81, 0, 0.08)',
              borderRadius: '24px',
              padding: '28px',
              marginBottom: '28px' 
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <div style={{ fontSize: '20px', fontWeight: 900, color: 'var(--orange)', display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <Store size={26} /> नवीन जाहिरात तयार करा
                </div>
                <button className="btn btn-ghost btn-icon" onClick={() => setShowForm(false)} style={{ background: '#fff', borderRadius: '50%', boxShadow: '0 4px 10px rgba(0,0,0,0.05)' }}>
                  <X size={20} />
                </button>
              </div>

              <div className="grid-2">
                <div className="form-group">
                  <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Tag size={14} /> पीक प्रकार *</label>
                  <input className="form-control" value={ct} onChange={e=>setCt(e.target.value)} placeholder=" उदा. कांदा, टोमॅटो, गहू..." style={{ borderRadius: '12px' }}/>
                </div>
                <div className="form-group">
                  <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Filter size={14} /> उत्पादन दर्जा (Grade)</label>
                  <select className="form-control" value={grade} onChange={e=>setGrade(e.target.value)} style={{ borderRadius: '12px' }}>
                    <option value="A">Grade A (Premium)</option>
                    <option value="B">Grade B (Standard)</option>
                    <option value="C">Grade C (Average)</option>
                  </select>
                </div>
              </div>

              <div className="grid-2">
                <div className="form-group">
                  <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Package size={14} /> प्रमाण *</label>
                  <input className="form-control" type="number" value={qty} onChange={e=>setQty(e.target.value)} placeholder="100" style={{ borderRadius: '12px' }}/>
                </div>
                <div className="form-group">
                  <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Box size={14} /> युनिट (Unit)</label>
                  <select className="form-control" value={unit} onChange={e=>setUnit(e.target.value)} style={{ borderRadius: '12px' }}>
                    <option value="kg">किलोग्रॅम (kg)</option>
                    <option value="quintal">क्विंटल (quintal)</option>
                    <option value="ton">टन (ton)</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><TrendingUp size={14} /> अंदाजे दर (₹ per unit) *</label>
                <div style={{ position: 'relative' }}>
                  <span style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', fontWeight: 800, color: 'var(--text2)' }}>₹</span>
                  <input className="form-control" type="number" value={price} onChange={e=>setPrice(e.target.value)} placeholder="45" style={{ borderRadius: '12px', paddingLeft: '34px' }}/>
                </div>
              </div>
              
              <div className="form-group">
                <label className="form-label">वर्णन (वैशिष्ट्ये)</label>
                <textarea className="form-control" value={desc} onChange={e=>setDesc(e.target.value)} placeholder="ताजे, सेंद्रिय खतावर पिकवलेले उच्च दर्जाचे पीक..." rows={2} style={{ borderRadius: '12px', resize: 'none' }} />
              </div>
              
              <div style={{ display: 'flex', gap: 12, marginTop: 24, justifyContent: 'flex-end' }}>
                <button className="btn btn-ghost" onClick={() => setShowForm(false)} style={{ borderRadius: '12px', padding: '0 24px' }}>रद्द करा</button>
                <motion.button 
                  whileHover={{ scale: 1.02 }} 
                  whileTap={{ scale: 0.98 }}
                  className="btn btn-primary" 
                  onClick={save} 
                  disabled={saving}
                  style={{ borderRadius: '12px', background: 'linear-gradient(135deg, #e65100, #ff8f00)', border: 'none', padding: '0 32px', display: 'flex', alignItems: 'center', gap: '8px' }}
                >
                  {saving ? (
                    <><div className="spinner" style={{ width: 16, height: 16, borderWidth: 2 }} /> जाहिरात प्रकाशित होत आहे...</>
                  ) : (
                    <><CheckCircle2 size={18} /> जाहिरात द्या</>
                  )}
                </motion.button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Grid of Market Items with 3D Pop Effect */}
      {shown.length===0 ? (
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.2 }}>
          <EmptyState icon="🛒" title="बाजारपेठेत कोणतीही जाहिरात नाही" subtitle="तुमचा माल विकण्यासाठी नवीन जाहिरात तयार करा." action={tab==='mine'?'+ जाहिरात द्या':null} onAction={tab==='mine'?()=>setShowForm(true):null} />
        </motion.div>
      ) : (
        <motion.div 
          className="grid-4" 
          variants={containerVariants} 
          initial="hidden" 
          animate="show"
        >
          {shown.map(l => (
            <motion.div 
              key={l._id} 
              variants={itemVariants}
              whileHover={{ 
                y: -10, 
                scale: 1.02,
                boxShadow: '0 25px 50px -12px rgba(230, 81, 0, 0.25)',
                rotateY: 2,
                rotateX: 2
              }}
              style={{ perspective: 1000 }}
            >
              <div 
                className="market-card" 
                style={{ 
                  borderRadius: '20px', 
                  borderTop: 'none',
                  border: '1px solid var(--border)',
                  overflow: 'hidden',
                  position: 'relative',
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  background: '#fff'
                }}
              >
                {/* Abstract Pattern background element */}
                <div style={{ position: 'absolute', top: -30, right: -20, opacity: 0.04, pointerEvents: 'none', transform: 'rotate(15deg)' }}>
                  <ShoppingBag size={150} />
                </div>

                <div style={{ 
                  display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', 
                  borderBottom: '1px dashed var(--border)', paddingBottom: '16px', marginBottom: '16px',
                  position: 'relative', zIndex: 1 
                }}>
                  <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                    <div style={{ 
                      width: 52, height: 52, borderRadius: '16px', 
                      background: 'var(--orange2)', color: 'var(--orange)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', 
                      fontSize: 28, flexShrink: 0,
                      boxShadow: '0 4px 15px rgba(230, 81, 0, 0.15)'
                    }}>
                      {CROP_ICONS[l.cropType]||'🌿'}
                    </div>
                    <div>
                      <div style={{ fontWeight: 900, fontSize: '20px', color: 'var(--text)' }}>
                        {l.cropType}
                      </div>
                      <div style={{ fontSize: '13px', color: 'var(--text2)', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Package size={13} className="text-orange" /> {l.quantity} {l.unit}
                      </div>
                    </div>
                  </div>
                  <span className={`badge badge-${l.grade==='A'?'green':l.grade==='B'?'blue':'orange'}`} style={{ padding: '6px 10px', fontSize: '12px' }}>
                    Grade {l.grade}
                  </span>
                </div>

                {/* Price Tag with Gradient */}
                <div style={{ 
                  background: 'linear-gradient(90deg, var(--green3), transparent)', 
                  padding: '12px 16px', borderRadius: '12px', marginBottom: '16px',
                  display: 'flex', alignItems: 'baseline', gap: '6px',
                  borderLeft: '4px solid var(--green)'
                }}>
                  <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text3)' }}>दर:</span>
                  <span style={{ fontSize: '24px', fontWeight: 900, color: 'var(--green)' }}>₹{l.price}</span>
                  <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text2)' }}>/ {l.unit}</span>
                </div>

                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <div style={{ fontSize: '13.5px', color: 'var(--text)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{ background: 'var(--gray1)', padding: '6px', borderRadius: '8px' }}><User size={14} className="text-blue" /></div>
                    <span style={{ fontWeight: 600 }}>{l.farmerName}</span>
                  </div>
                  
                  <div style={{ fontSize: '13.5px', color: 'var(--text)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{ background: 'var(--gray1)', padding: '6px', borderRadius: '8px' }}><MapPin size={14} className="text-red" /></div>
                    <span style={{ fontWeight: 600 }}>{l.village}{l.district?`, ${l.district}`:''}</span>
                  </div>
                </div>

                {/* Footer fixed */}
                <div style={{ 
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center', 
                  marginTop: '20px', paddingTop: '16px', borderTop: '1px solid var(--border)' 
                }}>
                  {l.mobile ? (
                    <motion.button 
                      whileTap={{ scale: 0.95 }}
                      className="btn btn-outline btn-sm" 
                      style={{ borderRadius: '20px', fontSize: '12px', padding: '6px 12px', display: 'flex', alignItems: 'center', gap: '6px' }}
                      onClick={() => window.open(`tel:${l.mobile}`)}
                    >
                      📞 कॉल करा
                    </motion.button>
                  ) : (
                    <div style={{ fontSize: '12px', color: 'var(--text3)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Eye size={14} /> {l.views} views
                    </div>
                  )}

                  {tab==='mine' && l.status==='active' ? (
                     <motion.button 
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="btn btn-sm" 
                      style={{ background: 'var(--green2)', color: 'white', borderRadius: '20px', border: 'none' }}
                      onClick={()=>markSold(l._id)}
                     >
                       ✅ विकले
                     </motion.button>
                  ) : (
                    <StatusBadge status={l.status} />
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      )}
    </motion.div>
  );
}
