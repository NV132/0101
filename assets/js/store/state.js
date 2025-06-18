/**
 * Global State Management
 * 전역 상태 관리 시스템
 */

// ===== STATE INTERFACE =====

/**
 * 애플리케이션 상태 인터페이스
 */
export const AppState = {
    // 테마 관련
    theme: {
        current: 'dark', // 'dark' | 'light'
        system: 'auto'   // 'auto' | 'dark' | 'light'
    },
    
    // 네비게이션 관련
    navigation: {
        currentSection: 'home', // 'home' | 'products' | 'consultation' | 'faq'
        previousSection: null,
        isLoading: false
    },
    
    // 사용자 관련
    user: {
        isAuthenticated: false,
        profile: null,
        preferences: {}
    },
    
    // 보험상품 관련
    products: {
        items: [],
        filteredItems: [],
        categories: [],
        selectedCategory: null,
        searchQuery: '',
        sortBy: 'popular',
        isLoading: false,
        error: null
    },
    
    // 모달 관련
    modal: {
        isOpen: false,
        type: null, // 'product' | 'calculator' | 'success' | 'faq'
        data: null,
        activeTab: 'info' // 'info' | 'calculator' | 'benefits'
    },
    
    // 계산기 관련
    calculator: {
        currentProduct: null,
        formData: {},
        result: null,
        isLoading: false,
        error: null
    },
    
    // 상담예약 관련
    consultation: {
        formData: {},
        consultants: [],
        stats: {},
        isLoading: false,
        error: null
    },
    
    // FAQ 관련
    faq: {
        items: [],
        filteredItems: [],
        categories: [],
        selectedCategory: 'all',
        searchQuery: '',
        isLoading: false,
        error: null
    },
    
    // 챗봇 관련
    chatbot: {
        isOpen: false,
        isMinimized: false,
        messages: [],
        currentFlow: null,
        isLoading: false,
        error: null
    },
    
    // UI 관련
    ui: {
        loadingScreen: {
            isVisible: true,
            message: '로딩 중...'
        },
        notifications: [],
        breadcrumbs: []
    }
};

// ===== STATE CLASS =====

/**
 * 상태 관리 클래스
 */
export class StateManager {
    constructor(initialState = AppState) {
        this.state = this.deepClone(initialState);
        this.subscribers = new Map();
        this.middleware = [];
        this.history = [];
        this.historyIndex = -1;
        this.maxHistorySize = 50;
    }
    
    /**
     * 상태 구독
     * @param {string} path - 상태 경로 (예: 'theme.current')
     * @param {Function} callback - 콜백 함수
     * @returns {Function} 구독 해제 함수
     */
    subscribe(path, callback) {
        if (!this.subscribers.has(path)) {
            this.subscribers.set(path, new Set());
        }
        
        this.subscribers.get(path).add(callback);
        
        // 구독 해제 함수 반환
        return () => {
            const callbacks = this.subscribers.get(path);
            if (callbacks) {
                callbacks.delete(callback);
                if (callbacks.size === 0) {
                    this.subscribers.delete(path);
                }
            }
        };
    }
    
    /**
     * 상태 변경 알림
     * @param {string} path - 변경된 상태 경로
     * @param {any} oldValue - 이전 값
     * @param {any} newValue - 새로운 값
     */
    notify(path, oldValue, newValue) {
        // 정확한 경로 구독자들에게 알림
        if (this.subscribers.has(path)) {
            this.subscribers.get(path).forEach(callback => {
                try {
                    callback(newValue, oldValue, path);
                } catch (error) {
                    console.error('상태 구독자 콜백 실행 중 오류:', error);
                }
            });
        }
        
        // 부모 경로 구독자들에게도 알림
        const pathParts = path.split('.');
        while (pathParts.length > 1) {
            pathParts.pop();
            const parentPath = pathParts.join('.');
            if (this.subscribers.has(parentPath)) {
                this.subscribers.get(parentPath).forEach(callback => {
                    try {
                        callback(this.get(parentPath), null, parentPath);
                    } catch (error) {
                        console.error('상태 구독자 콜백 실행 중 오류:', error);
                    }
                });
            }
        }
    }
    
    /**
     * 상태 가져오기
     * @param {string} path - 상태 경로
     * @returns {any} 상태 값
     */
    get(path) {
        return this.getNestedValue(this.state, path);
    }
    
    /**
     * 상태 설정
     * @param {string} path - 상태 경로
     * @param {any} value - 설정할 값
     * @param {boolean} silent - 알림 비활성화 여부
     */
    set(path, value, silent = false) {
        const oldValue = this.get(path);
        const newValue = this.deepClone(value);
        
        // 미들웨어 실행
        const processedValue = this.runMiddleware(path, oldValue, newValue);
        
        // 상태 업데이트
        this.setNestedValue(this.state, path, processedValue);
        
        // 히스토리에 추가
        this.addToHistory(path, oldValue, processedValue);
        
        // 알림 전송
        if (!silent) {
            this.notify(path, oldValue, processedValue);
        }
    }
    
