# EMER - 앱인토스 미니앱

매일 출석체크하고 포인트를 모으고, 사다리 타기를 즐기는 가벼운 앱인토스 미니앱입니다.

> **기술 스택**: React Native (Granite.js) · TypeScript · Zustand · 앱인토스 SDK

---

## 프로젝트 구조

```
EMER/
├── app.config.ts                          # 앱인토스 프레임워크 설정
├── package.json
├── tsconfig.json
├── assets/                                # 정적 리소스 (이미지, 애니메이션, 폰트)
└── src/
    ├── pages/                             # 📄 파일 기반 라우팅
    │   ├── _layout.tsx                    #    전역 레이아웃 (SafeArea)
    │   ├── index.tsx                      #    홈 화면 (로그인 + 대시보드)
    │   ├── attendance/index.tsx           #    출석 체크
    │   ├── ladder/index.tsx               #    사다리 타기
    │   ├── points/index.tsx               #    포인트 내역
    │   └── profile/index.tsx              #    내 정보
    ├── components/                        # 🧩 재사용 UI 컴포넌트
    │   ├── attendance/
    │   │   ├── CalendarGrid.tsx           #    월간 출석 달력
    │   │   └── StreakBanner.tsx           #    연속 출석 진행바
    │   └── ladder/
    │       └── LadderCanvas.tsx           #    사다리 시각화
    ├── hooks/                             # 🪝 커스텀 훅
    │   ├── useAuth.ts                     #    토스 로그인
    │   └── useAttendance.ts              #    출석 체크 + 보너스 계산
    ├── services/                          # 🌐 API 통신 레이어
    │   ├── api.ts                         #    HTTP 클라이언트 (토큰 관리)
    │   ├── auth.ts                        #    인가코드 → 토큰 교환
    │   └── attendance.ts                  #    출석 API
    ├── store/index.ts                     # 📦 Zustand 전역 상태
    ├── types/index.ts                     # 🏷️  타입 정의
    ├── constants/index.ts                 # ⚙️  상수 (포인트, 색상, 설정)
    └── utils/                             # 🔧 유틸리티
        ├── date.ts                        #    날짜 헬퍼
        └── ladder.ts                      #    사다리 생성/경로추적 알고리즘
```

---

## 시작하기

### 1. 의존성 설치

```bash
npm install
```

### 2. 개발 서버 실행

```bash
npm run dev
```

### 3. 빌드

```bash
npm run build
```

### 4. 테스트 환경

