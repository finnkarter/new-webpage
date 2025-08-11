/**
 * MILBASE Components
 * 재사용 가능한 UI 컴포넌트들
 */

// === Toast 알림 시스템 ===
class Toast {
    constructor() {
        this.container = Utils.$('#toastContainer');
        this.toasts = [];
    }
    
    show(message, type = 'info', duration = 5000) {
        const toast = this.create(message, type);
        this.container.appendChild(toast);
        this.toasts.push(toast);
        
        // 애니메이션 트리거
        requestAnimationFrame(() => {
            Utils.slideUp(toast);
        });
        
        // 자동 제거
        if (duration > 0) {
            setTimeout(() => {
                this.remove(toast);
            }, duration);
        }
        
        return toast;
    }
    
    create(message, type) {
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        
        const icons = {
            info: 'ℹ️',
            success: '✅',
            warning: '⚠️',
            error: '❌'
        };
        
        const titles = {
            info: '알림',
            success: '성공',
            warning: '주의',
            error: '오류'
        };
        
        toast.innerHTML = `
            <div class="toast-icon">${icons[type] || icons.info}</div>
            <div class="toast-content">
                <div class="toast-title">${titles[type] || titles.info}</div>
                <div class="toast-message">${message}</div>
            </div>
            <button class="toast-close" type="button">×</button>
        `;
        
        // 닫기 버튼 이벤트
        const closeBtn = toast.querySelector('.toast-close');
        Utils.on(closeBtn, 'click', () => this.remove(toast));
        
        return toast;
    }
    
    remove(toast) {
        if (!toast.parentNode) return;
        
        Utils.addClass(toast, 'removing');
        
        setTimeout(() => {
            if (toast.parentNode) {
                toast.parentNode.removeChild(toast);
            }
            
            const index = this.toasts.indexOf(toast);
            if (index > -1) {
                this.toasts.splice(index, 1);
            }
        }, 300);
    }
    
    clear() {
        this.toasts.forEach(toast => this.remove(toast));
    }
}

// === 사이드 메뉴 컴포넌트 ===
class SideMenu {
    constructor() {
        this.menu = Utils.$('#sideMenu');
        this.overlay = Utils.$('#overlay');
        this.toggleBtn = Utils.$('#menuToggle');
        this.closeBtn = Utils.$('#menuClose');
        this.hamburger = this.toggleBtn?.querySelector('.hamburger');
        this.isOpen = false;
        
        this.init();
    }
    
    init() {
        if (this.toggleBtn) {
            Utils.on(this.toggleBtn, 'click', () => this.toggle());
        }
        
        if (this.closeBtn) {
            Utils.on(this.closeBtn, 'click', () => this.close());
        }
        
        if (this.overlay) {
            Utils.on(this.overlay, 'click', () => this.close());
        }
        
        // ESC 키로 닫기
        Utils.on(document, 'keydown', (e) => {
            if (e.key === 'Escape' && this.isOpen) {
                this.close();
            }
        });
    }
    
    open() {
        if (this.isOpen) return;
        
        this.isOpen = true;
        Utils.addClass(this.menu, 'active');
        Utils.addClass(this.overlay, 'active');
        Utils.addClass(this.hamburger, 'active');
        
        // 포커스 트랩
        this.trapFocus();
        
        // body 스크롤 방지
        document.body.style.overflow = 'hidden';
    }
    
    close() {
        if (!this.isOpen) return;
        
        this.isOpen = false;
        Utils.removeClass(this.menu, 'active');
        Utils.removeClass(this.overlay, 'active');
        Utils.removeClass(this.hamburger, 'active');
        
        // body 스크롤 복원
        document.body.style.overflow = '';
        
        // 포커스 복원
        if (this.toggleBtn) {
            this.toggleBtn.focus();
        }
    }
    
    toggle() {
        if (this.isOpen) {
            this.close();
        } else {
            this.open();
        }
    }
    
    trapFocus() {
        const focusableElements = this.menu.querySelectorAll(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        
        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];
        
        Utils.on(this.menu, 'keydown', (e) => {
            if (e.key !== 'Tab') return;
            
            if (e.shiftKey) {
                if (document.activeElement === firstElement) {
                    e.preventDefault();
                    lastElement.focus();
                }
            } else {
                if (document.activeElement === lastElement) {
                    e.preventDefault();
                    firstElement.focus();
                }
            }
        });
        
        // 첫 번째 요소에 포커스
        if (firstElement) {
            firstElement.focus();
        }
    }
}

// === 테마 토글 컴포넌트 ===
class ThemeToggle {
    constructor() {
        this.toggleBtn = Utils.$('#themeToggle');
        this.currentTheme = Utils.storage.get('theme', 'dark');
        
        this.init();
    }
    
    init() {
        this.applyTheme(this.currentTheme);
        
        if (this.toggleBtn) {
            Utils.on(this.toggleBtn, 'click', () => this.toggle());
        }
    }
    
    toggle() {
        const newTheme = this.currentTheme === 'dark' ? 'light' : 'dark';
        this.setTheme(newTheme);
    }
    
    setTheme(theme) {
        this.currentTheme = theme;
        this.applyTheme(theme);
        Utils.storage.set('theme', theme);
    }
    
