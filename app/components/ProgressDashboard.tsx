// app/components/ProgressDashboard.tsx
'use client';

import { useEffect, useState } from 'react';
import { supabase, PlayerStats } from '@/lib/supabase';

interface Props {
  playerName: string;
  onAvatarChange?: (avatar: string) => void;
}

interface ShopItem {
  id: number;
  name: string;
  price: number;
  emoji: string;
  description: string;
  owned: boolean;
}

const avatars = [
  { id: '👦', name: 'Budi', emoji: '👦', color: 'bg-blue-100' },
  { id: '👧', name: 'Ani', emoji: '👧', color: 'bg-pink-100' },
  { id: '🐱', name: 'Kitty', emoji: '🐱', color: 'bg-orange-100' },
  { id: '🦸', name: 'Super Kid', emoji: '🦸', color: 'bg-purple-100' },
  { id: '🐶', name: 'Doggy', emoji: '🐶', color: 'bg-yellow-100' },
  { id: '🦄', name: 'Unicorn', emoji: '🦄', color: 'bg-indigo-100' },
];

const shopItems: ShopItem[] = [
  { id: 1, name: 'Stiker Bintang', price: 20, emoji: '⭐', description: 'Stiker spesial bintang', owned: false },
  { id: 2, name: 'Stiker Pelangi', price: 30, emoji: '🌈', description: 'Stiker warna-warni', owned: false },
  { id: 3, name: 'Tema Dinosaurus', price: 50, emoji: '🦖', description: 'Buka tema dinosaurus', owned: false },
  { id: 4, name: 'Tema Luar Angkasa', price: 50, emoji: '🚀', description: 'Buka tema luar angkasa', owned: false },
  { id: 5, name: 'Avatar Mahkota', price: 100, emoji: '👑', description: 'Avatar spesial dengan mahkota', owned: false },
  { id: 6, name: 'Sound Pack', price: 80, emoji: '🔊', description: 'Suara-suara lucu baru', owned: false },
];

