(function() {
  'use strict';

  function initHeaderLandingCart() {
    const cartIcon = document.querySelector('.header-landing [data-cart-sidebar]');
    
    if (!cartIcon) return;

    cartIcon.addEventListener('click', function(event) {
      event.preventDefault();
      event.stopPropagation();

      const isCartPage = document.body.classList.contains('template-cart');
      
      if (isCartPage) {
        window.scrollTo({
          top: 0,
          behavior: 'smooth'
        });
      } else {
        if (typeof Alpine !== 'undefined' && Alpine.$dispatch) {
          Alpine.$dispatch('show-cart', true);
          if (Alpine.$store && Alpine.$store.cart) {
            Alpine.$store.cart.fetchItems();
          }
        } else {
          window.dispatchEvent(new CustomEvent('show-cart', { detail: true }));
        }
      }
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initHeaderLandingCart);
  } else {
    initHeaderLandingCart();
  }
})();