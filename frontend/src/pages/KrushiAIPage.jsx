import React, { useState, useEffect } from 'react'
import api from '../config/api'
import { LoadingCenter } from '../components/UI'

export default function KrushiAIPage() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [crop, setCrop] = useState('कापूस')

  const loadAI = async () => {
    setLoading(true)
    try {
      const res = await api.get(`/ai/predict?crop=${crop}`)
      setData(res.data.aiData)
    } catch (e) {
      console.error(e)
    }
    setLoading(false)
  }

  useEffect(() => {
    loadAI()
  }, [crop])

  if (loading && !data) return <LoadingCenter text="कृषी AI डेटा विश्लेषित करत आहे..." />

  const ai = data?.cropAnalysis || {}
  const suggestions = data?.aiSuggestions || {}
  const contract = data?.smartContract || {}
  const nearby = data?.nearbyFarmers || []

  return (
    <div style={{ animation: 'fadeUpIn 0.6s cubic-bezier(0.16, 1, 0.3, 1)', paddingBottom: 60 }}>
      
      {/* 🚀 Sleek Header */}
      <div className="card" style={{
        background: 'linear-gradient(135deg, #0f172a, #1e1b4b)', 
        color: '#fff', 
        borderRadius: 24,
        padding: '30px 40px',
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        marginBottom: 40,
        boxShadow: '0 20px 40px rgba(0,0,0,0.15)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
          <div style={{ fontSize: 56, filter: 'drop-shadow(0 0 15px rgba(255,255,255,0.3))' }}>🤖</div>
          <div>
            <div style={{ fontSize: 28, fontWeight: 900, letterSpacing: 0.5 }}>कृषी AI महा-मार्गदर्शक</div>
            <div style={{ fontSize: 14, opacity: 0.7, marginTop: 4, letterSpacing: 1, textTransform: 'uppercase' }}>Advanced Market & Crop Analytics</div>
          </div>
        </div>
        <div>
          <select 
            className="form-control" 
            style={{ 
              background: 'rgba(255,255,255,0.1)', color: '#fff', border: '1px solid rgba(255,255,255,0.2)', 
              width: 200, fontSize: 16, fontWeight: 'bold', padding: '12px 20px', borderRadius: 12, cursor: 'pointer'
            }} 
            value={crop} onChange={e => setCrop(e.target.value)}
          >
            <option value="कापूस" style={{color:'#000'}}>🌿 कापूस (Cotton)</option>
            <option value="कांदा" style={{color:'#000'}}>🧅 कांदा (Onion)</option>
            <option value="सोयाबीन" style={{color:'#000'}}>🫘 सोयाबीन (Soybean)</option>
            <option value="गहू" style={{color:'#000'}}>🌾 गहू (Wheat)</option>
            <option value="टोमॅटो" style={{color:'#000'}}>🍅 टोमॅटो (Tomato)</option>
          </select>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.2fr) minmax(0, 1fr)', gap: 40 }}>
        
        {/* 🌟 LEFT COLUMN (Spacious & Clean) */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 30 }}>
          
          {/* Main Predictor Matrix */}
          <div>
            <h3 style={{ fontSize: 22, fontWeight: 900, marginBottom: 20, color: '#1e293b' }}>📊 मार्केट प्रेडिक्शन (Market Prediction)</h3>
            
            {/* Huge Profit & Demand Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 20 }}>
              
              <div style={{ background: '#fff', padding: 30, borderRadius: 20, boxShadow: '0 10px 30px rgba(0,0,0,0.03)', border: '1px solid #f1f5f9' }}>
                <div style={{ fontSize: 13, color: '#64748b', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1 }}>अंदाजित नफा (Expected Margin)</div>
                <div style={{ fontSize: 36, fontWeight: 900, color: '#10b981', marginTop: 10 }}>+{ai.profitPrediction}</div>
              </div>

              <div style={{ background: '#fff', padding: 30, borderRadius: 20, boxShadow: '0 10px 30px rgba(0,0,0,0.03)', border: '1px solid #f1f5f9' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 }}>
                  <span style={{ fontSize: 13, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: 1 }}>बाजारातील मागणी</span>
                  <span style={{ fontSize: 20, fontWeight: 900, color: ai.demandMeter > 70 ? '#10b981' : '#f59e0b' }}>{ai.demandMeter}%</span>
                </div>
                <div style={{ background: '#f1f5f9', height: 12, borderRadius: 10, overflow: 'hidden' }}>
                  <div style={{ width: `${ai.demandMeter}%`, background: 'linear-gradient(90deg, #34d399, #10b981)', height: '100%', borderRadius: 10, transition: 'width 1.5s ease-out' }}></div>
                </div>
              </div>
            </div>

            {/* Smart Advice Row */}
            <div style={{ background: '#f8fafc', padding: 25, borderRadius: 20, border: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontSize: 13, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: 1 }}>विक्रीची सर्वोत्तम वेळ (Best Time to Sell)</div>
                <div style={{ fontSize: 20, fontWeight: 900, color: '#0f172a', marginTop: 8 }}>{ai.bestSellingTime}</div>
              </div>
              <div style={{ fontSize: 32, background: '#e0e7ff', width: 60, height: 60, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>📈</div>
            </div>

            {/* Risk Alert if HIGH */}
            {ai.riskAlert === 'High' && (
              <div style={{ marginTop: 20, background: '#fef2f2', border: '1px solid #fecaca', padding: '20px 25px', borderRadius: 20, animation: 'pulse 2s infinite' }}>
                <div style={{ color: '#dc2626', fontSize: 16, fontWeight: 900, display: 'flex', gap: 10, alignItems: 'center' }}>
                  <span style={{ fontSize: 24 }}>⚠️</span> Price Crash Alert (हाय रिस्क)
                </div>
                <div style={{ color: '#991b1b', fontSize: 13, marginTop: 8, lineHeight: 1.5 }}>
                  सध्या बाजारात या पिकाचा पुरवठा (Supply) खूप जास्त होण्याची शक्यता आहे. लागवड करणे धोक्याचे ठरू शकते.
                </div>
              </div>
            )}
          </div>

          {/* AI Recommendations Minimalist Cards */}
          <div>
            <h3 style={{ fontSize: 22, fontWeight: 900, marginBottom: 20, color: '#1e293b' }}>💡 AI सूचना व सल्ले</h3>
            <div style={{ display: 'grid', gap: 15 }}>
              <div style={{ padding: 20, background: '#f0fdf4', borderRadius: 16, borderLeft: '4px solid #22c55e', display: 'flex', gap: 15, alignItems: 'center' }}>
                <span style={{ fontSize: 28 }}>🌱</span>
                <div>
                  <div style={{ fontSize: 12, color: '#15803d', fontWeight: 800 }}>उत्तम पीक (Recommendation)</div>
                  <div style={{ fontSize: 15, color: '#166534', fontWeight: 600, marginTop: 4 }}>{suggestions.bestCropRecommendation}</div>
                </div>
              </div>
              
              <div style={{ padding: 20, background: '#f0f9ff', borderRadius: 16, borderLeft: '4px solid #0ea5e9', display: 'flex', gap: 15, alignItems: 'center' }}>
                <span style={{ fontSize: 28 }}>💧</span>
                <div>
                  <div style={{ fontSize: 12, color: '#0369a1', fontWeight: 800 }}>पाणी व खत (Fertilizer)</div>
                  <div style={{ fontSize: 15, color: '#075985', fontWeight: 600, marginTop: 4 }}>{suggestions.fertilizer}</div>
                </div>
              </div>

              <div style={{ padding: 20, background: '#fff1f2', borderRadius: 16, borderLeft: '4px solid #f43f5e', display: 'flex', gap: 15, alignItems: 'center' }}>
                <span style={{ fontSize: 28 }}>🦠</span>
                <div>
                  <div style={{ fontSize: 12, color: '#be123c', fontWeight: 800 }}>रोगराईचा धोका (Disease Alert)</div>
                  <div style={{ fontSize: 15, color: '#9f1239', fontWeight: 600, marginTop: 4 }}>{suggestions.diseaseAlert}</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 🌟 RIGHT COLUMN (Visual Analytics) */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 30 }}>
          
          {/* Smart Contract Premium Promo */}
          <div style={{ 
            background: 'linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)', 
            borderRadius: 24, padding: 30, 
            border: '1px solid #bfdbfe',
            position: 'relative', overflow: 'hidden'
          }}>
            <div style={{ position: 'absolute', top: -20, right: -20, fontSize: 120, opacity: 0.05 }}>🤝</div>
            
            <div style={{ display: 'inline-block', background: '#2563eb', color: '#fff', fontSize: 11, fontWeight: 800, padding: '4px 12px', borderRadius: 20, marginBottom: 15 }}>
              ✓ BLOCKCHAIN VERIFIED
            </div>
            
            <h3 style={{ fontSize: 24, fontWeight: 900, color: '#1e3a8a', margin: 0 }}>Smart Contract Farming</h3>
            <p style={{ color: '#3b82f6', fontSize: 14, marginTop: 8, lineHeight: 1.5, marginBottom: 25 }}>
              तुमचे पीक लागवडीआधीच कंपनीला फिक्स रेटने विका. भावातील घसरणीची चिंता विसरा!
            </p>

            <div style={{ background: '#fff', padding: 20, borderRadius: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: '0 4px 15px rgba(37,99,235,0.1)' }}>
              <div>
                <div style={{ fontSize: 12, color: '#64748b', fontWeight: 800, textTransform: 'uppercase' }}>{contract.company} Rate</div>
                <div style={{ fontSize: 24, fontWeight: 900, color: '#2563eb', marginTop: 4 }}>₹{contract.preBookingPrice} / Q</div>
              </div>
              <button className="btn btn-primary" style={{ background: '#2563eb', padding: '0 24px', height: 44, borderRadius: 12, fontSize: 14 }}>Apply Now</button>
            </div>
          </div>

          {/* District Heatmap (Animated) */}
          <div style={{ background: '#fff', padding: 30, borderRadius: 24, boxShadow: '0 10px 30px rgba(0,0,0,0.03)', border: '1px solid #f1f5f9' }}>
            <h3 style={{ fontSize: 18, fontWeight: 900, color: '#1e293b', marginBottom: 20 }}>🗺️ परिसरातील पिकांचा ट्रेंड (Trending)</h3>
            
            {/* Minimalist Progress Indicators */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              {nearby.map((n, i) => (
                <div key={i}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, fontSize: 14, fontWeight: 800, color: '#334155' }}>
                    <span>{n.crop}</span>
                    <span style={{ color: '#0ea5e9' }}>{n.percentage}%</span>
                  </div>
                  <div style={{ background: '#f1f5f9', height: 8, borderRadius: 10, overflow: 'hidden' }}>
                    <div style={{ 
                      width: `${n.percentage}%`, 
                      background: i === 0 ? 'linear-gradient(90deg, #38bdf8, #0284c7)' : i === 1 ? 'linear-gradient(90deg, #a78bfa, #7c3aed)' : 'linear-gradient(90deg, #fb923c, #ea580c)', 
                      height: '100%', borderRadius: 10, transition: 'width 1.5s ease-out', animationDelay: `${i * 0.2}s` 
                    }}></div>
                  </div>
                </div>
              ))}
            </div>
            
            <div style={{ marginTop: 25, padding: 15, background: '#f8fafc', borderRadius: 12, fontSize: 13, color: '#64748b', textAlign: 'center', fontWeight: 600 }}>
              🧭 <b>Heatmap Status:</b> {ai.districtHeatmap}
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}
