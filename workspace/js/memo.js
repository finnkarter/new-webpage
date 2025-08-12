/**
 * Memo.js - 메모장 기능
 */

class MemoApp {
    constructor() {
        this.memos = [];
        this.currentSort = 'date'; // date, title, priority
        this.currentFilter = 'all'; // all, urgent, important, normal
        this.searchQuery = '';
        this.currentModal = null;
        
        this.init();
    }

    init() {
        this.loadMemos();
        this.setupEventListeners();
        this.renderMemos();
        console.log('📝 메모장 애플리케이션이 초기화되었습니다.');
    }

    setupEventListeners() {
        // 새 메모 버튼
        Utils.on('#addMemoBtn', 'click', () => this.showMemoEditor());
        
        // 검색
        Utils.on('#searchInput', 'input', (e) => {
            this.searchQuery = e.target.value.toLowerCase();
            this.renderMemos();
        });
        
        // 정렬 버튼
        Utils.on('#sortBtn', 'click', () => this.showSortMenu());
        
        // 키보드 단축키
        Utils.on(document, 'keydown', (e) => {
            if ((e.ctrlKey || e.metaKey) && e.key === 'n') {
                e.preventDefault();
                this.showMemoEditor();
            }
            if (e.key === 'Escape' && this.currentModal) {
                this.closeModal();
            }
        });
    }

    loadMemos() {
        const saved = Utils.storage.get('milbase_memos', []);
        this.memos = saved.map(memo => ({
            ...memo,
            createdAt: new Date(memo.createdAt),
            updatedAt: new Date(memo.updatedAt)
        }));
    }

    saveMemos() {
        Utils.storage.set('milbase_memos', this.memos);
    }

    renderMemos() {
        const grid = Utils.$('#memoGrid');
        const emptyState = Utils.$('#emptyState');
        
        if (!grid) return;
        
        const filteredMemos = this.getFilteredMemos();
        
        if (filteredMemos.length === 0) {
            grid.style.display = 'none';
            emptyState.style.display = 'block';
            return;
        }
        
        grid.style.display = 'grid';
        emptyState.style.display = 'none';
        
        grid.innerHTML = filteredMemos.map(memo => this.createMemoCard(memo)).join('');
        
        // 이벤트 리스너 추가
        filteredMemos.forEach(memo => {
            const card = Utils.$(`[data-memo-id="${memo.id}"]`);
            if (card) {
                Utils.on(card, 'click', () => this.showMemoDetail(memo));
                
                const editBtn = card.querySelector('[data-action="edit"]');
                const deleteBtn = card.querySelector('[data-action="delete"]');
                
                if (editBtn) {
                    Utils.on(editBtn, 'click', (e) => {
                        e.stopPropagation();
                        this.showMemoEditor(memo);
                    });
                }
                
                if (deleteBtn) {
                    Utils.on(deleteBtn, 'click', (e) => {
                        e.stopPropagation();
                        this.deleteMemo(memo.id);
                    });
                }
            }
        });
    }

    getFilteredMemos() {
        let filtered = [...this.memos];
        
        // 검색 필터
        if (this.searchQuery) {
            filtered = filtered.filter(memo => 
                memo.title.toLowerCase().includes(this.searchQuery) ||
                memo.content.toLowerCase().includes(this.searchQuery) ||
                memo.tags.some(tag => tag.toLowerCase().includes(this.searchQuery))
            );
        }
        
        // 우선순위 필터
        if (this.currentFilter !== 'all') {
            filtered = filtered.filter(memo => memo.priority === this.currentFilter);
        }
        
        // 정렬
        filtered.sort((a, b) => {
            switch (this.currentSort) {
                case 'title':
                    return a.title.localeCompare(b.title);
                case 'priority':
                    const priorityOrder = { urgent: 3, important: 2, normal: 1 };
                    return priorityOrder[b.priority] - priorityOrder[a.priority];
                case 'date':
                default:
                    return b.updatedAt - a.updatedAt;
            }
        });
        
        return filtered;
    }

