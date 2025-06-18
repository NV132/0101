/**
 * State Reducers
 * 상태 변경 리듀서들
 */

import { globalState } from './state.js';

// ===== REDUCER INTERFACE =====

/**
 * 리듀서 함수 타입 정의
 * @typedef {Function} Reducer
 * @param {any} state - 현재 상태
 * @param {Object} action - 액션 객체
 * @returns {any} 새로운 상태
 */

/**
 * 액션 타입 정의
 * @typedef {Object} Action
 * @property {string} type - 액션 타입
 * @property {any} payload - 액션 데이터
 */

// ===== ACTION TYPES =====

export const ActionTypes = {
    // 테마 관련
    CHANGE_THEME: 'CHANGE_THEME',
    DETECT_SYSTEM_THEME: 'DETECT_SYSTEM_THEME',
    TOGGLE_THEME: 'TOGGLE_THEME',
    
    // 네비게이션 관련
    NAVIGATE_TO_SECTION: 'NAVIGATE_TO_SECTION',
    GO_BACK: 'GO_BACK',
    SET_LOADING: 'SET_LOADING',
    
    // 보험상품 관련
    LOAD_PRODUCTS: 'LOAD_PRODUCTS',
    SEARCH_PRODUCTS: 'SEARCH_PRODUCTS',
    FILTER_PRODUCTS: 'FILTER_PRODUCTS',
    SORT_PRODUCTS: 'SORT_PRODUCTS',
    SET_PRODUCT_ERROR: 'SET_PRODUCT_ERROR',
    CLEAR_PRODUCT_ERROR: 'CLEAR_PRODUCT_ERROR',
    
    // 모달 관련
    OPEN_MODAL: 'OPEN_MODAL',
    CLOSE_MODAL: 'CLOSE_MODAL',
    CHANGE_MODAL_TAB: 'CHANGE_MODAL_TAB',
    
    // 계산기 관련
    INITIALIZE_CALCULATOR: 'INITIALIZE_CALCULATOR',
    UPDATE_CALCULATOR_FORM: 'UPDATE_CALCULATOR_FORM',
    CALCULATE_PREMIUM: 'CALCULATE_PREMIUM',
    SET_CALCULATOR_RESULT: 'SET_CALCULATOR_RESULT',
    SET_CALCULATOR_ERROR: 'SET_CALCULATOR_ERROR',
    
    // 상담예약 관련
    UPDATE_CONSULTATION_FORM: 'UPDATE_CONSULTATION_FORM',
    SUBMIT_CONSULTATION: 'SUBMIT_CONSULTATION',
    LOAD_CONSULTANTS: 'LOAD_CONSULTANTS',
    UPDATE_CONSULTATION_STATS: 'UPDATE_CONSULTATION_STATS',
    SET_CONSULTATION_ERROR: 'SET_CONSULTATION_ERROR',
    
    // FAQ 관련
    LOAD_FAQS: 'LOAD_FAQS',
    SEARCH_FAQS: 'SEARCH_FAQS',
    FILTER_FAQS: 'FILTER_FAQS',
    SET_FAQ_ERROR: 'SET_FAQ_ERROR',
    
    // 챗봇 관련
    OPEN_CHATBOT: 'OPEN_CHATBOT',
    CLOSE_CHATBOT: 'CLOSE_CHATBOT',
    MINIMIZE_CHATBOT: 'MINIMIZE_CHATBOT',
    ADD_CHATBOT_MESSAGE: 'ADD_CHATBOT_MESSAGE',
    SEND_CHATBOT_MESSAGE: 'SEND_CHATBOT_MESSAGE',
    SET_CHATBOT_LOADING: 'SET_CHATBOT_LOADING',
    
    // UI 관련
    SET_LOADING_SCREEN: 'SET_LOADING_SCREEN',
    ADD_NOTIFICATION: 'ADD_NOTIFICATION',
    REMOVE_NOTIFICATION: 'REMOVE_NOTIFICATION',
    UPDATE_BREADCRUMBS: 'UPDATE_BREADCRUMBS',
    
    // 사용자 관련
    SET_USER_PROFILE: 'SET_USER_PROFILE',
    UPDATE_USER_PREFERENCES: 'UPDATE_USER_PREFERENCES',
    CLEAR_USER_DATA: 'CLEAR_USER_DATA'
};