export default function ProgressDashboard({ playerName, onAvatarChange }: Props) {
  const [stats, setStats] = useState<PlayerStats | null>(null);
  const [unlockedThemes, setUnlockedThemes] = useState<string[]>(['animals']);
  const [streak, setStreak] = useState(0);
  const [dailyRewardClaimed, setDailyRewardClaimed] = useState(false);
  const [dailyRewardAmount, setDailyRewardAmount] = useState(0);
  const [showShop, setShowShop] = useState(false);
  const [showAvatarSelector, setShowAvatarSelector] = useState(false);
  const [selectedAvatar, setSelectedAvatar] = useState('👦'); // Default laki-laki
  const [ownedItems, setOwnedItems] = useState<number[]>([]);
  const [message, setMessage] = useState('');
  const [nextRewardIn, setNextRewardIn] = useState('');

  useEffect(() => {
    loadStats();
    checkDailyStreak();
    loadOwnedItems();
  }, [playerName]);

  const loadStats = async () => {
    const { data: statsData } = await supabase
      .from('player_stats')
      .select('*')
      .eq('player_name', playerName)
      .single();

    if (statsData) {
      setStats(statsData);
      // Jika avatar kosong atau null, set default ke 👦
      const avatar = statsData.avatar || '👦';
      setSelectedAvatar(avatar);
      if (onAvatarChange) onAvatarChange(avatar);
    } else {
      // Jika belum ada data, set default avatar
      setSelectedAvatar('👦');
    }

    const { data: themesData } = await supabase
      .from('unlocked_themes')
      .select('theme_name')
      .eq('player_name', playerName);

    if (themesData) setUnlockedThemes(themesData.map(t => t.theme_name));
  };

  const loadOwnedItems = async () => {
    const { data } = await supabase
      .from('player_stats')
      .select('owned_items')
      .eq('player_name', playerName)
      .single();

    if (data?.owned_items) setOwnedItems(data.owned_items);
  };

  const checkDailyStreak = async () => {
    const { data } = await supabase
      .from('player_stats')
      .select('last_played, streak, total_stars')
      .eq('player_name', playerName)
      .single();

    const today = new Date().toDateString();
    const lastPlayed = data?.last_played ? new Date(data.last_played).toDateString() : null;

    let newStreak = data?.streak || 0;
    let canClaim = false;

    if (lastPlayed !== today) {
      canClaim = true;
      if (lastPlayed === new Date(Date.now() - 86400000).toDateString()) {
        newStreak += 1;
      } else if (lastPlayed !== today) {
        newStreak = 1;
      }

      const rewardBonus = Math.min(10, Math.floor(newStreak / 5)) * 5;
      const baseReward = 5;
      setDailyRewardAmount(baseReward + rewardBonus);
    }

    setStreak(newStreak);
    setDailyRewardClaimed(!canClaim);

    await supabase
      .from('player_stats')
      .update({ streak: newStreak })
      .eq('player_name', playerName);

    updateNextRewardTime();
  };

  const updateNextRewardTime = () => {
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);
    const hoursLeft = Math.ceil((tomorrow.getTime() - now.getTime()) / (1000 * 60 * 60));
    setNextRewardIn(`${hoursLeft} jam lagi`);
  };

  const claimDailyReward = async () => {
    if (dailyRewardClaimed) {
      setMessage('✨ Kamu sudah klaim reward hari ini!');
      setTimeout(() => setMessage(''), 2000);
      return;
    }

    const newTotalStars = (stats?.total_stars || 0) + dailyRewardAmount;

    await supabase
      .from('player_stats')
      .update({
        total_stars: newTotalStars,
        last_played: new Date(),
        streak: streak
      })
      .eq('player_name', playerName);

    setStats(prev => prev ? { ...prev, total_stars: newTotalStars } : null);
    setDailyRewardClaimed(true);
    setMessage(`🎉 Selamat! Kamu dapat ${dailyRewardAmount} bintang dari daily reward!`);

    if (streak >= 7 && streak % 7 === 0) {
      const bonusSticker = ['🏆', '🎖️', '🏅'][Math.floor(Math.random() * 3)];
      const newStickers = [...(stats?.stickers || []), bonusSticker];
      await supabase
        .from('player_stats')
        .update({ stickers: newStickers })
        .eq('player_name', playerName);
      setMessage(`🎉 +${dailyRewardAmount} bintang dan stiker ${bonusSticker}!`);
    }

    setTimeout(() => setMessage(''), 3000);
  };

  const changeAvatar = async (avatarEmoji: string) => {
    await supabase
      .from('player_stats')
      .update({ avatar: avatarEmoji })
      .eq('player_name', playerName);

    setSelectedAvatar(avatarEmoji);
    if (onAvatarChange) onAvatarChange(avatarEmoji);
    setShowAvatarSelector(false);
    setMessage(`🎨 Avatar berubah jadi ${avatarEmoji}!`);
    setTimeout(() => setMessage(''), 2000);
  };

  const buyItem = async (item: ShopItem) => {
    if (ownedItems.includes(item.id)) {
      setMessage(`Kamu sudah punya ${item.name}!`);
      setTimeout(() => setMessage(''), 2000);
      return;
    }

    if ((stats?.total_stars || 0) >= item.price) {
      const newTotalStars = (stats?.total_stars || 0) - item.price;
      const newOwnedItems = [...ownedItems, item.id];

      await supabase
        .from('player_stats')
        .update({
          total_stars: newTotalStars,
          owned_items: newOwnedItems
        })
        .eq('player_name', playerName);

      setStats(prev => prev ? { ...prev, total_stars: newTotalStars } : null);
      setOwnedItems(newOwnedItems);

      if (item.name.includes('Tema')) {
        const themeName = item.name.includes('Dinosaurus') ? 'dinosaurs' : 'space';
        await supabase
          .from('unlocked_themes')
          .insert([{
            player_name: playerName,
            theme_name: themeName,
            stars_required: item.price
          }]);
        setUnlockedThemes(prev => [...prev, themeName]);
      }

      setMessage(`🎁 Berhasil membeli ${item.name}!`);
    } else {
      setMessage(`💔 Bintang kurang! Butuh ${item.price} bintang.`);
    }

    setTimeout(() => setMessage(''), 3000);
  };

  const currentLevel = Math.floor((stats?.total_stars || 0) / 50) + 1;
  const nextLevelStars = currentLevel * 50;
  const starsToNextLevel = nextLevelStars - (stats?.total_stars || 0);
  const progressPercent = Math.min(100, ((stats?.total_stars || 0) / nextLevelStars) * 100);

  // app/components/ProgressDashboard.tsx - Responsive version

  return (
    <div className="bg-white/90 rounded-xl sm:rounded-2xl p-3 sm:p-4 md:p-6 shadow-lg">
      {/* Header dengan Avatar */}
      <div className="text-center mb-3 sm:mb-4">
        <div className="flex justify-center mb-1 sm:mb-2">
          <button
            onClick={() => setShowAvatarSelector(!showAvatarSelector)}
            className="text-4xl sm:text-5xl md:text-6xl hover:scale-110 transition transform"
          >
            {selectedAvatar}
          </button>
        </div>
        <h2 className="text-xl sm:text-2xl font-bold text-orange-600 break-words">{playerName}</h2>
        <p className="text-xs sm:text-sm text-gray-500">Level {currentLevel}</p>
      </div>

      {/* Daily Streak Card */}
      <div className={`rounded-lg sm:rounded-xl p-2 sm:p-3 md:p-4 mb-3 sm:mb-4 text-center ${dailyRewardClaimed ? 'bg-gray-100' : 'bg-gradient-to-r from-yellow-400 to-orange-400'}`}>
        <div className="flex flex-col sm:flex-row items-center justify-between gap-2">
          <div>
            <div className="text-xs sm:text-sm font-bold">🔥 Streak: {streak} hari</div>
            <div className="text-[10px] sm:text-xs text-gray-600">{nextRewardIn}</div>
          </div>
          <button
            onClick={claimDailyReward}
            disabled={dailyRewardClaimed}
            className={`px-2 sm:px-3 md:px-4 py-1 sm:py-1.5 rounded-full text-[10px] sm:text-xs font-bold transition ${dailyRewardClaimed
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-white text-orange-600 hover:scale-105'
              }`}
          >
            {dailyRewardClaimed ? '✅ Sudah Klaim' : `🎁 Klaim ${dailyRewardAmount} ⭐`}
          </button>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-3 sm:mb-4">
        <div className="flex justify-between text-[10px] sm:text-xs text-gray-600 mb-1">
          <span>Progress ke Level {currentLevel + 1}</span>
          <span>{stats?.total_stars || 0} / {nextLevelStars} ⭐</span>
        </div>
        <div className="bg-gray-200 rounded-full h-1.5 sm:h-2 overflow-hidden">
          <div
            className="bg-gradient-to-r from-yellow-400 to-orange-500 h-full transition-all duration-500"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-2 sm:gap-3 md:gap-4 mb-4 sm:mb-6">
        <div className="text-center bg-yellow-100 rounded-lg sm:rounded-xl p-2 sm:p-3">
          <div className="text-2xl sm:text-3xl">⭐</div>
          <div className="text-xl sm:text-2xl font-bold">{stats?.total_stars || 0}</div>
          <div className="text-[10px] sm:text-xs">Total Bintang</div>
        </div>
        <div className="text-center bg-green-100 rounded-lg sm:rounded-xl p-2 sm:p-3">
          <div className="text-2xl sm:text-3xl">🎮</div>
          <div className="text-xl sm:text-2xl font-bold">{stats?.total_puzzles_completed || 0}</div>
          <div className="text-[10px] sm:text-xs">Game Selesai</div>
        </div>
      </div>

      {/* Badges */}
      <div className="mb-3 sm:mb-4">
        <p className="font-bold text-sm sm:text-base mb-1 sm:mb-2">🏅 Lencana:</p>
        <div className="flex flex-wrap gap-1 sm:gap-2">
          {(stats?.badges || []).map((badge, i) => (
            <span key={i} className="bg-purple-200 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full text-[10px] sm:text-xs flex items-center gap-0.5 sm:gap-1">
              <span>🏅</span> {badge}
            </span>
          ))}
          {(stats?.badges || []).length === 0 && (
            <span className="text-gray-500 text-[10px] sm:text-xs">Belum ada lencana. Ayo main!</span>
          )}
        </div>
      </div>

      {/* Stickers */}
      <div className="mb-3 sm:mb-4">
        <p className="font-bold text-sm sm:text-base mb-1 sm:mb-2">📌 Stiker Koleksi ({stats?.stickers?.length || 0}/20):</p>
        <div className="flex flex-wrap gap-1 sm:gap-2 max-h-20 sm:max-h-24 overflow-y-auto">
          {(stats?.stickers || []).map((sticker, i) => (
            <span key={i} className="text-xl sm:text-2xl hover:scale-125 transition cursor-pointer" title={`Stiker ${i + 1}`}>
              {sticker}
            </span>
          ))}
          {(stats?.stickers || []).length === 0 && (
            <span className="text-gray-500 text-[10px] sm:text-xs">Main setiap hari dapat stiker!</span>
          )}
        </div>
      </div>

      {/* Unlocked Themes */}
      <div className="mb-3 sm:mb-4 pt-3 sm:pt-4 border-t">
        <p className="font-bold text-sm sm:text-base mb-1 sm:mb-2">🔓 Tema Terbuka:</p>
        <div className="flex flex-wrap gap-1 sm:gap-2">
          {unlockedThemes.map(theme => (
            <span key={theme} className="bg-blue-200 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full text-[10px] sm:text-xs capitalize">
              {theme === 'animals' ? '🐘 Hewan' : theme === 'dinosaurs' ? '🦖 Dinosaurus' : '🚀 Luar Angkasa'} ✓
            </span>
          ))}
        </div>
      </div>

      {/* Shop Button */}
      <button
        onClick={() => setShowShop(!showShop)}
        className="w-full bg-gradient-to-r from-green-400 to-teal-400 text-white py-1.5 sm:py-2 rounded-full font-bold text-sm sm:text-base mb-2 hover:scale-105 transition"
      >
        🛒 Toko Bintang ({stats?.total_stars || 0} ⭐)
      </button>

      {/* Message Toast */}
      {message && (
        <div className="fixed bottom-20 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white px-2 sm:px-3 py-1 sm:py-2 rounded-full text-[10px] sm:text-xs z-50 animate-bounce whitespace-nowrap">
          {message}
        </div>
      )}
    </div>
  );
}