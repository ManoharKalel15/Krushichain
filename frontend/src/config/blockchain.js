/**
 * blockchain.js — MST Chain MetaMask & Web3 Integration for KrushiChain Frontend
 * Supports both MST Mainnet (Chain ID 4646) and MST Testnet (Chain ID 91562037)
 */

export const MST_NETWORKS = {
  mstMainnet: {
    key: 'mstMainnet',
    chainId: '0x1226', // 4646 in hex
    chainIdNum: 4646,
    chainName: 'MST Mainnet',
    rpcUrls: ['https://mariorpc.mstblockchain.com', 'https://craftrpc.mstblockchain.com'],
    nativeCurrency: {
      name: 'MST Coin',
      symbol: 'MSTC',
      decimals: 18,
    },
    blockExplorerUrls: ['https://mstscan.com'],
    isMainnet: true
  },
  mstTestnet: {
    key: 'mstTestnet',
    chainId: '0x5746F85', // 91562037 in hex
    chainIdNum: 91562037,
    chainName: 'MST Testnet',
    rpcUrls: ['https://testnetrpc.mstblockchain.com'],
    nativeCurrency: {
      name: 'Test MSTC',
      symbol: 'tMSTC',
      decimals: 18,
    },
    blockExplorerUrls: ['https://testnet.mstscan.com'],
    faucetUrl: 'https://faucet.mstblockchain.com',
    isMainnet: false
  }
};

export const CONTRACT_ABI = [
  "function storeProof(string memory farmerIdHash, string memory landHash, string memory ipfsHash, string memory action, uint256 timestamp) public returns (uint256)",
  "function getProof(uint256 proofId) public view returns (string, string, string, string, uint256, address, uint256)",
  "function getProofCount() public view returns (uint256)",
  "event ProofStored(uint256 indexed proofId, string farmerIdHash, string action, uint256 timestamp)"
];

export const CONTRACT_ADDRESS = import.meta.env.VITE_CONTRACT_ADDRESS || '0x839A088dea854A031b9e6F0047dbF5860D5CdED6';

export function isMetaMaskInstalled() {
  return typeof window !== 'undefined' && Boolean(window.ethereum?.isMetaMask);
}

/**
 * Add or Switch to specified MST network in MetaMask
 */
export async function switchToNetwork(networkKey = 'mstMainnet') {
  if (!isMetaMaskInstalled()) {
    throw new Error('MetaMask इंस्टॉल केलेले नाही. कृपया आधी metamask.io वरून MetaMask इन्स्टॉल करा.');
  }

  const net = MST_NETWORKS[networkKey] || MST_NETWORKS.mstMainnet;

  try {
    await window.ethereum.request({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId: net.chainId }],
    });
    return { success: true, network: net };
  } catch (switchError) {
    // 4902 error code indicates the chain has not been added to MetaMask yet
    if (switchError.code === 4902 || switchError.message?.includes('4902')) {
      try {
        await window.ethereum.request({
          method: 'wallet_addEthereumChain',
          params: [{
            chainId: net.chainId,
            chainName: net.chainName,
            rpcUrls: net.rpcUrls,
            nativeCurrency: net.nativeCurrency,
            blockExplorerUrls: net.blockExplorerUrls
          }],
        });
        return { success: true, network: net };
      } catch (addError) {
        throw new Error(`नेटवर्क ॲड करण्यास नकार दिला: ${addError.message}`);
      }
    }
    throw new Error(`नेटवर्क स्विच करण्यात अडचण: ${switchError.message}`);
  }
}

/**
 * Connect MetaMask wallet and prompt network selection
 */
export async function connectMSTWallet(targetNetwork = 'mstTestnet') {
  if (!isMetaMaskInstalled()) {
    throw new Error('MetaMask सापडले नाही! कृपया Chrome किंवा Brave मध्ये MetaMask Extension चालू करा.');
  }

  // Request accounts
  const accounts = await window.ethereum.request({
    method: 'eth_requestAccounts',
  });

  if (!accounts || accounts.length === 0) {
    throw new Error('कोणतेही वॉलेट खाते निवडले नाही. कृपया अनलॉक करा.');
  }

  const address = accounts[0];

  // Check current chain ID
  const chainIdHex = await window.ethereum.request({ method: 'eth_chainId' });
  const currentChainId = parseInt(chainIdHex, 16);

  const targetNet = MST_NETWORKS[targetNetwork] || MST_NETWORKS.mstTestnet;

  if (currentChainId !== targetNet.chainIdNum) {
    // Switch automatically
    await switchToNetwork(targetNetwork);
  }

  const balance = await getMSTBalance(address);

  return {
    address,
    networkKey: targetNetwork,
    network: targetNet,
    balance,
    chainId: targetNet.chainIdNum
  };
}

/**
 * Get native balance (MSTC or tMSTC) from MetaMask
 */
export async function getMSTBalance(address) {
  if (!isMetaMaskInstalled() || !address) return '0.0000';

  try {
    const balanceHex = await window.ethereum.request({
      method: 'eth_getBalance',
      params: [address, 'latest'],
    });

    const balanceWei = BigInt(balanceHex);
    const balanceNum = Number(balanceWei) / 1e18;
    return balanceNum.toFixed(4);
  } catch (e) {
    console.warn('Failed to fetch balance:', e.message);
    return '0.0000';
  }
}

/**
 * Generate explorer URL for a transaction hash
 */
export function getTxExplorerUrl(txHash, networkKey = 'mstTestnet') {
  const net = MST_NETWORKS[networkKey] || MST_NETWORKS.mstTestnet;
  return `${net.blockExplorerUrls[0]}/tx/${txHash}`;
}

/**
 * Generate explorer URL for an address
 */
export function getAddressExplorerUrl(address, networkKey = 'mstTestnet') {
  const net = MST_NETWORKS[networkKey] || MST_NETWORKS.mstTestnet;
  return `${net.blockExplorerUrls[0]}/address/${address}`;
}