    createMemoCard(memo) {
        const priorityText = {
            urgent: '긴급',
            important: '중요',
            normal: '일반'
        };
        
        const truncatedContent = Utils.truncate(memo.content, 100);
        const timeAgo = this.getTimeAgo(memo.updatedAt);
        
        return `
            <div class="memo-card ${memo.priority}" data-memo-id="${memo.id}">
                <div class="memo-header-info">
                    <span class="priority-badge priority-${memo.priority}">
                        ${priorityText[memo.priority]}
                    </span>
                    <div class="memo-toolbar">
                        <button class="toolbar-btn" data-action="edit" title="수정">
                            ✏️
                        </button>
                        <button class="toolbar-btn" data-action="delete" title="삭제">
                            🗑️
                        </button>
                    </div>
                </div>
                
                <div class="memo-title">${memo.title}</div>
                <div class="memo-content">${truncatedContent}</div>
                
                <div class="memo-meta">
                    <div class="memo-tags">
                        ${memo.tags.map(tag => `<span class="memo-tag">${tag}</span>`).join('')}
                    </div>
                    <div class="memo-time">${timeAgo}</div>
                </div>
            </div>
        `;
    }

    showMemoEditor(memo = null) {
        const isEdit = memo !== null;
        const title = isEdit ? '메모 수정' : '새 메모 작성';
        
        const memoData = memo || {
            title: '',
            content: '',
            priority: 'normal',
            tags: []
        };
        
        const modal = this.createModal(title, `
            <form id="memoForm" style="display: flex; flex-direction: column; gap: var(--space-4);">
                <div>
                    <label style="display: block; margin-bottom: var(--space-2); font-weight: var(--weight-medium);">제목</label>
                    <input type="text" id="memoTitle" value="${memoData.title}" required style="
                        width: 100%;
                        padding: var(--space-3);
                        border: 1px solid var(--color-border);
                        border-radius: var(--radius-lg);
                        background: var(--color-card);
                        color: var(--color-text);
                        font-size: var(--text-base);
                    ">
                </div>
                
                <div>
                    <label style="display: block; margin-bottom: var(--space-2); font-weight: var(--weight-medium);">내용</label>
                    <textarea id="memoContent" rows="8" required style="
                        width: 100%;
                        padding: var(--space-3);
                        border: 1px solid var(--color-border);
                        border-radius: var(--radius-lg);
                        background: var(--color-card);
                        color: var(--color-text);
                        font-size: var(--text-base);
                        font-family: var(--font-family);
                        resize: vertical;
                        min-height: 120px;
                    ">${memoData.content}</textarea>
                </div>
                
                <div>
                    <label style="display: block; margin-bottom: var(--space-2); font-weight: var(--weight-medium);">우선순위</label>
                    <select id="memoPriority" style="
                        width: 100%;
                        padding: var(--space-3);
                        border: 1px solid var(--color-border);
                        border-radius: var(--radius-lg);
                        background: var(--color-card);
                        color: var(--color-text);
                        font-size: var(--text-base);
                    ">
                        <option value="normal" ${memoData.priority === 'normal' ? 'selected' : ''}>일반</option>
                        <option value="important" ${memoData.priority === 'important' ? 'selected' : ''}>중요</option>
                        <option value="urgent" ${memoData.priority === 'urgent' ? 'selected' : ''}>긴급</option>
                    </select>
                </div>
                
                <div>
                    <label style="display: block; margin-bottom: var(--space-2); font-weight: var(--weight-medium);">태그 (쉼표로 구분)</label>
                    <input type="text" id="memoTags" value="${memoData.tags.join(', ')}" placeholder="예: 업무, 개인, 중요" style="
                        width: 100%;
                        padding: var(--space-3);
                        border: 1px solid var(--color-border);
                        border-radius: var(--radius-lg);
                        background: var(--color-card);
                        color: var(--color-text);
                        font-size: var(--text-base);
                    ">
                </div>
            </form>
        `, [
            {
                text: '취소',
                type: 'secondary',
                action: () => this.closeModal()
            },
            {
                text: isEdit ? '수정' : '저장',
                type: 'primary',
                action: () => this.saveMemo(memo?.id)
            }
        ]);
        
        // 첫 번째 입력 필드에 포커스
        setTimeout(() => {
            const titleInput = Utils.$('#memoTitle');
            if (titleInput) titleInput.focus();
        }, 100);
    }

    saveMemo(memoId = null) {
        const title = Utils.$('#memoTitle')?.value.trim();
        const content = Utils.$('#memoContent')?.value.trim();
        const priority = Utils.$('#memoPriority')?.value || 'normal';
        const tagsInput = Utils.$('#memoTags')?.value.trim();
        
        if (!title || !content) {
            window.toast?.show('제목과 내용을 입력해주세요.', 'error');
            return;
        }
        
        const tags = tagsInput ? tagsInput.split(',').map(tag => tag.trim()).filter(tag => tag) : [];
        
        const now = new Date();
        
        if (memoId) {
            // 수정
            const memoIndex = this.memos.findIndex(m => m.id === memoId);
            if (memoIndex !== -1) {
                this.memos[memoIndex] = {
                    ...this.memos[memoIndex],
                    title,
                    content,
                    priority,
                    tags,
                    updatedAt: now
                };
            }
        } else {
            // 새로 생성
            const newMemo = {
                id: 'memo_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
                title,
                content,
                priority,
                tags,
                createdAt: now,
                updatedAt: now
            };
            
            this.memos.unshift(newMemo);
        }
        
        this.saveMemos();
        this.renderMemos();
        this.closeModal();
        
        window.toast?.show(
            memoId ? '메모가 수정되었습니다.' : '새 메모가 저장되었습니다.',
            'success'
        );
    }

