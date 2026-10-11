(function shuffleFilmListing() {
  var grid = document.querySelector(".section-listing--films [data-film-shuffle]");
  if (!grid) return;

  var posters = Array.prototype.slice.call(grid.querySelectorAll(":scope > .home-poster"));
  if (posters.length < 2) {
    grid.setAttribute("data-film-shuffle", "done");
    return;
  }

  var trilogy = [];
  var rest = [];
  posters.forEach(function (el) {
    if (el.getAttribute("data-film-group") === "batman-trilogy") trilogy.push(el);
    else rest.push(el);
  });

  trilogy.sort(function (a, b) {
    return Number(a.getAttribute("data-film-year") || 0) - Number(b.getAttribute("data-film-year") || 0);
  });

  for (var i = rest.length - 1; i > 0; i--) {
    var j = Math.floor(Math.random() * (i + 1));
    var swap = rest[i];
    rest[i] = rest[j];
    rest[j] = swap;
  }

  var slot = 0;
  if (trilogy.length) {
    var cols = gridTemplateColumns(grid);
    var rowStarts = [0];
    if (cols >= trilogy.length) {
      for (var k = cols; k <= rest.length; k += cols) rowStarts.push(k);
    } else {
      for (var n = 1; n <= rest.length; n++) rowStarts.push(n);
    }
    slot = rowStarts[Math.floor(Math.random() * rowStarts.length)];
  }

  var ordered = rest.slice(0, slot).concat(trilogy, rest.slice(slot));
  ordered.forEach(function (el) {
    grid.appendChild(el);
  });
  grid.setAttribute("data-film-shuffle", "done");
})();

function gridTemplateColumns(grid) {
  var raw = window.getComputedStyle(grid).gridTemplateColumns || "";
  var parts = raw.split(" ").filter(function (part) {
    return part && part !== "none";
  });
  return parts.length || 1;
}
