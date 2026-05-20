import React, { useState } from 'react'

export default function SupplyChainPage() {
  const [batchId, setBatchId] = useState('BATCH-MH-102')

  return (
    <div style={{ animation: 'fadeUpIn 0.5s', paddingBottom: 40 }}>
      {/* Ticker for Live APMC Rates */}
      <div className="ticker-wrap">
        <div className="ticker-track">
          <div className="ticker-item">🔴 मुंबई APMC (कांदा): ₹2,500/Q</div>
          <div className="ticker-item">🟢 पुणे APMC (टोमॅटो): ₹1,200/Q</div>
          <div className="ticker-item">🟢 नाशिक APMC (द्राक्षे): ₹5,000/Q</div>
          <div className="ticker-item">🔴 जळगाव (कापूस): ₹7,200/Q</div>
          <div className="ticker-item">🟢 लातूर (सोयाबीन): ₹4,800/Q</div>
          <div className="ticker-item">🔴 नागपूर (संत्री): ₹3,500/Q</div>
          
          {/* Duplicate for infinite loop illusion */}
          <div className="ticker-item">🔴 मुंबई APMC (कांदा): ₹2,500/Q</div>
          <div className="ticker-item">🟢 पुणे APMC (टोमॅटो): ₹1,200/Q</div>
          <div className="ticker-item">🟢 नाशिक APMC (द्राक्षे): ₹5,000/Q</div>
          <div className="ticker-item">🔴 जळगाव (कापूस): ₹7,200/Q</div>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 30 }}>
        <div style={{ fontSize: 40 }}>🚚</div>
        <div>
          <h2 style={{ fontSize: 24, fontWeight: 900, margin: 0, letterSpacing: 0.5 }}>TrusTrak (पारदर्शक साखळी)</h2>
          <p style={{ color: 'var(--text2)', fontSize: 14, marginTop: 4 }}>वाहतूक, वजन आणि खऱ्या बाजारभावाचा डिजिटल ट्रॅकर</p>
        </div>
      </div>

      <div className="trustrak-card" style={{ display: 'flex', gap: 20, alignItems: 'flex-end', background: 'var(--gray1)', boxShadow: 'none' }}>
        <div style={{ flex: 1 }}>
          <label style={{ fontSize: 12, fontWeight: 700, color: 'var(--text3)', textTransform: 'uppercase' }}>QR / NFC Batch ID</label>
          <input 
            className="form-control" 
            style={{ fontSize: 16, fontWeight: 800, letterSpacing: 1, marginTop: 8 }} 
            value={batchId} 
            onChange={e => setBatchId(e.target.value)} 
          />
        </div>
        <button className="btn btn-primary" style={{ padding: '0 30px', height: 46 }}>मागोवा घ्या (Track)</button>
      </div>

      {/* Main Track Logic View */}
      <div className="trustrak-card">
        <h3 style={{ fontSize: 18, fontWeight: 800, marginBottom: 20, borderBottom: '1px solid var(--border)', paddingBottom: 15 }}>
          📦 Crop Journey: {batchId} (कापूस)
        </h3>

        <div className="timeline-container">
          
          {/* Step 1: Farm */}
          <div className="timeline-step completed">
            <div className="timeline-icon">🧑‍🌾</div>
            <div className="timeline-content">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                <div>
                  <div style={{ fontSize: 16, fontWeight: 800, color: 'var(--green)' }}>१. शेतीतून निघाला (Farm Harvest)</div>
                  <div style={{ fontSize: 13, color: 'var(--text3)', marginTop: 4 }}>📍 जळगाव, महाराष्ट्र | ता. 12 ऑक्टोबर</div>
                </div>
                <span className="blockchain-badge">🔗 Block: 0xA12...</span>
              </div>
              <div style={{ display: 'flex', gap: 30, marginTop: 15, background: '#fff', padding: 15, borderRadius: 8, border: '1px solid var(--border)' }}>
                <div><div style={{ fontSize: 11, color: 'var(--text3)' }}>शेतकऱ्याचे नाव</div><div style={{ fontWeight: 700 }}>मनोहर पाटील</div></div>
                <div><div style={{ fontSize: 11, color: 'var(--text3)' }}>IoT मशीन वजन</div><div style={{ fontWeight: 700, color: 'var(--blue)' }}>12.5 क्विंटल ⚖️</div></div>
              </div>
            </div>
          </div>

          {/* Step 2: Middleman */}
          <div className="timeline-step completed">
            <div className="timeline-icon">🤝</div>
            <div className="timeline-content">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                <div>
                  <div style={{ fontSize: 16, fontWeight: 800, color: 'var(--blue)' }}>२. व्यापाऱ्याने खरेदी केला (Middleman)</div>
                  <div style={{ fontSize: 13, color: 'var(--text3)', marginTop: 4 }}>👤 सुरेश ट्रेडिंग कं. | ता. 14 ऑक्टोबर</div>
                </div>
                <span className="blockchain-badge">🔗 Block: 0xB89...</span>
              </div>
              <div style={{ background: '#e3f2fd', padding: 15, borderRadius: 8, marginTop: 15 }}>
                <div style={{ fontSize: 13, color: 'var(--blue)' }}>शेतकऱ्याला दिलेला भाव:</div>
                <div style={{ fontSize: 22, fontWeight: 900, color: 'var(--blue)' }}>₹6,000 / क्विंटल</div>
              </div>
            </div>
          </div>

          {/* Step 3: Final APMC */}
          <div className="timeline-step completed">
            <div className="timeline-icon">🏭</div>
            <div className="timeline-content">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                <div>
                  <div style={{ fontSize: 16, fontWeight: 800, color: 'var(--purple)' }}>३. अंतिम बाजारपेठ (APMC Market)</div>
                  <div style={{ fontSize: 13, color: 'var(--text3)', marginTop: 4 }}>📍 मुंबई APMC टर्मिनल | ता. 17 ऑक्टोबर</div>
                </div>
                <span className="blockchain-badge">🔗 Block: 0xC56...</span>
              </div>
              <div style={{ background: '#f3e5f5', padding: 15, borderRadius: 8, marginTop: 15 }}>
                <div style={{ fontSize: 13, color: 'var(--purple)' }}>व्यापाऱ्याने बाजारात विकलेला अंतिम भाव:</div>
                <div style={{ fontSize: 24, fontWeight: 900, color: 'var(--purple)' }}>₹7,800 / क्विंटल</div>
                <div style={{ fontSize: 12, color: 'var(--text2)', marginTop: 8 }}>व्यापाऱ्याचा अतिरिक्त नफा (Extra Margin): <span style={{fontWeight:800, color:'var(--red)'}}>₹1,800/Q</span></div>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Bonus Smart Contract Section */}
      <div className="bonus-box">
        <div>
          <h3 style={{ fontSize: 18, fontWeight: 900, color: '#1b5e20', display: 'flex', alignItems: 'center', gap: 8 }}>
            <span>🎁</span> Fair-Trade Smart Contract (शेतकरी बोनस)
          </h3>
          <p style={{ color: '#2e7d32', fontSize: 14, marginTop: 8, maxWidth: 500, lineHeight: 1.5 }}>
            व्यापाऱ्याने बाजारात जास्त नफा कमावल्यामुळे, कृषीचेनच्या 'Fair-Trade' नियमानुसार त्यातील <b style={{fontSize:16}}>१५% नफा</b> (Profit Share) मूळ शेतकऱ्याच्या खात्यात ट्रान्सफर करण्यात आला आहे!
          </p>
        </div>
        <div style={{ textAlign: 'center', background: '#fff', padding: '15px 30px', borderRadius: 12, border: '2px solid #81c784' }}>
          <div style={{ fontSize: 12, fontWeight: 800, color: '#388e3c' }}>तुमचा ट्रान्सफर झालेला बोनस</div>
          <div style={{ fontSize: 32, fontWeight: 900, color: '#1b5e20', margin: '5px 0' }}>+₹3,375</div>
          <div style={{ fontSize: 11, color: '#66bb6a', fontFamily: 'monospace' }}>Tx: 0x9f5a...d21e ✅</div>
        </div>
      </div>

    </div>
  )
}
