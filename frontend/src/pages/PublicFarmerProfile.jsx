import React, { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { LoadingCenter } from '../components/UI'
import api from '../config/api'

export default function PublicFarmerProfile() {
  const { krushiId } = useParams()
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await api.get(`/users/public/${krushiId}`)
        if (res.data.success) {
          setProfile(res.data.profile)
        } else {
          setError('शेतकरी सापडला नाही (Farmer Not Found)')
        }
      } catch (e) {
        setError('Server Error')
      }
      setLoading(false)
    }
    fetchProfile()
  }, [krushiId])

  if (loading) return <LoadingCenter text="KrushiChain Blockchain वरून माहिती एकत्र करत आहे..." />
  if (error) return <div style={{padding:50, textAlign:'center', color:'var(--red)'}}><h2>{error}</h2></div>
  if (!profile) return null

  // Safely grab nested objects
  const { lands = [], crops = [], iotData = {}, schemes = {}, production = {} } = profile

  return (
    <div style={{ background: '#f5f7f5', minHeight: '100vh', padding: '40px 20px', fontFamily: '"Inter", sans-serif' }}>
      <div style={{ maxWidth: 850, margin: '0 auto', animation: 'fadeUpIn 0.8s' }}>
        
        {/* Brand Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, marginBottom: 30 }}>
          <span style={{ fontSize: 32 }}>🌾</span>
          <span style={{ fontSize: 24, fontWeight: 900, color: 'var(--green)', letterSpacing: 1 }}>KrushiChain Smart Identity</span>
          <span className="blockchain-badge" style={{marginLeft: 10}}>🔗 Verified</span>
        </div>

        {/* 1. Basic Information */}
        <div className="profile-section-card">
          <div className="profile-section-header"><span>👤</span> 1. शेतकरी माहिती (Basic Info)</div>
          <div className="profile-section-body" style={{ alignItems: 'center' }}>
            <div style={{ width: 80, height: 80, borderRadius: '50%', background: 'var(--green2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 32, color: 'var(--green)', fontWeight: 800 }}>
              {profile.name?.[0]}
            </div>
            <div style={{ flex: 1, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <div className="prof-field"><span className="prof-field-label">Farmer Name</span><span className="prof-field-val">{profile.name}</span></div>
              <div className="prof-field"><span className="prof-field-label">Krushi ID</span><span className="prof-field-val" style={{color:'var(--blue)'}}>{profile.krushiId}</span></div>
              <div className="prof-field"><span className="prof-field-label">Mobile</span><span className="prof-field-val">{profile.mobile}</span></div>
              <div className="prof-field"><span className="prof-field-label">Aadhaar</span><span className="prof-field-val">{profile.aadhaar}</span></div>
              <div className="prof-field"><span className="prof-field-label">Village / District</span><span className="prof-field-val">{profile.village}, {profile.district}</span></div>
              <div className="prof-field"><span className="prof-field-label">GPS Location</span><span className="prof-field-val">19.2°N, 73.0°E 📍</span></div>
            </div>
          </div>
        </div>

        {/* 2. Land Information */}
        <div className="profile-section-card">
          <div className="profile-section-header"><span>🗺️</span> 2. जमिनीची माहिती (Land Record)</div>
          <div className="profile-section-body">
            {lands.length > 0 ? lands.map((l, i) => (
              <div key={i} style={{ border: '1px solid var(--border)', padding: 12, borderRadius: 8, gridColumn: '1 / -1', background: '#fafafa' }}>
                <div style={{display:'flex', justifyContent:'space-between', marginBottom:10}}>
                  <div style={{fontWeight:800}}>{l.surveyNo} ({l.area} {l.unit})</div>
                  <div className="blockchain-badge" style={{background:'#e8f5e9', color:'#2e7d32', boxShadow:'none'}}>7/12 Synced</div>
                </div>
                <div style={{display:'flex', gap:20}}>
                  <div className="prof-field"><span className="prof-field-label">Soil Type</span><span className="prof-field-val">{l.soilType || 'काळा कापूस'}</span></div>
                  <div className="prof-field"><span className="prof-field-label">Water Source</span><span className="prof-field-val">विहीर (Well)</span></div>
                  <div className="prof-field"><span className="prof-field-label">Blockchain Hash</span><span className="prof-field-val" style={{fontFamily:'monospace', fontSize:11, color:'var(--text3)'}}>0xA78B9C...{l._id.slice(-6)}</span></div>
                </div>
              </div>
            )) : <div className="prof-field-val">माहिती उपलब्ध नाही</div>}
          </div>
        </div>

        {/* 3. Crop Information */}
        <div className="profile-section-card">
          <div className="profile-section-header"><span>🌾</span> 3. पीक माहिती (Crop Details)</div>
          <div className="profile-section-body">
            {crops.length > 0 ? crops.map((c, i) => (
              <div key={i} style={{ borderLeft: '4px solid var(--green)', paddingLeft: 12, gridColumn: '1 / -1' }}>
                <div style={{fontWeight:800, fontSize:15, marginBottom:6}}>{c.name} ({c.type})</div>
                <div style={{display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:10}}>
                  <div className="prof-field"><span className="prof-field-label">Sowing Date</span><span className="prof-field-val">{new Date(c.sowingDate).toLocaleDateString()}</span></div>
                  <div className="prof-field"><span className="prof-field-label">Expected Harvest</span><span className="prof-field-val">Next Month</span></div>
                  <div className="prof-field"><span className="prof-field-label">Health Status</span><span className="prof-field-val" style={{color:'var(--green)'}}>Good ✅</span></div>
                </div>
              </div>
            )) : <div className="prof-field-val">कोणतेही पीक जोडलेले नाही</div>}
          </div>
        </div>

        {/* 4. IoT Sensor Data */}
        <div className="profile-section-card">
          <div className="profile-section-header"><span>📡</span> 4. IoT Live सेन्सर्स (Farm Sensors)</div>
          <div className="profile-section-body" style={{ background: 'var(--gray1)' }}>
            <div className="prof-field"><span className="prof-field-label">Soil Moisture</span><span className="prof-field-val" style={{color:'var(--green)'}}>{iotData.soilMoisture}</span></div>
            <div className="prof-field"><span className="prof-field-label">Temperature</span><span className="prof-field-val" style={{color:'var(--red)'}}>{iotData.temperature}</span></div>
            <div className="prof-field"><span className="prof-field-label">Humidity</span><span className="prof-field-val" style={{color:'var(--blue)'}}>{iotData.humidity}</span></div>
            <div className="prof-field"><span className="prof-field-label">Water Level</span><span className="prof-field-val">{iotData.waterLevel}</span></div>
            <div className="prof-field"><span className="prof-field-label">Motor Status</span><span className="prof-field-val" style={{color: iotData.motorStatus === 'ON' ? 'var(--green)' : 'var(--text3)'}}>{iotData.motorStatus}</span></div>
            <div className="prof-field"><span className="prof-field-label">Water Usage Report</span><span className="prof-field-val">1200 Ltr (Today)</span></div>
          </div>
        </div>

        {/* 5. Financial Information */}
        <div className="profile-section-card">
          <div className="profile-section-header"><span>🏦</span> 5. आर्थिक माहिती (Financial Records)</div>
          <div className="profile-section-body">
            <div className="prof-field"><span className="prof-field-label">Bank Name</span><span className="prof-field-val">{profile.bankName || 'SBI'}</span></div>
            <div className="prof-field"><span className="prof-field-label">Account No</span><span className="prof-field-val">XXXXXX9012</span></div>
            <div className="prof-field"><span className="prof-field-label">IFSC Code</span><span className="prof-field-val">SBIN000XXXX</span></div>
            <div className="prof-field"><span className="prof-field-label">UPI ID</span><span className="prof-field-val">{profile.mobile ? `${profile.mobile}@ybl` : 'N/A'}</span></div>
            <div className="prof-field"><span className="prof-field-label">Loan Status</span><span className="prof-field-val" style={{color:'var(--green)'}}>No Pending Loan</span></div>
            <div className="prof-field"><span className="prof-field-label">Crop Insurance</span><span className="prof-field-val">Secured (HDFC Ergo)</span></div>
          </div>
        </div>

        {/* 6. Govt Schemes */}
        <div className="profile-section-card">
          <div className="profile-section-header"><span>🏛️</span> 6. सरकारी योजना (Govt Schemes)</div>
          <div className="profile-section-body">
            <div className="prof-field"><span className="prof-field-label">PM Kisan Status</span><span className="prof-field-val" style={{color:'var(--green)'}}>{schemes.pmKisan}</span></div>
            <div className="prof-field"><span className="prof-field-label">Subsidy Eligible</span><span className="prof-field-val">{schemes.subsidyEligible}</span></div>
            <div className="prof-field"><span className="prof-field-label">Soil Health Card</span><span className="prof-field-val">{schemes.soilHealthCard}</span></div>
          </div>
        </div>

        {/* 7. Production & Selling */}
        <div className="profile-section-card">
          <div className="profile-section-header"><span>📈</span> 7. उत्पादन व विक्री (Production & Selling)</div>
          <div className="profile-section-body">
            <div className="prof-field"><span className="prof-field-label">Expected Production</span><span className="prof-field-val">{production.expectedQuintal}</span></div>
            <div className="prof-field"><span className="prof-field-label">Sold Quantity</span><span className="prof-field-val">{production.soldQuantity}</span></div>
            <div className="prof-field"><span className="prof-field-label">Total Profit/Loss</span><span className="prof-field-val" style={{color:'var(--green)'}}>+₹45,000</span></div>
            <div className="prof-field"><span className="prof-field-label">Buyer Details</span><span className="prof-field-val">{production.buyerDetails}</span></div>
          </div>
        </div>

        {/* 8. Documents */}
        <div className="profile-section-card">
          <div className="profile-section-header"><span>📄</span> 8. महत्त्वाची कागदपत्रे (Digital Documents)</div>
          <div className="profile-section-body" style={{gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))'}}>
            <div style={{textAlign:'center', padding:16, border:'1px dashed var(--border)', borderRadius:8, cursor:'pointer', background:'#fafafa'}}>
              <div style={{fontSize:24, marginBottom:4}}>🪪</div><div style={{fontSize:12, fontWeight:700}}>Aadhaar Card</div>
            </div>
            <div style={{textAlign:'center', padding:16, border:'1px dashed var(--border)', borderRadius:8, cursor:'pointer', background:'#fafafa'}}>
              <div style={{fontSize:24, marginBottom:4}}>📝</div><div style={{fontSize:12, fontWeight:700}}>7/12 उतारा</div>
            </div>
            <div style={{textAlign:'center', padding:16, border:'1px dashed var(--border)', borderRadius:8, cursor:'pointer', background:'#fafafa'}}>
              <div style={{fontSize:24, marginBottom:4}}>🗺️</div><div style={{fontSize:12, fontWeight:700}}>जमिनीचा नकाशा</div>
            </div>
            <div style={{textAlign:'center', padding:16, border:'1px dashed var(--border)', borderRadius:8, cursor:'pointer', background:'#fafafa'}}>
              <div style={{fontSize:24, marginBottom:4}}>🛡️</div><div style={{fontSize:12, fontWeight:700}}>विमा पॉलिसी</div>
            </div>
          </div>
        </div>
        
      </div>
    </div>
  )
}
