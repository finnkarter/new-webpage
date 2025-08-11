/**
 * Main.js - Application Entry Point
 * 군대 관리 시스템 메인 애플리케이션
 */

class MilitaryManagementApp {
    constructor() {
        this.isInitialized = false;
        this.currentPage = 'home';
        this.appData = {
            user: null,
            settings: {},
            notifications: []
        };
        this.init();
    }
    
    init() {
        if (this.isInitialized) return;
        
        this.setupEventListeners();
        this.loadAppData();
        this.initializeAnimations();
        this.setupServiceWorker();
        
        this.isInitialized = true;
        Utils.logger.info('Military Management App initialized');
    }
    
    setupEventListeners() {
        // 페이지 로드 완료
        Utils.on(window, 'load', this.handlePageLoad.bind(this));
        
        // 언어 변경 이벤트
        Utils.on(document, 'languageChange', this.handleLanguageChange.bind(this));
        
        // 버튼 클릭 이벤트
        Utils.on(document, 'buttonClick', this.handleButtonClick.bind(this));
        
        // 카드 클릭 이벤트
        Utils.on(document, 'cardClick', this.handleCardClick.bind(this));
        
        // 키보드 단축키
        Utils.on(document, 'keydown', this.handleKeyboardShortcuts.bind(this));
        
        // 온라인/오프라인 상태 변경
        Utils.on(window, 'online', this.handleOnlineStatus.bind(this));
        Utils.on(window, 'offline', this.handleOfflineStatus.bind(this));
        
        // 페이지 가시성 변경
        Utils.on(document, 'visibilitychange', this.handleVisibilityChange.bind(this));
    }
    
    handlePageLoad() {
        this.showWelcomeMessage();
        this.checkForUpdates();
        this.initializeOfflineCapabilities();
    }
    
    handleLanguageChange(event) {
        const { language } = event.detail;
        this.updatePageLanguage(language);
        this.saveUserPreference('language', language);
    }
    
    handleButtonClick(event) {
        const { button } = event.detail;
        const buttonText = button.element.textContent.trim();
        
        switch (buttonText) {
            case '신고하기':
                this.handleReportButton();
                break;
            default:
                Utils.logger.info(`Button clicked: ${buttonText}`);
        }
    }
    
    handleCardClick(event) {
        const { card } = event.detail;
        const cardType = this.getCardType(card.element);
        
        switch (cardType) {
            case 'news':
                this.handleNewsCardClick(card);
                break;
            case 'action':
                this.handleActionCardClick(card);
                break;
            default:
                Utils.logger.info(`Card clicked: ${cardType}`);
        }
    }
    
    handleKeyboardShortcuts(event) {
        // Ctrl/Cmd + K: 검색
        if ((event.ctrlKey || event.metaKey) && event.key === 'k') {
            event.preventDefault();
            this.openSearch();
        }
        
        // Ctrl/Cmd + M: 메뉴 토글
        if ((event.ctrlKey || event.metaKey) && event.key === 'm') {
            event.preventDefault();
            if (window.Navigation) {
                window.Navigation.toggle();
            }
        }
        
        // ESC: 메뉴 닫기
        if (event.key === 'Escape') {
            if (window.Navigation && window.Navigation.isOpen) {
                window.Navigation.close();
            }
        }
    }
    
    handleOnlineStatus() {
        Utils.logger.info('Application is online');
        this.showNotification('온라인 상태로 복구되었습니다', 'success');
        this.syncOfflineData();
    }
    
    handleOfflineStatus() {
        Utils.logger.warn('Application is offline');
        this.showNotification('오프라인 모드로 전환되었습니다', 'warning');
    }
    
    handleVisibilityChange() {
        if (document.hidden) {
            this.handlePageHidden();
        } else {
            this.handlePageVisible();
        }
    }
    
    handlePageHidden() {
        Utils.logger.info('Page hidden');
        // 페이지가 숨겨질 때 필요한 작업
    }
    
    handlePageVisible() {
        Utils.logger.info('Page visible');
        this.checkForUpdates();
    }
    
    // 신고하기 버튼 처리
    handleReportButton() {
        this.showNotification('신고 기능이 준비 중입니다', 'info');
        
        // 실제 구현에서는 모달이나 새 페이지로 이동
        setTimeout(() => {
            this.openReportModal();
        }, 1000);
    }
    
    // 뉴스 카드 클릭 처리
    handleNewsCardClick(card) {
        Utils.logger.info('News card clicked');
        this.showNotification('뉴스 상세 페이지로 이동합니다', 'info');
        
        // 카드 애니메이션
        card.animateOut().then(() => {
            // 실제 구현에서는 뉴스 상세 페이지로 이동
            this.navigateToPage('news-detail');
        });
    }
    
