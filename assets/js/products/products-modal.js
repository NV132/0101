/**
 * Products Modal Module
 * 보험 상품 모달 및 계산기 기능을 담당하는 모듈
 */

class ProductsModal {
    constructor() {
        this.currentProduct = null;
        this.isModalOpen = false;
        this.calculatorData = null;
        
        this.init();
    }
    
    /**
     * 초기화
     */
    async init() {
        await this.loadCalculatorData();
        this.bindModalEvents();
        console.log('ProductsModal initialized');
    }
    
    /**
     * 계산기 데이터 로드
     */
    async loadCalculatorData() {
        try {
            const response = await fetch('assets/js/data/calculator-rules.json');
            if (response.ok) {
                this.calculatorData = await response.json();
            }
        } catch (error) {
            console.error('Failed to load calculator data:', error);
        }
    }
    
    /**
     * 모달 이벤트 바인딩
     */
    bindModalEvents() {
        // 모달 닫기 이벤트
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('modal-overlay') || 
                e.target.classList.contains('modal-close')) {
                this.hideModal();
            }
        });
        
        // ESC 키로 모달 닫기
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.isModalOpen) {
                this.hideModal();
            }
        });
        
        // 모달 내부 클릭 시 이벤트 전파 방지
        document.addEventListener('click', (e) => {
            if (e.target.closest('.modal-content')) {
                e.stopPropagation();
            }
        });
    }
    
    /**
     * 상품 모달 표시
     */
    showModal(productId) {
        const product = window.productsCore.products.find(p => p.id === productId);
        if (!product) {
            console.error('Product not found:', productId);
            return;
        }
        
        this.currentProduct = product;
        this.isModalOpen = true;
        
        const modalHTML = this.getModalHTML(product);
        this.showModalOverlay(modalHTML);
        
        // 모달 애니메이션
        setTimeout(() => {
            const modal = document.querySelector('.modal-content');
            if (modal) {
                modal.classList.add('show');
            }
        }, 100);
        
        // 모달 내부 이벤트 바인딩
        this.bindModalInternalEvents();
    }
    
    /**
     * 모달 HTML 생성
     */
    getModalHTML(product) {
        const ratingStars = window.productsCore.getRatingStars(product.rating);
        const popularityBadge = window.productsCore.getPopularityBadge(product.popularity);
        
        return `
            <div class="modal-overlay">
                <div class="modal-content product-modal">
                    <button class="modal-close">&times;</button>
                    
                    <div class="modal-header">
                        <div class="product-image">
                            <img src="assets/images/products/${product.image}" alt="${product.name}">
                            ${popularityBadge}
                        </div>
                        <div class="product-info">
                            <h2 class="product-name">${product.name}</h2>
                            <p class="product-subtitle">${product.subtitle}</p>
                            <div class="product-rating">
                                ${ratingStars}
                                <span class="rating-text">${product.rating} (${product.reviewCount}개 리뷰)</span>
                            </div>
                        </div>
                    </div>
                    
                    <div class="modal-body">
                        <div class="product-details">
                            <div class="detail-section">
                                <h3>상품 설명</h3>
                                <p>${product.description}</p>
                            </div>
                            
                            <div class="detail-section">
                                <h3>주요 특징</h3>
                                <div class="features-grid">
                                    ${product.features.map(feature => 
                                        `<div class="feature-item">
                                            <span class="feature-icon">✓</span>
                                            <span class="feature-text">${feature}</span>
                                        </div>`
                                    ).join('')}
                                </div>
                            </div>
                            
                            <div class="detail-section">
                                <h3>보장 내용</h3>
                                <div class="coverage-list">
                                    ${product.coverage.map(item => 
                                        `<div class="coverage-item">
                                            <div class="coverage-name">${item.name}</div>
                                            <div class="coverage-amount">${this.formatAmount(item.amount)}</div>
                                        </div>`
                                    ).join('')}
                                </div>
                            </div>
                            
                            <div class="detail-section">
                                <h3>보험료 계산기</h3>
                                <div class="calculator-form">
                                    ${this.getCalculatorFormHTML()}
                                </div>
                                <div class="calculator-result" id="calculator-result" style="display: none;">
                                    <div class="result-summary">
                                        <h4>예상 보험료</h4>
                                        <div class="premium-amount" id="premium-amount">-</div>
                                    </div>
                                    <div class="result-details" id="result-details"></div>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <div class="modal-footer">
                        <div class="action-buttons">
                            <button class="btn btn-secondary" onclick="productsModal.addToCompare('${product.id}')">
                                비교하기
                            </button>
                            <button class="btn btn-secondary" onclick="productsModal.shareProduct('${product.id}')">
                                공유하기
                            </button>
                            <button class="btn btn-primary" onclick="productsModal.requestConsultation('${product.id}')">
                                상담 신청
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }
    
    /**
     * 계산기 폼 HTML 생성
     */
    getCalculatorFormHTML() {
        return `
            <div class="calculator-inputs">
                <div class="input-group">
                    <label for="age">나이</label>
                    <input type="number" id="age" min="1" max="100" value="30">
                </div>
                <div class="input-group">
                    <label for="gender">성별</label>
                    <select id="gender">
                        <option value="male">남성</option>
                        <option value="female">여성</option>
                    </select>
                </div>
                <div class="input-group">
                    <label for="health-status">건강 상태</label>
                    <select id="health-status">
                        <option value="excellent">매우 좋음</option>
                        <option value="good">좋음</option>
                        <option value="average">보통</option>
                        <option value="poor">나쁨</option>
                    </select>
                </div>
                <div class="input-group">
                    <label for="coverage-amount">보장 금액</label>
                    <select id="coverage-amount">
                        <option value="100000000">1억원</option>
                        <option value="200000000">2억원</option>
                        <option value="300000000">3억원</option>
                        <option value="500000000">5억원</option>
                        <option value="1000000000">10억원</option>
                    </select>
                </div>
                <button class="btn btn-primary" onclick="productsModal.calculatePremium()">
                    보험료 계산
                </button>
            </div>
        `;
    }
    
    /**
     * 모달 내부 이벤트 바인딩
     */
    bindModalInternalEvents() {
        // 계산기 입력값 변경 이벤트
        const inputs = document.querySelectorAll('.calculator-inputs input, .calculator-inputs select');
        inputs.forEach(input => {
            input.addEventListener('change', () => {
                this.hideCalculatorResult();
            });
        });
    }
    
    /**
     * 보험료 계산
     */
    calculatePremium() {
        if (!this.currentProduct || !this.calculatorData) {
            this.showToast('계산기 데이터를 불러올 수 없습니다.');
            return;
        }
        
        const age = parseInt(document.getElementById('age').value);
        const gender = document.getElementById('gender').value;
        const healthStatus = document.getElementById('health-status').value;
        const coverageAmount = parseInt(document.getElementById('coverage-amount').value);
        
        // 기본 보험료 계산
        let basePremium = this.currentProduct.monthlyPremium;
        
        // 나이 계수 적용
        const ageFactor = this.getAgeFactor(age);
        basePremium *= ageFactor;
        
        // 성별 계수 적용
        const genderFactor = gender === 'male' ? 1.2 : 1.0;
        basePremium *= genderFactor;
        
        // 건강 상태 계수 적용
        const healthFactor = this.getHealthFactor(healthStatus);
        basePremium *= healthFactor;
        
        // 보장 금액 계수 적용
        const coverageFactor = coverageAmount / 100000000; // 1억원 기준
        basePremium *= coverageFactor;
        
        // 최종 보험료 계산
        const finalPremium = Math.round(basePremium);
        
        this.showCalculatorResult(finalPremium, {
            age, gender, healthStatus, coverageAmount,
            factors: { ageFactor, genderFactor, healthFactor, coverageFactor }
        });
    }
    
    /**
     * 나이 계수 반환
     */
    getAgeFactor(age) {
        if (age < 20) return 0.8;
        if (age < 30) return 1.0;
        if (age < 40) return 1.2;
        if (age < 50) return 1.5;
        if (age < 60) return 2.0;
        return 3.0;
    }
    
    /**
     * 건강 상태 계수 반환
     */
    getHealthFactor(healthStatus) {
        const factors = {
            'excellent': 0.8,
            'good': 1.0,
            'average': 1.3,
            'poor': 2.0
        };
        return factors[healthStatus] || 1.0;
    }
    
    /**
     * 계산 결과 표시
     */
    showCalculatorResult(premium, details) {
        const resultContainer = document.getElementById('calculator-result');
        const premiumAmount = document.getElementById('premium-amount');
        const resultDetails = document.getElementById('result-details');
        
        if (resultContainer && premiumAmount && resultDetails) {
            premiumAmount.textContent = window.productsCore.formatPrice(premium);
            
            resultDetails.innerHTML = `
                <div class="detail-row">
                    <span>나이:</span>
                    <span>${details.age}세 (계수: ${details.factors.ageFactor.toFixed(2)})</span>
                </div>
                <div class="detail-row">
                    <span>성별:</span>
                    <span>${details.gender === 'male' ? '남성' : '여성'} (계수: ${details.factors.genderFactor.toFixed(2)})</span>
                </div>
                <div class="detail-row">
                    <span>건강상태:</span>
                    <span>${this.getHealthStatusText(details.healthStatus)} (계수: ${details.factors.healthFactor.toFixed(2)})</span>
                </div>
                <div class="detail-row">
                    <span>보장금액:</span>
                    <span>${window.productsCore.formatPrice(details.coverageAmount)} (계수: ${details.factors.coverageFactor.toFixed(2)})</span>
                </div>
            `;
            
            resultContainer.style.display = 'block';
            resultContainer.scrollIntoView({ behavior: 'smooth' });
        }
    }
    
    /**
     * 건강 상태 텍스트 반환
     */
    getHealthStatusText(status) {
        const texts = {
            'excellent': '매우 좋음',
            'good': '좋음',
            'average': '보통',
            'poor': '나쁨'
        };
        return texts[status] || '보통';
    }
    
    /**
     * 계산 결과 숨기기
     */
    hideCalculatorResult() {
        const resultContainer = document.getElementById('calculator-result');
        if (resultContainer) {
            resultContainer.style.display = 'none';
        }
    }
    
    /**
     * 모달 오버레이 표시
     */
    showModalOverlay(modalHTML) {
        // 기존 모달 제거
        const existingModal = document.querySelector('.modal-overlay');
        if (existingModal) {
            existingModal.remove();
        }
        
        // 새 모달 추가
        document.body.insertAdjacentHTML('beforeend', modalHTML);
        
        // 스크롤 방지
        document.body.style.overflow = 'hidden';
    }
    
    /**
     * 모달 숨기기
     */
    hideModal() {
        const modal = document.querySelector('.modal-overlay');
        if (modal) {
            const modalContent = modal.querySelector('.modal-content');
            if (modalContent) {
                modalContent.classList.remove('show');
            }
            
            setTimeout(() => {
                modal.remove();
                this.isModalOpen = false;
                this.currentProduct = null;
                
                // 스크롤 복원
                document.body.style.overflow = '';
            }, 300);
        }
    }
    
    /**
     * 비교하기에 추가
     */
    addToCompare(productId) {
        // 비교 기능 구현
        this.showToast('비교 목록에 추가되었습니다.');
    }
    
    /**
     * 상품 공유
     */
    shareProduct(productId) {
        if (navigator.share) {
            navigator.share({
                title: this.currentProduct.name,
                text: this.currentProduct.description,
                url: window.location.href + `?product=${productId}`
            });
        } else {
            // 클립보드에 복사
            const url = window.location.href + `?product=${productId}`;
            navigator.clipboard.writeText(url).then(() => {
                this.showToast('링크가 클립보드에 복사되었습니다.');
            });
        }
    }
    
    /**
     * 상담 신청
     */
    requestConsultation(productId) {
        this.hideModal();
        
        // 상담 페이지로 이동
        if (window.location.pathname.includes('products.html')) {
            window.location.href = 'consultation.html?product=' + productId;
        } else {
            // 현재 페이지에서 상담 폼 표시
            this.showConsultationForm(productId);
        }
    }
    
    /**
     * 상담 폼 표시
     */
    showConsultationForm(productId) {
        // 상담 폼 모달 표시 로직
        this.showToast('상담 신청 기능이 준비 중입니다.');
    }
    
    /**
     * 금액 포맷팅
     */
    formatAmount(amount) {
        if (amount >= 100000000) {
            return (amount / 100000000).toFixed(1) + '억원';
        } else if (amount >= 10000) {
            return (amount / 10000).toFixed(0) + '만원';
        } else {
            return window.productsCore.formatPrice(amount);
        }
    }
    
    /**
     * 토스트 메시지 표시
     */
    showToast(message) {
        if (window.productsCore && window.productsCore.showToast) {
            window.productsCore.showToast(message);
        } else {
            // 기본 토스트 구현
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
}

// 전역 인스턴스 생성
window.productsModal = new ProductsModal(); 