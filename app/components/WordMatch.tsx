// app/components/WordMatch.tsx
'use client';

import { useState, useEffect } from 'react';
import { useSoundEffect } from '@/hooks/useSoundEffect';
import { useThemeStyles } from '@/hooks/useThemeStyles';

interface WordMatchProps {
  playerName: string;
  onComplete: (stars: number, extra?: any) => void; // ← FIX: tambah extra
}

interface WordCard {
  id: number;
  text: string;
  image: string;
  matched: boolean;
}

const words = [
  { text: 'KUCING', image: '🐱' },
  { text: 'ANJING', image: '🐶' },
  { text: 'BURUNG', image: '🐦' },
  { text: 'IKAN', image: '🐟' },
  { text: 'SAPI', image: '🐮' },
  { text: 'KATAK', image: '🐸' },
  { text: 'AYAM', image: '🐔' },
  { text: 'KELINCI', image: '🐰' },
];

export default function WordMatch({ playerName, onComplete }: WordMatchProps) {
  const theme = useThemeStyles();
  const [cards, setCards] = useState<WordCard[]>([]);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [matches, setMatches] = useState(0);
  const [moves, setMoves] = useState(0);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [isComplete, setIsComplete] = useState(false);
  const { playSound } = useSoundEffect();

  useEffect(() => { startNewGame(); }, []);

  const startNewGame = () => {
    const shuffled = [...words]
      .sort(() => Math.random() - 0.5)
      .map((item, idx) => ({
        id: idx,
        text: item.text,
        image: item.image,
        matched: false,
      }));
    setCards(shuffled);
    setMatches(0);
    setMoves(0);
    setSelectedId(null);
    setIsComplete(false);
    setStartTime(Date.now());
  };

  const handleCardClick = (clickedCard: WordCard) => {
    if (isComplete || clickedCard.matched || selectedId === clickedCard.id) return;

    if (selectedId === null) {
      setSelectedId(clickedCard.id);
      return;
    }

    const selectedCard = cards.find(c => c.id === selectedId)!;
    setMoves(m => m + 1);

    const isMatch = selectedCard.text === clickedCard.text;

    if (isMatch) {
      setCards(cards.map(c =>
        c.id === selectedId || c.id === clickedCard.id ? { ...c, matched: true } : c
      ));
      const newMatches = matches + 1;
      setMatches(newMatches);
      playSound('win');

      if (newMatches === words.length && startTime) {
        const timeSpent = Math.round((Date.now() - startTime) / 1000);
        let stars = 1;
        if (moves + 1 <= 12) stars = 3;
        else if (moves + 1 <= 18) stars = 2;
        setIsComplete(true);
        onComplete(stars, { score: stars * 10, time: timeSpent, moves: moves + 1 });
      }
    } else {
      playSound('click');
    }
    setSelectedId(null);
  };

  return (
    <div style={{ padding: '16px', maxWidth: '600px', margin: '0 auto' }}>
      <div style={{ textAlign: 'center', marginBottom: '20px' }}>
        <h2 style={{ fontSize: '22px', fontWeight: '800', color: theme.heading, marginBottom: '4px' }}>
          📖 Cocokkan Kata
        </h2>
        <p style={{ fontSize: '13px', color: theme.textSecondary }}>
          Cari pasangan kata yang sama!
        </p>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', marginTop: '8px', fontSize: '13px', color: theme.textSecondary }}>
          <span>🎯 {matches}/{words.length}</span>
          <span>🔄 {moves} langkah</span>
        </div>
      </div>

      {/* Game Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px' }}>
        {cards.map(card => (
          <button
            key={card.id}
            onClick={() => handleCardClick(card)}
            disabled={card.matched}
            style={{
              aspectRatio: '1',
              borderRadius: '14px',
              border: 'none',
              fontSize: card.text.length > 3 ? '14px' : '28px',
              fontWeight: '700',
              cursor: card.matched ? 'default' : 'pointer',
              background: card.matched 
                ? '#d1fae5' 
                : selectedId === card.id 
                  ? '#fef3c7' 
                  : theme.bgHover,
              color: card.matched ? '#10b981' : theme.text,
              opacity: card.matched ? 0.6 : 1,
              transform: selectedId === card.id ? 'scale(0.95)' : 'scale(1)',
              transition: 'all 0.2s',
              boxShadow: selectedId === card.id ? '0 0 0 3px #f59e0b' : 'none',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '6px',
            }}
          >
            {card.matched ? '✓' : card.text.length > 3 ? card.text : card.image}
          </button>
        ))}
      </div>

      {/* New Game Button */}
      <div style={{ textAlign: 'center', marginTop: '16px' }}>
        <button onClick={startNewGame} style={{
          padding: '10px 24px', borderRadius: '999px', border: 'none',
          background: '#14b8a6', color: '#fff', fontWeight: '700',
          fontSize: '14px', cursor: 'pointer',
        }}>
          🔄 Game Baru
        </button>
      </div>

      {/* Complete Message */}
      {isComplete && (
        <div style={{
          marginTop: '16px', padding: '12px', borderRadius: '12px',
          background: '#d1fae5', color: '#065f46',
          textAlign: 'center', fontWeight: '700', fontSize: '16px',
          animation: 'pop 0.3s ease-out',
        }}>
          🎉 Selesai! {moves} langkah
        </div>
      )}
    </div>
  );
}