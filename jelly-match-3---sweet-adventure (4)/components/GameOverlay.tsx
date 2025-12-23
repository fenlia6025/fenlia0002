
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GameStatus } from '../types';
import { audio } from '../services/audioService';

interface GameOverlayProps {
  status: GameStatus;
  score: number;
  level: number;
  onAction: () => void;
}

const GameOverlay: React.FC<GameOverlayProps> = ({ status, score, level, onAction }) => {
  const isVisible = status !== 'playing' && status !== 'animating';

  const getTitle = () => {
    switch (status) {
      case 'start': return 'Sweet Start';
      case 'level-complete': return 'Yummy Win!';
      case 'game-over': return 'Oopsie!';
      case 'paused': return 'Paused';
      default: return '';
    }
  };

  const getSubtitle = () => {
    switch (status) {
      case 'start': return 'Are you ready for a juicy match-3 adventure?';
      case 'level-complete': return `Incredible! Level ${level} cleared like a pro!`;
      case 'game-over': return `Almost had it! Your score was ${score}. Give it another try?`;
      case 'paused': return 'Relax and take a break. Ready to jump back in?';
      default: return '';
    }
  };

  const getButtonText = () => {
    switch (status) {
      case 'start': return 'PLAY NOW';
      case 'level-complete': return 'NEXT LEVEL';
      case 'paused': return 'RESUME';
      default: return 'TRY AGAIN';
    }
  };

  const getButtonColor = () => {
    switch (status) {
      case 'game-over': return '#EF4444'; // Red
      case 'level-complete': return '#10B981'; // Green
      default: return '#3B82F6'; // Blue
    }
  };

  const getButtonShadow = () => {
     switch (status) {
      case 'game-over': return '#B91C1C';
      case 'level-complete': return '#047857';
      default: return '#1D4ED8';
    }
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div 
          className="fixed inset-0 bg-blue-900/30 backdrop-blur-xl z-[100] flex items-center justify-center p-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div 
            className="bg-white rounded-[56px] w-full max-w-sm p-12 text-center border-[12px] border-white/50 shadow-[0_30px_60px_-15px_rgba(0,0,0,0.5)] relative overflow-hidden"
            initial={{ scale: 0.8, y: 50 }}
            animate={{ scale: 1, y: 0 }}
          >
            {/* Background Decorative Circles */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-100 rounded-full -mr-16 -mt-16 opacity-50" />
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-pink-100 rounded-full -ml-12 -mb-12 opacity-50" />

            <h2 className="game-font text-5xl text-blue-600 mb-6 drop-shadow-sm uppercase">
              {getTitle()}
            </h2>
            <p className="text-gray-500 font-bold mb-12 text-lg leading-relaxed">
              {getSubtitle()}
            </p>
            
            <button 
              onClick={() => {
                audio.play('click');
                onAction();
              }}
              style={{ 
                backgroundColor: getButtonColor(),
                boxShadow: `0 12px 0 ${getButtonShadow()}`
              }}
              className="w-full text-white font-black text-2xl py-6 rounded-[36px] uppercase active:translate-y-2 active:shadow-none transition-all relative group overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent" />
              <span className="relative z-10">{getButtonText()}</span>
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default GameOverlay;
