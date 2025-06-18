/**
 * Main Application
 * 메인 애플리케이션
 */

import { globalState, setState, getState, subscribeToState } from './store/state.js';
import { dispatch, ActionCreators, ActionTypes } from './store/reducers.js';
import { initParticleSystem, ParticlePresets } from './particles.js';

// ===== APP CLASS =====

/**
 * 메인 애플리케이션 클래스
 */
class InsuranceApp {
    constructor() {
        this.isInitialized = false;
        this.currentPage = 'home';
        this.particleSystem = null;
        this.eventListeners = new Map();
        
        // 바인딩
        this.handleThemeToggle = this.handleThemeToggle.bind(this);
        this.handleNavigation = this.handleNavigation.bind(this);
        this.handleModalClose = this.handleModalClose.bind(this);
        this.handleChatbotToggle = this.handleChatbotToggle.bind(this);
        this.handleScroll = this.handleScroll.bind(this);
        this.handleResize = this.handleResize.bind(this);
    }
    
    /**
     * 애플리케이션 초기화
     */
    async init() {
        try {
            console.log('🚀 보험사이트 애플리케이션 초기화 시작...');
            
            // 로딩 화면 표시
            this.showLoadingScreen('애플리케이션을 초기화하는 중...');
            
            // 상태 관리 초기화
            await this.initializeState();
            
            // UI 초기화
            await this.initializeUI();
            
            // 이벤트 리스너 설정
            this.setupEventListeners();
            
            // 파티클 시스템 초기화
            this.initializeParticles();
            
            // 데이터 로드
            await this.loadInitialData();
            
            // 상태 구독 설정
            this.setupStateSubscriptions();
            
            // 로딩 화면 숨김
            setTimeout(() => {
                this.hideLoadingScreen();
            }, 1000);
            
            this.isInitialized = true;
            console.log('✅ 애플리케이션 초기화 완료');
            
        } catch (error) {
            console.error('❌ 애플리케이션 초기화 실패:', error);
            this.showError('애플리케이션 초기화 중 오류가 발생했습니다.');
        }
    }
    
    /**
     * 상태 관리 초기화
     */
    async initializeState() {
        console.log('📊 상태 관리 초기화...');
        
        // 저장된 상태 복원
        this.restorePersistedState();
        
        // 시스템 테마 감지
        this.detectSystemTheme();
        
        // URL 파라미터 처리
        this.handleURLParameters();
    }
    
    /**
     * UI 초기화
     */
    async initializeUI() {
        console.log('🎨 UI 초기화...');
        
        // 테마 적용
        this.applyTheme();
        
        // 네비게이션 초기화
        this.initializeNavigation();
        
        // 모달 초기화
        this.initializeModals();
        
        // 챗봇 초기화
        this.initializeChatbot();
        
        // 폼 초기화
        this.initializeForms();
    }
    
    /**
     * 이벤트 리스너 설정
     */
    setupEventListeners() {
        console.log('🎧 이벤트 리스너 설정...');
        
        // 테마 토글
        const themeToggle = document.getElementById('theme-toggle-btn');
        if (themeToggle) {
            this.addEventListener(themeToggle, 'click', this.handleThemeToggle);
        }
        
        // 네비게이션
        const navItems = document.querySelectorAll('.nav-item');
        navItems.forEach(item => {
            this.addEventListener(item, 'click', this.handleNavigation);
        });
        
        // 모달 닫기
        const modalCloses = document.querySelectorAll('.modal-close');
        modalCloses.forEach(close => {
            this.addEventListener(close, 'click', this.handleModalClose);
        });
        
        // 스크롤 이벤트
        this.addEventListener(window, 'scroll', this.handleScroll);
        
        // 리사이즈 이벤트
        this.addEventListener(window, 'resize', this.handleResize);
        
        // 키보드 이벤트
        this.addEventListener(document, 'keydown', this.handleKeydown.bind(this));
        
        // 클릭 이벤트 (전역)
        this.addEventListener(document, 'click', this.handleGlobalClick.bind(this));
    }
    
