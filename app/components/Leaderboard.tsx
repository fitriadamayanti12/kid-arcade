// app/components/Leaderboard.tsx
'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

interface LeaderboardEntry {
  player_name: string;
  stars: number;
  score: number;
}

interface LeaderboardProps {
  gameType: string;
  limit?: number;
}

const gameLabels: Record<string, string> = {
  puzzle: '🧩 Puzzle',
  memory: '🃏 Memory Match',
  timer: '⏱️ Timer Challenge',
  bubble: '🎈 Bubble Math',
  wordmatch: '📖 Word Match',
  fillblanks: '✏️ Fill Blanks',
  all: '🏆 Semua Game'
};

export default function Leaderboard({ gameType, limit = 10 }: LeaderboardProps) {
  const [rankings, setRankings] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedPeriod, setSelectedPeriod] = useState<'all' | 'week' | 'month'>('all');

  const fetchRankings = async () => {
    setLoading(true);
    setError(null);

    try {
      let query = supabase
        .from('game_scores')
        .select('player_name, stars, score, completed_at');

      if (gameType !== 'all') {
        query = query.eq('game_type', gameType);
      }

      if (selectedPeriod !== 'all') {
        const date = new Date();
        if (selectedPeriod === 'week') {
          date.setDate(date.getDate() - 7);
        } else if (selectedPeriod === 'month') {
          date.setMonth(date.getMonth() - 1);
        }
        query = query.gte('completed_at', date.toISOString());
      }

      const { data, error: fetchError } = await query;

      if (fetchError) {
        console.error('Supabase error:', fetchError);
        setError(fetchError.message);
        setRankings([]);
      } else if (!data || data.length === 0) {
        setRankings([]);
      } else {
        // Group by player name, ambil skor terbaik
        const bestPerPlayer = new Map<string, { stars: number; score: number }>();

        data.forEach((entry: LeaderboardEntry) => {
          const existing = bestPerPlayer.get(entry.player_name);
          if (!existing || entry.stars > existing.stars ||
            (entry.stars === existing.stars && entry.score > existing.score)) {
            bestPerPlayer.set(entry.player_name, {
              stars: entry.stars,
              score: entry.score
            });
          }
        });

        const sortedRankings = Array.from(bestPerPlayer.entries())
          .map(([player_name, stats]) => ({
            player_name,
            stars: stats.stars,
            score: stats.score
          }))
          .sort((a, b) => {
            if (a.stars !== b.stars) return b.stars - a.stars;
            return b.score - a.score;
          })
          .slice(0, limit);

        setRankings(sortedRankings);
      }
    } catch (err) {
      console.error('Error:', err);
      setError('Terjadi kesalahan');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRankings();
  }, [gameType, selectedPeriod]);

  const getMedalEmoji = (index: number) => {
    if (index === 0) return '🥇';
    if (index === 1) return '🥈';
    if (index === 2) return '🥉';
    return `${index + 1}.`;
  };

  const getStarsDisplay = (stars: number) => {
    if (stars === 3) return '⭐⭐⭐';
    if (stars === 2) return '⭐⭐';
    return '⭐';
  };

  if (loading) {
    return (
      <div className="bg-gradient-to-br from-yellow-50 to-orange-50 rounded-2xl p-5 shadow-xl">
        <div className="text-center py-8">
          <div className="animate-pulse text-4xl">🏆</div>
          <p className="text-gray-500 text-sm mt-2">Memuat leaderboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-gradient-to-br from-yellow-50 to-orange-50 rounded-2xl p-5 shadow-xl">
        <div className="text-center py-6">
          <div className="text-5xl mb-3">⚠️</div>
          <p className="text-red-500 text-sm font-medium mb-2">Error</p>
          <p className="text-xs text-gray-500 mb-4">{error}</p>
          <button
            onClick={fetchRankings}
            className="bg-orange-500 text-white px-5 py-2 rounded-full text-sm font-semibold hover:bg-orange-600 transition"
          >
            🔄 Coba Lagi
          </button>
        </div>
      </div>
    );
  }

  if (rankings.length === 0) {
    return (
      <div className="bg-gradient-to-br from-yellow-50 to-orange-50 rounded-2xl p-5 shadow-xl">
        <div className="text-center py-8">
          <div className="text-5xl mb-3">🎮</div>
          <p className="text-gray-500 text-sm font-medium">Belum ada data leaderboard</p>
          <p className="text-xs text-gray-400 mt-1">Selesaikan game dulu ya!</p>
          <button
            onClick={fetchRankings}
            className="mt-4 bg-gray-200 text-gray-600 px-4 py-1.5 rounded-full text-xs hover:bg-gray-300 transition"
          >
            🔄 Refresh
          </button>
        </div>
      </div>
    );
  }

  // app/components/Leaderboard.tsx - Responsive version

  return (
    <div className="bg-gradient-to-br from-yellow-50 to-orange-50 rounded-xl sm:rounded-2xl p-3 sm:p-4 md:p-5 shadow-xl">
      <div className="text-center mb-3 sm:mb-4">
        <h3 className="text-base sm:text-lg md:text-xl font-bold">{gameLabels[gameType]}</h3>
        <p className="text-[10px] sm:text-xs text-gray-500">Pemain dengan bintang terbanyak</p>
      </div>

      {/* Period Filter */}
      <div className="flex gap-1 sm:gap-2 mb-3 sm:mb-4 justify-center">
        <button
          onClick={() => setSelectedPeriod('all')}
          className={`px-2 sm:px-3 py-0.5 sm:py-1 rounded-full text-[10px] sm:text-xs font-bold transition ${selectedPeriod === 'all'
              ? 'bg-orange-500 text-white'
              : 'bg-gray-200 text-gray-600'
            }`}
        >
          📅 Semua
        </button>
        <button
          onClick={() => setSelectedPeriod('week')}
          className={`px-2 sm:px-3 py-0.5 sm:py-1 rounded-full text-[10px] sm:text-xs font-bold transition ${selectedPeriod === 'week'
              ? 'bg-orange-500 text-white'
              : 'bg-gray-200 text-gray-600'
            }`}
        >
          📆 7 Hari
        </button>
        <button
          onClick={() => setSelectedPeriod('month')}
          className={`px-2 sm:px-3 py-0.5 sm:py-1 rounded-full text-[10px] sm:text-xs font-bold transition ${selectedPeriod === 'month'
              ? 'bg-orange-500 text-white'
              : 'bg-gray-200 text-gray-600'
            }`}
        >
          📅 30 Hari
        </button>
      </div>

      {/* Loading */}
      {loading && (
        <div className="text-center py-6 sm:py-8">
          <div className="animate-pulse text-3xl sm:text-4xl">🏆</div>
          <p className="text-gray-500 text-[10px] sm:text-xs mt-2">Memuat...</p>
        </div>
      )}

      {/* Error */}
      {error && !loading && (
        <div className="text-center py-4 sm:py-6">
          <div className="text-4xl sm:text-5xl mb-2">⚠️</div>
          <p className="text-red-500 text-xs sm:text-sm font-medium mb-2">Error</p>
          <p className="text-[10px] sm:text-xs text-gray-500 mb-3 sm:mb-4">{error}</p>
          <button onClick={fetchRankings} className="bg-orange-500 text-white px-3 sm:px-4 py-1 sm:py-1.5 rounded-full text-[10px] sm:text-xs">
            🔄 Coba Lagi
          </button>
        </div>
      )}

      {/* Empty */}
      {!loading && !error && rankings.length === 0 && (
        <div className="text-center py-6 sm:py-8">
          <div className="text-4xl sm:text-5xl mb-2">🎮</div>
          <p className="text-gray-500 text-xs sm:text-sm">Belum ada data</p>
          <p className="text-[10px] sm:text-xs text-gray-400 mt-1">Selesaikan game dulu!</p>
        </div>
      )}

      {/* Rankings */}
      {!loading && !error && rankings.length > 0 && (
        <div className="space-y-1.5 sm:space-y-2 max-h-80 sm:max-h-96 overflow-y-auto">
          {rankings.map((rank, i) => (
            <div
              key={i}
              className={`flex items-center justify-between p-2 sm:p-3 rounded-lg sm:rounded-xl ${i === 0 ? 'bg-yellow-100 border border-yellow-400' :
                  i === 1 ? 'bg-gray-100 border border-gray-300' :
                    i === 2 ? 'bg-orange-50 border border-orange-200' :
                      'bg-white'
                }`}
            >
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="w-6 sm:w-8 text-center font-bold text-sm sm:text-base md:text-lg">
                  {getMedalEmoji(i)}
                </div>
                <div>
                  <div className="font-bold text-gray-800 text-sm sm:text-base break-words max-w-[120px] sm:max-w-[200px]">
                    {rank.player_name}
                  </div>
                  <div className="text-[10px] sm:text-xs text-gray-500">
                    {getStarsDisplay(rank.stars)} • {rank.score} poin
                  </div>
                </div>
              </div>
              <div className="text-xs sm:text-sm font-semibold text-gray-500">
                #{i + 1}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Refresh Button */}
      <button
        onClick={fetchRankings}
        className="w-full mt-3 sm:mt-4 bg-gray-200 hover:bg-gray-300 text-gray-700 py-1.5 sm:py-2 rounded-lg sm:rounded-xl text-[10px] sm:text-xs font-semibold transition flex items-center justify-center gap-1 sm:gap-2"
      >
        🔄 Refresh
      </button>

      <p className="text-center mt-2 sm:mt-3 text-[10px] sm:text-xs text-gray-400">
        Main lebih banyak untuk naik peringkat!
      </p>
    </div>
  );
}