    /**
     * 상태 일괄 업데이트
     * @param {Object} updates - 업데이트할 상태들
     * @param {boolean} silent - 알림 비활성화 여부
     */
    batchUpdate(updates, silent = false) {
        const changes = [];
        
        // 모든 변경사항 수집
        Object.entries(updates).forEach(([path, value]) => {
            const oldValue = this.get(path);
            const newValue = this.deepClone(value);
            const processedValue = this.runMiddleware(path, oldValue, newValue);
            
            changes.push({ path, oldValue, newValue: processedValue });
        });
        
        // 상태 일괄 업데이트
        changes.forEach(({ path, newValue }) => {
            this.setNestedValue(this.state, path, newValue);
        });
        
        // 히스토리에 추가
        this.addToHistory('batch', null, changes);
        
        // 알림 전송
        if (!silent) {
            changes.forEach(({ path, oldValue, newValue }) => {
                this.notify(path, oldValue, newValue);
            });
        }
    }
    
    /**
     * 상태 리셋
     * @param {string} path - 리셋할 경로 (기본값: 전체)
     */
    reset(path = null) {
        if (path) {
            const defaultValue = this.getNestedValue(AppState, path);
            this.set(path, defaultValue);
        } else {
            this.state = this.deepClone(AppState);
            this.notify('*', null, this.state);
        }
    }
    
    /**
     * 상태 히스토리 관리
     */
    addToHistory(path, oldValue, newValue) {
        // 현재 인덱스 이후의 히스토리 제거
        this.history = this.history.slice(0, this.historyIndex + 1);
        
        // 새로운 히스토리 추가
        this.history.push({
            path,
            oldValue: this.deepClone(oldValue),
            newValue: this.deepClone(newValue),
            timestamp: Date.now()
        });
        
        // 히스토리 크기 제한
        if (this.history.length > this.maxHistorySize) {
            this.history.shift();
        } else {
            this.historyIndex++;
        }
    }
    
    /**
     * 실행 취소
     * @returns {boolean} 성공 여부
     */
    undo() {
        if (this.historyIndex >= 0) {
            const historyItem = this.history[this.historyIndex];
            this.setNestedValue(this.state, historyItem.path, historyItem.oldValue);
            this.notify(historyItem.path, historyItem.newValue, historyItem.oldValue);
            this.historyIndex--;
            return true;
        }
        return false;
    }
    
    /**
     * 다시 실행
     * @returns {boolean} 성공 여부
     */
    redo() {
        if (this.historyIndex < this.history.length - 1) {
            this.historyIndex++;
            const historyItem = this.history[this.historyIndex];
            this.setNestedValue(this.state, historyItem.path, historyItem.newValue);
            this.notify(historyItem.path, historyItem.oldValue, historyItem.newValue);
            return true;
        }
        return false;
    }
    
    /**
     * 미들웨어 추가
     * @param {Function} middleware - 미들웨어 함수
     */
    addMiddleware(middleware) {
        this.middleware.push(middleware);
    }
    
    /**
     * 미들웨어 실행
     * @param {string} path - 상태 경로
     * @param {any} oldValue - 이전 값
     * @param {any} newValue - 새로운 값
     * @returns {any} 처리된 값
     */
    runMiddleware(path, oldValue, newValue) {
        let processedValue = newValue;
        
        this.middleware.forEach(middleware => {
            try {
                processedValue = middleware(path, oldValue, processedValue, this.state);
            } catch (error) {
                console.error('미들웨어 실행 중 오류:', error);
            }
        });
        
        return processedValue;
    }
    
    /**
     * 중첩 객체 값 가져오기
     * @param {Object} obj - 객체
     * @param {string} path - 경로
     * @returns {any} 값
     */
    getNestedValue(obj, path) {
        if (!path) return obj;
        
        return path.split('.').reduce((current, key) => {
            return current && current[key] !== undefined ? current[key] : undefined;
        }, obj);
    }
    
    /**
     * 중첩 객체 값 설정
     * @param {Object} obj - 객체
     * @param {string} path - 경로
     * @param {any} value - 설정할 값
     */
    setNestedValue(obj, path, value) {
        if (!path) return;
        
        const keys = path.split('.');
        const lastKey = keys.pop();
        const target = keys.reduce((current, key) => {
            if (!current[key] || typeof current[key] !== 'object') {
                current[key] = {};
            }
            return current[key];
        }, obj);
        
        target[lastKey] = value;
    }
    
    /**
     * 깊은 복사
     * @param {any} obj - 복사할 객체
     * @returns {any} 복사된 객체
     */
    deepClone(obj) {
        if (obj === null || typeof obj !== 'object') return obj;
        if (obj instanceof Date) return new Date(obj.getTime());
        if (obj instanceof Array) return obj.map(item => this.deepClone(item));
        if (typeof obj === 'object') {
            const clonedObj = {};
            for (const key in obj) {
                if (obj.hasOwnProperty(key)) {
                    clonedObj[key] = this.deepClone(obj[key]);
                }
            }
            return clonedObj;
        }
    }
    
