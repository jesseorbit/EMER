import { useState } from 'react';
import { motion } from 'framer-motion';

interface Props {
  participants: string[];
  initialResults: string[];
  onComplete: (results: string[]) => void;
  onBack: () => void;
}

export default function ConfigStep({ participants, initialResults, onComplete, onBack }: Props) {
  const [results, setResults] = useState<string[]>(initialResults);

  const updateResult = (index: number, value: string) => {
    setResults((prev) => prev.map((r, i) => (i === index ? value : r)));
  };

  const isValid = results.every((r) => r.trim().length > 0);

  return (
    <div className="h-full flex flex-col">
      {/* 스크롤 영역 */}
      <div className="flex-1 overflow-y-auto hide-scrollbar px-5 pt-10">
        {/* 뒤로가기 */}
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          onClick={onBack}
          className="self-start -ml-1 mb-4 flex items-center gap-1 text-toss-gray-500
                     text-[14px] hover:text-toss-gray-700 transition-colors"
        >
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path
              d="M12 15L7 10L12 5"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          이전
        </motion.button>

        {/* 헤더 */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
        >
          <h1 className="text-[24px] font-bold text-toss-gray-900 leading-tight tracking-tight">
            결과를 정해주세요
          </h1>
          <p className="text-[14px] text-toss-gray-500 mt-2">
            사다리 아래에 놓일 결과를 수정할 수 있어요
          </p>
        </motion.div>

        {/* 참가자 표시 */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.15 }}
          className="mt-6 flex flex-wrap gap-2"
        >
          {participants.map((name) => (
            <div
              key={name}
              className="bg-toss-blue-light text-toss-blue rounded-full
                         px-3.5 py-1.5 text-[13px] font-semibold"
            >
              {name}
            </div>
          ))}
        </motion.div>

        {/* 구분선 */}
        <motion.div
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ delay: 0.2, duration: 0.4 }}
          className="my-6 flex items-center gap-3"
        >
          <div className="flex-1 h-px bg-toss-gray-200" />
          <span className="text-[12px] text-toss-gray-400 font-medium">사다리</span>
          <div className="flex-1 h-px bg-toss-gray-200" />
        </motion.div>

        {/* 결과 입력 */}
        <div className="space-y-2.5 pb-4">
          {results.map((result, index) => (
            <motion.div
              key={index}
              initial={{ x: 20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.25 + index * 0.05 }}
              className="flex items-center gap-3"
            >
              <span className="w-6 h-6 rounded-full bg-toss-gray-100 flex items-center
                               justify-center text-[12px] font-bold text-toss-gray-500 shrink-0">
                {index + 1}
              </span>
              <input
                type="text"
                value={result}
                onChange={(e) => updateResult(index, e.target.value)}
                maxLength={20}
                className="flex-1 min-w-0 bg-toss-gray-100 rounded-xl px-4 py-3 text-[15px]
                           text-toss-gray-900 outline-none transition-all duration-200
                           focus:ring-2 focus:ring-toss-blue focus:ring-opacity-30 focus:bg-white"
              />
              {result.includes('당첨') && (
                <span className="text-[18px] shrink-0">☕️</span>
              )}
            </motion.div>
          ))}
        </div>
      </div>

      {/* 하단 고정 버튼 */}
      <div className="shrink-0 px-5 pb-4 pt-2">
        <motion.button
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
          whileTap={{ scale: 0.97 }}
          onClick={() => onComplete(results)}
          disabled={!isValid}
          className="w-full py-4 rounded-2xl text-[16px] font-bold
                     transition-all duration-200
                     disabled:bg-toss-gray-200 disabled:text-toss-gray-400
                     enabled:bg-toss-blue enabled:text-white enabled:shadow-lg
                     enabled:shadow-toss-blue/25 enabled:hover:bg-toss-blue-dark"
        >
          🪜 사다리 타기
        </motion.button>
      </div>
    </div>
  );
}
