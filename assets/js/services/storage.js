/**
 * Storage Service
 * 로컬 스토리지 관리를 담당하는 서비스 모듈
 */

class StorageService {
    constructor() {
        this.prefix = 'insurance_';
        this.defaultTTL = 24 * 60 * 60 * 1000; // 24시간
        
        this.init();
    }
    
    /**
     * 초기화
     */
    init() {
        this.cleanupExpired();
        this.setupPeriodicCleanup();
        
        console.log('StorageService initialized');
    }
    
    /**
     * 데이터 저장
     */
    set(key, value, ttl = null) {
        try {
            const fullKey = this.prefix + key;
            const data = {
                value: value,
                timestamp: Date.now(),
                ttl: ttl || this.defaultTTL
            };
            
            localStorage.setItem(fullKey, JSON.stringify(data));
            return true;
        } catch (error) {
            console.error('Storage set error:', error);
            return false;
        }
    }
    
    /**
     * 데이터 조회
     */
    get(key, defaultValue = null) {
        try {
            const fullKey = this.prefix + key;
            const data = localStorage.getItem(fullKey);
            
            if (!data) {
                return defaultValue;
            }
            
            const parsed = JSON.parse(data);
            
            // TTL 확인
            if (this.isExpired(parsed)) {
                this.remove(key);
                return defaultValue;
            }
            
            return parsed.value;
        } catch (error) {
            console.error('Storage get error:', error);
            return defaultValue;
        }
    }
    
    /**
     * 데이터 삭제
     */
    remove(key) {
        try {
            const fullKey = this.prefix + key;
            localStorage.removeItem(fullKey);
            return true;
        } catch (error) {
            console.error('Storage remove error:', error);
            return false;
        }
    }
    
    /**
     * 데이터 존재 확인
     */
    has(key) {
        try {
            const fullKey = this.prefix + key;
            const data = localStorage.getItem(fullKey);
            
            if (!data) {
                return false;
            }
            
            const parsed = JSON.parse(data);
            
            // TTL 확인
            if (this.isExpired(parsed)) {
                this.remove(key);
                return false;
            }
            
            return true;
        } catch (error) {
            console.error('Storage has error:', error);
            return false;
        }
    }
    
    /**
     * 만료 시간 확인
     */
    isExpired(data) {
        const now = Date.now();
        const expiryTime = data.timestamp + data.ttl;
        return now > expiryTime;
    }
    
    /**
     * 만료된 데이터 정리
     */
    cleanupExpired() {
        try {
            const keys = Object.keys(localStorage);
            const expiredKeys = [];
            
            keys.forEach(key => {
                if (key.startsWith(this.prefix)) {
                    try {
                        const data = JSON.parse(localStorage.getItem(key));
                        if (this.isExpired(data)) {
                            expiredKeys.push(key);
                        }
                    } catch (error) {
                        // 잘못된 데이터는 삭제
                        expiredKeys.push(key);
                    }
                }
            });
            
            expiredKeys.forEach(key => {
                localStorage.removeItem(key);
            });
            
            if (expiredKeys.length > 0) {
                console.log(`Cleaned up ${expiredKeys.length} expired storage items`);
            }
        } catch (error) {
            console.error('Storage cleanup error:', error);
        }
    }
    
    /**
     * 주기적 정리 설정
     */
    setupPeriodicCleanup() {
        // 1시간마다 만료된 데이터 정리
        setInterval(() => {
            this.cleanupExpired();
        }, 60 * 60 * 1000);
    }
    
    /**
     * 모든 데이터 삭제
     */
    clear() {
        try {
            const keys = Object.keys(localStorage);
            const prefixedKeys = keys.filter(key => key.startsWith(this.prefix));
            
            prefixedKeys.forEach(key => {
                localStorage.removeItem(key);
            });
            
            console.log(`Cleared ${prefixedKeys.length} storage items`);
            return true;
        } catch (error) {
            console.error('Storage clear error:', error);
            return false;
        }
    }
    
