/**
 * Navigation Module
 * 하단탭 네비게이션과 페이지 전환 기능을 담당하는 모듈
 */

class Navigation {
    constructor() {
        this.currentPage = 'home';
        this.pages = ['home', 'products', 'consultation', 'faq'];
        this.isAnimating = false;
        
        this.init();
    }
    
    /**
     * 초기화
     */
    init() {
        this.setupNavigation();
        this.bindEvents();
        this.updateActiveTab();
        this.handleInitialRoute();
        
        console.log('Navigation initialized');
    }
    
    /**
     * 네비게이션 설정
     */
    setupNavigation() {
        const navContainer = document.getElementById('bottom-navigation');
        if (!navContainer) return;
        
        navContainer.innerHTML = `
            <div class="nav-item" data-page="home">
                <div class="nav-icon">🏠</div>
                <div class="nav-label">홈</div>
            </div>
            <div class="nav-item" data-page="products">
                <div class="nav-icon">📋</div>
                <div class="nav-label">상품</div>
            </div>
            <div class="nav-item" data-page="consultation">
                <div class="nav-icon">💬</div>
                <div class="nav-label">상담</div>
            </div>
            <div class="nav-item" data-page="faq">
                <div class="nav-icon">❓</div>
                <div class="nav-label">FAQ</div>
            </div>
        `;
    }
    
    /**
     * 이벤트 바인딩
     */
    bindEvents() {
        // 네비게이션 탭 클릭 이벤트
        document.addEventListener('click', (e) => {
            const navItem = e.target.closest('.nav-item');
            if (navItem && !this.isAnimating) {
                const page = navItem.dataset.page;
                this.navigateToPage(page);
            }
        });
        
        // 브라우저 뒤로가기/앞으로가기 이벤트
        window.addEventListener('popstate', (e) => {
            const page = e.state?.page || 'home';
            this.switchToPage(page, false);
        });
        
        // 페이지 로드 완료 이벤트
        window.addEventListener('load', () => {
            this.handleInitialRoute();
        });
    }
    
    /**
     * 페이지로 이동
     */
    navigateToPage(page) {
        if (this.currentPage === page || this.isAnimating) return;
        
        this.isAnimating = true;
        
        // 페이지 전환 애니메이션
        this.startPageTransition(() => {
            this.switchToPage(page, true);
            this.isAnimating = false;
        });
    }
    
    /**
     * 페이지 전환
     */
    switchToPage(page, updateHistory = true) {
        this.currentPage = page;
        
        // URL 업데이트
        if (updateHistory) {
            const url = this.getPageUrl(page);
            window.history.pushState({ page }, '', url);
        }
        
        // 페이지 내용 로드
        this.loadPageContent(page);
        
        // 활성 탭 업데이트
        this.updateActiveTab();
        
        // 페이지별 초기화
        this.initializePage(page);
    }
    
    /**
     * 페이지 URL 반환
     */
    getPageUrl(page) {
        const urls = {
            'home': 'index.html',
            'products': 'products.html',
            'consultation': 'consultation.html',
            'faq': 'faq.html'
        };
        return urls[page] || 'index.html';
    }
    
    /**
     * 페이지 내용 로드
     */
    loadPageContent(page) {
        const mainContainer = document.getElementById('main-content');
        if (!mainContainer) return;
        
        // 현재 페이지 숨기기
        this.hideCurrentPage();
        
        // 새 페이지 표시
        this.showPage(page);
        
        // 페이지별 스크립트 로드
        this.loadPageScripts(page);
    }
    
    /**
     * 현재 페이지 숨기기
     */
    hideCurrentPage() {
        const pages = document.querySelectorAll('.page-section');
        pages.forEach(page => {
            page.style.display = 'none';
            page.classList.remove('active');
        });
    }
    
    /**
     * 페이지 표시
     */
    showPage(page) {
        const targetPage = document.getElementById(`${page}-page`);
        if (targetPage) {
            targetPage.style.display = 'block';
            targetPage.classList.add('active');
            
            // 페이지 진입 애니메이션
            setTimeout(() => {
                targetPage.classList.add('page-enter');
            }, 100);
        }
    }
    
    /**
     * 페이지별 스크립트 로드
     */
    loadPageScripts(page) {
        // 이미 로드된 스크립트는 다시 로드하지 않음
        const scriptMap = {
            'products': ['assets/js/products/products-core.js', 'assets/js/products/products-modal.js'],
            'consultation': ['assets/js/forms.js'],
            'faq': ['assets/js/faq.js']
        };
        
        const scripts = scriptMap[page] || [];
        scripts.forEach(script => {
            if (!document.querySelector(`script[src="${script}"]`)) {
                this.loadScript(script);
            }
        });
    }
    
