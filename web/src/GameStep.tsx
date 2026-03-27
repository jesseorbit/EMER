import { useState, useEffect, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import { generateGrid, computeLayout, computeAllPaths } from './ladder';

interface Props {
  participants: string[];
  results: string[];
  onReset: () => void;
}

const PATH_COLORS = [
  '#3182f6', '#ff6b6b', '#51cf66', '#ffd43b',
  '#cc5de8', '#ff922b', '#20c997', '#f06595',
];

type Phase = 'drawing' | 'tracing' | 'done';

const SVG_WIDTH = 600;
const SVG_HEIGHT = 500;
const NUM_ROWS = 8;

export default function GameStep({ participants, results, onReset }: Props) {
  const n = participants.length;
  const [phase, setPhase] = useState<Phase>('drawing');
  const [winnerIndex, setWinnerIndex] = useState(-1);

  // 사다리 데이터 생성 (최초 1회)
  const { grid, layout, pathDs, mapping } = useMemo(() => {
    const grid = generateGrid(n, NUM_ROWS);
    const layout = computeLayout(n, NUM_ROWS, SVG_WIDTH, SVG_HEIGHT);
    const { pathDs, mapping } = computeAllPaths(
      n, grid, layout.colXs, layout.rowYs, layout.ladderTop, layout.ladderBottom,
    );
    return { grid, layout, pathDs, mapping };
  }, [n]);

  // 당첨자 찾기
  const coffeeResultIndex = results.findIndex((r) => r.includes('당첨'));

  // 애니메이션 시퀀스
  useEffect(() => {
    // 사다리 구조 그리기 → 경로 추적 → 완료
    const drawTimer = setTimeout(() => setPhase('tracing'), 1200);
    const traceTimer = setTimeout(() => {
      setPhase('done');
      // 당첨자 계산
      const winner = mapping.findIndex((endCol) => endCol === coffeeResultIndex);
      setWinnerIndex(winner);
    }, 1200 + 2200);

    return () => {
      clearTimeout(drawTimer);
      clearTimeout(traceTimer);
    };
  }, [mapping, coffeeResultIndex]);

  // 컨페티 발사
  useEffect(() => {
    if (phase !== 'done') return;

    const fire = () => {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.65 },
        colors: ['#3182f6', '#ff6b6b', '#ffd43b', '#51cf66', '#cc5de8'],
      });
    };
    fire();
    const t = setTimeout(fire, 400);
    return () => clearTimeout(t);
  }, [phase]);

  // 가로줄 데이터를 SVG 렌더용으로 변환
  const rungs = useMemo(() => {
    const items: { x1: number; x2: number; y: number; key: string }[] = [];
    grid.forEach((row, r) => {
      row.forEach((has, g) => {
        if (has) {
          items.push({
            x1: layout.colXs[g],
            x2: layout.colXs[g + 1],
            y: layout.rowYs[r],
            key: `${r}-${g}`,
          });
        }
      });
    });
    return items;
  }, [grid, layout]);

  const handleShare = useCallback(() => {
    if (winnerIndex < 0) return;
    const text = `☕️ 커피 내기 결과: ${participants[winnerIndex]}님이 당첨!`;
    if (navigator.share) {
      navigator.share({ text });
    } else {
      navigator.clipboard.writeText(text);
    }
  }, [winnerIndex, participants]);

  return (
    <div className="flex-1 flex flex-col pb-8">
      {/* SVG 사다리 */}
      <div className="flex-1 flex items-center justify-center px-2 pt-6">
        <svg
          viewBox={`0 0 ${SVG_WIDTH} ${SVG_HEIGHT}`}
          className="w-full max-h-[65vh]"
          preserveAspectRatio="xMidYMid meet"
        >
          {/* 1) 세로선 */}
          {layout.colXs.map((x, i) => (
            <motion.line
              key={`v-${i}`}
              x1={x} y1={layout.ladderTop} x2={x} y2={layout.ladderBottom}
              stroke="#e5e8eb"
              strokeWidth={2.5}
              strokeLinecap="round"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 0.6, delay: i * 0.06, ease: 'easeOut' }}
            />
          ))}

          {/* 2) 가로줄 */}
          {rungs.map((rung, i) => (
            <motion.line
              key={rung.key}
              x1={rung.x1} y1={rung.y} x2={rung.x2} y2={rung.y}
              stroke="#d1d6db"
              strokeWidth={2.5}
              strokeLinecap="round"
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: 1 }}
              transition={{ duration: 0.3, delay: 0.5 + i * 0.04, ease: 'easeOut' }}
            />
          ))}

          {/* 3) 경로 애니메이션 */}
          {(phase === 'tracing' || phase === 'done') && pathDs.map((d, i) => (
            <motion.path
              key={`path-${i}`}
              d={d}
              fill="none"
              stroke={PATH_COLORS[i % PATH_COLORS.length]}
              strokeWidth={3.5}
              strokeLinecap="round"
              strokeLinejoin="round"
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: 1 }}
              transition={{
                pathLength: { duration: 2, delay: i * 0.12, ease: 'easeInOut' },
                opacity: { duration: 0.2 },
              }}
            />
          ))}

          {/* 4) 상단 이름 */}
          {participants.map((name, i) => {
            const x = layout.colXs[i];
            const isWinner = phase === 'done' && winnerIndex === i;
            return (
              <g key={`name-${i}`}>
                <motion.rect
                  x={x - 32} y={8} width={64} height={32} rx={16}
                  fill={isWinner ? PATH_COLORS[i % PATH_COLORS.length] : '#f2f4f6'}
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{
                    scale: isWinner ? [1, 1.15, 1] : 1,
                    opacity: 1,
                  }}
                  transition={{
                    scale: isWinner
                      ? { duration: 0.5, times: [0, 0.5, 1] }
                      : { duration: 0.3, delay: i * 0.05 },
                    opacity: { duration: 0.3, delay: i * 0.05 },
                  }}
                  style={{ originX: `${x}px`, originY: '24px' }}
                />
                <motion.text
                  x={x} y={29}
                  textAnchor="middle"
                  className="text-[13px] font-semibold select-none pointer-events-none"
                  fill={isWinner ? '#ffffff' : '#4e5968'}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3, delay: 0.1 + i * 0.05 }}
                >
                  {name}
                </motion.text>
              </g>
            );
          })}

          {/* 5) 하단 결과 */}
          {results.map((result, i) => {
            const x = layout.colXs[i];
            const isRevealed = phase === 'done';
            const isCoffee = result.includes('당첨');
            // 어떤 참가자가 이 결과에 도착했는지 찾기
            const fromParticipant = mapping.findIndex((endCol) => endCol === i);
            const color = PATH_COLORS[fromParticipant % PATH_COLORS.length];

            return (
              <g key={`result-${i}`}>
                <motion.rect
                  x={x - 36} y={SVG_HEIGHT - 50} width={72} height={32} rx={16}
                  fill={isRevealed ? (isCoffee ? color : '#f2f4f6') : '#e5e8eb'}
                  initial={{ opacity: 0 }}
                  animate={{
                    opacity: 1,
                    scale: isRevealed && isCoffee ? [1, 1.2, 1] : 1,
                  }}
                  transition={{
                    opacity: { duration: 0.3, delay: i * 0.05 },
                    scale: { duration: 0.4, delay: 0.1 },
                  }}
                  style={{ originX: `${x}px`, originY: `${SVG_HEIGHT - 34}px` }}
                />
                <motion.text
                  x={x} y={SVG_HEIGHT - 29}
                  textAnchor="middle"
                  className="text-[12px] font-semibold select-none pointer-events-none"
                  fill={isRevealed ? (isCoffee ? '#ffffff' : '#6b7684') : '#b0b8c1'}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3, delay: 0.1 + i * 0.05 }}
                >
                  {isRevealed ? result : '?'}
                </motion.text>
              </g>
            );
          })}
        </svg>
      </div>

      {/* 결과 발표 오버레이 */}
      <AnimatePresence>
        {phase === 'done' && winnerIndex >= 0 && (
          <motion.div
            initial={{ y: 80, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25, delay: 0.3 }}
            className="px-5"
          >
            {/* 결과 카드 */}
            <div className="bg-white rounded-3xl shadow-xl shadow-black/8 border border-toss-gray-100
                            p-6 text-center">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 400, damping: 15, delay: 0.5 }}
                className="text-[48px] mb-2"
              >
                ☕️
              </motion.div>
              <motion.p
                initial={{ y: 10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.6 }}
                className="text-[22px] font-bold text-toss-gray-900"
              >
                <span
                  className="text-toss-blue"
                  style={{ color: PATH_COLORS[winnerIndex % PATH_COLORS.length] }}
                >
                  {participants[winnerIndex]}
                </span>
                님이 당첨!
              </motion.p>
              <motion.p
                initial={{ y: 10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.7 }}
                className="text-[14px] text-toss-gray-500 mt-1"
              >
                오늘 커피는 맛있게 사주세요 ☺️
              </motion.p>

              {/* 버튼들 */}
              <motion.div
                initial={{ y: 10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.8 }}
                className="mt-6 flex gap-3"
              >
                <button
                  onClick={handleShare}
                  className="flex-1 py-3.5 rounded-xl bg-toss-gray-100 text-toss-gray-700
                             text-[14px] font-semibold hover:bg-toss-gray-200 transition-colors"
                >
                  결과 공유
                </button>
                <button
                  onClick={onReset}
                  className="flex-1 py-3.5 rounded-xl bg-toss-blue text-white
                             text-[14px] font-semibold hover:bg-toss-blue-dark transition-colors
                             shadow-lg shadow-toss-blue/20"
                >
                  다시 하기
                </button>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
