// app/page.tsx
'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import RewardDisplay from '@/app/components/RewardDisplay';
import ProgressDashboard from '@/app/components/ProgressDashboard';
import Leaderboard from '@/app/components/Leaderboard';
import MemoryMatch from '@/app/components/MemoryMatch';
import TimerChallenge from '@/app/components/TimerChallenge';
import BubbleMath from '@/app/components/BubbleMath';
import WordMatch from '@/app/components/WordMatch';
import FillBlanks from '@/app/components/FillBlanks';
import { useSoundEffect } from '@/hooks/useSoundEffect';

type GameType = 'puzzle' | 'memory' | 'timer' | 'bubble' | 'wordmatch' | 'fillblanks';

interface PuzzlePiece {
  id: string;
  name: string;
  image: string;
  correctSlotId: string;
}

interface Slot {
  id: string;
  label: string;
  imageSilhouette: string;
}

const pieces: PuzzlePiece[] = [
  { id: 'p1', name: 'Kucing', image: '🐱', correctSlotId: 'slot1' },
  { id: 'p2', name: 'Anjing', image: '🐶', correctSlotId: 'slot2' },
  { id: 'p3', name: 'Monyet', image: '🐵', correctSlotId: 'slot3' },
  { id: 'p4', name: 'Kelinci', image: '🐰', correctSlotId: 'slot4' },
  { id: 'p5', name: 'Burung', image: '🐦', correctSlotId: 'slot5' },
  { id: 'p6', name: 'Ikan', image: '🐠', correctSlotId: 'slot6' },
];

const slots: Slot[] = [
  { id: 'slot1', label: 'Tempat Kucing', imageSilhouette: '🐱‍👤' },
  { id: 'slot2', label: 'Tempat Anjing', imageSilhouette: '🐕‍🦺' },
  { id: 'slot3', label: 'Tempat Monyet', imageSilhouette: '🐒' },
  { id: 'slot4', label: 'Tempat Kelinci', imageSilhouette: '🐇' },
  { id: 'slot5', label: 'Tempat Burung', imageSilhouette: '🕊️' },
  { id: 'slot6', label: 'Tempat Ikan', imageSilhouette: '🐟' },
];

