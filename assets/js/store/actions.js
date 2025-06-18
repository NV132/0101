/**
 * State Actions
 * 상태 변경 액션들
 */

import { globalState, setState, batchUpdateState } from './state.js';

// ===== THEME ACTIONS =====

/**
 * 테마 변경 액션
 * @param {string} theme - 테마 ('dark' | 'light')
 */
export function changeTheme(theme) {
    if (!['dark', 'light'].includes(theme)) {
        console.warn('Invalid theme:', theme);
        return;
    }
    
    setState('theme.current', theme);
    
    // DOM에 테마 클래스 적용
    document.body.className = `theme-${theme}`;
    
    // 메타 태그 업데이트
    const metaThemeColor = document.querySelector('meta[name="theme-color"]');
    if (metaThemeColor) {
        metaThemeColor.setAttribute('content', theme === 'dark' ? '#0a0a0a' : '#ffffff');
    }
}

/**
 * 시스템 테마 감지 액션
 */
export function detectSystemTheme() {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const systemTheme = mediaQuery.matches ? 'dark' : 'light';
    
    setState('theme.system', systemTheme);
    
    // 시스템 테마가 자동으로 설정된 경우
    if (getState('theme.current') === 'auto') {
        changeTheme(systemTheme);
    }
    
    // 시스템 테마 변경 감지
    mediaQuery.addEventListener('change', (e) => {
        const newSystemTheme = e.matches ? 'dark' : 'light';
        setState('theme.system', newSystemTheme);
        
        if (getState('theme.current') === 'auto') {
            changeTheme(newSystemTheme);
        }
    });
}

/**
 * 테마 토글 액션
 */
export function toggleTheme() {
    const currentTheme = getState('theme.current');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    changeTheme(newTheme);
}

// ===== NAVIGATION ACTIONS =====

/**
 * 섹션 변경 액션
 * @param {string} section - 섹션명
 */
export function navigateToSection(section) {
    const validSections = ['home', 'products', 'consultation', 'faq'];
    
    if (!validSections.includes(section)) {
        console.warn('Invalid section:', section);
        return;
    }
    
    const currentSection = getState('navigation.currentSection');
    
    // 이전 섹션 저장
    setState('navigation.previousSection', currentSection);
    
    // 새 섹션으로 변경
    setState('navigation.currentSection', section);
    
    // 로딩 상태 설정
    setState('navigation.isLoading', true);
    
    // 페이지 전환 애니메이션
    setTimeout(() => {
        setState('navigation.isLoading', false);
    }, 300);
    
    // URL 업데이트 (SPA)
    if (window.history && window.history.pushState) {
        const url = new URL(window.location);
        url.searchParams.set('section', section);
        window.history.pushState({ section }, '', url);
    }
}

/**
 * 뒤로 가기 액션
 */
export function goBack() {
    const previousSection = getState('navigation.previousSection');
    if (previousSection) {
        navigateToSection(previousSection);
    }
}

// ===== PRODUCT ACTIONS =====

/**
 * 보험상품 로드 액션
 * @param {Array} products - 상품 배열
 */
export function loadProducts(products) {
    setState('products.items', products);
    setState('products.filteredItems', products);
    setState('products.isLoading', false);
    
    // 카테고리 추출
    const categories = [...new Set(products.map(product => product.category))];
    setState('products.categories', categories);
}

/**
 * 상품 검색 액션
 * @param {string} query - 검색어
 */
export function searchProducts(query) {
    setState('products.searchQuery', query);
    
    const products = getState('products.items');
    const selectedCategory = getState('products.selectedCategory');
    const sortBy = getState('products.sortBy');
    
    let filtered = products;
    
    // 카테고리 필터
    if (selectedCategory) {
        filtered = filtered.filter(product => product.category === selectedCategory);
    }
    
    // 검색어 필터
    if (query) {
        const searchLower = query.toLowerCase();
        filtered = filtered.filter(product => 
            product.name.toLowerCase().includes(searchLower) ||
            product.description.toLowerCase().includes(searchLower) ||
            product.tags.some(tag => tag.toLowerCase().includes(searchLower))
        );
    }
    
    // 정렬
    filtered = sortProducts(filtered, sortBy);
    
    setState('products.filteredItems', filtered);
}

/**
 * 상품 카테고리 필터 액션
 * @param {string} category - 카테고리
 */
