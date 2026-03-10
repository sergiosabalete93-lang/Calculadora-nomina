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
        DOM.settingsMenu.classList.remove('hidden'); // Corrección: asegurar visibilidad
    });
    
    DOM.btnCloseSettings.addEventListener('click', () => {
        DOM.settingsMenu.classList.remove('open');
        setTimeout(() => DOM.settingsMenu.classList.add('hidden'), 300); // Ocultar tras animar
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
        const activeTitle = document.getElementById(`title-${appState.language}`);
        if(activeTitle) activeTitle.classList.remove('hidden');
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
        if (btn.classList.contains('disabled')) return;

        DOM.countryBtns.forEach(b => b.classList.remove('active'));
        DOM.countryModules.forEach(m => m.classList.add('hidden'));

        btn.classList.add('active');
        appState.country = btn.id.replace('btn-', ''); 

        const targetModule = document.getElementById(`module-${appState.country}`);
        if (targetModule) {
            targetModule.classList.remove('hidden');
        }

        resetToDefaultMode();
        hideResults();
    });
});

/* ==========================================================================
   6. LÓGICA DE NAVEGACIÓN: SELECCIÓN DE MODO
   ========================================================================== */
DOM.modeBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
        if (btn.classList.contains('pro-feature') && !appState.isPro) {
            alert("Esta función es exclusiva de la versión PRO.");
            return; 
        }

        DOM.modeBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        
        appState.mode = btn.id.replace('btn-mode-', ''); 

        DOM.calcForms.forEach(f => f.classList.add('hidden'));

        const targetFormId = `${appState.country}-${appState.mode}`;
        const targetForm = document.getElementById(targetFormId);
        
        if (targetForm) {
            targetForm.classList.remove('hidden');
        }

        hideResults();
    });
});

function resetToDefaultMode() {
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
    appState.adClickCount++; 
    
    DOM.resultsSection.classList.remove('hidden');
    DOM.resultsContent.classList.add('hidden');
    DOM.resultsLoader.classList.remove('hidden');

    const shouldShowAd = (appState.adClickCount % 2 !== 0) && (!appState.isPro);

    if (shouldShowAd && typeof showInterstitialAd === 'function') {
        showInterstitialAd(() => {
            processCalculation();
        });
    } else {
        setTimeout(processCalculation, 600);
    }
});

