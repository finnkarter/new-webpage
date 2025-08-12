/**
 * Tips.js - 군생활 팁 페이지
 */

class TipsApp {
    constructor() {
        this.tips = [];
        this.currentCategory = 'all';
        this.searchQuery = '';
        this.currentModal = null;
        
        this.init();
    }

    init() {
        this.initTipsData();
        this.setupEventListeners();
        this.renderTips();
        console.log('💡 군생활 팁 애플리케이션이 초기화되었습니다.');
    }

    setupEventListeners() {
        // 카테고리 버튼
        document.querySelectorAll('.category-btn').forEach(btn => {
            Utils.on(btn, 'click', () => {
                const category = btn.dataset.category;
                this.setCategory(category);
            });
        });
        
        // 검색
        Utils.on('#searchInput', 'input', (e) => {
            this.searchQuery = e.target.value.toLowerCase();
            this.renderTips();
        });
    }

    initTipsData() {
        this.tips = [
            {
                id: 1,
                title: "부대 적응을 위한 첫 주 생존법",
                category: "생활",
                icon: "🏠",
                content: `군대 첫 주는 누구에게나 힘든 시기입니다. 다음 팁들을 참고하세요:

• **선임들과의 관계**: 예의를 지키고 적극적으로 배우려는 자세를 보이세요.
• **생활 패턴**: 빠르게 부대 일과에 적응하고 충분한 수면을 취하세요.
• **개인정비**: 항상 깔끔한 상태를 유지하고 개인 물품을 잘 관리하세요.
• **동기들과의 협력**: 같은 처지의 동기들과 서로 도우며 버텨나가세요.
• **긍정적 마인드**: 힘들어도 긍정적으로 생각하며 하루하루 버텨내세요.

첫 주만 넘기면 점점 적응할 수 있습니다!`,
                tags: ["신병", "적응", "생활패턴"],
                rating: 4.8,
                views: 1520
            },
            {
                id: 2,
                title: "PX 현명하게 이용하는 방법",
                category: "생활",
                icon: "🛒",
                content: `PX를 효율적으로 이용하는 노하우를 알려드립니다:

• **필수품 우선**: 세면용품, 속옷, 양말 등 꼭 필요한 것부터 구매하세요.
• **가격 비교**: 같은 상품도 브랜드별로 가격 차이가 있으니 비교해보세요.
• **적정량 구매**: 보관 공간이 제한적이므로 과도한 구매는 피하세요.
• **할인 기간 활용**: 특가 행사나 할인 기간을 잘 활용하세요.
• **공동구매**: 동기들과 함께 사서 나눠 쓸 수 있는 것들은 공동구매하세요.
• **포인트 적립**: PX 카드가 있다면 포인트 적립도 잊지 마세요.

계획적인 PX 이용으로 합리적인 소비를 해보세요!`,
                tags: ["PX", "쇼핑", "절약"],
                rating: 4.6,
                views: 987
            },
            {
                id: 3,
                title: "체력단련 효과적으로 하기",
                category: "훈련",
                icon: "💪",
                content: `군대에서의 체력단련을 효과적으로 하는 방법:

• **준비운동**: 부상 방지를 위해 충분한 준비운동을 하세요.
• **단계별 강도 조절**: 처음부터 무리하지 말고 점진적으로 강도를 높이세요.
• **호흡법**: 올바른 호흡법을 익혀 지구력을 향상시키세요.
• **근력 운동**: 팔굽혀펴기, 윗몸일으키기 등 기본 근력 운동을 꾸준히 하세요.
• **스트레칭**: 운동 후 충분한 스트레칭으로 근육을 풀어주세요.
• **영양 섭취**: 균형 잡힌 식사와 충분한 수분 섭취를 하세요.

꾸준한 체력단련으로 건강한 군생활을 만들어보세요!`,
                tags: ["체력", "운동", "건강"],
                rating: 4.7,
                views: 1234
            },
            {
                id: 4,
                title: "선임과 좋은 관계 유지하는 법",
                category: "관계",
                icon: "🤝",
                content: `선임과의 좋은 관계는 군생활의 핵심입니다:

• **존댓말과 예의**: 항상 정중한 언어 사용과 기본 예의를 지키세요.
• **적극적인 자세**: 시키지 않아도 먼저 나서서 도우려는 자세를 보이세요.
• **경청하기**: 선임의 조언이나 지시사항을 주의 깊게 들으세요.
• **감사 표현**: 도움을 받았을 때는 진심으로 감사를 표현하세요.
• **실수 인정**: 잘못했을 때는 솔직히 인정하고 반성하는 모습을 보이세요.
• **개인적 관심**: 선임의 취미나 관심사에 진정성 있게 관심을 보이세요.

좋은 관계는 서로를 배려하는 마음에서 시작됩니다!`,
                tags: ["선임", "인간관계", "예의"],
                rating: 4.9,
                views: 2100
            },
            {
                id: 5,
                title: "집에서 보내는 편지 잘 받는 법",
                category: "생활",
                icon: "💌",
                content: `가족, 친구들과의 소통을 유지하는 방법:

• **정기적인 연락**: 일주일에 한 번 정도는 꼭 연락을 취하세요.
• **긍정적인 내용**: 힘든 얘기보다는 괜찮다는 안심시키는 내용을 전하세요.
• **구체적인 일상**: 부대에서의 재미있는 일상을 구체적으로 공유하세요.
• **고마움 표현**: 편지나 용돈을 보내준 것에 대한 감사를 꼭 표현하세요.
• **전화 시간 조정**: 부대 일과에 맞춰 연락 가능한 시간을 미리 알려주세요.
• **주소 정확히 알리기**: 편지가 제대로 도착할 수 있도록 정확한 주소를 알려주세요.

가족과의 연결고리를 잃지 마세요!`,
                tags: ["편지", "가족", "연락"],
                rating: 4.5,
                views: 876
            },
            {
                id: 6,
                title: "야간근무 버티는 노하우",
                category: "훈련",
                icon: "🌙",
                content: `야간근무를 효과적으로 버티는 방법:

• **충분한 수면**: 야간근무 전 낮에 충분히 잠을 자두세요.
• **카페인 적절히 활용**: 졸음 방지를 위해 커피나 차를 적당히 마시세요.
• **동료와 대화**: 함께 근무하는 동료와 대화로 졸음을 쫓으세요.
• **스트레칭**: 틈틈이 가벼운 스트레칭으로 몸을 깨우세요.
• **간식 준비**: 야식용 간단한 간식을 미리 준비해두세요.
• **집중력 유지**: 중요한 임무임을 인식하고 집중력을 유지하세요.

안전한 근무를 위해 절대 졸지 마세요!`,
                tags: ["야간근무", "졸음방지", "근무"],
                rating: 4.4,
                views: 756
            },
            {
                id: 7,
                title: "스트레스 해소하는 방법들",
                category: "건강",
                icon: "😌",
                content: `군생활 스트레스를 건강하게 해소하는 방법:

• **규칙적인 운동**: 꾸준한 운동으로 스트레스를 해소하세요.
• **취미 활동**: 독서, 그림, 음악 감상 등 개인 취미를 즐기세요.
• **명상과 호흡**: 간단한 명상이나 심호흡으로 마음을 진정시키세요.
• **긍정적 사고**: 부정적인 생각보다는 긍정적인 면을 찾아보세요.
• **동기들과 대화**: 같은 처지의 동기들과 속마음을 나누세요.
• **충분한 휴식**: 주어진 휴식 시간을 충분히 활용하세요.

건강한 정신이 건강한 군생활을 만듭니다!`,
                tags: ["스트레스", "정신건강", "휴식"],
                rating: 4.8,
                views: 1345
            },
            {
                id: 8,
                title: "전역 후 진로 준비하기",
                category: "전역",
                icon: "🎓",
                content: `전역 후 성공적인 사회복귀를 위한 준비:

• **자기계발**: 전역 전 6개월부터 관련 자격증이나 기술을 익히세요.
• **인적 네트워크**: 부대 내외에서 만난 인연들을 소중히 하세요.
• **취업 정보 수집**: 관심 있는 분야의 채용 정보를 미리 알아보세요.
• **이력서 준비**: 군 경험을 포함한 체계적인 이력서를 작성하세요.
• **면접 연습**: 예상 질문들에 대한 답변을 미리 준비해보세요.
• **복학 준비**: 대학생이라면 복학 절차와 학업 계획을 세우세요.

미리 준비하는 사람이 성공합니다!`,
                tags: ["전역", "취업", "진로"],
                rating: 4.7,
                views: 1678
            },
            {
                id: 9,
                title: "부식 및 간식 현명하게 관리하기",
                category: "생활",
                icon: "🍪",
                content: `부식과 간식을 효율적으로 관리하는 방법:

• **유통기한 확인**: 구매 시 유통기한을 꼭 확인하고 빠른 것부터 먹으세요.
• **보관 방법**: 습기와 벌레를 방지할 수 있는 밀폐용기를 사용하세요.
• **동료와 나누기**: 맛있는 간식은 동료들과 나눠 먹으며 친목을 다지세요.
• **과다 섭취 주의**: 건강을 위해 적당량만 섭취하세요.
• **정리정돈**: 간식 보관 공간을 항상 깔끔하게 정리하세요.
• **고급 간식 활용**: 특별한 날에는 좋은 간식으로 기분을 전환하세요.

작은 즐거움이 군생활을 풍요롭게 만듭니다!`,
                tags: ["부식", "간식", "관리"],
                rating: 4.3,
                views: 654
            },
            {
                id: 10,
                title: "효과적인 청소 및 정리정돈 요령",
                category: "생활",
                icon: "🧹",
                content: `깔끔한 생활관 만들기 위한 청소 노하우:

• **매일 조금씩**: 한 번에 몰아서 하지 말고 매일 조금씩 정리하세요.
• **역할 분담**: 생활관 동료들과 청소 구역을 나누어 담당하세요.
• **도구 활용**: 청소용품을 제대로 갖춰두고 효율적으로 사용하세요.
• **먼지 제거**: 높은 곳부터 낮은 곳 순서로 먼지를 제거하세요.
• **환기**: 청소 후에는 충분히 환기를 시켜 쾌적함을 유지하세요.
• **개인 공간**: 자신의 침상과 사물함을 항상 정돈된 상태로 유지하세요.

깔끔한 환경이 좋은 군생활의 시작입니다!`,
                tags: ["청소", "정리정돈", "생활관"],
                rating: 4.6,
                views: 892
            },
            {
                id: 11,
                title: "군대에서 건강 관리하는 법",
                category: "건강",
                icon: "❤️",
                content: `군생활 중 건강을 지키는 방법:

• **규칙적인 식사**: 정해진 시간에 균형 잡힌 식사를 하세요.
• **충분한 수분 섭취**: 하루 2리터 이상의 물을 마시세요.
• **개인위생**: 손 씻기, 양치질 등 기본 위생 관리를 철저히 하세요.
• **충분한 수면**: 최소 6-7시간의 수면을 취하도록 노력하세요.
• **금연 금주**: 건강을 위해 금연과 절주를 실천하세요.
• **병원 이용**: 몸이 아플 때는 참지 말고 의무실이나 병원을 이용하세요.

건강한 몸이 성공적인 군생활의 기초입니다!`,
                tags: ["건강", "위생", "의료"],
                rating: 4.9,
                views: 1456
            },
            {
                id: 12,
                title: "휴가 및 외박 계획 세우기",
                category: "기타",
                icon: "🏖️",
                content: `제한된 휴가를 효율적으로 활용하는 방법:

• **미리 계획**: 휴가 날짜가 정해지면 미리 계획을 세우세요.
• **가족 시간**: 가족들과 보내는 시간을 최우선으로 하세요.
• **친구 만남**: 오래 만나지 못한 친구들과의 만남도 계획해보세요.
• **취미 활동**: 부대에서 할 수 없는 취미 활동을 즐기세요.
• **충분한 휴식**: 바쁘게 보내기보다는 충분한 휴식도 취하세요.
• **복귀 준비**: 복귀 전날에는 일찍 쉬어 부대 복귀에 대비하세요.

소중한 휴가 시간을 알차게 보내세요!`,
                tags: ["휴가", "외박", "계획"],
                rating: 4.5,
                views: 1123
            }
        ];
    }

