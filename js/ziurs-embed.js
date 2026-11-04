(function () {
  var root = document.querySelector('[data-ziurs-embed]');
  if (!root) return;
  var frame = root.querySelector('iframe');
  if (!frame) return;

  var base = frame.getAttribute('src') || '';
  var suffix = (window.location.search || '') + (window.location.hash || '');
  if (suffix) {
    frame.setAttribute('src', base + suffix);
  }

  window.addEventListener('message', function (event) {
    if (event.source !== frame.contentWindow) return;
    var data = event.data || {};
    if (data.source !== 'zz-ziurs') return;
    if (data.type === 'height' && typeof data.height === 'number') {
      frame.style.height = Math.max(data.height, 480) + 'px';
    }
    if (data.type === 'step' && frame.getBoundingClientRect().top < 0) {
      frame.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });
})();
