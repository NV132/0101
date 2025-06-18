/**
 * Auth Service
 * 인증 관리를 담당하는 서비스 모듈
 */

class AuthService {
    constructor() {
        this.currentUser = null;
        this.isAuthenticated = false;
        this.tokenExpiry = null;
        this.refreshToken = null;
        
        this.init();
    }
    
    /**
     * 초기화
     */
    init() {
        this.loadAuthData();
        this.checkTokenExpiry();
        this.setupAutoRefresh();
        
        console.log('AuthService initialized');
    }
    
    /**
     * 인증 데이터 로드
     */
    loadAuthData() {
        try {
            const authData = localStorage.getItem('authData');
            if (authData) {
                const parsed = JSON.parse(authData);
                this.currentUser = parsed.user;
                this.isAuthenticated = !!parsed.token;
                this.tokenExpiry = parsed.expiry;
                this.refreshToken = parsed.refreshToken;
                
                // 토큰이 만료되었는지 확인
                if (this.tokenExpiry && new Date() > new Date(this.tokenExpiry)) {
                    this.logout();
                }
            }
        } catch (error) {
            console.error('Failed to load auth data:', error);
            this.clearAuthData();
        }
    }
    
    /**
     * 로그인
     */
    async login(credentials) {
        try {
            const response = await window.apiService.post('/auth/login', credentials);
            
            if (response.success) {
                this.setAuthData(response.data);
                this.isAuthenticated = true;
                this.currentUser = response.data.user;
                
                // 로그인 성공 이벤트 발생
                this.emitAuthEvent('login', this.currentUser);
                
                return { success: true, user: this.currentUser };
            } else {
                return { success: false, message: response.message };
            }
        } catch (error) {
            console.error('Login error:', error);
            return { success: false, message: '로그인에 실패했습니다.' };
        }
    }
    
    /**
     * 로그아웃
     */
    async logout() {
        try {
            // 서버에 로그아웃 요청
            if (this.isAuthenticated) {
                await window.apiService.post('/auth/logout');
            }
        } catch (error) {
            console.error('Logout error:', error);
        } finally {
            this.clearAuthData();
            this.isAuthenticated = false;
            this.currentUser = null;
            
            // 로그아웃 이벤트 발생
            this.emitAuthEvent('logout');
            
            // 로그인 페이지로 리다이렉트
            if (window.location.pathname !== '/login.html') {
                window.location.href = '/login.html';
            }
        }
    }
    
    /**
     * 회원가입
     */
    async register(userData) {
        try {
            const response = await window.apiService.post('/auth/register', userData);
            
            if (response.success) {
                // 회원가입 성공 시 자동 로그인
                return await this.login({
                    email: userData.email,
                    password: userData.password
                });
            } else {
                return { success: false, message: response.message };
            }
        } catch (error) {
            console.error('Register error:', error);
            return { success: false, message: '회원가입에 실패했습니다.' };
        }
    }
    
    /**
     * 토큰 갱신
     */
    async refreshAuthToken() {
        if (!this.refreshToken) {
            throw new Error('No refresh token available');
        }
        
        try {
            const response = await window.apiService.post('/auth/refresh', {
                refreshToken: this.refreshToken
            });
            
            if (response.success) {
                this.setAuthData(response.data);
                return true;
            } else {
                throw new Error('Token refresh failed');
            }
        } catch (error) {
            console.error('Token refresh error:', error);
            this.logout();
            return false;
        }
    }
    
    /**
     * 비밀번호 변경
     */
    async changePassword(currentPassword, newPassword) {
        try {
            const response = await window.apiService.put('/auth/change-password', {
                currentPassword,
                newPassword
            });
            
            return { success: response.success, message: response.message };
        } catch (error) {
            console.error('Change password error:', error);
            return { success: false, message: '비밀번호 변경에 실패했습니다.' };
        }
    }
    
    /**
     * 비밀번호 재설정 요청
     */
    async requestPasswordReset(email) {
        try {
            const response = await window.apiService.post('/auth/forgot-password', { email });
            return { success: response.success, message: response.message };
        } catch (error) {
            console.error('Password reset request error:', error);
            return { success: false, message: '비밀번호 재설정 요청에 실패했습니다.' };
        }
    }
    
    /**
     * 비밀번호 재설정
     */
    async resetPassword(token, newPassword) {
        try {
            const response = await window.apiService.post('/auth/reset-password', {
                token,
                newPassword
            });
            
            return { success: response.success, message: response.message };
        } catch (error) {
            console.error('Password reset error:', error);
            return { success: false, message: '비밀번호 재설정에 실패했습니다.' };
        }
    }
    
    /**
     * 사용자 프로필 업데이트
     */
    async updateProfile(profileData) {
        try {
            const response = await window.apiService.put('/user/profile', profileData);
            
            if (response.success) {
                this.currentUser = { ...this.currentUser, ...response.data };
                this.saveAuthData();
                
                // 프로필 업데이트 이벤트 발생
                this.emitAuthEvent('profileUpdate', this.currentUser);
                
                return { success: true, user: this.currentUser };
            } else {
                return { success: false, message: response.message };
            }
        } catch (error) {
            console.error('Profile update error:', error);
            return { success: false, message: '프로필 업데이트에 실패했습니다.' };
        }
    }
    
