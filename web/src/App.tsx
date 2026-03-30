import { useState, useCallback } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import SetupStep from './SetupStep';
import ConfigStep from './ConfigStep';
import GameStep from './GameStep';

type Step = 'setup' | 'config' | 'game';

const pageVariants = {
  enter: { x: 60, opacity: 0 },
  center: { x: 0, opacity: 1 },
  exit: { x: -60, opacity: 0 },
};

export default function App() {
  const [step, setStep] = useState<Step>('setup');
  const [participants, setParticipants] = useState<string[]>([]);
  const [results, setResults] = useState<string[]>([]);

  const handleSetupComplete = useCallback((names: string[]) => {
    setParticipants(names);
    const defaultResults = names.map((_, i) => (i === 0 ? '☕️ 당첨!' : '통과'));
    setResults(defaultResults);
    setStep('config');
  }, []);

  const handleConfigComplete = useCallback((finalResults: string[]) => {
    setResults(finalResults);
    setStep('game');
  }, []);

  const handleReset = useCallback(() => {
    setStep('setup');
    setParticipants([]);
    setResults([]);
  }, []);

  const handleBack = useCallback(() => {
    setStep('setup');
  }, []);

  return (
    <div className="h-full flex flex-col max-w-lg mx-auto w-full overflow-hidden" style={{ maxWidth: '100vw' }}>
      <AnimatePresence mode="wait">
        {step === 'setup' && (
          <motion.div
            key="setup"
            variants={pageVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="h-full flex flex-col"
          >
            <SetupStep onComplete={handleSetupComplete} />
          </motion.div>
        )}

        {step === 'config' && (
          <motion.div
            key="config"
            variants={pageVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="h-full flex flex-col"
          >
            <ConfigStep
              participants={participants}
              initialResults={results}
              onComplete={handleConfigComplete}
              onBack={handleBack}
            />
          </motion.div>
        )}

        {step === 'game' && (
          <motion.div
            key="game"
            variants={pageVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="h-full flex flex-col"
          >
            <GameStep
              participants={participants}
              results={results}
              onReset={handleReset}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
