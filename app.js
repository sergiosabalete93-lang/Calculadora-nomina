document.addEventListener('DOMContentLoaded', () => {
    let state = { isPro: false, country: 'es', lang: 'es' };

    const i18n = {
        es: { sal: 'Sueldo', btn: 'CALCULAR', hours: 'Horas Semanales:', gross: 'Bruto:', net: 'Neto Mensual:', adv: '⚙️ Configuración Avanzada', pay: 'Pagas' },
        en: { sal: 'Salary', btn: 'CALCULATE', hours: 'Weekly Hours:', gross: 'Gross:', net: 'Monthly Net:', adv: '⚙️ Advanced Settings', pay: 'Payments' },
        it: { sal: 'Stipendio', btn: 'CALCOLA', hours: 'Ore Settimanali:', gross: 'Lordo:', net: 'Netto Mensile:', adv: '⚙️ Impostazioni Avanzate', pay: 'Mensilità' },
        pt: { sal: 'Salário', btn: 'CALCULAR', hours: 'Horas Semanais:', gross: 'Bruto:', net: 'Líquido Mensal:', adv: '⚙️ Definições Avançadas', pay: 'Prestações' }
    };

    const DOM = {
        sidebar: document.getElementById('settings-sidebar'),
        overlay: document.getElementById('sidebar-overlay'),
        openSets: document.getElementById('open-settings'),
        closeSets: document.getElementById('close-settings'),
        langSel: document.getElementById('lang-selector'),
        countrySel: document.getElementById('country-selector'),
        periodSel: document.getElementById('salary-period'),
        hourlyCfg: document.getElementById('hourly-config'),
        freeOpts: document.getElementById('free-options'),
        calcBtn: document.getElementById('calc-trigger-btn')
    };

    const updateUI = () => {
        const t = i18n[state.lang];
        document.getElementById('label-salary').innerText = t.sal;
        DOM.calcBtn.innerText = t.btn;
        document.getElementById('lbl-hours').innerText = t.hours;
        document.getElementById('lbl-adv-config').innerText = t.adv;
        renderOptions();
    };

    const renderOptions = () => {
        DOM.freeOpts.innerHTML = '';
        const isAnnual = DOM.periodSel.value === 'annual';
        const t = i18n[state.lang];

        if(state.country === 'es' && isAnnual) {
            DOM.freeOpts.innerHTML = `<div><label>${t.pay}</label><select id="es-pagas"><option value="12">12</option><option value="14">14</option></select></div>`;
        } else if(state.country === 'it' && isAnnual) {
            DOM.freeOpts.innerHTML = `<div><label>${t.pay}</label><select id="it-pagas"><option value="13">13</option><option value="14">14</option></select></div>`;
        }
    };

    DOM.openSets.onclick = () => { DOM.sidebar.classList.add('open'); DOM.overlay.classList.remove('hidden'); };
    DOM.closeSets.onclick = DOM.overlay.onclick = () => { DOM.sidebar.classList.remove('open'); DOM.overlay.classList.add('hidden'); };
    
    DOM.langSel.onchange = (e) => { state.lang = e.target.value; updateUI(); };
    DOM.countrySel.onchange = (e) => { state.country = e.target.value; updateUI(); };
    DOM.periodSel.onchange = (e) => { 
        DOM.hourlyCfg.classList.toggle('hidden', e.target.value !== 'hourly');
        renderOptions();
    };

    DOM.calcBtn.onclick = () => {
        const val = parseFloat(document.getElementById('main-salary').value) || 0;
        const period = DOM.periodSel.value;
        const hours = parseFloat(document.getElementById('hours-per-week').value) || 40;
        let annual = period === 'annual' ? val : (period === 'monthly' ? val * 12 : val * hours * 52);
        
        let months = 12;
        if(period === 'annual') {
            const payEl = document.getElementById(state.country + '-pagas');
            if(payEl) months = parseInt(payEl.value);
        }

        let net = annual * 0.80; // Ejemplo simplificado
        document.getElementById('res-gross').innerText = annual.toFixed(2);
        document.getElementById('res-net').innerText = (net / months).toFixed(2);
    };

    updateUI();
});
