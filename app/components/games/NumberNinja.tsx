// app/components/games/NumberNinja.tsx
'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { useThemeStyles } from '@/hooks/useThemeStyles';

interface NumberNinjaProps {
  onComplete: (stars: number, extra?: any) => void;
}

const RANKS = ['🥷 Pemula', '🎯 Pelatih', '⚔️ Prajurit', '🗡️ Ahli', '👑 Master'];

export default function NumberNinja({ onComplete }: NumberNinjaProps) {
  const theme = useThemeStyles();
  const [step, setStep] = useState<'menu' | 'play' | 'complete'>('menu');
  const [q, setQ] = useState<{ type: string; text: string; answer: number; opts: number[]; points: number; visual?: number[]; hint: string } | null>(null);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [lives, setLives] = useState(3);
  const [total, setTotal] = useState(0);
  const [correct, setCorrect] = useState(0);
  const [rank, setRank] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [feedback, setFeedback] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  const [mode, setMode] = useState<'zen' | 'speed'>('zen');
  const [diff, setDiff] = useState<'easy' | 'medium' | 'hard'>('easy');

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const genQ = useCallback(() => {
    const types = ['pattern', 'missing', 'balance', 'compare'];
    const type = types[Math.floor(Math.random() * 4)];
    let text = '', answer = 0, points = 15, visual: number[] = [], hint = '';
    const d = diff === 'easy' ? 1 : diff === 'medium' ? 2 : 3;

    switch (type) {
      case 'pattern': {
        const patterns = [[2,4,6,8,10],[3,6,9,12,15],[5,10,15,20,25],[1,3,5,7,9],[2,6,10,14,18]];
        const p = patterns[Math.floor(Math.random() * patterns.length)];
        const mi = 3; answer = p[mi]; visual = p.map((n, i) => i === mi ? -1 : n);
        text = 'Temukan angka yang hilang!'; hint = `+${p[1]-p[0]} setiap langkah`;
        break;
      }
      case 'missing': {
        const a = Math.floor(Math.random() * 10) + 1;
        const ops = [{ t: `${a} + ? = ${a + 5}`, ans: 5 }, { t: `? + ${a} = ${a + 7}`, ans: 7 }, { t: `${a + 3} - ? = ${a}`, ans: 3 }];
        const o = ops[Math.floor(Math.random() * ops.length)];
        text = `Cari angka hilang: ${o.t}`; answer = o.ans; hint = 'Gunakan operasi kebalikan';
        break;
      }
      case 'balance': {
        const l = Math.floor(Math.random() * 20) + 10; const r = Math.floor(Math.random() * 15) + 5;
        answer = l - r; visual = [l, r]; text = `Timbangan: kiri ${l}, kanan ${r}. Tambah berapa ke kanan?`; hint = `${l} - ${r} = ${answer}`;
        break;
      }
      case 'compare': {
        const pairs = [{ a: 3*4, b: 2*6, ans: 0 }, { a: 5+8, b: 7+5, ans: 1 }, { a: 20-7, b: 30-18, ans: 1 }];
        const p = pairs[Math.floor(Math.random() * pairs.length)];
        text = `Mana lebih besar? A=${p.a}, B=${p.b}`; answer = p.ans === 0 ? 0 : p.ans === 1 ? 1 : -1;
        hint = p.ans === 0 ? 'Sama besar' : p.ans === 1 ? 'A > B' : 'A < B'; points = 10;
        break;
      }
    }
    const opts = new Set([answer]);
    if (type === 'compare') { opts.add(0); opts.add(1); opts.add(-1); }
    else { while (opts.size < 4) { const off = Math.floor(Math.random() * 5) + 1; opts.add(Math.random() > 0.5 ? answer + off : Math.max(0, answer - off)); } }
    const tl = mode === 'speed' ? (diff === 'easy' ? 8 : diff === 'medium' ? 6 : 4) : 30;
    setQ({ type, text, answer, opts: Array.from(opts).sort(() => Math.random() - 0.5), points, visual, hint });
    setTimeLeft(tl);
  }, [diff, mode]);

  const start = (m: 'zen' | 'speed') => { setMode(m); setStep('play'); setScore(0); setStreak(0); setLives(m === 'speed' ? 5 : 3); setTotal(0); setCorrect(0); setRank(0); genQ(); };

  const handle = (ans: number) => {
    if (!q || feedback) return;
    setSelected(ans); setFeedback(true);
    const ok = (q.type === 'compare') ? ans === q.answer : ans === q.answer;
    setIsCorrect(ok); setTotal(t => t + 1);
    if (ok) {
      const pts = q.points * (streak >= 10 ? 4 : streak >= 5 ? 2 : 1);
      setScore(s => s + pts); setCorrect(c => c + 1);
      setStreak(s => { const ns = s + 1; setBestStreak(b => Math.max(b, ns)); if (ns >= 20) setRank(4); else if (ns >= 10) setRank(2); else if (ns >= 5) setRank(1); return ns; });
    } else { setStreak(0); setLives(l => { const nl = l - 1; if (nl <= 0) setStep('complete'); return Math.max(0, nl); }); }
    setTimeout(() => { if (step === 'play') { genQ(); setSelected(null); setFeedback(false); } }, 1000);
  };

  useEffect(() => {
    if (step !== 'play' || mode !== 'speed') return;
    if (timeLeft <= 0) { handle(-1); return; }
    timerRef.current = setInterval(() => setTimeLeft(t => t - 1), 1000);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [step, timeLeft, mode]);

  const handleComplete = () => {
    const stars = correct >= 15 ? 3 : correct >= 10 ? 2 : 1;
    onComplete(stars, { score, correct, total, bestStreak, rank: RANKS[rank] });
  };

  if (step === 'menu') return (
    <div style={{ maxWidth: '500px', margin: '0 auto', padding: '24px', textAlign: 'center', background: theme.bg, minHeight: '400px' }}>
      <div style={{ fontSize: '60px', marginBottom: '8px' }}>🥷</div>
      <h2 style={{ fontSize: '28px', fontWeight: '800', color: theme.heading }}>Number Ninja!</h2>
      <p style={{ fontSize: '14px', color: theme.textSecondary, marginBottom: '16px' }}>Latih kecepatan & ketepatan matematika!</p>
      <div style={{ display: 'grid', gap: '8px', marginBottom: '16px' }}>
        <button onClick={() => start('zen')} style={btn('#10b981')}>🧘 Zen Mode</button>
        <button onClick={() => start('speed')} style={btn('#f59e0b')}>⚡ Speed Mode</button>
      </div>
      <div style={{ display: 'flex', gap: '6px', justifyContent: 'center' }}>
        {(['easy', 'medium', 'hard'] as const).map(d => (
          <button key={d} onClick={() => setDiff(d)} style={{ padding: '8px 16px', borderRadius: '10px', border: 'none', background: diff === d ? '#7c3aed' : theme.bgHover, color: diff === d ? '#fff' : theme.text, fontWeight: '600', cursor: 'pointer' }}>{d === 'easy' ? '⭐' : d === 'medium' ? '⭐⭐' : '⭐⭐⭐'}</button>
        ))}
      </div>
    </div>
  );

  if (step === 'complete') {
    const stars = correct >= 15 ? 3 : correct >= 10 ? 2 : 1;
    return (
      <div style={{ maxWidth: '500px', margin: '0 auto', padding: '24px', textAlign: 'center', background: theme.bg, minHeight: '400px' }}>
        <div style={{ fontSize: '60px' }}>{RANKS[rank].split(' ')[0]}</div>
        <h2 style={{ fontSize: '24px', fontWeight: '800', color: theme.heading }}>Permainan Selesai!</h2>
        <p style={{ color: theme.textSecondary }}>Rank: {RANKS[rank]} | Skor: {score}</p>
        <p style={{ color: theme.textSecondary }}>Benar: {correct}/{total} | Streak: {bestStreak}x</p>
        <div style={{ fontSize: '40px' }}>{'⭐'.repeat(stars)}</div>
        <button onClick={handleComplete} style={{ marginTop: '16px', padding: '12px 24px', borderRadius: '999px', border: 'none', background: '#f59e0b', color: '#fff', fontWeight: '700', cursor: 'pointer' }}>🏆 Klaim!</button>
      </div>
    );
  }

  if (!q) return null;

  return (
    <div style={{ maxWidth: '500px', margin: '0 auto', padding: '16px', textAlign: 'center', background: theme.bg, minHeight: '400px' }}>
      {/* HUD */}
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '13px' }}>
        <span style={{ color: theme.textSecondary }}>⭐ {score}</span>
        <span style={{ color: '#f59e0b', fontWeight: '700' }}>{streak >= 3 ? `🔥 ${streak}x` : ''}</span>
        <span style={{ color: theme.textSecondary }}>{Array.from({ length: lives }).map(() => '❤️').join('')}</span>
      </div>
      {mode === 'speed' && (
        <div style={{ width: '100%', height: '6px', background: theme.border, borderRadius: '3px', marginBottom: '12px' }}>
          <div style={{ width: `${(timeLeft / (diff === 'easy' ? 8 : diff === 'medium' ? 6 : 4)) * 100}%`, height: '100%', background: timeLeft < 3 ? '#ef4444' : '#f59e0b', borderRadius: '3px', transition: 'width 1s' }} />
        </div>
      )}
      <p style={{ fontSize: '12px', color: '#7c3aed', fontWeight: '600', marginBottom: '4px' }}>{RANKS[rank]}</p>

      <div style={{ background: theme.bgCard, borderRadius: '16px', padding: '20px', boxShadow: theme.shadow, marginBottom: '16px' }}>
        <p style={{ fontSize: '13px', color: '#7c3aed', fontWeight: '600', marginBottom: '4px' }}>
          {q.type === 'pattern' ? '🔢 Pola' : q.type === 'missing' ? '🔍 Angka Hilang' : q.type === 'balance' ? '⚖️ Timbangan' : '📊 Perbandingan'}
        </p>
        <h3 style={{ fontSize: '20px', fontWeight: '700', color: theme.heading }}>{q.text}</h3>
        {q.visual && q.type === 'pattern' && (
          <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', marginTop: '12px' }}>
            {q.visual.map((n, i) => (
              <div key={i} style={{ width: '40px', height: '40px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: n === -1 ? '#fef3c7' : '#6366f1', color: n === -1 ? '#f59e0b' : '#fff', fontWeight: '700', fontSize: '18px' }}>{n === -1 ? '?' : n}</div>
            ))}
          </div>
        )}
        {q.visual && q.type === 'balance' && (
          <div style={{ display: 'flex', justifyContent: 'center', gap: '12px', marginTop: '12px', alignItems: 'flex-end' }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ width: '30px', height: `${Math.min(80, q.visual[0] * 3)}px`, background: '#6366f1', borderRadius: '6px 6px 0 0', margin: '0 auto' }} />
              <p style={{ fontWeight: '700', fontSize: '14px' }}>{q.visual[0]}</p>
            </div>
            <span style={{ fontSize: '24px', fontWeight: '900' }}>vs</span>
            <div style={{ textAlign: 'center' }}>
              <div style={{ width: '30px', height: `${Math.min(80, q.visual[1] * 3)}px`, background: '#ef4444', borderRadius: '6px 6px 0 0', margin: '0 auto' }} />
              <p style={{ fontWeight: '700', fontSize: '14px' }}>{q.visual[1]}</p>
            </div>
          </div>
        )}
        <p style={{ fontSize: '12px', color: theme.textMuted, marginTop: '8px' }}>+{q.points * (streak >= 10 ? 4 : streak >= 5 ? 2 : 1)} poin</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', maxWidth: '280px', margin: '0 auto' }}>
        {q.opts.map((opt, i) => (
          <button key={i} onClick={() => handle(opt)} disabled={feedback} style={{
            padding: '14px', fontSize: '20px', fontWeight: '700', borderRadius: '12px', border: 'none',
            background: feedback && opt === q.answer ? '#10b981' : feedback && opt === selected ? '#ef4444' : theme.bgHover,
            color: (feedback && (opt === q.answer || opt === selected)) ? '#fff' : theme.text,
            cursor: feedback ? 'default' : 'pointer',
          }}>{q.type === 'compare' ? (opt === 1 ? 'A > B' : opt === -1 ? 'A < B' : 'A = B') : opt}</button>
        ))}
      </div>

      {feedback && (
        <div style={{ marginTop: '12px', padding: '10px', borderRadius: '10px', background: isCorrect ? '#d1fae5' : '#fee2e2', color: isCorrect ? '#065f46' : '#991b1b', fontWeight: '600', animation: 'pop 0.3s ease-out' }}>
          {isCorrect ? `🎉 +${q.points * (streak >= 10 ? 4 : streak >= 5 ? 2 : 1)}` : `❌ ${q.hint}`}
        </div>
      )}
    </div>
  );
}

function btn(bg: string): React.CSSProperties {
  return { padding: '12px 20px', borderRadius: '12px', border: 'none', background: bg, color: '#fff', fontWeight: '700', fontSize: '15px', cursor: 'pointer', width: '100%' };
}