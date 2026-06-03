<script>
  import { wallet } from "../walletStore.svelte.js";
  import { formatEther } from "ethers";
  import { truncateAddress } from "../utils/helpers.js";

  let { loadContractEvents } = $props();

  function timeAgo(ts) {
    const now = Math.floor(Date.now() / 1000);
    const diff = now - Number(ts);
    if (diff < 60) return 'hace segundos';
    if (diff < 3600) return `hace ${Math.floor(diff / 60)} min`;
    if (diff < 86400) return `hace ${Math.floor(diff / 3600)} h`;
    return `hace ${Math.floor(diff / 86400)} d`;
  }
</script>

<div class="flex items-center justify-between mb-3">
  <div class="flex items-center gap-2">
    <span class="text-[11px] uppercase tracking-[0.2em] text-[#a0a0a0] font-semibold">Eventos del Contrato</span>
    {#if wallet.contractEvents.length > 0}
      <span class="text-[10px] text-[#555]">({wallet.contractEvents.length})</span>
    {/if}
  </div>
  <button class="text-[10px] px-2.5 py-1 rounded-lg border border-white/[0.08] text-[#a0a0a0] transition-all hover:border-[#00f0ff] hover:text-[#00f0ff] disabled:opacity-50 flex items-center gap-1.5" onclick={loadContractEvents} disabled={wallet.contractEventsLoading}>
    <svg class="w-3 h-3" class:animate-spin={wallet.contractEventsLoading} viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 4v6h6M23 20v-6h-6"/><path d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 0 1 3.51 15"/></svg>
    {wallet.contractEventsLoading ? 'Cargando...' : 'Recargar'}
  </button>
</div>

{#if wallet.contractEvents.length > 0}
  <div class="space-y-2">
    {#each wallet.contractEvents as ev, i}
      <div class="rounded-xl border border-white/[0.06] bg-[#0a0a0a] p-3.5 transition-all duration-500 hover:border-white/[0.12] hover:bg-[rgba(255,255,255,0.02)]">
        <div class="flex items-center justify-between gap-3 mb-1.5">
          <div class="flex items-center gap-2.5 min-w-0 flex-1">
            {#if ev.type === 'transfer'}
              <div class="w-7 h-7 rounded-lg bg-[rgba(0,255,136,0.08)] flex items-center justify-center flex-shrink-0">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#00ff88" stroke-width="2"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>
              </div>
            {:else}
              <div class="w-7 h-7 rounded-lg bg-[rgba(0,240,255,0.08)] flex items-center justify-center flex-shrink-0">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#00f0ff" stroke-width="2"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>
              </div>
            {/if}
            <div class="min-w-0 flex-1">
              <div class="flex items-center gap-2">
                {#if ev.type === 'transfer'}
                  <span class="text-[10px] text-[#00ff88] uppercase tracking-wider font-semibold">Transferencia</span>
                  <span class="text-sm text-white font-semibold tabular-nums">{Number(formatEther(ev.amount)).toFixed(6)} ETH</span>
                {:else}
                  <span class="text-[10px] text-[#00f0ff] uppercase tracking-wider font-semibold">Depósito</span>
                  <span class="text-sm text-white font-semibold tabular-nums">{Number(formatEther(ev.amount)).toFixed(6)} ETH</span>
                {/if}
              </div>
              <div class="flex items-center flex-wrap gap-x-2 gap-y-0.5 mt-1">
                {#if ev.type === 'transfer'}
                  <span class="text-[10px] text-[#a0a0a0]">
                    <span class="text-[#b829f7]">Contrato</span>
                    <span class="text-[#666] mx-1">→</span>
                    <span class="text-[#00ff88]">{truncateAddress(ev.to, 6, 4)}</span>
                  </span>
                {:else}
                  <span class="text-[10px] text-[#a0a0a0]">
                    {truncateAddress(ev.from, 6, 4)}
                    <span class="text-[#666] mx-1">→</span>
                    <span class="text-[#b829f7]">Contrato</span>
                  </span>
                {/if}
              </div>
              <div class="flex items-center gap-2 mt-0.5">
                <span class="text-[10px] text-[#555]">{timeAgo(ev.timestamp)}</span>
                {#if ev.type === 'transfer'}
                  <span class="text-[#333]">·</span>
                  <span class="text-[9px] text-[#555] font-mono">gas: {truncateAddress(ev.caller, 4, 3)}</span>
                {/if}
              </div>
            </div>
          </div>
          {#if ev.transactionHash}
            <a href="https://sepolia.etherscan.io/tx/{ev.transactionHash}" target="_blank" rel="noopener noreferrer" class="p-1 rounded hover:bg-white/[0.06] transition-colors" aria-label="Ver en explorador">
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#666" stroke-width="2"><path d="M7 17l9.2-9.2M17 17V7H7"/></svg>
            </a>
          {/if}
        </div>
      </div>
    {/each}
  </div>
{:else if !wallet.contractEventsLoading}
  <div class="rounded-xl border border-dashed border-white/[0.06] p-6 text-center transition-all duration-500">
    <svg class="w-8 h-8 mx-auto mb-2 text-[#333]" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>
    <p class="text-xs text-[#555]">Aún no hay eventos del contrato. Deposita o transfiere para verlos aquí.</p>
  </div>
{/if}