export default function Home() {
  // ========== USER STATE ==========
  const [playerName, setPlayerName] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [selectedGame, setSelectedGame] = useState<GameType>('puzzle');
  const [selectedAvatar, setSelectedAvatar] = useState('👦');
  const [showSidebar, setShowSidebar] = useState<'progress' | 'leaderboard'>('progress');

  // ========== SOUND EFFECTS ==========
  const { playSound, toggleSound, isSoundEnabled } = useSoundEffect();
  const [soundEnabled, setSoundEnabled] = useState(true);

  // ========== PUZZLE GAME STATES ==========
  const [matched, setMatched] = useState<Record<string, string>>({});
  const [startTime, setStartTime] = useState<number | null>(null);
  const [feedback, setFeedback] = useState('');

  // ========== COMMON STATES ==========
  const [showReward, setShowReward] = useState(false);
  const [lastReward, setLastReward] = useState<any>(null);
  const [gameKey, setGameKey] = useState(0);

  // ========== REFS UNTUK MENCEGAH DOUBLE EXECUTION ==========
  const puzzleCompletedRef = useRef(false);
  const isCompletingRef = useRef(false);

  // ========== HANDLER: TOGGLE SOUND ==========
  const handleToggleSound = () => {
    const enabled = toggleSound();
    setSoundEnabled(enabled);
    playSound('click');
  };

  // ========== HANDLER: LOGIN ==========
  const handleLogin = async (name: string) => {
    if (!name.trim()) return;

    setPlayerName(name);
    setIsLoggedIn(true);
    playSound('win');

    const { data } = await supabase
      .from('player_stats')
      .select('*')
      .eq('player_name', name)
      .single();

    if (!data) {
      await supabase.from('player_stats').insert([{
        player_name: name,
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
      await supabase
        .from('player_stats')
        .update({ stickers: [randomSticker] })
        .eq('player_name', name);
    } else if (data.avatar) {
      setSelectedAvatar(data.avatar);
    }

    setStartTime(Date.now());
  };

  // ========== HANDLER: DRAG & DROP UNTUK PUZZLE ==========
  const handleDragStart = (e: React.DragEvent, piece: PuzzlePiece) => {
    e.dataTransfer.setData('text/plain', JSON.stringify(piece));
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent, slot: Slot) => {
    e.preventDefault();
    if (matched[slot.id]) return;

    const rawData = e.dataTransfer.getData('text/plain');
    if (!rawData) return;

    const piece: PuzzlePiece = JSON.parse(rawData);

    if (piece.correctSlotId === slot.id) {
      setMatched((prev) => ({ ...prev, [slot.id]: piece.id }));
      setFeedback(`✅ Mantap! ${piece.name} masuk ke tempat yang benar!`);
      playSound('correct');
    } else {
      setFeedback(`❌ Coba lagi... ${piece.name} bukan untuk sini.`);
      playSound('wrong');
    }

    setTimeout(() => setFeedback(''), 1500);
  };

  // ========== HANDLER: GAME COMPLETE (UMUM UNTUK SEMUA GAME) ==========
  const handleGameComplete = useCallback(async (stars: number, extra?: any) => {
    // Mencegah double execution
    if (isCompletingRef.current) return;
    isCompletingRef.current = true;

    const gameType = selectedGame;
    const score = extra || (stars * 10);

    playSound('win');

    try {
      await supabase.from('game_scores').insert([{
        player_name: playerName,
        game_type: gameType,
        stars: stars,
        score: score,
        completed_at: new Date()
      }]);

      const { data: stats } = await supabase
        .from('player_stats')
        .select('*')
        .eq('player_name', playerName)
        .single();

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
      if (newTotalGames === 10) newBadge = '🏆 Game Champion';
      if (newTotalStars >= 100) newBadge = '👑 LEGEND!';

      if (newBadge) playSound('levelUp');

      await supabase
        .from('player_stats')
        .update({
          total_stars: newTotalStars,
          total_puzzles_completed: newTotalGames,
          badges: newBadge ? [...(stats?.badges || []), newBadge] : stats?.badges
        })
        .eq('player_name', playerName);

      setLastReward({ stars, newBadge, gameType, score });
      setShowReward(true);
    } catch (error) {
      console.error('Error saving game completion:', error);
    } finally {
      setTimeout(() => {
        isCompletingRef.current = false;
      }, 500);
    }
  }, [selectedGame, playerName, playSound]);

  // ========== HANDLER: REWARD MODAL CLOSE ==========
  const handleRewardClose = () => {
    setShowReward(false);
    setGameKey(prev => prev + 1);
    if (selectedGame === 'puzzle') {
      setMatched({});
      setStartTime(Date.now());
      puzzleCompletedRef.current = false;
    }
  };

  // ========== HELPER: CEK APAKAH SLOT SUDAH TERISI ==========
  const isSlotFilled = (slotId: string) => !!matched[slotId];

  // ========== RENDER GAME BERDASARKAN PILIHAN ==========
  const renderGame = () => {
    switch (selectedGame) {
      case 'memory':
        return (
          <MemoryMatch
            key={gameKey}
            playerName={playerName}
            onComplete={handleGameComplete}
          />
        );
      case 'timer':
        return (
          <TimerChallenge
            key={gameKey}
            onComplete={handleGameComplete}
          />
        );
      case 'bubble':
        return (
          <BubbleMath
            key={gameKey}
            playerName={playerName}
            onComplete={handleGameComplete}
          />
        );
      case 'wordmatch':
        return (
          <WordMatch
            key={gameKey}
            playerName={playerName}
            onComplete={handleGameComplete}
          />
        );
      case 'fillblanks':
        return (
          <FillBlanks
            key={gameKey}
            playerName={playerName}
            onComplete={handleGameComplete}
          />
        );
      default:
        return (
          <div>
            <h2 className="text-2xl font-bold text-center mb-4">✨ Seret Potongan ke Bayangan ✨</h2>

            <div className="flex flex-wrap gap-8 justify-center">
              {/* Kolom potongan */}
              <div className="flex-1 min-w-[200px]">
                <div className="grid grid-cols-2 gap-4">
                  {pieces.map((piece) => {
                    const alreadyUsed = Object.values(matched).includes(piece.id);
                    if (alreadyUsed) return null;
                    return (
                      <div
                        key={piece.id}
                        draggable
                        onDragStart={(e) => handleDragStart(e, piece)}
                        onMouseEnter={() => playSound('click')}
                        className="bg-yellow-200 p-4 rounded-2xl flex flex-col items-center gap-2 cursor-grab active:cursor-grabbing hover:bg-yellow-300 transition shadow-md hover:scale-105"
                      >
                        <span className="text-5xl">{piece.image}</span>
                        <span className="text-lg font-bold text-brown-700">{piece.name}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Kolom slot */}
              <div className="flex-1 min-w-[200px]">
                <div className="grid grid-cols-2 gap-4">
                  {slots.map((slot) => (
                    <div
                      key={slot.id}
                      onDragOver={handleDragOver}
                      onDrop={(e) => handleDrop(e, slot)}
                      className={`p-4 rounded-2xl border-4 text-center transition min-h-[120px] flex flex-col items-center justify-center ${isSlotFilled(slot.id)
                        ? 'bg-green-200 border-green-600'
                        : 'bg-blue-50 border-blue-400 border-dashed hover:bg-blue-100'
                        }`}
                    >
                      <div className="text-5xl opacity-60">{slot.imageSilhouette}</div>
                      <div className="text-sm font-semibold mt-2">{slot.label}</div>
                      {isSlotFilled(slot.id) && (
                        <div className="text-2xl mt-1">✔️</div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="text-center mt-6 text-sm text-gray-500">
              💡 Seret gambar hewan ke tempat bayangannya!
            </div>
          </div>
        );
    }
  };

  // ========== EFFECT: CEK PUZZLE COMPLETION (POWERFULL VERSION) ==========
  useEffect(() => {
    // Reset ketika game berganti
    if (selectedGame !== 'puzzle') {
      puzzleCompletedRef.current = false;
      return;
    }

    // Cek kondisi selesai
    const allSlotsFilled = Object.keys(matched).length === slots.length;
    
    if (allSlotsFilled && !puzzleCompletedRef.current && !showReward && isLoggedIn && startTime) {
      puzzleCompletedRef.current = true;
      const timeSpent = (Date.now() - startTime) / 1000;
      let stars = 1;
      if (timeSpent < 20) stars = 3;
      else if (timeSpent < 40) stars = 2;
      handleGameComplete(stars, timeSpent);
    }
  }, [matched, selectedGame, showReward, isLoggedIn, startTime, handleGameComplete]);

  // ========== EFFECT: RESET PUZZLE COMPLETION REF WHEN GAME CHANGES ==========
  useEffect(() => {
    puzzleCompletedRef.current = false;
  }, [selectedGame, gameKey]);

  // ========== LOGIN SCREEN ==========
  if (!isLoggedIn) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-blue-300 to-purple-300 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl p-8 max-w-md text-center shadow-2xl animate-in zoom-in">
          <div className="text-7xl mb-4 animate-bounce">🎮</div>
          <h1 className="text-3xl font-bold mb-2 text-orange-600">Kid Arcade!</h1>
          <p className="text-gray-600 mb-6">Petualangan Game Seru untuk Anak Hebat</p>
          <p className="mb-4 text-sm text-gray-500">Masukkan namamu untuk mulai bermain!</p>
          <input
            type="text"
            placeholder="Nama kamu..."
            className="w-full p-3 border-2 rounded-xl mb-4 text-center text-lg focus:outline-none focus:border-orange-400"
            onKeyPress={(e) => {
              if (e.key === 'Enter' && e.currentTarget.value) {
                handleLogin(e.currentTarget.value);
              }
            }}
            autoFocus
          />
          <button
            onClick={(e) => {
              const input = document.querySelector('input') as HTMLInputElement;
              if (input.value) handleLogin(input.value);
            }}
            className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-8 py-3 rounded-full font-bold text-lg w-full hover:scale-105 transition"
          >
            🚀 Mulai Petualangan!
          </button>
        </div>
      </main>
    );
  }

  // ========== MAIN GAME SCREEN ==========
  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-200 to-yellow-100 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6 flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <span className="text-5xl">{selectedAvatar}</span>
            <h1 className="text-3xl md:text-4xl font-bold text-orange-600">
              🎮 {playerName}&apos;s Arcade
            </h1>
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleToggleSound}
              className="bg-gray-500 text-white px-3 py-2 rounded-full text-sm hover:bg-gray-600 transition"
              title={soundEnabled ? 'Matikan Suara' : 'Hidupkan Suara'}
            >
              {soundEnabled ? '🔊' : '🔇'}
            </button>
            <button
              onClick={() => {
                setIsLoggedIn(false);
                setMatched({});
                puzzleCompletedRef.current = false;
              }}
              className="bg-gray-500 text-white px-4 py-2 rounded-full text-sm hover:bg-gray-600 transition"
            >
              Ganti Pemain
            </button>
          </div>
        </div>

        {/* Game Selection Buttons */}
        <div className="flex gap-3 mb-6 flex-wrap justify-center">
          <button
            onClick={() => {
              setSelectedGame('puzzle');
              setMatched({});
              setStartTime(Date.now());
              puzzleCompletedRef.current = false;
              playSound('click');
            }}
            className={`px-6 py-3 rounded-full font-bold transition transform hover:scale-105 ${selectedGame === 'puzzle'
              ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-lg'
              : 'bg-white text-gray-700 hover:bg-orange-100'
              }`}
          >
            🧩 Puzzle Hewan
          </button>
          <button
            onClick={() => {
              setSelectedGame('memory');
              setGameKey(prev => prev + 1);
              playSound('click');
            }}
            className={`px-6 py-3 rounded-full font-bold transition transform hover:scale-105 ${selectedGame === 'memory'
              ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg'
              : 'bg-white text-gray-700 hover:bg-purple-100'
              }`}
          >
            🃏 Memory Match
          </button>
          <button
            onClick={() => {
              setSelectedGame('timer');
              setGameKey(prev => prev + 1);
              playSound('click');
            }}
            className={`px-6 py-3 rounded-full font-bold transition transform hover:scale-105 ${selectedGame === 'timer'
              ? 'bg-gradient-to-r from-red-500 to-orange-500 text-white shadow-lg'
              : 'bg-white text-gray-700 hover:bg-red-100'
              }`}
          >
            ⏱️ Timer Challenge
          </button>
          <button
            onClick={() => {
              setSelectedGame('bubble');
              setGameKey(prev => prev + 1);
              playSound('click');
            }}
            className={`px-6 py-3 rounded-full font-bold transition transform hover:scale-105 ${selectedGame === 'bubble'
              ? 'bg-gradient-to-r from-green-500 to-teal-500 text-white shadow-lg'
              : 'bg-white text-gray-700 hover:bg-green-100'
              }`}
          >
            🎈 Bubble Math
          </button>
          <button
            onClick={() => {
              setSelectedGame('wordmatch');
              setGameKey(prev => prev + 1);
              playSound('click');
            }}
            className={`px-6 py-3 rounded-full font-bold transition transform hover:scale-105 ${selectedGame === 'wordmatch'
              ? 'bg-gradient-to-r from-teal-500 to-cyan-500 text-white shadow-lg'
              : 'bg-white text-gray-700 hover:bg-teal-100'
              }`}
          >
            📖 Word Match
          </button>
          <button
            onClick={() => {
              setSelectedGame('fillblanks');
              setGameKey(prev => prev + 1);
              playSound('click');
            }}
            className={`px-6 py-3 rounded-full font-bold transition transform hover:scale-105 ${selectedGame === 'fillblanks'
                ? 'bg-gradient-to-r from-teal-500 to-cyan-500 text-white shadow-lg'
                : 'bg-white text-gray-700 hover:bg-teal-100'
              }`}
          >
            ✏️ Fill Blanks
          </button>
        </div>

        {/* Sidebar Toggle */}
        <div className="flex gap-2 mb-4 justify-end">
          <button
            onClick={() => setShowSidebar('progress')}
            className={`px-4 py-2 rounded-full text-sm font-bold transition ${showSidebar === 'progress'
              ? 'bg-orange-500 text-white'
              : 'bg-gray-200 text-gray-600'
              }`}
          >
            📊 Progress Saya
          </button>
          <button
            onClick={() => setShowSidebar('leaderboard')}
            className={`px-4 py-2 rounded-full text-sm font-bold transition ${showSidebar === 'leaderboard'
              ? 'bg-orange-500 text-white'
              : 'bg-gray-200 text-gray-600'
              }`}
          >
            🏆 Leaderboard
          </button>
        </div>

        {/* Main Game Area */}
        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <div className="bg-white/80 rounded-3xl p-6 shadow-xl min-h-[500px] transition-all">
              {renderGame()}
            </div>
          </div>

          <div>
            {showSidebar === 'progress' ? (
              <ProgressDashboard
                playerName={playerName}
                onAvatarChange={setSelectedAvatar}
              />
            ) : (
              <Leaderboard gameType={selectedGame} limit={5} />
            )}
          </div>
        </div>

        {/* Feedback untuk puzzle game */}
        {feedback && selectedGame === 'puzzle' && (
          <div className="fixed bottom-8 left-1/2 transform -translate-x-1/2 bg-yellow-300 text-2xl px-8 py-4 rounded-full shadow-lg animate-bounce z-50">
            {feedback}
          </div>
        )}
      </div>

      {/* Reward Modal */}
      {showReward && lastReward && (
        <RewardDisplay
          playerName={playerName}
          starsEarned={lastReward.stars}
          newBadge={lastReward.newBadge}
          onClose={handleRewardClose}
        />
      )}
    </main>
  );
}