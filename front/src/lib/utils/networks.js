export const networks = {
  '1': { name: 'Ethereum Mainnet', explorer: 'https://etherscan.io' },
  '11155111': { name: 'Sepolia Testnet', explorer: 'https://sepolia.etherscan.io' },
  '137': { name: 'Polygon Mainnet', explorer: 'https://polygonscan.com' },
  '80002': { name: 'Polygon Amoy', explorer: 'https://amoy.polygonscan.com' },
  '56': { name: 'BSC Mainnet', explorer: 'https://bscscan.com' },
  '97': { name: 'BSC Testnet', explorer: 'https://testnet.bscscan.com' },
  '42161': { name: 'Arbitrum One', explorer: 'https://arbiscan.io' },
  '421614': { name: 'Arbitrum Sepolia', explorer: 'https://sepolia.arbiscan.io' },
  '10': { name: 'Optimism', explorer: 'https://optimistic.etherscan.io' },
  '11155420': { name: 'Optimism Sepolia', explorer: 'https://sepolia-optimism.etherscan.io' },
  '5700': { name: 'Rollux', explorer: 'https://explorer.rollux.com' },
  '57': { name: 'Syscoin NEVM', explorer: 'https://explorer.syscoin.org' },
  '57000': { name: 'Syscoin NEVM Testnet', explorer: 'https://tanenbaum.io' },
  '57042': { name: 'zkSYS PoB Devnet', explorer: 'https://explorer-pob.dev11.top' },
  '57057': { name: 'zkSYS Testnet', explorer: 'https://explorer-zk.tanenbaum.io' },
  '560048': { name: 'Ethereum Hoodi', explorer: 'https://hoodi.etherscan.io' },
};

export const networksAdd = {
  '1': { chainIdHex: '0x1', chainName: 'Ethereum Mainnet', rpcUrls: ['https://ethereum-rpc.publicnode.com'], nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 }, blockExplorerUrls: ['https://etherscan.io'] },
  '137': { chainIdHex: '0x89', chainName: 'Polygon Mainnet', rpcUrls: ['https://polygon.llamarpc.com'], nativeCurrency: { name: 'MATIC', symbol: 'MATIC', decimals: 18 }, blockExplorerUrls: ['https://polygonscan.com'] },
  '80002': { chainIdHex: '0x13882', chainName: 'Polygon Amoy', rpcUrls: ['https://rpc-amoy.polygon.technology/'], nativeCurrency: { name: 'MATIC', symbol: 'MATIC', decimals: 18 }, blockExplorerUrls: ['https://amoy.polygonscan.com'] },
  '56': { chainIdHex: '0x38', chainName: 'BSC Mainnet', rpcUrls: ['https://bsc-dataseed.binance.org/'], nativeCurrency: { name: 'BNB', symbol: 'BNB', decimals: 18 }, blockExplorerUrls: ['https://bscscan.com'] },
  '97': { chainIdHex: '0x61', chainName: 'BSC Testnet', rpcUrls: ['https://data-seed-prebsc-1-s1.binance.org:8545/'], nativeCurrency: { name: 'tBNB', symbol: 'tBNB', decimals: 18 }, blockExplorerUrls: ['https://testnet.bscscan.com'] },
  '42161': { chainIdHex: '0xA4B1', chainName: 'Arbitrum One', rpcUrls: ['https://arb1.arbitrum.io/rpc'], nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 }, blockExplorerUrls: ['https://arbiscan.io'] },
  '421614': { chainIdHex: '0x66EEE', chainName: 'Arbitrum Sepolia', rpcUrls: ['https://sepolia-rollup.arbitrum.io/rpc'], nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 }, blockExplorerUrls: ['https://sepolia.arbiscan.io'] },
  '10': { chainIdHex: '0xA', chainName: 'Optimism', rpcUrls: ['https://mainnet.optimism.io'], nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 }, blockExplorerUrls: ['https://optimistic.etherscan.io'] },
  '11155420': { chainIdHex: '0xAA37DC', chainName: 'Optimism Sepolia', rpcUrls: ['https://sepolia.optimism.io'], nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 }, blockExplorerUrls: ['https://sepolia-optimism.etherscan.io'] },
  '5700': { chainIdHex: '0x1644', chainName: 'Rollux', rpcUrls: ['https://rpc.rollux.com'], nativeCurrency: { name: 'Syscoin', symbol: 'SYS', decimals: 18 }, blockExplorerUrls: ['https://explorer.rollux.com'] },
  '57': { chainIdHex: '0x39', chainName: 'Syscoin NEVM', rpcUrls: ['https://rpc.syscoin.org'], nativeCurrency: { name: 'Syscoin', symbol: 'SYS', decimals: 18 }, blockExplorerUrls: ['https://explorer.syscoin.org'] },
  '57000': { chainIdHex: '0xDEA8', chainName: 'Syscoin NEVM Testnet', rpcUrls: ['https://rpc.tanenbaum.io'], nativeCurrency: { name: 'Syscoin', symbol: 'SYS', decimals: 18 }, blockExplorerUrls: ['https://tanenbaum.io'] },
  '57042': { chainIdHex: '0xDED2', chainName: 'zkSYS PoB Devnet', rpcUrls: ['https://rpc-pob.dev11.top/'], nativeCurrency: { name: 'Syscoin', symbol: 'TSYS', decimals: 18 }, blockExplorerUrls: ['https://explorer-pob.dev11.top'] },
  '57057': { chainIdHex: '0xDEE1', chainName: 'zkSYS Testnet', rpcUrls: ['https://rpc-zk.tanenbaum.io/'], nativeCurrency: { name: 'Syscoin', symbol: 'TSYS', decimals: 18 }, blockExplorerUrls: ['https://explorer-zk.tanenbaum.io'] },
  '560048': { chainIdHex: '0x88BB0', chainName: 'Ethereum Hoodi', rpcUrls: ['https://0xrpc.io/hoodi'], nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 }, blockExplorerUrls: ['https://hoodi.etherscan.io'] },
  '11155111': { chainIdHex: '0xAA36A7', chainName: 'Sepolia Testnet', rpcUrls: ['https://ethereum-sepolia-rpc.publicnode.com/'], nativeCurrency: { name: 'Sepolia Ether', symbol: 'ETH', decimals: 18 }, blockExplorerUrls: ['https://sepolia.etherscan.io'] },
};

