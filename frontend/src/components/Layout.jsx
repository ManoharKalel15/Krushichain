import React, { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import toast from 'react-hot-toast'

const FARMER_NAV = [
  { id: 'dashboard',  icon: '🏠', label: 'मुख्य पटल',     path: '/app/dashboard' },
  { id: 'lands',      icon: '🗺️', label: 'जमीन नोंदणी',   path: '/app/lands'     },
  { id: 'crops',      icon: '🌾', label: 'पीक व्यवस्थापन', path: '/app/crops'     },
  { id: 'iot',        icon: '📡', label: 'IoT सेन्सर',     path: '/app/iot'       },
  { id: 'krushiai',   icon: '🧠', label: 'कृषी-AI मार्गदर्शक', path: '/app/ai-predictor'},
  { id: 'supplychain',icon: '🚚', label: 'पुरवठा साखळी',   path: '/app/supply-chain'},
  { id: 'market',     icon: '📦', label: 'बाजारपेठ',       path: '/app/market'    },
  { id: 'insurance',  icon: '🛡️', label: 'विमा दावे',      path: '/app/insurance' },
  { id: 'community',  icon: '💬', label: 'समुदाय चॅट',     path: '/app/community' },
  { id: 'map',        icon: '📍', label: 'GPS नकाशा',      path: '/app/map'       },
  { id: 'qr',         icon: '📱', label: 'QR Code',         path: '/app/qr'        },
  { id: 'analytics',  icon: '📊', label: 'Analytics',       path: '/app/analytics' },
  { id: 'profile',    icon: '👤', label: 'Profile',          path: '/app/profile'   },
]

const COLLECTOR_NAV = [
  { id: 'cdashboard', icon: '📊', label: 'Dashboard',         path: '/collector/dashboard' },
  { id: 'cfarmers',   icon: '🧑‍🌾', label: 'शेतकरी List',       path: '/collector/farmers'   },
  { id: 'cclaims',    icon: '🛡️', label: 'विमा दावे',          path: '/collector/claims'    },
  { id: 'csubsidies', icon: '💰', label: 'अनुदान अर्ज',        path: '/collector/subsidies' },
  { id: 'canalytics', icon: '📈', label: 'District Analytics', path: '/collector/analytics' },
  { id: 'community',  icon: '💬', label: 'समुदाय चॅट',         path: '/app/community'       },
]

export default function Layout({ children }) {
  const { user, logout } = useAuth()
  const navigate  = useNavigate()
  const location  = useLocation()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const isCollector = ['collector','minister'].includes(user?.role)
  const nav = isCollector ? COLLECTOR_NAV : FARMER_NAV

  const handleLogout = () => {
    logout()
    toast.success('लॉगआउट यशस्वी!')
    navigate('/')
  }

  const currentId = nav.find(n => location.pathname.startsWith(n.path))?.id

  return (
    <div className="app-layout">
      {/* Overlay for mobile */}
      {sidebarOpen && <div style={{ position:'fixed',inset:0,background:'rgba(0,0,0,.4)',zIndex:99 }} onClick={() => setSidebarOpen(false)} />}

      {/* Sidebar */}
      <aside className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-logo">
          <span className="logo-icon">🌾</span>
          <div>
            <div className="logo-text">KrushiChain</div>
            <div className="logo-sub">Maharashtra Pilot</div>
          </div>
        </div>

        <nav className="sidebar-nav">
          {isCollector && <div className="nav-section-title">Officer Panel</div>}
          {nav.map(item => (
            <div
              key={item.id}
              className={`nav-item ${currentId === item.id ? 'active' : ''}`}
              onClick={() => { navigate(item.path); setSidebarOpen(false) }}
            >
              <span className="nav-icon">{item.icon}</span>
              {item.label}
            </div>
          ))}
        </nav>

        <div style={{ padding: '14px 16px', borderTop: '1px solid var(--border)' }}>
          <div style={{ fontSize: 12, color: 'var(--text3)', marginBottom: 8 }}>
            🆔 {user?.krushiId || '—'}<br />
            📍 {user?.village}{user?.district ? `, ${user?.district}` : ''}
          </div>
          <button className="btn btn-ghost btn-sm btn-full" onClick={handleLogout}>🚪 Logout</button>
        </div>
      </aside>

      {/* Main */}
      <div className="main-content">
        {/* Topbar */}
        <header className="topbar">
          <div className="flex-gap-8">
            <button className="btn btn-ghost btn-icon" style={{ display:'none' }} id="sidebar-toggle" onClick={() => setSidebarOpen(!sidebarOpen)}>☰</button>
            <div className="topbar-title">
              {nav.find(n => location.pathname.startsWith(n.path))?.label || 'KrushiChain'}
            </div>
          </div>
          <div className="topbar-right">
            <div style={{ fontSize: 12, color: 'var(--text3)', textAlign: 'right' }}>
              <div style={{ fontWeight: 700, color: 'var(--text)', fontSize: 14 }}>{user?.name}</div>
              <div>{user?.role === 'shetkari' ? '🧑‍🌾 शेतकरी' : user?.role === 'collector' ? '👨‍💼 Collector' : '🏛️ Minister'}</div>
            </div>
            <div className="avatar avatar-lg">{user?.name?.[0] || '?'}</div>
          </div>
        </header>

        {/* Page */}
        <div className="page-body">{children}</div>
      </div>
    </div>
  )
}
