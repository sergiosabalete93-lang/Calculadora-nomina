document.addEventListener('DOMContentLoaded', () => {
    // 1. ESTADO GLOBAL
    let state = {
        isPro: localStorage.getItem('isPro') === 'true',
        country: localStorage.getItem('country') || 'es',
        lang: localStorage.getItem('lang') || 'es',
        mode: 'normal',
        theme: localStorage.getItem('theme') || 'light'
    };

    document.body.setAttribute('data-theme', state.theme);
    document.getElementById('country-selector').value = state.country;
    document.getElementById('lang-selector').value = state.lang;

    // 2. DICCIONARIO COMPLETO (100% Traducido)
    const i18n = {
        es: { 
            sal: 'Salario Base', btn: 'CALCULAR', hours: 'Horas Semanales:', 
            gross: 'Bruto Anual:', net: 'Neto Mensual:', tax: 'Impuestos (IRPF):', ss: 'Seguridad Social:',
            adv: '⚙️ Configuración Avanzada', settings: 'Ajustes', feat: 'Funciones Extra', chart: 'Desglose Visual',
            mode1: 'Nómina', mode2: 'Neto > Bruto 🔒', mode3: 'Despido 🔒',
            optAnn: 'Anual', optMon: 'Mensual', optHou: 'Por Hora',
            // Traducciones Avanzadas Dinámicas
            adv_pay: 'Pagas al Año', adv_irpf: 'IRPF % (Manual)', adv_hijos: 'Hijos Menores', adv_disc: 'Discapacidad',
            adv_pen: 'Pensión (%)', adv_2nd: '2º Trabajo?', adv_code: 'Tax Code', adv_loan: 'Student Loan',
            adv_fam: 'Familiares a Cargo', adv_add: 'Addizionale Regionale', adv_tfr: 'TFR en Nómina',
            adv_civ: 'Estado Civil', adv_dep: 'Dependentes', adv_sub: 'Sub. Alimentação (Día)', adv_reg: 'Região'
        },
        en: { 
            sal: 'Base Salary', btn: 'CALCULATE', hours: 'Weekly Hours:', 
            gross: 'Annual Gross:', net: 'Monthly Net:', tax: 'Income Tax:', ss: 'National Insurance:',
            adv: '⚙️ Advanced Settings', settings: 'Settings', feat: 'Pro Features', chart: 'Visual Breakdown',
            mode1: 'Salary', mode2: 'Net > Gross 🔒', mode3: 'Severance 🔒',
            optAnn: 'Annually', optMon: 'Monthly', optHou: 'Hourly',
            adv_pay: 'Payments/Year', adv_irpf: 'Custom Tax %', adv_hijos: 'Children', adv_disc: 'Disability',
            adv_pen: 'Pension (%)', adv_2nd: '2nd Job?', adv_code: 'Tax Code', adv_loan: 'Student Loan',
            adv_fam: 'Dependents', adv_add: 'Regional Tax', adv_tfr: 'TFR in Payslip',
            adv_civ: 'Marital Status', adv_dep: 'Dependents', adv_sub: 'Meal Allowance (Day)', adv_reg: 'Region'
        },
        it: { 
            sal: 'Stipendio Base', btn: 'CALCOLA', hours: 'Ore Settimanali:', 
            gross: 'Lordo Annuo:', net: 'Netto Mensile:', tax: 'Imposte (IRPEF):', ss: 'Contributi (INPS):',
            adv: '⚙️ Impostazioni Avanzate', settings: 'Impostazioni', feat: 'Funzioni Extra', chart: 'Grafico Fiscale',
            mode1: 'Busta Paga', mode2: 'Netto > Lordo 🔒', mode3: 'Licenziamento 🔒',
            optAnn: 'Annuale', optMon: 'Mensile', optHou: 'Orario',
            adv_pay: 'Mensilità', adv_irpf: 'IRPEF Manuale %', adv_hijos: 'Figli a carico', adv_disc: 'Disabilità',
            adv_pen: 'Pensione (%)', adv_2nd: '2° Lavoro?', adv_code: 'Tax Code', adv_loan: 'Student Loan',
            adv_fam: 'Familiari a Carico', adv_add: 'Addizionale Regionale', adv_tfr: 'TFR in Busta',
            adv_civ: 'Stato Civile', adv_dep: 'Persone a Carico', adv_sub: 'Buoni Pasto (Giorno)', adv_reg: 'Regione'
        },
        pt: { 
            sal: 'Salário Base', btn: 'CALCULAR', hours: 'Horas Semanais:', 
            gross: 'Bruto Anual:', net: 'Líquido Mensal:', tax: 'Imposto (IRS):', ss: 'Seg. Social:',
            adv: '⚙️ Definições Avançadas', settings: 'Definições', feat: 'Funções Extra', chart: 'Gráfico Fiscal',
            mode1: 'Salário', mode2: 'Líquido > Bruto 🔒', mode3: 'Despedimento 🔒',
            optAnn: 'Anual', optMon: 'Mensal', optHou: 'À Hora',
            adv_pay: 'Prestações/Ano', adv_irpf: 'IRS Manual %', adv_hijos: 'Filhos', adv_disc: 'Deficiência',
            adv_pen: 'Pensão (%)', adv_2nd: '2º Trabalho?', adv_code: 'Tax Code', adv_loan: 'Student Loan',
            adv_fam: 'Dependentes', adv_add: 'Imposto Regional', adv_tfr: 'TFR',
            adv_civ: 'Estado Civil', adv_dep: 'Dependentes', adv_sub: 'Sub. Alimentação (Dia)', adv_reg: 'Região'
        }
    };

    // 3. CACHEO DEL DOM
    const DOM = {
        sidebar: document.getElementById('settings-sidebar'),
        overlay: document.getElementById('sidebar-overlay'),
        openSets: document.getElementById('open-settings'),
        closeSets: document.getElementById('close-settings'),
        langSel: document.getElementById('lang-selector'),
        countrySel: document.getElementById('country-selector'),
        salaryPeriod: document.getElementById('salary-period'),
        hourlyConfig: document.getElementById('hourly-config'),
        freeOpts: document.getElementById('free-options'),
        proOpts: document.getElementById('pro-options'),
        calcBtn: document.getElementById('calc-trigger-btn'),
        proBreakdown: document.getElementById('pro-breakdown'),
        btnUpgrade: document.getElementById('btn-upgrade'),
        btnRestore: document.getElementById('btn-restore')
    };

    // 4. EVENTOS DE INTERFAZ
    document.getElementById('theme-toggle').onclick = () => {
        state.theme = state.theme === 'light' ? 'dark' : 'light';
        document.body.setAttribute('data-theme', state.theme);
        localStorage.setItem('theme', state.theme);
    };

    const toggleSidebar = (show) => {
        DOM.sidebar.classList.toggle('open', show);
        DOM.overlay.classList.toggle('hidden', !show);
    };
    DOM.openSets.onclick = () => toggleSidebar(true);
    DOM.closeSets.onclick = () => toggleSidebar(false);
    DOM.overlay.onclick = () => toggleSidebar(false);

    DOM.langSel.onchange = (e) => { 
        state.lang = e.target.value; 
        localStorage.setItem('lang', state.lang);
        updateLanguage(); 
    };
    
    DOM.countrySel.onchange = (e) => { 
        state.country = e.target.value; 
        localStorage.setItem('country', state.country);
        updateLanguage(); 
    };

    document.querySelectorAll('.mode-btn').forEach(btn => {
        btn.onclick = (e) => {
            if (e.target.classList.contains('pro-lock') && !state.isPro) {
                alert(i18n[state.lang].settings + ": Requiere PRO / Needs PRO.");
                return;
            }
            document.querySelectorAll('.mode-btn').forEach(b => b.classList.remove('active'));
            e.target.classList.add('active');
            state.mode = e.target.dataset.mode;
        };
    });

    // Control de Lógica de Entradas (Anual / Mensual / Horas)
    DOM.salaryPeriod.onchange = (e) => {
        const period = e.target.value;
        DOM.hourlyConfig.classList.toggle('hidden', period !== 'hourly');
        renderAdvancedOptions(); // Re-dibuja para mostrar u ocultar "Pagas"
    };

    // 5. RENDERIZAR CONFIGURACIÓN AVANZADA
    function renderAdvancedOptions() {
        DOM.freeOpts.innerHTML = '';
        DOM.proOpts.innerHTML = '';
        const isAnnual = DOM.salaryPeriod.value === 'annual';
        const t = i18n[state.lang];

        if(state.country === 'es') {
            let freeHtml = `<div><label>${t.adv_irpf}</label><input type="number" id="es-irpf" placeholder="Auto"></div>`;
            if (isAnnual) freeHtml += `<div><label>${t.adv_pay}</label><select id="es-pagas"><option value="12">12</option><option value="14">14</option></select></div>`;
            DOM.freeOpts.innerHTML = freeHtml;
            
            DOM.proOpts.innerHTML = `<div><label>${t.adv_hijos}</label><input type="number" placeholder="0"></div>
                                     <div><label>${t.adv_disc}</label><select><option>No</option><option>>33%</option></select></div>`;
        } 
        else if(state.country === 'uk') {
            DOM.freeOpts.innerHTML = `<div><label>${t.adv_pen}</label><input type="number" placeholder="5"></div>
                                      <div><label>${t.adv_2nd}</label><select><option>No</option><option>Yes</option></select></div>`;
            DOM.proOpts.innerHTML = `<div><label>${t.adv_code}</label><input type="text" placeholder="1257L"></div>
                                     <div><label>${t.adv_loan}</label><select><option>None</option><option>Plan 1</option></select></div>`;
        } 
        else if(state.country === 'it') {
            let freeHtml = `<div><label>${t.adv_fam}</label><input type="number" placeholder="0"></div>`;
            if (isAnnual) freeHtml += `<div><label>${t.adv_pay}</label><select id="it-pagas"><option value="13">13</option><option value="14">14</option></select></div>`;
            DOM.freeOpts.innerHTML = freeHtml;
            
            DOM.proOpts.innerHTML = `<div><label>${t.adv_add}</label><input type="number" placeholder="0"></div>
                                     <div><label>${t.adv_tfr}</label><select><option>No</option><option>Si</option></select></div>`;
        } 
        else if(state.country === 'pt') {
            let freeHtml = `<div><label>${t.adv_civ}</label><select><option>Solteiro</option><option>Casado</option></select></div>
                            <div><label>${t.adv_dep}</label><input type="number" placeholder="0"></div>`;
            // PT se asume 14 siempre en anual
            DOM.freeOpts.innerHTML = freeHtml;

            DOM.proOpts.innerHTML = `<div><label>${t.adv_sub}</label><input type="number" placeholder="0.00"></div>
                                     <div><label>${t.adv_reg}</label><select><option>Continente</option><option>Açores</option></select></div>`;
        }
    }

    // 6. ACTUALIZAR IDIOMA (Traduce toda la app)
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
        document.getElementById('lbl-pro-feat').innerText = t.feat;
        document.getElementById('lbl-chart').innerText = t.chart;
        
        document.getElementById('mode-normal').innerText = t.mode1;
        document.getElementById('mode-inverse').innerText = state.isPro ? t.mode2.replace(' 🔒','') : t.mode2;
        document.getElementById('mode-despido').innerText = state.isPro ? t.mode3.replace(' 🔒','') : t.mode3;
        
        document.getElementById('opt-ann').innerText = t.optAnn;
        document.getElementById('opt-mon').innerText = t.optMon;
        document.getElementById('opt-hou').innerText = t.optHou;

        let symMap = { es: '€', it: '€', pt: '€', uk: '£' };
        document.getElementById('currency-symbol').innerText = symMap[state.country];
        
        renderAdvancedOptions(); // Re-renderiza para traducir etiquetas avanzadas
    }

    // 7. MOTOR DE CÁLCULO
    DOM.calcBtn.onclick = () => {
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
        const sym = document.getElementById('currency-symbol').innerText;
        document.getElementById('res-gross').innerText = r.gross.toFixed(2) + ' ' + sym;
        document.getElementById('res-net').innerText = netMonth.toFixed(2) + ' ' + sym;
        
        if(state.isPro && r.gross > 0) {
            DOM.proBreakdown.classList.remove('hidden');
            document.getElementById('det-ss').innerText = (r.ss / r.months).toFixed(2) + ' ' + sym;
            document.getElementById('det-tax').innerText = (r.tax / r.months).toFixed(2) + ' ' + sym;

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
        localStorage.setItem('isPro', 'true');
        document.querySelectorAll('.locked, .pro-lock').forEach(el => {
            el.classList.remove('locked');
            el.classList.remove('pro-lock');
            el.innerText = el.innerText.replace('🔒', '').trim();
        });
        document.getElementById('ad-banner-container').style.display = 'none';
        DOM.btnUpgrade.style.display = 'none';
        toggleSidebar(false);
        alert("¡Versión PRO Desbloqueada!");
        DOM.calcBtn.click(); // Recalcular para mostrar gráficos
    }

    DOM.btnUpgrade.onclick = unlockPro;
    DOM.btnRestore.onclick = unlockPro;

    // Inicialización al arrancar
    if (state.isPro) unlockPro();
    updateLanguage();
    // Renderiza la vista inicial según si es anual o mensual
    DOM.salaryPeriod.dispatchEvent(new Event('change'));
});
