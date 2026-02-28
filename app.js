/* ==========================================================================
   1. ESTADO GLOBAL DE LA APLICACIÓN
   ========================================================================== */
const appState = {
    isPro: false,
    country: 'spain',  // 'spain', 'uk', 'italy', 'portugal'
    mode: 'annual',    // 'annual', 'monthly', 'hourly', 'dismissal', 'inverse'
    language: 'es',    // 'es', 'en', 'it', 'pt'
    adClickCount: 0    // Contador para la lógica de anuncios (1 sí, 2 no...)
};

/* ==========================================================================
   2. SELECCIÓN DE ELEMENTOS DEL DOM (UI Básica)
   ========================================================================== */
const DOM = {
    // Menú de Ajustes
    btnSettings: document.getElementById('btn-settings'),
    settingsMenu: document.getElementById('settings-menu'),
    btnCloseSettings: document.getElementById('btn-close-settings'),
    themeToggle: document.getElementById('theme-toggle'),
    langSelect: document.getElementById('lang-select'),
    appTitles: document.querySelectorAll('.app-title'),
    
    // Botones de Navegación
    countryBtns: document.querySelectorAll('.btn-country'),
    modeBtns: document.querySelectorAll('.btn-mode'),
    countryModules: document.querySelectorAll('.country-module'),
    calcForms: document.querySelectorAll('.calc-form'),
    
    // Resultados y Botón Principal
    btnCalculate: document.getElementById('btn-calculate'),
    resultsSection: document.getElementById('results-section'),
    resultsList: document.getElementById('results-list'),
    netResultValue: document.getElementById('net-result-value'),
    resultsLoader: document.getElementById('results-loader'),
    resultsContent: document.getElementById('results-content')
};

/* ==========================================================================
   3. INICIALIZACIÓN Y EVENTOS DE INTERFAZ
   ========================================================================== */
document.addEventListener('DOMContentLoaded', () => {
    initUIEvents();
    registerServiceWorker();
});

function initUIEvents() {
    // Abrir / Cerrar Menú de Ajustes
    DOM.btnSettings.addEventListener('click', () => {
        DOM.settingsMenu.classList.add('open');
    });
    
    DOM.btnCloseSettings.addEventListener('click', () => {
        DOM.settingsMenu.classList.remove('open');
    });

    // Cambio de Tema (Claro / Oscuro)
    DOM.themeToggle.addEventListener('change', (e) => {
        if (e.target.checked) {
            document.body.classList.replace('theme-light', 'theme-dark');
        } else {
            document.body.classList.replace('theme-dark', 'theme-light');
        }
    });

    // Cambio de Idioma (Cabecera)
    DOM.langSelect.addEventListener('change', (e) => {
        appState.language = e.target.value;
        DOM.appTitles.forEach(title => title.classList.add('hidden'));
        document.getElementById(`title-${appState.language}`).classList.remove('hidden');
    });
}

/* ==========================================================================
   4. REGISTRO DEL SERVICE WORKER (PWA)
   ========================================================================== */
function registerServiceWorker() {
    if ('serviceWorker' in navigator) {
        window.addEventListener('load', () => {
            navigator.serviceWorker.register('sw.js')
                .then(reg => console.log('SW registrado con éxito.', reg.scope))
                .catch(err => console.error('Error al registrar SW:', err));
        });
    }
}
/* ==========================================================================
   5. LÓGICA DE NAVEGACIÓN: SELECCIÓN DE PAÍS
   ========================================================================== */
DOM.countryBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
        // Ignorar si el botón está deshabilitado (Próximamente)
        if (btn.classList.contains('disabled')) return;

        // Quitar clase activa de todos los botones y módulos
        DOM.countryBtns.forEach(b => b.classList.remove('active'));
        DOM.countryModules.forEach(m => m.classList.add('hidden'));

        // Activar el seleccionado
        btn.classList.add('active');
        appState.country = btn.id.replace('btn-', ''); // 'spain', 'uk', etc.

        // Mostrar el módulo correspondiente
        const targetModule = document.getElementById(`module-${appState.country}`);
        if (targetModule) {
            targetModule.classList.remove('hidden');
        }

        // Reiniciar el modo por defecto al cambiar de país
        resetToDefaultMode();
        hideResults();
    });
});

/* ==========================================================================
   6. LÓGICA DE NAVEGACIÓN: SELECCIÓN DE MODO (Anual, Mensual, etc.)
   ========================================================================== */
