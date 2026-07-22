// app/components/layout/GameSelector.tsx
'use client';

import { SoundType } from '@/hooks/useSoundEffect';
import { useThemeStyles } from '@/hooks/useThemeStyles';

type GameType = string;

interface GameSelectorProps {
  selectedGame: GameType;
  onSelectGame: (game: GameType) => void;
  playSound: (type: SoundType) => void;
  selectedGrade: string;
}

interface GameItem {
  id: string;
  label: string;
  color: string;
  textColor: string;
  grade: string;
}

const games: GameItem[] = [
  // ========== PAUD ==========
  { id: 'kenalangka', label: '🌟 Kenal Angka', color: '#fef3c7', textColor: '#92400e', grade: 'paud' },
  { id: 'hitunghewan', label: '🐮 Hitung Hewan', color: '#d1fae5', textColor: '#065f46', grade: 'paud' },
  { id: 'bentukwarna', label: '🔺 Bentuk Warna', color: '#fce7f3', textColor: '#9d174d', grade: 'paud' },
  { id: 'besarkecil', label: '🐘 Besar Kecil', color: '#ede9fe', textColor: '#5b21b6', grade: 'paud' },
  { id: 'cocokangka', label: '🎯 Cocok Angka', color: '#e0f2fe', textColor: '#075985', grade: 'paud' },

  // ========== TK ==========
  { id: 'tambahsederhana', label: '➕ Tambah Asyik', color: '#d1fae5', textColor: '#065f46', grade: 'tk' },
  { id: 'kurangseru', label: '➖ Kurang Seru', color: '#fee2e2', textColor: '#991b1b', grade: 'tk' },
  { id: 'urutangka', label: '🔢 Urut Angka', color: '#ede9fe', textColor: '#5b21b6', grade: 'tk' },
  { id: 'hitungbuah', label: '🍎 Hitung Buah', color: '#fef3c7', textColor: '#92400e', grade: 'tk' },
  { id: 'pologambar', label: '🧩 Pola Gambar', color: '#fce7f3', textColor: '#9d174d', grade: 'tk' },
  { id: 'countobjects', label: '🔵 Hitung Benda', color: '#dbeafe', textColor: '#1e40af', grade: 'tk' },

  // ========== Kelas 1 ==========
  { id: 'tambahasyik', label: '➕ Tambah Cepat', color: '#dbeafe', textColor: '#1e40af', grade: '1' },
  { id: 'kurangseru1', label: '➖ Kurang Cepat', color: '#fee2e2', textColor: '#991b1b', grade: '1' },
  { id: 'jamwaktu', label: '🕐 Jam & Waktu', color: '#cffafe', textColor: '#155e75', grade: '1' },
  { id: 'bangundatar', label: '🔺 Bangun Datar', color: '#ede9fe', textColor: '#5b21b6', grade: '1' },
  { id: 'uangsaku', label: '💵 Uang Saku', color: '#d1fae5', textColor: '#065f46', grade: '1' },
  { id: 'polabilangan', label: '🔢 Pola Bilangan', color: '#ede9fe', textColor: '#5b21b6', grade: '1' },
  { id: 'panjangpendek', label: '📏 Panjang Pendek', color: '#ffedd5', textColor: '#9a3412', grade: '1' },
  { id: 'mathquiz1', label: '🎯 Kuis Kelas 1', color: '#e0e7ff', textColor: '#3730a3', grade: '1' },
  { id: 'puzzle', label: '🧩 Puzzle Math', color: '#ffedd5', textColor: '#9a3412', grade: '1' },
  { id: 'wordmatch', label: '📖 Word Match', color: '#ccfbf1', textColor: '#134e4a', grade: '1' },

  // ========== Kelas 2 ==========
  { id: 'tambahcepat', label: '➕ Tambah Cepat', color: '#dbeafe', textColor: '#1e40af', grade: '2' },
  { id: 'kurangcepat', label: '➖ Kurang Cepat', color: '#fee2e2', textColor: '#991b1b', grade: '2' },
  { id: 'kaliawal', label: '✖️ Perkalian Awal', color: '#ede9fe', textColor: '#5b21b6', grade: '2' },
  { id: 'bagiawal', label: '➗ Pembagian Awal', color: '#d1fae5', textColor: '#065f46', grade: '2' },
  { id: 'mathadventure', label: '🏃 Adventure', color: '#ede9fe', textColor: '#5b21b6', grade: '2' },
  { id: 'numberninja', label: '🥷 Ninja Math', color: '#e5e7eb', textColor: '#374151', grade: '2' },
  { id: 'magictable', label: '🌟 Tabel Ajaib', color: '#fef3c7', textColor: '#92400e', grade: '2' },
  { id: 'fillblanks', label: '✏️ Fill Blanks', color: '#ccfbf1', textColor: '#134e4a', grade: '2' },

  // ========== Kelas 3 ==========
  { id: 'kalimaster', label: '✖️ Kali Master', color: '#ede9fe', textColor: '#5b21b6', grade: '3' },
  { id: 'bagimaster', label: '➗ Bagi Master', color: '#d1fae5', textColor: '#065f46', grade: '3' },
  { id: 'pecahanvisual', label: '🍕 Pecahan Visual', color: '#fef3c7', textColor: '#92400e', grade: '3' },
  { id: 'geometrifun', label: '📐 Geometri Fun', color: '#dbeafe', textColor: '#1e40af', grade: '3' },
  { id: 'mathcraft', label: '🏗️ Craft', color: '#fef3c7', textColor: '#92400e', grade: '3' },
  { id: 'dicequest', label: '🎲 DiceQuest', color: '#ffedd5', textColor: '#9a3412', grade: '3' },
  { id: 'multblitz', label: '⚡ Blitz Perkalian', color: '#fef3c7', textColor: '#92400e', grade: '3' },
  { id: 'bubble', label: '🎈 Bubble Math', color: '#d1fae5', textColor: '#065f46', grade: '3' },

  // ========== Kelas 4 ==========
  { id: 'pecahan4', label: '🍕 Pecahan 4', color: '#fef3c7', textColor: '#92400e', grade: '4' },
  { id: 'desimalfun', label: '🔢 Desimal Fun', color: '#cffafe', textColor: '#155e75', grade: '4' },
  { id: 'kpkfpb', label: '🔑 KPK & FPB', color: '#ede9fe', textColor: '#5b21b6', grade: '4' },
  { id: 'sudut', label: '📐 Sudut', color: '#fee2e2', textColor: '#991b1b', grade: '4' },
  { id: 'datachart', label: '📊 Diagram Data', color: '#d1fae5', textColor: '#065f46', grade: '4' },
  { id: 'memory', label: '🃏 Memory', color: '#ede9fe', textColor: '#5b21b6', grade: '4' },
  { id: 'timer', label: '⏱️ Timer', color: '#fee2e2', textColor: '#991b1b', grade: '4' },
  { id: 'mathracer4', label: '🏎️ Racer 4', color: '#fee2e2', textColor: '#991b1b', grade: '4' },

  // ========== Kelas 5 ==========
  { id: 'pecahan5', label: '🍕 Pecahan 5', color: '#fef3c7', textColor: '#92400e', grade: '5' },
  { id: 'volumekubus', label: '📦 Volume', color: '#dbeafe', textColor: '#1e40af', grade: '5' },
  { id: 'kecepatanwaktu', label: '🚗 Kecepatan', color: '#fee2e2', textColor: '#991b1b', grade: '5' },
  { id: 'skalapeta', label: '🗺️ Skala Peta', color: '#d1fae5', textColor: '#065f46', grade: '5' },
  { id: 'matholympiad', label: '🏆 Olympiad', color: '#fef3c7', textColor: '#92400e', grade: '5' },
  { id: 'pizzafraction', label: '🍕 Pecahan', color: '#fef3c7', textColor: '#92400e', grade: '5' },
  { id: 'mathdetective', label: '🔍 Detektif', color: '#e0e7ff', textColor: '#3730a3', grade: '5' },
  { id: 'mathscrabble', label: '🔤 Scrabble', color: '#ccfbf1', textColor: '#134e4a', grade: '5' },

  // ========== Kelas 6 ==========
  { id: 'lingkaranmaster', label: '⭕ Lingkaran', color: '#cffafe', textColor: '#155e75', grade: '6' },
  { id: 'peluangdata', label: '🎲 Peluang', color: '#ede9fe', textColor: '#5b21b6', grade: '6' },
  { id: 'bilbulat', label: '➖ Bil Bulat', color: '#e0e7ff', textColor: '#3730a3', grade: '6' },
  { id: 'statistikdata', label: '📊 Statistik', color: '#fce7f3', textColor: '#9d174d', grade: '6' },
  { id: 'bangunruang6', label: '📦 Bangun Ruang', color: '#ccfbf1', textColor: '#134e4a', grade: '6' },
  { id: 'mathracer6', label: '🏎️ Racer 6', color: '#fee2e2', textColor: '#991b1b', grade: '6' },
  { id: 'mathtower', label: '🏰 Tower', color: '#e5e7eb', textColor: '#374151', grade: '6' },
  { id: 'geoquest', label: '📐 GeoQuest', color: '#ede9fe', textColor: '#5b21b6', grade: '6' },
  { id: 'bangunyuk', label: '🏠 Bangun Yuk', color: '#d1fae5', textColor: '#065f46', grade: '6' },

  // ========== Semua Kelas ==========
  { id: 'aigame', label: '🤖 AI Game', color: '#ede9fe', textColor: '#5b21b6', grade: 'all' },
];

