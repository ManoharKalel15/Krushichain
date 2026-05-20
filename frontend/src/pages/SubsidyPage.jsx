// src/pages/SubsidyPage.jsx
import React, { useState, useEffect } from 'react'
import toast from 'react-hot-toast'
import api from '../config/api'
import { LoadingCenter, EmptyState, StatusBadge, SectionTitle } from '../components/UI'

const SCHEMES = [
  { code:'PMKISAN',  name:'PM किसान निधी',              benefit:'₹6,000/वर्ष', category:'income',    amount:6000,  desc:'सर्व शेतकरींना वर्षी ₹6,000 मिळते' },
  { code:'SOLAR',    name:'सौर कृषी वाहिनी',            benefit:'90% अनुदान',  category:'equipment', amount:50000, desc:'सौर पंप स्थापनेसाठी 90% अनुदान' },
  { code:'GOPINATH', name:'गोपीनाथ मुंडे विमा',         benefit:'₹2 लाख कव्हर', category:'insurance', amount:200000,desc:'दुर्घटनेत जीवन विमा संरक्षण' },
  { code:'KCC',      name:'KCC कर्ज योजना',             benefit:'4% व्याज',    category:'loan',      amount:300000,desc:'शेती कामासाठी सोपा कर्ज' },
  { code:'DRIP',     name:'ड्रीप सिंचन सबसिडी',         benefit:'50% सबसिडी',  category:'irrigation',amount:25000, desc:'आधुनिक सिंचन पद्धतीसाठी अनुदान' },
  { code:'YANTRA',   name:'कृषी यंत्र सबसिडी',           benefit:'50% अनुदान',  category:'equipment', amount:75000, desc:'ट्रॅक्टर, हेरो इत्यादीसाठी' },
  { code:'PMFBY',    name:'पीक विमा योजना',             benefit:'पूर्ण संरक्षण', category:'insurance', amount:30000, desc:'वादळ, पूर, दुष्काळ संरक्षण' },
  { code:'NANO',     name:'नानाजी देशमुख संजीवनी',      benefit:'विकास योजना', category:'development',amount:40000, desc:'गाव विकास आणि शेती उन्नति' },
]
const CAT_COLOR = { income:'#22c55e', equipment:'#3b82f6', insurance:'#f59e0b', loan:'#8b5cf6', irrigation:'#06b6d4', development:'#ff6b35' }
const CAT_ICON  = { income:'💰', equipment:'🚜', insurance:'🛡️', loan:'🏦', irrigation:'💧', development:'🌱' }

