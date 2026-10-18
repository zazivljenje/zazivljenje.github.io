(function catalogListing() {
  var listings = document.querySelectorAll("[data-catalog]");
  if (!listings.length) return;

  listings.forEach(initListing);

  function initListing(root) {
    var grid = root.querySelector("[data-catalog-grid]");
    var payload = root.querySelector("[data-catalog-json]");
    var sentinel = root.querySelector("[data-catalog-more]");
    if (!grid || !payload) return;

    var items;
    try {
      items = JSON.parse(payload.textContent || "[]");
      if (typeof items === "string") items = JSON.parse(items);
    } catch (err) {
      root.setAttribute("data-catalog", "ready");
      return;
    }
    if (!Array.isArray(items) || !items.length) {
      root.setAttribute("data-catalog", "ready");
      return;
    }

    var mix = root.getAttribute("data-catalog-mix") || "";
    var preferNew = root.getAttribute("data-prefer-new") === "1";
    var verifyLinks = root.getAttribute("data-verify-links") === "1";
    var ctaHref = root.getAttribute("data-catalog-cta") || "";
    var ctaLabel = root.getAttribute("data-catalog-cta-label") || "Oglej si vse izdelke";
    var limit = Number(root.getAttribute("data-limit") || 0);
    var used = Object.create(null);
    var pool = items.slice();
    var shown = 0;
    var pending = null;
    var loading = false;
    var ctaAppended = false;

    function pageSize() {
      if (limit > 0) return items.length;
      var rows = Number(root.getAttribute("data-page-rows") || 2);
      return Math.max(gridColumns(grid) * rows, rows);
    }

    function start() {
      var prepare = mix === "miniloop"
        ? pickMiniloopMix(pool, limit > 0 ? limit : pageSize(), preferNew)
        : Promise.resolve(shuffle(pool));

      prepare.then(function (selected) {
        if (limit > 0) selected = selected.slice(0, limit);
        items = selected;
        selected.forEach(function (item) {
          if (item && item.id) used[item.id] = true;
        });

        if (!verifyLinks) {
          renderPage();
          watchMore();
          return;
        }

        verifyBatch(selected).then(function (valid) {
          items = valid;
          grid.innerHTML = "";
          shown = 0;
          pending = null;
          renderPage();
          watchMore();
        });
      });
    }

    function verifyBatch(list) {
      var out = [];
      var i = 0;

      function next() {
        if (i >= list.length) return Promise.resolve(out);
        var item = list[i++];
        return verifyItem(item).then(function (ok) {
          if (ok) {
            out.push(item);
            return next();
          }
          return replaceBroken(item).then(function (alt) {
            if (alt) out.push(alt);
            return next();
          });
        });
      }

      return next();
    }

    function replaceBroken(broken) {
      var bucket = itemBucket(broken);
      var candidates = pool.filter(function (item) {
        if (!item || !item.id || used[item.id]) return false;
        if (broken && item.id === broken.id) return false;
        return itemBucket(item) === bucket || !bucket;
      });
      if (preferNew) candidates = preferNewFirst(candidates);
      else candidates = shuffle(candidates);

      var extras = pool.filter(function (item) {
        return item && item.id && !used[item.id] && (!broken || item.id !== broken.id);
      });
      if (preferNew) extras = preferNewFirst(extras);
      else extras = shuffle(extras);

      var queue = candidates.concat(extras);
      var qi = 0;

      function tryNext() {
        if (qi >= queue.length) return Promise.resolve(null);
        var candidate = queue[qi++];
        return verifyItem(candidate).then(function (ok) {
          if (!ok) return tryNext();
          used[candidate.id] = true;
          return candidate;
        });
      }

      return tryNext();
    }

    function verifyItem(item) {
      var src = thumb(clean(item && item.image));
      if (!src) return Promise.resolve(false);
      return new Promise(function (resolve) {
        var img = new Image();
        var done = false;
        function finish(ok) {
          if (done) return;
          done = true;
          resolve(ok);
        }
        img.onload = function () {
          finish(true);
        };
        img.onerror = function () {
          finish(false);
        };
        setTimeout(function () {
          finish(true);
        }, 2800);
        img.referrerPolicy = "no-referrer";
        img.src = src;
      });
    }

    function appendCta() {
      if (!ctaHref || ctaAppended) return;
      ctaAppended = true;
      grid.appendChild(ctaCard(ctaHref, ctaLabel));
    }

    function renderPage() {
      if (loading || shown >= items.length) return;
      loading = true;
      var page = pending || items.slice(shown, shown + pageSize());
      pending = null;
      page.forEach(function (item, index) {
        var el = card(item, shown === 0 && index < 4);
        bindSwap(el, item);
        grid.appendChild(el);
      });
      shown += page.length;
      loading = false;
      root.setAttribute("data-catalog", "ready");
      if (shown >= items.length) {
        appendCta();
        if (sentinel) sentinel.hidden = true;
        return;
      }
      if (sentinel) sentinel.hidden = false;
      pending = items.slice(shown, shown + pageSize());
      preload(pending);
    }

    function bindSwap(el, item) {
      if (!verifyLinks) return;
      var img = el.querySelector("img");
      if (!img) return;
      img.addEventListener("error", function onErr() {
        img.removeEventListener("error", onErr);
        replaceBroken(item).then(function (alt) {
          if (!alt || !el.parentNode) return;
          var next = card(alt, false);
          bindSwap(next, alt);
          el.replaceWith(next);
        });
      });
    }

    function watchMore() {
      if (!sentinel || shown >= items.length) return;
      if ("IntersectionObserver" in window) {
        var observer = new IntersectionObserver(
          function (entries) {
            if (entries.some(function (entry) {
              return entry.isIntersecting;
            })) {
              renderPage();
            }
          },
          { rootMargin: "900px 0px", threshold: 0.01 }
        );
        observer.observe(sentinel);
      } else {
        renderPage();
        while (shown < items.length) renderPage();
      }
    }

    start();
  }

  function pickMiniloopMix(pool, count, preferNew) {
    count = Math.max(1, count || 6);
    var buckets = {
      clothing: [],
      shoes: [],
      kids: [],
      adult: [],
      other: [],
    };

    pool.forEach(function (item) {
      var bucket = itemBucket(item);
      if (bucket && buckets[bucket]) buckets[bucket].push(item);
      if (isKids(item)) buckets.kids.push(item);
    });

    Object.keys(buckets).forEach(function (key) {
      buckets[key] = preferNew ? preferNewFirst(buckets[key]) : shuffle(buckets[key]);
    });

    var recipe = ["clothing", "shoes", "kids", "adult", "other"];
    var picked = [];
    var seen = Object.create(null);

    function takeFrom(list) {
      for (var i = 0; i < list.length; i++) {
        var item = list[i];
        if (!item || !item.id || seen[item.id]) continue;
        seen[item.id] = true;
        picked.push(item);
        return true;
      }
      return false;
    }

    recipe.forEach(function (name) {
      if (picked.length >= count) return;
      takeFrom(buckets[name] || []);
    });

    var filler = preferNew ? preferNewFirst(pool) : shuffle(pool);
    for (var i = 0; i < filler.length && picked.length < count; i++) {
      var item = filler[i];
      if (!item || !item.id || seen[item.id]) continue;
      seen[item.id] = true;
      picked.push(item);
    }

    return Promise.resolve(shuffle(picked));
  }

  function itemBucket(item) {
    var slug = clean(item.category_slug || "").toLowerCase();
    var cat = clean(item.category || "").toLowerCase();
    var blob = slug + " " + cat;
    if (/obutev|shoe|copat|čevelj|cevlj/.test(blob) || /obutev/.test(slug)) return "shoes";
    if (/nosecn|noseč|adult|mama|oče|oce|starš|stars/.test(blob) || /nosecn/.test(slug)) {
      return "adult";
    }
    if (/dodatk|oprem|igrač|igrac|stol|gnezdo|nosilk|accessory|non-?cloth/.test(blob)) {
      return "other";
    }
    if (/oblacil|oblačil|clothing|majica|hlače|hlace|jop|bodi|obleka/.test(blob) || /oblacila/.test(slug)) {
      return "clothing";
    }
    return "other";
  }

  function isKids(item) {
    var slug = clean(item.category_slug || "").toLowerCase();
    var cat = clean(item.category || "").toLowerCase();
    var gender = clean(item.gender || "").toLowerCase();
    if (/otrok|otrosk|kids|child|dojen|deklic|deček|decek/.test(slug + " " + cat)) return true;
    if (gender === "deklica" || gender === "decek" || gender === "deček") return true;
    var size = parseInt(clean(item.size || item.kicker || ""), 10);
    if (!isNaN(size) && size > 0 && size <= 176) return true;
    return itemBucket(item) === "clothing" || itemBucket(item) === "shoes";
  }

  function isNewCondition(item) {
    var c = clean(item.condition || "").toLowerCase();
    return c === "kot novo" || c.indexOf("novo") !== -1;
  }

  function preferNewFirst(list) {
    var fresh = [];
    var rest = [];
    list.forEach(function (item) {
      if (isNewCondition(item)) fresh.push(item);
      else rest.push(item);
    });
    return shuffle(fresh).concat(shuffle(rest));
  }

  function ctaCard(href, label) {
    var a = document.createElement("a");
    a.className = "home-poster home-poster--cta";
    a.href = href;
    var media = document.createElement("span");
    media.className = "home-poster__media home-poster__media--cta";
    var body = document.createElement("span");
    body.className = "home-poster__cta-body";
    var arrow = document.createElement("span");
    arrow.className = "home-poster__cta-arrow";
    arrow.setAttribute("aria-hidden", "true");
    arrow.textContent = "→";
    var title = document.createElement("span");
    title.className = "home-poster__cta-label";
    title.textContent = label || "Oglej si vse izdelke";
    body.appendChild(arrow);
    body.appendChild(title);
    media.appendChild(body);
    a.appendChild(media);
    return a;
  }

  function card(item, eager) {
    var a = document.createElement("a");
    a.className = "home-poster ml-card";
    var href = clean(item.url);
    a.href = href || "#";
    if (item.external !== false && looksExternal(href)) {
      a.target = "_blank";
      a.rel = "noopener";
    }

    var media = document.createElement("span");
    media.className = "home-poster__media";
    var src = thumb(clean(item.image));
    if (src) {
      var img = document.createElement("img");
      img.src = src;
      img.alt = clean(item.title) || "";
      img.referrerPolicy = "no-referrer";
      if (eager) img.setAttribute("fetchpriority", "high");
      else img.loading = "lazy";
      media.appendChild(img);
    }
    var priceText = clean(item.price);
    if (priceText) {
      var chip = document.createElement("span");
      chip.className = "ml-price-chip";
      chip.textContent = priceText;
      media.appendChild(chip);
    }
    a.appendChild(media);

    var gpc = clean(
      item.google_category_label_sl || item.google_category_label || item.category
    );
    if (gpc) {
      var gpcSpan = document.createElement("span");
      gpcSpan.className = "home-poster__gpc";
      gpcSpan.textContent = gpc;
      a.appendChild(gpcSpan);
    }

    var title = document.createElement("span");
    title.className = "home-poster__title";
    title.textContent = clean(item.title) || "";
    title.title = clean(item.title) || "";
    a.appendChild(title);

    var chars = [];
    if (item.size) chars.push("Velikost " + clean(item.size));
    if (item.color) chars.push(clean(item.color));
    if (item.gender_label) chars.push(clean(item.gender_label));
    if (chars.length) {
      var meta = document.createElement("span");
      meta.className = "ml-card__chars";
      meta.textContent = chars.join(" · ");
      a.appendChild(meta);
    }
    return a;
  }

  function clean(value) {
    if (value == null) return "";
    var text = String(value).trim();
    if (text.length >= 2 && text.charAt(0) === '"' && text.charAt(text.length - 1) === '"') {
      text = text.slice(1, -1).replace(/\\"/g, '"');
    }
    return text;
  }

  function thumb(url) {
    if (!url) return url;
    if (url.indexOf("cdn.miniloop.si") === -1) return url;
    if (/-w\d+\.webp$/i.test(url)) return url;
    return url.replace(/\.jpe?g$/i, "-w400.webp");
  }

  function looksExternal(url) {
    return /^https?:\/\//i.test(url);
  }

  function preload(page) {
    if (!page || !page.length) return;
    page.forEach(function (item) {
      var src = thumb(clean(item.image));
      if (!src) return;
      var img = new Image();
      img.decoding = "async";
      img.referrerPolicy = "no-referrer";
      img.src = src;
    });
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

  function gridColumns(grid) {
    var raw = window.getComputedStyle(grid).gridTemplateColumns || "";
    var parts = raw.split(" ").filter(function (part) {
      return part && part !== "none";
    });
    return parts.length || 1;
  }
})();
