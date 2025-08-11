/**
 * MILBASE Application
 * 군대 개인 대시보드 메인 애플리케이션
 */

class MilbaseApp {
    constructor() {
        this.data = {
            user: {
                name: '병사',
                rank: '이병',
                unit: '',
                enlistmentDate: null,
                serviceType: '육군'
            },
            settings: {
                theme: 'dark',
                language: 'ko',
                notifications: true
            }
        };
        
        this.servicePeriods = {
            '육군': 18,
            '해군': 18,
            '공군': 18,
            '해병대': 18,
            '의무경찰': 21,
            '의무소방': 21,
            '사회복무': 21
        };
        
        this.progressBar = null;
        this.init();
    }
    
    init() {
        this.loadData();
        this.setupEventListeners();
        this.updateUI();
        this.checkOnlineStatus();
        
        console.log('🎖️ MILBASE Application started');
    }
    
    // === 데이터 관리 ===
    loadData() {
        const savedData = Utils.storage.get('milbase_data');
        if (savedData) {
            this.data = Utils.merge(this.data, savedData);
        }
    }
    
    saveData() {
        Utils.storage.set('milbase_data', this.data);
    }
    
    // === 이벤트 리스너 설정 ===
    setupEventListeners() {
        // 기능 카드 클릭
        Utils.$$('.feature-card').forEach(card => {
            Utils.on(card, 'click', () => {
                const feature = card.dataset.feature;
                this.handleFeatureClick(feature);
            });
        });
        
        // 빠른 실행 버튼
        Utils.on('#quickCalculator', 'click', () => this.showCalculator());
        Utils.on('#quickMemo', 'click', () => this.showMemo());
        Utils.on('#quickSchedule', 'click', () => this.showSchedule());
        
        // 온라인/오프라인 상태 변경
        Utils.on(window, 'online', () => this.updateConnectionStatus(true));
        Utils.on(window, 'offline', () => this.updateConnectionStatus(false));
        
        // 페이지 가시성 변경
        Utils.on(document, 'visibilitychange', () => {
            if (!document.hidden) {
                this.updateUI();
            }
        });
    }
    
    // === UI 업데이트 ===
    updateUI() {
        this.updateUserInfo();
        this.updateStats();
        this.updateConnectionStatus(Utils.isOnline());
    }
    
    updateUserInfo() {
        const userNameEl = Utils.$('#userName');
        if (userNameEl) {
            userNameEl.textContent = this.data.user.name;
        }
    }
    
    updateStats() {
        if (!this.data.user.enlistmentDate) {
            this.showEmptyStats();
            return;
        }
        
        const stats = this.calculateServiceStats();
        
        // 통계 업데이트
        const serviceDaysEl = Utils.$('#serviceDays');
        const remainingDaysEl = Utils.$('#remainingDays');
        const progressPercentEl = Utils.$('#progressPercent');
        
        if (serviceDaysEl) serviceDaysEl.textContent = `${stats.serviceDays}일`;
        if (remainingDaysEl) remainingDaysEl.textContent = `${stats.remainingDays}일`;
        if (progressPercentEl) progressPercentEl.textContent = `${stats.progress}%`;
        
        // 진행률 바 업데이트
        if (!this.progressBar) {
            this.progressBar = new ProgressBar('#progressBar');
        }
        this.progressBar.setValue(stats.progress);
    }
    
    showEmptyStats() {
        const serviceDaysEl = Utils.$('#serviceDays');
        const remainingDaysEl = Utils.$('#remainingDays');
        const progressPercentEl = Utils.$('#progressPercent');
        
        if (serviceDaysEl) serviceDaysEl.textContent = '--';
        if (remainingDaysEl) remainingDaysEl.textContent = '--';
        if (progressPercentEl) progressPercentEl.textContent = '--%';
        
        if (this.progressBar) {
            this.progressBar.setValue(0, false);
        }
    }
    
    calculateServiceStats() {
        const enlistmentDate = new Date(this.data.user.enlistmentDate);
        const today = new Date();
        const serviceMonths = this.servicePeriods[this.data.user.serviceType] || 18;
        const dischargeDate = Utils.addMonths(enlistmentDate, serviceMonths);
        
        const serviceDays = Utils.getDaysBetween(enlistmentDate, today);
        const remainingDays = Utils.getDaysBetween(today, dischargeDate);
        const totalDays = Utils.getDaysBetween(enlistmentDate, dischargeDate);
        const progress = Math.min(Math.round((serviceDays / totalDays) * 100), 100);
        
        return {
            serviceDays: Math.max(0, serviceDays),
            remainingDays: Math.max(0, remainingDays),
            progress: Math.max(0, progress),
            dischargeDate,
            totalDays
        };
    }
    
    updateConnectionStatus(isOnline) {
        const statusEl = Utils.$('#connectionStatus');
        if (statusEl) {
            statusEl.textContent = isOnline ? '온라인' : '오프라인';
            statusEl.style.color = isOnline ? 'var(--success)' : 'var(--warning)';
        }
    }
    
