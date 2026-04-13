// app/components/TimerChallenge.tsx
'use client';

import { useState, useEffect } from 'react';
import { useSoundEffect } from '@/hooks/useSoundEffect';

interface TimerChallengeProps {
  onComplete: (stars: number, timeLeft: number) => void;
}

const pieces = [
  { id: 'star', name: '🌟', image: '⭐', correctSlot: 'slot1' },
  { id: 'moon', name: '🌙', image: '🌙', correctSlot: 'slot2' },
  { id: 'sun', name: '☀️', image: '☀️', correctSlot: 'slot3' },
];

export default function TimerChallenge({ onComplete }: TimerChallengeProps) {
  const [timeLeft, setTimeLeft] = useState(30);
  const [matched, setMatched] = useState<Record<string, string>>({});
  const [isActive, setIsActive] = useState(true);
  const { playSound } = useSoundEffect();

  useEffect(() => {
    if (timeLeft <= 0 && isActive) {
      setIsActive(false);
      playSound('wrong');
      onComplete(0, 0);
    }
    if (timeLeft > 0 && isActive) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [timeLeft, isActive]);

  useEffect(() => {
    if (Object.keys(matched).length === 3 && isActive) {
      let stars = 1;
      if (timeLeft >= 20) stars = 3;
      else if (timeLeft >= 10) stars = 2;
      setIsActive(false);
      playSound('win');
      onComplete(stars, timeLeft);
    }
  }, [matched]);

  useEffect(() => {
    if (timeLeft === 10 && isActive) {
      playSound('timer');
    }
  }, [timeLeft]);

  const handleDragStart = (e: React.DragEvent, pieceId: string) => {
    if (!isActive) return;
    e.dataTransfer.setData('text/plain', pieceId);
    e.dataTransfer.effectAllowed = 'move';
    playSound('click');
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, slotId: string, correctPieceId: string) => {
    e.preventDefault();
    if (!isActive) return;
    if (matched[slotId]) return;

    const pieceId = e.dataTransfer.getData('text/plain');
    if (pieceId === correctPieceId) {
      setMatched(prev => ({ ...prev, [slotId]: pieceId }));
      playSound('correct');
    } else {
      playSound('wrong');
    }
  };

  return (
    <div className="p-3 sm:p-4 md:p-6">
      {/* Timer Display */}
      <div className="text-center mb-4 sm:mb-6">
        <div className={`text-4xl sm:text-5xl md:text-6xl font-bold ${timeLeft <= 10 ? 'text-red-500 animate-pulse' : 'text-blue-600'}`}>
          ⏱️ {timeLeft}s
        </div>
        <div className="text-xs sm:text-sm text-gray-600 mt-1 sm:mt-2">
          Selesaikan sebelum waktu habis!
        </div>
      </div>

      {/* Game Area - Stack on mobile, row on desktop */}
      <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 md:gap-8 justify-center items-center">
        {/* Draggable Pieces Column */}
        <div className="w-full sm:w-auto">
          <h3 className="font-bold text-center text-sm sm:text-base mb-2 sm:mb-3">✨ Seret ke sini:</h3>
          <div className="flex flex-row sm:flex-row gap-3 sm:gap-4 justify-center">
            {pieces.map(piece => {
              const isUsed = Object.values(matched).includes(piece.id);
              if (isUsed) return null;
              return (
                <div
                  key={piece.id}
                  draggable={isActive}
                  onDragStart={(e) => handleDragStart(e, piece.id)}
                  className="bg-orange-200 p-4 sm:p-5 md:p-6 rounded-xl sm:rounded-2xl text-4xl sm:text-5xl md:text-6xl cursor-grab active:cursor-grabbing hover:bg-orange-300 transition text-center hover:scale-105"
                >
                  {piece.image}
                </div>
              );
            })}
          </div>
        </div>

        {/* Target Slots Column */}
        <div className="w-full sm:w-auto">
          <h3 className="font-bold text-center text-sm sm:text-base mb-2 sm:mb-3">🎯 Taruh di sini:</h3>
          <div className="flex flex-row sm:flex-row gap-3 sm:gap-4 justify-center">
            {pieces.map((piece, idx) => {
              const slotId = `slot${idx + 1}`;
              const isFilled = matched[slotId];
              return (
                <div
                  key={idx}
                  onDragOver={handleDragOver}
                  onDrop={(e) => handleDrop(e, slotId, piece.id)}
                  className={`w-24 h-24 sm:w-28 sm:h-28 md:w-32 md:h-32 rounded-xl sm:rounded-2xl border-4 flex items-center justify-center text-3xl sm:text-4xl md:text-5xl transition ${
                    isFilled
                      ? 'bg-green-300 border-green-600'
                      : 'bg-gray-100 border-dashed border-gray-400 hover:bg-gray-200'
                  }`}
                >
                  {isFilled ? '✓' : '?'}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Instructions */}
      <div className="text-center mt-4 sm:mt-6 text-xs sm:text-sm text-gray-500">
        💡 Seret gambar ke kotak target yang sesuai!
      </div>

      {/* Progress Bar (optional) */}
      <div className="mt-4 sm:mt-6">
        <div className="bg-gray-200 rounded-full h-1.5 sm:h-2 overflow-hidden">
          <div 
            className="bg-gradient-to-r from-red-500 to-orange-500 h-full transition-all duration-1000"
            style={{ width: `${((30 - timeLeft) / 30) * 100}%` }}
          />
        </div>
      </div>
    </div>
  );
}