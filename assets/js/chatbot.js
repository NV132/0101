/**
 * Chatbot Module
 * 챗봇 기능을 담당하는 모듈
 */

class Chatbot {
    constructor() {
        this.isInitialized = false;
        this.isTyping = false;
        this.messageQueue = [];
        this.typingTimeout = null;
        this.autoResponseDelay = 1000; // 1초
        
        // 챗봇 응답 패턴
        this.responsePatterns = {
            greetings: ['안녕하세요', '안녕', 'hi', 'hello', '반갑습니다'],
            insurance: ['보험', '보험상품', '보험가입', '보험료', '보장'],
            life: ['생명보험', '사망보험', '종신보험', '정기보험', '연금보험'],
            health: ['건강보험', '실비보험', '암보험', '중증질환', '상해보험'],
            auto: ['자동차보험', '교통사고', '차량보험', '운전자보험'],
            property: ['재산보험', '화재보험', '주택보험', '가재도구보험'],
            consultation: ['상담', '상담예약', '상담신청', '전문가', '설계사'],
            faq: ['자주묻는질문', 'faq', '질문', '궁금한점', '문의'],
            pricing: ['보험료', '가격', '비용', '월보험료', '연보험료'],
            coverage: ['보장', '보장내용', '보장범위', '보장금액', '면책사유'],
            contact: ['연락처', '전화번호', '이메일', '주소', '위치'],
            hours: ['영업시간', '운영시간', '상담시간', '점심시간', '휴무일']
        };
        
        this.init();
    }
    
    /**
     * 챗봇 초기화
     */
    init() {
        if (this.isInitialized) return;
        
        this.bindEvents();
        this.loadWelcomeMessage();
        this.isInitialized = true;
        
        console.log('Chatbot initialized');
    }
    
