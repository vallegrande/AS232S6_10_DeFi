<script>
  import { queryCreditAcrossNetworks, ALL_NETWORKS } from './creditQuery.js';

  let { walletAddress = '' } = $props();

  let addressInput = $state('');
  let selectedNetworkId = $state(ALL_NETWORKS[0]?.id ?? '');
  let results = $state([]);
  let loading = $state(false);
  let error = $state(null);
  let checked = $state(false);
  let dropdownOpen = $state(false);
  let dropdownEl = $state(null);

  let selectedNetwork = $derived(ALL_NETWORKS.find(n => n.id === selectedNetworkId));

  $effect(() => {
    addressInput = walletAddress;
  });

  function closeOnOutside(e) {
    if (dropdownOpen && dropdownEl && !dropdownEl.contains(e.target)) {
      dropdownOpen = false;
    }
  }

  $effect(() => {
    if (dropdownOpen) {
      document.addEventListener('click', closeOnOutside, true);
      return () => document.removeEventListener('click', closeOnOutside, true);
    }
  });

  function selectNetwork(id) {
    selectedNetworkId = id;
    dropdownOpen = false;
  }

  async function check() {
    loading = true;
    error = null;
    checked = false;
    results = [];

    try {
      results = await queryCreditAcrossNetworks(addressInput, [selectedNetworkId]);
      checked = true;
    } catch (err) {
      error = err.message || 'Error al consultar crédito';
    } finally {
      loading = false;
    }
  }

  async function checkAll() {
    loading = true;
    error = null;
    checked = false;
    results = [];

    try {
      results = await queryCreditAcrossNetworks(addressInput, ALL_NETWORKS.map(n => n.id));
      checked = true;
    } catch (err) {
      error = err.message || 'Error al consultar crédito';
    } finally {
      loading = false;
    }
  }

  function formatAmount(value) {
    if (value === 0) return '0.0000';
    return value.toFixed(4);
  }
</script>