    /**
     * 파티클 시스템 초기화
     */
    initializeParticles() {
        console.log('✨ 파티클 시스템 초기화...');
        
        const canvas = document.getElementById('particles-canvas');
        if (canvas) {
            const isDark = getState('theme.current') === 'dark';
            const preset = isDark ? 'space' : 'default';
            
            this.particleSystem = initParticleSystem(canvas, preset);
        }
    }
    
    /**
     * 초기 데이터 로드
     */
    async loadInitialData() {
        console.log('📦 초기 데이터 로드...');
        
        try {
            // 보험상품 데이터 로드
            await this.loadProducts();
            
            // FAQ 데이터 로드
            await this.loadFAQs();
            
            // 상담사 데이터 로드
            await this.loadConsultants();
            
        } catch (error) {
            console.error('데이터 로드 실패:', error);
        }
    }
    
    /**
     * 상태 구독 설정
     */
    setupStateSubscriptions() {
        console.log('📡 상태 구독 설정...');
        
        // 테마 변경 구독
        subscribeToState('theme.current', (newTheme) => {
            this.onThemeChange(newTheme);
        });
        
        // 네비게이션 변경 구독
        subscribeToState('navigation.currentSection', (newSection) => {
            this.onSectionChange(newSection);
        });
        
        // 모달 상태 구독
        subscribeToState('modal.isOpen', (isOpen) => {
            this.onModalStateChange(isOpen);
        });
        
        // 챗봇 상태 구독
        subscribeToState('chatbot.isOpen', (isOpen) => {
            this.onChatbotStateChange(isOpen);
        });
    }
    
    /**
     * 보험상품 데이터 로드
     */
    async loadProducts() {
        try {
            // 실제로는 API 호출
            const products = await this.fetchProducts();
            dispatch(ActionCreators.loadProducts(products));
        } catch (error) {
            console.error('보험상품 로드 실패:', error);
            dispatch(ActionCreators.setProductError('보험상품을 불러오는데 실패했습니다.'));
        }
    }
    
    /**
     * FAQ 데이터 로드
     */
    async loadFAQs() {
        try {
            const faqs = await this.fetchFAQs();
            dispatch(ActionCreators.loadFAQs(faqs));
        } catch (error) {
            console.error('FAQ 로드 실패:', error);
            dispatch(ActionCreators.setFAQError('FAQ를 불러오는데 실패했습니다.'));
        }
    }
    
    /**
     * 상담사 데이터 로드
     */
    async loadConsultants() {
        try {
            const consultants = await this.fetchConsultants();
            dispatch(ActionCreators.loadConsultants(consultants));
        } catch (error) {
            console.error('상담사 데이터 로드 실패:', error);
        }
    }
    
