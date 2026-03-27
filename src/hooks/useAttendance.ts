import { useCallback } from 'react';
import { useAppStore } from '../store';
import { attendanceService } from '../services/attendance';
import { ATTENDANCE_POINTS } from '../constants';
import type { PointTransaction } from '../types';

export function useAttendance() {
  const { user, monthlyRecords, addAttendance, addPoints, setUser } = useAppStore();

  const checkIn = useCallback(async () => {
    if (!user) throw new Error('로그인이 필요합니다');

    const result = await attendanceService.checkIn(user.id);
    addAttendance(result.record);

    // 연속 출석 보너스 계산
    const streak = result.record.streakDay;
    let bonusPoints = 0;

    if (streak === 30) bonusPoints = ATTENDANCE_POINTS.STREAK_30;
    else if (streak === 14) bonusPoints = ATTENDANCE_POINTS.STREAK_14;
    else if (streak === 7) bonusPoints = ATTENDANCE_POINTS.STREAK_7;
    else if (streak === 3) bonusPoints = ATTENDANCE_POINTS.STREAK_3;

    // 기본 포인트 적립
    const dailyTransaction: PointTransaction = {
      id: `pt_${Date.now()}`,
      type: 'ATTENDANCE',
      amount: result.record.pointsEarned,
      description: '출석 체크',
      createdAt: new Date().toISOString(),
    };
    addPoints(dailyTransaction);

    // 보너스가 있으면 추가 적립
    if (bonusPoints > 0) {
      const bonusTransaction: PointTransaction = {
        id: `pt_bonus_${Date.now()}`,
        type: 'STREAK_BONUS',
        amount: bonusPoints,
        description: `${streak}일 연속 출석 보너스`,
        createdAt: new Date().toISOString(),
      };
      addPoints(bonusTransaction);
    }

    setUser({
      ...user,
      currentStreak: streak,
      lastAttendanceDate: result.record.date,
      totalPoints: user.totalPoints + result.record.pointsEarned + bonusPoints,
    });

    return { ...result, bonusPoints };
  }, [user, addAttendance, addPoints, setUser]);

  const hasCheckedInToday = useCallback(() => {
    if (!user?.lastAttendanceDate) return false;
    const today = new Date().toISOString().split('T')[0];
    return user.lastAttendanceDate === today;
  }, [user]);

  return { monthlyRecords, checkIn, hasCheckedInToday };
}