// ===== ACTION CREATORS =====

/**
 * 액션 생성자들
 */
export const ActionCreators = {
    // 테마 관련
    changeTheme: (theme) => ({
        type: ActionTypes.CHANGE_THEME,
        payload: { theme }
    }),
    
    detectSystemTheme: (systemTheme) => ({
        type: ActionTypes.DETECT_SYSTEM_THEME,
        payload: { systemTheme }
    }),
    
    toggleTheme: () => ({
        type: ActionTypes.TOGGLE_THEME
    }),
    
    // 네비게이션 관련
    navigateToSection: (section) => ({
        type: ActionTypes.NAVIGATE_TO_SECTION,
        payload: { section }
    }),
    
    goBack: () => ({
        type: ActionTypes.GO_BACK
    }),
    
    setLoading: (isLoading) => ({
        type: ActionTypes.SET_LOADING,
        payload: { isLoading }
    }),
    
    // 보험상품 관련
    loadProducts: (products) => ({
        type: ActionTypes.LOAD_PRODUCTS,
        payload: { products }
    }),
    
    searchProducts: (query) => ({
        type: ActionTypes.SEARCH_PRODUCTS,
        payload: { query }
    }),
    
    filterProducts: (category) => ({
        type: ActionTypes.FILTER_PRODUCTS,
        payload: { category }
    }),
    
    sortProducts: (sortBy) => ({
        type: ActionTypes.SORT_PRODUCTS,
        payload: { sortBy }
    }),
    
    setProductError: (error) => ({
        type: ActionTypes.SET_PRODUCT_ERROR,
        payload: { error }
    }),
    
    clearProductError: () => ({
        type: ActionTypes.CLEAR_PRODUCT_ERROR
    }),
    
    // 모달 관련
    openModal: (type, data) => ({
        type: ActionTypes.OPEN_MODAL,
        payload: { type, data }
    }),
    
    closeModal: () => ({
        type: ActionTypes.CLOSE_MODAL
    }),
    
    changeModalTab: (tab) => ({
        type: ActionTypes.CHANGE_MODAL_TAB,
        payload: { tab }
    }),
    
    // 계산기 관련
    initializeCalculator: (product) => ({
        type: ActionTypes.INITIALIZE_CALCULATOR,
        payload: { product }
    }),
    
    updateCalculatorForm: (formData) => ({
        type: ActionTypes.UPDATE_CALCULATOR_FORM,
        payload: { formData }
    }),
    
    calculatePremium: () => ({
        type: ActionTypes.CALCULATE_PREMIUM
    }),
    
    setCalculatorResult: (result) => ({
        type: ActionTypes.SET_CALCULATOR_RESULT,
        payload: { result }
    }),
    
    setCalculatorError: (error) => ({
        type: ActionTypes.SET_CALCULATOR_ERROR,
        payload: { error }
    }),
    
    // 상담예약 관련
    updateConsultationForm: (formData) => ({
        type: ActionTypes.UPDATE_CONSULTATION_FORM,
        payload: { formData }
    }),
    
    submitConsultation: () => ({
        type: ActionTypes.SUBMIT_CONSULTATION
    }),
    
    loadConsultants: (consultants) => ({
        type: ActionTypes.LOAD_CONSULTANTS,
        payload: { consultants }
    }),
    
    updateConsultationStats: (stats) => ({
        type: ActionTypes.UPDATE_CONSULTATION_STATS,
        payload: { stats }
    }),
    
    setConsultationError: (error) => ({
        type: ActionTypes.SET_CONSULTATION_ERROR,
        payload: { error }
    }),
    
    // FAQ 관련
    loadFAQs: (faqs) => ({
        type: ActionTypes.LOAD_FAQS,
        payload: { faqs }
    }),
    
    searchFAQs: (query) => ({
        type: ActionTypes.SEARCH_FAQS,
        payload: { query }
    }),
    
    filterFAQs: (category) => ({
        type: ActionTypes.FILTER_FAQS,
        payload: { category }
    }),
    
    setFAQError: (error) => ({
        type: ActionTypes.SET_FAQ_ERROR,
        payload: { error }
    }),
    
    // 챗봇 관련
    openChatbot: () => ({
        type: ActionTypes.OPEN_CHATBOT
    }),
    
    closeChatbot: () => ({
        type: ActionTypes.CLOSE_CHATBOT
    }),
    
    minimizeChatbot: () => ({
        type: ActionTypes.MINIMIZE_CHATBOT
    }),
    
    addChatbotMessage: (message) => ({
        type: ActionTypes.ADD_CHATBOT_MESSAGE,
        payload: { message }
    }),
    
    sendChatbotMessage: (text) => ({
        type: ActionTypes.SEND_CHATBOT_MESSAGE,
        payload: { text }
    }),
    
    setChatbotLoading: (isLoading) => ({
        type: ActionTypes.SET_CHATBOT_LOADING,
        payload: { isLoading }
    }),
    
    // UI 관련
    setLoadingScreen: (visible, message) => ({
        type: ActionTypes.SET_LOADING_SCREEN,
        payload: { visible, message }
    }),
    
    addNotification: (notification) => ({
        type: ActionTypes.ADD_NOTIFICATION,
        payload: { notification }
    }),
    
    removeNotification: (id) => ({
        type: ActionTypes.REMOVE_NOTIFICATION,
        payload: { id }
    }),
    
    updateBreadcrumbs: (breadcrumbs) => ({
        type: ActionTypes.UPDATE_BREADCRUMBS,
        payload: { breadcrumbs }
    }),
    
    // 사용자 관련
    setUserProfile: (profile) => ({
        type: ActionTypes.SET_USER_PROFILE,
        payload: { profile }
    }),
    
    updateUserPreferences: (preferences) => ({
        type: ActionTypes.UPDATE_USER_PREFERENCES,
        payload: { preferences }
    }),
    
    clearUserData: () => ({
        type: ActionTypes.CLEAR_USER_DATA
    })
};

