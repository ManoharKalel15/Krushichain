import React, { useState, useEffect, useRef } from 'react'
import { io } from 'socket.io-client'
import api from '../config/api'
import { useAuth } from '../context/AuthContext'
import { LoadingCenter } from '../components/UI'

export default function CommunityPage() {
  const { user } = useAuth()
  const [messages,  setMessages]  = useState([])
  const [input,     setInput]     = useState('')
  const [online,    setOnline]    = useState(0)
  const [loading,   setLoading]   = useState(true)
  const [connected, setConnected] = useState(false)
  const socketRef = useRef(null)
  const endRef    = useRef(null)
  const ROOM = 'general'

  useEffect(() => {
    api.get(`/chat/${ROOM}`).then(r => { setMessages(r.data.messages||[]); setLoading(false) }).catch(()=>setLoading(false))
    const socket = io('/', { path: '/socket.io', transports: ['websocket','polling'] })
    socketRef.current = socket
    socket.on('connect', () => { setConnected(true); socket.emit('join', { userId: user?._id, name: user?.name, village: user?.village, role: user?.role }); socket.emit('joinRoom', ROOM) })
    socket.on('disconnect', () => setConnected(false))
    socket.on('onlineCount', setOnline)
    socket.on('newMessage', msg => setMessages(prev => [...prev, msg]))
    return () => socket.disconnect()
  }, [])

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [messages])

  const send = async () => {
    if (!input.trim()) return
    const msg = input.trim(); setInput('')
    if (socketRef.current?.connected) {
      socketRef.current.emit('chatMessage', { userId: user?._id, name: user?.name, village: user?.village, role: user?.role, message: msg, roomId: ROOM })
    } else {
      try { const r = await api.post('/chat', { message: msg, roomId: ROOM }); setMessages(p => [...p, r.data.message]) } catch(e){}
    }
  }

  const ROLE_BADGE = { shetkari:'🧑‍🌾', collector:'👨‍💼', minister:'🏛️' }
  const isMine = msg => String(msg.userId) === String(user?._id) || msg.name === user?.name

  if (loading) return <LoadingCenter text="चॅट लोड होत आहे..." />

  return (
    <div style={{display:'flex',flexDirection:'column',height:'calc(100vh - 140px)',minHeight:500}}>
      {/* Header */}
      <div className="card" style={{marginBottom:0,borderRadius:'12px 12px 0 0',background:'var(--green)',color:'#fff',padding:'12px 18px'}}>
        <div style={{display:'flex',alignItems:'center',justifyContent:'space-between'}}>
          <div style={{fontWeight:800,fontSize:16}}>💬 समुदाय चॅट – General</div>
          <div style={{display:'flex',alignItems:'center',gap:8,fontSize:13}}>
            <span style={{width:8,height:8,borderRadius:'50%',background:connected?'#69f0ae':'#ef5350',display:'inline-block'}} />
            🟢 {online} Online
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="chat-messages" style={{flex:1,borderRadius:0}}>
        {messages.length === 0 && (
          <div style={{textAlign:'center',color:'var(--text3)',padding:30}}>
            <div style={{fontSize:40,marginBottom:8}}>💬</div>
            <div>पहिला संदेश पाठवा!</div>
          </div>
        )}
        {messages.map((m,i) => {
          const mine = isMine(m)
          return (
            <div key={m._id||i} className={`chat-bubble ${mine?'mine':'other'}`}>
              {!mine&&<div style={{fontSize:11,color:'var(--text3)',marginBottom:3,marginLeft:4}}>{ROLE_BADGE[m.role]||'👤'} <strong>{m.name}</strong> · {m.village}</div>}
              <div className={`bubble-text ${mine?'mine':'other'}`}>{m.message}</div>
              <div className="bubble-meta" style={{textAlign:mine?'right':'left'}}>
                {m.createdAt ? new Date(m.createdAt).toLocaleTimeString('mr-IN',{hour:'2-digit',minute:'2-digit'}) : ''}
              </div>
            </div>
          )
        })}
        <div ref={endRef} />
      </div>

      {/* Input */}
      <div style={{background:'var(--white)',borderRadius:'0 0 12px 12px',padding:'10px 14px',borderTop:'1px solid var(--border)'}}>
        <div className="chat-input-row">
          <input className="chat-input" value={input} onChange={e=>setInput(e.target.value)} onKeyDown={e=>e.key==='Enter'&&!e.shiftKey&&send()} placeholder="संदेश टाका... (Enter पाठवण्यासाठी)" maxLength={500} />
          <button className="btn btn-primary" onClick={send} disabled={!input.trim()}>📤 पाठवा</button>
        </div>
      </div>
    </div>
  )
}
