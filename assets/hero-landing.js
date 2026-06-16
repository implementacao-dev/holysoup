(function() {
  let heroMainSwiper = null;
  let heroThumbsSwiper = null;
  
  function initHeroSwiper() {
    const heroMain = document.querySelector('.hero-gallery-main');
    const heroThumbs = document.querySelector('.hero-gallery-thumbs');
    
    if (!heroMain) return;
    
    if (heroMainSwiper) {
      heroMainSwiper.destroy(true, true);
      heroMainSwiper = null;
    }
    if (heroThumbsSwiper) {
      heroThumbsSwiper.destroy(true, true);
      heroThumbsSwiper = null;
    }
    
    const slides = heroMain.querySelectorAll('.swiper-slide');
    if (slides.length === 0) return;
    
    if (typeof Swiper === 'undefined') {
      setTimeout(initHeroSwiper, 100);
      return;
    }
    
    if (heroThumbs && slides.length > 1) {
      heroThumbsSwiper = new Swiper('.hero-gallery-thumbs', {
        spaceBetween: 12,
        slidesPerView: 'auto',
        direction: 'vertical',
        watchSlidesProgress: true,
        freeMode: true,
        slideToClickedSlide: true,
        watchOverflow: true,
        breakpoints: {
          0: {
            direction: 'horizontal',
            slidesPerView: 'auto',
          },
          991: {
            direction: 'vertical',
            slidesPerView: 'auto',
          }
        }
      });
    }
    
    heroMainSwiper = new Swiper('.hero-gallery-main', {
      slidesPerView: 1,
      spaceBetween: 0,
      thumbs: heroThumbsSwiper ? {
        swiper: heroThumbsSwiper
      } : undefined,
      zoom: true,
      observer: true,
      observeParents: true
    });
  }
  
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() {
      setTimeout(initHeroSwiper, 100);
    });
  } else {
    setTimeout(initHeroSwiper, 100);
  }
  
  if (typeof Swiper === 'undefined') {
    window.addEventListener('load', function() {
      setTimeout(initHeroSwiper, 200);
    });
  }
  
  if (typeof Shopify !== 'undefined' && Shopify.designMode) {
    document.addEventListener('shopify:section:load', function(event) {
      if (event.detail.sectionId && document.querySelector('.hero-gallery-main')) {
        setTimeout(initHeroSwiper, 100);
      }
    });
  }
})();
