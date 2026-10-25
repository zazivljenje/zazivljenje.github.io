(function () {
  var row = document.getElementById("home-kratki-row");
  if (!row) return;

  var nodes = Array.prototype.slice.call(row.children);
  for (var i = nodes.length - 1; i > 0; i--) {
    var j = Math.floor(Math.random() * (i + 1));
    var swap = nodes[i];
    nodes[i] = nodes[j];
    nodes[j] = swap;
  }
  nodes.forEach(function (node) { row.appendChild(node); });

  var clips = nodes.filter(function (node) { return node.getAttribute("data-yt"); }).slice(0, 6);
  if (!clips.length) return;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  var index = 0;
  var active = null;
  var timer = 0;
  var onScreen = false;
  var drawerOpen = false;

  function shouldPlay() {
    return onScreen && !drawerOpen && !document.hidden;
  }

  function clearPreview() {
    window.clearTimeout(timer);
    timer = 0;
    if (active) {
      active.classList.remove("is-previewing");
      var frame = active.querySelector(".home-media__preview");
      if (frame) frame.remove();
    }
    active = null;
  }

  function next() {
    index = (index + 1) % clips.length;
    mount(clips[index]);
  }

  function mount(item) {
    clearPreview();
    if (!shouldPlay()) return;
    var id = item.getAttribute("data-yt");
    var thumb = item.querySelector(".home-media__thumb");
    if (!id || !thumb) return;
    var seconds = parseInt(item.getAttribute("data-duration"), 10);
    if (!seconds || seconds < 1) seconds = 20;
    active = item;
    item.classList.add("is-previewing");
    var wrap = document.createElement("div");
    wrap.className = "home-media__preview";
    wrap.setAttribute("aria-hidden", "true");
    var frame = document.createElement("iframe");
    frame.setAttribute("title", "");
    frame.setAttribute("tabindex", "-1");
    frame.setAttribute("allow", "autoplay; encrypted-media; picture-in-picture");
    frame.src = "https://www.youtube-nocookie.com/embed/" + encodeURIComponent(id)
      + "?autoplay=1&mute=1&controls=0&modestbranding=1&playsinline=1&rel=0"
      + "&fs=0&disablekb=1&iv_load_policy=3&cc_load_policy=0&showinfo=0"
      + "&loop=0&playlist=" + encodeURIComponent(id);
    wrap.appendChild(frame);
    thumb.appendChild(wrap);
    timer = window.setTimeout(next, Math.max(4000, seconds * 1000 - 400));
  }

  function sync() {
    if (!shouldPlay()) {
      clearPreview();
      return;
    }
    if (!active) mount(clips[index]);
  }

  if ("IntersectionObserver" in window) {
    var observer = new IntersectionObserver(function (entries) {
      onScreen = entries.some(function (entry) { return entry.isIntersecting; });
      sync();
    }, { threshold: 0.45 });
    observer.observe(row);
  } else {
    onScreen = true;
    sync();
  }

  document.addEventListener("visibilitychange", sync);
  document.addEventListener("site-drawer:open", function () {
    drawerOpen = true;
    sync();
  });
  document.addEventListener("site-drawer:close", function () {
    drawerOpen = false;
    sync();
  });
})();
