# 군대 관리 시스템 (Military Management System)

KIMI AVIATION 스타일의 모던하고 깔끔한 디자인의 군대 관리 웹 애플리케이션입니다.

## 🎯 프로젝트 개요

- **목적**: 군대에서 사용할 수 있는 오프라인 웹 관리 시스템
- **환경**: 인터넷이 없는 환경에서 메모장으로 작업 가능
- **기술**: HTML, CSS, JavaScript (모듈화)
- **디자인**: KIMI AVIATION 스타일의 다크 테마, 모던하고 깔끔한 UI

## 🏗️ 프로젝트 구조

```
workspace/
├── index.html              # 메인 페이지
├── css/
│   ├── variables.css       # CSS 변수 및 디자인 시스템
│   ├── main.css           # 메인 레이아웃 및 기본 스타일
│   └── components.css     # 재사용 가능한 UI 컴포넌트
├── js/
│   ├── utils.js           # 유틸리티 함수들
│   ├── components.js      # 인터랙티브 컴포넌트들
│   └── main.js           # 메인 애플리케이션 로직
├── assets/
│   └── images/           # 이미지 파일들
└── README.md             # 프로젝트 문서
```

## 🎨 디자인 시스템

### 색상 팔레트
- **Primary**: `#7FB3D3` (라이트 틸/민트 그린)
- **Background**: `#1A1F2E` (다크 블루-그레이)
- **Surface**: `#2A2F3E` (약간 밝은 서피스)
- **Card**: `#3A3F4E` (카드 배경)
- **Text Primary**: `#FFFFFF` (화이트 텍스트)
- **Text Secondary**: `#B8C5D6` (라이트 그레이 텍스트)

### 타이포그래피
- **Font Family**: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif
- **Responsive**: clamp() 함수를 사용한 반응형 폰트 크기
- **Hierarchy**: 명확한 시각적 계층 구조

## 🚀 주요 기능

### 1. 반응형 디자인
- 모바일, 태블릿, 데스크톱 모든 화면 크기 지원
- CSS Grid와 Flexbox를 활용한 유연한 레이아웃
- 뷰포트 기반 반응형 타이포그래피

### 2. 모듈화된 컴포넌트
- **Navigation**: 햄버거 메뉴, 포커스 트랩, 키보드 접근성
- **Button**: 리플 효과, 로딩 상태, 키보드 지원
- **Card**: 호버 효과, 인터섹션 옵저버 애니메이션
- **LanguageSelector**: 언어 변경, 로컬 스토리지 저장

### 3. 인터랙티브 요소
- 스크롤 기반 헤더 숨김/표시
- 부드러운 애니메이션과 전환 효과
- 키보드 단축키 지원 (Ctrl+K: 검색, Ctrl+M: 메뉴)
- 알림 시스템

### 4. 오프라인 지원
- 로컬 스토리지 활용
- 서비스 워커 준비 (확장 가능)
- 오프라인 상태 감지 및 알림

## 🛠️ 사용법

### 1. 기본 실행
```bash
# 웹 서버 없이도 실행 가능 (파일 직접 열기)
# 브라우저에서 index.html 파일을 열어주세요
```

### 2. 개발 환경 설정
```bash
# 로컬 서버 실행 (선택사항)
python -m http.server 8000
# 또는
npx serve .
```

### 3. 메모장에서 작업
- 모든 파일은 UTF-8 인코딩으로 저장
- CSS와 JavaScript는 모듈화되어 있어 개별 수정 가능
- 변수 파일(`variables.css`)에서 전체 디자인 시스템 관리

## 📱 반응형 브레이크포인트

- **Mobile**: ≤ 768px
- **Tablet**: 768px - 1024px
- **Desktop**: > 1024px

## 🎯 컴포넌트 사용법

### 네비게이션
```javascript
// 네비게이션 열기
window.Navigation.open();

// 네비게이션 닫기
window.Navigation.close();

// 네비게이션 토글
window.Navigation.toggle();
```

### 알림 표시
```javascript
// 성공 알림
MilitaryApp.showNotification('작업이 완료되었습니다', 'success');

// 경고 알림
MilitaryApp.showNotification('주의가 필요합니다', 'warning');

// 정보 알림
MilitaryApp.showNotification('정보를 확인하세요', 'info');
```

### 언어 변경
```javascript
// 언어 변경
window.LanguageSelector.setLanguage('EN');

// 현재 언어 확인
const currentLang = window.LanguageSelector.getCurrentLanguage();
```

## 🔧 커스터마이징

### 색상 변경
`css/variables.css` 파일에서 CSS 변수를 수정하여 전체 색상 테마를 변경할 수 있습니다.

```css
:root {
    --color-primary: #YOUR_COLOR;
    --color-background: #YOUR_BACKGROUND;
    /* ... */
}
```

### 컴포넌트 추가
1. `css/components.css`에 스타일 추가
2. `js/components.js`에 클래스 추가
3. `index.html`에 HTML 구조 추가

### 새로운 페이지 추가
1. 새로운 HTML 파일 생성
2. CSS와 JavaScript 파일 연결
3. 라우팅 로직 추가 (필요시)

## 📋 키보드 단축키

- **Ctrl/Cmd + K**: 검색 열기
- **Ctrl/Cmd + M**: 메뉴 토글
- **ESC**: 메뉴 닫기
- **Tab**: 포커스 이동 (네비게이션 내에서 순환)

## 🔒 접근성 (Accessibility)

- **키보드 네비게이션**: 모든 인터랙티브 요소는 키보드로 접근 가능
- **포커스 관리**: 명확한 포커스 표시 및 관리
- **스크린 리더**: 적절한 ARIA 라벨과 시맨틱 HTML
- **색상 대비**: WCAG AA 기준 충족
- **모션 감소**: `prefers-reduced-motion` 미디어 쿼리 지원

## 🌐 브라우저 지원

- **Chrome**: 60+
- **Firefox**: 55+
- **Safari**: 12+
- **Edge**: 79+

## 📝 개발 노트

### 모듈화 원칙
- **단일 책임**: 각 파일은 하나의 명확한 목적
- **재사용성**: 컴포넌트는 다른 곳에서도 사용 가능
- **확장성**: 새로운 기능 추가가 용이한 구조

### 성능 최적화
- **CSS**: CSS 변수 활용으로 일관성 유지
- **JavaScript**: 이벤트 위임과 디바운싱/쓰로틀링
- **애니메이션**: CSS 트랜지션과 requestAnimationFrame 활용

### 오프라인 우선
- 로컬 스토리지 활용
- 서비스 워커 준비 구조
- 오프라인 상태 감지 및 처리

## 🚀 향후 확장 계획

1. **데이터베이스 연동**: 실제 군대 데이터 관리
2. **사용자 인증**: 로그인/로그아웃 시스템
3. **실시간 알림**: WebSocket을 통한 실시간 업데이트
4. **PWA 지원**: 앱처럼 설치 가능한 웹 앱
5. **다국어 지원**: i18n 라이브러리 통합

## 📞 지원

프로젝트에 대한 문의사항이나 개선 제안이 있으시면 언제든지 연락주세요.

---

**군대 관리 시스템** - 효율적이고 현대적인 디지털 솔루션
