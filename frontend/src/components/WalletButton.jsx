import React, { useState, useRef, useEffect } from 'react';
import { useWallet } from '../context/WalletContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Wallet, ChevronDown, ExternalLink, Copy, Check, Power, Globe, Shield, RefreshCw } from 'lucide-react';

export default function WalletButton() {
  const {
    walletAddress,
    isConnected,
    isConnecting,
    network,
    networkKey,
    networks,
    balance,
    contractAddress,
    connect,
    disconnect,
    switchNet,
    refreshBalance,
    getAddressExplorerUrl
  } = useWallet();

  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleCopy = () => {
    if (!walletAddress) return;
    navigator.clipboard.writeText(walletAddress);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!isConnected) {
    return (
      <motion.button
        whileHover={{ scale: 1.04, boxShadow: '0 8px 20px rgba(16, 185, 129, 0.3)' }}
        whileTap={{ scale: 0.96 }}
        onClick={() => connect()}
        disabled={isConnecting}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
          color: '#fff',
          border: 'none',
          padding: '8px 16px',
          borderRadius: '30px',
          fontWeight: 700,
          fontSize: '13px',
          cursor: isConnecting ? 'wait' : 'pointer',
          boxShadow: '0 4px 12px rgba(16, 185, 129, 0.25)',
          transition: 'all 0.2s ease'
        }}
      >
        <span style={{ fontSize: '15px' }}>🦊</span>
        {isConnecting ? 'कनेक्ट करत आहे...' : 'Connect MST Wallet'}
      </motion.button>
    );
  }

  const shortAddr = `${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}`;

  return (
    <div style={{ position: 'relative' }} ref={dropdownRef}>
      {/* Connected Capsule */}
      <motion.div
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={() => setDropdownOpen(!dropdownOpen)}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          background: '#ffffff',
          border: '1.5px solid #e2e8f0',
          padding: '4px 6px 4px 10px',
          borderRadius: '30px',
          cursor: 'pointer',
          boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
          userSelect: 'none'
        }}
      >
        {/* Network indicator */}
        <span
          title={`Network: ${network.chainName}`}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '4px',
            fontSize: '11px',
            fontWeight: 800,
            background: networkKey === 'mstMainnet' ? '#ecfdf5' : '#fffbeb',
            color: networkKey === 'mstMainnet' ? '#059669' : '#b45309',
            padding: '3px 8px',
            borderRadius: '20px',
            border: `1px solid ${networkKey === 'mstMainnet' ? '#a7f3d0' : '#fde68a'}`
          }}
        >
          <span style={{ width: 6, height: 6, borderRadius: '50%', background: networkKey === 'mstMainnet' ? '#10b981' : '#f59e0b', display: 'inline-block' }} />
          {networkKey === 'mstMainnet' ? 'Mainnet' : 'Testnet'}
        </span>

        {/* Balance */}
        <span style={{ fontSize: '12px', fontWeight: 800, color: '#0f172a' }}>
          {balance} {network.nativeCurrency.symbol}
        </span>

        {/* Address Badge */}
        <span
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '5px',
            background: '#0f172a',
            color: '#fff',
            fontSize: '11.5px',
            fontWeight: 700,
            padding: '4px 10px',
            borderRadius: '20px',
            fontFamily: 'monospace'
          }}
        >
          {shortAddr}
          <ChevronDown size={12} />
        </span>
      </motion.div>

      {/* Dropdown Modal */}
      <AnimatePresence>
        {dropdownOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            style={{
              position: 'absolute',
              top: 'calc(100% + 8px)',
              right: 0,
              width: '320px',
              background: '#ffffff',
              borderRadius: '20px',
              boxShadow: '0 20px 40px rgba(15, 23, 42, 0.15), 0 0 0 1px rgba(0, 0, 0, 0.05)',
              padding: '18px',
              zIndex: 1000,
              color: '#1e293b'
            }}
          >
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '18px' }}>🦊</span>
                <span style={{ fontWeight: 800, fontSize: '14px', color: '#0f172a' }}>MetaMask Wallet</span>
              </div>
              <button
                onClick={() => refreshBalance()}
                title="रिफ्रेश करा"
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: '#64748b',
                  display: 'flex',
                  padding: 4
                }}
              >
                <RefreshCw size={14} />
              </button>
            </div>

            {/* Address Box */}
            <div
              style={{
                background: '#f8fafc',
                border: '1px solid #e2e8f0',
                borderRadius: '14px',
                padding: '12px',
                marginBottom: '14px'
              }}
            >
              <div style={{ fontSize: '11px', color: '#64748b', marginBottom: '4px', fontWeight: 600 }}>वॉलेट ॲड्रेस:</div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontFamily: 'monospace', fontSize: '12px', fontWeight: 700, color: '#0f172a' }}>
                  {shortAddr}
                </span>
                <div style={{ display: 'flex', gap: '6px' }}>
                  <button
                    onClick={handleCopy}
                    style={{
                      border: 'none',
                      background: copied ? '#10b98122' : '#e2e8f0',
                      color: copied ? '#10b981' : '#475569',
                      padding: '4px 8px',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      fontSize: '11px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      fontWeight: 700
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
                      border: 'none',
                      background: '#e2e8f0',
                      color: '#475569',
                      padding: '4px 8px',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      fontSize: '11px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      textDecoration: 'none',
                      fontWeight: 700
                    }}
                  >
                    <ExternalLink size={12} />
                  </a>
                </div>
              </div>
            </div>

            {/* Network Selector */}
            <div style={{ marginBottom: '16px' }}>
              <div style={{ fontSize: '11px', color: '#64748b', marginBottom: '8px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Globe size={12} /> सक्रिय नेटवर्क स्विच करा:
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                <button
                  onClick={() => switchNet('mstMainnet')}
                  style={{
                    background: networkKey === 'mstMainnet' ? '#ecfdf5' : '#f8fafc',
                    border: `1.5px solid ${networkKey === 'mstMainnet' ? '#10b981' : '#e2e8f0'}`,
                    padding: '8px 10px',
                    borderRadius: '10px',
                    cursor: 'pointer',
                    fontSize: '12px',
                    fontWeight: 800,
                    color: networkKey === 'mstMainnet' ? '#047857' : '#475569',
                    textAlign: 'center'
                  }}
                >
                  🟢 MST Mainnet
                  <div style={{ fontSize: '10px', fontWeight: 500, color: '#94a3b8' }}>ID: 4646</div>
                </button>
                <button
                  onClick={() => switchNet('mstTestnet')}
                  style={{
                    background: networkKey === 'mstTestnet' ? '#fffbeb' : '#f8fafc',
                    border: `1.5px solid ${networkKey === 'mstTestnet' ? '#f59e0b' : '#e2e8f0'}`,
                    padding: '8px 10px',
                    borderRadius: '10px',
                    cursor: 'pointer',
                    fontSize: '12px',
                    fontWeight: 800,
                    color: networkKey === 'mstTestnet' ? '#b45309' : '#475569',
                    textAlign: 'center'
                  }}
                >
                  🟡 MST Testnet
                  <div style={{ fontSize: '10px', fontWeight: 500, color: '#94a3b8' }}>ID: 91562037</div>
                </button>
              </div>
            </div>

            {/* Deployed Contract Info */}
            <div
              style={{
                fontSize: '11px',
                background: '#f1f5f9',
                padding: '8px 10px',
                borderRadius: '10px',
                marginBottom: '14px',
                color: '#475569'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 700, color: '#0f172a', marginBottom: '2px' }}>
                <Shield size={12} color="#10b981" /> KrushiChainProof Contract:
              </div>
              <div style={{ fontFamily: 'monospace', fontSize: '10.5px' }}>
                {contractAddress.slice(0, 10)}...{contractAddress.slice(-8)}
              </div>
            </div>

            {/* Disconnect Button */}
            <button
              onClick={() => {
                disconnect();
                setDropdownOpen(false);
              }}
              style={{
                width: '100%',
                background: '#fef2f2',
                border: '1px solid #fecaca',
                color: '#dc2626',
                padding: '8px',
                borderRadius: '12px',
                fontWeight: 700,
                fontSize: '12px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px'
              }}
            >
              <Power size={13} /> डिस्कनेक्ट करा
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