const UTXO_NETWORK_IDS = new Set(['57', '5700', '57000', '57042', '57057']);

export function getNetworkInfo(id) {
  return networks[String(id)] || { name: `Chain ${id}`, explorer: null };
}

export function getNetworkFamily(chainId) {
  return UTXO_NETWORK_IDS.has(String(chainId)) ? 'utxo' : 'evm';
}

export function filterNetworksByFamily(allNetworks, family) {
  if (!family || family === 'all') return allNetworks;
  const filtered = {};
  Object.entries(allNetworks).forEach(([id, net]) => {
    if (getNetworkFamily(id) === family) {
      filtered[id] = net;
    }
  });
  return Object.keys(filtered).length > 0 ? filtered : allNetworks;
}

export function getTransactionExplorerUrl(chainId, txHash) {
  const netInfo = getNetworkInfo(chainId);
  if (!netInfo.explorer || !txHash) return null;
  return `${netInfo.explorer}/tx/${txHash}`;
}

export function getExplorerApiUrl(chainId) {
  const netInfo = getNetworkInfo(chainId);
  if (!netInfo.explorer) return null;
  if (netInfo.explorer.includes('etherscan')) {
    return `https://api.etherscan.io/v2/api?chainid=${chainId}`;
  }
  return `${netInfo.explorer}/api/v2/addresses`;
}

function getErrorAnalysis(code, message) {
  const analyses = {
    4902: 'La red no existe en la wallet y necesita ser agregada primero',
    '-32602': 'Parámetros inválidos - verifica el chainId hex',
    '-32603': 'Error interno del wallet - posiblemente la red ya existe o los datos son incorrectos',
    4001: 'Usuario rechazó la solicitud',
    '-32000': 'Error de RPC - verifica que el endpoint esté funcionando'
  };
  if (message?.toLowerCase().includes('user rejected')) return 'Usuario rechazó la solicitud';
  return analyses[code] || 'Error desconocido - revisa la consola para más detalles';
}

export function logNetworkAddError(error, chainId, params) {
  console.group('🔴 Error al agregar red');
  console.log('Chain ID:', chainId);
  console.log('Chain ID Hex:', params?.chainIdHex);
  console.log('Chain Name:', params?.chainName);
  console.log('RPC URLs:', params?.rpcUrls);
  console.log('Error Code:', error?.code);
  console.log('Error Message:', error?.message);
  console.log('Error Stack:', error?.stack);
  console.log('Full Error:', error);
  if (error?.code === 4902) {
    console.log('⚠️ Análisis: La red no existe en la wallet y necesita ser agregada primero');
  } else if (error?.code === -32602) {
    console.log('⚠️ Análisis: Parámetros inválidos - verifica el chainId hex');
  } else if (error?.code === -32603) {
    console.log('⚠️ Análisis: Error interno del wallet - posiblemente la red ya existe o los datos son incorrectos');
  } else if (error?.message?.includes('user rejected')) {
    console.log('⚠️ Análisis: El usuario rechazó la solicitud');
  }
  console.groupEnd();
  return {
    code: error?.code,
    message: error?.message,
    chainId,
    chainIdHex: params?.chainIdHex,
    analysis: getErrorAnalysis(error?.code, error?.message)
  };
}
