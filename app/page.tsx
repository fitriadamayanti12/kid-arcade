'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { supabase } from '@/lib/supabase';
import RewardDisplay from '@/app/components/RewardDisplay';
import Header from '@/app/components/layout/Header';
import GameSelector from '@/app/components/layout/GameSelector';
import Sidebar from '@/app/components/layout/Sidebar';
import { useSoundEffect } from '@/hooks/useSoundEffect';

// Dynamic imports untuk mencegah SSR issues
const PuzzleGame = dynamic(() => import('@/app/components/games/PuzzleGame'), { ssr: false });
const MemoryMatch = dynamic(() => import('@/app/components/MemoryMatch'), { ssr: false });
const TimerChallenge = dynamic(() => import('@/app/components/TimerChallenge'), { ssr: false });
const BubbleMath = dynamic(() => import('@/app/components/BubbleMath'), { ssr: false });
const WordMatch = dynamic(() => import('@/app/components/WordMatch'), { ssr: false });
const FillBlanks = dynamic(() => import('@/app/components/FillBlanks'), { ssr: false });
const AIGameGenerator = dynamic(() => import('@/app/components/AIGameGenerator'), { ssr: false });
const CountObjects = dynamic(() => import('@/app/components/games/CountObjects'), { ssr: false });

// Import langsung untuk komponen yang bermasalah dengan dynamic
import PizzaFraction from '@/app/components/games/PizzaFraction';
import DiceQuest from '@/app/components/games/DiceQuest';
import MathTower from '@/app/components/games/MathTower';

const MathAdventure = dynamic(() => import('@/app/components/games/MathAdventure'), { ssr: false });
const MathDetective = dynamic(() => import('@/app/components/games/MathDetective'), { ssr: false });
const NumberNinja = dynamic(() => import('@/app/components/games/NumberNinja'), { ssr: false });
const MathScrabble = dynamic(() => import('@/app/components/games/MathScrabble'), { ssr: false });
const MathCraft = dynamic(() => import('@/app/components/games/MathCraft'), { ssr: false });
const MathRacer = dynamic(() => import('@/app/components/games/MathRacer'), { ssr: false });

type GameType = 'puzzle' | 'memory' | 'timer' | 'bubble' | 'wordmatch' | 'fillblanks' | 'aigame' | 'countobjects' | 'pizzafraction' | 'mathadventure' | 'mathdetective' | 'numberninja' | 'mathscrabble' | 'mathcraft' | 'mathracer' | 'dicequest' | 'mathtower';

// Loading fallback component
const GameLoading = () => (
  <div className="flex items-center justify-center min-h-[400px]">
    <div className="text-center">
      <div className="text-6xl animate-bounce mb-4">🎮</div>
      <p className="text-gray-600 font-medium">Memuat game...</p>
      <div className="mt-4 flex justify-center gap-1">
        <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0s' }}></div>
        <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
        <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
      </div>
    </div>
  </div>
);

