# GT7 Telemetry Dashboard 🏎️

**Next.js 16 + TypeScript + Tailwind CSS 4 + Motion**

PlayStation 5의 Gran Turismo 7 실시간 텔레메트리 데이터 시각화 대시보드

![Next.js](https://img.shields.io/badge/Next.js-16-black?style=for-the-badge&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5.6-blue?style=for-the-badge&logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-4.0-06B6D4?style=for-the-badge&logo=tailwindcss)
![Motion](https://img.shields.io/badge/Motion-12-ff006e?style=for-the-badge)

## ✨ 기술 스택

- **Next.js 16** - App Router, React Server Components
- **TypeScript 5.6** - 타입 안정성
- **Tailwind CSS 4** - 새로운 CSS 기반 설정
- **Motion** (구 Framer Motion) - 부드러운 애니메이션
- **WebSocket** - 실시간 데이터 전송
- **UDP Socket** - GT7 텔레메트리 수신

## 🎨 주요 특징

### UI/UX

- 🌈 **사이버펑크 네온 스타일** - 미래지향적 디자인
- ⚡ **60Hz 실시간 업데이트** - 부드러운 데이터 표시
- 🎬 **Motion 애니메이션** - 페이드인, 스케일, 호버 효과
- 📱 **반응형 그리드 레이아웃** - Tailwind CSS 4
- ⚙️ **서버 설정 UI** - IP 주소/포트 직접 설정 가능

### 데이터 시각화

- 🎯 **원형 게이지** - 속도계 & RPM
- ⚙️ **기어 표시** - 실시간 기어 변경 애니메이션
- 🛞 **타이어 온도** - 온도별 색상 코드
- 📊 **프로그레스 바** - 스로틀, 브레이크, 연료
- ⏱️ **랩타임 기록** - 최고 기록 & 직전 랩
- 🔧 **엔진 정보** - 수온, 오일온, 오일압, 터보

## 🚀 시작하기

### 필수 요구사항

- Node.js 20+
- Yarn 4.0+ (권장)
- PlayStation 5
- Gran Turismo 7

### 설치 및 실행

```bash
# 의존성 설치
yarn install

# GT7 서버 실행 (터미널 1)
yarn server

# Next.js 개발 서버 (터미널 2)
yarn dev
```

브라우저에서 접속:

```
http://localhost:3000
```

### 3. 서버 설정

브라우저에서 우측 상단 **⚙️ 서버 설정** 버튼 클릭

**같은 컴퓨터에서 실행:**

- 서버 호스트: `localhost` (기본값)
- 서버 포트: `8080`

**다른 컴퓨터에서 실행:**

- 서버 호스트: 서버 컴퓨터의 IP 주소 (예: `192.168.0.100`)
- 서버 포트: `8080`

설정은 자동으로 로컬스토리지에 저장됩니다.

## 🎮 PS5 설정

### 1. 컴퓨터 IP 확인

**Windows:**

```bash
ipconfig
```

**Mac/Linux:**

```bash
ifconfig
# 또는
ip addr
```

### 2. GT7 게임 설정

1. GT7 실행
2. **메뉴** → **설정** → **네트워크**
3. **데이터 로거 출력** 활성화
4. **IP 주소**: 컴퓨터 IP 주소 입력
5. **포트**: `33740` (기본값)

### 3. 레이싱 시작! 🏁

타임 어택이나 레이스를 시작하면 데이터가 자동으로 전송됩니다.

## 📁 프로젝트 구조

```
gt7-telemetry-dashboard/
├── app/
│   ├── globals.css          # Tailwind CSS 4 설정
│   ├── layout.tsx           # 루트 레이아웃
│   └── page.tsx             # 메인 대시보드
├── components/
│   ├── CircularGauge.tsx    # 속도/RPM 게이지
│   ├── GearDisplay.tsx      # 기어 표시
│   ├── TireTemps.tsx        # 타이어 온도
│   ├── InputBars.tsx        # 스로틀/브레이크
│   ├── LapInfo.tsx          # 랩 정보
│   ├── EngineInfo.tsx       # 엔진 정보
│   ├── FuelInfo.tsx         # 연료 정보
│   └── PositionInfo.tsx     # 위치 정보
├── server/
│   └── gt7-server.ts        # UDP/WebSocket 서버
├── types/
│   └── telemetry.ts         # TypeScript 타입 정의
├── next.config.ts           # Next.js 설정
├── tsconfig.json            # TypeScript 설정
└── package.json
```

## 🎯 표시 데이터

### 주요 계기판

- **속도계** (0-400 km/h)
- **RPM 게이지** (0-8000)
- **기어 표시** (R, N, 1-6+)

### 상세 정보

- 🛞 **타이어 온도** - 4개 타이어 실시간 (FL, FR, RL, RR)
- 🎮 **드라이버 입력** - 스로틀/브레이크 퍼센트
- ⏱️ **랩 정보** - 현재 랩, 총 랩, 최고 기록, 직전 랩
- 🔧 **엔진 데이터** - 수온, 오일온, 오일압, 터보 부스트
- ⛽ **연료** - 현재량, 전체 용량, 퍼센트
- 📍 **위치** - X, Y, Z 좌표, 패킷 ID

## 🎨 Tailwind CSS 4 변경사항

### 새로운 설정 방식

Tailwind CSS 4는 JavaScript 설정 파일 대신 CSS 파일에서 직접 설정:

```css
@import "tailwindcss";

@theme {
  --color-neon-cyan: #00ffff;
  --font-family-orbitron: "Orbitron", sans-serif;
  --animate-pulse-glow: pulse-glow 2s ease-in-out infinite;
}
```

### 사용 방법

```tsx
<div className="bg-neon-cyan font-orbitron animate-pulse-glow">Hello GT7!</div>
```

## 🎬 Motion (구 Framer Motion)

패키지 이름이 변경됨:

```tsx
// 이전: framer-motion
import { motion } from "framer-motion";

// 현재: motion
import { motion } from "motion/react";
```

## 🔧 개발 명령어

```bash
# Next.js 개발 서버
yarn dev

# GT7 UDP 서버
yarn server

# 프로덕션 빌드
yarn build

# 프로덕션 실행
yarn start

# TypeScript 타입 체크
yarn tsc --noEmit

# 린트
yarn lint
```

## 🐛 문제 해결

### WebSocket 연결 실패

- `yarn server`로 서버가 실행 중인지 확인
- 방화벽에서 포트 33740, 8080 열기

### 데이터가 수신되지 않음

- GT7 "데이터 로거 출력" 활성화 확인
- 레이스/타임 어택 모드에서만 데이터 전송됨
- PS5와 컴퓨터가 같은 네트워크인지 확인

### TypeScript 에러

```bash
# 타입 체크
yarn tsc --noEmit

# node_modules 재설치
rm -rf node_modules yarn.lock
yarn install
```

## 📊 타이어 온도 색상 코드

| 온도 범위 | 색상    | 상태     |
| --------- | ------- | -------- |
| < 60°C    | 🔵 시안 | 차가움   |
| 60-80°C   | 🟢 초록 | **최적** |
| 80-95°C   | 🟡 노랑 | 따뜻함   |
| > 95°C    | 🔴 핑크 | 과열     |

## 📝 GT7 텔레메트리 프로토콜

- **프로토콜**: Salsa
- **UDP 포트**: 33740
- **패킷 크기**: ~300 bytes
- **업데이트 주기**: ~60Hz (16.67ms)
- **데이터 형식**: Binary (Little Endian)

## 🚧 향후 개선 사항

- [ ] 데이터 기록 및 CSV 내보내기
- [ ] 랩타임 비교 그래프
- [ ] 서킷 맵 오버레이
- [ ] 다중 플레이어 지원
- [ ] 모바일 최적화
- [ ] 커스텀 테마 에디터
- [ ] 음성 안내 (TTS)
- [ ] 데이터 분석 AI

## 📄 라이선스

MIT License

## 🙏 크레딧

- GT7 텔레메트리 프로토콜: 커뮤니티 리버스 엔지니어링
- 폰트: Google Fonts (Orbitron, Rajdhani)

---

**Happy Racing! 🏁**

Made with ❤️ and ⚡ for GT7 Community
