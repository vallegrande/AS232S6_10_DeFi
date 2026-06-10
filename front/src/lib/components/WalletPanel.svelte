<script>
  import { wallet } from '../walletStore.svelte.js';
  import ConnectScreen from './ConnectScreen.svelte';
  import BalanceCard from './BalanceCard.svelte';
  import PortfolioCard from './PortfolioCard.svelte';
  import NetworkInfo from './NetworkInfo.svelte';
  import NetworkSwitcher from './NetworkSwitcher.svelte';
  import AccountInfo from './AccountInfo.svelte';
  import SendForm from './SendForm.svelte';
  import TxHistory from './TxHistory.svelte';
  import ContractEvents from './ContractEvents.svelte';

  let {
    connectWallet,
    disconnectWallet,
    switchAccount,
    switchNetworkTo,
    removeNetworkFromWallet,
    copyAddress,
    sendTransfer,
    deployContract,
    loadTxHistory,
    loadContractEvents,
    refreshAccounts,
    internalDetectProviders,
  } = $props();
</script>

{#if !wallet.address}
  <div class="text-center py-12 max-w-[480px] mx-auto">
    <ConnectScreen {connectWallet} {internalDetectProviders} />
  </div>
{:else}
  <div class="transition-all duration-700 ease-out" class:opacity-0={!wallet.walletVisible} class:opacity-100={wallet.walletVisible} class:translate-y-6={!wallet.walletVisible} class:translate-y-0={wallet.walletVisible}>
    <div class="grid grid-cols-1 md:grid-cols-5 gap-4 sm:gap-6">
      <div class="md:col-span-2 space-y-3 sm:space-y-4">
        <BalanceCard />
        <PortfolioCard />
        <NetworkInfo />
        <NetworkSwitcher {switchNetworkTo} {removeNetworkFromWallet} />
        <AccountInfo {switchAccount} {copyAddress} {refreshAccounts} />
        <button class="w-full py-3 rounded-xl border border-white/[0.08] text-sm text-[#a0a0a0] font-medium transition-all hover:border-[#f87171] hover:text-[#f87171] hover:bg-[rgba(239,68,68,0.05)]" onclick={disconnectWallet}>
          Desconectar
        </button>
      </div>
      <div class="md:col-span-3 space-y-3 sm:space-y-4">
        <SendForm {sendTransfer} {deployContract} />
        <div class="bg-[#111] border border-white/[0.08] rounded-2xl p-5 transition-all duration-500">
          <TxHistory {loadTxHistory} />
        </div>
        {#if wallet.useContract && wallet.contractPreset === 'transparentWallet'}
          <div class="bg-[#111] border border-white/[0.08] rounded-2xl p-5 transition-all duration-500">
            <ContractEvents {loadContractEvents} />
          </div>
        {/if}
      </div>
    </div>
  </div>
{/if}

{#if wallet.error}
  <div class="mt-6 p-4 bg-[rgba(239,68,68,0.08)] border border-[rgba(239,68,68,0.15)] text-[#f87171] rounded-xl text-sm text-center">
    {wallet.error}
  </div>
{/if}

{#if wallet.successMsg}
  <div class="mt-4 p-4 bg-[rgba(0,255,136,0.08)] border border-[rgba(0,255,136,0.15)] text-[#00ff88] rounded-xl text-sm text-center">
    {wallet.successMsg}
  </div>
{/if}
