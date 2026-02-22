// app.js

// --- 1. ESTADO GLOBAL ---
let isPro = false; // Cambia a true al comprar la versión PRO
let currentCountry = 'es';
let extrasList = [];

// --- 2. CONFIGURACIÓN DE IDIOMAS Y MONEDAS ---
const dict = {
    es: { sym: '€', sal: 'Sueldo Bruto Anual', net: 'Sueldo Neto Mensual', tax: 'Deducciones (IRPF + SS)' },
    uk: { sym: '£', sal: 'Gross Annual Salary', net: 'Monthly Take Home', tax: 'Total Deductions (Tax + NI)' },
    it: { sym: '€', sal: 'Stipendio Lordo Annuo', net: 'Stipendio Netto Mensile', tax: 'Trattenute (IRPEF + INPS)' },
    pt: { sym: '€', sal: 'Vencimento Bruto Anual', net: 'Vencimento Líquido', tax: 'Retenções (IRS + SS)' }
};

// --- 3. REFERENCIAS AL DOM ---
const salaryInput = document.getElementById('main-salary');
const countrySelect = document.getElementById('country-selector');
const currencySymbol = document.getElementById('currency-symbol');
const labelSalary = document.getElementById('label-salary');
const labelNet = document.getElementById('label-net-monthly');
const labelTax = document.getElementById('label-total-tax');
const textNetVal = document.getElementById('net-monthly');
const textTaxVal = document.getElementById('total-tax');
const specificOptions = document.getElementById('specific-options');
const privacyBtn = document.getElementById('btn-privacy');
const privacyContent = document.getElementById('privacy-content');

// Inicializar Service Worker para Modo Offline
if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('./sw.js').catch(err => console.log('SW falló:', err));
}

// --- 4. EVENTOS PRINCIPALES ---
salaryInput.addEventListener('input', calculate);
countrySelect.addEventListener('change', () => {
    currentCountry = countrySelect.value;
    updateUIForCountry();
    calculate();
});

privacyBtn.addEventListener('click', () => {
    privacyContent.classList.toggle('hidden');
});

// --- 5. ACTUALIZAR INTERFAZ POR PAÍS ---
function updateUIForCountry() {
    const lang = dict[currentCountry];
    currencySymbol.innerText = lang.sym;
    labelSalary.innerText = lang.sal;
    labelNet.innerText = lang.net;
    labelTax.innerText = lang.tax;
    
    // Inyectar opciones específicas del país
    specificOptions.innerHTML = ''; 
    if(currentCountry === 'es' || currentCountry === 'it') {
        specificOptions.innerHTML = `
            <div class="input-group" style="margin-top:10px;">
                <label>Número de Pagas</label>
                <select id="pagas-select" onchange="calculate()">
                    <option value="12">12 Pagas</option>
                    <option value="14">14 Pagas</option>
                </select>
            </div>
        `;
    }
}

// --- 6. MOTOR DE CÁLCULO PRINCIPAL ---
function calculate() {
    let grossYearly = parseFloat(salaryInput.value) || 0;
    
    // Sumar/Restar Extras si es PRO
    if (isPro) {
        extrasList.forEach(extra => {
            grossYearly += parseFloat(extra.value) || 0;
        });
    }

    let results = { netYearly: 0, taxYearly: 0, ssYearly: 0, months: 12 };

    if (grossYearly > 0) {
        switch (currentCountry) {
            case 'es': results = calcES(grossYearly); break;
            case 'uk': results = calcUK(grossYearly); break;
            case 'it': results = calcIT(grossYearly); break;
            case 'pt': results = calcPT(grossYearly); break;
        }
    }

    displayResults(results);
}

// --- 7. LÓGICA FISCAL POR PAÍS (Aproximaciones Generales) ---
function calcES(gross) {
    const pagas = document.getElementById('pagas-select') ? parseInt(document.getElementById('pagas-select').value) : 12;
    let ss = gross * 0.0635; // Contingencias comunes aprox
    let taxBase = gross - ss;
    let irpf = 0;
    // Tramos simplificados IRPF
    if(taxBase > 60000) irpf = taxBase * 0.45;
    else if(taxBase > 35200) irpf = taxBase * 0.37;
    else if(taxBase > 20200) irpf = taxBase * 0.30;
    else if(taxBase > 12450) irpf = taxBase * 0.24;
    else irpf = taxBase * 0.19;

    return { netYearly: gross - irpf - ss, taxYearly: irpf, ssYearly: ss, months: pagas };
}

