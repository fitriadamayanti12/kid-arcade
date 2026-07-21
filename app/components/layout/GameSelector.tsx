'use client';

import { SoundType } from '@/hooks/useSoundEffect';

type GameType = 'puzzle' | 'memory' | 'timer' | 'bubble' | 'wordmatch' | 'fillblanks' | 'aigame' | 'countobjects' | 'pizzafraction' | 'mathadventure' | 'mathdetective' | 'numberninja' | 'mathscrabble' | 'mathcraft' | 'mathracer' | 'dicequest' | 'mathtower' | 'multblitz' | 'geoquest' | 'magictable' | 'bangunyuk';

interface GameSelectorProps {
  selectedGame: GameType;
  onSelectGame: (game: GameType) => void;
  playSound: (type: SoundType) => void;
}

const games = [
  // Kelas 1-3: Basic Math
  { id: 'puzzle' as const, label: '🧩 Puzzle', color: 'from-orange-500 to-red-500', grade: '1-3', category: 'Basic' },
  { id: 'countobjects' as const, label: '🔵 Hitung', color: 'from-blue-500 to-cyan-500', grade: '3', category: 'Basic' },
  { id: 'mathadventure' as const, label: '🏃 Adventure', color: 'from-purple-500 to-pink-500', grade: '3', category: 'Basic' },
  { id: 'numberninja' as const, label: '🥷 Ninja', color: 'from-gray-600 to-gray-800', grade: '3', category: 'Basic' },
  { id: 'mathcraft' as const, label: '🏗️ Craft', color: 'from-amber-500 to-yellow-600', grade: '3', category: 'Basic' },
  { id: 'dicequest' as const, label: '🎲 DiceQuest', color: 'from-amber-500 to-red-500', grade: '3', category: 'Basic' },
  { id: 'multblitz' as const, label: '⚡ Blitz', color: 'from-yellow-500 to-red-500', grade: '3', category: 'Basic' },
  { id: 'magictable' as const, label: '🌟 Tabel Ajaib', color: 'from-yellow-400 to-amber-500', grade: '3', category: 'Basic' },
  
  // Kelas 4-6: Intermediate Math
  { id: 'memory' as const, label: '🃏 Memory', color: 'from-purple-500 to-pink-500', grade: '4-6', category: 'Intermediate' },
  { id: 'timer' as const, label: '⏱️ Timer', color: 'from-red-500 to-orange-500', grade: '4-6', category: 'Intermediate' },
  { id: 'bubble' as const, label: '🎈 Math', color: 'from-green-500 to-teal-500', grade: '4-6', category: 'Intermediate' },
  { id: 'pizzafraction' as const, label: '🍕 Pecahan', color: 'from-yellow-500 to-orange-500', grade: '6', category: 'Intermediate' },
  { id: 'mathdetective' as const, label: '🔍 Detektif', color: 'from-indigo-500 to-purple-500', grade: '6', category: 'Intermediate' },
  { id: 'mathscrabble' as const, label: '🔤 Scrabble', color: 'from-teal-600 to-emerald-600', grade: '6', category: 'Intermediate' },
  { id: 'mathracer' as const, label: '🏎️ Racer', color: 'from-red-600 to-orange-600', grade: '6', category: 'Intermediate' },
  { id: 'mathtower' as const, label: '🏰 Tower', color: 'from-stone-500 to-stone-700', grade: '6', category: 'Intermediate' },
  { id: 'geoquest' as const, label: '📐 GeoQuest', color: 'from-violet-500 to-purple-500', grade: '6', category: 'Intermediate' },
  { id: 'bangunyuk' as const, label: '🏠 Bangun Yuk', color: 'from-emerald-500 to-green-600', grade: '6', category: 'Intermediate' },
  
  // Language & Logic
  { id: 'wordmatch' as const, label: '📖 Word', color: 'from-teal-500 to-cyan-500', grade: 'All', category: 'Language' },
  { id: 'fillblanks' as const, label: '✏️ Blanks', color: 'from-teal-500 to-cyan-500', grade: 'All', category: 'Language' },
  
  // Advanced
  { id: 'aigame' as const, label: '🤖 AI Game', color: 'from-purple-500 to-pink-500', grade: 'All', category: 'Advanced' },
];

export default function GameSelector({ selectedGame, onSelectGame, playSound }: GameSelectorProps) {
  return (
    <div className="space-y-3">
      {/* Game Buttons */}
      <div className="flex flex-wrap gap-1.5 sm:gap-2 md:gap-3 justify-center">
        {games.map((game) => (
          <button
            key={game.id}
            onClick={() => {
              onSelectGame(game.id);
              playSound('click');
            }}
            className={`px-2 sm:px-3 md:px-4 lg:px-6 py-1.5 sm:py-2 md:py-3 rounded-full font-bold transition transform hover:scale-105 text-xs sm:text-sm md:text-base relative ${
              selectedGame === game.id
                ? `bg-gradient-to-r ${game.color} text-white shadow-lg scale-105`
                : 'bg-white text-gray-700 hover:bg-gray-100 border-2 border-gray-200'
            }`}
            title={`Kelas ${game.grade} - ${game.category}`}
          >
            <span className="mr-1">{game.label}</span>
            <span className="text-[10px] opacity-75 hidden sm:inline">({game.grade})</span>
          </button>
        ))}
      </div>

      {/* Category Labels */}
      <div className="flex flex-wrap gap-2 justify-center">
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-green-400"></span>
          <span className="text-[10px] sm:text-xs text-gray-600">Kelas 1-3</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-yellow-400"></span>
          <span className="text-[10px] sm:text-xs text-gray-600">Kelas 4-6</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-blue-400"></span>
          <span className="text-[10px] sm:text-xs text-gray-600">Bahasa</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-purple-400"></span>
          <span className="text-[10px] sm:text-xs text-gray-600">Advanced</span>
        </div>
      </div>
    </div>
  );
}