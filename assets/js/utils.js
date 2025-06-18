/**
 * Utility Functions for Insurance Website
 * 공통 유틸리티 함수들
 */

// ===== DOM UTILITIES =====

/**
 * DOM 요소 선택 헬퍼
 * @param {string} selector - CSS 선택자
 * @param {Element} parent - 부모 요소 (기본값: document)
 * @returns {Element|null} 선택된 요소
 */
export function $(selector, parent = document) {
    return parent.querySelector(selector);
}

/**
 * 여러 DOM 요소 선택 헬퍼
 * @param {string} selector - CSS 선택자
 * @param {Element} parent - 부모 요소 (기본값: document)
 * @returns {NodeList} 선택된 요소들
 */
export function $$(selector, parent = document) {
    return parent.querySelectorAll(selector);
}

/**
 * DOM 요소 생성 헬퍼
 * @param {string} tag - HTML 태그명
 * @param {Object} attributes - 속성 객체
 * @param {string} textContent - 텍스트 내용
 * @returns {Element} 생성된 요소
 */
export function createElement(tag, attributes = {}, textContent = '') {
    const element = document.createElement(tag);
    
    // 속성 설정
    Object.entries(attributes).forEach(([key, value]) => {
        if (key === 'className') {
            element.className = value;
        } else if (key === 'textContent') {
            element.textContent = value;
        } else {
            element.setAttribute(key, value);
        }
    });
    
    if (textContent) {
        element.textContent = textContent;
    }
    
    return element;
}

/**
 * 요소에 클래스 토글
 * @param {Element} element - 대상 요소
 * @param {string} className - 클래스명
 * @param {boolean} force - 강제 설정값
 */
export function toggleClass(element, className, force) {
    if (typeof force === 'boolean') {
        element.classList.toggle(className, force);
    } else {
        element.classList.toggle(className);
    }
}

/**
 * 요소에 클래스 추가
 * @param {Element} element - 대상 요소
 * @param {string} className - 클래스명
 */
export function addClass(element, className) {
    element.classList.add(className);
}

/**
 * 요소에서 클래스 제거
 * @param {Element} element - 대상 요소
 * @param {string} className - 클래스명
 */
export function removeClass(element, className) {
    element.classList.remove(className);
}

/**
 * 요소에 클래스가 있는지 확인
 * @param {Element} element - 대상 요소
 * @param {string} className - 클래스명
 * @returns {boolean} 클래스 존재 여부
 */
export function hasClass(element, className) {
    return element.classList.contains(className);
}

// ===== ANIMATION UTILITIES =====

/**
 * 요소에 애니메이션 클래스 추가
 * @param {Element} element - 대상 요소
 * @param {string} animationClass - 애니메이션 클래스
 * @param {number} duration - 지속시간 (ms)
 * @returns {Promise} 애니메이션 완료 Promise
 */
export function animateElement(element, animationClass, duration = 300) {
    return new Promise((resolve) => {
        addClass(element, animationClass);
        
        setTimeout(() => {
            removeClass(element, animationClass);
            resolve();
        }, duration);
    });
}

/**
 * 요소를 페이드 인
 * @param {Element} element - 대상 요소
 * @param {number} duration - 지속시간 (ms)
 * @returns {Promise} 애니메이션 완료 Promise
 */
export function fadeIn(element, duration = 300) {
    element.style.opacity = '0';
    element.style.display = 'block';
    
    return new Promise((resolve) => {
        setTimeout(() => {
            element.style.opacity = '1';
            element.style.transition = `opacity ${duration}ms ease`;
            
            setTimeout(() => {
                element.style.transition = '';
                resolve();
            }, duration);
        }, 10);
    });
}

/**
 * 요소를 페이드 아웃
 * @param {Element} element - 대상 요소
 * @param {number} duration - 지속시간 (ms)
 * @returns {Promise} 애니메이션 완료 Promise
 */
