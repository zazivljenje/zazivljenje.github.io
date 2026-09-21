(function () {
  var drawer = document.getElementById("site-drawer");
  if (!drawer) return;
  var backdrop = document.getElementById("site-drawer-backdrop");
  var mount = drawer.querySelector(".site-drawer__mount");
  var closeTimer;

  function fillMount(tpl) {
    if (tpl.content) {
      mount.replaceChildren(tpl.content.cloneNode(true));
    } else {
      mount.innerHTML = tpl.innerHTML;
    }
  }

  function openDrawer(id, trigger) {
    var tpl = document.getElementById("drawer-" + id);
    if (!tpl || !mount) return;
    window.clearTimeout(closeTimer);
    fillMount(tpl);
    drawer.scrollTop = 0;
    var size = tpl.getAttribute("data-drawer-size");
    drawer.classList.toggle("site-drawer--compact", size === "compact");
    drawer.classList.toggle("site-drawer--play", size === "play");
    drawer.classList.toggle("site-drawer--news", size === "news");
    drawer.classList.toggle("site-drawer--form", size === "form");
    drawer.classList.toggle("site-drawer--app", size === "app");
    drawer.hidden = false;
    backdrop.hidden = false;
    drawer.setAttribute("aria-hidden", "false");
    document.body.classList.add("drawer-open");
    window.requestAnimationFrame(function () {
      drawer.classList.add("is-open");
      backdrop.classList.add("is-open");
    });
    var closeBtn = drawer.querySelector("[data-drawer-close]");
    if (closeBtn) closeBtn.focus();
    if (history.replaceState) {
      history.replaceState(null, "", "#" + id);
    } else {
      location.hash = id;
    }
    document.dispatchEvent(new CustomEvent("site-drawer:open", { detail: { id: id, mount: mount, trigger: trigger || null } }));
  }

  function closeDrawer() {
    if (drawer.hidden) return;
    drawer.classList.remove("is-open");
    backdrop.classList.remove("is-open");
    document.body.classList.remove("drawer-open");
    drawer.setAttribute("aria-hidden", "true");
    document.dispatchEvent(new CustomEvent("site-drawer:close"));
    closeTimer = window.setTimeout(function () {
      if (mount) {
        mount.querySelectorAll("iframe").forEach(function (frame) {
          frame.src = "about:blank";
        });
        mount.innerHTML = "";
      }
      drawer.classList.remove("site-drawer--compact", "site-drawer--play", "site-drawer--news", "site-drawer--form", "site-drawer--app");
      drawer.hidden = true;
      backdrop.hidden = true;
    }, 280);
    if (location.hash && history.replaceState) {
      history.replaceState(null, "", location.pathname + location.search);
    }
  }

  document.addEventListener("click", function (event) {
    var close = event.target.closest("[data-drawer-close]");
    if (close) {
      event.preventDefault();
      closeDrawer();
      return;
    }
    var trigger = event.target.closest("[data-drawer]");
    if (!trigger) return;
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button === 1) return;
    event.preventDefault();
    openDrawer(trigger.getAttribute("data-drawer"), trigger);
  });

  document.addEventListener("keydown", function (event) {
    if (event.key === "Escape") closeDrawer();
  });

  function openFromHash() {
    var hash = location.hash.replace(/^#/, "");
    if (hash && document.getElementById("drawer-" + hash)) {
      openDrawer(hash);
      return;
    }
    var fallback = document.querySelector("template[data-drawer-default]");
    if (fallback && fallback.id.indexOf("drawer-") === 0) {
      openDrawer(fallback.id.slice("drawer-".length));
    }
  }

  window.addEventListener("hashchange", openFromHash);
  openFromHash();
})();