DOM.modeBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
        // Validación de funciones PRO (Si hace clic en despido/inverso y no es pro)
        if (btn.classList.contains('pro-feature') && !appState.isPro) {
            alert("Esta función es exclusiva de la versión PRO.");
            // Aquí en el futuro abriremos el modal de compra
            return; 
        }

        // Quitar clase activa de todos los botones de modo
        DOM.modeBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        
        appState.mode = btn.id.replace('btn-mode-', ''); // 'annual', 'monthly', etc.

        // Ocultar todos los formularios de cálculo
        DOM.calcForms.forEach(f => f.classList.add('hidden'));

        // Construir el ID del formulario objetivo (ej: 'spain-annual' o 'uk-monthly')
        const targetFormId = `${appState.country}-${appState.mode}`;
        const targetForm = document.getElementById(targetFormId);
        
        if (targetForm) {
            targetForm.classList.remove('hidden');
        }

        hideResults();
    });
});

function resetToDefaultMode() {
    // Simular un clic en el modo Anual
    const defaultModeBtn = document.getElementById('btn-mode-annual');
    if (defaultModeBtn) defaultModeBtn.click();
}

function hideResults() {
    DOM.resultsSection.classList.add('hidden');
    DOM.resultsList.innerHTML = '';
    DOM.netResultValue.textContent = '0.00';
}

/* ==========================================================================
   7. LÓGICA DEL BOTÓN CALCULAR Y GESTIÓN DE ANUNCIOS
   ========================================================================== */
DOM.btnCalculate.addEventListener('click', () => {
    appState.adClickCount++; // Incrementar contador de clics
    
    // Preparar UI para calcular
    DOM.resultsSection.classList.remove('hidden');
    DOM.resultsContent.classList.add('hidden');
    DOM.resultsLoader.classList.remove('hidden');

    // Lógica de anuncios intercalados: 1 sí, 2 no, 3 sí... (impares sí, pares no)
    // Y verificamos que NO sea usuario PRO (los PRO no ven anuncios)
    const shouldShowAd = (appState.adClickCount % 2 !== 0) && (!appState.isPro);

    if (shouldShowAd && typeof showInterstitialAd === 'function') {
        // showInterstitialAd estará definido en ads-engine.js
        showInterstitialAd(() => {
            // Callback: Se ejecuta cuando el anuncio termina o se cierra
            processCalculation();
        });
    } else {
        // Simular un pequeño tiempo de cálculo si no hay anuncio
        setTimeout(processCalculation, 600);
    }
});

function processCalculation() {
    // Ocultar loader y mostrar resultados
    DOM.resultsLoader.classList.add('hidden');
    DOM.resultsContent.classList.remove('hidden');

    // Limpiar resultados anteriores
    DOM.resultsList.innerHTML = '';

    // Enrutar al motor de cálculo adecuado según país y modo
    if (appState.country === 'spain') {
        calculateSpain(appState.mode);
    } else if (appState.country === 'uk') {
        calculateUK(appState.mode);
    }
}
/* ==========================================================================
   8. MOTOR DE CÁLCULO: ESPAÑA
   ========================================================================== */
