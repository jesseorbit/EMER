import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import { generateGrid, computeLayout, computeAllPaths, SVG_W, SVG_H } from './ladder';

interface Props {
  participants: string[];
  results: string[];
  onReset: () => void;
}

const PATH_COLORS = [
  '#3182f6', '#ff6b6b', '#51cf66', '#ffd43b',
  '#cc5de8', '#ff922b', '#20c997', '#f06595',
];

const NUM_ROWS = 8;
const TRACE_DURATION = 1.6;

export default function GameStep({ participants, results, onReset }: Props) {
  const n = participants.length;

  const [revealedPaths, setRevealedPaths] = useState<number[]>([]);
  const [tracingIndex, setTracingIndex] = useState<number | null>(null);
  const [structureReady, setStructureReady] = useState(false);
  const structureTimer = useRef<ReturnType<typeof setTimeout>>();

  const { grid, layout, pathDs, mapping } = useMemo(() => {
    const grid = generateGrid(n, NUM_ROWS);
    const layout = computeLayout(n, NUM_ROWS);
    const { pathDs, mapping } = computeAllPaths(
      n, grid, layout.colXs, layout.rowYs, layout.ladderTop, layout.ladderBottom,
    );
    return { grid, layout, pathDs, mapping };
  }, [n]);

  useEffect(() => {
    structureTimer.current = setTimeout(() => setStructureReady(true), 1000);
    return () => clearTimeout(structureTimer.current);
  }, []);

  const coffeeResultIndex = results.findIndex((r) => r.includes('당첨'));
  const allRevealed = revealedPaths.length === n;
  const winnerIndex = mapping.findIndex((endCol) => endCol === coffeeResultIndex);

  const isRevealed = (i: number) => revealedPaths.includes(i);
  const isTracing = (i: number) => tracingIndex === i;
  const isAvailable = (i: number) => structureReady && !isRevealed(i) && tracingIndex === null;

  const handleSelect = useCallback((index: number) => {
    if (!isAvailable(index)) return;
    setTracingIndex(index);

    setTimeout(() => {
      setRevealedPaths((prev) => [...prev, index]);
      setTracingIndex(null);

      if (mapping[index] === coffeeResultIndex) {
        setTimeout(() => {
          confetti({ particleCount: 100, spread: 80, origin: { y: 0.6 },
            colors: ['#3182f6', '#ff6b6b', '#ffd43b', '#51cf66', '#cc5de8'] });
          setTimeout(() => confetti({ particleCount: 60, spread: 60, origin: { y: 0.65 },
            colors: ['#3182f6', '#ff6b6b', '#ffd43b', '#51cf66', '#cc5de8'] }), 300);
        }, 100);
      }
    }, TRACE_DURATION * 1000 + 200);
  }, [structureReady, revealedPaths, tracingIndex, mapping, coffeeResultIndex]);

  const handleRevealAll = useCallback(() => {
    if (tracingIndex !== null) return;
    const remaining = participants.map((_, i) => i).filter((i) => !revealedPaths.includes(i));
    setRevealedPaths((prev) => [...prev, ...remaining]);

    if (!revealedPaths.includes(winnerIndex)) {
      setTimeout(() => {
        confetti({ particleCount: 100, spread: 80, origin: { y: 0.6 },
          colors: ['#3182f6', '#ff6b6b', '#ffd43b', '#51cf66', '#cc5de8'] });
      }, 100);
    }
  }, [tracingIndex, revealedPaths, participants, winnerIndex]);

  const rungs = useMemo(() => {
    const items: { x1: number; x2: number; y: number; key: string }[] = [];
    grid.forEach((row, r) => {
      row.forEach((has, g) => {
        if (has) {
          items.push({ x1: layout.colXs[g], x2: layout.colXs[g + 1], y: layout.rowYs[r], key: `${r}-${g}` });
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
    <div className="h-full flex flex-col overflow-hidden">
      {/* 안내 텍스트 */}
      <div className="shrink-0 pt-3 pb-1 px-5">
        <AnimatePresence mode="wait">
          {!allRevealed ? (
            <motion.p
              key="guide"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-center text-[14px] text-toss-gray-500 font-medium"
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
              className="text-center text-[14px] text-toss-gray-500 font-medium"
            >
              모두 공개되었어요!
            </motion.p>
          )}
        </AnimatePresence>
      </div>

      {/* SVG 사다리 — 남은 공간을 꽉 채움 */}
      <div className="flex-1 min-h-0 flex items-center justify-center px-1">
        <svg
          viewBox={`0 0 ${SVG_W} ${SVG_H}`}
          className="w-full h-full"
          preserveAspectRatio="xMidYMid meet"
        >
          {/* 세로선 */}
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

          {/* 가로줄 */}
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

          {/* 공개된 경로 */}
          {revealedPaths.map((pi) => (
            <path
              key={`revealed-${pi}`}
              d={pathDs[pi]} fill="none"
              stroke={PATH_COLORS[pi % PATH_COLORS.length]}
              strokeWidth={3.5} strokeLinecap="round" strokeLinejoin="round" opacity={0.85}
            />
          ))}

          {/* 현재 추적 중인 경로 */}
          {tracingIndex !== null && (
            <motion.path
              key={`tracing-${tracingIndex}`}
              d={pathDs[tracingIndex]} fill="none"
              stroke={PATH_COLORS[tracingIndex % PATH_COLORS.length]}
              strokeWidth={4} strokeLinecap="round" strokeLinejoin="round"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: TRACE_DURATION, ease: 'easeInOut' }}
            />
          )}

          {/* 상단 이름 */}
          {participants.map((name, i) => {
            const x = layout.colXs[i];
            const bw = layout.badgeWidth;
            const bh = 34;
            const revealed = isRevealed(i);
            const tracing = isTracing(i);
            const available = isAvailable(i);
            const color = PATH_COLORS[i % PATH_COLORS.length];
            const isCoffeeWinner = revealed && mapping[i] === coffeeResultIndex;
            const clipId = `cn-${i}`;

            return (
              <g key={`name-${i}`} onClick={() => handleSelect(i)}
                 style={{ cursor: available ? 'pointer' : 'default' }}>
                <clipPath id={clipId}>
                  <rect x={x - bw / 2 + 4} y={6} width={bw - 8} height={bh + 4} />
                </clipPath>

                {available && (
                  <motion.rect
                    x={x - bw / 2 - 3} y={5} width={bw + 6} height={bh + 6} rx={(bh + 6) / 2}
                    fill={color} opacity={0.15}
                    animate={{ opacity: [0.08, 0.2, 0.08] }}
                    transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                  />
                )}

                <motion.rect
                  x={x - bw / 2} y={8} width={bw} height={bh} rx={bh / 2}
                  fill={tracing || revealed ? color : available ? '#ffffff' : '#f2f4f6'}
                  stroke={available ? color : 'transparent'}
                  strokeWidth={available ? 2 : 0}
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: isCoffeeWinner ? [1, 1.15, 1] : 1, opacity: 1 }}
                  transition={{
                    scale: isCoffeeWinner ? { duration: 0.5 } : { duration: 0.3, delay: i * 0.05 },
                    opacity: { duration: 0.3, delay: i * 0.05 },
                  }}
                  style={{ originX: `${x}px`, originY: `${8 + bh / 2}px` }}
                />

                <motion.text
                  x={x} y={8 + bh / 2 + 5} textAnchor="middle" clipPath={`url(#${clipId})`}
                  className="text-[13px] font-semibold select-none pointer-events-none"
                  fill={tracing || revealed ? '#ffffff' : available ? color : '#8b95a1'}
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                  transition={{ duration: 0.3, delay: 0.1 + i * 0.05 }}
                >
                  {name}
                </motion.text>
              </g>
            );
          })}

          {/* 하단 결과 */}
          {results.map((result, i) => {
            const x = layout.colXs[i];
            const bw = layout.badgeWidth;
            const bh = 34;
            const isCoffee = result.includes('당첨');
            const arrivedFrom = mapping.findIndex((endCol) => endCol === i);
            const thisRevealed = isRevealed(arrivedFrom);
            const color = PATH_COLORS[arrivedFrom % PATH_COLORS.length];
            const clipId = `cr-${i}`;

            return (
              <g key={`result-${i}`}>
                <clipPath id={clipId}>
                  <rect x={x - bw / 2 + 4} y={SVG_H - bh - 18} width={bw - 8} height={bh + 4} />
                </clipPath>

                <motion.rect
                  x={x - bw / 2} y={SVG_H - bh - 16} width={bw} height={bh} rx={bh / 2}
                  fill={thisRevealed ? (isCoffee ? color : '#f2f4f6') : '#e5e8eb'}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1, scale: thisRevealed && isCoffee ? [1, 1.15, 1] : 1 }}
                  transition={{ opacity: { duration: 0.3, delay: i * 0.05 }, scale: { duration: 0.4 } }}
                  style={{ originX: `${x}px`, originY: `${SVG_H - bh / 2 - 16}px` }}
                />
                <motion.text
                  x={x} y={SVG_H - bh / 2 - 16 + 5} textAnchor="middle" clipPath={`url(#${clipId})`}
                  className="text-[12px] font-semibold select-none pointer-events-none"
                  fill={thisRevealed ? (isCoffee ? '#ffffff' : '#6b7684') : '#b0b8c1'}
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                  transition={{ duration: 0.3, delay: 0.1 + i * 0.05 }}
                >
                  {thisRevealed ? result : '?'}
                </motion.text>
              </g>
            );
          })}
        </svg>
      </div>

      {/* 하단 고정 영역 */}
      <div className="shrink-0 px-5 pb-4 pt-2">
        <AnimatePresence mode="wait">
          {/* 나머지 공개 버튼 */}
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
                         hover:bg-toss-gray-50 transition-colors"
            >
              나머지 한번에 공개
            </motion.button>
          )}

          {/* 결과 카드 */}
          {allRevealed && winnerIndex >= 0 && (
            <motion.div
              key="result-card"
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ type: 'spring', stiffness: 300, damping: 25, delay: 0.15 }}
            >
              <div className="bg-white rounded-2xl shadow-xl shadow-black/8
                              border border-toss-gray-100 p-5 text-center">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 15, delay: 0.3 }}
                  className="text-[40px] mb-1"
                >
                  ☕️
                </motion.div>
                <motion.p
                  initial={{ y: 10, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.4 }}
                  className="text-[20px] font-bold text-toss-gray-900"
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
                  className="text-[13px] text-toss-gray-500 mt-0.5"
                >
                  오늘 커피는 맛있게 사주세요 ☺️
                </motion.p>

                <motion.div
                  initial={{ y: 10, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.6 }}
                  className="mt-4 flex gap-3"
                >
                  <button
                    onClick={handleShare}
                    className="flex-1 py-3 rounded-xl bg-toss-gray-100 text-toss-gray-700
                               text-[14px] font-semibold hover:bg-toss-gray-200 transition-colors"
                  >
                    결과 공유
                  </button>
                  <button
                    onClick={onReset}
                    className="flex-1 py-3 rounded-xl bg-toss-blue text-white
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
