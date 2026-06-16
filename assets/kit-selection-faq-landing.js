(function() {
  function initFAQ() {
    // Use event delegation for FAQ functionality
    var faqsList = document.querySelector('.faqs-list');
    if (!faqsList) return;
    
    faqsList.addEventListener('click', function(e) {
      var question = e.target.closest('.faq-question');
      if (!question) return;
      
      e.preventDefault();
      e.stopPropagation();
      
      var faqItem = question.closest('.faq-item');
      if (!faqItem) return;
      
      var isActive = faqItem.classList.contains('active');
      
      // Fecha todas as outras FAQs primeiro
      document.querySelectorAll('.faq-item').forEach(function(item) {
        if (item !== faqItem) {
          item.classList.remove('active');
          var q = item.querySelector('.faq-question');
          if (q) q.setAttribute('aria-expanded', 'false');
        }
      });
      
      // Abre ou fecha a FAQ clicada
      if (isActive) {
        faqItem.classList.remove('active');
        question.setAttribute('aria-expanded', 'false');
      } else {
        faqItem.classList.add('active');
        question.setAttribute('aria-expanded', 'true');
      }
    });
  }
  
  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initFAQ);
  } else {
    initFAQ();
  }
  
  // Re-initialize on section load (for Shopify theme editor)
  if (typeof Shopify !== 'undefined' && Shopify.designMode) {
    document.addEventListener('shopify:section:load', function(event) {
      setTimeout(initFAQ, 100);
    });
  }
})();

// Add to cart or redirect functionality
(function() {
  function initAddToCart() {
    var addToCartButton = document.querySelector('.kit-add-to-cart-btn');
    
    if (!addToCartButton) return;
    addToCartButton.addEventListener('click', function() {
      if (this.disabled || this.classList.contains('is-loading')) return;
      
      // Get selected radio button
      var selectedRadio = document.querySelector('.kit-option-radio:checked');
      if (!selectedRadio) {
        alert('Por favor, selecione uma opção de kit.');
        return;
      }
      
      var actionType = addToCartButton.getAttribute('data-action-type') || 'add_to_cart';
      var action = selectedRadio.getAttribute('data-action');
      
      // If redirect to Yampi
      if (actionType === 'redirect_yampi' || action === 'redirect_yampi') {
        var yampiUrl = selectedRadio.getAttribute('data-yampi-url');
        if (yampiUrl) {
          window.location.href = yampiUrl;
        } else {
          alert('URL da Yampi não configurada para esta opção.');
        }
        return;
      }
      
      // If add to cart
      var variantId = selectedRadio.getAttribute('data-variant-id');
      var quantity = 1;

      if (!variantId) {
        alert('Produto não configurado para esta opção.');
        return;
      }
      
      this.classList.add('is-loading');
      var originalText = this.textContent;
      this.textContent = 'Adicionando...';
      
      var items = [{ id: parseInt(variantId), quantity: quantity }];
      var requestInProgress = true;
      
      if (typeof Alpine !== 'undefined' && Alpine.store('cart')) {
        Alpine.store('cart').addItems(items, { showCart: true })
          .then(function(response) {
            requestInProgress = false;
            
            // Check if response has an error status
            if (response && response.status !== undefined && response.status !== 200) {
              var errorMessage = response.message || response.description || 'Erro ao adicionar ao carrinho';
              addToCartButton.classList.remove('is-loading');
              addToCartButton.textContent = originalText;
              alert(errorMessage);
              return;
            }
            
            if (!response) {
              addToCartUsingFetch();
              return;
            }
            
            // Success - refresh cart and show sidecart
            Alpine.$dispatch('cart-change');
            Alpine.store('cart').fetchItems();
            addToCartButton.classList.remove('is-loading');
            addToCartButton.textContent = originalText;
            if (typeof Alpine !== 'undefined') {
              Alpine.$dispatch('show-cart');
            }
          })
          .catch(function(error) {
            requestInProgress = false;
            addToCartUsingFetch();
          });
      } else {
        addToCartUsingFetch();
      }
      
      function addToCartUsingFetch() {
        if (!requestInProgress) {
          requestInProgress = true;
        }
        
        fetch('/cart/add.js', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            items: items
          })
        })
        .then(function(response) {
          return response.json();
        })
        .then(function(data) {
          requestInProgress = false;
          
          if (data.status && data.status !== 200) {
            throw new Error(data.message || 'Erro ao adicionar ao carrinho');
          }
          
          addToCartButton.classList.remove('is-loading');
          addToCartButton.textContent = originalText;
          // Dispatch cart change event
          window.dispatchEvent(new CustomEvent('cart-change'));
          if (typeof Alpine !== 'undefined') {
            Alpine.$dispatch('cart-change');
            Alpine.$dispatch('show-cart');
            if (Alpine.store('cart')) {
              Alpine.store('cart').fetchItems();
            }
          }
          // Reload cart if needed
          if (typeof Shopify !== 'undefined' && typeof Shopify.getCart === 'function') {
            Shopify.getCart();
          }
        })
        .catch(function(error) {
          requestInProgress = false;
          addToCartButton.classList.remove('is-loading');
          addToCartButton.textContent = originalText;
          alert('Erro ao adicionar ao carrinho. Tente novamente.');
        });
      }
    });
  }
  
  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAddToCart);
  } else {
    initAddToCart();
  }
})();
