(function miniloopLine() {
  var root = document.querySelector("[data-miniloop-line]");
  if (!root) return;

  var slots = Array.prototype.slice.call(root.querySelectorAll("[data-miniloop-swap]"));
  if (!slots.length) return;

  var reduced = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var prepared = slots.map(function (slot) {
    return {
      slot: slot,
      words: (slot.getAttribute("data-words") || "")
        .split(",")
        .map(function (word) { return word.trim(); })
        .filter(Boolean),
    };
  }).filter(function (item) { return item.words.length > 1; });

  function start() {
    prepared.forEach(function (item) {
      sizeSlot(item.slot, item.words);
    });
    prepared.forEach(function (item) {
      var slot = item.slot;
      var words = item.words;
      var interval = Number(slot.getAttribute("data-interval") || 3200);
      var delay = Number(slot.getAttribute("data-delay") || 0);
      var index = 0;

      function tick() {
        if (document.visibilityState === "hidden") return;
        index = (index + 1) % words.length;
        swap(slot, words[index], reduced);
      }

      window.setTimeout(function () {
        tick();
        window.setInterval(tick, interval);
      }, delay + interval);
    });
  }

  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(start);
  } else {
    start();
  }

  window.addEventListener("resize", function () {
    prepared.forEach(function (item) {
      sizeSlot(item.slot, item.words);
    });
  });

  function sizeSlot(slot, words) {
    var host = slot.closest("h2") || slot.parentNode;
    var probe = document.createElement("span");
    probe.className = "miniloop-swap__measure";
    probe.setAttribute("aria-hidden", "true");
    host.appendChild(probe);
    var max = 0;
    words.forEach(function (word) {
      probe.textContent = word;
      max = Math.max(max, probe.getBoundingClientRect().width);
    });
    host.removeChild(probe);
    slot.style.width = Math.ceil(max + 2) + "px";
  }

  function swap(slot, nextWord, instant) {
    var current = slot.querySelector(".miniloop-swap__word.is-current");
    if (!current || current.textContent === nextWord) return;

    if (instant) {
      current.textContent = nextWord;
      return;
    }

    var incoming = document.createElement("span");
    incoming.className = "miniloop-swap__word is-enter";
    incoming.textContent = nextWord;
    slot.appendChild(incoming);
    incoming.offsetWidth;
    current.classList.add("is-leave");
    incoming.classList.remove("is-enter");
    incoming.classList.add("is-current");

    window.setTimeout(function () {
      if (current.parentNode === slot) slot.removeChild(current);
    }, 520);
  }
})();
