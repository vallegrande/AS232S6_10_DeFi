<script>
  import { wallet } from "../walletStore.svelte.js";

  let { connectWallet, internalDetectProviders } = $props();
</script>

{#if wallet.availableProviders.length > 0}
  <div class="mb-8">
    <p class="text-[#a0a0a0] text-sm uppercase tracking-wider font-semibold mb-4">Proveedor de Billetera Detectado</p>
    <div class="flex flex-col gap-3">
      {#each wallet.availableProviders as p, idx}
        <button
          class="w-full px-6 py-4 rounded-2xl flex items-center justify-between transition-all duration-300 border {wallet.selectedProviderIndex === idx ? 'bg-[rgba(0,240,255,0.1)] border-[#00f0ff] shadow-[0_0_30px_rgba(0,240,255,0.2)]' : 'bg-[#111] border-white/[0.08] hover:border-white/20'}"
          onclick={() => wallet.selectedProviderIndex = idx}
        >
          <div class="flex items-center gap-4">
            <div class="w-10 h-10 rounded-xl gradient-bg flex items-center justify-center shadow-lg">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2"><rect x="2" y="5" width="20" height="14" rx="2" /><circle cx="12" cy="12" r="3" /></svg>
            </div>
            <div class="text-left">
              <div class="font-bold text-white text-lg leading-tight">Billetera Web3</div>
              <div class="text-[#666] text-xs uppercase tracking-widest mt-0.5">EIP-1193 Compatible</div>
            </div>
          </div>
          {#if wallet.selectedProviderIndex === idx}
            <div class="flex items-center gap-2">
              <span class="text-[#00f0ff] text-xs font-bold uppercase">Seleccionado</span>
              <div class="w-2.5 h-2.5 rounded-full bg-[#00f0ff] animate-pulse"></div>
            </div>
          {/if}
        </button>
      {/each}
    </div>
  </div>
{:else}
  <div class="mb-8 p-6 bg-[rgba(239,68,68,0.05)] border border-[rgba(239,68,68,0.2)] rounded-2xl text-[#f87171]">
    <p class="font-semibold mb-2">No se detectaron proveedores Web3</p>
    <p class="text-xs opacity-80">Por favor, instala Pali Wallet para continuar.</p>
    <button class="mt-4 text-xs underline hover:text-white transition-colors" onclick={internalDetectProviders}>Re-detectar billeteras</button>
  </div>
{/if}

<button class="gradient-bg text-black font-[Space_Grotesk] font-semibold px-10 py-4 rounded-xl btn-shimmer transition-all hover:-translate-y-1 hover:shadow-[0_20px_40px_rgba(0,240,255,0.3)] disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center justify-center gap-3 w-full" onclick={connectWallet} disabled={wallet.isConnecting}>
  {#if wallet.isConnecting}
    <div class="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
    <span>Confirma en tu Billetera...</span>
  {:else}
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 12V8H6a2 2 0 0 1-2-2c0-1.1.9-2 2-2h12v4"/><path d="M20 12v4H4a2 2 0 0 1-2-2V6"/><path d="M20 12h2"/></svg>
    Conectar Billetera
  {/if}
</button>
