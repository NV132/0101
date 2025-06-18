/**
 * Forms Module
 * 상담예약 폼 관리 기능을 담당하는 모듈
 */

class FormsManager {
    constructor() {
        this.formData = {};
        this.validationRules = {};
        this.isSubmitting = false;
        
        this.init();
    }
    
    /**
     * 초기화
     */
    init() {
        this.setupValidationRules();
        this.bindFormEvents();
        this.loadFormData();
        this.initializeFormFields();
        
        console.log('FormsManager initialized');
    }
    
    /**
     * 유효성 검사 규칙 설정
     */
    setupValidationRules() {
        this.validationRules = {
            name: {
                required: true,
                minLength: 2,
                maxLength: 20,
                pattern: /^[가-힣a-zA-Z\s]+$/
            },
            phone: {
                required: true,
                pattern: /^[0-9]{2,3}-[0-9]{3,4}-[0-9]{4}$/
            },
            email: {
                required: true,
                pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/
            },
            age: {
                required: true,
                min: 18,
                max: 80
            },
            preferredTime: {
                required: true
            },
            insuranceType: {
                required: true
            },
            message: {
                maxLength: 500
            }
        };
    }
    
    /**
     * 폼 이벤트 바인딩
     */
    bindFormEvents() {
        // 폼 제출 이벤트
        const consultationForm = document.getElementById('consultation-form');
        if (consultationForm) {
            consultationForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleFormSubmit();
            });
        }
        
        // 실시간 유효성 검사
        document.addEventListener('input', (e) => {
            if (e.target.matches('.form-input, .form-select, .form-textarea')) {
                this.validateField(e.target);
            }
        });
        
        // 폼 필드 변경 이벤트
        document.addEventListener('change', (e) => {
            if (e.target.matches('.form-input, .form-select, .form-textarea')) {
                this.saveFormData();
                this.updateFormProgress();
            }
        });
        
        // 폼 초기화 이벤트
        const resetBtn = document.getElementById('reset-form');
        if (resetBtn) {
            resetBtn.addEventListener('click', () => {
                this.resetForm();
            });
        }
        
        // 상담 시간 선택 이벤트
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('time-slot')) {
                this.selectTimeSlot(e.target);
            }
        });
        
        // 보험 유형 선택 이벤트
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('insurance-type-option')) {
                this.selectInsuranceType(e.target);
            }
        });
    }
    
    /**
     * 폼 데이터 로드
     */
    loadFormData() {
        const savedData = localStorage.getItem('consultationFormData');
        if (savedData) {
            try {
                this.formData = JSON.parse(savedData);
                this.populateFormFields();
            } catch (error) {
                console.error('Failed to load form data:', error);
                this.formData = {};
            }
        }
    }
    
    /**
     * 폼 필드 초기화
     */
    initializeFormFields() {
        // 전화번호 자동 포맷팅
        const phoneInput = document.getElementById('phone');
        if (phoneInput) {
            phoneInput.addEventListener('input', (e) => {
                this.formatPhoneNumber(e.target);
            });
        }
        
        // 나이 입력 제한
        const ageInput = document.getElementById('age');
        if (ageInput) {
            ageInput.addEventListener('input', (e) => {
                this.validateAgeInput(e.target);
            });
        }
        
        // 문자 수 카운터
        const messageTextarea = document.getElementById('message');
        if (messageTextarea) {
            messageTextarea.addEventListener('input', (e) => {
                this.updateCharacterCount(e.target);
            });
        }
        
        // 상담 시간 슬롯 생성
        this.generateTimeSlots();
        
        // 보험 유형 옵션 생성
        this.generateInsuranceTypeOptions();
    }
    
    /**
     * 폼 필드 채우기
     */
    populateFormFields() {
        Object.keys(this.formData).forEach(fieldName => {
            const field = document.getElementById(fieldName);
            if (field) {
                field.value = this.formData[fieldName];
                this.validateField(field);
            }
        });
        
        this.updateFormProgress();
    }
    
    /**
     * 폼 제출 처리
     */
    async handleFormSubmit() {
        if (this.isSubmitting) return;
        
        // 전체 폼 유효성 검사
        if (!this.validateForm()) {
            this.showError('입력 정보를 확인해주세요.');
            return;
        }
        
        this.isSubmitting = true;
        this.showLoading();
        
        try {
            const formData = this.collectFormData();
            const result = await this.submitFormData(formData);
            
            if (result.success) {
                this.showSuccess('상담 신청이 완료되었습니다. 빠른 시일 내에 연락드리겠습니다.');
                this.clearFormData();
                this.resetForm();
            } else {
                this.showError(result.message || '상담 신청에 실패했습니다.');
            }
        } catch (error) {
            console.error('Form submission error:', error);
            this.showError('서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.');
        } finally {
            this.isSubmitting = false;
            this.hideLoading();
        }
    }
    
    /**
     * 폼 데이터 수집
     */
    collectFormData() {
        const form = document.getElementById('consultation-form');
        const formData = new FormData(form);
        const data = {};
        
        for (let [key, value] of formData.entries()) {
            data[key] = value;
        }
        
        // 추가 정보
        data.submittedAt = new Date().toISOString();
        data.userAgent = navigator.userAgent;
        data.referrer = document.referrer;
        
        return data;
    }
    
    /**
     * 폼 데이터 제출
     */
    async submitFormData(data) {
        // 실제 API 호출 대신 시뮬레이션
        return new Promise((resolve) => {
            setTimeout(() => {
                // 성공 확률 90%
                const success = Math.random() > 0.1;
                resolve({
                    success,
                    message: success ? '상담 신청이 완료되었습니다.' : '서버 오류가 발생했습니다.'
                });
            }, 2000);
        });
    }
    
    /**
     * 필드 유효성 검사
     */
    validateField(field) {
        const fieldName = field.name || field.id;
        const value = field.value.trim();
        const rules = this.validationRules[fieldName];
        
        if (!rules) return true;
        
        let isValid = true;
        let errorMessage = '';
        
        // 필수 필드 검사
        if (rules.required && !value) {
            isValid = false;
            errorMessage = '필수 입력 항목입니다.';
        }
        
        // 최소 길이 검사
        if (isValid && rules.minLength && value.length < rules.minLength) {
            isValid = false;
            errorMessage = `최소 ${rules.minLength}자 이상 입력해주세요.`;
        }
        
        // 최대 길이 검사
        if (isValid && rules.maxLength && value.length > rules.maxLength) {
            isValid = false;
            errorMessage = `최대 ${rules.maxLength}자까지 입력 가능합니다.`;
        }
        
        // 패턴 검사
        if (isValid && rules.pattern && !rules.pattern.test(value)) {
            isValid = false;
            errorMessage = this.getPatternErrorMessage(fieldName);
        }
        
        // 숫자 범위 검사
        if (isValid && rules.min !== undefined && rules.max !== undefined) {
            const numValue = parseInt(value);
            if (numValue < rules.min || numValue > rules.max) {
                isValid = false;
                errorMessage = `${rules.min}세부터 ${rules.max}세까지 입력 가능합니다.`;
            }
        }
        
        this.showFieldValidation(field, isValid, errorMessage);
        return isValid;
    }
    
    /**
     * 전체 폼 유효성 검사
     */
    validateForm() {
        const fields = document.querySelectorAll('.form-input, .form-select, .form-textarea');
        let isValid = true;
        
        fields.forEach(field => {
            if (!this.validateField(field)) {
                isValid = false;
            }
        });
        
        return isValid;
    }
    
    /**
     * 필드 유효성 검사 결과 표시
     */
    showFieldValidation(field, isValid, errorMessage) {
        const errorElement = field.parentNode.querySelector('.field-error');
        
        if (errorElement) {
            errorElement.remove();
        }
        
        field.classList.remove('valid', 'invalid');
        
        if (field.value.trim()) {
            field.classList.add(isValid ? 'valid' : 'invalid');
            
            if (!isValid && errorMessage) {
                const error = document.createElement('div');
                error.className = 'field-error';
                error.textContent = errorMessage;
                field.parentNode.appendChild(error);
            }
        }
    }
    
    /**
     * 패턴 에러 메시지 반환
     */
    getPatternErrorMessage(fieldName) {
        const messages = {
            name: '한글 또는 영문으로 입력해주세요.',
            phone: '올바른 전화번호 형식으로 입력해주세요. (예: 010-1234-5678)',
            email: '올바른 이메일 형식으로 입력해주세요.'
        };
        return messages[fieldName] || '올바른 형식으로 입력해주세요.';
    }
    
    /**
     * 전화번호 포맷팅
     */
    formatPhoneNumber(input) {
        let value = input.value.replace(/[^0-9]/g, '');
        
        if (value.length <= 3) {
            value = value;
        } else if (value.length <= 7) {
            value = value.slice(0, 3) + '-' + value.slice(3);
        } else {
            value = value.slice(0, 3) + '-' + value.slice(3, 7) + '-' + value.slice(7, 11);
        }
        
        input.value = value;
    }
    
    /**
     * 나이 입력 검증
     */
    validateAgeInput(input) {
        let value = input.value.replace(/[^0-9]/g, '');
        const age = parseInt(value);
        
        if (age < 18) {
            value = '18';
        } else if (age > 80) {
            value = '80';
        }
        
        input.value = value;
    }
    
    /**
     * 문자 수 카운터 업데이트
     */
    updateCharacterCount(textarea) {
        const counter = textarea.parentNode.querySelector('.character-count');
        if (counter) {
            const current = textarea.value.length;
            const max = this.validationRules.message.maxLength;
            counter.textContent = `${current}/${max}`;
            
            if (current > max * 0.8) {
                counter.classList.add('warning');
            } else {
                counter.classList.remove('warning');
            }
        }
    }
    
    /**
     * 상담 시간 슬롯 생성
     */
    generateTimeSlots() {
        const container = document.getElementById('time-slots');
        if (!container) return;
        
        const timeSlots = [
            '09:00-10:00', '10:00-11:00', '11:00-12:00',
            '13:00-14:00', '14:00-15:00', '15:00-16:00',
            '16:00-17:00', '17:00-18:00'
        ];
        
        container.innerHTML = timeSlots.map(time => `
            <div class="time-slot" data-time="${time}">
                <span class="time-text">${time}</span>
            </div>
        `).join('');
    }
    
    /**
     * 시간 슬롯 선택
     */
    selectTimeSlot(slot) {
        // 기존 선택 해제
        document.querySelectorAll('.time-slot').forEach(s => {
            s.classList.remove('selected');
        });
        
        // 새 선택
        slot.classList.add('selected');
        
        // 숨겨진 입력 필드 업데이트
        const hiddenInput = document.getElementById('preferredTime');
        if (hiddenInput) {
            hiddenInput.value = slot.dataset.time;
        }
        
        this.saveFormData();
    }
    
    /**
     * 보험 유형 옵션 생성
     */
    generateInsuranceTypeOptions() {
        const container = document.getElementById('insurance-types');
        if (!container) return;
        
        const types = [
            { id: 'life', name: '생명보험', icon: '💝' },
            { id: 'health', name: '건강보험', icon: '🏥' },
            { id: 'auto', name: '자동차보험', icon: '🚗' },
            { id: 'property', name: '주택보험', icon: '🏠' },
            { id: 'travel', name: '여행보험', icon: '✈️' }
        ];
        
        container.innerHTML = types.map(type => `
            <div class="insurance-type-option" data-type="${type.id}">
                <span class="type-icon">${type.icon}</span>
                <span class="type-name">${type.name}</span>
            </div>
        `).join('');
    }
    
    /**
     * 보험 유형 선택
     */
    selectInsuranceType(option) {
        // 기존 선택 해제
        document.querySelectorAll('.insurance-type-option').forEach(o => {
            o.classList.remove('selected');
        });
        
        // 새 선택
        option.classList.add('selected');
        
        // 숨겨진 입력 필드 업데이트
        const hiddenInput = document.getElementById('insuranceType');
        if (hiddenInput) {
            hiddenInput.value = option.dataset.type;
        }
        
        this.saveFormData();
    }
    
    /**
     * 폼 데이터 저장
     */
    saveFormData() {
        const form = document.getElementById('consultation-form');
        if (!form) return;
        
        const formData = new FormData(form);
        this.formData = {};
        
        for (let [key, value] of formData.entries()) {
            this.formData[key] = value;
        }
        
        localStorage.setItem('consultationFormData', JSON.stringify(this.formData));
    }
    
    /**
     * 폼 데이터 삭제
     */
    clearFormData() {
        localStorage.removeItem('consultationFormData');
        this.formData = {};
    }
    
    /**
     * 폼 진행률 업데이트
     */
    updateFormProgress() {
        const progressBar = document.getElementById('form-progress');
        if (!progressBar) return;
        
        const requiredFields = Object.keys(this.validationRules).filter(field => 
            this.validationRules[field].required
        );
        
        const completedFields = requiredFields.filter(field => {
            const fieldElement = document.getElementById(field);
            return fieldElement && fieldElement.value.trim() && this.validateField(fieldElement);
        });
        
        const progress = (completedFields.length / requiredFields.length) * 100;
        progressBar.style.width = `${progress}%`;
        progressBar.setAttribute('aria-valuenow', progress);
    }
    
    /**
     * 폼 초기화
     */
    resetForm() {
        const form = document.getElementById('consultation-form');
        if (form) {
            form.reset();
        }
        
        // 선택된 옵션들 초기화
        document.querySelectorAll('.time-slot, .insurance-type-option').forEach(item => {
            item.classList.remove('selected');
        });
        
        // 유효성 검사 상태 초기화
        document.querySelectorAll('.form-input, .form-select, .form-textarea').forEach(field => {
            field.classList.remove('valid', 'invalid');
        });
        
        // 에러 메시지 제거
        document.querySelectorAll('.field-error').forEach(error => {
            error.remove();
        });
        
        // 진행률 초기화
        this.updateFormProgress();
        
        this.showToast('폼이 초기화되었습니다.');
    }
    
    /**
     * 로딩 표시
     */
    showLoading() {
        const submitBtn = document.querySelector('button[type="submit"]');
        if (submitBtn) {
            submitBtn.disabled = true;
            submitBtn.innerHTML = '<span class="spinner"></span> 제출 중...';
        }
    }
    
    /**
     * 로딩 숨기기
     */
    hideLoading() {
        const submitBtn = document.querySelector('button[type="submit"]');
        if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.innerHTML = '상담 신청';
        }
    }
    
    /**
     * 성공 메시지 표시
     */
    showSuccess(message) {
        this.showMessage(message, 'success');
    }
    
    /**
     * 에러 메시지 표시
     */
    showError(message) {
        this.showMessage(message, 'error');
    }
    
    /**
     * 메시지 표시
     */
    showMessage(message, type) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `form-message ${type}`;
        messageDiv.textContent = message;
        
        const form = document.getElementById('consultation-form');
        if (form) {
            form.parentNode.insertBefore(messageDiv, form);
            
            setTimeout(() => {
                messageDiv.remove();
            }, 5000);
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
}

// 전역 인스턴스 생성
window.formsManager = new FormsManager(); 