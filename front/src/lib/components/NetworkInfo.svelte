<script>
  import { wallet } from "../walletStore.svelte.js";
</script>

<div class="bg-[#0a0a0a] rounded-xl border border-white/[0.08] p-4 transition-all duration-500">
  <div class="flex items-center justify-between mb-2.5">
    <span class="text-[#a0a0a0] text-xs uppercase tracking-wider font-semibold">Red</span>
    <span class="flex items-center gap-2 px-2.5 py-1 rounded-full bg-[rgba(0,240,255,0.08)] border border-[rgba(0,240,255,0.12)] text-xs text-[#00f0ff] font-medium">
      <span class="w-1.5 h-1.5 rounded-full bg-[#00f0ff] animate-pulse"></span>
      {wallet.chainName || 'Cargando...'}
    </span>
  </div>
  <div class="flex items-center justify-between mb-2.5">
    <span class="text-[#a0a0a0] text-xs uppercase tracking-wider font-semibold">Chain ID</span>
    <span class="text-xs text-white font-mono">{wallet.chainId || '-'}</span>
  </div>
  <div class="flex items-center justify-between">
    <span class="text-[#a0a0a0] text-xs uppercase tracking-wider font-semibold">Bloque</span>
    <span class="flex items-center gap-1.5 text-xs text-white font-mono">
      <span class="w-1.5 h-1.5 rounded-full bg-[#00ff88] animate-pulse"></span>
      {wallet.blockNumber ? `#${wallet.blockNumber.toLocaleString()}` : '-'}
    </span>
  </div>
</div>
