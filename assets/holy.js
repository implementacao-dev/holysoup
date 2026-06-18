(function () {
  var root = document.querySelector('.v2.v3');
  if (!root) return;

  // ---------- Honey cursor (desktop only) ----------
  (function cursor() {
    var el = document.getElementById('v2-cursor');
    if (!el) return;
    if (window.matchMedia('(pointer: coarse)').matches) { el.style.display = 'none'; return; }
    var x = -100, y = -100, tx = -100, ty = -100;
    document.addEventListener('mousemove', function (e) { tx = e.clientX; ty = e.clientY; });
    document.addEventListener('mouseleave', function () { el.classList.add('hidden'); });
    document.addEventListener('mouseenter', function () { el.classList.remove('hidden'); });
    document.addEventListener('mousedown', function () { el.style.transform = 'translate(-50%, -50%) scale(1.4)'; });
    document.addEventListener('mouseup', function () { el.style.transform = 'translate(-50%, -50%) scale(1)'; });
    (function loop() {
      x += (tx - x) * 0.28;
      y += (ty - y) * 0.28;
      el.style.left = x + 'px';
      el.style.top = y + 'px';
      requestAnimationFrame(loop);
    })();
  })();

  // ---------- Sticky CTA visibility ----------
  (function stickyCta() {
    var bar = document.getElementById('v2-sticky-cta');
    if (!bar) return;
    function onScroll() {
      var y = window.scrollY;
      var show = y > 1200 && y < (document.body.scrollHeight - window.innerHeight - 800);
      bar.classList.toggle('show', show);
    }
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  })();

  // ---------- FAQ accordion ----------
  (function faq() {
    var list = document.getElementById('v3-faq-list');
    if (!list) return;
    list.addEventListener('click', function (e) {
      var item = e.target.closest('[data-faq-item]');
      if (!item) return;
      var wasOpen = item.classList.contains('open');
      list.querySelectorAll('[data-faq-item]').forEach(function (n) { n.classList.remove('open'); });
      if (!wasOpen) item.classList.add('open');
    });
  })();

  // ---------- Review filter ----------
  (function reviewFilter() {
    var bar = document.getElementById('v3-review-filter');
    var grid = document.getElementById('v3-review-grid');
    if (!bar || !grid) return;
    bar.addEventListener('click', function (e) {
      var pill = e.target.closest('.v3-review-pill');
      if (!pill) return;
      var f = pill.getAttribute('data-filter');
      bar.querySelectorAll('.v3-review-pill').forEach(function (n) { n.classList.toggle('active', n === pill); });
      grid.querySelectorAll('.v3-review-card').forEach(function (n) {
        var show = (f === 'Todas') || (n.getAttribute('data-tag') === f);
        n.style.display = show ? '' : 'none';
      });
    });
  })();

  // ---------- Scroll drips (decorativos, leve) ----------
  (function drips() {
    if (window.matchMedia('(pointer: coarse)').matches) return; // mobile sem drips
    var lastY = window.scrollY, throttle = false;
    var container = document.createElement('div');
    container.style.cssText = 'position:absolute;inset:0;pointer-events:none;z-index:3;';
    root.style.position = root.style.position || 'relative';
    root.appendChild(container);
    function drop(left, top) {
      var d = document.createElement('div');
      var size = 14 + Math.random() * 14;
      d.className = 'drip-anim';
      d.style.cssText = 'position:absolute;left:' + left + '%;top:' + top + 'px;animation-delay:' + (Math.random() * 0.5) + 's;';
      d.innerHTML = '<svg width="' + size + '" height="' + (size * 1.35) + '" viewBox="0 0 22 30"><path d="M 11 2 Q 4 16 4 22 A 7 7 0 0 0 18 22 Q 18 16 11 2 Z" fill="#D89126" stroke="#2E1408" stroke-width="1.8"/><ellipse cx="8" cy="20" rx="1.8" ry="3.5" fill="#FFF4D6" opacity="0.7"/></svg>';
      container.appendChild(d);
      setTimeout(function () { d.remove(); }, 2800);
    }
    window.addEventListener('scroll', function () {
      if (throttle) return;
      throttle = true;
      setTimeout(function () { throttle = false; }, 350);
      var y = window.scrollY;
      if (Math.abs(y - lastY) < 250) return;
      lastY = y;
      for (var i = 0; i < 2; i++) drop(4 + Math.random() * 92, y + window.innerHeight * 0.1);
    }, { passive: true });
  })();
})();