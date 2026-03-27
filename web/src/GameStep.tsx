import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
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

const SVG_WIDTH = 600;
const SVG_HEIGHT = 500;
const NUM_ROWS = 8;
const TRACE_DURATION = 1.6; // 경로 애니메이션 시간(초)

export default function GameStep({ participants, results, onReset }: Props) {
  const n = participants.length;

  // 공개된 참가자 인덱스들 (순서대로)
  const [revealedPaths, setRevealedPaths] = useState<number[]>([]);
  // 현재 애니메이션 중인 참가자 인덱스
  const [tracingIndex, setTracingIndex] = useState<number | null>(null);
  // 사다리 구조 그리기 완료 여부
  const [structureReady, setStructureReady] = useState(false);
  const structureTimer = useRef<ReturnType<typeof setTimeout>>();

  // 사다리 데이터 생성 (최초 1회)
  const { grid, layout, pathDs, mapping } = useMemo(() => {
    const grid = generateGrid(n, NUM_ROWS);
    const layout = computeLayout(n, NUM_ROWS, SVG_WIDTH, SVG_HEIGHT);
    const { pathDs, mapping } = computeAllPaths(
      n, grid, layout.colXs, layout.rowYs, layout.ladderTop, layout.ladderBottom,
    );
    return { grid, layout, pathDs, mapping };
  }, [n]);

  // 사다리 구조 그리기 완료 타이머
  useEffect(() => {
    structureTimer.current = setTimeout(() => setStructureReady(true), 1000);
    return () => clearTimeout(structureTimer.current);
  }, []);

  // 당첨 결과 인덱스
  const coffeeResultIndex = results.findIndex((r) => r.includes('당첨'));

  // 모든 사람이 공개되었는지
  const allRevealed = revealedPaths.length === n;

  // 당첨자 인덱스
  const winnerIndex = mapping.findIndex((endCol) => endCol === coffeeResultIndex);

  // 이 참가자가 이미 공개/진행 중인지
  const isRevealed = (i: number) => revealedPaths.includes(i);
  const isTracing = (i: number) => tracingIndex === i;
  const isAvailable = (i: number) => structureReady && !isRevealed(i) && tracingIndex === null;

  // 참가자 클릭 → 사다리 타기
  const handleSelect = useCallback((index: number) => {
    if (!isAvailable(index)) return;

    setTracingIndex(index);

    // 경로 애니메이션 완료 후 공개 처리
    setTimeout(() => {
      setRevealedPaths((prev) => [...prev, index]);
      setTracingIndex(null);

      // 당첨자가 공개되었으면 컨페티
      if (mapping[index] === coffeeResultIndex) {
        setTimeout(() => {
          confetti({
            particleCount: 100,
            spread: 80,
            origin: { y: 0.6 },
            colors: ['#3182f6', '#ff6b6b', '#ffd43b', '#51cf66', '#cc5de8'],
          });
          setTimeout(() => confetti({
            particleCount: 60,
            spread: 60,
            origin: { y: 0.65 },
            colors: ['#3182f6', '#ff6b6b', '#ffd43b', '#51cf66', '#cc5de8'],
          }), 300);
        }, 100);
      }
    }, TRACE_DURATION * 1000 + 200);
  }, [structureReady, revealedPaths, tracingIndex, mapping, coffeeResultIndex]);

  // 전체 공개
  const handleRevealAll = useCallback(() => {
    if (tracingIndex !== null) return;
    const remaining = participants.map((_, i) => i).filter((i) => !revealedPaths.includes(i));
    setRevealedPaths((prev) => [...prev, ...remaining]);

    if (!revealedPaths.includes(winnerIndex)) {
      setTimeout(() => {
        confetti({
          particleCount: 100, spread: 80, origin: { y: 0.6 },
          colors: ['#3182f6', '#ff6b6b', '#ffd43b', '#51cf66', '#cc5de8'],
        });
      }, 100);
    }
  }, [tracingIndex, revealedPaths, participants, winnerIndex]);

  // 가로줄 데이터
  const rungs = useMemo(() => {
    const items: { x1: number; x2: number; y: number; key: string }[] = [];
    grid.forEach((row, r) => {
      row.forEach((has, g) => {
        if (has) {
          items.push({
            x1: layout.colXs[g], x2: layout.colXs[g + 1],
            y: layout.rowYs[r], key: `${r}-${g}`,
          });
        }
      });
    });
    return items;
  }, [grid, layout]);

  const handleShare = useCallback(() => {
    const text = `☕️ 커피 내기 결과: ${participants[winnerIndex]}님이 당첨!`;
    if (navigator.share) {
      navigator.share({ text });
    } else {
      navigator.clipboard.writeText(text);
    }
  }, [winnerIndex, participants]);

  return (
    <div className="flex-1 flex flex-col pb-8">
      {/* 안내 텍스트 */}
      <AnimatePresence mode="wait">
        {!allRevealed ? (
          <motion.p
            key="guide"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="text-center text-[14px] text-toss-gray-500 pt-5 font-medium"
          >
            {tracingIndex !== null
              ? `${participants[tracingIndex]}의 운명은...`
              : structureReady
                ? '이름을 눌러 사다리를 타세요'
                : '사다리를 만들고 있어요...'}
          </motion.p>
        ) : (
          <motion.p
            key="done"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center text-[14px] text-toss-gray-500 pt-5 font-medium"
          >
            모두 공개되었어요!
          </motion.p>
        )}
      </AnimatePresence>

      {/* SVG 사다리 */}
      <div className="flex-1 flex items-center justify-center px-2 pt-2">
        <svg
          viewBox={`0 0 ${SVG_WIDTH} ${SVG_HEIGHT}`}
          className="w-full max-h-[55vh]"
          preserveAspectRatio="xMidYMid meet"
        >
          {/* 1) 세로선 */}
          {layout.colXs.map((x, i) => (
            <motion.line
              key={`v-${i}`}
              x1={x} y1={layout.ladderTop} x2={x} y2={layout.ladderBottom}
              stroke="#e5e8eb" strokeWidth={2.5} strokeLinecap="round"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 0.5, delay: i * 0.06, ease: 'easeOut' }}
            />
          ))}

          {/* 2) 가로줄 */}
          {rungs.map((rung, i) => (
            <motion.line
              key={rung.key}
              x1={rung.x1} y1={rung.y} x2={rung.x2} y2={rung.y}
              stroke="#d1d6db" strokeWidth={2.5} strokeLinecap="round"
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: 1 }}
              transition={{ duration: 0.25, delay: 0.4 + i * 0.03, ease: 'easeOut' }}
            />
          ))}

          {/* 3) 공개된 경로들 (이미 완료된 것) */}
          {revealedPaths.map((pi) => (
            <path
              key={`revealed-${pi}`}
              d={pathDs[pi]}
              fill="none"
              stroke={PATH_COLORS[pi % PATH_COLORS.length]}
              strokeWidth={3.5}
              strokeLinecap="round"
              strokeLinejoin="round"
              opacity={0.85}
            />
          ))}

          {/* 4) 현재 애니메이션 중인 경로 */}
          {tracingIndex !== null && (
            <motion.path
              key={`tracing-${tracingIndex}`}
              d={pathDs[tracingIndex]}
              fill="none"
              stroke={PATH_COLORS[tracingIndex % PATH_COLORS.length]}
              strokeWidth={4}
              strokeLinecap="round"
              strokeLinejoin="round"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: TRACE_DURATION, ease: 'easeInOut' }}
            />
          )}

          {/* 5) 상단 이름 버튼 */}
          {participants.map((name, i) => {
            const x = layout.colXs[i];
            const revealed = isRevealed(i);
            const tracing = isTracing(i);
            const available = isAvailable(i);
            const color = PATH_COLORS[i % PATH_COLORS.length];
            const isCoffeeWinner = revealed && mapping[i] === coffeeResultIndex;

            return (
              <g
                key={`name-${i}`}
                onClick={() => handleSelect(i)}
                style={{ cursor: available ? 'pointer' : 'default' }}
              >
                {/* 선택 가능 표시 (펄스) */}
                {available && (
                  <motion.rect
                    x={x - 36} y={6} width={72} height={36} rx={18}
                    fill={color}
                    opacity={0.15}
                    animate={{ opacity: [0.08, 0.2, 0.08] }}
                    transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                  />
                )}

                {/* 배지 배경 */}
                <motion.rect
                  x={x - 34} y={8} width={68} height={32} rx={16}
                  fill={
                    tracing || revealed ? color
                    : available ? '#ffffff'
                    : '#f2f4f6'
                  }
                  stroke={available ? color : 'transparent'}
                  strokeWidth={available ? 2 : 0}
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{
                    scale: isCoffeeWinner ? [1, 1.15, 1] : 1,
                    opacity: 1,
                  }}
                  transition={{
                    scale: isCoffeeWinner ? { duration: 0.5 } : { duration: 0.3, delay: i * 0.05 },
                    opacity: { duration: 0.3, delay: i * 0.05 },
                  }}
                  style={{ originX: `${x}px`, originY: '24px' }}
                />

                {/* 이름 텍스트 */}
                <motion.text
                  x={x} y={29}
                  textAnchor="middle"
                  className="text-[13px] font-semibold select-none pointer-events-none"
                  fill={tracing || revealed ? '#ffffff' : available ? color : '#8b95a1'}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3, delay: 0.1 + i * 0.05 }}
                >
                  {name}
                </motion.text>
              </g>
            );
          })}

          {/* 6) 하단 결과 */}
          {results.map((result, i) => {
            const x = layout.colXs[i];
            const isCoffee = result.includes('당첨');
            // 이 결과 칸에 도착한 참가자 인덱스
            const arrivedFrom = mapping.findIndex((endCol) => endCol === i);
            const thisRevealed = isRevealed(arrivedFrom);
            const color = PATH_COLORS[arrivedFrom % PATH_COLORS.length];

            return (
              <g key={`result-${i}`}>
                <motion.rect
                  x={x - 38} y={SVG_HEIGHT - 52} width={76} height={34} rx={17}
                  fill={
                    thisRevealed
                      ? isCoffee ? color : '#f2f4f6'
                      : '#e5e8eb'
                  }
                  initial={{ opacity: 0 }}
                  animate={{
                    opacity: 1,
                    scale: thisRevealed && isCoffee ? [1, 1.2, 1] : 1,
                  }}
                  transition={{
                    opacity: { duration: 0.3, delay: i * 0.05 },
                    scale: { duration: 0.4 },
                  }}
                  style={{ originX: `${x}px`, originY: `${SVG_HEIGHT - 35}px` }}
                />
                <motion.text
                  x={x} y={SVG_HEIGHT - 30}
                  textAnchor="middle"
                  className="text-[12px] font-semibold select-none pointer-events-none"
                  fill={
                    thisRevealed
                      ? isCoffee ? '#ffffff' : '#6b7684'
                      : '#b0b8c1'
                  }
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3, delay: 0.1 + i * 0.05 }}
                >
                  {thisRevealed ? result : '?'}
                </motion.text>
              </g>
            );
          })}
        </svg>
      </div>

      {/* 하단 영역 */}
      <div className="px-5">
        <AnimatePresence mode="wait">
          {/* 전체 공개 전: 한꺼번에 공개 버튼 */}
          {!allRevealed && structureReady && tracingIndex === null && revealedPaths.length > 0 && (
            <motion.button
              key="reveal-all"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              whileTap={{ scale: 0.97 }}
              onClick={handleRevealAll}
              className="w-full py-3.5 rounded-xl border border-toss-gray-200
                         text-toss-gray-500 text-[14px] font-semibold
                         hover:bg-toss-gray-50 transition-colors mb-3"
            >
              나머지 한번에 공개
            </motion.button>
          )}

          {/* 전체 공개 후: 결과 카드 */}
          {allRevealed && winnerIndex >= 0 && (
            <motion.div
              key="result-card"
              initial={{ y: 40, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ type: 'spring', stiffness: 300, damping: 25, delay: 0.15 }}
            >
              <div className="bg-white rounded-3xl shadow-xl shadow-black/8
                              border border-toss-gray-100 p-6 text-center">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 15, delay: 0.3 }}
                  className="text-[48px] mb-2"
                >
                  ☕️
                </motion.div>
                <motion.p
                  initial={{ y: 10, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.4 }}
                  className="text-[22px] font-bold text-toss-gray-900"
                >
                  <span style={{ color: PATH_COLORS[winnerIndex % PATH_COLORS.length] }}>
                    {participants[winnerIndex]}
                  </span>
                  님이 당첨!
                </motion.p>
                <motion.p
                  initial={{ y: 10, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.5 }}
                  className="text-[14px] text-toss-gray-500 mt-1"
                >
                  오늘 커피는 맛있게 사주세요 ☺️
                </motion.p>

                <motion.div
                  initial={{ y: 10, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.6 }}
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
    </div>
  );
}
