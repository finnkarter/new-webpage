/**
 * MILBASE Utilities
 * 군대 개인 대시보드를 위한 유틸리티 함수들
 */

// === DOM 조작 유틸리티 ===
const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => document.querySelectorAll(selector);

// === 이벤트 유틸리티 ===
const on = (element, event, handler, options = {}) => {
    if (typeof element === 'string') {
        element = $(element);
    }
    if (element) {
        element.addEventListener(event, handler, options);
    }
};

const off = (element, event, handler) => {
    if (typeof element === 'string') {
        element = $(element);
    }
    if (element) {
        element.removeEventListener(event, handler);
    }
};

// === 클래스 조작 유틸리티 ===
const addClass = (element, className) => {
    if (typeof element === 'string') {
        element = $(element);
    }
    if (element) {
        element.classList.add(className);
    }
};

const removeClass = (element, className) => {
    if (typeof element === 'string') {
        element = $(element);
    }
    if (element) {
        element.classList.remove(className);
    }
};

const toggleClass = (element, className) => {
    if (typeof element === 'string') {
        element = $(element);
    }
    if (element) {
        element.classList.toggle(className);
    }
};

const hasClass = (element, className) => {
    if (typeof element === 'string') {
        element = $(element);
    }
    return element ? element.classList.contains(className) : false;
};

// === 로컬 스토리지 유틸리티 ===
const storage = {
    set: (key, value) => {
        try {
            localStorage.setItem(key, JSON.stringify(value));
            return true;
        } catch (error) {
            console.warn('LocalStorage write failed:', error);
            return false;
        }
    },
    
    get: (key, defaultValue = null) => {
        try {
            const item = localStorage.getItem(key);
            return item !== null ? JSON.parse(item) : defaultValue;
        } catch (error) {
            console.warn('LocalStorage read failed:', error);
            return defaultValue;
        }
    },
    
    remove: (key) => {
        try {
            localStorage.removeItem(key);
            return true;
        } catch (error) {
            console.warn('LocalStorage remove failed:', error);
            return false;
        }
    },
    
    clear: () => {
        try {
            localStorage.clear();
            return true;
        } catch (error) {
            console.warn('LocalStorage clear failed:', error);
            return false;
        }
    }
};

// === 날짜 유틸리티 ===
const formatDate = (date, format = 'ko-KR') => {
    if (!(date instanceof Date)) {
        date = new Date(date);
    }
    
    const options = {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        weekday: 'long'
    };
    
    return date.toLocaleDateString(format, options);
};

const formatTime = (date, format = 'ko-KR') => {
    if (!(date instanceof Date)) {
        date = new Date(date);
    }
    
    const options = {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false
    };
    
    return date.toLocaleTimeString(format, options);
};

const formatDateTime = (date, format = 'ko-KR') => {
    return `${formatDate(date, format)} ${formatTime(date, format)}`;
};

const getDaysBetween = (startDate, endDate) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end - start);
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

const addDays = (date, days) => {
    const result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
};

const addMonths = (date, months) => {
    const result = new Date(date);
    result.setMonth(result.getMonth() + months);
    return result;
};

// === 디바운스/스로틀 유틸리티 ===
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

const throttle = (func, limit) => {
    let inThrottle;
    return function executedFunction(...args) {
        if (!inThrottle) {
            func.apply(this, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
};

// === 텍스트 유틸리티 ===
const truncate = (text, length = 100, suffix = '...') => {
    if (text.length <= length) return text;
    return text.substring(0, length).trim() + suffix;
};

const capitalize = (text) => {
    return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
};

const slugify = (text) => {
    return text
        .toLowerCase()
        .replace(/[^\w\s-]/g, '')
        .replace(/[\s_-]+/g, '-')
        .replace(/^-+|-+$/g, '');
};

// === 숫자 유틸리티 ===
const formatNumber = (number, locale = 'ko-KR') => {
    return new Intl.NumberFormat(locale).format(number);
};

const clamp = (number, min, max) => {
    return Math.min(Math.max(number, min), max);
};

const random = (min = 0, max = 1) => {
    return Math.random() * (max - min) + min;
};

const randomInt = (min, max) => {
    return Math.floor(random(min, max + 1));
};

// === 배열 유틸리티 ===
const shuffle = (array) => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
};

const chunk = (array, size) => {
    const chunks = [];
    for (let i = 0; i < array.length; i += size) {
        chunks.push(array.slice(i, i + size));
    }
    return chunks;
};

const unique = (array) => {
    return [...new Set(array)];
};

// === 객체 유틸리티 ===
const deepClone = (obj) => {
    if (obj === null || typeof obj !== 'object') return obj;
    if (obj instanceof Date) return new Date(obj.getTime());
    if (obj instanceof Array) return obj.map(item => deepClone(item));
    if (typeof obj === 'object') {
        const cloned = {};
        Object.keys(obj).forEach(key => {
            cloned[key] = deepClone(obj[key]);
        });
        return cloned;
    }
    return obj;
};

const merge = (target, ...sources) => {
    if (!sources.length) return target;
    const source = sources.shift();
    
    if (isObject(target) && isObject(source)) {
        for (const key in source) {
            if (isObject(source[key])) {
                if (!target[key]) Object.assign(target, { [key]: {} });
                merge(target[key], source[key]);
            } else {
                Object.assign(target, { [key]: source[key] });
            }
        }
    }
    
    return merge(target, ...sources);
};

const isObject = (item) => {
    return item && typeof item === 'object' && !Array.isArray(item);
};

// === 브라우저 유틸리티 ===
const isMobile = () => {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
};

const isOnline = () => {
    return navigator.onLine;
};

const copyToClipboard = async (text) => {
    try {
        await navigator.clipboard.writeText(text);
        return true;
    } catch (error) {
        console.warn('Clipboard write failed:', error);
        return false;
    }
};

// === 애니메이션 유틸리티 ===
const animate = (element, keyframes, options = {}) => {
    if (typeof element === 'string') {
        element = $(element);
    }
    
    if (!element) return Promise.resolve();
    
    const defaultOptions = {
        duration: 300,
        easing: 'ease',
        fill: 'both'
    };
    
    const animationOptions = { ...defaultOptions, ...options };
    
    return element.animate(keyframes, animationOptions).finished;
};

const fadeIn = (element, duration = 300) => {
    return animate(element, [
        { opacity: 0 },
        { opacity: 1 }
    ], { duration });
};

const fadeOut = (element, duration = 300) => {
    return animate(element, [
        { opacity: 1 },
        { opacity: 0 }
    ], { duration });
};

const slideUp = (element, duration = 300) => {
    return animate(element, [
        { transform: 'translateY(20px)', opacity: 0 },
        { transform: 'translateY(0)', opacity: 1 }
    ], { duration });
};

// === 전역 유틸리티 객체 ===
window.Utils = {
    // DOM
    $, $$, on, off,
    
    // Classes
    addClass, removeClass, toggleClass, hasClass,
    
    // Storage
    storage,
    
    // Dates
    formatDate, formatTime, formatDateTime,
    getDaysBetween, addDays, addMonths,
    
    // Performance
    debounce, throttle,
    
    // Text
    truncate, capitalize, slugify,
    
    // Numbers
    formatNumber, clamp, random, randomInt,
    
    // Arrays
    shuffle, chunk, unique,
    
    // Objects
    deepClone, merge, isObject,
    
    // Browser
    isMobile, isOnline, copyToClipboard,
    
    // Animation
    animate, fadeIn, fadeOut, slideUp
};

// === 초기화 ===
console.log('🎖️ MILBASE Utils loaded');