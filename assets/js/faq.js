/**
 * FAQ Module
 * FAQ 아코디언 기능을 담당하는 모듈
 */

class FAQManager {
    constructor() {
        this.faqData = [];
        this.filteredFaq = [];
        this.categories = [];
        this.currentCategory = 'all';
        this.searchQuery = '';
        this.expandedItems = new Set();
        
        this.init();
    }
    
    /**
     * 초기화
     */
    async init() {
        await this.loadFAQData();
        this.setupCategories();
        this.bindEvents();
        this.renderFAQ();
        this.setupSearch();
        
        console.log('FAQManager initialized');
    }
    
    /**
     * FAQ 데이터 로드
     */
    async loadFAQData() {
        try {
            const response = await fetch('assets/js/data/faq.json');
            if (response.ok) {
                const data = await response.json();
                this.faqData = data.faq || [];
                this.categories = data.categories || [];
                this.filteredFaq = [...this.faqData];
                
                console.log(`Loaded ${this.faqData.length} FAQ items`);
            }
        } catch (error) {
            console.error('Failed to load FAQ data:', error);
            this.showError('FAQ 데이터를 불러오는데 실패했습니다.');
        }
    }
    
    /**
     * 카테고리 설정
     */
    setupCategories() {
        const categoryContainer = document.getElementById('faq-categories');
        if (!categoryContainer) return;
        
        const allCategory = `
            <button class="category-btn active" data-category="all">
                <span class="category-icon">📋</span>
                <span class="category-name">전체</span>
                <span class="category-count">${this.faqData.length}</span>
            </button>
        `;
        
        const categoryButtons = this.categories.map(category => `
            <button class="category-btn" data-category="${category.id}">
                <span class="category-icon">${category.icon}</span>
                <span class="category-name">${category.name}</span>
                <span class="category-count">${this.getCategoryCount(category.id)}</span>
            </button>
        `).join('');
        
        categoryContainer.innerHTML = allCategory + categoryButtons;
    }
    
    /**
     * 카테고리별 FAQ 개수 반환
     */
    getCategoryCount(categoryId) {
        return this.faqData.filter(item => item.category === categoryId).length;
    }
    
