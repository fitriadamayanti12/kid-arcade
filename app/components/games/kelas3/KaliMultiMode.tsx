// app/components/games/kelas3/KaliMultiMode.tsx
'use client';

import { useState, useEffect } from 'react';
import { useThemeStyles } from '@/hooks/useThemeStyles';

interface Props {
  onComplete: (stars: number, extra?: any) => void;
  allowedModes?: string[];
}

type GameMode = 'array' | 'skip-counting' | 'equal-groups' | 'number-line' | 'word-problems';

const MODE_CONFIG: Record<GameMode, { icon: string; label: string; desc: string; color: string; bg: string }> = {
  'array': { icon: '🔲', label: 'Baris & Kolom', desc: 'Visual grid ⭐', color: '#3b82f6', bg: '#eff6ff' },
  'skip-counting': { icon: '🦘', label: 'Lompat Bilangan', desc: '2,4,6,8...', color: '#8b5cf6', bg: '#f5f3ff' },
  'equal-groups': { icon: '🧺', label: 'Kelompok Sama', desc: '4 keranjang × 3 apel', color: '#10b981', bg: '#ecfdf5' },
  'number-line': { icon: '📏', label: 'Garis Bilangan', desc: 'Lompatan di garis', color: '#f59e0b', bg: '#fffbeb' },
  'word-problems': { icon: '📖', label: 'Cerita Soal', desc: 'Soal kehidupan nyata', color: '#ef4444', bg: '#fef2f2' }
};

const TOTAL_QUESTIONS = 15;
const QUESTIONS_PER_MODE = 3;

const generateQuestion = (mode: GameMode) => {
  const a = Math.floor(Math.random() * 4) + 2;
  const b = Math.floor(Math.random() * 9) + 1;
  const answer = a * b;

  const wrongs = new Set<number>();
  while (wrongs.size < 3) {
    const offset = (Math.floor(Math.random() * 3) + 1) * a;
    const w = Math.random() > 0.5 ? answer + offset : answer - offset;
    if (w > 0 && w <= 50 && w !== answer) wrongs.add(w);
  }

  const base = { a, b, answer, opts: [...wrongs, answer].sort(() => Math.random() - 0.5) };

  switch (mode) {
    case 'word-problems':
      return {
        ...base,
        stories: [
          `Ibu punya ${a} piring. Setiap piring berisi ${b} kue. Berapa total kue?`,
          `Ada ${a} baris kursi. Setiap baris ada ${b} kursi. Berapa total kursi?`,
          `${a} anak masing-masing membawa ${b} permen. Berapa total permen?`,
          `Di kebun ada ${a} pot bunga. Setiap pot ada ${b} bunga. Berapa total bunga?`,
        ][Math.floor(Math.random() * 4)],
        hint: `${a} × ${b} = ?`
      };
    case 'skip-counting':
      return { ...base, sequence: Array.from({ length: b }, (_, i) => a * (i + 1)) };
    case 'number-line':
      return { ...base, maxLine: answer + a * 3, jumps: b, stepSize: a };
    default:
      return base;
  }
};

