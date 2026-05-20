import React, { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import api from '../config/api'
import { useAuth } from '../context/AuthContext'
import { LoadingCenter, StatusBadge, StatCard, BlockchainBadge } from '../components/UI'

export default function CollectorDashboard() {
  const { user } = useAuth()
  const navigate  = useNavigate()
  const [stats,     setStats]     = useState({})
  const [claims,    setClaims]    = useState([])
  const [subsidies, setSubsidies] = useState([])
  const [farmers,   setFarmers]   = useState([])
  const [tab,       setTab]       = useState('overview')
  const [loading,   setLoading]   = useState(true)
  const [search,    setSearch]    = useState('')
  const [actId,     setActId]     = useState(null)

  const load = useCallback(async () => {
    try {
      const [sR, cR, subR, fR] = await Promise.all([
        api.get('/collector/dashboard'),
        api.get('/collector/claims?status=submitted&limit=50'),
        api.get('/collector/subsidies?status=submitted&limit=50'),
        api.get('/collector/farmers?limit=100'),
      ])
      setStats(sR.data.stats || {})
      setClaims(cR.data.claims || [])
      setSubsidies(subR.data.applications || [])
      setFarmers(fR.data.farmers || [])
    } catch(e) { toast.error('Data लोड error: ' + (e.response?.data?.error || e.message)) }
    setLoading(false)
  }, [])

  useEffect(() => { load() }, [])

  const updateClaim = async (id, status, approvedAmount) => {
    setActId(id)
    try {
      await api.put(`/insurance/${id}/status`, { status, approvedAmount, remarks: status === 'approved' ? 'Collector मंजूर' : 'नाकारले' })
      toast.success(status === 'approved' ? '✅ दावा मंजूर!' : '❌ नाकारला')
      load()
    } catch(e) { toast.error('Error: ' + (e.response?.data?.error || e.message)) }
    setActId(null)
  }

  const updateSubsidy = async (id, status, approvedAmt) => {
    setActId(id)
    try {
      await api.put(`/subsidy/${id}/status`, {
        status, approvedAmt,
        remarks: status === 'paid' ? 'DBT Transfer Initiated' : status === 'approved' ? 'Collector मंजूर' : 'नाकारले',
        utrNumber: status === 'paid' ? 'UTR' + Date.now().toString().slice(-10) : undefined
      })
      toast.success(status === 'paid' ? '💸 पैसे Transfer!' : status === 'approved' ? '✅ मंजूर!' : '❌ नाकारले')
      load()
    } catch(e) { toast.error('Error: ' + (e.response?.data?.error || e.message)) }
    setActId(null)
  }

  const filtered = farmers.filter(f =>
    !search || (f.name + f.mobile + (f.village||'') + (f.krushiId||'')).toLowerCase().includes(search.toLowerCase())
  )

  if (loading) return <LoadingCenter text="Collector Dashboard लोड होत आहे..." />

  const TABS = [
    { id:'overview',   label:'📊 Overview'                        },
    { id:'claims',     label:`🛡️ दावे (${claims.length})`         },
    { id:'subsidies',  label:`💰 अनुदान (${subsidies.length})`    },
    { id:'farmers',    label:`🧑‍🌾 शेतकरी (${farmers.length})`    },
  ]

  return (
    <div>
      {/* Banner */}
      <div className="banner" style={{marginBottom:16}}>
        <h2 style={{fontSize:20,fontWeight:900,marginBottom:4}}>👨‍💼 Collector Dashboard</h2>
        <p style={{opacity:.85}}>{user?.name} &nbsp;|&nbsp; {user?.district||'सर्व जिल्हे'}</p>
      </div>

      {/* Tabs */}
      <div className="tabs">
        {TABS.map(t => (
          <button key={t.id} className={`tab-btn ${tab===t.id?'active':''}`} onClick={()=>setTab(t.id)}>{t.label}</button>
        ))}
      </div>

      {/* ── OVERVIEW ── */}
      {tab === 'overview' && (
        <>
          <div className="stat-cards">
            <StatCard icon="🧑‍🌾" value={stats.totalFarmers||0}     label="एकूण शेतकरी"     color="var(--green)"   onClick={()=>setTab('farmers')}   />
            <StatCard icon="🌍"   value={stats.totalLands||0}     label="नोंदणीकृत जमिनी"  color="var(--blue)"    />
            <StatCard icon="🛡️"   value={stats.pendingClaims||0}  label="प्रलंबित दावे"     color="var(--red)"     onClick={()=>setTab('claims')}    />
            <StatCard icon="💰"   value={stats.pendingSubsidies||0} label="प्रलंबित अनुदान" color="var(--gold)"    onClick={()=>setTab('subsidies')} />
          </div>

          <div className="grid-2">
            {/* Pending Claims - top 5 */}
            <div className="card">
              <div className="card-title">🚨 प्रलंबित दावे (Top 5)</div>
              {claims.length === 0
                ? <div style={{textAlign:'center',color:'var(--text3)',padding:20}}>✅ कोणतेही प्रलंबित दावे नाहीत</div>
                : claims.slice(0,5).map(c => (
                  <div key={c._id} style={{padding:'10px 0',borderBottom:'1px solid var(--border)'}}>
                    <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:6}}>
                      <div>
                        <div style={{fontWeight:700,fontSize:13}}>{c.userId?.name||c.farmerName}</div>
                        <div style={{fontSize:12,color:'var(--text3)'}}>{c.claimType} – {c.cropType} – ₹{Number(c.lossAmount).toLocaleString('mr-IN')}</div>
                        <div style={{fontSize:11,color:'var(--text3)'}}>📍 {c.village}</div>
                      </div>
                      <StatusBadge status={c.status} />
                    </div>
                    <div style={{display:'flex',gap:6}}>
                      <button className="btn btn-primary btn-sm" disabled={actId===c._id} onClick={()=>updateClaim(c._id,'approved',Math.floor(c.lossAmount*0.8))}>✅ मंजूर</button>
                      <button className="btn btn-danger btn-sm"  disabled={actId===c._id} onClick={()=>updateClaim(c._id,'rejected',0)}>❌ नाकार</button>
                    </div>
                  </div>
                ))
              }
              {claims.length > 5 && <button className="btn btn-ghost btn-sm btn-full" style={{marginTop:8}} onClick={()=>setTab('claims')}>सर्व {claims.length} दावे पहा →</button>}
            </div>

            {/* Pending Subsidies - top 5 */}
            <div className="card">
              <div className="card-title">💰 प्रलंबित अनुदान (Top 5)</div>
              {subsidies.length === 0
                ? <div style={{textAlign:'center',color:'var(--text3)',padding:20}}>✅ कोणतेही प्रलंबित अनुदान नाहीत</div>
                : subsidies.slice(0,5).map(a => (
                  <div key={a._id} style={{padding:'10px 0',borderBottom:'1px solid var(--border)'}}>
                    <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:6}}>
                      <div>
                        <div style={{fontWeight:700,fontSize:13}}>{a.userId?.name||a.farmerName}</div>
                        <div style={{fontSize:12,color:'var(--text3)'}}>{a.schemeName}</div>
                        <div style={{fontSize:11,color:'var(--text3)'}}>📍 {a.village} &nbsp;|&nbsp; ₹{Number(a.amount||0).toLocaleString('mr-IN')}</div>
                      </div>
                      <StatusBadge status={a.status} />
                    </div>
                    <div style={{display:'flex',gap:6}}>
                      <button className="btn btn-primary btn-sm"   disabled={actId===a._id} onClick={()=>updateSubsidy(a._id,'approved',a.amount||6000)}>✅ मंजूर</button>
                      <button className="btn btn-secondary btn-sm" disabled={actId===a._id} onClick={()=>updateSubsidy(a._id,'paid',a.amount||6000)}>💸 Paid</button>
                      <button className="btn btn-danger btn-sm"    disabled={actId===a._id} onClick={()=>updateSubsidy(a._id,'rejected',0)}>❌</button>
                    </div>
                  </div>
                ))
              }
              {subsidies.length > 5 && <button className="btn btn-ghost btn-sm btn-full" style={{marginTop:8}} onClick={()=>setTab('subsidies')}>सर्व {subsidies.length} अर्ज पहा →</button>}
            </div>
          </div>
        </>
      )}

      {/* ── ALL CLAIMS ── */}
      {tab === 'claims' && (
        <div>
          <div style={{fontWeight:800,fontSize:16,marginBottom:14}}>🛡️ सर्व विमा दावे ({claims.length})</div>
          {claims.length === 0
            ? <div className="card" style={{textAlign:'center',color:'var(--text3)',padding:40}}>✅ कोणतेही प्रलंबित दावे नाहीत</div>
            : claims.map(c => (
              <div key={c._id} className="card" style={{marginBottom:12}}>
                <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:8}}>
                  <div>
                    <div style={{fontWeight:800,fontSize:15}}>{c.userId?.name||c.farmerName}</div>
                    <div style={{fontSize:13,color:'var(--text3)'}}>📱 {c.userId?.mobile||c.farmerMobile} &nbsp;|&nbsp; 📍 {c.village}</div>
                    <div style={{fontSize:13,color:'var(--text3)'}}>{c.claimType} – {c.cropType} – {c.affectedArea} एकर</div>
                    <div style={{fontWeight:700,fontSize:15,color:'var(--red)',marginTop:4}}>नुकसान: ₹{Number(c.lossAmount).toLocaleString('mr-IN')} ({c.damagePercent}%)</div>
                    {c.description && <div style={{fontSize:12,color:'var(--text2)',marginTop:4,fontStyle:'italic'}}>{c.description}</div>}
                    <div style={{fontSize:11,color:'var(--text3)',marginTop:2}}>📅 {new Date(c.incidentDate).toLocaleDateString('mr-IN')}</div>
                  </div>
                  <StatusBadge status={c.status} />
                </div>
                <BlockchainBadge txHash={c.txHash} />
                <div style={{display:'flex',gap:8,marginTop:10,paddingTop:8,borderTop:'1px solid var(--border)'}}>
                  <button className="btn btn-primary btn-sm"   disabled={actId===c._id} onClick={()=>updateClaim(c._id,'approved',Math.floor(c.lossAmount*0.8))}>✅ मंजूर (80%)</button>
                  <button className="btn btn-secondary btn-sm" disabled={actId===c._id} onClick={()=>updateClaim(c._id,'paid',Math.floor(c.lossAmount*0.8))}>💸 Paid</button>
                  <button className="btn btn-danger btn-sm"    disabled={actId===c._id} onClick={()=>updateClaim(c._id,'rejected',0)}>❌ नाकार</button>
                </div>
              </div>
            ))
          }
        </div>
      )}

      {/* ── ALL SUBSIDIES ── */}
      {tab === 'subsidies' && (
        <div>
          <div style={{fontWeight:800,fontSize:16,marginBottom:14}}>💰 सर्व अनुदान अर्ज ({subsidies.length})</div>
          {subsidies.length === 0
            ? <div className="card" style={{textAlign:'center',color:'var(--text3)',padding:40}}>✅ कोणतेही प्रलंबित अर्ज नाहीत</div>
            : subsidies.map(a => (
              <div key={a._id} className="card" style={{marginBottom:12}}>
                <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:8}}>
                  <div>
                    <div style={{fontWeight:800,fontSize:15}}>{a.userId?.name||a.farmerName}</div>
                    <div style={{fontSize:13,color:'var(--text3)'}}>📱 {a.userId?.mobile||a.farmerMobile} &nbsp;|&nbsp; 📍 {a.village}</div>
                    <div style={{fontWeight:700,color:'var(--green)',marginTop:4}}>{a.schemeName}</div>
                    <div style={{fontSize:13,color:'var(--text3)'}}>रक्कम: ₹{Number(a.amount||0).toLocaleString('mr-IN')}</div>
                    {a.bankAccount && <div style={{fontSize:12,color:'var(--blue)',marginTop:2}}>🏦 {a.bankAccount} &nbsp;|&nbsp; {a.ifscCode}</div>}
                    <div style={{fontSize:11,color:'var(--text3)',marginTop:2}}>📅 {new Date(a.createdAt).toLocaleDateString('mr-IN')}</div>
                  </div>
                  <StatusBadge status={a.status} />
                </div>
                <div style={{display:'flex',gap:8,paddingTop:8,borderTop:'1px solid var(--border)'}}>
                  <button className="btn btn-primary btn-sm"   disabled={actId===a._id} onClick={()=>updateSubsidy(a._id,'approved',a.amount||6000)}>✅ मंजूर</button>
                  <button className="btn btn-secondary btn-sm" disabled={actId===a._id} onClick={()=>updateSubsidy(a._id,'paid',a.amount||6000)}>💸 DBT Transfer</button>
                  <button className="btn btn-danger btn-sm"    disabled={actId===a._id} onClick={()=>updateSubsidy(a._id,'rejected',0)}>❌ नाकार</button>
                </div>
              </div>
            ))
          }
        </div>
      )}

      {/* ── FARMERS LIST ── */}
      {tab === 'farmers' && (
        <div>
          <input className="form-control" style={{marginBottom:12}} value={search}
            onChange={e=>setSearch(e.target.value)}
            placeholder="🔍 नाव, मोबाइल, KrushiID, गाव शोधा..." />
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>शेतकरी</th><th>मोबाइल</th><th>गाव / जिल्हा</th>
                  <th>KrushiID</th><th>जमिनी</th><th>पिके</th>
                  <th>Status</th><th>नोंदणी तारीख</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(f => (
                  <tr key={f._id} style={{cursor:'pointer'}}
                    onClick={() => navigate(`/collector/farmer/${f._id}`)}>
                    <td>
                      <div style={{display:'flex',alignItems:'center',gap:8}}>
                        <div className="avatar">{f.name?.[0]||'?'}</div>
                        <div>
                          <div style={{fontWeight:700}}>{f.name}</div>
                          <div style={{fontSize:11,color:'var(--text3)'}}>{f.isVerified?'✅ Verified':'⏳ Pending'}</div>
                        </div>
                      </div>
                    </td>
                    <td style={{fontFamily:'monospace',fontSize:12}}>{f.mobile}</td>
                    <td>{f.village}{f.district?`, ${f.district}`:''}</td>
                    <td style={{fontFamily:'monospace',fontSize:11,color:'var(--green)'}}>{f.krushiId}</td>
                    <td style={{textAlign:'center',fontWeight:700,color:'var(--blue)'}}>{f.totalLands||0}</td>
                    <td style={{textAlign:'center',fontWeight:700,color:'var(--gold)'}}>{f.totalCrops||0}</td>
                    <td><span className={`badge ${f.isVerified?'badge-green':'badge-gold'}`}>{f.isVerified?'✅ Verified':'⏳ Pending'}</span></td>
                    <td style={{fontSize:12,color:'var(--text3)'}}>{new Date(f.createdAt).toLocaleDateString('mr-IN')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filtered.length === 0 && (
              <div style={{textAlign:'center',padding:30,color:'var(--text3)'}}>
                {search ? 'कोणताही शेतकरी सापडला नाही' : 'अजून कोणीही नोंदणी केली नाही'}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
