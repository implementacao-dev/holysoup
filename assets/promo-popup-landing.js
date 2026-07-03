(function () {
  var STORAGE_PREFIX = 'promo_popup_countdown_';
  var SEEN_PREFIX = 'promo_popup_seen_';

  function getCookie(name) {
    var match = document.cookie.match(new RegExp('(?:^|; )' + name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '=([^;]*)'));
    return match ? decodeURIComponent(match[1]) : '';
  }

  function setCookie(name, value, days) {
    var expires = '';
    if (days) {
      var date = new Date();
      date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
      expires = '; expires=' + date.toUTCString();
    }
    document.cookie = name + '=' + encodeURIComponent(value) + expires + '; path=/; SameSite=Lax';
  }

  function hasBeenSeen(sectionId, frequency) {
    var key = SEEN_PREFIX + sectionId;
    if (frequency === 'session') {
      return sessionStorage.getItem(key) === '1';
    }
    return getCookie(key) === '1';
  }

  function markAsSeen(sectionId, frequency) {
    var key = SEEN_PREFIX + sectionId;
    if (frequency === 'session') {
      sessionStorage.setItem(key, '1');
      return;
    }
    var days = 1;
    if (frequency === 'week') days = 7;
    else if (frequency === '15days') days = 15;
    else if (frequency === 'month') days = 30;
    setCookie(key, '1', days);
  }

  function pad(num) {
    return ('0' + num).slice(-2);
  }

  function parseLoopHours(value) {
    var hours = parseFloat(value);
    if (isNaN(hours) || hours <= 0) return 3;
    return hours;
  }

  function initCountdown(popup) {
    var sectionId = popup.getAttribute('data-section-id');
    var countdownEl = popup.querySelector('[data-promo-popup-countdown]');
    if (!countdownEl) return;

    var loopHours = parseLoopHours(popup.getAttribute('data-loop-hours'));
    var storageKey = STORAGE_PREFIX + sectionId;
    var countDownDate;
    var savedDate = localStorage.getItem(storageKey);

    if (savedDate && !isNaN(savedDate) && parseInt(savedDate, 10) > Date.now()) {
      countDownDate = parseInt(savedDate, 10);
    } else {
      countDownDate = Date.now() + loopHours * 60 * 60 * 1000;
      localStorage.setItem(storageKey, countDownDate.toString());
    }

    var daysEl = countdownEl.querySelector('[data-unit="days"]');
    var hoursEl = countdownEl.querySelector('[data-unit="hours"]');
    var minutesEl = countdownEl.querySelector('[data-unit="minutes"]');
    var secondsEl = countdownEl.querySelector('[data-unit="seconds"]');

    function tick() {
      var now = Date.now();
      var distance = countDownDate - now;

      if (distance < 0) {
        countDownDate = Date.now() + loopHours * 60 * 60 * 1000;
        localStorage.setItem(storageKey, countDownDate.toString());
        distance = countDownDate - now;
      }

      var days = Math.floor(distance / (1000 * 60 * 60 * 24));
      var hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      var minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
      var seconds = Math.floor((distance % (1000 * 60)) / 1000);

      if (daysEl) daysEl.textContent = pad(days);
      if (hoursEl) hoursEl.textContent = pad(hours);
      if (minutesEl) minutesEl.textContent = pad(minutes);
      if (secondsEl) secondsEl.textContent = pad(seconds);
    }

    tick();
    setInterval(tick, 1000);
  }

  function initPopup(popup) {
    var sectionId = popup.getAttribute('data-section-id');
    var delay = parseInt(popup.getAttribute('data-delay'), 10) || 0;
    var frequency = popup.getAttribute('data-frequency') || 'session';
    var backdrop = popup.querySelector('.promo-popup-landing__backdrop');
    var closeBtn = popup.querySelector('.promo-popup-landing__close');
    var isOpen = false;

    function open() {
      if (isOpen) return;
      isOpen = true;
      popup.classList.add('is-open');
      popup.setAttribute('aria-hidden', 'false');
      document.body.classList.add('promo-popup-landing-open');
    }

    function close() {
      if (!isOpen) return;
      isOpen = false;
      popup.classList.remove('is-open');
      popup.setAttribute('aria-hidden', 'true');
      document.body.classList.remove('promo-popup-landing-open');
      markAsSeen(sectionId, frequency);
    }

    if (hasBeenSeen(sectionId, frequency)) return;

    setTimeout(open, delay * 1000);

    if (backdrop) {
      backdrop.addEventListener('click', close);
    }

    if (closeBtn) {
      closeBtn.addEventListener('click', function (e) {
        e.preventDefault();
        e.stopPropagation();
        close();
      });
    }

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && isOpen) close();
    });

    initCountdown(popup);
  }

  function boot() {
    var popups = document.querySelectorAll('[data-promo-popup]');
    popups.forEach(initPopup);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