    /**
     * 저장된 키 목록 반환
     */
    keys() {
        try {
            const keys = Object.keys(localStorage);
            return keys
                .filter(key => key.startsWith(this.prefix))
                .map(key => key.replace(this.prefix, ''));
        } catch (error) {
            console.error('Storage keys error:', error);
            return [];
        }
    }
    
    /**
     * 저장소 사용량 확인
     */
    getUsage() {
        try {
            const keys = this.keys();
            let totalSize = 0;
            
            keys.forEach(key => {
                const data = this.get(key);
                if (data !== null) {
                    totalSize += JSON.stringify(data).length;
                }
            });
            
            return {
                itemCount: keys.length,
                totalSize: totalSize,
                totalSizeKB: (totalSize / 1024).toFixed(2)
            };
        } catch (error) {
            console.error('Storage usage error:', error);
            return { itemCount: 0, totalSize: 0, totalSizeKB: '0.00' };
        }
    }
    
    /**
     * 데이터 백업
     */
    backup() {
        try {
            const keys = this.keys();
            const backup = {};
            
            keys.forEach(key => {
                backup[key] = this.get(key);
            });
            
            return backup;
        } catch (error) {
            console.error('Storage backup error:', error);
            return {};
        }
    }
    
    /**
     * 데이터 복원
     */
    restore(backup) {
        try {
            Object.keys(backup).forEach(key => {
                this.set(key, backup[key]);
            });
            
            console.log(`Restored ${Object.keys(backup).length} items`);
            return true;
        } catch (error) {
            console.error('Storage restore error:', error);
            return false;
        }
    }
    
    /**
     * 데이터 내보내기
     */
    export() {
        try {
            const backup = this.backup();
            const dataStr = JSON.stringify(backup, null, 2);
            const dataBlob = new Blob([dataStr], { type: 'application/json' });
            
            const link = document.createElement('a');
            link.href = URL.createObjectURL(dataBlob);
            link.download = `storage-backup-${new Date().toISOString().split('T')[0]}.json`;
            link.click();
            
            URL.revokeObjectURL(link.href);
            return true;
        } catch (error) {
            console.error('Storage export error:', error);
            return false;
        }
    }
    
    /**
     * 데이터 가져오기
     */
    async import(file) {
        try {
            const text = await file.text();
            const backup = JSON.parse(text);
            
            return this.restore(backup);
        } catch (error) {
            console.error('Storage import error:', error);
            return false;
        }
    }
    
    /**
     * 세션 스토리지 사용
     */
    setSession(key, value) {
        try {
            const fullKey = this.prefix + key;
            sessionStorage.setItem(fullKey, JSON.stringify(value));
            return true;
        } catch (error) {
            console.error('Session storage set error:', error);
            return false;
        }
    }
    
    getSession(key, defaultValue = null) {
        try {
            const fullKey = this.prefix + key;
            const data = sessionStorage.getItem(fullKey);
            
            if (!data) {
                return defaultValue;
            }
            
            return JSON.parse(data);
        } catch (error) {
            console.error('Session storage get error:', error);
            return defaultValue;
        }
    }
    
    removeSession(key) {
        try {
            const fullKey = this.prefix + key;
            sessionStorage.removeItem(fullKey);
            return true;
        } catch (error) {
            console.error('Session storage remove error:', error);
            return false;
        }
    }
    
    clearSession() {
        try {
            const keys = Object.keys(sessionStorage);
            const prefixedKeys = keys.filter(key => key.startsWith(this.prefix));
            
            prefixedKeys.forEach(key => {
                sessionStorage.removeItem(key);
            });
            
            return true;
        } catch (error) {
            console.error('Session storage clear error:', error);
            return false;
        }
    }
    
    /**
     * 사용자 설정 관련 메서드들
     */
    setUserPreference(key, value) {
        return this.set(`user_pref_${key}`, value, 365 * 24 * 60 * 60 * 1000); // 1년
    }
    
