/**
 * Main.js - Application Entry Point
 * 군대 개인 대시보드 메인 애플리케이션
 */

class MilitaryDashboardApp {
    constructor() {
        this.currentLanguage = 'ko';
        this.userData = {
            name: '군인',
            enlistmentDate: null,
            serviceType: '육군', // 육군, 해군, 공군, 해병대
            rank: '이병',
            unit: '',
            contact: ''
        };
        this.appData = {
            memos: [],
            schedules: [],
            tips: [],
            lastUpdated: new Date().toISOString()
        };
        this.translations = {
            ko: {
                welcome: '안녕하세요, {name}님!',
                serviceDays: '복무 일수',
                daysToDischarge: '전역까지',
                serviceProgress: '복무 진행률',
                days: '일',
                percent: '%',
                quickActions: '빠른 실행',
                dischargeCheck: '전역일 확인',
                writeMemo: '메모 작성',
                addSchedule: '일정 추가',
                offlineMode: '오프라인 모드',
                onlineMode: '온라인 모드'
            },
            en: {
                welcome: 'Hello, {name}!',
                serviceDays: 'Service Days',
                daysToDischarge: 'Days to Discharge',
                serviceProgress: 'Service Progress',
                days: 'days',
                percent: '%',
                quickActions: 'Quick Actions',
                dischargeCheck: 'Check Discharge Date',
                writeMemo: 'Write Memo',
                addSchedule: 'Add Schedule',
                offlineMode: 'Offline Mode',
                onlineMode: 'Online Mode'
            }
        };
    }

    init() {
        this.loadUserData();
        this.loadAppData();
        this.setupEventListeners();
        this.updateDashboard();
        this.startClock();
        this.setupServiceWorker();
        this.checkOnlineStatus();
        
        // 컴포넌트 초기화
        if (typeof initializeComponents === 'function') {
            initializeComponents();
        }
        
        console.log('군대 개인 대시보드가 초기화되었습니다.');
    }

    setupEventListeners() {
        // 페이지 로드
        document.addEventListener('DOMContentLoaded', () => {
            this.updateDashboard();
        });

        // 언어 변경
        const languageSelector = document.getElementById('languageSelector');
        if (languageSelector) {
            languageSelector.addEventListener('click', (e) => {
                if (e.target.classList.contains('lang-btn')) {
                    this.changeLanguage(e.target.dataset.lang);
                }
            });
        }

        // 메뉴 버튼
        const menuBtn = document.getElementById('menuBtn');
        const navClose = document.getElementById('navClose');
        const navigation = document.getElementById('navigation');

        if (menuBtn) {
            menuBtn.addEventListener('click', () => {
                navigation.classList.add('active');
                document.body.style.overflow = 'hidden';
            });
        }

        if (navClose) {
            navClose.addEventListener('click', () => {
                navigation.classList.remove('active');
                document.body.style.overflow = '';
            });
        }

        // 기능 카드 클릭
        const featureCards = document.querySelectorAll('.feature-card');
        featureCards.forEach(card => {
            card.addEventListener('click', (e) => {
                const page = card.dataset.page;
                this.navigateToPage(page);
            });
        });

        // 빠른 실행 버튼
        const quickDischargeBtn = document.getElementById('quickDischargeBtn');
        const quickMemoBtn = document.getElementById('quickMemoBtn');
        const quickScheduleBtn = document.getElementById('quickScheduleBtn');

        if (quickDischargeBtn) {
            quickDischargeBtn.addEventListener('click', () => {
                this.showDischargeCalculator();
            });
        }

        if (quickMemoBtn) {
            quickMemoBtn.addEventListener('click', () => {
                this.showMemoEditor();
            });
        }

        if (quickScheduleBtn) {
            quickScheduleBtn.addEventListener('click', () => {
                this.showScheduleEditor();
            });
        }

        // 키보드 단축키
        document.addEventListener('keydown', (e) => {
            this.handleKeyboardShortcuts(e);
        });

        // 온라인/오프라인 상태 변경
        window.addEventListener('online', () => {
            this.updateOnlineStatus(true);
        });

        window.addEventListener('offline', () => {
            this.updateOnlineStatus(false);
        });

        // 페이지 가시성 변경
        document.addEventListener('visibilitychange', () => {
            if (!document.hidden) {
                this.updateDashboard();
            }
        });
    }

