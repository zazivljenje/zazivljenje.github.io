(function () {
  var SEL = ".home-card--tile .home-card__summary";

  function measure(el) {
    var body = el.closest(".home-card__body");
    if (!body) return null;
    var cs = getComputedStyle(el);
    var lh = parseFloat(cs.lineHeight);
    if (!lh || isNaN(lh)) lh = parseFloat(cs.fontSize) * 1.45;
    var pad = parseFloat(getComputedStyle(body).paddingBottom) || 0;
    var available = body.getBoundingClientRect().bottom - pad - el.getBoundingClientRect().top;
    var lines = Math.max(3, Math.floor(available / lh));
    return { el: el, lh: lh, lines: lines };
  }

  function apply(item) {
    var el = item.el;
    el.style.display = "-webkit-box";
    el.style.setProperty("-webkit-box-orient", "vertical");
    el.style.overflow = "hidden";
    el.style.textOverflow = "ellipsis";
    el.style.height = "";
    el.style.maxHeight = item.lines * item.lh + "px";
    el.style.webkitLineClamp = String(item.lines);
  }

  function fill() {
    var nodes = document.querySelectorAll(SEL);
    nodes.forEach(function (el) {
      el.style.height = "";
      el.style.maxHeight = "";
      el.style.webkitLineClamp = "";
    });
    var items = [];
    nodes.forEach(function (el) {
      var item = measure(el);
      if (item) items.push(item);
    });
    items.forEach(apply);
  }

  var t;
  function schedule() {
    cancelAnimationFrame(t);
    t = requestAnimationFrame(fill);
  }

  window.addEventListener("load", fill);
  window.addEventListener("resize", schedule);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(fill);
  if (document.readyState !== "loading") schedule();
  else document.addEventListener("DOMContentLoaded", fill);
})();