export default function Home() {
  const [mounted, setMounted] = useState(false);
  const [playerName, setPlayerName] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [selectedGame, setSelectedGame] = useState<GameType>('puzzle');
  const [selectedAvatar, setSelectedAvatar] = useState('👦');
  const [showSidebar, setShowSidebar] = useState<'progress' | 'leaderboard'>('progress');
  const [showReward, setShowReward] = useState(false);
  const [lastReward, setLastReward] = useState<any>(null);
  const [gameKey, setGameKey] = useState(0);
  const [inputName, setInputName] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const { playSound, toggleSound } = useSoundEffect();
  const [soundEnabled, setSoundEnabled] = useState(true);
  const isCompletingRef = useRef(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleToggleSound = () => {
    setSoundEnabled(toggleSound());
    playSound('click');
  };

  const handleLogin = async (name: string) => {
    if (!name.trim() || isLoading) return;
    
    setIsLoading(true);
    const trimmedName = name.trim();
    
    try {
      setPlayerName(trimmedName);
      setIsLoggedIn(true);
      playSound('win');

      const { data, error } = await supabase
        .from('player_stats')
        .select('*')
        .eq('player_name', trimmedName)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching player:', error);
      }

      if (!data) {
        await supabase.from('player_stats').insert([{
          player_name: trimmedName,
          total_stars: 0,
          total_puzzles_completed: 0,
          badges: [],
          stickers: [],
          avatar: '👦',
          streak: 0,
          owned_items: []
        }]);
        
        const stickers = ['🐶', '🐱', '🐭', '🐹', '🐰', '🦊', '🐻', '🐼', '🐨', '🐸'];
        const randomSticker = stickers[Math.floor(Math.random() * stickers.length)];
        await supabase.from('player_stats')
          .update({ stickers: [randomSticker] })
          .eq('player_name', trimmedName);
      } else if (data.avatar) {
        setSelectedAvatar(data.avatar);
      }
    } catch (error) {
      console.error('Login error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleStartClick = () => {
    const name = inputName.trim();
    if (name && !isLoading) {
      handleLogin(name);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const name = inputName.trim();
      if (name && !isLoading) {
        handleLogin(name);
      }
    }
  };

  const handleGameComplete = useCallback(async (stars: number, extra?: any) => {
    if (isCompletingRef.current) return;
    isCompletingRef.current = true;

    const gameType = selectedGame;
    const score = extra?.score || stars * 10;
    
    try {
      playSound('win');

      await supabase.from('game_scores').insert([{ 
        player_name: playerName, 
        game_type: gameType, 
        stars, 
        score, 
        completed_at: new Date().toISOString()
      }]);
      
      const { data: stats } = await supabase
        .from('player_stats')
        .select('*')
        .eq('player_name', playerName)
        .single();
      
      const newTotalStars = (stats?.total_stars || 0) + stars;
      const newTotalGames = (stats?.total_puzzles_completed || 0) + 1;

      let newBadge: string | null = null;
      if (newTotalGames === 5) newBadge = '🎮 Gamer Pemula';
      if (newTotalStars >= 30) newBadge = '🌟 Bintang Kolektor';
      if (gameType === 'memory' && stars === 3) newBadge = '🧠 Memory Master';
      if (gameType === 'timer' && stars === 3) newBadge = '⚡ Speed Demon';
      if (gameType === 'bubble' && score >= 50) newBadge = '🧮 Math Wizard';
      if (gameType === 'wordmatch' && stars === 3) newBadge = '📖 Word Master';
      if (gameType === 'fillblanks' && stars === 3) newBadge = '✏️ Fill Master';
      if (gameType === 'aigame' && stars === 3) newBadge = '🤖 AI Master';
      if (gameType === 'countobjects' && stars === 3) newBadge = '🔢 Counting Master';
      if (gameType === 'pizzafraction' && stars === 3) newBadge = '🍕 Fraction Expert';
      if (gameType === 'mathadventure' && extra?.score >= 200) newBadge = '🎮 Game Master';
      if (gameType === 'mathdetective' && extra?.solvedCases >= 4) newBadge = '🔍 Super Detective';
      if (gameType === 'numberninja' && extra?.bestStreak >= 20) newBadge = '🥷 Ninja Master';
      if (gameType === 'mathscrabble' && score >= 1000) newBadge = '🔤 Scrabble Champion';
      if (gameType === 'mathcraft' && extra?.builtItems >= 5) newBadge = '🏗️ Master Builder';
      if (gameType === 'mathracer' && extra?.position === 1) newBadge = '🏎️ Racing Champion';
      if (gameType === 'dicequest' && extra?.treasures >= 3) newBadge = '🎲 Dice Master';
      if (gameType === 'mathtower' && extra?.wave >= 5) newBadge = '🏰 Tower Defender';
      if (newTotalGames === 10) newBadge = '🏆 Game Champion';
      if (newTotalStars >= 100) newBadge = '👑 LEGEND!';
      if (newBadge) playSound('levelUp');

      const updatedBadges = newBadge 
        ? [...(stats?.badges || []), newBadge] 
        : (stats?.badges || []);

      await supabase.from('player_stats').update({ 
        total_stars: newTotalStars, 
        total_puzzles_completed: newTotalGames, 
        badges: updatedBadges 
      }).eq('player_name', playerName);
      
      setLastReward({ stars, newBadge, gameType, score });
      setShowReward(true);
    } catch (error) {
      console.error('Game complete error:', error);
    } finally {
      setTimeout(() => { 
        isCompletingRef.current = false; 
      }, 500);
    }
  }, [selectedGame, playerName, playSound]);

  const renderGame = () => {
    if (!mounted) {
      return <GameLoading />;
    }
    
    switch (selectedGame) {
      case 'puzzle': 
        return <PuzzleGame key={gameKey} onComplete={handleGameComplete} />;
      case 'memory': 
        return <MemoryMatch key={gameKey} playerName={playerName} onComplete={handleGameComplete} />;
      case 'timer': 
        return <TimerChallenge key={gameKey} onComplete={handleGameComplete} />;
      case 'bubble': 
        return <BubbleMath key={gameKey} playerName={playerName} onComplete={handleGameComplete} />;
      case 'wordmatch': 
        return <WordMatch key={gameKey} playerName={playerName} onComplete={handleGameComplete} />;
      case 'fillblanks': 
        return <FillBlanks key={gameKey} playerName={playerName} onComplete={handleGameComplete} />;
      case 'aigame': 
        return <AIGameGenerator key={gameKey} playerName={playerName} onComplete={handleGameComplete} />;
      case 'countobjects': 
        return <CountObjects key={gameKey} onComplete={handleGameComplete} />;
      case 'pizzafraction': 
        return <PizzaFraction key={gameKey} onComplete={handleGameComplete} />;
      case 'mathadventure': 
        return <MathAdventure key={gameKey} onComplete={handleGameComplete} />;
      case 'mathdetective': 
        return <MathDetective key={gameKey} onComplete={handleGameComplete} />;
      case 'numberninja': 
        return <NumberNinja key={gameKey} onComplete={handleGameComplete} />;
      case 'mathscrabble': 
        return <MathScrabble key={gameKey} onComplete={handleGameComplete} />;
      case 'mathcraft': 
        return <MathCraft key={gameKey} onComplete={handleGameComplete} />;
      case 'mathracer': 
        return <MathRacer key={gameKey} onComplete={handleGameComplete} />;
      case 'dicequest': 
        return <DiceQuest key={gameKey} onComplete={handleGameComplete} />;
      case 'mathtower': 
        return <MathTower key={gameKey} onComplete={handleGameComplete} />;
      default: 
        return <GameLoading />;
    }
  };

  if (!mounted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-300 to-purple-300 flex items-center justify-center">
        <div className="text-center">
          <div className="text-7xl animate-bounce mb-4">🎮</div>
          <p className="text-gray-600 text-lg">Memuat...</p>
        </div>
      </div>
    );
  }

  if (!isLoggedIn) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-blue-300 to-purple-300 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl p-8 max-w-md text-center shadow-2xl w-full">
          <div className="text-7xl mb-4 animate-bounce">🎮</div>
          <h1 className="text-3xl font-bold mb-2 text-orange-600">Kid Arcade!</h1>
          <p className="text-gray-600 mb-6">Petualangan Game Seru untuk Anak Hebat</p>
          
          <input 
            ref={inputRef}
            type="text" 
            placeholder="Nama kamu..." 
            value={inputName}
            onChange={(e) => setInputName(e.target.value)}
            onKeyDown={handleKeyDown}
            className="w-full p-4 border-2 rounded-xl mb-4 text-center text-lg focus:border-orange-400 focus:outline-none transition-colors" 
            autoFocus 
            maxLength={20}
            disabled={isLoading}
          />
          
          <button 
            onClick={handleStartClick}
            disabled={!inputName.trim() || isLoading}
            className={`bg-gradient-to-r from-orange-500 to-red-500 text-white px-8 py-3 rounded-full font-bold text-lg w-full transition-all duration-200 ${
              inputName.trim() && !isLoading
                ? 'hover:scale-105 cursor-pointer active:scale-95 shadow-lg' 
                : 'opacity-50 cursor-not-allowed'
            }`}
          >
            {isLoading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Memuat...
              </span>
            ) : (
              '🚀 Mulai Petualangan!'
            )}
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-200 to-yellow-100">
      <div className="px-3 sm:px-4 md:px-6 lg:px-8 py-3 sm:py-4 md:py-6 max-w-7xl mx-auto">
        <Header
          playerName={playerName}
          selectedAvatar={selectedAvatar}
          soundEnabled={soundEnabled}
          onToggleSound={handleToggleSound}
          onLogout={() => { 
            setIsLoggedIn(false);
            setInputName('');
          }}
        />

        <GameSelector
          selectedGame={selectedGame}
          onSelectGame={(game) => {
            setSelectedGame(game);
            setGameKey(prev => prev + 1);
          }}
          playSound={playSound}
        />

        <div className="flex flex-col lg:flex-row gap-4 sm:gap-6 mt-4">
          <div className="flex-1 lg:flex-[2] order-1 lg:order-none">
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl sm:rounded-3xl p-3 sm:p-4 md:p-6 shadow-xl min-h-[400px] sm:min-h-[500px]">
              {renderGame()}
            </div>
          </div>

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