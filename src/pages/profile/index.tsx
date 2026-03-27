import { createRoute, useNavigation } from '@granite-js/react-native';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { useAppStore } from '../../store';
import { COLORS } from '../../constants';

export const Route = createRoute('/profile', {
  component: ProfilePage,
});

function ProfilePage() {
  const user = useAppStore((s) => s.user);

  if (!user) return null;

  return (
    <View style={styles.container}>
      {/* 프로필 카드 */}
      <View style={styles.profileCard}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{user.nickname[0]}</Text>
        </View>
        <Text style={styles.nickname}>{user.nickname}</Text>
      </View>

      {/* 통계 */}
      <View style={styles.statsGrid}>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{user.totalPoints.toLocaleString()}</Text>
          <Text style={styles.statLabel}>총 포인트</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{user.currentStreak}</Text>
          <Text style={styles.statLabel}>연속 출석</Text>
        </View>
      </View>

      {/* 메뉴 */}
      <View style={styles.menuList}>
        <MenuItem label="포인트 내역" />
        <MenuItem label="공지사항" />
        <MenuItem label="이용약관" />
        <MenuItem label="개인정보처리방침" />
      </View>
    </View>
  );
}

function MenuItem({ label }: { label: string }) {
  return (
    <Pressable style={styles.menuItem}>
      <Text style={styles.menuLabel}>{label}</Text>
      <Text style={styles.menuArrow}>›</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  profileCard: { alignItems: 'center', marginBottom: 24 },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  avatarText: { fontSize: 28, fontWeight: '700', color: '#FFF' },
  nickname: { fontSize: 20, fontWeight: '700', color: COLORS.textPrimary },
  statsGrid: { flexDirection: 'row', gap: 12, marginBottom: 32 },
  statItem: {
    flex: 1,
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  statValue: { fontSize: 22, fontWeight: '700', color: COLORS.primary },
  statLabel: { fontSize: 13, color: COLORS.textSecondary, marginTop: 4 },
  menuList: { borderTopWidth: 1, borderTopColor: COLORS.surface },
  menuItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.surface,
  },
  menuLabel: { fontSize: 15, color: COLORS.textPrimary },
  menuArrow: { fontSize: 20, color: COLORS.textTertiary },
});
