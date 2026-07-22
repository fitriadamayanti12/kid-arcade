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
import GameLoading from '@/app/components/ui/GameLoading';
import { useGameComplete } from '@/hooks/useGameComplete';

export default function Home() {
  // Core
  const [mounted, setMounted] = useState(false);
  const [playerName, setPlayerName] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [selectedAvatar, setSelectedAvatar] = useState('👦');
  
  // Game
  const [selectedGame, setSelectedGame] = useState('puzzle');
  const [gameKey, setGameKey] = useState(0);
  
  // Grade Filter
  const [selectedGrade, setSelectedGrade] = useState('all');
  
  // Sidebar
  const [showSidebar, setShowSidebar] = useState<'progress' | 'leaderboard'>('progress');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  // UI
  const [showReward, setShowReward] = useState(false);
  const [lastReward, setLastReward] = useState<any>(null);
  
  // Login
  const [inputName, setInputName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [loginError, setLoginError] = useState('');

  // Hooks
  const { playSound, toggleSound } = useSoundEffect();
  const [soundEnabled, setSoundEnabled] = useState(true);
  const { handleGameComplete } = useGameComplete(playerName);

  useEffect(() => { setMounted(true); }, []);

  const handleLogin = async (name: string) => {
    if (!name.trim()) return;
    setIsLoading(true);
    setLoginError('');
    try {
      const data = await loginPlayer(name.trim());
      setPlayerName(data.username);
      setSelectedAvatar(data.avatar || '👦');
      setIsLoggedIn(true);
      playSound('win');
    } catch (error: any) {
      setLoginError(error.message || 'Gagal login');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setInputName('');
    setSelectedGame('puzzle');
    setSelectedGrade('all');
  };

  const onGameComplete = (stars: number, extra?: any) => {
    handleGameComplete(selectedGame, stars, extra, (reward: any) => {
      setLastReward(reward);
      setShowReward(true);
    });
  };

  // Loading
  if (!mounted) return <GameLoading text="Memuat Kid Arcade..." />;

  // Login
  if (!isLoggedIn) {
    return (
      <LoginScreen
        inputName={inputName}
        setInputName={setInputName}
        isLoading={isLoading}
        onLogin={handleLogin}
        error={loginError}
      />
    );
  }

  // Main App
  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-yellow-50 dark:from-gray-900 dark:to-gray-800 transition-colors duration-300">
      <div className="px-2 sm:px-3 md:px-4 lg:px-6 py-2 sm:py-3 md:py-4 max-w-7xl mx-auto">
        
        <Header
          playerName={playerName}
          selectedAvatar={selectedAvatar}
          soundEnabled={soundEnabled}
          onToggleSound={() => setSoundEnabled(toggleSound())}
          onLogout={handleLogout}
          selectedGrade={selectedGrade}
          onGradeChange={setSelectedGrade}
        />

        <GameSelector
          selectedGame={selectedGame}
          onSelectGame={(game) => { setSelectedGame(game); setGameKey(prev => prev + 1); }}
          playSound={playSound}
          selectedGrade={selectedGrade}
        />

        {/* Mobile: Sidebar Toggle + Content */}
        <div className="mt-3 flex flex-col lg:flex-row gap-3 lg:gap-4">
          
          {/* Mobile Sidebar Toggle */}
          <div className="lg:hidden flex gap-2 mb-1">
            <button 
              onClick={() => { setSidebarOpen(!sidebarOpen); setShowSidebar('progress'); }}
              className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition ${
                sidebarOpen && showSidebar === 'progress' 
                  ? 'bg-purple-600 text-white' 
                  : 'bg-white dark:bg-gray-700 text-gray-600 dark:text-gray-300'
              }`}
            >
              📊 Progress
            </button>
            <button 
              onClick={() => { setSidebarOpen(!sidebarOpen); setShowSidebar('leaderboard'); }}
              className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition ${
                sidebarOpen && showSidebar === 'leaderboard' 
                  ? 'bg-purple-600 text-white' 
                  : 'bg-white dark:bg-gray-700 text-gray-600 dark:text-gray-300'
              }`}
            >
              🏆 Leaderboard
            </button>
          </div>

          {/* Mobile Sidebar (Collapsible) */}
          {sidebarOpen && (
            <div className="lg:hidden animate-slide-up">
              <Sidebar
                showSidebar={showSidebar}
                onToggle={setShowSidebar}
                playerName={playerName}
                onAvatarChange={setSelectedAvatar}
                selectedGame={selectedGame}
              />
            </div>
          )}

          {/* Game Area */}
          <div className="flex-1 lg:flex-[2] order-1 lg:order-none min-w-0">
            <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl sm:rounded-3xl p-2 sm:p-3 md:p-4 lg:p-6 shadow-xl dark:shadow-gray-900/50 min-h-[350px] sm:min-h-[400px] transition-colors duration-300">
              <GameRenderer
                selectedGame={selectedGame}
                gameKey={gameKey}
                playerName={playerName}
                onComplete={onGameComplete}
              />
            </div>
          </div>

          {/* Desktop Sidebar */}
          <div className="hidden lg:block w-72 xl:w-80 flex-shrink-0">
            <div className="sticky top-4">
              <Sidebar
                showSidebar={showSidebar}
                onToggle={setShowSidebar}
                playerName={playerName}
                onAvatarChange={setSelectedAvatar}
                selectedGame={selectedGame}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Reward Modal */}
      {showReward && lastReward && (
        <div className="fixed inset-0 bg-black/50 dark:bg-black/70 flex items-center justify-center z-50 p-4 animate-slide-up" onClick={() => setShowReward(false)}>
          <div className="bg-white dark:bg-gray-800 rounded-3xl p-6 sm:p-8 text-center shadow-2xl max-w-[90%] sm:max-w-sm w-full animate-pop" onClick={e => e.stopPropagation()}>
            <div className="text-5xl sm:text-6xl mb-4">🎉</div>
            <h2 className="text-xl sm:text-2xl font-bold text-gray-800 dark:text-white">Kamu Hebat!</h2>
            <p className="text-gray-600 dark:text-gray-400 mt-2 text-sm sm:text-lg">
              {lastReward.stars >= 3 ? '🌟 Sempurna! Kamu luar biasa!' : 
               lastReward.stars >= 2 ? '👍 Bagus! Terus berlatih ya!' : 
               '🌱 Semangat! Setiap usaha itu berharga!'}
            </p>
            <p className="text-gray-500 dark:text-gray-400 mt-1">+{lastReward.stars} ⭐</p>
            
            {lastReward.newBadge && (
              <div className="mt-3 bg-purple-100 dark:bg-purple-900/50 rounded-xl p-3">
                <p className="text-purple-600 dark:text-purple-400 font-bold text-sm">🏅 {lastReward.newBadge}</p>
              </div>
            )}
            
            <button 
              onClick={() => { setShowReward(false); setGameKey(prev => prev + 1); }}
              className="mt-5 bg-purple-600 hover:bg-purple-700 text-white px-6 sm:px-8 py-2.5 sm:py-3 rounded-full font-bold text-sm sm:text-lg transition-all hover:scale-105 active:scale-95"
            >
              🎮 Main Lagi!
            </button>
          </div>
        </div>
      )}
    </main>
  );
}