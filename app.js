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

    // 2. DICCIONARIO COMPLETO (Traducciones Dinámicas)
    const i18n = {
        es: { 
            sal: 'Salario', btn: 'CALCULAR RESULTADOS', hours: 'Horas Semanales:', 
            gross: 'Sueldo Bruto:', net: 'Neto Mensual:', tax: 'Impuestos:', ss: 'Seg. Social:',
            adv: '⚙️ Configuración Avanzada', settings: 'Ajustes', pay: 'Pagas al Año'
        },
        en: { 
            sal: 'Salary', btn: 'CALCULATE RESULTS', hours: 'Weekly Hours:', 
            gross: 'Gross Pay:', net: 'Monthly Net:', tax: 'Taxes:', ss: 'Social Security:',
            adv: '⚙️ Advanced Settings', settings: 'Settings', pay: 'Annual Payments'
        },
        it: { 
            sal: 'Stipendio', btn: 'CALCOLA RISULTATI', hours: 'Ore Settimanali:', 
            gross: 'Lordo:', net: 'Netto Mensile:', tax: 'Imposte:', ss: 'Contributi (INPS):',
            adv: '⚙️ Impostazioni Avanzate', settings: 'Impostazioni', pay: 'Mensilità'
        },
        pt: { 
            sal: 'Salário', btn: 'CALCULAR RESULTADOS', hours: 'Horas Semanais:', 
            gross: 'Vencimento Bruto:', net: 'Líquido Mensal:', tax: 'IRS (Imposto):', ss: 'Seg. Social:',
            adv: '⚙️ Definições Avançadas', settings: 'Definições', pay: 'Prestações Anuais'
        }
    };

    // 3. REFERENCIAS DOM
    const DOM = {
        sidebar: document.getElementById('settings-sidebar'),
        openSets: document.getElementById('open-settings'),
        closeSets: document.getElementById('close-settings'),
        langSel: document.getElementById('lang-selector'),
        countrySel: document.getElementById('country-selector'),
        themeBtn: document.getElementById('theme-toggle'),
        modeBtns: document.querySelectorAll('.mode-btn'),
        salaryPeriod: document.getElementById('salary-period'),
        hourlyConfig: document.getElementById('hourly-config'),
        freeOpts: document.getElementById('free-options'),
        proOpts: document.getElementById('pro-options'),
        calcBtn: document.getElementById('calc-trigger-btn'),
        proBreakdown: document.getElementById('pro-breakdown'),
        btnUpgrade: document.getElementById('btn-upgrade'),
        btnRestore: document.getElementById('btn-restore'),
        currency: document.getElementById('currency-symbol'),
        privacyBtn: document.getElementById('btn-privacy'),
        privacyDiv: document.getElementById('privacy-content')
    };

    // 4. EVENTOS DE UI (Sidebar, Modos, Periodos)
    DOM.themeBtn.onclick = () => {
        state.theme = state.theme === 'light' ? 'dark' : 'light';
        document.body.setAttribute('data-theme', state.theme);
        localStorage.setItem('theme', state.theme);
    };

    DOM.openSets.onclick = () => DOM.sidebar.classList.add('open');
    DOM.closeSets.onclick = () => DOM.sidebar.classList.remove('open');

    DOM.langSel.onchange = (e) => { state.lang = e.target.value; updateLanguage(); };
    DOM.countrySel.onchange = (e) => { state.country = e.target.value; updateLanguage(); renderAdvancedOptions(); };

    DOM.modeBtns.forEach(btn => {
        btn.onclick = (e) => {
            if (e.target.classList.contains('pro-lock') && !state.isPro) {
                alert("Esta función requiere la versión PRO.");
                return;
            }
            DOM.modeBtns.forEach(b => b.classList.remove('active'));
            e.target.classList.add('active');
            state.mode = e.target.dataset.mode;
        };
    });

    DOM.salaryPeriod.onchange = (e) => {
        DOM.hourlyConfig.classList.toggle('hidden', e.target.value !== 'hourly');
        renderAdvancedOptions(); // Actualiza si muestra o no las pagas (12/14)
    };

    DOM.privacyBtn.onclick = () => DOM.privacyDiv.classList.toggle('hidden');

    // 5. RENDERIZADO DE OPCIONES POR PAÍS (Gratis y Pro)
    function renderAdvancedOptions() {
        DOM.freeOpts.innerHTML = '';
        DOM.proOpts.innerHTML = '';
        const isAnnual = DOM.salaryPeriod.value === 'annual';
        const t = i18n[state.lang];

        if(state.country === 'es') {
            let freeHtml = `<div><label>IRPF (%) Manual</label><input type="number" id="es-irpf" placeholder="Auto"></div>`;
            if (isAnnual) freeHtml += `<div><label>${t.pay}</label><select id="es-pagas"><option value="12">12</option><option value="14">14</option></select></div>`;
            DOM.freeOpts.innerHTML = freeHtml;
            
            DOM.proOpts.innerHTML = `
                <div><label>Hijos Menores</label><input type="number" id="es-hijos" placeholder="0"></div>
                <div><label>Discapacidad</label><select><option>No</option><option>>33%</option><option>>65%</option></select></div>
            `;
        } 
        else if(state.country === 'uk') {
            DOM.freeOpts.innerHTML = `
                <div><label>Pension (%)</label><input type="number" id="uk-pen" placeholder="5"></div>
                <div><label>2nd Job?</label><select><option value="no">No</option><option value="yes">Yes (BR)</option></select></div>
            `;
            DOM.proOpts.innerHTML = `
                <div><label>Tax Code</label><input type="text" id="uk-code" placeholder="1257L"></div>
                <div><label>Student Loan</label><select><option>None</option><option>Plan 1</option><option>Plan 2</option></select></div>
            `;
        } 
        else if(state.country === 'it') {
            let freeHtml = `<div><label>Familiari a carico</label><input type="number" placeholder="0"></div>`;
            if (isAnnual) freeHtml += `<div><label>${t.pay}</label><select id="it-pagas"><option value="13">13</option><option value="14">14</option></select></div>`;
            DOM.freeOpts.innerHTML = freeHtml;
            
            DOM.proOpts.innerHTML = `
                <div><label>Addizionale (%)</label><input type="number" placeholder="0"></div>
                <div><label>TFR</label><select><option>Si</option><option>No</option></select></div>
            `;
        } 
        else if(state.country === 'pt') {
            let freeHtml = `
                <div><label>Estado Civil</label><select><option>Solteiro</option><option>Casado (1 tit)</option></select></div>
                <div><label>Dependentes</label><input type="number" placeholder="0"></div>
            `;
            // PT siempre usa 14 pagas legalmente en anual, no damos opción a quitarlo.
            DOM.freeOpts.innerHTML = freeHtml;

            DOM.proOpts.innerHTML = `
                <div><label>Sub. Alimentação</label><input type="number" placeholder="Valor Dia"></div>
                <div><label>Região</label><select><option>Continente</option><option>Açores</option></select></div>
            `;
        }
    }

    // 6. ACTUALIZAR IDIOMAS
    function updateLanguage() {
        const t = i18n[state.lang];
        document.getElementById('label-salary').innerText = t.sal;
        DOM.calcBtn.innerText = t.btn;
        document.getElementById('lbl-settings').innerText = t.settings;
        document.getElementById('lbl-hours').innerText = t.hours;
        document.getElementById('lbl-adv-config').innerText = t.adv;
        document.getElementById('lbl-res-gross').innerText = t.gross;
        document.getElementById('lbl-res-net').innerText = t.net;
        document.getElementById('lbl-det-tax').innerText = t.tax;
        document.getElementById('lbl-det-ss').innerText = t.ss;
        
        let symMap = { es: '€', it: '€', pt: '€', uk: '£' };
        DOM.currency.innerText = symMap[state.country];
        renderAdvancedOptions();
    }

    // 7. MOTOR DE CÁLCULO
    DOM.calcBtn.onclick = () => {
        if (!state.isPro) console.log("AdMob: Intersticial ID ca-app-pub-5962342027737970/xxxxxx");

        const rawSal = parseFloat(document.getElementById('main-salary').value) || 0;
        const period = DOM.salaryPeriod.value;
        const hours = parseFloat(document.getElementById('hours-per-week').value) || 40;
        
        let annualGross = 0;
        if(period === 'annual') annualGross = rawSal;
        else if(period === 'monthly') annualGross = rawSal * 12;
        else if(period === 'hourly') annualGross = rawSal * hours * 52;

        let results = executeTaxEngine(annualGross, state.country);
        displayResults(results);
    };

    function executeTaxEngine(gross, country) {
        let tax = 0, ss = 0, months = 12;
        const isAnnual = DOM.salaryPeriod.value === 'annual';

        if(country === 'es') {
            if (isAnnual) months = parseInt(document.getElementById('es-pagas')?.value || 12);
            let manualIrpf = parseFloat(document.getElementById('es-irpf')?.value);
            
            ss = gross * 0.0647; 
            tax = !isNaN(manualIrpf) ? (gross * (manualIrpf/100)) : (gross * 0.19);
        } 
        else if(country === 'uk') {
            ss = Math.max(0, (gross - 12570) * 0.08);
            tax = Math.max(0, (gross - 12570) * 0.20);
        }
        else if(country === 'it') {
            if (isAnnual) months = parseInt(document.getElementById('it-pagas')?.value || 13);
            ss = gross * 0.0919;
            tax = Math.max(0, (gross - ss) * 0.23);
        }
        else if(country === 'pt') {
            months = isAnnual ? 14 : 12;
            ss = gross * 0.11;
            tax = gross * 0.145; 
        }

        return { gross, net: (gross - tax - ss), tax, ss, months };
    }

    function displayResults(r) {
        const netMonth = r.net / r.months;
        document.getElementById('res-gross').innerText = r.gross.toFixed(2) + ' ' + DOM.currency.innerText;
        document.getElementById('res-net').innerText = netMonth.toFixed(2) + ' ' + DOM.currency.innerText;
        
        if(state.isPro && r.gross > 0) {
            DOM.proBreakdown.classList.remove('hidden');
            document.getElementById('det-ss').innerText = (r.ss / r.months).toFixed(2);
            document.getElementById('det-tax').innerText = (r.tax / r.months).toFixed(2);

            const total = r.net + r.tax + r.ss;
            document.getElementById('chart-net').setAttribute('stroke-dasharray', `${(r.net/total)*100}, 100`);
            document.getElementById('chart-tax').setAttribute('stroke-dasharray', `${(r.tax/total)*100}, 100`);
            document.getElementById('chart-ss').setAttribute('stroke-dasharray', `${(r.ss/total)*100}, 100`);
        } else {
            DOM.proBreakdown.classList.add('hidden');
        }
    }

    // 8. FUNCIONES PRO
    function unlockPro() {
        state.isPro = true;
        document.querySelectorAll('.locked, .pro-lock').forEach(el => {
            el.classList.remove('locked');
            el.classList.remove('pro-lock');
            el.innerText = el.innerText.replace('🔒', '').trim();
        });
        document.getElementById('ad-banner-container').style.display = 'none';
        DOM.btnUpgrade.style.display = 'none';
        alert("Versión PRO Desbloqueada.");
    }

    DOM.btnUpgrade.onclick = unlockPro;
    DOM.btnRestore.onclick = unlockPro;

    // Inicialización
    updateLanguage();
});
