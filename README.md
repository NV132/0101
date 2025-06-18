# 보험 웹사이트

현대적인 보험 상품 소개 및 상담 웹사이트입니다.

## 🚀 기능

- 📱 반응형 디자인
- 🛡️ 5가지 보험 상품 (자동차, 건강, 주택, 생명, 여행)
- 💬 실시간 챗봇 상담
- 📋 상담 예약 시스템
- ❓ FAQ 시스템
- 🧮 보험료 계산기

## 🛠️ 개발 환경 설정

```bash
# 의존성 설치
npm install

# 개발 서버 실행
npm start

# 프로덕션 빌드
npm run build

# SCSS 컴파일 감시
npm run scss:watch
```

## 📦 배포

### GitHub Pages (자동)
1. GitHub 저장소에 코드 푸시
2. GitHub Actions가 자동으로 빌드 및 배포
3. `https://[username].github.io/[repository-name]`에서 접근

### 수동 배포
```bash
npm run build
# dist/ 폴더의 내용을 웹 서버에 업로드
```

### Netlify/Vercel
1. GitHub 저장소 연결
2. 빌드 명령어: `npm run build`
3. 배포 폴더: `dist`

## 📁 프로젝트 구조

```
├── public/          # HTML 페이지
├── assets/          # 정적 자원 (JS, CSS, 이미지)
├── scss/           # SCSS 스타일시트
├── docs/           # 문서
├── tests/          # 테스트 파일
└── dist/           # 빌드 결과물
```

## 🔧 기술 스택

- **Frontend**: HTML5, CSS3, JavaScript (ES6+)
- **Build Tools**: Webpack, Babel, Gulp
- **Styling**: SCSS
- **Testing**: Jest
- **Deployment**: GitHub Actions, GitHub Pages

## 📄 라이선스

MIT License 