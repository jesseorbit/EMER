import { createRoute } from '@granite-js/react-native';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useAttendance } from '../../hooks/useAttendance';
import { CalendarGrid } from '../../components/attendance/CalendarGrid';
import { StreakBanner } from '../../components/attendance/StreakBanner';
import { useAppStore } from '../../store';
import { COLORS } from '../../constants';

export const Route = createRoute('/attendance', {
  component: AttendancePage,
});

function AttendancePage() {
  const { user } = useAuth();
  const { monthlyRecords, checkIn, hasCheckedInToday } = useAttendance();
  const [checkedIn, setCheckedIn] = useState(false);
  const [showReward, setShowReward] = useState(false);
  const [rewardInfo, setRewardInfo] = useState<{ points: number; bonus: number } | null>(null);

  useEffect(() => {
    setCheckedIn(hasCheckedInToday());
  }, [hasCheckedInToday]);

  const handleCheckIn = async () => {
    if (checkedIn) return;
    try {
      const result = await checkIn();
      setCheckedIn(true);
      setRewardInfo({
        points: result.record.pointsEarned,
        bonus: result.bonusPoints,
      });
      setShowReward(true);
    } catch {
      // 에러 처리
    }
  };

  if (!user) return null;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>출석 체크</Text>

      {/* 연속 출석 배너 */}
      <StreakBanner streak={user.currentStreak} />

      {/* 출석 버튼 */}
      <Pressable
        style={[styles.checkInButton, checkedIn && styles.checkInButtonDone]}
        onPress={handleCheckIn}
        disabled={checkedIn}
      >
        <Text style={styles.checkInEmoji}>{checkedIn ? '✅' : '👆'}</Text>
        <Text style={[styles.checkInText, checkedIn && styles.checkInTextDone]}>
          {checkedIn ? '오늘 출석 완료!' : '출석 체크하기'}
        </Text>
      </Pressable>

      {/* 보상 모달 */}
      {showReward && rewardInfo && (
        <View style={styles.rewardOverlay}>
          <View style={styles.rewardCard}>
            <Text style={styles.rewardTitle}>출석 완료!</Text>
            <Text style={styles.rewardPoints}>+{rewardInfo.points}P</Text>
            {rewardInfo.bonus > 0 && (
              <Text style={styles.rewardBonus}>
                연속 출석 보너스 +{rewardInfo.bonus}P
              </Text>
            )}
            <Pressable
              style={styles.rewardClose}
              onPress={() => setShowReward(false)}
            >
              <Text style={styles.rewardCloseText}>확인</Text>
            </Pressable>
          </View>
        </View>
      )}

      {/* 달력 */}
      <CalendarGrid records={monthlyRecords} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  title: { fontSize: 24, fontWeight: '700', color: COLORS.textPrimary, marginBottom: 20 },
  checkInButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    marginBottom: 24,
  },
  checkInButtonDone: { backgroundColor: COLORS.surface },
  checkInEmoji: { fontSize: 40, marginBottom: 8 },
  checkInText: { fontSize: 18, fontWeight: '700', color: '#FFF' },
  checkInTextDone: { color: COLORS.textSecondary },
  rewardOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  rewardCard: {
    backgroundColor: '#FFF',
    borderRadius: 20,
    padding: 32,
    alignItems: 'center',
    width: '80%',
  },
  rewardTitle: { fontSize: 20, fontWeight: '700', marginBottom: 12 },
  rewardPoints: { fontSize: 36, fontWeight: '800', color: COLORS.primary, marginBottom: 8 },
  rewardBonus: { fontSize: 16, color: COLORS.streak, fontWeight: '600', marginBottom: 20 },
  rewardClose: {
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    paddingHorizontal: 32,
    paddingVertical: 12,
  },
  rewardCloseText: { color: '#FFF', fontSize: 16, fontWeight: '600' },
});
