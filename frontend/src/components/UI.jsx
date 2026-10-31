import React from 'react'

export function Spinner({ size = '' }) {
  return <div className={`spinner ${size === 'lg' ? 'spinner-lg' : ''}`} />
}

export function LoadingCenter({ text = 'लोड होत आहे...' }) {
  return (
    <div className="loading-center">
      <div className="spinner spinner-lg" />
      <span>{text}</span>
    </div>
  )
}

export function EmptyState({ icon = '📭', title, subtitle, action, onAction }) {
  return (
    <div className="empty-state">
      <div className="empty-icon">{icon}</div>
      <div className="empty-title">{title}</div>
      {subtitle && <div className="empty-sub mt-4">{subtitle}</div>}
      {onAction && <button className="btn btn-primary mt-12" onClick={onAction}>{action}</button>}
    </div>
  )
}

export function StatusBadge({ status }) {
  const labels = {
    submitted: 'सादर', under_review: 'विचाराधीन', approved: 'मंजूर',
    rejected: 'नाकारले', paid: '✅ पैसे मिळाले', pending: 'प्रलंबित',
    verified: '✅ Verified', active: 'सक्रिय', growing: '🌱 वाढत आहे',
    harvested: 'काढले', sold: 'विकले', cancelled: 'रद्द',
  }
  return (
    <span className={`badge status-${status}`}>
      {labels[status] || status}
    </span>
  )
}

export function Modal({ open, onClose, title, children, footer }) {
  if (!open) return null
  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="flex-between mb-12">
          <div className="modal-title">{title}</div>
          <button className="btn btn-ghost btn-icon" onClick={onClose}>✕</button>
        </div>
        {children}
        {footer && <div className="modal-footer">{footer}</div>}
      </div>
    </div>
  )
}

export function StatCard({ icon, value, label, color = 'var(--green)', onClick }) {
  return (
    <div className="stat-card" style={{ borderTopColor: color }} onClick={onClick}>
      <div className="stat-icon">{icon}</div>
      <div className="stat-value" style={{ color }}>{value}</div>
      <div className="stat-label">{label}</div>
    </div>
  )
}

export function Alert({ type = 'green', children }) {
  return <div className={`alert alert-${type}`}>{children}</div>
}

export function LiveDot() {
  return <span className="live-dot" />
}

export function BlockchainBadge({ txHash }) {
  if (!txHash) return null
  const isRealTx = txHash.startsWith('0x') && txHash.length >= 64
  const explorerBase = import.meta.env.VITE_MST_TESTNET_EXPLORER || 'https://testnet.mstscan.com'
  const url = isRealTx ? `${explorerBase}/tx/${txHash}` : null

  return (
    <div className="tx-wrap mt-8" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
      <span>⛓️ MST Chain:</span>
      {url ? (
        <a
          href={url}
          target="_blank"
          rel="noreferrer"
          style={{
            color: '#10b981',
            fontWeight: 700,
            fontFamily: 'monospace',
            textDecoration: 'none',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '3px'
          }}
          title="MSTScan वर पहा"
        >
          {txHash.slice(0, 10)}...{txHash.slice(-8)} ↗
        </a>
      ) : (
        <span style={{ fontFamily: 'monospace' }}>
          {txHash.slice(0, 14)}...
        </span>
      )}
    </div>
  )
}

export function SectionTitle({ children, action, onAction }) {
  return (
    <div className="flex-between mb-12">
      <div className="section-title">{children}</div>
      {onAction && (
        <button className="btn btn-outline btn-sm" onClick={onAction}>{action}</button>
      )}
    </div>
  )
}

export function Tabs({ tabs, active, onChange }) {
  return (
    <div className="tabs">
      {tabs.map(t => (
        <button key={t.id} className={`tab-btn ${active === t.id ? 'active' : ''}`} onClick={() => onChange(t.id)}>
          {t.label}
        </button>
      ))}
    </div>
  )
}
