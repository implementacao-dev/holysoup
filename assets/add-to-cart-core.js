/**
 * Add to Cart Core - Standalone function for product pages
 * Works without jQuery/Alpine dependencies
 */
(function() {
    'use strict';

    // Wait for DOM to be ready
    function initAddToCart() {
        const addToCartButtons = document.querySelectorAll('[data-btn-addToCart], [data-btn-addtocart]');
        
        if (addToCartButtons.length === 0) return;

        addToCartButtons.forEach(function(button) {
            // Skip if already has listener
            if (button.hasAttribute('data-atc-core-initialized')) return;
            button.setAttribute('data-atc-core-initialized', 'true');

            button.addEventListener('click', function(e) {
                // Prevent default if it's a link
                if (button.tagName === 'A') {
                    e.preventDefault();
                }

                const form = button.closest('form') || document.querySelector('[data-type="add-to-cart-form"]');
                if (!form) {
                    console.warn('Add to cart form not found');
                    return;
                }

                // Get variant ID from form
                const variantInput = form.querySelector('input[name="id"]');
                if (!variantInput) {
                    console.warn('Variant ID not found in form');
                    return;
                }
                const variantId = variantInput.value;

                // Check if available
                const isAvailable = button.dataset.available === 'true';
                const inventoryQuantity = parseInt(button.dataset.inventoryQuantity) || null;

                // If has inventory management and not available, check stock
                if (inventoryQuantity !== null && !isAvailable && inventoryQuantity <= 0) {
                    console.warn('Product out of stock');
                    return;
                }

                // Add loading state
                button.classList.add('is-loading');
                if (button.disabled !== undefined) {
                    button.disabled = true;
                }

                // Build form data
                const formData = new FormData(form);

                // Add properties if any
                const properties = form.querySelectorAll('input[name^="properties"]');
                properties.forEach(function(property) {
                    if (property.value != null && property.value !== '') {
                        if (property.type === 'file' && property.files[0]) {
                            formData.append(property.name, property.files[0]);
                        } else {
                            formData.append(property.name, property.value);
                        }
                    }
                });

                // Get routes - fallback if not defined yet
                const routesRoot = (window.Shopify && window.Shopify.routes && window.Shopify.routes.root) || '/';
                const addToCartUrl = routesRoot + 'cart/add.js';

                // Add to cart
                fetch(addToCartUrl, {
                    method: 'POST',
                    body: formData
                })
                .then(function(response) {
                    return response.json();
                })
                .then(function(data) {
                    // Dispatch custom event for integration
                    const event = new CustomEvent('atc-core:added', {
                        detail: {
                            variantId: variantId,
                            data: data
                        },
                        bubbles: true
                    });
                    document.dispatchEvent(event);

                    // Dispatch Alpine event if available
                    if (window.Alpine && typeof Alpine.$dispatch === 'function') {
                        try {
                            Alpine.$dispatch('cart-change');
                            Alpine.$dispatch('show-cart');
                        } catch(e) {
                            // Alpine not ready yet
                        }
                    }

                    // Redirect or update cart if configured
                    if (window.after_add_to_cart && window.after_add_to_cart.type === 'cart') {
                        const cartUrl = (window.routes && window.routes.cart) || '/cart';
                        window.location.href = cartUrl;
                        return;
                    }

                    // Update cart count if element exists
                    const cartCountEl = document.querySelector('[data-cart-count]');
                    if (cartCountEl && data.item_count !== undefined) {
                        cartCountEl.textContent = data.item_count;
                    }
                })
                .catch(function(error) {
                    console.error('Add to cart error:', error);
                    
                    // Dispatch error event
                    const errorEvent = new CustomEvent('atc-core:error', {
                        detail: {
                            variantId: variantId,
                            error: error
                        },
                        bubbles: true
                    });
                    document.dispatchEvent(errorEvent);
                })
                .finally(function() {
                    // Remove loading state
                    button.classList.remove('is-loading');
                    if (button.disabled !== undefined) {
                        button.disabled = false;
                    }
                });
            });
        });
    }

    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initAddToCart);
    } else {
        initAddToCart();
    }

    // Re-initialize for dynamically added buttons
    const observer = new MutationObserver(function(mutations) {
        const hasNewButtons = Array.from(mutations).some(function(mutation) {
            return Array.from(mutation.addedNodes || []).some(function(node) {
                return node.nodeType === 1 && (
                    node.hasAttribute && node.hasAttribute('data-btn-addToCart') ||
                    node.querySelector && node.querySelector('[data-btn-addToCart]')
                );
            });
        });
        if (hasNewButtons) {
            initAddToCart();
        }
    });

    if (document.body) {
        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
    }
})();