export default function KaliMultiMode({ onComplete, allowedModes }: Props) {
  const theme = useThemeStyles();
  const [ready, setReady] = useState(false);
  const [step, setStep] = useState<'menu' | 'play' | 'complete'>('menu');
  const [currentMode, setCurrentMode] = useState<GameMode>('array');
  const [modesCompleted, setModesCompleted] = useState<Set<string>>(new Set());
  const [question, setQuestion] = useState<any>(null);
  const [selected, setSelected] = useState<number | null>(null);
  const [isCorrect, setIsCorrect] = useState(false);
  const [score, setScore] = useState(0);
  const [total, setTotal] = useState(0);
  const [streak, setStreak] = useState(0);
  const [questionNumber, setQuestionNumber] = useState(0);
  const [showHint, setShowHint] = useState(false);
  const [skipCountRevealed, setSkipCountRevealed] = useState<number[]>([]);
  const [numberLineJumps, setNumberLineJumps] = useState(0);

  const availableModes = (allowedModes || Object.keys(MODE_CONFIG)) as GameMode[];

  useEffect(() => { const t = setTimeout(() => setReady(true), 200); return () => clearTimeout(t); }, []);

  // Generate question whenever questionNumber changes
  useEffect(() => {
    if (step !== 'play' || questionNumber >= TOTAL_QUESTIONS) return;
    const modeIndex = Math.floor(questionNumber / QUESTIONS_PER_MODE);
    const modes = availableModes as GameMode[];
    const mode = modes[modeIndex % modes.length];
    setCurrentMode(mode);
    const q = generateQuestion(mode);
    setQuestion(q);
    setSelected(null);
    setShowHint(false);
    setSkipCountRevealed([]);
    setNumberLineJumps(0);
  }, [questionNumber, step]); // eslint-disable-line

  const startGame = () => {
    setStep('play');
    setScore(0);
    setTotal(0);
    setStreak(0);
    setQuestionNumber(0);
    setModesCompleted(new Set());
  };

  const handleAnswer = (ans: number) => {
    if (selected !== null || !question) return;
    setSelected(ans);
    const ok = ans === question.answer;
    setIsCorrect(ok);
    setTotal(t => t + 1);
    if (ok) {
      setScore(s => s + 1);
      setStreak(s => s + 1);
      if (streak + 1 >= 3) setModesCompleted(prev => new Set(prev).add(currentMode));
    } else {
      setStreak(0);
    }
    setTimeout(() => {
      if (questionNumber < TOTAL_QUESTIONS - 1) {
        setQuestionNumber(q => q + 1);
      } else {
        setStep('complete');
      }
    }, ok ? 800 : 1500);
  };

  const revealNextSkip = () => {
    if (question && skipCountRevealed.length < question.sequence.length) {
      setSkipCountRevealed(prev => [...prev, question.sequence[prev.length]]);
    }
  };

  const addJump = () => {
    if (question && numberLineJumps < question.jumps) {
      setNumberLineJumps(j => j + 1);
      if (numberLineJumps + 1 === question.jumps) setShowHint(true);
    }
  };

  const stars = score >= 13 ? 3 : score >= 10 ? 2 : score >= 7 ? 1 : 0;

  // ============ LOADING ============
  if (!ready) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '360px' }}>
        <div style={{ fontSize: '40px', animation: 'float 1s ease-in-out infinite' }}>🎮</div>
      </div>
    );
  }

  // ============ COMPLETE ============
  if (step === 'complete') {
    return (
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: '60px' }}>🏆</div>
        <h2 style={{ fontSize: '22px', fontWeight: '800', color: theme.heading, margin: '8px 0' }}>
          {stars === 3 ? 'Jago Perkalian!' : stars === 2 ? 'Hampir Sempurna!' : 'Terus Berlatih!'}
        </h2>
        <div style={{ fontSize: '40px' }}>{'⭐'.repeat(stars)}{'☆'.repeat(3 - stars)}</div>
        <div style={{ background: '#f9fafb', borderRadius: '12px', padding: '14px', margin: '12px 0', fontSize: '14px' }}>
          <p style={{ fontWeight: '700', fontSize: '20px', color: '#f59e0b', margin: 0 }}>{score}/{total}</p>
          <p style={{ color: theme.textSecondary, margin: '4px 0 0' }}>Mode: {modesCompleted.size}/{availableModes.length}</p>
        </div>
        <button onClick={() => onComplete(stars, { score, total, modesCompleted: Array.from(modesCompleted), streak })}
          style={{ padding: '14px 36px', fontSize: '18px', fontWeight: '700', borderRadius: '999px', border: 'none', background: '#f59e0b', color: '#fff', cursor: 'pointer' }}>
          🏆 Klaim!
        </button>
      </div>
    );
  }

  // ============ MENU ============
  if (step === 'menu') {
    return (
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: '64px', marginBottom: '4px' }}>🌟</div>
        <h2 style={{ fontSize: '24px', fontWeight: '800', color: theme.heading, margin: '0 0 4px' }}>Petualangan Perkalian!</h2>
        <p style={{ color: theme.textSecondary, marginBottom: '16px', fontSize: '14px' }}>5 mode belajar dalam 1 game! 🎮</p>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px', marginBottom: '20px', maxWidth: '360px', marginLeft: 'auto', marginRight: 'auto' }}>
          {Object.entries(MODE_CONFIG).slice(0, 5).map(([key, mode]) => (
            <div key={key} style={{ 
              background: mode.bg, 
              borderRadius: '14px', 
              padding: '14px 8px', 
              textAlign: 'center', 
              border: `2px solid ${mode.color}40`,
              transition: 'transform 0.2s',
            }}>
              <div style={{ fontSize: '36px', marginBottom: '4px' }}>{mode.icon}</div>
              <div style={{ fontSize: '13px', fontWeight: '700', color: mode.color }}>{mode.label}</div>
            </div>
          ))}
        </div>
        <button onClick={startGame}
          style={{ padding: '14px 40px', fontSize: '18px', fontWeight: '800', borderRadius: '999px', border: 'none', background: 'linear-gradient(135deg, #f59e0b, #ef4444)', color: '#fff', cursor: 'pointer', boxShadow: '0 4px 15px rgba(245,158,11,0.4)' }}>
          🚀 Mulai!
        </button>
      </div>
    );
  }

  // ============ PLAY ============
  if (!question) return null;
  const modeConfig = MODE_CONFIG[currentMode];

  return (
    <div style={{ textAlign: 'center' }}>
      {/* Header bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px', flexWrap: 'wrap', gap: '6px' }}>
        <div style={{ background: modeConfig.bg, borderRadius: '16px', padding: '5px 12px', display: 'flex', alignItems: 'center', gap: '5px', fontSize: '13px' }}>
          <span style={{ fontSize: '18px' }}>{modeConfig.icon}</span>
          <span style={{ fontWeight: '700', color: modeConfig.color }}>{modeConfig.label}</span>
        </div>
        <div style={{ display: 'flex', gap: '10px', fontSize: '13px', fontWeight: '700' }}>
          <span style={{ color: theme.textSecondary }}>{questionNumber + 1}/{TOTAL_QUESTIONS}</span>
          <span style={{ color: '#f59e0b' }}>⭐{score}</span>
          {streak >= 3 && <span style={{ color: '#ef4444' }}>🔥{streak}</span>}
        </div>
      </div>

      {/* Mode progress dots */}
      <div style={{ display: 'flex', gap: '3px', marginBottom: '14px' }}>
        {availableModes.map(mode => (
          <div key={mode} style={{
            flex: 1, height: '5px', borderRadius: '3px',
            background: modesCompleted.has(mode) ? MODE_CONFIG[mode].color : '#e5e7eb',
            transition: 'background 0.3s'
          }} />
        ))}
      </div>

      {/* Question card */}
      <div style={{ 
        background: '#f9fafb', 
        borderRadius: '16px', 
        padding: '20px 16px', 
        marginBottom: '14px', 
        border: `2px solid ${modeConfig.color}20`,
        minHeight: '160px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
        {renderQuestionByMode(currentMode, question, { skipCountRevealed, revealNextSkip, numberLineJumps, addJump, showHint, setShowHint })}
      </div>

      {/* Answer grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', maxWidth: '280px', margin: '0 auto' }}>
        {question.opts.map((opt: number, i: number) => {
          const isSelected = selected === opt;
          const isCorrectAnswer = opt === question.answer;
          const bg = isSelected ? (isCorrect ? '#10b981' : '#ef4444') : (selected !== null && isCorrectAnswer ? '#10b981' : '#e5e7eb');
          const color = (isSelected || (selected !== null && isCorrectAnswer)) ? '#fff' : '#1f2937';
          return (
            <button key={i} onClick={() => handleAnswer(opt)} disabled={selected !== null}
              style={{ 
                padding: '16px', 
                fontSize: '22px', 
                fontWeight: '900', 
                borderRadius: '14px', 
                border: 'none', 
                background: bg, 
                color, 
                cursor: selected !== null ? 'default' : 'pointer', 
                transition: 'all 0.2s' 
              }}>
              {opt}
            </button>
          );
        })}
      </div>

      {/* Feedback */}
      {selected !== null && (
        <div style={{ 
          marginTop: '12px', 
          padding: '12px', 
          borderRadius: '12px', 
          background: isCorrect ? '#d1fae5' : '#fee2e2', 
          color: isCorrect ? '#065f46' : '#991b1b', 
          fontWeight: '700', 
          fontSize: '15px', 
          animation: 'pop 0.3s ease-out' 
        }}>
          {isCorrect ? `🎉 ${question.a}×${question.b}=${question.answer}` : `❌ ${question.a}×${question.b}=${question.answer}`}
        </div>
      )}
    </div>
  );
}

// ============================================
// RENDER QUESTION BY MODE
// ============================================
function renderQuestionByMode(mode: GameMode, q: any, state: any) {
  switch (mode) {
    case 'array': return renderArray(q);
    case 'skip-counting': return renderSkip(q, state);
    case 'equal-groups': return renderGroups(q);
    case 'number-line': return renderNumberLine(q, state);
    case 'word-problems': return renderWord(q, state);
    default: return null;
  }
}

function renderArray(q: any) {
  return (
    <>
      <p style={{ fontSize: '13px', color: '#6b7280', marginBottom: '10px' }}>🔲 Lihat grid baris × kolom</p>
      <div style={{ marginBottom: '12px' }}>
        {Array.from({ length: Math.min(q.a, 5) }).map((_, i) => (
          <div key={i} style={{ display: 'flex', justifyContent: 'center', gap: '5px', marginBottom: '4px' }}>
            {Array.from({ length: Math.min(q.b, 8) }).map((_, j) => (
              <span key={j} style={{ fontSize: '26px' }}>⭐</span>
            ))}
          </div>
        ))}
        {q.a > 5 && <p style={{ fontSize: '12px', color: '#9ca3af', margin: 0 }}>+{q.a - 5} baris lagi</p>}
      </div>
      <h3 style={{ fontSize: '28px', fontWeight: '900', color: '#1f2937', margin: 0 }}>{q.a} × {q.b} = ?</h3>
    </>
  );
}

function renderSkip(q: any, state: any) {
  return (
    <>
      <p style={{ fontSize: '13px', color: '#6b7280', marginBottom: '8px' }}>🦘 Ketuk kotak untuk lompat!</p>
      <div style={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: '6px', marginBottom: '10px' }}>
        {q.sequence.map((num: number, i: number) => (
          <div key={i} onClick={() => { if (i === state.skipCountRevealed.length) state.revealNextSkip(); }}
            style={{
              width: '46px', height: '46px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: i < state.skipCountRevealed.length ? (i === q.sequence.length - 1 ? '#fbbf24' : '#8b5cf6') : '#e5e7eb',
              color: i < state.skipCountRevealed.length ? '#fff' : '#9ca3af', fontWeight: '900', fontSize: '16px',
              cursor: i === state.skipCountRevealed.length ? 'pointer' : 'default',
              border: i === state.skipCountRevealed.length ? '2px dashed #8b5cf6' : 'none', transition: 'all 0.3s',
            }}>
            {i < state.skipCountRevealed.length ? num : '?'}
          </div>
        ))}
      </div>
      <div style={{ fontSize: '20px', fontWeight: '700' }}>
        {q.a} × {q.b} = {state.skipCountRevealed.length === q.sequence.length ? q.sequence[q.sequence.length - 1] : '?'}
      </div>
    </>
  );
}