function processCalculation() {
    DOM.resultsLoader.classList.add('hidden');
    DOM.resultsContent.classList.remove('hidden');
    DOM.resultsList.innerHTML = '';

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
    const ssPerc = 6.47; // Actualizado a 2024/25 (Mecanismo Equidad Intergeneracional)

    switch (mode) {
        case 'annual':
            gross = parseFloat(document.getElementById('sp-annual-gross').value) || 0;
            const pagas = parseInt(document.getElementById('sp-annual-months').value);
            if (irpfPerc === 0) irpfPerc = estimateSpainIRPF(gross);
            
            let ssAmount = gross * (ssPerc / 100);
            let irpfAmount = gross * (irpfPerc / 100);
            net = gross - ssAmount - irpfAmount;

            renderResult("Bruto Anual", gross.toFixed(2) + "€");
            renderResult("Seguridad Social", "-" + ssAmount.toFixed(2) + "€");
            renderResult("IRPF Aplicado", "-" + irpfAmount.toFixed(2) + "€");
            renderResult(`Paga Neta (x${pagas})`, (net / pagas).toFixed(2) + "€");
            break;

        case 'monthly':
            let monthlyGross = parseFloat(document.getElementById('sp-monthly-gross').value) || 0;
            const isProrated = document.getElementById('sp-monthly-prorated').checked;
            gross = isProrated ? monthlyGross : monthlyGross * 1.16; 
            if (irpfPerc === 0) irpfPerc = estimateSpainIRPF(gross * 12);
            
            let mSS = monthlyGross * (ssPerc / 100);
            let mIRPF = monthlyGross * (irpfPerc / 100);
            net = monthlyGross - mSS - mIRPF;

            renderResult("Bruto Mensual", monthlyGross.toFixed(2) + "€");
            renderResult("IRPF Mensual", "-" + mIRPF.toFixed(2) + "€");
            renderResult("Seg. Social", "-" + mSS.toFixed(2) + "€");
            break;

        case 'hourly':
            const price = parseFloat(document.getElementById('sp-hourly-price').value) || 0;
            const hours = parseFloat(document.getElementById('sp-hourly-hours').value) || 0;
            const days = parseFloat(document.getElementById('sp-hourly-days').value) || 0;
            gross = price * hours * days;
            if (irpfPerc === 0) irpfPerc = 2; 
            let hSS = gross * (ssPerc / 100);
            let hIRPF = gross * (irpfPerc / 100);
            net = gross - hSS - hIRPF;

            renderResult("Total Bruto", gross.toFixed(2) + "€");
            renderResult("Retención IRPF", "-" + hIRPF.toFixed(2) + "€");
            renderResult("Seg. Social", "-" + hSS.toFixed(2) + "€");
            break;

        case 'dismissal':
            const years = parseFloat(document.getElementById('sp-dismissal-years').value) || 0;
            const type = document.getElementById('sp-dismissal-type').value;
            const dailySalary = (parseFloat(document.getElementById('sp-annual-gross').value) || 0) / 365;
            let daysPerYear = (type === 'objective') ? 20 : 33;
            let compensation = dailySalary * daysPerYear * years;
            renderResult("Días por año", daysPerYear);
            renderResult("Indemnización Bruta", compensation.toFixed(2) + "€");
            net = compensation; 
            break;
    }

    if (appState.isPro) applyProCalculationsSpain();
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
   10. MOTOR DE CÁLCULO: REINO UNIDO (UK) - ACTUALIZADO ESCOCIA/HOLIDAY
   ========================================================================== */
function calculateUK(mode) {
    let gross = 0;
    let net = 0;
    const personalAllowance = 12570;
    const region = document.getElementById('uk-region-select').value; // Inyectado
    const includeHoliday = document.getElementById('uk-holiday-pay').checked; // Inyectado

    switch (mode) {
        case 'annual':
            gross = parseFloat(document.getElementById('uk-annual-gross').value) || 0;
            let tax = calculateUKTax(gross, personalAllowance, region);
            let ni = calculateUKNI(gross);
            net = gross - tax - ni;

            renderResult("Gross Annual", "£" + gross.toFixed(2));
            renderResult("Region", region === 'SCO' ? "Scotland" : "Rest of UK");
            renderResult("Income Tax", "-£" + tax.toFixed(2));
            renderResult("National Insurance", "-£" + ni.toFixed(2));
            renderResult("Monthly Net", "£" + (net / 12).toFixed(2));
            break;

        case 'monthly':
            let monthlyGross = parseFloat(document.getElementById('uk-monthly-gross').value) || 0;
            gross = monthlyGross * 12;
            let mTax = calculateUKTax(gross, personalAllowance, region) / 12;
            let mNI = calculateUKNI(gross) / 12;
            net = monthlyGross - mTax - mNI;

            renderResult("Monthly Gross", "£" + monthlyGross.toFixed(2));
            renderResult("Tax", "-£" + mTax.toFixed(2));
            renderResult("NI (Class 1)", "-£" + mNI.toFixed(2));
            break;

        case 'hourly':
            const rate = parseFloat(document.getElementById('uk-hourly-rate').value) || 0;
            const hWeek = parseFloat(document.getElementById('uk-hourly-hours').value) || 0;
            const dWeek = parseFloat(document.getElementById('uk-hourly-days').value) || 1;
            
            let weeklyGross = rate * hWeek * dWeek;
            
            // Lógica Holiday Pay (12.07%)
            if (includeHoliday) {
                const holidayAmount = weeklyGross * 0.1207;
                renderResult("Holiday Pay (12.07%)", "+£" + holidayAmount.toFixed(2));
                weeklyGross += holidayAmount;
            }

            gross = weeklyGross * 52;
            let hTax = calculateUKTax(gross, personalAllowance, region) / 52;
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

function calculateUKTax(annualGross, allowance, region) {
    let taxable = Math.max(0, annualGross - allowance);
    let tax = 0;

    if (region === 'SCO') {
        // Tramos Escoceses 2024/25 simplificados
        if (taxable <= 2306) tax = taxable * 0.19;
        else if (taxable <= 13991) tax = (2306 * 0.19) + ((taxable - 2306) * 0.20);
        else if (taxable <= 31092) tax = (2306 * 0.19) + (11685 * 0.20) + ((taxable - 13991) * 0.21);
        else tax = (taxable * 0.42); // Simplificación para tramos altos
    } else {
        // Tramos rUK (Inglaterra/Gales/NI)
        if (taxable <= 37700) tax = taxable * 0.20;
        else if (taxable <= 125140) tax = (37700 * 0.20) + ((taxable - 37700) * 0.40);
        else tax = (37700 * 0.20) + ((125140 - 37700) * 0.40) + ((taxable - 125140) * 0.45);
    }
    return tax;
}

function calculateUKNI(annualGross) {
    const threshold = 12570;
    if (annualGross <= threshold) return 0;
    return (annualGross - threshold) * 0.08;
}

/* ==========================================================================
   11. FUNCIONES PRO Y AJUSTES
   ========================================================================== */
function applyProCalculationsSpain() {
    const extraVal = parseFloat(document.getElementById('sp-pro-extras-val').value) || 0;
    const extraMul = parseFloat(document.getElementById('sp-pro-extras-mul').value) || 1;
    const kmVal = parseFloat(document.getElementById('sp-pro-km-val').value) || 0;
    const kmTotal = parseFloat(document.getElementById('sp-pro-km-total').value) || 0;

    if (extraVal > 0) renderResult("Extras/Bonus", "+" + (extraVal * extraMul).toFixed(2) + "€");
    if (kmVal > 0) renderResult("Kilometraje", "+" + (kmVal * kmTotal).toFixed(2) + "€");
}

function applyProCalculationsUK() {
    const pension = parseFloat(document.getElementById('uk-pro-pension').value) || 0;
    if (pension > 0) renderResult("Pension Contrib.", pension + "%");
}

document.getElementById('btn-become-pro').addEventListener('click', () => {
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
    DOM.btnSettings.innerHTML = "<span>⚙️ PRO</span>"; 
    alert("¡Payroll Pro activado para: " + email + "!");
}