    showMemoDetail(memo) {
        const timeAgo = this.getTimeAgo(memo.updatedAt);
        const createdDate = Utils.formatDateTime(memo.createdAt);
        
        this.createModal(memo.title, `
            <div style="margin-bottom: var(--space-4);">
                <div style="display: flex; align-items: center; gap: var(--space-3); margin-bottom: var(--space-3);">
                    <span class="priority-badge priority-${memo.priority}">
                        ${memo.priority === 'urgent' ? '긴급' : memo.priority === 'important' ? '중요' : '일반'}
                    </span>
                    <span style="color: var(--color-text-subtle); font-size: var(--text-sm);">
                        ${timeAgo} • ${createdDate}
                    </span>
                </div>
                
                <div style="
                    background: var(--color-card);
                    border: 1px solid var(--color-border);
                    border-radius: var(--radius-lg);
                    padding: var(--space-4);
                    margin-bottom: var(--space-4);
                    white-space: pre-wrap;
                    line-height: var(--leading-relaxed);
                    color: var(--color-text);
                ">${memo.content}</div>
                
                ${memo.tags.length > 0 ? `
                    <div style="margin-bottom: var(--space-4);">
                        <div style="margin-bottom: var(--space-2); font-weight: var(--weight-medium);">태그</div>
                        <div style="display: flex; flex-wrap: wrap; gap: var(--space-2);">
                            ${memo.tags.map(tag => `<span class="memo-tag">${tag}</span>`).join('')}
                        </div>
                    </div>
                ` : ''}
            </div>
        `, [
            {
                text: '닫기',
                type: 'secondary',
                action: () => this.closeModal()
            },
            {
                text: '수정',
                type: 'primary',
                action: () => {
                    this.closeModal();
                    setTimeout(() => this.showMemoEditor(memo), 100);
                }
            }
        ]);
    }

    deleteMemo(memoId) {
        if (!confirm('이 메모를 삭제하시겠습니까?')) {
            return;
        }
        
        this.memos = this.memos.filter(memo => memo.id !== memoId);
        this.saveMemos();
        this.renderMemos();
        
        window.toast?.show('메모가 삭제되었습니다.', 'success');
    }

    showSortMenu() {
        const sortOptions = [
            { value: 'date', label: '날짜순', icon: '📅' },
            { value: 'title', label: '제목순', icon: '🔤' },
            { value: 'priority', label: '우선순위순', icon: '⭐' }
        ];
        
        const filterOptions = [
            { value: 'all', label: '전체', icon: '📋' },
            { value: 'urgent', label: '긴급', icon: '🚨' },
            { value: 'important', label: '중요', icon: '⚠️' },
            { value: 'normal', label: '일반', icon: '📝' }
        ];
        
        this.createModal('정렬 및 필터', `
            <div style="margin-bottom: var(--space-4);">
                <h4 style="margin-bottom: var(--space-3); color: var(--color-text);">정렬 기준</h4>
                <div style="display: grid; gap: var(--space-2);">
                    ${sortOptions.map(option => `
                        <label style="
                            display: flex;
                            align-items: center;
                            gap: var(--space-3);
                            padding: var(--space-3);
                            border: 1px solid var(--color-border);
                            border-radius: var(--radius-lg);
                            cursor: pointer;
                            transition: all var(--transition-fast);
                            ${this.currentSort === option.value ? 'background: var(--color-card); border-color: var(--color-primary);' : ''}
                        ">
                            <input type="radio" name="sort" value="${option.value}" 
                                   ${this.currentSort === option.value ? 'checked' : ''}
                                   style="margin: 0;">
                            <span style="font-size: var(--text-lg);">${option.icon}</span>
                            <span style="color: var(--color-text);">${option.label}</span>
                        </label>
                    `).join('')}
                </div>
            </div>
            
            <div>
                <h4 style="margin-bottom: var(--space-3); color: var(--color-text);">필터</h4>
                <div style="display: grid; gap: var(--space-2);">
                    ${filterOptions.map(option => `
                        <label style="
                            display: flex;
                            align-items: center;
                            gap: var(--space-3);
                            padding: var(--space-3);
                            border: 1px solid var(--color-border);
                            border-radius: var(--radius-lg);
                            cursor: pointer;
                            transition: all var(--transition-fast);
                            ${this.currentFilter === option.value ? 'background: var(--color-card); border-color: var(--color-primary);' : ''}
                        ">
                            <input type="radio" name="filter" value="${option.value}" 
                                   ${this.currentFilter === option.value ? 'checked' : ''}
                                   style="margin: 0;">
                            <span style="font-size: var(--text-lg);">${option.icon}</span>
                            <span style="color: var(--color-text);">${option.label}</span>
                        </label>
                    `).join('')}
                </div>
            </div>
        `, [
            {
                text: '취소',
                type: 'secondary',
                action: () => this.closeModal()
            },
            {
                text: '적용',
                type: 'primary',
                action: () => this.applySortAndFilter()
            }
        ]);
    }