function calcUK(gross) {
    const personalAllowance = 12570;
    let taxable = Math.max(0, gross - personalAllowance);
    let tax = 0;
    if (taxable > 125140) tax = taxable * 0.45;
    else if (taxable > 37700) tax = taxable * 0.40;
    else tax = taxable * 0.20;

    let ni = Math.max(0, (gross - 12570) * 0.08); // National Insurance simplificado
    return { netYearly: gross - tax - ni, taxYearly: tax, ssYearly: ni, months: 12 };
}

function calcIT(gross) {
    const pagas = document.getElementById('pagas-select') ? parseInt(document.getElementById('pagas-select').value) : 13;
    let inps = gross * 0.0919; // Aprox INPS empleado
    let taxBase = gross - inps;
    let irpef = taxBase * 0.23; // Simplificación del primer tramo
    if(taxBase > 28000) irpef = taxBase * 0.35;
    
    return { netYearly: gross - irpef - inps, taxYearly: irpef, ssYearly: inps, months: pagas };
}

function calcPT(gross) {
    let ss = gross * 0.11; // 11% Segurança Social
    let irs = gross * 0.14; // Promedio simplificado tabla IRS
    if (gross > 20000) irs = gross * 0.25;
    if (gross > 40000) irs = gross * 0.35;

    return { netYearly: gross - irs - ss, taxYearly: irs, ssYearly: ss, months: 14 };
}

// --- 8. RENDERIZADO DE RESULTADOS Y GRÁFICO PRO ---
function displayResults(r) {
    const sym = dict[currentCountry].sym;
    const netMonthly = r.netYearly / r.months;
    const totalDeductionsYearly = r.taxYearly + r.ssYearly;
    const totalDeductionsMonthly = totalDeductionsYearly / r.months;
    const grossMonthly = netMonthly + totalDeductionsMonthly;

    textNetVal.innerText = `${netMonthly.toFixed(2)} ${sym}`;
    textTaxVal.innerText = `${totalDeductionsMonthly.toFixed(2)} ${sym}`;

    if(isPro && grossMonthly > 0) {
        const netPct = (netMonthly / grossMonthly) * 100;
        const taxPct = (r.taxYearly / r.months / grossMonthly) * 100;
        const ssPct = (r.ssYearly / r.months / grossMonthly) * 100;

        document.getElementById('chart-net').setAttribute('stroke-dasharray', `${netPct}, 100`);
        document.getElementById('chart-tax').setAttribute('stroke-dasharray', `${taxPct}, 100`);
        document.getElementById('chart-ss').setAttribute('stroke-dasharray', `${ssPct}, 100`);
        
        document.getElementById('chart-center-val').innerText = `${netPct.toFixed(0)}%`;
    }
}

// --- 9. FUNCIONES PRO Y COMPRAS (In-App Billing + AdMob) ---
document.getElementById('btn-upgrade').addEventListener('click', buyPro);
document.getElementById('btn-restore').addEventListener('click', restorePurchase);
document.getElementById('btn-add-extra').addEventListener('click', addExtraRow);

function buyPro() {
    // Aquí iría la llamada a la API de Google Play Billing. 
    // Para la prueba simulamos la compra exitosa:
    unlockProFeatures();
}

function restorePurchase() {
    alert("Buscando compras anteriores...");
    // Simulación de restauración
    unlockProFeatures();
}

function unlockProFeatures() {
    isPro = true;
    document.querySelectorAll('.locked').forEach(el => el.classList.remove('locked'));
    document.getElementById('ad-banner-container').style.display = 'none'; // Quita los anuncios
    document.getElementById('btn-upgrade').innerText = '🌟 Eres PRO';
    document.getElementById('btn-upgrade').disabled = true;
    calculate(); // Recalcular para activar gráfico
}

function addExtraRow() {
    if(!isPro) return;
    const container = document.getElementById('extras-container');
    const input = document.createElement('input');
    input.type = 'number';
    input.placeholder = 'Cantidad (+ o -)';
    input.className = 'extra-input';
    input.style.width = '100%';
    input.style.padding = '8px';
    input.style.marginTop = '5px';
    input.addEventListener('input', calculate);
    
    container.appendChild(input);
    extrasList.push(input);
}

// Inicialización
updateUIForCountry();
