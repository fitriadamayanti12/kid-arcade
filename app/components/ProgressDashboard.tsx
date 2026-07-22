// app/components/ProgressDashboard.tsx
'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useThemeStyles } from '@/hooks/useThemeStyles';

interface Props {
  playerName: string;
  onAvatarChange?: (avatar: string) => void;
}

const AVATARS = ['👦', '👧', '🐱', '🦸', '🐶', '🦄', '🐼', '🐨', '🦊', '🐸'];

export default function ProgressDashboard({ playerName, onAvatarChange }: Props) {
  const theme = useThemeStyles();
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showAvatars, setShowAvatars] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => { loadStats(); }, [playerName]);

  const loadStats = async () => {
    try {
      const { data } = await supabase
        .from('players')
        .select('*')
        .ilike('username', playerName)
        .single();
      if (data) {
        setStats({
          totalStars: data.total_stars || 0,
          totalGames: data.total_games_played || 0,
          badges: data.badges || [],
          stickers: data.stickers || [],
          avatar: data.avatar || '👦',
          streak: data.streak || 0,
        });
      }
    } catch (e) {
      console.error('Load stats error:', e);
    } finally {
      setLoading(false);
    }
  };

  const changeAvatar = async (emoji: string) => {
    try {
      await supabase.from('players').update({ avatar: emoji }).ilike('username', playerName);
      setStats((prev: any) => prev ? { ...prev, avatar: emoji } : null);
      if (onAvatarChange) onAvatarChange(emoji);
      setShowAvatars(false);
      setMessage('Avatar berubah! 🎨');
      setTimeout(() => setMessage(''), 2000);
    } catch (e) { console.error('Avatar error:', e); }
  };

  // Hitung level & progress bar
  const totalStars = stats?.totalStars || 0;
  const level = Math.floor(totalStars / 10) + 1;
  const nextLevel = level * 10;
  const progress = ((totalStars % 10) / 10) * 100;
  const rankEmoji = totalStars >= 100 ? '👑' : totalStars >= 50 ? '💎' : totalStars >= 25 ? '🌟' : totalStars >= 10 ? '⭐' : '🌱';
  const rankName = totalStars >= 100 ? 'Legenda' : totalStars >= 50 ? 'Master' : totalStars >= 25 ? 'Expert' : totalStars >= 10 ? 'Pro' : 'Pemula';

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '20px', color: theme.textMuted, fontSize: '13px' }}>
        Memuat progress...
      </div>
    );
  }

  return (
    <div style={{
      background: theme.bgCard,
      borderRadius: '20px',
      padding: '16px',
      boxShadow: theme.shadow,
      border: `1px solid ${theme.border}`,
      position: 'relative',
    }}>
      
      {/* ========== AVATAR & RANK ========== */}
      <div style={{ textAlign: 'center', marginBottom: '16px' }}>
        {/* Avatar dengan border rank */}
        <button
          onClick={() => setShowAvatars(!showAvatars)}
          style={{
            fontSize: '55px',
            background: `radial-gradient(circle, ${theme.bgHover} 50%, ${theme.accent || '#7c3aed'} 100%)`,
            border: '3px solid ' + (theme.accent || '#7c3aed'),
            borderRadius: '50%',
            width: '80px',
            height: '80px',
            cursor: 'pointer',
            margin: '0 auto',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'transform 0.2s',
            position: 'relative',
          }}
          onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.08)'}
          onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
        >
          {stats?.avatar || '👦'}
          {/* Rank badge */}
          <span style={{
            position: 'absolute', bottom: '-5px', right: '-5px',
            fontSize: '20px', background: theme.bgCard, borderRadius: '50%',
            width: '28px', height: '28px', display: 'flex',
            alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 2px 6px rgba(0,0,0,0.15)',
          }}>
            {rankEmoji}
          </span>
        </button>

        <h3 style={{ fontSize: '16px', fontWeight: '800', color: theme.heading, margin: '8px 0 2px' }}>
          {playerName}
        </h3>
        <span style={{
          display: 'inline-block',
          padding: '3px 10px',
          borderRadius: '20px',
          fontSize: '11px',
          fontWeight: '700',
          background: totalStars >= 100 ? '#fef3c7' : totalStars >= 50 ? '#ede9fe' : totalStars >= 25 ? '#dbeafe' : '#d1fae5',
          color: totalStars >= 100 ? '#92400e' : totalStars >= 50 ? '#5b21b6' : totalStars >= 25 ? '#1e40af' : '#065f46',
        }}>
          {rankEmoji} {rankName}
        </span>
      </div>

      {/* ========== AVATAR SELECTOR ========== */}
      {showAvatars && (
        <div style={{
          display: 'flex', flexWrap: 'wrap', gap: '6px', justifyContent: 'center',
          marginBottom: '12px', padding: '10px', background: theme.bgHover,
          borderRadius: '14px', animation: 'slide-up 0.3s ease-out',
        }}>
          {AVATARS.map(emoji => (
            <button key={emoji} onClick={() => changeAvatar(emoji)} style={{
              fontSize: '28px', padding: '6px',
              background: stats?.avatar === emoji ? '#ede9fe' : 'transparent',
              border: stats?.avatar === emoji ? '2px solid #7c3aed' : '2px solid transparent',
              borderRadius: '12px', cursor: 'pointer',
            }}>{emoji}</button>
          ))}
        </div>
      )}

      {/* ========== LEVEL PROGRESS BAR ========== */}
      <div style={{ marginBottom: '14px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
          <span style={{ fontSize: '11px', fontWeight: '600', color: theme.textSecondary }}>
            Level {level}
          </span>
          <span style={{ fontSize: '11px', fontWeight: '600', color: theme.textMuted }}>
            {totalStars} / {nextLevel} ⭐
          </span>
        </div>
        <div style={{
          width: '100%', height: '10px', background: theme.border,
          borderRadius: '5px', overflow: 'hidden',
        }}>
          <div style={{
            width: `${progress}%`, height: '100%',
            background: 'linear-gradient(90deg, #f59e0b, #ef4444, #7c3aed)',
            borderRadius: '5px',
            transition: 'width 0.5s ease',
            boxShadow: '0 0 8px rgba(245,158,11,0.4)',
          }} />
        </div>
        <p style={{ fontSize: '10px', color: theme.textMuted, textAlign: 'center', marginTop: '3px' }}>
          {nextLevel - totalStars} ⭐ lagi ke Level {level + 1}!
        </p>
      </div>

      {/* ========== STATS CARDS ========== */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '6px', marginBottom: '14px' }}>
        <div style={{ background: '#fef3c7', borderRadius: '12px', padding: '10px 6px', textAlign: 'center' }}>
          <div style={{ fontSize: '24px', marginBottom: '2px' }}>⭐</div>
          <p style={{ fontSize: '18px', fontWeight: '900', color: '#f59e0b', margin: 0 }}>{totalStars}</p>
          <p style={{ fontSize: '9px', color: '#92400e', margin: 0 }}>Bintang</p>
        </div>
        <div style={{ background: '#eff6ff', borderRadius: '12px', padding: '10px 6px', textAlign: 'center' }}>
          <div style={{ fontSize: '24px', marginBottom: '2px' }}>🎮</div>
          <p style={{ fontSize: '18px', fontWeight: '900', color: '#3b82f6', margin: 0 }}>{stats?.totalGames || 0}</p>
          <p style={{ fontSize: '9px', color: '#1e40af', margin: 0 }}>Game</p>
        </div>
        <div style={{ background: '#fce7f3', borderRadius: '12px', padding: '10px 6px', textAlign: 'center' }}>
          <div style={{ fontSize: '24px', marginBottom: '2px' }}>🔥</div>
          <p style={{ fontSize: '18px', fontWeight: '900', color: '#ec4899', margin: 0 }}>{stats?.streak || 0}</p>
          <p style={{ fontSize: '9px', color: '#9d174d', margin: 0 }}>Streak</p>
        </div>
      </div>

      {/* ========== BADGES ========== */}
      {stats?.badges?.length > 0 && (
        <div style={{ marginBottom: '12px' }}>
          <p style={{ fontSize: '12px', fontWeight: '700', color: theme.heading, marginBottom: '8px' }}>
            🏅 Badge ({stats.badges.length})
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px' }}>
            {stats.badges.map((b: string, i: number) => (
              <span key={i} style={{
                padding: '5px 10px', borderRadius: '20px', fontSize: '10px',
                background: 'linear-gradient(135deg, #ede9fe, #fce7f3)',
                color: '#5b21b6', fontWeight: '600',
                border: '1px solid #c4b5fd',
                boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
              }}>{b}</span>
            ))}
          </div>
        </div>
      )}

      {/* ========== STICKERS ========== */}
      {stats?.stickers?.length > 0 && (
        <div style={{ marginBottom: '8px' }}>
          <p style={{ fontSize: '12px', fontWeight: '700', color: theme.heading, marginBottom: '8px' }}>
            🌟 Stiker ({stats.stickers.length})
          </p>
          <div style={{ 
            display: 'flex', flexWrap: 'wrap', gap: '6px', fontSize: '24px',
            background: theme.bgHover, borderRadius: '12px', padding: '8px',
            minHeight: '40px',
          }}>
            {stats.stickers.map((s: string, i: number) => (
              <span key={i} style={{ animation: `float ${1.5 + i * 0.2}s ease-in-out infinite` }}>{s}</span>
            ))}
          </div>
        </div>
      )}

      {/* ========== EMPTY STATE ========== */}
      {!stats?.badges?.length && !stats?.stickers?.length && (
        <div style={{
          textAlign: 'center', padding: '16px',
          background: theme.bgHover, borderRadius: '12px',
          marginTop: '8px',
        }}>
          <p style={{ fontSize: '30px', margin: '0 0 4px' }}>🎯</p>
          <p style={{ fontSize: '12px', color: theme.textSecondary, margin: 0, fontWeight: '600' }}>
            Mainkan game & dapatkan badge!
          </p>
          <p style={{ fontSize: '10px', color: theme.textMuted, margin: '2px 0 0' }}>
            Setiap game selesai = ⭐ + 🏅
          </p>
        </div>
      )}

      {/* ========== TOAST ========== */}
      {message && (
        <div style={{
          position: 'fixed', bottom: '20px', left: '50%', transform: 'translateX(-50%)',
          background: '#1e293b', color: '#fff', padding: '8px 16px',
          borderRadius: '20px', fontSize: '12px', zIndex: 100,
          animation: 'slide-up 0.3s ease-out',
        }}>
          {message}
        </div>
      )}
    </div>
  );
}