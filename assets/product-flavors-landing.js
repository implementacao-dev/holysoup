(function() {
  let flavorsSwiperInstance = null;
  
  function initFlavorsSwiper() {
    const flavorsCarousel = document.querySelector('.product-flavors-carousel');
    if (!flavorsCarousel) return;
    
    if (flavorsSwiperInstance) {
      flavorsSwiperInstance.destroy(true, true);
      flavorsSwiperInstance = null;
    }
    
    const slides = flavorsCarousel.querySelectorAll('.swiper-slide');
    if (slides.length === 0) return;
    
    if (typeof Swiper === 'undefined') {
      setTimeout(initFlavorsSwiper, 100);
      return;
    }
    
    flavorsSwiperInstance = new Swiper('.product-flavors-carousel', {
      slidesPerView: 'auto',
      spaceBetween: 20,
      freeMode: true,
      centerInsufficientSlides: true,
      navigation: {
        nextEl: '.product-flavors-nav-next',
        prevEl: '.product-flavors-nav-prev',
        disabledClass: 'swiper-button-disabled',
      },
      breakpoints: {
        320: {
          slidesPerView: 'auto',
          spaceBetween: 15,
        },
        768: {
          slidesPerView: 'auto',
          spaceBetween: 20,
        },
        991: {
          slidesPerView: 'auto',
          spaceBetween: 24,
        },
        1280: {
          slidesPerView: 'auto',
          spaceBetween: 24,
        }
      },
      watchOverflow: true,
      observer: true,
      observeParents: true
    });
  }
  
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() {
      setTimeout(initFlavorsSwiper, 100);
    });
  } else {
    setTimeout(initFlavorsSwiper, 100);
  }
  
  if (typeof Swiper === 'undefined') {
    window.addEventListener('load', function() {
      setTimeout(initFlavorsSwiper, 200);
    });
  }
  
  if (typeof Shopify !== 'undefined' && Shopify.designMode) {
    document.addEventListener('shopify:section:load', function(event) {
      if (event.detail.sectionId && document.querySelector('.product-flavors-carousel')) {
        setTimeout(initFlavorsSwiper, 100);
      }
    });
  }

  let nutritionalTableSwiperInstance = null;

  function initNutritionalTablePopup() {
    const popup = document.getElementById('nutritional-table-popup');
    const overlay = popup ? popup.querySelector('.nutritional-table-popup-overlay') : null;
    const closeBtn = popup ? popup.querySelector('.nutritional-table-popup-close') : null;
    const carousel = popup ? popup.querySelector('.nutritional-table-popup-carousel') : null;

    if (!popup || !overlay || !closeBtn || !carousel) return;

    if (typeof Swiper === 'undefined') {
      setTimeout(initNutritionalTablePopup, 100);
      return;
    }

    if (!nutritionalTableSwiperInstance) {
      nutritionalTableSwiperInstance = new Swiper('.nutritional-table-popup-carousel', {
        slidesPerView: 1,
        spaceBetween: 0,
        centerInsufficientSlides: true,
        navigation: {
          nextEl: '.nutritional-table-popup-nav-next',
          prevEl: '.nutritional-table-popup-nav-prev',
          disabledClass: 'swiper-button-disabled',
        },
        watchOverflow: true,
        observer: true,
        observeParents: true,
      });
    }

    function openPopup(productHandle) {
      if (!productHandle || !nutritionalTableSwiperInstance) return;

      const slides = carousel.querySelectorAll('.swiper-slide');
      let targetIndex = 0;
      
      for (let i = 0; i < slides.length; i++) {
        const slide = slides[i];
        const slideProductHandle = slide.getAttribute('data-product-handle');
        if (slideProductHandle === productHandle) {
          targetIndex = i;
          break;
        }
      }

      nutritionalTableSwiperInstance.slideTo(targetIndex, 0);
      popup.style.display = 'flex';
      document.body.style.overflow = 'hidden';
    }

    function closePopup() {
      popup.style.display = 'none';
      document.body.style.overflow = '';
    }

    document.addEventListener('click', function(e) {
      if (e.target.closest('.product-flavor-table-btn')) {
        e.preventDefault();
        const button = e.target.closest('.product-flavor-table-btn');
        const productHandle = button.getAttribute('data-product-handle');
        if (productHandle) {
          openPopup(productHandle);
        }
      }
    });

    if (overlay) {
      overlay.addEventListener('click', closePopup);
    }

    if (closeBtn) {
      closeBtn.addEventListener('click', closePopup);
    }

    document.addEventListener('keydown', function(e) {
      if (e.key === 'Escape' && popup.style.display === 'flex') {
        closePopup();
      }
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initNutritionalTablePopup);
  } else {
    initNutritionalTablePopup();
  }

  if (typeof Shopify !== 'undefined' && Shopify.designMode) {
    document.addEventListener('shopify:section:load', function(event) {
      setTimeout(initNutritionalTablePopup, 100);
    });
  }
})();
