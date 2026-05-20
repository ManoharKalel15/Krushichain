import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import api from '../config/api';
import { LoadingCenter, EmptyState, StatusBadge, BlockchainBadge, SectionTitle } from '../components/UI';
import { motion, AnimatePresence } from 'framer-motion';
import { Leaf, Plus, X, Sprout, Tractor, Droplets, Droplet, Shield, Shovel, Calendar, Trash2, ShieldCheck, MapPin } from 'lucide-react';

const CROPS = ['सोयाबीन','गहू','कांदा','द्राक्षे','ऊस','कापूस','तूर','हरभरा','मका','टोमॅटो'];
const CROP_ICONS = {'सोयाबीन':'🫘','गहू':'🌾','कांदा':'🧅','द्राक्षे':'🍇','ऊस':'🎋','कापूस':'🌿','तूर':'🌱','हरभरा':'🟤','मका':'🌽','टोमॅटो':'🍅'};

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
};

export default function CropPage() {
  const [crops,   setCrops]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving,  setSaving]  = useState(false);
  const [showForm,setShowForm]= useState(false);
  
  const [ct, setCt] = useState('सोयाबीन');
  const [variety, setVariety] = useState('');
  const [sowDate, setSowDate] = useState('');
  const [harDate, setHarDate] = useState('');
  const [area,    setArea]    = useState('');
  const [fert,    setFert]    = useState('');
  const [pest,    setPest]    = useState('');
  const [irr,     setIrr]     = useState('');
  const [expYield,setExpYield]= useState('');

  const load = async () => {
    try { const r = await api.get('/crops'); setCrops(r.data.crops); }
    catch(e) {} finally { setLoading(false); }
  };
  
  useEffect(() => { load() }, []);

  const save = async () => {
    if (!ct || !sowDate) { toast.error('पीक प्रकार आणि पेरणी तारीख आवश्यक'); return; }
    setSaving(true);
    try {
      await api.post('/crops', { 
        cropType:ct, variety, sowingDate:sowDate, harvestDate:harDate||null, 
        areaAcres:Number(area)||0, fertilizer:fert, pesticide:pest, 
        irrigation:irr, expectedYield:Number(expYield)||0 
      });
      toast.success('✅ Crop NFT Mint झाला!');
      setShowForm(false); 
      setCt('सोयाबीन'); setVariety(''); setSowDate(''); setHarDate(''); 
      setArea(''); setFert(''); setPest(''); setIrr(''); setExpYield('');
      load();
    } catch(e) { toast.error(e.response?.data?.error||'Error'); }
    setSaving(false);
  };

  const del = async id => {
    if (!confirm('पीक हटवायचे का?')) return;
    await api.delete(`/crops/${id}`); 
    toast.success('हटवले!'); 
    load();
  };

  if (loading) return <LoadingCenter text="पिके लोड होत आहेत..." />;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      {/* Header section with gradient and animation */}
      <motion.div 
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="banner" 
        style={{ 
          background: 'linear-gradient(135deg, #2e7d32 0%, #1b5e20 100%)',
          marginBottom: '24px', 
          boxShadow: '0 10px 30px rgba(46, 125, 50, 0.2)' 
        }}
      >
        <div style={{ position: 'relative', zIndex: 1 }}>
          <h1 style={{ fontSize: '28px', fontWeight: 900, display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Leaf size={32} /> पीक व्यवस्थापन 
          </h1>
          <p style={{ marginTop: '8px', opacity: 0.9, fontSize: '15px' }}>
            तुमच्या शेतातील पिकांची ब्लॉकचेनवर नोंद करा आणि सुरक्षित Crop NFTs तयार करा.
          </p>
        </div>
      </motion.div>

      {/* Action Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div style={{ fontWeight: 800, fontSize: '18px', color: 'var(--text)' }}>
          एकूण पिके: <span style={{ color: 'var(--green)' }}>{crops.length}</span>
        </div>
        {!showForm && (
          <motion.button 
            whileHover={{ scale: 1.05 }} 
            whileTap={{ scale: 0.95 }}
            className="btn btn-primary btn-lg" 
            onClick={() => setShowForm(true)}
            style={{ borderRadius: '30px', boxShadow: '0 4px 15px rgba(45, 122, 53, 0.3)' }}
          >
            <Plus size={20} /> नवीन पीक नोंदवा
          </motion.button>
        )}
      </div>

      <AnimatePresence mode="wait">
        {showForm && (
          <motion.div 
            initial={{ opacity: 0, height: 0, overflow: 'hidden' }}
            animate={{ opacity: 1, height: 'auto', overflow: 'visible' }}
            exit={{ opacity: 0, height: 0, overflow: 'hidden' }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
          >
            <div className="card" style={{ 
              background: 'linear-gradient(to bottom right, #ffffff, #f0fdf4)', 
              border: '2px solid #bbf7d0', 
              boxShadow: '0 15px 35px rgba(0,0,0,0.05)',
              borderRadius: '20px',
              padding: '24px',
              marginBottom: '24px' 
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <div style={{ fontSize: '18px', fontWeight: 800, color: 'var(--green)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Sprout size={24} /> नवीन पीक नोंदणी – Smart Contract
                </div>
                <button className="btn btn-ghost btn-icon" onClick={() => setShowForm(false)} style={{ borderRadius: '50%' }}>
                  <X size={20} />
                </button>
              </div>

              <div className="grid-2">
                <div className="form-group">
                  <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Leaf size={14} /> पीक प्रकार *
                  </label>
                  <select className="form-control" value={ct} onChange={e=>setCt(e.target.value)} style={{ borderRadius: '12px' }}>
                    {CROPS.map(c=><option key={c}>{c}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Tractor size={14} /> वाण / Variety
                  </label>
                  <input className="form-control" value={variety} onChange={e=>setVariety(e.target.value)} placeholder="JS-335" style={{ borderRadius: '12px' }}/>
                </div>
              </div>

              <div className="grid-2">
                <div className="form-group">
                  <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Calendar size={14} /> पेरणी तारीख *
                  </label>
                  <input className="form-control" type="date" value={sowDate} onChange={e=>setSowDate(e.target.value)} style={{ borderRadius: '12px' }}/>
                </div>
                <div className="form-group">
                  <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Calendar size={14} /> काढणी तारीख
                  </label>
                  <input className="form-control" type="date" value={harDate} onChange={e=>setHarDate(e.target.value)} style={{ borderRadius: '12px' }}/>
                </div>
              </div>

              <div className="grid-2">
                <div className="form-group">
                  <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <MapPin size={14} /> क्षेत्र (एकर)
                  </label>
                  <input className="form-control" type="number" value={area} onChange={e=>setArea(e.target.value)} placeholder="2.5" step="0.1" style={{ borderRadius: '12px' }}/>
                </div>
                <div className="form-group">
                  <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Tractor size={14} /> अंदाजे उत्पादन (टन/एकर)
                  </label>
                  <input className="form-control" type="number" value={expYield} onChange={e=>setExpYield(e.target.value)} placeholder="4.2" step="0.1" style={{ borderRadius: '12px' }}/>
                </div>
              </div>

              <div className="grid-2">
                <div className="form-group">
                  <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Shovel size={14} /> खत वापर
                  </label>
                  <input className="form-control" value={fert} onChange={e=>setFert(e.target.value)} placeholder="युरिया 50kg + DAP 25kg" style={{ borderRadius: '12px' }}/>
                </div>
                <div className="form-group">
                  <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Shield size={14} /> कीटकनाशक
                  </label>
                  <input className="form-control" value={pest} onChange={e=>setPest(e.target.value)} placeholder="मँकोझेब 75% WP" style={{ borderRadius: '12px' }}/>
                </div>
              </div>

              <div style={{ display: 'flex', gap: 12, marginTop: 10, justifyContent: 'flex-end' }}>
                <button className="btn btn-ghost" onClick={() => setShowForm(false)} style={{ borderRadius: '10px' }}>रद्द करा</button>
                <motion.button 
                  whileHover={{ scale: 1.02 }} 
                  whileTap={{ scale: 0.98 }}
                  className="btn btn-primary" 
                  onClick={save} 
                  disabled={saving}
                  style={{ borderRadius: '10px', minWidth: '180px', display: 'flex', justifyContent: 'center' }}
                >
                  {saving ? (
                    <span style={{ display:'flex', alignItems:'center', gap:8 }}>
                      <div className="spinner" style={{ width: 16, height: 16, borderWidth: 2 }} /> Minting NFT...
                    </span>
                  ) : (
                    <span style={{ display:'flex', alignItems:'center', gap:8 }}>
                      <ShieldCheck size={18} /> Crop NFT Mint करा
                    </span>
                  )}
                </motion.button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Grid of Crops */}
      {crops.length === 0 && !showForm ? (
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.2 }}>
          <EmptyState icon="🌾" title="कोणतेही पीक नाही" action="+ पहिले पीक नोंदवा" onAction={()=>setShowForm(true)} />
        </motion.div>
      ) : (
        <motion.div 
          className="grid-2" 
          variants={containerVariants} 
          initial="hidden" 
          animate="show"
        >
          {crops.map(c => (
            <motion.div 
              key={c._id} 
              variants={itemVariants}
              whileHover={{ y: -5, boxShadow: '0 15px 30px rgba(0,0,0,0.1)' }}
              className="card"
              style={{ 
                borderTop: '4px solid var(--green)', 
                borderRadius: '16px',
                position: 'relative',
                overflow: 'hidden',
                background: '#fff'
              }}
            >
              {/* Decorative background element */}
              <div style={{ position: 'absolute', top: -20, right: -20, fontSize: '100px', opacity: 0.05, pointerEvents: 'none' }}>
                {CROP_ICONS[c.cropType] || '🌱'}
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', position: 'relative', zIndex: 1 }}>
                <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start', flex: 1 }}>
                  <div style={{ 
                    fontSize: '40px', 
                    background: 'var(--green3)', 
                    width: 60, height: 60, 
                    display: 'flex', alignItems: 'center', justifyContent: 'center', 
                    borderRadius: '16px', 
                    boxShadow: '0 4px 10px rgba(45, 122, 53, 0.15)',
                    flexShrink: 0
                  }}>
                    {CROP_ICONS[c.cropType]||'🌱'}
                  </div>
                  <div>
                    <div style={{ fontWeight: 900, fontSize: '20px', color: 'var(--text)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      {c.cropType} {c.variety && <span style={{ fontSize: '14px', color: 'var(--text3)', fontWeight: 600 }}>({c.variety})</span>}
                    </div>
                    
                    <div style={{ fontSize: '13px', color: 'var(--text2)', marginTop: '8px', display: 'flex', flexDirection: 'column', gap: '5px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Calendar size={14} className="text-green" /> 
                        <span style={{ fontWeight: 600 }}>पेरणी:</span> {new Date(c.sowingDate).toLocaleDateString('mr-IN')}
                      </div>
                      
                      {c.harvestDate && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <Calendar size={14} className="text-orange" /> 
                          <span style={{ fontWeight: 600 }}>काढणी:</span> {new Date(c.harvestDate).toLocaleDateString('mr-IN')}
                        </div>
                      )}
                      
                      {c.areaAcres > 0 && (
                         <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '2px' }}>
                           <MapPin size={14} className="text-blue" />
                           <span style={{ fontWeight: 600 }}>क्षेत्र:</span> {c.areaAcres} एकर 
                           {c.expectedYield ? ` • अंदाजे: ${c.expectedYield} टन/एकर` : ''}
                         </div>
                      )}
                    </div>
                  </div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '8px' }}>
                  <StatusBadge status={c.status} />
                  <motion.button 
                    whileHover={{ scale: 1.1, color: 'var(--red)' }} 
                    whileTap={{ scale: 0.9 }}
                    className="btn btn-ghost btn-icon" 
                    style={{ padding: '6px', borderRadius: '50%', background: 'transparent', border: 'none', color: 'var(--text3)' }} 
                    onClick={() => del(c._id)}
                  >
                    <Trash2 size={16} />
                  </motion.button>
                </div>
              </div>

              {(c.fertilizer || c.pesticide) && (
                <div style={{ 
                  marginTop: 16, padding: '12px', 
                  background: 'var(--gray1)', borderRadius: '12px',
                  display: 'flex', flexDirection: 'column', gap: '6px'
                }}>
                  {c.fertilizer && <div style={{ fontSize: '12.5px', color: 'var(--text2)', display: 'flex', alignItems: 'center', gap: '6px' }}><Shovel size={14} className="text-text3"/> <b>खत:</b> {c.fertilizer}</div>}
                  {c.pesticide && <div style={{ fontSize: '12.5px', color: 'var(--text2)', display: 'flex', alignItems: 'center', gap: '6px' }}><Shield size={14} className="text-text3"/> <b>औषध:</b> {c.pesticide}</div>}
                </div>
              )}

              <div style={{ marginTop: 16 }}>
                <BlockchainBadge txHash={c.txHash} />
                {c.nftTokenId && (
                  <div style={{ 
                    fontSize: '11px', fontFamily: 'monospace', color: 'var(--purple)', 
                    marginTop: 8, background: 'var(--purple2)', padding: '6px 12px', 
                    borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '6px' 
                  }}>
                    <ShieldCheck size={12} /> NFT Token ID: {c.nftTokenId}
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </motion.div>
      )}
    </motion.div>
  );
}
