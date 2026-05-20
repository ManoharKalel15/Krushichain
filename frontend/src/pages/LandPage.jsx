import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import api from '../config/api';
import { useAuth } from '../context/AuthContext';
import { LoadingCenter, EmptyState, StatusBadge, BlockchainBadge, SectionTitle } from '../components/UI';
import { motion, AnimatePresence } from 'framer-motion';
import { Map, MapPin, Navigation, Crop, Database, Plus, X, Box, Trash2, Layers, CheckCircle2, ChevronDown } from 'lucide-react';

const CROPS = ['सोयाबीन','गहू','कांदा','द्राक्षे','ऊस','कापूस','तूर','हरभरा','मका','टोमॅटो','भुईमूग','भात'];

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.1 } }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
};

export default function LandPage() {
  const { user } = useAuth();
  const [lands,   setLands]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving,  setSaving]  = useState(false);
  const [showForm,setShowForm]= useState(false);
  const [gpsLoading,setGpsLoading]=useState(false);

  const [survey,  setSurvey]  = useState('');
  const [area,    setArea]    = useState('');
  const [crop,    setCrop]    = useState('सोयाबीन');
  const [village, setVillage] = useState(user?.village||'');
  const [district,setDistrict]= useState(user?.district||'');
  const [utara,   setUtara]   = useState('');
  const [lat,     setLat]     = useState('');
  const [lng,     setLng]     = useState('');

  const load = async () => {
    try { const r = await api.get('/lands'); setLands(r.data.lands); }
    catch(e) { toast.error('Lands लोड error'); }
    setLoading(false);
  };
  
  useEffect(() => { load() }, []);

  const getGPS = () => {
    if (!navigator.geolocation) { toast.error('GPS support नाही'); return; }
    setGpsLoading(true);
    navigator.geolocation.getCurrentPosition(
      pos => { 
        setLat(pos.coords.latitude.toFixed(6)); 
        setLng(pos.coords.longitude.toFixed(6)); 
        toast.success(`GPS मिळाले: ${pos.coords.latitude.toFixed(4)}°N`); 
        setGpsLoading(false); 
      },
      () => { toast.error('GPS permission द्या'); setGpsLoading(false) },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const save = async () => {
    if (!survey.trim()) { toast.error('Survey नंबर टाका'); return; }
    if (!area || isNaN(area) || Number(area) <= 0) { toast.error('Valid क्षेत्रफळ टाका'); return; }
    if (!village.trim()) { toast.error('गाव टाका'); return; }
    
    setSaving(true);
    try {
      await api.post('/lands', { 
        surveyNumber:survey.trim(), areaAcres:Number(area), cropType:crop, 
        village:village.trim(), district, utara712:utara, 
        latitude: lat||null, longitude: lng||null 
      });
      toast.success('✅ जमीन Blockchain वर नोंदणी झाली!');
      setSurvey(''); setArea(''); setCrop('सोयाबीन'); setUtara(''); setLat(''); setLng('');
      setShowForm(false); 
      load();
    } catch(e) { toast.error(e.response?.data?.error || 'Save error'); }
    setSaving(false);
  };

  const deleteLand = async (id) => {
    if (!confirm('जमीन हटवायची का?')) return;
    try { await api.delete(`/lands/${id}`); toast.success('हटवले!'); load(); }
    catch(e) { toast.error('Error'); }
  };

  if (loading) return <LoadingCenter text="जमिनी लोड होत आहेत..." />;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      {/* Header Banner */}
      <motion.div 
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="banner" 
        style={{ 
          background: 'linear-gradient(135deg, #1565c0 0%, #0d47a1 100%)',
          marginBottom: '24px', 
          boxShadow: '0 10px 30px rgba(21, 101, 192, 0.2)' 
        }}
      >
        <div style={{ position: 'relative', zIndex: 1 }}>
          <h1 style={{ fontSize: '28px', fontWeight: 900, display: 'flex', alignItems: 'center', gap: '10px', color: '#fff' }}>
            <Map size={32} /> जमीन नोंदणी 
          </h1>
          <p style={{ marginTop: '8px', opacity: 0.9, fontSize: '15px', color: '#e3f2fd' }}>
            Smart Contract वापरून तुमच्या जमिनीची सुरक्षित आणि कायमस्वरूपी डिजिटल नोंद करा.
          </p>
        </div>
        <div style={{ position: 'absolute', right: '5%', top: '50%', transform: 'translateY(-50%)', opacity: 0.1, fontSize: '100px' }}>
          🗺️
        </div>
      </motion.div>

      {/* Action Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div style={{ fontWeight: 800, fontSize: '18px', color: 'var(--text)' }}>
          नोंदवलेल्या जमिनी: <span style={{ color: 'var(--blue)' }}>{lands.length}</span>
        </div>
        {!showForm && (
          <motion.button 
            whileHover={{ scale: 1.05 }} 
            whileTap={{ scale: 0.95 }}
            className="btn btn-primary btn-lg" 
            onClick={() => setShowForm(true)}
            style={{ borderRadius: '30px', background: 'var(--blue)', boxShadow: '0 4px 15px rgba(21, 101, 192, 0.3)', border: 'none' }}
          >
            <Plus size={20} /> नवीन जमीन नोंदवा
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
              background: 'linear-gradient(to bottom right, #ffffff, #e3f2fd)', 
              border: '2px solid #bbdefb', 
              boxShadow: '0 15px 35px rgba(21, 101, 192, 0.08)',
              borderRadius: '20px',
              padding: '24px',
              marginBottom: '24px' 
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <div style={{ fontSize: '18px', fontWeight: 800, color: 'var(--blue)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Database size={24} /> नवीन जमीन नोंदणी – Smart Contract
                </div>
                <button className="btn btn-ghost btn-icon" onClick={() => setShowForm(false)} style={{ borderRadius: '50%' }}>
                  <X size={20} />
                </button>
              </div>

              <div className="grid-2">
                <div className="form-group">
                  <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Map size={14} /> सर्व्हे / गट नंबर *
                  </label>
                  <input className="form-control" value={survey} onChange={e=>setSurvey(e.target.value)} placeholder="142/3" style={{ borderRadius: '12px' }}/>
                </div>
                <div className="form-group">
                  <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Layers size={14} /> क्षेत्रफळ (एकर) *
                  </label>
                  <input className="form-control" type="number" value={area} onChange={e=>setArea(e.target.value)} placeholder="2.5" step="0.1" style={{ borderRadius: '12px' }}/>
                </div>
              </div>

              <div className="grid-2">
                <div className="form-group">
                  <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Crop size={14} /> पीक प्रकार *
                  </label>
                  <select className="form-control" value={crop} onChange={e=>setCrop(e.target.value)} style={{ borderRadius: '12px' }}>
                    {CROPS.map(c => <option key={c}>{c}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Box size={14} /> ७/१२ उतारा क्रमांक
                  </label>
                  <input className="form-control" value={utara} onChange={e=>setUtara(e.target.value)} placeholder="MH-NS-142-2024" style={{ borderRadius: '12px' }}/>
                </div>
              </div>

              <div className="grid-2">
                <div className="form-group">
                  <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <MapPin size={14} /> गाव *
                  </label>
                  <input className="form-control" value={village} onChange={e=>setVillage(e.target.value)} placeholder="येवले" style={{ borderRadius: '12px' }}/>
                </div>
                <div className="form-group">
                  <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Navigation size={14} /> जिल्हा
                  </label>
                  <input className="form-control" value={district} onChange={e=>setDistrict(e.target.value)} placeholder="नाशिक" style={{ borderRadius: '12px' }}/>
                </div>
              </div>

              {/* GPS coordinates fetcher with Animation */}
              <div className="form-group mt-12 bg-white" style={{ padding: '16px', borderRadius: '16px', border: '1px solid #e0e0e0', background: 'rgba(255,255,255,0.6)' }}>
                <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '12px' }}>
                  <Navigation size={14} className="text-blue" /> GPS Coordinates
                </label>
                <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
                  <input className="form-control" value={lat} onChange={e=>setLat(e.target.value)} placeholder="Latitude (Auto GPS)" style={{ flex: 1, minWidth: '120px', borderRadius: '10px' }} readOnly />
                  <input className="form-control" value={lng} onChange={e=>setLng(e.target.value)} placeholder="Longitude" style={{ flex: 1, minWidth: '120px', borderRadius: '10px' }} readOnly />
                  
                  <motion.button 
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="btn btn-outline" 
                    onClick={getGPS} 
                    disabled={gpsLoading} 
                    style={{ flexShrink: 0, borderRadius: '10px', borderColor: 'var(--blue)', color: 'var(--blue)' }}
                  >
                    {gpsLoading ? (
                       <span style={{ display:'flex', alignItems:'center', gap:8 }}><div className="spinner" style={{ width:14, height:14, borderColor:'rgba(0,0,0,0.1)', borderTopColor:'var(--blue)' }}/> शोधत आहे...</span>
                    ) : (
                       <span style={{ display:'flex', alignItems:'center', gap:8 }}><MapPin size={16} /> GPS घ्या</span>
                    )}
                  </motion.button>
                </div>
              </div>

              <div style={{ display: 'flex', gap: 12, marginTop: 24, justifyContent: 'flex-end' }}>
                <button className="btn btn-ghost" onClick={()=>{setShowForm(false)}} style={{ borderRadius: '10px' }}>रद्द करा</button>
                <motion.button 
                  whileHover={{ scale: 1.02 }} 
                  whileTap={{ scale: 0.98 }}
                  className="btn btn-primary" 
                  onClick={save} 
                  disabled={saving}
                  style={{ borderRadius: '10px', background: 'var(--blue)', minWidth: '220px', border: 'none' }}
                >
                  {saving ? (
                    <span style={{ display:'flex', alignItems:'center', gap:8 }}>
                      <div className="spinner" style={{ width: 16, height: 16, borderWidth: 2 }} /> नोंदणी होत आहे...
                    </span>
                  ) : (
                    <span style={{ display:'flex', alignItems:'center', gap:8 }}>
                      <Database size={18} /> Smart Contract वर नोंदवा
                    </span>
                  )}
                </motion.button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Grid of Lands */}
      {lands.length === 0 && !showForm ? (
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.2 }}>
          <EmptyState icon="🗺️" title="कोणतीही जमीन नाही" subtitle="Smart Contract वर पहिली जमीन नोंदवा" action="+ नवीन जमीन नोंदवा" onAction={()=>setShowForm(true)} />
        </motion.div>
      ) : (
        <motion.div 
          className="grid-2" 
          variants={containerVariants} 
          initial="hidden" 
          animate="show"
        >
          {lands.map(land => (
            <motion.div 
              key={land._id} 
              variants={itemVariants}
              whileHover={{ y: -5, boxShadow: '0 15px 30px rgba(0,0,0,0.1)' }}
              className="card"
              style={{ 
                borderTop: '4px solid var(--blue)', 
                borderRadius: '16px',
                position: 'relative',
                overflow: 'hidden',
                background: '#fff'
              }}
            >
              {/* Decorative Map Pattern background element */}
              <div style={{ position: 'absolute', top: -30, right: -20, opacity: 0.03, pointerEvents: 'none' }}>
                <Map size={180} />
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', position: 'relative', zIndex: 1, marginBottom: '16px' }}>
                <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start', flex: 1 }}>
                  <div style={{ 
                    fontSize: '32px', 
                    background: 'var(--blue2)', 
                    color: 'var(--blue)',
                    width: 56, height: 56, 
                    display: 'flex', alignItems: 'center', justifyContent: 'center', 
                    borderRadius: '14px', 
                    boxShadow: '0 4px 10px rgba(21, 101, 192, 0.1)',
                    flexShrink: 0
                  }}>
                    <Map size={32} strokeWidth={1.5} />
                  </div>
                  <div>
                    <div style={{ fontWeight: 900, fontSize: '20px', color: 'var(--text)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      Survey: {land.surveyNumber}
                    </div>
                    
                    <div style={{ fontSize: '14px', color: 'var(--text2)', marginTop: '8px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Layers size={15} className="text-blue" />
                        <span style={{ fontWeight: 600 }}>क्षेत्र:</span> {land.areaAcres} एकर
                      </div>
                      
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Crop size={15} className="text-green" />
                        <span style={{ fontWeight: 600 }}>पीक:</span> {land.cropType}
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <MapPin size={15} className="text-orange" />
                        {land.village}{land.district ? `, ${land.district}` : ''}
                      </div>
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '8px' }}>
                  <StatusBadge status={land.status || 'verified'} />
                  <motion.button 
                    whileHover={{ scale: 1.1, color: 'var(--red)' }} 
                    whileTap={{ scale: 0.9 }}
                    className="btn btn-ghost btn-icon" 
                    style={{ padding: '6px', borderRadius: '50%', background: 'transparent', border: 'none', color: 'var(--text3)' }} 
                    onClick={() => deleteLand(land._id)}
                  >
                    <Trash2 size={16} />
                  </motion.button>
                </div>
              </div>

              {land.utara712 && (
                <div style={{ 
                  background: 'var(--gray1)', padding: '10px 14px', 
                  borderRadius: '10px', fontSize: '13px', 
                  display: 'flex', alignItems: 'center', gap: '8px',
                  marginBottom: '10px'
                }}>
                  <Box size={14} className="text-text3" /> <span style={{ fontWeight: 700, color: 'var(--text2)' }}>७/१२ उतारा:</span> <span style={{ fontFamily: 'monospace' }}>{land.utara712}</span>
                </div>
              )}

              {land.latitude && (
                <div style={{ 
                  background: 'var(--green3)', padding: '10px 14px', 
                  borderRadius: '10px', fontSize: '12px', color: 'var(--green)',
                  display: 'flex', alignItems: 'center', gap: '8px',
                  marginBottom: '10px', border: '1px solid #bbf7d0'
                }}>
                  <Navigation size={14} /> 
                  <span style={{ fontWeight: 600 }}>Geotagged:</span> {land.latitude}°N, {land.longitude}°E
                  <CheckCircle2 size={14} style={{ marginLeft: 'auto' }} />
                </div>
              )}

              <div style={{ marginTop: 'auto', paddingTop: '16px', borderTop: '1px solid var(--border)' }}>
                <BlockchainBadge txHash={land.txHash} />
                
                {land.blockNumber && (
                   <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 12 }}>
                     <div style={{ 
                        fontSize: '11px', fontFamily: 'monospace', color: 'var(--blue)', 
                        background: 'var(--blue2)', padding: '4px 10px', 
                        borderRadius: '6px', display: 'flex', alignItems: 'center', gap: '6px',
                        border: '1px solid #bbdefb'
                      }}>
                        <Database size={10} /> Block: #{land.blockNumber}
                      </div>

                      <div style={{ fontSize: '11px', color: 'var(--text3)' }}>
                        {new Date(land.createdAt).toLocaleDateString('mr-IN')}
                      </div>
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
