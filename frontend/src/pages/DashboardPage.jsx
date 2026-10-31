import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import api from '../config/api'
import { LoadingCenter, LiveDot } from '../components/UI'

const ALERTS = [
  { icon:'💧', color:'var(--blue)',   title:'सिंचन आवश्यक – शेत अ',          sub:'ओलावा कमी – आज पाणी द्या!'            },
  { icon:'🌩️', color:'var(--orange)', title:'हवामान सूचना',                   sub:'उद्या पाऊस – पिकांचे संरक्षण करा'     },
  { icon:'🤖', color:'var(--purple)', title:'AI: करपा रोग शक्यता आढळली',     sub:'मँकोझेब 75% WP 2kg/एकर फवारा करा'   },
]

export default function DashboardPage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [stats,  setStats]  = useState({ lands:0, crops:0 })
  const [iot,    setIot]    = useState(null)
  const [loading,setLoading]= useState(true)

  useEffect(() => {
    Promise.all([
      api.get('/users/stats'),
      api.get('/iot/live'),
    ]).then(([sRes, iRes]) => {
      setStats(sRes.data.stats)
      setIot(iRes.data.reading)
    }).catch(()=>{}).finally(()=>setLoading(false))
  }, [])

  if (loading) return <LoadingCenter text="Dashboard लोड होत आहे..." />

  return (
    <div style={{ animation: 'fadeUpIn 0.8s cubic-bezier(0.16, 1, 0.3, 1)', paddingBottom: 40 }}>
      
      {/* 🚀 STUNNING ANIMATED NATURE BANNER */}
      <div className="nature-banner">
        {/* Animated Background Elements */}
        <div className="sun"></div>
        <div className="cloud cloud1"></div>
        <div className="cloud cloud2"></div>
        <div className="birds">🦅 🐦 🦅</div>
        <div className="hills"></div>
        <div className="tree" style={{ left: '10%' }}>🌳</div>
        <div className="tree" style={{ right: '5%', animationDelay: '1s' }}>🌲</div>
        <div className="tree" style={{ left: '40%', fontSize: 30, animationDelay: '2s', filter: 'blur(1px)', zIndex: 0 }}>🌴</div>
        
        {/* Banner Content */}
        <div style={{ position: 'relative', zIndex: 2, animation: 'fadeUpIn 1s cubic-bezier(0.16, 1, 0.3, 1)', textShadow: '0 2px 10px rgba(255,255,255,0.8)' }}>
          <h2 style={{ fontSize: 36, fontWeight: 900, marginBottom: 8, letterSpacing: -0.5 }}>नमस्ते, {user?.name?.split(' ')[0]}! 🙏</h2>
          <p style={{ opacity: 0.9, fontSize: 16, fontWeight: 600, letterSpacing: 0.5, color: '#0f172a' }}>📍 {user?.village}{user?.district?`, ${user.district}`:''} &nbsp;|&nbsp; 🆔 {user?.krushiId}</p>
          
          <div style={{ display: 'flex', gap: 12, marginTop: 24, flexWrap: 'wrap' }}>
            <span style={{ background: 'rgba(255,255,255,0.7)', padding: '8px 16px', borderRadius: 20, color: '#047857', fontSize: 13, fontWeight: 900, backdropFilter: 'blur(5px)', border: '1px solid rgba(255,255,255,0.8)', boxShadow: '0 4px 15px rgba(0,0,0,0.05)' }}>🛡️ विमा: सक्रिय</span>
            <span style={{ background: 'rgba(255,255,255,0.7)', padding: '8px 16px', borderRadius: 20, color: '#b45309', fontSize: 13, fontWeight: 900, backdropFilter: 'blur(5px)', border: '1px solid rgba(255,255,255,0.8)', display: 'flex', alignItems: 'center', gap: 6, boxShadow: '0 4px 15px rgba(0,0,0,0.05)' }}><LiveDot color="#b45309" /> IoT: Live</span>
            <span style={{ background: 'rgba(255,255,255,0.7)', padding: '8px 16px', borderRadius: 20, color: '#0369a1', fontSize: 13, fontWeight: 900, backdropFilter: 'blur(5px)', border: '1px solid rgba(255,255,255,0.8)', boxShadow: '0 4px 15px rgba(0,0,0,0.05)' }}>⛓️ Blockchain Secured</span>
          </div>
        </div>
      </div>

      {/* 🌟 HUGE BOLD STATS WITH FLOAT EFFECT */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 20, marginBottom: 35 }}>
        {[
          { icon: '🌍', val: stats.lands, label: 'नोंदणीकृत जमिनी', color: '#10b981', path: '/app/lands' },
          { icon: '🌾', val: stats.crops, label: 'सक्रिय पिके', color: '#f59e0b', path: '/app/crops' },
          { icon: '📡', val: <span style={{display:'flex', alignItems:'center', gap:6}}><LiveDot /> Live</span>, label: 'IoT सेन्सर स्टॅटस', color: '#0ea5e9', path: '/app/iot' },
        ].map((s, i) => (
          <div 
            key={i} 
            style={{ 
              background: '#fff', padding: 25, borderRadius: 20, cursor: 'pointer',
              boxShadow: '0 10px 25px rgba(0,0,0,0.04)', border: '1px solid #f1f5f9',
              display: 'flex', alignItems: 'center', gap: 20,
              animation: `fadeUpIn ${0.8 + (i * 0.2)}s cubic-bezier(0.16, 1, 0.3, 1)`,
              transition: 'transform 0.3s ease, box-shadow 0.3s ease'
            }}
            onMouseOver={(e) => { e.currentTarget.style.transform = 'translateY(-5px)'; e.currentTarget.style.boxShadow = '0 15px 35px rgba(0,0,0,0.08)' }}
            onMouseOut={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 10px 25px rgba(0,0,0,0.04)' }}
            onClick={() => navigate(s.path)}
          >
            <div style={{ fontSize: 36, background: `${s.color}15`, width: 70, height: 70, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {s.icon}
            </div>
            <div>
              <div style={{ fontSize: 28, fontWeight: 900, color: '#1e293b' }}>{s.val}</div>
              <div style={{ fontSize: 14, fontWeight: 700, color: '#64748b', marginTop: 4, letterSpacing: 0.5 }}>{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.2fr) minmax(0, 1fr)', gap: 30 }}>
        
        {/* 📡 IOT LIVE ANIMATED WIDGET */}
        <div style={{ 
          background: '#fff', borderRadius: 24, padding: 35, 
          boxShadow: '0 10px 30px rgba(0,0,0,0.03)', border: '1px solid #f1f5f9',
          animation: 'fadeUpIn 1s'
        }}>
          <h3 style={{ fontSize: 20, fontWeight: 900, color: '#1e293b', marginBottom: 25, display: 'flex', alignItems: 'center', gap: 10 }}>
            <LiveDot /> IoT Live सेन्सर्स <span style={{ fontSize: 12, color: '#94a2b8', fontWeight: 600, background: '#f1f5f9', padding: '4px 10px', borderRadius: 12 }}>(Auto-Refresh)</span>
          </h3>
          
          {iot && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 15 }}>
              {[
                {icon:'🌡️',label:'तापमान',  val:`${iot.temperature}°C`,  color:'#ef4444'},
                {icon:'💧',label:'आर्द्रता', val:`${iot.humidity}%`,      color:'#3b82f6'},
                {icon:'🌱',label:'ओलावा',    val:`${iot.soilMoisture}%`,  color:'#10b981'},
                {icon:'⚗️',label:'pH',       val:`${iot.soilPH}`,         color:'#a855f7'},
                {icon:'☀️',label:'प्रकाश',   val:`${iot.lightLevel} lx`,  color:'#f59e0b'},
                {icon:'🌬️',label:'वारा',     val:`${iot.windSpeed} km/h`, color:'#06b6d4'},
              ].map((s, i) => (
                <div key={i} style={{ 
                  background: '#f8fafc', borderRadius: 16, padding: '20px 10px', textAlign: 'center', border: '1px solid #e2e8f0',
                  transition: 'background 0.3s', cursor: 'pointer'
                }}
                onMouseOver={(e) => e.currentTarget.style.background = '#f1f5f9'}
                onMouseOut={(e) => e.currentTarget.style.background = '#f8fafc'}
                >
                  <div style={{ fontSize: 28, animation: 'float 3s infinite' }}>{s.icon}</div>
                  <div style={{ fontWeight: 900, fontSize: 18, color: s.color, marginTop: 8 }}>{s.val}</div>
                  <div style={{ fontSize: 12, fontWeight: 700, color: '#64748b', marginTop: 2 }}>{s.label}</div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 30 }}>
          
          {/* ⚡ QUICK NAV PILLS */}
          <div style={{ background: '#fff', borderRadius: 24, padding: 30, boxShadow: '0 10px 30px rgba(0,0,0,0.03)', border: '1px solid #f1f5f9' }}>
            <h3 style={{ fontSize: 18, fontWeight: 900, color: '#1e293b', marginBottom: 20 }}>⚡ जलद Navigation</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              {[
                ['⛓️ MST Web3 Hub',  '/app/web3-hub', '#059669'],
                ['📍 GPS नकाशा',    '/app/map', '#2563eb'],
                ['🧠 कृषी-AI',      '/app/ai-predictor', '#7c3aed'],
                ['🚚 पुरवठा साखळी', '/app/supply-chain', '#f59e0b'],
                ['📱 QR Code',      '/app/qr', '#10b981'],
                ['🗺️ जमीन नोंद', '/app/lands', '#0d9488'],
                ['📦 बाजारपेठ',     '/app/market', '#db2777'],
              ].map(([label, path, color], i) => (
                <button 
                  key={i} 
                  style={{
                    background: `${color}15`, color: color, fontWeight: 800, padding: '12px', borderRadius: 12,
                    fontSize: 14, cursor: 'pointer', transition: 'all 0.2s', border: `1px solid ${color}30`
                  }}
                  onMouseOver={(e) => { e.currentTarget.style.background = color; e.currentTarget.style.color = '#fff' }}
                  onMouseOut={(e) => { e.currentTarget.style.background = `${color}15`; e.currentTarget.style.color = color }}
                  onClick={() => navigate(path)}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* 🚨 BOLD ALERTS */}
          <div style={{ background: '#fff', borderRadius: 24, padding: 30, boxShadow: '0 10px 30px rgba(0,0,0,0.03)', border: '1px solid #f1f5f9' }}>
            <h3 style={{ fontSize: 18, fontWeight: 900, color: '#1e293b', marginBottom: 20 }}>🚨 महत्त्वाच्या सूचना</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 15 }}>
              {ALERTS.map((a, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 16, background: '#f8fafc', padding: 15, borderRadius: 16, border: '1px solid #e2e8f0' }}>
                  <div style={{ width: 44, height: 44, borderRadius: 14, background: a.color+'20', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, flexShrink: 0 }}>
                    {a.icon}
                  </div>
                  <div>
                    <div style={{ fontWeight: 800, fontSize: 14, color: '#334155' }}>{a.title}</div>
                    <div style={{ fontSize: 12, color: '#64748b', fontWeight: 600, marginTop: 4 }}>{a.sub}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}
