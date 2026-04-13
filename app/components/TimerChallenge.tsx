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

  // Warning sound when time low
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
    <div className="p-6">
      <div className="text-center mb-6">
        <div className={`text-5xl font-bold ${timeLeft <= 10 ? 'text-red-500 animate-pulse' : 'text-blue-600'}`}>
          ⏱️ {timeLeft}s
        </div>
        <div className="text-sm text-gray-600 mt-2">Selesaikan sebelum waktu habis!</div>
      </div>

      <div className="flex gap-8 justify-center flex-wrap">
        <div className="space-y-3">
          <h3 className="font-bold text-center">✨ Seret ke sini:</h3>
          {pieces.map(piece => {
            const isUsed = Object.values(matched).includes(piece.id);
            if (isUsed) return null;
            return (
              <div
                key={piece.id}
                draggable={isActive}
                onDragStart={(e) => handleDragStart(e, piece.id)}
                className="bg-orange-200 p-6 rounded-xl text-5xl cursor-grab active:cursor-grabbing hover:bg-orange-300 transition text-center hover:scale-105"
              >
                {piece.image}
              </div>
            );
          })}
        </div>

        <div className="space-y-3">
          <h3 className="font-bold text-center">🎯 Taruh di sini:</h3>
          {pieces.map((piece, idx) => {
            const slotId = `slot${idx + 1}`;
            const isFilled = matched[slotId];
            return (
              <div
                key={idx}
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, slotId, piece.id)}
                className={`w-36 h-36 rounded-xl border-4 flex items-center justify-center text-4xl transition ${
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

      <div className="text-center mt-6 text-sm text-gray-500">
        💡 Seret gambar ke kotak target yang sesuai!
      </div>
    </div>
  );
}