function renderGroups(q: any) {
  const foodEmojis = ['🍎', '🍪', '🍕', '🍩', '🧁', '🍭'];
  const containerEmojis = ['🧺', '🎒', '📦', '🛍️'];
  const emoji = foodEmojis[Math.floor(Math.random() * foodEmojis.length)];
  const container = containerEmojis[Math.floor(Math.random() * containerEmojis.length)];
  return (
    <>
      <p style={{ fontSize: '13px', color: '#6b7280', marginBottom: '8px' }}>{container} Kelompok sama banyak</p>
      <div style={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: '8px', marginBottom: '10px' }}>
        {Array.from({ length: Math.min(q.a, 5) }).map((_, i) => (
          <div key={i} style={{ background: '#f3f4f6', borderRadius: '10px', padding: '8px', textAlign: 'center', fontSize: '12px' }}>
            <div style={{ fontSize: '20px' }}>{container}</div>
            <div style={{ fontSize: '16px' }}>{Array.from({ length: Math.min(q.b, 6) }).map((_, j) => <span key={j}>{emoji}</span>)}</div>
          </div>
        ))}
        {q.a > 5 && <span style={{ fontSize: '12px', color: '#9ca3af', alignSelf: 'center' }}>+{q.a - 5} lagi</span>}
      </div>
      <h3 style={{ fontSize: '24px', fontWeight: '900', color: '#1f2937', margin: 0 }}>{q.a} {container} × {q.b} = ?</h3>
    </>
  );
}