    applyTheme(theme) {
        document.documentElement.setAttribute('data-theme', theme);
        
        if (this.toggleBtn) {
            const icon = this.toggleBtn.querySelector('.icon');
            if (icon) {
                icon.textContent = theme === 'dark' ? '☀️' : '🌙';
            }
        }
    }
}

// === 실시간 시계 컴포넌트 ===
class Clock {
    constructor() {
        this.element = Utils.$('#currentTime');
        this.interval = null;
        
        this.init();
    }
    
    init() {
        if (!this.element) return;
        
        this.update();
        this.interval = setInterval(() => this.update(), 1000);
    }
    
    update() {
        const now = new Date();
        const timeString = Utils.formatTime(now);
        const dateString = Utils.formatDate(now);
        
        this.element.textContent = `${dateString} ${timeString}`;
    }
    
    destroy() {
        if (this.interval) {
            clearInterval(this.interval);
            this.interval = null;
        }
    }
}

// === 진행률 바 컴포넌트 ===
class ProgressBar {
    constructor(element) {
        this.element = typeof element === 'string' ? Utils.$(element) : element;
        this.fill = this.element?.querySelector('.progress-fill');
        this.currentValue = 0;
    }
    
    setValue(value, animate = true) {
        value = Utils.clamp(value, 0, 100);
        this.currentValue = value;
        
        if (!this.fill) return;
        
        if (animate) {
            // 부드러운 애니메이션
            this.fill.style.transition = 'width 1s ease-out';
        } else {
            this.fill.style.transition = 'none';
        }
        
        this.fill.style.width = `${value}%`;
    }
    
    getValue() {
        return this.currentValue;
    }
}

// === 버튼 리플 효과 컴포넌트 ===
class RippleEffect {
    static init() {
        // 모든 버튼에 리플 효과 추가
        Utils.on(document, 'click', (e) => {
            const button = e.target.closest('.action-btn, .btn-icon');
            if (button) {
                RippleEffect.create(button, e);
            }
        });
    }
    
    static create(element, event) {
        const rect = element.getBoundingClientRect();
        const size = Math.max(rect.width, rect.height);
        const x = event.clientX - rect.left - size / 2;
        const y = event.clientY - rect.top - size / 2;
        
        const ripple = document.createElement('div');
        ripple.style.cssText = `
            position: absolute;
            width: ${size}px;
            height: ${size}px;
            left: ${x}px;
            top: ${y}px;
            background: rgba(255, 255, 255, 0.3);
            border-radius: 50%;
            transform: scale(0);
            animation: ripple 0.6s ease-out;
            pointer-events: none;
        `;
        
        element.style.position = 'relative';
        element.style.overflow = 'hidden';
        element.appendChild(ripple);
        
        setTimeout(() => {
            if (ripple.parentNode) {
                ripple.parentNode.removeChild(ripple);
            }
        }, 600);
    }
}

// === 키보드 단축키 관리자 ===
class KeyboardShortcuts {
    constructor() {
        this.shortcuts = new Map();
        this.init();
    }
    
    init() {
        Utils.on(document, 'keydown', (e) => this.handleKeydown(e));
        
        // 기본 단축키 등록
        this.register('Escape', () => {
            // 사이드 메뉴나 모달 닫기
            if (window.sideMenu?.isOpen) {
                window.sideMenu.close();
            }
        });
        
        this.register('KeyM', (e) => {
            if (e.ctrlKey || e.metaKey) {
                e.preventDefault();
                window.sideMenu?.toggle();
            }
        });
    }
    
    register(key, callback, options = {}) {
        this.shortcuts.set(key, { callback, options });
    }
    
    unregister(key) {
        this.shortcuts.delete(key);
    }
    
    handleKeydown(e) {
        const shortcut = this.shortcuts.get(e.code || e.key);
        if (shortcut) {
            const { callback, options } = shortcut;
            
            // 수정키 확인
            if (options.ctrl && !e.ctrlKey) return;
            if (options.shift && !e.shiftKey) return;
            if (options.alt && !e.altKey) return;
            if (options.meta && !e.metaKey) return;
            
            callback(e);
        }
    }
}

// === 전역 컴포넌트 초기화 ===
let toast, sideMenu, themeToggle, clock, keyboardShortcuts;

const initComponents = () => {
    // 컴포넌트 인스턴스 생성
    toast = new Toast();
    sideMenu = new SideMenu();
    themeToggle = new ThemeToggle();
    clock = new Clock();
    keyboardShortcuts = new KeyboardShortcuts();
    
    // 리플 효과 초기화
    RippleEffect.init();
    
    // 전역 객체로 노출
    window.toast = toast;
    window.sideMenu = sideMenu;
    window.themeToggle = themeToggle;
    window.clock = clock;
    window.keyboardShortcuts = keyboardShortcuts;
    window.ProgressBar = ProgressBar;
    
    console.log('🎖️ MILBASE Components initialized');
};

// DOM 로드 완료 시 초기화
if (document.readyState === 'loading') {
    Utils.on(document, 'DOMContentLoaded', initComponents);
} else {
    initComponents();
}