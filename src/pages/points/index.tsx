import { createRoute } from '@granite-js/react-native';
import { View, Text, StyleSheet, FlatList } from 'react-native';
import { useAppStore } from '../../store';
import { COLORS } from '../../constants';
import type { PointTransaction } from '../../types';

export const Route = createRoute('/points', {
  component: PointsPage,
});

function PointsPage() {
  const user = useAppStore((s) => s.user);
  const pointHistory = useAppStore((s) => s.pointHistory);

  if (!user) return null;

  return (
    <View style={styles.container}>
      {/* 총 포인트 */}
      <View style={styles.totalCard}>
        <Text style={styles.totalLabel}>보유 포인트</Text>
        <Text style={styles.totalValue}>{user.totalPoints.toLocaleString()}P</Text>
      </View>

      {/* 포인트 내역 */}
      <Text style={styles.sectionTitle}>포인트 내역</Text>
      <FlatList
        data={pointHistory}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <PointItem transaction={item} />}
        ListEmptyComponent={
          <Text style={styles.emptyText}>아직 포인트 내역이 없습니다</Text>
        }
      />
    </View>
  );
}

function PointItem({ transaction }: { transaction: PointTransaction }) {
  const isPositive = transaction.amount > 0;

  return (
    <View style={styles.item}>
      <View style={styles.itemLeft}>
        <Text style={styles.itemIcon}>{getTypeIcon(transaction.type)}</Text>
        <View>
          <Text style={styles.itemDesc}>{transaction.description}</Text>
          <Text style={styles.itemDate}>
            {new Date(transaction.createdAt).toLocaleDateString('ko-KR')}
          </Text>
        </View>
      </View>
      <Text style={[styles.itemAmount, isPositive ? styles.positive : styles.negative]}>
        {isPositive ? '+' : ''}{transaction.amount.toLocaleString()}P
      </Text>
    </View>
  );
}

function getTypeIcon(type: PointTransaction['type']) {
  switch (type) {
    case 'ATTENDANCE':
      return '📅';
    case 'STREAK_BONUS':
      return '🔥';
    case 'LADDER_REWARD':
      return '🪜';
    case 'SPENT':
      return '💸';
  }
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  totalCard: {
    backgroundColor: COLORS.primary,
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    marginBottom: 24,
  },
  totalLabel: { fontSize: 14, color: 'rgba(255,255,255,0.8)', marginBottom: 4 },
  totalValue: { fontSize: 36, fontWeight: '800', color: '#FFF' },
  sectionTitle: { fontSize: 16, fontWeight: '600', color: COLORS.textPrimary, marginBottom: 12 },
  item: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.surface,
  },
  itemLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  itemIcon: { fontSize: 24 },
  itemDesc: { fontSize: 15, fontWeight: '500', color: COLORS.textPrimary },
  itemDate: { fontSize: 12, color: COLORS.textTertiary, marginTop: 2 },
  itemAmount: { fontSize: 16, fontWeight: '700' },
  positive: { color: COLORS.primary },
  negative: { color: COLORS.error },
  emptyText: { textAlign: 'center', color: COLORS.textTertiary, marginTop: 40, fontSize: 14 },
});