function calculateSpain(mode) {
    let gross = 0;
    let net = 0;
    let irpfPerc = parseFloat(document.getElementById('sp-irpf-manual').value) || 0;
    const ssPerc = 6.35; // % Seguridad Social trabajador estándar España (promedio)

    switch (mode) {
        case 'annual':
            gross = parseFloat(document.getElementById('sp-annual-gross').value) || 0;
            const pagas = parseInt(document.getElementById('sp-annual-months').value);
            
            // Si no hay IRPF manual, estimación simple por tramos
            if (irpfPerc === 0) irpfPerc = estimateSpainIRPF(gross);
            
            let ssAmount = gross * (ssPerc / 100);
            let irpfAmount = gross * (irpfPerc / 100);
            net = gross - ssAmount - irpfAmount;

            renderResult("Bruto Anual", gross.toFixed(2) + "€");
            renderResult("Seguridad Social (6.35%)", "-" + ssAmount.toFixed(2) + "€");
            renderResult("IRPF Aplicado (" + irpfPerc + "%)", "-" + irpfAmount.toFixed(2) + "€");
            if (pagas === 14) {
                renderResult("Paga Neta (x14 pagas)", (net / 14).toFixed(2) + "€");
            } else {
                renderResult("Paga Neta (x12 pagas)", (net / 12).toFixed(2) + "€");
            }
            break;

        case 'monthly':
            let monthlyGross = parseFloat(document.getElementById('sp-monthly-gross').value) || 0;
            const isProrated = document.getElementById('sp-monthly-prorated').checked;
            
            // Si está prorrateada, el bruto ya incluye la parte de las extras
            gross = isProrated ? monthlyGross : monthlyGross * 1.16; // Aprox 1/6 más si no prorratea
            
            if (irpfPerc === 0) irpfPerc = estimateSpainIRPF(gross * 12);
            
            let mSS = monthlyGross * (ssPerc / 100);
            let mIRPF = monthlyGross * (irpfPerc / 100);
            net = monthlyGross - mSS - mIRPF;

            renderResult("Bruto Mensual", monthlyGross.toFixed(2) + "€");
            renderResult("IRPF Mensual", "-" + mIRPF.toFixed(2) + "€");
            renderResult("Seg. Social", "-" + mSS.toFixed(2) + "€");
            if (isProrated) renderResult("Nota", "Incluye prorrata de pagas extras");
            break;

        case 'hourly':
            const price = parseFloat(document.getElementById('sp-hourly-price').value) || 0;
            const hours = parseFloat(document.getElementById('sp-hourly-hours').value) || 0;
            const days = parseFloat(document.getElementById('sp-hourly-days').value) || 0;
            
            gross = price * hours * days;
            if (irpfPerc === 0) irpfPerc = 2; // IRPF mínimo común en contratos por horas/temporales
            
            let hSS = gross * (ssPerc / 100);
            let hIRPF = gross * (irpfPerc / 100);
            net = gross - hSS - hIRPF;

            renderResult("Total Bruto", gross.toFixed(2) + "€");
            renderResult("IRPF (Retención)", "-" + hIRPF.toFixed(2) + "€");
            renderResult("Seg. Social", "-" + hSS.toFixed(2) + "€");
            break;

        case 'dismissal':
            // Lógica PRO: Despido
            const years = parseFloat(document.getElementById('sp-dismissal-years').value) || 0;
            const type = document.getElementById('sp-dismissal-type').value;
            const dailySalary = (parseFloat(document.getElementById('sp-annual-gross').value) || 0) / 365;
            
            let daysPerYear = (type === 'objective') ? 20 : 33;
            let compensation = dailySalary * daysPerYear * years;
            
            // El despido hasta ciertos límites está exento de IRPF, aquí simplificamos bruto
            renderResult("Días por año", daysPerYear);
            renderResult("Indemnización Bruta", compensation.toFixed(2) + "€");
            net = compensation; // Simplificado para el ejemplo
            break;
    }

    // Lógica para añadir Extras PRO si existen y el usuario es PRO
    if (appState.isPro) {
        applyProCalculationsSpain();
    }

    // Mostrar el Neto final en grande
    DOM.netResultValue.textContent = net.toFixed(2) + "€";
}

/* ==========================================================================
   9. UTILIDADES DE RENDERIZADO Y CÁLCULO
   ========================================================================== */
function renderResult(label, value) {
    const div = document.createElement('div');
    div.className = 'result-item';
    div.innerHTML = `<span>${label}:</span> <span class="result-value">${value}</span>`;
    DOM.resultsList.appendChild(div);
}

function estimateSpainIRPF(annualGross) {
    if (annualGross <= 12450) return 19;
    if (annualGross <= 20200) return 24;
    if (annualGross <= 35200) return 30;
    if (annualGross <= 60000) return 37;
    return 45;
}
/* ==========================================================================
   10. MOTOR DE CÁLCULO: REINO UNIDO (UK)
   ========================================================================== */
