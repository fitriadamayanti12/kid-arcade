'use client';

import { SoundType } from '@/hooks/useSoundEffect';

interface HeaderProps {
  playerName: string;
  selectedAvatar: string;
  soundEnabled: boolean;
  onToggleSound: () => void;
  onLogout: () => void;
  playSound?: (type: SoundType) => void;  // Opsional, jika tidak digunakan di sini
}

export default function Header({ playerName, selectedAvatar, soundEnabled, onToggleSound, onLogout }: HeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row justify-between items-center mb-4 sm:mb-6 gap-3 sm:gap-4">
      <div className="flex items-center gap-2 sm:gap-3">
        <span className="text-3xl sm:text-4xl md:text-5xl">{selectedAvatar}</span>
        <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-orange-600 text-center sm:text-left break-words">
          🎮 {playerName}&apos;s Arcade
        </h1>
      </div>
      <div className="flex gap-2">
        <button
          onClick={onToggleSound}
          className="bg-gray-500 text-white px-2 sm:px-3 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm hover:bg-gray-600 transition"
          title={soundEnabled ? 'Matikan Suara' : 'Hidupkan Suara'}
        >
          {soundEnabled ? '🔊' : '🔇'}
        </button>
        <button
          onClick={onLogout}
          className="bg-gray-500 text-white px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm hover:bg-gray-600 transition"
        >
          Ganti Pemain
        </button>
      </div>
    </div>
  );
}