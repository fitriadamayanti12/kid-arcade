// app/components/WordMatch.tsx
'use client';

import { useState, useEffect } from 'react';
import { useSoundEffect } from '@/hooks/useSoundEffect';

interface WordMatchProps {
  playerName: string;
  onComplete: (stars: number, score: number) => void;
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
  const [cards, setCards] = useState<WordCard[]>([]);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [matches, setMatches] = useState(0);
  const [moves, setMoves] = useState(0);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [isComplete, setIsComplete] = useState(false);
  const { playSound } = useSoundEffect();

  useEffect(() => {
    startNewGame();
  }, []);

  const startNewGame = () => {
    const shuffled = [...words, ...words]
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
    playSound('click');
  };

  const handleCardClick = (clickedCard: WordCard) => {
    if (isComplete) return;
    if (clickedCard.matched) return;
    if (selectedId === clickedCard.id) return;

    if (selectedId === null) {
      setSelectedId(clickedCard.id);
      playSound('click');
      return;
    }

    const selectedCard = cards.find(c => c.id === selectedId)!;
    setMoves(m => m + 1);

    // Cek apakah cocok (text dengan image dari pasangannya)
    const isMatch =
      (selectedCard.text === clickedCard.text && selectedCard.image === clickedCard.image) ||
      (selectedCard.text === clickedCard.image && selectedCard.image === clickedCard.text);

    if (isMatch) {
      // Match found!
      setCards(cards.map(c =>
        c.id === selectedId || c.id === clickedCard.id
          ? { ...c, matched: true }
          : c
      ));
      setMatches(m => m + 1);
      playSound('correct');

      const newMatches = matches + 1;
      if (newMatches === words.length && startTime) {
        const timeSpent = (Date.now() - startTime) / 1000;
        let stars = 1;
        if (moves + 1 <= 12) stars = 3;
        else if (moves + 1 <= 18) stars = 2;

        setIsComplete(true);
        playSound('win');
        onComplete(stars, timeSpent);
      }
    } else {
      playSound('wrong');
    }

    setSelectedId(null);
  };

  // app/components/WordMatch.tsx - Responsive version

  return (
    <div className="p-3 sm:p-4 md:p-6">
      <div className="text-center mb-4 sm:mb-6">
        <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-teal-600 mb-2">📖 Cocokkan Gambar & Kata</h2>
        <p className="text-xs sm:text-sm text-gray-600">Baca kata, lalu cari gambar yang cocok!</p>
        <div className="flex justify-center gap-4 sm:gap-6 mt-2 sm:mt-3 text-xs sm:text-sm">
          <span>🎯 Pasangan: {matches} / {words.length}</span>
          <span>🔄 Langkah: {moves}</span>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 sm:gap-3 max-w-3xl mx-auto">
        {cards.map(card => (
          <button
            key={card.id}
            onClick={() => handleCardClick(card)}
            disabled={card.matched}
            className={`h-20 sm:h-24 md:h-28 rounded-xl sm:rounded-2xl text-sm sm:text-base md:text-xl font-bold transition transform ${card.matched
                ? 'bg-green-300 opacity-60 cursor-default scale-95'
                : selectedId === card.id
                  ? 'bg-yellow-300 scale-95 ring-2 sm:ring-4 ring-yellow-500'
                  : 'bg-gradient-to-br from-teal-200 to-cyan-200 hover:scale-105 hover:shadow-lg'
              }`}
          >
            <div className="flex items-center justify-center h-full p-1 sm:p-2">
              {card.matched ? (
                '✓'
              ) : (
                <span className={card.text.length > 2 ? 'text-xs sm:text-sm md:text-lg font-bold break-words text-center' : 'text-2xl sm:text-3xl md:text-4xl'}>
                  {card.text.length > 2 ? card.text : card.image}
                </span>
              )}
            </div>
          </button>
        ))}
      </div>

      <div className="text-center mt-4 sm:mt-6">
        <button
          onClick={startNewGame}
          className="bg-teal-500 text-white px-4 sm:px-6 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm font-bold hover:bg-teal-600 transition"
        >
          🔄 Game Baru
        </button>
      </div>

      <div className="text-center mt-3 sm:mt-4 text-xs text-gray-500">
        💡 Klik kartu untuk membuka. Cocokkan kata dengan gambar!
      </div>
    </div>
  );
}