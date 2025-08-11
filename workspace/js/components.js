/**
 * Components.js - Interactive UI Components
 * 군대 관리 시스템용 컴포넌트들
 */

// 네비게이션 컴포넌트
class Navigation {
    constructor() {
        this.nav = $('#navigation');
        this.menuBtn = $('.menu-btn');
        this.isOpen = false;
        this.init();
    }
    
    init() {
        this.bindEvents();
        this.logger.info('Navigation component initialized');
    }
    
    bindEvents() {
        // 메뉴 버튼 클릭
        Utils.on(this.menuBtn, 'click', (e) => {
            e.preventDefault();
            this.toggle();
        });
        
        // 네비게이션 링크 클릭
        Utils.on(this.nav, 'click', (e) => {
            if (e.target.tagName === 'A') {
                this.close();
            }
        });
        
        // ESC 키로 닫기
        Utils.on(document, 'keydown', (e) => {
            if (e.key === 'Escape' && this.isOpen) {
                this.close();
            }
        });
        
        // 외부 클릭으로 닫기
        Utils.on(document, 'click', (e) => {
            if (this.isOpen && !this.nav.contains(e.target) && !this.menuBtn.contains(e.target)) {
                this.close();
            }
        });
    }
    
    open() {
        if (this.isOpen) return;
        
        Utils.addClass(this.nav, 'active');
        Utils.addClass(document.body, 'nav-open');
        this.isOpen = true;
        
        // 포커스 트랩 설정
        this.setFocusTrap();
        
        this.logger.info('Navigation opened');
    }
    
    close() {
        if (!this.isOpen) return;
        
        Utils.removeClass(this.nav, 'active');
        Utils.removeClass(document.body, 'nav-open');
        this.isOpen = false;
        
        // 포커스 트랩 제거
        this.removeFocusTrap();
        
        // 메뉴 버튼으로 포커스 복원
        this.menuBtn.focus();
        
        this.logger.info('Navigation closed');
    }
    
    toggle() {
        this.isOpen ? this.close() : this.open();
    }
    
    setFocusTrap() {
        const focusableElements = this.nav.querySelectorAll(
            'a[href], button, textarea, input[type="text"], input[type="radio"], input[type="checkbox"], select'
        );
        
        if (focusableElements.length === 0) return;
        
        this.firstFocusableElement = focusableElements[0];
        this.lastFocusableElement = focusableElements[focusableElements.length - 1];
        
        Utils.on(this.nav, 'keydown', this.handleFocusTrap.bind(this));
        
        // 첫 번째 요소로 포커스
        this.firstFocusableElement.focus();
    }
    
    removeFocusTrap() {
        Utils.on(this.nav, 'keydown', this.handleFocusTrap.bind(this));
    }
    
    handleFocusTrap(e) {
        if (e.key !== 'Tab') return;
        
        if (e.shiftKey) {
            if (document.activeElement === this.firstFocusableElement) {
                e.preventDefault();
                this.lastFocusableElement.focus();
            }
        } else {
            if (document.activeElement === this.lastFocusableElement) {
                e.preventDefault();
                this.firstFocusableElement.focus();
            }
        }
    }
    
    get logger() {
        return Utils.logger;
    }
}

// 버튼 컴포넌트
class Button {
    constructor(element) {
        this.element = element;
        this.init();
    }
    
    init() {
        this.bindEvents();
        this.setupLoadingState();
    }
    
    bindEvents() {
        Utils.on(this.element, 'click', this.handleClick.bind(this));
        Utils.on(this.element, 'keydown', this.handleKeydown.bind(this));
    }
    
    handleClick(e) {
        if (this.isDisabled()) {
            e.preventDefault();
            return;
        }
        
        // 클릭 효과
        this.addRippleEffect(e);
        
        // 커스텀 이벤트 발생
        this.element.dispatchEvent(new CustomEvent('buttonClick', {
            detail: { button: this }
        }));
    }
    
    handleKeydown(e) {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            this.element.click();
        }
    }
    
    addRippleEffect(e) {
        const ripple = document.createElement('span');
        const rect = this.element.getBoundingClientRect();
        const size = Math.max(rect.width, rect.height);
        const x = e.clientX - rect.left - size / 2;
        const y = e.clientY - rect.top - size / 2;
        
        ripple.style.cssText = `
            position: absolute;
            width: ${size}px;
            height: ${size}px;
            left: ${x}px;
            top: ${y}px;
            background: rgba(255, 255, 255, 0.3);
            border-radius: 50%;
            transform: scale(0);
            animation: ripple 0.6s linear;
            pointer-events: none;
        `;
        
        this.element.style.position = 'relative';
        this.element.appendChild(ripple);
        
        setTimeout(() => {
            ripple.remove();
        }, 600);
    }
    
    setupLoadingState() {
        // 로딩 상태 CSS 추가
        if (!document.querySelector('#button-styles')) {
            const style = document.createElement('style');
            style.id = 'button-styles';
            style.textContent = `
                @keyframes ripple {
                    to {
                        transform: scale(4);
                        opacity: 0;
                    }
                }
            `;
            document.head.appendChild(style);
        }
    }
    
    setLoading(loading) {
        if (loading) {
            Utils.addClass(this.element, 'loading');
            this.element.disabled = true;
        } else {
            Utils.removeClass(this.element, 'loading');
            this.element.disabled = false;
        }
    }
    
    isDisabled() {
        return this.element.disabled || Utils.hasClass(this.element, 'loading');
    }
}

// 카드 컴포넌트
class Card {
    constructor(element) {
        this.element = element;
        this.init();
    }
    
