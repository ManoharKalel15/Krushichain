import React, { useState } from 'react'
import { QRCodeSVG } from 'qrcode.react'
import { useAuth } from '../context/AuthContext'

export default function QRPage() {
  const { user } = useAuth()
  const [unlocked, setUnlocked] = useState(false)
  const [pin, setPin] = useState('')

  // Generate the public profile link
  const publicProfileUrl = user ? `${window.location.origin}/farmer/${user.krushiId}` : ''

  const handleUnlock = () => {
    if (pin.length >= 4) {
      setUnlocked(true)
    } else {
      alert('कृपया 4 अंकी PIN टाका.')
    }
  }

  return (
    <div style={{ animation: 'fadeUpIn 0.5s', maxWidth: 600, margin: '0 auto' }}>
      <div className="card" style={{ textAlign: 'center', padding: '40px 20px' }}>
        <h2 style={{ marginBottom: 20 }}>📱 तुमचा Smart Krushi Digital ID</h2>
        <p style={{ color: 'var(--text2)', marginBottom: 30, fontSize: 14 }}>
          हा QR कोड स्कॅन केल्यावर तुमची संपूर्ण माहिती (जमीन, पीक, फायनान्स, IoT डेटा) एका क्लिकवर मिळवता येईल.
        </p>

        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 30 }}>
          <div className="qr-wrapper">
            {!unlocked && (
              <div className="qr-locked-overlay">
                <div style={{ fontSize: 28, marginBottom: 10 }}>🔒</div>
                <div style={{ fontWeight: 800, marginBottom: 15 }}>QR लॉक केलेला आहे</div>
                <input 
                  type="password" 
                  maxLength={4} 
                  placeholder="PIN टाका" 
                  value={pin}
                  onChange={(e) => setPin(e.target.value.replace(/\D/g,''))}
                  style={{ textAlign:'center', width: 120, padding: 8, borderRadius: 8, outline: 'none', border: 'none', marginBottom: 15, color:'black', fontWeight:900, letterSpacing:4 }} 
                />
                <button className="btn btn-primary btn-sm" onClick={handleUnlock}>Unlock QR</button>
              </div>
            )}
            
            <QRCodeSVG 
              value={publicProfileUrl} 
              size={220} 
              fgColor="#000000" /* User wanted Black */
              bgColor="#ffffff"
            />

            {/* Scanning Laser Animation */}
            {unlocked && <div className="qr-scanner-line"></div>}
            
          </div>
        </div>

        <div style={{ fontWeight: 800, fontSize: 18, color: 'var(--text)', marginBottom: 5 }}>
          {user?.krushiId}
        </div>
        <div style={{ fontSize: 14, color: 'var(--text3)' }}>
          {user?.name}
        </div>

        {unlocked && (
          <div style={{ marginTop: 30, display: 'flex', gap: 10, justifyContent: 'center' }}>
            <button className="btn" style={{ background: '#000', color: '#fff' }}>⬇️ Download PNG</button>
            <button className="btn" style={{ background: 'var(--blue)', color: '#fff' }} onClick={() => window.open(publicProfileUrl, '_blank')}>🔗 Open Profile</button>
          </div>
        )}
      </div>

      <div className="card mt-16">
        <div className="card-title">🛡️ सिक्युरिटी आणि प्रायव्हसी</div>
        <ul style={{ paddingLeft: 20, fontSize: 13, color: 'var(--text2)', lineHeight: 1.8 }}>
          <li>हा QR कोड स्कॅन करणाऱ्याला तुमचा आधार नंबर <b>Masked (xxxx-xxxx-1234)</b> स्वरूपात दिसेल.</li>
          <li>QR कोड उघडण्यासाठी नेहमी <b>सुरक्षा PIN</b> विचारला जाईल.</li>
          <li>Blockchain Verification मुळे कोणीही तुमचा जमिनीचा रेकॉर्ड (7/12) बदलू शकत नाही.</li>
        </ul>
      </div>
    </div>
  )
}