    getUserPreference(key, defaultValue = null) {
        return this.get(`user_pref_${key}`, defaultValue);
    }
    
    /**
     * 테마 설정
     */
    setTheme(theme) {
        return this.setUserPreference('theme', theme);
    }
    
    getTheme() {
        return this.getUserPreference('theme', 'light');
    }
    
    /**
     * 언어 설정
     */
    setLanguage(language) {
        return this.setUserPreference('language', language);
    }
    
    getLanguage() {
        return this.getUserPreference('language', 'ko');
    }
    
    /**
     * 알림 설정
     */
    setNotificationSettings(settings) {
        return this.setUserPreference('notifications', settings);
    }
    
    getNotificationSettings() {
        return this.getUserPreference('notifications', {
            email: true,
            push: true,
            sms: false
        });
    }
    
    /**
     * 최근 검색어
     */
    addRecentSearch(query) {
        const recentSearches = this.getRecentSearches();
        const maxSearches = 10;
        
        // 중복 제거
        const filtered = recentSearches.filter(search => search !== query);
        
        // 새 검색어를 맨 앞에 추가
        filtered.unshift(query);
        
        // 최대 개수 제한
        if (filtered.length > maxSearches) {
            filtered.splice(maxSearches);
        }
        
        return this.setUserPreference('recent_searches', filtered);
    }
    
    getRecentSearches() {
        return this.getUserPreference('recent_searches', []);
    }
    
    clearRecentSearches() {
        return this.remove('user_pref_recent_searches');
    }
    
    /**
     * 즐겨찾기 상품
     */
    addFavoriteProduct(productId) {
        const favorites = this.getFavoriteProducts();
        
        if (!favorites.includes(productId)) {
            favorites.push(productId);
            return this.setUserPreference('favorite_products', favorites);
        }
        
        return true;
    }
    
    removeFavoriteProduct(productId) {
        const favorites = this.getFavoriteProducts();
        const filtered = favorites.filter(id => id !== productId);
        
        return this.setUserPreference('favorite_products', filtered);
    }
    
    getFavoriteProducts() {
        return this.getUserPreference('favorite_products', []);
    }
    
    isFavoriteProduct(productId) {
        const favorites = this.getFavoriteProducts();
        return favorites.includes(productId);
    }
    
    /**
     * 상담 기록
     */
    addConsultationRecord(record) {
        const records = this.getConsultationRecords();
        records.unshift({
            ...record,
            timestamp: Date.now()
        });
        
        // 최대 50개까지만 저장
        if (records.length > 50) {
            records.splice(50);
        }
        
        return this.setUserPreference('consultation_records', records);
    }
    
    getConsultationRecords() {
        return this.getUserPreference('consultation_records', []);
    }
    
    clearConsultationRecords() {
        return this.remove('user_pref_consultation_records');
    }
    
    /**
     * 방문 기록
     */
    addVisitRecord(page) {
        const visits = this.getVisitRecords();
        visits.unshift({
            page,
            timestamp: Date.now()
        });
        
        // 최대 100개까지만 저장
        if (visits.length > 100) {
            visits.splice(100);
        }
        
        return this.setUserPreference('visit_records', visits);
    }
    
    getVisitRecords() {
        return this.getUserPreference('visit_records', []);
    }
    
    /**
     * 캐시 관리
     */
    setCache(key, data, ttl = 5 * 60 * 1000) { // 5분
        return this.set(`cache_${key}`, data, ttl);
    }
    
    getCache(key) {
        return this.get(`cache_${key}`);
    }
    
    clearCache() {
        const keys = this.keys();
        const cacheKeys = keys.filter(key => key.startsWith('cache_'));
        
        cacheKeys.forEach(key => {
            this.remove(key);
        });
        
        return cacheKeys.length;
    }
}

// 전역 인스턴스 생성
window.storageService = new StorageService(); 