    // 액션 카드 클릭 처리
    handleActionCardClick(card) {
        Utils.logger.info('Action card clicked');
        this.showNotification('시스템 상세 페이지로 이동합니다', 'info');
        
        // 카드 애니메이션
        card.animateOut().then(() => {
            // 실제 구현에서는 시스템 상세 페이지로 이동
            this.navigateToPage('system-detail');
        });
    }
    
    // 카드 타입 확인
    getCardType(cardElement) {
        if (Utils.hasClass(cardElement, 'news-card')) return 'news';
        if (Utils.hasClass(cardElement, 'action-card')) return 'action';
        if (Utils.hasClass(cardElement, 'text-card')) return 'text';
        return 'unknown';
    }
    
    // 페이지 언어 업데이트
    updatePageLanguage(language) {
        // 실제 구현에서는 i18n 라이브러리 사용
        const translations = this.getTranslations(language);
        
        // 텍스트 업데이트
        this.updatePageTexts(translations);
        
        // HTML lang 속성 업데이트
        document.documentElement.lang = language.toLowerCase();
        
        Utils.logger.info(`Page language updated to: ${language}`);
    }
    
    // 번역 데이터 (간단한 예시)
    getTranslations(language) {
        const translations = {
            'KO': {
                'title': '군대 관리 시스템',
                'report': '신고하기',
                'menu': '메뉴',
                'news': '뉴스 전체보기',
                'system': '시스템 자세히 보기'
            },
            'EN': {
                'title': 'Military Management System',
                'report': 'Report',
                'menu': 'Menu',
                'news': 'View All News',
                'system': 'View System Details'
            }
        };
        
        return translations[language] || translations['KO'];
    }
    
    // 페이지 텍스트 업데이트
    updatePageTexts(translations) {
        // 제목 업데이트
        const title = Utils.$('title');
        if (title) {
            title.textContent = translations.title;
        }
        
        // 버튼 텍스트 업데이트
        const reportBtn = Utils.$('.btn-primary span');
        if (reportBtn) {
            reportBtn.textContent = translations.report;
        }
        
        // 메뉴 버튼 텍스트 업데이트
        const menuBtn = Utils.$('.menu-btn span');
        if (menuBtn) {
            menuBtn.textContent = translations.menu;
        }
    }
    
    // 앱 데이터 로드
    loadAppData() {
        // 로컬 스토리지에서 데이터 로드
        this.appData.settings = Utils.storage.get('appSettings', {});
        this.appData.user = Utils.storage.get('user', null);
        this.appData.notifications = Utils.storage.get('notifications', []);
        
        Utils.logger.info('App data loaded');
    }
    
    // 사용자 설정 저장
    saveUserPreference(key, value) {
        this.appData.settings[key] = value;
        Utils.storage.set('appSettings', this.appData.settings);
        Utils.logger.info(`User preference saved: ${key} = ${value}`);
    }
    
    // 애니메이션 초기화
    initializeAnimations() {
        // 페이지 로드 애니메이션
        this.animatePageLoad();
        
        // 스크롤 애니메이션
        this.setupScrollAnimations();
    }
    
    // 페이지 로드 애니메이션
    animatePageLoad() {
        const heroSection = Utils.$('.hero-section');
        const infoCards = Utils.$$('.info-card');
        
        if (heroSection) {
            Utils.animate(heroSection, {
                opacity: 1,
                transform: 'translateY(0)'
            }, 800, 'ease-out');
        }
        
        // 카드들 순차 애니메이션
        infoCards.forEach((card, index) => {
            setTimeout(() => {
                Utils.animate(card, {
                    opacity: 1,
                    transform: 'translateY(0)'
                }, 600, 'ease-out');
            }, 200 * (index + 1));
        });
    }
    