    init() {
        this.bindEvents();
        this.setupIntersectionObserver();
    }
    
    bindEvents() {
        // 카드 클릭 이벤트
        Utils.on(this.element, 'click', this.handleClick.bind(this));
        
        // 키보드 이벤트
        Utils.on(this.element, 'keydown', this.handleKeydown.bind(this));
    }
    
    handleClick(e) {
        // 링크가 있는 경우 기본 동작 유지
        if (e.target.tagName === 'A' || e.target.closest('a')) {
            return;
        }
        
        // 카드 클릭 이벤트 발생
        this.element.dispatchEvent(new CustomEvent('cardClick', {
            detail: { card: this, event: e }
        }));
    }
    
    handleKeydown(e) {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            this.element.click();
        }
    }
    
    setupIntersectionObserver() {
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        Utils.addClass(entry.target, 'card-visible');
                    }
                });
            },
            { threshold: 0.1 }
        );
        
        observer.observe(this.element);
    }
    
    animateIn() {
        return Utils.animate(this.element, {
            opacity: 1,
            transform: 'translateY(0)'
        }, 600, 'ease-out');
    }
    
    animateOut() {
        return Utils.animate(this.element, {
            opacity: 0,
            transform: 'translateY(20px)'
        }, 300, 'ease-in');
    }
}

// 언어 선택기 컴포넌트
class LanguageSelector {
    constructor(element) {
        this.element = element;
        this.currentLang = 'KO';
        this.init();
    }
    
    init() {
        this.bindEvents();
        this.loadSavedLanguage();
    }
    
    bindEvents() {
        const langSpans = this.element.querySelectorAll('span:not(.separator)');
        
        langSpans.forEach(span => {
            Utils.on(span, 'click', () => {
                this.setLanguage(span.textContent);
            });
        });
    }
    
    setLanguage(lang) {
        this.currentLang = lang;
        
        // 활성 상태 업데이트
        const langSpans = this.element.querySelectorAll('span:not(.separator)');
        langSpans.forEach(span => {
            if (span.textContent === lang) {
                Utils.addClass(span, 'active');
            } else {
                Utils.removeClass(span, 'active');
            }
        });
        
        // 로컬 스토리지에 저장
        Utils.storage.set('language', lang);
        
        // 언어 변경 이벤트 발생
        document.dispatchEvent(new CustomEvent('languageChange', {
            detail: { language: lang }
        }));
        
        Utils.logger.info(`Language changed to: ${lang}`);
    }
    
    loadSavedLanguage() {
        const savedLang = Utils.storage.get('language', 'KO');
        this.setLanguage(savedLang);
    }
    
    getCurrentLanguage() {
        return this.currentLang;
    }
}

// 헤더 컴포넌트
class Header {
    constructor() {
        this.header = $('.header');
        this.lastScrollY = 0;
        this.init();
    }
    
    init() {
        this.bindEvents();
        this.setupScrollEffect();
    }
    
    bindEvents() {
        // 스크롤 이벤트
        Utils.on(window, 'scroll', Utils.throttle(this.handleScroll.bind(this), 16));
        
        // 리사이즈 이벤트
        Utils.on(window, 'resize', Utils.debounce(this.handleResize.bind(this), 250));
    }
    
    handleScroll() {
        const currentScrollY = Utils.getScrollPosition().y;
        
        // 헤더 숨김/표시 효과
        if (currentScrollY > this.lastScrollY && currentScrollY > 100) {
            Utils.addClass(this.header, 'header-hidden');
        } else {
            Utils.removeClass(this.header, 'header-hidden');
        }
        
        // 스크롤 배경 효과
        if (currentScrollY > 50) {
            Utils.addClass(this.header, 'header-scrolled');
        } else {
            Utils.removeClass(this.header, 'header-scrolled');
        }
        
        this.lastScrollY = currentScrollY;
    }
    
    handleResize() {
        // 모바일에서 네비게이션이 열려있으면 닫기
        if (Utils.isMobile() && window.Navigation && window.Navigation.isOpen) {
            window.Navigation.close();
        }
    }
    
    setupScrollEffect() {
        // 헤더 스크롤 효과 CSS 추가
        if (!document.querySelector('#header-styles')) {
            const style = document.createElement('style');
            style.id = 'header-styles';
            style.textContent = `
                .header {
                    transform: translateY(0);
                    transition: transform 0.3s ease;
                }
                
                .header-hidden {
                    transform: translateY(-100%);
                }
                
                .header-scrolled {
                    background: rgba(26, 31, 46, 0.98);
                    box-shadow: 0 2px 20px rgba(0, 0, 0, 0.1);
                }
            `;
            document.head.appendChild(style);
        }
    }
}

// 컴포넌트 초기화 함수
function initializeComponents() {
    // 네비게이션 초기화
    window.Navigation = new Navigation();
    
    // 헤더 초기화
    window.Header = new Header();
    
    // 버튼 컴포넌트 초기화
    const buttons = Utils.$$('.btn-primary, button[type="button"]');
    buttons.forEach(button => new Button(button));
    
    // 카드 컴포넌트 초기화
    const cards = Utils.$$('.info-card');
    cards.forEach(card => new Card(card));
    
    // 언어 선택기 초기화
    const languageSelector = Utils.$('.language-selector');
    if (languageSelector) {
        window.LanguageSelector = new LanguageSelector(languageSelector);
    }
    
    Utils.logger.info('All components initialized');
}

// DOM 로드 완료 시 컴포넌트 초기화
if (document.readyState === 'loading') {
    Utils.on(document, 'DOMContentLoaded', initializeComponents);
} else {
    initializeComponents();
}
