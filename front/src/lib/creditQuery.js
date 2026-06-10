import { JsonRpcProvider, formatEther } from 'ethers';
import { networksAdd, networks } from './utils/networks.js';

const CREDIT_LTV_RATIO = 0.7;

const NETWORK_COLORS = {
  '1': '#627eea',
  '137': '#8247e5',
  '56': '#f0b90b',
  '42161': '#2d3748',
  '10': '#ff0420',
  '57': '#00d4ff',
  '5700': '#00d4ff',
  '11155111': '#f6c343',
  '560048': '#627eea',
  '80002': '#8247e5',
  '97': '#f0b90b',
  '421614': '#2d3748',
  '11155420': '#ff0420'
};

const NETWORK_ORDER = ['1', '137', '56', '42161', '10', '57', '5700', '11155111', '560048', '80002', '97', '421614', '11155420', '57000', '57042', '57057'];

export const ALL_NETWORKS = NETWORK_ORDER
  .map(id => {
    const addInfo = networksAdd[id];
    const netInfo = networks[id];
    if (!addInfo?.rpcUrls?.[0]) return null;
    return {
      id,
      name: netInfo?.name || `Chain ${id}`,
      rpcUrl: addInfo.rpcUrls[0],
      currency: addInfo.nativeCurrency?.symbol || 'ETH',
      explorer: netInfo?.explorer || '',
      color: NETWORK_COLORS[id] || '#666'
    };
  })
  .filter(Boolean);

function isValidAddress(address) {
  return /^0x[a-fA-F0-9]{40}$/.test(address);
}

export async function queryCreditAcrossNetworks(address, networkIds) {
  if (!isValidAddress(address)) {
    throw new Error('Dirección inválida. Debe ser una dirección Ethereum válida (0x...)');
  }

  const selectedNetworks = ALL_NETWORKS.filter(n => networkIds.includes(n.id));
  if (selectedNetworks.length === 0) {
    throw new Error('Selecciona al menos una red para consultar.');
  }

  const results = await Promise.allSettled(
    selectedNetworks.map(async (net) => {
      const provider = new JsonRpcProvider(net.rpcUrl, undefined, {
        staticNetwork: true
      });

      const [balance, blockNumber] = await Promise.all([
        provider.getBalance(address),
        provider.getBlockNumber()
      ]);

      const balanceEth = parseFloat(formatEther(balance));
      const creditLimit = balanceEth * CREDIT_LTV_RATIO;

      return {
        networkId: net.id,
        network: net.name,
        currency: net.currency,
        color: net.color,
        explorer: net.explorer,
        balance: balanceEth,
        creditLimit,
        blockNumber,
        success: true
      };
    })
  );

  return results.map((result, index) => {
    if (result.status === 'fulfilled') {
      return result.value;
    }
    return {
      networkId: selectedNetworks[index].id,
      network: selectedNetworks[index].name,
      currency: selectedNetworks[index].currency,
      color: selectedNetworks[index].color,
      explorer: selectedNetworks[index].explorer,
      balance: 0,
      creditLimit: 0,
      error: result.reason?.message || 'Error al conectar',
      success: false
    };
  });
}