    // 스크롤 애니메이션 설정
    setupScrollAnimations() {
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        Utils.addClass(entry.target, 'animate-in');
                    }
                });
            },
            { threshold: 0.1, rootMargin: '0px 0px -50px 0px' }
        );
        
        // 애니메이션 대상 요소들
        const animatedElements = Utils.$$('.info-card, .hero-section');
        animatedElements.forEach(el => {
            el.style.opacity = '0';
            el.style.transform = 'translateY(30px)';
            observer.observe(el);
        });
    }
    
    // 서비스 워커 설정 (오프라인 지원)
    setupServiceWorker() {
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.register('/sw.js')
                .then(registration => {
                    Utils.logger.info('Service Worker registered:', registration);
                })
                .catch(error => {
                    Utils.logger.error('Service Worker registration failed:', error);
                });
        }
    }
    
    // 오프라인 기능 초기화
    initializeOfflineCapabilities() {
        // 오프라인 데이터 저장
        this.setupOfflineStorage();
        
        // 오프라인 상태 표시
        if (!navigator.onLine) {
            this.handleOfflineStatus();
        }
    }
    
    // 오프라인 스토리지 설정
    setupOfflineStorage() {
        // 중요한 데이터를 로컬에 저장
        const offlineData = {
            lastSync: new Date().toISOString(),
            version: '1.0.0'
        };
        
        Utils.storage.set('offlineData', offlineData);
    }
    
    // 오프라인 데이터 동기화
    syncOfflineData() {
        const offlineData = Utils.storage.get('offlineData');
        if (offlineData) {
            Utils.logger.info('Syncing offline data...');
            // 실제 구현에서는 서버와 동기화
        }
    }
    
    // 업데이트 확인
    checkForUpdates() {
        // 실제 구현에서는 서버에서 업데이트 확인
        Utils.logger.info('Checking for updates...');
    }
    
    // 환영 메시지 표시
    showWelcomeMessage() {
        const isFirstVisit = !Utils.storage.get('hasVisited');
        if (isFirstVisit) {
            this.showNotification('군대 관리 시스템에 오신 것을 환영합니다!', 'success');
            Utils.storage.set('hasVisited', true);
        }
    }
    
    // 알림 표시
    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <span class="notification-message">${message}</span>
                <button class="notification-close">&times;</button>
            </div>
        `;
        
        // 스타일 추가
        if (!document.querySelector('#notification-styles')) {
            const style = document.createElement('style');
            style.id = 'notification-styles';
            style.textContent = `
                .notification {
                    position: fixed;
                    top: 20px;
                    right: 20px;
                    background: var(--color-card);
                    border: 1px solid var(--color-border);
                    border-radius: var(--radius-md);
                    padding: var(--spacing-md);
                    box-shadow: var(--shadow-lg);
                    z-index: var(--z-tooltip);
                    transform: translateX(100%);
                    transition: transform 0.3s ease;
                    max-width: 300px;
                }
                
                .notification.show {
                    transform: translateX(0);
                }
                
                .notification-content {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    gap: var(--spacing-sm);
                }
                
                .notification-message {
                    color: var(--color-text-primary);
                    font-size: var(--font-size-sm);
                }
                
                .notification-close {
                    background: none;
                    border: none;
                    color: var(--color-text-muted);
                    cursor: pointer;
                    font-size: var(--font-size-lg);
                    padding: 0;
                    width: 20px;
                    height: 20px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }
                
                .notification-close:hover {
                    color: var(--color-text-primary);
                }
                
                .notification-success {
                    border-color: #10B981;
                }
                
                .notification-warning {
                    border-color: #F59E0B;
                }
                
                .notification-error {
                    border-color: #EF4444;
                }
            `;
            document.head.appendChild(style);
        }
        
        document.body.appendChild(notification);
        
        // 애니메이션
        setTimeout(() => {
            Utils.addClass(notification, 'show');
        }, 100);
        
        // 닫기 버튼 이벤트
        const closeBtn = notification.querySelector('.notification-close');
        Utils.on(closeBtn, 'click', () => {
            Utils.removeClass(notification, 'show');
            setTimeout(() => {
                notification.remove();
            }, 300);
        });
        
        // 자동 닫기
        setTimeout(() => {
            if (notification.parentNode) {
                Utils.removeClass(notification, 'show');
                setTimeout(() => {
                    notification.remove();
                }, 300);
            }
        }, 5000);
    }
    
    // 검색 열기
    openSearch() {
        this.showNotification('검색 기능이 준비 중입니다', 'info');
    }
    
    // 신고 모달 열기
    openReportModal() {
        this.showNotification('신고 모달이 열렸습니다', 'info');
    }
    
    // 페이지 이동
    navigateToPage(page) {
        this.currentPage = page;
        Utils.logger.info(`Navigating to page: ${page}`);
        
        // 실제 구현에서는 라우터 사용
        this.showNotification(`${page} 페이지로 이동합니다`, 'info');
    }
}

// 애플리케이션 초기화
let app;

if (document.readyState === 'loading') {
    Utils.on(document, 'DOMContentLoaded', () => {
        app = new MilitaryManagementApp();
    });
} else {
    app = new MilitaryManagementApp();
}

// 전역 객체로 노출
window.MilitaryApp = app;