    // === 기능 핸들러 ===
    handleFeatureClick(feature) {
        const actions = {
            calculator: () => this.showCalculator(),
            schedule: () => this.showSchedule(),
            profile: () => this.showProfile(),
            memo: () => this.showMemo(),
            tips: () => this.showTips(),
            dictionary: () => this.showDictionary()
        };
        
        const action = actions[feature];
        if (action) {
            action();
        } else {
            window.toast?.show(`${feature} 기능을 준비 중입니다.`, 'info');
        }
    }
    
    showCalculator() {
        if (!this.data.user.enlistmentDate) {
            this.showEnlistmentDatePrompt();
        } else {
            window.toast?.show('전역 계산기를 표시합니다.', 'info');
            // TODO: 전역 계산기 모달 또는 페이지 표시
        }
    }
    
    showSchedule() {
        window.toast?.show('일정 관리 기능을 준비 중입니다.', 'info');
    }
    
    showProfile() {
        this.showProfileEditor();
    }
    
    showMemo() {
        window.toast?.show('메모장 기능을 준비 중입니다.', 'info');
    }
    
    showTips() {
        window.toast?.show('군생활 팁 기능을 준비 중입니다.', 'info');
    }
    
    showDictionary() {
        window.toast?.show('용어 사전 기능을 준비 중입니다.', 'info');
    }
    
    // === 모달 및 프롬프트 ===
    showEnlistmentDatePrompt() {
        const modal = this.createModal('입대일 설정', `
            <p style="margin-bottom: 1rem; color: var(--color-text-muted);">
                전역 계산을 위해 입대일을 설정해주세요.
            </p>
            <div style="margin-bottom: 1rem;">
                <label style="display: block; margin-bottom: 0.5rem; font-weight: 500;">입대일</label>
                <input type="date" id="enlistmentDateInput" style="
                    width: 100%;
                    padding: 0.75rem;
                    border: 1px solid var(--color-border);
                    border-radius: var(--radius-lg);
                    background: var(--color-card);
                    color: var(--color-text);
                    font-size: 1rem;
                ">
            </div>
            <div style="margin-bottom: 1rem;">
                <label style="display: block; margin-bottom: 0.5rem; font-weight: 500;">군종</label>
                <select id="serviceTypeInput" style="
                    width: 100%;
                    padding: 0.75rem;
                    border: 1px solid var(--color-border);
                    border-radius: var(--radius-lg);
                    background: var(--color-card);
                    color: var(--color-text);
                    font-size: 1rem;
                ">
                    <option value="육군">육군 (18개월)</option>
                    <option value="해군">해군 (18개월)</option>
                    <option value="공군">공군 (18개월)</option>
                    <option value="해병대">해병대 (18개월)</option>
                    <option value="의무경찰">의무경찰 (21개월)</option>
                    <option value="의무소방">의무소방 (21개월)</option>
                    <option value="사회복무">사회복무 (21개월)</option>
                </select>
            </div>
        `, [
            {
                text: '취소',
                type: 'secondary',
                action: () => this.closeModal()
            },
            {
                text: '저장',
                type: 'primary',
                action: () => this.saveEnlistmentDate()
            }
        ]);
        
        // 기본값 설정
        const serviceTypeInput = modal.querySelector('#serviceTypeInput');
        if (serviceTypeInput) {
            serviceTypeInput.value = this.data.user.serviceType;
        }
    }
    
    showProfileEditor() {
        const modal = this.createModal('개인 정보 수정', `
            <div style="margin-bottom: 1rem;">
                <label style="display: block; margin-bottom: 0.5rem; font-weight: 500;">이름</label>
                <input type="text" id="nameInput" value="${this.data.user.name}" style="
                    width: 100%;
                    padding: 0.75rem;
                    border: 1px solid var(--color-border);
                    border-radius: var(--radius-lg);
                    background: var(--color-card);
                    color: var(--color-text);
                    font-size: 1rem;
                ">
            </div>
            <div style="margin-bottom: 1rem;">
                <label style="display: block; margin-bottom: 0.5rem; font-weight: 500;">계급</label>
                <input type="text" id="rankInput" value="${this.data.user.rank}" style="
                    width: 100%;
                    padding: 0.75rem;
                    border: 1px solid var(--color-border);
                    border-radius: var(--radius-lg);
                    background: var(--color-card);
                    color: var(--color-text);
                    font-size: 1rem;
                ">
            </div>
            <div style="margin-bottom: 1rem;">
                <label style="display: block; margin-bottom: 0.5rem; font-weight: 500;">부대</label>
                <input type="text" id="unitInput" value="${this.data.user.unit}" style="
                    width: 100%;
                    padding: 0.75rem;
                    border: 1px solid var(--color-border);
                    border-radius: var(--radius-lg);
                    background: var(--color-card);
                    color: var(--color-text);
                    font-size: 1rem;
                ">
            </div>
        `, [
            {
                text: '취소',
                type: 'secondary',
                action: () => this.closeModal()
            },
            {
                text: '저장',
                type: 'primary',
                action: () => this.saveProfile()
            }
        ]);
    }
    
