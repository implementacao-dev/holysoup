document.addEventListener('DOMContentLoaded', function() {
  var faqQuestions = document.querySelectorAll('.final-faq-question');
  
  faqQuestions.forEach(function(question) {
    question.addEventListener('click', function() {
      var faqItem = this.closest('.final-faq-item');
      var isActive = faqItem.classList.contains('active');
      
      var allowMultiple = document.querySelector('.final-faq-landing-section')?.dataset?.allowMultiple === 'true';
      if (allowMultiple) {
        faqItem.classList.toggle('active');
        this.setAttribute('aria-expanded', faqItem.classList.contains('active') ? 'true' : 'false');
      } else {
        document.querySelectorAll('.final-faq-item').forEach(function(item) {
          item.classList.remove('active');
          item.querySelector('.final-faq-question').setAttribute('aria-expanded', 'false');
        });
        
        if (!isActive) {
          faqItem.classList.add('active');
          this.setAttribute('aria-expanded', 'true');
        }
      }
    });
  });
});
