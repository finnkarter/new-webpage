/**
 * 휴가 관리 페이지 JavaScript
 * MILBASE - 군사 개인 대시보드
 */

class VacationManager {
    constructor() {
        this.currentDate = new Date();
        this.vacationDays = this.loadVacationData();
        this.checklistData = this.loadChecklistData();
        this.travelPlans = this.loadTravelPlans();
        
        this.init();
    }

    init() {
        this.generateCalendar();
        this.updateVacationStats();
        this.renderChecklists();
        this.setupEventListeners();
        this.startDDayCounter();
    }

    // 로컬 스토리지에서 데이터 로드
    loadVacationData() {
        const defaultData = {
            totalDays: 20,
            usedDays: 8,
            annualLeave: { total: 15, used: 6 },
            compensatoryLeave: { total: 4, used: 2 },
            comfortLeave: { total: 1, used: 0 },
            vacationDates: [
                '2024-02-01', '2024-02-02', '2024-02-03',
                '2024-03-15', '2024-03-16', '2024-03-17'
            ]
        };
        
        const saved = localStorage.getItem('milbase_vacation_data');
        return saved ? JSON.parse(saved) : defaultData;
    }

    loadChecklistData() {
        const defaultChecklist = {
            preVacation: [
                { id: 1, text: '휴가신청서 제출', completed: true },
                { id: 2, text: '부대 업무 인수인계', completed: true },
                { id: 3, text: '숙소 예약 확인', completed: false },
                { id: 4, text: '교통편 예약', completed: false },
                { id: 5, text: '비상연락망 공유', completed: true }
            ],
            packing: [
                { id: 6, text: '군복 및 개인 장비', completed: false },
                { id: 7, text: '세면도구', completed: false },
                { id: 8, text: '여분 옷가지', completed: false },
                { id: 9, text: '충전기 및 전자기기', completed: false },
                { id: 10, text: '신분증 및 필수 서류', completed: true }
            ],
            return: [
                { id: 11, text: '복귀 시간 확인', completed: false },
                { id: 12, text: '교통편 예약 (복귀)', completed: false },
                { id: 13, text: '부대 연락', completed: false },
                { id: 14, text: '개인 물품 정리', completed: false },
                { id: 15, text: '업무 재개 준비', completed: false }
            ]
        };

        const saved = localStorage.getItem('milbase_checklist_data');
        return saved ? JSON.parse(saved) : defaultChecklist;
    }

    loadTravelPlans() {
        const defaultPlans = [
            {
                id: 1,
                title: '🏔️ 제주도 여행',
                status: '계획중',
                startDate: '2024-03-15',
                endDate: '2024-03-17',
                duration: 3,
                budget: 500000,
                people: 2,
                satisfaction: null
            },
            {
                id: 2,
                title: '🏔️ 강원도 스키',
                status: '완료',
                startDate: '2024-02-01',
                endDate: '2024-02-03',
                duration: 3,
                budget: 350000,
                people: 1,
                satisfaction: 5
            }
        ];

        const saved = localStorage.getItem('milbase_travel_plans');
        return saved ? JSON.parse(saved) : defaultPlans;
    }

    // 데이터 저장
    saveVacationData() {
        localStorage.setItem('milbase_vacation_data', JSON.stringify(this.vacationDays));
    }

    saveChecklistData() {
        localStorage.setItem('milbase_checklist_data', JSON.stringify(this.checklistData));
    }

    saveTravelPlans() {
        localStorage.setItem('milbase_travel_plans', JSON.stringify(this.travelPlans));
    }

    // 캘린더 생성
    generateCalendar() {
        const year = this.currentDate.getFullYear();
        const month = this.currentDate.getMonth();
        
        // 캘린더 제목 업데이트
        document.getElementById('calendarTitle').textContent = 
            `${year}년 ${month + 1}월`;
        
        // 첫 번째 날과 마지막 날 계산
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        const startDate = new Date(firstDay);
        startDate.setDate(startDate.getDate() - firstDay.getDay());
        
        const calendarGrid = document.getElementById('calendarGrid');
        calendarGrid.innerHTML = '';
        
        // 요일 헤더 추가
        const weekdays = ['일', '월', '화', '수', '목', '금', '토'];
        weekdays.forEach(day => {
            const dayElement = document.createElement('div');
            dayElement.className = 'calendar-day day-header';
            dayElement.textContent = day;
            calendarGrid.appendChild(dayElement);
        });
        
        // 캘린더 날짜 생성
        const currentDay = new Date(startDate);
        for (let i = 0; i < 42; i++) {
            const dayElement = document.createElement('div');
            dayElement.className = 'calendar-day';
            dayElement.textContent = currentDay.getDate();
            
            const dateString = currentDay.toISOString().split('T')[0];
            
            // 현재 월이 아닌 날짜는 흐리게
            if (currentDay.getMonth() !== month) {
                dayElement.style.opacity = '0.3';
            }
            
            // 휴가 날짜 체크
            if (this.vacationDays.vacationDates.includes(dateString)) {
                dayElement.classList.add('vacation');
            }
            
            // 오늘 날짜 표시
            const today = new Date();
            if (currentDay.toDateString() === today.toDateString()) {
                dayElement.style.background = 'rgba(var(--accent-rgb), 0.3)';
                dayElement.style.fontWeight = 'bold';
            }
            
            // 클릭 이벤트
            dayElement.addEventListener('click', () => {
                this.toggleVacationDay(dateString, dayElement);
            });
            
            calendarGrid.appendChild(dayElement);
            currentDay.setDate(currentDay.getDate() + 1);
        }
    }

