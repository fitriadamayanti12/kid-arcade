// app/components/games/kelas3/TimesTableHero.tsx
'use client';

import { useState, useEffect, useCallback } from 'react';
import { useThemeStyles } from '@/hooks/useThemeStyles';

interface Props {
  onComplete: (stars: number, extra?: any) => void;
}

// ============================================
// LEVEL KESULITAN ADAPTIF
// ============================================
type Difficulty = 'easy' | 'medium' | 'hard' | 'expert';

const DIFFICULTY_CONFIG: Record<Difficulty, { label: string; icon: string; color: string; bg: string; range: [number, number]; timeLimit: number }> = {
  'easy': { label: 'Mudah', icon: '🌱', color: '#10b981', bg: '#ecfdf5', range: [2, 5], timeLimit: 10 },
  'medium': { label: 'Sedang', icon: '🌿', color: '#f59e0b', bg: '#fffbeb', range: [3, 7], timeLimit: 8 },
  'hard': { label: 'Sulit', icon: '🔥', color: '#ef4444', bg: '#fef2f2', range: [4, 9], timeLimit: 6 },
  'expert': { label: 'Expert', icon: '💎', color: '#8b5cf6', bg: '#f5f3ff', range: [6, 10], timeLimit: 4 }
};

const ACHIEVEMENTS = [
  { id: 'streak5', label: '5x Beruntun', icon: '🔥', target: 5 },
  { id: 'speed3', label: 'Jawab < 3 detik', icon: '⚡', target: 3 },
  { id: 'all-easy', label: 'Mudah Selesai', icon: '🌱', target: 1 },
  { id: 'combo10', label: 'Kombo 10', icon: '💥', target: 10 }
];