// ===== REDUCERS =====

/**
 * 테마 리듀서
 * @param {Object} state - 현재 테마 상태
 * @param {Action} action - 액션
 * @returns {Object} 새로운 테마 상태
 */
function themeReducer(state, action) {
    switch (action.type) {
        case ActionTypes.CHANGE_THEME:
            return {
                ...state,
                current: action.payload.theme
            };
            
        case ActionTypes.DETECT_SYSTEM_THEME:
            return {
                ...state,
                system: action.payload.systemTheme
            };
            
        case ActionTypes.TOGGLE_THEME:
            return {
                ...state,
                current: state.current === 'dark' ? 'light' : 'dark'
            };
            
        default:
            return state;
    }
}

/**
 * 네비게이션 리듀서
 * @param {Object} state - 현재 네비게이션 상태
 * @param {Action} action - 액션
 * @returns {Object} 새로운 네비게이션 상태
 */
function navigationReducer(state, action) {
    switch (action.type) {
        case ActionTypes.NAVIGATE_TO_SECTION:
            return {
                ...state,
                previousSection: state.currentSection,
                currentSection: action.payload.section
            };
            
        case ActionTypes.GO_BACK:
            return {
                ...state,
                currentSection: state.previousSection || 'home',
                previousSection: state.currentSection
            };
            
        case ActionTypes.SET_LOADING:
            return {
                ...state,
                isLoading: action.payload.isLoading
            };
            
        default:
            return state;
    }
}

/**
 * 보험상품 리듀서
 * @param {Object} state - 현재 보험상품 상태
 * @param {Action} action - 액션
 * @returns {Object} 새로운 보험상품 상태
 */
