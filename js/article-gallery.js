(function () {
  function slidesOf(gallery) {
    return gallery.querySelectorAll("[data-gallery-slide]");
  }

  function show(gallery, index) {
    var slides = slidesOf(gallery);
    if (!slides.length) return;
    var i = ((index % slides.length) + slides.length) % slides.length;
    gallery.dataset.index = String(i);
    slides.forEach(function (img, n) {
      img.hidden = n !== i;
    });
  }

  function step(gallery, delta) {
    var i = parseInt(gallery.dataset.index || "0", 10);
    show(gallery, i + delta);
  }

  function galleryFrom(target) {
    return target && target.closest ? target.closest("[data-gallery]") : null;
  }

  document.addEventListener("click", function (event) {
    var prev = event.target.closest(".article-gallery__nav--prev");
    var next = event.target.closest(".article-gallery__nav--next");
    if (!prev && !next) return;
    var gallery = galleryFrom(event.target);
    if (!gallery) return;
    event.preventDefault();
    step(gallery, next ? 1 : -1);
  });

  document.addEventListener("keydown", function (event) {
    if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;
    var gallery =
      galleryFrom(event.target) ||
      document.querySelector(".site-drawer.is-open [data-gallery]");
    if (!gallery) return;
    event.preventDefault();
    step(gallery, event.key === "ArrowRight" ? 1 : -1);
  });

  document.addEventListener("pointerdown", function (event) {
    var frame = event.target.closest(".article-gallery__frame");
    if (!frame || event.pointerType === "mouse") return;
    var gallery = galleryFrom(frame);
    if (!gallery) return;
    gallery._swipeX = event.clientX;
  });

  document.addEventListener("pointerup", function (event) {
    var gallery = galleryFrom(event.target);
    if (!gallery || gallery._swipeX == null) return;
    var dx = event.clientX - gallery._swipeX;
    gallery._swipeX = null;
    if (Math.abs(dx) < 40) return;
    step(gallery, dx < 0 ? 1 : -1);
  });
})();
