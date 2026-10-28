(function () {
  var DATA = window.ABORTION_MAP;
  if (!DATA) return;

  var NS = "http://www.w3.org/2000/svg";
  var I18N = {
    en: {
      title: "Induced abortion over the years",
      language: "Language",
      play: "Play",
      pause: "Stop",
      year: "Year",
      inForce: "Countries legalized it",
      withdrawn: "Countries repealed legalization",
      babies: "Babies aborted up to {year}.",
      how: "How to read",
      legendIn: "Law in force",
      legendOut: "Law withdrawn",
      legendSplit: "No uniform legislation",
      scale: "1K to 500M, logarithmic scale",
      throughYear: "Through {year}",
      livesEnded: "babies' lives ended",
      popShare: " ({pct}% of the current population)",
      population: "Population",
      legalized: "Legalized",
      lawWithdrawn: "Withdrawn",
      splitSince: "No uniform legislation since {year}",
      estimatesNote: "Estimates: Johnston’s estimate, not an official figure.",
      chartCum: "Cumulative calculation",
      chartPer: "Per year",
      throughLatest: "Through {last}, the latest year in this series",
      latestData: "Latest data {last}",
      since: "Since {year}",
      slotIn: "Broad law",
      slotSplit: "No single rule",
      slotOut: "Withdrawn",
      slotNone: "No broad law",
      estimatesLabel: "Estimates",
      seriesEnds: "The series ends in {last}, so the year {year} adds nothing.",
      estimates: "Johnston marks these years as estimates: {years}.",
      noCount: "No annual count is assigned to this country, so it is not painted red.",
      lawIn: "Law in force since {year}.",
      lawOut: "Broad law withdrawn or no longer in force since {year}. The total count remains on the map.",
      lawSplit: "No single national rule since {year}.",
      lawUpcoming: "Broad law in this dataset starts in {year}.",
      lawGap: "No broad-law span covers this year.",
      lawNone: "No broad legalization is recorded for this country.",
      mapLabel: "World map of abortion law and total numbers in {year}",
      sourceTitle: "What does the red color on the map represent?",
      sourceBody: "The red color for each country illustrates the running total of Johnston’s \"occurrence\" series from the report Abortion Worldwide Report, which combines officially reported induced abortions and the author’s estimates for years with missing data. Negative source cells are marked as estimates, and the fixed color scale causes countries to darken in proportion to the growth of their own total, which is summed above the map only once. This display is not a world census, because it omits countries without an assigned data series, while India is mostly covered by the corresponding series. The historical totals for the former Soviet Union, Yugoslavia and Czechoslovakia are not added to their successors, and East Germany for the period before 1990 is included in Germany."
    },
    es: {
      title: "Aborto inducido a lo largo de los años",
      language: "Idioma",
      play: "Reproducir",
      pause: "Parar",
      year: "Año",
      inForce: "Países lo legalizaron",
      withdrawn: "Países derogaron la legalización",
      babies: "Bebés abortados hasta {year}.",
      how: "Cómo leer",
      legendIn: "Ley en vigor",
      legendOut: "Ley retirada",
      legendSplit: "Sin legislación uniforme",
      scale: "1K a 500M, escala logarítmica",
      throughYear: "Hasta {year}",
      livesEnded: "vidas de bebés terminadas",
      popShare: " ({pct}% de la población actual)",
      population: "Población",
      legalized: "Legalizado",
      lawWithdrawn: "Retirado",
      splitSince: "Sin legislación uniforme desde {year}",
      estimatesNote: "Estimaciones: estimación de Johnston, no un dato oficial.",
      chartCum: "Cálculo acumulado",
      chartPer: "Por año",
      throughLatest: "Hasta {last}, el último año de esta serie",
      latestData: "Último dato {last}",
      since: "Desde {year}",
      slotIn: "Ley amplia",
      slotSplit: "Sin norma única",
      slotOut: "Retirada",
      slotNone: "Sin ley amplia",
      estimatesLabel: "Estimaciones",
      seriesEnds: "La serie termina en {last}, así que el año {year} no añade nada.",
      estimates: "Johnston marca estos años como estimaciones: {years}.",
      noCount: "No hay un recuento anual asignado a este país, así que no se pinta de rojo.",
      lawIn: "Ley en vigor desde {year}.",
      lawOut: "Ley amplia retirada o ya no en vigor desde {year}. El número total permanece en el mapa.",
      lawSplit: "No hay una sola norma nacional desde {year}.",
      lawUpcoming: "La ley amplia de este conjunto empieza en {year}.",
      lawGap: "Ningún tramo de ley amplia cubre este año.",
      lawNone: "Para este país no está registrada una legalización amplia.",
      mapLabel: "Mapa mundial de la ley del aborto y los números totales en {year}",
      sourceTitle: "¿Qué representa el color rojo en el mapa?",
      sourceBody: "El color rojo de cada país ilustra el total acumulado de la serie \"occurrence\" de Johnston del informe Abortion Worldwide Report, que reúne los abortos inducidos notificados oficialmente y las estimaciones del autor para los años con datos faltantes. Las celdas negativas de la fuente están marcadas como estimaciones, y la escala de color fija hace que los países se oscurezcan en proporción al crecimiento de su propio total, que se suma una sola vez por encima del mapa. Esta visualización no es un censo mundial, porque omite los países sin una serie de datos asignada, mientras que la India está cubierta en su mayor parte por las series correspondientes. Los totales históricos de la antigua Unión Soviética, Yugoslavia y Checoslovaquia no se suman a sus sucesores, y la Alemania Oriental para el período anterior a 1990 está incluida en Alemania."
    },
    sl: {
      title: "Umetni splav v teku let",
      language: "Jezik",
      play: "Predvajaj",
      pause: "Ustavi",
      year: "Leto",
      inForce: "Držav ga je legaliziralo",
      withdrawn: "Držav je ukinilo legalizacijo",
      babies: "Splavljeni dojenčki do leta {year}.",
      how: "Kako brati",
      legendIn: "Zakon v veljavi",
      legendOut: "Zakon umaknjen",
      legendSplit: "Ni enotne zakonodaje",
      scale: "1K do 500M, logaritemska lestvica",
      throughYear: "Do leta {year}",
      livesEnded: "ugaslih življenj dojenčkov",
      popShare: " ({pct}% sedanjega prebivalstva)",
      population: "Prebivalstvo",
      legalized: "Legalizirano",
      lawWithdrawn: "Umaknjeno",
      splitSince: "Ni enotne zakonodaje od leta {year}",
      estimatesNote: "Ocene: Johnstonova ocena, ne uradni podatek.",
      chartCum: "Kumulativni izračun",
      chartPer: "Na leto",
      throughLatest: "Do leta {last}, zadnjega leta v tej vrsti",
      latestData: "Zadnji podatek {last}",
      since: "Od {year}",
      slotIn: "Širok zakon",
      slotSplit: "Ni enega pravila",
      slotOut: "Umaknjen",
      slotNone: "Ni širokega zakona",
      estimatesLabel: "Ocene",
      seriesEnds: "Vrsta se konča leta {last}, zato leto {year} ničesar ne doda.",
      estimates: "Johnston ta leta označi kot ocene: {years}.",
      noCount: "Tej državi ni pripisano letno število, zato ni pobarvana rdeče.",
      lawIn: "Zakon v veljavi od leta {year}.",
      lawOut: "Širok zakon umaknjen ali ni več uveljavljen od leta {year}. Skupno število na zemljevidu ostane.",
      lawSplit: "Ni enega nacionalnega pravila od leta {year}.",
      lawUpcoming: "Širok zakon v tem naboru se začne leta {year}.",
      lawGap: "Tega leta ne pokriva noben razpon širokega zakona.",
      lawNone: "Za to državo široka legalizacija ni vpisana.",
      mapLabel: "Svetovni zemljevid zakona o splavu in skupnih števil v letu {year}",
      sourceTitle: "Kaj predstavlja rdeča barva na zemljevidu?",
      sourceBody: "Rdeča barva za posamezno državo ponazarja tekoči seštevek Johnstonove vrste \"occurrence\" iz poročila Abortion Worldwide Report, ki združuje uradno prijavljene umetne splave in avtorjeve ocene za leta z manjkajočimi podatki, pri čemer so negativne celice vira označene kot ocene, fiksna barvna lestvica pa povzroča, da države temnijo sorazmerno z rastjo njihovega lastnega seštevka, ki je nad zemljevidom seštet le enkrat. Ta prikaz ni svetovni popis, saj izpušča države brez pripisane vrste podatkov, medtem ko je Indija večinoma zajeta z ustreznimi vrstami, zgodovinski seštevki za nekdanjo Sovjetsko zvezo, Jugoslavijo in Češkoslovaško niso prišteti k njihovim naslednicam, Vzhodna Nemčija pa je za obdobje pred letom 1990 vključena v Nemčijo."
    }
  };

  var root = document.getElementById("abtl");
  if (!root) return;

  var titleEl = document.getElementById("abtl-title");
  var langBox = document.getElementById("abtl-langs");
  var statsEl = document.getElementById("abtl-stats");
  var playBtn = document.getElementById("abtl-play");
  var slider = document.getElementById("abtl-year");
  var legendEl = document.getElementById("abtl-legend");
  var svg = document.getElementById("abtl-svg");
  var detailEl = document.getElementById("abtl-detail");
  var sourceEl = document.getElementById("abtl-source");

  var lang = "sl";
  try {
    var stored = localStorage.getItem("abtl-lang");
    if (stored === "en" || stored === "es" || stored === "sl") lang = stored;
  } catch (e) {}

  var year = DATA.YEAR_MAX;
  var selected = null;
  var playing = false;
  var timer = null;
  var nodes = new Map();
  var chartMode = "cum";
  var chartState = null;
  var chartObserver = null;
  var chartPointer = null;
  var detailKey = "";

  function t(key, vars) {
    var s = I18N[lang][key];
    if (!vars) return s;
    Object.keys(vars).forEach(function (k) {
      s = s.split("{" + k + "}").join(String(vars[k]));
    });
    return s;
  }

  function escapeHtml(s) {
    return String(s)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function locale() {
    if (lang === "es") return "es-ES";
    if (lang === "sl") return "sl-SI";
    return "en-GB";
  }

  function formatCount(n) {
    return Math.round(n).toLocaleString(locale());
  }

  function populationShare(cum, pop) {
    if (typeof pop !== "number" || !(pop > 0) || !isFinite(pop)) return "";
    if (typeof cum !== "number" || !isFinite(cum)) return "";
    var pct = ((cum / pop) * 100).toLocaleString(locale(), {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
    return t("popShare", { pct: pct });
  }

  function noteSpan(text) {
    return '<span class="abtl-num__label" style="font-weight:400;letter-spacing:0">' + escapeHtml(text) + "</span>";
  }

  function countValueHtml(count, share) {
    if (count == null || !isFinite(count)) return escapeHtml(EM_DASH);
    var html = escapeHtml(formatCount(count));
    if (share) html += noteSpan(share);
    return html;
  }

  function formatAxis(n) {
    n = Math.abs(Math.round(n));
    if (n < 1000) return formatCount(n);
    var steps = [
      { div: 1e9, suffix: "B" },
      { div: 1e6, suffix: "M" },
      { div: 1e3, suffix: "k" }
    ];
    var step = steps[2];
    for (var i = 0; i < steps.length; i++) {
      if (n >= steps[i].div) {
        step = steps[i];
        break;
      }
    }
    var q = n / step.div;
    var digits = q >= 10 ? 0 : 1;
    var rounded = digits ? Math.round(q * 10) / 10 : Math.round(q);
    if (rounded >= 1000 && step.suffix !== "B") return formatAxis(rounded * step.div);
    var body = rounded.toLocaleString(locale(), {
      maximumFractionDigits: digits,
      minimumFractionDigits: 0
    });
    return body + step.suffix;
  }

  function nameOf(iso) {
    var table = DATA.names[lang] || DATA.names.en;
    return table[iso] || DATA.names.en[iso] || iso;
  }

  function statusAt(iso, y) {
    var spans = DATA.law[iso];
    if (!spans) return "none";
    for (var i = 0; i < spans.length; i++) {
      var span = spans[i];
      if (y >= span[0] && y <= span[1]) return span[2];
    }
    return "none";
  }

  function totalsAt(iso, y) {
    var rows = DATA.series[iso];
    if (!rows || !rows.length) return null;
    var throughYear = 0;
    var throughLatest = 0;
    var lastYear = rows[0][0];
    var estimated = [];
    for (var i = 0; i < rows.length; i++) {
      var row = rows[i];
      var estimate = row[1] < 0;
      var n = Math.abs(row[1]);
      throughLatest += n;
      lastYear = row[0];
      if (row[0] <= y) {
        throughYear += n;
        if (estimate) estimated.push(row[0]);
      }
    }
    return { throughYear: throughYear, throughLatest: throughLatest, lastYear: lastYear, estimated: estimated };
  }

  function intensity(cum) {
    if (cum <= 0) return 0;
    if (cum < 1000) return 0.18;
    var tScale = (Math.log10(cum) - 3) / (Math.log10(DATA.SCALE_MAX) - 3);
    if (tScale < 0) tScale = 0;
    if (tScale > 1) tScale = 1;
    return 0.22 + 0.78 * tScale;
  }

  var EM_DASH = "\u2014";
  var CHART_W = 340;
  var CHART_H = 120;
  var CHART_PAD_L = 46;
  var CHART_PAD_R = 12;
  var CHART_PAD_T = 12;
  var CHART_PAD_B = 16;

  function countryMeta(iso) {
    var table = window.ABORTION_META;
    if (!table) return null;
    return table[iso] || null;
  }

  function formatSpans(iso, kind) {
    var spans = DATA.law[iso] || [];
    var parts = [];
    for (var i = 0; i < spans.length; i++) {
      if (spans[i][2] !== kind) continue;
      if (spans[i][1] === 9999) parts.push(String(spans[i][0]) + "\u2013");
      else parts.push(String(spans[i][0]) + "\u2013" + spans[i][1]);
    }
    return parts.length ? parts.join(", ") : EM_DASH;
  }

  function splitStart(iso, y) {
    var spans = DATA.law[iso] || [];
    var first = null;
    for (var i = 0; i < spans.length; i++) {
      if (spans[i][2] !== "split") continue;
      if (first === null) first = spans[i][0];
      if (y >= spans[i][0] && y <= spans[i][1]) return spans[i][0];
    }
    return first;
  }

  function estimateYears(iso, y) {
    var rows = DATA.series[iso];
    if (!rows) return [];
    var out = [];
    for (var i = 0; i < rows.length; i++) {
      if (rows[i][1] < 0 && rows[i][0] >= 2010 && rows[i][0] <= y) out.push(rows[i][0]);
    }
    return out;
  }

  function seriesChart(iso) {
    var rows = DATA.series[iso];
    if (!rows || !rows.length) return null;
    var years = [];
    var per = [];
    var cum = [];
    var run = 0;
    var maxPer = 0;
    var maxCum = 0;
    for (var i = 0; i < rows.length; i++) {
      var n = Math.abs(rows[i][1]);
      run += n;
      years.push(rows[i][0]);
      per.push(n);
      cum.push(run);
      if (n > maxPer) maxPer = n;
      if (run > maxCum) maxCum = run;
    }
    return {
      years: years,
      per: per,
      cum: cum,
      y0: years[0],
      y1: years[years.length - 1],
      maxPer: maxPer,
      maxCum: maxCum
    };
  }

  function chartBaseline() {
    return CHART_H - CHART_PAD_B;
  }

  function chartX(state, y) {
    var inner = CHART_W - CHART_PAD_L - CHART_PAD_R;
    if (state.y0 === state.y1) return CHART_PAD_L + inner / 2;
    return CHART_PAD_L + ((y - state.y0) / (state.y1 - state.y0)) * inner;
  }

  function chartY(state, value) {
    var max = chartMode === "year" ? state.maxPer : state.maxCum;
    var base = chartBaseline();
    var inner = base - CHART_PAD_T;
    if (!max) return base;
    return base - (value / max) * inner;
  }

  function chartPoints(state) {
    var vals = chartMode === "year" ? state.per : state.cum;
    var pts = [];
    for (var i = 0; i < state.years.length; i++) {
      pts.push(chartX(state, state.years[i]).toFixed(2) + "," + chartY(state, vals[i]).toFixed(2));
    }
    return pts.join(" ");
  }

  function dotXY(state, y) {
    var vals = chartMode === "year" ? state.per : state.cum;
    var idx = -1;
    for (var i = 0; i < state.years.length; i++) {
      if (state.years[i] === y) {
        idx = i;
        break;
      }
    }
    if (idx >= 0) return { x: chartX(state, y), y: chartY(state, vals[idx]) };
    if (y < state.y0) return { x: chartX(state, state.y0), y: chartY(state, vals[0]) };
    if (y > state.y1) return { x: chartX(state, state.y1), y: chartY(state, vals[vals.length - 1]) };
    return { x: chartX(state, y), y: chartBaseline() };
  }

  function pathEl(d, cls) {
    var p = document.createElementNS(NS, "path");
    p.setAttribute("d", d);
    p.setAttribute("class", cls);
    return p;
  }

  function buildMap() {
    var defs = document.createElementNS(NS, "defs");
    defs.innerHTML =
      '<pattern id="abtl-in" width="7" height="7" patternUnits="userSpaceOnUse" patternTransform="rotate(40)">' +
      '<line x1="0" y1="0" x2="0" y2="7" stroke="currentColor" stroke-opacity="0.62" stroke-width="1.15"/>' +
      "</pattern>" +
      '<pattern id="abtl-out" width="6" height="6" patternUnits="userSpaceOnUse">' +
      '<circle cx="1.4" cy="1.4" r="0.95" fill="currentColor" fill-opacity="0.78"/>' +
      "</pattern>" +
      '<pattern id="abtl-split" width="8" height="6" patternUnits="userSpaceOnUse">' +
      '<line x1="0" y1="3" x2="4.5" y2="3" stroke="currentColor" stroke-opacity="0.75" stroke-width="1.15"/>' +
      "</pattern>";
    svg.appendChild(defs);
    DATA.order.forEach(function (iso) {
      var d = DATA.paths[iso];
      var g = document.createElementNS(NS, "g");
      var land = pathEl(d, "abtl-land");
      var red = pathEl(d, "abtl-red");
      var pat = pathEl(d, "abtl-pat");
      var hit = pathEl(d, "abtl-hit");
      var title = document.createElementNS(NS, "title");
      land.appendChild(title);
      g.appendChild(land);
      g.appendChild(red);
      g.appendChild(pat);
      g.appendChild(hit);
      svg.appendChild(g);
      land.addEventListener("pointerenter", function () { select(iso); });
      land.addEventListener("click", function () { select(iso); });
      nodes.set(iso, { red: red, pat: pat, hit: hit, title: title });
    });
  }

  function select(iso) {
    selected = iso;
    paint();
  }

  function renderStats(inForce, withdrawn, sum) {
    statsEl.innerHTML =
      '<div class="abtl-stat"><span class="abtl-stat__value">' + inForce + '</span>' +
      '<span class="abtl-stat__label">' + escapeHtml(t("inForce")) + "</span></div>" +
      '<div class="abtl-stat abtl-stat--out"><span class="abtl-stat__value">' + withdrawn + "</span>" +
      '<span class="abtl-stat__label">' + escapeHtml(t("withdrawn")) + "</span></div>" +
      '<div class="abtl-stat"><span class="abtl-stat__value">' + escapeHtml(formatCount(sum)) + "</span>" +
      '<span class="abtl-stat__label">' + escapeHtml(t("babies", { year: year })) + "</span></div>";
  }

  function swatch(kind, redOpacity) {
    var red = redOpacity
      ? '<rect width="28" height="16" fill="#af2c47" fill-opacity="' + redOpacity + '"/>'
      : "";
    return '<svg width="28" height="16" viewBox="0 0 28 16" aria-hidden="true">' +
      '<rect width="28" height="16" class="abtl-land"/>' + red +
      '<rect width="28" height="16" fill="url(#abtl-' + kind + ')"/>' +
      "</svg>";
  }

  function renderLegend() {
    var stops = [1000, 100000, 1000000, 10000000, 100000000, DATA.SCALE_MAX];
    var ramp = stops.map(function (n) {
      return '<i style="opacity:' + intensity(n) + '"></i>';
    }).join("");
    legendEl.innerHTML =
      '<span class="abtl-swatch">' + swatch("in", 0) + escapeHtml(t("legendIn")) + "</span>" +
      '<span class="abtl-swatch">' + swatch("out", 0.75) + escapeHtml(t("legendOut")) + "</span>" +
      '<span class="abtl-swatch">' + swatch("split", 0.55) + escapeHtml(t("legendSplit")) + "</span>" +
      '<span class="abtl-legend-pipe" aria-hidden="true">|</span>' +
      '<span class="abtl-swatch abtl-swatch--scale"><span class="abtl-ramp" aria-hidden="true">' + ramp + "</span>" +
      escapeHtml(t("scale")) + "</span>";
  }

  function factRow(label, value) {
    return '<div class="abtl-fact"><span class="abtl-fact__label">' + escapeHtml(label) + "</span>" +
      '<span class="abtl-fact__value" title="' + escapeHtml(value) + '">' + escapeHtml(value) + "</span></div>";
  }

  function numRow(slot, label, valueHtml) {
    return '<div class="abtl-num" data-slot="' + slot + '"><span class="abtl-num__label">' + escapeHtml(label) + "</span>" +
      '<span class="abtl-num__value">' + valueHtml + "</span></div>";
  }

  function chartYearLabels(state) {
    var y0 = state.y0;
    var y1 = state.y1;
    var years = [y0];
    if (y1 !== y0) {
      var midTarget = (y0 + y1) / 2;
      var mid = state.years[0];
      var best = Infinity;
      for (var i = 0; i < state.years.length; i++) {
        var dist = Math.abs(state.years[i] - midTarget);
        if (dist < best) {
          best = dist;
          mid = state.years[i];
        }
      }
      var x0 = chartX(state, y0);
      var x1 = chartX(state, y1);
      var xm = chartX(state, mid);
      if (mid !== y0 && mid !== y1 && xm - x0 >= 48 && x1 - xm >= 48) years.push(mid);
      years.push(y1);
    }
    var labelY = (chartBaseline() + 12).toFixed(2);
    return years.map(function (yr, i) {
      var x = chartX(state, yr);
      var anchor = "middle";
      if (i === 0 && x < 22) {
        anchor = "start";
        x = Math.max(x, 1);
      } else if (i === years.length - 1 && CHART_W - x < 22) {
        anchor = "end";
        x = Math.min(x, CHART_W - 1);
      }
      return '<text class="abtl-chart__tick" text-anchor="' + anchor + '" x="' + x.toFixed(2) + '" y="' + labelY + '">' + yr + "</text>";
    }).join("");
  }

  function chartScaleLabels() {
    var max = chartMode === "year" ? chartState.maxPer : chartState.maxCum;
    var x = (CHART_PAD_L - 7).toFixed(2);
    var html = '<text class="abtl-chart__tick" text-anchor="end" x="' + x + '" y="' + (chartBaseline() - 2).toFixed(2) + '">' + escapeHtml(formatAxis(0)) + "</text>";
    if (max > 0) {
      html = '<text class="abtl-chart__tick" text-anchor="end" dominant-baseline="middle" x="' + x + '" y="' + CHART_PAD_T + '">' + escapeHtml(formatAxis(max)) + "</text>" + html;
    }
    return html;
  }

  function svgXFromEvent(svgEl, event) {
    var rect = svgEl.getBoundingClientRect();
    if (!rect.width) return 0;
    var vb = svgEl.viewBox.baseVal;
    var width = vb && vb.width ? vb.width : CHART_W;
    return ((event.clientX - rect.left) / rect.width) * width;
  }

  function nearestYearIndex(state, svgX) {
    var bestI = 0;
    var best = Infinity;
    for (var i = 0; i < state.years.length; i++) {
      var dist = Math.abs(chartX(state, state.years[i]) - svgX);
      if (dist < best) {
        best = dist;
        bestI = i;
      }
    }
    return bestI;
  }

  function hideChartTip() {
    chartPointer = null;
    var tip = detailEl.querySelector(".abtl-chart__tip");
    if (tip) tip.hidden = true;
  }

  function placeChartTip(clientX, clientY, idx) {
    var tip = detailEl.querySelector(".abtl-chart__tip");
    var card = detailEl.querySelector(".abtl-card");
    if (!tip || !card || !chartState || idx < 0 || idx >= chartState.years.length) return;
    var value = chartMode === "year" ? chartState.per[idx] : chartState.cum[idx];
    chartPointer = { clientX: clientX, clientY: clientY, idx: idx };
    tip.hidden = false;
    tip.textContent = chartState.years[idx] + " \u00b7 " + formatCount(value);
    var host = card.getBoundingClientRect();
    var pad = 6;
    var offset = 12;
    var x = clientX - host.left + offset;
    var y = clientY - host.top + offset;
    var tw = tip.offsetWidth;
    var th = tip.offsetHeight;
    if (x + tw > host.width - pad) x = clientX - host.left - tw - offset;
    if (y + th > host.height - pad) y = clientY - host.top - th - offset;
    if (x < pad) x = pad;
    if (y < pad) y = pad;
    tip.style.left = Math.round(x) + "px";
    tip.style.top = Math.round(y) + "px";
  }

  function onChartPointer(event) {
    if (!chartState) {
      hideChartTip();
      return;
    }
    var idx = nearestYearIndex(chartState, svgXFromEvent(event.currentTarget, event));
    placeChartTip(event.clientX, event.clientY, idx);
  }

  function chartMarkup() {
    var base = chartBaseline();
    var right = CHART_W - CHART_PAD_R;
    var axis =
      '<line class="abtl-chart__base" x1="' + CHART_PAD_L + '" y1="' + CHART_PAD_T + '" x2="' + CHART_PAD_L + '" y2="' + base + '"/>' +
      '<line class="abtl-chart__base" x1="' + CHART_PAD_L + '" y1="' + base + '" x2="' + right + '" y2="' + base + '"/>';
    if (!chartState) {
      return axis + '<text class="abtl-chart__empty" x="' + (CHART_W / 2).toFixed(2) + '" y="' + (CHART_H / 2).toFixed(2) + '" text-anchor="middle" dominant-baseline="middle">' + EM_DASH + "</text>";
    }
    var dot = dotXY(chartState, year);
    return axis +
      chartScaleLabels() +
      chartYearLabels(chartState) +
      '<polyline class="abtl-chart__line" points="' + chartPoints(chartState) + '"/>' +
      '<circle class="abtl-chart__dot" r="6.5" cx="' + dot.x.toFixed(2) + '" cy="' + dot.y.toFixed(2) + '"/>';
  }

  function renderDetail() {
    chartPointer = null;
    if (!selected) {
      chartState = null;
      detailEl.innerHTML = "";
      return;
    }
    chartState = seriesChart(selected);
    var meta = countryMeta(selected);
    var flag = "";
    if (meta && meta.iso2) {
      flag = '<img class="abtl-card__flag" alt="" width="56" height="38" src="https://flagcdn.com/w80/' +
        escapeHtml(String(meta.iso2).toLowerCase()) + '.png">';
    }
    var popValue = EM_DASH;
    var popYear = EM_DASH;
    if (meta && meta.pop != null) {
      popValue = formatCount(meta.pop);
      popYear = String(meta.year);
    }
    var totalsNow = totalsAt(selected, year);
    var totalsMax = totalsAt(selected, DATA.YEAR_MAX);
    var nowHtml = countValueHtml(totalsNow ? totalsNow.throughYear : null);
    var maxShare = totalsMax ? populationShare(totalsMax.throughYear, meta && meta.pop) : "";
    var maxHtml = countValueHtml(totalsMax ? totalsMax.throughYear : null, maxShare);
    var status = statusAt(selected, year);
    var chipText = "";
    if (status === "split") chipText = t("splitSince", { year: splitStart(selected, year) });
    var est = estimateYears(selected, year);
    var estText = est.length ? est.join(", ") : EM_DASH;
    var estTitle = est.length ? ' title="' + escapeHtml(est.join(", ")) + '"' : "";
    detailEl.innerHTML =
      '<div class="abtl-card">' +
        '<div class="abtl-card__demo">' +
          '<div class="abtl-card__flag-slot">' + flag + "</div>" +
          '<h2 class="abtl-card__name" title="' + escapeHtml(nameOf(selected)) + '">' + escapeHtml(nameOf(selected)) + "</h2>" +
          '<div class="abtl-pop">' +
            '<span class="abtl-pop__label">' + escapeHtml(t("population")) + "</span>" +
            '<span class="abtl-pop__value">' + escapeHtml(popValue) + "</span>" +
            '<span class="abtl-pop__year">' + escapeHtml(popYear) + "</span>" +
          "</div>" +
        "</div>" +
        '<div class="abtl-card__facts">' +
          factRow(t("legalized"), formatSpans(selected, "in")) +
          factRow(t("lawWithdrawn"), formatSpans(selected, "out")) +
          '<div class="abtl-chip-slot"><span class="abtl-chip" data-slot="split"' + (status === "split" ? "" : " hidden") + ">" + escapeHtml(chipText) + "</span></div>" +
          numRow("through", t("throughYear", { year: year }), nowHtml) +
          numRow("through-max", t("throughYear", { year: DATA.YEAR_MAX }), maxHtml) +
          '<p class="abtl-card__est" data-slot="est"' + estTitle + ">" +
            '<span class="abtl-card__est-note">' + escapeHtml(t("estimatesNote")) + "</span>" +
            '<span class="abtl-card__est-years">' + escapeHtml(estText) + "</span>" +
          "</p>" +
        "</div>" +
        '<div class="abtl-chart">' +
          '<div class="abtl-chart__toggle" role="group">' +
            '<button type="button" data-chart="cum" aria-pressed="' + (chartMode === "cum" ? "true" : "false") + '">' + escapeHtml(t("chartCum")) + "</button>" +
            '<button type="button" data-chart="year" aria-pressed="' + (chartMode === "year" ? "true" : "false") + '">' + escapeHtml(t("chartPer")) + "</button>" +
          "</div>" +
          '<svg class="abtl-chart__svg" viewBox="0 0 ' + CHART_W + " " + CHART_H + '" preserveAspectRatio="none" aria-hidden="true">' + chartMarkup() + "</svg>" +
        "</div>" +
        '<div class="abtl-chart__tip" role="tooltip" aria-hidden="true" hidden></div>' +
      "</div>";
    bindChartBox();
  }

  function fitChart() {
    var svgEl = detailEl.querySelector(".abtl-chart__svg");
    if (!svgEl) return;
    var rect = svgEl.getBoundingClientRect();
    var w = Math.round(rect.width);
    var h = Math.round(rect.height);
    if (w < 40 || h < 40) return;
    var key = w + "x" + h;
    if (svgEl.getAttribute("data-fit") === key) return;
    CHART_W = w;
    CHART_H = h;
    svgEl.setAttribute("viewBox", "0 0 " + w + " " + h);
    svgEl.setAttribute("data-fit", key);
    svgEl.innerHTML = chartMarkup();
  }

  function bindChartBox() {
    var svgEl = detailEl.querySelector(".abtl-chart__svg");
    if (!svgEl) return;
    if (typeof ResizeObserver === "function") {
      if (!chartObserver) {
        chartObserver = new ResizeObserver(function () {
          fitChart();
        });
      }
      chartObserver.disconnect();
      chartObserver.observe(svgEl);
    }
    svgEl.addEventListener("pointermove", onChartPointer);
    svgEl.addEventListener("pointerleave", hideChartTip);
    fitChart();
  }

  function applyChart() {
    detailEl.querySelectorAll("button[data-chart]").forEach(function (btn) {
      btn.setAttribute("aria-pressed", btn.getAttribute("data-chart") === chartMode ? "true" : "false");
    });
    var svgEl = detailEl.querySelector(".abtl-chart__svg");
    if (!svgEl) return;
    svgEl.innerHTML = chartMarkup();
    if (chartPointer) placeChartTip(chartPointer.clientX, chartPointer.clientY, chartPointer.idx);
  }

  function updateDetailYear() {
    var through = detailEl.querySelector('[data-slot="through"]');
    if (through) {
      var totals = totalsAt(selected, year);
      through.querySelector(".abtl-num__label").textContent = t("throughYear", { year: year });
      through.querySelector(".abtl-num__value").innerHTML = countValueHtml(totals ? totals.throughYear : null);
    }
    var chip = detailEl.querySelector('[data-slot="split"]');
    if (chip) {
      if (statusAt(selected, year) === "split") {
        chip.hidden = false;
        chip.textContent = t("splitSince", { year: splitStart(selected, year) });
      } else {
        chip.hidden = true;
        chip.textContent = "";
      }
    }
    var estEl = detailEl.querySelector('[data-slot="est"]');
    if (estEl) {
      var est = estimateYears(selected, year);
      estEl.querySelector(".abtl-card__est-years").textContent = est.length ? est.join(", ") : EM_DASH;
      if (est.length) estEl.setAttribute("title", est.join(", "));
      else estEl.removeAttribute("title");
    }
    var dot = detailEl.querySelector(".abtl-chart__dot");
    if (dot && chartState) {
      var p = dotXY(chartState, year);
      dot.setAttribute("cx", p.x.toFixed(2));
      dot.setAttribute("cy", p.y.toFixed(2));
    }
  }

  function renderSource() {
    var title = t("sourceTitle");
    var body = t("sourceBody");
    var titleHtml = escapeHtml(title);
    var bodyHtml = escapeHtml(body);
    var linkWord = "zemljevidu";
    if (lang === "en") linkWord = "map";
    else if (lang === "es") linkWord = "mapa";
    var linkAt = title.indexOf(linkWord);
    var report = "Abortion Worldwide Report";
    var reportAt = body.indexOf(report);
    if (linkAt >= 0) {
      titleHtml =
        escapeHtml(title.slice(0, linkAt)) +
        '<a href="https://www.johnstonsarchive.net/policy/abortion/" style="color:inherit;text-decoration:underline">' +
        linkWord +
        "</a>" +
        escapeHtml(title.slice(linkAt + linkWord.length));
    }
    if (reportAt >= 0) {
      bodyHtml =
        escapeHtml(body.slice(0, reportAt)) +
        "<em>" + report + "</em>" +
        escapeHtml(body.slice(reportAt + report.length));
    }
    sourceEl.innerHTML = "<strong>" + titleHtml + "</strong>" + bodyHtml;
  }

  function paint() {
    var inForce = 0;
    var withdrawn = 0;
    var sum = 0;
    DATA.order.forEach(function (iso) {
      var status = statusAt(iso, year);
      if (status === "in") inForce += 1;
      else if (status === "out") withdrawn += 1;
      var totals = totalsAt(iso, year);
      var cum = totals ? totals.throughYear : 0;
      if (cum > 0) sum += cum;
      var n = nodes.get(iso);
      if (cum > 0) {
        n.red.style.display = "";
        n.red.style.fillOpacity = String(intensity(cum));
      } else {
        n.red.style.display = "none";
      }
      if (status === "in" || status === "out" || status === "split") {
        n.pat.style.display = "";
        n.pat.setAttribute("fill", "url(#abtl-" + status + ")");
      } else {
        n.pat.style.display = "none";
      }
      n.hit.classList.toggle("is-active", iso === selected);
      n.title.textContent = nameOf(iso);
    });
    renderStats(inForce, withdrawn, sum);
    var nextKey = selected ? selected + "\0" + lang : "";
    if (nextKey !== detailKey) {
      detailKey = nextKey;
      renderDetail();
    } else if (selected) {
      updateDetailYear();
    }
    slider.value = String(year);
    slider.setAttribute("aria-valuetext", String(year));
    svg.setAttribute("aria-label", t("mapLabel", { year: year }));
  }

  function syncPlay() {
    playBtn.setAttribute("aria-pressed", playing ? "true" : "false");
    playBtn.setAttribute("aria-label", playing ? t("pause") : t("play"));
  }

  function stop() {
    playing = false;
    if (timer) clearTimeout(timer);
    timer = null;
    syncPlay();
  }

  function arm() {
    timer = setTimeout(function () {
      if (!playing) return;
      if (year >= DATA.YEAR_MAX) {
        stop();
        return;
      }
      year += 1;
      paint();
      arm();
    }, 320);
  }

  function setLang(next) {
    lang = next;
    try { localStorage.setItem("abtl-lang", lang); } catch (e) {}
    document.documentElement.lang = lang;
    langBox.setAttribute("aria-label", t("language"));
    langBox.querySelectorAll("button").forEach(function (btn) {
      btn.setAttribute("aria-pressed", btn.getAttribute("data-lang") === lang ? "true" : "false");
    });
    titleEl.textContent = t("title");
    syncPlay();
    slider.setAttribute("aria-label", t("year"));
    renderLegend();
    renderSource();
    paint();
  }

  playBtn.addEventListener("click", function () {
    if (playing) {
      stop();
      return;
    }
    if (year >= DATA.YEAR_MAX) {
      year = DATA.YEAR_MIN;
      paint();
    }
    playing = true;
    syncPlay();
    arm();
  });

  slider.addEventListener("input", function () {
    if (playing) stop();
    year = Number(slider.value);
    paint();
  });

  langBox.addEventListener("click", function (event) {
    var btn = event.target.closest("button[data-lang]");
    if (!btn) return;
    setLang(btn.getAttribute("data-lang"));
  });

  detailEl.addEventListener("click", function (event) {
    var btn = event.target.closest("button[data-chart]");
    if (!btn) return;
    var next = btn.getAttribute("data-chart");
    if (next !== "cum" && next !== "year") return;
    if (next === chartMode) return;
    chartMode = next;
    applyChart();
  });

  buildMap();
  setLang(lang);
})();
