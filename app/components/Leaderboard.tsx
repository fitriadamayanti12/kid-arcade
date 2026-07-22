// app/components/Leaderboard.tsx
'use client';

import { useEffect, useState, useRef } from 'react';
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
  const [totalStars, setTotalStars] = useState(0);
  const [totalGames, setTotalGames] = useState(0);
  
  const fetchRef = useRef<() => Promise<void>>(async () => {});

  const fetchRankings = async () => {
    setLoading(true);
    setError(null);

    try {
      let query = supabase
        .from('game_scores')
        .select('player_name, stars, score, game_type, completed_at');

      if (gameType !== 'all') query = query.eq('game_type', gameType);

      if (selectedPeriod !== 'all') {
        const date = new Date();
        if (selectedPeriod === 'week') date.setDate(date.getDate() - 7);
        else date.setMonth(date.getMonth() - 1);
        query = query.gte('completed_at', date.toISOString());
      }

      const { data: scores, error: scoresError } = await query;

      if (scoresError) {
        const { data: players } = await supabase
          .from('players')
          .select('username, total_stars, total_games_played')
          .order('total_stars', { ascending: false })
          .limit(limit);

        if (players && players.length > 0) {
          setRankings(players.map((p: any) => ({
            player_name: p.username, stars: p.total_stars || 0, score: p.total_games_played || 0,
          })));
          setTotalPlayers(players.length);
        } else {
          setRankings([]); setTotalPlayers(0);
        }
      } else if (scores && scores.length > 0) {
        const map = new Map<string, { stars: number; games: number }>();
        scores.forEach((row: any) => {
          const existing = map.get(row.player_name);
          if (!existing) map.set(row.player_name, { stars: row.stars || 0, games: 1 });
          else map.set(row.player_name, { stars: existing.stars + (row.stars || 0), games: existing.games + 1 });
        });

        const sorted = Array.from(map.entries())
          .map(([player_name, stats]) => ({ player_name, stars: stats.stars, score: stats.games }))
          .sort((a, b) => b.stars - a.stars || b.score - a.score)
          .slice(0, limit);

        setRankings(sorted);
        setTotalPlayers(map.size);
        setTotalStars(sorted.reduce((s, r) => s + r.stars, 0));
        setTotalGames(sorted.reduce((s, r) => s + r.score, 0));
      } else {
        setRankings([]); setTotalPlayers(0); setTotalStars(0); setTotalGames(0);
      }
    } catch (err) {
      console.error('Leaderboard error:', err);
      setError('Gagal memuat leaderboard');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchRef.current = fetchRankings; });

  useEffect(() => {
    fetchRankings();
    const interval = setInterval(() => { fetchRef.current?.(); }, 10000);
    const handler = () => { fetchRef.current?.(); };
    window.addEventListener('game-completed', handler);
    return () => {
      clearInterval(interval);
      window.removeEventListener('game-completed', handler);
    };
  }, []);

  const getMedal = (i: number) => {
    if (i === 0) return '🥇'; if (i === 1) return '🥈'; if (i === 2) return '🥉';
    if (i === 3) return '4️⃣'; if (i === 4) return '5️⃣'; if (i === 5) return '6️⃣';
    if (i === 6) return '7️⃣'; if (i === 7) return '8️⃣'; if (i === 8) return '9️⃣';
    if (i === 9) return '🔟'; return `#${i + 1}`;
  };

  return (
    <div style={{ background: theme.bgCard, borderRadius: '20px', padding: '16px', boxShadow: theme.shadow, border: `1px solid ${theme.border}`, overflow: 'hidden' }}>
      
      <div style={{ textAlign: 'center', marginBottom: '12px', background: 'linear-gradient(135deg, #fef3c7, #fde68a)', margin: '-16px -16px 16px -16px', padding: '16px 16px 12px' }}>
        <h3 style={{ fontSize: '18px', fontWeight: '800', color: '#92400e', margin: '0 0 2px' }}>🏆 Leaderboard</h3>
        <p style={{ fontSize: '11px', color: '#a16207', margin: 0 }}>
          {totalPlayers > 0 ? `${totalPlayers} pemain • ${totalStars}⭐ • ${totalGames} game` : 'Pemain terbaik'}
        </p>
      </div>

      <div style={{ display: 'flex', gap: '4px', justifyContent: 'center', marginBottom: '16px', position: 'relative', zIndex: 2 }}>
        {[{ id: 'all', label: 'Semua' }, { id: 'week', label: '7 Hari' }, { id: 'month', label: '30 Hari' }].map(p => (
          <button key={p.id} onClick={() => setSelectedPeriod(p.id as any)}
            style={{ padding: '5px 14px', borderRadius: '20px', fontSize: '11px', fontWeight: '600', border: 'none', cursor: 'pointer',
              background: selectedPeriod === p.id ? '#f59e0b' : theme.bgHover, color: selectedPeriod === p.id ? '#fff' : theme.textSecondary,
            }}>{p.label}</button>
        ))}
      </div>

      {loading && <div style={{ textAlign: 'center', padding: '30px' }}><div style={{ fontSize: '40px', animation: 'float 1.5s ease-in-out infinite' }}>🏆</div></div>}
      
      {error && <div style={{ textAlign: 'center', padding: '20px' }}><p style={{ fontSize: '13px', color: theme.danger }}>{error}</p></div>}

      {!loading && !error && rankings.length === 0 && (
        <div style={{ textAlign: 'center', padding: '30px', background: theme.bgHover, borderRadius: '16px' }}>
          <div style={{ fontSize: '50px', marginBottom: '8px' }}>🎮</div>
          <p style={{ fontSize: '14px', fontWeight: '600', color: theme.textSecondary }}>Belum ada pemain</p>
          <button onClick={fetchRankings} style={{ marginTop: '12px', padding: '8px 16px', borderRadius: '20px', border: 'none', background: '#f59e0b', color: '#fff', fontSize: '12px', fontWeight: '600', cursor: 'pointer' }}>🔄 Refresh</button>
        </div>
      )}

      {!loading && !error && rankings.length > 0 && (
        <>
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'flex-end', gap: '8px', marginBottom: '24px', height: '130px', overflow: 'visible', position: 'relative', zIndex: 1 }}>
            {[1, 0, 2].map(pos => {
              const rank = rankings[pos];
              if (!rank) return null;
              const medals = ['🥇', '🥈', '🥉'];
              const heights = ['80px', '60px', '45px'];
              const colors = ['linear-gradient(180deg, #fde68a, #fbbf24)', 'linear-gradient(180deg, #e2e8f0, #cbd5e1)', 'linear-gradient(180deg, #fecaca, #f87171)'];
              const textColors = ['#92400e', '#475569', '#7f1d1d'];
              return (
                <div key={pos} style={{ textAlign: 'center', flex: pos === 0 ? 1.2 : 1 }}>
                  <div style={{ fontSize: pos === 0 ? '40px' : '30px' }}>{medals[pos]}</div>
                  <p style={{ fontSize: pos === 0 ? '13px' : '11px', fontWeight: '700', color: theme.heading, margin: '2px 0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{rank.player_name}{pos === 0 ? ' 👑' : ''}</p>
                  <div style={{ width: pos === 0 ? '70px' : '60px', height: heights[pos], background: colors[pos], borderRadius: '8px 8px 0 0', margin: '0 auto', display: 'flex', alignItems: 'flex-end', justifyContent: 'center', paddingBottom: '4px' }}>
                    <span style={{ fontSize: pos === 0 ? '16px' : '14px', fontWeight: '900', color: textColors[pos] }}>{rank.stars}⭐</span>
                  </div>
                </div>
              );
            })}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', maxHeight: '200px', overflowY: 'auto' }}>
            {rankings.slice(3).map((rank, i) => {
              const idx = i + 3;
              return (
                <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '8px 12px', borderRadius: '12px', background: idx < 10 ? '#f0fdf4' : theme.bgHover }}>
                  <span style={{ fontSize: idx < 10 ? '18px' : '13px', width: '32px', textAlign: 'center', fontWeight: '700' }}>{getMedal(idx)}</span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontSize: '13px', fontWeight: '600', color: theme.heading, margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{rank.player_name}</p>
                  </div>
                  <span style={{ fontSize: '12px', fontWeight: '700', color: '#f59e0b' }}>⭐{rank.stars}</span>
                  <span style={{ fontSize: '11px', color: theme.textMuted }}>🎮{rank.score}</span>
                </div>
              );
            })}
          </div>
        </>
      )}

      <button onClick={fetchRankings} style={{ width: '100%', marginTop: '12px', padding: '8px', borderRadius: '12px', border: 'none', background: theme.bgHover, color: theme.text, fontSize: '12px', fontWeight: '600', cursor: 'pointer' }}>🔄 Refresh Leaderboard</button>
      <p style={{ textAlign: 'center', fontSize: '9px', color: theme.textMuted, marginTop: '6px' }}>Auto-refresh setiap 10 detik</p>
    </div>
  );
}