// app/components/games/MagicTable.tsx
'use client';

import { useState } from 'react';
import { useThemeStyles } from '@/hooks/useThemeStyles';

interface MagicTableProps {
  onComplete: (stars: number, extra?: any) => void;
}

const TABLE_SONGS: Record<number, string> = {
  2: '🎵 2,4,6,8,10... 12,14,16,18,20!',
  3: '🎵 3,6,9,12,15... 18,21,24,27,30!',
  4: '🎵 4,8,12,16,20... 24,28,32,36,40!',
  5: '🎵 5,10,15,20,25... 30,35,40,45,50!',
  6: '🎵 6,12,18,24,30... 36,42,48,54,60!',
  7: '🎵 7,14,21,28,35... 42,49,56,63,70!',
  8: '🎵 8,16,24,32,40... 48,56,64,72,80!',
  9: '🎵 9,18,27,36,45... 54,63,72,81,90!',
  10: '🎵 10,20,30,40,50... 60,70,80,90,100!',
};

export default function MagicTable({ onComplete }: MagicTableProps) {
  const theme = useThemeStyles();
  const [step, setStep] = useState<'menu' | 'visual' | 'practice' | 'quiz' | 'complete'>('menu');
  const [table, setTable] = useState(2);
  const [mult, setMult] = useState(1);
  const [answer, setAnswer] = useState('');
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);
  const [score, setScore] = useState(0);
  const [total, setTotal] = useState(0);
  const [streak, setStreak] = useState(0);
  const [hintLevel, setHintLevel] = useState(0);
  const [quizQ, setQuizQ] = useState<{ a: number; b: number }[]>([]);
  const [quizIdx, setQuizIdx] = useState(0);
  const [mode, setMode] = useState<'learn' | 'speed'>('learn');

  const emojis = ['🌟', '⭐', '💛', '✨', '🔸', '💎', '🎯', '🔥', '🌈', '🦄'];

  // Visual: Kotak perkalian
  const renderGrid = (t: number, m: number, showResult = true) => (
    <div style={{ marginBottom: '12px' }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '3px', alignItems: 'center' }}>
        {Array.from({ length: Math.min(t, 6) }).map((_, row) => (
          <div key={row} style={{ display: 'flex', gap: '3px' }}>
            {Array.from({ length: m }).map((_, col) => (
              <div key={col} style={{
                width: '32px', height: '32px', borderRadius: '8px',
                background: `hsl(${(row * m + col) * 360 / (t * m)}, 70%, ${60 + (row % 2) * 15}%)`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '14px', transition: 'all 0.3s',
                transform: `scale(${1 + (row * 0.02)})`,
              }}>
                {emojis[(row * m + col) % emojis.length]}
              </div>
            ))}
          </div>
        ))}
      </div>
      <p style={{ fontSize: '12px', color: theme.textMuted, marginTop: '6px' }}>
        {t} baris × {m} kolom = {t * m} total
      </p>
    </div>
  );

  // Finger counting method
  const renderFingerMethod = (t: number, m: number) => {
    if (t > 5 || m > 5) return null;
    const hands = Math.ceil(t / 5);
    return (
      <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', marginBottom: '8px' }}>
        {Array.from({ length: hands }).map((_, h) => (
          <div key={h} style={{ display: 'flex', gap: '2px' }}>
            {Array.from({ length: Math.min(5, t - h * 5) }).map((_, f) => (
              <span key={f} style={{ fontSize: '24px' }}>🖐️</span>
            ))}
          </div>
        ))}
        <span style={{ fontSize: '20px', alignSelf: 'center', fontWeight: '900', color: theme.heading }}>× {m}</span>
      </div>
    );
  };

  // Hints progressive
  const getHint = (t: number, m: number, level: number): string => {
    if (level === 0) return '';
    if (level === 1) return `💡 ${t} × ${m} = ${t} + ${t} + ... (${m} kali)`;
    if (level === 2) return `💡 ${t} × ${m} = ${t * (m - 1)} + ${t} = ${t * (m - 1) + t}`;
    if (level === 3) return `💡 ${t} × ${m} = ${m} × ${t} = ${m * t}`;
    return `✅ ${t} × ${m} = ${t * m}`;
  };

  const generateQuiz = () => {
    const qs: { a: number; b: number }[] = [];
    const multipliers = [1,2,3,4,5,6,7,8,9,10].sort(() => Math.random() - 0.5);
    for (const m of multipliers) qs.push({ a: table, b: m });
    setQuizQ(qs); setQuizIdx(0);
  };

  const handlePractice = () => {
    const ans = parseInt(answer);
    if (isNaN(ans)) return;
    const ok = ans === table * mult;
    setFeedback(ok ? 'correct' : 'wrong');
    setTotal(t => t + 1);
    if (ok) { setScore(s => s + 1); setStreak(s => s + 1); }
    else { setStreak(0); setHintLevel(h => Math.min(h + 1, 3)); }
    setTimeout(() => {
      if (mult < 10) { setMult(m => m + 1); setAnswer(''); setFeedback(null); }
      else { generateQuiz(); setStep('quiz'); setQuizIdx(0); setAnswer(''); setFeedback(null); }
    }, 600);
  };

  const handleQuiz = () => {
    const ans = parseInt(answer);
    if (isNaN(ans) || !quizQ[quizIdx]) return;
    const ok = ans === quizQ[quizIdx].a * quizQ[quizIdx].b;
    setFeedback(ok ? 'correct' : 'wrong');
    if (ok) { setScore(s => s + 3); setStreak(s => s + 1); }
    else setStreak(0);
    setTimeout(() => {
      if (quizIdx < 9) { setQuizIdx(i => i + 1); setAnswer(''); setFeedback(null); }
      else if (table < 10) { setTable(t => t + 1); setMult(1); setStep('visual'); setAnswer(''); setFeedback(null); setHintLevel(0); }
      else setStep('complete');
    }, 600);
  };

  const handleComplete = () => {
    const stars = score >= 80 ? 3 : score >= 50 ? 2 : 1;
    onComplete(stars, { score, tablesLearned: table, streak });
  };

  // ===== MENU =====
  if (step === 'menu') return (
    <div style={{ maxWidth: '500px', margin: '0 auto', padding: '24px', textAlign: 'center', background: theme.bg, minHeight: '400px' }}>
      <div style={{ fontSize: '60px', marginBottom: '8px' }}>🌟</div>
      <h2 style={{ fontSize: '30px', fontWeight: '800', color: theme.heading, marginBottom: '4px' }}>Tabel Ajaib!</h2>
      <p style={{ fontSize: '14px', color: theme.textSecondary, marginBottom: '20px' }}>Kuasai perkalian 1-10 dengan 3 cara belajar!</p>
      
      <div style={{ display: 'grid', gap: '8px', marginBottom: '20px' }}>
        {[
          { icon: '👁️', title: 'Visual', desc: 'Lihat kotak & gambar' },
          { icon: '✍️', title: 'Latihan', desc: 'Isi jawaban bertahap' },
          { icon: '🎯', title: 'Kuis', desc: 'Uji hafalan cepat' },
        ].map((item, i) => (
          <div key={i} style={{ background: theme.bgCard, borderRadius: '12px', padding: '12px', display: 'flex', alignItems: 'center', gap: '10px', border: `1px solid ${theme.border}` }}>
            <span style={{ fontSize: '28px' }}>{item.icon}</span>
            <div style={{ textAlign: 'left' }}>
              <p style={{ fontWeight: '700', color: theme.heading, margin: 0 }}>{item.title}</p>
              <p style={{ fontSize: '12px', color: theme.textSecondary, margin: 0 }}>{item.desc}</p>
            </div>
          </div>
        ))}
      </div>

      <button onClick={() => { setStep('visual'); setTable(2); setMult(1); }} style={{ padding: '14px 36px', borderRadius: '999px', border: 'none', background: '#f59e0b', color: '#fff', fontWeight: '700', fontSize: '16px', cursor: 'pointer', boxShadow: '0 4px 15px rgba(245,158,11,0.3)' }}>
        🌟 Mulai Belajar!
      </button>
    </div>
  );

  // ===== VISUAL =====
  if (step === 'visual') return (
    <div style={{ maxWidth: '500px', margin: '0 auto', padding: '16px', textAlign: 'center', background: theme.bg, minHeight: '400px' }}>
      <p style={{ fontSize: '13px', fontWeight: '700', color: '#7c3aed' }}>👁️ Tabel {table} - {mult}/10</p>
      <div style={{ display: 'flex', justifyContent: 'center', gap: '3px', marginBottom: '12px' }}>
        {Array.from({ length: 10 }).map((_, i) => <div key={i} style={{ width: '18px', height: '3px', borderRadius: '2px', background: i < table - 1 ? '#10b981' : i === table - 1 ? '#7c3aed' : theme.border }} />)}
      </div>

      <div style={{ background: '#fffbeb', borderRadius: '16px', padding: '16px', marginBottom: '12px' }}>
        {renderFingerMethod(table, mult)}
        {renderGrid(table, mult)}
        <p style={{ fontSize: '32px', fontWeight: '900', color: '#7c3aed', marginTop: '8px' }}>
          {table} × {mult} = <span style={{ background: '#7c3aed', color: '#fff', padding: '4px 16px', borderRadius: '10px' }}>{table * mult}</span>
        </p>
      </div>

      {/* Semua hasil tabel */}
      <div style={{ background: theme.bgCard, borderRadius: '12px', padding: '10px', marginBottom: '12px', display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '4px' }}>
        {Array.from({ length: 10 }).map((_, i) => (
          <div key={i} onClick={() => { setMult(i + 1); }} style={{
            padding: '6px', borderRadius: '8px', fontSize: '12px', fontWeight: '700', cursor: 'pointer',
            background: mult === i + 1 ? '#ede9fe' : 'transparent',
            color: mult === i + 1 ? '#7c3aed' : theme.text,
            border: mult === i + 1 ? '2px solid #7c3aed' : '1px solid transparent',
          }}>{table}×{i + 1}={table * (i + 1)}</div>
        ))}
      </div>

      <p style={{ fontSize: '12px', color: '#92400e', background: '#fef3c7', borderRadius: '8px', padding: '6px', marginBottom: '12px' }}>
        {TABLE_SONGS[table] || `Tambah ${table} setiap langkah!`}
      </p>

      <div style={{ display: 'flex', gap: '6px', justifyContent: 'center' }}>
        {mult > 1 && <button onClick={() => setMult(m => m - 1)} style={navBtn(theme)}>◀</button>}
        <button onClick={() => { setStep('practice'); setMult(1); setAnswer(''); setFeedback(null); }} style={{ ...navBtn(theme), background: '#7c3aed', color: '#fff' }}>✍️ Latihan</button>
        {mult < 10 && <button onClick={() => setMult(m => m + 1)} style={navBtn(theme)}>▶</button>}
      </div>
    </div>
  );

  // ===== PRACTICE =====
  if (step === 'practice') return (
    <div style={{ maxWidth: '500px', margin: '0 auto', padding: '16px', textAlign: 'center', background: theme.bg, minHeight: '400px' }}>
      <p style={{ fontSize: '13px', fontWeight: '700', color: '#7c3aed' }}>✍️ Tabel {table} ({mult}/10)</p>
      <div style={{ width: '100%', height: '6px', background: theme.border, borderRadius: '3px', margin: '8px 0 16px' }}>
        <div style={{ width: `${(mult / 10) * 100}%`, height: '100%', background: '#7c3aed', borderRadius: '3px', transition: 'width 0.3s' }} />
      </div>
      <div style={{ background: '#fffbeb', borderRadius: '16px', padding: '16px', marginBottom: '16px' }}>
        {renderGrid(table, mult)}
        <p style={{ fontSize: '32px', fontWeight: '900', color: theme.heading }}>{table} × {mult} = ?</p>
      </div>
      {hintLevel > 0 && <p style={{ fontSize: '13px', color: '#92400e', background: '#fef3c7', borderRadius: '8px', padding: '6px', marginBottom: '8px' }}>{getHint(table, mult, hintLevel)}</p>}
      <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
        <input type="number" value={answer} onChange={e => setAnswer(e.target.value)} onKeyDown={e => e.key === 'Enter' && handlePractice()} placeholder="?" style={{ width: '80px', padding: '12px', fontSize: '22px', textAlign: 'center', borderRadius: '10px', border: `2px solid ${feedback === 'wrong' ? '#ef4444' : '#7c3aed'}`, background: theme.input, color: theme.text, outline: 'none' }} autoFocus />
        <button onClick={handlePractice} style={{ padding: '12px 20px', borderRadius: '10px', border: 'none', background: '#10b981', color: '#fff', fontWeight: '700', fontSize: '16px', cursor: 'pointer' }}>✅</button>
      </div>
      <button onClick={() => setHintLevel(h => Math.min(h + 1, 3))} style={{ background: 'none', border: 'none', color: '#7c3aed', fontSize: '12px', cursor: 'pointer', marginTop: '6px' }}>💡 Butuh bantuan?</button>
      {feedback && (
        <div style={{ marginTop: '8px', padding: '8px', borderRadius: '8px', background: feedback === 'correct' ? '#d1fae5' : '#fee2e2', color: feedback === 'correct' ? '#065f46' : '#991b1b', fontWeight: '600' }}>
          {feedback === 'correct' ? `🎉 ${table}×${mult}=${table * mult}` : `❌ ${table}×${mult}=${table * mult}`}
        </div>
      )}
      <div style={{ marginTop: '8px', fontSize: '12px', color: theme.textMuted }}>
        ⭐ {score} | 🔥 {streak}x
      </div>
    </div>
  );

  // ===== QUIZ =====
  if (step === 'quiz') return (
    <div style={{ maxWidth: '500px', margin: '0 auto', padding: '16px', textAlign: 'center', background: theme.bg, minHeight: '400px' }}>
      <p style={{ fontSize: '14px', fontWeight: '700', color: '#f59e0b' }}>🎯 Kuis Tabel {table} ({quizIdx + 1}/10)</p>
      <div style={{ width: '100%', height: '6px', background: theme.border, borderRadius: '3px', margin: '8px 0 16px' }}>
        <div style={{ width: `${(quizIdx / 10) * 100}%`, height: '100%', background: '#f59e0b', borderRadius: '3px', transition: 'width 0.3s' }} />
      </div>
      <div style={{ background: theme.bgCard, borderRadius: '16px', padding: '24px', marginBottom: '16px', boxShadow: theme.shadow }}>
        <div style={{ fontSize: '50px', marginBottom: '8px' }}>🤔</div>
        <p style={{ fontSize: '32px', fontWeight: '900', color: theme.heading }}>
          {quizQ[quizIdx]?.a} × {quizQ[quizIdx]?.b} = ?
        </p>
      </div>
      <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
        <input type="number" value={answer} onChange={e => setAnswer(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleQuiz()} placeholder="?" style={{ width: '80px', padding: '12px', fontSize: '22px', textAlign: 'center', borderRadius: '10px', border: `2px solid ${feedback === 'wrong' ? '#ef4444' : '#f59e0b'}`, background: theme.input, color: theme.text, outline: 'none' }} autoFocus />
        <button onClick={handleQuiz} style={{ padding: '12px 20px', borderRadius: '10px', border: 'none', background: '#f59e0b', color: '#fff', fontWeight: '700', fontSize: '16px', cursor: 'pointer' }}>✅</button>
      </div>
      {feedback && (
        <div style={{ marginTop: '8px', padding: '8px', borderRadius: '8px', background: feedback === 'correct' ? '#d1fae5' : '#fee2e2', color: feedback === 'correct' ? '#065f46' : '#991b1b', fontWeight: '600' }}>
          {feedback === 'correct' ? '🎉 Benar! +3' : `❌ ${quizQ[quizIdx]?.a}×${quizQ[quizIdx]?.b}=${(quizQ[quizIdx]?.a || 0) * (quizQ[quizIdx]?.b || 0)}`}
        </div>
      )}
      <div style={{ marginTop: '8px', fontSize: '12px', color: theme.textMuted }}>⭐ {score} | 🔥 {streak}x</div>
    </div>
  );

  // ===== COMPLETE =====
  const stars = score >= 80 ? 3 : score >= 50 ? 2 : 1;
  return (
    <div style={{ maxWidth: '500px', margin: '0 auto', padding: '24px', textAlign: 'center', background: theme.bg, minHeight: '400px' }}>
      <div style={{ fontSize: '60px' }}>🏆</div>
      <h2 style={{ fontSize: '24px', fontWeight: '800', color: theme.heading }}>Master Perkalian!</h2>
      <p style={{ color: theme.textSecondary }}>Skor: {score} | Tabel: 1-{table}</p>
      <p style={{ color: theme.textSecondary }}>Streak: {streak}x 🔥</p>
      <div style={{ fontSize: '40px' }}>{'⭐'.repeat(stars)}</div>
      <div style={{ marginTop: '16px', display: 'flex', gap: '8px', justifyContent: 'center' }}>
        <button onClick={() => { setStep('menu'); setTable(2); setMult(1); setScore(0); setStreak(0); }} style={{ padding: '10px 20px', borderRadius: '999px', border: 'none', background: theme.bgHover, color: theme.text, fontWeight: '600', cursor: 'pointer' }}>🔄 Ulang</button>
        <button onClick={handleComplete} style={{ padding: '10px 20px', borderRadius: '999px', border: 'none', background: '#f59e0b', color: '#fff', fontWeight: '600', cursor: 'pointer' }}>🏆 Klaim!</button>
      </div>
    </div>
  );
}

function navBtn(theme: any) {
  return {
    padding: '8px 14px', borderRadius: '999px', border: 'none',
    background: theme.bgHover, color: theme.text,
    fontWeight: '600', fontSize: '14px', cursor: 'pointer',
  };
}