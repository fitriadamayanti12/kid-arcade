'use client';

import { useState, useEffect } from 'react';
import { useSoundEffect } from '@/hooks/useSoundEffect';

interface PuzzlePiece {
  id: string;
  name: string;
  image: string;
  correctSlotId: string;
}

interface Slot {
  id: string;
  label: string;
  imageSilhouette: string;
}

const pieces: PuzzlePiece[] = [
  { id: 'p1', name: 'Kucing', image: '🐱', correctSlotId: 'slot1' },
  { id: 'p2', name: 'Anjing', image: '🐶', correctSlotId: 'slot2' },
  { id: 'p3', name: 'Monyet', image: '🐵', correctSlotId: 'slot3' },
  { id: 'p4', name: 'Kelinci', image: '🐰', correctSlotId: 'slot4' },
  { id: 'p5', name: 'Burung', image: '🐦', correctSlotId: 'slot5' },
  { id: 'p6', name: 'Ikan', image: '🐠', correctSlotId: 'slot6' },
];

const slots: Slot[] = [
  { id: 'slot1', label: 'Tempat Kucing', imageSilhouette: '🐱‍👤' },
  { id: 'slot2', label: 'Tempat Anjing', imageSilhouette: '🐕‍🦺' },
  { id: 'slot3', label: 'Tempat Monyet', imageSilhouette: '🐒' },
  { id: 'slot4', label: 'Tempat Kelinci', imageSilhouette: '🐇' },
  { id: 'slot5', label: 'Tempat Burung', imageSilhouette: '🕊️' },
  { id: 'slot6', label: 'Tempat Ikan', imageSilhouette: '🐟' },
];

interface PuzzleGameProps {
  onComplete: (stars: number, timeSpent: number) => void;
}

export default function PuzzleGame({ onComplete }: PuzzleGameProps) {
  const [matched, setMatched] = useState<Record<string, string>>({});
  const [startTime] = useState(Date.now());
  const [feedback, setFeedback] = useState('');
  const { playSound } = useSoundEffect();

  useEffect(() => {
    const allSlotsFilled = Object.keys(matched).length === slots.length;
    if (allSlotsFilled) {
      const timeSpent = (Date.now() - startTime) / 1000;
      let stars = 1;
      if (timeSpent < 20) stars = 3;
      else if (timeSpent < 40) stars = 2;
      onComplete(stars, timeSpent);
    }
  }, [matched]);

  const handleDragStart = (e: React.DragEvent, piece: PuzzlePiece) => {
    e.dataTransfer.setData('text/plain', JSON.stringify(piece));
  };

  const handleDragOver = (e: React.DragEvent) => e.preventDefault();

  const handleDrop = (e: React.DragEvent, slot: Slot) => {
    e.preventDefault();
    if (matched[slot.id]) return;

    const piece: PuzzlePiece = JSON.parse(e.dataTransfer.getData('text/plain'));

    if (piece.correctSlotId === slot.id) {
      setMatched((prev) => ({ ...prev, [slot.id]: piece.id }));
      setFeedback(`✅ Mantap! ${piece.name} masuk ke tempat yang benar!`);
      playSound('correct');
    } else {
      setFeedback(`❌ Coba lagi... ${piece.name} bukan untuk sini.`);
      playSound('wrong');
    }
    setTimeout(() => setFeedback(''), 1500);
  };

  const isSlotFilled = (slotId: string) => !!matched[slotId];

  return (
    <div>
      <h2 className="text-2xl font-bold text-center mb-4">✨ Seret Potongan ke Bayangan ✨</h2>
      <div className="flex flex-wrap gap-8 justify-center">
        <div className="flex-1 min-w-[200px]">
          <div className="grid grid-cols-2 gap-4">
            {pieces.map((piece) => {
              if (Object.values(matched).includes(piece.id)) return null;
              return (
                <div
                  key={piece.id}
                  draggable
                  onDragStart={(e) => handleDragStart(e, piece)}
                  className="bg-yellow-200 p-4 rounded-2xl flex flex-col items-center gap-2 cursor-grab hover:bg-yellow-300 transition shadow-md hover:scale-105"
                >
                  <span className="text-5xl">{piece.image}</span>
                  <span className="text-lg font-bold">{piece.name}</span>
                </div>
              );
            })}
          </div>
        </div>
        <div className="flex-1 min-w-[200px]">
          <div className="grid grid-cols-2 gap-4">
            {slots.map((slot) => (
              <div
                key={slot.id}
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, slot)}
                className={`p-4 rounded-2xl border-4 text-center min-h-[120px] flex flex-col items-center justify-center ${
                  isSlotFilled(slot.id) ? 'bg-green-200 border-green-600' : 'bg-blue-50 border-blue-400 border-dashed'
                }`}
              >
                <div className="text-5xl opacity-60">{slot.imageSilhouette}</div>
                <div className="text-sm font-semibold mt-2">{slot.label}</div>
                {isSlotFilled(slot.id) && <div className="text-2xl mt-1">✔️</div>}
              </div>
            ))}
          </div>
        </div>
      </div>
      {feedback && (
        <div className="fixed bottom-8 left-1/2 transform -translate-x-1/2 bg-yellow-300 text-xl px-6 py-3 rounded-full shadow-lg animate-bounce z-50">
          {feedback}
        </div>
      )}
    </div>
  );
}