function renderNumberLine(q: any, state: any) {
  const end = q.answer + q.stepSize * 2;
  return (
    <>
      <p style={{ fontSize: '13px', color: '#6b7280', marginBottom: '8px' }}>📏 Garis bilangan interaktif</p>
      <div style={{ position: 'relative', padding: '28px 10px 10px', marginBottom: '8px', width: '100%', maxWidth: '320px' }}>
        <div style={{ position: 'relative', height: '4px', background: '#e5e7eb', borderRadius: '2px' }}>
          {Array.from({ length: Math.floor(end / q.stepSize) + 1 }).map((_, i) => {
            const value = i * q.stepSize;
            const position = (value / end) * 100;
            return (
              <div key={i} style={{ position: 'absolute', left: `${position}%`, top: '50%', transform: 'translate(-50%, -50%)' }}>
                <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: value === q.answer ? '#fbbf24' : '#d1d5db' }} />
                <div style={{ position: 'absolute', top: '12px', left: '50%', transform: 'translateX(-50%)', fontSize: '10px', fontWeight: '700', color: '#6b7280' }}>{value}</div>
              </div>
            );
          })}
        </div>
        {state.numberLineJumps < q.jumps && (
          <button onClick={state.addJump}
            style={{ marginTop: '22px', padding: '8px 16px', fontSize: '13px', fontWeight: '700', borderRadius: '10px', border: 'none', background: '#8b5cf6', color: '#fff', cursor: 'pointer' }}>
            🦘 Lompat +{q.stepSize} ({state.numberLineJumps + 1}/{q.jumps})
          </button>
        )}
      </div>
      <div style={{ fontSize: '20px', fontWeight: '700' }}>{q.a} × {q.b} = {state.numberLineJumps === q.jumps ? q.answer : '?'}</div>
    </>
  );
}

function renderWord(q: any, state: any) {
  return (
    <>
      <p style={{ fontSize: '13px', color: '#6b7280', marginBottom: '8px' }}>📖 Baca ceritanya!</p>
      <div style={{ background: '#fffbeb', borderRadius: '12px', padding: '14px', marginBottom: '10px', border: '1px solid #fbbf2420', maxWidth: '320px' }}>
        <p style={{ fontSize: '15px', fontWeight: '600', color: '#1f2937', lineHeight: '1.6', margin: 0 }}>{q.stories}</p>
      </div>
      {state.showHint && (
        <div style={{ background: '#fef3c7', borderRadius: '8px', padding: '6px 12px', marginBottom: '8px', fontSize: '13px', fontWeight: '600', color: '#92400e' }}>
          💡 {q.hint}
        </div>
      )}
      <button onClick={() => state.setShowHint(!state.showHint)}
        style={{ fontSize: '12px', padding: '5px 14px', borderRadius: '12px', border: '1px solid #fbbf24', background: 'transparent', color: '#92400e', cursor: 'pointer', fontWeight: '600' }}>
        {state.showHint ? 'Sembunyikan' : 'Butuh petunjuk?'}
      </button>
    </>
  );
}