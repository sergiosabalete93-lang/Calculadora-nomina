const appState = {
    isPro: false,
    currentCountry: 'spain', 
    currentMode: 'annual',
    ukRegion: 'rUK',         
    includeHolidayPay: false 
};

const DOM = {
    screens: document.querySelectorAll('.screen'),
    navButtons: document.querySelectorAll('.nav-btn'),
    calculateBtn: document.getElementById('btn-calculate'),
    resultsList: document.getElementById('results-list'),
    netResultValue: document.getElementById('net-result-value'),
    btnSettings: document.getElementById('btn-settings'),
    btnBack: document.querySelectorAll('.btn-back'),
    screenMain: document.getElementById('main-screen'),
    screenSettings: document.getElementById('settings-screen')
};

function showScreen(screenId) {
    DOM.screens.forEach(s => s.classList.add('hidden'));
    const target = document.getElementById(screenId);
    if (target) {
        target.classList.remove('hidden');
        window.scrollTo(0, 0);
    }
}

function setupNavigation() {
    DOM.navButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const country = btn.getAttribute('data-country');
            DOM.navButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            document.querySelectorAll('.country-form').forEach(form => form.classList.add('hidden'));
            const targetForm = document.getElementById(`form-${country}`);
            if (targetForm) {
                targetForm.classList.remove('hidden');
                appState.currentCountry = country;
            }
            showScreen('main-screen');
        });
    });

    if (DOM.btnSettings) {
        DOM.btnSettings.addEventListener('click', () => {
            showScreen('settings-screen');
        });
    }

    if (DOM.btnBack) {
        DOM.btnBack.forEach(btn => {
            btn.addEventListener('click', () => showScreen('main-screen'));
        });
function initCalculator() {
    if (!DOM.calculateBtn) return;
    DOM.calculateBtn.addEventListener('click', () => {
        DOM.resultsList.innerHTML = '';
        DOM.calculateBtn.innerText = "Calculando...";
        DOM.calculateBtn.disabled = true;
        setTimeout(() => {
            executeCalculation();
            DOM.calculateBtn.innerText = "CALCULAR";
            DOM.calculateBtn.disabled = false;
        }, 500);
    });
}

function executeCalculation() {
    if (appState.currentCountry === 'spain') {
        calculateSpain();
    } else if (appState.currentCountry === 'uk') {
        calculateUK();
    }
}

function calculateSpain() {
    let gross = parseFloat(document.getElementById('sp-annual-gross').value) || 0;
    let irpfPerc = parseFloat(document.getElementById('sp-irpf-manual').value) || 0;
    const ssPerc = 6.35;

    if (irpfPerc === 0) {
        if (gross <= 12450) irpfPerc = 19;
        else if (gross <= 20200) irpfPerc = 24;
        else if (gross <= 35200) irpfPerc = 30;
        else if (gross <= 60000) irpfPerc = 37;
        else irpfPerc = 45;
    }

    let ssAmount = gross * (ssPerc / 100);
    let irpfAmount = gross * (irpfPerc / 100);
    let netAnnual = gross - ssAmount - irpfAmount;

    renderResult("Seguridad Social", "-" + (ssAmount / 12).toFixed(2) + "€");
    renderResult("Retención IRPF", "-" + (irpfAmount / 12).toFixed(2) + "€");
    DOM.netResultValue.textContent = (netAnnual / 12).toFixed(2) + "€";
}
function calculateUK() {
    let gross = parseFloat(document.getElementById('uk-annual-gross').value) || 0;
    
    if (appState.includeHolidayPay) {
        let holidayPay = gross * 0.1207;
        renderResult("Holiday Pay (12.07%)", "£" + (holidayPay / 12).toFixed(2));
        gross += holidayPay;
    }

    let tax = 0;
    let allowance = 12570;
    let taxable = Math.max(0, gross - allowance);

    if (appState.ukRegion === 'SCO') {
        if (taxable > 0) tax += Math.min(taxable, 2306) * 0.19;
        if (taxable > 2306) tax += Math.min(taxable - 2306, 11619) * 0.20;
        if (taxable > 13925) tax += Math.min(taxable - 13925, 17146) * 0.21;
        if (taxable > 31071) tax += Math.min(taxable - 31071, 31438) * 0.42;
        if (taxable > 62509) tax += Math.min(taxable - 62509, 62509) * 0.45;
        if (taxable > 125140) tax += (taxable - 125140) * 0.48;
        renderResult("Región", "Escocia");
    } else {
        if (taxable > 0) tax += Math.min(taxable, 37700) * 0.20;
        if (taxable > 37700) tax += Math.min(taxable - 37700, 74870) * 0.40;
        if (taxable > 125140) tax += (taxable - 125140) * 0.45;
        renderResult("Región", "Inglaterra/Gales/NI");
    }

    let ni = (gross > 12570) ? (Math.min(gross, 50270) - 12570) * 0.08 : 0;
    let netAnnual = gross - tax - ni;

    renderResult("Income Tax", "-£" + (tax / 12).toFixed(2));
    renderResult("National Insurance", "-£" + (ni / 12).toFixed(2));
    DOM.netResultValue.textContent = "£" + (netAnnual / 12).toFixed(2);
}

function renderResult(label, value) {
    const div = document.createElement('div');
    div.className = 'result-item';
    div.innerHTML = `<span>${label}:</span> <span class="result-value">${value}</span>`;
    DOM.resultsList.appendChild(div);
}

document.addEventListener('DOMContentLoaded', () => {
    setupNavigation();
    initCalculator();
});
    }
}
