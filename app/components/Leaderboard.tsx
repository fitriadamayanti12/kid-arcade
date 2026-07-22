// app/components/Leaderboard.tsx
'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useThemeStyles } from '@/hooks/useThemeStyles';

interface LeaderboardEntry {
  player_name: string;
  stars: number;
  score: number;
  game_type?: string;
}

interface LeaderboardProps {
  gameType?: string;
  limit?: number;
}

export default function Leaderboard({ gameType = 'all', limit = 20 }: LeaderboardProps) {
  const theme = useThemeStyles();
  const [rankings, setRankings] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedPeriod, setSelectedPeriod] = useState<'all' | 'week' | 'month'>('all');
  const [totalPlayers, setTotalPlayers] = useState(0);

  const fetchRankings = async () => {
    setLoading(true);
    setError(null);

    try {
      // Query langsung dari game_scores
      let query = supabase
        .from('game_scores')
        .select('player_name, stars, score, game_type, completed_at');

      if (gameType !== 'all') {
        query = query.eq('game_type', gameType);
      }

      if (selectedPeriod !== 'all') {
        const date = new Date();
        if (selectedPeriod === 'week') date.setDate(date.getDate() - 7);
        else date.setMonth(date.getMonth() - 1);
        query = query.gte('completed_at', date.toISOString());
      }

      const { data: scores, error: scoresError } = await query;

      if (scoresError) {
        // Fallback ke players
        const { data: players } = await supabase
          .from('players')
          .select('username, total_stars, total_games_played')
          .order('total_stars', { ascending: false })
          .limit(limit);

        if (players && players.length > 0) {
          setRankings(players.map((p: any) => ({
            player_name: p.username,
            stars: p.total_stars || 0,
            score: p.total_games_played || 0,
          })));
          setTotalPlayers(players.length);
        } else {
          setRankings([]);
          setTotalPlayers(0);
        }
      } else if (scores && scores.length > 0) {
        // Group by player_name
        const map = new Map<string, { stars: number; score: number }>();
        scores.forEach((row: any) => {
          const existing = map.get(row.player_name);
          if (!existing) {
            map.set(row.player_name, { stars: row.stars, score: row.score });
          } else {
            map.set(row.player_name, {
              stars: existing.stars + row.stars,
              score: Math.max(existing.score, row.score),
            });
          }
        });

        const sorted = Array.from(map.entries())
          .map(([player_name, stats]) => ({
            player_name,
            stars: stats.stars,
            score: stats.score,
          }))
          .sort((a, b) => b.stars - a.stars || b.score - a.score)
          .slice(0, limit);

        setRankings(sorted);
        setTotalPlayers(map.size);
      } else {
        setRankings([]);
        setTotalPlayers(0);
      }
    } catch (err) {
      console.error('Leaderboard error:', err);
      setError('Gagal memuat leaderboard');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRankings();
  }, [gameType, selectedPeriod]);

  // Ikon untuk SEMUA peringkat
  const getMedal = (i: number) => {
    if (i === 0) return '🥇';
    if (i === 1) return '🥈';
    if (i === 2) return '🥉';
    if (i === 3) return '4️⃣';
    if (i === 4) return '5️⃣';
    if (i === 5) return '6️⃣';
    if (i === 6) return '7️⃣';
    if (i === 7) return '8️⃣';
    if (i === 8) return '9️⃣';
    if (i === 9) return '🔟';
    return `#${i + 1}`;
  };

  // Warna background sesuai peringkat
  const getBg = (i: number) => {
    if (i === 0) return '#fef3c7'; // Gold
    if (i === 1) return '#f1f5f9'; // Silver
    if (i === 2) return '#fef2f2'; // Bronze
    if (i < 10) return '#f0fdf4'; // Top 10 - Green tint
    return theme.bgHover;
  };

  return (
    <div style={{
      background: theme.bgCard,
      borderRadius: '20px',
      padding: '16px',
      boxShadow: theme.shadow,
      border: `1px solid ${theme.border}`,
    }}>
      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: '12px' }}>
        <h3 style={{ fontSize: '18px', fontWeight: '800', color: theme.heading }}>🏆 Leaderboard</h3>
        <p style={{ fontSize: '11px', color: theme.textMuted }}>
          {totalPlayers > 0 ? `${totalPlayers} pemain` : 'Pemain terbaik'}
        </p>
      </div>

      {/* Period Filter */}
      <div style={{ display: 'flex', gap: '4px', justifyContent: 'center', marginBottom: '12px' }}>
        {[
          { id: 'all', label: 'Semua' },
          { id: 'week', label: '7 Hari' },
          { id: 'month', label: '30 Hari' },
        ].map(p => (
          <button key={p.id} onClick={() => setSelectedPeriod(p.id as any)}
            style={{
              padding: '4px 12px', borderRadius: '20px', fontSize: '11px', fontWeight: '600',
              border: 'none', cursor: 'pointer',
              background: selectedPeriod === p.id ? '#f59e0b' : theme.bgHover,
              color: selectedPeriod === p.id ? '#fff' : theme.textSecondary,
              transition: 'all 0.2s',
            }}
          >{p.label}</button>
        ))}
      </div>

      {/* Loading */}
      {loading && (
        <div style={{ textAlign: 'center', padding: '20px' }}>
          <div style={{ fontSize: '30px', animation: 'float 1.5s ease-in-out infinite' }}>🏆</div>
          <p style={{ fontSize: '12px', color: theme.textMuted }}>Memuat...</p>
        </div>
      )}

      {/* Error */}
      {error && (
        <div style={{ textAlign: 'center', padding: '20px' }}>
          <p style={{ fontSize: '13px', color: theme.danger }}>{error}</p>
          <button onClick={fetchRankings} style={{
            marginTop: '8px', padding: '6px 16px', borderRadius: '20px', border: 'none',
            background: theme.bgHover, color: theme.text, fontSize: '12px', cursor: 'pointer',
          }}>🔄 Coba Lagi</button>
        </div>
      )}

      {/* Empty */}
      {!loading && !error && rankings.length === 0 && (
        <div style={{ textAlign: 'center', padding: '20px' }}>
          <div style={{ fontSize: '40px' }}>🎮</div>
          <p style={{ fontSize: '13px', color: theme.textSecondary }}>Belum ada pemain</p>
          <p style={{ fontSize: '11px', color: theme.textMuted }}>Mainkan game untuk masuk leaderboard!</p>
          <button onClick={fetchRankings} style={{
            marginTop: '8px', padding: '6px 12px', borderRadius: '20px', border: 'none',
            background: theme.bgHover, color: theme.text, fontSize: '11px', cursor: 'pointer',
          }}>🔄 Refresh</button>
        </div>
      )}

      {/* Rankings */}
      {!loading && !error && rankings.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', maxHeight: '350px', overflowY: 'auto' }}>
          {rankings.map((rank, i) => (
            <div key={i} style={{
              display: 'flex', alignItems: 'center', gap: '10px',
              padding: '8px 12px', borderRadius: '12px',
              background: getBg(i),
              border: i < 3 ? `1px solid ${i === 0 ? '#f59e0b' : i === 1 ? '#94a3b8' : '#f97316'}` : 'none',
            }}>
              {/* Medal/Rank */}
              <span style={{ 
                fontSize: i < 10 ? '20px' : '14px', 
                width: '36px', 
                textAlign: 'center',
                fontWeight: i >= 10 ? '600' : '700',
                color: i >= 10 ? theme.textMuted : 'inherit',
              }}>
                {getMedal(i)}
              </span>

              {/* Player Info */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ 
                  fontSize: '14px', 
                  fontWeight: '700', 
                  color: theme.heading, 
                  margin: 0, 
                  overflow: 'hidden', 
                  textOverflow: 'ellipsis', 
                  whiteSpace: 'nowrap',
                }}>
                  {rank.player_name}
                  {i === 0 && <span style={{ marginLeft: '4px' }}>👑</span>}
                </p>
                <p style={{ fontSize: '11px', color: theme.textMuted, margin: 0 }}>
                  ⭐ {rank.stars} • 🎮 {rank.score}
                </p>
              </div>

              {/* Top 3 Crown */}
              {i < 3 && (
                <span style={{ fontSize: '16px' }}>
                  {i === 0 ? '🏆' : i === 1 ? '🥈' : '🥉'}
                </span>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Refresh Button */}
      <button onClick={fetchRankings} style={{
        width: '100%', marginTop: '10px', padding: '8px',
        borderRadius: '12px', border: 'none',
        background: theme.bgHover, color: theme.text,
        fontSize: '12px', fontWeight: '600', cursor: 'pointer',
        transition: 'all 0.2s',
      }}>
        🔄 Refresh Leaderboard
      </button>
    </div>
  );
}