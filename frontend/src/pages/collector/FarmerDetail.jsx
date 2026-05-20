import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import api from '../../config/api'
import toast from 'react-hot-toast'
import { LoadingCenter, StatusBadge, BlockchainBadge } from '../../components/UI'

export default function FarmerDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [data,    setData]    = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get(`/collector/farmer/${id}`)
      .then(r => setData(r.data))
      .catch(() => toast.error('Farmer लोड error'))
      .finally(() => setLoading(false))
  }, [id])

  const verifyLand = async (landId, status) => {
    try {
      await api.put(`/collector/verify-land/${landId}`, { status, remarks: status === 'verified' ? 'Collector द्वारे Verified' : 'नाकारले' })
      toast.success(`Land ${status}!`)
      const r = await api.get(`/collector/farmer/${id}`)
      setData(r.data)
    } catch(e) { toast.error('Error') }
  }

  if (loading) return <LoadingCenter />
  if (!data) return <div className="card" style={{padding:30,textAlign:'center'}}>Farmer नाही.</div>

  const { farmer, lands, crops } = data

  return (
    <div>
      <button className="btn btn-ghost btn-sm" style={{marginBottom:14}} onClick={() => navigate('/collector/dashboard')}>← मागे जा</button>

      {/* Farmer Card */}
      <div className="card" style={{background:'var(--green)',color:'#fff',marginBottom:16}}>
        <div style={{display:'flex',alignItems:'center',gap:14,flexWrap:'wrap'}}>
          <div style={{width:60,height:60,borderRadius:'50%',background:'rgba(255,255,255,.2)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:26,fontWeight:900,flexShrink:0}}>{farmer.name?.[0]||'?'}</div>
          <div style={{flex:1}}>
            <div style={{fontSize:20,fontWeight:900}}>{farmer.name}</div>
            <div style={{opacity:.85,fontSize:14}}>📱 {farmer.mobile} &nbsp;|&nbsp; 🆔 {farmer.krushiId}</div>
            <div style={{opacity:.85,fontSize:14}}>📍 {farmer.village}{farmer.district?`, ${farmer.district}`:''}</div>
          </div>
          <div style={{textAlign:'right'}}>
            <div style={{background:'rgba(255,255,255,.2)',padding:'4px 12px',borderRadius:20,fontSize:12,marginBottom:4}}>{farmer.isVerified?'✅ Verified':'⏳ Pending'}</div>
            <div style={{fontSize:12,opacity:.8}}>📅 {new Date(farmer.createdAt).toLocaleDateString('mr-IN')}</div>
          </div>
        </div>
        <div style={{display:'flex',gap:10,marginTop:12,flexWrap:'wrap'}}>
          {[['🌍 जमिनी',farmer.totalLands||0],['🌾 पिके',farmer.totalCrops||0],['🏦 Bank',farmer.bankAccount||'जोडलेले नाही'],['IFSC',farmer.ifscCode||'—']].map(([l,v])=>(
            <div key={l} style={{background:'rgba(255,255,255,.15)',padding:'6px 12px',borderRadius:8}}>
              <div style={{fontSize:10,opacity:.8}}>{l}</div>
              <div style={{fontWeight:700,fontSize:13}}>{String(v)}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Lands */}
      <div className="card">
        <div className="card-title">🗺️ जमिनी ({lands.length})</div>
        {lands.length === 0
          ? <div style={{color:'var(--text3)',textAlign:'center',padding:16}}>कोणतीही जमीन नाही</div>
          : lands.map(l => (
            <div key={l._id} style={{padding:'12px 0',borderBottom:'1px solid var(--border)'}}>
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:8}}>
                <div>
                  <div style={{fontWeight:700}}>Survey: {l.surveyNumber} &nbsp;|&nbsp; {l.areaAcres} एकर &nbsp;|&nbsp; {l.cropType}</div>
                  <div style={{fontSize:12,color:'var(--text3)'}}>📍 {l.village}{l.district?`, ${l.district}`:''}</div>
                  {l.utara712 && <div style={{fontSize:12,color:'var(--text3)'}}>७/१२: {l.utara712}</div>}
                  {l.latitude && <div style={{fontSize:12,color:'var(--green)'}}>📍 GPS: {l.latitude}°N, {l.longitude}°E</div>}
                  <BlockchainBadge txHash={l.txHash} />
                </div>
                <StatusBadge status={l.status} />
              </div>
              {l.status === 'pending' && (
                <div style={{display:'flex',gap:6}}>
                  <button className="btn btn-primary btn-sm" onClick={()=>verifyLand(l._id,'verified')}>✅ Verify करा</button>
                  <button className="btn btn-danger btn-sm" onClick={()=>verifyLand(l._id,'rejected')}>❌ Reject</button>
                </div>
              )}
            </div>
          ))
        }
      </div>

      {/* Crops */}
      <div className="card">
        <div className="card-title">🌾 पिके ({crops.length})</div>
        {crops.length === 0
          ? <div style={{color:'var(--text3)',textAlign:'center',padding:16}}>कोणतेही पीक नाही</div>
          : crops.map(c => (
            <div key={c._id} style={{padding:'10px 0',borderBottom:'1px solid var(--border)',display:'flex',justifyContent:'space-between',alignItems:'flex-start'}}>
              <div>
                <div style={{fontWeight:700}}>{c.cropType}{c.variety?` (${c.variety})`:''}</div>
                <div style={{fontSize:12,color:'var(--text3)'}}>📅 पेरणी: {new Date(c.sowingDate).toLocaleDateString('mr-IN')} &nbsp;|&nbsp; {c.areaAcres} एकर</div>
                {c.nftTokenId && <div style={{fontSize:11,color:'var(--purple)',fontFamily:'monospace'}}>NFT: {c.nftTokenId}</div>}
              </div>
              <StatusBadge status={c.status} />
            </div>
          ))
        }
      </div>
    </div>
  )
}