function productsReducer(state, action) {
    switch (action.type) {
        case ActionTypes.LOAD_PRODUCTS:
            const categories = [...new Set(action.payload.products.map(product => product.category))];
            return {
                ...state,
                items: action.payload.products,
                filteredItems: action.payload.products,
                categories,
                isLoading: false,
                error: null
            };
            
        case ActionTypes.SEARCH_PRODUCTS:
            return {
                ...state,
                searchQuery: action.payload.query,
                filteredItems: filterProducts(state.items, state.selectedCategory, action.payload.query, state.sortBy)
            };
            
        case ActionTypes.FILTER_PRODUCTS:
            return {
                ...state,
                selectedCategory: action.payload.category,
                filteredItems: filterProducts(state.items, action.payload.category, state.searchQuery, state.sortBy)
            };
            
        case ActionTypes.SORT_PRODUCTS:
            return {
                ...state,
                sortBy: action.payload.sortBy,
                filteredItems: sortProducts(state.filteredItems, action.payload.sortBy)
            };
            
        case ActionTypes.SET_PRODUCT_ERROR:
            return {
                ...state,
                error: action.payload.error,
                isLoading: false
            };
            
        case ActionTypes.CLEAR_PRODUCT_ERROR:
            return {
                ...state,
                error: null
            };
            
        default:
            return state;
    }
}

/**
 * 모달 리듀서
 * @param {Object} state - 현재 모달 상태
 * @param {Action} action - 액션
 * @returns {Object} 새로운 모달 상태
 */
function modalReducer(state, action) {
    switch (action.type) {
        case ActionTypes.OPEN_MODAL:
            return {
                ...state,
                isOpen: true,
                type: action.payload.type,
                data: action.payload.data,
                activeTab: 'info'
            };
            
        case ActionTypes.CLOSE_MODAL:
            return {
                ...state,
                isOpen: false,
                type: null,
                data: null,
                activeTab: 'info'
            };
            
        case ActionTypes.CHANGE_MODAL_TAB:
            return {
                ...state,
                activeTab: action.payload.tab
            };
            
        default:
            return state;
    }
}

/**
 * 계산기 리듀서
 * @param {Object} state - 현재 계산기 상태
 * @param {Action} action - 액션
 * @returns {Object} 새로운 계산기 상태
 */
function calculatorReducer(state, action) {
    switch (action.type) {
        case ActionTypes.INITIALIZE_CALCULATOR:
            return {
                ...state,
                currentProduct: action.payload.product,
                formData: {},
                result: null,
                error: null
            };
            
        case ActionTypes.UPDATE_CALCULATOR_FORM:
            return {
                ...state,
                formData: { ...state.formData, ...action.payload.formData }
            };
            
        case ActionTypes.CALCULATE_PREMIUM:
            return {
                ...state,
                isLoading: true,
                error: null
            };
            
        case ActionTypes.SET_CALCULATOR_RESULT:
            return {
                ...state,
                result: action.payload.result,
                isLoading: false
            };
            
        case ActionTypes.SET_CALCULATOR_ERROR:
            return {
                ...state,
                error: action.payload.error,
                isLoading: false
            };
            
        default:
            return state;
    }
}

/**
 * 상담예약 리듀서
 * @param {Object} state - 현재 상담예약 상태
 * @param {Action} action - 액션
 * @returns {Object} 새로운 상담예약 상태
 */
function consultationReducer(state, action) {
    switch (action.type) {
        case ActionTypes.UPDATE_CONSULTATION_FORM:
            return {
                ...state,
                formData: { ...state.formData, ...action.payload.formData }
            };
            
        case ActionTypes.SUBMIT_CONSULTATION:
            return {
                ...state,
                isLoading: true,
                error: null
            };
            
        case ActionTypes.LOAD_CONSULTANTS:
            return {
                ...state,
                consultants: action.payload.consultants
            };
            
        case ActionTypes.UPDATE_CONSULTATION_STATS:
            return {
                ...state,
                stats: action.payload.stats
            };
            
        case ActionTypes.SET_CONSULTATION_ERROR:
            return {
                ...state,
                error: action.payload.error,
                isLoading: false
            };
            
        default:
            return state;
    }
}

