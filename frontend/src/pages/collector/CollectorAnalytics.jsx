import React, { useState, useEffect } from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts'
import api from '../../config/api'
import { LoadingCenter } from '../../components/UI'

const COLORS = ['#2d7a35','#e6a817','#1565c0','#c62828','#6a1b9a','#00695c','#e65100','#37474f']

export default function CollectorAnalytics() {
  const [data,    setData]    = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/analytics/district')
      .then(r => setData(r.data.analytics))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <LoadingCenter text="District Analytics लोड होत आहे..." />
  if (!data)   return <div className="card" style={{padding:30,textAlign:'center'}}>Analytics उपलब्ध नाही. Backend connect करा.</div>

  const villageData = (data.villageDistribution||[]).map(v => ({ name: v._id||'Unknown', शेतकरी: v.count }))
  const cropData    = (data.cropDistribution||[]).map(c => ({ name: c._id||'Unknown', value: c.count }))

  return (
    <div>
      <div className="stat-cards">
        {[
          { icon:'🧑‍🌾', val: data.farmers||0,           label:'एकूण शेतकरी'    },
          { icon:'🌍',   val: data.lands||0,             label:'एकूण जमिनी'     },
          { icon:'🌾',   val: data.crops||0,             label:'एकूण पिके'       },
          { icon:'💰',   val: `₹${(data.totalDisbursed||0).toLocaleString('mr-IN')}`, label:'एकूण वितरित' },
        ].map(s => (
          <div key={s.label} className="stat-card">
            <div className="stat-icon">{s.icon}</div>
            <div className="stat-value" style={{fontSize:22}}>{s.val}</div>
            <div className="stat-label">{s.label}</div>
          </div>
        ))}
      </div>

      <div className="grid-2">
        <div className="card">
          <div className="card-title">🏘️ गावनिहाय शेतकरी (Top 10)</div>
          {villageData.length > 0 ? (
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={villageData} layout="vertical" margin={{left:60,right:20,top:5,bottom:5}}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis type="category" dataKey="name" style={{fontSize:11}} width={80} />
                <Tooltip />
                <Bar dataKey="शेतकरी" fill="#2d7a35" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div style={{textAlign:'center',color:'var(--text3)',padding:40}}>अजून डेटा नाही – farmers नोंदणी झाल्यावर दिसेल</div>
          )}
        </div>

        <div className="card">
          <div className="card-title">🌾 जिल्हानिहाय पीक वितरण</div>
          {cropData.length > 0 ? (
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie data={cropData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100}
                  label={({name,percent}) => `${name} ${(percent*100).toFixed(0)}%`}>
                  {cropData.map((_,i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div style={{textAlign:'center',color:'var(--text3)',padding:40}}>अजून पीक डेटा नाही</div>
          )}
        </div>
      </div>

      <div className="grid-2">
        <div className="card">
          <div className="card-title">🛡️ विमा Summary</div>
          {[['एकूण दावे',data.totalClaims||0],['एकूण अनुदान',data.totalSubsidies||0],['एकूण वितरित',`₹${(data.totalDisbursed||0).toLocaleString('mr-IN')}`]].map(([l,v])=>(
            <div key={l} style={{display:'flex',justifyContent:'space-between',padding:'10px 0',borderBottom:'1px solid var(--border)'}}>
              <span style={{color:'var(--text3)'}}>{l}</span>
              <span style={{fontWeight:700}}>{v}</span>
            </div>
          ))}
        </div>
        <div className="card">
          <div className="card-title">📊 Registration Trend</div>
          <div style={{display:'flex',flexDirection:'column',gap:8}}>
            {[['🧑‍🌾 शेतकरी',data.farmers||0,'var(--green)'],['🌍 जमिनी',data.lands||0,'var(--blue)'],['🌾 पिके',data.crops||0,'var(--gold)']].map(([l,v,c])=>(
              <div key={l}>
                <div style={{display:'flex',justifyContent:'space-between',fontSize:13,marginBottom:4}}><span>{l}</span><span style={{fontWeight:700}}>{v}</span></div>
                <div className="progress-bar"><div className="progress-fill" style={{width:`${Math.min(v*10,100)}%`,background:c}} /></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
