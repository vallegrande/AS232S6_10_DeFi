<script>
  import WalletPanel from "../components/WalletPanel.svelte";

  let {
    connectWallet, disconnectWallet, switchAccount, switchNetworkTo, removeNetworkFromWallet,
    copyAddress, sendTransfer, deployContract, loadTxHistory, loadContractEvents, refreshAccounts, internalDetectProviders,
  } = $props();
</script>

<div class="py-24 px-4 sm:px-8 max-w-[1200px] mx-auto">
  <div class="bg-[rgba(17,17,17,0.8)] border border-white/[0.08] rounded-3xl p-6 sm:p-8 md:p-12 backdrop-blur-xl">
    <div class="text-center mb-8 sm:mb-10">
      <h2 class="font-[Space_Grotesk] text-2xl sm:text-3xl font-bold text-white mb-2">Panel de Billetera</h2>
      <p class="text-[#a0a0a0] text-sm sm:text-base">Conecta tu billetera para empezar a gestionar tus activos</p>
    </div>
    <WalletPanel
      {connectWallet}
      {disconnectWallet}
      {switchAccount}
      {switchNetworkTo}
      {removeNetworkFromWallet}
      {copyAddress}
      {sendTransfer}
      {deployContract}
      {loadTxHistory}
      {loadContractEvents}
      {refreshAccounts}
      {internalDetectProviders}
    />
  </div>
</div>
