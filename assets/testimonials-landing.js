(function() {
  let testimonialsSwiperInstance = null;
  let videosSwiperInstance = null;
  
  function initTestimonialsSwiper() {
    const testimonialsCarousel = document.querySelector('.testimonials-carousel');
    if (!testimonialsCarousel) return;
    
    // Destroy existing instance if any
    if (testimonialsSwiperInstance) {
      testimonialsSwiperInstance.destroy(true, true);
      testimonialsSwiperInstance = null;
    }
    
    const slides = testimonialsCarousel.querySelectorAll('.swiper-slide');
    if (slides.length === 0) return;
    
    // Wait for Swiper to be available
    if (typeof Swiper === 'undefined') {
      setTimeout(initTestimonialsSwiper, 100);
      return;
    }
    
    testimonialsSwiperInstance = new Swiper('.testimonials-carousel', {
      slidesPerView: 1,
      spaceBetween: 15,
      autoplay: {
        delay: 5000,
        disableOnInteraction: false,
      },
      breakpoints: {
        0: {
          slidesPerView: 1,
          spaceBetween: 15,
        },
        991: {
          slidesPerView: 2,
          spaceBetween: 15,
        }
      },
      watchOverflow: true,
      observer: true,
      observeParents: true
    });
  }
  
  function initVideosSwiper() {
    const videosCarousel = document.querySelector('.testimonials-videos-carousel');
    if (!videosCarousel) return;
    
    // Destroy existing instance if any
    if (videosSwiperInstance) {
      videosSwiperInstance.destroy(true, true);
      videosSwiperInstance = null;
    }
    
    const slides = videosCarousel.querySelectorAll('.swiper-slide');
    if (slides.length === 0) return;
    
    // Wait for Swiper to be available
    if (typeof Swiper === 'undefined') {
      setTimeout(initVideosSwiper, 100);
      return;
    }
    
    videosSwiperInstance = new Swiper('.testimonials-videos-carousel', {
      slidesPerView: 1,
      spaceBetween: 0,
      pagination: {
        el: '.testimonials-videos-carousel .swiper-pagination',
        clickable: true,
      },
      navigation: {
        nextEl: '.testimonials-videos-nav-next',
        prevEl: '.testimonials-videos-nav-prev',
        disabledClass: 'swiper-button-disabled',
      },
      watchOverflow: true,
      observer: true,
      observeParents: true,
      on: {
        slideChange: function() {
          // Sync lightbox swiper when thumbnail swiper changes
          if (videoLightboxSwiperInstance && this.activeIndex !== videoLightboxSwiperInstance.activeIndex) {
            videoLightboxSwiperInstance.slideTo(this.activeIndex, 0);
          }
        }
      }
    });
  }

  function initVideoControls() {
    // Play button click - open lightbox
    document.addEventListener('click', function(e) {
      const playBtn = e.target.closest('.testimonials-video-play-btn');
      if (playBtn) {
        e.preventDefault();
        e.stopPropagation();
        const videoIndex = parseInt(playBtn.getAttribute('data-video-index')) || 0;
        openVideoLightbox(videoIndex);
      }
      
      // Fullscreen button click - open lightbox
      const fullscreenBtn = e.target.closest('.testimonials-video-fullscreen-btn');
      if (fullscreenBtn) {
        e.preventDefault();
        e.stopPropagation();
        const videoIndex = parseInt(fullscreenBtn.getAttribute('data-video-index')) || 0;
        openVideoLightbox(videoIndex);
      }
      
      // Thumbnail click - open lightbox
      const thumbnail = e.target.closest('.testimonials-video-thumbnail');
      if (thumbnail) {
        e.preventDefault();
        e.stopPropagation();
        const container = thumbnail.closest('.testimonials-video-container');
        if (container) {
          const slide = container.closest('.swiper-slide');
          if (slide) {
            const videoIndex = parseInt(slide.getAttribute('data-video-index')) || 0;
            openVideoLightbox(videoIndex);
          }
        }
      }
    });
  }

  let videoLightboxSwiperInstance = null;

  function initVideoLightboxSwiper() {
    const lightboxCarousel = document.querySelector('.testimonials-video-lightbox-carousel');
    if (!lightboxCarousel) return;

    if (videoLightboxSwiperInstance) {
      videoLightboxSwiperInstance.destroy(true, true);
      videoLightboxSwiperInstance = null;
    }

    if (typeof Swiper === 'undefined') {
      setTimeout(initVideoLightboxSwiper, 100);
      return;
    }

    videoLightboxSwiperInstance = new Swiper('.testimonials-video-lightbox-carousel', {
      slidesPerView: 1,
      spaceBetween: 0,
      navigation: {
        nextEl: '.testimonials-video-lightbox-nav-next',
        prevEl: '.testimonials-video-lightbox-nav-prev',
        disabledClass: 'swiper-button-disabled',
      },
      watchOverflow: true,
      observer: true,
      observeParents: true,
      on: {
        slideChange: function() {
          // Pause all videos
          const allVideos = document.querySelectorAll('.testimonials-video-lightbox-video');
          allVideos.forEach(video => {
            video.pause();
          });
          
          // Play the current active video
          const activeSlide = this.slides[this.activeIndex];
          if (activeSlide) {
            const video = activeSlide.querySelector('video');
            if (video) {
              video.muted = false;
              video.play().catch(err => {});
            }
          }
          
          // Sync thumbnail swiper
          if (videosSwiperInstance) {
            videosSwiperInstance.slideTo(this.activeIndex, 0);
          }
        }
      }
    });
  }

  function openVideoLightbox(slideIndex) {
    const lightbox = document.getElementById('testimonials-video-lightbox');
    if (!lightbox) return;

    lightbox.style.display = 'flex';
    document.body.style.overflow = 'hidden';

    // Initialize swiper if not already initialized
    if (!videoLightboxSwiperInstance) {
      initVideoLightboxSwiper();
    }

    // Wait for swiper to be ready, then slide to the correct video and play
    setTimeout(() => {
      if (videoLightboxSwiperInstance && slideIndex !== undefined) {
        videoLightboxSwiperInstance.slideTo(slideIndex, 0);
        // Play the video after sliding (with sound)
        setTimeout(() => {
          const activeSlide = videoLightboxSwiperInstance.slides[slideIndex];
          if (activeSlide) {
            const video = activeSlide.querySelector('video');
            if (video) {
              video.muted = false;
              video.play().catch(err => {});
            }
          }
        }, 300);
      }
    }, 100);
  }

  function closeVideoLightbox() {
    const lightbox = document.getElementById('testimonials-video-lightbox');
    if (!lightbox) return;

    // Pause all videos in lightbox
    const videos = lightbox.querySelectorAll('video');
    videos.forEach(v => {
      v.pause();
    });

    lightbox.style.display = 'none';
    document.body.style.overflow = '';
  }

  function initVideoLightboxControls() {
    const lightbox = document.getElementById('testimonials-video-lightbox');
    if (!lightbox) return;

    const overlay = lightbox.querySelector('.testimonials-video-lightbox-overlay');
    const closeBtns = lightbox.querySelectorAll('.testimonials-video-lightbox-close');

    if (overlay) {
      overlay.addEventListener('click', closeVideoLightbox);
    }

    if (closeBtns.length > 0) {
      closeBtns.forEach(btn => {
        btn.addEventListener('click', closeVideoLightbox);
      });
    }

    // Close on ESC key
    document.addEventListener('keydown', function(e) {
      if (e.key === 'Escape' && lightbox.style.display === 'flex') {
        closeVideoLightbox();
      }
    });
  }
  
  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() {
      setTimeout(initTestimonialsSwiper, 100);
      setTimeout(initVideosSwiper, 100);
      setTimeout(initVideoControls, 200);
      setTimeout(initVideoLightboxControls, 200);
    });
  } else {
    setTimeout(initTestimonialsSwiper, 100);
    setTimeout(initVideosSwiper, 100);
    setTimeout(initVideoControls, 200);
    setTimeout(initVideoLightboxControls, 200);
  }
  
  // Re-initialize if Swiper loads after DOM
  if (typeof Swiper === 'undefined') {
    window.addEventListener('load', function() {
      setTimeout(initTestimonialsSwiper, 200);
      setTimeout(initVideosSwiper, 200);
      setTimeout(initVideoControls, 300);
      setTimeout(initVideoLightboxControls, 300);
    });
  }
  
  // Re-initialize on section load (for Shopify theme editor)
  if (typeof Shopify !== 'undefined' && Shopify.designMode) {
    document.addEventListener('shopify:section:load', function(event) {
      if (event.detail.sectionId) {
        if (document.querySelector('.testimonials-carousel')) {
          setTimeout(initTestimonialsSwiper, 100);
        }
        if (document.querySelector('.testimonials-videos-carousel')) {
          setTimeout(initVideosSwiper, 100);
          setTimeout(initVideoControls, 200);
        }
      }
    });
  }
})();
