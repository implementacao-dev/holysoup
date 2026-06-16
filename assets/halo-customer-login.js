class CustomerAuth extends HTMLElement {
    constructor() {
        super();

        this.auth = this;

        if(document.querySelector('[data-open-auth-popup]')){
            document.querySelectorAll('[data-open-auth-popup]').forEach((openPopup) =>
                openPopup.addEventListener('click', this.setOpenPopup.bind(this))
            );
        }

        if(document.querySelector('[data-close-auth-popup]')){
            document.querySelector('[data-close-auth-popup]').addEventListener(
                'click',
                this.setClosePopup.bind(this)
            );
        }

        if(document.querySelector('[data-open-auth-sidebar]')){
            document.querySelectorAll('[data-open-auth-sidebar]').forEach((openSidebar) =>
                openSidebar.addEventListener('click',this.setOpenSidebar.bind(this))
            );
        }

        if(document.querySelector('[data-close-auth-sidebar]')){
            document.querySelector('[data-close-auth-sidebar]').addEventListener(
                'click',
                this.setCloseSidebar.bind(this)
            );
        }

        document.body.addEventListener('click', this.onBodyClickEvent.bind(this));
    }

    setOpenPopup(event){
        event.preventDefault();
        event.stopPropagation();

        if (document.body.classList.contains('template-customers-login')) {
            $('html, body').animate({
                scrollTop: 0
            }, 700);
        } else {
            document.body.classList.add('auth-popup-show');
        }
    }

    setClosePopup(event){
        event.preventDefault();
        event.stopPropagation();

        document.body.classList.remove('auth-popup-show');
    }

    setOpenSidebar(event){
        event.preventDefault();
        event.stopPropagation();

        if (document.body.classList.contains('template-customers-login')) {
            $('html, body').animate({
                scrollTop: 0
            }, 700);
        } else {
            document.body.classList.add('auth-sidebar-show');
        }
    }

    setCloseSidebar(event){
        event.preventDefault();
        event.stopPropagation();

        document.body.classList.remove('auth-sidebar-show');
    }
    
    onBodyClickEvent(event){
        if(document.body.classList.contains('auth-popup-show')){
            if ((!this.contains(event.target)) && ($(event.target).closest('[data-open-auth-popup]').length === 0)){
                this.setClosePopup(event);
            }
        }
        
        if(document.body.classList.contains('auth-sidebar-show') && !document.body.classList.contains('menu_open')){
            console.log(this.contains(event.target));
            if ((!this.contains(event.target)) && ($(event.target).closest('[data-open-auth-sidebar]').length === 0)){
                event.stopImmediatePropagation();
                this.setCloseSidebar(event);
            }
        }
    }
}

customElements.define('customer-auth', CustomerAuth);

class CustomerAuthRegister extends HTMLElement {
    constructor() {
        super();

        this.auth = this;

        if(document.querySelector('[data-open-auth-popup]')){
            document.querySelectorAll('[data-open-auth-popup]').forEach((openPopup) =>
                openPopup.addEventListener('click', this.setOpenPopup.bind(this))
            );
        }

        if(document.querySelector('[data-close-auth-register-sidebar]')){
            document.querySelector('[data-close-auth-register-sidebar]').addEventListener(
                'click',
                this.setClosePopup.bind(this)
            );
        }

        if(document.querySelector('[register-inline-menu]')){
            document.querySelectorAll('[register-inline-menu]').forEach((openSidebar) =>
                openSidebar.addEventListener('click',this.setOpenSidebar.bind(this))
            );
        }

        if(document.querySelector('[data-close-auth-register-sidebar]')){
            document.querySelector('[data-close-auth-register-sidebar]').addEventListener(
                'click',
                this.setCloseSidebar.bind(this)
            );
        }

        document.body.addEventListener('click', this.onBodyClickEvent.bind(this));
    }

    setOpenPopup(event){
        event.preventDefault();
        event.stopPropagation();

        if (document.body.classList.contains('template-customers-login')) {
            $('html, body').animate({
                scrollTop: 0
            }, 700);
        } else {
            document.body.classList.add('auth-popup-show');
        }
    }

    setClosePopup(event){
        event.preventDefault();
        event.stopPropagation();

        document.body.classList.remove('auth-popup-show');
    }

    setOpenSidebar(event){
        event.preventDefault();
        event.stopPropagation();

        if (document.body.classList.contains('template-customers-login')) {
            $('html, body').animate({
                scrollTop: 0
            }, 700);
        } else {
            document.body.classList.add('auth-sidebar-register-show');
        }
    }

    setCloseSidebar(event){
        event.preventDefault();
        event.stopPropagation();

        document.body.classList.remove('auth-sidebar-register-show');
    }
    
    onBodyClickEvent(event){
        if(document.body.classList.contains('auth-popup-show')){
            if ((!this.contains(event.target)) && ($(event.target).closest('[data-open-auth-popup]').length === 0)){
                this.setClosePopup(event);
            }
        }
        
        if(document.body.classList.contains('auth-sidebar-register-show') && !document.body.classList.contains('menu_open')){
            console.log(this.contains(event.target));
            if ((!this.contains(event.target)) && ($(event.target).closest('[register-inline-menu]').length === 0)){
                event.stopImmediatePropagation();
                this.setCloseSidebar(event);
            }
        }
    }
}

customElements.define('customer-auth-register', CustomerAuthRegister);