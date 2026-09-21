(function otherTabs() {
  var root = document.querySelector("[data-other-tabs]");
  if (!root) return;

  var tabs = Array.prototype.slice.call(root.querySelectorAll('[role="tab"]'));
  var panels = Array.prototype.slice.call(root.querySelectorAll('[role="tabpanel"]'));
  var ids = tabs.map(function (tab) { return tab.getAttribute("data-tab"); });
  var aliases = {
    indeks: "indeks",
    "indeks-medijske-naravnanosti": "indeks",
    pravo: "pravo",
    predavanja: "predavanja",
    dokumenti: "dokumenti",
  };

  function idFromHash() {
    var raw = (location.hash || "").replace(/^#/, "");
    var mapped = aliases[raw] || raw;
    if (ids.indexOf(mapped) >= 0) return mapped;
    return ids[0];
  }

  function show(id, push) {
    tabs.forEach(function (tab) {
      var on = tab.getAttribute("data-tab") === id;
      tab.setAttribute("aria-selected", on ? "true" : "false");
      tab.tabIndex = on ? 0 : -1;
    });
    panels.forEach(function (panel) {
      var on = panel.getAttribute("data-tab") === id;
      panel.hidden = !on;
      panel.classList.toggle("is-active", on);
    });
    if (push) {
      var next = "#" + id;
      if (location.hash !== next) history.replaceState(null, "", next);
    }
    tabs.forEach(function (tab) {
      if (tab.getAttribute("data-tab") === id && tab.scrollIntoView) {
        tab.scrollIntoView({ inline: "nearest", block: "nearest", behavior: "smooth" });
      }
    });
  }

  tabs.forEach(function (tab, index) {
    tab.addEventListener("click", function () {
      show(tab.getAttribute("data-tab"), true);
    });
    tab.addEventListener("keydown", function (event) {
      var dir = event.key === "ArrowRight" || event.key === "ArrowDown" ? 1
        : event.key === "ArrowLeft" || event.key === "ArrowUp" ? -1
        : 0;
      if (!dir) return;
      event.preventDefault();
      var next = tabs[(index + dir + tabs.length) % tabs.length];
      next.focus();
      show(next.getAttribute("data-tab"), true);
    });
  });

  window.addEventListener("hashchange", function () {
    show(idFromHash(), false);
  });

  show(idFromHash(), false);
})();