    /**
     * 이벤트 바인딩
     */
    bindEvents() {
        // 카테고리 필터 이벤트
        document.addEventListener('click', (e) => {
            if (e.target.closest('.category-btn')) {
                const categoryBtn = e.target.closest('.category-btn');
                const category = categoryBtn.dataset.category;
                this.setCategory(category);
            }
        });
        
        // FAQ 아이템 클릭 이벤트
        document.addEventListener('click', (e) => {
            if (e.target.closest('.faq-item')) {
                const faqItem = e.target.closest('.faq-item');
                const itemId = faqItem.dataset.id;
                this.toggleFAQItem(itemId);
            }
        });
        
        // 검색 이벤트
        const searchInput = document.getElementById('faq-search');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                this.searchQuery = e.target.value;
                this.filterFAQ();
            });
        }
        
        // 전체 펼치기/접기 이벤트
        document.addEventListener('click', (e) => {
            if (e.target.id === 'expand-all') {
                this.expandAll();
            } else if (e.target.id === 'collapse-all') {
                this.collapseAll();
            }
        });
        
        // FAQ 아이템 키보드 이벤트
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                const faqItem = e.target.closest('.faq-item');
                if (faqItem) {
                    e.preventDefault();
                    const itemId = faqItem.dataset.id;
                    this.toggleFAQItem(itemId);
                }
            }
        });
    }
    
    /**
     * FAQ 렌더링
     */
    renderFAQ() {
        const container = document.getElementById('faq-list');
        if (!container) return;
        
        if (this.filteredFaq.length === 0) {
            container.innerHTML = this.getNoResultsHTML();
            return;
        }
        
        container.innerHTML = this.filteredFaq.map(item => this.getFAQItemHTML(item)).join('');
        
        // 애니메이션 효과
        this.addFAQAnimations();
    }
    
    /**
     * FAQ 아이템 HTML 생성
     */
    getFAQItemHTML(item) {
        const isExpanded = this.expandedItems.has(item.id);
        const category = this.categories.find(cat => cat.id === item.category);
        
        return `
            <div class="faq-item ${isExpanded ? 'expanded' : ''}" data-id="${item.id}" tabindex="0">
                <div class="faq-question">
                    <div class="question-content">
                        <span class="category-tag" style="background-color: ${category?.color || '#007bff'}">
                            ${category?.name || '기타'}
                        </span>
                        <h3 class="question-text">${item.question}</h3>
                    </div>
                    <div class="question-toggle">
                        <span class="toggle-icon">${isExpanded ? '−' : '+'}</span>
                    </div>
                </div>
                <div class="faq-answer ${isExpanded ? 'show' : ''}">
                    <div class="answer-content">
                        ${this.formatAnswer(item.answer)}
                    </div>
                    ${item.tags ? `
                        <div class="answer-tags">
                            ${item.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
                        </div>
                    ` : ''}
                    ${item.related ? `
                        <div class="related-links">
                            <h4>관련 링크</h4>
                            <ul>
                                ${item.related.map(link => `
                                    <li><a href="${link.url}" target="_blank">${link.title}</a></li>
                                `).join('')}
                            </ul>
                        </div>
                    ` : ''}
                </div>
            </div>
        `;
    }
    
    /**
     * 답변 포맷팅
     */
    formatAnswer(answer) {
        if (typeof answer === 'string') {
            return answer.replace(/\n/g, '<br>');
        } else if (Array.isArray(answer)) {
            return answer.map(item => {
                if (typeof item === 'string') {
                    return `<p>${item}</p>`;
                } else if (item.type === 'list') {
                    return `
                        <ul>
                            ${item.items.map(listItem => `<li>${listItem}</li>`).join('')}
                        </ul>
                    `;
                } else if (item.type === 'code') {
                    return `<pre><code>${item.content}</code></pre>`;
                }
                return '';
            }).join('');
        }
        return answer;
    }
    
    /**
     * 검색 결과 없음 HTML
     */
    getNoResultsHTML() {
        return `
            <div class="no-results">
                <div class="no-results-icon">🔍</div>
                <h3>검색 결과가 없습니다</h3>
                <p>"${this.searchQuery}"에 대한 FAQ를 찾을 수 없습니다.</p>
                <div class="no-results-suggestions">
                    <h4>다른 검색어를 시도해보세요:</h4>
                    <ul>
                        <li>더 간단한 키워드로 검색</li>
                        <li>오타가 없는지 확인</li>
                        <li>다른 카테고리에서 찾아보기</li>
                    </ul>
                </div>
                <button class="btn btn-primary" onclick="faqManager.clearSearch()">
                    검색 초기화
                </button>
            </div>
        `;
    }
    
    /**
     * 카테고리 설정
     */
    setCategory(category) {
        this.currentCategory = category;
        
        // 카테고리 버튼 활성화 상태 변경
        document.querySelectorAll('.category-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        event.target.closest('.category-btn').classList.add('active');
        
        this.filterFAQ();
    }
    
    /**
     * FAQ 필터링
     */
    filterFAQ() {
        let filtered = [...this.faqData];
        
        // 카테고리 필터
        if (this.currentCategory !== 'all') {
            filtered = filtered.filter(item => item.category === this.currentCategory);
        }
        
        // 검색 필터
        if (this.searchQuery.trim()) {
            const query = this.searchQuery.toLowerCase();
            filtered = filtered.filter(item => 
                item.question.toLowerCase().includes(query) ||
                (typeof item.answer === 'string' && item.answer.toLowerCase().includes(query)) ||
                (item.tags && item.tags.some(tag => tag.toLowerCase().includes(query)))
            );
        }
        
        this.filteredFaq = filtered;
        this.renderFAQ();
        this.updateSearchStats();
    }
    
    /**
     * 검색 통계 업데이트
     */
    updateSearchStats() {
        const statsContainer = document.getElementById('search-stats');
        if (!statsContainer) return;
        
        const total = this.faqData.length;
        const filtered = this.filteredFaq.length;
        
        if (this.searchQuery.trim() || this.currentCategory !== 'all') {
            statsContainer.innerHTML = `
                <span class="stats-text">
                    ${filtered}개 결과 (전체 ${total}개 중)
                </span>
            `;
            statsContainer.style.display = 'block';
        } else {
            statsContainer.style.display = 'none';
        }
    }
    
    /**
     * FAQ 아이템 토글
     */
    toggleFAQItem(itemId) {
        const faqItem = document.querySelector(`[data-id="${itemId}"]`);
        if (!faqItem) return;
        
        const isExpanded = this.expandedItems.has(itemId);
        
        if (isExpanded) {
            this.collapseItem(itemId);
        } else {
            this.expandItem(itemId);
        }
        
        // 접근성 개선
        faqItem.focus();
    }
    
    /**
     * FAQ 아이템 펼치기
     */
    expandItem(itemId) {
        this.expandedItems.add(itemId);
        
        const faqItem = document.querySelector(`[data-id="${itemId}"]`);
        if (faqItem) {
            faqItem.classList.add('expanded');
            
            const answer = faqItem.querySelector('.faq-answer');
            const toggleIcon = faqItem.querySelector('.toggle-icon');
            
            if (answer) {
                answer.classList.add('show');
                answer.style.maxHeight = answer.scrollHeight + 'px';
            }
            
            if (toggleIcon) {
                toggleIcon.textContent = '−';
            }
        }
        
        // 분석 이벤트 (선택사항)
        this.trackFAQInteraction(itemId, 'expand');
    }
    
    /**
     * FAQ 아이템 접기
     */
    collapseItem(itemId) {
        this.expandedItems.delete(itemId);
        
        const faqItem = document.querySelector(`[data-id="${itemId}"]`);
        if (faqItem) {
            faqItem.classList.remove('expanded');
            
            const answer = faqItem.querySelector('.faq-answer');
            const toggleIcon = faqItem.querySelector('.toggle-icon');
            
            if (answer) {
                answer.classList.remove('show');
                answer.style.maxHeight = '0';
            }
            
            if (toggleIcon) {
                toggleIcon.textContent = '+';
            }
        }
        
        // 분석 이벤트 (선택사항)
        this.trackFAQInteraction(itemId, 'collapse');
    }
    
    /**
     * 전체 펼치기
     */
    expandAll() {
        this.filteredFaq.forEach(item => {
            if (!this.expandedItems.has(item.id)) {
                this.expandItem(item.id);
            }
        });
        
        this.showToast('모든 FAQ가 펼쳐졌습니다.');
    }
    
    /**
     * 전체 접기
     */
    collapseAll() {
        this.expandedItems.forEach(itemId => {
            this.collapseItem(itemId);
        });
        
        this.showToast('모든 FAQ가 접혔습니다.');
    }
    
    /**
     * 검색 초기화
     */
    clearSearch() {
        this.searchQuery = '';
        this.currentCategory = 'all';
        
        // UI 초기화
        const searchInput = document.getElementById('faq-search');
        if (searchInput) {
            searchInput.value = '';
        }
        
        document.querySelectorAll('.category-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector('.category-btn[data-category="all"]').classList.add('active');
        
        this.filterFAQ();
    }
    
    /**
     * 검색 설정
     */
    setupSearch() {
        const searchContainer = document.getElementById('faq-search-container');
        if (!searchContainer) return;
        
        searchContainer.innerHTML = `
            <div class="search-wrapper">
                <input type="text" id="faq-search" placeholder="FAQ 검색..." aria-label="FAQ 검색">
                <button type="button" id="search-clear" aria-label="검색 초기화">×</button>
            </div>
            <div class="search-controls">
                <button type="button" id="expand-all" class="btn btn-secondary">
                    전체 펼치기
                </button>
                <button type="button" id="collapse-all" class="btn btn-secondary">
                    전체 접기
                </button>
            </div>
            <div id="search-stats" class="search-stats" style="display: none;"></div>
        `;
        
        // 검색 초기화 버튼 이벤트
        const clearBtn = document.getElementById('search-clear');
        if (clearBtn) {
            clearBtn.addEventListener('click', () => {
                this.clearSearch();
            });
        }
    }
    
    /**
     * FAQ 애니메이션 추가
     */
    addFAQAnimations() {
        const items = document.querySelectorAll('.faq-item');
        items.forEach((item, index) => {
            item.style.animationDelay = `${index * 0.1}s`;
            item.classList.add('animate-in');
        });
    }
    
    /**
     * FAQ 상호작용 추적
     */
    trackFAQInteraction(itemId, action) {
        // 분석 이벤트 추적 (Google Analytics, Mixpanel 등)
        if (typeof gtag !== 'undefined') {
            gtag('event', 'faq_interaction', {
                'event_category': 'FAQ',
                'event_label': `${itemId}_${action}`,
                'value': 1
            });
        }
    }
    
    /**
     * 에러 표시
     */
    showError(message) {
        const container = document.getElementById('faq-list');
        if (container) {
            container.innerHTML = `
                <div class="error-message">
                    <div class="error-icon">⚠️</div>
                    <h3>오류가 발생했습니다</h3>
                    <p>${message}</p>
                    <button class="btn btn-primary" onclick="faqManager.init()">
                        다시 시도
                    </button>
                </div>
            `;
        }
    }
    
    /**
     * 토스트 메시지 표시
     */
    showToast(message) {
        const toast = document.createElement('div');
        toast.className = 'toast-message';
        toast.textContent = message;
        
        document.body.appendChild(toast);
        
        setTimeout(() => {
            toast.classList.add('show');
        }, 100);
        
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => {
                document.body.removeChild(toast);
            }, 300);
        }, 3000);
    }
    
    /**
     * FAQ 통계 반환
     */
    getStats() {
        return {
            totalFAQ: this.faqData.length,
            filteredFAQ: this.filteredFaq.length,
            expandedItems: this.expandedItems.size,
            currentCategory: this.currentCategory,
            searchQuery: this.searchQuery
        };
    }
    
    /**
     * FAQ 검색
     */
    search(query) {
        this.searchQuery = query;
        this.filterFAQ();
    }
    
    /**
     * 특정 FAQ 찾기
     */
    findFAQ(query) {
        return this.faqData.filter(item => 
            item.question.toLowerCase().includes(query.toLowerCase()) ||
            (typeof item.answer === 'string' && item.answer.toLowerCase().includes(query.toLowerCase()))
        );
    }
}

// 전역 인스턴스 생성
window.faqManager = new FAQManager(); 