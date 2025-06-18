/**
 * API Service
 * API 통신을 담당하는 서비스 모듈
 */

class APIService {
    constructor() {
        this.baseURL = 'https://api.insurance-website.com'; // 실제 API URL로 변경
        this.timeout = 10000; // 10초
        this.retryAttempts = 3;
        this.retryDelay = 1000; // 1초
        
        this.init();
    }
    
    /**
     * 초기화
     */
    init() {
        this.setupInterceptors();
        console.log('APIService initialized');
    }
    
    /**
     * 인터셉터 설정
     */
    setupInterceptors() {
        // 요청 인터셉터
        this.requestInterceptor = (config) => {
            // 인증 토큰 추가
            const token = this.getAuthToken();
            if (token) {
                config.headers = config.headers || {};
                config.headers.Authorization = `Bearer ${token}`;
            }
            
            // 기본 헤더 설정
            config.headers = {
                'Content-Type': 'application/json',
                ...config.headers
            };
            
            // 타임아웃 설정
            config.timeout = config.timeout || this.timeout;
            
            return config;
        };
        
        // 응답 인터셉터
        this.responseInterceptor = (response) => {
            // 성공 응답 처리
            return response;
        };
        
        // 에러 인터셉터
        this.errorInterceptor = (error) => {
            // 에러 처리
            this.handleError(error);
            return Promise.reject(error);
        };
    }
    
    /**
     * GET 요청
     */
    async get(endpoint, params = {}, config = {}) {
        const url = this.buildURL(endpoint, params);
        const requestConfig = this.requestInterceptor({
            method: 'GET',
            ...config
        });
        
        return this.makeRequest(url, requestConfig);
    }
    
    /**
     * POST 요청
     */
    async post(endpoint, data = {}, config = {}) {
        const url = this.buildURL(endpoint);
        const requestConfig = this.requestInterceptor({
            method: 'POST',
            body: JSON.stringify(data),
            ...config
        });
        
        return this.makeRequest(url, requestConfig);
    }
    
    /**
     * PUT 요청
     */
    async put(endpoint, data = {}, config = {}) {
        const url = this.buildURL(endpoint);
        const requestConfig = this.requestInterceptor({
            method: 'PUT',
            body: JSON.stringify(data),
            ...config
        });
        
        return this.makeRequest(url, requestConfig);
    }
    
    /**
     * DELETE 요청
     */
    async delete(endpoint, config = {}) {
        const url = this.buildURL(endpoint);
        const requestConfig = this.requestInterceptor({
            method: 'DELETE',
            ...config
        });
        
        return this.makeRequest(url, requestConfig);
    }
    
    /**
     * PATCH 요청
     */
    async patch(endpoint, data = {}, config = {}) {
        const url = this.buildURL(endpoint);
        const requestConfig = this.requestInterceptor({
            method: 'PATCH',
            body: JSON.stringify(data),
            ...config
        });
        
        return this.makeRequest(url, requestConfig);
    }
    
    /**
     * 파일 업로드
     */
    async uploadFile(endpoint, file, config = {}) {
        const url = this.buildURL(endpoint);
        const formData = new FormData();
        formData.append('file', file);
        
        const requestConfig = this.requestInterceptor({
            method: 'POST',
            body: formData,
            headers: {
                // Content-Type은 브라우저가 자동으로 설정
            },
            ...config
        });
        
        return this.makeRequest(url, requestConfig);
    }
    
