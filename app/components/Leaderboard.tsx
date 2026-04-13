'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

interface LeaderboardProps {
  gameType: string;
  limit?: number;
}

export default function Leaderboard({ gameType, limit = 10 }: LeaderboardProps) {
  const [rankings, setRankings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRankings = async () => {
    setLoading(true);
    setError(null);
    
    // Log step by step
    console.log('=== STEP 1: Start fetch ===');
    console.log('Game type:', gameType);
    console.log('Supabase client:', supabase ? 'exists' : 'null');
    
    try {
      console.log('=== STEP 2: Querying game_scores ===');
      const { data, error: fetchError } = await supabase
        .from('game_scores')
        .select('player_name, stars, score');
      
      console.log('=== STEP 3: Query result ===');
      console.log('Data:', data);
      console.log('Error:', fetchError);
      console.log('Error type:', typeof fetchError);
      console.log('Error keys:', fetchError ? Object.keys(fetchError) : 'null');
      
      if (fetchError) {
        console.error('=== STEP 4: Error detected ===');
        console.error('Error message:', fetchError.message);
        console.error('Error code:', fetchError.code);
        console.error('Error details:', fetchError.details);
        setError(`Supabase error: ${fetchError.message || 'Unknown'}`);
        setRankings([]);
        setLoading(false);
        return;
      }
      
      console.log('=== STEP 5: Processing data ===');
      if (!data || data.length === 0) {
        console.log('No data found');
        setRankings([]);
      } else {
        console.log(`Found ${data.length} records`);
        // Group by player name
        const playerMap = new Map();
        for (const entry of data) {
          const existing = playerMap.get(entry.player_name);
          if (!existing || entry.stars > existing.stars) {
            playerMap.set(entry.player_name, entry);
          }
        }
        const sorted = Array.from(playerMap.values())
          .sort((a, b) => b.stars - a.stars)
          .slice(0, limit);
        console.log('Processed rankings:', sorted);
        setRankings(sorted);
      }
      
    } catch (err: any) {
      console.error('=== STEP ERROR ===');
      console.error('Caught error:', err);
      setError(err.message || 'Terjadi kesalahan');
      setRankings([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRankings();
  }, [gameType]);

  if (loading) {
    return (
      <div className="bg-white rounded-2xl p-5 shadow-xl">
        <div className="text-center py-8">
          <div className="animate-pulse text-4xl">🏆</div>
          <p className="text-gray-500 text-sm mt-2">Memuat...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-2xl p-5 shadow-xl">
        <div className="text-center py-6">
          <div className="text-5xl mb-3">⚠️</div>
          <p className="text-red-500 text-sm font-medium">Error</p>
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
      <div className="bg-white rounded-2xl p-5 shadow-xl">
        <div className="text-center py-8">
          <div className="text-5xl mb-3">🎮</div>
          <p className="text-gray-500 text-sm font-medium">Belum ada data</p>
          <p className="text-xs text-gray-400 mt-1">Selesaikan game dulu ya!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl p-5 shadow-xl">
      <h3 className="text-xl font-bold text-center mb-4">🏆 Leaderboard</h3>
      <div className="space-y-2">
        {rankings.map((rank, i) => (
          <div key={i} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
            <div className="flex items-center gap-3">
              <span className="text-xl">{i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `${i+1}.`}</span>
              <div>
                <div className="font-bold">{rank.player_name}</div>
                <div className="text-xs text-gray-500">{'⭐'.repeat(rank.stars)}</div>
              </div>
            </div>
          </div>
        ))}
      </div>
      <button onClick={fetchRankings} className="w-full mt-4 bg-gray-200 py-2 rounded-xl text-sm">
        🔄 Refresh
      </button>
    </div>
  );
}