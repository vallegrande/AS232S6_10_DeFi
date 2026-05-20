export const networks = {
  '1': { name: 'Ethereum Mainnet', explorer: 'https://etherscan.io' },
  '5': { name: 'Goerli Testnet', explorer: 'https://goerli.etherscan.io' },
  '11155111': { name: 'Sepolia Testnet', explorer: 'https://sepolia.etherscan.io' },
  '137': { name: 'Polygon Mainnet', explorer: 'https://polygonscan.com' },
  '80001': { name: 'Polygon Mumbai', explorer: 'https://mumbai.polygonscan.com' },
  '56': { name: 'BSC Mainnet', explorer: 'https://bscscan.com' },
  '97': { name: 'BSC Testnet', explorer: 'https://testnet.bscscan.com' },
  '42161': { name: 'Arbitrum One', explorer: 'https://arbiscan.io' },
  '421613': { name: 'Arbitrum Goerli', explorer: 'https://goerli.arbiscan.io' },
  '10': { name: 'Optimism', explorer: 'https://optimistic.etherscan.io' },
  '5700': { name: 'Rollux', explorer: 'https://explorer.rollux.com' },
  '57': { name: 'Syscoin NEVM', explorer: 'https://explorer.syscoin.org' },
  '57000': { name: 'Syscoin NEVM Testnet', explorer: 'https://tanenbaum.io' },
  '57042': { name: 'zkSYS PoB Devnet', explorer: 'https://explorer-pob.dev11.top' },
  '57057': { name: 'zkSYS Testnet', explorer: 'https://explorer-zk.tanenbaum.io' },
  '560048': { name: 'Ethereum Hoodi', explorer: 'https://hoodi.etherscan.io' },
};

export const networksAdd = {
  '1': { chainIdHex: '0x1', chainName: 'Ethereum Mainnet', rpcUrls: ['https://mainnet.infura.io/v3/'], nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 }, blockExplorerUrls: ['https://etherscan.io'] },
  '5': { chainIdHex: '0x5', chainName: 'Goerli Testnet', rpcUrls: ['https://rpc.ankr.com/eth_goerli'], nativeCurrency: { name: 'Goerli Ether', symbol: 'ETH', decimals: 18 }, blockExplorerUrls: ['https://goerli.etherscan.io'] },
  '137': { chainIdHex: '0x89', chainName: 'Polygon Mainnet', rpcUrls: ['https://polygon-rpc.com/'], nativeCurrency: { name: 'MATIC', symbol: 'MATIC', decimals: 18 }, blockExplorerUrls: ['https://polygonscan.com'] },
  '80001': { chainIdHex: '0x13881', chainName: 'Polygon Mumbai', rpcUrls: ['https://rpc-mumbai.maticvigil.com/'], nativeCurrency: { name: 'MATIC', symbol: 'MATIC', decimals: 18 }, blockExplorerUrls: ['https://mumbai.polygonscan.com'] },
  '56': { chainIdHex: '0x38', chainName: 'BSC Mainnet', rpcUrls: ['https://bsc-dataseed.binance.org/'], nativeCurrency: { name: 'BNB', symbol: 'BNB', decimals: 18 }, blockExplorerUrls: ['https://bscscan.com'] },
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
    const match = netInfo.explorer.match(/https:\/\/(?:api\.)?(\w*)\.?etherscan/);
    const sub = match?.[1] || 'api';
    return `https://${sub}.api.etherscan.io`;
  }
  return netInfo.explorer;
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
