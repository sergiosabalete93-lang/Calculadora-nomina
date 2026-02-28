/* ==========================================================================
   CONFIGURACIÓN DE GOOGLE ADS (AdMob)
   ========================================================================== */

// IDs de prueba de Google (Sustituir por tus IDs reales de AdMob antes de compilar)
const AD_UNITS = {
    banner: 'ca-app-pub-3940256099942544/6300978111',       // Banner ID
    interstitial: 'ca-app-pub-3940256099942544/1033173712' // Interstitial ID
};

/* 1. INICIALIZACIÓN DE ADS */
document.addEventListener('DOMContentLoaded', () => {
    // Si no es PRO, cargamos el banner superior
    if (!appState.isPro) {
        initBannerAd();
    }
});

/* 2. LÓGICA DEL BANNER */
function initBannerAd() {
    const bannerContainer = document.getElementById('ad-banner-top');
    if (!bannerContainer) return;

    // Simulación visual del banner para desarrollo
    bannerContainer.innerHTML = `
        <div style="width: 100%; height: 50px; background: #333; color: #fff; 
             display: flex; align-items: center; justify-content: center; font-size: 10px;">
            AD BANNER PLACEHOLDER - ${AD_UNITS.banner}
        </div>
    `;
    
    // NOTA: Al compilar con Capacitor y el plugin de AdMob, 
    // aquí irá la llamada nativa: AdMob.showBanner(options);
}

/* 3. LÓGICA DEL ANUNCIO INTERSTICIAL (Pantalla Completa) */
function showInterstitialAd(callback) {
    console.log("Cargando anuncio intersticial...");
    
    // Simulamos carga y visualización (2 segundos)
    // En la App real, esto disparará el plugin nativo de AdMob
    const loader = document.getElementById('results-loader');
    loader.innerHTML += '<p style="font-size:10px">Publicidad...</p>';

    setTimeout(() => {
        console.log("Anuncio mostrado y cerrado");
        if (callback) callback(); // Volvemos a la lógica de la app tras el anuncio
    }, 2000); 
}

/* 4. RECOMPENSAS (Opcional para el futuro) */
function showRewardedAd() {
    // Espacio para anuncios que dan puntos o funciones PRO temporales
}