function calculateUK(mode) {
    let gross = 0;
    let net = 0;
    const personalAllowance = 12570; // Estándar 2024/25

    switch (mode) {
        case 'annual':
            gross = parseFloat(document.getElementById('uk-annual-gross').value) || 0;
            let tax = calculateUKTax(gross, personalAllowance);
            let ni = calculateUKNI(gross);
            net = gross - tax - ni;

            renderResult("Gross Annual", "£" + gross.toFixed(2));
            renderResult("Income Tax", "-£" + tax.toFixed(2));
            renderResult("National Insurance", "-£" + ni.toFixed(2));
            renderResult("Monthly Net", "£" + (net / 12).toFixed(2));
            break;

        case 'monthly':
            let monthlyGross = parseFloat(document.getElementById('uk-monthly-gross').value) || 0;
            let period = parseInt(document.getElementById('uk-pay-period').value) || 1;
            
            gross = monthlyGross * 12; // Anualizado para el cálculo de tax
            let mTax = calculateUKTax(gross, personalAllowance) / 12;
            let mNI = calculateUKNI(gross) / 12;
            net = monthlyGross - mTax - mNI;

            renderResult("Monthly Gross", "£" + monthlyGross.toFixed(2));
            renderResult("Tax (Period " + period + ")", "-£" + mTax.toFixed(2));
            renderResult("NI (Class 1)", "-£" + mNI.toFixed(2));
            break;

        case 'hourly':
            const rate = parseFloat(document.getElementById('uk-hourly-rate').value) || 0;
            const hWeek = parseFloat(document.getElementById('uk-hourly-hours').value) || 0;
            const dWeek = parseFloat(document.getElementById('uk-hourly-days').value) || 1;
            
            let weeklyGross = rate * hWeek * dWeek;
            gross = weeklyGross * 52;
            let hTax = calculateUKTax(gross, personalAllowance) / 52;
            let hNI = calculateUKNI(gross) / 52;
            net = weeklyGross - hTax - hNI;

            renderResult("Weekly Gross", "£" + weeklyGross.toFixed(2));
            renderResult("Tax (Weekly)", "-£" + hTax.toFixed(2));
            renderResult("NI (Weekly)", "-£" + hNI.toFixed(2));
            break;
    }

    if (appState.isPro) applyProCalculationsUK();
    DOM.netResultValue.textContent = "£" + net.toFixed(2);
}

function calculateUKTax(annualGross, allowance) {
    let taxable = Math.max(0, annualGross - allowance);
    let tax = 0;
    if (taxable > 0) {
        if (taxable <= 37700) tax = taxable * 0.20;
        else if (taxable <= 125140) tax = (37700 * 0.20) + ((taxable - 37700) * 0.40);
        else tax = (37700 * 0.20) + ((125140 - 37700) * 0.40) + ((taxable - 125140) * 0.45);
    }
    return tax;
}

function calculateUKNI(annualGross) {
    // Aproximación NI 2024/25 (8% sobre el umbral principal)
    const threshold = 12570;
    if (annualGross <= threshold) return 0;
    return (annualGross - threshold) * 0.08;
}

/* ==========================================================================
   11. MODO INVERSO (Simulación rápida)
   ========================================================================== */
// El modo inverso calcula cuánto bruto necesitas para un neto deseado
function calculateInverse(targetNet) {
    // Lógica de aproximación (Brute force ligero)
    let estimateGross = targetNet * 1.30; 
    renderResult("Cálculo Inverso", "Estimando Bruto...");
    return estimateGross;
}

/* ==========================================================================
   12. FUNCIONES PRO Y AJUSTES
   ========================================================================== */
function applyProCalculationsSpain() {
    const extraVal = parseFloat(document.getElementById('sp-pro-extras-val').value) || 0;
    const extraMul = parseFloat(document.getElementById('sp-pro-extras-mul').value) || 1;
    const kmVal = parseFloat(document.getElementById('sp-pro-km-val').value) || 0;
    const kmTotal = parseFloat(document.getElementById('sp-pro-km-total').value) || 0;

    if (extraVal > 0) renderResult("Extras/Bonus", "+" + (extraVal * extraMul).toFixed(2) + "€");
    if (kmVal > 0) renderResult("Kilometraje", "+" + (kmVal * kmTotal).toFixed(2) + "€");
}

// BOTÓN HACERSE PRO (Simulación para este chat)
document.getElementById('btn-become-pro').addEventListener('click', () => {
    // Aquí irá la lógica de Google Play Billing
    const email = document.getElementById('auth-email').value;
    if (!email) {
        alert("Introduce un email para iniciar el proceso PRO");
        return;
    }
    activateProMode(email);
});

function activateProMode(email) {
    appState.isPro = true;
    document.body.classList.add('is-pro');
    document.getElementById('pro-upgrade-container').classList.add('hidden');
    document.getElementById('pro-settings-container').classList.remove('hidden');
    document.getElementById('btn-settings').innerHTML = "⚙️ PRO"; 
    alert("¡Payroll Pro activado para: " + email + "!");
}
// REPARACIÓN MANUAL DEL BOTÓN AJUSTES
document.getElementById('btn-settings').addEventListener('click', () => {
    // Ocultamos todas las pantallas primero
    document.querySelectorAll('.screen').forEach(s => s.classList.add('hidden'));
    // Mostramos la de ajustes
    document.getElementById('settings-screen').classList.remove('hidden');
    // Marcamos el botón como activo si quieres
    console.log("Cambiando a pantalla de ajustes...");
});