    updateDashboard() {
        this.updateWelcomeMessage();
        this.updateStatistics();
        this.updateCurrentTime();
    }

    updateWelcomeMessage() {
        const userName = document.getElementById('userName');
        if (userName) {
            const translation = this.translations[this.currentLanguage].welcome;
            userName.textContent = this.userData.name;
        }
    }

    updateStatistics() {
        if (!this.userData.enlistmentDate) {
            this.showNotification('입대일을 설정해주세요.', 'info');
            return;
        }

        const enlistmentDate = new Date(this.userData.enlistmentDate);
        const today = new Date();
        const serviceDays = Math.floor((today - enlistmentDate) / (1000 * 60 * 60 * 24));
        
        // 전역일 계산 (육군 기준 18개월)
        const dischargeDate = new Date(enlistmentDate);
        dischargeDate.setMonth(dischargeDate.getMonth() + 18);
        
        const daysToDischarge = Math.ceil((dischargeDate - today) / (1000 * 60 * 60 * 24));
        const totalServiceDays = Math.ceil((dischargeDate - enlistmentDate) / (1000 * 60 * 60 * 24));
        const serviceProgress = Math.round((serviceDays / totalServiceDays) * 100);

        // 통계 업데이트
        const serviceDaysEl = document.getElementById('serviceDays');
        const daysToDischargeEl = document.getElementById('daysToDischarge');
        const serviceProgressEl = document.getElementById('serviceProgress');

        if (serviceDaysEl) {
            serviceDaysEl.textContent = `${serviceDays}일`;
        }
        if (daysToDischargeEl) {
            daysToDischargeEl.textContent = `${daysToDischarge}일`;
        }
        if (serviceProgressEl) {
            serviceProgressEl.textContent = `${serviceProgress}%`;
        }
    }

    updateCurrentTime() {
        const currentTimeEl = document.getElementById('currentTime');
        if (currentTimeEl) {
            const now = new Date();
            const timeString = now.toLocaleString('ko-KR', {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit'
            });
            currentTimeEl.textContent = timeString;
        }
    }

    startClock() {
        setInterval(() => {
            this.updateCurrentTime();
        }, 1000);
    }

    changeLanguage(lang) {
        this.currentLanguage = lang;
        
        // 언어 버튼 상태 업데이트
        const langBtns = document.querySelectorAll('.lang-btn');
        langBtns.forEach(btn => {
            btn.classList.toggle('active', btn.dataset.lang === lang);
        });

        // 페이지 번역
        this.translatePage();
        
        // 로컬 스토리지에 저장
        Utils.storage.set('language', lang);
        
        this.showNotification(`언어가 ${lang === 'ko' ? '한국어' : 'English'}로 변경되었습니다.`, 'success');
    }

    translatePage() {
        const elements = document.querySelectorAll('[data-translate]');
        elements.forEach(element => {
            const key = element.dataset.translate;
            const translation = this.translations[this.currentLanguage][key];
            if (translation) {
                element.textContent = translation;
            }
        });
    }

    navigateToPage(page) {
        // 실제 페이지로 이동하는 대신 모달이나 새 섹션으로 표시
        switch (page) {
            case 'discharge-calculator':
                this.showDischargeCalculator();
                break;
            case 'schedule':
                this.showScheduleManager();
                break;
            case 'profile':
                this.showProfileManager();
                break;
            case 'tips':
                this.showTipsManager();
                break;
            case 'memo':
                this.showMemoManager();
                break;
            case 'dictionary':
                this.showDictionary();
                break;
            default:
                this.showNotification('페이지를 준비 중입니다.', 'info');
        }
    }

    showDischargeCalculator() {
        if (!this.userData.enlistmentDate) {
            this.showEnlistmentDateModal();
        } else {
            this.showNotification('전역 계산기 기능을 준비 중입니다.', 'info');
        }
    }

