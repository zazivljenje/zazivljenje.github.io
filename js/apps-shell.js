(function () {
  const root = document.querySelector("[data-apps]");
  if (!root) return;

  const tabs = Array.from(root.querySelectorAll("[data-app-tab]"));
  const panels = Array.from(root.querySelectorAll("[data-app-panel]"));
  const valid = new Set(tabs.map(function (tab) {
    return tab.getAttribute("data-app-tab");
  }));

  function loadWomb(panel) {
    const frame = panel.querySelector(".apps-womb-frame");
    const src = panel.getAttribute("data-app-src");
    if (!frame || !src || frame.getAttribute("data-loaded")) return;

    frame.setAttribute("data-loaded", "1");
    frame.src = src;
  }

  function openApp(id, persistHash) {
    if (!valid.has(id)) id = "dohodnina";

    tabs.forEach(function (tab) {
      const on = tab.getAttribute("data-app-tab") === id;
      tab.classList.toggle("is-active", on);
      tab.setAttribute("aria-selected", on ? "true" : "false");
      tab.tabIndex = on ? 0 : -1;
    });

    panels.forEach(function (panel) {
      const on = panel.getAttribute("data-app-panel") === id;
      panel.hidden = !on;
      panel.classList.toggle("is-open", on);
      if (on && id === "womb") loadWomb(panel);
    });

    if (persistHash) {
      const next = "#" + id;
      if (location.hash !== next) history.replaceState(null, "", next);
    }
  }

  tabs.forEach(function (tab) {
    tab.addEventListener("click", function () {
      openApp(tab.getAttribute("data-app-tab"), true);
    });
    tab.addEventListener("keydown", function (event) {
      if (event.key !== "ArrowDown" && event.key !== "ArrowUp") return;
      event.preventDefault();
      const index = tabs.indexOf(tab);
      const next = event.key === "ArrowDown"
        ? tabs[(index + 1) % tabs.length]
        : tabs[(index - 1 + tabs.length) % tabs.length];
      next.focus();
      openApp(next.getAttribute("data-app-tab"), true);
    });
  });

  window.addEventListener("hashchange", function () {
    openApp(location.hash.replace(/^#/, ""), false);
  });

  const fromHash = location.hash.replace(/^#/, "");
  openApp(valid.has(fromHash) ? fromHash : "dohodnina", false);
})();
