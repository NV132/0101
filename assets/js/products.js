/**
 * Products Module
 * 보험 상품 관리 기능을 담당하는 모듈
 */

class ProductsManager {
    constructor() {
        this.products = [];
        this.filteredProducts = [];
        this.categories = [];
        this.currentCategory = null;
        this.searchQuery = '';
        this.sortBy = 'popularity';
        this.isLoading = false;
        this.currentPage = 1;
        this.productsPerPage = 12;
        
        this.init();
    }
    
    /**
     * 초기화
     */
    async init() {
        await this.loadAllProducts();
        this.bindEvents();
        this.renderProducts();
        this.renderCategories();
        this.renderFilters();
        
        console.log('ProductsManager initialized');
    }
    
    /**
     * 모든 상품 데이터 로드
     */
    async loadAllProducts() {
        this.isLoading = true;
        this.showLoading();
        
        try {
            const categories = ['life-insurance', 'health-insurance', 'auto-insurance', 'property-insurance'];
            const allProducts = [];
            
            for (const category of categories) {
                try {
                    const response = await fetch(`assets/js/data/products/${category}.json`);
                    if (response.ok) {
                        const data = await response.json();
                        allProducts.push(...data.products);
                        
                        // 카테고리 정보 저장
                        if (!this.categories.find(cat => cat.id === category)) {
                            this.categories.push({
                                id: category,
                                title: data.title,
                                description: data.description,
                                faq: data.faq || [],
                                tips: data.tips || []
                            });
                        }
                    }
                } catch (error) {
                    console.error(`Failed to load ${category}:`, error);
                }
            }
            
            this.products = allProducts;
            this.filteredProducts = [...allProducts];
            
            console.log(`Loaded ${allProducts.length} products from ${categories.length} categories`);
            
        } catch (error) {
            console.error('Failed to load products:', error);
            this.showError('상품을 불러오는데 실패했습니다.');
        } finally {
            this.isLoading = false;
            this.hideLoading();
        }
    }
    
