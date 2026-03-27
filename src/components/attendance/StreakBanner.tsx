import { View, Text, StyleSheet } from 'react-native';
import { ATTENDANCE_POINTS, COLORS } from '../../constants';

interface Props {
  streak: number;
}

export function StreakBanner({ streak }: Props) {
  const nextMilestone = getNextMilestone(streak);

  return (
    <View style={styles.container}>
      <View style={styles.row}>
        <Text style={styles.streakNumber}>{streak}</Text>
        <Text style={styles.streakLabel}>일 연속 출석 중</Text>
      </View>
      {nextMilestone && (
        <View style={styles.progressRow}>
          <Text style={styles.nextText}>
            {nextMilestone.days}일 달성까지 {nextMilestone.remaining}일 남음
          </Text>
          <View style={styles.progressBar}>
            <View
              style={[styles.progressFill, { width: `${nextMilestone.progress}%` }]}
            />
          </View>
          <Text style={styles.bonusText}>보너스 +{nextMilestone.bonus}P</Text>
        </View>
      )}
    </View>
  );
}

function getNextMilestone(streak: number) {
  const milestones = [
    { days: 3, bonus: ATTENDANCE_POINTS.STREAK_3 },
    { days: 7, bonus: ATTENDANCE_POINTS.STREAK_7 },
    { days: 14, bonus: ATTENDANCE_POINTS.STREAK_14 },
    { days: 30, bonus: ATTENDANCE_POINTS.STREAK_30 },
  ];

  const next = milestones.find((m) => m.days > streak);
  if (!next) return null;

  const prev = milestones.filter((m) => m.days <= streak).pop();
  const start = prev?.days ?? 0;
  const progress = ((streak - start) / (next.days - start)) * 100;

  return {
    days: next.days,
    bonus: next.bonus,
    remaining: next.days - streak,
    progress: Math.min(progress, 100),
  };
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFF9E6',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
  },
  row: { flexDirection: 'row', alignItems: 'baseline', marginBottom: 12 },
  streakNumber: { fontSize: 32, fontWeight: '800', color: COLORS.streak },
  streakLabel: { fontSize: 16, fontWeight: '600', color: COLORS.textPrimary, marginLeft: 4 },
  progressRow: {},
  nextText: { fontSize: 13, color: COLORS.textSecondary, marginBottom: 8 },
  progressBar: {
    height: 8,
    backgroundColor: '#E8E8E8',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 4,
  },
  progressFill: {
    height: '100%',
    backgroundColor: COLORS.streak,
    borderRadius: 4,
  },
  bonusText: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.streak,
    textAlign: 'right',
  },
});
