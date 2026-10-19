(function menuToggle() {
  var nav = document.querySelector("header.header .nav");
  var toggle = document.getElementById("menu-toggle");
  var menu = document.getElementById("menu");
  if (!nav || !toggle || !menu) return;

  function setOpen(open) {
    nav.classList.toggle("is-menu-open", open);
    document.body.classList.toggle("menu-open", open);
    toggle.setAttribute("aria-expanded", open ? "true" : "false");
    toggle.setAttribute("aria-label", open ? "Zapri meni" : "Odpri meni");
  }

  toggle.addEventListener("click", function () {
    setOpen(!nav.classList.contains("is-menu-open"));
  });

  menu.addEventListener("click", function (event) {
    if (event.target.closest("a")) setOpen(false);
  });

  document.addEventListener("keydown", function (event) {
    if (event.key === "Escape") setOpen(false);
  });

  window.addEventListener("resize", function () {
    if (window.matchMedia("(min-width: 861px)").matches) setOpen(false);
  });
})();
