// app.js - Motor Completo V2

document.addEventListener('DOMContentLoaded', () => {
    // 1. ESTADO GLOBAL
    let state = {
        isPro: false,
        country: 'es',
        lang: 'es',
        mode: 'normal', // normal, inverse, despido
        theme: localStorage.getItem('theme') || 'light'
    };

    // Aplicar tema guardado
    document.body.setAttribute('data-theme', state.theme);

    // 2. DICCIONARIO DE TRADUCCIONES
    const i18n = {
        es: { 
            symES: '€', symUK: '£', symIT: '€', symPT: '€',
            sal: 'Salario Bruto', net: 'Neto Mensual', tax: 'Deducciones',
            btnCalc: 'CALCULAR RESULTADOS', settings: 'Ajustes Generales'
        },
        en: { 
            sal: 'Gross Salary', net: 'Monthly Net', tax: 'Deductions',
            btnCalc: 'CALCULATE RESULTS', settings: 'General Settings'
        },
        it: { 
            sal: 'Stipendio Lordo', net: 'Netto Mensile', tax: 'Trattenute',
            btnCalc: 'CALCOLA RISULTATI', settings: 'Impostazioni'
        },
        pt: { 
            sal: 'Vencimento Bruto', net: 'Líquido Mensal', tax: 'Retenções',
            btnCalc: 'CALCULAR RESULTADOS', settings: 'Definições'
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
            // Cambiar placeholder según modo
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
        DOM.lblSal.innerText = state.mode === 'inverse' ? 'Objetivo Neto' : langData.sal;
        DOM.calcBtn.innerText = langData.btnCalc;
        document.getElementById('lbl-settings').innerText = langData.settings;
        
        // Asignar símbolo correcto según país seleccionado
        let symMap = { es: '€', it: '€', pt: '€', uk: '£' };
        DOM.currency.innerText = symMap[state.country];
    }

    // 7. MOTOR DE CÁLCULO Y ADMOB
    DOM.calcBtn.addEventListener('click', () => {
        // 1. Mostrar Anuncio Intersticial (Simulación AdMob Web/App)
        if (!state.isPro) {
            console.log("AdMob: Solicitando Intersticial ID: ca-app-pub-5962342027737970/3998701433");
            // Aquí en la app real el SDK de AdMob intercepta y muestra el anuncio a pantalla completa.
        }

        // 2. Ejecutar Cálculo
        const inputVal = parseFloat(DOM.salaryInput.value) || 0;
        const period = DOM.periodSel.value;
        
        // Normalizar todo a Anual primero
        let grossAnnual = inputVal;
        if (period === 'monthly') grossAnnual = inputVal * 12;
        if (period === 'hourly') grossAnnual = inputVal * 40 * 52; // Aproximación 40h/semana

        if(state.mode === 'inverse') {
            // Lógica inversa simple (Aprox)
            grossAnnual = grossAnnual * 1.35; 
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
            tax = manualIrpf ? (gross * (manualIrpf/100)) : (gross * 0.19); // Base 19% si no se pone
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
            tax = gross * 0.14; // Aprox IRS
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

        // Gráfico PRO
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
        document.getElementById('ad-banner-container').style.display = 'none'; // Quita banner
        DOM.btnUpgrade.style.display = 'none'; // Oculta botón comprar
        alert("¡Versión PRO Desbloqueada! Anuncios eliminados y funciones activadas.");
    }

    DOM.btnUpgrade.addEventListener('click', unlockPro);
    DOM.btnRestore.addEventListener('click', unlockPro); // Simulación de restauración

    // PWA Service Worker
    if ('serviceWorker' in navigator) navigator.serviceWorker.register('./sw.js');

    // Init
    renderAdvancedOptions();
    updateLanguage();
});