export default function GameSelector({ selectedGame, onSelectGame, playSound, selectedGrade }: GameSelectorProps) {
  const theme = useThemeStyles();

  const filteredGames = selectedGrade === 'all' 
    ? games 
    : games.filter(g => g.grade === selectedGrade || g.grade === 'all');

  const gradeLabel = (grade: string) => {
    if (grade === 'paud') return 'PAUD';
    if (grade === 'tk') return 'TK';
    if (grade === 'all') return 'Semua';
    return `Kelas ${grade}`;
  };

  return (
    <div style={{ marginBottom: '12px' }}>
      {/* Game Buttons */}
      <div style={{ 
        display: 'flex', 
        flexWrap: 'wrap', 
        gap: '8px', 
        justifyContent: 'center',
      }}>
        {filteredGames.length === 0 && (
          <p style={{ color: theme.textMuted, fontSize: '14px', padding: '20px' }}>
            🚧 Game untuk kategori ini sedang dibuat. Coming soon! ✨
          </p>
        )}
        {filteredGames.map((game) => (
          <button
            key={game.id}
            onClick={() => { onSelectGame(game.id); playSound('click'); }}
            style={{
              padding: '10px 16px',
              borderRadius: '16px',
              border: selectedGame === game.id 
                ? `2px solid ${game.textColor}` 
                : `1px solid ${theme.border}`,
              background: selectedGame === game.id ? game.color : theme.bgCard,
              color: selectedGame === game.id ? game.textColor : theme.text,
              fontWeight: selectedGame === game.id ? '800' : '600',
              fontSize: '14px',
              cursor: 'pointer',
              transition: 'all 0.2s',
              boxShadow: selectedGame === game.id 
                ? `0 4px 12px ${game.color}` 
                : 'none',
              transform: selectedGame === game.id ? 'scale(1.05)' : 'scale(1)',
            }}
          >
            {game.label}
          </button>
        ))}
      </div>

      {/* Game Count */}
      <p style={{ 
        textAlign: 'center', 
        fontSize: '12px', 
        color: theme.textMuted,
        marginTop: '8px',
      }}>
        {selectedGrade !== 'all'
          ? `🎮 ${filteredGames.length} game untuk ${gradeLabel(selectedGrade)}`
          : `🎮 ${filteredGames.length} game tersedia`
        }
      </p>
    </div>
  );
}