    /**
     * 보험상품 데이터 가져오기 (시뮬레이션)
     */
    async fetchProducts() {
        // 실제로는 API 호출
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve([
                    {
                        id: 1,
                        name: '안전한 미래 생명보험',
                        category: 'life',
                        description: '가족을 위한 최고의 선물',
                        premium: { base: 50000 },
                        popularity: 95,
                        tags: ['생명보험', '가족보장', '저렴한보험료']
                    },
                    {
                        id: 2,
                        name: '건강한 하루 건강보험',
                        category: 'health',
                        description: '건강한 삶을 위한 보장',
                        premium: { base: 30000 },
                        popularity: 88,
                        tags: ['건강보험', '질병보장', '입원보장']
                    }
                    // 더 많은 상품들...
                ]);
            }, 1000);
        });
    }
    
    /**
     * FAQ 데이터 가져오기 (시뮬레이션)
     */
    async fetchFAQs() {
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve([
                    {
                        id: 1,
                        question: '보험 가입은 어떻게 하나요?',
                        answer: '온라인으로 간편하게 가입하실 수 있습니다.',
                        category: 'general',
                        tags: ['가입', '온라인']
                    },
                    {
                        id: 2,
                        question: '보험료는 언제 납입하나요?',
                        answer: '매월 자동이체로 납입하실 수 있습니다.',
                        category: 'general',
                        tags: ['보험료', '납입']
                    }
                    // 더 많은 FAQ들...
                ]);
            }, 500);
        });
    }
    
    /**
     * 상담사 데이터 가져오기 (시뮬레이션)
     */
    async fetchConsultants() {
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve([
                    {
                        id: 1,
                        name: '김상담',
                        experience: '10년',
                        specialty: '생명보험',
                        rating: 4.8
                    },
                    {
                        id: 2,
                        name: '이전문',
                        experience: '8년',
                        specialty: '건강보험',
                        rating: 4.9
                    }
                    // 더 많은 상담사들...
                ]);
            }, 300);
        });
    }
    
    /**
     * 저장된 상태 복원
     */
    restorePersistedState() {
        const savedTheme = localStorage.getItem('theme');
        if (savedTheme) {
            setState('theme.current', savedTheme);
        }
        
        const savedPreferences = localStorage.getItem('userPreferences');
        if (savedPreferences) {
            try {
                const preferences = JSON.parse(savedPreferences);
                setState('user.preferences', preferences);
            } catch (error) {
                console.error('사용자 설정 복원 실패:', error);
            }
        }
    }
    
    /**
     * 시스템 테마 감지
     */
    detectSystemTheme() {
        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
        const systemTheme = mediaQuery.matches ? 'dark' : 'light';
        
        setState('theme.system', systemTheme);
        
        // 자동 테마가 설정된 경우 시스템 테마 적용
        if (getState('theme.current') === 'auto') {
            setState('theme.current', systemTheme);
        }
        
        // 시스템 테마 변경 감지
        mediaQuery.addEventListener('change', (e) => {
            const newSystemTheme = e.matches ? 'dark' : 'light';
            setState('theme.system', newSystemTheme);
            
            if (getState('theme.current') === 'auto') {
                setState('theme.current', newSystemTheme);
            }
        });
    }
    
    /**
     * URL 파라미터 처리
     */
    handleURLParameters() {
        const urlParams = new URLSearchParams(window.location.search);
        const section = urlParams.get('section');
        
        if (section && ['home', 'products', 'consultation', 'faq'].includes(section)) {
            setState('navigation.currentSection', section);
        }
    }
    
    /**
     * 테마 적용
     */
    applyTheme() {
        const theme = getState('theme.current');
        document.body.className = `theme-${theme}`;
        
        // 메타 태그 업데이트
        const metaThemeColor = document.querySelector('meta[name="theme-color"]');
        if (metaThemeColor) {
            metaThemeColor.setAttribute('content', theme === 'dark' ? '#0a0a0a' : '#ffffff');
        }
    }
    
    /**
     * 네비게이션 초기화
     */
    initializeNavigation() {
        const currentSection = getState('navigation.currentSection');
        this.updateNavigationUI(currentSection);
    }
    
    /**
     * 모달 초기화
     */
    initializeModals() {
        // 모달 외부 클릭 시 닫기
        const modals = document.querySelectorAll('.modal-overlay');
        modals.forEach(modal => {
            this.addEventListener(modal, 'click', (e) => {
                if (e.target === modal) {
                    this.closeModal();
                }
            });
        });
    }
    
    /**
     * 챗봇 초기화
     */
    initializeChatbot() {
        const chatbotToggle = document.getElementById('chatbot-toggle');
        const chatbotClose = document.getElementById('chatbot-close');
        const chatbotSend = document.getElementById('chatbot-send');
        const chatbotInput = document.getElementById('chatbot-input');
        
        if (chatbotToggle) {
            this.addEventListener(chatbotToggle, 'click', this.handleChatbotToggle);
        }
        
        if (chatbotClose) {
            this.addEventListener(chatbotClose, 'click', () => {
                dispatch(ActionCreators.closeChatbot());
            });
        }
        
        if (chatbotSend && chatbotInput) {
            this.addEventListener(chatbotSend, 'click', () => {
                const text = chatbotInput.value.trim();
                if (text) {
                    dispatch(ActionCreators.sendChatbotMessage(text));
                    chatbotInput.value = '';
                }
            });
            
            this.addEventListener(chatbotInput, 'keypress', (e) => {
                if (e.key === 'Enter') {
                    const text = chatbotInput.value.trim();
                    if (text) {
                        dispatch(ActionCreators.sendChatbotMessage(text));
                        chatbotInput.value = '';
                    }
                }
            });
        }
    }
    
    /**
     * 폼 초기화
     */
    initializeForms() {
        // 상담 예약 폼
        const consultationForm = document.getElementById('consultation-form');
        if (consultationForm) {
            this.addEventListener(consultationForm, 'submit', (e) => {
                e.preventDefault();
                this.handleConsultationSubmit();
            });
        }
        
        // 계산기 폼
        const calculatorForm = document.getElementById('calculator-form');
        if (calculatorForm) {
            this.addEventListener(calculatorForm, 'submit', (e) => {
                e.preventDefault();
                this.handleCalculatorSubmit();
            });
        }
    }
    
    // ===== EVENT HANDLERS =====
    
    /**
     * 테마 토글 핸들러
     */
    handleThemeToggle() {
        const currentTheme = getState('theme.current');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        dispatch(ActionCreators.changeTheme(newTheme));
    }
    
    /**
     * 네비게이션 핸들러
     */
    handleNavigation(e) {
        const section = e.currentTarget.dataset.section;
        if (section) {
            dispatch(ActionCreators.navigateToSection(section));
        }
    }
    
    /**
     * 모달 닫기 핸들러
     */
    handleModalClose() {
        dispatch(ActionCreators.closeModal());
    }
    
    /**
     * 챗봇 토글 핸들러
     */
    handleChatbotToggle() {
        const isOpen = getState('chatbot.isOpen');
        if (isOpen) {
            dispatch(ActionCreators.closeChatbot());
        } else {
            dispatch(ActionCreators.openChatbot());
        }
    }
    
    /**
     * 스크롤 핸들러
     */
    handleScroll() {
        // 스크롤 기반 애니메이션
        this.handleScrollAnimations();
    }
    
    /**
     * 리사이즈 핸들러
     */
    handleResize() {
        // 파티클 시스템 리사이즈
        if (this.particleSystem) {
            this.particleSystem.resize();
        }
    }
    
    /**
     * 키보드 핸들러
     */
    handleKeydown(e) {
        // ESC 키로 모달 닫기
        if (e.key === 'Escape') {
            const isModalOpen = getState('modal.isOpen');
            if (isModalOpen) {
                this.closeModal();
            }
        }
        
        // Ctrl/Cmd + K로 검색
        if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
            e.preventDefault();
            this.focusSearch();
        }
    }
    
    /**
     * 전역 클릭 핸들러
     */
    handleGlobalClick(e) {
        // 외부 클릭 시 드롭다운 닫기 등
        this.handleOutsideClicks(e);
    }
    
    // ===== STATE CHANGE HANDLERS =====
    
    /**
     * 테마 변경 핸들러
     */
    onThemeChange(newTheme) {
        this.applyTheme();
        
        // 파티클 시스템 테마 변경
        if (this.particleSystem) {
            const preset = newTheme === 'dark' ? 'space' : 'default';
            this.particleSystem.updateOptions(ParticlePresets[preset]);
        }
        
        // 로컬 스토리지에 저장
        localStorage.setItem('theme', newTheme);
    }
    
    /**
     * 섹션 변경 핸들러
     */
    onSectionChange(newSection) {
        this.updateNavigationUI(newSection);
        this.updatePageContent(newSection);
        this.currentPage = newSection;
    }
    
    /**
     * 모달 상태 변경 핸들러
     */
    onModalStateChange(isOpen) {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
    }
    
    /**
     * 챗봇 상태 변경 핸들러
     */
    onChatbotStateChange(isOpen) {
        const container = document.getElementById('chatbot-container');
        if (container) {
            if (isOpen) {
                container.classList.add('active');
            } else {
                container.classList.remove('active');
            }
        }
    }
    
    // ===== UI UPDATE METHODS =====
    
    /**
     * 네비게이션 UI 업데이트
     */
    updateNavigationUI(section) {
        const navItems = document.querySelectorAll('.nav-item');
        navItems.forEach(item => {
            item.classList.remove('active');
            if (item.dataset.section === section) {
                item.classList.add('active');
            }
        });
    }
    
    /**
     * 페이지 콘텐츠 업데이트
     */
    updatePageContent(section) {
        // 페이지별 콘텐츠 로드
        switch (section) {
            case 'products':
                this.loadProductsPage();
                break;
            case 'consultation':
                this.loadConsultationPage();
                break;
            case 'faq':
                this.loadFAQPage();
                break;
            default:
                this.loadHomePage();
        }
    }
    
    /**
     * 로딩 화면 표시
     */
    showLoadingScreen(message = '로딩 중...') {
        const loadingScreen = document.getElementById('loading-screen');
        if (loadingScreen) {
            loadingScreen.style.display = 'flex';
            const messageEl = loadingScreen.querySelector('p');
            if (messageEl) {
                messageEl.textContent = message;
            }
        }
    }
    
    /**
     * 로딩 화면 숨김
     */
    hideLoadingScreen() {
        const loadingScreen = document.getElementById('loading-screen');
        if (loadingScreen) {
            loadingScreen.classList.add('hidden');
            setTimeout(() => {
                loadingScreen.style.display = 'none';
                loadingScreen.classList.remove('hidden');
            }, 300);
        }
    }
    
    /**
     * 에러 표시
     */
    showError(message) {
        dispatch(ActionCreators.addNotification({
            type: 'error',
            title: '오류',
            message: message
        }));
    }
    
    // ===== UTILITY METHODS =====
    
    /**
     * 이벤트 리스너 추가
     */
    addEventListener(element, event, handler) {
        element.addEventListener(event, handler);
        
        if (!this.eventListeners.has(element)) {
            this.eventListeners.set(element, new Map());
        }
        this.eventListeners.get(element).set(event, handler);
    }
    
    /**
     * 이벤트 리스너 제거
     */
    removeEventListener(element, event) {
        const handlers = this.eventListeners.get(element);
        if (handlers && handlers.has(event)) {
            const handler = handlers.get(event);
            element.removeEventListener(event, handler);
            handlers.delete(event);
        }
    }
    
    /**
     * 모달 닫기
     */
    closeModal() {
        dispatch(ActionCreators.closeModal());
    }
    
    /**
     * 검색 포커스
     */
    focusSearch() {
        const searchInput = document.querySelector('#product-search, #faq-search');
        if (searchInput) {
            searchInput.focus();
        }
    }
    
    /**
     * 스크롤 애니메이션 처리
     */
    handleScrollAnimations() {
        // 스크롤 기반 애니메이션 로직
        const scrollY = window.scrollY;
        const elements = document.querySelectorAll('[data-scroll-animation]');
        
        elements.forEach(element => {
            const rect = element.getBoundingClientRect();
            const isVisible = rect.top < window.innerHeight && rect.bottom > 0;
            
            if (isVisible) {
                element.classList.add('animate-in');
            }
        });
    }
    
    /**
     * 외부 클릭 처리
     */
    handleOutsideClicks(e) {
        // 드롭다운, 팝업 등 외부 클릭 시 닫기
        const dropdowns = document.querySelectorAll('.dropdown.active');
        dropdowns.forEach(dropdown => {
            if (!dropdown.contains(e.target)) {
                dropdown.classList.remove('active');
            }
        });
    }
    
    // ===== PAGE LOAD METHODS =====
    
    /**
     * 홈페이지 로드
     */
    loadHomePage() {
        // 홈페이지 특정 로직
    }
    
    /**
     * 보험상품 페이지 로드
     */
    loadProductsPage() {
        // 보험상품 페이지 특정 로직
    }
    
    /**
     * 상담예약 페이지 로드
     */
    loadConsultationPage() {
        // 상담예약 페이지 특정 로직
    }
    
    /**
     * FAQ 페이지 로드
     */
    loadFAQPage() {
        // FAQ 페이지 특정 로직
    }
    
    // ===== FORM HANDLERS =====
    
    /**
     * 상담 예약 제출 처리
     */
    handleConsultationSubmit() {
        const form = document.getElementById('consultation-form');
        if (!form) return;
        
        const formData = new FormData(form);
        const data = Object.fromEntries(formData.entries());
        
        // 폼 데이터를 상태에 저장
        dispatch(ActionCreators.updateConsultationForm(data));
        
        // 제출 처리
        dispatch(ActionCreators.submitConsultation());
    }
    
    /**
     * 계산기 제출 처리
     */
    handleCalculatorSubmit() {
        const form = document.getElementById('calculator-form');
        if (!form) return;
        
        const formData = new FormData(form);
        const data = Object.fromEntries(formData.entries());
        
        // 폼 데이터를 상태에 저장
        dispatch(ActionCreators.updateCalculatorForm(data));
        
        // 계산 실행
        dispatch(ActionCreators.calculatePremium());
    }
    
    /**
     * 애플리케이션 정리
     */
    destroy() {
        // 이벤트 리스너 정리
        this.eventListeners.forEach((handlers, element) => {
            handlers.forEach((handler, event) => {
                element.removeEventListener(event, handler);
            });
        });
        this.eventListeners.clear();
        
        // 파티클 시스템 정리
        if (this.particleSystem) {
            this.particleSystem.destroy();
        }
        
        console.log('🧹 애플리케이션 정리 완료');
    }
}

