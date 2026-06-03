import { getNetworkInfo, getTransactionExplorerUrl } from './networks.js';

export async function fetchEthPrice() {
  try {
    const res = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd');
    if (!res.ok) return null;
    const data = await res.json();
    return data.ethereum?.usd ?? null;
  } catch {
    return null;
  }
}

export function formatTimeAgo(timeStamp) {
  if (!timeStamp) return '';
  const ts = typeof timeStamp === 'string' ? parseInt(timeStamp, 10) : timeStamp;
  const now = Math.floor(Date.now() / 1000);
  const diff = now - ts;
  if (diff < 10) return 'Ahora';
  if (diff < 60) return `${diff}s`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h`;
  if (diff < 604800) return `${Math.floor(diff / 86400)}d`;
  return new Date(ts * 1000).toLocaleDateString();
}

export function truncateAddress(addr, start = 6, end = 4) {
  if (!addr) return '';
  if (addr.length <= start + end) return addr;
  return `${addr.substring(0, start)}...${addr.substring(addr.length - end)}`;
}

export async function fetchTxHistoryFromExplorer(chainId, address, apiKey) {
  const netInfo = getNetworkInfo(chainId);
  if (!netInfo.explorer || !address) return [];

  const DEFAULT_ETHERSCAN_API_KEY = 'T44KV98IA374K4R4YG5UQSWIA3AKHEJ8SH';
  const key = apiKey || DEFAULT_ETHERSCAN_API_KEY;

  try {
    let url;
    if (netInfo.explorer.includes('etherscan')) {
      url = `https://api.etherscan.io/v2/api?chainid=${chainId}&module=account&action=txlist&address=${address}&apikey=${key}`;
    } else {
      url = `${netInfo.explorer}/api/v2/addresses/${address}/transactions`;
    }
    console.log(`[fetchTxHistory] URL: ${url}`);
    const res = await fetch(url);
    if (!res.ok) {
      console.warn(`[fetchTxHistory] HTTP ${res.status} for ${url}`);
      return [];
    }
    const data = await res.json();

    if (netInfo.explorer.includes('etherscan')) {
      console.log(`[fetchTxHistory] Etherscan response status=${data.status} message=${data.message} count=${data.result?.length || 0}`);
      if (data.status !== '1') {
        console.warn(`[fetchTxHistory] Etherscan error: ${data.result}`);
        return [];
      }
      return (data.result || []).slice(0, 10).map(tx => ({
        hash: tx.hash,
        value: tx.value,
        timeStamp: tx.timeStamp,
        network: chainId,
        explorerUrl: getTransactionExplorerUrl(chainId, tx.hash),
        isExplorerTx: true
      }));
    }

    console.log(`[fetchTxHistory] Blockscout URL: ${url}`);
    return (data.items || data.results || []).slice(0, 10).map(tx => ({
      hash: tx.hash,
      value: tx.value || '0',
      timeStamp: tx.timestamp,
      network: chainId,
      explorerUrl: getTransactionExplorerUrl(chainId, tx.hash),
      isExplorerTx: true
    }));
  } catch (err) {
    console.error(`[fetchTxHistory] Error for chain ${chainId}:`, err?.message || err);
    return [];
  }
}