    showEnlistmentDateModal() {
        const modal = document.createElement('div');
        modal.className = 'modal';
        modal.innerHTML = `
            <div class="modal-content">
                <h3>입대일 설정</h3>
                <p>전역 계산을 위해 입대일을 설정해주세요.</p>
                <input type="date" id="enlistmentDateInput" required>
                <div class="modal-actions">
                    <button class="btn-secondary" onclick="this.closest('.modal').remove()">취소</button>
                    <button class="btn-primary" onclick="app.saveEnlistmentDate()">저장</button>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
    }

    saveEnlistmentDate() {
        const input = document.getElementById('enlistmentDateInput');
        if (input && input.value) {
            this.userData.enlistmentDate = input.value;
            this.saveUserData();
            this.updateDashboard();
            document.querySelector('.modal').remove();
            this.showNotification('입대일이 저장되었습니다.', 'success');
        }
    }

    showMemoEditor() {
        this.showNotification('메모장 기능을 준비 중입니다.', 'info');
    }

    showScheduleEditor() {
        this.showNotification('일정 관리 기능을 준비 중입니다.', 'info');
    }

    showScheduleManager() {
        this.showNotification('일정 관리 페이지를 준비 중입니다.', 'info');
    }

    showProfileManager() {
        this.showNotification('개인 정보 관리 페이지를 준비 중입니다.', 'info');
    }

    showTipsManager() {
        this.showNotification('군대 팁 페이지를 준비 중입니다.', 'info');
    }

    showMemoManager() {
        this.showNotification('메모장 페이지를 준비 중입니다.', 'info');
    }

    showDictionary() {
        this.showNotification('용어 사전 페이지를 준비 중입니다.', 'info');
    }

    handleKeyboardShortcuts(e) {
        // Ctrl/Cmd + K: 검색
        if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
            e.preventDefault();
            this.showSearch();
        }
        
        // Ctrl/Cmd + M: 메뉴 토글
        if ((e.ctrlKey || e.metaKey) && e.key === 'm') {
            e.preventDefault();
            const navigation = document.getElementById('navigation');
            navigation.classList.toggle('active');
        }
        
        // ESC: 메뉴 닫기
        if (e.key === 'Escape') {
            const navigation = document.getElementById('navigation');
            navigation.classList.remove('active');
            document.body.style.overflow = '';
        }
    }

    showSearch() {
        this.showNotification('검색 기능을 준비 중입니다.', 'info');
    }

    showNotification(message, type = 'info') {
        const container = document.getElementById('notificationContainer');
        if (!container) return;

        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        
        const icons = {
            success: '✅',
            error: '❌',
            warning: '⚠️',
            info: 'ℹ️'
        };

        notification.innerHTML = `
            <div class="notification-icon">${icons[type] || icons.info}</div>
            <div class="notification-content">
                <div class="notification-title">알림</div>
                <div class="notification-message">${message}</div>
            </div>
            <button class="notification-close" onclick="this.parentElement.remove()">×</button>
        `;

        container.appendChild(notification);

        // 5초 후 자동 제거
        setTimeout(() => {
            if (notification.parentElement) {
                notification.classList.add('removing');
                setTimeout(() => {
                    if (notification.parentElement) {
                        notification.remove();
                    }
                }, 300);
            }
        }, 5000);
    }

    updateOnlineStatus(isOnline) {
        const navStatus = document.getElementById('navStatus');
        if (navStatus) {
            const status = isOnline ? 
                this.translations[this.currentLanguage].onlineMode : 
                this.translations[this.currentLanguage].offlineMode;
            navStatus.textContent = status;
        }

        this.showNotification(
            isOnline ? '인터넷 연결이 복구되었습니다.' : '오프라인 모드로 전환되었습니다.',
            isOnline ? 'success' : 'warning'
        );
    }

    checkOnlineStatus() {
        this.updateOnlineStatus(navigator.onLine);
    }

    loadUserData() {
        const saved = Utils.storage.get('userData');
        if (saved) {
            this.userData = { ...this.userData, ...saved };
        }
    }

    saveUserData() {
        Utils.storage.set('userData', this.userData);
    }

    loadAppData() {
        const saved = Utils.storage.get('appData');
        if (saved) {
            this.appData = { ...this.appData, ...saved };
        }
    }

    saveAppData() {
        this.appData.lastUpdated = new Date().toISOString();
        Utils.storage.set('appData', this.appData);
    }

    setupServiceWorker() {
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.register('sw.js')
                .then(registration => {
                    console.log('Service Worker 등록 성공:', registration);
                })
                .catch(error => {
                    console.log('Service Worker 등록 실패:', error);
                });
        }
    }
}

// 애플리케이션 초기화
let app;

document.addEventListener('DOMContentLoaded', () => {
    app = new MilitaryDashboardApp();
    app.init();
});

// 전역 접근을 위한 설정
window.MilitaryApp = app;
