import { networks, getNetworkInfo } from './networks.js';

export function getProviderName(ethProvider) {
  if (!ethProvider) return 'No provider';
  try {
    if (ethProvider.isPali) return 'Pali Wallet';
    if (ethProvider.isMetaMask) return 'MetaMask';
    if (ethProvider.isCoinbaseWallet) return 'Coinbase Wallet';
    if (ethProvider.isBraveWallet) return 'Brave Wallet';
    if (ethProvider.isTrust) return 'Trust Wallet';
    if (ethProvider._name) return ethProvider._name;
    if (ethProvider.constructor?.name) return ethProvider.constructor.name;
  } catch (e) {
    console.error('Error detecting provider name:', e);
  }
  return 'Unknown Provider';
}

export function detectAvailableProviders() {
  const providers = [];
  if (typeof window === 'undefined') return providers;

  if (window.pali?.ethereum) {
    providers.push({ name: 'Pali Wallet', raw: window.pali.ethereum });
  }

  const eth = window.ethereum;
  if (eth) {
    if (Array.isArray(eth.providers) && eth.providers.length > 0) {
      eth.providers.forEach((p) => {
        const name = getProviderName(p);
        const isDuplicate = providers.some(existing => existing.raw === p);
        if (!isDuplicate) {
          providers.push({ name, raw: p });
        }
      });
    } else {
      const name = getProviderName(eth);
      const isDuplicate = providers.some(existing => existing.raw === eth);
      if (!isDuplicate) {
        providers.push({ name, raw: eth });
      }
    }
  }

  if (window.coinbaseWalletExtension && !providers.some(p => p.raw === window.coinbaseWalletExtension)) {
    providers.push({ name: 'Coinbase Wallet', raw: window.coinbaseWalletExtension });
  }

  return providers;
}

export async function getProviderNetworks(ethProvider) {
  if (!ethProvider) return null;

  try {
    if (ethProvider.isPali) {
      const syscoinNetworks = ['57', '5700', '57000', '57042', '57057'];
      try {
        const pali = window['pali'];
        if (pali?.getNetworks) {
          const pNetworks = await pali.getNetworks();
          if (pNetworks && pNetworks.length > 0) return pNetworks;
        }
      } catch (e) { }
      return syscoinNetworks.map(id => ({ chainId: id, name: networks[id]?.name || `Chain ${id}` }));
    }

    try {
      const chains = await ethProvider.request({ method: 'wallet_getEthereumChains' });
      if (chains && Array.isArray(chains)) {
        return chains.map(c => ({
          chainId: String(parseInt(c.chainId, 16)),
          name: c.chainName || c.name
        }));
      }
    } catch (e) { }
  } catch (e) {
    console.log('Error getting provider networks:', e);
  }
  return null;
}

export async function requestAccountSelection(ethProvider) {
  if (!ethProvider) return [];

  const isPali = ethProvider.isPali || ethProvider.isPaliWallet
    || (window.pali && (ethProvider === window.pali.ethereum));

  if (isPali) {
    try {
      await ethProvider.request({ method: 'wallet_changeAccount' });
      await new Promise(r => setTimeout(r, 500));
      const a = await ethProvider.request({ method: 'eth_accounts' });
      if (a && a.length > 0) return a;
    } catch (e) {
      console.warn('wallet_changeAccount failed:', e);
    }
    const a = await ethProvider.request({ method: 'eth_requestAccounts' });
    if (a && a.length > 0) return a;
  }

  try {
    await ethProvider.request({ method: 'wallet_requestPermissions', params: [{ eth_accounts: {} }] });
    await new Promise(r => setTimeout(r, 500));
    const a = await ethProvider.request({ method: 'eth_accounts' });
    if (a && a.length > 0) return a;
  } catch (e) {
    if (e.code === -32002) await new Promise(r => setTimeout(r, 1500));
    const a = await ethProvider.request({ method: 'eth_requestAccounts' });
    if (a && a.length > 0) return a;
  }

  try { return await ethProvider.request({ method: 'eth_accounts' }) || []; } catch { return []; }
}

export function filterAvailableNetworks(availableChainIds, allNetworks) {
  if (!availableChainIds || availableChainIds.length === 0) return allNetworks;
  const filtered = {};
  availableChainIds.forEach(id => {
    const chainIdStr = String(id);
    if (allNetworks[chainIdStr]) {
      filtered[chainIdStr] = allNetworks[chainIdStr];
    }
  });
  return Object.keys(filtered).length > 0 ? filtered : allNetworks;
}

export async function getBalanceSafe(provider, addr, attempts = 3) {
  let lastErr = null;
  for (let i = 0; i < attempts; i++) {
    try {
      if (!provider) throw new Error('No provider disponible');
      return await provider.getBalance(addr);
    } catch (err) {
      lastErr = err;
      const msg = String(err?.message || err);
      if (
        msg.toLowerCase().includes('rate-limit') ||
        msg.toLowerCase().includes('cooldown') ||
        err?.code === -32603
      ) {
        throw new Error('RPC rate limit: modifica la URL RPC en la configuración de la red o inténtalo más tarde.');
      }
      const delay = 300 * Math.pow(2, i);
      await new Promise((r) => setTimeout(r, delay));
    }
  }
  throw lastErr;
}

export function openInExplorer(address, chainId) {
  const netInfo = getNetworkInfo(chainId);
  if (netInfo.explorer && address) {
    window.open(`${netInfo.explorer}/address/${address}`, '_blank');
  }
}

export async function copyToClipboard(text) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (err) {
    console.error('Error copying:', err);
    return false;
  }
}
