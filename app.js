/* ==========================================================================
   1. ESTADO GLOBAL Y CONFIGURACIÓN (REPARADO)
   ========================================================================== */
const appState = {
    isPro: false,
    country: 'spain', 
    mode: 'annual',   
    language: 'es',   
    adClickCount: 0
};

// Punto 2: Diccionario para evitar textos fijos en un solo idioma
const i18n = {
    es: { calc: "Calculando...", net: "NETO", ss: "Seguridad Social", irpf: "IRPF Aplicado", bruto: "Bruto", anual: "Anual", mensual: "Mensual", horas: "Horas", despido: "Indemnización" },
    en: { calc: "Calculating...", net: "NET", ss: "Nat. Insurance", irpf: "Income Tax", bruto: "Gross", anual: "Annual", mensual: "Monthly", horas: "Hourly", despido: "Dismissal" }
};

/* ==========================================================================
   2. SELECCIÓN DE ELEMENTOS DEL DOM
   ========================================================================== */
const DOM = {
    btnSettings: document.getElementById('btn-settings'),
    settingsMenu: document.getElementById('settings-menu'),
    btnCloseSettings: document.getElementById('btn-close-settings'),
    themeToggle: document.getElementById('theme-toggle'),
    langSelect: document.getElementById('lang-select'),
    appTitles: document.querySelectorAll('.app-title'),
    countryBtns: document.querySelectorAll('.btn-country'),
    modeBtns: document.querySelectorAll('.btn-mode'),
    countryModules: document.querySelectorAll('.country-module'),
    calcForms: document.querySelectorAll('.calc-form'),
    btnCalculate: document.getElementById('btn-calculate'),
    resultsSection: document.getElementById('results-section'),
    resultsList: document.getElementById('results-list'),
    netResultValue: document.getElementById('net-result-value'),
    resultsLoader: document.getElementById('results-loader'),
    resultsContent: document.getElementById('results-content')
};

/* ==========================================================================
   3. INICIALIZACIÓN Y EVENTOS
   ========================================================================== */
document.addEventListener('DOMContentLoaded', () => {
    initUIEvents();
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('sw.js').catch(err => console.log(err));
    }
});

function initUIEvents() {
    DOM.btnSettings?.addEventListener('click', () => {
        DOM.settingsMenu.classList.remove('hidden');
        DOM.settingsMenu.classList.add('open');
    });
    
    DOM.btnCloseSettings?.addEventListener('click', () => {
        DOM.settingsMenu.classList.remove('open');
        setTimeout(() => DOM.settingsMenu.classList.add('hidden'), 300);
    });

    DOM.themeToggle?.addEventListener('change', (e) => {
        document.body.classList.toggle('theme-dark', e.target.checked);
        document.body.classList.toggle('theme-light', !e.target.checked);
    });

    DOM.langSelect?.addEventListener('change', (e) => {
        appState.language = e.target.value;
        DOM.appTitles.forEach(t => t.classList.add('hidden'));
        document.getElementById(`title-${appState.language}`)?.classList.remove('hidden');
    });

    // Navegación de Países
    DOM.countryBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            DOM.countryBtns.forEach(b => b.classList.remove('active'));
            DOM.countryModules.forEach(m => m.classList.add('hidden'));
            btn.classList.add('active');
            appState.country = btn.id.replace('btn-', '');
            document.getElementById(`module-${appState.country}`)?.classList.remove('hidden');
            resetToDefaultMode();
        });
    });

    // Navegación de Modos
    DOM.modeBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            if (btn.classList.contains('pro-feature') && !appState.isPro) {
                alert(i18n[appState.language].pro_alert || "PRO Only");
                return;
            }
            DOM.modeBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            appState.mode = btn.id.replace('btn-mode-', '');
            DOM.calcForms.forEach(f => f.classList.add('hidden'));
            document.getElementById(`${appState.country}-${appState.mode}`)?.classList.remove('hidden');
        });
    });
}

function resetToDefaultMode() {
    document.getElementById('btn-mode-annual')?.click();
}

/* ==========================================================================
   4. LÓGICA DE CÁLCULO Y ANUNCIOS
   ========================================================================== */
DOM.btnCalculate.addEventListener('click', () => {
    appState.adClickCount++;
    DOM.resultsSection.classList.remove('hidden');
    DOM.resultsContent.classList.add('hidden');
    DOM.resultsLoader.classList.remove('hidden');

    const shouldShowAd = (appState.adClickCount % 2 !== 0) && !appState.isPro;

    if (shouldShowAd && typeof showInterstitialAd === 'function') {
        showInterstitialAd(() => processCalculation());
    } else {
        setTimeout(processCalculation, 600);
    }
});

function processCalculation() {
    DOM.resultsLoader.classList.add('hidden');
    DOM.resultsContent.classList.remove('hidden');
    DOM.resultsList.innerHTML = '';

    if (appState.country === 'spain') calculateSpain(appState.mode);
    else if (appState.country === 'uk') calculateUK(appState.mode);
}

/* ==========================================================================
   5. MOTOR ESPAÑA (INTEGRADO Y COMPLETO)
   ========================================================================== */
