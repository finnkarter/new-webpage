/**
 * Discharge Calculator.js - 전역 계산기 기능
 */

class DischargeCalculator {
    constructor() {
        this.servicePeriods = {
            '육군': 18,
            '해군': 18,
            '공군': 18,
            '해병대': 18,
            '의무경찰': 21,
            '의무소방': 21,
            '사회복무': 21
        };
        
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.loadSavedData();
        this.initializeComponents();
    }

    setupEventListeners() {
        // 계산 폼 제출
        const form = document.getElementById('calculatorForm');
        if (form) {
            form.addEventListener('submit', (e) => {
                e.preventDefault();
                this.calculateDischarge();
            });
        }

        // 뒤로가기 버튼
        const backBtn = document.querySelector('.back-btn');
        if (backBtn) {
            backBtn.addEventListener('click', (e) => {
                e.preventDefault();
                window.history.back();
            });
        }

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

        // 입력 필드 변경 감지
        const enlistmentDateInput = document.getElementById('enlistmentDate');
        const serviceTypeSelect = document.getElementById('serviceType');

        if (enlistmentDateInput) {
            enlistmentDateInput.addEventListener('change', () => {
                this.saveFormData();
            });
        }

        if (serviceTypeSelect) {
            serviceTypeSelect.addEventListener('change', () => {
                this.saveFormData();
            });
        }
    }

    initializeComponents() {
        // 컴포넌트 초기화
        if (typeof initializeComponents === 'function') {
            initializeComponents();
        }
    }

    calculateDischarge() {
        const enlistmentDate = document.getElementById('enlistmentDate').value;
        const serviceType = document.getElementById('serviceType').value;

        if (!enlistmentDate) {
            this.showNotification('입대일을 선택해주세요.', 'error');
            return;
        }

        if (!serviceType) {
            this.showNotification('군종을 선택해주세요.', 'error');
            return;
        }

        // 전역일 계산
        const enlistment = new Date(enlistmentDate);
        const discharge = new Date(enlistment);
        discharge.setMonth(discharge.getMonth() + this.servicePeriods[serviceType]);

        // 오늘 날짜
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        // 복무 일수 계산
        const serviceDays = Math.floor((today - enlistment) / (1000 * 60 * 60 * 24));
        
        // 남은 일수 계산
        const remainingDays = Math.ceil((discharge - today) / (1000 * 60 * 60 * 24));
        
        // 전체 복무 기간
        const totalServiceDays = Math.ceil((discharge - enlistment) / (1000 * 60 * 60 * 24));
        
        // 진행률 계산
        const progress = Math.round((serviceDays / totalServiceDays) * 100);

        // 결과 표시
        this.displayResults({
            enlistmentDate: enlistment,
            dischargeDate: discharge,
            serviceType: serviceType,
            serviceDays: serviceDays,
            remainingDays: remainingDays,
            progress: progress,
            totalServiceDays: totalServiceDays
        });

        // 사용자 데이터 저장
        this.saveUserData(enlistmentDate, serviceType);

        this.showNotification('전역일이 계산되었습니다.', 'success');
    }

    displayResults(data) {
        // 결과 섹션 표시
        const resultsSection = document.getElementById('resultsSection');
        const detailedInfoSection = document.getElementById('detailedInfoSection');
        
        if (resultsSection) resultsSection.style.display = 'block';
        if (detailedInfoSection) detailedInfoSection.style.display = 'block';

        // 전역일 표시
        const dischargeDateEl = document.getElementById('dischargeDate');
        const dischargeDaysEl = document.getElementById('dischargeDays');
        
        if (dischargeDateEl) {
            dischargeDateEl.textContent = this.formatDate(data.dischargeDate);
        }
        if (dischargeDaysEl) {
            const daysUntilDischarge = Math.ceil((data.dischargeDate - new Date()) / (1000 * 60 * 60 * 24));
            dischargeDaysEl.textContent = `${daysUntilDischarge}일 남음`;
        }

        // 복무 일수 표시
        const serviceDaysEl = document.getElementById('serviceDays');
        if (serviceDaysEl) {
            serviceDaysEl.textContent = `${data.serviceDays}일`;
        }

        // 남은 일수 표시
        const remainingDaysEl = document.getElementById('remainingDays');
        if (remainingDaysEl) {
            remainingDaysEl.textContent = `${data.remainingDays}일`;
        }

        // 진행률 표시
        const serviceProgressEl = document.getElementById('serviceProgress');
        const progressFillEl = document.getElementById('progressFill');
        
        if (serviceProgressEl) {
            serviceProgressEl.textContent = `${data.progress}%`;
        }
        if (progressFillEl) {
            progressFillEl.style.width = `${data.progress}%`;
        }

        // 상세 정보 표시
        this.displayDetailedInfo(data);

        // 결과 섹션으로 스크롤
        setTimeout(() => {
            resultsSection.scrollIntoView({ behavior: 'smooth' });
        }, 100);
    }

