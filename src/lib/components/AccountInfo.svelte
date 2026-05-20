<script>
  import { wallet } from "../walletStore.svelte.js";

  let { switchAccount, copyAddress, refreshAccounts } = $props();
</script>

<div class="bg-[#0a0a0a] rounded-xl border border-white/[0.08] p-4 transition-all duration-500">
  <div class="flex items-center gap-3 mb-4">
    <div class="w-10 h-10 rounded-full gradient-bg flex items-center justify-center flex-shrink-0">
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
    </div>
    <div class="min-w-0 flex-1">
      <div class="text-xs text-[#a0a0a0] mb-0.5">Cuenta</div>
      <div class="text-sm text-white font-mono truncate">
        {wallet.address.substring(0, 8)}...{wallet.address.substring(wallet.address.length - 6)}
      </div>
    </div>
    <button class="p-2 rounded-lg transition-all hover:bg-white/[0.06]" onclick={copyAddress} title="Copiar dirección">
      {#if wallet.copied}
        <svg width="16" height="16" fill="none" stroke="#00ff88" stroke-width="2" viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"></polyline></svg>
      {:else}
        <svg width="16" height="16" fill="none" stroke="#666" stroke-width="2" viewBox="0 0 24 24"><rect x="9" y="9" width="13" height="13" rx="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
      {/if}
    </button>
  </div>
  <label for="account-select" class="text-[#a0a0a0] text-xs uppercase tracking-wider font-semibold block mb-2">Cambiar Cuenta</label>
  <div class="flex gap-2">
    <select id="account-select" class="flex-1 px-3 py-2 rounded-lg bg-[#111] border border-white/[0.08] text-white text-sm focus:outline-none focus:border-[#00f0ff]" bind:value={wallet.selectedAccountIndex} onchange={() => switchAccount()}>
      {#each wallet.availableAccounts as account, idx}
        <option value={idx}>{account.name} ({account.address.substring(0, 6)}...{account.address.substring(account.address.length - 4)})</option>
      {/each}
    </select>
    <button class="px-3 py-2 rounded-lg bg-[rgba(0,240,255,0.08)] border border-[rgba(0,240,255,0.2)] text-[#00f0ff] transition-all hover:bg-[rgba(0,240,255,0.15)] disabled:opacity-40 flex items-center gap-1.5 text-xs font-semibold" onclick={refreshAccounts} disabled={wallet.refreshingAccounts} title="Agregar o cambiar cuentas">
      {#if wallet.refreshingAccounts}
        <div class="w-3.5 h-3.5 border-2 border-[#00f0ff]/30 border-t-[#00f0ff] rounded-full animate-spin"></div>
      {:else}
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="8.5" cy="7" r="4"/><line x1="20" y1="8" x2="20" y2="14"/><line x1="23" y1="11" x2="17" y2="11"/></svg>
        Agregar
      {/if}
    </button>
  </div>
</div>
