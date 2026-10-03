(function () {
  var DISPLAY_K = 3;

  function rootOf(el) {
    return el && el.closest ? el.closest("[data-related-tabs], .related-news") : null;
  }

  function showTab(root, id) {
    if (!root || !root.hasAttribute("data-related-tabs")) return;
    root.querySelectorAll("[data-related-tab]").forEach(function (tab) {
      var on = tab.getAttribute("data-related-tab") === id;
      tab.setAttribute("aria-selected", on ? "true" : "false");
      tab.tabIndex = on ? 0 : -1;
    });
    root.querySelectorAll("[data-related-panel]").forEach(function (panel) {
      panel.hidden = panel.getAttribute("data-related-panel") !== id;
    });
  }

  function showEntity(root, id) {
    if (!root) return;
    var panel = root.querySelector("[data-related-panel='mentions']") || root;
    panel.querySelectorAll("[data-entity-chip]").forEach(function (chip) {
      chip.setAttribute("aria-pressed", chip.getAttribute("data-entity-chip") === id ? "true" : "false");
    });
    panel.querySelectorAll("[data-entity-panel]").forEach(function (node) {
      node.hidden = node.getAttribute("data-entity-panel") !== id;
    });
  }

  function isPast(card) {
    var end = card.getAttribute("data-event-end");
    if (!end) return false;
    var when = new Date(end);
    if (isNaN(when.getTime())) return false;
    return when <= new Date();
  }

  function refreshCross(root) {
    var panel = root.querySelector("[data-related-panel='cross']");
    if (!panel) return 0;
    var cards = panel.querySelectorAll(".home-card--related");
    var used = {};
    var shown = 0;
    cards.forEach(function (card) {
      var kind = card.getAttribute("data-kind") || "other";
      if (isPast(card) || shown >= DISPLAY_K || used[kind]) {
        card.hidden = true;
        return;
      }
      card.hidden = false;
      used[kind] = true;
      shown += 1;
    });
    var tab = root.querySelector("[data-related-tab='cross']");
    var keep = shown >= 2;
    if (tab) tab.hidden = !keep;
    if (!keep) {
      panel.hidden = true;
      if (tab && tab.getAttribute("aria-selected") === "true") {
        var fallback = root.querySelector("[data-related-tab]:not([hidden])");
        if (fallback) showTab(root, fallback.getAttribute("data-related-tab"));
      }
    } else if (tab && tab.getAttribute("aria-selected") === "true") {
      panel.hidden = false;
    }
    var tablist = root.querySelector(".related-news__tabs");
    var liveTabs = root.querySelectorAll("[data-related-tab]:not([hidden])");
    if (tablist) tablist.hidden = liveTabs.length < 2;
    return shown;
  }

  function refreshAll() {
    document.querySelectorAll(".related-news").forEach(refreshCross);
  }

  document.addEventListener("click", function (event) {
    var tab = event.target.closest("[data-related-tab]");
    if (tab) {
      showTab(rootOf(tab), tab.getAttribute("data-related-tab"));
      return;
    }
    var chip = event.target.closest("[data-entity-chip]");
    if (chip) {
      showEntity(rootOf(chip), chip.getAttribute("data-entity-chip"));
    }
  });

  document.addEventListener("site-drawer:open", refreshAll);
  refreshAll();
})();
