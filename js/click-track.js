(function () {
  var KEY = "zz-session-id";
  var script = document.currentScript || document.querySelector('script[src*="click-track.js"]');
  var endpoint = script && script.getAttribute("data-endpoint");
  if (!endpoint) return;
  if (navigator.doNotTrack === "1" || window.doNotTrack === "1") return;

  function sessionId() {
    try {
      var id = sessionStorage.getItem(KEY);
      if (id) return id;
      id =
        (crypto.randomUUID && crypto.randomUUID()) ||
        "s-" + Date.now().toString(36) + "-" + Math.random().toString(36).slice(2, 10);
      sessionStorage.setItem(KEY, id);
      return id;
    } catch (err) {
      return "s-" + Date.now().toString(36);
    }
  }

  function device() {
    var ua = navigator.userAgent || "";
    if (/Mobi|Android|iPhone|iPad|iPod/i.test(ua)) return "mobile";
    if (window.matchMedia && window.matchMedia("(max-width: 820px)").matches) return "mobile";
    return "desktop";
  }

  function send(payload) {
    var body = JSON.stringify(payload);
    try {
      if (navigator.sendBeacon) {
        navigator.sendBeacon(endpoint, new Blob([body], { type: "text/plain" }));
        return;
      }
    } catch (err) {}
    try {
      fetch(endpoint, {
        method: "POST",
        body: body,
        keepalive: true,
        headers: { "Content-Type": "text/plain" },
        mode: "cors",
      }).catch(function () {});
    } catch (err) {}
  }

  var sid = sessionId();
  var kind = device();

  document.addEventListener(
    "click",
    function (e) {
      var node = e.target;
      if (!node) return;
      var a = node.closest ? node.closest("a[href]") : null;
      if (!a) return;
      var href = a.href;
      if (!href || href.indexOf("javascript:") === 0) return;
      send({
        session_id: sid,
        ts: new Date().toISOString(),
        device: kind,
        href: href,
        page: location.href,
      });
    },
    true
  );
})();