// ===== GLOBAL APP INSTANCE =====

// 전역 앱 인스턴스 생성
const app = new InsuranceApp();

// ===== INITIALIZATION =====

/**
 * 애플리케이션 시작
 */
async function startApp() {
    try {
        await app.init();
        
        // 성공 알림
        dispatch(ActionCreators.addNotification({
            type: 'success',
            title: '환영합니다!',
            message: '보험사이트에 오신 것을 환영합니다.'
        }));
        
    } catch (error) {
        console.error('애플리케이션 시작 실패:', error);
    }
}

// ===== GLOBAL FUNCTIONS =====

/**
 * 섹션으로 네비게이션
 * @param {string} section - 섹션명
 */
window.navigateToSection = function(section) {
    dispatch(ActionCreators.navigateToSection(section));
};

/**
 * 모달 열기
 * @param {string} type - 모달 타입
 * @param {Object} data - 모달 데이터
 */
window.openModal = function(type, data) {
    dispatch(ActionCreators.openModal(type, data));
};

/**
 * 모달 닫기
 */
window.closeModal = function() {
    dispatch(ActionCreators.closeModal());
};

/**
 * 챗봇 열기
 */
window.openChatbot = function() {
    dispatch(ActionCreators.openChatbot());
};

/**
 * 챗봇 닫기
 */
