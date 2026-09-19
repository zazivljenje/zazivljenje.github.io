(function () {
  var TZ = "Europe/Ljubljana";
  var catalog = null;
  var cleanup = null;
  var COURSE_SL = {
    soup: "Juha",
    side: "Priloga",
    side_dish: "Priloga",
    dessert: "Sladica",
    sauce: "Omaka",
    base: "Osnova",
    salad: "Solata",
    main: "Jed"
  };
  var DIFF_SL = { easy: "Lahko", medium: "Srednje", hard: "Zahtevno" };
  var RECIPES_ENABLED = false;
  var MAIN = { soup: 1, side: 1, side_dish: 1, salad: 1, main: 1 };

  function esc(s) {
    return String(s == null ? "" : s)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function todayKey(now) {
    now = now || new Date();
    return new Intl.DateTimeFormat("en-CA", {
      timeZone: TZ,
      year: "numeric",
      month: "2-digit",
      day: "2-digit"
    }).format(now);
  }

  function localTodayKey(now) {
    now = now || new Date();
    var y = now.getFullYear();
    var m = String(now.getMonth() + 1).padStart(2, "0");
    var d = String(now.getDate()).padStart(2, "0");
    return y + "-" + m + "-" + d;
  }

  function recipeWindow(now) {
    try {
      var forced = new URLSearchParams(location.search).get("meal");
      if (forced === "lunch" || forced === "dinner") return forced;
    } catch (err) {}
    now = now || new Date();
    var hour = now.getHours();
    if (hour >= 11 && hour < 14) return "lunch";
    if (hour >= 19 && hour < 22) return "dinner";
    return "";
  }

  function daysSince(start, today) {
    var a = Date.parse(start + "T00:00:00Z");
    var b = Date.parse(today + "T00:00:00Z");
    if (isNaN(a) || isNaN(b)) return 0;
    return Math.max(0, Math.floor((b - a) / 86400000));
  }

  function hashIndex(seed, n) {
    if (!n) return 0;
    var h = 2166136261;
    for (var i = 0; i < seed.length; i++) {
      h ^= seed.charCodeAt(i);
      h = Math.imul(h, 16777619);
    }
    return (h >>> 0) % n;
  }

  function xorBytes(buf, key) {
    var out = new Uint8Array(buf.length);
    for (var i = 0; i < buf.length; i++) out[i] = buf[i] ^ key[i % key.length];
    return out;
  }

  function b64ToBytes(b64) {
    var bin = atob(b64);
    var out = new Uint8Array(bin.length);
    for (var i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
    return out;
  }

  async function loadCatalog() {
    if (catalog) return catalog;
    var seal = window.__ZZ_SEAL;
    if (!seal || !seal.b || !seal.k) return null;
    var xored = xorBytes(b64ToBytes(seal.b), seal.k);
    if (typeof DecompressionStream !== "function") return null;
    var stream = new Blob([xored]).stream().pipeThrough(new DecompressionStream("gzip"));
    var text = await new Response(stream).text();
    catalog = JSON.parse(text);
    return catalog;
  }

  function pickFrom(pool, today, kind, slot, used) {
    if (!pool.length) return null;
    var i = 0;
    while (i < pool.length * 3) {
      var rec = pool[hashIndex(today + "|" + kind + "|" + slot + "|" + i, pool.length)];
      i += 1;
      if (!rec || used[rec.id]) continue;
      used[rec.id] = true;
      return rec;
    }
    return null;
  }

  function pickRecipes(data, kind, today) {
    var all = data.r || [];
    var mains = all.filter(function (r) {
      return MAIN[r.course];
    });
    var desserts = all.filter(function (r) {
      return r.course === "dessert";
    });
    if (kind === "dinner") {
      mains = mains.filter(function (r) {
        return r.weight === "light";
      });
      desserts = desserts.filter(function (r) {
        return r.weight === "light";
      });
    }
    var used = {};
    var out = [];
    var first = pickFrom(mains, today, kind, "m1", used);
    var second = pickFrom(mains, today, kind, "m2", used);
    var dessert = pickFrom(desserts, today, kind, "d", used);
    if (first) out.push(first);
    if (second) out.push(second);
    if (dessert) out.push(dessert);
    return out.length === 3 ? out : [];
  }

  function showRecipes(data, now) {
    var band = document.getElementById("home-recepti");
    if (!band) return;
    if (!RECIPES_ENABLED) {
      band.hidden = true;
      showRecipeNote(data, "", null, now);
      return;
    }
    var kind = recipeWindow(now);
    var today = localTodayKey(now);
    var list = kind ? pickRecipes(data, kind, today) : [];
    if (!kind || !list.length) {
      band.hidden = true;
      showRecipeNote(data, "", null, now);
      return;
    }
    var grid = document.getElementById("home-recepti-grid");
    var lead = document.getElementById("home-recepti-lead");
    var title = document.getElementById("home-recepti-title");
    if (title) title.textContent = kind === "lunch" ? "Za kosilo" : "Za večerjo";
    if (lead) {
      lead.textContent =
        kind === "lunch"
          ? "Dve jedi in sladica iz javne domene za čas okoli kosila."
          : "Dve lažji jedi in sladica iz javne domene za večerni čas.";
    }
    if (grid) {
      grid.innerHTML = list
        .map(function (r) {
          var course = COURSE_SL[r.course] || r.course;
          var img = r.image
            ? '<div class="home-recipe__media"><img src="' +
              esc(r.image) +
              '" alt="" loading="lazy"><span class="home-recipe__badge">' +
              esc(course) +
              "</span></div>"
            : '<div class="home-recipe__media home-recipe__media--empty"><span class="home-recipe__badge">' +
              esc(course) +
              "</span></div>";
          var meta = [];
          if (r.prepMinutes) meta.push(r.prepMinutes + " min");
          if (r.difficulty) meta.push(DIFF_SL[r.difficulty] || r.difficulty);
          if (r.servings) meta.push(r.servings + (r.servings === 1 ? " oseba" : " osebe"));
          return (
            '<a class="home-recipe" href="#play-recipe" data-drawer="play-recipe" data-recipe-id="' +
            esc(r.id) +
            '">' +
            img +
            '<span class="home-recipe__body"><strong>' +
            esc(r.title) +
            "</strong><span class=\"home-recipe__desc\">" +
            esc(r.description) +
            '</span><span class="home-recipe__meta">' +
            esc(meta.join(" · ")) +
            "</span></span></a>"
          );
        })
        .join("");
    }
    band.hidden = false;
    showRecipeNote(data, kind, list[0], now);
  }

  function noteDismissKey(kind, today) {
    return "zz-recipe-dismiss:" + today + ":" + kind;
  }

  function setRecipeNoteHidden(note) {
    note.hidden = true;
    note.innerHTML = "";
    var aside = document.getElementById("home-recipe-aside");
    if (aside) aside.hidden = true;
  }

  function showRecipeNote(data, kind, rec, now) {
    var note = document.getElementById("home-recipe-note");
    if (!note) return;
    if (!kind || !rec) {
      setRecipeNoteHidden(note);
      return;
    }
    var today = localTodayKey(now);
    try {
      if (window.localStorage.getItem(noteDismissKey(kind, today))) {
        setRecipeNoteHidden(note);
        return;
      }
    } catch (err) {}
    var headline = kind === "lunch" ? "Kaj bo danes za kosilo?" : "Kaj bo danes za večerjo?";
    var img = rec.image
      ? '<img class="home-recipe-note__img" src="' + esc(rec.image) + '" alt="">'
      : "";
    note.innerHTML =
      img +
      '<span class="home-recipe-note__badge" aria-hidden="true"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M6 13v8"/><path d="M10 9v12"/><path d="M14 5v16"/><path d="M18 10v11"/><path d="M4 21h16"/></svg></span>' +
      '<div class="home-recipe-note__copy"><p class="home-recipe-note__kicker">' +
      esc(headline) +
      '</p><p class="home-recipe-note__title">' +
      esc(rec.title) +
      '</p><p class="home-recipe-note__hint">Predlog iz kuharskih receptov v javni lasti.</p>' +
      '<span class="home-recipe-note__actions">' +
      '<a class="home-recipe-note__go" href="#play-recipe" data-drawer="play-recipe" data-recipe-id="' +
      esc(rec.id) +
      '">Pokaži recept</a>' +
      '<button type="button" class="home-recipe-note__skip" data-recipe-skip>Ne zdaj</button>' +
      "</span></div>" +
      '<button type="button" class="home-recipe-note__close" data-recipe-skip aria-label="Zapri">×</button>';
    note.hidden = false;
    var aside = document.getElementById("home-recipe-aside");
    if (aside) aside.hidden = false;
    note.onclick = function (ev) {
      if (!ev.target.closest("[data-recipe-skip]")) return;
      ev.preventDefault();
      try {
        window.localStorage.setItem(noteDismissKey(kind, today), "1");
      } catch (err) {}
      setRecipeNoteHidden(note);
    };
  }

  function dailyWord(data, today) {
    var o = data.o || {};
    var list = o.b || [];
    if (!list.length) return "";
    var idx = daysSince(o.start || "2026-04-26", today) % list.length;
    return String(list[idx] || "").toLocaleUpperCase("sl-SI");
  }

  function dailySoup(data, today) {
    var w = data.w || {};
    var puzzles = w.p || [];
    if (!puzzles.length) return null;
    var sched = w.sched || [];
    var id = "";
    if (sched.length) {
      id = sched[daysSince(w.start || "2026-04-26", today) % sched.length];
    }
    var found = puzzles.filter(function (p) {
      return p.id === id;
    })[0];
    return found || puzzles[hashIndex(today + "|soup", puzzles.length)];
  }

  function dailySudoku(data, today) {
    var easy = (((data.s || {}).p || {}).e) || [];
    var sols = (((data.s || {}).s || {}).e) || [];
    if (!easy.length) return null;
    var i = hashIndex(today + "|sudoku|easy", easy.length);
    return { cells: easy[i], solution: sols[i] || "" };
  }

  function dailyCrossword(data, today) {
    var all = (data.c || []).filter(function (p) {
      return p.d === "easy";
    });
    if (!all.length) all = data.c || [];
    if (!all.length) return null;
    return all[hashIndex(today + "|crossword|easy", all.length)];
  }

  function dailyQuiz(data, today) {
    var byDate = data.q || {};
    if (byDate[today]) return byDate[today];
    var keys = Object.keys(byDate);
    if (!keys.length) return null;
    return byDate[keys[hashIndex(today + "|quiz", keys.length)]];
  }

  function panelHead(kicker, title, note) {
    return (
      '<header class="play-head"><p class="home-kicker">' +
      esc(kicker) +
      "</p><h2 id=\"site-drawer-title\">" +
      esc(title) +
      "</h2>" +
      (note ? '<p class="play-head__note">' + esc(note) + "</p>" : "") +
      "</header>"
    );
  }

  function mountRecipe(root, data, trigger) {
    var id = trigger && trigger.getAttribute("data-recipe-id");
    var rec = (data.r || []).filter(function (r) {
      return r.id === id;
    })[0];
    if (!rec) {
      root.innerHTML = panelHead("Recept", "Recept ni na voljo", "");
      return;
    }
    var ings = (rec.ingredients || [])
      .map(function (x) {
        return "<li>" + esc(x) + "</li>";
      })
      .join("");
    var steps = (rec.steps || [])
      .map(function (x, i) {
        return "<li><span>" + (i + 1) + "</span>" + esc(x) + "</li>";
      })
      .join("");
    var hero = rec.image
      ? '<div class="play-recipe__hero"><img src="' + esc(rec.image) + '" alt=""></div>'
      : "";
    var bits = [];
    if (rec.prepMinutes) bits.push(rec.prepMinutes + " min");
    if (rec.difficulty) bits.push(DIFF_SL[rec.difficulty] || rec.difficulty);
    if (rec.servings) bits.push(rec.servings + (rec.servings === 1 ? " oseba" : " osebe"));
    bits.push(COURSE_SL[rec.course] || "Recept");
    root.innerHTML =
      hero +
      panelHead(COURSE_SL[rec.course] || "Recept", rec.title, rec.description) +
      (bits.length ? '<p class="play-meta">' + esc(bits.join(" · ")) + "</p>" : "") +
      "<h3>Sestavine</h3><ul class=\"play-ings\">" +
      ings +
      "</ul><h3>Priprava</h3><ol class=\"play-steps\">" +
      steps +
      "</ol>";
  }

  function mountWord(root, data) {
    var today = todayKey();
    var solution = dailyWord(data, today);
    var guesses = {};
    (data.o && data.o.g ? data.o.g : []).forEach(function (w) {
      guesses[String(w).toLocaleUpperCase("sl-SI")] = true;
    });
    guesses[solution] = true;
    var len = solution.length || 5;
    var rows = 6;
    var grid = [];
    var row = 0;
    var col = 0;
    var done = false;
    var status = "";

    function paint() {
      var html = panelHead("Beseda dneva", "Uganite današnjo besedo", len + " črk · 6 poskusov");
      html += '<div class="play-word" style="--n:' + len + '">';
      for (var r = 0; r < rows; r++) {
        html += '<div class="play-word__row">';
        for (var c = 0; c < len; c++) {
          var cell = (grid[r] && grid[r][c]) || { l: "", k: "" };
          html +=
            '<span class="play-word__cell' +
            (cell.k ? " is-" + cell.k : "") +
            '">' +
            esc(cell.l) +
            "</span>";
        }
        html += "</div>";
      }
      html += "</div>";
      html += '<p class="play-status" data-word-status></p>';
      html += '<div class="play-keys" data-word-keys></div>';
      root.innerHTML = html;
      root.querySelector("[data-word-status]").textContent = status;
      var keys = [
        "QWERTYUIOPŠ",
        "ASDFGHJKLČŽ",
        "⌫YXCVBNM↵"
      ];
      var kb = root.querySelector("[data-word-keys]");
      kb.innerHTML = keys
        .map(function (line) {
          return (
            '<p>' +
            line
              .split("")
              .map(function (ch) {
                var label = ch === "⌫" ? "Briši" : ch === "↵" ? "Vpiši" : ch;
                var key = ch === "⌫" ? "back" : ch === "↵" ? "enter" : ch;
                return (
                  '<button type="button" class="play-key" data-key="' +
                  key +
                  '">' +
                  esc(label) +
                  "</button>"
                );
              })
              .join("") +
            "</p>"
          );
        })
        .join("");
    }

    function current() {
      if (!grid[row]) grid[row] = [];
      return grid[row];
    }

    function score(guess) {
      var sol = solution.split("");
      var used = sol.map(function () {
        return false;
      });
      var kinds = guess.split("").map(function () {
        return "miss";
      });
      for (var i = 0; i < len; i++) {
        if (guess[i] === sol[i]) {
          kinds[i] = "hit";
          used[i] = true;
        }
      }
      for (var j = 0; j < len; j++) {
        if (kinds[j] === "hit") continue;
        for (var k = 0; k < len; k++) {
          if (!used[k] && guess[j] === sol[k]) {
            kinds[j] = "near";
            used[k] = true;
            break;
          }
        }
      }
      return kinds;
    }

    function submit() {
      var cur = current();
      if (cur.length < len) {
        status = "Beseda ima " + len + " črk.";
        paint();
        return;
      }
      var guess = cur
        .map(function (c) {
          return c.l;
        })
        .join("");
      if (!guesses[guess]) {
        status = "Te besede ni na seznamu.";
        paint();
        return;
      }
      var kinds = score(guess);
      for (var i = 0; i < len; i++) cur[i].k = kinds[i];
      if (guess === solution) {
        done = true;
        status = "Pravilno.";
      } else if (row === rows - 1) {
        done = true;
        status = "Beseda dneva je bila " + solution + ".";
      } else {
        row += 1;
        col = 0;
        status = "";
      }
      paint();
    }

    function type(ch) {
      if (done) return;
      if (ch === "back") {
        var cur = current();
        if (col > 0) {
          col -= 1;
          cur.splice(col, 1);
        }
        paint();
        return;
      }
      if (ch === "enter") {
        submit();
        return;
      }
      if (col >= len) return;
      current()[col] = { l: ch, k: "" };
      col += 1;
      paint();
    }

    paint();
    function onClick(ev) {
      var btn = ev.target.closest("[data-key]");
      if (!btn) return;
      type(btn.getAttribute("data-key"));
    }
    function onKey(ev) {
      if (ev.metaKey || ev.ctrlKey || ev.altKey) return;
      if (ev.key === "Backspace") {
        ev.preventDefault();
        type("back");
      } else if (ev.key === "Enter") {
        ev.preventDefault();
        type("enter");
      } else if (ev.key.length === 1 && /[a-zA-ZčšžćđČŠŽĆĐ]/.test(ev.key)) {
        ev.preventDefault();
        type(ev.key.toLocaleUpperCase("sl-SI"));
      }
    }
    root.addEventListener("click", onClick);
    document.addEventListener("keydown", onKey);
    cleanup = function () {
      root.removeEventListener("click", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }

  function lineCells(a, b) {
    var dr = b.r - a.r;
    var dc = b.c - a.c;
    var steps = Math.max(Math.abs(dr), Math.abs(dc));
    if (!steps) return [a];
    if (dr && dc && Math.abs(dr) !== Math.abs(dc)) return null;
    var sr = dr === 0 ? 0 : dr / Math.abs(dr);
    var sc = dc === 0 ? 0 : dc / Math.abs(dc);
    var out = [];
    for (var i = 0; i <= steps; i++) out.push({ r: a.r + sr * i, c: a.c + sc * i });
    return out;
  }

  function mountSoup(root, data) {
    var today = todayKey();
    var p = dailySoup(data, today);
    if (!p) {
      root.innerHTML = panelHead("Juha črk", "Danes ni sestavljanke", "");
      return;
    }
    var grid = p.g || [];
    var words = (p.w || []).map(function (w) {
      return String(w).toLocaleUpperCase("sl-SI");
    });
    var found = {};
    var start = null;
    var hover = [];
    var marked = {};

    function key(r, c) {
      return r + "," + c;
    }

    function wordOf(cells) {
      return cells
        .map(function (cell) {
          return (grid[cell.r] || "")[cell.c] || "";
        })
        .join("");
    }

    function paint() {
      var html = panelHead("Juha črk", p.t ? p.t.replace(/-/g, " ") : "Iskanje besed", "Povlecite črke v ravni črti.");
      html += '<div class="play-soup" style="--n:' + (grid[0] ? grid[0].length : 10) + '">';
      for (var r = 0; r < grid.length; r++) {
        for (var c = 0; c < grid[r].length; c++) {
          var k = key(r, c);
          var cls = "play-soup__cell";
          if (marked[k]) cls += " is-found";
          if (hover.some(function (cell) { return cell.r === r && cell.c === c; })) cls += " is-sel";
          html +=
            '<button type="button" class="' +
            cls +
            '" data-r="' +
            r +
            '" data-c="' +
            c +
            '">' +
            esc(grid[r][c]) +
            "</button>";
        }
      }
      html += "</div><ul class=\"play-soup__words\">";
      words.forEach(function (w) {
        html += "<li class=\"" + (found[w] ? "is-found" : "") + "\">" + esc(w) + "</li>";
      });
      html += "</ul>";
      var left = words.filter(function (w) {
        return !found[w];
      }).length;
      html +=
        '<p class="play-status">' +
        (left ? "Še " + left + " besed." : "Našli ste vse besede.") +
        "</p>";
      root.innerHTML = html;
    }

    function cellFrom(ev) {
      var btn = ev.target.closest("[data-r]");
      if (!btn) return null;
      return { r: Number(btn.getAttribute("data-r")), c: Number(btn.getAttribute("data-c")) };
    }

    function finish(end) {
      if (!start || !end) {
        start = null;
        hover = [];
        paint();
        return;
      }
      var cells = lineCells(start, end);
      start = null;
      hover = [];
      if (!cells) {
        paint();
        return;
      }
      var w = wordOf(cells);
      var rev = w.split("").reverse().join("");
      var hit = words.indexOf(w) >= 0 ? w : words.indexOf(rev) >= 0 ? rev : "";
      if (hit && !found[hit]) {
        found[hit] = true;
        cells.forEach(function (cell) {
          marked[key(cell.r, cell.c)] = true;
        });
      }
      paint();
    }

    paint();
    function down(ev) {
      var cell = cellFrom(ev);
      if (!cell) return;
      start = cell;
      hover = [cell];
      paint();
    }
    function move(ev) {
      if (!start) return;
      var cell = cellFrom(ev);
      if (!cell) return;
      var cells = lineCells(start, cell);
      hover = cells || [start];
      paint();
    }
    function up(ev) {
      if (!start) return;
      finish(cellFrom(ev) || hover[hover.length - 1] || start);
    }
    root.addEventListener("pointerdown", down);
    root.addEventListener("pointermove", move);
    root.addEventListener("pointerup", up);
    cleanup = function () {
      root.removeEventListener("pointerdown", down);
      root.removeEventListener("pointermove", move);
      root.removeEventListener("pointerup", up);
    };
  }

  function mountSudoku(root, data) {
    var today = todayKey();
    var p = dailySudoku(data, today);
    if (!p) {
      root.innerHTML = panelHead("Sudoku", "Danes ni sestavljanke", "");
      return;
    }
    var given = p.cells.split("").map(function (ch) {
      return ch === "0" ? 0 : Number(ch);
    });
    var cells = given.slice();
    var sel = -1;
    var msg = "";

    function paint() {
      var html = panelHead("Sudoku", "Dnevna mreža", "Vsaka vrstica, stolpec in kvadrat 3×3: števila 1–9.");
      html += '<div class="play-sudoku">';
      for (var i = 0; i < 81; i++) {
        var cls = "play-sudoku__cell";
        if (given[i]) cls += " is-given";
        if (i === sel) cls += " is-sel";
        if (Math.floor(i / 9) % 3 === 0) cls += " is-top";
        if (i % 9 % 3 === 0) cls += " is-left";
        html +=
          '<button type="button" class="' +
          cls +
          '" data-i="' +
          i +
          '">' +
          (cells[i] ? cells[i] : "") +
          "</button>";
      }
      html += '</div><div class="play-pad">';
      for (var n = 1; n <= 9; n++) {
        html += '<button type="button" data-n="' + n + '">' + n + "</button>";
      }
      html +=
        '<button type="button" data-n="0">Briši</button><button type="button" data-check="1">Preveri</button></div>';
      html += '<p class="play-status">' + esc(msg) + "</p>";
      root.innerHTML = html;
    }

    function put(n) {
      if (sel < 0 || given[sel]) return;
      cells[sel] = n;
      msg = "";
      paint();
    }

    function check() {
      var ok = true;
      var complete = true;
      for (var i = 0; i < 81; i++) {
        if (!cells[i]) complete = false;
        if (cells[i] && p.solution[i] && String(cells[i]) !== p.solution[i]) ok = false;
      }
      if (!ok) msg = "Nekatera polja se ne ujemajo.";
      else if (!complete) msg = "Še ni konec, doslej pa je pravilno.";
      else msg = "Mreža je rešena.";
      paint();
    }

    paint();
    function onClick(ev) {
      var cell = ev.target.closest("[data-i]");
      if (cell) {
        sel = Number(cell.getAttribute("data-i"));
        paint();
        return;
      }
      var num = ev.target.closest("[data-n]");
      if (num) {
        put(Number(num.getAttribute("data-n")));
        return;
      }
      if (ev.target.closest("[data-check]")) check();
    }
    function onKey(ev) {
      if (ev.key >= "1" && ev.key <= "9") put(Number(ev.key));
      if (ev.key === "Backspace" || ev.key === "Delete" || ev.key === "0") put(0);
    }
    root.addEventListener("click", onClick);
    document.addEventListener("keydown", onKey);
    cleanup = function () {
      root.removeEventListener("click", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }

  function mountCrossword(root, data) {
    var today = todayKey();
    var p = dailyCrossword(data, today);
    if (!p) {
      root.innerHTML = panelHead("Križanka", "Danes ni sestavljanke", "");
      return;
    }
    var n = p.n || 9;
    var rows = p.g || [];
    var letters = [];
    var sel = { r: 0, c: 0, dir: "a" };
    var done = {};

    function blocked(r, c) {
      return !rows[r] || rows[r][c] === "#";
    }

    function paint() {
      var html = panelHead("Križanka", "Dnevna križanka", "Kliknite polje in vpišite črke.");
      html += '<div class="play-cw" style="--n:' + n + '">';
      for (var r = 0; r < n; r++) {
        for (var c = 0; c < n; c++) {
          if (blocked(r, c)) {
            html += '<span class="play-cw__cell is-block"></span>';
            continue;
          }
          var num = "";
          (p.w || []).forEach(function (w) {
            if (w[2] === r && w[3] === c) num = String(w[0]);
          });
          var cls = "play-cw__cell";
          if (sel.r === r && sel.c === c) cls += " is-sel";
          var ch = (letters[r] && letters[r][c]) || "";
          html +=
            '<button type="button" class="' +
            cls +
            '" data-r="' +
            r +
            '" data-c="' +
            c +
            '">' +
            (num ? '<small>' + num + "</small>" : "") +
            esc(ch) +
            "</button>";
        }
      }
      html += "</div><div class=\"play-clues\"><div><h3>Vodoravno</h3><ol>";
      (p.w || []).forEach(function (w) {
        if (w[1] !== "a") return;
        html +=
          '<li class="' +
          (done[w[1] + w[0]] ? "is-done" : "") +
          '"><strong>' +
          w[0] +
          "</strong> " +
          esc(w[5]) +
          "</li>";
      });
      html += "</ol></div><div><h3>Navpično</h3><ol>";
      (p.w || []).forEach(function (w) {
        if (w[1] !== "d") return;
        html +=
          '<li class="' +
          (done[w[1] + w[0]] ? "is-done" : "") +
          '"><strong>' +
          w[0] +
          "</strong> " +
          esc(w[5]) +
          "</li>";
      });
      html += "</ol></div></div>";
      root.innerHTML = html;
    }

    function nextCell(r, c, dir) {
      if (dir === "a") c += 1;
      else r += 1;
      if (r >= n || c >= n || blocked(r, c)) return null;
      return { r: r, c: c };
    }

    function readWord(w) {
      var out = "";
      var r = w[2];
      var c = w[3];
      var ans = w[4] || "";
      for (var i = 0; i < ans.length; i++) {
        out += (letters[r] && letters[r][c]) || "";
        if (w[1] === "a") c += 1;
        else r += 1;
      }
      return out;
    }

    function scoreWords() {
      (p.w || []).forEach(function (w) {
        done[w[1] + w[0]] = readWord(w) === String(w[4] || "").toLocaleUpperCase("sl-SI");
      });
    }

    function put(ch) {
      if (blocked(sel.r, sel.c)) return;
      if (!letters[sel.r]) letters[sel.r] = [];
      if (!ch) letters[sel.r][sel.c] = "";
      else letters[sel.r][sel.c] = ch.toLocaleUpperCase("sl-SI");
      scoreWords();
      var nxt = ch ? nextCell(sel.r, sel.c, sel.dir) : null;
      if (nxt) sel = { r: nxt.r, c: nxt.c, dir: sel.dir };
      paint();
    }

    function findStart() {
      for (var r = 0; r < n; r++) {
        for (var c = 0; c < n; c++) {
          if (!blocked(r, c)) {
            sel = { r: r, c: c, dir: "a" };
            return;
          }
        }
      }
    }

    findStart();
    paint();
    function onClick(ev) {
      var btn = ev.target.closest("[data-r]");
      if (!btn) return;
      var r = Number(btn.getAttribute("data-r"));
      var c = Number(btn.getAttribute("data-c"));
      if (sel.r === r && sel.c === c) sel.dir = sel.dir === "a" ? "d" : "a";
      else sel = { r: r, c: c, dir: sel.dir };
      paint();
    }
    function onKey(ev) {
      if (ev.metaKey || ev.ctrlKey || ev.altKey) return;
      if (ev.key === "Backspace") {
        ev.preventDefault();
        put("");
      } else if (ev.key.length === 1 && /[a-zA-ZčšžćđČŠŽĆĐ]/.test(ev.key)) {
        ev.preventDefault();
        put(ev.key);
      }
    }
    root.addEventListener("click", onClick);
    document.addEventListener("keydown", onKey);
    cleanup = function () {
      root.removeEventListener("click", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }

  function mountQuiz(root, data) {
    var today = todayKey();
    var q = dailyQuiz(data, today);
    if (!q) {
      root.innerHTML = panelHead("Kviz dneva", "Danes ni vprašanja", "");
      return;
    }
    var picked = "";
    function paint() {
      var html = panelHead("Kviz dneva", q.t || "Vprašanje", q.r || "");
      html += '<p class="play-quiz__q">' + esc(q.q) + "</p><div class=\"play-quiz__opts\">";
      (q.o || []).forEach(function (opt) {
        var cls = "play-quiz__opt";
        if (picked) {
          if (opt === q.a) cls += " is-hit";
          else if (opt === picked) cls += " is-miss";
        }
        html +=
          '<button type="button" class="' +
          cls +
          '" data-opt="' +
          esc(opt) +
          '"' +
          (picked ? " disabled" : "") +
          ">" +
          esc(opt) +
          "</button>";
      });
      html += "</div>";
      if (picked) html += '<p class="play-quiz__x">' + esc(q.x) + "</p>";
      root.innerHTML = html;
    }
    paint();
    function onClick(ev) {
      var btn = ev.target.closest("[data-opt]");
      if (!btn || picked) return;
      picked = btn.getAttribute("data-opt");
      paint();
    }
    root.addEventListener("click", onClick);
    cleanup = function () {
      root.removeEventListener("click", onClick);
    };
  }

  var mounts = {
    word: mountWord,
    soup: mountSoup,
    sudoku: mountSudoku,
    crossword: mountCrossword,
    recipe: mountRecipe
  };

  function onOpen(ev) {
    if (cleanup) {
      cleanup();
      cleanup = null;
    }
    var mount = ev.detail && ev.detail.mount;
    var root = mount && mount.querySelector("[data-play-root]");
    if (!root || !catalog) return;
    var kind = root.getAttribute("data-play-root");
    var fn = mounts[kind];
    if (!fn) return;
    fn(root, catalog, ev.detail.trigger);
  }

  function onClose() {
    if (cleanup) {
      cleanup();
      cleanup = null;
    }
  }

  loadCatalog()
    .then(function (data) {
      if (!data) return;
      showRecipes(data);
      window.setInterval(function () {
        showRecipes(data);
      }, 30000);
      document.addEventListener("site-drawer:open", onOpen);
      document.addEventListener("site-drawer:close", onClose);
    })
    .catch(function () {});
})();
