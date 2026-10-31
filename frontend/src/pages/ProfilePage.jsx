import React, { useState } from 'react';
import toast from 'react-hot-toast';
import api from '../config/api';
import { useAuth } from '../context/AuthContext';
import { useWallet } from '../context/WalletContext';
import { Alert } from '../components/UI';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Edit3, Save, X, MapPin, Phone, CreditCard, Building2, Calendar, ShieldCheck, Leaf, Map, LogOut, ChevronRight, Fingerprint, BadgeCheck, Wallet, ExternalLink, Copy, Check, Globe } from 'lucide-react';

const DISTRICTS = ['अहमदनगर','अकोला','अमरावती','औरंगाबाद','बीड','भंडारा','नागपूर','नांदेड','नाशिक','पुणे','सांगली','सातारा','सोलापूर','ठाणे','यवतमाळ'];

export default function ProfilePage() {
  const { user, logout, updateUser } = useAuth();
  const [edit,    setEdit]    = useState(false);
  const [saving,  setSaving]  = useState(false);
  const [name,    setName]    = useState(user?.name || '');
  const [village, setVillage] = useState(user?.village || '');
  const [district,setDistrict]= useState(user?.district || '');
  const [bank,    setBank]    = useState(user?.bankAccount || '');
  const [ifsc,    setIfsc]    = useState(user?.ifscCode || '');
  const [bankName,setBankName]= useState(user?.bankName || '');

  const save = async () => {
    setSaving(true);
    try {
      const r = await api.put('/users/profile', { name, village, district, bankAccount: bank, ifscCode: ifsc, bankName });
      updateUser(r.data.user);
      setEdit(false);
      toast.success('✅ Profile update झाले!');
    } catch (e) { toast.error(e.response?.data?.error || 'Error'); }
    setSaving(false);
  };

  const roleMap = { 'shetkari': '🧑‍🌾 शेतकरी', 'collector': '👨‍💼 Collector', 'minister': '🏛️ Minister' };

  const profileFields = [
    { icon: <Phone size={16} />, label: 'मोबाइल', value: user?.mobile, color: '#3b82f6' },
    { icon: <Fingerprint size={16} />, label: 'KrushiID', value: user?.krushiId, color: '#8b5cf6', mono: true },
    { icon: <User size={16} />, label: 'भूमिका', value: roleMap[user?.role] || user?.role, color: '#10b981' },
    { icon: <Calendar size={16} />, label: 'नोंदणी तारीख', value: user?.createdAt ? new Date(user.createdAt).toLocaleDateString('mr-IN') : '—', color: '#f59e0b' },
    { icon: <CreditCard size={16} />, label: 'बँक खाते', value: user?.bankAccount || 'जोडलेले नाही', color: '#ef4444' },
    { icon: <Building2 size={16} />, label: 'IFSC कोड', value: user?.ifscCode || '—', color: '#64748b', mono: true },
    { icon: <Building2 size={16} />, label: 'बँकेचे नाव', value: user?.bankName || '—', color: '#14b8a6' }
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      style={{ maxWidth: 680, margin: '0 auto' }}
    >
      {/* 3D Profile Header Card */}
      <motion.div
        initial={{ y: -30, opacity: 0, scale: 0.95 }}
        animate={{ y: 0, opacity: 1, scale: 1 }}
        transition={{ type: 'spring', stiffness: 300, damping: 25 }}
        style={{
          background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #334155 100%)',
          borderRadius: '24px',
          padding: '0',
          marginBottom: '28px',
          boxShadow: '0 25px 50px -12px rgba(15, 23, 42, 0.5)',
          position: 'relative',
          overflow: 'hidden',
          color: '#fff'
        }}
      >
        {/* Abstract BG effects */}
        <div style={{ position: 'absolute', inset: 0, backgroundImage: 'radial-gradient(rgba(16,185,129,0.1) 1px, transparent 1px)', backgroundSize: '24px 24px', zIndex: 0 }} />
        <motion.div animate={{ rotate: 360 }} transition={{ duration: 80, repeat: Infinity, ease: 'linear' }} style={{ position: 'absolute', top: '-60%', right: '-20%', width: '400px', height: '400px', background: 'rgba(16,185,129,0.06)', borderRadius: '50%', zIndex: 0 }} />
        <motion.div animate={{ rotate: -360 }} transition={{ duration: 60, repeat: Infinity, ease: 'linear' }} style={{ position: 'absolute', bottom: '-50%', left: '-15%', width: '300px', height: '300px', background: 'rgba(59,130,246,0.06)', borderRadius: '50%', zIndex: 0 }} />

        <div style={{ position: 'relative', zIndex: 2, padding: '36px 32px 28px', textAlign: 'center' }}>
          {/* Avatar */}
          <motion.div
            whileHover={{ scale: 1.1, rotateY: 10 }}
            style={{
              width: 90, height: 90,
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #10b981, #059669)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 36, fontWeight: 900,
              margin: '0 auto 16px',
              boxShadow: '0 10px 30px rgba(16, 185, 129, 0.4)',
              border: '4px solid rgba(255,255,255,0.2)',
              cursor: 'pointer'
            }}
          >
            {user?.name?.[0] || '?'}
          </motion.div>

          <motion.h1
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            style={{ fontSize: '26px', fontWeight: 900, marginBottom: '4px' }}
          >
            {user?.name}
          </motion.h1>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            style={{ fontSize: '15px', opacity: 0.8, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
          >
            <MapPin size={16} /> {user?.village}{user?.district ? `, ${user?.district}` : ''}
          </motion.div>

          {/* Badges */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            style={{ display: 'flex', gap: '10px', justifyContent: 'center', marginTop: '18px', flexWrap: 'wrap' }}
          >
            {[
              { icon: <Fingerprint size={13} />, text: user?.krushiId, bg: 'rgba(139,92,246,0.2)', border: 'rgba(139,92,246,0.4)' },
              { icon: user?.isVerified ? <BadgeCheck size={13} /> : <ShieldCheck size={13} />, text: user?.isVerified ? 'Verified ✅' : '⏳ Pending', bg: user?.isVerified ? 'rgba(16,185,129,0.2)' : 'rgba(245,158,11,0.2)', border: user?.isVerified ? 'rgba(16,185,129,0.4)' : 'rgba(245,158,11,0.4)' },
              { icon: <Map size={13} />, text: `${user?.totalLands || 0} जमिनी`, bg: 'rgba(59,130,246,0.2)', border: 'rgba(59,130,246,0.4)' },
              { icon: <Leaf size={13} />, text: `${user?.totalCrops || 0} पिके`, bg: 'rgba(16,185,129,0.2)', border: 'rgba(16,185,129,0.4)' }
            ].map((b, i) => (
              <motion.span
                key={i}
                whileHover={{ scale: 1.1 }}
                style={{
                  background: b.bg,
                  border: `1px solid ${b.border}`,
                  padding: '5px 14px',
                  borderRadius: '20px',
                  fontSize: '12px',
                  fontWeight: 700,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  cursor: 'pointer',
                  backdropFilter: 'blur(10px)'
                }}
              >
                {b.icon} {b.text}
              </motion.span>
            ))}
          </motion.div>
        </div>
      </motion.div>

      {/* Bank Warning */}
      {!user?.bankAccount && (
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          style={{
            background: 'linear-gradient(90deg, #fff7ed, #fffbeb)',
            border: '1.5px solid #fed7aa',
            borderLeft: '5px solid #f59e0b',
            borderRadius: '16px',
            padding: '16px 20px',
            marginBottom: '24px',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            boxShadow: '0 4px 15px rgba(245, 158, 11, 0.1)'
          }}
        >
          <div style={{ background: '#fef3c7', padding: '10px', borderRadius: '12px' }}>
            <CreditCard size={22} color="#d97706" />
          </div>
          <div>
            <div style={{ fontWeight: 800, fontSize: '14px', color: '#92400e' }}>बँक खाते जोडलेले नाही!</div>
            <div style={{ fontSize: '12px', color: '#a16207' }}>अनुदान थेट बँक खात्यात मिळवण्यासाठी profile edit करून खाते क्रमांक जोडा.</div>
          </div>
        </motion.div>
      )}

      {/* Web3 & MST Chain Wallet Card */}
      <Web3WalletCard />

      {/* Profile Details Card */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
        whileHover={{ y: -3, boxShadow: '0 20px 40px rgba(0,0,0,0.1)' }}
        style={{
          background: '#fff',
          borderRadius: '20px',
          padding: '28px',
          boxShadow: '0 4px 15px rgba(0,0,0,0.05)',
          border: '1px solid var(--border)',
          marginBottom: '20px'
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ background: 'linear-gradient(135deg, #3b82f622, #3b82f611)', padding: '10px', borderRadius: '12px', color: '#3b82f6' }}>
              <User size={22} />
            </div>
            <div>
              <div style={{ fontWeight: 800, fontSize: '17px' }}>वैयक्तिक माहिती</div>
              <div style={{ fontSize: '12px', color: 'var(--text3)' }}>Personal Information</div>
            </div>
          </div>
          {!edit && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="btn"
              onClick={() => setEdit(true)}
              style={{
                borderRadius: '30px',
                background: '#fff',
                border: '2px solid var(--green)',
                color: 'var(--green)',
                padding: '8px 20px',
                fontWeight: 700,
                display: 'flex', alignItems: 'center', gap: '6px'
              }}
            >
              <Edit3 size={16} /> Edit Profile
            </motion.button>
          )}
        </div>

        <AnimatePresence mode="wait">
          {edit ? (
            <motion.div
              key="edit-form"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
            >
              <div style={{ background: '#f8fafc', borderRadius: '16px', padding: '20px', border: '1px solid #e2e8f0' }}>
                <div className="grid-2">
                  <div className="form-group">
                    <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><User size={14} /> नाव</label>
                    <input className="form-control" value={name} onChange={e => setName(e.target.value)} style={{ borderRadius: '12px' }} />
                  </div>
                  <div className="form-group">
                    <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><MapPin size={14} /> गाव</label>
                    <input className="form-control" value={village} onChange={e => setVillage(e.target.value)} style={{ borderRadius: '12px' }} />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Map size={14} /> जिल्हा</label>
                  <select className="form-control" value={district} onChange={e => setDistrict(e.target.value)} style={{ borderRadius: '12px' }}>
                    <option value="">-- निवडा --</option>
                    {DISTRICTS.map(d => <option key={d}>{d}</option>)}
                  </select>
                </div>

                <div style={{ borderTop: '1px dashed #e2e8f0', paddingTop: '16px', marginTop: '8px', marginBottom: '8px' }}>
                  <div style={{ fontSize: '13px', fontWeight: 800, color: 'var(--text2)', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Building2 size={14} /> बँक माहिती
                  </div>
                </div>

                <div className="grid-2">
                  <div className="form-group">
                    <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><CreditCard size={14} /> बँक खाते क्रमांक</label>
                    <input className="form-control" value={bank} onChange={e => setBank(e.target.value)} style={{ borderRadius: '12px' }} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">IFSC कोड</label>
                    <input className="form-control" value={ifsc} onChange={e => setIfsc(e.target.value.toUpperCase())} style={{ borderRadius: '12px', fontFamily: 'monospace' }} />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Building2 size={14} /> बँकेचे नाव</label>
                  <input className="form-control" value={bankName} onChange={e => setBankName(e.target.value)} style={{ borderRadius: '12px' }} />
                </div>

                <div style={{ display: 'flex', gap: 12, marginTop: 24, justifyContent: 'flex-end' }}>
                  <button className="btn btn-ghost" onClick={() => setEdit(false)} style={{ borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <X size={16} /> रद्द करा
                  </button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="btn btn-primary"
                    onClick={save}
                    disabled={saving}
                    style={{ borderRadius: '12px', padding: '0 28px', display: 'flex', alignItems: 'center', gap: '8px', minWidth: '160px', justifyContent: 'center' }}
                  >
                    {saving ? (
                      <><div className="spinner" style={{ width: 16, height: 16, borderWidth: 2 }} /> Saving...</>
                    ) : (
                      <><Save size={16} /> Save Profile</>
                    )}
                  </motion.button>
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="view-fields"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              {profileFields.map((f, i) => (
                <motion.div
                  key={f.label}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.06 }}
                  whileHover={{ x: 4, background: '#f8fafc' }}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '14px 12px',
                    borderRadius: '12px',
                    cursor: 'default',
                    transition: 'background 0.2s',
                    borderBottom: i < profileFields.length - 1 ? '1px solid #f1f5f9' : 'none'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{
                      background: `${f.color}15`,
                      border: `1.5px solid ${f.color}30`,
                      color: f.color,
                      width: 36, height: 36,
                      borderRadius: '10px',
                      display: 'flex', alignItems: 'center', justifyContent: 'center'
                    }}>
                      {f.icon}
                    </div>
                    <span style={{ color: 'var(--text3)', fontSize: '13.5px', fontWeight: 600 }}>{f.label}</span>
                  </div>
                  <span style={{
                    fontWeight: 700,
                    fontSize: '14px',
                    color: f.value === 'जोडलेले नाही' || f.value === '—' ? 'var(--text3)' : 'var(--text)',
                    fontFamily: f.mono ? 'monospace' : 'inherit',
                    background: f.mono ? 'var(--gray1)' : 'transparent',
                    padding: f.mono ? '4px 10px' : '0',
                    borderRadius: f.mono ? '8px' : '0'
                  }}>
                    {f.value || '—'}
                  </span>
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Logout Button */}
      <motion.button
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        whileHover={{ scale: 1.02, boxShadow: '0 10px 25px rgba(239, 68, 68, 0.2)' }}
        whileTap={{ scale: 0.98 }}
        className="btn btn-full"
        onClick={() => { if (confirm('Logout करायचे का?')) { logout(); window.location.href = '/'; } }}
        style={{
          borderRadius: '16px',
          background: 'linear-gradient(135deg, #fef2f2, #fff1f2)',
          border: '2px solid #fecaca',
          color: '#dc2626',
          fontWeight: 800,
          fontSize: '15px',
          padding: '16px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '10px',
          marginBottom: '28px'
        }}
      >
        <LogOut size={20} /> Logout करा
      </motion.button>
    </motion.div>
  );
}

function Web3WalletCard() {
  const {
    walletAddress,
    isConnected,
    isConnecting,
    network,
    networkKey,
    balance,
    connect,
    disconnect,
    switchNet,
    getAddressExplorerUrl
  } = useWallet();

  const [copied, setCopied] = useState(false);

  return (
    <motion.div
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay: 0.15 }}
      style={{
        background: '#fff',
        borderRadius: '20px',
        padding: '24px',
        boxShadow: '0 4px 15px rgba(0,0,0,0.05)',
        border: '1px solid var(--border)',
        marginBottom: '20px'
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ background: '#fef3c7', padding: '10px', borderRadius: '12px', fontSize: '20px' }}>
            🦊
          </div>
          <div>
            <div style={{ fontWeight: 800, fontSize: '16px', color: '#0f172a' }}>MST Chain Web3 वॉलेट</div>
            <div style={{ fontSize: '12px', color: 'var(--text3)' }}>Decentralized Identity & Smart Contract Signature</div>
          </div>
        </div>

        {isConnected && (
          <span
            style={{
              fontSize: '11px',
              fontWeight: 800,
              padding: '4px 10px',
              borderRadius: '20px',
              background: networkKey === 'mstMainnet' ? '#ecfdf5' : '#fffbeb',
              color: networkKey === 'mstMainnet' ? '#047857' : '#b45309',
              border: `1px solid ${networkKey === 'mstMainnet' ? '#a7f3d0' : '#fde68a'}`
            }}
          >
            {networkKey === 'mstMainnet' ? '🟢 MST Mainnet' : '🟡 MST Testnet'}
          </span>
        )}
      </div>

      {isConnected ? (
        <div>
          <div style={{ background: '#f8fafc', padding: '14px', borderRadius: '14px', border: '1px solid #e2e8f0', marginBottom: '14px' }}>
            <div style={{ fontSize: '11px', color: '#64748b', fontWeight: 600, marginBottom: '4px' }}>
              जोडलेले वॉलेट (Connected Address):
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontFamily: 'monospace', fontWeight: 700, fontSize: '13px', color: '#0f172a' }}>
                {walletAddress}
              </span>
              <div style={{ display: 'flex', gap: '6px' }}>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(walletAddress);
                    setCopied(true);
                    setTimeout(() => setCopied(false), 2000);
                  }}
                  style={{
                    border: 'none',
                    background: copied ? '#10b98122' : '#e2e8f0',
                    color: copied ? '#10b981' : '#475569',
                    padding: '5px 10px',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontSize: '11px',
                    fontWeight: 700,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}
                >
                  {copied ? <Check size={12} /> : <Copy size={12} />}
                  {copied ? 'Copied' : 'Copy'}
                </button>
                <a
                  href={getAddressExplorerUrl(walletAddress)}
                  target="_blank"
                  rel="noreferrer"
                  style={{
                    background: '#e2e8f0',
                    color: '#475569',
                    padding: '5px 10px',
                    borderRadius: '8px',
                    textDecoration: 'none',
                    fontSize: '11px',
                    fontWeight: 700,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}
                >
                  <ExternalLink size={12} /> Explorer
                </a>
              </div>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
            <div style={{ background: '#ecfdf5', padding: '12px', borderRadius: '14px', border: '1px solid #a7f3d0' }}>
              <div style={{ fontSize: '11px', color: '#047857', fontWeight: 600 }}>MSTC टोकन बॅलन्स:</div>
              <div style={{ fontSize: '18px', fontWeight: 900, color: '#065f46' }}>
                {balance} {network.nativeCurrency.symbol}
              </div>
            </div>

            <div style={{ background: '#f1f5f9', padding: '12px', borderRadius: '14px', border: '1px solid #e2e8f0' }}>
              <div style={{ fontSize: '11px', color: '#475569', fontWeight: 600 }}>नेटवर्क स्विच:</div>
              <div style={{ display: 'flex', gap: '6px', marginTop: '4px' }}>
                <button
                  onClick={() => switchNet('mstMainnet')}
                  style={{
                    flex: 1,
                    fontSize: '11px',
                    fontWeight: 800,
                    padding: '4px 6px',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    background: networkKey === 'mstMainnet' ? '#10b981' : '#fff',
                    color: networkKey === 'mstMainnet' ? '#fff' : '#475569',
                    cursor: 'pointer'
                  }}
                >
                  Mainnet
                </button>
                <button
                  onClick={() => switchNet('mstTestnet')}
                  style={{
                    flex: 1,
                    fontSize: '11px',
                    fontWeight: 800,
                    padding: '4px 6px',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    background: networkKey === 'mstTestnet' ? '#f59e0b' : '#fff',
                    color: networkKey === 'mstTestnet' ? '#fff' : '#475569',
                    cursor: 'pointer'
                  }}
                >
                  Testnet
                </button>
              </div>
            </div>
          </div>

          <button
            onClick={disconnect}
            style={{
              width: '100%',
              background: '#fef2f2',
              border: '1px solid #fecaca',
              color: '#dc2626',
              padding: '10px',
              borderRadius: '12px',
              fontWeight: 700,
              fontSize: '13px',
              cursor: 'pointer'
            }}
          >
            🔌 वॉलेट डिस्कनेक्ट करा
          </button>
        </div>
      ) : (
        <div style={{ textAlign: 'center', padding: '16px 0' }}>
          <p style={{ fontSize: '13px', color: '#64748b', marginBottom: '16px' }}>
            तुमचे MetaMask वॉलेट कनेक्ट करून जमिनीची नोंदणी ब्लॉकचेनवर स्वाक्षरी करा.
          </p>
          <button
            onClick={() => connect()}
            disabled={isConnecting}
            style={{
              background: 'linear-gradient(135deg, #10b981, #059669)',
              color: '#fff',
              border: 'none',
              padding: '12px 24px',
              borderRadius: '14px',
              fontWeight: 800,
              fontSize: '14px',
              cursor: isConnecting ? 'wait' : 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              boxShadow: '0 4px 15px rgba(16, 185, 129, 0.3)'
            }}
          >
            <span>🦊</span>
            {isConnecting ? 'कनेक्ट करत आहे...' : 'MetaMask वॉलेट जोडा'}
          </button>
        </div>
      )}
    </motion.div>
  );
}