export function filterProductsByCategory(category) {
    setState('products.selectedCategory', category);
    
    const products = getState('products.items');
    const searchQuery = getState('products.searchQuery');
    const sortBy = getState('products.sortBy');
    
    let filtered = products;
    
    // 카테고리 필터
    if (category) {
        filtered = filtered.filter(product => product.category === category);
    }
    
    // 검색어 필터
    if (searchQuery) {
        const searchLower = searchQuery.toLowerCase();
        filtered = filtered.filter(product => 
            product.name.toLowerCase().includes(searchLower) ||
            product.description.toLowerCase().includes(searchLower) ||
            product.tags.some(tag => tag.toLowerCase().includes(searchLower))
        );
    }
    
    // 정렬
    filtered = sortProducts(filtered, sortBy);
    
    setState('products.filteredItems', filtered);
}

/**
 * 상품 정렬 액션
 * @param {string} sortBy - 정렬 기준
 */
export function sortProducts(sortBy) {
    setState('products.sortBy', sortBy);
    
    const filtered = getState('products.filteredItems');
    const sorted = sortProducts(filtered, sortBy);
    
    setState('products.filteredItems', sorted);
}

/**
 * 상품 정렬 헬퍼 함수
 * @param {Array} products - 상품 배열
 * @param {string} sortBy - 정렬 기준
 * @returns {Array} 정렬된 배열
 */
function sortProducts(products, sortBy) {
    const sorted = [...products];
    
    switch (sortBy) {
        case 'price-low':
            return sorted.sort((a, b) => a.premium.base - b.premium.base);
        case 'price-high':
            return sorted.sort((a, b) => b.premium.base - a.premium.base);
        case 'name':
            return sorted.sort((a, b) => a.name.localeCompare(b.name));
        case 'popular':
        default:
            return sorted.sort((a, b) => (b.popularity || 0) - (a.popularity || 0));
    }
}

// ===== MODAL ACTIONS =====

/**
 * 모달 열기 액션
 * @param {string} type - 모달 타입
 * @param {Object} data - 모달 데이터
 */
export function openModal(type, data = null) {
    setState('modal.isOpen', true);
    setState('modal.type', type);
    setState('modal.data', data);
    setState('modal.activeTab', 'info');
    
    // 스크롤 방지
    document.body.style.overflow = 'hidden';
}

/**
 * 모달 닫기 액션
 */
export function closeModal() {
    setState('modal.isOpen', false);
    setState('modal.type', null);
    setState('modal.data', null);
    setState('modal.activeTab', 'info');
    
    // 스크롤 복원
    document.body.style.overflow = '';
}

/**
 * 모달 탭 변경 액션
 * @param {string} tab - 탭명
 */
export function changeModalTab(tab) {
    setState('modal.activeTab', tab);
}

// ===== CALCULATOR ACTIONS =====

/**
 * 계산기 초기화 액션
 * @param {Object} product - 상품 정보
 */
export function initializeCalculator(product) {
    setState('calculator.currentProduct', product);
    setState('calculator.formData', {});
    setState('calculator.result', null);
    setState('calculator.error', null);
}

/**
 * 계산기 폼 데이터 업데이트 액션
 * @param {Object} formData - 폼 데이터
 */
export function updateCalculatorForm(formData) {
    setState('calculator.formData', { ...getState('calculator.formData'), ...formData });
}

/**
 * 보험료 계산 액션
 */
export function calculatePremium() {
    const product = getState('calculator.currentProduct');
    const formData = getState('calculator.formData');
    
    if (!product || !formData) {
        setState('calculator.error', '상품 정보 또는 폼 데이터가 없습니다.');
        return;
    }
    
    setState('calculator.isLoading', true);
    setState('calculator.error', null);
    
    // 계산 로직 실행
    setTimeout(() => {
        try {
            const result = performCalculation(product, formData);
            setState('calculator.result', result);
        } catch (error) {
            setState('calculator.error', error.message);
        } finally {
            setState('calculator.isLoading', false);
        }
    }, 1000);
}

/**
 * 보험료 계산 로직
 * @param {Object} product - 상품 정보
 * @param {Object} formData - 폼 데이터
 * @returns {Object} 계산 결과
 */
function performCalculation(product, formData) {
    const { age, gender, coverage, period } = formData;
    
    // 기본 계산 로직
    let basePremium = product.premium.base;
    
    // 나이에 따른 조정
    if (age < 30) basePremium *= 0.8;
    else if (age < 50) basePremium *= 1.0;
    else if (age < 60) basePremium *= 1.3;
    else basePremium *= 1.8;
    
    // 성별에 따른 조정
    if (gender === 'female') basePremium *= 0.9;
    
    // 보장금액에 따른 조정
    const coverageMultiplier = coverage / 10000000; // 1천만원 기준
    basePremium *= coverageMultiplier;
    
    // 보험기간에 따른 조정
    if (period === 'lifetime') basePremium *= 1.5;
    else basePremium *= (period / 20); // 20년 기준
    
    const monthlyPremium = Math.round(basePremium);
    const yearlyPremium = monthlyPremium * 12;
    const totalPremium = period === 'lifetime' ? yearlyPremium * 30 : yearlyPremium * period;
    
    return {
        monthlyPremium,
        yearlyPremium,
        totalPremium,
        currency: 'KRW'
    };
}

