// app.js - Motor Completo Corregido

document.addEventListener('DOMContentLoaded', () => {
    // 1. ESTADO GLOBAL
    let state = {
        isPro: false,
        country: 'es',
        lang: 'es',
        mode: 'normal',
        theme: localStorage.getItem('theme') || 'light'
    };

    document.body.setAttribute('data-theme', state.theme);

    // 2. DICCIONARIO DE TRADUCCIONES CORREGIDO (Incluye Resultados)
    const i18n = {
        es: { 
            sal: 'Salario Bruto', btnCalc: 'CALCULAR RESULTADOS', settings: 'Ajustes Generales',
            adv: '⚙️ Configuración Avanzada', resGross: 'Bruto Anual:', resNet: 'Neto Mensual:', resTax: 'Deducciones:'
        },
        en: { 
            sal: 'Gross Salary', btnCalc: 'CALCULATE RESULTS', settings: 'General Settings',
            adv: '⚙️ Advanced Settings', resGross: 'Annual Gross:', resNet: 'Monthly Net:', resTax: 'Total Deductions:'
        },
        it: { 
            sal: 'Stipendio Lordo', btnCalc: 'CALCOLA RISULTATI', settings: 'Impostazioni',
            adv: '⚙️ Impostazioni Avanzate', resGross: 'Lordo Annuo:', resNet: 'Netto Mensile:', resTax: 'Trattenute:'
        },
        pt: { 
            sal: 'Vencimento Bruto', btnCalc: 'CALCULAR RESULTADOS', settings: 'Definições',
            adv: '⚙️ Definições Avançadas', resGross: 'Bruto Anual:', resNet: 'Líquido Mensal:', resTax: 'Retenções:'
        }
    };

    // 3. REFERENCIAS DOM
    const DOM = {
        countrySel: document.getElementById('country-selector'),
        langSel: document.getElementById('lang-selector'),
        themeBtn: document.getElementById('theme-toggle'),
        settingsBtn: document.getElementById('settings-btn'),
        settingsPanel: document.getElementById('settings-panel'),
        calcBtn: document.getElementById('calc-trigger-btn'),
        salaryInput: document.getElementById('main-salary'),
        periodSel: document.getElementById('salary-period'),
        freeOpts: document.getElementById('free-options'),
        proOpts: document.getElementById('pro-options'),
        currency: document.getElementById('currency-symbol'),
        lblSal: document.getElementById('label-salary'),
        resGross: document.getElementById('res-gross'),
        resNet: document.getElementById('res-net'),
        resTax: document.getElementById('res-tax'),
        
        // Referencias para traducción
        lblAdv: document.getElementById('lbl-adv-config'),
        lblResGross: document.getElementById('lbl-res-gross'),
        lblResNet: document.getElementById('lbl-res-net'),
        lblResTax: document.getElementById('lbl-res-tax'),
        lblSettings: document.getElementById('lbl-settings'),
        
        modeBtns: document.querySelectorAll('.mode-btn'),
        btnUpgrade: document.getElementById('btn-upgrade'),
        btnRestore: document.getElementById('btn-restore')
    };

    // 4. EVENTOS DE INTERFAZ
    DOM.themeBtn.addEventListener('click', () => {
        state.theme = state.theme === 'light' ? 'dark' : 'light';
        document.body.setAttribute('data-theme', state.theme);
        localStorage.setItem('theme', state.theme);
    });

    DOM.settingsBtn.addEventListener('click', () => DOM.settingsPanel.classList.toggle('hidden'));
    
    DOM.langSel.addEventListener('change', (e) => {
        state.lang = e.target.value;
        updateLanguage();
    });

    DOM.countrySel.addEventListener('change', (e) => {
        state.country = e.target.value;
        renderAdvancedOptions();
        updateLanguage();
    });

    DOM.modeBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            DOM.modeBtns.forEach(b => b.classList.remove('active'));
            e.target.classList.add('active');
            state.mode = e.target.dataset.mode;
            DOM.lblSal.innerText = state.mode === 'inverse' ? 'Objetivo Neto Mínimo' : i18n[state.lang].sal;
        });
    });

    // 5. INYECCIÓN DE OPCIONES POR PAÍS
    function renderAdvancedOptions() {
        DOM.freeOpts.innerHTML = '';
        DOM.proOpts.innerHTML = '';

        if(state.country === 'es') {
            DOM.freeOpts.innerHTML = `
                <div><label>Pagas</label><select id="es-pagas"><option value="12">12</option><option value="14">14</option></select></div>
                <div><label>IRPF Manual (%)</label><input type="number" id="es-irpf" placeholder="Auto"></div>
            `;
            DOM.proOpts.innerHTML = `
                <div><label>Hijos Menores</label><input type="number" id="es-hijos" placeholder="0"></div>
                <div><label>Discapacidad</label><select><option>No</option><option>>33%</option><option>>65%</option></select></div>
            `;
        } else if(state.country === 'uk') {
            DOM.freeOpts.innerHTML = `
                <div><label>Pension (%)</label><input type="number" id="uk-pen" placeholder="5"></div>
                <div><label>2nd Job?</label><select><option value="no">No</option><option value="yes">Yes (BR)</option></select></div>
            `;
            DOM.proOpts.innerHTML = `
                <div><label>Tax Code</label><input type="text" id="uk-code" placeholder="1257L"></div>
                <div><label>Student Loan</label><select><option>None</option><option>Plan 1</option><option>Plan 2</option></select></div>
            `;
        } else if(state.country === 'pt') {
            DOM.freeOpts.innerHTML = `
                <div><label>Estado Civil</label><select><option>Solteiro</option><option>Casado (1 tit.)</option></select></div>
                <div><label>Dependentes</label><input type="number" placeholder="0"></div>
            `;
            DOM.proOpts.innerHTML = `
                <div><label>Sub. Alimentação</label><input type="number" placeholder="Valor Diario"></div>
                <div><label>Região</label><select><option>Continente</option><option>Açores</option></select></div>
            `;
        } else if(state.country === 'it') {
            DOM.freeOpts.innerHTML = `
                <div><label>Mensilità</label><select><option>13</option><option>14</option></select></div>
                <div><label>Figli a carico</label><input type="number" placeholder="0"></div>
            `;
            DOM.proOpts.innerHTML = `
                <div><label>Addizionale Regionale</label><input type="number" placeholder="%"></div>
                <div><label>Calcolo TFR</label><select><option>Si</option><option>No</option></select></div>
            `;
        }
    }

    // 6. ACTUALIZAR IDIOMA Y MONEDA
    function updateLanguage() {
        const langData = i18n[state.lang];
        
        // Textos
        DOM.lblSal.innerText = state.mode === 'inverse' ? 'Objetivo Neto' : langData.sal;
        DOM.calcBtn.innerText = langData.btnCalc;
        DOM.lblSettings.innerText = langData.settings;
        DOM.lblAdv.innerText = langData.adv;
        DOM.lblResGross.innerText = langData.resGross;
        DOM.lblResNet.innerText = langData.resNet;
        DOM.lblResTax.innerText = langData.resTax;
        
        // Símbolo Moneda
        let symMap = { es: '€', it: '€', pt: '€', uk: '£' };
        DOM.currency.innerText = symMap[state.country];
    }

    // 7. MOTOR DE CÁLCULO Y ADMOB
    DOM.calcBtn.addEventListener('click', () => {
        // Disparador AdMob Intersticial
        if (!state.isPro) {
            console.log("AdMob: Solicitando Intersticial ID: ca-app-pub-5962342027737970/3998701433");
        }

        const inputVal = parseFloat(DOM.salaryInput.value) || 0;
        const period = DOM.periodSel.value;
        
        // Normalizar a Anual
        let grossAnnual = inputVal;
        if (period === 'monthly') grossAnnual = inputVal * 12;
        if (period === 'hourly') grossAnnual = inputVal * 40 * 52; 

        if(state.mode === 'inverse') {
            grossAnnual = grossAnnual * 1.35; // Aprox bruto necesario
        } else if (state.mode === 'despido') {
            alert("Modo Despido Activo: Requiere introducir fechas (Función PRO en desarrollo visual)");
            return;
        }

        let results = calculateTaxes(grossAnnual, state.country);
        displayResults(results);
    });

    function calculateTaxes(gross, country) {
        let net = 0, tax = 0, ss = 0, months = 12;

        if(country === 'es') {
            months = document.getElementById('es-pagas') ? parseInt(document.getElementById('es-pagas').value) : 12;
            let manualIrpf = document.getElementById('es-irpf') ? parseFloat(document.getElementById('es-irpf').value) : null;
            
            ss = gross * 0.0635;
            tax = manualIrpf ? (gross * (manualIrpf/100)) : (gross * 0.19);
            net = gross - tax - ss;
        } else if(country === 'uk') {
            let pa = 12570;
            let taxable = Math.max(0, gross - pa);
            tax = taxable * 0.20;
            ss = Math.max(0, (gross - pa) * 0.08);
            net = gross - tax - ss;
        } else if (country === 'pt') {
            months = 14;
            ss = gross * 0.11;
            tax = gross * 0.14; 
            net = gross - tax - ss;
        } else if (country === 'it') {
            months = 13;
            ss = gross * 0.0919;
            tax = (gross - ss) * 0.23;
            net = gross - tax - ss;
        }

        return { gross, net, tax, ss, months };
    }

    function displayResults(r) {
        const sym = DOM.currency.innerText;
        const netMonth = r.net / r.months;
        const totalDeductions = (r.tax + r.ss) / r.months;

        DOM.resGross.innerText = `${r.gross.toFixed(2)} ${sym}`;
        DOM.resNet.innerText = `${netMonth.toFixed(2)} ${sym}`;
        DOM.resTax.innerText = `${totalDeductions.toFixed(2)} ${sym}`;

        if(state.isPro && r.gross > 0) {
            const total = r.net + r.tax + r.ss;
            const netPct = (r.net / total) * 100;
            const taxPct = (r.tax / total) * 100;
            const ssPct = (r.ss / total) * 100;

            document.getElementById('chart-net').setAttribute('stroke-dasharray', `${netPct}, 100`);
            document.getElementById('chart-tax').setAttribute('stroke-dasharray', `${taxPct}, 100`);
            document.getElementById('chart-ss').setAttribute('stroke-dasharray', `${ssPct}, 100`);
        }
    }

    // 8. LÓGICA DE COMPRA PRO
    function unlockPro() {
        state.isPro = true;
        document.querySelectorAll('.locked').forEach(el => el.classList.remove('locked'));
        document.getElementById('ad-banner-container').style.display = 'none'; 
        DOM.btnUpgrade.style.display = 'none'; 
        alert("¡Versión PRO Desbloqueada! Anuncios eliminados y funciones activadas.");
    }

    DOM.btnUpgrade.addEventListener('click', unlockPro);
    DOM.btnRestore.addEventListener('click', unlockPro);

    // Init SW
    if ('serviceWorker' in navigator) navigator.serviceWorker.register('./sw.js');

    // Arranque
    renderAdvancedOptions();
    updateLanguage();
});
