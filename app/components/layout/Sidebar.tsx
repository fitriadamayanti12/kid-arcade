// app/components/layout/Sidebar.tsx
'use client';

import ProgressDashboard from '@/app/components/ProgressDashboard';
import Leaderboard from '@/app/components/Leaderboard';
import { useThemeStyles } from '@/hooks/useThemeStyles';

interface SidebarProps {
  showSidebar: 'progress' | 'leaderboard';
  onToggle: (type: 'progress' | 'leaderboard') => void;
  playerName: string;
  onAvatarChange: (avatar: string) => void;
  selectedGame: string;
}

export default function Sidebar({ showSidebar, onToggle, playerName, onAvatarChange, selectedGame }: SidebarProps) {
  const theme = useThemeStyles();

  return (
    <div style={{ marginBottom: '12px' }}>
      {/* Toggle Buttons */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
        <button
          onClick={() => onToggle('progress')}
          style={{
            flex: 1,
            padding: '10px 16px',
            borderRadius: '14px',
            border: 'none',
            fontSize: '14px',
            fontWeight: '700',
            cursor: 'pointer',
            background: showSidebar === 'progress' ? '#f59e0b' : theme.bgHover,
            color: showSidebar === 'progress' ? '#fff' : theme.textSecondary,
            transition: 'all 0.2s',
            boxShadow: showSidebar === 'progress' ? '0 2px 8px rgba(245,158,11,0.3)' : 'none',
          }}
        >
          📊 Progress
        </button>
        <button
          onClick={() => onToggle('leaderboard')}
          style={{
            flex: 1,
            padding: '10px 16px',
            borderRadius: '14px',
            border: 'none',
            fontSize: '14px',
            fontWeight: '700',
            cursor: 'pointer',
            background: showSidebar === 'leaderboard' ? '#f59e0b' : theme.bgHover,
            color: showSidebar === 'leaderboard' ? '#fff' : theme.textSecondary,
            transition: 'all 0.2s',
            boxShadow: showSidebar === 'leaderboard' ? '0 2px 8px rgba(245,158,11,0.3)' : 'none',
          }}
        >
          🏆 Leaderboard
        </button>
      </div>

      {/* Content */}
      <div style={{ animation: 'slide-up 0.3s ease-out' }}>
        {showSidebar === 'progress' ? (
          <ProgressDashboard 
            playerName={playerName} 
            onAvatarChange={onAvatarChange} 
          />
        ) : (
          <Leaderboard 
            gameType={selectedGame} 
            limit={10} 
          />
        )}
      </div>
    </div>
  );
}