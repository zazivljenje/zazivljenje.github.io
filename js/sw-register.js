(function () {
  var host = location.hostname;
  if (host === "localhost" || host === "127.0.0.1") return;
  if (!("serviceWorker" in navigator)) return;
  window.addEventListener("load", function () {
    navigator.serviceWorker.register("/sw.js").catch(function () {});
  });
})();
