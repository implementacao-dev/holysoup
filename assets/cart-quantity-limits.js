/**
 * Limites de quantidade por produto no carrinho.
 * - Fail-open: erro/parse inesperado deixa o request seguir.
 * - Se passar do limite: ajusta (clamp) para o máximo permitido e avisa.
 * - Só bloqueia de verdade quando já não cabe mais nenhuma unidade.
 */
(function () {
  'use strict';

  var config = window.HS_CART_QTY_LIMITS;
  if (!config || !config.enabled || !config.limits) return;

  var limitKeys = Object.keys(config.limits);
  if (!limitKeys.length) return;

  var originalFetch = window.fetch.bind(window);
  var cartCache = { items: [], loaded: false, loading: null };

  function notify(message) {
    if (!message) return;
    try {
      if (typeof window.showWarning === 'function' && document.getElementById('halo-warning-popup')) {
        window.showWarning(message);
        return;
      }
    } catch (e) {}
    try {
      alert(message);
    } catch (e2) {}
  }

  function formatMessage(max) {
    var template =
      config.message ||
      'Limite de {{max}} unidades deste produto por pedido.';
    return String(template).replace(/\{\{\s*max\s*\}\}/gi, String(max));
  }

  function formatClampMessage(added, max) {
    return (
      formatMessage(max) +
      ' Adicionamos ' +
      added +
      (added === 1 ? ' unidade' : ' unidades') +
      '.'
    );
  }

  function cartUrl(path) {
    var root =
      (window.Shopify && window.Shopify.routes && window.Shopify.routes.root) ||
      (window.routes && window.routes.root) ||
      '/';
    if (root.slice(-1) !== '/') root += '/';
    return root + path.replace(/^\//, '');
  }

  function isCartMutateUrl(url) {
    if (!url) return null;
    var str = String(url);
    if (/\/cart\/add\.js/i.test(str)) return 'add';
    if (/\/cart\/change\.js/i.test(str)) return 'change';
    if (/\/cart\/update\.js/i.test(str)) return 'update';
    return null;
  }

  function refreshCartCache() {
    cartCache.loading = originalFetch(cartUrl('cart.js'), {
      credentials: 'same-origin',
      headers: { Accept: 'application/json' },
    })
      .then(function (res) {
        return res.json();
      })
      .then(function (cart) {
        cartCache.items = (cart && cart.items) || [];
        cartCache.loaded = true;
        cartCache.loading = null;
        return cartCache.items;
      })
      .catch(function () {
        cartCache.loading = null;
        return cartCache.items;
      });
    return cartCache.loading;
  }

  function ensureCart() {
    if (cartCache.loaded) return Promise.resolve(cartCache.items);
    if (cartCache.loading) return cartCache.loading;
    return refreshCartCache();
  }

  function qtyInCartForProduct(productId, items, excludeKey) {
    var total = 0;
    var pid = String(productId);
    for (var i = 0; i < items.length; i++) {
      var item = items[i];
      if (excludeKey && item.key === excludeKey) continue;
      if (String(item.product_id) === pid) {
        total += parseInt(item.quantity, 10) || 0;
      }
    }
    return total;
  }

  function resolveProductId(variantId, items) {
    if (variantId == null || variantId === '') return null;
    var vid = String(variantId);
    if (config.variantToProduct && config.variantToProduct[vid] != null) {
      return String(config.variantToProduct[vid]);
    }
    for (var i = 0; i < items.length; i++) {
      if (String(items[i].variant_id) === vid || String(items[i].id) === vid) {
        return String(items[i].product_id);
      }
    }
    return null;
  }

  function findLine(items, idOrKey) {
    if (idOrKey == null || idOrKey === '') return null;
    var token = String(idOrKey);
    for (var i = 0; i < items.length; i++) {
      var item = items[i];
      if (item.key === token) return item;
      if (String(item.variant_id) === token) return item;
      if (String(item.id) === token) return item;
      if (String(item.product_id) === token) return item;
    }
    return null;
  }

  function getMax(productId) {
    if (productId == null) return null;
    var max = config.limits[productId];
    if (max == null) max = config.limits[String(productId)];
    if (max == null) return null;
    max = parseInt(max, 10);
    return isNaN(max) || max < 1 ? null : max;
  }

  function parseBody(body) {
    if (body == null || body === '') return {};
    if (typeof FormData !== 'undefined' && body instanceof FormData) {
      var data = {};
      body.forEach(function (value, key) {
        data[key] = value;
      });
      return data;
    }
    if (typeof URLSearchParams !== 'undefined' && body instanceof URLSearchParams) {
      var params = {};
      body.forEach(function (value, key) {
        params[key] = value;
      });
      return params;
    }
    if (typeof body === 'string') {
      var trimmed = body.trim();
      if (!trimmed) return {};
      if (trimmed.charAt(0) === '{' || trimmed.charAt(0) === '[') {
        try {
          return JSON.parse(trimmed);
        } catch (e) {
          return {};
        }
      }
      var out = {};
      trimmed.split('&').forEach(function (pair) {
        var parts = pair.split('=');
        if (parts.length >= 2) {
          out[decodeURIComponent(parts[0])] = decodeURIComponent(
            parts.slice(1).join('=').replace(/\+/g, ' ')
          );
        }
      });
      return out;
    }
    if (typeof body === 'object') return body;
    return {};
  }

  function clonePayload(payload) {
    try {
      return JSON.parse(JSON.stringify(payload));
    } catch (e) {
      return payload;
    }
  }

  function rebuildBody(originalBody, payload) {
    if (typeof FormData !== 'undefined' && originalBody instanceof FormData) {
      var fd = new FormData();
      originalBody.forEach(function (value, key) {
        if (key === 'quantity' || key === 'id') return;
        fd.append(key, value);
      });
      if (payload.id != null) fd.append('id', payload.id);
      if (payload.quantity != null) fd.append('quantity', payload.quantity);
      else if (originalBody.get('quantity') != null) fd.append('quantity', originalBody.get('quantity'));
      return fd;
    }

    if (typeof originalBody === 'string') {
      var trimmed = originalBody.trim();
      if (trimmed.charAt(0) === '{' || trimmed.charAt(0) === '[') {
        return JSON.stringify(payload);
      }
      var params = new URLSearchParams();
      Object.keys(payload).forEach(function (key) {
        if (key === 'items' || key === 'updates') return;
        if (payload[key] != null) params.set(key, payload[key]);
      });
      return params.toString();
    }

    if (typeof URLSearchParams !== 'undefined' && originalBody instanceof URLSearchParams) {
      var usp = new URLSearchParams();
      Object.keys(payload).forEach(function (key) {
        if (key === 'items' || key === 'updates') return;
        if (payload[key] != null) usp.set(key, payload[key]);
      });
      return usp;
    }

    return JSON.stringify(payload);
  }

  function rebuildJQueryData(originalData, payload) {
    if (typeof originalData === 'string') {
      return rebuildBody(originalData, payload);
    }
    if (originalData && typeof originalData === 'object') {
      return payload;
    }
    return payload;
  }

  /**
   * @returns {{ blocked?: boolean, clamped?: boolean, message?: string, payload?: object }}
   */
  function enforceLimits(action, payload, items) {
    try {
      var next = clonePayload(payload);
      var clamped = false;
      var clampMsg = '';
      var blockedMsg = '';

      if (action === 'add') {
        var isItemsArray = Array.isArray(next.items);
        var addItems = isItemsArray
          ? next.items
          : next.id != null
            ? [{ id: next.id, quantity: next.quantity || 1 }]
            : null;

        if (!addItems) return { payload: next };

        var runningExtra = {};
        var kept = [];

        for (var i = 0; i < addItems.length; i++) {
          var row = addItems[i] || {};
          var variantId = row.id;
          var qty = parseInt(row.quantity, 10);
          if (isNaN(qty) || qty < 1) qty = 1;

          var productId = resolveProductId(variantId, items);
          var max = getMax(productId);

          if (!max) {
            kept.push({ id: variantId, quantity: qty });
            continue;
          }

          var inCart = qtyInCartForProduct(productId, items);
          var alreadyQueued = runningExtra[productId] || 0;
          var remaining = max - inCart - alreadyQueued;

          if (remaining <= 0) {
            clamped = true;
            blockedMsg = formatMessage(max);
            continue;
          }

          if (qty > remaining) {
            clamped = true;
            qty = remaining;
            clampMsg = formatClampMessage(qty, max);
          }

          runningExtra[productId] = alreadyQueued + qty;
          kept.push({ id: variantId, quantity: qty });
        }

        if (!kept.length) {
          return { blocked: true, message: blockedMsg || formatMessage(1) };
        }

        if (isItemsArray) {
          next.items = kept;
        } else {
          next.id = kept[0].id;
          next.quantity = kept[0].quantity;
        }

        return {
          payload: next,
          clamped: clamped,
          message: clampMsg || (clamped ? blockedMsg : ''),
        };
      }

      if (action === 'change') {
        var changeQty = parseInt(next.quantity, 10);
        if (isNaN(changeQty)) return { payload: next };
        if (changeQty <= 0) return { payload: next };

        var line =
          findLine(items, next.id) ||
          (next.line != null ? items[parseInt(next.line, 10) - 1] : null);
        if (!line) return { payload: next };

        var productIdChange = String(line.product_id);
        var maxChange = getMax(productIdChange);
        if (!maxChange) return { payload: next };

        var others = qtyInCartForProduct(productIdChange, items, line.key);
        var allowed = maxChange - others;
        if (allowed < 0) allowed = 0;

        if (changeQty > allowed) {
          if (allowed <= 0) {
            return { blocked: true, message: formatMessage(maxChange) };
          }
          next.quantity = allowed;
          return {
            payload: next,
            clamped: true,
            message: formatMessage(maxChange),
          };
        }
        return { payload: next };
      }

      if (action === 'update') {
        var updates = next.updates;
        if (!updates || typeof updates !== 'object') return { payload: next };

        var simulated = items.map(function (item) {
          return {
            key: item.key,
            product_id: item.product_id,
            variant_id: item.variant_id,
            id: item.id,
            quantity: item.quantity,
          };
        });

        Object.keys(updates).forEach(function (token) {
          var newQty = parseInt(updates[token], 10);
          if (isNaN(newQty)) return;
          var target = findLine(simulated, token);
          if (target) {
            target.quantity = newQty;
          }
        });

        for (var l = 0; l < limitKeys.length; l++) {
          var limitedPid = limitKeys[l];
          var maxUpdate = getMax(limitedPid);
          if (!maxUpdate) continue;

          var linesOfProduct = simulated.filter(function (item) {
            return String(item.product_id) === String(limitedPid);
          });
          var total = 0;
          linesOfProduct.forEach(function (item) {
            total += parseInt(item.quantity, 10) || 0;
          });

          if (total <= maxUpdate) continue;

          clamped = true;
          clampMsg = formatMessage(maxUpdate);

          var overflow = total - maxUpdate;
          for (var x = linesOfProduct.length - 1; x >= 0 && overflow > 0; x--) {
            var lineItem = linesOfProduct[x];
            var q = parseInt(lineItem.quantity, 10) || 0;
            var reduce = Math.min(q, overflow);
            lineItem.quantity = q - reduce;
            overflow -= reduce;

            var updateKey = null;
            Object.keys(updates).forEach(function (token) {
              if (updateKey) return;
              if (
                token === lineItem.key ||
                String(token) === String(lineItem.variant_id) ||
                String(token) === String(lineItem.id)
              ) {
                updateKey = token;
              }
            });
            if (updateKey) {
              updates[updateKey] = lineItem.quantity;
            }
          }
        }

        next.updates = updates;
        return {
          payload: next,
          clamped: clamped,
          message: clampMsg,
        };
      }
    } catch (err) {
      return { payload: payload };
    }
    return { payload: payload };
  }

  function blockedJsonResponse(message) {
    var body = JSON.stringify({
      status: 422,
      message: 'Erro de carrinho',
      description: message,
    });
    return new Response(body, {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  // --- fetch ---
  window.fetch = function (input, init) {
    init = init || {};
    var url = typeof input === 'string' ? input : input && input.url;
    var action = isCartMutateUrl(url);
    if (!action) {
      return originalFetch(input, init);
    }

    var method = (init.method || (input && input.method) || 'GET').toUpperCase();
    if (method !== 'POST' && method !== 'PUT') {
      return originalFetch(input, init);
    }

    var body = init.body;
    if (body == null && typeof Request !== 'undefined' && input instanceof Request) {
      return originalFetch(input, init);
    }

    var payload = parseBody(body);

    return ensureCart()
      .then(function (items) {
        var result = enforceLimits(action, payload, items);
        if (result.blocked) {
          notify(result.message);
          return blockedJsonResponse(result.message);
        }

        var nextInit = init;
        if (result.clamped && result.payload) {
          notify(result.message);
          nextInit = {};
          for (var key in init) {
            if (Object.prototype.hasOwnProperty.call(init, key)) {
              nextInit[key] = init[key];
            }
          }
          nextInit.body = rebuildBody(body, result.payload);
        }

        return originalFetch(input, nextInit).then(function (response) {
          refreshCartCache();
          return response;
        });
      })
      .catch(function () {
        return originalFetch(input, init);
      });
  };

  // --- jQuery ---
  function patchJQuery($) {
    if (!$ || !$.ajaxPrefilter || $.hsCartQtyLimitsPatched) return;
    $.hsCartQtyLimitsPatched = true;

    $.ajaxPrefilter(function (options) {
      var action = isCartMutateUrl(options && options.url);
      if (!action) return;

      var originalBeforeSend = options.beforeSend;
      options.beforeSend = function (jqXHR, settings) {
        try {
          if (!cartCache.loaded) {
            ensureCart();
            if (typeof originalBeforeSend === 'function') {
              return originalBeforeSend.apply(this, arguments);
            }
            return;
          }

          var payload = parseBody(settings.data);
          var result = enforceLimits(action, payload, cartCache.items);

          if (result.blocked) {
            notify(result.message);
            options.error = function () {};
            options.success = function () {};
            try {
              jqXHR.abort();
            } catch (e) {}
            return false;
          }

          if (result.clamped && result.payload) {
            notify(result.message);
            settings.data = rebuildJQueryData(settings.data, result.payload);
            options.data = settings.data;
          }
        } catch (err) {
          // fail-open
        }
        if (typeof originalBeforeSend === 'function') {
          return originalBeforeSend.apply(this, arguments);
        }
      };

      var originalSuccess = options.success;
      options.success = function () {
        refreshCartCache();
        if (typeof originalSuccess === 'function') {
          return originalSuccess.apply(this, arguments);
        }
      };
    });
  }

  if (window.jQuery) {
    patchJQuery(window.jQuery);
  } else {
    document.addEventListener('DOMContentLoaded', function () {
      if (window.jQuery) patchJQuery(window.jQuery);
    });
  }

  document.addEventListener('cart-change', function () {
    refreshCartCache();
  });

  ensureCart();
})();
