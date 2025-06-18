/**
 * Particles Animation System
 * 파티클 애니메이션 시스템
 */

// ===== PARTICLE CLASS =====

/**
 * 파티클 클래스
 */
class Particle {
    constructor(x, y, options = {}) {
        this.x = x;
        this.y = y;
        this.vx = options.vx || (Math.random() - 0.5) * 2;
        this.vy = options.vy || (Math.random() - 0.5) * 2;
        this.size = options.size || Math.random() * 3 + 1;
        this.color = options.color || '#007bff';
        this.opacity = options.opacity || Math.random() * 0.5 + 0.3;
        this.life = options.life || Math.random() * 100 + 50;
        this.maxLife = this.life;
        this.gravity = options.gravity || 0.01;
        this.friction = options.friction || 0.99;
        this.type = options.type || 'circle'; // 'circle', 'square', 'star'
        this.rotation = options.rotation || 0;
        this.rotationSpeed = options.rotationSpeed || (Math.random() - 0.5) * 0.1;
        this.pulse = options.pulse || false;
        this.pulseSpeed = options.pulseSpeed || 0.05;
        this.pulseSize = this.size;
    }
    
    /**
     * 파티클 업데이트
     */
    update() {
        // 위치 업데이트
        this.x += this.vx;
        this.y += this.vy;
        
        // 중력 적용
        this.vy += this.gravity;
        
        // 마찰 적용
        this.vx *= this.friction;
        this.vy *= this.friction;
        
        // 회전 업데이트
        this.rotation += this.rotationSpeed;
        
        // 펄스 효과
        if (this.pulse) {
            this.size = this.pulseSize + Math.sin(Date.now() * this.pulseSpeed) * 2;
        }
        
        // 수명 감소
        this.life--;
        this.opacity = (this.life / this.maxLife) * 0.5 + 0.3;
    }
    
    /**
     * 파티클 그리기
     * @param {CanvasRenderingContext2D} ctx - 캔버스 컨텍스트
     */
    draw(ctx) {
        ctx.save();
        ctx.globalAlpha = this.opacity;
        ctx.fillStyle = this.color;
        ctx.strokeStyle = this.color;
        
        ctx.translate(this.x, this.y);
        ctx.rotate(this.rotation);
        
        switch (this.type) {
            case 'circle':
                ctx.beginPath();
                ctx.arc(0, 0, this.size, 0, Math.PI * 2);
                ctx.fill();
                break;
                
            case 'square':
                ctx.fillRect(-this.size, -this.size, this.size * 2, this.size * 2);
                break;
                
            case 'star':
                this.drawStar(ctx, 0, 0, this.size, this.size * 0.5, 5);
                break;
                
            case 'triangle':
                this.drawTriangle(ctx, 0, 0, this.size);
                break;
                
            case 'line':
                ctx.lineWidth = this.size;
                ctx.beginPath();
                ctx.moveTo(-this.size * 2, 0);
                ctx.lineTo(this.size * 2, 0);
                ctx.stroke();
                break;
        }
        
        ctx.restore();
    }
    
    /**
     * 별 모양 그리기
     * @param {CanvasRenderingContext2D} ctx - 캔버스 컨텍스트
     * @param {number} cx - 중심 X
     * @param {number} cy - 중심 Y
     * @param {number} outerRadius - 외부 반지름
     * @param {number} innerRadius - 내부 반지름
     * @param {number} spikes - 뾰족한 부분 수
     */
    drawStar(ctx, cx, cy, outerRadius, innerRadius, spikes) {
        let rot = Math.PI / 2 * 3;
        let x = cx;
        let y = cy;
        const step = Math.PI / spikes;
        
        ctx.beginPath();
        ctx.moveTo(cx, cy - outerRadius);
        
        for (let i = 0; i < spikes; i++) {
            x = cx + Math.cos(rot) * outerRadius;
            y = cy + Math.sin(rot) * outerRadius;
            ctx.lineTo(x, y);
            rot += step;
            
            x = cx + Math.cos(rot) * innerRadius;
            y = cy + Math.sin(rot) * innerRadius;
            ctx.lineTo(x, y);
            rot += step;
        }
        
        ctx.lineTo(cx, cy - outerRadius);
        ctx.closePath();
        ctx.fill();
    }
    
    /**
     * 삼각형 그리기
     * @param {CanvasRenderingContext2D} ctx - 캔버스 컨텍스트
     * @param {number} x - 중심 X
     * @param {number} y - 중심 Y
     * @param {number} size - 크기
     */
    drawTriangle(ctx, x, y, size) {
        ctx.beginPath();
        ctx.moveTo(x, y - size);
        ctx.lineTo(x - size, y + size);
        ctx.lineTo(x + size, y + size);
        ctx.closePath();
        ctx.fill();
    }
    