    saveEnlistmentDate() {
        const dateInput = Utils.$('#enlistmentDateInput');
        const typeInput = Utils.$('#serviceTypeInput');
        
        if (!dateInput?.value) {
            window.toast?.show('입대일을 선택해주세요.', 'error');
            return;
        }
        
        this.data.user.enlistmentDate = dateInput.value;
        this.data.user.serviceType = typeInput?.value || '육군';
        this.saveData();
        this.updateStats();
        this.closeModal();
        
        window.toast?.show('입대일이 저장되었습니다.', 'success');
    }
    
    saveProfile() {
        const nameInput = Utils.$('#nameInput');
        const rankInput = Utils.$('#rankInput');
        const unitInput = Utils.$('#unitInput');
        
        this.data.user.name = nameInput?.value || '병사';
        this.data.user.rank = rankInput?.value || '이병';
        this.data.user.unit = unitInput?.value || '';
        
        this.saveData();
        this.updateUserInfo();
        this.closeModal();
        
        window.toast?.show('개인 정보가 저장되었습니다.', 'success');
    }
    
    // === 모달 유틸리티 ===
    createModal(title, content, buttons = []) {
        // 기존 모달 제거
        this.closeModal();
        
        const modal = document.createElement('div');
        modal.className = 'modal';
        modal.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0, 0, 0, 0.5);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: var(--z-modal);
            padding: 1rem;
        `;
        
        const modalContent = document.createElement('div');
        modalContent.style.cssText = `
            background: var(--color-surface);
            border: 1px solid var(--color-border);
            border-radius: var(--radius-xl);
            padding: 2rem;
            max-width: 500px;
            width: 100%;
            max-height: 80vh;
            overflow-y: auto;
        `;
        
        const modalHeader = document.createElement('h3');
        modalHeader.textContent = title;
        modalHeader.style.cssText = `
            font-size: 1.25rem;
            font-weight: 600;
            margin-bottom: 1.5rem;
            color: var(--color-text);
        `;
        
        const modalBody = document.createElement('div');
        modalBody.innerHTML = content;
        
        const modalFooter = document.createElement('div');
        modalFooter.style.cssText = `
            display: flex;
            gap: 0.75rem;
            justify-content: flex-end;
            margin-top: 1.5rem;
        `;
        
        buttons.forEach(btn => {
            const button = document.createElement('button');
            button.textContent = btn.text;
            button.className = `action-btn ${btn.type}`;
            Utils.on(button, 'click', btn.action);
            modalFooter.appendChild(button);
        });
        
        modalContent.appendChild(modalHeader);
        modalContent.appendChild(modalBody);
        modalContent.appendChild(modalFooter);
        modal.appendChild(modalContent);
        
        document.body.appendChild(modal);
        this.currentModal = modal;
        
        // 애니메이션
        Utils.fadeIn(modal);
        
        // ESC 키로 닫기
        Utils.on(modal, 'keydown', (e) => {
            if (e.key === 'Escape') {
                this.closeModal();
            }
        });
        
        // 배경 클릭으로 닫기
        Utils.on(modal, 'click', (e) => {
            if (e.target === modal) {
                this.closeModal();
            }
        });
        
        return modal;
    }
    
    closeModal() {
        if (this.currentModal) {
            Utils.fadeOut(this.currentModal).then(() => {
                if (this.currentModal?.parentNode) {
                    this.currentModal.parentNode.removeChild(this.currentModal);
                }
                this.currentModal = null;
            });
        }
    }
    
    // === 유틸리티 메서드 ===
    checkOnlineStatus() {
        this.updateConnectionStatus(Utils.isOnline());
    }
    
    exportData() {
        const dataStr = JSON.stringify(this.data, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(dataBlob);
        
        const link = document.createElement('a');
        link.href = url;
        link.download = 'milbase_data.json';
        link.click();
        
        URL.revokeObjectURL(url);
        window.toast?.show('데이터를 내보냈습니다.', 'success');
    }
    
    importData(file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const data = JSON.parse(e.target.result);
                this.data = Utils.merge(this.data, data);
                this.saveData();
                this.updateUI();
                window.toast?.show('데이터를 가져왔습니다.', 'success');
            } catch (error) {
                window.toast?.show('데이터 파일이 올바르지 않습니다.', 'error');
            }
        };
        reader.readAsText(file);
    }
}

// === 애플리케이션 초기화 ===
let app;

const initApp = () => {
    app = new MilbaseApp();
    window.app = app;
};

// DOM 로드 완료 시 초기화
if (document.readyState === 'loading') {
    Utils.on(document, 'DOMContentLoaded', initApp);
} else {
    initApp();
}
