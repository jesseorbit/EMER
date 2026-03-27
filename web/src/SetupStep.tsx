import { useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface Props {
  onComplete: (names: string[]) => void;
}

export default function SetupStep({ onComplete }: Props) {
  const [names, setNames] = useState<string[]>([]);
  const [input, setInput] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const addName = useCallback(() => {
    const trimmed = input.trim();
    if (!trimmed || names.includes(trimmed)) return;
    setNames((prev) => [...prev, trimmed]);
    setInput('');
    inputRef.current?.focus();
  }, [input, names]);

  const removeName = useCallback((index: number) => {
    setNames((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addName();
    }
  };

  return (
    <div className="flex-1 flex flex-col px-5 pt-16 pb-8">
      {/* 헤더 */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.1 }}
      >
        <h1 className="text-[26px] font-bold text-toss-gray-900 leading-tight tracking-tight">
          오늘 커피는
          <br />
          누가 살까요?
        </h1>
        <p className="text-[15px] text-toss-gray-500 mt-3">
          참가자 이름을 입력해주세요
        </p>
      </motion.div>

      {/* 입력 */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="mt-8"
      >
        <div className="flex gap-2">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="이름 입력"
            maxLength={10}
            className="flex-1 bg-toss-gray-100 rounded-2xl px-5 py-4 text-[16px]
                       text-toss-gray-900 outline-none transition-all duration-200
                       focus:ring-2 focus:ring-toss-blue focus:ring-opacity-30
                       focus:bg-white placeholder:text-toss-gray-400"
          />
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={addName}
            disabled={!input.trim()}
            className="bg-toss-gray-100 text-toss-gray-600 rounded-2xl px-5 py-4
                       font-semibold text-[15px] transition-colors
                       disabled:opacity-40 disabled:cursor-not-allowed
                       enabled:hover:bg-toss-gray-200 enabled:active:bg-toss-gray-300"
          >
            추가
          </motion.button>
        </div>
      </motion.div>

      {/* 참가자 칩 리스트 */}
      <div className="mt-6 flex flex-wrap gap-2 min-h-[48px]">
        <AnimatePresence>
          {names.map((name, index) => (
            <motion.div
              key={name}
              layout
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 400, damping: 25 }}
              className="flex items-center gap-1.5 bg-toss-blue-light text-toss-blue
                         rounded-full pl-4 pr-2 py-2.5 text-[14px] font-semibold"
            >
              <span>{name}</span>
              <button
                onClick={() => removeName(index)}
                className="w-5 h-5 rounded-full flex items-center justify-center
                           hover:bg-toss-blue/10 transition-colors text-toss-blue/60
                           hover:text-toss-blue"
              >
                <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                  <path
                    d="M1 1L9 9M9 1L1 9"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                  />
                </svg>
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* 인원 수 표시 */}
      {names.length > 0 && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-[13px] text-toss-gray-400 mt-2"
        >
          {names.length}명 참가
        </motion.p>
      )}

      {/* 스페이서 */}
      <div className="flex-1" />

      {/* 다음 버튼 */}
      <motion.button
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.3 }}
        whileTap={{ scale: 0.97 }}
        onClick={() => onComplete(names)}
        disabled={names.length < 2}
        className="w-full py-[18px] rounded-2xl text-[16px] font-bold
                   transition-all duration-200
                   disabled:bg-toss-gray-200 disabled:text-toss-gray-400
                   enabled:bg-toss-blue enabled:text-white enabled:shadow-lg
                   enabled:shadow-toss-blue/25 enabled:hover:bg-toss-blue-dark"
      >
        {names.length < 2
          ? `${2 - names.length}명 더 추가해주세요`
          : '다음'}
      </motion.button>
    </div>
  );
}
