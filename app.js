/* ==========================================================================
   CONFIGURACIÓN Y ESTADO
   ========================================================================== */
const state = { 
    country: 'spain', 
    isPro: false,
    currency: '€'
};

const DOM = {
    screens: document.querySelectorAll('.screen'),
    navBtns: document.querySelectorAll('.nav-btn'),
    forms: document.querySelectorAll('.country-form'),
    calcBtn: document.getElementById('btn-calculate'),
    resList: document.getElementById('results-list'),
    resNet: document.getElementById('net-result-value'),
    btnSet: document.getElementById('btn-settings'),
    btnBack: document.querySelectorAll('.btn-back')
};

/* ==========================================================================
   NAVEGACIÓN (CORREGIDA)
   ========================================================================== */
function showScreen(id) {
    DOM.screens.forEach(s => s.classList.add('hidden'));
    const target = document.getElementById(id);
    if (target) target.classList.remove('hidden');
}

function initNavigation() {
    DOM.navBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            state.country = btn.getAttribute('data-country');
            state.currency = (state.country === 'spain') ? '€' : '£';
            
            DOM.navBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            
            DOM.forms.forEach(f => f.classList.add('hidden'));
            document.getElementById(`form-${state.country}`).classList.remove('hidden');
            
            showScreen('main-screen');
            clearResults();
        });
    });

    if (DOM.btnSet) DOM.btnSet.addEventListener('click', () => showScreen('settings-screen'));
    DOM.btnBack.forEach(b => b.addEventListener('click', () => showScreen('main-screen')));
}

function clearResults() {
    DOM.resList.innerHTML = "";
    DOM.resNet.textContent = "0.00" + state.currency;
}

/* ==========================================================================
   MOTOR DE CÁLCULO (SINCRONIZADO)
   ========================================================================== */
function handleCalculation() {
    DOM.resList.innerHTML = "";
    if (state.country === 'spain') calculateSpain();
    else calculateUK();
}

// --- LÓGICA ESPAÑA ---
function calculateSpain() {
    let grossInput = parseFloat(document.getElementById('sp-annual-gross').value) || 0;
    let irpfManual = parseFloat(document.getElementById('sp-irpf-manual').value) || 0;
    
    // Asumimos siempre entrada anual por ahora para evitar errores de usuario
    let annualGross = grossInput; 

    // Tramos IRPF España 2024/2025
    let irpfPerc = irpfManual;
    if (irpfPerc === 0) {
        if (annualGross <= 12450) irpfPerc = 19;
        else if (annualGross <= 20200) irpfPerc = 24;
        else if (annualGross <= 35200) irpfPerc = 30;
        else if (annualGross <= 60000) irpfPerc = 37;
        else if (annualGross <= 300000) irpfPerc = 45;
        else irpfPerc = 47;
    }

    let ssAnnual = annualGross * 0.0635; 
    let irpfAnnual = annualGross * (irpfPerc / 100);
    let netAnnual = annualGross - ssAnnual - irpfAnnual;

    // Resultados (Base 12 pagas estándar)
    renderDetail("Seguridad Social (6.35%)", "-" + (ssAnnual/12).toFixed(2) + "€");
    renderDetail("IRPF (" + irpfPerc + "%)", "-" + (irpfAnnual/12).toFixed(2) + "€");
    DOM.resNet.textContent = (netAnnual / 12).toFixed(2) + "€";
}

// --- LÓGICA REINO UNIDO ---
function calculateUK() {
    let grossInput = parseFloat(document.getElementById('uk-annual-gross').value) || 0;
    const region = document.getElementById('uk-region-select').value;
    const hasHolidayPay = document.getElementById('uk-holiday-pay').checked;

    let annualGross = grossInput;

    // 1. Holiday Pay (Prorrata)
    if (hasHolidayPay) {
        let hp = annualGross * 0.1207;
        renderDetail("Holiday Pay (12.07%)", "+£" + (hp/12).toFixed(2));
        annualGross += hp;
    }

    // 2. Personal Allowance
    let taxable = Math.max(0, annualGross - 12570);
    let tax = 0;

    // 3. Tax Bands (Bifurcación)
    if (region === 'SCO') {
        if (taxable > 0) tax += Math.min(taxable, 2306) * 0.19;
        if (taxable > 2306) tax += Math.min(taxable - 2306, 11619) * 0.20;
        if (taxable > 13925) tax += Math.min(taxable - 13925, 17146) * 0.21;
        if (taxable > 31071) tax += Math.min(taxable - 31071, 31438) * 0.42;
        if (taxable > 62509) tax += Math.min(taxable - 62509, 62509) * 0.45;
        if (taxable > 125140) tax += (taxable - 125140) * 0.48;
    } else {
        if (taxable > 0) tax += Math.min(taxable, 37700) * 0.20;
        if (taxable > 37700) tax += Math.min(taxable - 37700, 87440) * 0.40;
        if (taxable > 125140) tax += (taxable - 125140) * 0.45;
    }

    // 4. National Insurance (NI)
    let ni = (annualGross > 12570) ? (Math.min(annualGross, 50270) - 12570) * 0.08 : 0;
    
    let netMonthly = (annualGross - tax - ni) / 12;

    renderDetail("Income Tax", "-£" + (tax/12).toFixed(2));
    renderDetail("National Insurance", "-£" + (ni/12).toFixed(2));
    DOM.resNet.textContent = "£" + netMonthly.toFixed(2);
}

function renderDetail(label, value) {
    const div = document.createElement('div');
    div.className = 'result-item';
    div.innerHTML = `<span>${label}:</span> <span>${value}</span>`;
    DOM.resList.appendChild(div);
}

/* ==========================================================================
   INICIALIZACIÓN FINAL
   ========================================================================== */
document.addEventListener('DOMContentLoaded', () => {
    initNavigation();
    if (DOM.calcBtn) {
        DOM.calcBtn.addEventListener('click', handleCalculation);
    }
});
