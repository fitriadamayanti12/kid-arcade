// app/components/RewardDisplay.tsx
'use client';

import { useState, useEffect } from 'react';
import Confetti from 'react-confetti';
import { useSoundEffect } from '@/hooks/useSoundEffect';

interface RewardProps {
  playerName: string;
  starsEarned: number;
  newBadge?: string;
  newSticker?: string;
  onClose: () => void;
}

export default function RewardDisplay({ playerName, starsEarned, newBadge, newSticker, onClose }: RewardProps) {
  const [showConfetti, setShowConfetti] = useState(true);
  const { playSound } = useSoundEffect();

  useEffect(() => {
    playSound('reward');
    const timer = setTimeout(() => setShowConfetti(false), 4000);
    return () => clearTimeout(timer);
  }, []);

  const getStarMessage = (stars: number) => {
    if (stars === 3) return 'Hebat sekali! Kamu luar biasa! 🌟🌟🌟';
    if (stars === 2) return 'Bagus! Coba lagi dapat 3 bintang! 🌟🌟';
    return 'Selamat! Terus belajar ya! 🌟';
  };

  // app/components/RewardDisplay.tsx - Responsive version

  return (
    <>
      {showConfetti && <Confetti />}
      <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 animate-in zoom-in duration-300 p-3 sm:p-4">
        <div className="bg-gradient-to-br from-yellow-300 to-orange-400 rounded-2xl sm:rounded-3xl p-5 sm:p-6 md:p-8 max-w-[90%] sm:max-w-md text-center shadow-2xl">
          <div className="text-5xl sm:text-6xl md:text-7xl mb-3 sm:mb-4 animate-bounce">🎉</div>
          <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-white mb-1 sm:mb-2">Hebat, {playerName}!</h2>
          <p className="text-white/90 text-xs sm:text-sm md:text-base mb-3 sm:mb-4">{getStarMessage(starsEarned)}</p>

          <div className="bg-white/20 rounded-xl sm:rounded-2xl p-3 sm:p-4 mb-3 sm:mb-4">
            <p className="text-white text-sm sm:text-base">Kamu dapat</p>
            <div className="flex justify-center gap-1 sm:gap-2 text-3xl sm:text-4xl my-1 sm:my-2">
              {[...Array(starsEarned)].map((_, i) => (
                <span key={i} className="animate-pulse">⭐</span>
              ))}
            </div>
            <p className="text-white font-bold text-base sm:text-lg">{starsEarned} Bintang!</p>
          </div>

          {newBadge && (
            <div className="bg-purple-500 rounded-xl sm:rounded-2xl p-3 sm:p-4 mb-3 sm:mb-4 animate-bounce">
              <p className="text-white text-xs sm:text-sm">🏅 Lencana Baru!</p>
              <p className="text-white font-bold text-sm sm:text-base md:text-xl">{newBadge}</p>
            </div>
          )}

          {newSticker && (
            <div className="bg-pink-500 rounded-xl sm:rounded-2xl p-3 sm:p-4 mb-3 sm:mb-4">
              <p className="text-white text-xs sm:text-sm">📌 Stiker Baru!</p>
              <p className="text-3xl sm:text-4xl">{newSticker}</p>
            </div>
          )}

          <button
            onClick={onClose}
            className="bg-white text-orange-600 px-5 sm:px-6 md:px-8 py-2 sm:py-2.5 md:py-3 rounded-full font-bold text-sm sm:text-base md:text-lg hover:scale-105 transition shadow-lg"
          >
            Lanjut Main 🚀
          </button>
        </div>
      </div>
    </>
  );
}