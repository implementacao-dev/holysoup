class SliderBar {
  constructor() {
    this.sliderContent = document.querySelector(".slider-content");
    this.isInitialized = false;
    this.originalContent = null;
    this.resizeTimeout = null;

    this.init();
  }

  init() {
    if (!this.sliderContent) {
      return;
    }

    // Salvar conteúdo original se ainda não foi salvo
    if (!this.originalContent) {
      this.originalContent = this.sliderContent.innerHTML;
    }

    // Resetar animação
    this.sliderContent.style.animation = "none";
    this.sliderContent.classList.remove("is-visible");

    // Duplicar conteúdo para criar loop infinito
    this.duplicateContent();

    // Calcular e aplicar animação
    this.calculateAndApplyAnimation();

    this.isInitialized = true;
  }

  duplicateContent() {
    // Duplicar o conteúdo várias vezes para garantir cobertura completa
    const content = this.originalContent;
    // Criar múltiplas cópias para cobrir toda a largura da tela
    let duplicatedContent = "";
    for (let i = 0; i < 12; i++) {
      duplicatedContent += content;
    }
    this.sliderContent.innerHTML = duplicatedContent;
  }

  calculateAndApplyAnimation() {
    // Usar requestAnimationFrame para garantir que o DOM foi atualizado
    requestAnimationFrame(() => {
      const contentWidth = this.sliderContent.scrollWidth / 12; // Dividir por 12 porque duplicamos 12 vezes
      const containerWidth = this.sliderContent.parentElement.offsetWidth;

      // Calcular duração da animação baseada na largura do conteúdo
      // Velocidade bem lenta: 40px por segundo
      let animationDuration = contentWidth / 40;

      // Limitar duração entre 30s e 180s para velocidade bem lenta
      animationDuration = Math.max(30, Math.min(180, animationDuration));

      // Aplicar animação
      this.sliderContent.style.animation = `scroll ${animationDuration}s linear infinite`;
      this.sliderContent.classList.add("is-visible");
    });
  }

  reinit() {
    this.isInitialized = false;
    this.init();
  }

  destroy() {
    if (this.sliderContent) {
      this.sliderContent.style.animation = "none";
      this.sliderContent.innerHTML = this.originalContent;
    }
    this.isInitialized = false;
  }
}

let sliderBarInstance = null;

// Função para inicializar
function initSliderBar() {
  if (sliderBarInstance) {
    sliderBarInstance.reinit();
  } else {
    sliderBarInstance = new SliderBar();
  }
}

// Inicializar quando o DOM estiver pronto
document.addEventListener("DOMContentLoaded", () => {
  initSliderBar();
});

// Fallback para caso o DOM já esteja carregado
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", () => {
    initSliderBar();
  });
} else {
  initSliderBar();
}

// Reinicializar no resize com debounce
window.addEventListener("resize", () => {
  clearTimeout(sliderBarInstance?.resizeTimeout);
  sliderBarInstance.resizeTimeout = setTimeout(() => {
    if (sliderBarInstance) {
      sliderBarInstance.reinit();
    }
  }, 250);
});

// Expor para uso global se necessário
window.SliderBar = SliderBar;
window.initSliderBar = initSliderBar;
