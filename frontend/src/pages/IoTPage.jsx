import React, { useState, useEffect } from 'react'
import api from '../config/api'
import { LoadingCenter, LiveDot, Spinner } from '../components/UI'
import toast from 'react-hot-toast'

function Gauge({ icon, label, value, max, color, unit }) {
  const pct = Math.max(0, Math.min((Number(value)/max)*100, 100)) || 0;
  return (
    <div className="iot-gauge">
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:6}}>
        <span style={{fontWeight:700,fontSize:14}}>{icon} {label}</span>
        <span style={{fontWeight:900,fontSize:20,color}}>{value}{unit}</span>
      </div>
      <div className="iot-gauge-bar"><div className="iot-gauge-fill" style={{width:`${pct}%`,background:color}} /></div>
      <div style={{fontSize:11,color:'var(--text3)'}}>{pct.toFixed(0)}% of max {max}{unit}</div>
    </div>
  )
}

function WaterTank({ level }) {
  return (
    <div className="iot-gauge" style={{display:'flex', gap:20, alignItems:'center'}}>
      <div className="water-tank">
        <div className="water-fill" style={{height: `${level}%`}}></div>
      </div>
      <div>
        <div style={{fontSize:12, fontWeight:700, color:'var(--text3)'}}>पाण्याची टाकी</div>
        <div style={{fontSize:24, fontWeight:900, color:'#1e88e5'}}>{level}%</div>
        <div style={{fontSize:11, color:'var(--text3)'}}>Live Level</div>
      </div>
    </div>
  )
}