window.closeChatbot = function() {
    dispatch(ActionCreators.closeChatbot());
};

/**
 * 상담 예약 열기
 */
window.openConsultation = function() {
    dispatch(ActionCreators.navigateToSection('consultation'));
};

/**
 * 스크롤 애니메이션
 * @param {string} target - 타겟 요소
 */
window.scrollToSection = function(target) {
    const element = document.getElementById(target);
    if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
    }
};

/**
 * 필터 초기화
 */
window.resetFilters = function() {
    dispatch(ActionCreators.searchProducts(''));
    dispatch(ActionCreators.filterProducts(null));
};

/**
 * FAQ 검색 초기화
 */
window.resetFAQSearch = function() {
    dispatch(ActionCreators.searchFAQs(''));
    dispatch(ActionCreators.filterFAQs('all'));
};

/**
 * 폼 초기화
 */
window.resetForm = function() {
    const form = document.getElementById('consultation-form');
    if (form) {
        form.reset();
        dispatch(ActionCreators.updateConsultationForm({}));
    }
};

/**
 * 성공 모달 닫기
 */
window.closeSuccessModal = function() {
    dispatch(ActionCreators.closeModal());
};

/**
 * 계산 저장
 */
window.saveCalculation = function() {
    const result = getState('calculator.result');
    if (result) {
        // 계산 결과 저장 로직
        dispatch(ActionCreators.addNotification({
            type: 'success',
            title: '저장 완료',
            message: '계산 결과가 저장되었습니다.'
        }));
    }
};

/**
 * 보험 가입 신청
 */
window.applyInsurance = function() {
    const result = getState('calculator.result');
    if (result) {
        dispatch(ActionCreators.openModal('success', {
            type: 'application',
            data: result,
            message: '보험 가입 신청이 완료되었습니다.'
        }));
    }
};

// ===== PAGE LOAD =====

// DOM 로드 완료 시 애플리케이션 시작
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', startApp);
} else {
    startApp();
}

// 페이지 언로드 시 정리
window.addEventListener('beforeunload', () => {
    app.destroy();
});

// ===== EXPORT =====

// 전역으로 노출
if (typeof window !== 'undefined') {
    window.InsuranceApp = InsuranceApp;
    window.app = app;
    window.startApp = startApp;
} 