export function fadeOut(element, duration = 300) {
    element.style.opacity = '1';
    element.style.transition = `opacity ${duration}ms ease`;
    
    return new Promise((resolve) => {
        setTimeout(() => {
            element.style.opacity = '0';
            
            setTimeout(() => {
                element.style.display = 'none';
                element.style.transition = '';
                resolve();
            }, duration);
        }, 10);
    });
}

/**
 * 요소를 슬라이드 다운
 * @param {Element} element - 대상 요소
 * @param {number} duration - 지속시간 (ms)
 * @returns {Promise} 애니메이션 완료 Promise
 */
export function slideDown(element, duration = 300) {
    element.style.height = '0';
    element.style.overflow = 'hidden';
    element.style.display = 'block';
    
    const targetHeight = element.scrollHeight;
    
    return new Promise((resolve) => {
        setTimeout(() => {
            element.style.transition = `height ${duration}ms ease`;
            element.style.height = `${targetHeight}px`;
            
            setTimeout(() => {
                element.style.height = '';
                element.style.overflow = '';
                element.style.transition = '';
                resolve();
            }, duration);
        }, 10);
    });
}

/**
 * 요소를 슬라이드 업
 * @param {Element} element - 대상 요소
 * @param {number} duration - 지속시간 (ms)
 * @returns {Promise} 애니메이션 완료 Promise
 */
export function slideUp(element, duration = 300) {
    element.style.height = `${element.scrollHeight}px`;
    element.style.overflow = 'hidden';
    element.style.transition = `height ${duration}ms ease`;
    
    return new Promise((resolve) => {
        setTimeout(() => {
            element.style.height = '0';
            
            setTimeout(() => {
                element.style.display = 'none';
                element.style.height = '';
                element.style.overflow = '';
                element.style.transition = '';
                resolve();
            }, duration);
        }, 10);
    });
}

// ===== VALIDATION UTILITIES =====

/**
 * 이메일 유효성 검사
 * @param {string} email - 이메일 주소
 * @returns {boolean} 유효성 여부
 */
export function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

/**
 * 전화번호 유효성 검사
 * @param {string} phone - 전화번호
 * @returns {boolean} 유효성 여부
 */
export function isValidPhone(phone) {
    const phoneRegex = /^[0-9]{2,3}-[0-9]{3,4}-[0-9]{4}$/;
    return phoneRegex.test(phone);
}

/**
 * 숫자 유효성 검사
 * @param {string|number} value - 검사할 값
 * @returns {boolean} 유효성 여부
 */
export function isValidNumber(value) {
    return !isNaN(value) && isFinite(value);
}

/**
 * 필수 필드 검사
 * @param {string} value - 검사할 값
 * @returns {boolean} 유효성 여부
 */
export function isRequired(value) {
    return value !== null && value !== undefined && value.toString().trim() !== '';
}

/**
 * 최소 길이 검사
 * @param {string} value - 검사할 값
 * @param {number} minLength - 최소 길이
 * @returns {boolean} 유효성 여부
 */
export function hasMinLength(value, minLength) {
    return value && value.toString().length >= minLength;
}

/**
 * 최대 길이 검사
 * @param {string} value - 검사할 값
 * @param {number} maxLength - 최대 길이
 * @returns {boolean} 유효성 여부
 */
export function hasMaxLength(value, maxLength) {
    return value && value.toString().length <= maxLength;
}

/**
 * 범위 검사
 * @param {number} value - 검사할 값
 * @param {number} min - 최소값
 * @param {number} max - 최대값
 * @returns {boolean} 유효성 여부
 */
export function isInRange(value, min, max) {
    return value >= min && value <= max;
}

// ===== FORMATTING UTILITIES =====

/**
 * 숫자를 통화 형식으로 포맷팅
 * @param {number} amount - 금액
 * @param {string} currency - 통화 (기본값: 'KRW')
 * @returns {string} 포맷팅된 문자열
 */
export function formatCurrency(amount, currency = 'KRW') {
    if (!isValidNumber(amount)) return '0';
    
    const formatter = new Intl.NumberFormat('ko-KR', {
        style: 'currency',
        currency: currency,
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    });
    
    return formatter.format(amount);
}

