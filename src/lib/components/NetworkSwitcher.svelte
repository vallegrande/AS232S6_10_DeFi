<script>
  import { wallet } from "../walletStore.svelte.js";
  import { networks, filterNetworksByFamily } from "../utils/networks.js";

  let { switchNetworkTo, removeNetworkFromWallet } = $props();
</script>

<div class="bg-[#0a0a0a] rounded-xl border border-white/[0.08] p-4 transition-all duration-500">
  <p class="text-[#a0a0a0] text-xs uppercase tracking-wider font-semibold mb-3">Cambiar Red</p>
  <div class="flex gap-2 mb-3">
    <button class="flex-1 py-2 rounded-lg text-xs font-semibold border transition-all {wallet.selectedNetworkFamily === 'utxo' ? 'bg-[rgba(0,240,255,0.12)] border-[#00f0ff] text-[#00f0ff]' : 'bg-transparent border-white/[0.08] text-[#a0a0a0] hover:border-white/20'}" onclick={() => { wallet.selectedNetworkFamily = 'utxo'; wallet.selectedNetworkId = Object.keys(filterNetworksByFamily(wallet.availableNetworks, 'utxo'))[0] || wallet.selectedNetworkId; }}>
      Syscoin / zkSYS
    </button>
    <button class="flex-1 py-2 rounded-lg text-xs font-semibold border transition-all {wallet.selectedNetworkFamily === 'evm' ? 'bg-[rgba(0,240,255,0.12)] border-[#00f0ff] text-[#00f0ff]' : 'bg-transparent border-white/[0.08] text-[#a0a0a0] hover:border-white/20'}" onclick={() => { wallet.selectedNetworkFamily = 'evm'; wallet.selectedNetworkId = Object.keys(filterNetworksByFamily(wallet.availableNetworks, 'evm'))[0] || wallet.selectedNetworkId; }}>
      EVM
    </button>
  </div>
  <div class="flex gap-2">
    <select class="flex-1 px-3 py-2 rounded-lg bg-[#111] border border-white/[0.08] text-white text-sm focus:outline-none focus:border-[#00f0ff]" bind:value={wallet.selectedNetworkId}>
      <option value="">Seleccionar...</option>
      {#each Object.entries(filterNetworksByFamily(wallet.availableNetworks, wallet.selectedNetworkFamily)) as [id, net]}
        <option value={id}>{net.name}</option>
      {/each}
    </select>
    <button class="px-4 py-2 bg-[#00f0ff]/10 border border-[#00f0ff]/30 text-[#00f0ff] rounded-lg text-sm font-semibold transition-all hover:bg-[#00f0ff]/20 disabled:opacity-40" onclick={() => { if(wallet.selectedNetworkId) switchNetworkTo(wallet.selectedNetworkId); }} disabled={!wallet.selectedNetworkId}>
      Ir
    </button>
    <button class="px-4 py-2 bg-[rgba(239,68,68,0.1)] border border-[rgba(239,68,68,0.3)] text-[#f87171] rounded-lg text-sm font-semibold transition-all hover:bg-[rgba(239,68,68,0.2)] disabled:opacity-40" onclick={() => { if(wallet.selectedNetworkId) removeNetworkFromWallet(wallet.selectedNetworkId); }} disabled={!wallet.selectedNetworkId}>
      Quitar
    </button>
  </div>
</div>