    /**
     * 계정 삭제
     */
    async deleteAccount(password) {
        try {
            const response = await window.apiService.delete('/user/delete', {
                body: JSON.stringify({ password })
            });
            
            if (response.success) {
                this.logout();
                return { success: true };
            } else {
                return { success: false, message: response.message };
            }
        } catch (error) {
            console.error('Delete account error:', error);
            return { success: false, message: '계정 삭제에 실패했습니다.' };
        }
    }
    
    /**
     * 인증 데이터 설정
     */
    setAuthData(data) {
        const authData = {
            user: data.user,
            token: data.token,
            refreshToken: data.refreshToken,
            expiry: data.expiry
        };
        
        localStorage.setItem('authData', JSON.stringify(authData));
        
        this.currentUser = data.user;
        this.tokenExpiry = data.expiry;
        this.refreshToken = data.refreshToken;
        
        // API 서비스에 토큰 설정
        if (window.apiService) {
            window.apiService.setAuthToken(data.token);
        }
    }
    
    /**
     * 인증 데이터 저장
     */
    saveAuthData() {
        const authData = {
            user: this.currentUser,
            token: window.apiService.getAuthToken(),
            refreshToken: this.refreshToken,
            expiry: this.tokenExpiry
        };
        
        localStorage.setItem('authData', JSON.stringify(authData));
    }
    
    /**
     * 인증 데이터 삭제
     */
    clearAuthData() {
        localStorage.removeItem('authData');
        
        if (window.apiService) {
            window.apiService.removeAuthToken();
        }
    }
    
    /**
     * 토큰 만료 확인
     */
    checkTokenExpiry() {
        if (this.tokenExpiry && new Date() > new Date(this.tokenExpiry)) {
            console.log('Token expired, attempting refresh...');
            this.refreshAuthToken();
        }
    }
    
    /**
     * 자동 토큰 갱신 설정
     */
    setupAutoRefresh() {
        // 토큰 만료 5분 전에 자동 갱신
        setInterval(() => {
            if (this.tokenExpiry) {
                const expiryTime = new Date(this.tokenExpiry).getTime();
                const currentTime = new Date().getTime();
                const fiveMinutes = 5 * 60 * 1000;
                
                if (expiryTime - currentTime <= fiveMinutes) {
                    this.refreshAuthToken();
                }
            }
        }, 60000); // 1분마다 확인
    }
    
    /**
     * 인증 상태 확인
     */
    isLoggedIn() {
        return this.isAuthenticated && this.currentUser !== null;
    }
    
    /**
     * 현재 사용자 반환
     */
    getCurrentUser() {
        return this.currentUser;
    }
    
    /**
     * 사용자 권한 확인
     */
    hasPermission(permission) {
        if (!this.currentUser || !this.currentUser.permissions) {
            return false;
        }
        
        return this.currentUser.permissions.includes(permission);
    }
    
    /**
     * 사용자 역할 확인
     */
    hasRole(role) {
        if (!this.currentUser || !this.currentUser.roles) {
            return false;
        }
        
        return this.currentUser.roles.includes(role);
    }
    
    /**
     * 인증 이벤트 발생
     */
    emitAuthEvent(eventType, data = null) {
        const event = new CustomEvent('authChange', {
            detail: {
                type: eventType,
                user: this.currentUser,
                data: data
            }
        });
        
        window.dispatchEvent(event);
    }
    
    /**
     * 인증 상태 구독
     */
    onAuthChange(callback) {
        window.addEventListener('authChange', callback);
        
        // 구독 해제 함수 반환
        return () => {
            window.removeEventListener('authChange', callback);
        };
    }
    
    /**
     * 보호된 라우트 확인
     */
    requireAuth(redirectUrl = '/login.html') {
        if (!this.isLoggedIn()) {
            window.location.href = redirectUrl + '?redirect=' + encodeURIComponent(window.location.href);
            return false;
        }
        return true;
    }
    
    /**
     * 관리자 권한 확인
     */
    requireAdmin(redirectUrl = '/') {
        if (!this.isLoggedIn() || !this.hasRole('admin')) {
            window.location.href = redirectUrl;
            return false;
        }
        return true;
    }
    
    /**
     * 인증 상태 반환
     */
    getAuthState() {
        return {
            isAuthenticated: this.isAuthenticated,
            user: this.currentUser,
            tokenExpiry: this.tokenExpiry
        };
    }
    
    /**
     * 세션 유지
     */
    keepAlive() {
        if (this.isLoggedIn()) {
            // 서버에 세션 유지 신호 전송
            window.apiService.post('/auth/keep-alive').catch(error => {
                console.error('Keep alive error:', error);
            });
        }
    }
}

// 전역 인스턴스 생성
window.authService = new AuthService(); 