    /**
     * 스크립트 동적 로드
     */
    loadScript(src) {
        return new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.src = src;
            script.onload = resolve;
            script.onerror = reject;
            document.head.appendChild(script);
        });
    }
    
    /**
     * 페이지별 초기화
     */
    initializePage(page) {
        switch (page) {
            case 'home':
                this.initializeHomePage();
                break;
            case 'products':
                this.initializeProductsPage();
                break;
            case 'consultation':
                this.initializeConsultationPage();
                break;
            case 'faq':
                this.initializeFaqPage();
                break;
        }
    }
    
    /**
     * 홈 페이지 초기화
     */
    initializeHomePage() {
        // 파티클 애니메이션 시작
        if (window.particlesManager) {
            window.particlesManager.start();
        }
        
        // 히어로 섹션 애니메이션
        this.animateHeroSection();
    }
    
    /**
     * 상품 페이지 초기화
     */
    initializeProductsPage() {
        // 상품 관리자 초기화
        if (window.productsCore) {
            window.productsCore.init();
        }
    }
    
    /**
     * 상담 페이지 초기화
     */
    initializeConsultationPage() {
        // 상담 폼 초기화
        if (window.formsManager) {
            window.formsManager.init();
        }
    }
    
    /**
     * FAQ 페이지 초기화
     */
    initializeFaqPage() {
        // FAQ 아코디언 초기화
        if (window.faqManager) {
            window.faqManager.init();
        }
    }
    
    /**
     * 히어로 섹션 애니메이션
     */
    animateHeroSection() {
        const heroSection = document.querySelector('.hero-section');
        if (heroSection) {
            const elements = heroSection.querySelectorAll('.animate-on-scroll');
            elements.forEach((element, index) => {
                setTimeout(() => {
                    element.classList.add('animate-in');
                }, index * 200);
            });
        }
    }
    
    /**
     * 활성 탭 업데이트
     */
    updateActiveTab() {
        const navItems = document.querySelectorAll('.nav-item');
        navItems.forEach(item => {
            item.classList.remove('active');
            if (item.dataset.page === this.currentPage) {
                item.classList.add('active');
            }
        });
    }
    
    /**
     * 페이지 전환 애니메이션 시작
     */
    startPageTransition(callback) {
        const overlay = document.createElement('div');
        overlay.className = 'page-transition-overlay';
        document.body.appendChild(overlay);
        
        // 페이드 아웃
        setTimeout(() => {
            overlay.classList.add('fade-out');
        }, 50);
        
        // 페이드 인
        setTimeout(() => {
            overlay.classList.add('fade-in');
            callback();
        }, 300);
        
        // 오버레이 제거
        setTimeout(() => {
            document.body.removeChild(overlay);
        }, 600);
    }
    
    /**
     * 초기 라우트 처리
     */
    handleInitialRoute() {
        const path = window.location.pathname;
        const page = this.getPageFromPath(path);
        
        if (page && page !== this.currentPage) {
            this.switchToPage(page, false);
        }
    }
    
    /**
     * 경로에서 페이지 추출
     */
    getPageFromPath(path) {
        const pathMap = {
            '/': 'home',
            '/index.html': 'home',
            '/products.html': 'products',
            '/consultation.html': 'consultation',
            '/faq.html': 'faq'
        };
        
        return pathMap[path] || 'home';
    }
    
    /**
     * 현재 페이지 반환
     */
    getCurrentPage() {
        return this.currentPage;
    }
    
    /**
     * 페이지 이동 가능 여부 확인
     */
    canNavigateTo(page) {
        return this.pages.includes(page) && !this.isAnimating;
    }
    
    /**
     * 네비게이션 상태 반환
     */
    getNavigationState() {
        return {
            currentPage: this.currentPage,
            isAnimating: this.isAnimating,
            availablePages: [...this.pages]
        };
    }
    
    /**
     * 네비게이션 숨기기
     */
    hideNavigation() {
        const nav = document.getElementById('bottom-navigation');
        if (nav) {
            nav.classList.add('hidden');
        }
    }
    
    /**
     * 네비게이션 표시
     */
    showNavigation() {
        const nav = document.getElementById('bottom-navigation');
        if (nav) {
            nav.classList.remove('hidden');
        }
    }
    
    /**
     * 네비게이션 토글
     */
    toggleNavigation() {
        const nav = document.getElementById('bottom-navigation');
        if (nav) {
            nav.classList.toggle('hidden');
        }
    }
    
    /**
     * 스크롤에 따른 네비게이션 자동 숨김
     */
    setupScrollNavigation() {
        let lastScrollTop = 0;
        const scrollThreshold = 50;
        
        window.addEventListener('scroll', () => {
            const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
            
            if (Math.abs(scrollTop - lastScrollTop) > scrollThreshold) {
                if (scrollTop > lastScrollTop) {
                    // 아래로 스크롤
                    this.hideNavigation();
                } else {
                    // 위로 스크롤
                    this.showNavigation();
                }
                lastScrollTop = scrollTop;
            }
        });
    }
}

// 전역 인스턴스 생성
window.navigation = new Navigation(); 