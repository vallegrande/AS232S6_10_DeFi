<script>
  import { formatEther, parseEther } from "ethers";
  import { wallet } from "../walletStore.svelte.js";
  import { getTransactionExplorerUrl } from "../utils/networks.js";
  import { Interface } from "ethers";
  import { TRANSPARENT_WALLET_ABI } from "../utils/contracts.js";

  const tmInterface = new Interface(TRANSPARENT_WALLET_ABI);

  let { sendTransfer, deployContract } = $props();

  let gasLimit = $state(null);
  let gasPrice = $state(null);
  let gasLoading = $state(false);
  let gasError = $state(null);
  let debounceTimer = $state(null);
  let tmBalanceLoading = $state(false);
  let tmMode = $state('deposit');

  $effect(() => {
    if (wallet.contractAddress && wallet.contractPreset === 'transparentWallet' && wallet.provider) {
      fetchContractBalance();
    } else {
      wallet.contractBalance = null;
    }
  });

  async function fetchContractBalance() {
    if (!wallet.provider || !wallet.contractAddress || wallet.contractPreset !== 'transparentWallet') { wallet.contractBalance = null; return; }
    tmBalanceLoading = true;
    try {
      const data = tmInterface.encodeFunctionData("getBalance");
      const result = await wallet.provider.call({ to: wallet.contractAddress, data });
      wallet.contractBalance = formatEther(result);
    } catch { wallet.contractBalance = null; }
    finally { tmBalanceLoading = false; }
  }

  async function estimateGas() {
    if (!wallet.provider || !wallet.address) { gasLimit = null; gasPrice = null; return; }

    let to = '';
    if (wallet.useContract) {
      to = wallet.contractAddress;
      if (!to) { gasLimit = null; return; }
    } else {
      to = wallet.toAddress;
      if (!to) { gasLimit = null; return; }
    }

    gasLoading = true;
    gasError = null;
    try {
      const tx = { from: wallet.address, to };
      if (wallet.useContract) {
        if (wallet.contractPreset === 'transparentWallet') {
          const isDeposit = tmMode === 'deposit';
          tx.data = isDeposit ? tmInterface.encodeFunctionData("deposit") : tmInterface.encodeFunctionData("transfer", [wallet.tmToAddress, parseEther(String(wallet.tmAmount || '0'))]);
          if (isDeposit && wallet.contractValue) {
            tx.value = parseEther(String(wallet.contractValue));
          }
        } else {
          if (wallet.contractData) tx.data = wallet.contractData;
          if (wallet.contractValue) tx.value = parseEther(String(wallet.contractValue));
        }
      } else {
        if (wallet.sendAmount) tx.value = parseEther(String(wallet.sendAmount));
      }
      const [estimated, feeData] = await Promise.all([
        wallet.provider.estimateGas(tx),
        wallet.provider.getFeeData(),
      ]);
      gasLimit = estimated;
      gasPrice = feeData.gasPrice || 0n;
    } catch (err) {
      gasLimit = null;
      gasPrice = null;
      gasError = 'Estimar gas: ' + (err?.message?.substring(0, 60) || 'error');
    } finally {
      gasLoading = false;
    }
  }

  function scheduleEstimate() {
    if (debounceTimer) clearTimeout(debounceTimer);
    debounceTimer = setTimeout(estimateGas, 600);
    fetchContractBalance();
  }

  function setTmMode(mode) {
    tmMode = mode;
    if (mode === 'deposit') {
      wallet.tmToAddress = '';
      wallet.tmAmount = '';
    }
    scheduleEstimate();
  }
</script>