// ============================================
// KOMPONEN UTAMA
// ============================================
export default function TimesTableHero({ onComplete }: Props) {
  const theme = useThemeStyles();
  const [ready, setReady] = useState(false);
  const [step, setStep] = useState<'menu' | 'play' | 'complete'>('menu');
  const [difficulty, setDifficulty] = useState<Difficulty>('easy');
  const [a, setA] = useState(0);
  const [b, setB] = useState(0);
  const [answer, setAnswer] = useState(0);
  const [input, setInput] = useState('');
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [timeLeft, setTimeLeft] = useState(10);
  const [totalAnswered, setTotalAnswered] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);
  const [achievements, setAchievements] = useState<Set<string>>(new Set());
  const [speedRecord, setSpeedRecord] = useState(99);
  const [questionStartTime, setQuestionStartTime] = useState(Date.now());
  const TOTAL = 20;

  useEffect(() => { const t = setTimeout(() => setReady(true), 200); return () => clearTimeout(t); }, []);

  const generateNew = useCallback((diff: Difficulty) => {
    const [min, max] = DIFFICULTY_CONFIG[diff].range;
    const aa = Math.floor(Math.random() * (max - min + 1)) + min;
    const bb = Math.floor(Math.random() * 9) + 1;
    setA(aa);
    setB(bb);
    setAnswer(aa * bb);
    setInput('');
    setFeedback(null);
    setTimeLeft(DIFFICULTY_CONFIG[diff].timeLimit);
    setQuestionStartTime(Date.now());
  }, []);

  useEffect(() => {
    if (step === 'play') generateNew(difficulty);
  }, [step, difficulty, generateNew]);

  // Timer
  useEffect(() => {
    if (step !== 'play' || feedback) return;
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          setFeedback('wrong');
          setStreak(0);
          setTotalAnswered(t => t + 1);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [step, feedback, a, b]);

  // Adaptive difficulty
  useEffect(() => {
    if (totalAnswered === 0) return;
    const accuracy = correctCount / totalAnswered;
    if (accuracy >= 0.8 && totalAnswered >= 5 && difficulty !== 'expert') {
      const next: Difficulty[] = ['easy', 'medium', 'hard', 'expert'];
      const idx = next.indexOf(difficulty);
      if (idx < next.length - 1) setDifficulty(next[idx + 1]);
    } else if (accuracy < 0.4 && totalAnswered >= 5 && difficulty !== 'easy') {
      const next: Difficulty[] = ['easy', 'medium', 'hard', 'expert'];
      const idx = next.indexOf(difficulty);
      if (idx > 0) setDifficulty(next[idx - 1]);
    }
  }, [totalAnswered, correctCount, difficulty]);

  const handleSubmit = () => {
    if (feedback || !input) return;
    const userAnswer = parseInt(input);
    const responseTime = (Date.now() - questionStartTime) / 1000;
    const isCorrect = userAnswer === answer;

    setFeedback(isCorrect ? 'correct' : 'wrong');
    setTotalAnswered(t => t + 1);

    if (isCorrect) {
      setCorrectCount(c => c + 1);
      setScore(s => s + 10 + Math.floor(timeLeft * 2));
      setStreak(s => {
        const newStreak = s + 1;
        if (newStreak > bestStreak) setBestStreak(newStreak);
        if (newStreak >= 5) setAchievements(prev => new Set(prev).add('streak5'));
        if (newStreak >= 10) setAchievements(prev => new Set(prev).add('combo10'));
        return newStreak;
      });
      if (responseTime < 3) {
        setAchievements(prev => new Set(prev).add('speed3'));
        setSpeedRecord(prev => Math.min(prev, Math.round(responseTime * 10) / 10));
      }
    } else {
      setStreak(0);
    }

    setTimeout(() => {
      if (totalAnswered < TOTAL - 1) {
        generateNew(difficulty);
      } else {
        setStep('complete');
      }
    }, isCorrect ? 600 : 1500);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSubmit();
  };

  const start = () => {
    setStep('play');
    setScore(0);
    setStreak(0);
    setBestStreak(0);
    setTotalAnswered(0);
    setCorrectCount(0);
    setAchievements(new Set());
    setDifficulty('easy');
    setSpeedRecord(99);
  };

  const stars = score >= 200 ? 3 : score >= 130 ? 2 : score >= 60 ? 1 : 0;
  const config = DIFFICULTY_CONFIG[difficulty];

  if (!ready) return <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '360px' }}><div style={{ fontSize: '40px', animation: 'float 1s ease-in-out infinite' }}>⚡</div></div>;

  if (step === 'complete') {
    return (
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: '60px' }}>🏆</div>
        <h2 style={{ fontSize: '22px', fontWeight: '800', color: theme.heading, margin: '8px 0' }}>
          {stars === 3 ? 'Master Perkalian!' : stars === 2 ? 'Hampir Sempurna!' : 'Terus Latihan!'}
        </h2>
        <div style={{ fontSize: '40px' }}>{'⭐'.repeat(stars)}{'☆'.repeat(3 - stars)}</div>
        <div style={{ background: '#f9fafb', borderRadius: '12px', padding: '14px', margin: '12px 0' }}>
          <p style={{ fontWeight: '700', fontSize: '20px', color: '#f59e0b', margin: 0 }}>Skor: {score}</p>
          <p style={{ fontSize: '13px', color: theme.textSecondary }}>Benar: {correctCount}/{totalAnswered} | Streak Terbaik: {bestStreak}</p>
          <p style={{ fontSize: '12px', color: '#8b5cf6' }}>Difficulties: {difficulty}</p>
          {speedRecord < 99 && <p style={{ fontSize: '12px', color: '#10b981' }}>⚡ Tercepat: {speedRecord} detik</p>}
        </div>
        {achievements.size > 0 && (
          <div style={{ display: 'flex', gap: '6px', justifyContent: 'center', flexWrap: 'wrap', marginBottom: '12px' }}>
            {Array.from(achievements).map(a => {
              const ach = ACHIEVEMENTS.find(x => x.id === a);
              return ach ? <span key={a} style={{ background: '#fef3c7', borderRadius: '8px', padding: '4px 8px', fontSize: '12px' }}>{ach.icon} {ach.label}</span> : null;
            })}
          </div>
        )}
        <button onClick={() => onComplete(stars, { score, correctCount, totalAnswered, bestStreak, difficulty, achievements: Array.from(achievements) })}
          style={{ padding: '14px 36px', fontSize: '18px', fontWeight: '700', borderRadius: '999px', border: 'none', background: '#f59e0b', color: '#fff', cursor: 'pointer' }}>🏆 Klaim!</button>
      </div>
    );
  }

  if (step === 'menu') {
    return (
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: '64px', marginBottom: '4px' }}>⚡</div>
        <h2 style={{ fontSize: '24px', fontWeight: '800', color: theme.heading, margin: '0 0 4px' }}>Times Table Hero!</h2>
        <p style={{ color: theme.textSecondary, marginBottom: '12px', fontSize: '14px' }}>Drill Perkalian Adaptif</p>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '14px', maxWidth: '300px', marginLeft: 'auto', marginRight: 'auto' }}>
          {Object.entries(DIFFICULTY_CONFIG).map(([key, d]) => (
            <div key={key} style={{ background: d.bg, borderRadius: '10px', padding: '8px', border: `1px solid ${d.color}40` }}>
              <div style={{ fontSize: '18px' }}>{d.icon}</div>
              <div style={{ fontSize: '11px', fontWeight: '700', color: d.color }}>{d.label} ({d.range[0]}-{d.range[1]})</div>
              <div style={{ fontSize: '10px', color: '#6b7280' }}>⏱ {d.timeLimit}s</div>
            </div>
          ))}
        </div>
        <div style={{ background: '#fffbeb', borderRadius: '10px', padding: '10px', marginBottom: '14px', fontSize: '11px', color: '#92400e', maxWidth: '380px', marginLeft: 'auto', marginRight: 'auto', textAlign: 'left' }}>
          <strong>🎯 20 soal!</strong> Kesulitan naik/turun otomatis.<br/>
          <strong>⚡ Makin cepat = skor makin tinggi!</strong>
        </div>
        <button onClick={start} style={{ padding: '14px 40px', fontSize: '18px', fontWeight: '800', borderRadius: '999px', border: 'none', background: 'linear-gradient(135deg, #f59e0b, #ef4444)', color: '#fff', cursor: 'pointer' }}>⚡ Mulai Drill!</button>
      </div>
    );
  }

  return (
    <div style={{ textAlign: 'center' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px', flexWrap: 'wrap', gap: '4px' }}>
        <div style={{ background: config.bg, borderRadius: '14px', padding: '4px 10px', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px' }}>
          <span>{config.icon}</span>
          <span style={{ fontWeight: '700', color: config.color }}>{config.label}</span>
        </div>
        <div style={{ display: 'flex', gap: '8px', fontSize: '12px', fontWeight: '700' }}>
          <span style={{ color: '#f59e0b' }}>⭐{score}</span>
          {streak >= 3 && <span style={{ color: '#ef4444' }}>🔥{streak}</span>}
        </div>
      </div>

      {/* Progress */}
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#6b7280', marginBottom: '6px' }}>
        <span>Soal {totalAnswered + 1}/{TOTAL}</span>
        <span>Benar: {correctCount}/{totalAnswered || 1} ({Math.round((correctCount / (totalAnswered || 1)) * 100)}%)</span>
      </div>

      {/* Timer Bar */}
      <div style={{ width: '100%', height: '8px', background: '#e5e7eb', borderRadius: '4px', marginBottom: '16px' }}>
        <div style={{
          width: `${(timeLeft / DIFFICULTY_CONFIG[difficulty].timeLimit) * 100}%`,
          height: '100%',
          background: timeLeft > 5 ? '#10b981' : timeLeft > 2 ? '#f59e0b' : '#ef4444',
          borderRadius: '4px',
          transition: 'width 1s linear'
        }} />
      </div>

      {/* Question */}
      <div style={{ background: '#f9fafb', borderRadius: '16px', padding: '24px', marginBottom: '14px', border: '2px solid #e5e7eb' }}>
        <h2 style={{ fontSize: '40px', fontWeight: '900', color: '#1f2937', margin: 0, letterSpacing: '4px' }}>
          {a} × {b} = ?
        </h2>
        <p style={{ fontSize: '18px', color: '#f59e0b', fontWeight: '700', marginTop: '8px' }}>
          ⏱ {timeLeft} detik
        </p>
      </div>

      {/* Input */}
      <div style={{ maxWidth: '280px', margin: '0 auto' }}>
        <input
          type="number"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={feedback !== null}
          autoFocus
          style={{
            width: '100%',
            padding: '16px',
            fontSize: '24px',
            fontWeight: '900',
            textAlign: 'center',
            borderRadius: '14px',
            border: feedback === 'correct' ? '3px solid #10b981' : feedback === 'wrong' ? '3px solid #ef4444' : '2px solid #d1d5db',
            outline: 'none',
            background: feedback === 'correct' ? '#d1fae5' : feedback === 'wrong' ? '#fee2e2' : '#fff',
            color: '#1f2937',
            transition: 'all 0.2s'
          }}
          placeholder="Jawaban..."
        />
        <button
          onClick={handleSubmit}
          disabled={feedback !== null || !input}
          style={{
            marginTop: '10px',
            width: '100%',
            padding: '14px',
            fontSize: '18px',
            fontWeight: '800',
            borderRadius: '14px',
            border: 'none',
            background: feedback ? (feedback === 'correct' ? '#10b981' : '#ef4444') : '#3b82f6',
            color: '#fff',
            cursor: feedback ? 'default' : 'pointer',
            transition: 'all 0.2s'
          }}>
          {feedback ? (feedback === 'correct' ? '🎉 Benar!' : `❌ ${a}×${b}=${answer}`) : '✅ Jawab!'}
        </button>
      </div>

      {/* Achievement popup */}
      {achievements.has('streak5') && streak === 5 && (
        <div style={{ marginTop: '10px', padding: '8px', background: '#fef3c7', borderRadius: '8px', fontSize: '13px', fontWeight: '700', color: '#92400e', animation: 'pop 0.3s ease-out' }}>
          🏆 Achievement: 5x Beruntun!
        </div>
      )}
    </div>
  );
}