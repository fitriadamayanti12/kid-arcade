// app/components/MemoryMatch.tsx
'use client';

import { useState, useEffect } from 'react';
import { useSoundEffect } from '@/hooks/useSoundEffect';
import { useThemeStyles } from '@/hooks/useThemeStyles';

interface Card {
  id: number;
  emoji: string;
  isFlipped: boolean;
  isMatched: boolean;
}

interface MemoryMatchProps {
  playerName: string;
  onComplete: (stars: number, extra?: any) => void; // ← FIX
}

const cardPairs = [
  { emoji: '🐶' }, { emoji: '🐱' }, { emoji: '🐭' }, { emoji: '🐹' },
  { emoji: '🐰' }, { emoji: '🦊' }, { emoji: '🐻' }, { emoji: '🐼' },
];

export default function MemoryMatch({ playerName, onComplete }: MemoryMatchProps) {
  const theme = useThemeStyles();
  const [cards, setCards] = useState<Card[]>([]);
  const [flippedIndexes, setFlippedIndexes] = useState<number[]>([]);
  const [moves, setMoves] = useState(0);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [isComplete, setIsComplete] = useState(false);
  const { playSound } = useSoundEffect();

  useEffect(() => { startNewGame(); }, []);

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
  };

  const handleCardClick = (index: number) => {
    if (isComplete || cards[index].isMatched || cards[index].isFlipped || flippedIndexes.length === 2) return;

    const newCards = [...cards];
    newCards[index].isFlipped = true;
    setCards(newCards);

    const newFlipped = [...flippedIndexes, index];
    setFlippedIndexes(newFlipped);

    if (newFlipped.length === 2) {
      setMoves(m => m + 1);
      const [first, second] = newFlipped;

      if (cards[first].emoji === cards[second].emoji) {
        playSound('win');
        setTimeout(() => {
          const matchedCards = [...newCards];
          matchedCards[first].isMatched = true;
          matchedCards[second].isMatched = true;
          setCards(matchedCards);
          setFlippedIndexes([]);

          if (matchedCards.every(c => c.isMatched) && startTime) {
            const timeSpent = Math.round((Date.now() - startTime) / 1000);
            let stars = 1;
            if (moves + 1 <= 10) stars = 3;
            else if (moves + 1 <= 15) stars = 2;
            setIsComplete(true);
            onComplete(stars, { score: stars * 10, time: timeSpent, moves: moves + 1 });
          }
        }, 400);
      } else {
        playSound('click');
        setTimeout(() => {
          const resetCards = [...newCards];
          resetCards[first].isFlipped = false;
          resetCards[second].isFlipped = false;
          setCards(resetCards);
          setFlippedIndexes([]);
        }, 800);
      }
    }
  };

  return (
    <div style={{ padding: '16px', maxWidth: '450px', margin: '0 auto', textAlign: 'center' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <div style={{ fontSize: '15px', fontWeight: '700', color: theme.textSecondary }}>
          🎯 {moves} langkah
        </div>
        <button onClick={startNewGame} style={{
          padding: '8px 16px', borderRadius: '999px', border: 'none',
          background: '#10b981', color: '#fff', fontWeight: '600', fontSize: '13px', cursor: 'pointer',
        }}>
          🔄 Baru
        </button>
      </div>

      {/* Cards Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px' }}>
        {cards.map((card, index) => (
          <button
            key={card.id}
            onClick={() => handleCardClick(index)}
            style={{
              aspectRatio: '1',
              borderRadius: '14px',
              border: 'none',
              fontSize: card.isFlipped || card.isMatched ? '32px' : '24px',
              fontWeight: '700',
              cursor: (card.isMatched || card.isFlipped) ? 'default' : 'pointer',
              background: card.isMatched 
                ? '#d1fae5' 
                : card.isFlipped 
                  ? '#fef3c7' 
                  : '#6366f1',
              color: card.isFlipped || card.isMatched ? '#1e293b' : '#fff',
              transform: card.isFlipped || card.isMatched ? 'rotateY(0)' : 'rotateY(180deg)',
              transition: 'all 0.3s',
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {card.isFlipped || card.isMatched ? card.emoji : '?'}
          </button>
        ))}
      </div>

      {/* Complete */}
      {isComplete && (
        <div style={{
          marginTop: '16px', padding: '16px', borderRadius: '16px',
          background: '#d1fae5', color: '#065f46',
          fontWeight: '700', fontSize: '18px',
          animation: 'pop 0.3s ease-out',
        }}>
          🎉 Selesai! {moves} langkah
        </div>
      )}

      <p style={{ marginTop: '12px', fontSize: '12px', color: theme.textMuted }}>
        💡 Cari pasangan emoji yang sama!
      </p>
    </div>
  );
}