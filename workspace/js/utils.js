/**
 * Utils.js - Common utility functions
 * 군대 관리 시스템용 유틸리티 함수들
 */

// DOM 요소 선택 헬퍼
const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => document.querySelectorAll(selector);

// 이벤트 리스너 헬퍼
const on = (element, event, handler, options = {}) => {
    element.addEventListener(event, handler, options);
};

// 클래스 토글 헬퍼
const toggleClass = (element, className) => {
    element.classList.toggle(className);
};

const addClass = (element, className) => {
    element.classList.add(className);
};

const removeClass = (element, className) => {
    element.classList.remove(className);
};

const hasClass = (element, className) => {
    return element.classList.contains(className);
};

// 스크롤 위치 감지
const getScrollPosition = () => {
    return {
        x: window.pageXOffset || document.documentElement.scrollLeft,
        y: window.pageYOffset || document.documentElement.scrollTop
    };
};

// 뷰포트 크기 감지
const getViewportSize = () => {
    return {
        width: window.innerWidth || document.documentElement.clientWidth,
        height: window.innerHeight || document.documentElement.clientHeight
    };
};

// 디바이스 타입 감지
const isMobile = () => {
    return window.innerWidth <= 768;
};

const isTablet = () => {
    return window.innerWidth > 768 && window.innerWidth <= 1024;
};

const isDesktop = () => {
    return window.innerWidth > 1024;
};

// 로컬 스토리지 헬퍼
const storage = {
    set: (key, value) => {
        try {
            localStorage.setItem(key, JSON.stringify(value));
        } catch (error) {
            console.error('Storage set error:', error);
        }
    },
    
    get: (key, defaultValue = null) => {
        try {
            const item = localStorage.getItem(key);
            return item ? JSON.parse(item) : defaultValue;
        } catch (error) {
            console.error('Storage get error:', error);
            return defaultValue;
        }
    },
    
    remove: (key) => {
        try {
            localStorage.removeItem(key);
        } catch (error) {
            console.error('Storage remove error:', error);
        }
    },
    
    clear: () => {
        try {
            localStorage.clear();
        } catch (error) {
            console.error('Storage clear error:', error);
        }
    }
};

// 날짜 포맷팅
const formatDate = (date, format = 'YYYY-MM-DD') => {
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const hours = String(d.getHours()).padStart(2, '0');
    const minutes = String(d.getMinutes()).padStart(2, '0');
    const seconds = String(d.getSeconds()).padStart(2, '0');
    
    return format
        .replace('YYYY', year)
        .replace('MM', month)
        .replace('DD', day)
        .replace('HH', hours)
        .replace('mm', minutes)
        .replace('ss', seconds);
};

// 숫자 포맷팅
const formatNumber = (number, options = {}) => {
    const defaults = {
        minimumFractionDigits: 0,
        maximumFractionDigits: 2,
        useGrouping: true
    };
    
    return new Intl.NumberFormat('ko-KR', { ...defaults, ...options }).format(number);
};

// 디바운스 함수
const debounce = (func, wait) => {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
};

// 쓰로틀 함수
const throttle = (func, limit) => {
    let inThrottle;
    return function() {
        const args = arguments;
        const context = this;
        if (!inThrottle) {
            func.apply(context, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
};

// 랜덤 ID 생성
const generateId = (prefix = 'id') => {
    return `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

// 배열 셔플
const shuffleArray = (array) => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
};

// 딥 클론
const deepClone = (obj) => {
    if (obj === null || typeof obj !== 'object') return obj;
    if (obj instanceof Date) return new Date(obj.getTime());
    if (obj instanceof Array) return obj.map(item => deepClone(item));
    if (typeof obj === 'object') {
        const clonedObj = {};
        for (const key in obj) {
            if (obj.hasOwnProperty(key)) {
                clonedObj[key] = deepClone(obj[key]);
            }
        }
        return clonedObj;
    }
};

// URL 파라미터 파싱
const getUrlParams = () => {
    const params = new URLSearchParams(window.location.search);
    const result = {};
    for (const [key, value] of params) {
        result[key] = value;
    }
    return result;
};

// 쿠키 헬퍼
const cookies = {
    set: (name, value, days = 7) => {
        const expires = new Date();
        expires.setTime(expires.getTime() + (days * 24 * 60 * 60 * 1000));
        document.cookie = `${name}=${value};expires=${expires.toUTCString()};path=/`;
    },
    
    get: (name) => {
        const nameEQ = name + "=";
        const ca = document.cookie.split(';');
        for (let i = 0; i < ca.length; i++) {
            let c = ca[i];
            while (c.charAt(0) === ' ') c = c.substring(1, c.length);
            if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
        }
        return null;
    },
    
    remove: (name) => {
        document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/;`;
    }
};

// 로깅 유틸리티
const logger = {
    info: (message, ...args) => {
        console.log(`[INFO] ${message}`, ...args);
    },
    
    warn: (message, ...args) => {
        console.warn(`[WARN] ${message}`, ...args);
    },
    
    error: (message, ...args) => {
        console.error(`[ERROR] ${message}`, ...args);
    },
    
    debug: (message, ...args) => {
        if (process.env.NODE_ENV === 'development') {
            console.log(`[DEBUG] ${message}`, ...args);
        }
    }
};

// 애니메이션 헬퍼
const animate = (element, properties, duration = 300, easing = 'ease') => {
    return new Promise((resolve) => {
        const startTime = performance.now();
        const startValues = {};
        
        // 시작값 저장
        for (const property in properties) {
            startValues[property] = parseFloat(getComputedStyle(element)[property]) || 0;
        }
        
        const animate = (currentTime) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            
            // 이징 함수 적용
            let easedProgress;
            switch (easing) {
                case 'ease-in':
                    easedProgress = progress * progress;
                    break;
                case 'ease-out':
                    easedProgress = 1 - (1 - progress) * (1 - progress);
                    break;
                case 'ease-in-out':
                    easedProgress = progress < 0.5 
                        ? 2 * progress * progress 
                        : 1 - Math.pow(-2 * progress + 2, 2) / 2;
                    break;
                default:
                    easedProgress = progress;
            }
            
            // 속성 업데이트
            for (const property in properties) {
                const startValue = startValues[property];
                const endValue = properties[property];
                const currentValue = startValue + (endValue - startValue) * easedProgress;
                element.style[property] = currentValue + (property === 'opacity' ? '' : 'px');
            }
            
            if (progress < 1) {
                requestAnimationFrame(animate);
            } else {
                resolve();
            }
        };
        
        requestAnimationFrame(animate);
    });
};

// 전역 유틸리티 객체
window.Utils = {
    $,
    $$,
    on,
    toggleClass,
    addClass,
    removeClass,
    hasClass,
    getScrollPosition,
    getViewportSize,
    isMobile,
    isTablet,
    isDesktop,
    storage,
    formatDate,
    formatNumber,
    debounce,
    throttle,
    generateId,
    shuffleArray,
    deepClone,
    getUrlParams,
    cookies,
    logger,
    animate
};
