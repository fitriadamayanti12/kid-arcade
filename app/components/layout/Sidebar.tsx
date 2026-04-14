'use client';

import ProgressDashboard from '@/app/components/ProgressDashboard';
import Leaderboard from '@/app/components/Leaderboard';

interface SidebarProps {
  showSidebar: 'progress' | 'leaderboard';
  onToggle: (type: 'progress' | 'leaderboard') => void;
  playerName: string;
  onAvatarChange: (avatar: string) => void;
  selectedGame: string;
}

export default function Sidebar({ showSidebar, onToggle, playerName, onAvatarChange, selectedGame }: SidebarProps) {
  return (
    <>
      <div className="flex gap-2 mb-3 sm:mb-4 justify-end">
        <button
          onClick={() => onToggle('progress')}
          className={`px-2 sm:px-3 md:px-4 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm font-bold transition ${
            showSidebar === 'progress' ? 'bg-orange-500 text-white' : 'bg-gray-200 text-gray-600'
          }`}
        >
          📊 Progress
        </button>
        <button
          onClick={() => onToggle('leaderboard')}
          className={`px-2 sm:px-3 md:px-4 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm font-bold transition ${
            showSidebar === 'leaderboard' ? 'bg-orange-500 text-white' : 'bg-gray-200 text-gray-600'
          }`}
        >
          🏆 Leaderboard
        </button>
      </div>

      {showSidebar === 'progress' ? (
        <ProgressDashboard playerName={playerName} onAvatarChange={onAvatarChange} />
      ) : (
        <Leaderboard gameType={selectedGame} limit={5} />
      )}
    </>
  );
}