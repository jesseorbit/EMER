// 출석 포인트 보상
export const ATTENDANCE_POINTS = {
  DAILY: 10, // 기본 출석 포인트
  STREAK_3: 20, // 3일 연속 보너스
  STREAK_7: 50, // 7일 연속 보너스
  STREAK_14: 100, // 14일 연속 보너스
  STREAK_30: 300, // 30일 연속 보너스
} as const;

// 사다리 타기 설정
export const LADDER_CONFIG = {
  MIN_PARTICIPANTS: 2,
  MAX_PARTICIPANTS: 8,
  MIN_RUNGS: 3, // 최소 가로줄
  MAX_RUNGS: 10, // 최대 가로줄
  ANIMATION_SPEED_MS: 800, // 사다리 타는 애니메이션 속도
} as const;

// 색상
export const COLORS = {
  primary: '#3182F6', // 토스 블루
  secondary: '#FF6B35',
  background: '#FFFFFF',
  surface: '#F4F4F4',
  textPrimary: '#191F28',
  textSecondary: '#8B95A1',
  textTertiary: '#B0B8C1',
  success: '#34C759',
  warning: '#FF9500',
  error: '#FF3B30',
  streak: '#FFD700', // 연속 출석 골드
  point: '#3182F6',
} as const;

// 요일
export const WEEKDAYS = ['일', '월', '화', '수', '목', '금', '토'] as const;
