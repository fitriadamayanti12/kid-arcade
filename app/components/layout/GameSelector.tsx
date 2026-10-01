// app/components/layout/GameSelector.tsx
'use client';

import { SoundType } from '@/hooks/useSoundEffect';
import { useThemeStyles } from '@/hooks/useThemeStyles';
import GameCard from '@/app/components/ui/GameCard';
import { CATEGORIES, games, getGamesByGrade, gradeLabel, countByGrade } from '@/lib/gameCatalog';

type GameType = string;

interface GameSelectorProps {
  selectedGame: GameType;
  onSelectGame: (game: GameType) => void;
  playSound: (type: SoundType) => void;
  selectedGrade: string;
  onGradeChange: (grade: string) => void;
}

export default function GameSelector({
  selectedGame,
  onSelectGame,
  playSound,
  selectedGrade,
  onGradeChange,
}: GameSelectorProps) {
  const theme = useThemeStyles();

  const goToCategory = (grade: string) => {
    onGradeChange(grade);
    playSound('click');
  };

  // ============ HUB: "Semua" → pilih tingkat dulu, tanpa perlu scroll ============
  if (selectedGrade === 'all') {
    return (
      <div style={{ marginBottom: '12px' }}>
        <p
          style={{
            textAlign: 'center',
            fontSize: '14px',
            fontWeight: 700,
            color: theme.textSecondary,
            marginBottom: '10px',
          }}
        >
          🎯 Pilih tingkat dulu, biar game-nya pas buat kamu!
        </p>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(96px, 1fr))',
            gap: '10px',
          }}
        >
          {CATEGORIES.map((cat) => (
            <GameCard
              key={cat.id}
              variant="category"
              label={`${cat.emoji} ${cat.label}`}
              color={cat.color}
              count={countByGrade(cat.id)}
              onClick={() => goToCategory(cat.id)}
            />
          ))}
        </div>

        <button
          onClick={() => {
            onSelectGame('aigame');
            playSound('click');
          }}
          style={{
            marginTop: '12px',
            width: '100%',
            padding: '12px',
            borderRadius: '16px',
            border: 'none',
            cursor: 'pointer',
            background: 'linear-gradient(135deg, #7c3aed, #a855f7)',
            color: '#fff',
            fontWeight: 800,
            fontSize: '14px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            boxShadow: '0 4px 14px rgba(124,58,237,0.35)',
          }}
        >
          🤖 Coba AI Game — bikin soal sendiri!
        </button>

        <p style={{ textAlign: 'center', fontSize: '12px', color: theme.textMuted, marginTop: '10px' }}>
          🎮 {games.length} game siap dimainkan, dari PAUD sampai Kelas 6
        </p>
      </div>
    );
  }

  // ============ GRID: game untuk 1 tingkat, rapi & konsisten ============
  const filteredGames = getGamesByGrade(selectedGrade);
  const cat = CATEGORIES.find((c) => c.id === selectedGrade);

  return (
    <div style={{ marginBottom: '12px' }}>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '10px',
          gap: '8px',
          flexWrap: 'wrap',
        }}
      >
        <button
          onClick={() => goToCategory('all')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            background: 'transparent',
            border: `1px solid ${theme.border}`,
            borderRadius: '12px',
            padding: '11px 16px',
            fontSize: '14px',
            fontWeight: 700,
            color: theme.textSecondary,
            cursor: 'pointer',
          }}
        >
          ← Semua Tingkat
        </button>

        {cat && (
          <span
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '14px',
              fontWeight: 800,
              color: '#fff',
              background: cat.color,
              borderRadius: '999px',
              padding: '9px 16px',
            }}
          >
            {cat.emoji} {cat.label}
          </span>
        )}
      </div>

      {filteredGames.length === 0 ? (
        <p style={{ color: theme.textMuted, fontSize: '14px', padding: '20px', textAlign: 'center' }}>
          🚧 Game untuk kategori ini sedang dibuat. Coming soon! ✨
        </p>
      ) : (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(128px, 1fr))',
            gap: '10px',
          }}
        >
          {filteredGames.map((game) => (
            <GameCard
              key={game.id}
              variant="game"
              label={game.label}
              color={game.color}
              textColor={game.textColor}
              selected={selectedGame === game.id}
              difficulty={game.difficulty}
              isNew={game.isNew}
              isHot={game.isHot}
              onClick={() => {
                onSelectGame(game.id);
                playSound('click');
              }}
            />
          ))}
        </div>
      )}

      <p style={{ textAlign: 'center', fontSize: '12px', color: theme.textMuted, marginTop: '10px' }}>
        🎮 {filteredGames.length} game untuk {gradeLabel(selectedGrade)}
      </p>
    </div>
  );
}
