<script>
  import { wallet } from "../walletStore.svelte.js";
  import CreditChecker from "../CreditChecker.svelte";
  import FaucetSection from "../FaucetSection.svelte";

  let { featuresVisible, ctaVisible, onNavigate } = $props();
</script>

<!-- Hero -->
<section class="hero-section min-h-screen flex flex-col justify-center items-center text-center px-4 sm:px-8 pt-32 pb-16 relative">
  <div class="absolute inset-0 overflow-hidden pointer-events-none">
    <div class="absolute w-[200px] sm:w-[300px] h-[200px] sm:h-[300px] rounded-full blur-[80px] opacity-40 animate-float bg-[#00f0ff] top-[20%] left-[10%]"></div>
    <div class="absolute w-[250px] sm:w-[400px] h-[250px] sm:h-[400px] rounded-full blur-[80px] opacity-40 animate-float bg-[#b829f7] bottom-[20%] right-[10%] delay-500"></div>
    <div class="absolute w-[150px] sm:w-[250px] h-[150px] sm:h-[250px] rounded-full blur-[80px] opacity-40 animate-float bg-[#00ff88] top-[50%] left-[50%] delay-1000"></div>
  </div>
  <div class="inline-flex items-center gap-2 px-4 py-2 bg-[rgba(0,240,255,0.1)] border border-[rgba(0,240,255,0.2)] rounded-full text-xs sm:text-sm text-[#00f0ff] mb-8 animate-fade-in-up delay-100">
    <div class="w-1.5 h-1.5 bg-[#00f0ff] rounded-full animate-pulse-slow"></div>
    <span>Listo para Web3</span>
  </div>
  <h1 class="font-[Space_Grotesk] text-[clamp(2.5rem,8vw,6rem)] font-bold leading-tight mb-6 gradient-text animate-fade-in-up delay-200">
    El Futuro del <span class="gradient-text-accent">DeFi</span>
  </h1>
  <p class="text-[clamp(1rem,2.5vw,1.35rem)] text-[#a0a0a0] max-w-[600px] leading-relaxed mb-12 animate-fade-in-up delay-300 px-4">
    Conecta tu billetera, gestiona activos y ejecuta transacciones en múltiples cadenas EVM con una interfaz futurista y fluida.
  </p>
  <div class="flex flex-col sm:flex-row gap-4 animate-fade-in-up delay-400 w-full sm:w-auto px-4 sm:px-0">
    <button class="gradient-bg text-black font-[Space_Grotesk] font-semibold px-10 py-4 rounded-xl btn-shimmer transition-all hover:-translate-y-1 hover:shadow-[0_20px_40px_rgba(0,240,255,0.3)]" onclick={() => onNavigate('wallet')}>Comenzar</button>
    <button class="bg-transparent border border-white/[0.08] text-white font-[Space_Grotesk] font-semibold px-10 py-4 rounded-xl transition-all hover:border-[#00f0ff] hover:bg-[rgba(0,240,255,0.05)] hover:-translate-y-1" onclick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}>Saber Más</button>
  </div>
</section>

