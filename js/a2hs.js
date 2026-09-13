(function () {
  var STORAGE_KEY = "a2hs-dismissed-until";
  var DISMISS_DAYS = 30;
  var bar = document.getElementById("a2hs-prompt");
  if (!bar) return;

  var standalone =
    window.matchMedia("(display-mode: standalone)").matches ||
    window.navigator.standalone === true;
  if (standalone) return;

  try {
    var until = Number(localStorage.getItem(STORAGE_KEY) || 0);
    if (until && Date.now() < until) return;
  } catch (err) {}

  var isIOS = /iphone|ipad|ipod/i.test(navigator.userAgent);
  var isMobile =
    isIOS ||
    /android/i.test(navigator.userAgent) ||
    window.matchMedia("(max-width: 820px)").matches;
  if (!isMobile) return;

  var deferredPrompt = null;
  var iosHint = bar.querySelector("[data-a2hs-ios]");
  var installBtn = bar.querySelector("[data-a2hs='install']");

  function show() {
    bar.hidden = false;
    bar.classList.add("is-visible");
  }

  function hide() {
    bar.classList.remove("is-visible");
    bar.hidden = true;
  }

  function dismiss() {
    try {
      localStorage.setItem(
        STORAGE_KEY,
        String(Date.now() + DISMISS_DAYS * 24 * 60 * 60 * 1000)
      );
    } catch (err) {}
    hide();
  }

  window.addEventListener("beforeinstallprompt", function (event) {
    event.preventDefault();
    deferredPrompt = event;
    show();
  });

  if (isIOS) {
    window.setTimeout(show, 1400);
  }

  bar.addEventListener("click", function (event) {
    var action = event.target.closest("[data-a2hs]");
    if (!action) return;
    var kind = action.getAttribute("data-a2hs");
    if (kind === "dismiss") {
      dismiss();
      return;
    }
    if (kind !== "install") return;
    if (deferredPrompt) {
      deferredPrompt.prompt();
      deferredPrompt.userChoice.finally(function () {
        deferredPrompt = null;
        dismiss();
      });
      return;
    }
    if (isIOS && iosHint) {
      iosHint.hidden = false;
      if (installBtn) installBtn.hidden = true;
    }
  });

  if ("serviceWorker" in navigator) {
    navigator.serviceWorker.register("/sw.js").catch(function () {});
  }
})();
