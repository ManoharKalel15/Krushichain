// src/pages/collector/CollectorDashboard.jsx
import React, { useState, useEffect } from 'react'
import toast from 'react-hot-toast'
import api from '../../config/api'
import { useAuth } from '../../context/AuthContext'
import { LoadingCenter, StatCard, StatusBadge, SectionTitle } from '../../components/UI'

export default function CollectorDashboard() {
  const { user } = useAuth()
  const [stats,   setStats]   = useState({})
  const [loading, setLoading] = useState(true)

  const load = async () => {
    try { const r = await api.get('/collector/dashboard'); setStats(r.data.stats||{}) }
    catch(e) { toast.error('Dashboard लोड error') }
    setLoading(false)
  }
  useEffect(() => { load() }, [])

  if (loading) return <LoadingCenter text="Collector Dashboard लोड होत आहे..." />

  return (
    <div>
      <div className="banner">
        <h2 style={{fontSize:22,fontWeight:900,marginBottom:4}}>👨‍💼 Collector Dashboard</h2>
        <p style={{opacity:.85}}>👤 {user?.name} &nbsp;|&nbsp; 📍 {user?.district||'सर्व जिल्हे'} &nbsp;|&nbsp; 🆔 {user?.krushiId}</p>
      </div>

      <div className="stat-cards">
        <StatCard icon="🧑‍🌾" value={stats.totalFarmers||0}      label="एकूण शेतकरी"         color="var(--green)"  />
        <StatCard icon="🌍"  value={stats.totalLands||0}       label="नोंदणीकृत जमिनी"     color="var(--blue)"   />
        <StatCard icon="🛡️"  value={stats.pendingClaims||0}    label="प्रलंबित विमा दावे"    color="var(--red)"    />
        <StatCard icon="💰"  value={stats.pendingSubsidies||0} label="प्रलंबित अनुदान अर्ज"  color="var(--gold)"   />
      </div>

      <div className="grid-2">
        <div className="card">
          <div className="card-title">📊 Overview</div>
          {[
            ['🌾 एकूण पिके',     stats.totalCrops||0,     'var(--green)'],
            ['✅ मंजूर दावे',    stats.approvedClaims||0,  'var(--blue)'],
            ['💸 पैसे दिलेले अनुदान', stats.paidSubsidies||0, 'var(--purple)'],
          ].map(([label,val,color])=>(
            <div key={label} style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'10px 0',borderBottom:'1px solid var(--border)'}}>
              <span style={{fontSize:14,color:'var(--text2)'}}>{label}</span>
              <span style={{fontWeight:900,fontSize:20,color}}>{val}</span>
            </div>
          ))}
        </div>
        <div className="card">
          <div className="card-title">⚡ जलद Actions</div>
          <div style={{display:'flex',flexDirection:'column',gap:8}}>
            {[
              ['🧑‍🌾 शेतकरी List पहा', '/collector/farmers'],
              ['🛡️ विमा दावे तपासा', '/collector/claims'],
              ['💰 अनुदान अर्ज तपासा', '/collector/subsidies'],
              ['📊 District Analytics', '/collector/analytics'],
            ].map(([label,path])=>(
              <button key={path} className="btn btn-outline btn-full" onClick={()=>window.location.href=path}>{label}</button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