    // 휴가 날짜 토글
    toggleVacationDay(dateString, element) {
        const index = this.vacationDays.vacationDates.indexOf(dateString);
        
        if (index > -1) {
            // 휴가 제거
            this.vacationDays.vacationDates.splice(index, 1);
            element.classList.remove('vacation');
            this.vacationDays.usedDays--;
        } else {
            // 휴가 추가
            this.vacationDays.vacationDates.push(dateString);
            element.classList.add('vacation');
            this.vacationDays.usedDays++;
        }
        
        this.saveVacationData();
        this.updateVacationStats();
    }

    // 휴가 통계 업데이트
    updateVacationStats() {
        const remainingDays = this.vacationDays.totalDays - this.vacationDays.usedDays;
        
        document.getElementById('totalVacationDays').textContent = this.vacationDays.totalDays;
        document.getElementById('usedVacationDays').textContent = this.vacationDays.usedDays;
        document.getElementById('remainingVacationDays').textContent = remainingDays;
        
        // 다음 휴가까지 D-Day 계산
        this.updateNextVacationDDay();
    }

    // 다음 휴가까지 D-Day 계산
    updateNextVacationDDay() {
        const today = new Date();
        const todayString = today.toISOString().split('T')[0];
        
        // 오늘 이후의 휴가 날짜 찾기
        const futurVacations = this.vacationDays.vacationDates
            .filter(date => date > todayString)
            .sort();
        
        if (futurVacations.length > 0) {
            const nextVacation = new Date(futurVacations[0]);
            const timeDiff = nextVacation.getTime() - today.getTime();
            const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));
            
