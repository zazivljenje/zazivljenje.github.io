(function () {
  var box = document.getElementById("loss-ticker");
  if (!box) return;

  var worldEl = box.querySelector("[data-loss='world']");
  var siEl = box.querySelector("[data-loss='si']");
  var euEl = box.querySelector("[data-loss='euth']");
  if (!worldEl || !siEl || !euEl) return;

  var YEAR_MS = 365.25 * 24 * 60 * 60 * 1000;
  // WHO / Guttmacher: ~73 million induced abortions a year (2015–2019 average).
  var WORLD_ABORTIONS_PER_MS = 73000000 / YEAR_MS;
  // Novičnik Za življenje, april 2022: okoli 4000 na leto v Sloveniji.
  var SI_ABORTIONS_PER_MS = 4000 / YEAR_MS;
  // Seštevek zadnjih uradnih letnih poročil (ne popoln svetovni popis):
  // Kanada MAID 2024 16 499, Nizozemska 2025 10 341, Belgija 2025 4 486,
  // Avstralija 2024–25 3 329, Španija 2024 426, Oregon 2024 376, Exit Švica 2025 1 421.
  var EUTHANASIA_PER_MS = 36878 / YEAR_MS;

  var TZ = "Europe/Ljubljana";
  var visitStart = Date.now();
  try {
    var stored = Number(sessionStorage.getItem("loss-ticker-start"));
    if (stored > 0) visitStart = stored;
    else sessionStorage.setItem("loss-ticker-start", String(visitStart));
  } catch (err) {}
  var fmt = new Intl.NumberFormat("sl-SI", { maximumFractionDigits: 0 });

  function startOfDayInTimeZone(now, timeZone) {
    var dtf = new Intl.DateTimeFormat("en-US", {
      timeZone: timeZone,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hourCycle: "h23"
    });
    var parts = {};
    dtf.formatToParts(now).forEach(function (part) {
      if (part.type !== "literal") parts[part.type] = part.value;
    });
    var asUTC = Date.UTC(
      Number(parts.year),
      Number(parts.month) - 1,
      Number(parts.day),
      Number(parts.hour),
      Number(parts.minute),
      Number(parts.second)
    );
    var offset = asUTC - now;
    var startWall = Date.UTC(
      Number(parts.year),
      Number(parts.month) - 1,
      Number(parts.day),
      0, 0, 0
    );
    return startWall - offset;
  }

  function setCount(el, value) {
    var text = fmt.format(Math.floor(Math.max(0, value)));
    if (el.textContent !== text) el.textContent = text;
  }

  function tick() {
    var now = Date.now();
    var dayStart = startOfDayInTimeZone(now, TZ);
    setCount(worldEl, (now - visitStart) * WORLD_ABORTIONS_PER_MS);
    setCount(siEl, (now - dayStart) * SI_ABORTIONS_PER_MS);
    setCount(euEl, (now - dayStart) * EUTHANASIA_PER_MS);
    window.requestAnimationFrame(tick);
  }

  window.requestAnimationFrame(tick);
})();
