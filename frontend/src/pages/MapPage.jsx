// src/pages/MapPage.jsx
import React, { useState, useEffect } from 'react'
import { MapContainer, TileLayer, Marker, Popup, Circle, LayersControl } from 'react-leaflet'
import L from 'leaflet'
import toast from 'react-hot-toast'
import api from '../config/api'
import { useAuth } from '../context/AuthContext'

const farmIcon = L.divIcon({ html:'<div style="background:var(--green,#2d7a35);width:32px;height:32px;border-radius:50% 50% 50% 0;transform:rotate(-45deg);border:3px solid #fff;box-shadow:0 2px 6px rgba(0,0,0,.3);display:flex;align-items:center;justify-content:center"><span style="transform:rotate(45deg);font-size:14px">🌾</span></div>', iconSize:[32,32], iconAnchor:[16,32], className:'' })

export default function MapPage() {
  const { user, updateUser } = useAuth()
  const [pos,     setPos]     = useState(null)
  const [acc,     setAcc]     = useState(null)
  const [addr,    setAddr]    = useState('')
  const [loading, setLoading] = useState(false)
  const [saving,  setSaving]  = useState(false)

  const getGPS = () => {
    if (!navigator.geolocation) { toast.error('GPS support नाही'); return }
    setLoading(true)
    navigator.geolocation.getCurrentPosition(
      pos => {
        const { latitude: lat, longitude: lng, accuracy } = pos.coords
        setPos([lat, lng]); setAcc(accuracy)
        setAddr(`${lat.toFixed(5)}°N, ${lng.toFixed(5)}°E`)
        toast.success('GPS मिळाले!')
        setLoading(false)
      },
      () => { toast.error('GPS permission द्या'); setLoading(false) },
      { enableHighAccuracy: true, timeout: 15000 }
    )
  }

  useEffect(() => { if (user?.lastLat && user?.lastLng) setPos([user.lastLat, user.lastLng]) }, [])

  const saveGPS = async () => {
    if (!pos) return
    setSaving(true)
    try {
      const r = await api.put('/users/profile', { lastLat: pos[0], lastLng: pos[1], lastLocation: addr })
      updateUser(r.data.user)
      toast.success('GPS save झाले!')
    } catch(e) { toast.error('Save error') }
    setSaving(false)
  }

  return (
    <div>
      <div className="card" style={{marginBottom:14}}>
        <div style={{display:'flex',gap:10,flexWrap:'wrap'}}>
          <button className="btn btn-primary" onClick={getGPS} disabled={loading}>{loading?'⏳ GPS शोधत आहे...':'📍 GPS घ्या'}</button>
          <button className="btn btn-outline" onClick={saveGPS} disabled={saving||!pos}>{saving?'⏳...':'💾 GPS Save करा'}</button>
        </div>
        {pos && (
          <div style={{marginTop:12,display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:10}}>
            <div className="card-sm"><div style={{fontSize:11,color:'var(--text3)'}}>Latitude</div><div style={{fontWeight:800,fontFamily:'monospace'}}>{pos[0].toFixed(6)}°N</div></div>
            <div className="card-sm"><div style={{fontSize:11,color:'var(--text3)'}}>Longitude</div><div style={{fontWeight:800,fontFamily:'monospace'}}>{pos[1].toFixed(6)}°E</div></div>
            <div className="card-sm"><div style={{fontSize:11,color:'var(--text3)'}}>Accuracy</div><div style={{fontWeight:800,color:acc<15?'var(--green)':'var(--orange)'}}>±{acc?.toFixed(0)||'?'}m</div></div>
          </div>
        )}
      </div>

      <div className="map-container" style={{marginBottom:14, borderRadius: 'var(--radius)', overflow: 'hidden', boxShadow: '0 4px 15px rgba(0,0,0,0.1)'}}>
        {pos ? (
          <MapContainer center={pos} zoom={18} style={{height:'100%',width:'100%'}} key={pos.join(',')}>
            <LayersControl position="topright">
              <LayersControl.BaseLayer checked name="उपग्रह (Satellite)">
                <TileLayer url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}" attribution="Tiles &copy; Esri" maxZoom={19} />
              </LayersControl.BaseLayer>
              <LayersControl.BaseLayer name="नकाशा (Street)">
                <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution="OpenStreetMap" maxZoom={19} />
              </LayersControl.BaseLayer>
            </LayersControl>
            <Marker position={pos} icon={farmIcon}>
              <Popup><strong>{user?.name}</strong><br />{user?.village}<br />{pos[0].toFixed(5)}°N, {pos[1].toFixed(5)}°E</Popup>
            </Marker>
            {acc && <Circle center={pos} radius={acc} color="var(--green)" fillOpacity={0.1} />}
          </MapContainer>
        ) : (
          <div style={{height:'100%',display:'flex',alignItems:'center',justifyContent:'center',background:'var(--gray1)',borderRadius:'var(--radius)',flexDirection:'column',gap:12}}>
            <span style={{fontSize:48}}>📍</span>
            <div style={{color:'var(--text3)'}}>GPS घेण्यासाठी वरील बटण दाबा</div>
          </div>
        )}
      </div>
    </div>
  )
}
