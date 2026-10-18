(function miniloopBrowse() {
  "use strict";

  var root = document.getElementById("ml-browse");
  if (!root) return;

  var dataNode = document.getElementById("ml-data");
  if (!dataNode) return;

  var items;
  try {
    items = JSON.parse(dataNode.textContent || "[]");
    if (typeof items === "string") items = JSON.parse(items);
  } catch (err) {
    return;
  }
  if (!Array.isArray(items) || !items.length) return;

  var qEl = root.querySelector("[data-ml-q]");
  var gpcEl = root.querySelector("[data-ml-gpc]");
  var audienceEl = root.querySelector("[data-ml-audience]");
  var genderEl = root.querySelector("[data-ml-gender]");
  var condEl = root.querySelector("[data-ml-cond]");
  var colorEl = root.querySelector("[data-ml-color]");
  var filterCountEl = root.querySelector("[data-ml-filter-count]");
  var sortEl = root.querySelector("[data-ml-sort]");
  var grid = root.querySelector("[data-ml-grid]");
  var countEl = root.querySelector("[data-ml-count]");
  var relatedWrap = root.querySelector("[data-ml-related]");
  var relatedGrid = root.querySelector("[data-ml-related-grid]");
  var jsonLdEl = root.querySelector("[data-ml-jsonld]");

  var COLOR_ORDER = [
    "bela",
    "bež",
    "krem",
    "rumena",
    "oranžna",
    "roza",
    "rdeča",
    "vijolična",
    "modra",
    "zelena",
    "rjava",
    "siva",
    "črna",
    "zlata",
    "srebrna",
  ];
  var COLOR_HEX = {
    bela: "#f5f5f5",
    bež: "#e8dcc8",
    krem: "#f5f0e1",
    rumena: "#f5d76e",
    oranžna: "#f0a04b",
    roza: "#f4a7bb",
    rdeča: "#d64545",
    vijolična: "#8e6bb8",
    modra: "#4a7ec7",
    zelena: "#5a9e6f",
    rjava: "#8b5e3c",
    siva: "#9aa0a6",
    črna: "#222222",
    zlata: "#d4af37",
    srebrna: "#c0c0c0",
  };

  var state = {
    q: "",
    sort: "quality",
    gpc: {},
    audience: {},
    gender: {},
    cond: {},
    color: {},
  };

  var QUALITY_RANK = { "kot novo": 0, "zelo dobro": 1, dobro: 2 };

  function clean(value) {
    return String(value == null ? "" : value).trim();
  }

  function thumb(url) {
    if (!url) return url;
    if (url.indexOf("cdn.miniloop.si") === -1) return url;
    if (/-w\d+\.webp$/i.test(url)) return url;
    return url.replace(/\.jpe?g$/i, "-w400.webp");
  }

  function uniqueSorted(getter, locale) {
    var map = {};
    items.forEach(function (item) {
      var key = getter(item);
      if (!key) return;
      map[key] = true;
    });
    return Object.keys(map).sort(function (a, b) {
      return a.localeCompare(b, locale || "sl");
    });
  }

  function fillChecks(container, values, attr, labels) {
    if (!container) return;
    container.innerHTML = values
      .map(function (value) {
        var label = (labels && labels[value]) || value;
        return (
          '<label class="ml-check">' +
          '<input type="checkbox" data-ml-filter="' +
          attr +
          '" value="' +
          escapeHtml(value) +
          '">' +
          "<span>" +
          escapeHtml(label) +
          "</span>" +
          "</label>"
        );
      })
      .join("");
  }

  function escapeHtml(s) {
    return String(s == null ? "" : s)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function fillColorSwatches(container) {
    if (!container) return;
    var present = {};
    items.forEach(function (item) {
      if (item.color) present[item.color] = true;
    });
    var ordered = COLOR_ORDER.filter(function (name) {
      return present[name];
    });
    Object.keys(present).forEach(function (name) {
      if (ordered.indexOf(name) === -1) ordered.push(name);
    });
    container.innerHTML = ordered
      .map(function (name) {
        var hex = COLOR_HEX[name] || "#ccc";
        var light = name === "bela" || name === "bež" || name === "krem" || name === "rumena";
        return (
          '<label class="ml-swatch' +
          (light ? " ml-swatch--light" : "") +
          '" title="' +
          escapeHtml(name) +
          '">' +
          '<input type="checkbox" data-ml-filter="color" value="' +
          escapeHtml(name) +
          '">' +
          '<span class="ml-swatch__dot" style="background:' +
          hex +
          '"></span>' +
          '<span class="visually-hidden">' +
          escapeHtml(name) +
          "</span>" +
          "</label>"
        );
      })
      .join("");
  }

  fillChecks(
    gpcEl,
    uniqueSorted(function (i) {
      return i.google_category_label_sl || i.google_category_label;
    }),
    "gpc"
  );
  fillChecks(
    audienceEl,
    uniqueSorted(function (i) {
      return i.audience;
    }),
    "audience",
    { child: "Otroci", adult: "Odrasli" }
  );
  fillChecks(
    genderEl,
    uniqueSorted(function (i) {
      return i.suggested_gender;
    }),
    "gender",
    { female: "Ženske / deklice", male: "Moški / dečki", unisex: "Unisex" }
  );
  fillChecks(
    condEl,
    uniqueSorted(function (i) {
      return (i.condition || "").toLowerCase();
    }),
    "cond",
    { "kot novo": "Kot novo", "zelo dobro": "Zelo dobro", dobro: "Dobro" }
  );
  fillColorSwatches(colorEl);

  Array.prototype.forEach.call(root.querySelectorAll(".ml-filter-group"), function (group) {
    var list =
      group.querySelector(".ml-filter-group__list") ||
      group.querySelector(".ml-filter-group__swatches");
    if (list && !list.children.length) group.hidden = true;
  });

  function activeFilterCount() {
    return (
      selectedKeys("gpc").length +
      selectedKeys("audience").length +
      selectedKeys("gender").length +
      selectedKeys("cond").length +
      selectedKeys("color").length
    );
  }

  function updateFilterCount() {
    if (!filterCountEl) return;
    var n = activeFilterCount();
    if (!n) {
      filterCountEl.hidden = true;
      filterCountEl.textContent = "";
      return;
    }
    filterCountEl.hidden = false;
    filterCountEl.textContent = n === 1 ? "1 aktiven" : n + " aktivnih";
  }

  function selectedKeys(group) {
    return Object.keys(state[group]).filter(function (k) {
      return state[group][k];
    });
  }

  function matchesGroup(group, value) {
    var selected = selectedKeys(group);
    if (!selected.length) return true;
    return selected.indexOf(value) !== -1;
  }

  function matches(item) {
    var gpc = item.google_category_label_sl || item.google_category_label || "";
    if (!matchesGroup("gpc", gpc)) return false;
    if (!matchesGroup("audience", item.audience || "")) return false;
    if (!matchesGroup("gender", item.suggested_gender || "")) return false;
    if (!matchesGroup("cond", clean(item.condition).toLowerCase())) return false;
    if (!matchesGroup("color", item.color || "")) return false;
    if (state.q) {
      var hay = [
        item.title,
        item.category,
        item.google_category,
        item.google_category_label,
        item.google_category_label_sl,
        item.size,
        item.color,
        item.kicker,
        item.condition,
        item.gender_label,
        item.audience_label,
      ]
        .map(clean)
        .join(" ")
        .toLowerCase();
      if (hay.indexOf(state.q) === -1) return false;
    }
    return true;
  }

  function charsLine(item) {
    var parts = [];
    if (item.size) parts.push("Velikost " + item.size);
    if (item.color) parts.push(item.color);
    if (item.gender_label) parts.push(item.gender_label);
    else if (item.audience_label) parts.push(item.audience_label);
    if (item.condition_label || item.condition) {
      parts.push(item.condition_label || item.condition);
    }
    return parts.join(" · ");
  }

  function priceText(item) {
    if (item.price) return clean(item.price);
    if (item.price_amount != null) {
      return String(item.price_amount).replace(".", ",") + " €";
    }
    return "";
  }

  function card(item) {
    var a = document.createElement("a");
    a.className = "home-poster ml-card";
    a.href = clean(item.url) || "#";
    a.target = "_blank";
    a.rel = "noopener";
    a.setAttribute("itemscope", "");
    a.setAttribute("itemtype", "https://schema.org/Product");

    var media = document.createElement("span");
    media.className = "home-poster__media";
    var src = thumb(clean(item.image));
    if (src) {
      var img = document.createElement("img");
      img.src = src;
      img.alt = clean(item.title) || "";
      img.loading = "lazy";
      img.referrerPolicy = "no-referrer";
      img.setAttribute("itemprop", "image");
      media.appendChild(img);
    }
    var price = priceText(item);
    if (price) {
      var chip = document.createElement("span");
      chip.className = "ml-price-chip";
      chip.setAttribute("itemprop", "offers");
      chip.setAttribute("itemscope", "");
      chip.setAttribute("itemtype", "https://schema.org/Offer");
      var metaPrice = document.createElement("meta");
      metaPrice.setAttribute("itemprop", "price");
      metaPrice.content = item.price_amount != null ? String(item.price_amount) : price;
      var metaCur = document.createElement("meta");
      metaCur.setAttribute("itemprop", "priceCurrency");
      metaCur.content = item.price_currency || "EUR";
      var chipText = document.createElement("span");
      chipText.textContent = price;
      chip.appendChild(metaPrice);
      chip.appendChild(metaCur);
      chip.appendChild(chipText);
      media.appendChild(chip);
    }
    a.appendChild(media);

    var cat = clean(item.google_category_label_sl || item.category);
    if (cat) {
      var catSpan = document.createElement("span");
      catSpan.className = "home-poster__gpc";
      catSpan.setAttribute("itemprop", "category");
      catSpan.textContent = cat;
      a.appendChild(catSpan);
    }

    var title = document.createElement("span");
    title.className = "home-poster__title";
    title.setAttribute("itemprop", "name");
    title.textContent = clean(item.title) || "";
    title.title = clean(item.title) || "";
    a.appendChild(title);

    var chars = charsLine(item);
    if (chars) {
      var meta = document.createElement("span");
      meta.className = "ml-card__chars";
      meta.textContent = chars;
      if (item.size) {
        var sizeMeta = document.createElement("meta");
        sizeMeta.setAttribute("itemprop", "size");
        sizeMeta.content = item.size;
        meta.appendChild(sizeMeta);
      }
      if (item.color) {
        var colorMeta = document.createElement("meta");
        colorMeta.setAttribute("itemprop", "color");
        colorMeta.content = item.color;
        meta.appendChild(colorMeta);
      }
      a.appendChild(meta);
    }

    var linkMeta = document.createElement("meta");
    linkMeta.setAttribute("itemprop", "url");
    linkMeta.content = clean(item.url);
    a.appendChild(linkMeta);

    return a;
  }

  function complementaryBuckets(list) {
    var counts = { clothing: 0, shoes: 0, adult: 0, other: 0 };
    list.forEach(function (item) {
      var slug = clean(item.category_slug);
      if (slug === "obutev") counts.shoes += 1;
      else if (slug === "oblacila-za-nosecnice") counts.adult += 1;
      else if (slug === "dodatki") counts.other += 1;
      else counts.clothing += 1;
    });
    var lead = "clothing";
    var max = -1;
    Object.keys(counts).forEach(function (k) {
      if (counts[k] > max) {
        max = counts[k];
        lead = k;
      }
    });
    var selectedGpc = selectedKeys("gpc").join(" ").toLowerCase();
    if (/obutev|shoe/.test(selectedGpc)) lead = "shoes";
    if (/noseč|nosec|maternity/.test(selectedGpc)) lead = "adult";
    if (/gnez|nosilk|pleni|stol|dodatk/.test(selectedGpc)) lead = "other";
    if (/otrošk|otrosk|baby/.test(selectedGpc)) lead = "clothing";

    var map = {
      clothing: ["obutev", "dodatki"],
      shoes: ["otroska-oblacila", "dodatki"],
      other: ["otroska-oblacila", "obutev"],
      adult: ["dodatki", "otroska-oblacila"],
    };
    return map[lead] || ["obutev", "dodatki"];
  }

  function writeJsonLd(list) {
    if (!jsonLdEl) return;
    var products = list.slice(0, 24).map(function (item) {
      return item.schema || {
        "@type": "Product",
        name: item.title,
        image: item.image,
        url: item.url,
      };
    });
    jsonLdEl.textContent = JSON.stringify({
      "@context": "https://schema.org",
      "@type": "ItemList",
      numberOfItems: list.length,
      itemListElement: products.map(function (product, index) {
        return {
          "@type": "ListItem",
          position: index + 1,
          item: product,
        };
      }),
    });
  }

  function priceValue(item) {
    if (item.price_amount != null && !isNaN(item.price_amount)) {
      return Number(item.price_amount);
    }
    var m = String(item.price || "").replace(",", ".").match(/([0-9]+(?:\.[0-9]+)?)/);
    return m ? Number(m[1]) : Number.POSITIVE_INFINITY;
  }

  function qualityValue(item) {
    var key = clean(item.condition).toLowerCase();
    return QUALITY_RANK[key] != null ? QUALITY_RANK[key] : 9;
  }

  function sortItems(list) {
    var arr = list.slice();
    if (state.sort === "price-asc") {
      arr.sort(function (a, b) {
        return priceValue(a) - priceValue(b);
      });
    } else if (state.sort === "price-desc") {
      arr.sort(function (a, b) {
        return priceValue(b) - priceValue(a);
      });
    } else {
      arr.sort(function (a, b) {
        var q = qualityValue(a) - qualityValue(b);
        if (q !== 0) return q;
        return priceValue(a) - priceValue(b);
      });
    }
    return arr;
  }

  function render() {
    var filtered = sortItems(items.filter(matches));
    updateFilterCount();
    countEl.textContent =
      filtered.length === 1 ? "1 izdelek" : filtered.length + " izdelkov";

    grid.innerHTML = "";
    if (!filtered.length) {
      grid.innerHTML =
        '<p class="ml-empty">Ni zadetkov. Poskusi drug iskalni niz ali odstrani filtre.</p>';
    } else {
      filtered.forEach(function (item) {
        grid.appendChild(card(item));
      });
    }
    writeJsonLd(filtered);

    var ids = Object.create(null);
    filtered.forEach(function (item) {
      ids[item.id] = true;
    });
    var want = complementaryBuckets(filtered.length ? filtered : items);
    var related = items.filter(function (item) {
      return !ids[item.id] && want.indexOf(item.category_slug) !== -1;
    });
    related = shuffle(related).slice(0, 6);

    relatedGrid.innerHTML = "";
    if (related.length) {
      relatedWrap.hidden = false;
      related.forEach(function (item) {
        relatedGrid.appendChild(card(item));
      });
    } else {
      relatedWrap.hidden = true;
    }
  }

  function shuffle(list) {
    var arr = list.slice();
    for (var i = arr.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var tmp = arr[i];
      arr[i] = arr[j];
      arr[j] = tmp;
    }
    return arr;
  }

  var qTimer;
  qEl.addEventListener("input", function () {
    window.clearTimeout(qTimer);
    qTimer = window.setTimeout(function () {
      state.q = clean(qEl.value).toLowerCase();
      render();
    }, 160);
  });

  root.addEventListener("change", function (ev) {
    var input = ev.target.closest("[data-ml-filter]");
    if (!input) return;
    var group = input.getAttribute("data-ml-filter");
    var value = input.value;
    if (!state[group]) return;
    if (input.checked) state[group][value] = true;
    else delete state[group][value];
    render();
  });

  if (sortEl) {
    sortEl.value = state.sort;
    sortEl.addEventListener("change", function () {
      state.sort = sortEl.value || "quality";
      render();
    });
  }

  render();
})();
