<script>
  import { wallet } from "../walletStore.svelte.js";
  import { formatTimeAgo, truncateAddress } from "../utils/helpers.js";
  import { formatEther } from "ethers";

  let { loadTxHistory } = $props();
</script>

<div class="flex items-center justify-between mb-3">
  <div class="flex items-center gap-2">
    <span class="text-[11px] uppercase tracking-[0.2em] text-[#a0a0a0] font-semibold">Historial</span>
    {#if wallet.txList.length > 0}
      <span class="text-[10px] text-[#555]">({wallet.txList.length})</span>
    {/if}
  </div>
  <button class="text-[10px] px-2.5 py-1 rounded-lg border border-white/[0.08] text-[#a0a0a0] transition-all hover:border-[#00f0ff] hover:text-[#00f0ff] disabled:opacity-50 flex items-center gap-1.5" onclick={loadTxHistory} disabled={wallet.loadingHistory}>
    <svg class="w-3 h-3" class:animate-spin={wallet.loadingHistory} viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 4v6h6M23 20v-6h-6"/><path d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 0 1 3.51 15"/></svg>
    {wallet.loadingHistory ? 'Cargando...' : 'Recargar'}
  </button>
</div>
{#if wallet.txList.length > 0}
  <div class="space-y-2">
    {#each wallet.txList as tx, i}
      <div class="rounded-xl border border-white/[0.06] bg-[#0a0a0a] p-3.5 transition-all duration-500 hover:border-white/[0.12] hover:bg-[rgba(255,255,255,0.02)]">
        <div class="flex items-center justify-between gap-3 mb-1.5">
          <div class="flex items-center gap-2.5 min-w-0 flex-1">
            <div class="w-7 h-7 rounded-lg bg-[rgba(0,240,255,0.08)] flex items-center justify-center flex-shrink-0">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#00f0ff" stroke-width="2"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>
            </div>
            <div class="min-w-0 flex-1">
              <div class="flex items-center gap-2">
                <span class="text-sm text-white font-semibold tabular-nums">{Number(formatEther(tx.value)).toFixed(4)} ETH</span>
                {#if wallet.ethPrice}
                  <span class="text-[11px] text-[#666]">(${(Number(formatEther(tx.value)) * wallet.ethPrice).toFixed(2)})</span>
                {/if}
              </div>
              <div class="flex items-center gap-2 mt-0.5">
                {#if tx.timeStamp}
                  <span class="text-[10px] text-[#555]">{formatTimeAgo(tx.timeStamp)}</span>
                  <span class="text-[#333]">·</span>
                {/if}
                <span class="text-[10px] text-[#555] font-mono">{tx.isExplorerTx ? 'explorer' : 'local'}</span>
              </div>
            </div>
          </div>
          <div class="flex items-center gap-1.5">
            <span class="text-[10px] text-[#555] font-mono">{truncateAddress(tx.hash, 6, 4)}</span>
            {#if tx.explorerUrl}
              <a href={tx.explorerUrl} target="_blank" rel="noopener noreferrer" aria-label="Ver en explorador" class="p-1 rounded hover:bg-white/[0.06] transition-colors">
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#666" stroke-width="2"><path d="M7 17l9.2-9.2M17 17V7H7"/></svg>
              </a>
            {/if}
          </div>
        </div>
      </div>
    {/each}
  </div>
{:else}
  <div class="rounded-xl border border-dashed border-white/[0.06] p-6 text-center transition-all duration-500">
    {#if wallet.loadingHistory}
      <div class="flex flex-col items-center gap-3">
        <div class="w-8 h-8 border-2 border-white/10 border-t-[#00f0ff] rounded-full animate-spin"></div>
        <p class="text-xs text-[#555]">Cargando historial de transacciones...</p>
      </div>
    {:else}
      <svg class="w-8 h-8 mx-auto mb-2 text-[#333]" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>
      <p class="text-xs text-[#555]">Aún no hay transacciones. Recarga para buscar en el explorador de bloques.</p>
    {/if}
  </div>
{/if}