    /**
     * 파티클이 화면 밖으로 나갔는지 확인
     * @param {number} width - 캔버스 너비
     * @param {number} height - 캔버스 높이
     * @returns {boolean} 화면 밖 여부
     */
    isOffScreen(width, height) {
        return this.x < -50 || this.x > width + 50 || 
               this.y < -50 || this.y > height + 50;
    }
    
    /**
     * 파티클이 수명이 다했는지 확인
     * @returns {boolean} 수명 종료 여부
     */
    isDead() {
        return this.life <= 0;
    }
}

// ===== PARTICLE SYSTEM CLASS =====

/**
 * 파티클 시스템 클래스
 */
class ParticleSystem {
    constructor(canvas, options = {}) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.particles = [];
        this.options = {
            maxParticles: options.maxParticles || 100,
            emissionRate: options.emissionRate || 2,
            emissionArea: options.emissionArea || 'center', // 'center', 'random', 'edges'
            particleTypes: options.particleTypes || ['circle'],
            colors: options.colors || ['#007bff', '#17a2b8', '#28a745', '#ffc107'],
            sizeRange: options.sizeRange || { min: 1, max: 4 },
            speedRange: options.speedRange || { min: 0.5, max: 2 },
            lifeRange: options.lifeRange || { min: 50, max: 150 },
            gravity: options.gravity || 0.01,
            friction: options.friction || 0.99,
            enableInteraction: options.enableInteraction || false,
            mouseRadius: options.mouseRadius || 100,
            repulsionForce: options.repulsionForce || 0.5,
            attractionForce: options.attractionForce || 0.3,
            ...options
        };
        
        this.mouse = { x: 0, y: 0, isActive: false };
        this.animationId = null;
        this.isRunning = false;
        