// ===== CONSULTATION ACTIONS =====

/**
 * 상담 폼 데이터 업데이트 액션
 * @param {Object} formData - 폼 데이터
 */
export function updateConsultationForm(formData) {
    setState('consultation.formData', { ...getState('consultation.formData'), ...formData });
}

/**
 * 상담 예약 제출 액션
 */
export function submitConsultation() {
    const formData = getState('consultation.formData');
    
    if (!formData || !formData.name || !formData.phone) {
        setState('consultation.error', '필수 정보를 입력해주세요.');
        return;
    }
    
    setState('consultation.isLoading', true);
    setState('consultation.error', null);
    
    // API 호출 시뮬레이션
    setTimeout(() => {
        try {
            // 성공 처리
            setState('consultation.isLoading', false);
            openModal('success', {
                type: 'consultation',
                data: formData,
                message: '상담 예약이 완료되었습니다.'
            });
            
            // 폼 데이터 초기화
            setState('consultation.formData', {});
            
        } catch (error) {
            setState('consultation.error', error.message);
            setState('consultation.isLoading', false);
        }
    }, 2000);
}

/**
 * 상담사 정보 로드 액션
 * @param {Array} consultants - 상담사 배열
 */
export function loadConsultants(consultants) {
    setState('consultation.consultants', consultants);
}

/**
 * 상담 통계 업데이트 액션
 * @param {Object} stats - 통계 데이터
 */
export function updateConsultationStats(stats) {
    setState('consultation.stats', stats);
}

// ===== FAQ ACTIONS =====

/**
 * FAQ 로드 액션
 * @param {Array} faqs - FAQ 배열
 */
export function loadFAQs(faqs) {
    setState('faq.items', faqs);
    setState('faq.filteredItems', faqs);
    setState('faq.isLoading', false);
    
    // 카테고리 추출
    const categories = [...new Set(faqs.map(faq => faq.category))];
    setState('faq.categories', categories);
}

/**
 * FAQ 검색 액션
 * @param {string} query - 검색어
 */
export function searchFAQs(query) {
    setState('faq.searchQuery', query);
    
    const faqs = getState('faq.items');
    const selectedCategory = getState('faq.selectedCategory');
    
    let filtered = faqs;
    
    // 카테고리 필터
    if (selectedCategory && selectedCategory !== 'all') {
        filtered = filtered.filter(faq => faq.category === selectedCategory);
    }
    
    // 검색어 필터
    if (query) {
        const searchLower = query.toLowerCase();
        filtered = filtered.filter(faq => 
            faq.question.toLowerCase().includes(searchLower) ||
            faq.answer.toLowerCase().includes(searchLower) ||
            faq.tags.some(tag => tag.toLowerCase().includes(searchLower))
        );
    }
    
    setState('faq.filteredItems', filtered);
}

/**
 * FAQ 카테고리 필터 액션
 * @param {string} category - 카테고리
 */
export function filterFAQsByCategory(category) {
    setState('faq.selectedCategory', category);
    
    const faqs = getState('faq.items');
    const searchQuery = getState('faq.searchQuery');
    
    let filtered = faqs;
    
    // 카테고리 필터
    if (category && category !== 'all') {
        filtered = filtered.filter(faq => faq.category === category);
    }
    
    // 검색어 필터
    if (searchQuery) {
        const searchLower = searchQuery.toLowerCase();
        filtered = filtered.filter(faq => 
            faq.question.toLowerCase().includes(searchLower) ||
            faq.answer.toLowerCase().includes(searchLower) ||
            faq.tags.some(tag => tag.toLowerCase().includes(searchLower))
        );
    }
    
    setState('faq.filteredItems', filtered);
}

// ===== CHATBOT ACTIONS =====

/**
 * 챗봇 열기 액션
 */
export function openChatbot() {
    setState('chatbot.isOpen', true);
    setState('chatbot.isMinimized', false);
}

/**
 * 챗봇 닫기 액션
 */
export function closeChatbot() {
    setState('chatbot.isOpen', false);
}

/**
 * 챗봇 최소화 액션
 */
export function minimizeChatbot() {
    setState('chatbot.isMinimized', true);
}

/**
 * 챗봇 메시지 추가 액션
 * @param {Object} message - 메시지 객체
 */
