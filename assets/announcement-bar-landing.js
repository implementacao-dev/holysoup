document.addEventListener('DOMContentLoaded', function() {
  var couponWrappers = document.querySelectorAll('.announcement-coupon-wrapper');
  couponWrappers.forEach(function(wrapper) {
    wrapper.style.cursor = 'pointer';
    wrapper.addEventListener('click', function() {
      var couponCode = this.getAttribute('data-coupon-code');
      var couponText = wrapper.querySelector('.coupon-code');
      if (couponCode && couponText) {
        var originalText = couponText.textContent;
        navigator.clipboard.writeText(couponCode).then(function() {
          couponText.textContent = 'Copiado!';
          setTimeout(function() {
            couponText.textContent = originalText;
          }, 1500);
        }).catch(function(err) {});
      }
    });
  });
  
  var countdownElm = document.querySelector('[data-landing-countdown]');
  if (countdownElm) {
    var countdownType = countdownElm.getAttribute('data-countdown-type') || 'random';
    var page = 'announcement_countdown';
    var countDownDate;
    
    if (countdownType === 'custom') {
      var customDateStr = countdownElm.getAttribute('data-countdown-date');
      if (customDateStr) {
        var customDate = new Date(customDateStr);
        if (!isNaN(customDate.getTime())) {
          countDownDate = customDate.getTime();
        }
      }
    } else {
      var hour = (Math.random() * (3 - 1) + 1).toFixed(2);
      var savedDate = localStorage.getItem(page);
      if (savedDate && !isNaN(savedDate) && parseInt(savedDate) > new Date().getTime()) {
        countDownDate = parseInt(savedDate);
      } else {
        countDownDate = new Date().getTime() + (parseFloat(hour) * 60 * 60 * 1000);
        localStorage.setItem(page, countDownDate.toString());
      }
    }
    
    if (!countDownDate || isNaN(countDownDate)) {
      return;
    }
    
    var x = setInterval(function() {
      var now = new Date().getTime();
      var distance = countDownDate - now;
      
      if (distance < 0) {
        if (countdownType === 'custom') {
          clearInterval(x);
          distance = 0;
        } else {
          var hour = (Math.random() * (3 - 1) + 1).toFixed(2);
          countDownDate = new Date().getTime() + (parseFloat(hour) * 60 * 60 * 1000);
          localStorage.setItem(page, countDownDate.toString());
          distance = countDownDate - now;
        }
      }
      
      var days = 0;
      var hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      var minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
      var seconds = Math.floor((distance % (1000 * 60)) / 1000);
      
      hours = (isNaN(hours) || hours < 0) ? 0 : hours;
      minutes = (isNaN(minutes) || minutes < 0) ? 0 : minutes;
      seconds = (isNaN(seconds) || seconds < 0) ? 0 : seconds;
      
      var daysStr = '00';
      var hoursStr = ('0' + hours).slice(-2);
      var minutesStr = ('0' + minutes).slice(-2);
      var secondsStr = ('0' + seconds).slice(-2);
      
      var strCountDown = '<div class="clock-item-wrapper"><div class="clock-item"><span class="num">' + daysStr + '</span></div><span class="text">dias</span></div>' +
                        '<div class="clock-item-wrapper"><div class="clock-item"><span class="num">' + hoursStr + '</span></div><span class="text">hrs</span></div>' +
                        '<div class="clock-item-wrapper"><div class="clock-item"><span class="num">' + minutesStr + '</span></div><span class="text">min</span></div>' +
                        '<div class="clock-item-wrapper"><div class="clock-item"><span class="num">' + secondsStr + '</span></div><span class="text">seg</span></div>';
      
      if (countdownElm) {
        countdownElm.innerHTML = strCountDown;
      }
    }, 1000);
  }
});
