<script>
  import { onMount } from 'svelte';

  const API_URL = 'http://localhost:3001/faucet';

  let addressInput = $state('');
  let amountInput = $state('0.001');
  let status = $state(null);
  let loading = $state(false);
  let txHash = $state(null);
  let faucetAddress = $state('');
  let lastRequest = $state(0);

  onMount(async () => {
    try {
      const res = await fetch(`${API_URL}/status`);
      const data = await res.json();
      faucetAddress = data.faucetAddress;
    } catch {}
  });

  async function requestFunds() {
    if (!/^0x[a-fA-F0-9]{40}$/.test(addressInput)) {
      status = 'error';
      return;
    }

    const now = Date.now();
    if (now - lastRequest < 30000) {
      status = 'cooldown';
      return;
    }

    const amount = parseFloat(amountInput);
    if (isNaN(amount) || amount < 0.001 || amount > 0.01) {
      status = 'invalid-amount';
      return;
    }

    loading = true;
    status = null;
    txHash = null;

    try {
      const res = await fetch(`${API_URL}/request`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ to: addressInput, amount }),
      });

      const data = await res.json();

      if (data.success) {
        txHash = data.txHash;
        status = 'success';
        lastRequest = Date.now();
      } else {
        status = 'error';
        console.error(data.error);
      }
    } catch (err) {
      console.error(err);
      status = 'server-error';
    } finally {
      loading = false;
    }
  }
</script>

<section id="faucet" class="py-24 sm:py-32 px-4 sm:px-8 max-w-[1200px] mx-auto">
  <div class="bg-[rgba(17,17,17,0.8)] border border-white/[0.08] rounded-3xl p-8 sm:p-12 backdrop-blur-xl">
    <div class="text-center mb-10">
      <span class="inline-block px-4 py-1.5 bg-[rgba(0,255,136,0.1)] border border-[rgba(0,255,136,0.2)] rounded-full text-xs font-semibold text-[#00ff88] uppercase tracking-wider mb-4">
        Faucet
      </span>
      <h2 class="font-[Space_Grotesk] text-[clamp(1.8rem,5vw,3rem)] font-bold text-white">
        Solicitar ETH de Prueba
      </h2>
      <p class="text-[#a0a0a0] text-base sm:text-lg max-w-[500px] mx-auto mt-4 leading-relaxed">
        Recibe ETH de prueba en Sepolia sin conectar tu wallet.
      </p>
    </div>

    <div class="max-w-[500px] mx-auto">
      <div class="space-y-4">
        <div>
          <span class="text-sm text-[#a0a0a0] font-medium block mb-2">Dirección destino</span>
          <input
            type="text"
            class="w-full bg-[#050505] border border-white/[0.1] rounded-xl px-5 py-3.5 font-mono text-sm text-white outline-none transition-all focus:border-[#00ff88] focus:shadow-[0_0_0_3px_rgba(0,255,136,0.1)]"
            placeholder="0x..."
            bind:value={addressInput}
            disabled={loading}
          />
        </div>

        <div>
          <span class="text-sm text-[#a0a0a0] font-medium block mb-2">Cantidad</span>
          <div class="w-full bg-[#050505] border border-white/[0.1] rounded-xl px-5 py-3.5 font-mono text-sm text-[#666] flex items-center gap-2">
            <span class="text-white font-semibold">{amountInput}</span>
            <span>ETH</span>
          </div>
        </div>

        <button
          class="w-full gradient-bg text-black font-[Space_Grotesk] font-semibold px-8 py-4 rounded-xl btn-shimmer transition-all hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 flex items-center justify-center gap-2"
          onclick={requestFunds}
          disabled={loading || !addressInput}
        >
          {#if loading}
            <div class="w-4 h-4 border-2 border-black/20 border-t-black rounded-full animate-spin"></div>
            Enviando...
          {:else}
            Solicitar Fondos
          {/if}
        </button>
      </div>

      {#if status === 'error'}
        <div class="mt-4 p-4 bg-[rgba(239,68,68,0.1)] border border-[rgba(239,68,68,0.2)] rounded-xl text-[#f87171] text-sm">Dirección inválida o error en el servidor.</div>
      {/if}

      {#if status === 'server-error'}
        <div class="mt-4 p-4 bg-[rgba(239,68,68,0.1)] border border-[rgba(239,68,68,0.2)] rounded-xl text-[#f87171] text-sm">No se pudo conectar con el servidor faucet. Asegurate de que el backend esté corriendo.</div>
      {/if}

      {#if status === 'invalid-amount'}
        <div class="mt-4 p-4 bg-[rgba(239,68,68,0.1)] border border-[rgba(239,68,68,0.2)] rounded-xl text-[#f87171] text-sm">Monto inválido. Debe ser entre 0.001 y 0.01 ETH.</div>
      {/if}

      {#if status === 'cooldown'}
        <div class="mt-4 p-4 bg-[rgba(255,193,7,0.1)] border border-[rgba(255,193,7,0.2)] rounded-xl text-[#fbbf24] text-sm">Esperá 30 segundos antes de otro request.</div>
      {/if}

      {#if status === 'success' && txHash}
        <div class="mt-4 p-4 bg-[rgba(0,255,136,0.1)] border border-[rgba(0,255,136,0.2)] rounded-xl text-[#00ff88] text-sm">
          <span class="font-semibold">Fondos enviados!</span>
          <br />
          <a href="https://sepolia.etherscan.io/tx/{txHash}" target="_blank" rel="noreferrer" class="text-[#00f0ff] hover:underline">Ver transacción en Etherscan ↗</a>
        </div>
      {/if}

      <div class="mt-8 p-4 bg-[rgba(255,255,255,0.03)] border border-white/[0.06] rounded-xl">
        <p class="text-[#a0a0a0] text-xs mb-2 font-medium">Estado del faucet</p>
        <div class="space-y-1.5 text-xs text-[#555]">
          <p>
            <span class="text-[#666]">Wallet faucet (gas):</span>
            <span class="font-mono text-white/60 ml-1">{faucetAddress || 'Cargando...'}</span>
          </p>
          <p>
            <span class="text-[#666]">Contrato:</span>
            <span class="font-mono text-white/60 ml-1">0x5E7D4159abb284199Cc9c6EE5261Dd5255DD2E51</span>
          </p>
        </div>
        {#if !faucetAddress}
          <p class="text-[#fbbf24] text-xs mt-3">Backend no disponible. Ejecutá <code class="bg-white/10 px-1 rounded">cd backend && npm run dev</code></p>
        {/if}
      </div>
    </div>
  </div>
</section>