    setCategory(category) {
        this.currentCategory = category;
        
        // 버튼 상태 업데이트
        document.querySelectorAll('.category-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.category === category);
        });
        
        this.renderTips();
    }

    renderTips() {
        const grid = Utils.$('#tipsGrid');
        const noResults = Utils.$('#noResults');
        
        if (!grid || !noResults) return;
        
        const filteredTips = this.getFilteredTips();
        
        if (filteredTips.length === 0) {
            grid.style.display = 'none';
            noResults.style.display = 'block';
            return;
        }
        
        grid.style.display = 'grid';
        noResults.style.display = 'none';
        
        grid.innerHTML = filteredTips.map(tip => this.createTipCard(tip)).join('');
        
        // 이벤트 리스너 추가
        filteredTips.forEach(tip => {
            const card = Utils.$(`[data-tip-id="${tip.id}"]`);
            if (card) {
                Utils.on(card, 'click', () => this.showTipDetail(tip));
            }
        });
    }

    getFilteredTips() {
        let filtered = [...this.tips];
        
        // 카테고리 필터
        if (this.currentCategory !== 'all') {
            filtered = filtered.filter(tip => tip.category === this.currentCategory);
        }
        
        // 검색 필터
        if (this.searchQuery) {
            filtered = filtered.filter(tip => 
                tip.title.toLowerCase().includes(this.searchQuery) ||
                tip.content.toLowerCase().includes(this.searchQuery) ||
                tip.category.toLowerCase().includes(this.searchQuery) ||
                tip.tags.some(tag => tag.toLowerCase().includes(this.searchQuery))
            );
        }
        
        // 조회수 순으로 정렬
        filtered.sort((a, b) => b.views - a.views);
        
        return filtered;
    }

    createTipCard(tip) {
        const truncatedContent = Utils.truncate(tip.content.split('\n')[0], 120);
        
        return `
            <div class="tip-card" data-tip-id="${tip.id}">
                <div class="tip-header">
                    <div class="tip-icon">${tip.icon}</div>
                    <div style="flex: 1;">
                        <div class="tip-title">${tip.title}</div>
                    </div>
                    <div class="tip-category">${tip.category}</div>
                </div>
                
                <div class="tip-content">${truncatedContent}</div>
                
                <div class="tip-tags">
                    ${tip.tags.map(tag => `<span class="tip-tag">#${tag}</span>`).join('')}
                </div>
                
                <div class="tip-footer">
                    <div class="tip-rating">
                        <span>⭐</span>
                        <span>${tip.rating}</span>
                    </div>
                    <div>조회 ${Utils.formatNumber(tip.views)}</div>
                </div>
            </div>
        `;
    }

    showTipDetail(tip) {
        // 조회수 증가
        tip.views++;
        
        this.createModal(tip.title, `
            <div style="margin-bottom: var(--space-4);">
                <div style="display: flex; align-items: center; gap: var(--space-3); margin-bottom: var(--space-4);">
                    <span style="font-size: var(--text-2xl);">${tip.icon}</span>
                    <div style="flex: 1;">
                        <div style="color: var(--color-text-muted); font-size: var(--text-sm); margin-bottom: var(--space-1);">
                            ${tip.category}
                        </div>
                        <div style="display: flex; align-items: center; gap: var(--space-4); font-size: var(--text-sm); color: var(--color-text-subtle);">
                            <div class="tip-rating">
                                <span>⭐</span>
                                <span>${tip.rating}</span>
                            </div>
                            <div>조회 ${Utils.formatNumber(tip.views)}</div>
                        </div>
                    </div>
                </div>
                
                <div style="
                    background: var(--color-card);
                    border: 1px solid var(--color-border);
                    border-radius: var(--radius-lg);
                    padding: var(--space-4);
                    margin-bottom: var(--space-4);
                    white-space: pre-line;
                    line-height: var(--leading-relaxed);
                    color: var(--color-text);
                ">${tip.content}</div>
                
                <div style="margin-bottom: var(--space-4);">
                    <div style="margin-bottom: var(--space-2); font-weight: var(--weight-medium); color: var(--color-text);">태그</div>
                    <div style="display: flex; flex-wrap: wrap; gap: var(--space-2);">
                        ${tip.tags.map(tag => `<span class="tip-tag">#${tag}</span>`).join('')}
                    </div>
                </div>
            </div>
        `, [
            {
                text: '닫기',
                type: 'secondary',
                action: () => this.closeModal()
            },
            {
                text: '도움이 됐어요 👍',
                type: 'primary',
                action: () => this.likeTip(tip)
            }
        ]);
    }

    likeTip(tip) {
        // 평점 약간 증가 (최대 5.0)
        tip.rating = Math.min(5.0, tip.rating + 0.1);
        tip.rating = Math.round(tip.rating * 10) / 10; // 소수점 첫째자리까지
        
        window.toast?.show('피드백 감사합니다! 👍', 'success');
        this.closeModal();
        
        // 화면 업데이트
        setTimeout(() => {
            this.renderTips();
        }, 500);
    }

    createModal(title, content, buttons = []) {
        this.closeModal();
        
        const modal = document.createElement('div');
        modal.className = 'tip-modal';
        
        modal.innerHTML = `
            <div class="tip-modal-content">
                <button class="tip-close" onclick="window.tipsApp.closeModal()">✕</button>
                <h3 style="margin-bottom: var(--space-4); color: var(--color-text); padding-right: var(--space-8);">${title}</h3>
                <div>${content}</div>
                <div style="display: flex; gap: var(--space-3); justify-content: flex-end; margin-top: var(--space-6);">
                    ${buttons.map(btn => 
                        `<button class="action-btn ${btn.type}" onclick="${btn.action}">${btn.text}</button>`
                    ).join('')}
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        this.currentModal = modal;
        
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

    // 팁 검색
    searchTips(query) {
        this.searchQuery = query.toLowerCase();
        this.renderTips();
    }

    // 인기 팁 가져오기
    getPopularTips(limit = 5) {
        return [...this.tips]
            .sort((a, b) => b.views - a.views)
            .slice(0, limit);
    }

    // 최신 팁 가져오기
    getRecentTips(limit = 5) {
        return [...this.tips]
            .sort((a, b) => b.id - a.id)
            .slice(0, limit);
    }

    // 추천 팁 가져오기 (높은 평점)
    getRecommendedTips(limit = 5) {
        return [...this.tips]
            .sort((a, b) => b.rating - a.rating)
            .slice(0, limit);
    }
}

// 애플리케이션 초기화
let tipsApp;

const initTipsApp = () => {
    tipsApp = new TipsApp();
    window.tipsApp = tipsApp;
};

// DOM 로드 완료 시 초기화
if (document.readyState === 'loading') {
    Utils.on(document, 'DOMContentLoaded', initTipsApp);
} else {
    initTipsApp();
}
