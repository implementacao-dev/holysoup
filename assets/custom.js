window.sliders = function () {
  var gap = 15;

  /*Slider Home*/
  var porVcsHome = new Swiper(".slide-home", {
    slidesPerView: 1,
    autoplay: {
      delay: 3000,
      disableOnInteraction: false,
    },
    pagination: {
      el: ".swiper-pagination",
      clickable: true,
    },
  });

  /*Destaques Home*/
  var porVcsHome = new Swiper(".slider-destaques-hs", {
    slidesPerView: "auto",
    spaceBetween: gap,
    speed: 7000,
    freeMode: true,
    loop: true,
    autoplay: {
      delay: 0,
      disableOnInteraction: false,
    },
  });

  /*Destaques Home*/
  var featureProduct = new Swiper(".features-holy", {
    slidesPerView: "auto",
    slidesPerGroup: 1,
    loop: false,
    loopedSlides: 1,
    centeredSlides: false,
    loopAdditionalSlides: 3,
    initialSlide: 0,
    rewind: true,
    cssMode: true,
    autoplay: {
      delay: 3000,
      disableOnInteraction: false,
    },
    // loopedSlides: 1,
    // edgeSwipeDetection: 'prevent',
    // rewind: true,
    // autoplay: {
    //   delay: 2500,
    //   disableOnInteraction: true
    // },
    //loopAdditionalSlides: 3,
    //initialSlide: 0,
    spaceBetween: gap,
  });

  // var featureProduct = new Swiper(".features-holy", {
  //   slidesPerView: "auto",
  //   centeredSlides: true,
  //   loop: true,
  //   loopedSlides: 1,
  //   autoplay: {
  //     delay: 2500,
  //     disableOnInteraction: true
  //   },
  //   //freeMode: true,
  //   spaceBetween: gap
  // });

  /*Features Home*/
  var featuresHome = new Swiper(".slider-features-hs", {
    centerInsufficientSlides: true,
    slidesPerView: "auto",
    spaceBetween: gap,
    freeMode: true,
    pagination: {
      el: ".swiper-pagination",
      clickable: true,
    },
  });

  /*Influencers Home*/
  var InfluencersHome = new Swiper(".slider-influencers-hs", {
    slidesPerView: "auto",
    spaceBetween: gap,
    freeMode: true,
    pagination: {
      el: ".swiper-pagination",
      clickable: true,
    },
  });

  /*Persona Home*/
  window.featuresHome = new Swiper(".slider-persona-hs", {
    slidesPerView: "auto",
    spaceBetween: gap,
    freeMode: true,
    centerInsufficientSlides: true,
    pagination: {
      el: ".swiper-pagination",
      clickable: true,
    },
  });

  /*Blog Home*/
  var blogHome = new Swiper(".slider-blog-hs", {
    slidesPerView: "auto",
    spaceBetween: gap,
    freeMode: true,
    pagination: {
      el: ".swiper-pagination",
      clickable: true,
    },
  });

  /*Blog Holymac*/
  var blogHolymac = new Swiper(".slider-blog-holymac", {
    slidesPerView: "auto",
    spaceBetween: gap,
    watchSlidesProgress: true,
    navigation: {
      nextEl: ".swiper-button-next",
      prevEl: ".swiper-button-prev",
    },
    pagination: {
      el: ".swiper-pagination",
      clickable: true,
    },
    breakpoints: {
      640: {
        slidesPerView: 2,
      },
      768: {
        slidesPerView: 4,
      },
    },
  });

  /*Video slider*/
  window.playVideoInSlide = function (index) {
    var activeSlide = $(".video-slider .swiper-slide").eq(index);
    var videoElement = activeSlide.find("video")[0];

    if (videoElement) {
      videoElement.play();
    }
  };

  window.pauseVideoInSlide = function (index) {
    var prevSlide = $(".video-slider .swiper-slide").eq(index);
    var videoElement = prevSlide.find("video")[0];

    if (videoElement) {
      videoElement.pause();
      videoElement.currentTime = 0; // Reinicia o vídeo para o início
    }
  };

  // window.videoSliderHome = new Swiper(".video-slider", {
  //   slidesPerView: 1,
  //   spaceBetween: gap,
  //   pagination: {
  //     el: ".swiper-pagination",
  //     clickable: true
  //   },
  //   navigation: {
  //     nextEl: ".video-slider .swiper-button-next",
  //     prevEl: ".video-slider .swiper-button-prev",
  //   },
  //   on: {
  //     init: function() {
  //       window.playVideoInSlide(this.activeIndex); // Reproduz o vídeo no slide ativo inicial
  //       // Adicionar ouvinte de evento "ended" para avançar para o próximo slide
  //       const video = this.slides[this.activeIndex].querySelector("video");
  //       video.addEventListener("ended", () => {
  //         this.slideNext();
  //         if (this.isEnd) {
  //           $('.video-reel-influencer').hide();
  //         }
  //       });
  //     },
  //     slideChangeTransitionStart: function() {
  //       console.log("Anterior ", this.previousIndex)
  //       window.pauseVideoInSlide(this.previousIndex); // Pausa o vídeo no slide anterior
  //     },
  //     slideChangeTransitionEnd: function() {
  //       console.log("Atual transition ", this.activeIndex)
  //       window.playVideoInSlide(this.activeIndex); // Reproduz o vídeo no novo slide ativo
  //     }
  //   }
  // });

  $("[data-mute]").click(function () {
    var mute = $(this).data("mute");
    var mutedIcon = $(this).find(".muted");
    var audioIcon = $(this).find(".audio");

    var prevSlide = $(".video-reel-influencer").find(".swiper-slide-active");
    var videoElement = prevSlide.find("video");

    if (mute == "disabled") {
      mutedIcon.show();
      audioIcon.hide();
      $(this).data("mute", "muted");
      if (videoElement) {
        videoElement.prop("muted", true);
      }
    } else {
      mutedIcon.hide();
      audioIcon.show();
      $(this).data("mute", "disabled");
      if (videoElement) {
        videoElement.prop("muted", false);
      }
    }
  });

  $("[data-pause]").click(function () {
    var pauseState = $(this).data("pause");
    var pauseIcon = $(this).find(".pausevideo");
    var playIcon = $(this).find(".playvideo");

    var prevSlide = $(".video-reel-influencer").find(".swiper-slide-active");
    var videoElement = prevSlide.find("video")[0];

    if (pauseState == "played") {
      playIcon.show();
      pauseIcon.hide();
      $(this).data("pause", "paused");
      if (videoElement) {
        videoElement.pause();
      }
    } else {
      playIcon.hide();
      pauseIcon.show();
      $(this).data("pause", "played");
      if (videoElement) {
        videoElement.play();
      }
    }
  });

  /*Por vocês Home*/
  var porVcsHome = new Swiper(".slider-porvc-hs", {
    slidesPerView: "auto",
    spaceBetween: gap,
    freeMode: true,
    centerInsufficientSlides: true,
    pagination: {
      el: ".swiper-pagination",
      clickable: true,
    },
  });

  /*Nutri home*/
  var nutriHome = new Swiper(".slider-nutris-hs", {
    slidesPerView: "auto",
    spaceBetween: gap,
    freeMode: true,
    centerInsufficientSlides: true,
    pagination: {
      el: ".swiper-pagination",
      clickable: true,
    },
  });

  /*Promos home*/
  var promosHome = new Swiper(".slider-promos", {
    slidesPerView: "auto",
    spaceBetween: gap,
    freeMode: true,
    rewind: true,
    centerInsufficientSlides: true,
    autoplay: {
      delay: 3000,
      disableOnInteraction: false,
    },
    pagination: {
      el: ".swiper-pagination",
      clickable: true,
    },
  });

  /*Sabores home*/
  window.saboresHome = new Swiper(".slider-sabores-hs", {
    slidesPerView: "auto",
    spaceBetween: 25,
    freeMode: true,
    pagination: {
      el: ".swiper-pagination",
      clickable: true,
    },
  });

  /*Card Carousel*/
  new Swiper(".slider-cards", {
    slidesPerView: "auto",
    loop: true,
    spaceBetween: 10,
    speed: 7000,
    freeMode: true,
    centerInsufficientSlides: true,
    autoplay: {
      delay: 0,
      disableOnInteraction: false,
    },
    pagination: {
      el: ".swiper-pagination",
      clickable: true,
    },
  });

  /*Review Carousel*/
  new Swiper(".review-carousel", {
    slidesPerView: "auto",
    spaceBetween: 22,
    freeMode: true,
    navigation: {
      nextEl: ".swiper-button-next",
      prevEl: ".swiper-button-prev",
    },
  });

  /*Product Carousel*/
  new Swiper(".product-carousel", {
    slidesPerView: "auto",
    spaceBetween: 10,
    pagination: {
      el: ".swiper-pagination",
      clickable: true,
    },
    navigation: {
      nextEl: ".swiper-button-next",
      prevEl: ".swiper-button-prev",
    },
    breakpoints: {
      768: {
        spaceBetween: 20,
      },
    },
  });

  /*Product Carousel V2*/
  new Swiper(".product-carousel-v2", {
    slidesPerView: "auto",
    spaceBetween: 16,
    centerInsufficientSlides: true,
    pagination: {
      el: ".swiper-pagination",
      clickable: true,
    },
  });

  /*Image Grid*/
  new Swiper(".image-grid-slider", {
    slidesPerView: 1,
    spaceBetween: 10,
    centerInsufficientSlides: true,
    enabled: true,
    pagination: {
      el: ".swiper-pagination",
      clickable: true,
    },
    breakpoints: {
      768: {
        enabled: false,
      },
    },
    navigation: {
      nextEl: ".swiper-button-next",
      prevEl: ".swiper-button-prev",
    },
  });

  /*Image Grid V2*/
  new Swiper(".image-grid-slider-v2", {
    slidesPerView: 1.25,
    spaceBetween: 10,
    enabled: true,
    breakpoints: {
      1024: {
        enabled: false,
      },
    },
  });

  /*Image Grid V3*/
  new Swiper(".image-grid-slider-v3", {
    slidesPerView: 1.25,
    spaceBetween: 10,
    enabled: true,
    breakpoints: {
      1024: {
        enabled: false,
      },
    },
  });

  window.updateSlider = function () {
    promosHome.update();
    saboresHome.update();
  };

  window.gotoSabor = function (translate) {
    saboresHome.setTranslate(translate);
  };

  /*Slide produtos*/
  window.sliderThumb = new Swiper(".product-slide-thumbs", {
    loop: true,
    direction: "vertical",
    spaceBetween: 10,
    slidesPerView: 3,
    freeMode: true,
  });

  /*Onde encontrar*/
  var ondeEncontrar = new Swiper(".onde-encontrar", {
    slidesPerView: "auto",
    spaceBetween: gap,
    freeMode: true,
    pagination: {
      el: ".swiper-pagination",
      clickable: true,
    },
  });

  window.sliderProduct = new Swiper(".product-slide-photo", {
    loop: true,
    slidesPerView: 1,
    spaceBetween: 10,
    pagination: {
      el: ".swiper-pagination",
      clickable: true,
    },
    thumbs: {
      swiper: window.sliderThumb,
    },
  });

  /*Slide produtos*/
  window.sliderThumbSonhos = new Swiper(".product-slide-thumbs-sonhos", {
    loop: true,
    direction: "horizontal",
    spaceBetween: 10,
    slidesPerView: 3,
    breakpoints: {
      1024: {
        direction: "vertical",
      },
    },
  });

  window.sliderProductSonhos = new Swiper(".product-slide-photo-sonhos", {
    loop: true,
    slidesPerView: 1,
    spaceBetween: 10,
    pagination: {
      el: ".swiper-pagination",
      clickable: true,
    },
    thumbs: {
      autoScrollOffset: 1,
      swiper: window.sliderThumbSonhos,
    },
  });
};