            document.getElementById('nextVacationDays').textContent = daysDiff;
        } else {
            document.getElementById('nextVacationDays').textContent = '-';
        }
    }

    // D-Day 카운터 시작
    startDDayCounter() {
        // 1분마다 업데이트
        setInterval(() => {
            this.updateNextVacationDDay();
        }, 60000);
    }

    // 체크리스트 렌더링
    renderChecklists() {
        this.renderChecklistSection('preVacationChecklist', this.checklistData.preVacation);
        this.renderChecklistSection('travelPackingChecklist', this.checklistData.packing);
        this.renderChecklistSection('returnChecklist', this.checklistData.return);
    }

    renderChecklistSection(containerId, items) {
        const container = document.getElementById(containerId);
        container.innerHTML = '';
        
        items.forEach(item => {
            const itemElement = document.createElement('div');
            itemElement.className = 'checklist-item';
            itemElement.innerHTML = `
                <label style="display: flex; align-items: center; gap: 0.5rem; cursor: pointer; padding: 0.75rem; background: rgba(255, 255, 255, 0.05); border-radius: var(--border-radius-sm); margin-bottom: 0.5rem; transition: all var(--transition-smooth);">
                    <input type="checkbox" ${item.completed ? 'checked' : ''} 
                           onchange="vacationManager.toggleChecklistItem('${containerId}', ${item.id})"
                           style="accent-color: var(--primary);">
                    <span style="color: var(--color-text); ${item.completed ? 'text-decoration: line-through; opacity: 0.7;' : ''}">${item.text}</span>
                </label>
            `;
            
            container.appendChild(itemElement);
        });
    }

    // 체크리스트 항목 토글
    toggleChecklistItem(section, itemId) {
        let items;
        switch(section) {
            case 'preVacationChecklist':
                items = this.checklistData.preVacation;
                break;
            case 'travelPackingChecklist':
                items = this.checklistData.packing;
                break;
            case 'returnChecklist':
                items = this.checklistData.return;
                break;
        }
        
        const item = items.find(i => i.id === itemId);
        if (item) {
            item.completed = !item.completed;
            this.saveChecklistData();
            this.renderChecklists();
        }
    }

    // 체크리스트 항목 추가
    addChecklistItem() {
        const text = prompt('새 항목을 입력하세요:');
        if (text && text.trim()) {
            const section = prompt('어느 섹션에 추가하시겠습니까?\n1: 휴가 전 준비\n2: 여행 준비물\n3: 복귀 준비');
            
            let targetArray;
            switch(section) {
                case '1':
                    targetArray = this.checklistData.preVacation;
                    break;
                case '2':
                    targetArray = this.checklistData.packing;
                    break;
                case '3':
                    targetArray = this.checklistData.return;
                    break;
                default:
                    alert('올바른 섹션 번호를 입력하세요.');
                    return;
            }
            
            const newId = Math.max(...Object.values(this.checklistData).flat().map(i => i.id)) + 1;
            targetArray.push({
                id: newId,
                text: text.trim(),
                completed: false
            });
            
            this.saveChecklistData();
            this.renderChecklists();
        }
    }

    // 체크리스트 초기화
    resetChecklist() {
        if (confirm('체크리스트를 초기화하시겠습니까?')) {
            localStorage.removeItem('milbase_checklist_data');
            this.checklistData = this.loadChecklistData();
            this.renderChecklists();
        }
    }

    // 이벤트 리스너 설정
    setupEventListeners() {
        // 캘린더 네비게이션
        document.getElementById('prevMonth').addEventListener('click', () => {
            this.currentDate.setMonth(this.currentDate.getMonth() - 1);
            this.generateCalendar();
        });
        
        document.getElementById('nextMonth').addEventListener('click', () => {
            this.currentDate.setMonth(this.currentDate.getMonth() + 1);
            this.generateCalendar();
        });
        
        // 빠른 액션 버튼들
        document.getElementById('addVacationBtn').addEventListener('click', () => {
            this.showAddVacationModal();
        });
        
        document.getElementById('planVacationBtn').addEventListener('click', () => {
            this.showTravelPlanModal();
        });
        
        document.getElementById('addChecklistItem').addEventListener('click', () => {
            this.addChecklistItem();
        });
        
        document.getElementById('resetChecklist').addEventListener('click', () => {
            this.resetChecklist();
        });
    }

    // 휴가 추가 모달 (간단한 프롬프트로 구현)
    showAddVacationModal() {
        const startDate = prompt('휴가 시작일을 입력하세요 (YYYY-MM-DD):');
        if (!startDate) return;
        
        const endDate = prompt('휴가 종료일을 입력하세요 (YYYY-MM-DD):');
        if (!endDate) return;
        
        // 날짜 범위 추가
        const start = new Date(startDate);
        const end = new Date(endDate);
        const current = new Date(start);
        
        while (current <= end) {
            const dateString = current.toISOString().split('T')[0];
            if (!this.vacationDays.vacationDates.includes(dateString)) {
                this.vacationDays.vacationDates.push(dateString);
                this.vacationDays.usedDays++;
            }
            current.setDate(current.getDate() + 1);
        }
        
        this.saveVacationData();
        this.generateCalendar();
        this.updateVacationStats();
        
        alert('휴가가 추가되었습니다!');
    }

    // 여행 계획 모달
    showTravelPlanModal() {
        const title = prompt('여행 제목을 입력하세요:');
        if (!title) return;
        
        const startDate = prompt('여행 시작일 (YYYY-MM-DD):');
        if (!startDate) return;
        
        const endDate = prompt('여행 종료일 (YYYY-MM-DD):');
        if (!endDate) return;
        
        const budget = prompt('예산 (원):');
        const people = prompt('인원 수:');
        
        const newPlan = {
            id: Date.now(),
            title: title,
            status: '계획중',
            startDate: startDate,
            endDate: endDate,
            duration: Math.ceil((new Date(endDate) - new Date(startDate)) / (1000 * 60 * 60 * 24)) + 1,
            budget: parseInt(budget) || 0,
            people: parseInt(people) || 1,
            satisfaction: null
        };
        
        this.travelPlans.push(newPlan);
        this.saveTravelPlans();
        
        alert('여행 계획이 추가되었습니다!');
        // 실제로는 여행 계획 섹션을 다시 렌더링해야 함
    }
}

// 전역 변수로 설정하여 HTML에서 접근 가능하게 함
let vacationManager;

// 페이지 로드 시 초기화
document.addEventListener('DOMContentLoaded', () => {
    vacationManager = new VacationManager();
    
    // 페이지 애니메이션
    const sections = document.querySelectorAll('.vacation-section');
    sections.forEach((section, index) => {
        section.style.opacity = '0';
        section.style.transform = 'translateY(20px)';
        
        setTimeout(() => {
            section.style.transition = 'all 0.6s ease-out';
            section.style.opacity = '1';
            section.style.transform = 'translateY(0)';
        }, index * 100);
    });
    
    // Toast 알림 시스템 (만약 components.js에 있다면)
    if (typeof Toast !== 'undefined') {
        window.showToast = (message, type = 'success') => {
            new Toast(message, type).show();
        };
    }
});

// 유틸리티 함수들
const VacationUtils = {
    // 날짜 포맷팅
    formatDate(dateString) {
        const date = new Date(dateString);
        return `${date.getMonth() + 1}월 ${date.getDate()}일`;
    },
    
    // 금액 포맷팅
    formatCurrency(amount) {
        return new Intl.NumberFormat('ko-KR', {
            style: 'currency',
            currency: 'KRW'
        }).format(amount);
    },
    
    // 날짜 차이 계산
    calculateDaysDiff(startDate, endDate) {
        const start = new Date(startDate);
        const end = new Date(endDate);
        return Math.ceil((end - start) / (1000 * 60 * 60 * 24));
    }
};
