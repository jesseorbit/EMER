import { createRoute } from '@granite-js/react-native';
import { View, Text, StyleSheet, Pressable, TextInput, ScrollView } from 'react-native';
import { useState, useCallback } from 'react';
import { LadderCanvas } from '../../components/ladder/LadderCanvas';
import { COLORS, LADDER_CONFIG } from '../../constants';

export const Route = createRoute('/ladder', {
  component: LadderPage,
});

type Phase = 'setup' | 'ready' | 'running' | 'done';

function LadderPage() {
  const [phase, setPhase] = useState<Phase>('setup');
  const [participants, setParticipants] = useState<string[]>(['', '']);
  const [results, setResults] = useState<string[]>(['', '']);
  const [ladderData, setLadderData] = useState<boolean[][] | null>(null);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [resultMapping, setResultMapping] = useState<number[] | null>(null);

  const addParticipant = () => {
    if (participants.length >= LADDER_CONFIG.MAX_PARTICIPANTS) return;
    setParticipants([...participants, '']);
    setResults([...results, '']);
  };

  const removeParticipant = (idx: number) => {
    if (participants.length <= LADDER_CONFIG.MIN_PARTICIPANTS) return;
    setParticipants(participants.filter((_, i) => i !== idx));
    setResults(results.filter((_, i) => i !== idx));
  };

  const updateParticipant = (idx: number, value: string) => {
    const next = [...participants];
    next[idx] = value;
    setParticipants(next);
  };

  const updateResult = (idx: number, value: string) => {
    const next = [...results];
    next[idx] = value;
    setResults(next);
  };

  const generateLadder = useCallback(() => {
    const cols = participants.length - 1; // 사이 구간 수
    const rows = LADDER_CONFIG.MIN_RUNGS + Math.floor(Math.random() * 4);
    const grid: boolean[][] = [];

    for (let r = 0; r < rows; r++) {
      const row: boolean[] = [];
      for (let c = 0; c < cols; c++) {
        // 인접 가로줄이 겹치지 않도록
        const prevHas = c > 0 && row[c - 1];
        row.push(!prevHas && Math.random() > 0.4);
      }
      grid.push(row);
    }

    // 결과 매핑 계산
    const mapping: number[] = [];
    for (let start = 0; start < participants.length; start++) {
      let pos = start;
      for (let r = 0; r < rows; r++) {
        if (pos > 0 && grid[r][pos - 1]) {
          pos--;
        } else if (pos < cols && grid[r][pos]) {
          pos++;
        }
      }
      mapping.push(pos);
    }

    setLadderData(grid);
    setResultMapping(mapping);
    setPhase('ready');
  }, [participants.length]);

  const handleSelect = (index: number) => {
    setSelectedIndex(index);
    setPhase('running');
    // 애니메이션 후 결과 표시
    setTimeout(() => setPhase('done'), LADDER_CONFIG.ANIMATION_SPEED_MS);
  };

  const reset = () => {
    setPhase('setup');
    setLadderData(null);
    setSelectedIndex(null);
    setResultMapping(null);
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>사다리 타기</Text>

      {phase === 'setup' && (
        <View>
          {/* 참가자 입력 */}
          <Text style={styles.sectionTitle}>참가자</Text>
          {participants.map((name, idx) => (
            <View key={idx} style={styles.inputRow}>
              <TextInput
                style={styles.input}
                placeholder={`참가자 ${idx + 1}`}
                value={name}
                onChangeText={(v) => updateParticipant(idx, v)}
              />
              {participants.length > LADDER_CONFIG.MIN_PARTICIPANTS && (
                <Pressable onPress={() => removeParticipant(idx)} style={styles.removeBtn}>
                  <Text style={styles.removeBtnText}>✕</Text>
                </Pressable>
              )}
            </View>
          ))}
          {participants.length < LADDER_CONFIG.MAX_PARTICIPANTS && (
            <Pressable style={styles.addBtn} onPress={addParticipant}>
              <Text style={styles.addBtnText}>+ 참가자 추가</Text>
            </Pressable>
          )}

          {/* 결과 입력 */}
          <Text style={[styles.sectionTitle, { marginTop: 24 }]}>결과</Text>
          {results.map((result, idx) => (
            <View key={idx} style={styles.inputRow}>
              <TextInput
                style={styles.input}
                placeholder={`결과 ${idx + 1}`}
                value={result}
                onChangeText={(v) => updateResult(idx, v)}
              />
            </View>
          ))}

          {/* 시작 버튼 */}
          <Pressable
            style={[
              styles.startBtn,
              !canStart(participants, results) && styles.startBtnDisabled,
            ]}
            onPress={generateLadder}
            disabled={!canStart(participants, results)}
          >
            <Text style={styles.startBtnText}>사다리 만들기</Text>
          </Pressable>
        </View>
      )}

      {phase !== 'setup' && ladderData && (
        <View>
          <LadderCanvas
            participants={participants}
            results={results}
            ladderData={ladderData}
            selectedIndex={selectedIndex}
            resultMapping={resultMapping}
            isRunning={phase === 'running'}
            isDone={phase === 'done'}
          />

          {phase === 'done' && selectedIndex != null && resultMapping && (
            <View style={styles.resultCard}>
              <Text style={styles.resultTitle}>결과</Text>
              <Text style={styles.resultText}>
                {participants[selectedIndex]} → {results[resultMapping[selectedIndex]]}
              </Text>
            </View>
          )}

          <Pressable style={styles.resetBtn} onPress={reset}>
            <Text style={styles.resetBtnText}>다시 하기</Text>
          </Pressable>
        </View>
      )}
    </ScrollView>
  );
}

function canStart(participants: string[], results: string[]) {
  return (
    participants.every((p) => p.trim().length > 0) &&
    results.every((r) => r.trim().length > 0)
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  title: { fontSize: 24, fontWeight: '700', color: COLORS.textPrimary, marginBottom: 20 },
  sectionTitle: { fontSize: 16, fontWeight: '600', color: COLORS.textPrimary, marginBottom: 12 },
  inputRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  input: {
    flex: 1,
    backgroundColor: COLORS.surface,
    borderRadius: 10,
    padding: 14,
    fontSize: 15,
  },
  removeBtn: {
    marginLeft: 8,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.error,
    alignItems: 'center',
    justifyContent: 'center',
  },
  removeBtnText: { color: '#FFF', fontWeight: '700' },
  addBtn: {
    borderWidth: 1,
    borderColor: COLORS.textTertiary,
    borderStyle: 'dashed',
    borderRadius: 10,
    padding: 14,
    alignItems: 'center',
    marginTop: 4,
  },
  addBtnText: { color: COLORS.textSecondary, fontWeight: '600' },
  startBtn: {
    backgroundColor: COLORS.primary,
    borderRadius: 14,
    padding: 18,
    alignItems: 'center',
    marginTop: 32,
  },
  startBtnDisabled: { opacity: 0.4 },
  startBtnText: { color: '#FFF', fontSize: 16, fontWeight: '700' },
  resultCard: {
    backgroundColor: '#EBF4FF',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    marginTop: 20,
  },
  resultTitle: { fontSize: 14, color: COLORS.textSecondary, marginBottom: 8 },
  resultText: { fontSize: 22, fontWeight: '700', color: COLORS.primary },
  resetBtn: {
    borderWidth: 1,
    borderColor: COLORS.textTertiary,
    borderRadius: 14,
    padding: 16,
    alignItems: 'center',
    marginTop: 12,
  },
  resetBtnText: { color: COLORS.textSecondary, fontWeight: '600' },
});
