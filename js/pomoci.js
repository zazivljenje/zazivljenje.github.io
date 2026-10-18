(function () {
  "use strict";

  var DEFAULT_URGENT_DAYS = 21;
  var DEFAULT_REMINDER_DAYS = 3;

  var NEED_GROUPS = [
    {
      id: "housing",
      title: "Stanovanje",
      needs: ["housing_rent", "housing_buy_build", "housing_cost", "housing_energy"],
    },
    {
      id: "family",
      title: "Družina in starševstvo",
      needs: ["family_cash", "parental_leave", "parenting_support"],
    },
    {
      id: "care",
      title: "Oskrba in starejši",
      needs: ["elderly_care", "family_caregiver", "home_help", "disability_support"],
    },
  ];

  var STATUS_PRIORITY = { open: 0, ongoing: 1, seasonal: 2, inactive: 3, closed: 4 };

  function $(sel, root) {
    return (root || document).querySelector(sel);
  }

  function parseDeadline(raw) {
    if (!raw) return null;
    var d = new Date(raw);
    return isNaN(d.getTime()) ? null : d;
  }

  function formatDeadlineDate(raw) {
    var d = parseDeadline(raw);
    if (!d) return null;
    return d.toLocaleDateString("sl-SI", {
      day: "numeric",
      month: "numeric",
      year: "numeric",
    });
  }

  function yyyymmdd(d) {
    var y = d.getFullYear();
    var m = String(d.getMonth() + 1).padStart(2, "0");
    var day = String(d.getDate()).padStart(2, "0");
    return "" + y + m + day;
  }

  function addDays(d, n) {
    var x = new Date(d.getFullYear(), d.getMonth(), d.getDate());
    x.setDate(x.getDate() + n);
    return x;
  }

  function daysLeft(raw, now) {
    var d = parseDeadline(raw);
    if (!d) return null;
    var start = now ? new Date(now) : new Date();
    start.setHours(0, 0, 0, 0);
    var end = new Date(d.getFullYear(), d.getMonth(), d.getDate());
    return Math.round((end - start) / 86400000);
  }

  function escapeHtml(s) {
    return String(s == null ? "" : s)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function icsEscape(s) {
    return String(s == null ? "" : s)
      .replace(/\\/g, "\\\\")
      .replace(/;/g, "\\;")
      .replace(/,/g, "\\,")
      .replace(/\n/g, "\\n");
  }

  function levelLabel(level) {
    if (level === "national") return "Državno";
    if (level === "regional") return "Regionalno";
    if (level === "municipal") return "Občinsko";
    return level || "";
  }

  function computeStats(entries, urgentDays, now) {
    var open = 0;
    var ongoing = 0;
    var urgent = 0;
    var windowDays = urgentDays > 0 ? urgentDays : DEFAULT_URGENT_DAYS;
    entries.forEach(function (e) {
      if (e.status === "open") {
        open += 1;
        var left = daysLeft(e.deadline, now);
        if (left != null && left >= 0 && left <= windowDays) urgent += 1;
      } else if (e.status === "ongoing") {
        ongoing += 1;
      }
    });
    return { open: open, ongoing: ongoing, urgent: urgent, urgentDays: windowDays };
  }

  function buildEntryIcs(e, reminderDays) {
    var dl = parseDeadline(e.deadline);
    if (!dl) return null;
    var remDays = reminderDays > 0 ? reminderDays : DEFAULT_REMINDER_DAYS;
    var rem = addDays(dl, -remDays);
    var stamp =
      new Date().toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
    var uid = "pomoci-" + (e.id || "x");
    var title = icsEscape(e.title_sl || "Razpis");
    var desc = icsEscape(
      [e.summary_sl, e.how_to_apply_sl, e.apply_url].filter(Boolean).join(" ")
    );
    var urlLine = e.apply_url ? "URL:" + e.apply_url + "\r\n" : "";
    return (
      "BEGIN:VCALENDAR\r\n" +
      "VERSION:2.0\r\n" +
      "PRODID:-//Za življenje//Razpisi//SL\r\n" +
      "CALSCALE:GREGORIAN\r\n" +
      "METHOD:PUBLISH\r\n" +
      "BEGIN:VEVENT\r\n" +
      "UID:" +
      uid +
      "-deadline@zazivljenje.com\r\n" +
      "DTSTAMP:" +
      stamp +
      "\r\n" +
      "DTSTART;VALUE=DATE:" +
      yyyymmdd(dl) +
      "\r\n" +
      "DTEND;VALUE=DATE:" +
      yyyymmdd(addDays(dl, 1)) +
      "\r\n" +
      "SUMMARY:Rok: " +
      title +
      "\r\n" +
      (desc ? "DESCRIPTION:" + desc + "\r\n" : "") +
      urlLine +
      "BEGIN:VALARM\r\nACTION:DISPLAY\r\nDESCRIPTION:Opomnik: rok čez " +
      remDays +
      " dni\r\nTRIGGER:-P" +
      remDays +
      "D\r\nEND:VALARM\r\n" +
      "END:VEVENT\r\n" +
      "BEGIN:VEVENT\r\n" +
      "UID:" +
      uid +
      "-reminder@zazivljenje.com\r\n" +
      "DTSTAMP:" +
      stamp +
      "\r\n" +
      "DTSTART;VALUE=DATE:" +
      yyyymmdd(rem) +
      "\r\n" +
      "DTEND;VALUE=DATE:" +
      yyyymmdd(addDays(rem, 1)) +
      "\r\n" +
      "SUMMARY:Opomnik (" +
      remDays +
      " dni): " +
      title +
      "\r\n" +
      (desc ? "DESCRIPTION:" + desc + "\r\n" : "") +
      urlLine +
      "END:VEVENT\r\n" +
      "END:VCALENDAR\r\n"
    );
  }

  function googleTemplateUrl(e, when, titlePrefix, remDays) {
    var d = parseDeadline(when);
    if (!d) return null;
    var start = yyyymmdd(d);
    var end = yyyymmdd(addDays(d, 1));
    var text = (titlePrefix || "Rok: ") + (e.title_sl || "Razpis");
    var details = [
      e.summary_sl,
      remDays ? "Opomnik " + remDays + " dni pred rokom." : "",
      e.apply_url,
    ]
      .filter(Boolean)
      .join("\n");
    var params = new URLSearchParams({
      action: "TEMPLATE",
      text: text,
      dates: start + "/" + end,
      details: details,
      ctz: "Europe/Ljubljana",
    });
    return "https://calendar.google.com/calendar/render?" + params.toString();
  }

  function downloadIcs(filename, body) {
    var blob = new Blob([body], { type: "text/calendar;charset=utf-8" });
    var url = URL.createObjectURL(blob);
    var a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(function () {
      URL.revokeObjectURL(url);
    }, 1500);
  }

  function initPomoci(rootEl) {
    var root = rootEl || document.getElementById("pom-app");
    if (!root || root.dataset.ready === "1") return;

    var dataNode =
      (root && root.querySelector("#pomoci-data")) ||
      document.getElementById("pomoci-data");
    if (!dataNode) return;

    var data;
    try {
      data = JSON.parse(dataNode.textContent);
    } catch (e) {
      return;
    }

    var entries = data.entries || [];
    var uiNeeds = data.ui_needs || {};
    var statusLabels = data.status_labels || {};
    var muniLabels = data.muni_labels || {};
    var urgentDays = parseInt(root.getAttribute("data-urgent-days") || "", 10);
    if (isNaN(urgentDays) || urgentDays < 1) urgentDays = DEFAULT_URGENT_DAYS;
    var reminderDays = parseInt(root.getAttribute("data-reminder-days") || "", 10);
    if (isNaN(reminderDays) || reminderDays < 1) reminderDays = DEFAULT_REMINDER_DAYS;

    var byId = {};
    entries.forEach(function (e) {
      byId[e.id] = e;
    });

    var state = {
      needs: {},
      issuer: "",
      muni: "",
      level: "",
      openOnly: false,
    };

    var needsEl = $("[data-pom-needs]", root);
    var resultsEl = $("[data-pom-results]", root);
    var countEl = $("[data-pom-count]", root);
    var statsEl = $("[data-pom-stats]", root);
    var issuerEl = $("[data-pom-issuer]", root);
    var muniEl = $("[data-pom-muni]", root);
    var levelEl = $("[data-pom-level]", root);
    var openOnlyEl = $("[data-pom-open-only]", root);

    var issuers = {};
    var munis = {};
    entries.forEach(function (e) {
      if (e.issuer) issuers[e.issuer] = true;
      var g = e.geography || {};
      (g.municipalities || []).forEach(function (m) {
        munis[m] = muniLabels[m] || m;
      });
    });
    Object.keys(issuers)
      .sort(function (a, b) {
        return a.localeCompare(b, "sl");
      })
      .forEach(function (name) {
        var opt = document.createElement("option");
        opt.value = name;
        opt.textContent = name;
        issuerEl.appendChild(opt);
      });
    Object.keys(munis)
      .sort(function (a, b) {
        return munis[a].localeCompare(munis[b], "sl");
      })
      .forEach(function (id) {
        var opt = document.createElement("option");
        opt.value = id;
        opt.textContent = munis[id];
        muniEl.appendChild(opt);
      });

    function selectedNeeds() {
      return Object.keys(state.needs).filter(function (k) {
        return state.needs[k];
      });
    }

    function renderNeeds() {
      needsEl.innerHTML = NEED_GROUPS.map(function (group) {
        var items = group.needs
          .filter(function (id) {
            return uiNeeds[id];
          })
          .map(function (id) {
            var checked = !!state.needs[id];
            return (
              '<label class="pom-need-check">' +
              '<input type="checkbox" data-pom-need="' +
              escapeHtml(id) +
              '"' +
              (checked ? " checked" : "") +
              ">" +
              "<span>" +
              escapeHtml(uiNeeds[id]) +
              "</span>" +
              "</label>"
            );
          })
          .join("");
        if (!items) return "";
        return (
          '<fieldset class="pom-need-group">' +
          "<legend>" +
          escapeHtml(group.title) +
          "</legend>" +
          '<div class="pom-need-group__list">' +
          items +
          "</div>" +
          "</fieldset>"
        );
      }).join("");
    }

    function matchesNeeds(e) {
      var selected = selectedNeeds();
      if (!selected.length) return true;
      var entryNeeds = e.needs || [];
      return selected.some(function (n) {
        return entryNeeds.indexOf(n) !== -1;
      });
    }

    function matchesStatus(e) {
      if (state.openOnly) return e.status === "open";
      return e.status === "open" || e.status === "ongoing" || e.status === "seasonal";
    }

    function filtered() {
      return entries
        .filter(function (e) {
          if (!matchesStatus(e)) return false;
          if (!matchesNeeds(e)) return false;
          if (state.level && e.level !== state.level) return false;
          if (state.issuer && e.issuer !== state.issuer) return false;
          if (state.muni) {
            var ms = (e.geography || {}).municipalities || [];
            var nationwide = (e.geography || {}).scope === "nationwide";
            if (!nationwide && ms.indexOf(state.muni) === -1) return false;
          }
          return true;
        })
        .sort(function (a, b) {
          var pa = STATUS_PRIORITY[a.status] != null ? STATUS_PRIORITY[a.status] : 9;
          var pb = STATUS_PRIORITY[b.status] != null ? STATUS_PRIORITY[b.status] : 9;
          if (pa !== pb) return pa - pb;
          var da = parseDeadline(a.deadline);
          var db = parseDeadline(b.deadline);
          if (da && db) return da - db;
          if (da) return -1;
          if (db) return 1;
          return String(a.title_sl || "").localeCompare(String(b.title_sl || ""), "sl");
        });
    }

    function renderStats() {
      var s = computeStats(filtered(), urgentDays, new Date());
      var urgentLabel =
        s.urgentDays === 21
          ? "z rokom v 3 tednih"
          : "z rokom v " + s.urgentDays + " dneh";
      statsEl.innerHTML =
        '<div class="pom-stat"><strong>' +
        s.open +
        "</strong><span>odprtih razpisov</span></div>" +
        '<div class="pom-stat"><strong>' +
        s.ongoing +
        "</strong><span>trajnih pravic</span></div>" +
        '<div class="pom-stat pom-stat--warn"><strong>' +
        s.urgent +
        "</strong><span>" +
        escapeHtml(urgentLabel) +
        "</span></div>";
    }

    function cardHtml(e) {
      var st = e.status || "";
      var left = daysLeft(e.deadline);
      var urgency = "";
      if (st === "open" && left != null) {
        if (left < 0) urgency = '<span class="pom-pill pom-pill--muted">Rok potekel</span>';
        else if (left === 0)
          urgency = '<span class="pom-pill pom-pill--hot">Rok danes</span>';
        else if (left <= urgentDays)
          urgency =
            '<span class="pom-pill pom-pill--hot">Še ' + left + " dni</span>";
        else urgency = '<span class="pom-pill">Še ' + left + " dni</span>";
      }

      var geo = "";
      if ((e.geography || {}).scope === "nationwide") geo = "Vsa Slovenija";
      else if ((e.geography || {}).municipalities) {
        geo = (e.geography.municipalities || [])
          .map(function (m) {
            return muniLabels[m] || m;
          })
          .join(", ");
      }

      var needs = (e.needs || [])
        .map(function (n) {
          return uiNeeds[n] || n;
        })
        .slice(0, 2)
        .join(" · ");

      var rokDate = formatDeadlineDate(e.deadline);
      var rokLine = rokDate
        ? "<li><strong>Rok:</strong> " + escapeHtml(rokDate) + "</li>"
        : "";

      var calBlock = "";
      if (st === "open" && e.deadline) {
        var remDate = addDays(parseDeadline(e.deadline), -reminderDays);
        var gcalDeadline = googleTemplateUrl(e, e.deadline, "Rok: ", reminderDays);
        var gcalReminder = googleTemplateUrl(
          e,
          remDate,
          "Opomnik (" + reminderDays + " dni): ",
          reminderDays
        );
        calBlock =
          '<div class="pom-card-cal">' +
          (gcalDeadline
            ? '<a class="pom-cal-link" href="' +
              escapeHtml(gcalDeadline) +
              '" target="_blank" rel="noopener">Google: rok</a>'
            : "") +
          (gcalReminder
            ? '<a class="pom-cal-link" href="' +
              escapeHtml(gcalReminder) +
              '" target="_blank" rel="noopener">Google: opomnik</a>'
            : "") +
          '<button type="button" class="pom-cal-link" data-pom-ics="' +
          escapeHtml(e.id) +
          '">Prenesi .ics (rok + opomnik)</button>' +
          "</div>";
      }

      return (
        '<article class="pom-card" data-status="' +
        escapeHtml(st) +
        '">' +
        '<div class="pom-card__top">' +
        '<span class="pom-badge pom-badge--' +
        escapeHtml(st) +
        '">' +
        escapeHtml(statusLabels[st] || st) +
        "</span>" +
        urgency +
        '<span class="pom-level">' +
        escapeHtml(levelLabel(e.level)) +
        "</span>" +
        "</div>" +
        "<h3>" +
        escapeHtml(e.title_sl) +
        "</h3>" +
        '<p class="pom-card__summary">' +
        escapeHtml(e.summary_sl) +
        "</p>" +
        '<ul class="pom-card__meta">' +
        (geo ? "<li><strong>Območje:</strong> " + escapeHtml(geo) + "</li>" : "") +
        rokLine +
        (e.issuer
          ? "<li><strong>Izdajatelj:</strong> " + escapeHtml(e.issuer) + "</li>"
          : "") +
        (needs ? "<li><strong>Tema:</strong> " + escapeHtml(needs) + "</li>" : "") +
        "</ul>" +
        calBlock +
        '<details class="pom-details">' +
        "<summary>Kako se prijaviti</summary>" +
        '<div class="pom-details__body">' +
        (e.eligibility_sl
          ? "<p><strong>Upravičenost.</strong> " +
            escapeHtml(e.eligibility_sl) +
            "</p>"
          : "") +
        (e.how_to_apply_sl
          ? "<p><strong>Postopek.</strong> " +
            escapeHtml(e.how_to_apply_sl) +
            "</p>"
          : "") +
        (e.amount_note_sl
          ? "<p><strong>Znesek.</strong> " +
            escapeHtml(e.amount_note_sl) +
            "</p>"
          : "") +
        (e.deadline_note_sl
          ? "<p><strong>Opomba o roku.</strong> " +
            escapeHtml(e.deadline_note_sl) +
            "</p>"
          : "") +
        '<div class="pom-actions">' +
        (e.apply_url
          ? '<a class="pom-btn pom-btn--primary" href="' +
            escapeHtml(e.apply_url) +
            '" target="_blank" rel="noopener">Na prijavo / vir</a>'
          : "") +
        (e.source_url && e.source_url !== e.apply_url
          ? '<a class="pom-btn pom-btn--ghost" href="' +
            escapeHtml(e.source_url) +
            '" target="_blank" rel="noopener">Več o razpisu</a>'
          : "") +
        "</div>" +
        "</div>" +
        "</details>" +
        "</article>"
      );
    }

    function renderResults() {
      renderStats();
      var list = filtered();
      var sel = selectedNeeds();
      var label =
        sel.length === 1
          ? uiNeeds[sel[0]]
          : sel.length > 1
            ? sel.length + " teme"
            : "";
      countEl.textContent =
        list.length === 1
          ? "1 možnost"
          : list.length + " možnosti" + (label ? " · " + label : "");
      if (!list.length) {
        resultsEl.innerHTML =
          '<p class="pom-empty">Ni zadetkov. Poskusite drugo temo ali odstranite filter <em>Samo odprti razpisi</em>.</p>';
        return;
      }
      resultsEl.innerHTML = list.map(cardHtml).join("");
    }

    needsEl.addEventListener("change", function (ev) {
      var input = ev.target.closest("[data-pom-need]");
      if (!input) return;
      var id = input.getAttribute("data-pom-need");
      if (input.checked) state.needs[id] = true;
      else delete state.needs[id];
      renderResults();
    });

    resultsEl.addEventListener("click", function (ev) {
      var btn = ev.target.closest("[data-pom-ics]");
      if (!btn) return;
      var entry = byId[btn.getAttribute("data-pom-ics")];
      if (!entry) return;
      var ics = buildEntryIcs(entry, reminderDays);
      if (!ics) return;
      downloadIcs((entry.id || "razpis") + "-rok.ics", ics);
    });

    issuerEl.addEventListener("change", function () {
      state.issuer = issuerEl.value;
      renderResults();
    });
    muniEl.addEventListener("change", function () {
      state.muni = muniEl.value;
      renderResults();
    });
    levelEl.addEventListener("change", function () {
      state.level = levelEl.value;
      renderResults();
    });
    openOnlyEl.addEventListener("change", function () {
      state.openOnly = !!openOnlyEl.checked;
      renderResults();
    });

    root.dataset.ready = "1";
    renderNeeds();
    renderResults();
  }

  function boot() {
    var root = document.getElementById("pom-app");
    if (root) initPomoci(root);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }

  document.addEventListener("site-drawer:open", function (event) {
    if (event.detail && event.detail.id === "pomoci") {
      var mount =
        (event.detail.mount && event.detail.mount.querySelector("#pom-app")) ||
        document.querySelector(".site-drawer__mount #pom-app");
      if (mount) {
        delete mount.dataset.ready;
        initPomoci(mount);
      }
    }
  });
})();