/**
 * FAQ 리듀서
 * @param {Object} state - 현재 FAQ 상태
 * @param {Action} action - 액션
 * @returns {Object} 새로운 FAQ 상태
 */
function faqReducer(state, action) {
    switch (action.type) {
        case ActionTypes.LOAD_FAQS:
            const categories = [...new Set(action.payload.faqs.map(faq => faq.category))];
            return {
                ...state,
                items: action.payload.faqs,
                filteredItems: action.payload.faqs,
                categories,
                isLoading: false,
                error: null
            };
            
        case ActionTypes.SEARCH_FAQS:
            return {
                ...state,
                searchQuery: action.payload.query,
                filteredItems: filterFAQs(state.items, state.selectedCategory, action.payload.query)
            };
            
        case ActionTypes.FILTER_FAQS:
            return {
                ...state,
                selectedCategory: action.payload.category,
                filteredItems: filterFAQs(state.items, action.payload.category, state.searchQuery)
            };
            
        case ActionTypes.SET_FAQ_ERROR:
            return {
                ...state,
                error: action.payload.error,
                isLoading: false
            };
            
        default:
            return state;
    }
}

/**
 * 챗봇 리듀서
 * @param {Object} state - 현재 챗봇 상태
 * @param {Action} action - 액션
 * @returns {Object} 새로운 챗봇 상태
 */
function chatbotReducer(state, action) {
    switch (action.type) {
        case ActionTypes.OPEN_CHATBOT:
            return {
                ...state,
                isOpen: true,
                isMinimized: false
            };
            
        case ActionTypes.CLOSE_CHATBOT:
            return {
                ...state,
                isOpen: false
            };
            
        case ActionTypes.MINIMIZE_CHATBOT:
            return {
                ...state,
                isMinimized: true
            };
            
        case ActionTypes.ADD_CHATBOT_MESSAGE:
            const newMessage = {
                ...action.payload.message,
                id: Date.now(),
                timestamp: new Date()
            };
            return {
                ...state,
                messages: [...state.messages, newMessage]
            };
            
        case ActionTypes.SET_CHATBOT_LOADING:
            return {
                ...state,
                isLoading: action.payload.isLoading
            };
            
        default:
            return state;
    }
}

/**
 * UI 리듀서
 * @param {Object} state - 현재 UI 상태
 * @param {Action} action - 액션
 * @returns {Object} 새로운 UI 상태
 */
function uiReducer(state, action) {
    switch (action.type) {
        case ActionTypes.SET_LOADING_SCREEN:
            return {
                ...state,
                loadingScreen: {
                    isVisible: action.payload.visible,
                    message: action.payload.message
                }
            };
            
        case ActionTypes.ADD_NOTIFICATION:
            const newNotification = {
                id: Date.now(),
                timestamp: new Date(),
                ...action.payload.notification
            };
            return {
                ...state,
                notifications: [...state.notifications, newNotification]
            };
            
        case ActionTypes.REMOVE_NOTIFICATION:
            return {
                ...state,
                notifications: state.notifications.filter(n => n.id !== action.payload.id)
            };
            
        case ActionTypes.UPDATE_BREADCRUMBS:
            return {
                ...state,
                breadcrumbs: action.payload.breadcrumbs
            };
            
        default:
            return state;
    }
}

/**
 * 사용자 리듀서
 * @param {Object} state - 현재 사용자 상태
 * @param {Action} action - 액션
 * @returns {Object} 새로운 사용자 상태
 */
function userReducer(state, action) {
    switch (action.type) {
        case ActionTypes.SET_USER_PROFILE:
            return {
                ...state,
                profile: action.payload.profile,
                isAuthenticated: true
            };
            
        case ActionTypes.UPDATE_USER_PREFERENCES:
            return {
                ...state,
                preferences: { ...state.preferences, ...action.payload.preferences }
            };
            
        case ActionTypes.CLEAR_USER_DATA:
            return {
                isAuthenticated: false,
                profile: null,
                preferences: {}
            };
            
        default:
            return state;
    }
}