$(document).ready(function () {
  $(document).on("click", "[data-open-persona]", function (e) {
    e.preventDefault();
    var target = $(this).data("open-persona");
    var index = $(this).data("index");
    $(target).addClass("open-description");
    setTimeout(function () {
      $(target).addClass("end-animation");
    }, 1000);
    window.featuresHome.slideTo(index);
  });
  $(document).on("click", "[data-open-features]", function (e) {
    e.preventDefault();
    var target = $(this).data("open-features");
    var index = $(this).data("index");
    $(target).addClass("open-description");
    setTimeout(function () {
      $(target).addClass("end-animation");
    }, 1000);
    //window.updateSlider()
  });

  $(document).on("click", "[data-open-sabor-mobile]", function (e) {
    e.preventDefault();
    var target = $(this).closest(".slider-sabores-hs");
    var index = $(this).data("index");
    target.addClass("open-description-sabor");
    setTimeout(function () {
      target.addClass("end-animation");
    }, 200);
    window.saboresHome.slideTo(index);
    //window.updateSlider()
  });
  $(document).on(
    "click",
    ".open-description-sabor .header-cart-open",
    function (e) {
      e.preventDefault();
      $(".slider-sabores-hs").removeClass("end-animation");
      setTimeout(function () {
        $(".slider-sabores-hs").removeClass("open-description-sabor");
      }, 200);
      // setTimeout(function(){$(this)}, 1000);
    },
  );

  $(document).on("click", "[data-open-sabor-desk]", function (e) {
    e.preventDefault();
    var index = $(this).data("index");
    $(".flip-card-sabor").removeClass("opened");
    $(this).closest(".flip-card-sabor").addClass("opened");
    setTimeout(function () {
      window.saboresHome.update();
    }, 300);
    window.saboresHome.slideTo(index);
    //window.updateSlider()
  });

  $(document).on("click", ".open-description", function (e) {
    e.preventDefault();
    $(this).removeClass("open-description").removeClass("end-animation");
    target.find("[data-open]").show();
  });

  $(".btn-quantity").on("click", function () {
    if ($(this).hasClass("new-quantity")) {
      return;
    }
    var inputElement = $(this).siblings(".qtd-input");
    var currentValue = parseInt(inputElement.val());
    var maxInventory = parseInt(inputElement.attr("data-inventory"));

    if ($(this).hasClass("plus")) {
      if (currentValue < maxInventory) {
        inputElement.val(currentValue + 1).trigger("change");
      }
    } else if ($(this).hasClass("minus")) {
      if (currentValue > 0) {
        inputElement.val(currentValue - 1).trigger("change");
      }
    }
  });

  $(".qtd-input").on("change", function () {
    var inputValue = parseInt($(this).val());
    var maxInventory = parseInt($(this).attr("data-inventory"));

    if (inputValue < 0) {
      $(this).val(0);
    } else if (inputValue > maxInventory) {
      $(this).val(maxInventory).trigger("change");
    }
  });

  function addClartHs(data) {
    if (data.items.length > 0) {
      fetch(window.Shopify.routes.root + "cart/add.js", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      })
        .then((response) => {
          window.updateCart();
        })
        .catch((error) => {
          console.error("Error:", error);
        });
    }
  }

  $(".cart-sabor-open [add-to-cart-card]").click(function () {
    var containerAddCard = $(this).closest(".footer-card");
    var inputQtd = containerAddCard.find(".qtd-input");
    var items = [];

    inputQtd.each(function () {
      var qtd = $(this).val();
      var id = inputQtd.data("variantid");
      var item = {};
      if (qtd > 0) {
        item["id"] = id;
        item["quantity"] = qtd;
        items.push(item);
      }
    });
    var data = {};
    data.items = items;

    addClartHs(data);
  });

  $(".action-mix [add-to-cart-card]").click(function () {
    var containerAddCard = $(this).closest(".action-mix");
    var inputQtd = containerAddCard.find(".qtd-input");
    var items = [];

    inputQtd.each(function () {
      var qtd = $(this).val();
      var id = inputQtd.data("variantid");
      var item = {};
      if (qtd > 0) {
        item["id"] = id;
        item["quantity"] = qtd;
        items.push(item);
      }
    });
    var data = {};
    data.items = items;

    addClartHs(data);
  });

  $(".template-collection .product [add-to-cart-card]").click(function () {
    var containerAddCard = $(this).closest(".footer-card");
    var inputQtd = containerAddCard.find(".qtd-input");
    var items = [];

    inputQtd.each(function () {
      var qtd = $(this).val();
      var id = $(this).data("variantid");
      var multiply = $(this).data("multiply");
      qtd = multiply * qtd;
      var item = {};
      if (qtd > 0) {
        item["id"] = id;
        item["quantity"] = qtd;
        items.push(item);
      }
    });
    var data = {};
    data.items = items;

    addClartHs(data);
  });

  $(".menu_open").on("click", function (e) {
    if (
      !$(e.target).closest("#navigation-mobile").length &&
      !$(e.target).hasClass("mobileMenu-toggle") &&
      !$(e.target).closest("#shipping-mobile").length
    ) {
      console.log(event.target.classList);
      $("body").removeClass("menu_open");
    }
  });

  let searchParams = new URLSearchParams(window.location.search);
  var cartOpen = searchParams.has("cart_show");

  if (cartOpen) {
    window.updateCart();
  }

  $("[data-progress]").click(function () {
    var target = $(this).data("progress");

    if (!$(target).hasClass("open-progress")) {
      $("[data-progress]").removeClass("opened");
      $(".progress-promotion-cart").removeClass("open-progress").hide();
      $(".container-promotions-cart").show();
      $(this).addClass("opened");
    } else {
      $(".container-promotions-cart").hide();
      $(this).removeClass("opened");
    }
    $(target).toggle().toggleClass("open-progress");
  });

  /*
  var rastreioOpen = $(
    '[href="/pages/rastrear-pedido"], [href="/pages/rastreie-seu-pedido"]'
  );

  rastreioOpen.off("click").on("click", (event) => {
    event.preventDefault();
    console.log("Clicado");
    $("body").toggleClass("rastreio_open");
  });

  $("body").on("click", ".background-overlay", (event) => {
    $("body").removeClass("rastreio_open auth-sidebar-register-show");
  });*/

  // $('.auth-sidebar-show-inline').click(function(event){
  //   console.log("Era pra fechar")
  //   if(!$(e.target).closest('#halo-auth-sidebar').length && !$(e.target).closest('#navigation-mobile').length){
  //   console.log("Fechou")
  //     $('body').removeClass('auth-sidebar-show-inline');
  //   }
  // })

  $("[data-remove-sidebar]").click(function (event) {
    console.log($(this));
    var target = $(this).attr("data-remove-sidebar");
    console.log(target);
    $("body").removeClass(target);
  });

  /*$("[login-inline-menu]").click(function (event) {
    event.preventDefault();
    console.log("Clicado");
    $("body").addClass("auth-sidebar-show");
  });
*/
  $("[register-inline-menu]").click(function (event) {
    event.preventDefault();
    $("body").addClass("auth-sidebar-register-show");
  });

  $("[submit-form]").click(function (event) {
    console.log("testtttt");
    event.preventDefault();
    var target = $(this).attr("submit-form");
    $(target).submit();
  });

  $("[open-whatsapp]").click(function (e) {
    e.preventDefault();
    window.open("http://wa.me/551140038025");
  });

  $(".buy-btn-card, [add-kit-sopa]").click(function (e) {
    e.preventDefault();
    setTimeout(() => {
      $.ajax({
        url: location.href,
        success: function (data) {
          $("#sidecartContent").html($(data).find("#sidecartContent").html());
        },
      });
    }, 1000);
    setTimeout(() => {
      $(".cart-icon-bubble")[0].click();
    }, 1500);
  });

  /*$(".side-bar-overlay").click(function (e) {
    e.preventDefault();
    $('html').css('overflowY', 'auto')
  });*/

  if (window.location.href.toLowerCase().includes("/products/assinatura")) {
    window.location.href = "/pages/assinatura";
  }
});

window.onload = function () {
  if (window.location.href.toLowerCase().includes("/products/assinatura")) {
    window.location.href = "/pages/assinatura";
  }
};
