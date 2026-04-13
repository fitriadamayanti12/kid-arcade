// app/components/MemoryMatch.tsx
'use client';

import { useState, useEffect } from 'react';
import { useSoundEffect } from '@/hooks/useSoundEffect';

interface Card {
  id: number;
  emoji: string;
  isFlipped: boolean;
  isMatched: boolean;
}

interface MemoryMatchProps {
  playerName: string;
  onComplete: (stars: number, time: number) => void;
}

const cardPairs = [
  { id: 1, emoji: '🐶' }, { id: 2, emoji: '🐱' },
  { id: 3, emoji: '🐭' }, { id: 4, emoji: '🐹' },
  { id: 5, emoji: '🐰' }, { id: 6, emoji: '🦊' },
  { id: 7, emoji: '🐻' }, { id: 8, emoji: '🐼' },
];

export default function MemoryMatch({ playerName, onComplete }: MemoryMatchProps) {
  const [cards, setCards] = useState<Card[]>([]);
  const [flippedIndexes, setFlippedIndexes] = useState<number[]>([]);
  const [moves, setMoves] = useState(0);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [isComplete, setIsComplete] = useState(false);
  const { playSound } = useSoundEffect();

  useEffect(() => {
    startNewGame();
  }, []);

  const startNewGame = () => {
    const shuffled = [...cardPairs, ...cardPairs]
      .sort(() => Math.random() - 0.5)
      .map((pair, index) => ({
        id: index,
        emoji: pair.emoji,
        isFlipped: false,
        isMatched: false,
      }));
    setCards(shuffled);
    setFlippedIndexes([]);
    setMoves(0);
    setIsComplete(false);
    setStartTime(Date.now());
    playSound('click');
  };

  const handleCardClick = (index: number) => {
    if (isComplete) return;
    if (cards[index].isMatched) return;
    if (cards[index].isFlipped) return;
    if (flippedIndexes.length === 2) return;

    playSound('click');

    const newCards = [...cards];
    newCards[index].isFlipped = true;
    setCards(newCards);

    const newFlipped = [...flippedIndexes, index];
    setFlippedIndexes(newFlipped);

    if (newFlipped.length === 2) {
      setMoves(moves + 1);
      const [first, second] = newFlipped;

      if (cards[first].emoji === cards[second].emoji) {
        playSound('match');
        setTimeout(() => {
          const matchedCards = [...cards];
          matchedCards[first].isMatched = true;
          matchedCards[second].isMatched = true;
          matchedCards[first].isFlipped = true;
          matchedCards[second].isFlipped = true;
          setCards(matchedCards);
          setFlippedIndexes([]);

          const allMatched = matchedCards.every(card => card.isMatched);
          if (allMatched && startTime) {
            const timeSpent = (Date.now() - startTime) / 1000;
            let stars = 1;
            if (moves + 1 <= 10) stars = 3;
            else if (moves + 1 <= 15) stars = 2;
            setIsComplete(true);
            playSound('win');
            onComplete(stars, timeSpent);
          }
        }, 500);
      } else {
        playSound('wrong');
        setTimeout(() => {
          const resetCards = [...cards];
          resetCards[first].isFlipped = false;
          resetCards[second].isFlipped = false;
          setCards(resetCards);
          setFlippedIndexes([]);
        }, 1000);
      }
    }
  };

  // app/components/MemoryMatch.tsx - Update responsive grid

  return (
    <div className="p-3 sm:p-4 md:p-6">
      <div className="flex justify-between mb-4 sm:mb-6">
        <div className="text-sm sm:text-base md:text-xl">🎯 Langkah: {moves}</div>
        <button
          onClick={startNewGame}
          className="bg-green-500 text-white px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm hover:bg-green-600 transition"
        >
          Game Baru 🔄
        </button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 sm:gap-3 max-w-md mx-auto">
        {cards.map((card, index) => (
          <button
            key={card.id}
            onClick={() => handleCardClick(index)}
            className={`aspect-square text-2xl sm:text-3xl md:text-4xl rounded-xl sm:rounded-2xl transition-all transform ${card.isFlipped || card.isMatched
                ? 'bg-yellow-300 rotate-0'
                : 'bg-blue-500 rotate-180'
              } shadow-lg hover:scale-105`}
          >
            <div className="flex items-center justify-center h-full">
              {(card.isFlipped || card.isMatched) ? card.emoji : '❓'}
            </div>
          </button>
        ))}
      </div>

      <div className="text-center mt-4 sm:mt-6 text-xs sm:text-sm text-gray-500">
        💡 Klik kartu untuk membuka, cari pasangan yang sama!
      </div>
    </div>
  );
}