function calculateSpain(mode) {
    const lang = i18n[appState.language];
    let irpfPerc = parseFloat(document.getElementById('sp-irpf-manual')?.value) || 0;
    const ssPerc = 6.47; 
    let net = 0;

    if (mode === 'annual') {
        let gross = parseFloat(document.getElementById('sp-annual-gross').value) || 0;
        let pagas = parseInt(document.getElementById('sp-annual-months').value) || 12;
        if (irpfPerc === 0) irpfPerc = estimateSpainIRPF(gross);
        let ssAmount = gross * (ssPerc / 100);
        let irpfAmount = gross * (irpfPerc / 100);
        net = gross - ssAmount - irpfAmount;
        renderResult(lang.ss, "-" + ssAmount.toFixed(2) + "€");
        renderResult(lang.irpf + ` (${irpfPerc}%)`, "-" + irpfAmount.toFixed(2) + "€");
        renderResult(`Paga Neta (x${pagas})`, (net / pagas).toFixed(2) + "€");
    } 
    else if (mode === 'monthly') {
        let mGross = parseFloat(document.getElementById('sp-monthly-gross').value) || 0;
        let isProrated = document.getElementById('sp-monthly-prorated').checked;
        let annualEquiv = isProrated ? mGross * 12 : mGross * 14;
        if (irpfPerc === 0) irpfPerc = estimateSpainIRPF(annualEquiv);
        let mSS = mGross * (ssPerc / 100);
        let mIRPF = mGross * (irpfPerc / 100);
        net = mGross - mSS - mIRPF;
        renderResult(lang.ss, "-" + mSS.toFixed(2) + "€");
        renderResult(lang.irpf, "-" + mIRPF.toFixed(2) + "€");
    }
    else if (mode === 'hourly') {
        let price = parseFloat(document.getElementById('sp-hourly-price').value) || 0;
        let hours = parseFloat(document.getElementById('sp-hourly-hours').value) || 0;
        let days = parseFloat(document.getElementById('sp-hourly-days').value) || 0;
        let totalGross = price * hours * days;
        let hSS = totalGross * (ssPerc / 100);
        let hIRPF = totalGross * (irpfPerc || 2) / 100;
        net = totalGross - hSS - hIRPF;
        renderResult(lang.bruto, totalGross.toFixed(2) + "€");
        renderResult(lang.ss, "-" + hSS.toFixed(2) + "€");
    }
    else if (mode === 'dismissal') {
        let years = parseFloat(document.getElementById('sp-dismissal-years').value) || 0;
        let type = document.getElementById('sp-dismissal-type').value;
        let annual = parseFloat(document.getElementById('sp-annual-gross')?.value) || 0;
        let daily = annual / 365;
        let daysPerYear = (type === 'objective') ? 20 : 33;
        net = daily * daysPerYear * years;
        renderResult("Días/Año", daysPerYear);
        renderResult(lang.despido, net.toFixed(2) + "€");
    }

    DOM.netResultValue.textContent = net.toFixed(2) + "€";
}

/* ==========================================================================
   6. MOTOR UK (CORREGIDO: PRECISIÓN TOTAL)
   ========================================================================== */
function calculateUK(mode) {
    const lang = i18n[appState.language];
    const region = document.getElementById('uk-region-select').value;
    const includeHoliday = document.getElementById('uk-holiday-pay')?.checked;
    let annualGross = 0;

    if (mode === 'annual') annualGross = parseFloat(document.getElementById('uk-annual-gross').value) || 0;
    else if (mode === 'monthly') annualGross = (parseFloat(document.getElementById('uk-monthly-gross').value) || 0) * 12;
    else if (mode === 'hourly') {
        let rate = parseFloat(document.getElementById('uk-hourly-rate').value) || 0;
        let h = parseFloat(document.getElementById('uk-hourly-hours').value) || 0;
        let d = parseFloat(document.getElementById('uk-hourly-days').value) || 0;
        annualGross = (rate * h * d) * 52.14;
        if (includeHoliday) annualGross *= 1.1207;
    }

    const tax = calculateUKTaxLogic(annualGross, 12570, region);
    const ni = (annualGross > 12570) ? (annualGross - 12570) * 0.08 : 0;
    const netAnnual = annualGross - tax - ni;

    let divisor = (mode === 'monthly') ? 12 : (mode === 'hourly' ? 52.14 : 1);
    renderResult(lang.irpf, "-£" + (tax / divisor).toFixed(2));
    renderResult(lang.ss, "-£" + (ni / divisor).toFixed(2));
    DOM.netResultValue.textContent = "£" + (netAnnual / divisor).toFixed(2);
}

function calculateUKTaxLogic(gross, allowance, region) {
    let taxable = Math.max(0, gross - allowance);
    if (region === 'SCO') {
        if (taxable <= 2306) return taxable * 0.19;
        if (taxable <= 13991) return (2306 * 0.19) + (taxable - 2306) * 0.20;
        return (2306 * 0.19) + (11685 * 0.20) + (taxable - 13991) * 0.21;
    }
    if (taxable <= 37700) return taxable * 0.20;
    return (37700 * 0.20) + (taxable - 37700) * 0.40;
}

/* ==========================================================================
   7. UTILIDADES Y PRO
   ========================================================================== */
function renderResult(label, value) {
    const div = document.createElement('div');
    div.className = 'result-item';
    div.innerHTML = `<span>${label}:</span> <span class="result-value">${value}</span>`;
    DOM.resultsList.appendChild(div);
}

function estimateSpainIRPF(gross) {
    if (gross <= 12450) return 19;
    if (gross <= 20200) return 24;
    if (gross <= 35200) return 30;
    return 37;
}

document.getElementById('btn-become-pro')?.addEventListener('click', () => {
    const email = document.getElementById('auth-email').value;
    if (!email.includes('@')) return alert("Email no válido");
    
    // Punto 3: Evitar congelamiento
    const btn = document.getElementById('btn-become-pro');
    btn.disabled = true;
    btn.textContent = "Procesando...";

    setTimeout(() => {
        appState.isPro = true;
        document.body.classList.add('is-pro');
        alert("¡Payroll Pro Activado!");
        btn.textContent = "ACTIVADO";
    }, 1500);
});