토스 샌드박스 앱에서 미니앱을 테스트할 수 있습니다. [앱인토스 개발자센터](https://developers-apps-in-toss.toss.im)에서 앱을 등록하고 샌드박스 설정을 완료하세요.

---

## 핵심 기능 상세

### 📅 출석 체크 (`src/pages/attendance/`)

매일 한 번 출석 버튼을 눌러 포인트를 적립합니다.

**포인트 보상 체계:**

| 구분 | 포인트 |
|------|--------|
| 일일 출석 | +10P |
| 3일 연속 보너스 | +20P |
| 7일 연속 보너스 | +50P |
| 14일 연속 보너스 | +100P |
| 30일 연속 보너스 | +300P |

**구성 요소:**

- **출석 버튼** — 하루에 한 번만 활성화, 체크 후 비활성 처리
- **보상 모달** — 출석 시 획득 포인트와 연속 출석 보너스를 팝업으로 표시
- **달력 그리드** (`CalendarGrid.tsx`) — 이번 달 출석 현황을 달력으로 시각화. 출석한 날은 파란 원 + 체크마크, 오늘은 파란 테두리로 표시
- **연속 출석 배너** (`StreakBanner.tsx`) — 현재 연속 출석 일수, 다음 마일스톤까지 남은 일수, 프로그레스 바 표시

**사용 예시:**

```tsx
import { useAttendance } from '@/hooks/useAttendance';

function MyComponent() {
  const { checkIn, hasCheckedInToday, monthlyRecords } = useAttendance();

  const handlePress = async () => {
    if (hasCheckedInToday()) return;
    const result = await checkIn();
    // result.record.pointsEarned → 기본 포인트
    // result.bonusPoints → 연속 출석 보너스
  };
}
```

---

### 🪜 사다리 타기 (`src/pages/ladder/`)

참가자와 결과를 입력하고 랜덤 사다리를 생성해서 운명을 결정합니다.

**게임 흐름:**

```
설정(setup) → 사다리 생성(ready) → 참가자 선택(running) → 결과 공개(done)
```

**설정:**

| 항목 | 값 |
|------|---|
| 최소 참가자 | 2명 |
| 최대 참가자 | 8명 |
| 가로줄 수 | 3~10개 (랜덤) |
| 애니메이션 속도 | 800ms |

**구성 요소:**

- **설정 화면** — 참가자 이름 입력 (추가/삭제 가능), 결과 입력, 모든 필드 입력 시 "사다리 만들기" 버튼 활성화
- **사다리 캔버스** (`LadderCanvas.tsx`) — 세로줄 + 가로줄을 렌더링, 선택한 경로 하이라이트, 결과는 게임 종료 전까지 "?" 처리
- **결과 카드** — 선택한 참가자 → 도착한 결과를 표시

**사다리 알고리즘** (`src/utils/ladder.ts`):

```tsx
import { generateLadderGrid, traceLadder, computeMapping } from '@/utils/ladder';

// 4명 참가자용 사다리 생성
const grid = generateLadderGrid(4);
// grid[row][gap] = true이면 해당 위치에 가로줄 존재

// 0번 참가자의 도착 위치 추적
const destination = traceLadder(grid, 0);

// 전체 매핑 한번에 계산
const mapping = computeMapping(grid, 4);
// mapping[i] = i번 참가자의 도착 인덱스
```

- 인접한 가로줄이 같은 높이에 겹치지 않도록 보장
- 각 위치에 40% 확률로 가로줄 생성

---

### 💰 포인트 내역 (`src/pages/points/`)

적립/사용된 모든 포인트 내역을 시간순으로 조회합니다.

**포인트 유형:**

| 타입 | 아이콘 | 설명 |
|------|--------|------|
| `ATTENDANCE` | 📅 | 일일 출석 포인트 |
| `STREAK_BONUS` | 🔥 | 연속 출석 보너스 |
| `LADDER_REWARD` | 🪜 | 사다리 타기 보상 |
| `SPENT` | 💸 | 포인트 사용 |

---

### 👤 프로필 (`src/pages/profile/`)

사용자 정보와 통계를 표시합니다.

- 아바타 (닉네임 첫 글자)
- 총 포인트, 연속 출석 일수
- 메뉴: 포인트 내역, 공지사항, 이용약관, 개인정보처리방침

---

## 인증 (토스 로그인)

앱인토스 SDK의 `appLogin()`을 사용해 토스 계정으로 로그인합니다.

**인증 흐름:**

```
1. appLogin() 호출 → 토스 앱 로그인 화면
2. 사용자 인증 → 인가코드(authorizationCode) 반환 (유효시간 10분, 일회성)
3. 인가코드를 서버로 전송 → 토큰 교환 (POST /auth/token)
4. accessToken 저장 → 이후 API 요청에 Bearer 토큰으로 사용
```

**사용 예시:**

```tsx
import { useAuth } from '@/hooks/useAuth';

function LoginScreen() {
  const { user, login, isLoggingIn } = useAuth();

  // user가 null이면 미인증 상태
  // login() 호출 시 토스 로그인 → 토큰 교환 → user 상태 업데이트
}
```

---

## 라우팅

Granite.js의 파일 기반 라우팅을 사용합니다. `src/pages/` 디렉토리 구조가 곧 URL 경로입니다.

| 파일 | 경로 | 화면 |
|------|------|------|
| `pages/index.tsx` | `/` | 홈 (로그인/대시보드) |
| `pages/attendance/index.tsx` | `/attendance` | 출석 체크 |
| `pages/ladder/index.tsx` | `/ladder` | 사다리 타기 |
| `pages/points/index.tsx` | `/points` | 포인트 내역 |
| `pages/profile/index.tsx` | `/profile` | 내 정보 |

**페이지 정의:**

```tsx
import { createRoute, useNavigation } from '@granite-js/react-native';

// 라우트 정의
export const Route = createRoute('/my-page', {
  validateParams: (params) => params as { id: string },
  component: MyPage,
});

// 화면 이동
const navigation = useNavigation();
navigation.navigate('/attendance');
navigation.navigate('/ladder', { someParam: 'value' });
navigation.goBack();
```

**레이아웃:**

`_layout.tsx` 파일은 해당 디렉토리와 하위 페이지 전체에 적용됩니다.

```
pages/_layout.tsx          → 모든 페이지에 적용 (SafeArea 처리)
pages/about/_layout.tsx    → /about 하위 페이지에만 적용
```

---

## 상태 관리

Zustand를 사용한 전역 스토어입니다.

```tsx
import { useAppStore } from '@/store';

function MyComponent() {
  // 개별 셀렉터로 필요한 상태만 구독 (리렌더 최적화)
  const user = useAppStore((s) => s.user);
  const totalPoints = useAppStore((s) => s.user?.totalPoints ?? 0);

  // 액션 호출
  const { setUser, addPoints, addAttendance } = useAppStore();
}
```

**스토어 구조:**

| 상태 | 타입 | 설명 |
|------|------|------|
| `user` | `User \| null` | 로그인된 사용자 |
| `monthlyRecords` | `AttendanceRecord[]` | 이번 달 출석 기록 |
| `pointHistory` | `PointTransaction[]` | 포인트 내역 (최신순) |
| `isLoading` | `boolean` | 로딩 상태 |

---

## API 서비스 레이어

`src/services/api.ts`에 HTTP 클라이언트가 구현되어 있습니다.

```tsx
import { api } from '@/services/api';

// 토큰 설정 (로그인 후 자동 처리됨)
api.setToken('bearer-token');

// GET 요청
const data = await api.get<MyType>('/endpoint');

// POST 요청
const result = await api.post<MyType>('/endpoint', { key: 'value' });
```

**환경 변수:**

| 변수 | 기본값 | 설명 |
|------|--------|------|
| `API_BASE_URL` | `https://api.emer.example.com` | API 서버 주소 |

**엔드포인트 (백엔드 구현 필요):**

| Method | Path | 설명 |
|--------|------|------|
| POST | `/auth/token` | 인가코드 → 토큰 교환 |
| POST | `/attendance/check-in` | 출석 체크 |
| GET | `/attendance/:userId?year=&month=` | 월간 출석 조회 |

---

## 설정 파일

### `app.config.ts` — 앱인토스 프레임워크 설정

```ts
import { defineConfig } from '@granite-js/react-native/config';

export default defineConfig({
  navigationBar: {
    withBackButton: true,   // 뒤로가기 버튼
    withHomeButton: true,   // 홈 버튼 (서비스명 옆)
    // 우측 액세서리 버튼도 추가 가능:
    // initialAccessoryButton: { id: 'heart', icon: { name: 'icon-heart-mono' } }
  },
});
```

### `tsconfig.json` — 경로 별칭

```json
{
  "paths": {
    "@/*": ["src/*"]
  }
}
```

`@/hooks/useAuth`, `@/store`, `@/constants` 등으로 import할 수 있습니다.

---

## 앞으로 구현할 것들

### 백엔드 API
- [ ] `/auth/token` — 토스 인가코드 검증 및 토큰 발급
- [ ] `/attendance/check-in` — 출석 기록 저장, 연속 출석 계산
- [ ] `/attendance/:userId` — 월간 출석 데이터 조회
- [ ] `/points/:userId` — 포인트 내역 조회

### 기능 확장
- [ ] 사다리 타기 경로 애니메이션 (React Native Animated / Reanimated)
- [ ] 추가 미니게임 (룰렛, 가위바위보, 제비뽑기 등)
- [ ] 포인트 사용처 (상점, 기프티콘 교환)
- [ ] 친구 초대 / 공유 리워드
- [ ] 푸시 알림 (출석 리마인더)

### 앱인토스 SDK 연동
- [ ] 사용자 행동 기록 (로깅/분석)
- [ ] 광고 연동 (리워드 광고로 추가 포인트)
- [ ] 토스페이 결제 (프리미엄 기능)
- [ ] 공유 링크 생성

---

## 참고 자료

- [앱인토스 개발자센터](https://developers-apps-in-toss.toss.im)
- [Granite.js (앱인토스 RN 프레임워크)](https://developers-apps-in-toss.toss.im/bedrock/reference/framework/%EC%8B%9C%EC%9E%91%ED%95%98%EA%B8%B0/overview.html)
- [토스 로그인 API](https://developers-apps-in-toss.toss.im/bedrock/reference/framework/%EB%A1%9C%EA%B7%B8%EC%9D%B8/appLogin.html)
