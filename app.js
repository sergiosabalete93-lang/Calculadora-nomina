/* app.js - Motor Maestro Corregido */

// Esperamos a que el DOM esté listo para evitar errores de carga
document.addEventListener('DOMContentLoaded', () => {
    
    // 1. CONFIGURACIÓN INICIAL
    let isPro = false; 
    let currentCountry = 'es';
    let extrasList = [];

    const dict = {
        es: { sym: '€', sal: 'Sueldo Bruto Anual', net: 'Neto Mensual', tax: 'Deducciones', center: 'Neto' },
        uk: { sym: '£', sal: 'Gross Annual Salary', net: 'Monthly Take Home', tax: 'Deductions', center: 'Net' },
        it: { sym: '€', sal: 'Stipendio Lordo', net: 'Netto Mensile', tax: 'Trattenute', center: 'Netto' },
        pt: { sym: '€', sal: 'Vencimento Bruto', net: 'Líquido Mensal', tax: 'Retenções', center: 'Líquido' }
    };

    // 2. REFERENCIAS SEGURAS (DOM)
    const elements = {
        salary: document.getElementById('main-salary'),
        country: document.getElementById('country-selector'),
        currency: document.getElementById('currency-symbol'),
        labelSal: document.getElementById('label-salary'),
        labelNet: document.getElementById('label-net-monthly'),
        labelTax: document.getElementById('label-total-tax'),
        displayNet: document.getElementById('net-monthly'),
        displayTax: document.getElementById('total-tax'),
        centerLabel: document.getElementById('chart-center-label'),
        centerVal: document.getElementById('chart-center-val'),
        privacyBtn: document.getElementById('btn-privacy'),
        privacyDiv: document.getElementById('privacy-content'),
        specifics: document.getElementById('specific-options')
    };

    // 3. ACTUALIZACIÓN DE IDIOMAS Y LEYES
    function updateCountryUI() {
        const lang = dict[currentCountry];
        elements.currency.innerText = lang.sym;
        elements.labelSal.innerText = lang.sal;
        elements.labelNet.innerText = lang.net;
        elements.labelTax.innerText = lang.tax;
        elements.centerLabel.innerText = lang.center;
        
        // Limpiar opciones previas
        elements.specifics.innerHTML = '';
        if(currentCountry === 'es' || currentCountry === 'it') {
            elements.specifics.innerHTML = `
                <div class="input-group" style="margin-top:10px;">
                    <label>Número de Pagas</label>
                    <select id="pagas-select" style="width:100%; padding:8px; border-radius:5px;">
                        <option value="12">12 Pagas</option>
                        <option value="14">14 Pagas</option>
                    </select>
                </div>`;
            document.getElementById('pagas-select').addEventListener('change', calculate);
        }
    }

    // 4. MOTOR DE CÁLCULO (Ajuste Fino 4 Países)
    function calculate() {
        let gross = parseFloat(elements.salary.value) || 0;
        let results = { net: 0, tax: 0, ss: 0, months: 12 };

        if (gross > 0) {
            if (currentCountry === 'es') {
                const pagas = document.getElementById('pagas-select') ? parseInt(document.getElementById('pagas-select').value) : 12;
                let ss = gross * 0.0635;
                let irpf = gross * (gross > 35000 ? 0.30 : 0.19); // Lógica simplificada segura
                results = { net: gross - irpf - ss, tax: irpf, ss: ss, months: pagas };
            } 
            else if (currentCountry === 'uk') {
                let pa = 12570;
                let taxable = Math.max(0, gross - pa);
                let tax = taxable * 0.20;
                let ni = Math.max(0, (gross - 12570) * 0.08);
                results = { net: gross - tax - ni, tax: tax, ss: ni, months: 12 };
            }
            else if (currentCountry === 'it') {
                let inps = gross * 0.09;
                let irpef = (gross - inps) * 0.23;
                results = { net: gross - irpef - inps, tax: irpef, ss: inps, months: 13 };
            }
            else if (currentCountry === 'pt') {
                let ss = gross * 0.11;
                let irs = gross * 0.14;
                results = { net: gross - irs - ss, tax: irs, ss: ss, months: 14 };
            }
        }

        updateDisplay(results);
    }

    // 5. ACTUALIZAR PANTALLA Y GRÁFICO
    function updateDisplay(r) {
        const sym = dict[currentCountry].sym;
        const netMonth = r.net / r.months;
        const taxMonth = (r.tax + r.ss) / r.months;

        elements.displayNet.innerText = `${netMonth.toFixed(2)} ${sym}`;
        elements.displayTax.innerText = `${taxMonth.toFixed(2)} ${sym}`;

        // Lógica del Gráfico Circular
        const total = r.net + r.tax + r.ss;
        if (total > 0) {
            const netPct = (r.net / total) * 100;
            const taxPct = (r.tax / total) * 100;
            const ssPct = (r.ss / total) * 100;

            document.getElementById('chart-net').setAttribute('stroke-dasharray', `${netPct}, 100`);
            document.getElementById('chart-tax').setAttribute('stroke-dasharray', `${taxPct}, 100`);
            document.getElementById('chart-ss').setAttribute('stroke-dasharray', `${ssPct}, 100`);
            elements.centerVal.innerText = `${netPct.toFixed(0)}%`;
        }
    }

    // 6. EVENTOS
    elements.salary.addEventListener('input', calculate);
    elements.country.addEventListener('change', (e) => {
        currentCountry = e.target.value;
        updateCountryUI();
        calculate();
    });
    elements.privacyBtn.addEventListener('click', () => {
        elements.privacyDiv.classList.toggle('hidden');
    });

    // Inicialización
    updateCountryUI();
});