export default function SubsidyPage() {
  const [apps,    setApps]    = useState([])
  const [tab,     setTab]     = useState('schemes')
  const [loading, setLoading] = useState(true)
  const [saving,  setSaving]  = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [selectedScheme, setSelectedScheme] = useState(null)
  const [formData, setFormData] = useState({
    bankName: '',
    bankAccount: '',
    ifscCode: '',
    documents: [],
    description: ''
  })

  const load = async () => {
    try { const r = await api.get('/subsidy'); setApps(r.data.applications||[]) } catch(e){}
    setLoading(false)
  }
  useEffect(()=>{load()},[])

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);
    setFormData({...formData, documents: [...formData.documents, ...files]});
    toast.success(`${files.length} documents selected`);
  }

  const apply = async () => {
    if (!selectedScheme || !formData.bankName || !formData.bankAccount || !formData.ifscCode) {
      toast.error('सर्व details भरा');
      return;
    }
    setSaving(true);
    try {
      const formDataObj = new FormData();
      formDataObj.append('schemeName', selectedScheme.name);
      formDataObj.append('schemeCode', selectedScheme.code);
      formDataObj.append('amount', selectedScheme.amount);
      formDataObj.append('bankName', formData.bankName);
      formDataObj.append('bankAccount', formData.bankAccount);
      formDataObj.append('ifscCode', formData.ifscCode);
      formDataObj.append('description', formData.description || selectedScheme.desc);
      
      formData.documents.forEach(doc => {
        formDataObj.append('documents', doc);
      });

      await api.post('/subsidy', formDataObj, { headers: { 'Content-Type': 'multipart/form-data' }});
      toast.success(`✅ ${selectedScheme.name} साठी अर्ज सादर!`);
      setShowForm(false);
      setSelectedScheme(null);
      setFormData({ bankName: '', bankAccount: '', ifscCode: '', documents: [], description: '' });
      setTab('applied');
      load();
    } catch(e){
      toast.error(e.response?.data?.error||'Error');
    }
    setSaving(false);
  }

  if(loading) return <LoadingCenter />
  
  const pendingCount = apps.filter(a => a.status === 'submitted' || a.status === 'under_review').length;
  const approvedCount = apps.filter(a => a.status === 'approved').length;
  const paidCount = apps.filter(a => a.status === 'paid').length;

  return (
    <div style={{background:'#000', minHeight:'100vh', padding:'0 16px 32px'}}>
      {/* Header Stats */}
      {tab === 'applied' && (
        <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:12,marginBottom:20,marginTop:16}}>
          <div style={{background:'linear-gradient(135deg, #1e40af 0%, #3b82f6 100%)', borderRadius:12, padding:16, color:'white', textAlign:'center'}}>
            <div style={{fontSize:24,fontWeight:900}}>{apps.length}</div>
            <div style={{fontSize:12,opacity:0.8,marginTop:4}}>एकूण अर्ज</div>
          </div>
          <div style={{background:'linear-gradient(135deg, #ea580c 0%, #f59e0b 100%)', borderRadius:12, padding:16, color:'white', textAlign:'center'}}>
            <div style={{fontSize:24,fontWeight:900}}>{pendingCount}</div>
            <div style={{fontSize:12,opacity:0.8,marginTop:4}}>प्रलंबित</div>
          </div>
          <div style={{background:'linear-gradient(135deg, #16a34a 0%, #22c55e 100%)', borderRadius:12, padding:16, color:'white', textAlign:'center'}}>
            <div style={{fontSize:24,fontWeight:900}}>{approvedCount + paidCount}</div>
            <div style={{fontSize:12,opacity:0.8,marginTop:4}}>मंजूर</div>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div style={{display:'flex',gap:8,marginBottom:20,borderBottom:'1px solid #333'}}>
        {[{id:'schemes',label:'📋 सरकारी योजना'},{id:'applied',label:`✅ माझे अर्ज (${apps.length})`}].map(t=>(
          <button key={t.id} 
            onClick={()=>setTab(t.id)} 
            style={{
              padding:'12px 16px',
              background: tab === t.id ? 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)' : 'transparent',
              color: 'white',
              border: 'none',
              borderBottom: tab === t.id ? '2px solid #22c55e' : '1px solid #333',
              fontSize: 14,
              fontWeight: tab === t.id ? 700 : 500,
              cursor: 'pointer',
              borderRadius: '8px 8px 0 0',
              transition: 'all 0.3s'
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Content */}
      {tab === 'schemes' ? (
        <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(280px,1fr))',gap:16}}>
          {SCHEMES.map(s=>(
            <div key={s.code} 
              style={{
                background:'linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%)',
                border:`2px solid ${CAT_COLOR[s.category]}`,
                borderRadius: 16,
                padding: 20,
                cursor: 'pointer',
                transition: 'all 0.3s',
                hover: {transform:'translateY(-4px)'},
                position:'relative',
                overflow:'hidden'
              }}
              onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-4px)'}
              onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
            >
              {/* Icon Background */}
              <div style={{
                position:'absolute',
                top:-20,
                right:-20,
                width:100,
                height:100,
                borderRadius:'50%',
                background:CAT_COLOR[s.category],
                opacity:0.1
              }} />

              {/* Content */}
              <div style={{position:'relative',zIndex:1}}>
                <div style={{fontSize:32,marginBottom:12}}>{CAT_ICON[s.category]}</div>
                <div style={{color:CAT_COLOR[s.category],fontSize:12,fontWeight:700,textTransform:'uppercase',letterSpacing:1,marginBottom:4}}>
                  {s.category}
                </div>
                <div style={{color:'white',fontSize:18,fontWeight:900,marginBottom:8}}>{s.name}</div>
                <div style={{color:'#aaa',fontSize:13,lineHeight:1.5,marginBottom:12}}>{s.desc}</div>
                <div style={{background:'rgba(34,197,94,0.1)',border:'1px solid #22c55e',borderRadius:8,padding:'8px 12px',marginBottom:16}}>
                  <div style={{color:'#aaa',fontSize:11}}>अनुदान राशी</div>
                  <div style={{color:'#22c55e',fontSize:20,fontWeight:900}}>₹{s.amount.toLocaleString('mr-IN')}</div>
                </div>
                <button 
                  onClick={() => {setSelectedScheme(s); setShowForm(true);}}
                  style={{
                    width:'100%',
                    background:`linear-gradient(135deg, ${CAT_COLOR[s.category]} 0%, ${CAT_COLOR[s.category]}ee 100%)`,
                    color:'white',
                    border:'none',
                    padding:'12px 16px',
                    borderRadius:10,
                    fontWeight:700,
                    cursor:'pointer',
                    transition:'all 0.3s',
                    fontSize:14
                  }}
                >
                  📝 अर्ज करा
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <>
          {apps.length === 0 ? (
            <EmptyState icon="📋" title="कोणताही अर्ज नाही" action="योजना पहा" onAction={()=>setTab('schemes')} />
          ) : (
            apps.map(a=>(
              <div key={a._id} 
                style={{
                  background:'linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%)',
                  border:'1px solid #333',
                  borderRadius:12,
                  padding:16,
                  marginBottom:12,
                  color:'white'
                }}
              >
                <div style={{display:'flex',justifyContent:'space-between',alignItems:'start',marginBottom:12}}>
                  <div style={{flex:1}}>
                    <div style={{fontSize:16,fontWeight:900,color:'#22c55e'}}>{a.schemeName}</div>
                    <div style={{fontSize:13,color:'#999',marginTop:4}}>अर्ज क्रमांक: {a.contractRef}</div>
                    <div style={{fontSize:12,color:'#666',marginTop:2}}>📅 {new Date(a.createdAt).toLocaleDateString('mr-IN')}</div>
                  </div>
                  <StatusBadge status={a.status} />
                </div>

                <div style={{background:'rgba(0,0,0,0.4)',borderRadius:8,padding:12,marginBottom:12}}>
                  <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12}}>
                    <div>
                      <div style={{fontSize:11,color:'#999'}}>अनुदान राशी</div>
                      <div style={{fontSize:18,fontWeight:900,color:'#22c55e'}}>₹{a.amount.toLocaleString('mr-IN')}</div>
                    </div>
                    {a.approvedAmt > 0 && (
                      <div>
                        <div style={{fontSize:11,color:'#999'}}>मंजूर रक्कम</div>
                        <div style={{fontSize:18,fontWeight:900,color:'#3b82f6'}}>₹{a.approvedAmt.toLocaleString('mr-IN')}</div>
                      </div>
                    )}
                  </div>
                </div>

                {a.status === 'approved' && (
                  <div style={{background:'rgba(34,197,94,0.1)',border:'1px solid #22c55e',borderRadius:8,padding:12,marginBottom:12}}>
                    <div style={{color:'#22c55e',fontWeight:700,marginBottom:4}}>✅ मंजूरी मिळाली!</div>
                    {a.utrNumber && <div style={{fontSize:12,color:'#aaa'}}>UTR: {a.utrNumber}</div>}
                    {a.paidAt && <div style={{fontSize:12,color:'#aaa'}}>📅 भुगतान: {new Date(a.paidAt).toLocaleDateString('mr-IN')}</div>}
                  </div>
                )}
                
                {a.remarks && (
                  <div style={{background:'rgba(0,0,0,0.4)',borderRadius:8,padding:10,fontSize:12,color:'#aaa',fontStyle:'italic',borderLeft:'3px solid #f59e0b'}}>
                    नोंद: {a.remarks}
                  </div>
                )}
              </div>
            ))
          )}
        </>
      )}

      {/* Application Form Modal */}
      {showForm && selectedScheme && (
        <div style={{
          position:'fixed',
          top:0,
          left:0,
          right:0,
          bottom:0,
          background:'rgba(0,0,0,0.8)',
          display:'flex',
          alignItems:'center',
          justifyContent:'center',
          zIndex:9999,
          padding:16
        }}>
          <div style={{
            background:'#1a1a1a',
            borderRadius:16,
            padding:24,
            maxWidth:500,
            width:'100%',
            maxHeight:'90vh',
            overflow:'auto',
            border:'2px solid #22c55e'
          }}>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:20}}>
              <div style={{fontSize:20,fontWeight:900,color:'#22c55e'}}>📝 अर्ज पुष्टी</div>
              <button onClick={()=>setShowForm(false)} style={{background:'none',border:'none',color:'white',fontSize:24,cursor:'pointer'}}>✕</button>
            </div>

            <div style={{background:'rgba(34,197,94,0.1)',border:'1px solid #22c55e',borderRadius:10,padding:16,marginBottom:16}}>
              <div style={{color:'white',fontWeight:700,marginBottom:4}}>{selectedScheme.name}</div>
              <div style={{color:'#aaa',fontSize:13,marginBottom:8}}>{selectedScheme.desc}</div>
              <div style={{fontSize:20,fontWeight:900,color:'#22c55e'}}>₹{selectedScheme.amount.toLocaleString('mr-IN')}</div>
            </div>

            {/* Form Fields */}
            <div style={{marginBottom:16}}>
              <label style={{display:'block',color:'white',fontSize:13,fontWeight:700,marginBottom:6}}>बँकेचे नाव *</label>
              <input 
                type="text"
                placeholder="State Bank of India"
                value={formData.bankName}
                onChange={(e)=>setFormData({...formData,bankName:e.target.value})}
                style={{
                  width:'100%',
                  padding:'10px 12px',
                  background:'#2d2d2d',
                  border:'1px solid #333',
                  borderRadius:8,
                  color:'white',
                  fontSize:14,
                  outline:'none',
                  boxSizing:'border-box'
                }}
              />
            </div>

            <div style={{marginBottom:16}}>
              <label style={{display:'block',color:'white',fontSize:13,fontWeight:700,marginBottom:6}}>खाता नंबर *</label>
              <input 
                type="text"
                placeholder="आपण बँक खाता नंबर"
                value={formData.bankAccount}
                onChange={(e)=>setFormData({...formData,bankAccount:e.target.value})}
                style={{
                  width:'100%',
                  padding:'10px 12px',
                  background:'#2d2d2d',
                  border:'1px solid #333',
                  borderRadius:8,
                  color:'white',
                  fontSize:14,
                  outline:'none',
                  boxSizing:'border-box'
                }}
              />
            </div>

            <div style={{marginBottom:16}}>
              <label style={{display:'block',color:'white',fontSize:13,fontWeight:700,marginBottom:6}}>IFSC कोड *</label>
              <input 
                type="text"
                placeholder="SBIN0001234"
                value={formData.ifscCode}
                onChange={(e)=>setFormData({...formData,ifscCode:e.target.value.toUpperCase()})}
                style={{
                  width:'100%',
                  padding:'10px 12px',
                  background:'#2d2d2d',
                  border:'1px solid #333',
                  borderRadius:8,
                  color:'white',
                  fontSize:14,
                  outline:'none',
                  boxSizing:'border-box'
                }}
              />
            </div>

            <div style={{marginBottom:16}}>
              <label style={{display:'block',color:'white',fontSize:13,fontWeight:700,marginBottom:6}}>📄 दस्तऐज अपलोड करा</label>
              <input type="file" multiple accept="image/*,.pdf" onChange={handleFileSelect} style={{display:'none'}} id="doc-input" />
              <button 
                onClick={()=>document.getElementById('doc-input').click()}
                style={{
                  width:'100%',
                  padding:'10px 12px',
                  background:'#2d2d2d',
                  border:'2px dashed #22c55e',
                  borderRadius:8,
                  color:'#22c55e',
                  cursor:'pointer',
                  fontWeight:700
                }}
              >
                📱 दस्तऐज निवडा
              </button>
              {formData.documents.length > 0 && (
                <div style={{color:'#22c55e',fontSize:12,marginTop:8}}>✅ {formData.documents.length} documents selected</div>
              )}
            </div>

            <div style={{marginBottom:20}}>
              <label style={{display:'block',color:'white',fontSize:13,fontWeight:700,marginBottom:6}}>विवरण (पर्यायी)</label>
              <textarea
                placeholder="अतिरिक्त माहिती..."
                value={formData.description}
                onChange={(e)=>setFormData({...formData,description:e.target.value})}
                style={{
                  width:'100%',
                  padding:'10px 12px',
                  background:'#2d2d2d',
                  border:'1px solid #333',
                  borderRadius:8,
                  color:'white',
                  fontSize:14,
                  outline:'none',
                  boxSizing:'border-box',
                  minHeight:80,
                  resize:'vertical'
                }}
              />
            </div>

            {/* Buttons */}
            <div style={{display:'flex',gap:10}}>
              <button
                onClick={()=>setShowForm(false)}
                style={{
                  flex:1,
                  padding:'12px',
                  background:'#2d2d2d',
                  border:'1px solid #333',
                  color:'white',
                  borderRadius:10,
                  fontWeight:700,
                  cursor:'pointer'
                }}
              >
                रद्द करा
              </button>
              <button
                onClick={apply}
                disabled={saving}
                style={{
                  flex:1,
                  padding:'12px',
                  background:saving ? '#666' : 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
                  color:'white',
                  border:'none',
                  borderRadius:10,
                  fontWeight:700,
                  cursor:saving ? 'not-allowed' : 'pointer'
                }}
              >
                {saving ? '⏳ अर्ज होत आहे...' : '✅ अर्ज सादर करा'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
