<script>
  import { wallet } from "../walletStore.svelte.js";
</script>

<div class="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[rgba(0,240,255,0.15)] to-[rgba(184,41,247,0.1)] border border-[rgba(0,240,255,0.2)] p-6 transition-all duration-500">
  <div class="absolute top-0 right-0 w-40 h-40 bg-[#00f0ff]/5 rounded-full -translate-y-1/2 translate-x-1/4 blur-3xl"></div>
  <div class="absolute bottom-0 left-0 w-24 h-24 bg-[#b829f7]/5 rounded-full translate-y-1/2 -translate-x-1/4 blur-2xl"></div>
  <div class="relative">
    <div class="flex items-center justify-between mb-3">
      <span class="text-[#a0a0a0] text-xs uppercase tracking-[0.2em] font-semibold">Balance Total</span>
      {#if wallet.networkLoading}
        <span class="w-4 h-4 border-2 border-white/10 border-t-[#00f0ff] rounded-full animate-spin"></span>
      {:else if wallet.blockNumber}
        <span class="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-[rgba(0,240,255,0.06)] text-[10px] text-[#00f0ff]">
          <span class="w-1 h-1 rounded-full bg-[#00f0ff] animate-pulse"></span>
          #{wallet.blockNumber}
        </span>
      {/if}
    </div>
    <div class="font-[Space_Grotesk] text-[clamp(2rem,4vw,3rem)] font-bold text-white flex items-baseline gap-2 mb-1 leading-none">
      <span class="tabular-nums">{wallet.balance ? Number(wallet.balance).toFixed(4) : '0.0000'}</span>
      <span class="text-[#00f0ff] text-lg font-semibold">ETH</span>
    </div>
    {#if wallet.ethPrice && wallet.balance}
      <div class="text-sm text-[#a0a0a0] mt-1">
        ≈ ${(Number(wallet.balance) * wallet.ethPrice).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} USD
      </div>
    {:else if wallet.ethPriceLoading}
      <div class="text-xs text-[#666] mt-1 animate-pulse">Cargando precio...</div>
    {/if}
    <div class="mt-4 h-px bg-gradient-to-r from-[#00f0ff]/40 via-[#b829f7]/40 to-[#00ff88]/40 rounded-full"></div>
  </div>
</div>