    displayDetailedInfo(data) {
        // 상세 정보 업데이트
        const detailedEnlistmentDate = document.getElementById('detailedEnlistmentDate');
        const detailedServiceType = document.getElementById('detailedServiceType');
        const detailedServicePeriod = document.getElementById('detailedServicePeriod');
        const detailedDischargeDate = document.getElementById('detailedDischargeDate');
        const detailedServiceDays = document.getElementById('detailedServiceDays');
        const detailedRemainingDays = document.getElementById('detailedRemainingDays');

        if (detailedEnlistmentDate) {
            detailedEnlistmentDate.textContent = this.formatDate(data.enlistmentDate);
        }
        if (detailedServiceType) {
            detailedServiceType.textContent = data.serviceType;
        }
        if (detailedServicePeriod) {
            detailedServicePeriod.textContent = `${this.servicePeriods[data.serviceType]}개월`;
        }
        if (detailedDischargeDate) {
            detailedDischargeDate.textContent = this.formatDate(data.dischargeDate);
        }
        if (detailedServiceDays) {
            detailedServiceDays.textContent = `${data.serviceDays}일`;
        }
        if (detailedRemainingDays) {
            detailedRemainingDays.textContent = `${data.remainingDays}일`;
        }
    }

    formatDate(date) {
        return date.toLocaleDateString('ko-KR', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            weekday: 'long'
        });
    }

    saveUserData(enlistmentDate, serviceType) {
        // 메인 앱의 사용자 데이터 업데이트
        if (window.MilitaryApp) {
            window.MilitaryApp.userData.enlistmentDate = enlistmentDate;
            window.MilitaryApp.userData.serviceType = serviceType;
            window.MilitaryApp.saveUserData();
        }

        // 로컬 스토리지에도 저장
        const userData = {
            enlistmentDate: enlistmentDate,
            serviceType: serviceType,
            lastCalculated: new Date().toISOString()
        };
        Utils.storage.set('dischargeCalculatorData', userData);
    }

    saveFormData() {
        const enlistmentDate = document.getElementById('enlistmentDate').value;
        const serviceType = document.getElementById('serviceType').value;

        if (enlistmentDate && serviceType) {
            const formData = {
                enlistmentDate: enlistmentDate,
                serviceType: serviceType
            };
            Utils.storage.set('dischargeCalculatorForm', formData);
        }
    }

    loadSavedData() {
        // 저장된 폼 데이터 로드
        const savedFormData = Utils.storage.get('dischargeCalculatorForm');
        if (savedFormData) {
            const enlistmentDateInput = document.getElementById('enlistmentDate');
            const serviceTypeSelect = document.getElementById('serviceType');

            if (enlistmentDateInput && savedFormData.enlistmentDate) {
                enlistmentDateInput.value = savedFormData.enlistmentDate;
            }
            if (serviceTypeSelect && savedFormData.serviceType) {
                serviceTypeSelect.value = savedFormData.serviceType;
            }
        }

        // 저장된 계산 결과가 있으면 자동 계산
        const savedCalculatorData = Utils.storage.get('dischargeCalculatorData');
        if (savedCalculatorData && savedCalculatorData.enlistmentDate) {
            // 폼에 값 설정
            const enlistmentDateInput = document.getElementById('enlistmentDate');
            const serviceTypeSelect = document.getElementById('serviceType');

            if (enlistmentDateInput) {
                enlistmentDateInput.value = savedCalculatorData.enlistmentDate;
            }
            if (serviceTypeSelect) {
                serviceTypeSelect.value = savedCalculatorData.serviceType;
            }

            // 자동 계산 실행
            setTimeout(() => {
                this.calculateDischarge();
            }, 500);
        }
    }

    changeLanguage(lang) {
        // 언어 버튼 상태 업데이트
        const langBtns = document.querySelectorAll('.lang-btn');
        langBtns.forEach(btn => {
            btn.classList.toggle('active', btn.dataset.lang === lang);
        });

        // 메인 앱의 언어 변경 함수 호출
        if (window.MilitaryApp && window.MilitaryApp.changeLanguage) {
            window.MilitaryApp.changeLanguage(lang);
        }

        // 로컬 스토리지에 저장
        Utils.storage.set('language', lang);
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
}

// 애플리케이션 초기화
document.addEventListener('DOMContentLoaded', () => {
    window.dischargeCalculator = new DischargeCalculator();
});
