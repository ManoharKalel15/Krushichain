import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import {
  MST_NETWORKS,
  CONTRACT_ADDRESS,
  isMetaMaskInstalled,
  connectMSTWallet,
  switchToNetwork,
  getMSTBalance,
  getTxExplorerUrl,
  getAddressExplorerUrl
} from '../config/blockchain';

const WalletContext = createContext();

export function WalletProvider({ children }) {
  const [walletAddress, setWalletAddress] = useState(localStorage.getItem('kc_wallet') || null);
  const [networkKey, setNetworkKey] = useState(localStorage.getItem('kc_network') || 'mstTestnet');
  const [balance, setBalance] = useState('0.0000');
  const [isConnecting, setIsConnecting] = useState(false);
  const [showNetworkModal, setShowNetworkModal] = useState(false);

  const activeNetwork = MST_NETWORKS[networkKey] || MST_NETWORKS.mstTestnet;

  // Refresh balance
  const refreshBalance = useCallback(async (addr = walletAddress) => {
    if (!addr || !isMetaMaskInstalled()) return;
    try {
      const b = await getMSTBalance(addr);
      setBalance(b);
    } catch (_) {}
  }, [walletAddress]);

  // Connect wallet
  const connect = async (targetNetwork = networkKey) => {
    if (!isMetaMaskInstalled()) {
      toast.error('MetaMask इंस्टॉल केलेले नाही! कृपया https://metamask.io वरून इन्स्टॉल करा.');
      window.open('https://metamask.io/download/', '_blank');
      return;
    }

    setIsConnecting(true);
    try {
      const res = await connectMSTWallet(targetNetwork);
      setWalletAddress(res.address);
      setNetworkKey(res.networkKey);
      setBalance(res.balance);
      localStorage.setItem('kc_wallet', res.address);
      localStorage.setItem('kc_network', res.networkKey);

      toast.success(`🎉 वॉलेट कनेक्ट झाले! (${res.network.chainName})`);
    } catch (err) {
      console.error('Wallet connect error:', err);
      toast.error(err.message || 'वॉलेट कनेक्ट करण्यात त्रुटी आली.');
    } finally {
      setIsConnecting(false);
    }
  };

  // Disconnect wallet
  const disconnect = () => {
    setWalletAddress(null);
    setBalance('0.0000');
    localStorage.removeItem('kc_wallet');
    toast('वॉलेट डिस्कनेक्ट झाले', { icon: '🔌' });
  };

  // Switch network
  const switchNet = async (targetKey) => {
    if (!isMetaMaskInstalled()) return;
    setIsConnecting(true);
    try {
      await switchToNetwork(targetKey);
      setNetworkKey(targetKey);
      localStorage.setItem('kc_network', targetKey);
      if (walletAddress) {
        await refreshBalance(walletAddress);
      }
      toast.success(`नेटवर्क बदलले: ${MST_NETWORKS[targetKey]?.chainName}`);
      setShowNetworkModal(false);
    } catch (err) {
      toast.error(err.message || 'नेटवर्क बदलण्यात त्रुटी आली');
    } finally {
      setIsConnecting(false);
    }
  };

  // Listen to MetaMask account & chain changes
  useEffect(() => {
    if (!isMetaMaskInstalled()) return;

    const handleAccountsChanged = (accounts) => {
      if (!accounts || accounts.length === 0) {
        setWalletAddress(null);
        localStorage.removeItem('kc_wallet');
      } else if (accounts[0] !== walletAddress) {
        setWalletAddress(accounts[0]);
        localStorage.setItem('kc_wallet', accounts[0]);
        refreshBalance(accounts[0]);
      }
    };

    const handleChainChanged = (chainIdHex) => {
      const id = parseInt(chainIdHex, 16);
      if (id === MST_NETWORKS.mstMainnet.chainIdNum) {
        setNetworkKey('mstMainnet');
        localStorage.setItem('kc_network', 'mstMainnet');
      } else if (id === MST_NETWORKS.mstTestnet.chainIdNum) {
        setNetworkKey('mstTestnet');
        localStorage.setItem('kc_network', 'mstTestnet');
      }
      if (walletAddress) {
        refreshBalance(walletAddress);
      }
    };

    window.ethereum.on('accountsChanged', handleAccountsChanged);
    window.ethereum.on('chainChanged', handleChainChanged);

    // Initial silent check
    if (walletAddress) {
      refreshBalance(walletAddress);
    }

    return () => {
      if (window.ethereum.removeListener) {
        window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
        window.ethereum.removeListener('chainChanged', handleChainChanged);
      }
    };
  }, [walletAddress, refreshBalance]);

  return (
    <WalletContext.Provider
      value={{
        walletAddress,
        isConnected: Boolean(walletAddress),
        isConnecting,
        networkKey,
        network: activeNetwork,
        networks: MST_NETWORKS,
        balance,
        contractAddress: CONTRACT_ADDRESS,
        connect,
        disconnect,
        switchNet,
        refreshBalance,
        showNetworkModal,
        setShowNetworkModal,
        getTxExplorerUrl: (tx) => getTxExplorerUrl(tx, networkKey),
        getAddressExplorerUrl: (addr) => getAddressExplorerUrl(addr, networkKey)
      }}
    >
      {children}
    </WalletContext.Provider>
  );
}

export function useWallet() {
  const context = useContext(WalletContext);
  if (!context) {
    throw new Error('useWallet must be used within a WalletProvider');
  }
  return context;
}