    applySortAndFilter() {
        const sortRadio = document.querySelector('input[name="sort"]:checked');
        const filterRadio = document.querySelector('input[name="filter"]:checked');
        
        if (sortRadio) this.currentSort = sortRadio.value;
        if (filterRadio) this.currentFilter = filterRadio.value;
        
        this.renderMemos();
        this.closeModal();
        
        window.toast?.show('정렬 및 필터가 적용되었습니다.', 'success');
    }

    getTimeAgo(date) {
        const now = new Date();
        const diffMs = now - date;
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);
        
        if (diffMins < 1) return '방금 전';
        if (diffMins < 60) return `${diffMins}분 전`;
        if (diffHours < 24) return `${diffHours}시간 전`;
        if (diffDays < 7) return `${diffDays}일 전`;
        
        return Utils.formatDate(date);
    }

    createModal(title, content, buttons = []) {
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
            padding: var(--space-4);
        `;
        
        const modalContent = document.createElement('div');
        modalContent.style.cssText = `
            background: var(--color-surface);
            border: 1px solid var(--color-border);
            border-radius: var(--radius-xl);
            padding: var(--space-6);
            max-width: 600px;
            width: 100%;
            max-height: 90vh;
            overflow-y: auto;
        `;
        
        const modalHeader = document.createElement('h3');
        modalHeader.textContent = title;
        modalHeader.style.cssText = `
            font-size: var(--text-xl);
            font-weight: var(--weight-semibold);
            margin-bottom: var(--space-4);
            color: var(--color-text);
        `;
        
        const modalBody = document.createElement('div');
        modalBody.innerHTML = content;
        
        const modalFooter = document.createElement('div');
        modalFooter.style.cssText = `
            display: flex;
            gap: var(--space-3);
            justify-content: flex-end;
            margin-top: var(--space-6);
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

    // 내보내기/가져오기 기능
    exportMemos() {
        const dataStr = JSON.stringify(this.memos, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(dataBlob);
        
        const link = document.createElement('a');
        link.href = url;
        link.download = `milbase_memos_${Utils.formatDate(new Date()).replace(/\s/g, '_')}.json`;
        link.click();
        
        URL.revokeObjectURL(url);
        window.toast?.show('메모를 내보냈습니다.', 'success');
    }

    importMemos(file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const importedMemos = JSON.parse(e.target.result);
                
                if (!Array.isArray(importedMemos)) {
                    throw new Error('올바른 메모 파일이 아닙니다.');
                }
                
                // 기존 메모와 합치기
                importedMemos.forEach(memo => {
                    memo.id = 'imported_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
                    memo.createdAt = new Date(memo.createdAt);
                    memo.updatedAt = new Date(memo.updatedAt);
                });
                
                this.memos = [...importedMemos, ...this.memos];
                this.saveMemos();
                this.renderMemos();
                
                window.toast?.show(`${importedMemos.length}개의 메모를 가져왔습니다.`, 'success');
            } catch (error) {
                console.error('Import error:', error);
                window.toast?.show('메모 파일을 가져오는데 실패했습니다.', 'error');
            }
        };
        reader.readAsText(file);
    }
}

// 애플리케이션 초기화
let memoApp;

const initMemoApp = () => {
    memoApp = new MemoApp();
    window.memoApp = memoApp;
};

// DOM 로드 완료 시 초기화
if (document.readyState === 'loading') {
    Utils.on(document, 'DOMContentLoaded', initMemoApp);
} else {
    initMemoApp();
}