    /**
     * 이벤트 바인딩
     */
    bindEvents() {
        // 챗봇 토글 버튼
        const chatbotToggle = document.getElementById('chatbot-toggle');
        if (chatbotToggle) {
            chatbotToggle.addEventListener('click', () => {
                this.toggleChatbot();
            });
        }
        
        // 챗봇 닫기 버튼
        const chatbotClose = document.getElementById('chatbot-close');
        if (chatbotClose) {
            chatbotClose.addEventListener('click', () => {
                this.closeChatbot();
            });
        }
        
        // 메시지 전송 버튼
        const chatbotSend = document.getElementById('chatbot-send');
        if (chatbotSend) {
            chatbotSend.addEventListener('click', () => {
                this.sendMessage();
            });
        }
        
        // 엔터키로 메시지 전송
        const chatbotInput = document.getElementById('chatbot-input');
        if (chatbotInput) {
            chatbotInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    this.sendMessage();
                }
            });
        }
        
        // 챗봇 컨테이너 클릭 이벤트 (최소화/복원)
        const chatbotContainer = document.getElementById('chatbot-container');
        if (chatbotContainer) {
            chatbotContainer.addEventListener('click', (e) => {
                if (e.target.closest('.chatbot-header') && !e.target.closest('.chatbot-close')) {
                    this.toggleMinimize();
                }
            });
        }
    }
    
    /**
     * 챗봇 토글
     */
    toggleChatbot() {
        const container = document.getElementById('chatbot-container');
        if (!container) return;
        
        if (container.classList.contains('active')) {
            this.closeChatbot();
        } else {
            this.openChatbot();
        }
    }
    
    /**
     * 챗봇 열기
     */
    openChatbot() {
        const container = document.getElementById('chatbot-container');
        const toggle = document.getElementById('chatbot-toggle');
        
        if (container) {
            container.classList.add('active');
            container.classList.remove('minimized');
        }
        
        if (toggle) {
            toggle.style.display = 'none';
        }
        
        // 포커스 이동
        const input = document.getElementById('chatbot-input');
        if (input) {
            setTimeout(() => {
                input.focus();
            }, 300);
        }
        
        // 애니메이션 효과
        this.addAnimationClass(container, 'animate-in');
    }
    
    /**
     * 챗봇 닫기
     */
    closeChatbot() {
        const container = document.getElementById('chatbot-container');
        const toggle = document.getElementById('chatbot-toggle');
        
        if (container) {
            container.classList.remove('active');
        }
        
        if (toggle) {
            toggle.style.display = 'flex';
        }
        
        // 애니메이션 효과
        this.addAnimationClass(container, 'animate-out');
    }
    
    /**
     * 챗봇 최소화/복원
     */
    toggleMinimize() {
        const container = document.getElementById('chatbot-container');
        if (!container) return;
        
        if (container.classList.contains('minimized')) {
            container.classList.remove('minimized');
        } else {
            container.classList.add('minimized');
        }
    }
    
    /**
     * 메시지 전송
     */
    sendMessage() {
        const input = document.getElementById('chatbot-input');
        if (!input) return;
        
        const message = input.value.trim();
        if (!message) return;
        
        // 사용자 메시지 추가
        this.addUserMessage(message);
        
        // 입력창 초기화
        input.value = '';
        
        // 챗봇 응답 생성
        this.generateResponse(message);
    }
    
    /**
     * 사용자 메시지 추가
     */
    addUserMessage(text) {
        const messagesContainer = document.getElementById('chatbot-messages');
        if (!messagesContainer) return;
        
        const messageElement = this.createMessageElement(text, 'user');
        messagesContainer.appendChild(messageElement);
        
        // 스크롤을 맨 아래로
        this.scrollToBottom();
        
        // 애니메이션 효과
        this.addAnimationClass(messageElement, 'animate-fade-in-right');
    }
    
    /**
     * 챗봇 메시지 추가
     */
    addBotMessage(text, type = 'text') {
        const messagesContainer = document.getElementById('chatbot-messages');
        if (!messagesContainer) return;
        
        const messageElement = this.createMessageElement(text, 'bot', type);
        messagesContainer.appendChild(messageElement);
        
        // 스크롤을 맨 아래로
        this.scrollToBottom();
        
        // 애니메이션 효과
        this.addAnimationClass(messageElement, 'animate-fade-in-left');
    }
    
    /**
     * 메시지 요소 생성
     */
    createMessageElement(text, sender, type = 'text') {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${sender}-message`;
        
        const contentDiv = document.createElement('div');
        contentDiv.className = 'message-content';
        
        if (type === 'text') {
            contentDiv.textContent = text;
        } else if (type === 'html') {
            contentDiv.innerHTML = text;
        }
        
        const timeDiv = document.createElement('div');
        timeDiv.className = 'message-time';
        timeDiv.textContent = this.getCurrentTime();
        
        messageDiv.appendChild(contentDiv);
        messageDiv.appendChild(timeDiv);
        
        return messageDiv;
    }
    
    /**
     * 현재 시간 포맷
     */
    getCurrentTime() {
        const now = new Date();
        const hours = now.getHours().toString().padStart(2, '0');
        const minutes = now.getMinutes().toString().padStart(2, '0');
        return `${hours}:${minutes}`;
    }
    
    /**
     * 타이핑 표시기 표시
     */
    showTypingIndicator() {
        const messagesContainer = document.getElementById('chatbot-messages');
        if (!messagesContainer) return;
        
        const typingDiv = document.createElement('div');
        typingDiv.className = 'typing-indicator';
        typingDiv.innerHTML = `
            <div class="typing-dot"></div>
            <div class="typing-dot"></div>
            <div class="typing-dot"></div>
        `;
        
        messagesContainer.appendChild(typingDiv);
        this.scrollToBottom();
        
        this.isTyping = true;
    }
    
    /**
     * 타이핑 표시기 숨기기
     */
    hideTypingIndicator() {
        const typingIndicator = document.querySelector('.typing-indicator');
        if (typingIndicator) {
            typingIndicator.remove();
        }
        
        this.isTyping = false;
    }
    
    /**
     * 챗봇 응답 생성
     */
    generateResponse(userMessage) {
        // 타이핑 표시기 표시
        this.showTypingIndicator();
        
        // 응답 지연 (자연스러운 느낌을 위해)
        setTimeout(() => {
            this.hideTypingIndicator();
            
            const response = this.getResponse(userMessage);
            this.addBotMessage(response);
            
            // 추가 제안 메시지 표시
            this.showSuggestions(userMessage);
        }, this.autoResponseDelay);
    }
    
    /**
     * 사용자 메시지에 따른 응답 생성
     */
    getResponse(userMessage) {
        const message = userMessage.toLowerCase();
        
        // 인사말
        if (this.matchesPattern(message, this.responsePatterns.greetings)) {
            return this.getGreetingResponse();
        }
        
        // 보험 일반
        if (this.matchesPattern(message, this.responsePatterns.insurance)) {
            return this.getInsuranceResponse();
        }
        
        // 생명보험
        if (this.matchesPattern(message, this.responsePatterns.life)) {
            return this.getLifeInsuranceResponse();
        }
        
        // 건강보험
        if (this.matchesPattern(message, this.responsePatterns.health)) {
            return this.getHealthInsuranceResponse();
        }
        
        // 자동차보험
        if (this.matchesPattern(message, this.responsePatterns.auto)) {
            return this.getAutoInsuranceResponse();
        }
        
        // 재산보험
        if (this.matchesPattern(message, this.responsePatterns.property)) {
            return this.getPropertyInsuranceResponse();
        }
        
        // 상담
        if (this.matchesPattern(message, this.responsePatterns.consultation)) {
            return this.getConsultationResponse();
        }
        
        // FAQ
        if (this.matchesPattern(message, this.responsePatterns.faq)) {
            return this.getFAQResponse();
        }
        
        // 보험료
        if (this.matchesPattern(message, this.responsePatterns.pricing)) {
            return this.getPricingResponse();
        }
        
        // 보장
        if (this.matchesPattern(message, this.responsePatterns.coverage)) {
            return this.getCoverageResponse();
        }
        
        // 연락처
        if (this.matchesPattern(message, this.responsePatterns.contact)) {
            return this.getContactResponse();
        }
        
        // 영업시간
        if (this.matchesPattern(message, this.responsePatterns.hours)) {
            return this.getHoursResponse();
        }
        
        // 기본 응답
        return this.getDefaultResponse();
    }
    
    /**
     * 패턴 매칭
     */
    matchesPattern(message, patterns) {
        return patterns.some(pattern => message.includes(pattern));
    }
    
    /**
     * 인사말 응답
     */
    getGreetingResponse() {
        const responses = [
            '안녕하세요! 저는 보험 상담 도우미입니다. 어떤 도움이 필요하신가요?',
            '반갑습니다! 보험에 대해 궁금한 점이 있으시면 언제든 말씀해 주세요.',
            '안녕하세요! 오늘도 좋은 하루 되세요. 보험 상담이 필요하시면 언제든 연락주세요!'
        ];
        
        return responses[Math.floor(Math.random() * responses.length)];
    }
    
    /**
     * 보험 일반 응답
     */
    getInsuranceResponse() {
        return `보험에 대해 궁금하신 점이 있으시군요! 저희는 다음과 같은 보험 상품을 제공합니다:

• 생명보험 (종신보험, 정기보험, 연금보험)
• 건강보험 (실비보험, 암보험, 중증질환보험)
• 자동차보험 (종합보험, 기본보험, 운전자보험)
• 재산보험 (주택보험, 화재보험, 가재도구보험)

어떤 보험에 대해 더 자세히 알고 싶으신가요?`;
    }
    
    /**
     * 생명보험 응답
     */
    getLifeInsuranceResponse() {
        return `생명보험에 대해 설명드리겠습니다!

생명보험은 가족의 경제적 안정을 위한 가장 기본적인 보험입니다.

주요 상품:
• 종신보험: 평생 보장, 사망 시 보험금 지급
• 정기보험: 일정 기간 보장, 저렴한 보험료
• 연금보험: 노후 준비, 정기적인 연금 지급

가입 연령과 보장 금액에 따라 보험료가 달라집니다. 
상담 예약을 통해 맞춤형 상품을 추천받으실 수 있습니다.`;
    }
    
    /**
     * 건강보험 응답
     */
    getHealthInsuranceResponse() {
        return `건강보험에 대해 설명드리겠습니다!

건강보험은 질병이나 상해로 인한 의료비 부담을 줄여주는 보험입니다.

주요 상품:
• 실비보험: 실제 의료비를 기준으로 보장
• 암보험: 암 진단 시 일시금 및 치료비 보장
• 중증질환보험: 3대 중증질환 보장
• 상해보험: 일상생활 중 상해 보장

건강상태와 나이에 따라 가입 조건이 달라질 수 있습니다. 
상담을 통해 적합한 상품을 찾아보시겠어요?`;
    }
    
    /**
     * 자동차보험 응답
     */
    getAutoInsuranceResponse() {
        return `자동차보험에 대해 설명드리겠습니다!

자동차보험은 교통사고로 인한 손해를 보장하는 법적 의무보험입니다.

주요 상품:
• 종합자동차보험: 모든 위험을 종합적으로 보장
• 기본자동차보험: 법적 의무사항만 보장
• 자기차량손해보험: 내 차량 손해 보장
• 운전자보험: 운전자 본인 상해 보장

차량 종류, 운전 경력, 사고 이력에 따라 보험료가 달라집니다. 
무사고 할인 등 다양한 할인 혜택도 있습니다.`;
    }
    
    /**
     * 재산보험 응답
     */
    getPropertyInsuranceResponse() {
        return `재산보험에 대해 설명드리겠습니다!

재산보험은 주택, 건물, 가재도구 등 재산에 대한 위험을 보장합니다.

주요 상품:
• 주택종합보험: 주택 관련 모든 위험 보장
• 화재보험: 화재로 인한 손해 보장
• 가재도구보험: 가정용품 손해 보장
• 상가보험: 상업용 건물 보장

보험가액을 정확히 산정하는 것이 중요합니다. 
전문가와 상담하여 적절한 보장을 설계해보세요.`;
    }
    
    /**
     * 상담 응답
     */
    getConsultationResponse() {
        return `상담 예약에 대해 안내드리겠습니다!

전문 설계사와 1:1 맞춤 상담을 통해 최적의 보험을 찾을 수 있습니다.

상담 방법:
• 전화 상담: 1588-0000
• 온라인 상담: 상담 예약 페이지에서 신청
• 방문 상담: 전국 지점에서 상담 가능

상담은 무료이며, 부담 없이 문의하세요!
상담 예약 페이지로 이동하시겠어요?`;
    }
    
    /**
     * FAQ 응답
     */
    getFAQResponse() {
        return `자주 묻는 질문에 대한 답변을 확인하실 수 있습니다!

FAQ 페이지에서 다음 내용을 찾아보세요:
• 보험 가입 방법
• 보험금 청구 절차
• 보험료 납부 방법
• 보험 갱신 안내
• 면책사유

FAQ 페이지로 이동하시겠어요?
또는 특정 질문이 있으시면 바로 말씀해 주세요!`;
    }
    
    /**
     * 보험료 응답
     */
    getPricingResponse() {
        return `보험료에 대해 설명드리겠습니다!

보험료는 여러 요인에 따라 달라집니다:

생명보험: 나이, 성별, 보장금액, 보장기간
건강보험: 나이, 건강상태, 보장내용
자동차보험: 차량종류, 운전경력, 사고이력
재산보험: 보험가액, 건물구조, 위치

정확한 보험료는 개인별 상황에 따라 다르므로,
상담을 통해 맞춤형 견적을 받아보시는 것을 권장합니다.`;
    }
    
    /**
     * 보장 응답
     */
    getCoverageResponse() {
        return `보장 내용에 대해 설명드리겠습니다!

보장은 보험 종류에 따라 다릅니다:

생명보험: 사망보험금, 생존보험금, 연금
건강보험: 의료비, 입원일당, 진단일시금
자동차보험: 대인배상, 대물배상, 자기차량손해
재산보험: 화재손해, 도난손해, 자연재해

각 상품의 세부 보장 내용은 상품별로 다르므로,
관심 있는 상품을 말씀해 주시면 자세히 설명드리겠습니다.`;
    }
    
    /**
     * 연락처 응답
     */
    getContactResponse() {
        return `연락처 정보를 안내드리겠습니다!

고객센터: 1588-0000
이메일: customer@insurance.com
주소: 서울특별시 강남구 테헤란로 123

영업시간: 평일 09:00-18:00
점심시간: 12:00-13:00
휴무일: 토요일, 일요일, 공휴일

긴급상황 시 24시간 긴급연락망도 운영하고 있습니다.
언제든 편하게 연락주세요!`;
    }
    
    /**
     * 영업시간 응답
     */
    getHoursResponse() {
        return `영업시간을 안내드리겠습니다!

평일: 09:00 - 18:00
점심시간: 12:00 - 13:00
토요일: 09:00 - 13:00
일요일: 휴무
공휴일: 휴무

온라인 상담은 24시간 가능합니다!
방문 상담을 원하시면 사전 예약을 권장합니다.`;
    }
    
    /**
     * 기본 응답
     */
    getDefaultResponse() {
        const responses = [
            '죄송합니다. 질문을 정확히 이해하지 못했습니다. 다른 방식으로 질문해 주시겠어요?',
            '궁금한 점이 있으시면 "보험", "상담", "FAQ" 등으로 질문해 주세요.',
            '보험에 대한 일반적인 질문이나 상담 예약에 대해 도움을 드릴 수 있습니다.',
            '더 구체적으로 질문해 주시면 정확한 답변을 드릴 수 있습니다.'
        ];
        
        return responses[Math.floor(Math.random() * responses.length)];
    }
    
    /**
     * 제안 메시지 표시
     */
    showSuggestions(userMessage) {
        const suggestions = this.getSuggestions(userMessage);
        if (suggestions.length === 0) return;
        
        setTimeout(() => {
            const suggestionHTML = `
                <div class="suggestion-chips">
                    ${suggestions.map(suggestion => 
                        `<button class="suggestion-chip" onclick="chatbot.handleSuggestionClick('${suggestion}')">${suggestion}</button>`
                    ).join('')}
                </div>
            `;
            
            this.addBotMessage(suggestionHTML, 'html');
        }, 500);
    }
    
    /**
     * 제안 메시지 생성
     */
    getSuggestions(userMessage) {
        const message = userMessage.toLowerCase();
        
        if (this.matchesPattern(message, this.responsePatterns.greetings)) {
            return ['보험 상품 안내', '상담 예약', 'FAQ 보기'];
        }
        
        if (this.matchesPattern(message, this.responsePatterns.insurance)) {
            return ['생명보험', '건강보험', '자동차보험', '재산보험'];
        }
        
        if (this.matchesPattern(message, this.responsePatterns.life)) {
            return ['종신보험', '정기보험', '연금보험', '상담 예약'];
        }
        
        if (this.matchesPattern(message, this.responsePatterns.health)) {
            return ['실비보험', '암보험', '중증질환보험', '상담 예약'];
        }
        
        if (this.matchesPattern(message, this.responsePatterns.auto)) {
            return ['종합자동차보험', '기본자동차보험', '운전자보험', '상담 예약'];
        }
        
        if (this.matchesPattern(message, this.responsePatterns.property)) {
            return ['주택종합보험', '화재보험', '가재도구보험', '상담 예약'];
        }
        
        return ['상담 예약', 'FAQ 보기', '연락처 확인'];
    }
    
    /**
     * 제안 클릭 처리
     */
    handleSuggestionClick(suggestion) {
        this.addUserMessage(suggestion);
        this.generateResponse(suggestion);
    }
    
    /**
     * 환영 메시지 로드
     */
    loadWelcomeMessage() {
        const welcomeMessage = `안녕하세요! 저는 보험 상담 도우미입니다. 

어떤 도움이 필요하신가요?
• 보험 상품 안내
• 상담 예약
• FAQ 보기
• 연락처 확인

언제든 편하게 질문해 주세요! 😊`;
        
        setTimeout(() => {
            this.addBotMessage(welcomeMessage);
        }, 1000);
    }
    
    /**
     * 스크롤을 맨 아래로
     */
    scrollToBottom() {
        const messagesContainer = document.getElementById('chatbot-messages');
        if (messagesContainer) {
            messagesContainer.scrollTop = messagesContainer.scrollHeight;
        }
    }
    
    /**
     * 애니메이션 클래스 추가
     */
    addAnimationClass(element, className) {
        if (!element) return;
        
        element.classList.add(className);
        
        setTimeout(() => {
            element.classList.remove(className);
        }, 600);
    }
    
    /**
     * 챗봇 상태 업데이트
     */
    updateChatbotState(isOpen, isMinimized = false) {
        const container = document.getElementById('chatbot-container');
        const toggle = document.getElementById('chatbot-toggle');
        
        if (container) {
            if (isOpen) {
                container.classList.add('active');
                if (isMinimized) {
                    container.classList.add('minimized');
                } else {
                    container.classList.remove('minimized');
                }
            } else {
                container.classList.remove('active');
            }
        }
        
        if (toggle) {
            toggle.style.display = isOpen ? 'none' : 'flex';
        }
    }
    
    /**
     * 챗봇 리셋
     */
    reset() {
        const messagesContainer = document.getElementById('chatbot-messages');
        if (messagesContainer) {
            messagesContainer.innerHTML = '';
        }
        
        this.loadWelcomeMessage();
    }
    
    /**
     * 챗봇 메시지 내보내기
     */
    exportMessages() {
        const messages = [];
        const messageElements = document.querySelectorAll('.message');
        
        messageElements.forEach(element => {
            const content = element.querySelector('.message-content');
            const time = element.querySelector('.message-time');
            const isUser = element.classList.contains('user-message');
            
            if (content && time) {
                messages.push({
                    text: content.textContent,
                    time: time.textContent,
                    sender: isUser ? 'user' : 'bot'
                });
            }
        });
        
        return messages;
    }
    
    /**
     * 챗봇 통계
     */
    getStats() {
        const messages = this.exportMessages();
        const userMessages = messages.filter(msg => msg.sender === 'user');
        const botMessages = messages.filter(msg => msg.sender === 'bot');
        
        return {
            totalMessages: messages.length,
            userMessages: userMessages.length,
            botMessages: botMessages.length,
            sessionDuration: this.getSessionDuration()
        };
    }
    
    /**
     * 세션 지속 시간
     */
    getSessionDuration() {
        // 세션 시작 시간을 저장하는 로직 필요
        return '00:00:00'; // 임시 반환값
    }
}

// 전역 챗봇 인스턴스 생성
const chatbot = new Chatbot();

// 전역 함수로 노출
window.chatbot = chatbot;

// DOM 로드 완료 후 초기화
document.addEventListener('DOMContentLoaded', () => {
    if (typeof chatbot !== 'undefined') {
        chatbot.init();
    }
});

// 페이지 언로드 시 정리
window.addEventListener('beforeunload', () => {
    if (chatbot.typingTimeout) {
        clearTimeout(chatbot.typingTimeout);
    }
});

export default chatbot; 