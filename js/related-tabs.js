(function () {
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
})();
