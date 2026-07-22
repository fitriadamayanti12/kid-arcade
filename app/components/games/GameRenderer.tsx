// app/components/games/GameRenderer.tsx
'use client';

import { GameComponents } from './GameImports';
import GameLoading from '@/app/components/ui/GameLoading';
import { useThemeStyles } from '@/hooks/useThemeStyles';

interface GameRendererProps {
  selectedGame: string;
  gameKey: number;
  playerName: string;
  onComplete: (stars: number, extra?: any) => void;
}

// Game yang butuh playerName prop
const NEEDS_PLAYER_NAME = ['memory', 'bubble', 'wordmatch', 'fillblanks', 'aigame'];

export default function GameRenderer({ 
  selectedGame, 
  gameKey, 
  playerName, 
  onComplete 
}: GameRendererProps) {
  const theme = useThemeStyles();
  const GameComponent = GameComponents[selectedGame];

  if (!GameComponent) {
    console.warn(`Game "${selectedGame}" tidak ditemukan di registry`);
    return (
      <div style={{ 
        background: theme.bgCard, 
        color: theme.text,
        borderRadius: '16px',
        padding: '40px 16px',
        minHeight: '400px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
      }}>
        <div>
          <div style={{ fontSize: '50px', marginBottom: '12px' }}>🚧</div>
          <p style={{ fontSize: '16px', fontWeight: '600', color: theme.textSecondary }}>
            Game "{selectedGame}" belum tersedia
          </p>
          <p style={{ fontSize: '13px', color: theme.textMuted, marginTop: '4px' }}>
            Game ini sedang dalam pengembangan. Coba game lain ya! ✨
          </p>
        </div>
      </div>
    );
  }

  const needsName = NEEDS_PLAYER_NAME.includes(selectedGame);

  return (
    <div style={{ 
      background: theme.bgCard, 
      color: theme.text,
      borderRadius: '16px',
      padding: '16px',
      minHeight: '400px',
      transition: 'background-color 0.3s, color 0.3s',
      boxShadow: theme.shadow,
      border: `1px solid ${theme.border}`,
    }}>
      {needsName ? (
        <GameComponent key={gameKey} onComplete={onComplete} playerName={playerName} />
      ) : (
        <GameComponent key={gameKey} onComplete={onComplete} />
      )}
    </div>
  );
}