<div class="bg-[#111] border border-white/[0.08] rounded-2xl p-5 transition-all duration-500">
  <div class="flex items-center justify-between mb-4">
    <h3 class="font-[Space_Grotesk] text-base font-semibold text-white">Enviar Transacción</h3>
    <div class="flex bg-[#0a0a0a] rounded-lg p-0.5 border border-white/[0.06]">
      <button class="px-3 py-1.5 text-xs font-semibold rounded-md transition-all {!wallet.useContract ? 'bg-[#00f0ff] text-black' : 'text-[#666] hover:text-white'}" onclick={() => { wallet.useContract = false; scheduleEstimate(); }}>ETH</button>
      <button class="px-3 py-1.5 text-xs font-semibold rounded-md transition-all {wallet.useContract ? 'bg-[#00f0ff] text-black' : 'text-[#666] hover:text-white'}" onclick={() => { wallet.useContract = true; scheduleEstimate(); }}>Contrato</button>
    </div>
  </div>
  <div class="space-y-3">
    {#if wallet.useContract}
      <div class="flex bg-[#0a0a0a] rounded-lg p-0.5 border border-white/[0.06] mb-3">
        <button class="flex-1 px-3 py-1.5 text-xs font-semibold rounded-md transition-all {wallet.contractPreset === 'manual' ? 'bg-[#00f0ff] text-black' : 'text-[#666] hover:text-white'}" onclick={() => { wallet.contractPreset = 'manual'; scheduleEstimate(); }}>Manual</button>
        <button class="flex-1 px-3 py-1.5 text-xs font-semibold rounded-md transition-all {wallet.contractPreset === 'transparentWallet' ? 'bg-[#00f0ff] text-black' : 'text-[#666] hover:text-white'}" onclick={() => { wallet.contractPreset = 'transparentWallet'; scheduleEstimate(); }}>TransparentWallet</button>
      </div>

      <div>
        <label for="contract-address" class="text-[#a0a0a0] text-xs uppercase tracking-wider font-semibold block mb-1.5">Dirección del Contrato</label>
        <input id="contract-address" placeholder="0x..." bind:value={wallet.contractAddress} oninput={scheduleEstimate} class="w-full px-4 py-2.5 rounded-lg bg-[#0a0a0a] border border-white/[0.08] text-white text-sm focus:outline-none focus:border-[#00f0ff] placeholder:text-[#444]" />
      </div>

      {#if wallet.contractPreset === 'transparentWallet'}
        <div class="space-y-3">
          <button class="w-full py-2 rounded-lg border border-dashed border-[rgba(0,240,255,0.2)] text-xs text-[#00f0ff] font-semibold transition-all hover:border-[#00f0ff] hover:bg-[rgba(0,240,255,0.04)] disabled:opacity-50" onclick={deployContract} disabled={wallet.sending}>
            {wallet.sending ? 'Desplegando...' : '+ Desplegar nuevo TransparentWallet'}
          </button>

          <div class="flex items-center justify-between rounded-lg bg-[rgba(0,240,255,0.04)] border border-[rgba(0,240,255,0.08)] p-3 text-xs">
            <span class="text-[#a0a0a0]">Balance del contrato</span>
            {#if tmBalanceLoading}
              <span class="w-3 h-3 border-2 border-white/10 border-t-[#00f0ff] rounded-full animate-spin"></span>
            {:else if wallet.contractBalance !== null}
              <span class="text-white font-mono font-semibold">{Number(wallet.contractBalance).toFixed(6)} ETH</span>
            {:else}
              <span class="text-[#666]">---</span>
            {/if}
          </div>

          <div class="flex bg-[#0a0a0a] rounded-lg p-0.5 border border-white/[0.06]">
            <button class="flex-1 px-3 py-1.5 text-xs font-semibold rounded-md transition-all {tmMode === 'deposit' ? 'bg-[#00f0ff] text-black' : 'text-[#666] hover:text-white'}" onclick={() => setTmMode('deposit')}>Depositar</button>
            <button class="flex-1 px-3 py-1.5 text-xs font-semibold rounded-md transition-all {tmMode === 'transfer' ? 'bg-[#00f0ff] text-black' : 'text-[#666] hover:text-white'}" onclick={() => setTmMode('transfer')}>Transferir</button>
          </div>

          <div class="flex justify-center gap-1 text-[10px] text-[#555] font-mono">
            {#if tmMode === 'transfer'}
              <span class="text-[#00f0ff]">Tú (gas)</span>
              <span>→</span>
              <span class="text-[#b829f7]">Contrato</span>
              <span>→</span>
              <span class="text-[#00ff88]">Destino</span>
            {:else}
              <span class="text-[#00f0ff]">Tú</span>
              <span>→</span>
              <span class="text-[#b829f7]">Contrato</span>
            {/if}
          </div>

          <div class="h-px bg-white/[0.06]"></div>

          {#if tmMode === 'transfer'}
            <p class="text-[#a0a0a0] text-xs uppercase tracking-wider font-semibold">Transferir desde el contrato</p>
            <div>
              <label for="tm-to" class="text-[#a0a0a0] text-xs uppercase tracking-wider font-semibold block mb-1.5">Dirección Destino</label>
              <input id="tm-to" placeholder="0x..." bind:value={wallet.tmToAddress} oninput={scheduleEstimate} class="w-full px-4 py-2.5 rounded-lg bg-[#0a0a0a] border border-white/[0.08] text-white text-sm focus:outline-none focus:border-[#00f0ff] placeholder:text-[#444]" />
            </div>
            <div>
              <label for="tm-amount" class="text-[#a0a0a0] text-xs uppercase tracking-wider font-semibold block mb-1.5">Monto a transferir</label>
              <div class="relative">
                <input id="tm-amount" placeholder="0.00" bind:value={wallet.tmAmount} oninput={scheduleEstimate} class="w-full px-4 py-2.5 rounded-lg bg-[#0a0a0a] border border-white/[0.08] text-white text-sm focus:outline-none focus:border-[#00f0ff] placeholder:text-[#444]" />
                <span class="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-[#666] font-semibold">ETH</span>
              </div>
            </div>
          {:else}
            <p class="text-[#00f0ff] text-xs uppercase tracking-wider font-semibold">Depositar en el contrato</p>
            <div>
              <label for="tm-deposit-amount" class="text-[#a0a0a0] text-xs uppercase tracking-wider font-semibold block mb-1.5">Monto a depositar</label>
              <div class="relative">
                <input id="tm-deposit-amount" placeholder="0.00" bind:value={wallet.contractValue} oninput={scheduleEstimate} class="w-full px-4 py-2.5 rounded-lg bg-[#0a0a0a] border border-white/[0.08] text-white text-sm focus:outline-none focus:border-[#00f0ff] placeholder:text-[#444]" />
                <span class="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-[#666] font-semibold">ETH</span>
              </div>
            </div>
          {/if}
        </div>
      {:else}
        <div>
          <label for="contract-data" class="text-[#a0a0a0] text-xs uppercase tracking-wider font-semibold block mb-1.5">Datos (hex)</label>
          <textarea id="contract-data" placeholder="0x..." bind:value={wallet.contractData} oninput={scheduleEstimate} rows="2" class="w-full px-4 py-2.5 rounded-lg bg-[#0a0a0a] border border-white/[0.08] text-white text-sm font-mono focus:outline-none focus:border-[#00f0ff] placeholder:text-[#444] resize-none"></textarea>
        </div>
      {/if}

      {#if wallet.contractPreset === 'manual'}
        <div>
          <label for="contract-value" class="text-[#a0a0a0] text-xs uppercase tracking-wider font-semibold block mb-1.5">Valor ETH (opcional)</label>
          <div class="relative">
            <input id="contract-value" placeholder="0.00" bind:value={wallet.contractValue} oninput={scheduleEstimate} class="w-full px-4 py-2.5 rounded-lg bg-[#0a0a0a] border border-white/[0.08] text-white text-sm focus:outline-none focus:border-[#00f0ff] placeholder:text-[#444]" />
            <span class="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-[#666] font-semibold">ETH</span>
          </div>
        </div>
      {/if}
    {:else}
      <div>
        <label for="to-address" class="text-[#a0a0a0] text-xs uppercase tracking-wider font-semibold block mb-1.5">Dirección Destino</label>
        <input id="to-address" placeholder="0x..." bind:value={wallet.toAddress} oninput={scheduleEstimate} class="w-full px-4 py-2.5 rounded-lg bg-[#0a0a0a] border border-white/[0.08] text-white text-sm focus:outline-none focus:border-[#00f0ff] placeholder:text-[#444]" />
      </div>
      <div>
        <label for="send-amount" class="text-[#a0a0a0] text-xs uppercase tracking-wider font-semibold block mb-1.5">Monto</label>
        <div class="relative">
          <input id="send-amount" placeholder="0.00" bind:value={wallet.sendAmount} oninput={scheduleEstimate} class="w-full px-4 py-2.5 rounded-lg bg-[#0a0a0a] border border-white/[0.08] text-white text-sm focus:outline-none focus:border-[#00f0ff] placeholder:text-[#444]" />
          <span class="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-[#666] font-semibold">ETH</span>
        </div>
        {#if wallet.ethPrice && wallet.sendAmount}
          <div class="text-[11px] text-[#666] mt-1 text-right">
            ≈ ${(Number(wallet.sendAmount) * wallet.ethPrice).toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </div>
        {/if}
      </div>
    {/if}

    {#if wallet.address && ((!wallet.useContract && wallet.toAddress) || (wallet.useContract && wallet.contractAddress))}
      <div class="rounded-lg bg-[rgba(0,240,255,0.04)] border border-[rgba(0,240,255,0.08)] p-3 text-xs">
        {#if gasLoading}
          <div class="flex items-center gap-2 text-[#666]">
            <span class="w-3 h-3 border-2 border-white/10 border-t-[#00f0ff] rounded-full animate-spin"></span>
            Estimando gas...
          </div>
        {:else if gasLimit && gasPrice}
          {@const costWei = gasLimit * gasPrice}
          {@const costEth = Number(formatEther(costWei))}
          <div class="flex items-center justify-between gap-2">
            <span class="text-[#a0a0a0]">Gas estimado</span>
            <span class="text-white font-mono font-semibold">{Number(formatEther(gasLimit)).toFixed(0)} units</span>
          </div>
          <div class="flex items-center justify-between gap-2 mt-1">
            <span class="text-[#a0a0a0]">Precio gas</span>
            <span class="text-white font-mono">{Number(formatEther(gasPrice * 1_000_000_000n)).toFixed(2)} Gwei</span>
          </div>
          <div class="h-px bg-[rgba(255,255,255,0.06)] my-2"></div>
          <div class="flex items-center justify-between gap-2">
            <span class="text-[#a0a0a0] font-semibold">Costo total</span>
            <span class="text-[#00f0ff] font-mono font-bold">{costEth < 0.001 ? costEth.toFixed(6) : costEth.toFixed(4)} ETH</span>
          </div>
          {#if wallet.ethPrice}
            <div class="flex items-center justify-between gap-2 mt-0.5">
              <span></span>
              <span class="text-[#666]">≈ ${(costEth * wallet.ethPrice).toFixed(2)} USD</span>
            </div>
          {/if}
        {:else if gasError}
          <div class="text-[#f87171]">{gasError}</div>
        {:else}
          <div class="text-[#666]">Esperando datos para estimar gas...</div>
        {/if}
      </div>
    {/if}

    <button class="w-full gradient-bg text-black font-[Space_Grotesk] font-semibold py-2.5 rounded-xl btn-shimmer transition-all hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed text-sm" onclick={sendTransfer} disabled={wallet.sending}>
      {#if wallet.sending}
        <div class="w-4 h-4 border-2 border-black/20 border-t-black rounded-full animate-spin inline-block mr-2"></div>
        Enviando...
      {:else}
        {wallet.useContract && wallet.contractPreset === 'transparentWallet' ? (tmMode === 'transfer' ? 'Transferir desde Contrato' : 'Depositar en Contrato') : wallet.useContract ? 'Ejecutar Contrato' : 'Enviar Transacción'}
      {/if}
    </button>
  </div>

  {#if wallet.txHash}
    <div class="mt-4 rounded-xl border border-[rgba(0,240,255,0.15)] bg-[rgba(0,240,255,0.04)] p-4">
      <div class="flex items-center gap-2 mb-2">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#00ff88" stroke-width="2"><polyline points="20 6 9 17 4 12"></polyline></svg>
        <span class="text-[10px] uppercase tracking-[0.2em] text-[#a0a0a0] font-semibold">Transacción enviada</span>
      </div>
      <div class="text-xs text-white font-mono break-all mb-3">{wallet.txHash}</div>
      {#if getTransactionExplorerUrl(wallet.chainId, wallet.txHash)}
        <a class="inline-flex items-center gap-1.5 text-xs text-[#00f0ff] font-semibold hover:underline" href={getTransactionExplorerUrl(wallet.chainId, wallet.txHash)} target="_blank" rel="noopener noreferrer">
          Ver detalle en explorador
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M7 17l9.2-9.2M17 17V7H7"/></svg>
        </a>
      {/if}
    </div>
  {/if}
</div>