    /**
     * 이벤트 바인딩
     */
    bindEvents() {
        // 검색 이벤트
        const searchInput = document.getElementById('product-search');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                this.searchQuery = e.target.value;
                this.filterProducts();
            });
        }
        
        // 카테고리 필터 이벤트
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('category-tab')) {
                const category = e.target.dataset.category;
                this.setCategory(category);
            }
        });
        
        // 정렬 이벤트
        const sortSelect = document.getElementById('product-sort');
        if (sortSelect) {
            sortSelect.addEventListener('change', (e) => {
                this.sortBy = e.target.value;
                this.sortProducts();
            });
        }
        
        // 상품 카드 클릭 이벤트
        document.addEventListener('click', (e) => {
            if (e.target.closest('.product-card')) {
                const productId = e.target.closest('.product-card').dataset.productId;
                this.showProductModal(productId);
            }
        });
        
        // 모달 닫기 이벤트
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('modal-overlay') || 
                e.target.classList.contains('modal-close')) {
                this.hideProductModal();
            }
        });
        
        // 페이지네이션 이벤트
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('pagination-btn')) {
                const page = parseInt(e.target.dataset.page);
                this.goToPage(page);
            }
        });
        
        // 필터 초기화 이벤트
        const resetFiltersBtn = document.getElementById('reset-filters');
        if (resetFiltersBtn) {
            resetFiltersBtn.addEventListener('click', () => {
                this.resetFilters();
            });
        }
    }
    
    /**
     * 상품 렌더링
     */
    renderProducts() {
        const container = document.getElementById('products-grid');
        if (!container) return;
        
        const startIndex = (this.currentPage - 1) * this.productsPerPage;
        const endIndex = startIndex + this.productsPerPage;
        const pageProducts = this.filteredProducts.slice(startIndex, endIndex);
        
        if (pageProducts.length === 0) {
            container.innerHTML = this.getNoProductsHTML();
            return;
        }
        
        container.innerHTML = pageProducts.map(product => this.getProductCardHTML(product)).join('');
        
        // 페이지네이션 렌더링
        this.renderPagination();
        
        // 애니메이션 효과
        this.addProductAnimations();
    }
    
    /**
     * 상품 카드 HTML 생성
     */
    getProductCardHTML(product) {
        const ratingStars = this.getRatingStars(product.rating);
        const popularityBadge = this.getPopularityBadge(product.popularity);
        
        return `
            <div class="product-card" data-product-id="${product.id}">
                <div class="product-image">
                    <img src="assets/images/products/${product.image}" alt="${product.name}" 
                         onerror="this.src='assets/images/products/default.jpg'">
                    ${popularityBadge}
                </div>
                <div class="product-content">
                    <div class="product-header">
                        <h3 class="product-name">${product.name}</h3>
                        <p class="product-subtitle">${product.subtitle}</p>
                    </div>
                    <div class="product-description">
                        ${product.description}
                    </div>
                    <div class="product-features">
                        ${product.features.slice(0, 3).map(feature => 
                            `<span class="feature-tag">${feature}</span>`
                        ).join('')}
                        ${product.features.length > 3 ? 
                            `<span class="feature-more">+${product.features.length - 3}개 더</span>` : 
                            ''
                        }
                    </div>
                    <div class="product-rating">
                        <div class="stars">${ratingStars}</div>
                        <span class="rating-text">${product.rating} (${product.reviewCount})</span>
                    </div>
                    <div class="product-price">
                        <span class="price-label">월 보험료</span>
                        <span class="price-amount">${this.formatPrice(product.premium.monthly)}</span>
                        <span class="price-discount">${product.premium.discount}</span>
                    </div>
                    <div class="product-actions">
                        <button class="btn btn-primary btn-sm" onclick="productsManager.showProductModal('${product.id}')">
                            상세보기
                        </button>
                        <button class="btn btn-secondary btn-sm" onclick="productsManager.addToCompare('${product.id}')">
                            비교하기
                        </button>
                    </div>
                </div>
            </div>
        `;
    }
    
    /**
     * 상품이 없을 때 HTML
     */
    getNoProductsHTML() {
        return `
            <div class="no-products">
                <div class="no-products-icon">
                    <i class="fas fa-search"></i>
                </div>
                <h3>검색 결과가 없습니다</h3>
                <p>다른 검색어나 필터를 시도해 보세요.</p>
                <button class="btn btn-primary" onclick="productsManager.resetFilters()">
                    필터 초기화
                </button>
            </div>
        `;
    }
    
    /**
     * 카테고리 렌더링
     */
    renderCategories() {
        const container = document.getElementById('category-tabs');
        if (!container) return;
        
        const allCategoriesHTML = `
            <button class="category-tab active" data-category="all">
                <i class="fas fa-th-large"></i>
                전체보기
            </button>
        `;
        
        const categoryTabsHTML = this.categories.map(category => `
            <button class="category-tab" data-category="${category.id}">
                <i class="fas fa-${this.getCategoryIcon(category.id)}"></i>
                ${category.title}
            </button>
        `).join('');
        
        container.innerHTML = allCategoriesHTML + categoryTabsHTML;
    }
    
    /**
     * 필터 렌더링
     */
    renderFilters() {
        const container = document.getElementById('product-filters');
        if (!container) return;
        
        container.innerHTML = `
            <div class="filter-group">
                <label for="product-sort">정렬</label>
                <select id="product-sort" class="filter-select">
                    <option value="popularity">인기순</option>
                    <option value="rating">평점순</option>
                    <option value="price-low">보험료 낮은순</option>
                    <option value="price-high">보험료 높은순</option>
                    <option value="name">이름순</option>
                </select>
            </div>
            <div class="filter-group">
                <label for="price-range">보험료 범위</label>
                <select id="price-range" class="filter-select">
                    <option value="all">전체</option>
                    <option value="low">5만원 이하</option>
                    <option value="medium">5-10만원</option>
                    <option value="high">10만원 이상</option>
                </select>
            </div>
            <div class="filter-group">
                <button id="reset-filters" class="btn btn-secondary btn-sm">
                    필터 초기화
                </button>
            </div>
        `;
        
        // 가격 범위 필터 이벤트
        const priceRangeSelect = document.getElementById('price-range');
        if (priceRangeSelect) {
            priceRangeSelect.addEventListener('change', (e) => {
                this.filterByPrice(e.target.value);
            });
        }
    }
    
    /**
     * 페이지네이션 렌더링
     */
    renderPagination() {
        const container = document.getElementById('pagination');
        if (!container) return;
        
        const totalPages = Math.ceil(this.filteredProducts.length / this.productsPerPage);
        
        if (totalPages <= 1) {
            container.innerHTML = '';
            return;
        }
        
        let paginationHTML = '';
        
        // 이전 페이지 버튼
        if (this.currentPage > 1) {
            paginationHTML += `
                <button class="pagination-btn" data-page="${this.currentPage - 1}">
                    <i class="fas fa-chevron-left"></i>
                </button>
            `;
        }
        
        // 페이지 번호
        const startPage = Math.max(1, this.currentPage - 2);
        const endPage = Math.min(totalPages, this.currentPage + 2);
        
        for (let i = startPage; i <= endPage; i++) {
            paginationHTML += `
                <button class="pagination-btn ${i === this.currentPage ? 'active' : ''}" data-page="${i}">
                    ${i}
                </button>
            `;
        }
        
        // 다음 페이지 버튼
        if (this.currentPage < totalPages) {
            paginationHTML += `
                <button class="pagination-btn" data-page="${this.currentPage + 1}">
                    <i class="fas fa-chevron-right"></i>
                </button>
            `;
        }
        
        container.innerHTML = paginationHTML;
    }
    
    /**
     * 카테고리 설정
     */
    setCategory(category) {
        this.currentCategory = category === 'all' ? null : category;
        this.currentPage = 1;
        
        // 카테고리 탭 활성화
        document.querySelectorAll('.category-tab').forEach(tab => {
            tab.classList.remove('active');
        });
        
        const activeTab = document.querySelector(`[data-category="${category}"]`);
        if (activeTab) {
            activeTab.classList.add('active');
        }
        
        this.filterProducts();
    }
    
    /**
     * 상품 필터링
     */
    filterProducts() {
        let filtered = [...this.products];
        
        // 카테고리 필터
        if (this.currentCategory) {
            filtered = filtered.filter(product => 
                product.id.startsWith(this.currentCategory.replace('-insurance', ''))
            );
        }
        
        // 검색 필터
        if (this.searchQuery) {
            const query = this.searchQuery.toLowerCase();
            filtered = filtered.filter(product =>
                product.name.toLowerCase().includes(query) ||
                product.description.toLowerCase().includes(query) ||
                product.features.some(feature => 
                    feature.toLowerCase().includes(query)
                )
            );
        }
        
        this.filteredProducts = filtered;
        this.sortProducts();
        this.renderProducts();
    }
    
    /**
     * 가격 범위 필터
     */
    filterByPrice(range) {
        if (range === 'all') {
            this.filterProducts();
            return;
        }
        
        let filtered = [...this.filteredProducts];
        
        switch (range) {
            case 'low':
                filtered = filtered.filter(product => product.premium.monthly <= 50000);
                break;
            case 'medium':
                filtered = filtered.filter(product => 
                    product.premium.monthly > 50000 && product.premium.monthly <= 100000
                );
                break;
            case 'high':
                filtered = filtered.filter(product => product.premium.monthly > 100000);
                break;
        }
        
        this.filteredProducts = filtered;
        this.renderProducts();
    }
    
    /**
     * 상품 정렬
     */
    sortProducts() {
        const sorted = [...this.filteredProducts];
        
        switch (this.sortBy) {
            case 'popularity':
                sorted.sort((a, b) => {
                    const popularityOrder = { 'best': 3, 'popular': 2, 'standard': 1 };
                    return popularityOrder[b.popularity] - popularityOrder[a.popularity];
                });
                break;
            case 'rating':
                sorted.sort((a, b) => b.rating - a.rating);
                break;
            case 'price-low':
                sorted.sort((a, b) => a.premium.monthly - b.premium.monthly);
                break;
            case 'price-high':
                sorted.sort((a, b) => b.premium.monthly - a.premium.monthly);
                break;
            case 'name':
                sorted.sort((a, b) => a.name.localeCompare(b.name));
                break;
        }
        
        this.filteredProducts = sorted;
        this.renderProducts();
    }
    
    /**
     * 필터 초기화
     */
    resetFilters() {
        this.currentCategory = null;
        this.searchQuery = '';
        this.sortBy = 'popularity';
        this.currentPage = 1;
        
        // UI 초기화
        const searchInput = document.getElementById('product-search');
        if (searchInput) {
            searchInput.value = '';
        }
        
        const sortSelect = document.getElementById('product-sort');
        if (sortSelect) {
            sortSelect.value = 'popularity';
        }
        
        const priceRangeSelect = document.getElementById('price-range');
        if (priceRangeSelect) {
            priceRangeSelect.value = 'all';
        }
        
        // 카테고리 탭 초기화
        document.querySelectorAll('.category-tab').forEach(tab => {
            tab.classList.remove('active');
        });
        
        const allTab = document.querySelector('[data-category="all"]');
        if (allTab) {
            allTab.classList.add('active');
        }
        
        this.filteredProducts = [...this.products];
        this.sortProducts();
        this.renderProducts();
    }
    
    /**
     * 페이지 이동
     */
    goToPage(page) {
        this.currentPage = page;
        this.renderProducts();
        
        // 페이지 상단으로 스크롤
        const productsSection = document.getElementById('products-section');
        if (productsSection) {
            productsSection.scrollIntoView({ behavior: 'smooth' });
        }
    }
    
    /**
     * 상품 모달 표시
     */
    showProductModal(productId) {
        const product = this.products.find(p => p.id === productId);
        if (!product) return;
        
        const modalHTML = this.getProductModalHTML(product);
        
        // 모달 컨테이너 생성 또는 업데이트
        let modalContainer = document.getElementById('product-modal');
        if (!modalContainer) {
            modalContainer = document.createElement('div');
            modalContainer.id = 'product-modal';
            document.body.appendChild(modalContainer);
        }
        
        modalContainer.innerHTML = `
            <div class="modal-overlay">
                <div class="modal">
                    ${modalHTML}
                </div>
            </div>
        `;
        
        // 모달 표시
        modalContainer.style.display = 'block';
        document.body.style.overflow = 'hidden';
        
        // 모달 내부 이벤트 바인딩
        this.bindModalEvents();
        
        // 애니메이션 효과
        setTimeout(() => {
            const modal = modalContainer.querySelector('.modal');
            if (modal) {
                modal.classList.add('animate-scale-in');
            }
        }, 10);
    }
    
    /**
     * 상품 모달 HTML 생성
     */
    getProductModalHTML(product) {
        const ratingStars = this.getRatingStars(product.rating);
        const coverageHTML = Object.entries(product.coverage).map(([key, value]) => `
            <div class="coverage-item">
                <span class="coverage-label">${key}</span>
                <span class="coverage-value">${value}</span>
            </div>
        `).join('');
        
        const featuresHTML = product.features.map(feature => `
            <li class="feature-item">
                <i class="fas fa-check"></i>
                ${feature}
            </li>
        `).join('');
        
        const exclusionsHTML = product.exclusions.map(exclusion => `
            <li class="exclusion-item">
                <i class="fas fa-times"></i>
                ${exclusion}
            </li>
        `).join('');
        
        return `
            <div class="modal-header">
                <h2 class="modal-title">${product.name}</h2>
                <button class="modal-close">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            <div class="modal-content">
                <div class="product-modal-image">
                    <img src="assets/images/products/${product.image}" alt="${product.name}"
                         onerror="this.src='assets/images/products/default.jpg'">
                </div>
                <div class="product-modal-info">
                    <div class="product-modal-subtitle">${product.subtitle}</div>
                    <div class="product-modal-description">${product.description}</div>
                    
                    <div class="product-modal-rating">
                        <div class="stars">${ratingStars}</div>
                        <span class="rating-text">${product.rating} (${product.reviewCount}개 리뷰)</span>
                    </div>
                    
                    <div class="product-modal-price">
                        <div class="price-item">
                            <span class="price-label">월 보험료</span>
                            <span class="price-amount">${this.formatPrice(product.premium.monthly)}</span>
                        </div>
                        <div class="price-item">
                            <span class="price-label">연 보험료</span>
                            <span class="price-amount">${this.formatPrice(product.premium.yearly)}</span>
                        </div>
                        <div class="price-discount">${product.premium.discount}</div>
                    </div>
                    
                    <div class="product-modal-details">
                        <div class="detail-item">
                            <span class="detail-label">가입연령</span>
                            <span class="detail-value">${product.ageRange}</span>
                        </div>
                        <div class="detail-item">
                            <span class="detail-label">면책기간</span>
                            <span class="detail-value">${product.waitingPeriod}</span>
                        </div>
                    </div>
                </div>
                
                <div class="product-modal-sections">
                    <div class="modal-section">
                        <h3>보장 내용</h3>
                        <div class="coverage-list">
                            ${coverageHTML}
                        </div>
                    </div>
                    
                    <div class="modal-section">
                        <h3>주요 특징</h3>
                        <ul class="features-list">
                            ${featuresHTML}
                        </ul>
                    </div>
                    
                    <div class="modal-section">
                        <h3>면책사유</h3>
                        <ul class="exclusions-list">
                            ${exclusionsHTML}
                        </ul>
                    </div>
                </div>
                
                <div class="modal-actions">
                    <button class="btn btn-primary" onclick="productsManager.addToCompare('${product.id}')">
                        <i class="fas fa-balance-scale"></i>
                        비교하기
                    </button>
                    <button class="btn btn-secondary" onclick="productsManager.shareProduct('${product.id}')">
                        <i class="fas fa-share"></i>
                        공유하기
                    </button>
                    <button class="btn btn-accent" onclick="productsManager.requestConsultation('${product.id}')">
                        <i class="fas fa-phone"></i>
                        상담 신청
                    </button>
                </div>
            </div>
        `;
    }
    
    /**
     * 모달 이벤트 바인딩
     */
    bindModalEvents() {
        // 모달 닫기
        const closeBtn = document.querySelector('.modal-close');
        const overlay = document.querySelector('.modal-overlay');
        
        if (closeBtn) {
            closeBtn.addEventListener('click', () => this.hideProductModal());
        }
        
        if (overlay) {
            overlay.addEventListener('click', (e) => {
                if (e.target === overlay) {
                    this.hideProductModal();
                }
            });
        }
        
        // ESC 키로 모달 닫기
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.hideProductModal();
            }
        });
    }
    
    /**
     * 상품 모달 숨기기
     */
    hideProductModal() {
        const modalContainer = document.getElementById('product-modal');
        if (modalContainer) {
            const modal = modalContainer.querySelector('.modal');
            if (modal) {
                modal.classList.add('animate-scale-out');
                
                setTimeout(() => {
                    modalContainer.style.display = 'none';
                    document.body.style.overflow = '';
                }, 300);
            }
        }
    }
    
    /**
     * 비교하기에 추가
     */
    addToCompare(productId) {
        // 비교하기 기능 구현
        console.log('Add to compare:', productId);
        
        // 토스트 메시지 표시
        this.showToast('비교하기에 추가되었습니다.');
    }
    
    /**
     * 상품 공유
     */
    shareProduct(productId) {
        const product = this.products.find(p => p.id === productId);
        if (!product) return;
        
        const shareData = {
            title: product.name,
            text: product.description,
            url: window.location.href + `?product=${productId}`
        };
        
        if (navigator.share) {
            navigator.share(shareData);
        } else {
            // 클립보드에 복사
            navigator.clipboard.writeText(shareData.url);
            this.showToast('링크가 클립보드에 복사되었습니다.');
        }
    }
    
    /**
     * 상담 신청
     */
    requestConsultation(productId) {
        const product = this.products.find(p => p.id === productId);
        if (!product) return;
        
        // 상담 페이지로 이동
        window.location.href = `consultation.html?product=${productId}`;
    }
    
    /**
     * 유틸리티 메서드들
     */
    getRatingStars(rating) {
        const fullStars = Math.floor(rating);
        const hasHalfStar = rating % 1 >= 0.5;
        const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);
        
        return '★'.repeat(fullStars) + 
               (hasHalfStar ? '☆' : '') + 
               '☆'.repeat(emptyStars);
    }
    
    getPopularityBadge(popularity) {
        const badges = {
            'best': '<span class="badge badge-best">베스트</span>',
            'popular': '<span class="badge badge-popular">인기</span>',
            'standard': ''
        };
        
        return badges[popularity] || '';
    }
    
    getCategoryIcon(categoryId) {
        const icons = {
            'life-insurance': 'heart',
            'health-insurance': 'medical-kit',
            'auto-insurance': 'car',
            'property-insurance': 'home'
        };
        
        return icons[categoryId] || 'shield-alt';
    }
    
    formatPrice(price) {
        return new Intl.NumberFormat('ko-KR').format(price) + '원';
    }
    
    showLoading() {
        const container = document.getElementById('products-grid');
        if (container) {
            container.innerHTML = `
                <div class="loading-container">
                    <div class="loading-spinner"></div>
                    <p>상품을 불러오는 중...</p>
                </div>
            `;
        }
    }
    
    hideLoading() {
        // 로딩 상태는 renderProducts에서 처리됨
    }
    
    showError(message) {
        const container = document.getElementById('products-grid');
        if (container) {
            container.innerHTML = `
                <div class="error-container">
                    <i class="fas fa-exclamation-triangle"></i>
                    <h3>오류가 발생했습니다</h3>
                    <p>${message}</p>
                    <button class="btn btn-primary" onclick="productsManager.init()">
                        다시 시도
                    </button>
                </div>
            `;
        }
    }
    
    showToast(message) {
        const toast = document.createElement('div');
        toast.className = 'toast';
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
    
    addProductAnimations() {
        const cards = document.querySelectorAll('.product-card');
        cards.forEach((card, index) => {
            card.style.animationDelay = `${index * 0.1}s`;
            card.classList.add('animate-fade-in-up');
        });
    }
    
    /**
     * 통계 정보
     */
    getStats() {
        return {
            totalProducts: this.products.length,
            filteredProducts: this.filteredProducts.length,
            categories: this.categories.length,
            currentCategory: this.currentCategory,
            searchQuery: this.searchQuery,
            sortBy: this.sortBy,
            currentPage: this.currentPage,
            totalPages: Math.ceil(this.filteredProducts.length / this.productsPerPage)
        };
    }
}

// 전역 인스턴스 생성
const productsManager = new ProductsManager();

// 전역 함수로 노출
window.productsManager = productsManager;

// DOM 로드 완료 후 초기화
document.addEventListener('DOMContentLoaded', () => {
    if (typeof productsManager !== 'undefined') {
        productsManager.init();
    }
});

export default productsManager; 