        this.init();
    }
    
    /**
     * 초기화
     */
    init() {
        this.resize();
        this.setupEventListeners();
        this.start();
    }
    
    /**
     * 캔버스 크기 조정
     */
    resize() {
        const rect = this.canvas.getBoundingClientRect();
        this.canvas.width = rect.width * window.devicePixelRatio;
        this.canvas.height = rect.height * window.devicePixelRatio;
        this.ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
        
        this.canvas.style.width = rect.width + 'px';
        this.canvas.style.height = rect.height + 'px';
    }
    
    /**
     * 이벤트 리스너 설정
     */
    setupEventListeners() {
        // 리사이즈 이벤트
        window.addEventListener('resize', () => {
            this.resize();
        });
        
        // 마우스 이벤트 (상호작용이 활성화된 경우)
        if (this.options.enableInteraction) {
            this.canvas.addEventListener('mousemove', (e) => {
                const rect = this.canvas.getBoundingClientRect();
                this.mouse.x = e.clientX - rect.left;
                this.mouse.y = e.clientY - rect.top;
                this.mouse.isActive = true;
            });
            
            this.canvas.addEventListener('mouseleave', () => {
                this.mouse.isActive = false;
            });
            
            this.canvas.addEventListener('click', (e) => {
                const rect = this.canvas.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;
                this.createExplosion(x, y, 10);
            });
        }
    }
    
    /**
     * 파티클 생성
     * @param {number} x - X 좌표
     * @param {number} y - Y 좌표
     * @param {Object} options - 파티클 옵션
     * @returns {Particle} 생성된 파티클
     */
    createParticle(x, y, options = {}) {
        const particleOptions = {
            vx: (Math.random() - 0.5) * this.options.speedRange.max * 2,
            vy: (Math.random() - 0.5) * this.options.speedRange.max * 2,
            size: Math.random() * (this.options.sizeRange.max - this.options.sizeRange.min) + this.options.sizeRange.min,
            color: this.options.colors[Math.floor(Math.random() * this.options.colors.length)],
            life: Math.random() * (this.options.lifeRange.max - this.options.lifeRange.min) + this.options.lifeRange.min,
            gravity: this.options.gravity,
            friction: this.options.friction,
            type: this.options.particleTypes[Math.floor(Math.random() * this.options.particleTypes.length)],
            pulse: Math.random() > 0.7,
            ...options
        };
        
        return new Particle(x, y, particleOptions);
    }
    
    /**
     * 파티클 방출
     */
    emitParticles() {
        if (this.particles.length >= this.options.maxParticles) return;
        
        let x, y;
        
        switch (this.options.emissionArea) {
            case 'center':
                x = this.canvas.width / 2;
                y = this.canvas.height / 2;
                break;
                
            case 'random':
                x = Math.random() * this.canvas.width;
                y = Math.random() * this.canvas.height;
                break;
                
            case 'edges':
                const side = Math.floor(Math.random() * 4);
                switch (side) {
                    case 0: // top
                        x = Math.random() * this.canvas.width;
                        y = 0;
                        break;
                    case 1: // right
                        x = this.canvas.width;
                        y = Math.random() * this.canvas.height;
                        break;
                    case 2: // bottom
                        x = Math.random() * this.canvas.width;
                        y = this.canvas.height;
                        break;
                    case 3: // left
                        x = 0;
                        y = Math.random() * this.canvas.height;
                        break;
                }
                break;
                
            default:
                x = this.canvas.width / 2;
                y = this.canvas.height / 2;
        }
        
        for (let i = 0; i < this.options.emissionRate; i++) {
            if (this.particles.length < this.options.maxParticles) {
                this.particles.push(this.createParticle(x, y));
            }
        }
    }
    
    /**
     * 폭발 효과 생성
     * @param {number} x - X 좌표
     * @param {number} y - Y 좌표
     * @param {number} count - 파티클 수
     */
    createExplosion(x, y, count = 20) {
        for (let i = 0; i < count; i++) {
            const angle = (Math.PI * 2 * i) / count;
            const speed = Math.random() * 3 + 2;
            
            this.particles.push(this.createParticle(x, y, {
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                life: Math.random() * 50 + 30,
                size: Math.random() * 4 + 2
            }));
        }
    }
    
    /**
     * 마우스 상호작용 처리
     */
    handleMouseInteraction() {
        if (!this.mouse.isActive || !this.options.enableInteraction) return;
        
        this.particles.forEach(particle => {
            const dx = this.mouse.x - particle.x;
            const dy = this.mouse.y - particle.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance < this.options.mouseRadius) {
                const force = (this.options.mouseRadius - distance) / this.options.mouseRadius;
                const angle = Math.atan2(dy, dx);
                
                // 반발력 또는 흡인력 적용
                const repulsionX = Math.cos(angle) * force * this.options.repulsionForce;
                const repulsionY = Math.sin(angle) * force * this.options.repulsionForce;
                
                particle.vx -= repulsionX;
                particle.vy -= repulsionY;
            }
        });
    }
    
    /**
     * 파티클 업데이트
     */
    updateParticles() {
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const particle = this.particles[i];
            
            particle.update();
            
            // 화면 밖으로 나가거나 수명이 다한 파티클 제거
            if (particle.isOffScreen(this.canvas.width, this.canvas.height) || particle.isDead()) {
                this.particles.splice(i, 1);
            }
        }
    }
    
    /**
     * 파티클 그리기
     */
    drawParticles() {
        this.particles.forEach(particle => {
            particle.draw(this.ctx);
        });
    }
    
    /**
     * 캔버스 클리어
     */
    clear() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }
    
    /**
     * 애니메이션 루프
     */
    animate() {
        if (!this.isRunning) return;
        
        this.clear();
        this.emitParticles();
        this.handleMouseInteraction();
        this.updateParticles();
        this.drawParticles();
        
        this.animationId = requestAnimationFrame(() => this.animate());
    }
    
    /**
     * 애니메이션 시작
     */
    start() {
        if (this.isRunning) return;
        
        this.isRunning = true;
        this.animate();
    }
    
    /**
     * 애니메이션 정지
     */
    stop() {
        this.isRunning = false;
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
            this.animationId = null;
        }
    }
    
    /**
     * 파티클 시스템 파괴
     */
    destroy() {
        this.stop();
        this.particles = [];
        
        // 이벤트 리스너 제거
        window.removeEventListener('resize', this.resize);
        if (this.options.enableInteraction) {
            this.canvas.removeEventListener('mousemove', this.handleMouseMove);
            this.canvas.removeEventListener('mouseleave', this.handleMouseLeave);
            this.canvas.removeEventListener('click', this.handleClick);
        }
    }
    
    /**
     * 파티클 수 반환
     * @returns {number} 파티클 수
     */
    getParticleCount() {
        return this.particles.length;
    }
    
    /**
     * 옵션 업데이트
     * @param {Object} newOptions - 새로운 옵션
     */
    updateOptions(newOptions) {
        this.options = { ...this.options, ...newOptions };
    }
}

// ===== PRESET CONFIGURATIONS =====

/**
 * 파티클 시스템 프리셋
 */