export function addChatbotMessage(message) {
    const messages = getState('chatbot.messages');
    const newMessages = [...messages, { ...message, id: Date.now(), timestamp: new Date() }];
    setState('chatbot.messages', newMessages);
}

/**
 * 챗봇 메시지 전송 액션
 * @param {string} text - 메시지 텍스트
 */
export function sendChatbotMessage(text) {
    if (!text.trim()) return;
    
    // 사용자 메시지 추가
    addChatbotMessage({
        type: 'user',
        text: text.trim()
    });
    
    // 챗봇 응답 처리
    setState('chatbot.isLoading', true);
    
    setTimeout(() => {
        const response = generateChatbotResponse(text);
        addChatbotMessage({
            type: 'bot',
            text: response
        });
        setState('chatbot.isLoading', false);
    }, 1000);
}

/**
 * 챗봇 응답 생성 (간단한 규칙 기반)
 * @param {string} text - 사용자 입력
 * @returns {string} 챗봇 응답
 */
function generateChatbotResponse(text) {
    const lowerText = text.toLowerCase();
    
    if (lowerText.includes('안녕') || lowerText.includes('hello')) {
        return '안녕하세요! 보험 상담 도우미입니다. 무엇을 도와드릴까요?';
    }
    
    if (lowerText.includes('보험') && lowerText.includes('추천')) {
        return '고객님의 상황에 맞는 보험을 추천해드리기 위해 몇 가지 질문을 드리겠습니다. 나이와 가족 구성원 수를 알려주세요.';
    }
    
    if (lowerText.includes('보험료') || lowerText.includes('가격')) {
        return '보험료는 나이, 성별, 보장금액 등에 따라 달라집니다. 정확한 계산을 위해 상담 예약을 도와드릴까요?';
    }
    
    if (lowerText.includes('상담') || lowerText.includes('예약')) {
        return '상담 예약을 도와드리겠습니다. 상담 예약 페이지로 이동하시겠습니까?';
    }
    
    return '죄송합니다. 더 구체적으로 말씀해 주시면 더 정확한 답변을 드릴 수 있습니다.';
}

// ===== UI ACTIONS =====

/**
 * 로딩 화면 표시/숨김 액션
 * @param {boolean} visible - 표시 여부
 * @param {string} message - 로딩 메시지
 */
export function setLoadingScreen(visible, message = '로딩 중...') {
    setState('ui.loadingScreen.isVisible', visible);
    setState('ui.loadingScreen.message', message);
}

/**
 * 알림 추가 액션
 * @param {Object} notification - 알림 객체
 */
export function addNotification(notification) {
    const notifications = getState('ui.notifications');
    const newNotification = {
        id: Date.now(),
        timestamp: new Date(),
        ...notification
    };
    
    setState('ui.notifications', [...notifications, newNotification]);
    
    // 자동 제거 (5초 후)
    setTimeout(() => {
        removeNotification(newNotification.id);
    }, 5000);
}

/**
 * 알림 제거 액션
 * @param {number} id - 알림 ID
 */
export function removeNotification(id) {
    const notifications = getState('ui.notifications');
    const filtered = notifications.filter(n => n.id !== id);
    setState('ui.notifications', filtered);
}

/**
 * 브레드크럼 업데이트 액션
 * @param {Array} breadcrumbs - 브레드크럼 배열
 */
export function updateBreadcrumbs(breadcrumbs) {
    setState('ui.breadcrumbs', breadcrumbs);
}

// ===== ERROR ACTIONS =====

/**
 * 에러 설정 액션
 * @param {string} context - 에러 컨텍스트
 * @param {string} message - 에러 메시지
 */
export function setError(context, message) {
    setState(`${context}.error`, message);
}

/**
 * 에러 초기화 액션
 * @param {string} context - 에러 컨텍스트
 */
export function clearError(context) {
    setState(`${context}.error`, null);
}

// ===== EXPORT =====

// 전역으로 노출
if (typeof window !== 'undefined') {
    window.Actions = {
        changeTheme,
        detectSystemTheme,
        toggleTheme,
        navigateToSection,
        goBack,
        loadProducts,
        searchProducts,
        filterProductsByCategory,
        sortProducts,
        openModal,
        closeModal,
        changeModalTab,
        initializeCalculator,
        updateCalculatorForm,
        calculatePremium,
        updateConsultationForm,
        submitConsultation,
        loadConsultants,
        updateConsultationStats,
        loadFAQs,
        searchFAQs,
        filterFAQsByCategory,
        openChatbot,
        closeChatbot,
        minimizeChatbot,
        addChatbotMessage,
        sendChatbotMessage,
        setLoadingScreen,
        addNotification,
        removeNotification,
        updateBreadcrumbs,
        setError,
        clearError
    };
} 