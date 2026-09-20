(function () {
  const root = document.getElementById("doh-app");
  if (!root) return;

  const MONTHS = 12;
  const CONTRIB_RATE = 0.221;
  const PENSION_CREDIT_RATE = 0.135;
  const NORM_COST = 0.1;
  const IP_WITHHOLDING = 0.25;
  const VOL_PENSION_SHARE = 0.05844;

  const LAWS = {
    current: {
      id: "current",
      ppBruto: 30370.83,
      ppNeto: 19263.19,
      holidayExempt: 2530.9025,
      brackets: [
        { limit: 9210.26, rate: 0.16, taxBefore: 0, prev: 0 },
        { limit: 27089, rate: 0.26, taxBefore: 1473.64, prev: 9210.26 },
        { limit: 54178, rate: 0.33, taxBefore: 6122.11, prev: 27089 },
        { limit: 78016.32, rate: 0.39, taxBefore: 15061.48, prev: 54178 },
        { limit: Infinity, rate: 0.5, taxBefore: 24358.43, prev: 78016.32 },
      ],
      general: 5260,
      extraUntil: 16832,
      extraK: 19736.99,
      extraL: 1.17259,
      disabled: 19134.42,
      over70: 1578,
      student: 3682,
      familyMember: 2838.3,
      child1: 2838.3,
      child2extra: 247.22,
      childNextra: 2060.87,
      disabilityExtra: 7447.1,
      volPensionMax: 3054.65,
      young: 1367.6,
      volunteer: 1578,
      applyDependentMonths: true,
    },
    previous: {
      id: "previous",
      ppBruto: 30370.83,
      ppNeto: 19263.19,
      holidayExempt: 2530.9025,
      brackets: [
        { limit: 10468.37654316, rate: 0.16, taxBefore: 0, prev: 0 },
        { limit: 30789.342774, rate: 0.26, taxBefore: 1674.9402469056, prev: 10468.37654316 },
        { limit: 61578.685548, rate: 0.33, taxBefore: 6958.391466924, prev: 30789.342774 },
        { limit: 88673.30718912, rate: 0.39, taxBefore: 17118.874582344, prev: 61578.685548 },
        { limit: Infinity, rate: 0.45, taxBefore: 27685.7770223808, prev: 88673.30718912 },
      ],
      general: 7500,
      extraUntil: 16400.65188238056,
      extraK: 23030.942547083763,
      extraL: 1.40427,
      disabled: 21748.168849421523,
      over70: 1793.553948,
      student: 4184.959212,
      familyMember: 2510.03,
      child1: 3001.2494773989606,
      child2extra: 261.48820863312,
      childNextra: 2179.0248473976,
      disabilityExtra: 7873.54639037784,
      volPensionMax: 3471.9139044331205,
      young: 1554.4134216,
      volunteer: 1793.553948,
      applyDependentMonths: false,
    },
  };

  const OD_BRACKETS = [
    { limit: 241.49, amounts: [143.81, 158.18, 172.58], pupil: [143.81, 158.18, 172.58] },
    { limit: 402.5, amounts: [122.94, 135.91, 148.8], pupil: [122.94, 135.91, 148.8] },
    { limit: 483.01, amounts: [93.71, 104.73, 115.73], pupil: [93.71, 104.73, 115.73] },
    { limit: 563.5, amounts: [73.91, 84.33, 94.95], pupil: [73.91, 84.33, 94.95] },
    { limit: 711.12, amounts: [60.43, 70.52, 80.55], pupil: [60.43, 70.52, 80.55] },
    { limit: 858.67, amounts: [38.29, 47.92, 57.5], pupil: [38.29, 47.92, 57.5] },
    { limit: 1100.2, amounts: [28.74, 38.29, 47.92], pupil: [36.27, 45.83, 62.45] },
    { limit: 1328.28, amounts: [25.02, 34.6, 44.16], pupil: [28.79, 38.37, 50.18] },
  ];
  const OD_LARGE3 = 496.93;
  const OD_LARGE4 = 603.86;
  const STIP_BRACKETS = [
    { limit: 402.5, under18: 137.44, over18: 274.87 },
    { limit: 483.01, under18: 115.75, over18: 231.49 },
    { limit: 563.5, under18: 94.03, over18: 188.08 },
    { limit: 711.12, under18: 72.34, over18: 144.67 },
    { limit: 858.67, under18: 50.71, over18: 101.2 },
    { limit: 1100.2, under18: 38.14, over18: 76.29 },
    { limit: 1328.28, under18: 33.2, over18: 66.41 },
  ];
  const STIP_IGNORE_SHARE = 28.762;

  const eur = new Intl.NumberFormat("sl-SI", {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  const state = {
    period: "month",
    taxpayers: 1,
    children: [],
    transferRemainder: true,
    t1: emptyPerson(),
    t2: emptyPerson(),
  };

  function emptyPerson() {
    return {
      salary: 0,
      bonuses: 0,
      holiday: 0,
      otherEmployment: 0,
      pension: 0,
      maternity: 0,
      otherWork: 0,
      perfTaxed: 0,
      perfUntaxed: 0,
      winter: 0,
      contract: 0,
      contractCosts: 0,
      student: 0,
      studentCosts: 0,
      cadastral: 0,
      ipRights: 0,
      otherIncome: 0,
      contrib: null,
      withheld: 0,
      purpose: 0,
      volPension: 0,
      disabled: false,
      studentFlag: false,
      over70: false,
      volunteer: false,
      youngMonths: 0,
      dependentMonths: 0,
    };
  }

  function num(v) {
    if (v == null || v === "") return 0;
    const n = Number(String(v).replace(",", "."));
    return Number.isFinite(n) ? n : 0;
  }

  function clamp(v, min, max) {
    return Math.min(max, Math.max(min, v));
  }

  function incomeTax(base, law) {
    if (base <= 0) return 0;
    for (const b of law.brackets) {
      if (base < b.limit) return b.taxBefore + (base - b.prev) * b.rate;
    }
    const last = law.brackets[law.brackets.length - 1];
    return last.taxBefore + (base - last.prev) * last.rate;
  }

  function generalAllowance(gross, dependentMonths, law) {
    let allowance =
      gross < law.extraUntil ? law.general + (law.extraK - law.extraL * gross) : law.general;
    if (law.applyDependentMonths && dependentMonths) {
      allowance *= (MONTHS - clamp(dependentMonths, 0, MONTHS)) / MONTHS;
    }
    return Math.max(0, allowance);
  }

  function childAnnual(rank, disabled, law) {
    if (rank < 1) return 0;
    let amount = law.child1;
    if (rank >= 2) amount += law.child2extra;
    if (rank >= 3) amount += (rank - 2) * law.childNextra;
    if (disabled) amount += law.disabilityExtra;
    return amount;
  }

  function annualize(person, period) {
    const m = period === "month" ? MONTHS : 1;
    const once = 1;
    return {
      salary: person.salary * m,
      bonuses: person.bonuses * m,
      holiday: person.holiday * once,
      otherEmployment: person.otherEmployment * m,
      pension: person.pension * m,
      maternity: person.maternity * m,
      otherWork: person.otherWork * m,
      perfTaxed: person.perfTaxed * once,
      perfUntaxed: person.perfUntaxed * once,
      winter: person.winter * once,
      contract: person.contract * m,
      contractCosts: person.contractCosts * m,
      student: person.student * m,
      studentCosts: person.studentCosts * m,
      cadastral: person.cadastral * once,
      ipRights: person.ipRights * once,
      otherIncome: person.otherIncome * once,
      contrib: person.contrib == null ? null : person.contrib * m,
      withheld: person.withheld * m,
      purpose: person.purpose * once,
      volPension: person.volPension * once,
      disabled: person.disabled,
      studentFlag: person.studentFlag,
      over70: person.over70,
      volunteer: person.volunteer,
      youngMonths: person.youngMonths,
      dependentMonths: person.dependentMonths,
    };
  }

  function employmentGross(p, law) {
    const holidayTaxable = Math.max(0, p.holiday - law.holidayExempt);
    return (
      p.salary +
      p.bonuses +
      holidayTaxable +
      p.otherEmployment +
      p.pension +
      p.maternity +
      p.otherWork +
      p.perfTaxed
    );
  }

  function otherGross(p) {
    return p.contract + p.student + p.cadastral + p.ipRights + p.otherIncome;
  }

  function personCalc(p, childAllow, otherAllow, transferIn, law, isFirst) {
    const holidayTaxable = Math.max(0, p.holiday - law.holidayExempt);
    const empGross = employmentGross(p, law);
    const othGross = otherGross(p);
    const contractCost = p.contract ? Math.max(p.contractCosts, NORM_COST * p.contract) : 0;
    const studentCost = p.student ? Math.max(p.studentCosts, NORM_COST * p.student) : 0;
    const ipCost = NORM_COST * p.ipRights;
    const costs = contractCost + studentCost + ipCost;
    const autoContrib =
      CONTRIB_RATE *
      (p.salary + p.bonuses + p.otherEmployment + p.maternity + p.otherWork + p.perfTaxed + holidayTaxable);
    const contrib = p.contrib == null ? autoContrib : p.contrib;
    const ipWithheld = IP_WITHHOLDING * Math.max(0, p.ipRights - ipCost);
    const withheld = p.withheld + ipWithheld;

    const gross = empGross + othGross;
    const base1 = Math.max(0, gross - contrib - costs);

    const general = generalAllowance(gross, p.dependentMonths, law);
    const volCap = Math.min(law.volPensionMax, VOL_PENSION_SHARE * Math.max(0, empGross - p.bonuses));
    const volPension = Math.min(Math.max(0, p.volPension), volCap);
    const studentAllow = p.studentFlag ? Math.min(p.student, law.student) : 0;
    const otherRelief =
      (p.disabled ? law.disabled : 0) +
      (p.over70 ? law.over70 : 0) +
      studentAllow +
      (p.volunteer ? law.volunteer : 0) +
      (p.youngMonths > 0 ? (law.young / MONTHS) * p.youngMonths : 0);

    const familyAllow = childAllow + otherAllow + transferIn;
    const reductions = general + p.purpose + volPension + otherRelief + familyAllow;
    const unused =
      base1 - general - p.purpose - volPension > 0
        ? familyAllow > base1 - general - p.purpose - volPension
          ? Math.max(0, reductions - base1)
          : 0
        : familyAllow;

    const reduced = Math.max(0, base1 - reductions);
    const taxRaw = incomeTax(reduced, law);
    const pensionCredit = PENSION_CREDIT_RATE * p.pension;
    const taxDue = pensionCredit > 0 ? Math.max(0, taxRaw - pensionCredit) : taxRaw;
    const settle = taxRaw - withheld - pensionCredit;
    const refundOrPay = settle > 0 ? settle : Math.min(Math.abs(settle), withheld);
    const netCore = gross - contrib - taxDue + (p.holiday - holidayTaxable) + p.perfUntaxed;
    const net = (gross - contrib - taxRaw > 0 ? netCore : 0) + p.winter;

    const usedFamily = familyAllow - unused;
    const taxWithoutFamily = incomeTax(reduced + usedFamily, law);
    const familySaving = Math.max(0, taxWithoutFamily - taxRaw);

    return {
      gross,
      contrib,
      costs,
      base1,
      general,
      familyAllow,
      unused,
      reduced,
      taxRaw,
      taxDue,
      pensionCredit,
      withheld,
      settle,
      refundOrPay,
      net,
      familySaving,
      autoContrib,
    };
  }

  function dependentsFor(personIndex, children, others, law, isFirst) {
    let rank = 0;
    let childAllow = 0;
    children.forEach((child) => {
      const total = clamp(Math.round(child.monthsTotal || 0), 0, MONTHS);
      const t1 = clamp(Math.round(child.monthsT1 || 0), 0, total);
      const months = personIndex === 1 ? t1 : total - t1;
      if (total > 0 && months > 0) {
        rank += 1;
        childAllow += (childAnnual(rank, !!child.disabled, law) * months) / MONTHS;
      }
    });
    let otherAllow = 0;
    others.forEach((dep) => {
      const total = clamp(Math.round(dep.monthsTotal || 0), 0, MONTHS);
      const t1 = clamp(Math.round(dep.monthsT1 || 0), 0, total);
      const months = personIndex === 1 ? t1 : total - t1;
      if (total > 0 && months > 0) {
        if (isFirst) otherAllow += (law.familyMember * months) / MONTHS;
        else otherAllow += (0.1 * law.ppBruto * months) / MONTHS;
      }
    });
    return { childAllow, otherAllow };
  }

  function household(model, law) {
    const t1p = annualize(model.t1, model.period);
    const t2p = annualize(model.t2, model.period);
    const two = model.taxpayers === 2;
    const others = model.others || [];

    let t1 = null;
    let t2 = two ? null : zeroPerson();
    let transfer1 = 0;
    let transfer2 = 0;

    for (let i = 0; i < 8; i++) {
      const d1 = dependentsFor(1, model.children, others, law, true);
      const d2 = two ? dependentsFor(2, model.children, others, law, false) : { childAllow: 0, otherAllow: 0 };
      t1 = personCalc(t1p, d1.childAllow, d1.otherAllow, model.transferRemainder ? transfer1 : 0, law, true);
      t2 = two
        ? personCalc(t2p, d2.childAllow, d2.otherAllow, model.transferRemainder ? transfer2 : 0, law, false)
        : zeroPerson();
      const next1 = two && model.transferRemainder ? t2.unused : 0;
      const next2 = two && model.transferRemainder ? t1.unused : 0;
      if (Math.abs(next1 - transfer1) < 0.01 && Math.abs(next2 - transfer2) < 0.01) break;
      transfer1 = next1;
      transfer2 = next2;
    }

    const taxTogether = t1.taxDue + t2.taxDue;
    const netTogether = t1.net + t2.net;
    const familySaving = t1.familySaving + t2.familySaving;
    const settle = t1.settle + t2.settle;
    const members = (two && t2.gross > 0 ? 2 : 1) + model.children.length;
    const netMonthlyMember = members ? netTogether / MONTHS / members : 0;

    return {
      t1,
      t2,
      taxTogether,
      netTogether,
      familySaving,
      settle,
      members,
      netMonthlyMember,
      two,
    };
  }

  function zeroPerson() {
    return {
      gross: 0,
      contrib: 0,
      costs: 0,
      base1: 0,
      general: 0,
      familyAllow: 0,
      unused: 0,
      reduced: 0,
      taxRaw: 0,
      taxDue: 0,
      pensionCredit: 0,
      withheld: 0,
      settle: 0,
      refundOrPay: 0,
      net: 0,
      familySaving: 0,
      autoContrib: 0,
    };
  }

  function childBenefit(model, netTogether) {
    const nParents = model.taxpayers;
    const kids = model.children;
    if (!kids.length) return { eligible: false, monthly: 0, klass: null, stipendUnder: null, stipendOver: null };
    const members = nParents + kids.length;
    const monthlyMember = netTogether / MONTHS / members;
    const klass = OD_BRACKETS.findIndex((b) => monthlyMember < b.limit);
    if (klass < 0) {
      return { eligible: false, monthly: 0, klass: null, monthlyMember, stipendUnder: null, stipendOver: null };
    }
    const row = OD_BRACKETS[klass];
    let monthly = 0;
    kids.forEach((child, i) => {
      const idx = i === 0 ? 0 : i === 1 ? 1 : 2;
      monthly += child.pupil ? row.pupil[idx] : row.amounts[idx];
    });
    if (kids.length === 3) monthly += OD_LARGE3 / MONTHS;
    if (kids.length >= 4) monthly += OD_LARGE4 / MONTHS;

    const stipendIncome = netTogether + Math.max(0, monthly * MONTHS - kids.length * STIP_IGNORE_SHARE * MONTHS);
    const stipendMember = stipendIncome / MONTHS / members;
    const sKlass = STIP_BRACKETS.find((b) => stipendMember < b.limit);
    return {
      eligible: true,
      monthly,
      klass: klass + 1,
      monthlyMember,
      stipendUnder: sKlass ? sKlass.under18 : null,
      stipendOver: sKlass ? sKlass.over18 : null,
    };
  }

  function optimizeSplit(model) {
    if (model.taxpayers !== 2 || !model.children.length) return model.children;
    const n = model.children.length;
    const steps = n <= 4 ? 1 : n <= 6 ? 3 : 4;
    let best = model.children.map((c) => ({ ...c }));
    let bestTax = Infinity;

    function walk(i, current) {
      if (i === n) {
        const next = { ...model, children: current };
        const tax = household(next, LAWS.current).taxTogether;
        if (tax < bestTax - 0.005) {
          bestTax = tax;
          best = current.map((c) => ({ ...c }));
        }
        return;
      }
      const child = model.children[i];
      const total = clamp(Math.round(child.monthsTotal || MONTHS), 0, MONTHS);
      for (let m = 0; m <= total; m += steps) {
        current[i] = { ...child, monthsT1: m };
        walk(i + 1, current);
      }
      if (total % steps !== 0) {
        current[i] = { ...child, monthsT1: total };
        walk(i + 1, current);
      }
    }

    walk(0, model.children.map((c) => ({ ...c })));
    return best;
  }

  function money(v) {
    return eur.format(v || 0);
  }

  const els = {
    period: root.querySelectorAll("[data-period]"),
    who: root.querySelectorAll("[data-who]"),
    partner: root.querySelector("[data-panel=partner]"),
    children: root.querySelector("[data-children]"),
    addChild: root.querySelector("[data-add-child]"),
    optimize: root.querySelector("[data-optimize]"),
    example: root.querySelector("[data-example]"),
    reset: root.querySelector("[data-reset]"),
    transfer: root.querySelector("[data-transfer]"),
    results: root.querySelector("[data-results]"),
  };

  function readPerson(prefix) {
    const g = (name) => root.querySelector(`[name="${prefix}-${name}"]`);
    const checked = (name) => {
      const el = g(name);
      return !!(el && el.checked);
    };
    const val = (name) => num(g(name) && g(name).value);
    const contribEl = g("contrib");
    const contribEmpty = contribEl && contribEl.value.trim() === "";
    return {
      salary: val("salary"),
      bonuses: val("bonuses"),
      holiday: val("holiday"),
      otherEmployment: val("otherEmployment"),
      pension: val("pension"),
      maternity: val("maternity"),
      otherWork: val("otherWork"),
      perfTaxed: val("perfTaxed"),
      perfUntaxed: val("perfUntaxed"),
      winter: val("winter"),
      contract: val("contract"),
      contractCosts: val("contractCosts"),
      student: val("student"),
      studentCosts: val("studentCosts"),
      cadastral: val("cadastral"),
      ipRights: val("ipRights"),
      otherIncome: val("otherIncome"),
      contrib: contribEmpty ? null : val("contrib"),
      withheld: val("withheld"),
      purpose: val("purpose"),
      volPension: val("volPension"),
      disabled: checked("disabled"),
      studentFlag: checked("studentFlag"),
      over70: checked("over70"),
      volunteer: checked("volunteer"),
      youngMonths: val("youngMonths"),
      dependentMonths: val("dependentMonths"),
    };
  }

  function writePerson(prefix, person, period) {
    const set = (name, value, isCheck) => {
      const el = root.querySelector(`[name="${prefix}-${name}"]`);
      if (!el) return;
      if (isCheck) el.checked = !!value;
      else el.value = value ? String(value) : "";
    };
    Object.keys(emptyPerson()).forEach((key) => {
      set(key, person[key], typeof person[key] === "boolean");
    });
    if (person.contrib == null) set("contrib", "");
  }

  function syncLabels() {
    const unit = state.period === "month" ? "mesečno" : "letno";
    root.querySelectorAll("[data-unit]").forEach((el) => {
      el.textContent = unit;
    });
    root.querySelectorAll("[data-once]").forEach((el) => {
      el.textContent = "letno";
    });
  }

  function renderChildren() {
    const two = state.taxpayers === 2;
    if (!state.children.length) {
      els.children.innerHTML =
        '<p class="doh-empty">Ni vpisanih otrok. Dodajte jih, če uveljavljate olajšavo za vzdrževane otroke.</p>';
      return;
    }
    els.children.innerHTML = state.children
      .map((child, i) => {
        const total = clamp(Math.round(child.monthsTotal || MONTHS), 1, MONTHS);
        const t1 = clamp(Math.round(child.monthsT1 || 0), 0, total);
        const t2 = total - t1;
        return `<article class="doh-child" data-child="${i}">
          <header class="doh-child__head">
            <strong>${i + 1}. otrok</strong>
            <button type="button" class="doh-icon-btn" data-remove-child="${i}" aria-label="Odstrani otroka">×</button>
          </header>
          <label class="doh-field">
            <span>Meseci vzdrževanja</span>
            <input type="number" min="1" max="12" step="1" inputmode="numeric" value="${total}" data-child-field="monthsTotal">
          </label>
          ${
            two
              ? `<div class="doh-split">
                  <div class="doh-split__meta">
                    <span>Zavezanec 1: <strong>${t1} mes.</strong></span>
                    <span>Zavezanec 2: <strong>${t2} mes.</strong></span>
                  </div>
                  <input type="range" min="0" max="${total}" step="1" value="${t1}" data-child-field="monthsT1" aria-label="Meseci olajšave pri zavezancu 1">
                </div>`
              : ""
          }
          <div class="doh-checks">
            <label><input type="checkbox" data-child-field="disabled" ${child.disabled ? "checked" : ""}> Motnja v razvoju</label>
            <label><input type="checkbox" data-child-field="pupil" ${child.pupil ? "checked" : ""}> Dijak</label>
          </div>
        </article>`;
      })
      .join("");
  }

  function readState() {
    state.t1 = readPerson("t1");
    state.t2 = readPerson("t2");
    state.transferRemainder = !!(els.transfer && els.transfer.checked);
    return state;
  }

  function hasIncome(model) {
    const p = annualize(model.t1, model.period);
    const q = annualize(model.t2, model.period);
    return employmentGross(p, LAWS.current) + otherGross(p) + (model.taxpayers === 2 ? employmentGross(q, LAWS.current) + otherGross(q) : 0) > 0;
  }

  function renderResults() {
    readState();
    const current = household(state, LAWS.current);
    const ready = hasIncome(state);
    const od = childBenefit(state, current.netTogether);
    const settleLabel = current.settle >= 0 ? "Doplačilo" : "Vrnjeno";
    const t1Settle = current.t1.settle >= 0 ? "Doplačilo zavezanca 1" : "Vrnjeno zavezancu 1";
    const t2Settle = current.t2.settle >= 0 ? "Doplačilo zavezanca 2" : "Vrnjeno zavezancu 2";
    const withheldUsed = current.t1.withheld + current.t2.withheld > 0.004;
    const splitLine = state.children.length
      ? state.children
          .map((child, i) => {
            const total = child.monthsTotal || MONTHS;
            const t1 = child.monthsT1 || 0;
            return current.two
              ? `${i + 1}. otrok: ${t1} + ${total - t1} mes.`
              : `${i + 1}. otrok: ${total} mes.`;
          })
          .join(" · ")
      : "";

    els.results.classList.toggle("is-empty", !ready);
    els.results.innerHTML = ready
      ? `<div class="doh-result__hero">
          <p class="doh-kicker">Skupni mesečni neto dohodek</p>
          <p class="doh-result__big">${money(current.netTogether / MONTHS)}</p>
          <p class="doh-result__sub">${money(current.netTogether)} letno</p>
        </div>
        <dl class="doh-stats">
          <div>
            <dt>Dohodnina</dt>
            <dd>${money(current.taxTogether)}</dd>
          </div>
          ${
            withheldUsed
              ? `<div>
            <dt>${settleLabel}</dt>
            <dd class="${current.settle > 0.004 ? "is-pay" : current.settle < -0.004 ? "is-back" : ""}">${money(Math.abs(current.settle))}</dd>
          </div>`
              : `<div>
            <dt>Davčni prihranek zaradi otrok</dt>
            <dd>${money(current.familySaving)}</dd>
          </div>`
          }
          ${
            withheldUsed
              ? `<div>
            <dt>Davčni prihranek zaradi otrok</dt>
            <dd>${money(current.familySaving)}</dd>
          </div>`
              : ""
          }
          <div>
            <dt>Na družinskega člana</dt>
            <dd>${money(current.netMonthlyMember)} / mes.</dd>
          </div>
        </dl>
        ${splitLine ? `<p class="doh-split-line">${splitLine}</p>` : ""}
        <div class="doh-people">
          <article>
            <h3>Zavezanec 1</h3>
            <p><span>Neto</span> <strong>${money(current.t1.net / MONTHS)}</strong> <span class="doh-people__unit">/ mes.</span></p>
            <p><span>Dohodnina</span> <strong>${money(current.t1.taxDue)}</strong> <span class="doh-people__unit"></span></p>
            ${withheldUsed ? `<p><span>${t1Settle}</span> <strong>${money(Math.abs(current.t1.settle))}</strong> <span class="doh-people__unit"></span></p>` : ""}
          </article>
          ${
            current.two
              ? `<article>
            <h3>Zavezanec 2</h3>
            <p><span>Neto</span> <strong>${money(current.t2.net / MONTHS)}</strong> <span class="doh-people__unit">/ mes.</span></p>
            <p><span>Dohodnina</span> <strong>${money(current.t2.taxDue)}</strong> <span class="doh-people__unit"></span></p>
            ${withheldUsed ? `<p><span>${t2Settle}</span> <strong>${money(Math.abs(current.t2.settle))}</strong> <span class="doh-people__unit"></span></p>` : ""}
          </article>`
              : ""
          }
        </div>
        ${
          state.children.length
            ? `<div class="doh-od">
                <h3>Otroški dodatek in štipendija</h3>
                ${
                  od.eligible
                    ? `<p>Okvirni otroški dodatek: <strong>${money(od.monthly)}</strong> mesečno (razred ${od.klass}). Dohodek na družinskega člana: ${money(od.monthlyMember)} mesečno.</p>
                       <p>Osnovni znesek državne štipendije: <strong>${od.stipendUnder == null ? "ne pripada" : money(od.stipendUnder) + " / mes."}</strong> do 18 let, <strong>${od.stipendOver == null ? "ne pripada" : money(od.stipendOver) + " / mes."}</strong> nad 18 let.</p>`
                    : `<p>Po tem izračunu dohodek presega cenzus za otroški dodatek. Otroški dodatek vam ne pripada. Dejansko odločitev sprejme CSD.</p>`
                }
                <p class="doh-note">Izračun otroškega dodatka in štipendije je okviren. Tudi če se izpiše, da vam ne pripada, to preverite še na CSD.</p>
              </div>`
            : ""
        }`
      : `<div class="doh-result__hero">
          <p class="doh-kicker">Skupni mesečni neto dohodek</p>
          <p class="doh-result__big doh-result__big--muted">0,00 €</p>
          <p class="doh-result__sub">Vnesite bruto plačo, da vidite izračun.</p>
        </div>`;
  }

  function setWho(n) {
    state.taxpayers = n;
    root.querySelectorAll("[data-who]").forEach((btn) => {
      btn.setAttribute("aria-pressed", btn.getAttribute("data-who") === String(n) ? "true" : "false");
    });
    if (els.partner) els.partner.hidden = n !== 2;
    if (n === 1) {
      state.children.forEach((c) => {
        c.monthsT1 = c.monthsTotal || MONTHS;
      });
    }
    renderChildren();
    renderResults();
  }

  function setPeriod(period) {
    if (period === state.period) return;
    const fromMonth = state.period === "month";
    readState();
    const scale = fromMonth ? MONTHS : 1 / MONTHS;
    const scalePerson = (p) => {
      ["salary", "bonuses", "otherEmployment", "pension", "maternity", "otherWork", "contract", "contractCosts", "student", "studentCosts", "contrib", "withheld"].forEach((k) => {
        if (p[k] == null) return;
        p[k] = Math.round(p[k] * scale * 100) / 100;
      });
    };
    scalePerson(state.t1);
    scalePerson(state.t2);
    state.period = period;
    writePerson("t1", state.t1);
    writePerson("t2", state.t2);
    root.querySelectorAll("[data-period]").forEach((btn) => {
      btn.setAttribute("aria-pressed", btn.getAttribute("data-period") === period ? "true" : "false");
    });
    syncLabels();
    renderResults();
  }

  root.addEventListener("input", (ev) => {
    const childBox = ev.target.closest("[data-child]");
    if (childBox) {
      const i = Number(childBox.getAttribute("data-child"));
      const field = ev.target.getAttribute("data-child-field");
      if (field === "monthsTotal") {
        state.children[i].monthsTotal = clamp(Math.round(num(ev.target.value) || MONTHS), 1, MONTHS);
        state.children[i].monthsT1 = clamp(state.children[i].monthsT1 || 0, 0, state.children[i].monthsTotal);
        if (state.taxpayers === 1) state.children[i].monthsT1 = state.children[i].monthsTotal;
        renderChildren();
      } else if (field === "monthsT1") {
        state.children[i].monthsT1 = clamp(Math.round(num(ev.target.value)), 0, state.children[i].monthsTotal || MONTHS);
        const meta = childBox.querySelector(".doh-split__meta");
        if (meta) {
          const t1 = state.children[i].monthsT1;
          const t2 = (state.children[i].monthsTotal || MONTHS) - t1;
          meta.innerHTML = `<span>Zavezanec 1: <strong>${t1} mes.</strong></span><span>Zavezanec 2: <strong>${t2} mes.</strong></span>`;
        }
      } else if (field === "disabled" || field === "pupil") {
        state.children[i][field] = ev.target.checked;
      }
    }
    renderResults();
  });

  root.addEventListener("click", (ev) => {
    const who = ev.target.closest("[data-who]");
    if (who) {
      setWho(Number(who.getAttribute("data-who")));
      return;
    }
    const period = ev.target.closest("[data-period]");
    if (period) {
      setPeriod(period.getAttribute("data-period"));
      return;
    }
    const remove = ev.target.closest("[data-remove-child]");
    if (remove) {
      state.children.splice(Number(remove.getAttribute("data-remove-child")), 1);
      renderChildren();
      renderResults();
    }
  });

  if (els.addChild) {
    els.addChild.addEventListener("click", () => {
      if (state.children.length >= 11) return;
      const months = MONTHS;
      state.children.push({
        monthsTotal: months,
        monthsT1: state.taxpayers === 2 ? Math.round(months / 2) : months,
        disabled: false,
        pupil: false,
      });
      renderChildren();
      renderResults();
    });
  }

  if (els.optimize) {
    els.optimize.addEventListener("click", () => {
      readState();
      if (state.taxpayers !== 2) {
        setWho(2);
        readState();
      }
      if (!state.children.length) return;
      state.children = optimizeSplit(state);
      renderChildren();
      renderResults();
      els.optimize.classList.add("is-done");
      els.optimize.textContent = "Delitev je prilagojena";
      window.setTimeout(() => {
        els.optimize.classList.remove("is-done");
        els.optimize.textContent = "Predlagaj najugodnejšo delitev";
      }, 2200);
    });
  }

  if (els.example) {
    els.example.addEventListener("click", () => {
      state.period = "month";
      state.taxpayers = 2;
      state.transferRemainder = true;
      if (els.transfer) els.transfer.checked = true;
      state.t1 = Object.assign(emptyPerson(), { salary: 2200, holiday: 1400 });
      state.t2 = Object.assign(emptyPerson(), { salary: 1700, holiday: 1200 });
      state.children = [
        { monthsTotal: 12, monthsT1: 12, disabled: false, pupil: false },
        { monthsTotal: 12, monthsT1: 0, disabled: false, pupil: false },
      ];
      writePerson("t1", state.t1);
      writePerson("t2", state.t2);
      root.querySelectorAll("[data-period]").forEach((btn) => {
        btn.setAttribute("aria-pressed", btn.getAttribute("data-period") === "month" ? "true" : "false");
      });
      setWho(2);
      syncLabels();
      state.children = optimizeSplit(state);
      renderChildren();
      renderResults();
    });
  }

  if (els.reset) {
    els.reset.addEventListener("click", () => {
      state.period = "month";
      state.taxpayers = 1;
      state.children = [];
      state.t1 = emptyPerson();
      state.t2 = emptyPerson();
      if (els.transfer) els.transfer.checked = true;
      writePerson("t1", state.t1);
      writePerson("t2", state.t2);
      root.querySelectorAll("[data-period]").forEach((btn) => {
        btn.setAttribute("aria-pressed", btn.getAttribute("data-period") === "month" ? "true" : "false");
      });
      setWho(1);
      syncLabels();
      renderResults();
    });
  }

  renderChildren();
  syncLabels();
  setWho(1);
})();
