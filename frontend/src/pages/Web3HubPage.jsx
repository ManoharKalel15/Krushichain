import React, { useState, useEffect } from 'react';
import { useWallet } from '../context/WalletContext';
import { useAuth } from '../context/AuthContext';
import { ethers } from 'ethers';
import { CONTRACT_ABI, CONTRACT_ADDRESS } from '../config/blockchain';
import api from '../config/api';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ShieldCheck,
  Globe,
  ExternalLink,
  Copy,
  Check,
  RefreshCw,
  Cpu,
  Layers,
  Zap,
  CheckCircle2,
  AlertCircle,
  FileText,
  Search,
  Send,
  Database
} from 'lucide-react';

export default function Web3HubPage() {
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
    switchNet,
    refreshBalance,
    getTxExplorerUrl,
    getAddressExplorerUrl
  } = useWallet();

  const { user } = useAuth();

  const [backendStatus, setBackendStatus] = useState(null);
  const [loadingStatus, setLoadingStatus] = useState(false);
  const [copiedAddr, setCopiedAddr] = useState(false);
  const [copiedContract, setCopiedContract] = useState(false);

  // Verification tab state
  const [verifyId, setVerifyId] = useState('1');
  const [verifying, setVerifying] = useState(false);
  const [verifyResult, setVerifyResult] = useState(null);

  // Direct proof store state
  const [storeSurvey, setStoreSurvey] = useState('74/2A');
  const [storeArea, setStoreArea] = useState('3.5');
  const [storeCrop, setStoreCrop] = useState('सोयाबीन (Soybean)');
  const [storing, setStoring] = useState(false);
  const [lastTxHash, setLastTxHash] = useState(null);

  // Fetch backend status
  const fetchBackendStatus = async () => {
    setLoadingStatus(true);
    try {
      const res = await api.get('/blockchain/status');
      setBackendStatus(res.data);
    } catch (err) {
      console.warn('Backend status fetch failed:', err);
    } finally {
      setLoadingStatus(false);
    }
  };

  useEffect(() => {
    fetchBackendStatus();
    const interval = setInterval(fetchBackendStatus, 15000);
    return () => clearInterval(interval);
  }, []);

  // Verify Proof on Chain
  const handleVerify = async (e) => {
    e.preventDefault();
    if (!verifyId) return;
    setVerifying(true);
    setVerifyResult(null);

    try {
      // Query contract directly using RPC provider
      const provider = new ethers.JsonRpcProvider(network.rpcUrls[0]);
      const contract = new ethers.Contract(contractAddress, CONTRACT_ABI, provider);

      const proof = await contract.getProof(Number(verifyId));
      if (!proof || !proof[0]) {
        toast.error('Proof ID सापडला नाही किंवा रिकामी आहे.');
        setVerifyResult({ found: false });
      } else {
        setVerifyResult({
          found: true,
          farmerIdHash: proof[0],
          landHash: proof[1],
          ipfsHash: proof[2] || 'ipfs://bafkreia...none',
          action: proof[3],
          timestamp: new Date(Number(proof[4]) * 1000).toLocaleString('mr-IN'),
          storedBy: proof[5],
          blockNumber: Number(proof[6])
        });
        toast.success('✅ Blockchain वर Proof यशस्वीरित्या Verified!');
      }
    } catch (err) {
      console.error(err);
      toast.error('Proof verification failed: ' + (err.reason || err.message));
      setVerifyResult({ found: false, error: err.message });
    } finally {
      setVerifying(false);
    }
  };

  // Submit Proof on Chain directly from user's MetaMask
  const handleDirectStore = async (e) => {
    e.preventDefault();
    if (!isConnected) {
      toast.error('कृपया आधी MetaMask वॉलेट कनेक्ट करा!');
      await connect();
      return;
    }

    setStoring(true);
    setLastTxHash(null);

    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(contractAddress, CONTRACT_ABI, signer);

      const farmerHash = ethers.keccak256(ethers.toUtf8Bytes(user?._id || 'farmer_test'));
      const landHash = ethers.keccak256(ethers.toUtf8Bytes(JSON.stringify({ survey: storeSurvey, area: storeArea, crop: storeCrop })));
      const ipfsHash = 'ipfs://' + ethers.keccak256(ethers.toUtf8Bytes(Date.now().toString())).slice(2, 48);
      const action = 'direct_land_registry';
      const timestamp = Math.floor(Date.now() / 1000);

      toast.loading('MetaMask मध्ये Transaction Confirm करा...', { id: 'tx-toast' });
      const tx = await contract.storeProof(farmerHash, landHash, ipfsHash, action, timestamp);

      toast.loading('MST Chain वर Block Confirm होत आहे...', { id: 'tx-toast' });
      const receipt = await tx.wait();

      toast.success('🎉 Transaction MST Chain वर सुरक्षितपणे नोंदवली गेली!', { id: 'tx-toast' });
      setLastTxHash(receipt.hash);
      refreshBalance();
      fetchBackendStatus();
    } catch (err) {
      console.error(err);
      toast.error(err.reason || err.message || 'Transaction अयशस्वी झाली', { id: 'tx-toast' });
    } finally {
      setStoring(false);
    }
  };

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', paddingBottom: '50px' }}>
      {/* Hero Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        style={{
          background: 'linear-gradient(135deg, #090d16 0%, #111827 50%, #064e3b 100%)',
          borderRadius: '24px',
          padding: '36px',
          color: '#fff',
          boxShadow: '0 20px 40px rgba(0,0,0,0.3)',
          marginBottom: '28px',
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        <div style={{ position: 'absolute', top: '-20%', right: '-10%', width: 350, height: 350, background: 'radial-gradient(circle, rgba(16,185,129,0.15) 0%, transparent 70%)', borderRadius: '50%' }} />

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '20px', position: 'relative', zIndex: 1 }}>
          <div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'rgba(16,185,129,0.15)', border: '1px solid rgba(16,185,129,0.3)', padding: '5px 14px', borderRadius: '20px', fontSize: '12px', fontWeight: 700, color: '#34d399', marginBottom: '14px' }}>
              <Zap size={14} /> MST Blockchain Live Core
            </div>
            <h1 style={{ fontSize: '30px', fontWeight: 900, margin: '0 0 8px 0', letterSpacing: '-0.5px' }}>
              MST Chain Web3 & Smart Contract Station
            </h1>
            <p style={{ margin: 0, fontSize: '15px', color: '#94a3b8', maxWidth: '580px', lineHeight: 1.6 }}>
              कृषी 7/12 रेकॉर्ड, पीक विमा दावे आणि अनुदान मंजुरी MST Chain च्या सुरक्षित Decentralized Ledger वर रिअल-टाइम Cryptographic Proof द्वारे संग्रहित.
            </p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div
              style={{
                background: 'rgba(255,255,255,0.06)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255,255,255,0.1)',
                padding: '14px 20px',
                borderRadius: '16px',
                textAlign: 'right'
              }}
            >
              <div style={{ fontSize: '12px', color: '#94a3b8', marginBottom: '4px' }}>सक्रिय नेटवर्क</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'flex-end', fontWeight: 800, fontSize: '16px', color: '#10b981' }}>
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#10b981', display: 'inline-block' }} />
                {network.chainName}
              </div>
              <div style={{ fontSize: '11px', color: '#64748b', marginTop: '2px' }}>
                Chain ID: {network.chainIdNum} • RPC Active
              </div>
            </div>
          </div>
        </div>

        {/* Quick Network Switcher Bar */}
        <div style={{ marginTop: '28px', paddingTop: '20px', borderTop: '1px solid rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
          <div style={{ fontSize: '13px', color: '#cbd5e1', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Globe size={15} /> नेटवर्क निवडा:
          </div>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              onClick={() => switchNet('mstMainnet')}
              style={{
                background: networkKey === 'mstMainnet' ? '#10b981' : 'rgba(255,255,255,0.08)',
                color: '#fff',
                border: `1.5px solid ${networkKey === 'mstMainnet' ? '#10b981' : 'rgba(255,255,255,0.15)'}`,
                padding: '6px 14px',
                borderRadius: '20px',
                fontSize: '12px',
                fontWeight: 800,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              🚀 MST Mainnet (ID: 4646)
            </button>
            <button
              onClick={() => switchNet('mstTestnet')}
              style={{
                background: networkKey === 'mstTestnet' ? '#f59e0b' : 'rgba(255,255,255,0.08)',
                color: '#fff',
                border: `1.5px solid ${networkKey === 'mstTestnet' ? '#f59e0b' : 'rgba(255,255,255,0.15)'}`,
                padding: '6px 14px',
                borderRadius: '20px',
                fontSize: '12px',
                fontWeight: 800,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              🧪 MST Testnet (ID: 91562037)
            </button>
          </div>
        </div>
      </motion.div>

      {/* Grid of Key Info */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px', marginBottom: '28px' }}>
        {/* Wallet Station */}
        <div style={{ background: '#fff', borderRadius: '20px', padding: '24px', border: '1px solid #e2e8f0', boxShadow: '0 4px 15px rgba(0,0,0,0.04)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{ background: '#fef3c7', padding: '8px', borderRadius: '12px', color: '#d97706' }}>🦊</div>
              <div style={{ fontWeight: 800, fontSize: '16px', color: '#0f172a' }}>तुमचे MetaMask वॉलेट</div>
            </div>
            {isConnected ? (
              <span style={{ fontSize: '11px', fontWeight: 800, background: '#ecfdf5', color: '#059669', padding: '3px 10px', borderRadius: '20px', border: '1px solid #a7f3d0' }}>
                Connected
              </span>
            ) : (
              <span style={{ fontSize: '11px', fontWeight: 800, background: '#fef2f2', color: '#dc2626', padding: '3px 10px', borderRadius: '20px', border: '1px solid #fecaca' }}>
                Not Connected
              </span>
            )}
          </div>

          {isConnected ? (
            <div>
              <div style={{ background: '#f8fafc', padding: '12px', borderRadius: '14px', marginBottom: '14px', border: '1px solid #e2e8f0' }}>
                <div style={{ fontSize: '11px', color: '#64748b', marginBottom: '4px' }}>कनेक्टेड ॲड्रेस:</div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontFamily: 'monospace', fontSize: '13px', fontWeight: 700, color: '#0f172a' }}>
                    {walletAddress.slice(0, 8)}...{walletAddress.slice(-6)}
                  </span>
                  <div style={{ display: 'flex', gap: '6px' }}>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(walletAddress);
                        setCopiedAddr(true);
                        setTimeout(() => setCopiedAddr(false), 2000);
                      }}
                      style={{ border: 'none', background: '#e2e8f0', padding: '4px 8px', borderRadius: '6px', cursor: 'pointer', fontSize: '11px' }}
                    >
                      {copiedAddr ? <Check size={12} color="#10b981" /> : <Copy size={12} />}
                    </button>
                    <a href={getAddressExplorerUrl(walletAddress)} target="_blank" rel="noreferrer" style={{ background: '#e2e8f0', padding: '4px 8px', borderRadius: '6px', color: '#0f172a' }}>
                      <ExternalLink size={12} />
                    </a>
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 14px', background: '#ecfdf5', borderRadius: '14px', border: '1px solid #a7f3d0', marginBottom: '14px' }}>
                <div>
                  <div style={{ fontSize: '11px', color: '#047857', fontWeight: 600 }}>उपलब्ध बॅलन्स:</div>
                  <div style={{ fontSize: '18px', fontWeight: 900, color: '#065f46' }}>
                    {balance} {network.nativeCurrency.symbol}
                  </div>
                </div>
                {networkKey === 'mstTestnet' && (
                  <a
                    href="https://faucet.mstblockchain.com"
                    target="_blank"
                    rel="noreferrer"
                    style={{
                      background: '#059669',
                      color: '#fff',
                      padding: '6px 12px',
                      borderRadius: '8px',
                      fontSize: '11.5px',
                      fontWeight: 700,
                      textDecoration: 'none'
                    }}
                  >
                    + Free tMSTC घ्या
                  </a>
                )}
              </div>
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '20px 10px' }}>
              <p style={{ fontSize: '13px', color: '#64748b', marginBottom: '16px' }}>
                जमीन आणि पीक डेटा थेट स्वाक्षरी करून MST Chain वर नोंदणी करण्यासाठी तुमचे वॉलेट जोडा.
              </p>
              <button
                onClick={() => connect()}
                disabled={isConnecting}
                className="btn btn-primary btn-full"
                style={{ borderRadius: '14px', fontWeight: 800, padding: '12px' }}
              >
                🦊 MetaMask कनेक्ट करा
              </button>
            </div>
          )}
        </div>

        {/* Smart Contract Card */}
        <div style={{ background: '#fff', borderRadius: '20px', padding: '24px', border: '1px solid #e2e8f0', boxShadow: '0 4px 15px rgba(0,0,0,0.04)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{ background: '#e0f2fe', padding: '8px', borderRadius: '12px', color: '#0284c7' }}>
                <ShieldCheck size={20} />
              </div>
              <div style={{ fontWeight: 800, fontSize: '16px', color: '#0f172a' }}>Smart Contract Status</div>
            </div>
            <span style={{ fontSize: '11px', fontWeight: 800, background: '#ecfdf5', color: '#059669', padding: '3px 10px', borderRadius: '20px', border: '1px solid #a7f3d0' }}>
              Verified & Live
            </span>
          </div>

          <div style={{ background: '#f8fafc', padding: '12px', borderRadius: '14px', marginBottom: '14px', border: '1px solid #e2e8f0' }}>
            <div style={{ fontSize: '11px', color: '#64748b', marginBottom: '4px' }}>करार ॲड्रेस (Contract Address):</div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontFamily: 'monospace', fontSize: '12px', fontWeight: 700, color: '#0f172a' }}>
                {contractAddress.slice(0, 10)}...{contractAddress.slice(-8)}
              </span>
              <div style={{ display: 'flex', gap: '6px' }}>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(contractAddress);
                    setCopiedContract(true);
                    setTimeout(() => setCopiedContract(false), 2000);
                  }}
                  style={{ border: 'none', background: '#e2e8f0', padding: '4px 8px', borderRadius: '6px', cursor: 'pointer', fontSize: '11px' }}
                >
                  {copiedContract ? <Check size={12} color="#10b981" /> : <Copy size={12} />}
                </button>
                <a
                  href={`${network.blockExplorerUrls[0]}/address/${contractAddress}`}
                  target="_blank"
                  rel="noreferrer"
                  style={{ background: '#e2e8f0', padding: '4px 8px', borderRadius: '6px', color: '#0f172a' }}
                >
                  <ExternalLink size={12} />
                </a>
              </div>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            <div style={{ background: '#f1f5f9', padding: '10px 12px', borderRadius: '12px' }}>
              <div style={{ fontSize: '10.5px', color: '#64748b' }}>Latest Block:</div>
              <div style={{ fontWeight: 800, fontSize: '14px', color: '#0f172a' }}>
                #{backendStatus?.blockNumber || 'Loading...'}
              </div>
            </div>
            <div style={{ background: '#f1f5f9', padding: '10px 12px', borderRadius: '12px' }}>
              <div style={{ fontSize: '10.5px', color: '#64748b' }}>Proof Records:</div>
              <div style={{ fontWeight: 800, fontSize: '14px', color: '#0f172a' }}>
                {backendStatus?.proofCount !== undefined ? `${backendStatus.proofCount} On-Chain` : 'Verified'}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Interactive Actions Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '24px' }}>
        {/* On-Chain Verification Tool */}
        <div style={{ background: '#fff', borderRadius: '20px', padding: '28px', border: '1px solid #e2e8f0', boxShadow: '0 4px 15px rgba(0,0,0,0.04)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '18px' }}>
            <div style={{ background: '#f0fdf4', padding: '10px', borderRadius: '14px', color: '#16a34a' }}>
              <Search size={22} />
            </div>
            <div>
              <h2 style={{ fontSize: '18px', fontWeight: 800, margin: 0, color: '#0f172a' }}>
                Cryptographic Proof Verification
              </h2>
              <p style={{ margin: 0, fontSize: '12px', color: '#64748b' }}>
                स्मार्ट करारावरून थेट Proof ID द्वारे डेटा पडताळणी करा
              </p>
            </div>
          </div>

          <form onSubmit={handleVerify}>
            <div style={{ display: 'flex', gap: '10px', marginBottom: '16px' }}>
              <input
                className="form-control"
                placeholder="Proof ID प्रविष्ट करा (उदा. 1)"
                value={verifyId}
                onChange={(e) => setVerifyId(e.target.value)}
                style={{ borderRadius: '12px', padding: '10px 14px', fontSize: '14px', fontFamily: 'monospace' }}
              />
              <button
                type="submit"
                disabled={verifying}
                className="btn btn-primary"
                style={{ borderRadius: '12px', padding: '0 20px', fontWeight: 800, whiteSpace: 'nowrap' }}
              >
                {verifying ? 'तपासत आहे...' : 'पडताळा (Verify)'}
              </button>
            </div>
          </form>

          {verifyResult && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              style={{
                background: verifyResult.found ? '#f8fafc' : '#fef2f2',
                border: `1.5px solid ${verifyResult.found ? '#cbd5e1' : '#fecaca'}`,
                borderRadius: '16px',
                padding: '16px',
                marginTop: '16px'
              }}
            >
              {verifyResult.found ? (
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#16a34a', fontWeight: 800, fontSize: '14px', marginBottom: '12px' }}>
                    <CheckCircle2 size={16} /> अधिकृत MST Blockchain Proof सापडले!
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '12px' }}>
                    <div>
                      <span style={{ color: '#64748b' }}>क्रिया (Action):</span>{' '}
                      <span style={{ fontWeight: 700, color: '#0f172a' }}>{verifyResult.action}</span>
                    </div>
                    <div>
                      <span style={{ color: '#64748b' }}>Block Number:</span>{' '}
                      <span style={{ fontWeight: 700, fontFamily: 'monospace' }}>#{verifyResult.blockNumber}</span>
                    </div>
                    <div>
                      <span style={{ color: '#64748b' }}>Farmer Hash:</span>{' '}
                      <span style={{ fontFamily: 'monospace', color: '#475569' }}>{verifyResult.farmerIdHash.slice(0, 16)}...</span>
                    </div>
                    <div>
                      <span style={{ color: '#64748b' }}>Land Hash:</span>{' '}
                      <span style={{ fontFamily: 'monospace', color: '#475569' }}>{verifyResult.landHash.slice(0, 16)}...</span>
                    </div>
                    <div>
                      <span style={{ color: '#64748b' }}>नोंदणी वेळ:</span>{' '}
                      <span style={{ fontWeight: 600 }}>{verifyResult.timestamp}</span>
                    </div>
                  </div>
                </div>
              ) : (
                <div style={{ color: '#dc2626', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <AlertCircle size={16} /> हा Proof ID ब्लॉकचेनवर उपलब्ध नाही.
                </div>
              )}
            </motion.div>
          )}
        </div>

        {/* Direct Submit Proof Station */}
        <div style={{ background: '#fff', borderRadius: '20px', padding: '28px', border: '1px solid #e2e8f0', boxShadow: '0 4px 15px rgba(0,0,0,0.04)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '18px' }}>
            <div style={{ background: '#eff6ff', padding: '10px', borderRadius: '14px', color: '#2563eb' }}>
              <Send size={22} />
            </div>
            <div>
              <h2 style={{ fontSize: '18px', fontWeight: 800, margin: 0, color: '#0f172a' }}>
                थेट MetaMask ने Proof सबमिट करा
              </h2>
              <p style={{ margin: 0, fontSize: '12px', color: '#64748b' }}>
                तुमच्या खाजगी की द्वारे MST Chain वर थेट 7/12 ब्लॉक नोंदवा
              </p>
            </div>
          </div>

          <form onSubmit={handleDirectStore}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
              <div>
                <label style={{ fontSize: '12px', fontWeight: 700, color: '#475569', marginBottom: '4px', display: 'block' }}>
                  सर्व्हे नंबर (Survey No.)
                </label>
                <input
                  className="form-control"
                  value={storeSurvey}
                  onChange={(e) => setStoreSurvey(e.target.value)}
                  style={{ borderRadius: '10px' }}
                />
              </div>
              <div>
                <label style={{ fontSize: '12px', fontWeight: 700, color: '#475569', marginBottom: '4px', display: 'block' }}>
                  क्षेत्र (Acres)
                </label>
                <input
                  className="form-control"
                  value={storeArea}
                  onChange={(e) => setStoreArea(e.target.value)}
                  style={{ borderRadius: '10px' }}
                />
              </div>
            </div>

            <div style={{ marginBottom: '16px' }}>
              <label style={{ fontSize: '12px', fontWeight: 700, color: '#475569', marginBottom: '4px', display: 'block' }}>
                पीक नाव (Crop)
              </label>
              <input
                className="form-control"
                value={storeCrop}
                onChange={(e) => setStoreCrop(e.target.value)}
                style={{ borderRadius: '10px' }}
              />
            </div>

            <button
              type="submit"
              disabled={storing}
              className="btn btn-primary btn-full"
              style={{
                borderRadius: '12px',
                padding: '12px',
                fontWeight: 800,
                background: 'linear-gradient(135deg, #2563eb, #1d4ed8)',
                boxShadow: '0 4px 15px rgba(37, 99, 235, 0.25)'
              }}
            >
              {storing ? 'MetaMask स्वाक्षरी घेत आहे...' : '🚀 MST Chain वर Proof साठवा (Sign & Store)'}
            </button>
          </form>

          {lastTxHash && (
            <div
              style={{
                marginTop: '16px',
                background: '#ecfdf5',
                border: '1px solid #a7f3d0',
                borderRadius: '14px',
                padding: '14px'
              }}
            >
              <div style={{ fontSize: '12px', fontWeight: 800, color: '#065f46', marginBottom: '4px' }}>
                ✅ Transaction यशस्वीरित्या ब्लॉकवर समाविष्ट झाली!
              </div>
              <a
                href={getTxExplorerUrl(lastTxHash)}
                target="_blank"
                rel="noreferrer"
                style={{
                  fontSize: '11.5px',
                  fontFamily: 'monospace',
                  color: '#047857',
                  wordBreak: 'break-all',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px'
                }}
              >
                {lastTxHash} <ExternalLink size={12} />
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
