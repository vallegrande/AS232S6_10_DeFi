<script>
  import { wallet } from "../walletStore.svelte.js";
</script>

<div class="bg-[#0a0a0a] rounded-xl border border-white/[0.08] p-4 transition-all duration-500">
  <div class="flex items-center justify-between mb-3">
    <span class="text-[#a0a0a0] text-xs uppercase tracking-wider font-semibold">Portfolio</span>
    <span class="text-[10px] text-[#666]">1 activo</span>
  </div>
  <div class="flex items-center gap-3 py-2 px-3 rounded-lg bg-[rgba(0,240,255,0.04)] border border-[rgba(0,240,255,0.06)]">
    <div class="w-8 h-8 rounded-lg bg-[rgba(0,240,255,0.12)] flex items-center justify-center flex-shrink-0">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#00f0ff" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>
    </div>
    <div class="flex-1 min-w-0">
      <div class="flex items-center justify-between">
        <span class="text-sm font-semibold text-white">ETH</span>
        <span class="text-sm font-semibold text-white tabular-nums">{wallet.balance ? Number(wallet.balance).toFixed(4) : '0.0000'}</span>
      </div>
      <div class="flex items-center justify-between mt-0.5">
        <span class="text-[11px] text-[#666]">Ethereum</span>
        <span class="text-[11px] text-[#a0a0a0]">{wallet.ethPrice && wallet.balance ? `$${(Number(wallet.balance) * wallet.ethPrice).toFixed(2)}` : '-'}</span>
      </div>
    </div>
    <div class="w-16 h-1.5 rounded-full bg-[rgba(255,255,255,0.06)] overflow-hidden flex-shrink-0">
      <div class="h-full rounded-full bg-gradient-to-r from-[#00f0ff] to-[#b829f7]" style="width: 100%"></div>
    </div>
  </div>
</div>