<section id="credit-checker" class="py-24 sm:py-32 px-4 sm:px-8 max-w-[1200px] mx-auto">
  <div class="bg-[rgba(17,17,17,0.8)] border border-white/[0.08] rounded-3xl p-8 sm:p-12 backdrop-blur-xl">
    <div class="text-center mb-10">
      <span class="inline-block px-4 py-1.5 bg-[rgba(0,240,255,0.1)] border border-[rgba(0,240,255,0.2)] rounded-full text-xs font-semibold text-[#00f0ff] uppercase tracking-wider mb-4">
        Credit Checker
      </span>
      <h2 class="font-[Space_Grotesk] text-[clamp(1.8rem,5vw,3rem)] font-bold text-white">
        Consulta de Crédito Multi-Red
      </h2>
      <p class="text-[#a0a0a0] text-base sm:text-lg max-w-[500px] mx-auto mt-4 leading-relaxed">
        Selecciona las redes y luego ingresa una dirección para consultar su balance y crédito disponible.
      </p>
    </div>

    <div class="max-w-[700px] mx-auto">
      <div class="mb-6" bind:this={dropdownEl}>
        <span class="text-sm text-[#a0a0a0] font-medium block mb-2">Red a consultar</span>
        <button
          class="w-full flex items-center justify-between bg-[#050505] border border-white/[0.1] rounded-xl px-5 py-3.5 text-sm text-white outline-none transition-all hover:border-[#00f0ff]/40 disabled:opacity-50"
          onclick={() => dropdownOpen = !dropdownOpen}
          disabled={loading}
        >
          <span class="flex items-center gap-2">
            {#if selectedNetwork}
              <span class="w-2.5 h-2.5 rounded-full" style="background: {selectedNetwork.color};"></span>
              <span>{selectedNetwork.name}</span>
            {/if}
          </span>
          <svg
            class="w-4 h-4 text-[#666] transition-transform"
            class:rotate-180={dropdownOpen}
            xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
          ><polyline points="6 9 12 15 18 9"/></svg>
        </button>

        {#if dropdownOpen}
          <div class="mt-1 bg-[#111] border border-white/[0.1] rounded-xl overflow-hidden shadow-2xl">
            <div class="max-h-60 overflow-y-auto p-1">
              {#each ALL_NETWORKS as net}
                <button
                  class="flex items-center gap-3 w-full px-3 py-2 rounded-lg transition-all text-left"
                  style={net.id === selectedNetworkId
                    ? 'background: {net.color}15; color: {net.color};'
                    : 'color: #a0a0a0;'}
                  onclick={() => selectNetwork(net.id)}
                >
                  <span class="w-2.5 h-2.5 rounded-full flex-shrink-0" style="background: {net.color};"></span>
                  <span class="text-sm font-medium flex-1">{net.name}</span>
                  <span class="text-xs" style="color: {net.id === selectedNetworkId ? net.color : '#555'};">{net.currency}</span>
                </button>
              {/each}
            </div>
          </div>
        {/if}
      </div>

      <div class="flex flex-col sm:flex-row gap-3 mb-8">
        <input
          type="text"
          class="flex-1 bg-[#050505] border border-white/[0.1] rounded-xl px-5 py-3.5 font-mono text-sm text-white outline-none transition-all focus:border-[#00f0ff] focus:shadow-[0_0_0_3px_rgba(0,240,255,0.1)]"
          placeholder="0x..."
          bind:value={addressInput}
          disabled={loading}
        />
        <button
          class="gradient-bg text-black font-[Space_Grotesk] font-semibold px-6 py-3.5 rounded-xl btn-shimmer transition-all hover:-translate-y-0.5 whitespace-nowrap flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0"
          onclick={check}
          disabled={loading || !addressInput || !selectedNetworkId}
        >
          {#if loading}
            <div class="w-4 h-4 border-2 border-black/20 border-t-black rounded-full animate-spin"></div>
            Consultando...
          {:else}
            Consultar
          {/if}
        </button>
        <button
          class="bg-transparent border border-[#00f0ff]/40 text-[#00f0ff] font-[Space_Grotesk] font-semibold px-6 py-3.5 rounded-xl transition-all hover:-translate-y-0.5 hover:bg-[rgba(0,240,255,0.05)] whitespace-nowrap flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0"
          onclick={checkAll}
          disabled={loading || !addressInput}
        >
          {#if loading}
            <div class="w-4 h-4 border-2 border-[#00f0ff]/20 border-t-[#00f0ff] rounded-full animate-spin"></div>
            Consultando...
          {:else}
            Consultar todos
          {/if}
        </button>
        {#if results.length > 0}
          <button
            class="bg-transparent border border-white/[0.15] text-[#a0a0a0] font-[Space_Grotesk] font-semibold px-6 py-3.5 rounded-xl transition-all hover:-translate-y-0.5 hover:bg-white/[0.03] hover:text-white whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0"
            onclick={() => { results = []; checked = false; error = null; }}
            disabled={loading}
          >
            Limpiar
          </button>
        {/if}
      </div>

      {#if error}
        <div class="p-4 bg-[rgba(239,68,68,0.1)] border border-[rgba(239,68,68,0.2)] rounded-xl text-[#f87171] text-sm mb-6">
          {error}
        </div>
      {/if}

      {#if results.length > 0}
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {#each results as net}
            <div
              class="bg-[rgba(17,17,17,0.6)] border rounded-2xl overflow-hidden transition-all hover:-translate-y-0.5"
              style="border-color: {net.color}30;"
            >
              <div class="flex items-center gap-3 px-5 py-4 border-b border-white/[0.06]">
                <div
                  class="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
                  style="background: {net.color}20; color: {net.color};"
                >
                  {net.network.charAt(0)}
                </div>
                <span class="font-[Space_Grotesk] font-semibold text-sm text-white flex-1">{net.network}</span>
                {#if net.success}
                  <div class="w-2 h-2 rounded-full bg-[#00ff88] shadow-[0_0_6px_rgba(0,255,136,0.4)]"></div>
                {:else}
                  <div class="w-2 h-2 rounded-full bg-[#ef4444] shadow-[0_0_6px_rgba(239,68,68,0.4)]"></div>
                {/if}
              </div>

              <div class="px-5 py-4">
                {#if net.success}
                  <div class="flex justify-between items-center py-2">
                    <span class="text-[#a0a0a0] text-xs">Balance</span>
                    <span class="font-[Space_Grotesk] font-semibold text-sm text-white">
                      {formatAmount(net.balance)} <span class="text-[#666] text-xs font-normal">{net.currency}</span>
                    </span>
                  </div>
                  <div class="flex justify-between items-center py-2 border-t border-white/[0.06]">
                    <span class="text-[#a0a0a0] text-xs">Crédito disponible</span>
                    <span class="font-[Space_Grotesk] font-semibold text-sm text-[#00ff88]">
                      {formatAmount(net.creditLimit)} <span class="text-[#00ff88]/60 text-xs font-normal">{net.currency}</span>
                    </span>
                  </div>
                  <div class="flex justify-between items-center pt-3 mt-2 border-t border-white/[0.06]">
                    <span class="text-[#555] text-xs">Bloque #{net.blockNumber?.toLocaleString()}</span>
                    <a
                      href="{net.explorer}/address/{addressInput}"
                      target="_blank"
                      rel="noreferrer"
                      class="text-[#00f0ff] text-xs font-semibold hover:underline"
                    >
                      Explorer ↗
                    </a>
                  </div>
                {:else}
                  <div class="flex items-center gap-2 text-[#f87171] text-xs py-2">
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/>
                    </svg>
                    {net.error}
                  </div>
                {/if}
              </div>
            </div>
          {/each}
        </div>

        {#if checked}
          <p class="text-center text-[#555] text-xs mt-6">
            El crédito se calcula como el 70% del balance nativo (simulación LTV).
          </p>
        {/if}
      {/if}
    </div>
  </div>
</section>
