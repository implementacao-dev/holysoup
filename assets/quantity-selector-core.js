/**
 * Quantity Selector Core - Standalone initialization
 * Waits for jQuery and niceSelect to be available, then initializes
 */
(function() {
    'use strict';

    function initQuantitySelector() {
        const qtdSelect = document.getElementById('qtd-select');
        if (!qtdSelect) return;

        // Check if jQuery and niceSelect are available
        if (typeof jQuery === 'undefined' || !jQuery.fn.niceSelect) {
            // Try again after a short delay (faster polling for priority)
            setTimeout(initQuantitySelector, 50);
            return;
        }

        // If already initialized, skip
        if (qtdSelect.hasAttribute('data-nice-select-initialized')) return;
        qtdSelect.setAttribute('data-nice-select-initialized', 'true');

        const $ = jQuery;

        // Initialize niceSelect (select already has display:none)
        $(qtdSelect).niceSelect();
        
        // Show the niceSelect dropdown
        var newQtd = $(qtdSelect).next('.nice-select');
        if (!newQtd.length) {
            // Fallback: show native select if niceSelect fails
            $(qtdSelect).css('display', '');
            return;
        }
        
        newQtd.addClass('select-qtd-nice');
        // Ensure niceSelect is visible
        newQtd.css('display', '');

        function replaceFreteGratis(element) {
            var texto = $(element).html();
            if (texto && texto.includes("Frete Grátis")) {
                var novoTexto = texto.replace("Frete Grátis", '<span class="badge-frete-gratis">Frete <b>Grátis</b></span>');
                $(element).html(novoTexto);
            }
        }

        newQtd.find('li').each(function(){
            replaceFreteGratis(this);
        });

        // Apply to current element when page loads
        var currentElement = newQtd.find('.current')[0];
        if (currentElement) {
            replaceFreteGratis(currentElement);
        }

        newQtd.on('click', function(){
            $('body').addClass('open-qtd');
            $('.product-details').css('z-index', '');
        });

        // Observer for current element changes
        var targetNode = newQtd.find('.current')[0];
        if (targetNode) {
            var config = {
                childList: true,
                characterData: true,
                subtree: true
            };

            var callback = function(mutationsList, observer) {
                for (let mutation of mutationsList) {
                    if (mutation.type === 'characterData' || mutation.type === 'childList') {
                        replaceFreteGratis(targetNode);
                    }
                }
            };

            var qtdObserver = new MutationObserver(callback);
            qtdObserver.observe(targetNode, config);
        }

        // Observe niceSelect close
        function handleNiceSelectClosed() {
            $('body').removeClass('open-qtd');
        }

        const niceSelectContainer = document.querySelector('.nice-select.select-qtd-nice');
        if (niceSelectContainer) {
            const niceObserver = new MutationObserver((mutationsList) => {
                for (const mutation of mutationsList) {
                    if (mutation.type === 'attributes' && !niceSelectContainer.classList.contains('open')) {
                        handleNiceSelectClosed();
                    }
                }
            });

            const configNice = { attributes: true, attributeFilter: ['class'] };
            niceObserver.observe(niceSelectContainer, configNice);
        }
    }

    // Start trying to initialize immediately (faster initialization)
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function() {
            initQuantitySelector();
        });
    } else {
        initQuantitySelector();
    }

    // Also try when window loads (in case jQuery loads after DOMContentLoaded)
    window.addEventListener('load', function() {
        initQuantitySelector();
    });
})();
