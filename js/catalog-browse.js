(function catalogBrowse() {
  "use strict";

  var ISSUE_LABELS = {
    "družina": "Družina",
    evtanazija: "Evtanazija",
    invalidnost: "Invalidnost",
    "vrednost-zivljenja": "Vrednost življenja",
    ljubezen: "Ljubezen",
    "smisel-zivljenja": "Smisel življenja",
    zakon: "Zakon",
    zvestoba: "Zvestoba",
    vera: "Vera",
    zaveza: "Zaveza",
    "očetovstvo": "Očetovstvo",
    smrt: "Smrt",
    poklicanost: "Poklicanost",
    trpljenje: "Trpljenje",
    "odpuščanje": "Odpuščanje",
    "ločitev": "Ločitev",
    "moralni-kompas": "Moralni kompas",
    upanje: "Upanje",
    vest: "Vest",
    resnica: "Resnica",
    "pravičnost": "Pravičnost",
    tehnologija: "Tehnologija",
    spomin: "Spomin",
    "maščevanje": "Maščevanje",
    "starševstvo": "Starševstvo",
    milost: "Milost",
    zasvojenost: "Zasvojenost",
    splav: "Splav",
    neplodnost: "Neplodnost",
    molitev: "Molitva",
    spolnost: "Spolnost",
    "spolna-identiteta": "Spolna identiteta",
    staranje: "Staranje",
  };

  function fold(value) {
    return String(value == null ? "" : value)
      .toLowerCase()
      .replace(/č/g, "c")
      .replace(/š/g, "s")
      .replace(/ž/g, "z")
      .replace(/ć/g, "c")
      .replace(/đ/g, "d");
  }

  function escapeHtml(value) {
    return String(value == null ? "" : value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function issueLabel(slug) {
    return ISSUE_LABELS[slug] || slug;
  }

  function checkedValues(container) {
    if (!container) return [];
    return Array.prototype.map
      .call(container.querySelectorAll("input:checked"), function (input) {
        return input.value;
      })
      .filter(Boolean);
  }

  function matchesAny(have, selected) {
    if (!selected.length) return true;
    for (var i = 0; i < selected.length; i++) {
      if (have.indexOf(selected[i]) !== -1) return true;
    }
    return false;
  }

  function fillChecks(container, values, attr) {
    container.innerHTML = values
      .map(function (value) {
        var label = value.label || value.value;
        return (
          '<label class="ml-check">' +
          '<input type="checkbox" data-browse-filter="' +
          attr +
          '" value="' +
          escapeHtml(value.value) +
          '">' +
          "<span>" +
          escapeHtml(label) +
          "</span>" +
          "</label>"
        );
      })
      .join("");
  }

  function setFilterCount(el, count) {
    if (!el) return;
    if (!count) {
      el.hidden = true;
      el.textContent = "";
      return;
    }
    el.hidden = false;
    el.textContent = count === 1 ? "1 aktiven" : count + " aktivnih";
  }

  function countLabel(n, one, two, few, many) {
    if (n === 1) return "1 " + one;
    if (n === 2) return "2 " + two;
    if (n === 3 || n === 4) return n + " " + few;
    return n + " " + many;
  }

  initFilms();
  initBooks();

  function initFilms() {
    var root = document.querySelector("[data-film-browse]");
    if (!root) return;
    var grid = root.querySelector("[data-film-shuffle]");
    var issuesEl = root.querySelector("[data-film-issues]");
    var qEl = root.querySelector("[data-film-q]");
    var countEl = root.querySelector("[data-film-count]");
    var filterCountEl = root.querySelector("[data-film-filter-count]");
    var emptyEl = root.querySelector("[data-film-empty]");
    if (!grid || !issuesEl || !qEl) return;

    var seen = {};
    Array.prototype.forEach.call(grid.querySelectorAll("[data-film-issues]"), function (el) {
      (el.getAttribute("data-film-issues") || "").split("|").forEach(function (slug) {
        if (slug) seen[slug] = true;
      });
    });
    var options = Object.keys(seen)
      .map(function (slug) {
        return { value: slug, label: issueLabel(slug) };
      })
      .sort(function (a, b) {
        return a.label.localeCompare(b.label, "sl");
      });
    fillChecks(issuesEl, options, "issues");

    var qTimer;
    function apply() {
      var q = fold(qEl.value.trim());
      var selected = checkedValues(issuesEl);
      var visible = 0;
      Array.prototype.forEach.call(grid.children, function (el) {
        if (!el.getAttribute) return;
        var issues = (el.getAttribute("data-film-issues") || "").split("|").filter(Boolean);
        var hay = fold(el.getAttribute("data-film-search") || "");
        var ok = matchesAny(issues, selected) && (!q || hay.indexOf(q) !== -1);
        el.hidden = !ok;
        if (ok) visible++;
      });
      if (countEl) countEl.textContent = countLabel(visible, "film", "filma", "filmi", "filmov");
      setFilterCount(filterCountEl, selected.length);
      if (emptyEl) emptyEl.hidden = visible !== 0;
    }

    qEl.addEventListener("input", function () {
      window.clearTimeout(qTimer);
      qTimer = window.setTimeout(apply, 160);
    });
    root.addEventListener("change", function (ev) {
      if (!ev.target.closest("[data-browse-filter]")) return;
      apply();
    });
    apply();
  }

  function initBooks() {
    var root = document.querySelector("[data-book-browse]");
    if (!root) return;
    var dataNode = document.getElementById("book-data");
    var grid = root.querySelector("[data-book-grid]");
    var issuesEl = root.querySelector("[data-book-issues]");
    var shopEl = root.querySelector("[data-book-shop]");
    var qEl = root.querySelector("[data-book-q]");
    var sortEl = root.querySelector("[data-book-sort]");
    var countEl = root.querySelector("[data-book-count]");
    var filterCountEl = root.querySelector("[data-book-filter-count]");
    if (!dataNode || !grid || !issuesEl || !shopEl || !qEl) return;

    var items;
    try {
      items = JSON.parse(dataNode.textContent || "[]");
      if (typeof items === "string") items = JSON.parse(items);
    } catch (err) {
      return;
    }
    if (!Array.isArray(items) || !items.length) return;

    items = shuffle(items.slice());
    items.forEach(function (item, index) {
      item._order = index;
    });

    var issueSeen = {};
    var shopSeen = {};
    items.forEach(function (item) {
      (item.issues || []).forEach(function (slug) {
        if (slug) issueSeen[slug] = true;
      });
      if (item.shop) shopSeen[item.shop] = true;
    });
    fillChecks(
      issuesEl,
      Object.keys(issueSeen)
        .map(function (slug) {
          return { value: slug, label: issueLabel(slug) };
        })
        .sort(function (a, b) {
          return a.label.localeCompare(b.label, "sl");
        }),
      "issues"
    );
    fillChecks(
      shopEl,
      Object.keys(shopSeen)
        .sort(function (a, b) {
          return a.localeCompare(b, "sl");
        })
        .map(function (shop) {
          return { value: shop, label: shop };
        }),
      "shop"
    );

    var qTimer;
    function priceValue(item) {
      var match = String(item.price || "")
        .replace(",", ".")
        .match(/([0-9]+(?:\.[0-9]+)?)/);
      return match ? Number(match[1]) : Number.POSITIVE_INFINITY;
    }

    function haystack(item) {
      var labels = (item.issues || []).map(issueLabel);
      return fold(
        [item.title, item.authors, item.shop].concat(labels).join(" ")
      );
    }

    function apply() {
      var q = fold(qEl.value.trim());
      var selectedIssues = checkedValues(issuesEl);
      var selectedShops = checkedValues(shopEl);
      var filtered = items.filter(function (item) {
        if (!matchesAny(item.issues || [], selectedIssues)) return false;
        if (selectedShops.length && selectedShops.indexOf(item.shop || "") === -1) return false;
        if (q && haystack(item).indexOf(q) === -1) return false;
        return true;
      });
      var mode = sortEl ? sortEl.value : "mixed";
      filtered.sort(function (a, b) {
        if (mode === "title") return fold(a.title).localeCompare(fold(b.title), "sl");
        if (mode === "price-asc") return priceValue(a) - priceValue(b);
        if (mode === "price-desc") return priceValue(b) - priceValue(a);
        return a._order - b._order;
      });

      grid.innerHTML = "";
      if (!filtered.length) {
        grid.innerHTML =
          '<p class="ml-empty">Ni zadetkov. Poskusi drug iskalni niz ali odstrani filtre.</p>';
      } else {
        filtered.forEach(function (item) {
          grid.appendChild(bookCard(item));
        });
      }
      if (countEl) countEl.textContent = countLabel(filtered.length, "knjiga", "knjigi", "knjige", "knjig");
      setFilterCount(filterCountEl, selectedIssues.length + selectedShops.length);
    }

    qEl.addEventListener("input", function () {
      window.clearTimeout(qTimer);
      qTimer = window.setTimeout(apply, 160);
    });
    root.addEventListener("change", function (ev) {
      if (ev.target === sortEl || ev.target.closest("[data-browse-filter]")) apply();
    });
    apply();
  }

  function bookCard(item) {
    var a = document.createElement("a");
    a.className = "home-poster ml-card";
    a.href = item.url || "#";
    if (/^https?:\/\//i.test(a.href)) {
      a.target = "_blank";
      a.rel = "noopener";
    }
    var media = document.createElement("span");
    media.className = "home-poster__media";
    if (item.image) {
      var img = document.createElement("img");
      img.src = item.image;
      img.alt = item.title || "";
      img.loading = "lazy";
      media.appendChild(img);
    }
    if (item.price) {
      var chip = document.createElement("span");
      chip.className = "ml-price-chip";
      chip.textContent = item.price;
      media.appendChild(chip);
    }
    a.appendChild(media);
    var title = document.createElement("span");
    title.className = "home-poster__title";
    title.textContent = item.title || "";
    title.title = item.title || "";
    a.appendChild(title);
    return a;
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
})();