export const ParticlePresets = {
    // 기본 파티클
    default: {
        maxParticles: 100,
        emissionRate: 2,
        emissionArea: 'center',
        particleTypes: ['circle'],
        colors: ['#007bff', '#17a2b8'],
        sizeRange: { min: 1, max: 3 },
        speedRange: { min: 0.5, max: 1.5 },
        lifeRange: { min: 50, max: 100 },
        gravity: 0.01,
        friction: 0.99
    },
    
    // 우주 테마
    space: {
        maxParticles: 150,
        emissionRate: 3,
        emissionArea: 'random',
        particleTypes: ['circle', 'star'],
        colors: ['#ffffff', '#87ceeb', '#ffd700', '#ff69b4'],
        sizeRange: { min: 0.5, max: 2 },
        speedRange: { min: 0.2, max: 1 },
        lifeRange: { min: 100, max: 200 },
        gravity: 0.005,
        friction: 0.995
    },
    
    // 불꽃 테마
    fire: {
        maxParticles: 80,
        emissionRate: 4,
        emissionArea: 'center',
        particleTypes: ['circle'],
        colors: ['#ff4500', '#ff6347', '#ff8c00', '#ffd700'],
        sizeRange: { min: 2, max: 6 },
        speedRange: { min: 1, max: 3 },
        lifeRange: { min: 30, max: 80 },
        gravity: -0.02,
        friction: 0.98
    },
    
    // 물 테마
    water: {
        maxParticles: 120,
        emissionRate: 2,
        emissionArea: 'edges',
        particleTypes: ['circle'],
        colors: ['#00bfff', '#1e90ff', '#4169e1', '#87ceeb'],
        sizeRange: { min: 1, max: 4 },
        speedRange: { min: 0.3, max: 1.2 },
        lifeRange: { min: 80, max: 150 },
        gravity: 0.02,
        friction: 0.99
    },
    
    // 마법 테마
    magic: {
        maxParticles: 100,
        emissionRate: 2,
        emissionArea: 'center',
        particleTypes: ['circle', 'star', 'triangle'],
        colors: ['#ff69b4', '#9370db', '#00ced1', '#ff1493'],
        sizeRange: { min: 1, max: 3 },
        speedRange: { min: 0.5, max: 2 },
        lifeRange: { min: 60, max: 120 },
        gravity: 0,
        friction: 0.99,
        enableInteraction: true
    }
};

// ===== GLOBAL PARTICLE SYSTEM =====

let globalParticleSystem = null;

/**
 * 전역 파티클 시스템 초기화
 * @param {HTMLCanvasElement} canvas - 캔버스 요소
 * @param {string|Object} preset - 프리셋 이름 또는 옵션 객체
 */
export function initParticleSystem(canvas, preset = 'default') {
    if (globalParticleSystem) {
        globalParticleSystem.destroy();
    }
    
    const options = typeof preset === 'string' ? ParticlePresets[preset] : preset;
    globalParticleSystem = new ParticleSystem(canvas, options);
    
    return globalParticleSystem;
}

/**
 * 파티클 시스템 정지
 */
export function stopParticleSystem() {
    if (globalParticleSystem) {
        globalParticleSystem.stop();
    }
}

/**
 * 파티클 시스템 재시작
 */
export function startParticleSystem() {
    if (globalParticleSystem) {
        globalParticleSystem.start();
    }
}

/**
 * 파티클 시스템 파괴
 */
export function destroyParticleSystem() {
    if (globalParticleSystem) {
        globalParticleSystem.destroy();
        globalParticleSystem = null;
    }
}

/**
 * 폭발 효과 생성
 * @param {number} x - X 좌표
 * @param {number} y - Y 좌표
 * @param {number} count - 파티클 수
 */
export function createExplosion(x, y, count = 20) {
    if (globalParticleSystem) {
        globalParticleSystem.createExplosion(x, y, count);
    }
}

// ===== AUTO INITIALIZATION =====

/**
 * 자동 초기화
 */
function autoInit() {
    const canvas = document.getElementById('particles-canvas');
    if (canvas) {
        // 테마에 따른 프리셋 선택
        const isDark = document.body.classList.contains('theme-dark');
        const preset = isDark ? 'space' : 'default';
        
        initParticleSystem(canvas, preset);
        
        // 테마 변경 감지
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
                    const isDarkNow = document.body.classList.contains('theme-dark');
                    const newPreset = isDarkNow ? 'space' : 'default';
                    
                    if (globalParticleSystem) {
                        globalParticleSystem.updateOptions(ParticlePresets[newPreset]);
                    }
                }
            });
        });
        
        observer.observe(document.body, {
            attributes: true,
            attributeFilter: ['class']
        });
    }
}

// DOM 로드 완료 시 자동 초기화
if (typeof window !== 'undefined') {
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', autoInit);
    } else {
        autoInit();
    }
}

// ===== EXPORT =====

// 전역으로 노출
if (typeof window !== 'undefined') {
    window.Particle = Particle;
    window.ParticleSystem = ParticleSystem;
    window.ParticlePresets = ParticlePresets;
    window.initParticleSystem = initParticleSystem;
    window.stopParticleSystem = stopParticleSystem;
    window.startParticleSystem = startParticleSystem;
    window.destroyParticleSystem = destroyParticleSystem;
    window.createExplosion = createExplosion;
} 