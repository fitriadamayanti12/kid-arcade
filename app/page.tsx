'use client';

import { useState, useCallback, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import RewardDisplay from '@/app/components/RewardDisplay';
import Header from '@/app/components/layout/Header';
import GameSelector from '@/app/components/layout/GameSelector';
import Sidebar from '@/app/components/layout/Sidebar';
import PuzzleGame from '@/app/components/games/PuzzleGame';
import MemoryMatch from '@/app/components/MemoryMatch';
import TimerChallenge from '@/app/components/TimerChallenge';
import BubbleMath from '@/app/components/BubbleMath';
import WordMatch from '@/app/components/WordMatch';
import FillBlanks from '@/app/components/FillBlanks';
import AIGameGenerator from '@/app/components/AIGameGenerator';
import { useSoundEffect } from '@/hooks/useSoundEffect';

type GameType = 'puzzle' | 'memory' | 'timer' | 'bubble' | 'wordmatch' | 'fillblanks' | 'aigame';

export default function Home() {
  const [playerName, setPlayerName] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [selectedGame, setSelectedGame] = useState<GameType>('puzzle');
  const [selectedAvatar, setSelectedAvatar] = useState('👦');
  const [showSidebar, setShowSidebar] = useState<'progress' | 'leaderboard'>('progress');
  const [showReward, setShowReward] = useState(false);
  const [lastReward, setLastReward] = useState<any>(null);
  const [gameKey, setGameKey] = useState(0);

  const { playSound, toggleSound } = useSoundEffect();
  const [soundEnabled, setSoundEnabled] = useState(true);
  const isCompletingRef = useRef(false);

  const handleToggleSound = () => {
    setSoundEnabled(toggleSound());
    playSound('click');
  };

  const handleLogin = async (name: string) => {
    if (!name.trim()) return;
    setPlayerName(name);
    setIsLoggedIn(true);
    playSound('win');

    const { data } = await supabase.from('player_stats').select('*').eq('player_name', name).single();
    if (!data) {
      await supabase.from('player_stats').insert([{
        player_name: name, total_stars: 0, total_puzzles_completed: 0,
        badges: [], stickers: [], avatar: '👦', streak: 0, owned_items: []
      }]);
      const stickers = ['🐶', '🐱', '🐭', '🐹', '🐰', '🦊', '🐻', '🐼', '🐨', '🐸'];
      await supabase.from('player_stats').update({ stickers: [stickers[Math.floor(Math.random() * stickers.length)]] }).eq('player_name', name);
    } else if (data.avatar) setSelectedAvatar(data.avatar);
  };

  const handleGameComplete = useCallback(async (stars: number, extra?: any) => {
    if (isCompletingRef.current) return;
    isCompletingRef.current = true;

    const gameType = selectedGame;
    const score = extra || stars * 10;
    playSound('win');

    await supabase.from('game_scores').insert([{ player_name: playerName, game_type: gameType, stars, score, completed_at: new Date() }]);
    const { data: stats } = await supabase.from('player_stats').select('*').eq('player_name', playerName).single();
    const newTotalStars = (stats?.total_stars || 0) + stars;
    const newTotalGames = (stats?.total_puzzles_completed || 0) + 1;

    let newBadge = null;
    if (newTotalGames === 5) newBadge = '🎮 Gamer Pemula';
    if (newTotalStars >= 30) newBadge = '🌟 Bintang Kolektor';
    if (gameType === 'memory' && stars === 3) newBadge = '🧠 Memory Master';
    if (gameType === 'timer' && stars === 3) newBadge = '⚡ Speed Demon';
    if (gameType === 'bubble' && score >= 50) newBadge = '🧮 Math Wizard';
    if (gameType === 'wordmatch' && stars === 3) newBadge = '📖 Word Master';
    if (gameType === 'fillblanks' && stars === 3) newBadge = '✏️ Fill Master';
    if (gameType === 'aigame' && stars === 3) newBadge = '🤖 AI Master';
    if (newTotalGames === 10) newBadge = '🏆 Game Champion';
    if (newTotalStars >= 100) newBadge = '👑 LEGEND!';
    if (newBadge) playSound('levelUp');

    await supabase.from('player_stats').update({ total_stars: newTotalStars, total_puzzles_completed: newTotalGames, badges: newBadge ? [...(stats?.badges || []), newBadge] : stats?.badges }).eq('player_name', playerName);
    setLastReward({ stars, newBadge, gameType, score });
    setShowReward(true);
    setTimeout(() => { isCompletingRef.current = false; }, 500);
  }, [selectedGame, playerName, playSound]);

  const renderGame = () => {
    switch (selectedGame) {
      case 'puzzle': return <PuzzleGame key={gameKey} onComplete={handleGameComplete} />;
      case 'memory': return <MemoryMatch key={gameKey} playerName={playerName} onComplete={handleGameComplete} />;
      case 'timer': return <TimerChallenge key={gameKey} onComplete={handleGameComplete} />;
      case 'bubble': return <BubbleMath key={gameKey} playerName={playerName} onComplete={handleGameComplete} />;
      case 'wordmatch': return <WordMatch key={gameKey} playerName={playerName} onComplete={handleGameComplete} />;
      case 'fillblanks': return <FillBlanks key={gameKey} playerName={playerName} onComplete={handleGameComplete} />;
      case 'aigame': return <AIGameGenerator key={gameKey} playerName={playerName} onComplete={handleGameComplete} />;
      default: return null;
    }
  };

  if (!isLoggedIn) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-blue-300 to-purple-300 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl p-8 max-w-md text-center shadow-2xl">
          <div className="text-7xl mb-4 animate-bounce">🎮</div>
          <h1 className="text-3xl font-bold mb-2 text-orange-600">Kid Arcade!</h1>
          <p className="text-gray-600 mb-6">Petualangan Game Seru untuk Anak Hebat</p>
          <input type="text" placeholder="Nama kamu..." className="w-full p-3 border-2 rounded-xl mb-4 text-center text-lg" onKeyPress={(e) => { if (e.key === 'Enter') handleLogin(e.currentTarget.value); }} autoFocus />
          <button onClick={() => { const input = document.querySelector('input') as HTMLInputElement; if (input.value) handleLogin(input.value); }} className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-8 py-3 rounded-full font-bold text-lg w-full hover:scale-105 transition">🚀 Mulai Petualangan!</button>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-200 to-yellow-100">
      <div className="px-3 sm:px-4 md:px-6 lg:px-8 py-3 sm:py-4 md:py-6 max-w-7xl mx-auto">
        {/* HEADER - di atas */}
        <Header
          playerName={playerName}
          selectedAvatar={selectedAvatar}
          soundEnabled={soundEnabled}
          onToggleSound={handleToggleSound}
          onLogout={() => { setIsLoggedIn(false); }}
        />

        {/* GAME BUTTONS - di bawah header */}
        <GameSelector
          selectedGame={selectedGame}
          onSelectGame={(game) => {
            setSelectedGame(game);
            setGameKey(prev => prev + 1);
          }}
          playSound={playSound}
        />

        {/* MAIN CONTENT: GAME (KIRI) + SIDEBAR (KANAN) - SEJAJAR */}
        <div className="flex flex-col lg:flex-row gap-4 sm:gap-6 mt-4">
          {/* GAME AREA - LEBIH BESAR, DI KIRI/ATAS */}
          <div className="flex-1 lg:flex-[2] order-1 lg:order-none">
            <div className="bg-white/80 rounded-2xl sm:rounded-3xl p-3 sm:p-4 md:p-6 shadow-xl min-h-[400px] sm:min-h-[500px]">
              {renderGame()}
            </div>
          </div>

          {/* SIDEBAR - LEBIH KECIL, DI KANAN/BAWAH */}
          <div className="w-full lg:w-80 order-2 lg:order-none">
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

      {/* Reward Modal */}
      {showReward && lastReward && (
        <RewardDisplay
          playerName={playerName}
          starsEarned={lastReward.stars}
          newBadge={lastReward.newBadge}
          onClose={() => {
            setShowReward(false);
            setGameKey(prev => prev + 1);
          }}
        />
      )}
    </main>
  );
}