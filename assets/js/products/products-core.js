/**
 * Products Core Module
 * 보험 상품 관리 핵심 기능을 담당하는 모듈
 */

class ProductsCore {
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
        
        console.log('ProductsCore initialized');
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
                    <div class="product-footer">
                        <div class="product-rating">
                            ${ratingStars}
                            <span class="rating-text">${product.rating}</span>
                        </div>
                        <div class="product-price">
                            <span class="price-label">월 보험료</span>
                            <span class="price-amount">${this.formatPrice(product.monthlyPremium)}</span>
                        </div>
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
                <div class="no-products-icon">📋</div>
                <h3>검색 결과가 없습니다</h3>
                <p>다른 검색어나 필터를 시도해보세요.</p>
                <button class="btn btn-primary" onclick="productsCore.resetFilters()">
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
        
        const allCategoriesTab = `
            <button class="category-tab active" data-category="all">
                <span class="category-icon">🏠</span>
                <span class="category-name">전체</span>
            </button>
        `;
        
        const categoryTabs = this.categories.map(category => `
            <button class="category-tab" data-category="${category.id}">
                <span class="category-icon">${this.getCategoryIcon(category.id)}</span>
                <span class="category-name">${category.title}</span>
            </button>
        `).join('');
        
        container.innerHTML = allCategoriesTab + categoryTabs;
    }
    
    /**
     * 필터 렌더링
     */
    renderFilters() {
        const container = document.getElementById('product-filters');
        if (!container) return;
        
        container.innerHTML = `
            <div class="filter-group">
                <label for="product-search">검색</label>
                <input type="text" id="product-search" placeholder="상품명, 특징으로 검색...">
            </div>
            <div class="filter-group">
                <label for="product-sort">정렬</label>
                <select id="product-sort">
                    <option value="popularity">인기순</option>
                    <option value="price-low">가격 낮은순</option>
                    <option value="price-high">가격 높은순</option>
                    <option value="rating">평점순</option>
                    <option value="name">이름순</option>
                </select>
            </div>
            <div class="filter-group">
                <button id="reset-filters" class="btn btn-secondary">필터 초기화</button>
            </div>
        `;
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
                    <span>←</span>
                </button>
            `;
        }
        
        // 페이지 번호들
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
                    <span>→</span>
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
        
        // 탭 활성화 상태 변경
        document.querySelectorAll('.category-tab').forEach(tab => {
            tab.classList.remove('active');
        });
        event.target.closest('.category-tab').classList.add('active');
        
        this.filterProducts();
    }
    
    /**
     * 상품 필터링
     */
    filterProducts() {
        let filtered = [...this.products];
        
        // 카테고리 필터
        if (this.currentCategory) {
            filtered = filtered.filter(product => product.category === this.currentCategory);
        }
        
        // 검색 필터
        if (this.searchQuery.trim()) {
            const query = this.searchQuery.toLowerCase();
            filtered = filtered.filter(product => 
                product.name.toLowerCase().includes(query) ||
                product.description.toLowerCase().includes(query) ||
                product.features.some(feature => feature.toLowerCase().includes(query))
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
        let filtered = [...this.filteredProducts];
        
        switch (range) {
            case 'low':
                filtered = filtered.filter(product => product.monthlyPremium <= 50000);
                break;
            case 'medium':
                filtered = filtered.filter(product => 
                    product.monthlyPremium > 50000 && product.monthlyPremium <= 100000
                );
                break;
            case 'high':
                filtered = filtered.filter(product => product.monthlyPremium > 100000);
                break;
        }
        
        this.filteredProducts = filtered;
        this.renderProducts();
    }
    
    /**
     * 상품 정렬
     */
    sortProducts() {
        switch (this.sortBy) {
            case 'popularity':
                this.filteredProducts.sort((a, b) => b.popularity - a.popularity);
                break;
            case 'price-low':
                this.filteredProducts.sort((a, b) => a.monthlyPremium - b.monthlyPremium);
                break;
            case 'price-high':
                this.filteredProducts.sort((a, b) => b.monthlyPremium - a.monthlyPremium);
                break;
            case 'rating':
                this.filteredProducts.sort((a, b) => b.rating - a.rating);
                break;
            case 'name':
                this.filteredProducts.sort((a, b) => a.name.localeCompare(b.name));
                break;
        }
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
        if (searchInput) searchInput.value = '';
        
        const sortSelect = document.getElementById('product-sort');
        if (sortSelect) sortSelect.value = 'popularity';
        
        // 카테고리 탭 초기화
        document.querySelectorAll('.category-tab').forEach(tab => {
            tab.classList.remove('active');
        });
        document.querySelector('.category-tab[data-category="all"]').classList.add('active');
        
        this.filteredProducts = [...this.products];
        this.sortProducts();
        this.renderProducts();
        this.renderCategories();
        
        this.showToast('필터가 초기화되었습니다.');
    }
    
    /**
     * 페이지 이동
     */
    goToPage(page) {
        this.currentPage = page;
        this.renderProducts();
        
        // 페이지 상단으로 스크롤
        const container = document.getElementById('products-grid');
        if (container) {
            container.scrollIntoView({ behavior: 'smooth' });
        }
    }
    
    /**
     * 상품 모달 표시 (ProductsModal로 위임)
     */
    showProductModal(productId) {
        if (window.productsModal) {
            window.productsModal.showModal(productId);
        }
    }
    
    /**
     * 평점 별점 HTML 생성
     */
    getRatingStars(rating) {
        const fullStars = Math.floor(rating);
        const hasHalfStar = rating % 1 !== 0;
        const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);
        
        let starsHTML = '';
        
        for (let i = 0; i < fullStars; i++) {
            starsHTML += '<span class="star full">★</span>';
        }
        
        if (hasHalfStar) {
            starsHTML += '<span class="star half">★</span>';
        }
        
        for (let i = 0; i < emptyStars; i++) {
            starsHTML += '<span class="star empty">☆</span>';
        }
        
        return starsHTML;
    }
    
    /**
     * 인기 배지 HTML 생성
     */
    getPopularityBadge(popularity) {
        if (popularity >= 8) {
            return '<span class="popularity-badge hot">🔥 인기</span>';
        } else if (popularity >= 6) {
            return '<span class="popularity-badge trending">📈 트렌딩</span>';
        }
        return '';
    }
    
    /**
     * 카테고리 아이콘 반환
     */
    getCategoryIcon(categoryId) {
        const icons = {
            'life-insurance': '💝',
            'health-insurance': '🏥',
            'auto-insurance': '🚗',
            'property-insurance': '🏠'
        };
        return icons[categoryId] || '📋';
    }
    
    /**
     * 가격 포맷팅
     */
    formatPrice(price) {
        return new Intl.NumberFormat('ko-KR').format(price) + '원';
    }
    
    /**
     * 로딩 표시
     */
    showLoading() {
        const container = document.getElementById('products-grid');
        if (container) {
            container.innerHTML = `
                <div class="loading-spinner">
                    <div class="spinner"></div>
                    <p>상품을 불러오는 중...</p>
                </div>
            `;
        }
    }
    
    /**
     * 로딩 숨기기
     */
    hideLoading() {
        // 로딩 스피너는 renderProducts에서 자동으로 제거됨
    }
    
    /**
     * 에러 표시
     */
    showError(message) {
        const container = document.getElementById('products-grid');
        if (container) {
            container.innerHTML = `
                <div class="error-message">
                    <div class="error-icon">⚠️</div>
                    <h3>오류가 발생했습니다</h3>
                    <p>${message}</p>
                    <button class="btn btn-primary" onclick="location.reload()">
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
     * 상품 애니메이션 추가
     */
    addProductAnimations() {
        const cards = document.querySelectorAll('.product-card');
        cards.forEach((card, index) => {
            card.style.animationDelay = `${index * 0.1}s`;
            card.classList.add('animate-in');
        });
    }
    
    /**
     * 통계 정보 반환
     */
    getStats() {
        return {
            totalProducts: this.products.length,
            filteredProducts: this.filteredProducts.length,
            currentCategory: this.currentCategory,
            currentPage: this.currentPage,
            totalPages: Math.ceil(this.filteredProducts.length / this.productsPerPage)
        };
    }
}

// 전역 인스턴스 생성
window.productsCore = new ProductsCore(); 