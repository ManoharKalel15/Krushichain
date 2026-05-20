import React, { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import api from '../config/api'
import { useAuth } from '../context/AuthContext'
import { Spinner } from '../components/UI'
import { useGoogleLogin } from '@react-oauth/google'

const DISTRICTS = ['अहमदनगर','अकोला','अमरावती','औरंगाबाद','बीड','भंडारा','बुलढाणा','चंद्रपूर','धुळे','गडचिरोली','गोंदिया','हिंगोली','जळगाव','जालना','कोल्हापूर','लातूर','मुंबई शहर','मुंबई उपनगर','नागपूर','नांदेड','नंदुरबार','नाशिक','उस्मानाबाद','पालघर','परभणी','पुणे','रायगड','रत्नागिरी','सांगली','सातारा','सिंधुदुर्ग','सोलापूर','ठाणे','वर्धा','वाशिम','यवतमाळ']

export default function LoginPage() {
  const { login } = useAuth()
  const navigate   = useNavigate()
  const [tab,      setTab]      = useState('login')
  const [step,     setStep]     = useState(1)
  const [role,     setRole]     = useState('shetkari')
  const [loading,  setLoading]  = useState(false)
  const [testOTP,  setTestOTP]  = useState('')
  const [otp,      setOtp]      = useState(['','','','','',''])
  const otpRefs = useRef([...Array(6)].map(() => React.createRef()))
  const [googleLoading, setGoogleLoading] = useState(false)

  const googleLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      try {
        const res = await api.post('/auth/google', { token: tokenResponse.access_token })
        login(res.data.user, res.data.token)
        toast.success(`स्वागत आहे, ${res.data.user.name}! 🙏`)
        const isCollector = ['collector','minister'].includes(res.data.user.role)
        navigate(isCollector ? '/collector/dashboard' : '/app/dashboard')
      } catch (e) {
        toast.error(e.response?.data?.error || 'Google Login फेल झाले.')
      }
      setGoogleLoading(false)
    },
    onError: () => {
      toast.error('Google Login Cancelled')
      setGoogleLoading(false)
    }
  })

  // Form
  const [mobile,   setMobile]   = useState('')
  const [name,     setName]     = useState('')
  const [aadhaar,  setAadhaar]  = useState('')
  const [village,  setVillage]  = useState('')
  const [district, setDistrict] = useState('')
  const [taluka,   setTaluka]   = useState('')
  const [bank,     setBank]     = useState('')
  const [ifsc,     setIfsc]     = useState('')
  const [bankName, setBankName] = useState('')

  const handleOtpKey = (val, idx) => {
    const v = val.replace(/\D/g,'')
    const next = [...otp]; next[idx] = v; setOtp(next)
    if (v && idx < 5) otpRefs.current[idx+1]?.current?.focus()
  }
  const handleOtpBack = (e, idx) => {
    if (e.key === 'Backspace' && !otp[idx] && idx > 0) otpRefs.current[idx-1]?.current?.focus()
  }

  const sendOTP = async () => {
    if (!/^\d{10}$/.test(mobile)) { toast.error('10 अंकांचा mobile नंबर टाका.'); return }
    if (tab === 'register' && (!name.trim() || !village.trim())) { toast.error('नाव आणि गाव आवश्यक.'); return }
    if (tab === 'register' && !/^\d{4}$/.test(aadhaar)) { toast.error('Aadhaar चे शेवटचे 4 अंक टाका.'); return }
    setLoading(true)
    try {
      const res = await api.post('/auth/send-otp', { mobile, purpose: tab === 'register' ? 'register' : 'login' })
      if (res.data.testOTP) setTestOTP(res.data.testOTP)
      setStep(2)
      toast.success('OTP पाठवला!')
      setTimeout(() => otpRefs.current[0]?.current?.focus(), 200)
    } catch (e) {
      toast.error(e.response?.data?.error || 'OTP पाठवता आला नाही.')
    }
    setLoading(false)
  }

  const verifyOTP = async () => {
    const otpStr = otp.join('')
    if (otpStr.length !== 6) { toast.error('6 अंकांचा OTP टाका.'); return }
    setLoading(true)
    try {
      let res
      if (tab === 'register') {
        res = await api.post('/auth/register', { name: name.trim(), mobile, aadhaarLast4: aadhaar, otp: otpStr, role, village: village.trim(), taluka, district, bankAccount: bank, ifscCode: ifsc, bankName })
      } else {
        res = await api.post('/auth/login', { mobile, otp: otpStr })
      }
      login(res.data.user, res.data.token)
      toast.success(`स्वागत आहे, ${res.data.user.name}! 🙏`)
      const isCollector = ['collector','minister'].includes(res.data.user.role)
      navigate(isCollector ? '/collector/dashboard' : '/app/dashboard')
    } catch (e) {
      toast.error(e.response?.data?.error || 'चुकीचा OTP.')
      setOtp(['','','','','',''])
      otpRefs.current[0]?.current?.focus()
    }
    setLoading(false)
  }

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-logo">
          <div className="icon">🌾</div>
          <h1>KrushiChain</h1>
          <p>शेतकरी डिजिटल व्यासपीठ – Maharashtra</p>
          <span className="pilot-badge">🚀 District Pilot App</span>
        </div>

        {/* Tabs */}
        <div className="tabs">
          <button className={`tab-btn ${tab==='login'?'active':''}`} onClick={() => { setTab('login'); setStep(1); setTestOTP(''); setOtp(['','','','','','']) }}>🔓 Login</button>
          <button className={`tab-btn ${tab==='register'?'active':''}`} onClick={() => { setTab('register'); setStep(1); setTestOTP(''); setOtp(['','','','','','']) }}>📝 नोंदणी</button>
        </div>

        {step === 1 ? (
          <>
            {/* Role */}
            <div className="form-group">
              <label className="form-label">भूमिका निवडा</label>
              <div className="role-grid">
                {[{r:'shetkari',icon:'🧑‍🌾',name:'शेतकरी'},{r:'collector',icon:'👨‍💼',name:'Collector'}].map(({r,icon,name:n}) => (
                  <div key={r} className={`role-card ${role===r?'selected':''}`} onClick={() => setRole(r)}>
                    <div className="role-icon">{icon}</div>
                    <div className="role-name">{n}</div>
                  </div>
                ))}
              </div>
            </div>

            {tab === 'register' && (
              <>
                <div className="form-group">
                  <label className="form-label">पूर्ण नाव *</label>
                  <input className="form-control" value={name} onChange={e=>setName(e.target.value)} placeholder="उदा. रामकृष्ण पाटील" />
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">गाव *</label>
                    <input className="form-control" value={village} onChange={e=>setVillage(e.target.value)} placeholder="येवले" />
                  </div>
                  <div className="form-group">
                    <label className="form-label">तालुका</label>
                    <input className="form-control" value={taluka} onChange={e=>setTaluka(e.target.value)} placeholder="नेवासा" />
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">जिल्हा</label>
                  <select className="form-control" value={district} onChange={e=>setDistrict(e.target.value)}>
                    <option value="">-- जिल्हा निवडा --</option>
                    {DISTRICTS.map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Aadhaar शेवटचे 4 अंक *</label>
                    <input className="form-control" value={aadhaar} onChange={e=>setAadhaar(e.target.value)} placeholder="XXXX" maxLength={4} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">बँक खाते (पर्यायी)</label>
                    <input className="form-control" value={bank} onChange={e=>setBank(e.target.value)} placeholder="Account नंबर" />
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">IFSC Code</label>
                    <input className="form-control" value={ifsc} onChange={e=>setIfsc(e.target.value.toUpperCase())} placeholder="SBIN0001234" />
                  </div>
                  <div className="form-group">
                    <label className="form-label">बँकेचे नाव</label>
                    <input className="form-control" value={bankName} onChange={e=>setBankName(e.target.value)} placeholder="SBI" />
                  </div>
                </div>
              </>
            )}

            <div className="form-group">
              <label className="form-label">मोबाइल नंबर {tab === 'register' ? '*' : '(किंवा Google वापरा)'}</label>
              <input className="form-control" value={mobile} onChange={e=>setMobile(e.target.value.replace(/\D/g,''))} placeholder="10 अंकांचा नंबर" maxLength={10} />
            </div>

            <button className="btn btn-primary btn-full btn-lg" onClick={sendOTP} disabled={loading || googleLoading}>
              {loading ? <Spinner /> : '📱 OTP पाठवा'}
            </button>

            {tab === 'login' && (
              <>
                <div className="divider-with-text">किंवा</div>
                <button 
                  className={`google-btn ${googleLoading ? 'is-loading' : ''}`} 
                  onClick={() => { setGoogleLoading(true); googleLogin(); }} 
                  disabled={loading || googleLoading}
                >
                  <img src="https://upload.wikimedia.org/wikipedia/commons/c/c1/Google_%22G%22_logo.svg" alt="Google" className="google-icon" />
                  Google ने Sign in करा
                  <div className="google-loading-overlay"><div className="spinner"></div></div>
                </button>
              </>
            )}
          </>
        ) : (
          <>
            <button className="btn btn-ghost btn-sm mb-12" onClick={() => { setStep(1); setTestOTP(''); setOtp(['','','','','','']) }}>← मागे जा</button>
            <p style={{color:'var(--text2)',marginBottom:16,fontSize:14}}>+91 {mobile} वर OTP पाठवला</p>

            {testOTP && (
              <div className="sms-notification">
                <div className="sms-icon">💬</div>
                <div className="sms-content">
                  <div className="sms-title">Messages • Now</div>
                  <div className="sms-text">KrushiChain: तुमचा OTP आहे <b>{testOTP}</b>. कोणासोबत शेअर करू नका.</div>
                </div>
              </div>
            )}

            <div className="form-group">
              <label className="form-label" style={{textAlign:'center',display:'block',marginBottom:12}}>6-अंकी OTP टाका</label>
              <div className="otp-boxes">
                {otp.map((d,i) => (
                  <input key={i} ref={otpRefs.current[i]} className="otp-box" value={d}
                    onChange={e => handleOtpKey(e.target.value, i)}
                    onKeyDown={e => handleOtpBack(e, i)} maxLength={1} />
                ))}
              </div>
            </div>

            <button className="btn btn-primary btn-full btn-lg" onClick={verifyOTP} disabled={loading}>
              {loading ? <Spinner /> : tab==='register' ? '✅ नोंदणी करा' : '🔓 Login'}
            </button>
            <button className="btn btn-ghost btn-full mt-8" onClick={sendOTP} disabled={loading}>🔄 OTP पुन्हा पाठवा</button>
          </>
        )}

        <div style={{textAlign:'center',marginTop:20,fontSize:12,color:'var(--text3)'}}>
          Made with ❤️ for Maharashtra Farmers | KrushiChain © 2024
        </div>
      </div>
    </div>
  )
}
