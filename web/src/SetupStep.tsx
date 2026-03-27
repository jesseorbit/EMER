import { useState, useCallback } from 'react';
import { motion } from 'framer-motion';

interface Props {
  onComplete: (names: string[]) => void;
}

const RANDOM_NAMES = [
  '민수', '지현', '서준', '하은', '도윤', '수빈', '예준', '지우',
  '시우', '서연', '하준', '지민', '유준', '채원', '건우', '소율',
  '현우', '다은', '준서', '유나', '태민', '은지', '성훈', '미래',
];

function pickRandomNames(count: number): string[] {
  const shuffled = [...RANDOM_NAMES].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}

export default function SetupStep({ onComplete }: Props) {
  const [names, setNames] = useState<string[]>(() => pickRandomNames(4));

  const updateName = useCallback((index: number, value: string) => {
    setNames((prev) => prev.map((n, i) => (i === index ? value : n)));
  }, []);

  const addPerson = useCallback(() => {
    const used = new Set(names);
    const available = RANDOM_NAMES.find((n) => !used.has(n)) ?? `참가자${names.length + 1}`;
    setNames((prev) => [...prev, available]);
  }, [names]);

  const removePerson = useCallback((index: number) => {
    setNames((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const isValid = names.length >= 2 && names.every((n) => n.trim().length > 0);
  const hasDuplicates = new Set(names.map((n) => n.trim())).size !== names.length;

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
          이름을 눌러 수정할 수 있어요
        </p>
      </motion.div>

      {/* 참가자 리스트 */}
      <div className="mt-8 space-y-2.5">
        {names.map((name, index) => (
          <motion.div
            key={index}
            initial={{ x: 30, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{
              type: 'spring', stiffness: 400, damping: 28,
              delay: 0.15 + index * 0.05,
            }}
            className="flex items-center gap-2.5"
          >
            {/* 번호 */}
            <div
              className="w-7 h-7 rounded-full flex items-center justify-center
                         text-[12px] font-bold text-white shrink-0"
              style={{ backgroundColor: PERSON_COLORS[index % PERSON_COLORS.length] }}
            >
              {index + 1}
            </div>

            {/* 이름 입력 */}
            <input
              type="text"
              value={name}
              onChange={(e) => updateName(index, e.target.value)}
              maxLength={10}
              className="flex-1 bg-toss-gray-100 rounded-xl px-4 py-3.5 text-[15px]
                         text-toss-gray-900 outline-none transition-all duration-200
                         focus:ring-2 focus:ring-toss-blue/30 focus:bg-white"
            />

            {/* 삭제 */}
            {names.length > 2 && (
              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={() => removePerson(index)}
                className="w-8 h-8 rounded-full flex items-center justify-center
                           text-toss-gray-400 hover:text-toss-gray-600 hover:bg-toss-gray-100
                           transition-colors shrink-0"
              >
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <path d="M2 2L12 12M12 2L2 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
              </motion.button>
            )}
          </motion.div>
        ))}
      </div>

      {/* 추가 버튼 */}
      {names.length < 8 && (
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          whileTap={{ scale: 0.97 }}
          onClick={addPerson}
          className="mt-3 w-full py-3.5 rounded-xl border-2 border-dashed border-toss-gray-200
                     text-toss-gray-400 text-[14px] font-semibold
                     hover:border-toss-gray-300 hover:text-toss-gray-500 transition-colors"
        >
          + 참가자 추가
        </motion.button>
      )}

      {/* 인원 수 */}
      <p className="text-[13px] text-toss-gray-400 mt-3">
        {names.length}명 참가
        {hasDuplicates && (
          <span className="text-red-400 ml-2">· 중복된 이름이 있어요</span>
        )}
      </p>

      {/* 스페이서 */}
      <div className="flex-1" />

      {/* 다음 버튼 */}
      <motion.button
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.3 }}
        whileTap={{ scale: 0.97 }}
        onClick={() => onComplete(names.map((n) => n.trim()))}
        disabled={!isValid || hasDuplicates}
        className="w-full py-[18px] rounded-2xl text-[16px] font-bold
                   transition-all duration-200
                   disabled:bg-toss-gray-200 disabled:text-toss-gray-400
                   enabled:bg-toss-blue enabled:text-white enabled:shadow-lg
                   enabled:shadow-toss-blue/25 enabled:hover:bg-toss-blue-dark"
      >
        다음
      </motion.button>
    </div>
  );
}

const PERSON_COLORS = [
  '#3182f6', '#ff6b6b', '#51cf66', '#ffd43b',
  '#cc5de8', '#ff922b', '#20c997', '#f06595',
];
