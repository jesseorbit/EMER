import { View, Text, StyleSheet } from 'react-native';
import { COLORS, WEEKDAYS } from '../../constants';
import type { AttendanceRecord } from '../../types';

interface Props {
  records: AttendanceRecord[];
}

export function CalendarGrid({ records }: Props) {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();

  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const attendedDates = new Set(records.map((r) => r.date));

  const days: (number | null)[] = [];
  for (let i = 0; i < firstDay; i++) days.push(null);
  for (let d = 1; d <= daysInMonth; d++) days.push(d);

  const isAttended = (day: number) => {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return attendedDates.has(dateStr);
  };

  const isToday = (day: number) => day === now.getDate();

  return (
    <View style={styles.container}>
      <Text style={styles.monthTitle}>
        {year}년 {month + 1}월
      </Text>

      {/* 요일 헤더 */}
      <View style={styles.weekRow}>
        {WEEKDAYS.map((day) => (
          <View key={day} style={styles.weekCell}>
            <Text style={styles.weekText}>{day}</Text>
          </View>
        ))}
      </View>

      {/* 날짜 그리드 */}
      <View style={styles.grid}>
        {days.map((day, idx) => (
          <View key={idx} style={styles.dayCell}>
            {day != null && (
              <View
                style={[
                  styles.dayCircle,
                  isAttended(day) && styles.dayAttended,
                  isToday(day) && !isAttended(day) && styles.dayToday,
                ]}
              >
                <Text
                  style={[
                    styles.dayText,
                    isAttended(day) && styles.dayTextAttended,
                  ]}
                >
                  {day}
                </Text>
                {isAttended(day) && <Text style={styles.checkMark}>✓</Text>}
              </View>
            )}
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginTop: 8 },
  monthTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: 16,
  },
  weekRow: { flexDirection: 'row', marginBottom: 8 },
  weekCell: { flex: 1, alignItems: 'center' },
  weekText: { fontSize: 13, color: COLORS.textTertiary, fontWeight: '600' },
  grid: { flexDirection: 'row', flexWrap: 'wrap' },
  dayCell: {
    width: '14.28%',
    aspectRatio: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayAttended: { backgroundColor: COLORS.primary },
  dayToday: { borderWidth: 2, borderColor: COLORS.primary },
  dayText: { fontSize: 14, color: COLORS.textPrimary },
  dayTextAttended: { color: '#FFF', fontWeight: '600' },
  checkMark: { fontSize: 8, color: '#FFF', position: 'absolute', bottom: 2 },
});