<!-- Features -->
<section id="features" class="features-section py-24 sm:py-32 px-4 sm:px-8 max-w-[1400px] mx-auto">
  <div class="text-center mb-16 sm:mb-20 scroll-reveal" class:visible={featuresVisible}>
    <span class="inline-block px-4 py-1.5 bg-[rgba(184,41,247,0.1)] border border-[rgba(184,41,247,0.2)] rounded-full text-xs font-semibold text-[#b829f7] uppercase tracking-wider mb-4">Características</span>
    <h2 class="font-[Space_Grotesk] text-[clamp(1.8rem,5vw,3.5rem)] font-bold text-white">Todo lo que Necesitas</h2>
  </div>
  <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-8">
    {#each [
      { icon: 'shield', title: 'Soporte Multi-Cadena', desc: 'Conecta con Ethereum, Polygon, BSC y otras cadenas EVM. Cambia de red automáticamente con detección de redes.', color: '#00f0ff' },
      { icon: 'zap', title: 'Transacciones Instantáneas', desc: 'Envía ETH y tokens con estimación de gas optimizada. Ejecuta llamadas a contratos con soporte de datos personalizados.', color: '#00f0ff' },
      { icon: 'lock', title: 'Seguro por Diseño', desc: 'Tus claves permanecen en tu billetera. Nunca almacenamos datos privados. Transparencia total con verificación blockchain.', color: '#00f0ff' },
      { icon: 'clock', title: 'Balance en Tiempo Real', desc: 'Rastrea tu portafolio con actualizaciones en vivo. Visualiza el historial de transacciones y monitorea el estado de la red al instante.', color: '#00f0ff' }
    ] as feature}
      <div class="bg-[rgba(17,17,17,0.8)] border border-white/[0.08] rounded-3xl p-8 sm:p-10 relative overflow-hidden backdrop-blur-xl transition-all duration-400 hover:border-[rgba(0,240,255,0.3)] hover:-translate-y-2 hover:shadow-[0_30px_60px_rgba(0,0,0,0.4)] group scroll-reveal stagger-{feature.index + 1}" class:visible={featuresVisible}>
        <div class="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#00f0ff] to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
        <div class="w-[52px] sm:w-[60px] h-[52px] sm:h-[60px] bg-[rgba(0,240,255,0.1)] rounded-2xl flex items-center justify-center mb-6 transition-all group-hover:bg-[rgba(0,240,255,0.2)] group-hover:scale-110">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#00f0ff" stroke-width="2">
            {#if feature.icon === 'shield'}<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
            {:else if feature.icon === 'zap'}<path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/>
            {:else if feature.icon === 'lock'}<rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
            {:else}<circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/>{/if}
          </svg>
        </div>
        <h3 class="font-[Space_Grotesk] text-lg sm:text-xl font-semibold text-white mb-3">{feature.title}</h3>
        <p class="text-[#a0a0a0] text-sm sm:text-base leading-relaxed">{feature.desc}</p>
      </div>
    {/each}
  </div>
</section>

<!-- Developer -->
<section id="developer" class="py-24 px-4 sm:px-8 max-w-[1200px] mx-auto">
  <div class="bg-[rgba(17,17,17,0.8)] border border-white/[0.08] rounded-3xl p-8 sm:p-12 backdrop-blur-xl scroll-reveal" class:visible={featuresVisible}>
    <div class="text-center mb-10">
      <span class="inline-block px-4 py-1.5 bg-[rgba(0,255,136,0.1)] border border-[rgba(0,255,136,0.2)] rounded-full text-xs font-semibold text-[#00ff88] uppercase tracking-wider mb-4">Equipo</span>
      <h2 class="font-[Space_Grotesk] text-2xl sm:text-3xl font-bold text-white">Sobre el Desarrollador</h2>
    </div>
    <div class="flex flex-col md:flex-row items-center gap-10 max-w-[800px] mx-auto">
      <div class="relative">
        <div class="w-32 h-32 sm:w-40 sm:h-40 rounded-2xl gradient-bg p-1">
          <img src="/perfil.jpeg" alt="Developer" class="w-full h-full rounded-2xl object-cover" />
        </div>
        <div class="absolute -bottom-2 -right-2 w-8 h-8 sm:w-10 sm:h-10 bg-[#00ff88] rounded-full flex items-center justify-center">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#000" stroke-width="2"><polyline points="20 6 9 17 4 12"></polyline></svg>
        </div>
      </div>
      <div class="text-center md:text-left">
        <h3 class="font-[Space_Grotesk] text-xl sm:text-2xl font-bold text-white mb-2">Desarrollador Web3 Full-Stack</h3>
        <p class="text-[#00f0ff] font-medium mb-4">Especialista en Blockchain & Arquitecto de DApps</p>
        <p class="text-[#a0a0a0] text-sm sm:text-base leading-relaxed mb-6">
          Apasionado por construir aplicaciones descentralizadas que conectan las finanzas tradicionales con Web3. Especializado en cadenas compatibles con EVM, integración de contratos inteligentes, y creación de experiencias de usuario intuitivas para billeteras crypto.
        </p>
        <div class="flex flex-wrap gap-3 justify-center md:justify-start">
          <span class="px-3 py-1 bg-[rgba(0,240,255,0.1)] border border-[rgba(0,240,255,0.2)] rounded-full text-xs text-[#00f0ff]">Solidity</span>
          <span class="px-3 py-1 bg-[rgba(184,41,247,0.1)] border border-[rgba(184,41,247,0.2)] rounded-full text-xs text-[#b829f7]">Svelte</span>
          <span class="px-3 py-1 bg-[rgba(0,255,136,0.1)] border border-[rgba(0,255,136,0.2)] rounded-full text-xs text-[#00ff88]">Ethers.js</span>
          <span class="px-3 py-1 bg-[rgba(255,193,7,0.1)] border border-[rgba(255,193,7,0.2)] rounded-full text-xs text-[#ffc107]">Tailwind</span>
        </div>
      </div>
    </div>
  </div>
</section>

<CreditChecker walletAddress={wallet.address ?? ''} />

<FaucetSection />

<!-- CTA -->
<section class="cta-section py-24 sm:py-32 px-4 sm:px-8">
  <div class="max-w-[1000px] mx-auto bg-gradient-to-br from-[rgba(0,240,255,0.05)] to-[rgba(184,41,247,0.05)] border border-white/[0.08] rounded-[32px] p-10 sm:p-16 text-center relative overflow-hidden backdrop-blur-xl scroll-reveal" class:visible={ctaVisible}>
    <div class="absolute -top-1/2 -left-1/2 w-[200%] h-[200%] cta-glow pointer-events-none"></div>
    <div class="relative z-10">
      <h2 class="font-[Space_Grotesk] text-[clamp(1.8rem,5vw,3rem)] font-bold text-white mb-4">¿Listo para Entrar a Web3?</h2>
      <p class="text-[#a0a0a0] text-base sm:text-lg max-w-[500px] mx-auto mb-10 leading-relaxed">Únete a miles de usuarios que ya gestionan sus activos crypto con Pali.</p>
      <button class="gradient-bg text-black font-[Space_Grotesk] font-semibold text-base sm:text-lg px-10 sm:px-12 py-4 rounded-xl btn-shimmer transition-all hover:-translate-y-1 hover:shadow-[0_20px_40px_rgba(0,240,255,0.3)]" onclick={() => onNavigate('wallet')}>Iniciar App</button>
    </div>
  </div>
</section>

<!-- Footer -->
<footer class="py-12 sm:py-16 px-4 sm:px-8 border-t border-white/[0.08] mt-16">
  <div class="max-w-[1400px] mx-auto flex flex-col sm:flex-row justify-between items-center gap-6 sm:gap-8">
    <div class="flex items-center gap-4">
      <div class="w-8 h-8 gradient-bg rounded-lg flex items-center justify-center">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2"><path d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
      </div>
      <span class="text-[#666] text-xs sm:text-sm">2026 Pali dApp. Todos los derechos reservados.</span>
    </div>
    <div class="flex gap-6 sm:gap-8">
      <a href="https://docs.pali.com" target="_blank" rel="noopener noreferrer" class="text-[#a0a0a0] text-xs sm:text-sm transition-colors hover:text-[#00f0ff]">Documentación</a>
      <a href="https://github.com/pali" target="_blank" rel="noopener noreferrer" class="text-[#a0a0a0] text-xs sm:text-sm transition-colors hover:text-[#00f0ff]">GitHub</a>
      <a href="https://support.pali.com" target="_blank" rel="noopener noreferrer" class="text-[#a0a0a0] text-xs sm:text-sm transition-colors hover:text-[#00f0ff]">Soporte</a>
    </div>
  </div>
</footer>
