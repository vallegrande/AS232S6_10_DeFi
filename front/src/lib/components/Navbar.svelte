<script>
  import { wallet } from "../walletStore.svelte.js";

  let { currentPage, onNavigate } = $props();
</script>

<nav class="fixed top-0 left-0 right-0 z-30 px-4 sm:px-8 py-6 flex justify-between items-center backdrop-blur-xl border-b border-white/[0.08]">
  <button class="flex items-center gap-3 font-[Space_Grotesk] font-bold text-xl sm:text-2xl text-white" onclick={() => onNavigate('home')}>
    <div class="w-9 h-9 sm:w-10 sm:h-10 gradient-bg rounded-xl flex items-center justify-center animate-logo-pulse">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2"><path d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
    </div>
    <span class="hidden xs:inline">Pali</span>
  </button>
  <div class="flex items-center gap-4 sm:gap-8">
    <button class="hidden sm:inline text-[#a0a0a0] text-sm font-medium hover:text-white transition-colors {currentPage === 'home' ? 'text-white' : ''}" onclick={() => onNavigate('home')}>Inicio</button>
    <button class="hidden sm:inline text-[#a0a0a0] text-sm font-medium hover:text-white transition-colors" onclick={() => onNavigate('wallet')}>Billetera</button>
    <button class="gradient-bg text-black font-[Space_Grotesk] font-semibold px-4 sm:px-6 py-2.5 rounded-xl text-xs sm:text-sm btn-shimmer transition-all hover:-translate-y-[3px] hover:shadow-[0_20px_40px_rgba(0,240,255,0.3)]" onclick={() => onNavigate('wallet')}>
      {wallet.address ? 'Conectado' : 'Conectar'}
    </button>
  </div>
</nav>
