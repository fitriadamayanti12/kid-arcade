// app/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useSoundEffect } from '@/hooks/useSoundEffect';
import { loginPlayer } from '@/lib/supabase';
import Header from '@/app/components/layout/Header';
import GameSelector from '@/app/components/layout/GameSelector';
import Sidebar from '@/app/components/layout/Sidebar';
import LoginScreen from '@/app/components/layout/LoginScreen';
import GameRenderer from '@/app/components/games/GameRenderer';
import RewardDisplay from '@/app/components/RewardDisplay';
import GameLoading from '@/app/components/ui/GameLoading';
import { useGameComplete } from '@/hooks/useGameComplete';

export default function Home() {
  const [mounted, setMounted] = useState(false);
  const [playerName, setPlayerName] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [selectedAvatar, setSelectedAvatar] = useState('👦');
  const [selectedGame, setSelectedGame] = useState('puzzle');
  const [gameKey, setGameKey] = useState(0);
  const [selectedGrade, setSelectedGrade] = useState('all');
  const [showSidebar, setShowSidebar] = useState<'progress' | 'leaderboard'>('progress');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showReward, setShowReward] = useState(false);
  const [lastReward, setLastReward] = useState<any>(null);
  const [inputName, setInputName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [loginError, setLoginError] = useState('');

  const { playSound, toggleSound } = useSoundEffect();
  const [soundEnabled, setSoundEnabled] = useState(true);
  const { handleGameComplete } = useGameComplete(playerName);

  useEffect(() => { setMounted(true); }, []);

  const handleLogin = async (name: string) => {
    if (!name.trim()) return;
    setIsLoading(true); setLoginError('');
    try {
      const data = await loginPlayer(name.trim());
      setPlayerName(data.username);
      setSelectedAvatar(data.avatar || '👦');
      setIsLoggedIn(true); playSound('win');
    } catch (error: any) {
      setLoginError(error.message || 'Gagal login');
    } finally { setIsLoading(false); }
  };

  const handleLogout = () => {
    setIsLoggedIn(false); setInputName(''); setSelectedGame('puzzle'); setSelectedGrade('all');
  };

  const onGameComplete = (stars: number, extra?: any) => {
    handleGameComplete(selectedGame, stars, extra, (reward: any) => {
      setLastReward(reward); setShowReward(true);
    });
  };

  if (!mounted) return <GameLoading text="Memuat Kid Arcade..." />;

  if (!isLoggedIn) {
    return <LoginScreen inputName={inputName} setInputName={setInputName} isLoading={isLoading} onLogin={handleLogin} error={loginError} />;
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-yellow-50 dark:from-gray-900 dark:to-gray-800 transition-colors duration-300">
      <div className="px-2 sm:px-3 md:px-4 lg:px-6 py-2 sm:py-3 md:py-4 max-w-7xl mx-auto">
        
        <Header
          playerName={playerName} selectedAvatar={selectedAvatar}
          soundEnabled={soundEnabled} onToggleSound={() => setSoundEnabled(toggleSound())}
          onLogout={handleLogout} selectedGrade={selectedGrade} onGradeChange={setSelectedGrade}
        />

        <GameSelector
          selectedGame={selectedGame}
          onSelectGame={(game) => { setSelectedGame(game); setGameKey(prev => prev + 1); }}
          playSound={playSound} selectedGrade={selectedGrade}
        />

        <div className="mt-3 flex flex-col lg:flex-row gap-3 lg:gap-4">
          {/* Mobile Toggle */}
          <div className="lg:hidden flex gap-2 mb-1">
            <button onClick={() => { setSidebarOpen(!sidebarOpen); setShowSidebar('progress'); }}
              className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition ${sidebarOpen && showSidebar === 'progress' ? 'bg-purple-600 text-white' : 'bg-white dark:bg-gray-700 text-gray-600 dark:text-gray-300'}`}>
              📊 Progress
            </button>
            <button onClick={() => { setSidebarOpen(!sidebarOpen); setShowSidebar('leaderboard'); }}
              className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition ${sidebarOpen && showSidebar === 'leaderboard' ? 'bg-purple-600 text-white' : 'bg-white dark:bg-gray-700 text-gray-600 dark:text-gray-300'}`}>
              🏆 Leaderboard
            </button>
          </div>

          {sidebarOpen && (
            <div className="lg:hidden animate-slide-up">
              <Sidebar showSidebar={showSidebar} onToggle={setShowSidebar} playerName={playerName} onAvatarChange={setSelectedAvatar} selectedGame={selectedGame} />
            </div>
          )}

          <div className="flex-1 lg:flex-[2] order-1 lg:order-none min-w-0">
            <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl sm:rounded-3xl p-2 sm:p-3 md:p-4 lg:p-6 shadow-xl dark:shadow-gray-900/50 min-h-[350px] sm:min-h-[400px] transition-colors duration-300">
              <GameRenderer selectedGame={selectedGame} gameKey={gameKey} playerName={playerName} onComplete={onGameComplete} />
            </div>
          </div>

          <div className="hidden lg:block w-72 xl:w-80 flex-shrink-0">
            <div className="sticky top-4">
              <Sidebar showSidebar={showSidebar} onToggle={setShowSidebar} playerName={playerName} onAvatarChange={setSelectedAvatar} selectedGame={selectedGame} />
            </div>
          </div>
        </div>
      </div>

      {/* Reward Modal - Pakai RewardDisplay dengan Growth Mindset + Suara Tepuk Tangan */}
      {showReward && lastReward && (
        <RewardDisplay
          playerName={playerName}
          starsEarned={lastReward.stars}
          newBadge={lastReward.newBadge}
          selectedGrade={selectedGrade}
          onClose={() => { setShowReward(false); setGameKey(prev => prev + 1); }}
        />
      )}
    </main>
  );
}