    /**
     * 실제 요청 수행
     */
    async makeRequest(url, config, attempt = 1) {
        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), config.timeout);
            
            const response = await fetch(url, {
                ...config,
                signal: controller.signal
            });
            
            clearTimeout(timeoutId);
            
            // 응답 인터셉터 적용
            const interceptedResponse = this.responseInterceptor(response);
            
            if (!interceptedResponse.ok) {
                throw new Error(`HTTP ${interceptedResponse.status}: ${interceptedResponse.statusText}`);
            }
            
            const data = await interceptedResponse.json();
            return data;
            
        } catch (error) {
            // 재시도 로직
            if (attempt < this.retryAttempts && this.shouldRetry(error)) {
                await this.delay(this.retryDelay * attempt);
                return this.makeRequest(url, config, attempt + 1);
            }
            
            // 에러 인터셉터 적용
            return this.errorInterceptor(error);
        }
    }
    
    /**
     * URL 빌드
     */
    buildURL(endpoint, params = {}) {
        const url = new URL(endpoint, this.baseURL);
        
        // 쿼리 파라미터 추가
        Object.keys(params).forEach(key => {
            if (params[key] !== undefined && params[key] !== null) {
                url.searchParams.append(key, params[key]);
            }
        });
        
        return url.toString();
    }
    
    /**
     * 재시도 여부 확인
     */
    shouldRetry(error) {
        // 네트워크 에러나 5xx 서버 에러인 경우 재시도
        return error.name === 'AbortError' || 
               (error.message && error.message.includes('5'));
    }
    
    /**
     * 지연 함수
     */
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
    
    /**
     * 에러 처리
     */
    handleError(error) {
        console.error('API Error:', error);
        
        // 에러 타입별 처리
        if (error.name === 'AbortError') {
            this.showError('요청 시간이 초과되었습니다.');
        } else if (error.message.includes('401')) {
            this.handleUnauthorized();
        } else if (error.message.includes('403')) {
            this.showError('접근 권한이 없습니다.');
        } else if (error.message.includes('404')) {
            this.showError('요청한 리소스를 찾을 수 없습니다.');
        } else if (error.message.includes('5')) {
            this.showError('서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.');
        } else {
            this.showError('네트워크 오류가 발생했습니다.');
        }
    }
    
    /**
     * 인증 토큰 가져오기
     */
    getAuthToken() {
        return localStorage.getItem('authToken');
    }
    
    /**
     * 인증 토큰 설정
     */
    setAuthToken(token) {
        localStorage.setItem('authToken', token);
    }
    
    /**
     * 인증 토큰 제거
     */
    removeAuthToken() {
        localStorage.removeItem('authToken');
    }
    
    /**
     * 인증되지 않은 요청 처리
     */
    handleUnauthorized() {
        this.removeAuthToken();
        
        // 로그인 페이지로 리다이렉트
        if (window.location.pathname !== '/login.html') {
            window.location.href = '/login.html?redirect=' + encodeURIComponent(window.location.href);
        }
    }
    
    /**
     * 에러 메시지 표시
     */
    showError(message) {
        // 전역 에러 핸들러가 있다면 사용
        if (window.showToast) {
            window.showToast(message, 'error');
        } else {
            console.error(message);
        }
    }
    
    /**
     * API 엔드포인트 상수
     */
    static ENDPOINTS = {
        // 인증 관련
        LOGIN: '/auth/login',
        LOGOUT: '/auth/logout',
        REFRESH: '/auth/refresh',
        REGISTER: '/auth/register',
        
        // 사용자 관련
        USER_PROFILE: '/user/profile',
        USER_UPDATE: '/user/update',
        USER_DELETE: '/user/delete',
        
        // 상품 관련
        PRODUCTS: '/products',
        PRODUCT_DETAIL: '/products/:id',
        PRODUCT_SEARCH: '/products/search',
        PRODUCT_COMPARE: '/products/compare',
        
        // 상담 관련
        CONSULTATION: '/consultation',
        CONSULTATION_DETAIL: '/consultation/:id',
        CONSULTATION_UPDATE: '/consultation/:id/update',
        
        // FAQ 관련
        FAQ: '/faq',
        FAQ_CATEGORIES: '/faq/categories',
        FAQ_SEARCH: '/faq/search',
        
        // 파일 업로드
        UPLOAD: '/upload',
        UPLOAD_IMAGE: '/upload/image',
        UPLOAD_DOCUMENT: '/upload/document'
    };
    
    /**
     * 상품 API 메서드들
     */
    async getProducts(params = {}) {
        return this.get(APIService.ENDPOINTS.PRODUCTS, params);
    }
    
    async getProductDetail(productId) {
        const endpoint = APIService.ENDPOINTS.PRODUCT_DETAIL.replace(':id', productId);
        return this.get(endpoint);
    }
    
    async searchProducts(query, filters = {}) {
        return this.post(APIService.ENDPOINTS.PRODUCT_SEARCH, {
            query,
            filters
        });
    }
    
    async compareProducts(productIds) {
        return this.post(APIService.ENDPOINTS.PRODUCT_COMPARE, {
            productIds
        });
    }
    
    /**
     * 상담 API 메서드들
     */
    async submitConsultation(data) {
        return this.post(APIService.ENDPOINTS.CONSULTATION, data);
    }
    
    async getConsultationDetail(consultationId) {
        const endpoint = APIService.ENDPOINTS.CONSULTATION_DETAIL.replace(':id', consultationId);
        return this.get(endpoint);
    }
    
    async updateConsultation(consultationId, data) {
        const endpoint = APIService.ENDPOINTS.CONSULTATION_UPDATE.replace(':id', consultationId);
        return this.put(endpoint, data);
    }
    
    /**
     * FAQ API 메서드들
     */
    async getFAQ(params = {}) {
        return this.get(APIService.ENDPOINTS.FAQ, params);
    }
    
    async getFAQCategories() {
        return this.get(APIService.ENDPOINTS.FAQ_CATEGORIES);
    }
    
    async searchFAQ(query) {
        return this.post(APIService.ENDPOINTS.FAQ_SEARCH, { query });
    }
    
    /**
     * 사용자 API 메서드들
     */
    async getUserProfile() {
        return this.get(APIService.ENDPOINTS.USER_PROFILE);
    }
    
    async updateUserProfile(data) {
        return this.put(APIService.ENDPOINTS.USER_UPDATE, data);
    }
    
    /**
     * 파일 업로드 API 메서드들
     */
    async uploadImage(file) {
        return this.uploadFile(APIService.ENDPOINTS.UPLOAD_IMAGE, file);
    }
    
    async uploadDocument(file) {
        return this.uploadFile(APIService.ENDPOINTS.UPLOAD_DOCUMENT, file);
    }
}

// 전역 인스턴스 생성
window.apiService = new APIService(); 