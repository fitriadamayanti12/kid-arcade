'use client';

import { SoundType } from '@/hooks/useSoundEffect';

type GameType = 'puzzle' | 'memory' | 'timer' | 'bubble' | 'wordmatch' | 'fillblanks' | 'aigame';

interface GameSelectorProps {
  selectedGame: GameType;
  onSelectGame: (game: GameType) => void;
  playSound: (type: SoundType) => void;  // ← Perbaiki tipe ke SoundType
}

const games = [
  { id: 'puzzle', label: '🧩 Puzzle', color: 'from-orange-500 to-red-500' },
  { id: 'memory', label: '🃏 Memory', color: 'from-purple-500 to-pink-500' },
  { id: 'timer', label: '⏱️ Timer', color: 'from-red-500 to-orange-500' },
  { id: 'bubble', label: '🎈 Math', color: 'from-green-500 to-teal-500' },
  { id: 'wordmatch', label: '📖 Word', color: 'from-teal-500 to-cyan-500' },
  { id: 'fillblanks', label: '✏️ Blanks', color: 'from-teal-500 to-cyan-500' },
  { id: 'aigame', label: '🤖 AI Game', color: 'from-purple-500 to-pink-500' },
] as const;

export default function GameSelector({ selectedGame, onSelectGame, playSound }: GameSelectorProps) {
  return (
    <div className="flex flex-wrap gap-1.5 sm:gap-2 md:gap-3 mb-4 sm:mb-6 justify-center">
      {games.map((game) => (
        <button
          key={game.id}
          onClick={() => {
            onSelectGame(game.id);
            playSound('click');  // ← 'click' adalah SoundType yang valid
          }}
          className={`px-2 sm:px-3 md:px-4 lg:px-6 py-1.5 sm:py-2 md:py-3 rounded-full font-bold transition transform hover:scale-105 text-xs sm:text-sm md:text-base ${
            selectedGame === game.id
              ? `bg-gradient-to-r ${game.color} text-white shadow-lg`
              : 'bg-white text-gray-700 hover:bg-gray-100'
          }`}
        >
          {game.label}
        </button>
      ))}
    </div>
  );
}