    /**
     * 상태 스냅샷 생성
     * @returns {Object} 상태 스냅샷
     */
    createSnapshot() {
        return {
            state: this.deepClone(this.state),
            timestamp: Date.now(),
            historyIndex: this.historyIndex
        };
    }
    
    /**
     * 스냅샷에서 복원
     * @param {Object} snapshot - 스냅샷
     */
    restoreFromSnapshot(snapshot) {
        this.state = this.deepClone(snapshot.state);
        this.historyIndex = snapshot.historyIndex;
        this.notify('*', null, this.state);
    }
    
    /**
     * 상태 디버깅 정보
     * @returns {Object} 디버깅 정보
     */
    getDebugInfo() {
        return {
            stateSize: JSON.stringify(this.state).length,
            subscribersCount: this.subscribers.size,
            historyLength: this.history.length,
            historyIndex: this.historyIndex,
            middlewareCount: this.middleware.length
        };
    }
}

// ===== GLOBAL STATE INSTANCE =====

// 전역 상태 관리자 인스턴스 생성
export const globalState = new StateManager(AppState);

// ===== STATE HELPERS =====

/**
 * 상태 구독 헬퍼
 * @param {string} path - 상태 경로
 * @param {Function} callback - 콜백 함수
 * @returns {Function} 구독 해제 함수
 */
export function subscribeToState(path, callback) {
    return globalState.subscribe(path, callback);
}

/**
 * 상태 가져오기 헬퍼
 * @param {string} path - 상태 경로
 * @returns {any} 상태 값
 */
export function getState(path) {
    return globalState.get(path);
}

/**
 * 상태 설정 헬퍼
 * @param {string} path - 상태 경로
 * @param {any} value - 설정할 값
 * @param {boolean} silent - 알림 비활성화 여부
 */
export function setState(path, value, silent = false) {
    globalState.set(path, value, silent);
}

/**
 * 상태 일괄 업데이트 헬퍼
 * @param {Object} updates - 업데이트할 상태들
 * @param {boolean} silent - 알림 비활성화 여부
 */
export function batchUpdateState(updates, silent = false) {
    globalState.batchUpdate(updates, silent);
}

/**
 * 상태 리셋 헬퍼
 * @param {string} path - 리셋할 경로
 */
export function resetState(path = null) {
    globalState.reset(path);
}

// ===== STATE MIDDLEWARE =====

/**
 * 로깅 미들웨어
 */
export const loggingMiddleware = (path, oldValue, newValue, state) => {
    console.log(`[State Change] ${path}:`, { oldValue, newValue });
    return newValue;
};

/**
 * 유효성 검사 미들웨어
 */
export const validationMiddleware = (path, oldValue, newValue, state) => {
    // 테마 유효성 검사
    if (path === 'theme.current' && !['dark', 'light'].includes(newValue)) {
        console.warn('Invalid theme value:', newValue);
        return oldValue;
    }
    
    // 네비게이션 유효성 검사
    if (path === 'navigation.currentSection' && 
        !['home', 'products', 'consultation', 'faq'].includes(newValue)) {
        console.warn('Invalid section value:', newValue);
        return oldValue;
    }
    
    return newValue;
};

/**
 * 지속성 미들웨어
 */
export const persistenceMiddleware = (path, oldValue, newValue, state) => {
    // 특정 상태들을 로컬 스토리지에 저장
    const persistentPaths = ['theme.current', 'user.preferences'];
    
    if (persistentPaths.includes(path)) {
        try {
            localStorage.setItem(`state_${path}`, JSON.stringify(newValue));
        } catch (error) {
            console.error('상태 저장 실패:', error);
        }
    }
    
    return newValue;
};

// 미들웨어 등록
globalState.addMiddleware(loggingMiddleware);
globalState.addMiddleware(validationMiddleware);
globalState.addMiddleware(persistenceMiddleware);

// ===== STATE INITIALIZATION =====

/**
 * 저장된 상태 복원
 */
export function restorePersistedState() {
    const persistentPaths = ['theme.current', 'user.preferences'];
    
    persistentPaths.forEach(path => {
        try {
            const saved = localStorage.getItem(`state_${path}`);
            if (saved) {
                const value = JSON.parse(saved);
                globalState.set(path, value, true); // silent mode
            }
        } catch (error) {
            console.error('저장된 상태 복원 실패:', error);
        }
    });
}

// 페이지 로드 시 저장된 상태 복원
if (typeof window !== 'undefined') {
    window.addEventListener('load', restorePersistedState);
}

// ===== EXPORT =====

// 전역으로 노출
if (typeof window !== 'undefined') {
    window.StateManager = StateManager;
    window.globalState = globalState;
    window.subscribeToState = subscribeToState;
    window.getState = getState;
    window.setState = setState;
    window.batchUpdateState = batchUpdateState;
    window.resetState = resetState;
} 