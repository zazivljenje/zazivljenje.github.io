
(() => {
  'use strict';

  const DISPLAY_URL = 'zazivljenje.com/aplikacije/ziurs-za-druzine';
  const STEPS = ['Uvod', 'Stroški', 'Stanovanje', 'Delo', 'Izračun', 'Deli'];
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const inFrame = false;

  const eur = (n, d = 0) => new Intl.NumberFormat('sl-SI', { style: 'currency', currency: 'EUR', minimumFractionDigits: d, maximumFractionDigits: d }).format(n);
  const num = (n) => new Intl.NumberFormat('sl-SI', { maximumFractionDigits: 0 }).format(n);

  function resolveShareUrl() {
    const meta = $('meta[name="zz-share-url"]')?.content?.trim();
    if (meta) return meta;
    return location.origin + location.pathname;
  }
  const SHARE_URL = resolveShareUrl();

  function readParam(name) {
    return new URLSearchParams(location.search).get(name);
  }

  // ---------- Iframe integration ----------
  function postToParent(msg) { if (inFrame) window.parent.postMessage({ source: 'zz-ziurs', ...msg }, '*'); }
  if (inFrame) document.documentElement.classList.add('is-embedded');
  if (inFrame && 'ResizeObserver' in window) {
    new ResizeObserver(() => postToParent({ type: 'height', height: document.documentElement.scrollHeight })).observe(document.body);
  }

  // ---------- Steps ----------
  const stepper = $('#stepper');
  stepper.innerHTML = '<li class="step-indicator" aria-hidden="true"></li>' + STEPS.map((name, i) => `<li><button type="button" class="step-tab" data-go="${i}"><span class="step-num">${i + 1}</span>${name}</button></li>`).join('');
  const tabs = $$('.step-tab', stepper);
  const indicator = $('.step-indicator', stepper);
  let current = 0;

  function moveIndicator() {
    const li = tabs[current].parentElement;
    indicator.style.width = li.offsetWidth + 'px';
    indicator.style.transform = `translateX(${li.offsetLeft}px)`;
  }
  window.addEventListener('resize', moveIndicator);

  function goTo(n, { focus = true } = {}) {
    if (n < 0 || n >= STEPS.length) return;
    const dir = Math.sign(n - current);
    $$('.panel').forEach((p, i) => {
      p.classList.remove('is-active');
      if (i === n) {
        p.style.setProperty('--enter-x', dir === 0 ? '0px' : `${dir * 28}px`);
        p.style.setProperty('--enter-y', dir === 0 ? '10px' : '0px');
        void p.offsetWidth;
        p.classList.add('is-active');
      }
    });
    current = n;
    moveIndicator();
    tabs.forEach((t, i) => {
      t.classList.toggle('is-done', i < n);
      if (i === n) t.setAttribute('aria-current', 'step'); else t.removeAttribute('aria-current');
    });
    const tab = tabs[n];
    stepper.scrollTo({ left: tab.offsetLeft - stepper.clientWidth / 2 + tab.clientWidth / 2, behavior: reducedMotion ? 'auto' : 'smooth' });
    $('#progress-fill').style.width = ((n + 1) / STEPS.length * 100) + '%';
    $('#nav-count').innerHTML = `<span class="nc-word">Korak </span>${n + 1}<span class="nc-word"> od </span><span class="nc-slash">/</span>${STEPS.length}`;
    $('#btn-prev').disabled = n === 0;
    $('#next-label').innerHTML = n === 0 ? 'Poglej pregled' : n === STEPS.length - 1 ? 'Na začetek' : `Naprej<span class="nl-extra">: ${STEPS[n + 1]}</span>`;

    if (n === 4) runSimulation();
    if (n === 5) renderCard();

    history.replaceState(null, '', '#' + (n === 0 ? '' : 'korak-' + (n + 1)));
    if (focus) {
      $('#h-' + n)?.focus({ preventScroll: true });
      const top = $('#zz-app').getBoundingClientRect().top;
      if (top < 0) window.scrollTo({ top: window.scrollY + top, behavior: reducedMotion ? 'auto' : 'smooth' });
      postToParent({ type: 'step', step: n });
    }
  }

  document.addEventListener('click', (e) => {
    const el = e.target.closest('[data-go]');
    if (!el) return;
    if (el.dataset.card) { const r = $(`input[name="card"][value="${el.dataset.card}"]`); if (r) r.checked = true; captionDirty = false; }
    goTo(Number(el.dataset.go));
  });
  $('#btn-prev').addEventListener('click', () => goTo(current - 1));
  $('#btn-next').addEventListener('click', () => goTo(current === STEPS.length - 1 ? 0 : current + 1));
  document.addEventListener('keydown', (e) => {
    if (e.target.closest('input, textarea, select, [contenteditable]') || e.altKey || e.metaKey || e.ctrlKey) return;
    if (e.key === 'ArrowRight') goTo(current + 1);
    if (e.key === 'ArrowLeft') goTo(current - 1);
  });

  // ---------- Static charts ----------
  (function charts() {
    const gross = 2500;
    const rows = [['Prej', 650], ['Z ZIURS', 250]];
    const sp = $('#chart-sp');
    if (sp) {
      // Left = green family share (muted before / strong after); right = yellow contributions (deeper before / soft after)
      sp.innerHTML = rows.map(([l, c], i) => {
        const familyBg = i ? 'var(--teal)' : '#6f9ea6';
        const contribBg = i ? 'var(--gold-soft)' : '#c6a15a';
        const contribFg = i ? 'var(--ink)' : 'var(--white)';
        return `<div class="compare-row"><div class="compare-head"><span>${l}</span><span>ostane ${eur(gross - c)}</span></div><div class="compare-bar"><span style="width:${(gross - c) / gross * 100}%;background:${familyBg};color:var(--white)">Za družino ${eur(gross - c)}</span><span style="flex:1;background:${contribBg};color:${contribFg};justify-content:center">${eur(c)}</span></div></div>`;
      }).join('') + '<p class="tiny">Desni del: mesečni prispevki. Razlika ' + eur(400) + ' na mesec ostane v družinskem proračunu.</p>';
    }
  })();

  // ---------- Simulator ----------
  const form = $('#sim-form');
  const result = { total: 0, annual: 0 };
  let totalShown = 0, tweenId = 0;

  const isCouple = (family) => family === 'couple_child' || family === 'couple_no_child';

  function empBenefit(employment, income) {
    if (employment === 'none') return 0;
    if (employment === 'sp_micro') return 320;
    if (employment === 'highearner') return Math.max(0, (income - 7500) * 0.12);
    if (employment === 'retiree') return 90;
    return income > 2500 ? 25 : 15;
  }

  function syncEarners() {
    const family = form.elements.family?.value || $('input[name="family"]:checked')?.value;
    const couple = isCouple(family);
    const earnerB = $('#earner-b');
    if (earnerB) {
      earnerB.hidden = !couple;
      $$('input', earnerB).forEach((el) => { el.disabled = !couple; });
    }
    const hint = $('#income-hint');
    if (hint) hint.textContent = 'Vnesi bruto dohodek na osebo';
    $$('.earner').forEach((block) => {
      const key = block.dataset.earner;
      const emp = $(`input[name="employment_${key}"]:checked`)?.value;
      const incomeWrap = $(`#earner-${key}-income`);
      if (incomeWrap) incomeWrap.hidden = emp === 'none';
    });
  }

  function runSimulation() {
    syncEarners();
    const fd = new FormData(form);
    const family = fd.get('family');
    const housing = fd.get('housing');
    const groceries = parseFloat(fd.get('groceries')) || 0;
    const energy = parseFloat(fd.get('energy')) || 0;

    $('#out-groceries').textContent = eur(groceries);
    $('#out-energy').textContent = eur(energy);

    const food = groceries * 0.6 * (0.095 - 0.05);
    const energySave = energy * (0.22 - 0.095) * (9 / 12);
    const withKids = family === 'couple_child' || family === 'single_parent';
    const housingSave = housing === 'youth_rent' ? (withKids ? 65 : 45) : housing === 'standard_rent' ? 15 : 0;

    const incomeA = Math.max(0, parseFloat(fd.get('income_a')) || 0);
    const empA = empBenefit(fd.get('employment_a'), incomeA);
    const empB = isCouple(family) ? empBenefit(fd.get('employment_b'), Math.max(0, parseFloat(fd.get('income_b')) || 0)) : 0;
    const emp = empA + empB;

    const parts = { food, energy: energySave, housing: housingSave, emp };
    const total = food + energySave + housingSave + emp;
    result.total = total;
    result.annual = total * 12;

    $('#res-food').textContent = '+' + eur(food, 2);
    $('#res-energy').textContent = '+' + eur(energySave, 2);
    $('#res-housing').textContent = '+' + eur(housingSave, 2);
    $('#res-emp').textContent = '+' + eur(emp, 2);
    $('#res-annual').textContent = `približno ${eur(Math.round(result.annual))} na leto`;
    $('#mini-total').textContent = eur(Math.round(total)) + '/mes.';
    Object.entries(parts).forEach(([k, v]) => { $('#sb-' + k).style.width = (total ? v / total * 100 : 0) + '%'; });
    tweenTotal(total);
    if (current === 5) renderCard();
  }

  function tweenTotal(target) {
    const el = $('#res-total');
    if (reducedMotion) { el.textContent = eur(Math.round(target)); totalShown = target; return; }
    const from = totalShown, start = performance.now(), id = ++tweenId;
    const step = (t) => {
      if (id !== tweenId) return;
      const k = Math.min(1, (t - start) / 400), e = 1 - Math.pow(1 - k, 3);
      totalShown = from + (target - from) * e;
      el.textContent = eur(Math.round(totalShown));
      if (k < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }

  form.addEventListener('input', runSimulation);
  form.addEventListener('submit', (e) => e.preventDefault());

  // ---------- Share cards ----------
  const THEMES = {
    navy:  { bg: '#1a3348', ink: '#f7f5f1', muted: 'rgba(247,245,241,0.72)', accent: '#c6a15a', ctaBg: '#c6a15a', ctaInk: '#162028' },
    teal:  { bg: '#0c5d68', ink: '#ffffff', muted: 'rgba(255,255,255,0.76)', accent: '#ffffff', ctaBg: '#f7f5f1', ctaInk: '#0c5d68' },
    paper: { bg: '#f7f5f1', ink: '#162028', muted: '#56636d', accent: '#0c5d68', ctaBg: '#1a3348', ctaInk: '#ffffff' },
    ink:   { bg: '#162028', ink: '#f7f5f1', muted: 'rgba(247,245,241,0.7)', accent: '#c6a15a', ctaBg: '#c6a15a', ctaInk: '#162028' },
  };

  const CARDS = {
    hrana: () => ({
      theme: 'navy',
      eyebrow: 'DDV na hrano in energijo',
      headline: 'Nižji DDV pomeni, da več denarja ostane v družinskem proračunu.',
      stats: [{ from: '9,5 %', to: '5 %', label: 'osnovna živila' }, { from: '22 %', to: '9,5 %', label: 'energija' }],
      cta: 'Kako bo vplival na tvojo družino?',
      caption: 'Kako bo razvojni zakon (ZIURS) vplival na družine? DDV na osnovna živila se zniža z 9,5 % na 5 %, na energijo z 22 % na 9,5 %. Preveri, kaj to pomeni za tvojo družino:',
      url: SHARE_URL,
    }),
    stanovanje: () => ({
      theme: 'teal',
      eyebrow: 'Stanovanje za mlade družine',
      headline: 'Samo 5 % davka, ko lastnik dolgoročno odda mladim ali družini z otroki.',
      big: '50–120 €',
      bigLabel: 'ocenjena mesečna olajšava pri najemnini',
      cta: 'Kako bo vplival na tvojo družino?',
      caption: 'Lastniki, ki dolgoročno oddajo stanovanje mladim ali družinam z otroki, plačajo le 5 % davka. Ocenjena olajšava pri najemnini: 50–120 € na mesec. Izračunaj, kaj to pomeni zate:',
      url: SHARE_URL,
    }),
    sp: () => ({
      theme: 'paper',
      eyebrow: 'Samozaposleni starši',
      headline: 'Fiksni prispevki mikro s.p. se znižajo za več kot polovico.',
      stats: [{ from: '~650 €', to: '~250 €', label: 'mesečni prispevki' }],
      cta: 'Kako bo vplival na tvojo družino?',
      caption: 'Samozaposleni starši: prispevki za mikro s.p. se znižajo z ~650 € na ~250 € na mesec. Več denarja za družino v prvih, najtežjih letih. Preveri svoj vpliv:',
      url: SHARE_URL,
    }),
    wallet: () => ({
      theme: 'ink',
      eyebrow: 'ZIURS',
      headline: 'My wallet, my choice',
      cta: 'Kako bo vplival na tvojo družino?',
      caption: 'My wallet, my choice. Kako bo razvojni zakon (ZIURS) vplival na tvojo družino? Preveri v interaktivnem vodiču:',
      url: SHARE_URL,
    }),
    miklavz: () => ({
      theme: 'navy',
      eyebrow: 'Sv. Miklavž',
      headline: 'Dragi sv. Miklavž, letos namesto daril - nižje davke!',
      cta: 'Kako bo vplival na tvojo družino?',
      caption: 'Dragi sv. Miklavž, letos namesto daril - nižje davke! Kako bo razvojni zakon (ZIURS) vplival na tvojo družino? Preveri v interaktivnem vodiču:',
      url: SHARE_URL,
    }),
    bozic: () => ({
      theme: 'teal',
      eyebrow: 'Božič',
      headline: 'Letos bo božična darila plačal razvojni zakon!',
      cta: 'Kako bo vplival na tvojo družino?',
      caption: 'Letos bo božična darila plačal razvojni zakon! Kako bo ZIURS vplival na tvojo družino? Preveri v interaktivnem vodiču:',
      url: SHARE_URL,
    }),
    gume: () => ({
      theme: 'paper',
      eyebrow: 'Zimske gume',
      headline: 'Letos bo zimske gume plačal razvojni zakon!',
      cta: 'Kako bo vplival na tvojo družino?',
      caption: 'Letos bo zimske gume plačal razvojni zakon! Kako bo ZIURS vplival na tvojo družino? Preveri v interaktivnem vodiču:',
      url: SHARE_URL,
    }),
  };

  const canvas = $('#share-canvas');
  const ctx = canvas.getContext('2d');
  const logoImg = new Image();
  logoImg.src = $('#zz-logo').src;
  const usidraniImg = new Image();
  usidraniImg.src = $('#usidrani-logo')?.src || '';
  let captionDirty = false;
  const fontsReady = (document.fonts ? Promise.all([
    document.fonts.load('700 72px Literata', 'ČŠŽčšž'),
    document.fonts.load('800 120px Inter', 'ČŠŽčšž€'),
    document.fonts.load('600 40px Inter', 'ČŠŽčšž€'),
    document.fonts.load('400 30px Inter', 'ČŠŽčšž€'),
  ]).catch(() => {}) : Promise.resolve());
  const logoReady = logoImg.decode ? logoImg.decode().catch(() => {}) : Promise.resolve();
  const usidraniReady = usidraniImg.decode ? usidraniImg.decode().catch(() => {}) : Promise.resolve();

  function drawCircledLogo(img, cx, cy, r, { stroke = false, inset = 14, clip = false } = {}) {
    ctx.fillStyle = '#ffffff';
    ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.fill();
    if (stroke) { ctx.strokeStyle = 'rgba(22,32,40,0.12)'; ctx.lineWidth = 2; ctx.stroke(); }
    if (!(img.complete && img.naturalWidth)) return;
    const size = r * 2 - inset * 2;
    const x = cx - r + inset, y = cy - r + inset;
    if (clip) {
      ctx.save();
      ctx.beginPath(); ctx.arc(cx, cy, r - 1, 0, Math.PI * 2); ctx.clip();
      ctx.drawImage(img, x, y, size, size);
      ctx.restore();
    } else {
      ctx.drawImage(img, x, y, size, size);
    }
  }

  const selected = () => ({
    card: $('input[name="card"]:checked').value,
    format: $('input[name="format"]:checked').value,
  });

  function wrap(text, maxW) {
    const words = text.split(' '), lines = [];
    let line = '';
    for (const w of words) {
      const test = line ? line + ' ' + w : w;
      if (ctx.measureText(test).width > maxW && line) { lines.push(line); line = w; } else line = test;
    }
    if (line) lines.push(line);
    return lines;
  }

  function roundRect(x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y); ctx.arcTo(x + w, y, x + w, y + h, r); ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r); ctx.arcTo(x, y, x + w, y, r); ctx.closePath();
  }

  function setSpacing(px) { if ('letterSpacing' in ctx) ctx.letterSpacing = px + 'px'; }

  async function renderCard() {
    await Promise.all([fontsReady, logoReady, usidraniReady]);
    const { card, format } = selected();
    const d = CARDS[card]();
    const t = THEMES[d.theme];
    const story = format === 'story';
    const W = 1080, H = story ? 1920 : 1350;
    if (canvas.height !== H) canvas.height = H;
    canvas.width = W;
    $('#preview-note').textContent = story ? '1080 × 1920 px · Instagram in Facebook zgodbe, WhatsApp status' : '1080 × 1350 px · Instagram, Facebook, LinkedIn, WhatsApp';

    const padX = 88, padTop = story ? 200 : 84, padBottom = story ? 230 : 84;
    const innerW = W - padX * 2;
    ctx.textBaseline = 'top';
    ctx.textAlign = 'left';

    ctx.fillStyle = t.bg; ctx.fillRect(0, 0, W, H);
    ctx.fillStyle = t.accent; ctx.fillRect(0, 0, W, 14);

    // Brand header
    const logoR = 52;
    drawCircledLogo(logoImg, padX + logoR, padTop + logoR, logoR, { stroke: d.theme === 'paper', inset: 14 });
    setSpacing(0);
    ctx.fillStyle = t.ink; ctx.font = '700 40px Inter';
    ctx.fillText('Za življenje!', padX + logoR * 2 + 28, padTop + 18);
    ctx.fillStyle = t.muted; ctx.font = '500 28px Inter';
    ctx.fillText('zazivljenje.com', padX + logoR * 2 + 28, padTop + 66);
    const headerBottom = padTop + logoR * 2;

    // Bottom block (drawn bottom-up)
    const footY = H - padBottom - 30;
    const usidCx = W - 36 - logoR;
    const usidCy = H - 36 - logoR;
    drawCircledLogo(usidraniImg, usidCx, usidCy, logoR, { stroke: d.theme === 'paper', inset: 4, clip: true });
    ctx.fillStyle = t.muted; ctx.font = '400 26px Inter';
    ctx.fillText('Ilustrativna ocena · razvojni zakon ZIURS', padX, footY);
    const ctaH = 120, ctaY = footY - 40 - ctaH;
    ctx.fillStyle = t.ctaBg; roundRect(padX, ctaY, innerW, ctaH, 28); ctx.fill();
    ctx.fillStyle = t.ctaInk; ctx.font = '700 38px Inter';
    ctx.fillText(d.cta, padX + 40, ctaY + 22);
    ctx.font = '500 28px Inter'; ctx.globalAlpha = 0.85;
    ctx.fillText(DISPLAY_URL, padX + 40, ctaY + 70);
    ctx.globalAlpha = 1;
    ctx.font = '700 48px Inter';
    const arrowW = ctx.measureText('→').width;
    ctx.fillText('→', padX + innerW - 40 - arrowW, ctaY + 34);

    // Middle block: auto-fit then vertically center
    const areaTop = headerBottom + (story ? 120 : 64), areaBottom = ctaY - (story ? 120 : 56);
    const avail = areaBottom - areaTop;
    let hSize = story ? 84 : 72, layout;
    const measure = (size) => {
      ctx.font = `700 ${size}px Literata`;
      const lines = wrap(d.headline, innerW);
      const lh = Math.round(size * 1.18);
      let h = 30 + 28 + lines.length * lh;
      const bigSize = story ? 200 : Math.min(180, size * 2.3);
      let statsH = 0;
      if (d.stats) statsH = d.stats.length * (Math.round(size * 1.6) + 44) + (d.stats.length - 1) * 28;
      if (d.big) { ctx.font = '400 32px Inter'; statsH = bigSize + 20 + wrap(d.bigLabel, innerW).length * 44; }
      const gap = story ? 96 : 56;
      return { lines, lh, size, bigSize, h: h + gap + statsH, gap };
    };
    do { layout = measure(hSize); hSize -= 4; } while (layout.h > avail && hSize > 44);

    let y = areaTop + Math.max(0, (avail - layout.h) / (story ? 2 : 2.4));
    ctx.fillStyle = t.accent; ctx.font = '700 28px Inter'; setSpacing(4);
    ctx.fillText(d.eyebrow.toUpperCase(), padX, y);
    setSpacing(0);
    y += 30 + 28;
    ctx.fillStyle = t.ink; ctx.font = `700 ${layout.size}px Literata`;
    layout.lines.forEach((ln) => { ctx.fillText(ln, padX, y); y += layout.lh; });
    y += layout.gap;

    if (d.stats) {
      const toSize = Math.round(layout.size * 1.6);
      d.stats.forEach((s, i) => {
        ctx.font = `600 ${Math.round(toSize * 0.42)}px Inter`;
        ctx.fillStyle = t.muted;
        const fromW = ctx.measureText(s.from).width;
        const fromY = y + toSize * 0.42;
        ctx.fillText(s.from, padX, fromY);
        ctx.strokeStyle = t.muted; ctx.lineWidth = 4;
        ctx.beginPath(); ctx.moveTo(padX - 4, fromY + toSize * 0.22); ctx.lineTo(padX + fromW + 4, fromY + toSize * 0.22); ctx.stroke();
        ctx.fillStyle = t.accent; ctx.font = `700 ${Math.round(toSize * 0.5)}px Inter`;
        ctx.fillText('→', padX + fromW + 24, y + toSize * 0.3);
        const arrW = ctx.measureText('→').width;
        ctx.font = `800 ${toSize}px Inter`; setSpacing(-2);
        ctx.fillText(s.to, padX + fromW + 48 + arrW, y);
        setSpacing(0);
        ctx.fillStyle = t.muted; ctx.font = '500 32px Inter';
        ctx.fillText(s.label, padX, y + toSize + 8);
        y += toSize + 44 + (i < d.stats.length - 1 ? 28 : 0);
      });
    }
    if (d.big) {
      ctx.fillStyle = t.accent; ctx.font = `800 ${layout.bigSize}px Inter`; setSpacing(-4);
      let size = layout.bigSize;
      while (ctx.measureText(d.big).width > innerW && size > 80) { size -= 8; ctx.font = `800 ${size}px Inter`; }
      ctx.fillText(d.big, padX - 6, y);
      setSpacing(0);
      y += layout.bigSize + 20;
      ctx.fillStyle = t.muted; ctx.font = '400 32px Inter';
      wrap(d.bigLabel, innerW).forEach((ln) => { ctx.fillText(ln, padX, y); y += 44; });
    }

    const detail = d.big || (d.stats ? d.stats.map(s => s.label + ' ' + s.to).join(', ') : '');
    canvas.setAttribute('aria-label', `Predogled slike: ${d.eyebrow}. ${d.headline}${detail ? ' ' + detail : ''}`);
    if (!captionDirty) $('#caption').value = composeCaption(d);
  }

  function composeCaption(d) { return `${d.caption}\n${d.url}\n\n#ZIURS #družine #zazivljenje`; }
  const currentCard = () => CARDS[selected().card]();
  const captionText = () => $('#caption').value.trim();

  $('#picker').addEventListener('change', () => { captionDirty = false; renderCard(); });
  $$('input[name="format"]').forEach(r => r.addEventListener('change', renderCard));
  $('#caption').addEventListener('input', () => { captionDirty = true; });

  const toBlob = () => new Promise((res) => canvas.toBlob(res, 'image/png'));
  const fileName = () => `za-zivljenje-ziurs-${selected().card}-${selected().format}.png`;

  async function copyText(text) {
    try { await navigator.clipboard.writeText(text); return true; }
    catch (_) {
      const ta = document.createElement('textarea');
      ta.value = text; ta.setAttribute('readonly', ''); ta.style.position = 'fixed'; ta.style.opacity = '0';
      document.body.appendChild(ta); ta.select();
      let ok = false; try { ok = document.execCommand('copy'); } catch (_) {}
      ta.remove(); return ok;
    }
  }

  function download(blob) {
    const url = URL.createObjectURL(blob);
    const a = Object.assign(document.createElement('a'), { href: url, download: fileName() });
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 2000);
  }

  let toastTimer;
  function toast(msg) {
    $('#toast-text').textContent = msg;
    const anchor = document.activeElement?.closest?.('button, a');
    if (inFrame && anchor) $('#toast').style.top = (anchor.getBoundingClientRect().bottom + window.scrollY + 12) + 'px';
    $('#toast').classList.add('is-on');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => $('#toast').classList.remove('is-on'), 3200);
  }

  const shareToggle = $('#btn-share');
  const shareMenu = $('#share-menu');
  function setShareMenu(open) {
    shareToggle.setAttribute('aria-expanded', String(open));
    shareMenu.classList.toggle('is-open', open);
    shareMenu.inert = !open;
    $('.share').classList.toggle('menu-open', open);
    $('#share-setup').inert = open && matchMedia('(min-width: 900px)').matches;
    if (open) renderCard();
  }
  shareToggle.addEventListener('click', () => setShareMenu(shareToggle.getAttribute('aria-expanded') !== 'true'));
  shareMenu.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') { e.stopPropagation(); setShareMenu(false); shareToggle.focus(); }
  });

  const canShareFiles = (() => {
    try { return !!navigator.canShare && navigator.canShare({ files: [new File([''], 'x.png', { type: 'image/png' })] }); }
    catch (_) { return false; }
  })();
  $('#btn-native').hidden = !canShareFiles;
  $('#btn-native').addEventListener('click', async () => {
    await renderCard();
    const file = new File([await toBlob()], fileName(), { type: 'image/png' });
    try { await navigator.share({ files: [file], title: 'Kako bo ZIURS vplival na družine?', text: captionText() }); }
    catch (e) { if (e.name !== 'AbortError') toast('Deljenje ni uspelo. Poskusi s prenosom slike.'); }
  });

  $('#btn-download').addEventListener('click', async () => { await renderCard(); download(await toBlob()); toast('Slika je prenesena.'); });
  $('#btn-instagram').addEventListener('click', async () => {
    await renderCard();
    download(await toBlob());
    const copied = await copyText(captionText());
    toast(copied ? 'Slika je prenesena, besedilo kopirano. Objavi ju v Instagramu.' : 'Slika je prenesena. Objavi jo v Instagramu.');
  });
  $$('.social[data-net="facebook"], .social[data-net="linkedin"]').forEach((a) => {
    a.addEventListener('click', async () => { if (await copyText(captionText())) toast('Besedilo je kopirano – prilepi ga v objavo.'); });
  });
  $('#btn-link').addEventListener('click', async () => {
    const url = currentCard().url;
    if (navigator.share && matchMedia('(pointer: coarse)').matches) {
      try { await navigator.share({ title: 'Kako bo ZIURS vplival na družine?', url }); return; } catch (e) { if (e.name === 'AbortError') return; }
    }
    if (await copyText(url)) toast('Povezava je kopirana.');
  });

  $$('.social[data-net]').forEach((a) => {
    const update = () => {
      const d = currentCard(), text = captionText(), url = encodeURIComponent(d.url);
      const map = {
        whatsapp: `https://wa.me/?text=${encodeURIComponent(text)}`,
        viber: `viber://forward?text=${encodeURIComponent(text)}`,
        facebook: `https://www.facebook.com/sharer/sharer.php?u=${url}`,
        x: `https://x.com/intent/post?text=${encodeURIComponent(d.caption)}&url=${url}`,
        linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${url}`,
        email: `mailto:?subject=${encodeURIComponent('Kako bo ZIURS vplival na družine?')}&body=${encodeURIComponent(text)}`,
      };
      a.href = map[a.dataset.net];
    };
    ['pointerdown', 'focus', 'keydown'].forEach(ev => a.addEventListener(ev, update));
    update();
  });

  // ---------- Init ----------
  runSimulation();

  const ref = parseInt(readParam('korist'), 10);
  if (ref > 0 && ref < 100000) {
    $('#referral-amount').textContent = `približno ${eur(ref)} na mesec`;
    $('#referral').hidden = false;
  }

  const hash = location.hash.match(/korak-(\d)/);
  const deep = { '#izracun': 4, '#deli': 5 }[location.hash];
  const start = hash ? Number(hash[1]) - 1 : deep ?? 0;
  goTo(Math.min(Math.max(start, 0), STEPS.length - 1), { focus: false });
})();
