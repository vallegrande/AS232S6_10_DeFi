<script>
  import { onMount, onDestroy } from "svelte";
  import { BrowserProvider, formatEther, Interface, parseEther, Contract, ContractFactory } from "ethers";
  import { wallet } from "./lib/walletStore.svelte.js";
  import {
    networks, networksAdd, getNetworkInfo, getNetworkFamily,
    filterNetworksByFamily, getTransactionExplorerUrl, getExplorerApiUrl, logNetworkAddError
  } from "./lib/utils/networks.js";
  import {
    detectAvailableProviders as detectProviders, getProviderName,
    getProviderNetworks, requestAccountSelection, filterAvailableNetworks, getBalanceSafe,
    copyToClipboard, openInExplorer as openAddressInExplorer
  } from "./lib/utils/wallet.js";
  import { fetchEthPrice, fetchTxHistoryFromExplorer } from "./lib/utils/helpers.js";
  import { encodeDeposit, encodeTransfer, TRANSPARENT_WALLET_ABI, TRANSPARENT_WALLET_BYTECODE, decodeDepositedEvent, decodeTransferredEvent } from "./lib/utils/contracts.js";
  import Navbar from "./lib/components/Navbar.svelte";
  import HomePage from "./lib/pages/HomePage.svelte";
  import WalletPage from "./lib/pages/WalletPage.svelte";

  // Page routing
  let currentPage = $state('home');
  function onNavigate(page) {
    currentPage = page;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  // UI-only animation state
  let scrollY = $state(0);
  let heroVisible = $state(false);
  let featuresVisible = $state(false);
  let ctaVisible = $state(false);

  // Internal handlers (not in store - lifecycle dependent)
  let balancePollingTimer = null;
  let accountsChangedHandler = null;
  let priceTimer = null;
  let scrollTick = false;
  let chainChangeTimeout = null;

  function internalDetectProviders() {
    const detected = detectProviders();
    wallet.availableProviders = detected.map(p => ({ name: p.name, provider: p.raw }));
    if (wallet.availableProviders.length === 0) {
      wallet.availableProviders = [{ name: 'No provider detected', provider: null }];
    }
  }

  function handleScroll() {
    if (scrollTick) return;
    scrollTick = true;
    requestAnimationFrame(() => {
      scrollY = window.scrollY;
      const hero = document.querySelector('.hero-section');
      const features = document.querySelector('.features-section');
      const cta = document.querySelector('.cta-section');
      const h = window.innerHeight * 0.8;
      if (hero) { const rect = hero.getBoundingClientRect(); heroVisible = rect.top < h; }
      if (features) { const rect = features.getBoundingClientRect(); featuresVisible = rect.top < h; }
      if (cta) { const rect = cta.getBoundingClientRect(); ctaVisible = rect.top < h; }
      scrollTick = false;
    });
  }

  async function fetchNetworkInfo() {
    if (!wallet.provider) return;
    wallet.networkLoading = true;
    try {
      const network = await wallet.provider.getNetwork();
      wallet.chainId = network.chainId.toString();
      wallet.selectedNetworkId = wallet.chainId;
      wallet.selectedNetworkFamily = getNetworkFamily(wallet.chainId);
      const netInfo = getNetworkInfo(wallet.chainId);
      wallet.chainName = netInfo.name;
      wallet.blockNumber = await wallet.provider.getBlockNumber();
    } catch (err) {
      console.error('Error fetching network info:', err);
    } finally {
      wallet.networkLoading = false;
    }
  }

  async function copyAddress() {
    if (!wallet.address) return;
    const success = await copyToClipboard(wallet.address);
    if (success) {
      wallet.copied = true;
      setTimeout(() => { wallet.copied = false; }, 2000);
    }
  }

  function stopBalancePolling() {
    if (balancePollingTimer) { clearInterval(balancePollingTimer); balancePollingTimer = null; }
  }

  function startBalancePolling() {
    stopBalancePolling();
    if (!wallet.address || !wallet.provider) return;
    balancePollingTimer = setInterval(refreshBalance, 10000);
  }

  async function switchNetworkTo(chainIdKey) {
    if (!wallet.currentEthereumProvider) { wallet.error = 'No hay proveedor conectado para cambiar la red.'; return; }
    const params = networksAdd[String(chainIdKey)];
    if (!params) { wallet.error = 'Red no soportada para cambio automático.'; return; }
    const attachListeners = () => {
      wallet.currentEthereumProvider.removeListener('chainChanged', handleChainChanged);
      wallet.currentEthereumProvider.on('chainChanged', handleChainChanged);
    };
    try {
      await wallet.currentEthereumProvider.request({ method: 'wallet_switchEthereumChain', params: [{ chainId: params.chainIdHex }] });
      wallet.selectedNetworkId = String(chainIdKey);
      wallet.provider = new BrowserProvider(wallet.currentEthereumProvider);
      attachListeners();
      await fetchNetworkInfo();
      wallet.error = null;
    } catch (switchError) {
      const msg = String(switchError?.message || switchError);
      if (switchError?.code === 4902 || msg.toLowerCase().includes('4902') || msg.toLowerCase().includes('not found')) {
        try {
          await wallet.currentEthereumProvider.request({
            method: 'wallet_addEthereumChain',
            params: [{ chainId: params.chainIdHex, chainName: params.chainName, rpcUrls: params.rpcUrls, nativeCurrency: params.nativeCurrency, blockExplorerUrls: params.blockExplorerUrls }]
          });
          wallet.selectedNetworkId = String(chainIdKey);
          wallet.provider = new BrowserProvider(wallet.currentEthereumProvider);
          attachListeners();
          await fetchNetworkInfo();
          wallet.error = null;
        } catch (addErr) {
          console.error('Error adding chain:', addErr);
          const errorDetails = logNetworkAddError(addErr, chainIdKey, params);
          wallet.error = `Error agregando red: ${errorDetails.analysis}`;
        }
      } else {
        console.error('Switch network error:', switchError);
        wallet.error = switchError?.message || 'Error cambiando la red.';
      }
    }
  }

  async function removeNetworkFromWallet(chainIdKey) {
    if (!wallet.currentEthereumProvider) { wallet.error = 'No hay proveedor conectado.'; return; }
    const params = networksAdd[String(chainIdKey)];
    if (!params) { wallet.error = 'Red no soportada para eliminar.'; return; }
    try {
      await wallet.currentEthereumProvider.request({
        method: 'wallet_removeEthereumChain',
        params: [{ chainId: params.chainIdHex }]
      });
      wallet.error = null;
    } catch (err) {
      if (err?.code === -32601) {
        try {
          const pali = window['pali'];
          if (pali?.removeNetwork) {
            await pali.removeNetwork(chainIdKey);
            wallet.error = null;
            return;
          }
        } catch (e2) {}
        wallet.error = 'Pali Wallet no expone una API para eliminar redes desde la dApp. Ve a Configuración > Redes en Pali Wallet para quitarla manualmente.';
      } else {
        console.error('Error removing chain:', err);
        wallet.error = err?.message || 'Error al eliminar la red de la wallet.';
      }
    }
  }

  async function loadTxHistory() {
    if (!wallet.address || !wallet.chainId) return;
    wallet.loadingHistory = true;
    wallet.error = null;
    try {
      console.log('[TxHistory] Fetching for chain:', wallet.chainId, 'address:', wallet.address);
      const explorerTxs = await fetchTxHistoryFromExplorer(wallet.chainId, wallet.address, '');
      console.log('[TxHistory] Explorer response:', explorerTxs);
      wallet.txList = explorerTxs.map(tx => ({ ...tx, isExplorerTx: true }));
      if (explorerTxs.length === 0) {
        const apiUrl = getExplorerApiUrl(wallet.chainId);
        console.log('[TxHistory] Empty result. Explorer API URL:', apiUrl);
        if (!apiUrl) {
          wallet.error = 'No hay explorador de bloques disponible para esta red.';
        }
      }
    } catch (err) {
      console.error('[TxHistory] Error:', err);
      wallet.error = 'Error al conectar con el explorador de bloques.';
    } finally {
      wallet.loadingHistory = false;
    }
  }

  async function loadContractEvents() {
    if (!wallet.provider || !wallet.contractAddress) { wallet.contractEvents = []; return; }
    if (wallet.contractPreset !== 'transparentWallet') return;
    wallet.contractEventsLoading = true;
    try {
      const ct = new Contract(wallet.contractAddress, TRANSPARENT_WALLET_ABI, wallet.provider);
      const fromBlock = wallet.chainId === '11155111' ? 8000000 : 0;
      const [deposits, transfers] = await Promise.all([
        ct.queryFilter("Deposited", fromBlock, "latest"),
        ct.queryFilter("Transferred", fromBlock, "latest"),
      ]);
      const events = [
        ...deposits.map(d => ({ ...decodeDepositedEvent(d), type: 'deposit' })),
        ...transfers.map(t => ({ ...decodeTransferredEvent(t), type: 'transfer' })),
      ];
      events.sort((a, b) => Number(b.timestamp) - Number(a.timestamp));
      wallet.contractEvents = events;
      console.log(`[ContractEvents] Loaded ${events.length} events from contract`);
    } catch (err) {
      console.warn('[ContractEvents] Error loading events:', err);
    } finally {
      wallet.contractEventsLoading = false;
    }
  }

  function isValidAddress(addr) {
    return /^0x[a-fA-F0-9]{40}$/.test(addr);
  }

  function isValidEthereumAddress(addr) {
    return addr && /^0x[a-fA-F0-9]{40}$/.test(addr);
  }

  async function sendTransfer() {
    wallet.error = null;
    wallet.successMsg = null;
    if (!wallet.signer) { wallet.error = 'Signer no disponible. Conecta la wallet primero.'; return; }
    wallet.sending = true;
    let recipientBefore = null;
    try {
      let tx;
      if (wallet.useContract) {
        if (!wallet.contractAddress || !isValidEthereumAddress(wallet.contractAddress)) {
          wallet.error = 'Ingrese una dirección de contrato válida (0x...).'; wallet.sending = false; return;
        }
        if (wallet.contractPreset === 'transparentWallet') {
          const isDeposit = wallet.tmToAddress === '';
          if (!isDeposit) {
            if (!wallet.tmToAddress || !isValidEthereumAddress(wallet.tmToAddress)) {
              wallet.error = 'Ingrese una dirección de destino válida.'; wallet.sending = false; return;
            }
            if (!wallet.tmAmount || isNaN(Number(wallet.tmAmount)) || Number(wallet.tmAmount) <= 0) {
              wallet.error = 'Ingrese un monto válido mayor a 0.'; wallet.sending = false; return;
            }
            recipientBefore = await wallet.provider.getBalance(wallet.tmToAddress);
          }
          const contractTx = { to: wallet.contractAddress, data: isDeposit ? encodeDeposit() : encodeTransfer(wallet.tmToAddress, wallet.tmAmount) };
          if (isDeposit && wallet.contractValue) {
            contractTx.value = parseEther(String(wallet.contractValue));
          }
          tx = await wallet.signer.sendTransaction(contractTx);
        } else {
          if (!wallet.contractData) { wallet.error = 'Proporcione los datos (hex) del contrato.'; wallet.sending = false; return; }
          const contractTx = { to: wallet.contractAddress, data: wallet.contractData };
          if (wallet.contractValue) contractTx.value = parseEther(String(wallet.contractValue));
          tx = await wallet.signer.sendTransaction(contractTx);
        }
      } else {
        if (!wallet.toAddress || !isValidEthereumAddress(wallet.toAddress)) {
          wallet.error = 'Ingrese una dirección de destino válida (0x...).'; wallet.sending = false; return;
        }
        if (!wallet.sendAmount || isNaN(Number(wallet.sendAmount)) || Number(wallet.sendAmount) <= 0) {
          wallet.error = 'Ingrese un monto válido mayor a 0.'; wallet.sending = false; return;
        }
        tx = await wallet.signer.sendTransaction({ to: wallet.toAddress, value: parseEther(String(wallet.sendAmount)) });
      }
      await tx.wait();
      wallet.txHash = tx.hash;
      wallet.txList = [{ hash: wallet.txHash, to: tx.to, value: String(tx.value || 0), network: wallet.chainId, explorerUrl: getTransactionExplorerUrl(wallet.chainId, wallet.txHash), isExplorerTx: false }, ...wallet.txList];
      await refreshBalance();
      loadTxHistory();
      loadContractEvents();
      if (wallet.useContract && wallet.contractPreset === 'transparentWallet' && wallet.provider) {
        try {
          const iface = new Interface(TRANSPARENT_WALLET_ABI);
          const data = iface.encodeFunctionData("getBalance");
          const result = await wallet.provider.call({ to: wallet.contractAddress, data });
          wallet.contractBalance = formatEther(result);
        } catch (e) {
          console.warn('Error refreshing contract balance:', e);
        }
        if (recipientBefore !== null) {
          try {
            const recipientAfter = await wallet.provider.getBalance(wallet.tmToAddress);
            const diff = formatEther(recipientAfter - recipientBefore);
            wallet.successMsg = `✅ Transferencia exitosa: ${diff} ETH enviados del contrato → ${wallet.tmToAddress}`;
          } catch (e) {
            wallet.successMsg = `✅ Transferencia ejecutada. Hash: ${wallet.txHash}`;
          }
        } else {
          wallet.successMsg = `✅ Depósito exitoso: ${wallet.contractValue} ETH al contrato`;
        }
      } else if (wallet.useContract) {
        wallet.successMsg = `✅ Contrato ejecutado. Hash: ${wallet.txHash}`;
      } else {
        wallet.successMsg = `✅ Transacción enviada: ${wallet.sendAmount} ETH a ${wallet.toAddress}`;
      }
    } catch (err) {
      console.error('Error sending tx:', err);
      if (err?.code === 'ACTION_REJECTED' || err?.code === 4001) {
        wallet.error = 'Transacción rechazada por el usuario.';
      } else {
        wallet.error = err?.reason || err?.message || 'Error enviando la transacción.';
      }
    } finally {
      wallet.sending = false;
    }
  }

  async function deployContract() {
    wallet.error = null;
    wallet.successMsg = null;
    if (!wallet.signer) { wallet.error = 'Signer no disponible. Conecta la wallet primero.'; return; }
    wallet.sending = true;
    try {
      const factory = new ContractFactory(TRANSPARENT_WALLET_ABI, TRANSPARENT_WALLET_BYTECODE, wallet.signer);
      const contract = await factory.deploy();
      await contract.waitForDeployment();
      const addr = await contract.getAddress();
      wallet.contractAddress = addr;
      wallet.contractPreset = 'transparentWallet';
      wallet.useContract = true;
      wallet.successMsg = `✅ Contrato desplegado: ${addr}`;
      wallet.txHash = contract.deploymentTransaction()?.hash;
      loadContractEvents();
    } catch (err) {
      console.error('Error deploying contract:', err);
      if (err?.code === 'ACTION_REJECTED' || err?.code === 4001) {
        wallet.error = 'Despliegue rechazado por el usuario.';
      } else {
        wallet.error = err?.reason || err?.message || 'Error desplegando el contrato.';
      }
    } finally {
      wallet.sending = false;
    }
  }

  function openInExplorer() {
    openAddressInExplorer(wallet.address, wallet.chainId);
  }

  async function getSigner() {
    if (!wallet.provider) return;
    try { return await wallet.provider.getSigner(); }
    catch (err) { console.error('Error getting signer:', err); return null; }
  }

  async function refreshBalance() {
    if (!wallet.address || !wallet.provider) return;
    try {
      wallet.error = null;
      const rawBalance = await getBalanceSafe(wallet.provider, wallet.address);
      wallet.balance = formatEther(rawBalance);
    } catch (err) {
      console.error(err);
      wallet.error = err.message || 'Error al refrescar balance';
    }
  }

  async function updateEthPrice() {
    wallet.ethPriceLoading = true;
    try { wallet.ethPrice = await fetchEthPrice(); }
    finally { wallet.ethPriceLoading = false; }
  }

  async function connectWallet() {
    wallet.isConnecting = true;
    wallet.error = null;
    try {
      internalDetectProviders();
      const idx = Math.max(0, Math.min(wallet.selectedProviderIndex, wallet.availableProviders.length - 1));
      const selectedProviderData = wallet.availableProviders[idx];

      if (!selectedProviderData || !selectedProviderData.provider) {
        wallet.error = 'No se detectó ninguna billetera. Por favor instala Pali Wallet u otra billetera Web3.';
        return;
      }

      wallet.currentEthereumProvider = selectedProviderData.provider;
      const accounts = await requestAccountSelection(wallet.currentEthereumProvider);

      if (accounts && accounts.length > 0) {
        wallet.availableAccounts = accounts.map((addr, idx) => ({ address: addr, index: idx, name: `Cuenta ${idx + 1}` }));
        wallet.selectedAccountIndex = 0;
        wallet.address = accounts[0];
        wallet.provider = new BrowserProvider(wallet.currentEthereumProvider);

        const providerNetworks = await getProviderNetworks(wallet.currentEthereumProvider);
        if (providerNetworks && providerNetworks.length > 0) {
          const chainIds = providerNetworks.map(n => n.chainId);
          const currentNet = await wallet.provider.getNetwork();
          const allRelevantChainIds = [...new Set([...chainIds, currentNet.chainId.toString()])];
          wallet.availableNetworks = filterAvailableNetworks(allRelevantChainIds, networks);
          wallet.selectedNetworkId = currentNet.chainId.toString();
          wallet.selectedNetworkFamily = getNetworkFamily(wallet.selectedNetworkId);
        } else {
          if (wallet.currentEthereumProvider.isPali || (window.pali && wallet.currentEthereumProvider === window.pali.ethereum)) {
            wallet.availableNetworks = filterAvailableNetworks(['57', '5700', '57000', '57042', '57057'], networks);
            wallet.selectedNetworkFamily = 'utxo';
          } else {
            wallet.availableNetworks = networks;
            wallet.selectedNetworkFamily = 'evm';
          }
        }

        const rawBalance = await getBalanceSafe(wallet.provider, wallet.address);
        wallet.balance = formatEther(rawBalance);
        await fetchNetworkInfo();
        wallet.signer = await getSigner();
        startBalancePolling();
        loadTxHistory();
        loadContractEvents();
        updateEthPrice();

        wallet.walletVisible = false;
        requestAnimationFrame(() => { requestAnimationFrame(() => { wallet.walletVisible = true; }); });

        if (typeof wallet.currentEthereumProvider.on === 'function') {
          if (accountsChangedHandler) {
            wallet.currentEthereumProvider.removeListener('accountsChanged', accountsChangedHandler);
            wallet.currentEthereumProvider.removeListener('chainChanged', handleChainChanged);
          }
          accountsChangedHandler = (accounts) => handleAccountsChanged(accounts);
          wallet.currentEthereumProvider.on('accountsChanged', accountsChangedHandler);
          wallet.currentEthereumProvider.on('chainChanged', handleChainChanged);
        }
      } else {
        wallet.error = 'No se encontraron cuentas. Por favor crea una cuenta en tu billetera.';
      }
    } catch (err) {
      console.error('Wallet connection error:', err);
      if (err.code === 4100 || err.code === '4100') {
        wallet.error = 'Billetera bloqueada o no autorizada. Por favor desbloquea Pali Wallet y autoriza este sitio en Configuración > Trusted Sites.';
      } else if (err.code === 4001 || err.code === '4001') {
        wallet.error = 'Conexión rechazada por el usuario.';
      } else if (err.code === -32002) {
        wallet.error = 'Ya hay una solicitud de conexión pendiente. Revisa tu billetera.';
      } else if (err.code === -32603) {
        wallet.error = 'Error interno de la billetera. Intenta recargar la página.';
      } else {
        wallet.error = err.message || 'Error al conectar la billetera.';
      }
    } finally {
      wallet.isConnecting = false;
    }
  }

  function disconnectWallet() {
    if (wallet.currentEthereumProvider) {
      try {
        wallet.currentEthereumProvider.request({ method: 'wallet_revokePermissions', params: [{ eth_accounts: {} }] }).catch(() => {});
        if (accountsChangedHandler) wallet.currentEthereumProvider.removeListener('accountsChanged', accountsChangedHandler);
        wallet.currentEthereumProvider.removeListener('chainChanged', handleChainChanged);
      } catch (e) { console.error('Error removing listener:', e); }
      accountsChangedHandler = null;
    }
    wallet.address = null;
    wallet.balance = null;
    wallet.error = null;
    wallet.isConnecting = false;
    wallet.provider = null;
    wallet.currentEthereumProvider = null;
    stopBalancePolling();
    wallet.walletVisible = false;
    wallet.ethPrice = null;
  }

  async function switchAccount() {
    wallet.error = null;
    try {
      if (!wallet.currentEthereumProvider) { wallet.error = 'No hay proveedor Web3 conectado.'; return; }
      wallet.provider = new BrowserProvider(wallet.currentEthereumProvider);
      const selectedAccount = wallet.availableAccounts[wallet.selectedAccountIndex];
      if (!selectedAccount) { wallet.error = 'Cuenta seleccionada no válida.'; return; }
      if (selectedAccount.address === wallet.address) return;
      wallet.address = selectedAccount.address;
      await refreshBalance();
      wallet.signer = await getSigner();
    } catch (err) {
      console.error(err);
      wallet.error = err.message || 'Error al cambiar de cuenta.';
    }
  }

  async function refreshAccounts() {
    if (!wallet.currentEthereumProvider) return;
    wallet.refreshingAccounts = true;
    wallet.error = null;
    const startTime = Date.now();
    const provider = wallet.currentEthereumProvider;
    try {
      try {
        await provider.request({ method: 'wallet_revokePermissions', params: [{ eth_accounts: {} }] });
      } catch {}

      const accounts = await provider.request({ method: 'eth_requestAccounts' }).catch(() => null);
      if (accounts && accounts.length > 0) {
        wallet.availableAccounts = accounts.map((addr, idx) => ({ address: addr, index: idx, name: `Cuenta ${idx + 1}` }));
        wallet.selectedAccountIndex = 0;
        wallet.address = accounts[0];
        wallet.provider = new BrowserProvider(provider);
        wallet.currentEthereumProvider = provider;
        wallet.signer = await getSigner();
        await refreshBalance();
        fetchNetworkInfo();
        loadTxHistory();
        wallet.walletVisible = false;
        requestAnimationFrame(() => { requestAnimationFrame(() => { wallet.walletVisible = true; }); });
      }
    } catch (err) {
      console.error(err);
      wallet.error = err.message || 'Error al obtener cuentas de la billetera.';
    } finally {
      const elapsed = Date.now() - startTime;
      if (elapsed < 2500) await new Promise(r => setTimeout(r, 2500 - elapsed));
      wallet.refreshingAccounts = false;
    }
  }

  async function handleAccountsChanged(accounts) {
    if (!accounts || accounts.length === 0) { disconnectWallet(); return; }
    wallet.address = accounts[0];
    if (wallet.currentEthereumProvider) { wallet.provider = new BrowserProvider(wallet.currentEthereumProvider); }
    try {
      await refreshBalance();
      wallet.signer = await getSigner();
      loadTxHistory();
      fetchNetworkInfo();
    } catch (e) { console.error('Error updating on accounts changed:', e); }
  }

  function handleChainChanged(chainIdHex) {
    console.log('Network changed:', chainIdHex);
    wallet.selectedNetworkId = String(parseInt(chainIdHex, 16));
    wallet.txList = [];
    if (wallet.currentEthereumProvider) {
      wallet.provider = new BrowserProvider(wallet.currentEthereumProvider);
      if (chainChangeTimeout) clearTimeout(chainChangeTimeout);
      chainChangeTimeout = setTimeout(() => {
        fetchNetworkInfo();
        refreshBalance();
        startBalancePolling();
        loadTxHistory();
        loadContractEvents();
        chainChangeTimeout = null;
      }, 300);
    } else { window.location.reload(); }
  }

  onMount(() => {
    internalDetectProviders();
    if (wallet.availableProviders.length > 0 && wallet.availableProviders[0]?.provider) {
      wallet.currentEthereumProvider = wallet.availableProviders[0].provider;
      try {
        accountsChangedHandler = (accounts) => handleAccountsChanged(accounts);
        if (typeof wallet.currentEthereumProvider.on === 'function') {
          wallet.currentEthereumProvider.on('accountsChanged', accountsChangedHandler);
          wallet.currentEthereumProvider.on('chainChanged', handleChainChanged);
        }
      } catch (e) { console.error('Error attaching listeners:', e); }
    }
    window.addEventListener('scroll', handleScroll, { passive: true });
    setTimeout(() => { heroVisible = true; }, 100);
    handleScroll();
    return () => { window.removeEventListener('scroll', handleScroll); };
  });

  onDestroy(() => {
    stopBalancePolling();
    if (wallet.currentEthereumProvider) {
      try {
        if (accountsChangedHandler) wallet.currentEthereumProvider.removeListener('accountsChanged', accountsChangedHandler);
        wallet.currentEthereumProvider.removeListener('chainChanged', handleChainChanged);
      } catch (e) { console.error('Error removing listener on destroy:', e); }
    }
  });
</script>

<!-- Animated Background -->
<div class="fixed inset-0 pointer-events-none z-0 overflow-hidden">
  <div class="absolute -top-1/2 -left-1/2 w-[200%] h-[200%] animate-bg-float" style="background: radial-gradient(circle at 20% 80%, rgba(0, 240, 255, 0.03) 0%, transparent 40%), radial-gradient(circle at 80% 20%, rgba(184, 41, 247, 0.03) 0%, transparent 40%), radial-gradient(circle at 50% 50%, rgba(0, 255, 136, 0.02) 0%, transparent 50%);"></div>
</div>
<div class="fixed inset-0 pointer-events-none z-[1]" style="background-image: linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px); background-size: 60px 60px;"></div>

<main class="relative z-[2] w-full min-h-screen overflow-x-hidden">
  <Navbar {currentPage} {onNavigate} />

  {#if currentPage === 'home'}
    <HomePage {featuresVisible} {ctaVisible} {onNavigate} />
  {:else}
    <WalletPage
      {connectWallet}
      {disconnectWallet}
      {switchAccount}
      {switchNetworkTo}
      {copyAddress}
      {sendTransfer}
      {deployContract}
      {loadTxHistory}
      {loadContractEvents}
      {refreshAccounts}
      {internalDetectProviders}
      {removeNetworkFromWallet}
    />
  {/if}
</main>
