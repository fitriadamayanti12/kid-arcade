// app/components/games/kelas3/RodaKali.tsx
// 🎡 Roda Keberuntungan Kali — putar roda untuk memilih 1 tabel perkalian (2-10),
// lalu jawab 5 soal kilat dari tabel itu. Sensasi "putar dulu, baru main" bikin penasaran.
'use client';

import { useRef, useState } from 'react';
import { useThemeStyles } from '@/hooks/useThemeStyles';
import { useSoundEffect } from '@/hooks/useSoundEffect';
import { randInt, numericOptions, shuffleArr } from '../shared/PowerBattle';

interface Props {
  onComplete: (stars: number, extra?: any) => void;
}

const TABLES = [2, 3, 4, 5, 6, 7, 8, 9, 10];
const SEG = 360 / TABLES.length;
const COLORS = ['#f87171', '#fb923c', '#fbbf24', '#a3e635', '#34d399', '#22d3ee', '#60a5fa', '#a78bfa', '#f472b6'];
const TOTAL_Q = 5;

function makeQuestion(table: number) {
  const b = randInt(2, 10);
  const answer = table * b;
  return { prompt: `${table} × ${b} = ?`, answer, options: shuffleArr(numericOptions(answer, 15, 4)) };
}

export default function RodaKali({ onComplete }: Props) {
  const theme = useThemeStyles();
  const { playSound } = useSoundEffect();

  const [phase, setPhase] = useState<'wheel' | 'quiz' | 'done'>('wheel');
  const [rotation, setRotation] = useState(0);
  const [spinning, setSpinning] = useState(false);
  const [table, setTable] = useState<number | null>(null);
  const [round, setRound] = useState(0);
  const [question, setQuestion] = useState<ReturnType<typeof makeQuestion> | null>(null);
  const [correct, setCorrect] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);

  const finishedRef = useRef(false);

  const spin = () => {
    if (spinning) return;
    setSpinning(true);
    playSound('click');
    const targetIdx = randInt(0, TABLES.length - 1);
    const jitter = randInt(-14, 14);
    const targetAngle = targetIdx * SEG + SEG / 2 + jitter;
    const spins = 5;
    const finalRotation = rotation + spins * 360 + ((targetAngle - (rotation % 360)) + 360) % 360;
    setRotation(finalRotation);
    setTimeout(() => {
      setSpinning(false);
      setTable(TABLES[targetIdx]);
      playSound('win');
    }, 2200);
  };

  const startQuiz = () => {
    if (!table) return;
    setRound(0);
    setCorrect(0);
    setQuestion(makeQuestion(table));
    setSelected(null);
    setIsCorrect(null);
    setPhase('quiz');
  };

  const finish = (finalCorrect: number) => {
    if (finishedRef.current) return;
    finishedRef.current = true;
    const stars = finalCorrect >= 5 ? 3 : finalCorrect >= 3 ? 2 : 1;
    setPhase('done');
    playSound(stars === 3 ? 'win' : 'reward');
    setTimeout(() => onComplete(stars, { score: finalCorrect, streak: finalCorrect, total: TOTAL_Q }), 1200);
  };

  const answer = (opt: number) => {
    if (selected !== null || !question || !table) return;
    setSelected(opt);
    const ok = opt === question.answer;
    setIsCorrect(ok);
    playSound(ok ? 'correct' : 'wrong');
    const newCorrect = ok ? correct + 1 : correct;
    if (ok) setCorrect(newCorrect);

    setTimeout(() => {
      if (round >= TOTAL_Q - 1) {
        finish(newCorrect);
      } else {
        setRound((r) => r + 1);
        setQuestion(makeQuestion(table));
        setSelected(null);
        setIsCorrect(null);
      }
    }, 700);
  };

  const card = { background: theme.bgCard, border: `1px solid ${theme.border}`, borderRadius: '18px', boxShadow: theme.shadow } as const;

  if (phase === 'wheel') {
    return (
      <div style={{ maxWidth: '380px', margin: '0 auto', textAlign: 'center' }}>
        <h3 style={{ fontWeight: 900, color: theme.heading, fontSize: '16px', marginBottom: '12px' }}>🎡 Roda Keberuntungan Kali</h3>
        <div style={{ position: 'relative', width: '260px', height: '260px', margin: '0 auto 16px' }}>
          <div
            style={{
              width: '100%',
              height: '100%',
              borderRadius: '50%',
              background: `conic-gradient(${TABLES.map((_, i) => `${COLORS[i]} ${i * SEG}deg ${(i + 1) * SEG}deg`).join(', ')})`,
              border: `4px solid ${theme.border}`,
              position: 'relative',
            }}
          >
            {TABLES.map((t, i) => {
              const angle = i * SEG + SEG / 2;
              const rad = (angle * Math.PI) / 180;
              const r = 92;
              const x = 130 + r * Math.sin(rad) - 14;
              const y = 130 - r * Math.cos(rad) - 11;
              return (
                <span
                  key={t}
                  style={{
                    position: 'absolute',
                    left: `${x}px`,
                    top: `${y}px`,
                    width: '28px',
                    textAlign: 'center',
                    whiteSpace: 'nowrap',
                    fontWeight: 900,
                    color: '#fff',
                    fontSize: '17px',
                    textShadow: '0 1px 3px rgba(0,0,0,0.4)',
                  }}
                >
                  {t}
                </span>
              );
            })}
          </div>
          {/* jarum berputar dari tengah — titik putarnya di ujung bawah (pusat roda), memanjang ke atas */}
          <div
            style={{
              position: 'absolute',
              left: '50%',
              top: '50%',
              width: '6px',
              height: '110px',
              background: theme.heading,
              borderRadius: '3px',
              transformOrigin: '50% 100%',
              transform: `translate(-50%, -100%) rotate(${rotation}deg)`,
              transition: spinning ? 'transform 2.2s cubic-bezier(0.17, 0.67, 0.16, 0.99)' : undefined,
            }}
          />
          <div style={{ position: 'absolute', left: '50%', top: '50%', width: '18px', height: '18px', borderRadius: '50%', background: theme.heading, transform: 'translate(-50%, -50%)' }} />
        </div>

        {!table ? (
          <button onClick={spin} disabled={spinning} style={{ padding: '14px 28px', borderRadius: '14px', border: 'none', background: '#8b5cf6', color: '#fff', fontWeight: 800, fontSize: '16px', cursor: spinning ? 'default' : 'pointer', opacity: spinning ? 0.7 : 1 }}>
            {spinning ? 'Berputar...' : '🎡 Putar!'}
          </button>
        ) : (
          <div style={{ ...card, padding: '16px' }}>
            <p style={{ fontWeight: 900, fontSize: '18px', color: theme.heading, margin: '0 0 10px' }}>Terpilih: Tabel {table}! 🎉</p>
            <button onClick={startQuiz} style={{ width: '100%', padding: '12px', borderRadius: '12px', border: 'none', background: '#8b5cf6', color: '#fff', fontWeight: 800, fontSize: '15px', cursor: 'pointer' }}>
              ▶ Main {TOTAL_Q} Soal Tabel {table}
            </button>
          </div>
        )}
      </div>
    );
  }

  if (phase === 'quiz' && question) {
    return (
      <div style={{ maxWidth: '380px', margin: '0 auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
          <span style={{ fontWeight: 800, color: theme.heading, fontSize: '13px' }}>🎡 Tabel {table}</span>
          <span style={{ fontWeight: 800, color: '#8b5cf6', fontSize: '13px' }}>Soal {round + 1}/{TOTAL_Q}</span>
        </div>
        <div style={{ ...card, textAlign: 'center', padding: '22px 16px', marginBottom: '14px' }}>
          <h3 style={{ fontSize: '26px', fontWeight: 900, color: theme.heading, margin: 0 }}>{question.prompt}</h3>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
          {question.options.map((opt, i) => {
            const isSelectedOpt = selected === opt;
            return (
              <button
                key={i}
                onClick={() => answer(opt)}
                disabled={selected !== null}
                style={{
                  padding: '16px',
                  fontSize: '20px',
                  fontWeight: 800,
                  borderRadius: '14px',
                  border: 'none',
                  background: isSelectedOpt ? (isCorrect ? '#10b981' : '#ef4444') : theme.bgHover,
                  color: isSelectedOpt ? '#fff' : theme.text,
                  cursor: selected !== null ? 'default' : 'pointer',
                }}
              >
                {opt}
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '380px', margin: '0 auto', textAlign: 'center' }}>
      <div style={{ ...card, padding: '28px 18px' }}>
        <div style={{ fontSize: '44px' }}>🎉</div>
        <h2 style={{ fontSize: '20px', fontWeight: 900, color: theme.heading, margin: '4px 0' }}>Selesai!</h2>
        <p style={{ fontSize: '15px', color: theme.text }}>{correct} dari {TOTAL_Q} benar di Tabel {table}</p>
      </div>
    </div>
  );
}