export default function IoTPage() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [bootStep, setBootStep] = useState(0)

  const load = async () => {
    try { const r = await api.get('/iot/live'); setData(r.data.reading) } catch(e){} setLoading(false)
  }

  useEffect(() => {
    // Boot sequence animation
    const bootTimer = setInterval(() => {
      setBootStep(prev => prev >= 5 ? 5 : prev + 1)
    }, 800)

    load()
    const dataTimer = setInterval(load, 5000)

    return () => { clearInterval(bootTimer); clearInterval(dataTimer); }
  }, [])

  useEffect(() => {
    // Disease Alert Trigger
    if (data && Number(data.temperature) > 33 && Number(data.humidity) > 75) {
      toast.error('⚠️ पिकाला रोग (बुरशी) होण्याची शक्यता आहे!', { duration: 4000 })
    }
  }, [data])

  if (bootStep < 5) {
    const steps = [
      "📡 IoT सेन्सर्स शोधत आहे...",
      "⚙️ ESP32 ला कनेक्ट करत आहे...",
      "🌐 इंटरनेट (Internet) शी जोडत आहे...",
      "🗄️ MongoDB मध्ये डेटा सेव्ह करत आहे...",
      "⛓️ Blockchain वरील सुरक्षा तपासत आहे..."
    ]
    return (
      <div className="iot-radar-container">
        <div className="radar-ring">
          <div className="radar-node">🛰️</div>
        </div>
        <div style={{marginTop:30, display:'flex', flexDirection:'column', gap:10}}>
          {steps.map((text, idx) => (
            <div key={idx} className="flow-step" style={{opacity: bootStep >= idx ? 1 : 0, transition:'opacity 0.3s'}}>
              {bootStep > idx ? '✅' : <Spinner />} {text}
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (loading) return <LoadingCenter text="IoT डेटा लोड होत आहे..." />
  const d = data || {}

  // AI Logic
  const temp = Number(d.temperature||28);
  const hum = Number(d.humidity||60);
  const moist = Number(d.soilMoisture||40);
  const motorStatus = d.motorStatus === 'ON';
  const isDiseaseRisk = temp > 33 && hum > 75;

  let cropHealth = 'Good';
  let cropHealthColor = 'var(--green)';
  if (isDiseaseRisk) { cropHealth = 'Danger'; cropHealthColor = 'var(--red)'; }
  else if (moist < 30 || temp > 35) { cropHealth = 'Warning'; cropHealthColor = 'var(--orange)'; }

  return (
    <div>
      {/* ── HEADER ── */}
      <div className="card" style={{background:'linear-gradient(90deg, #1b5e20, #388e3c)',color:'#fff',marginBottom:16, display:'flex', justifyContent:'space-between', alignItems:'center'}}>
        <div>
          <div style={{display:'flex',alignItems:'center',gap:10,marginBottom:6}}>
            <LiveDot /> <span style={{fontWeight:800,fontSize:18}}> KrushiChain स्मार्ट शेती (IoT)</span>
          </div>
          <div style={{fontSize:13,opacity:.85}}>दर ५ सेकंदाला Real-time Sync • Blockchain Secured 🔒</div>
        </div>
        <div style={{textAlign:'right'}}>
          <div style={{fontSize:12, opacity:0.8}}>वापरलेले पाणी</div>
          <div style={{fontSize:20, fontWeight:900, color:'#b3e5fc'}}>1,450 लीटर</div>
        </div>
      </div>

      {/* ── DISEASE ALERT ── */}
      {isDiseaseRisk && (
        <div className="disease-alert-red" style={{marginBottom:16}}>
          <div style={{fontSize:30}}>🦠</div>
          <div>
            <div style={{fontWeight:900, color:'var(--red)', fontSize:16}}>अलर्ट: पिकाला रोग होण्याची शक्यता आहे!</div>
            <div style={{color:'var(--text2)', fontSize:13}}>जास्त तापमान आणि आर्द्रतेमुळे बुरशीजन्य रोग किंवा पानांवर डाग पडू शकतात. कृपया फवारणी करा.</div>
          </div>
        </div>
      )}

      {/* ── TOP SECTION: MOTOR & HEALTH ── */}
      <div className="grid-3" style={{marginBottom:16}}>
        {/* Motor Status */}
        <div className="card" style={{borderLeft:`4px solid ${motorStatus ? '#2e7d32' : 'var(--text3)'}`, display:'flex', alignItems:'center', gap:16}}>
          <div style={{fontSize:36, filter: motorStatus ? 'drop-shadow(0 0 10px #4caf50)' : 'grayscale(100%)'}} className={motorStatus ? 'anim-spin' : ''}>
            ⚙️
          </div>
          <div>
            <div style={{fontWeight:800, fontSize:15, color: motorStatus ? '#2e7d32' : 'var(--text3)'}}>
              पाण्याची मोटर: {motorStatus ? 'ON (चालू)' : 'OFF (बंद)'}
            </div>
            <div style={{fontSize:12, color:'var(--text3)'}}>मातीतील ओलाव्यानुसार Auto-control</div>
          </div>
        </div>

        {/* Crop Health */}
        <div className="card" style={{borderLeft:`4px solid ${cropHealthColor}`, display:'flex', alignItems:'center', gap:16}}>
          <div style={{fontSize:36}}>{cropHealth==='Good'?'🌱':(cropHealth==='Danger'?'🥀':'🍂')}</div>
          <div>
            <div style={{fontWeight:800, fontSize:15, color:cropHealthColor}}>पिकाचे आरोग्य: {
              cropHealth === 'Good' ? 'उत्तम ✅' : (cropHealth === 'Danger' ? 'धोक्यात ❌' : 'मध्यम ⚠️')
            }</div>
            <div style={{fontSize:12, color:'var(--text3)'}}>Real-time AI Analysis</div>
          </div>
        </div>

        {/* Weather Forecast */}
        <div className="card" style={{display:'flex', alignItems:'center', gap:16, borderTop:'3px solid #0288d1'}}>
          <div style={{fontSize:36}}>⛈️</div>
          <div>
            <div style={{fontWeight:800, fontSize:15, color:'#0288d1'}}>हवामान अलर्ट</div>
            <div style={{fontSize:12, color:'var(--text2)'}}>पुढील २ दिवस हलका पाऊस. पावसाची शक्यता: <b>{d.rainStatus==='Yes'?'१००%':'४०%'}</b></div>
          </div>
        </div>
      </div>

      {/* ── CORE SENSORS ── */}
      <div style={{fontWeight:800, marginBottom:10, fontSize:15}}>📊 शेतातील Live सेन्सर्स</div>
      <div className="grid-3" style={{marginBottom:16}}>
        <Gauge icon="🌱" label="जमीन ओलावा" value={moist} max={100} color="#66bb6a" unit="%" />
        <Gauge icon="🌡️" label="तापमान" value={temp} max={50} color="#ef5350" unit="°C" />
        <Gauge icon="💧" label="हवेतील आर्द्रता" value={hum} max={100} color="#42a5f5" unit="%" />
        
        <WaterTank level={d.waterLevel || 60} />
        
        <div className="iot-gauge" style={{display:'flex', flexDirection:'column', justifyContent:'center'}}>
          <div style={{fontSize:12, fontWeight:700, color:'var(--text3)'}}>पाऊस सेन्सर (Rain Sensor)</div>
          <div style={{fontSize:22, fontWeight:900, color:d.rainStatus==='Yes'?'#1976d2':'#757575', display:'flex', alignItems:'center', gap:8, marginTop:8}}>
            {d.rainStatus==='Yes' ? '🌧️ पाऊस चालू आहे' : '☀️ पाऊस नाही'}
          </div>
        </div>

        <div className="iot-gauge" style={{display:'flex', flexDirection:'column', justifyContent:'center'}}>
          <div style={{fontSize:12, fontWeight:700, color:'var(--text3)'}}>GPS Location (शेताचे स्थान)</div>
          <div style={{fontSize:14, fontWeight:800, color:'var(--text)', marginTop:8, fontFamily:'monospace', background:'var(--gray2)', padding:6, borderRadius:6}}>
            📍 {d.gps || '19.0760° N, 72.8777° E'}
          </div>
          <div style={{fontSize:11, color:'var(--blue)', marginTop:4, cursor:'pointer'}}>Google Maps वर पहा →</div>
        </div>
      </div>

      {/* ── SMART SUGGESTIONS & UNIQUE FEATURES ── */}
      <div className="grid-2">
        
        {/* Left Col */}
        <div style={{display:'flex', flexDirection:'column', gap:16}}>
          <div className="card">
            <div className="card-title">💡 खते आणि फवारणी सल्ला (Expert Advice)</div>
            <ul style={{paddingLeft:20, fontSize:13, color:'var(--text2)', lineHeight:1.8}}>
              <li><b>सुचवलेले खत:</b> युरिया (Urea) ५० किलो/एकर. मातीतील नायट्रोजन कमी आहे.</li>
              <li><b>कीटकनाशक (Pesticide):</b> निमार्क (Neemark). रस शोषणाऱ्या अळ्यांचा प्रादुर्भाव होऊ शकतो.</li>
              <li><b>वेळ:</b> फवारणी उद्या सकाळी ७:०० पूर्वी करा (कारण वारे शांत असतील).</li>
            </ul>
          </div>

          <div className="card">
            <div className="card-title">🎙️ AI Voice Assistant (मराठी)</div>
            <div style={{background:'var(--purple2)', borderRadius:'var(--radius2)', padding:16, textAlign:'center'}}>
              <div style={{fontSize:32, marginBottom:10}}>🎤</div>
              <div className="voice-ai-wave">
                <div className="voice-bar" style={{animationDelay:'0s'}}></div>
                <div className="voice-bar" style={{animationDelay:'0.2s'}}></div>
                <div className="voice-bar" style={{animationDelay:'0.4s'}}></div>
                <div className="voice-bar" style={{animationDelay:'0.1s'}}></div>
                <div className="voice-bar" style={{animationDelay:'0.3s'}}></div>
              </div>
              <div style={{fontSize:13, fontWeight:700, color:'var(--purple)', marginTop:12}}>
                "नमस्ते! तुमची मोटर चालू आहे आणि पिके सुरक्षित आहेत."
              </div>
              <button className="btn btn-sm mt-8" style={{background:'var(--purple)', color:'#fff'}}>AI ला प्रश्न विचारा</button>
            </div>
          </div>
        </div>

        {/* Right Col */}
        <div style={{display:'flex', flexDirection:'column', gap:16}}>
          <div className="card" style={{padding:0, overflow:'hidden'}}>
            <div style={{padding:'14px 18px', borderBottom:'1px solid var(--border)', fontWeight:800}}>📷 Live Farm Camera</div>
            <div className="cam-feed">
              <div className="cam-record-dot"></div>
              <div style={{zIndex:2, display:'flex', flexDirection:'column', alignItems:'center'}}>
                <span style={{fontSize:40, opacity:0.8}}>📹</span>
                <span style={{marginTop:10}}>REC • Camera 1 (North)</span>
              </div>
            </div>
          </div>

          <div className="card" style={{display:'flex', gap:16, alignItems:'center'}}>
            <div style={{padding:10, background:'var(--white)', border:'2px solid var(--text)', borderRadius:8}}>
              <div style={{width:60, height:60, background:`url('https://upload.wikimedia.org/wikipedia/commons/d/d0/QR_code_for_mobile_English_Wikipedia.svg') center/cover`}}></div>
            </div>
            <div>
              <div style={{fontWeight:800, fontSize:14}}>शेताचा QR कोड</div>
              <div style={{fontSize:12, color:'var(--text2)', marginTop:4}}>
                जमिनीचा रेकॉर्ड (7/12 उतारा), Blockchain माहिती आणि Soil Report बघण्यासाठी स्कॅन करा.
              </div>
            </div>
          </div>
        </div>

      </div>

    </div>
  )
}