// ===== HELPER FUNCTIONS =====

/**
 * 상품 필터링 헬퍼
 * @param {Array} products - 상품 배열
 * @param {string} category - 카테고리
 * @param {string} query - 검색어
 * @param {string} sortBy - 정렬 기준
 * @returns {Array} 필터링된 상품 배열
 */
function filterProducts(products, category, query, sortBy) {
    let filtered = products;
    
    // 카테고리 필터
    if (category) {
        filtered = filtered.filter(product => product.category === category);
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
    return sortProducts(filtered, sortBy);
}

/**
 * 상품 정렬 헬퍼
 * @param {Array} products - 상품 배열
 * @param {string} sortBy - 정렬 기준
 * @returns {Array} 정렬된 상품 배열
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

/**
 * FAQ 필터링 헬퍼
 * @param {Array} faqs - FAQ 배열
 * @param {string} category - 카테고리
 * @param {string} query - 검색어
 * @returns {Array} 필터링된 FAQ 배열
 */
function filterFAQs(faqs, category, query) {
    let filtered = faqs;
    
    // 카테고리 필터
    if (category && category !== 'all') {
        filtered = filtered.filter(faq => faq.category === category);
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
    
    return filtered;
}

// ===== ROOT REDUCER =====

/**
 * 루트 리듀서
 * @param {Object} state - 전체 상태
 * @param {Action} action - 액션
 * @returns {Object} 새로운 전체 상태
 */
export function rootReducer(state, action) {
    return {
        theme: themeReducer(state.theme, action),
        navigation: navigationReducer(state.navigation, action),
        user: userReducer(state.user, action),
        products: productsReducer(state.products, action),
        modal: modalReducer(state.modal, action),
        calculator: calculatorReducer(state.calculator, action),
        consultation: consultationReducer(state.consultation, action),
        faq: faqReducer(state.faq, action),
        chatbot: chatbotReducer(state.chatbot, action),
        ui: uiReducer(state.ui, action)
    };
}

// ===== DISPATCH FUNCTION =====

/**
 * 액션 디스패치 함수
 * @param {Action} action - 액션 객체
 */
export function dispatch(action) {
    const currentState = globalState.get('*');
    const newState = rootReducer(currentState, action);
    
    // 상태 업데이트
    globalState.batchUpdate(newState, true);
    
    // 사이드 이펙트 처리
    handleSideEffects(action, currentState, newState);
}

/**
 * 사이드 이펙트 처리
 * @param {Action} action - 액션
 * @param {Object} oldState - 이전 상태
 * @param {Object} newState - 새로운 상태
 */
function handleSideEffects(action, oldState, newState) {
    switch (action.type) {
        case ActionTypes.CHANGE_THEME:
            // DOM에 테마 클래스 적용
            document.body.className = `theme-${action.payload.theme}`;
            break;
            
        case ActionTypes.NAVIGATE_TO_SECTION:
            // URL 업데이트
            if (window.history && window.history.pushState) {
                const url = new URL(window.location);
                url.searchParams.set('section', action.payload.section);
                window.history.pushState({ section: action.payload.section }, '', url);
            }
            break;
            
        case ActionTypes.OPEN_MODAL:
            // 스크롤 방지
            document.body.style.overflow = 'hidden';
            break;
            
        case ActionTypes.CLOSE_MODAL:
            // 스크롤 복원
            document.body.style.overflow = '';
            break;
            
        case ActionTypes.ADD_NOTIFICATION:
            // 자동 제거 타이머 설정
            setTimeout(() => {
                dispatch(ActionCreators.removeNotification(action.payload.notification.id));
            }, 5000);
            break;
    }
}

// ===== EXPORT =====

// 전역으로 노출
if (typeof window !== 'undefined') {
    window.ActionTypes = ActionTypes;
    window.ActionCreators = ActionCreators;
    window.dispatch = dispatch;
    window.rootReducer = rootReducer;
} 