(() => {
  const root = document.getElementById("legal-map-app");
  if (!root) return;

  const geoUrl = root.dataset.geo;
  const dataUrl = root.dataset.legal;
  const layerEls = [...root.querySelectorAll('input[name="legal-map-layer"]')];
  const searchInput = root.querySelector("#legal-map-search");
  const searchResults = root.querySelector("#legal-map-search-results");
  const legendEl = root.querySelector("#legal-map-legend-list");
  const sideEl = root.querySelector("#legal-map-side");
  const canvas = document.getElementById("legal-map-canvas");
  const NO_DATA = "#f8e7a0";

  const state = {
    layer: "abortion",
    data: null,
    byId: new Map(),
    geo: null,
    map: null,
    leafletLayer: null,
    selected: null,
  };

  function countryId(props) {
    return props.ADM0_A3 || props.ISO_A3;
  }

  function recordFor(feature) {
    return state.byId.get(countryId(feature.properties));
  }

  function isUnknown(rec, field) {
    return !rec || rec[field].status === "unknown";
  }

  function treatyFill(rec) {
    const cats = state.data.categories.treaties;
    if (!rec) return NO_DATA;
    const hasA = rec.treaties.includes("achr4");
    const hasG = rec.treaties.includes("gcd");
    if (hasA && hasG) return cats.both.color;
    if (hasA) return cats.achr4.color;
    if (hasG) return cats.gcd.color;
    return cats.none.color;
  }

  function fillColor(rec) {
    if (!rec) return NO_DATA;
    if (state.layer === "abortion" || state.layer === "combined") {
      const st = rec.abortion.status;
      if (st === "unknown") return NO_DATA;
      return state.data.categories.abortion[st]?.color || NO_DATA;
    }
    if (state.layer === "euthanasia") {
      const st = rec.euthanasia.status;
      if (st === "unknown") return NO_DATA;
      return state.data.categories.euthanasia[st]?.color || NO_DATA;
    }
    return treatyFill(rec);
  }

  function strokeColor(rec) {
    if (state.layer === "combined" && rec && rec.euthanasia.status !== "unknown") {
      return state.data.categories.euthanasia[rec.euthanasia.status]?.color || "#666";
    }
    return "#6a6a6a";
  }

  function styleFeature(feature) {
    const rec = recordFor(feature);
    const selected = rec && rec.id === state.selected;
    return {
      fillColor: fillColor(rec),
      fillOpacity: 1,
      color: selected ? "#111" : strokeColor(rec),
      weight: state.layer === "combined" ? (selected ? 3 : 2) : selected ? 2.2 : 0.7,
    };
  }

  function renderLegend() {
    const items = [];
    if (state.layer === "abortion" || state.layer === "combined") {
      items.push(["Umetni splav", state.data.categories.abortion]);
    }
    if (state.layer === "euthanasia" || state.layer === "combined") {
      items.push([
        "Medicinska zastrupitev in asistirani samomor",
        state.data.categories.euthanasia,
      ]);
    }
    if (state.layer === "treaties") {
      items.push(["Pogodbe in deklaracije", state.data.categories.treaties]);
    }
    legendEl.innerHTML = `<div class="legal-map-legend-groups">${items
      .map(([title, cats]) => {
        const rows = Object.values(cats)
          .map(
            (c) =>
              `<li><span class="legal-map-swatch" style="background:${c.color}"></span>${c.label}</li>`
          )
          .join("");
        return `<div><strong>${title}</strong><ul>${rows}</ul></div>`;
      })
      .join("")}</div>`;
    if (state.layer === "combined") {
      legendEl.insertAdjacentHTML(
        "beforeend",
        `<p class="legal-map-note">Polnilo: umetni splav. Obroba: medicinska zastrupitev / asistirani samomor. Svetlejša siva pomeni večje varovanje življenja.</p>`
      );
    }
  }

  function luminance(hex) {
    const h = hex.replace("#", "");
    if (h.length !== 6) return 0;
    const r = parseInt(h.slice(0, 2), 16) / 255;
    const g = parseInt(h.slice(2, 4), 16) / 255;
    const b = parseInt(h.slice(4, 6), 16) / 255;
    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
  }

  function badge(label, color) {
    const text = luminance(color) > 0.55 ? "#222" : "#fff";
    return `<span class="legal-map-badge" style="background:${color};color:${text}">${label}</span>`;
  }

  function listBlock(title, items) {
    if (!items || !items.length) return "";
    return `<h3>${title}</h3><ul>${items.map((x) => `<li>${x}</li>`).join("")}</ul>`;
  }

  function sourcesBlock(rec) {
    const src = [...(rec.sources || []), ...state.data.general_sources].slice(0, 8);
    const seen = new Set();
    const unique = [];
    for (const s of src) {
      if (seen.has(s.url)) continue;
      seen.add(s.url);
      unique.push(s);
    }
    return `<h3>Viri in evidence</h3><ul>${unique
      .map((s) => `<li><a href="${s.url}" target="_blank" rel="noopener">${s.title}</a></li>`)
      .join("")}</ul>`;
  }

  function treatyLabels(rec) {
    const defs = state.data.treaty_defs || [];
    if (!rec.treaties.length) {
      return "<p>V tem naboru ni ACHR 4(1) niti Ženevske konsenzne deklaracije.</p>";
    }
    return rec.treaties
      .map((id) => {
        const def = defs.find((d) => d.id === id);
        const cat = state.data.categories.treaties[id];
        if (!def) return "";
        return `<p>${badge(cat.label, cat.color)}</p><p>${def.article} <a href="${def.url}" target="_blank" rel="noopener">Besedilo</a></p>`;
      })
      .join("");
  }

  function renderSide(rec) {
    if (!rec) {
      sideEl.hidden = true;
      sideEl.innerHTML = "";
      return;
    }
    const a = state.data.categories.abortion[rec.abortion.status];
    const e = state.data.categories.euthanasia[rec.euthanasia.status];
    sideEl.hidden = false;
    const aFallback = isUnknown(rec, "abortion")
      ? "Za to državo v zbirki še ni podrobnega vpisa."
      : "Kategorija po javno objavljenih podatkih; podrobnosti v virih.";
    const eFallback = isUnknown(rec, "euthanasia")
      ? "Za to državo v zbirki še ni podrobnega vpisa."
      : "Kategorija po javno objavljenih podatkih; preverite nacionalno kazensko pravo.";
    sideEl.innerHTML = `
      <h2>${rec.name_sl}</h2>
      <p class="legal-map-note">${rec.region || ""}</p>
      <div class="legal-map-badges">
        ${badge("Umetni splav: " + a.label, a.color)}
        ${badge("Konec življenja: " + e.label, e.color)}
      </div>
      <h3>Umetni splav</h3>
      <p>${rec.abortion.conditions || aFallback}</p>
      ${listBlock("Ključni predpisi / sodna praksa (splav)", rec.abortion.legislation)}
      <h3>Medicinska zastrupitev in asistirani samomor</h3>
      <p>${rec.euthanasia.conditions || eFallback}</p>
      ${listBlock("Ključni predpisi / sodna praksa", rec.euthanasia.legislation)}
      <h3>Mednarodni instrumenti o življenju od spočetja</h3>
      ${treatyLabels(rec)}
      ${sourcesBlock(rec)}
    `;
  }

  function refreshStyles() {
    if (state.leafletLayer) state.leafletLayer.setStyle(styleFeature);
    renderLegend();
  }

  function selectCountry(id, fly) {
    const rec = state.byId.get(id);
    state.selected = rec ? rec.id : null;
    renderSide(rec);
    refreshStyles();
    if (fly && rec && state.leafletLayer) {
      state.leafletLayer.eachLayer((layer) => {
        if (countryId(layer.feature.properties) === rec.id && layer.getBounds) {
          state.map.fitBounds(layer.getBounds(), { maxZoom: 5, padding: [20, 20] });
        }
      });
    }
  }

  function onEachFeature(feature, layer) {
    const rec = recordFor(feature);
    const name = rec ? rec.name_sl : feature.properties.ADMIN || feature.properties.NAME;
    layer.bindTooltip(name, { sticky: true });
    layer.on({
      mouseover(e) {
        e.target.setStyle({ weight: 2 });
        e.target.bringToFront();
      },
      mouseout(e) {
        state.leafletLayer.resetStyle(e.target);
      },
      click() {
        if (rec) selectCountry(rec.id, false);
      },
    });
  }

  function bindSearch() {
    searchInput.addEventListener("input", () => {
      const q = searchInput.value.trim().toLowerCase();
      searchResults.innerHTML = "";
      if (q.length < 2) return;
      const hits = state.data.countries
        .filter(
          (c) =>
            c.name_sl.toLowerCase().includes(q) ||
            (c.name || "").toLowerCase().includes(q)
        )
        .slice(0, 12);
      for (const c of hits) {
        const li = document.createElement("li");
        const btn = document.createElement("button");
        btn.type = "button";
        btn.textContent = c.name_sl;
        btn.addEventListener("click", () => {
          searchInput.value = c.name_sl;
          searchResults.innerHTML = "";
          selectCountry(c.id, true);
        });
        li.appendChild(btn);
        searchResults.appendChild(li);
      }
    });
  }

  async function init() {
    const [geo, data] = await Promise.all([
      fetch(geoUrl).then((r) => r.json()),
      fetch(dataUrl).then((r) => r.json()),
    ]);
    state.geo = geo;
    state.data = data;
    for (const c of data.countries) state.byId.set(c.id, c);

    const disc = root.querySelector("#legal-map-disclaimer");
    if (disc && data.meta.disclaimer) disc.textContent = data.meta.disclaimer;

    state.map = L.map(canvas, {
      worldCopyJump: true,
      minZoom: 2,
      maxZoom: 7,
      attributionControl: false,
    }).setView([20, 10], 2);
    L.control
      .attribution({ prefix: false })
      .addAttribution("Meje: Natural Earth")
      .addTo(state.map);

    state.leafletLayer = L.geoJSON(geo, {
      style: styleFeature,
      onEachFeature,
    }).addTo(state.map);
    setTimeout(() => state.map.invalidateSize(), 200);

    layerEls.forEach((el) => {
      el.addEventListener("change", () => {
        if (el.checked) {
          state.layer = el.value;
          refreshStyles();
        }
      });
    });

    bindSearch();
    renderLegend();
    renderSide(null);
  }

  init().catch((err) => {
    sideEl.hidden = false;
    sideEl.innerHTML = `<p>Zemljevida ni bilo mogoče naložiti.</p><p class="legal-map-note">${err}</p>`;
  });
})();
