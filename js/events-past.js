(function hidePastEvents() {
  var nodes = document.querySelectorAll("[data-event-end]");
  if (!nodes.length) return;

  var now = new Date();
  var today =
    now.getFullYear() +
    "-" +
    String(now.getMonth() + 1).padStart(2, "0") +
    "-" +
    String(now.getDate()).padStart(2, "0");

  nodes.forEach(function (el) {
    var end = el.getAttribute("data-event-end");
    if (end && end < today) el.hidden = true;
  });

  document.querySelectorAll(".home-band--events").forEach(function (band) {
    if (!band.querySelector(".home-poster:not([hidden])")) band.hidden = true;
  });
})();