/**
 * 숫자를 천 단위 구분자로 포맷팅
 * @param {number} number - 숫자
 * @returns {string} 포맷팅된 문자열
 */
export function formatNumber(number) {
    if (!isValidNumber(number)) return '0';
    
    return new Intl.NumberFormat('ko-KR').format(number);
}

/**
 * 날짜를 포맷팅
 * @param {Date|string} date - 날짜
 * @param {string} format - 포맷 (기본값: 'YYYY-MM-DD')
 * @returns {string} 포맷팅된 문자열
 */
export function formatDate(date, format = 'YYYY-MM-DD') {
    const d = new Date(date);
    
    if (isNaN(d.getTime())) return '';
    
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const hours = String(d.getHours()).padStart(2, '0');
    const minutes = String(d.getMinutes()).padStart(2, '0');
    const seconds = String(d.getSeconds()).padStart(2, '0');
    
    return format
        .replace('YYYY', year)
        .replace('MM', month)
        .replace('DD', day)
        .replace('HH', hours)
        .replace('mm', minutes)
        .replace('ss', seconds);
}

/**
 * 전화번호 포맷팅
 * @param {string} phone - 전화번호
 * @returns {string} 포맷팅된 전화번호
 */
export function formatPhone(phone) {
    if (!phone) return '';
    
    const cleaned = phone.replace(/\D/g, '');
    
    if (cleaned.length === 10) {
        return `${cleaned.slice(0, 3)}-${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
    } else if (cleaned.length === 11) {
        return `${cleaned.slice(0, 3)}-${cleaned.slice(3, 7)}-${cleaned.slice(7)}`;
    }
    
    return phone;
}

/**
 * 텍스트 길이 제한
 * @param {string} text - 텍스트
 * @param {number} maxLength - 최대 길이
 * @param {string} suffix - 접미사 (기본값: '...')
 * @returns {string} 제한된 텍스트
 */
export function truncateText(text, maxLength, suffix = '...') {
    if (!text || text.length <= maxLength) return text;
    return text.slice(0, maxLength) + suffix;
}

// ===== STORAGE UTILITIES =====

/**
 * 로컬 스토리지에 저장
 * @param {string} key - 키
 * @param {any} value - 값
 */
export function setLocalStorage(key, value) {
    try {
        localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
        console.error('LocalStorage 저장 실패:', error);
    }
}

/**
 * 로컬 스토리지에서 가져오기
 * @param {string} key - 키
 * @param {any} defaultValue - 기본값
 * @returns {any} 저장된 값
 */
export function getLocalStorage(key, defaultValue = null) {
    try {
        const item = localStorage.getItem(key);
        return item ? JSON.parse(item) : defaultValue;
    } catch (error) {
        console.error('LocalStorage 읽기 실패:', error);
        return defaultValue;
    }
}

/**
 * 로컬 스토리지에서 삭제
 * @param {string} key - 키
 */
export function removeLocalStorage(key) {
    try {
        localStorage.removeItem(key);
    } catch (error) {
        console.error('LocalStorage 삭제 실패:', error);
    }
}

/**
 * 로컬 스토리지 전체 삭제
 */
export function clearLocalStorage() {
    try {
        localStorage.clear();
    } catch (error) {
        console.error('LocalStorage 전체 삭제 실패:', error);
    }
}

// ===== EVENT UTILITIES =====

/**
 * 이벤트 리스너 추가
 * @param {Element} element - 대상 요소
 * @param {string} event - 이벤트 타입
 * @param {Function} handler - 핸들러 함수
 * @param {Object} options - 옵션
 */
export function addEventListener(element, event, handler, options = {}) {
    element.addEventListener(event, handler, options);
}

/**
 * 이벤트 리스너 제거
 * @param {Element} element - 대상 요소
 * @param {string} event - 이벤트 타입
 * @param {Function} handler - 핸들러 함수
 * @param {Object} options - 옵션
 */
export function removeEventListener(element, event, handler, options = {}) {
    element.removeEventListener(event, handler, options);
}

/**
 * 이벤트 위임
 * @param {Element} parent - 부모 요소
 * @param {string} selector - 선택자
 * @param {string} event - 이벤트 타입
 * @param {Function} handler - 핸들러 함수
 */
export function delegateEvent(parent, selector, event, handler) {
    parent.addEventListener(event, (e) => {
        const target = e.target.closest(selector);
        if (target && parent.contains(target)) {
            handler.call(target, e);
        }
    });
}

// ===== ASYNC UTILITIES =====

/**
 * 지연 실행
 * @param {number} ms - 지연 시간 (ms)
 * @returns {Promise} Promise
 */
export function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * 디바운스 함수
 * @param {Function} func - 실행할 함수
 * @param {number} wait - 대기 시간 (ms)
 * @returns {Function} 디바운스된 함수
 */
export function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

/**
 * 쓰로틀 함수
 * @param {Function} func - 실행할 함수
 * @param {number} limit - 제한 시간 (ms)
 * @returns {Function} 쓰로틀된 함수
 */
export function throttle(func, limit) {
    let inThrottle;
    return function() {
        const args = arguments;
        const context = this;
        if (!inThrottle) {
            func.apply(context, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}

// ===== MATH UTILITIES =====

/**
 * 랜덤 정수 생성
 * @param {number} min - 최소값
 * @param {number} max - 최대값
 * @returns {number} 랜덤 정수
 */
export function randomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * 랜덤 소수 생성
 * @param {number} min - 최소값
 * @param {number} max - 최대값
 * @returns {number} 랜덤 소수
 */
export function randomFloat(min, max) {
    return Math.random() * (max - min) + min;
}

/**
 * 배열에서 랜덤 요소 선택
 * @param {Array} array - 배열
 * @returns {any} 랜덤 요소
 */
export function randomChoice(array) {
    return array[Math.floor(Math.random() * array.length)];
}

/**
 * 배열 셔플
 * @param {Array} array - 배열
 * @returns {Array} 셔플된 배열
 */
export function shuffleArray(array) {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
}

// ===== STRING UTILITIES =====

/**
 * 카멜케이스로 변환
 * @param {string} str - 문자열
 * @returns {string} 카멜케이스 문자열
 */
export function toCamelCase(str) {
    return str.replace(/-([a-z])/g, (g) => g[1].toUpperCase());
}

/**
 * 케밥케이스로 변환
 * @param {string} str - 문자열
 * @returns {string} 케밥케이스 문자열
 */
export function toKebabCase(str) {
    return str.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase();
}

/**
 * 파스칼케이스로 변환
 * @param {string} str - 문자열
 * @returns {string} 파스칼케이스 문자열
 */
export function toPascalCase(str) {
    return str.charAt(0).toUpperCase() + toCamelCase(str.slice(1));
}

/**
 * 첫 글자 대문자로 변환
 * @param {string} str - 문자열
 * @returns {string} 변환된 문자열
 */
export function capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

// ===== OBJECT UTILITIES =====

/**
 * 객체 깊은 복사
 * @param {Object} obj - 복사할 객체
 * @returns {Object} 복사된 객체
 */
export function deepClone(obj) {
    if (obj === null || typeof obj !== 'object') return obj;
    if (obj instanceof Date) return new Date(obj.getTime());
    if (obj instanceof Array) return obj.map(item => deepClone(item));
    if (typeof obj === 'object') {
        const clonedObj = {};
        for (const key in obj) {
            if (obj.hasOwnProperty(key)) {
                clonedObj[key] = deepClone(obj[key]);
            }
        }
        return clonedObj;
    }
}

/**
 * 객체 병합
 * @param {Object} target - 대상 객체
 * @param {Object} source - 소스 객체
 * @returns {Object} 병합된 객체
 */
export function mergeObjects(target, source) {
    const result = { ...target };
    for (const key in source) {
        if (source.hasOwnProperty(key)) {
            if (typeof source[key] === 'object' && source[key] !== null && !Array.isArray(source[key])) {
                result[key] = mergeObjects(result[key] || {}, source[key]);
            } else {
                result[key] = source[key];
            }
        }
    }
    return result;
}

// ===== ARRAY UTILITIES =====

/**
 * 배열 중복 제거
 * @param {Array} array - 배열
 * @returns {Array} 중복 제거된 배열
 */
export function uniqueArray(array) {
    return [...new Set(array)];
}

/**
 * 배열 그룹화
 * @param {Array} array - 배열
 * @param {Function} keyFunc - 키 함수
 * @returns {Object} 그룹화된 객체
 */
export function groupBy(array, keyFunc) {
    return array.reduce((groups, item) => {
        const key = keyFunc(item);
        if (!groups[key]) {
            groups[key] = [];
        }
        groups[key].push(item);
        return groups;
    }, {});
}

/**
 * 배열 정렬 (안전한)
 * @param {Array} array - 배열
 * @param {Function} compareFunc - 비교 함수
 * @returns {Array} 정렬된 배열
 */
export function safeSort(array, compareFunc) {
    return [...array].sort(compareFunc);
}

// ===== ERROR HANDLING =====

/**
 * 안전한 함수 실행
 * @param {Function} func - 실행할 함수
 * @param {any} defaultValue - 기본값
 * @returns {any} 실행 결과 또는 기본값
 */
export function safeExecute(func, defaultValue = null) {
    try {
        return func();
    } catch (error) {
        console.error('함수 실행 중 오류:', error);
        return defaultValue;
    }
}

/**
 * 비동기 함수 안전 실행
 * @param {Function} asyncFunc - 실행할 비동기 함수
 * @param {any} defaultValue - 기본값
 * @returns {Promise<any>} 실행 결과 또는 기본값
 */
export async function safeExecuteAsync(asyncFunc, defaultValue = null) {
    try {
        return await asyncFunc();
    } catch (error) {
        console.error('비동기 함수 실행 중 오류:', error);
        return defaultValue;
    }
}

// ===== LOGGING =====

/**
 * 로그 레벨
 */
export const LogLevel = {
    DEBUG: 0,
    INFO: 1,
    WARN: 2,
    ERROR: 3
};

/**
 * 로거 클래스
 */
export class Logger {
    constructor(level = LogLevel.INFO) {
        this.level = level;
    }
    
    debug(...args) {
        if (this.level <= LogLevel.DEBUG) {
            console.log('[DEBUG]', ...args);
        }
    }
    
    info(...args) {
        if (this.level <= LogLevel.INFO) {
            console.log('[INFO]', ...args);
        }
    }
    
    warn(...args) {
        if (this.level <= LogLevel.WARN) {
            console.warn('[WARN]', ...args);
        }
    }
    
    error(...args) {
        if (this.level <= LogLevel.ERROR) {
            console.error('[ERROR]', ...args);
        }
    }
}

// 전역 로거 인스턴스
export const logger = new Logger(LogLevel.INFO);

// ===== EXPORT =====

// 모든 유틸리티 함수들을 전역으로 노출 (모듈 시스템이 아닌 경우)
if (typeof window !== 'undefined') {
    window.Utils = {
        $,
        $$,
        createElement,
        toggleClass,
        addClass,
        removeClass,
        hasClass,
        animateElement,
        fadeIn,
        fadeOut,
        slideDown,
        slideUp,
        isValidEmail,
        isValidPhone,
        isValidNumber,
        isRequired,
        hasMinLength,
        hasMaxLength,
        isInRange,
        formatCurrency,
        formatNumber,
        formatDate,
        formatPhone,
        truncateText,
        setLocalStorage,
        getLocalStorage,
        removeLocalStorage,
        clearLocalStorage,
        addEventListener,
        removeEventListener,
        delegateEvent,
        delay,
        debounce,
        throttle,
        randomInt,
        randomFloat,
        randomChoice,
        shuffleArray,
        toCamelCase,
        toKebabCase,
        toPascalCase,
        capitalize,
        deepClone,
        mergeObjects,
        uniqueArray,
        groupBy,
        safeSort,
        safeExecute,
        safeExecuteAsync,
        LogLevel,
        Logger,
        logger
    };
} 