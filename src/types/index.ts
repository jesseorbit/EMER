// 사용자
export interface User {
  id: string;
  nickname: string;
  profileImageUrl?: string;
  totalPoints: number;
  currentStreak: number; // 연속 출석 일수
  lastAttendanceDate: string | null; // ISO date string
}

// 출석 기록
export interface AttendanceRecord {
  date: string; // YYYY-MM-DD
  pointsEarned: number;
  streakDay: number;
}

// 월간 출석 현황
export interface MonthlyAttendance {
  year: number;
  month: number;
  records: AttendanceRecord[];
  totalDays: number;
}

// 포인트 내역
export interface PointTransaction {
  id: string;
  type: 'ATTENDANCE' | 'STREAK_BONUS' | 'LADDER_REWARD' | 'SPENT';
  amount: number;
  description: string;
  createdAt: string;
}

// 사다리 타기
export interface LadderGame {
  id: string;
  participants: string[];
  results: string[];
  ladderPaths: number[][]; // 각 참가자의 사다리 경로
}

export interface LadderResult {
  participantIndex: number;
  resultIndex: number;
  reward: string;
}
