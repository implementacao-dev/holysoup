(function () {
  var cfgEl = document.getElementById('bulk-campaign-config');
  if (!cfgEl) return;

  var cfg;
  try {
    cfg = JSON.parse(cfgEl.textContent);
  } catch (err) {
    return;
  }
  if (!cfg.enable) return;

  cfg.coupon = cfg.coupon || {};
  cfg.offer1 = cfg.offer1 || {};
  cfg.offer2 = cfg.offer2 || { from: 20, to: 24, target: 25 };

  var KEY = {
    o1Seen: 'qtyInc_o1Seen',
    o1Refuse: 'qtyInc_o1Refuse',
    o2Seen: 'qtyInc_o2Seen',
    o2Refuse: 'qtyInc_o2Refuse',
    o2X: 'qtyInc_o2X',
    couponOn: 'qtyInc_couponOn',
    couponUi: 'qtyInc_couponUi',
  };

  var excluded = {};
  (Array.isArray(cfg.excludedIds) ? cfg.excludedIds : []).forEach(function (id) {
    if (id) excluded[String(id)] = true;
  });

  var skip = false;

  function flag(k) {
    return sessionStorage.getItem(k) === '1';
  }
  function mark(k) {
    sessionStorage.setItem(k, '1');
  }
  function log() {
    if (cfg.debug && window.console) console.log.apply(console, ['[bulk-campaign]'].concat([].slice.call(arguments)));
  }

  function isCampaignUnit(item) {
    if (!item || excluded[String(item.product_id)]) return false;
    var line = Number(item.final_line_price);
    var origLine = Number(item.original_line_price);
    var unit = Number(item.final_price != null ? item.final_price : item.price);
    if (line === 0 || origLine === 0 || unit === 0) return false;
    return true;
  }

  function eligibleItems(cart) {
    return (cart.items || []).filter(isCampaignUnit);
  }

  function eligibleQty(cart) {
    return eligibleItems(cart).reduce(function (s, i) {
      return s + (i.quantity || 0);
    }, 0);
  }

  function fetchCart() {
    return fetch('/cart.js', { credentials: 'same-origin' }).then(function (r) {
      return r.json();
    });
  }

  function decide(cart) {
    var q = eligibleQty(cart);

    if (flag(KEY.o2Seen) && !flag(KEY.o2Refuse) && q >= cfg.offer2.target) {
      mark(KEY.couponOn);
    }

    if (q >= cfg.offer2.target && flag(KEY.couponOn) && !flag(KEY.couponUi)) {
      return 'coupon';
    }
    if (
      q >= cfg.offer1.from &&
      q <= cfg.offer1.to &&
      !flag(KEY.o1Seen) &&
      !flag(KEY.o1Refuse)
    ) {
      return 'offer1';
    }
    if (
      q >= cfg.offer2.from &&
      q <= cfg.offer2.to &&
      !flag(KEY.o1Seen) &&
      !flag(KEY.o1Refuse) &&
      !flag(KEY.o2Seen)
    ) {
      return 'offer2';
    }
    return null;
  }

  function proceedCheckout() {
    skip = true;
    setTimeout(function () {
      skip = false;
    }, 2000);
    var isLocal = /^(localhost|127\.0\.0\.1)$/i.test(window.location.hostname);
    if (!isLocal && typeof window.yampiClick === 'function') {
      window.yampiClick();
      return;
    }
    var btn = document.querySelector('#side-cart a.button-checkout');
    var href = btn && btn.getAttribute('href');
    if (href && href !== 'javascript:void(0)' && href !== '#') {
      window.location.href = href;
      return;
    }
    window.location.href = '/checkout';
  }

  function fill(str, map) {
    var out = str || '';
    Object.keys(map).forEach(function (k) {
      out = out.split('{{' + k + '}}').join(map[k]);
    });
    return out;
  }

  function copyCoupon() {
    var code = cfg.coupon.code || '';
    if (!code) return;
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(code);
    } else {
      var t = document.createElement('textarea');
      t.value = code;
      document.body.appendChild(t);
      t.select();
      document.execCommand('copy');
      t.remove();
    }
    var btn = document.querySelector('[data-bulk-campaign-copy]');
    if (btn) btn.textContent = cfg.coupon.copied || 'Copiado';
  }

  function injectBanner() {
    if (!flag(KEY.couponOn) || !cfg.coupon.code) return;
    var slot = document.querySelector('[data-bulk-campaign-banner-slot]');
    if (!slot || slot.querySelector('.bulk-campaign-banner')) return;
    var bar = document.createElement('div');
    bar.className = 'bulk-campaign-banner';
    bar.innerHTML =
      '<span>Cupom: <code></code></span><button type="button" class="bulk-campaign-banner__copy"></button>';
    bar.querySelector('code').textContent = cfg.coupon.code;
    bar.querySelector('button').textContent = cfg.coupon.copy || 'Copiar';
    bar.querySelector('button').addEventListener('click', copyCoupon);
    slot.insertBefore(bar, slot.firstChild);
  }

  function handleCheckoutIntent(source) {
    return fetchCart().then(function (cart) {
      var action = decide(cart);
      var q = eligibleQty(cart);
      log(source, action, q);

      if (action === 'offer1' || action === 'offer2') {
        if (window.BulkPurchase && typeof window.BulkPurchase.openCampaign === 'function') {
          window.BulkPurchase.openCampaign(action, cart);
        } else {
          sessionStorage.setItem('bulkCampaignPending', action);
          var root = (window.Shopify && window.Shopify.routes && window.Shopify.routes.root) || '/';
          window.location.href = root + (root.indexOf('?') >= 0 ? '&' : '?') + 'cart-popup=1';
        }
        return { handled: true, action: action };
      }
      if (action === 'coupon') {
        if (window.BulkPurchase && typeof window.BulkPurchase.openCampaign === 'function') {
          window.BulkPurchase.openCampaign('coupon', cart);
        } else {
          sessionStorage.setItem('bulkCampaignPending', 'coupon');
          var root2 = (window.Shopify && window.Shopify.routes && window.Shopify.routes.root) || '/';
          window.location.href = root2 + (root2.indexOf('?') >= 0 ? '&' : '?') + 'cart-popup=1';
        }
        return { handled: true, action: 'coupon' };
      }
      proceedCheckout();
      return { handled: true, action: null };
    });
  }

  function updateSideCartProgress(cart) {
    var root = document.querySelector('[data-bulk-campaign-side-progress]');
    if (!root) return;
    var q = eligibleQty(cart);
    var maxTier = Number(cfg.sideCartMaxTier) || 20;
    var msgEl = root.querySelector('[data-bulk-campaign-side-msg]');
    var defaultBlock = root.querySelector('[data-bulk-campaign-side-default]');
    if (!msgEl) return;

    if (q >= maxTier) {
      var savings = cfg.sideCartMaxMsg || root.getAttribute('data-savings-template') || '';
      msgEl.innerHTML = savings;
      var bars = root.querySelectorAll('.side-cart-shipping-bar');
      bars.forEach(function (bar) {
        bar.style.display = 'none';
      });
      if (defaultBlock) {
        var icon = defaultBlock.querySelector('img, svg');
        if (icon) icon.style.display = 'none';
      }
    } else if (defaultBlock) {
      var iconShow = defaultBlock.querySelector('img, svg');
      if (iconShow) iconShow.style.display = '';
      var barsShow = root.querySelectorAll('.side-cart-shipping-bar');
      barsShow.forEach(function (bar) {
        bar.style.display = '';
      });
    }
  }

  function refreshSideCartState() {
    fetchCart().then(function (cart) {
      updateSideCartProgress(cart);
      maybeUnlockCoupon(cart);
      injectBanner();
    });
  }

  function maybeUnlockCoupon(cart) {
    var q = eligibleQty(cart);
    if (flag(KEY.o2Seen) && !flag(KEY.o2Refuse) && q >= cfg.offer2.target) {
      mark(KEY.couponOn);
      injectBanner();
      if (!flag(KEY.couponUi) && window.BulkPurchase && window.BulkPurchase.openCampaign) {
        window.BulkPurchase.openCampaign('coupon', cart);
      }
    }
  }

  document.addEventListener(
    'click',
    function (ev) {
      if (skip) return;
      var btn = ev.target.closest && ev.target.closest('#side-cart a.button-checkout');
      if (!btn) return;
      ev.preventDefault();
      ev.stopPropagation();
      handleCheckoutIntent('side-cart');
    },
    true
  );

  document.addEventListener('click', function (ev) {
    if (ev.target.closest('[data-bulk-campaign-copy]')) {
      copyCoupon();
    }
    if (ev.target.closest('[data-bulk-campaign-coupon-checkout]')) {
      proceedCheckout();
    }
  });

  window.addEventListener('cart-change', function () {
    setTimeout(refreshSideCartState, 400);
  });

  window.BulkCampaign = {
    cfg: cfg,
    KEY: KEY,
    flag: flag,
    mark: mark,
    fill: fill,
    decide: decide,
    eligibleQty: eligibleQty,
    eligibleItems: eligibleItems,
    fetchCart: fetchCart,
    proceedCheckout: proceedCheckout,
    handleCheckoutIntent: handleCheckoutIntent,
    copyCoupon: copyCoupon,
    injectBanner: injectBanner,
    maybeUnlockCoupon: maybeUnlockCoupon,
    refreshSideCartState: refreshSideCartState,
    setSkip: function (v) {
      skip = !!v;
    },
  };

  injectBanner();
  refreshSideCartState();
  log('ready');
})();
