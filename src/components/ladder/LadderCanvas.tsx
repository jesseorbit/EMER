import { View, Text, StyleSheet } from 'react-native';
import { Pressable } from 'react-native';
import { COLORS } from '../../constants';

interface Props {
  participants: string[];
  results: string[];
  ladderData: boolean[][];
  selectedIndex: number | null;
  resultMapping: number[] | null;
  isRunning: boolean;
  isDone: boolean;
}

export function LadderCanvas({
  participants,
  results,
  ladderData,
  selectedIndex,
  resultMapping,
  isRunning,
  isDone,
}: Props) {
  const cols = participants.length;
  const rows = ladderData.length;
  const colWidth = 100 / cols;

  return (
    <View style={styles.container}>
      {/* 참가자 이름 (상단) */}
      <View style={styles.nameRow}>
        {participants.map((name, idx) => (
          <Pressable key={idx} style={[styles.nameCell, { width: `${colWidth}%` }]}>
            <View
              style={[
                styles.nameBadge,
                selectedIndex === idx && styles.nameBadgeSelected,
              ]}
            >
              <Text
                style={[
                  styles.nameText,
                  selectedIndex === idx && styles.nameTextSelected,
                ]}
              >
                {name}
              </Text>
            </View>
          </Pressable>
        ))}
      </View>

      {/* 사다리 본체 */}
      <View style={styles.ladderBody}>
        {/* 세로선 */}
        {Array.from({ length: cols }).map((_, colIdx) => (
          <View
            key={`v${colIdx}`}
            style={[
              styles.verticalLine,
              {
                left: `${colWidth * colIdx + colWidth / 2}%`,
                height: '100%',
              },
              isHighlighted(colIdx, selectedIndex, resultMapping, isDone) &&
                styles.highlightedLine,
            ]}
          />
        ))}

        {/* 가로선 (rungs) */}
        {ladderData.map((row, rowIdx) =>
          row.map(
            (hasRung, colIdx) =>
              hasRung && (
                <View
                  key={`h${rowIdx}-${colIdx}`}
                  style={[
                    styles.horizontalLine,
                    {
                      top: `${((rowIdx + 1) / (rows + 1)) * 100}%`,
                      left: `${colWidth * colIdx + colWidth / 2}%`,
                      width: `${colWidth}%`,
                    },
                  ]}
                />
              ),
          ),
        )}
      </View>

      {/* 결과 (하단) */}
      <View style={styles.nameRow}>
        {results.map((result, idx) => {
          const isRevealed =
            isDone && selectedIndex != null && resultMapping?.[selectedIndex] === idx;
          return (
            <View key={idx} style={[styles.nameCell, { width: `${colWidth}%` }]}>
              <View style={[styles.resultBadge, isRevealed && styles.resultBadgeRevealed]}>
                <Text
                  style={[
                    styles.resultText,
                    !isDone && styles.resultHidden,
                    isRevealed && styles.resultTextRevealed,
                  ]}
                >
                  {isDone ? result : '?'}
                </Text>
              </View>
            </View>
          );
        })}
      </View>
    </View>
  );
}

function isHighlighted(
  colIdx: number,
  selectedIndex: number | null,
  resultMapping: number[] | null,
  isDone: boolean,
) {
  if (!isDone || selectedIndex == null || !resultMapping) return false;
  return colIdx === selectedIndex || colIdx === resultMapping[selectedIndex];
}

const styles = StyleSheet.create({
  container: { marginVertical: 20 },
  nameRow: { flexDirection: 'row' },
  nameCell: { alignItems: 'center', paddingVertical: 8 },
  nameBadge: {
    backgroundColor: COLORS.surface,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  nameBadgeSelected: { backgroundColor: COLORS.primary },
  nameText: { fontSize: 13, fontWeight: '600', color: COLORS.textPrimary },
  nameTextSelected: { color: '#FFF' },
  ladderBody: {
    height: 300,
    position: 'relative',
    marginVertical: 4,
  },
  verticalLine: {
    position: 'absolute',
    width: 3,
    backgroundColor: COLORS.textTertiary,
  },
  highlightedLine: { backgroundColor: COLORS.primary, width: 4 },
  horizontalLine: {
    position: 'absolute',
    height: 3,
    backgroundColor: COLORS.textPrimary,
  },
  resultBadge: {
    backgroundColor: COLORS.surface,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  resultBadgeRevealed: { backgroundColor: COLORS.secondary },
  resultText: { fontSize: 13, fontWeight: '600', color: COLORS.textPrimary },
  resultHidden: { color: COLORS.textTertiary },
  resultTextRevealed: { color: '#FFF' },
});
