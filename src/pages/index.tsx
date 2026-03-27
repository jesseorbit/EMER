import { createRoute, useNavigation } from '@granite-js/react-native';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { useAuth } from '../hooks/useAuth';
import { useAppStore } from '../store';
import { COLORS } from '../constants';

export const Route = createRoute('/', {
  component: HomePage,
});

function HomePage() {
  const navigation = useNavigation();
  const { user, login, isLoggingIn } = useAuth();
  const totalPoints = useAppStore((s) => s.user?.totalPoints ?? 0);
  const streak = useAppStore((s) => s.user?.currentStreak ?? 0);

  if (!user) {
    return (
      <View style={styles.center}>
        <Text style={styles.logo}>EMER</Text>
        <Text style={styles.subtitle}>매일 출석하고 포인트 받기</Text>
        <Pressable style={styles.loginButton} onPress={login} disabled={isLoggingIn}>
          <Text style={styles.loginButtonText}>
            {isLoggingIn ? '로그인 중...' : '토스로 시작하기'}
          </Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* 상단 유저 정보 */}
      <View style={styles.header}>
        <Text style={styles.greeting}>안녕하세요, {user.nickname}님</Text>
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{totalPoints.toLocaleString()}</Text>
            <Text style={styles.statLabel}>포인트</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{streak}일</Text>
            <Text style={styles.statLabel}>연속 출석</Text>
          </View>
        </View>
      </View>

      {/* 메뉴 카드 */}
      <View style={styles.menuGrid}>
        <Pressable
          style={[styles.menuCard, { backgroundColor: '#EBF4FF' }]}
          onPress={() => navigation.navigate('/attendance')}
        >
          <Text style={styles.menuEmoji}>📅</Text>
          <Text style={styles.menuTitle}>출석 체크</Text>
          <Text style={styles.menuDesc}>매일 출석하고 포인트 받기</Text>
        </Pressable>

        <Pressable
          style={[styles.menuCard, { backgroundColor: '#FFF4EB' }]}
          onPress={() => navigation.navigate('/ladder')}
        >
          <Text style={styles.menuEmoji}>🪜</Text>
          <Text style={styles.menuTitle}>사다리 타기</Text>
          <Text style={styles.menuDesc}>운명의 사다리를 타보세요</Text>
        </Pressable>

        <Pressable
          style={[styles.menuCard, { backgroundColor: '#EBFFF4' }]}
          onPress={() => navigation.navigate('/points')}
        >
          <Text style={styles.menuEmoji}>💰</Text>
          <Text style={styles.menuTitle}>포인트 내역</Text>
          <Text style={styles.menuDesc}>적립/사용 내역 확인</Text>
        </Pressable>

        <Pressable
          style={[styles.menuCard, { backgroundColor: '#F4EBFF' }]}
          onPress={() => navigation.navigate('/profile')}
        >
          <Text style={styles.menuEmoji}>👤</Text>
          <Text style={styles.menuTitle}>내 정보</Text>
          <Text style={styles.menuDesc}>프로필 및 설정</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 40 },
  logo: { fontSize: 48, fontWeight: '800', color: COLORS.primary, marginBottom: 8 },
  subtitle: { fontSize: 16, color: COLORS.textSecondary, marginBottom: 40 },
  loginButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 12,
  },
  loginButtonText: { color: '#FFF', fontSize: 16, fontWeight: '600' },
  header: { marginBottom: 24 },
  greeting: { fontSize: 22, fontWeight: '700', color: COLORS.textPrimary, marginBottom: 16 },
  statsRow: { flexDirection: 'row', gap: 12 },
  statCard: {
    flex: 1,
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  statValue: { fontSize: 24, fontWeight: '700', color: COLORS.primary },
  statLabel: { fontSize: 13, color: COLORS.textSecondary, marginTop: 4 },
  menuGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  menuCard: {
    width: '48%',
    borderRadius: 16,
    padding: 20,
  },
  menuEmoji: { fontSize: 32, marginBottom: 8 },
  menuTitle: { fontSize: 16, fontWeight: '700', color: COLORS.textPrimary, marginBottom: 4 },
  menuDesc: { fontSize: 12, color: COLORS.textSecondary },
});
