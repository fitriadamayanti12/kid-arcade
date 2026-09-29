// app/components/games/PuzzleGame.tsx
// 🧩 Puzzle Angka — jawab soal berhitung untuk membuka kepingan puzzle 3×3 satu per satu
// sampai gambarnya utuh. (Sebelumnya file ini isinya kuis pecahan — sudah diganti jadi
// puzzle susunan gambar yang sesuai dengan nama & level Kelas 1.)
'use client';

import { useMemo, useState } from 'react';
import { useThemeStyles } from '@/hooks/useThemeStyles';
import { useSoundEffect } from '@/hooks/useSoundEffect';
import { randInt, shuffleArr, numericOptions } from './shared/PowerBattle';

interface Props {
  onComplete: (stars: number, extra?: any) => void;
}

const THEMES: { name: string; pieces: string[] }[] = [
  { name: 'Kebun Bunga', pieces: ['🌸', '🌻', '🌼', '🌷', '🌹', '🦋', '🐝', '🍃', '🌿'] },
  { name: 'Dunia Laut', pieces: ['🐠', '🐟', '🐡', '🦀', '🐙', '🐚', '🌊', '🦑', '🐬'] },
  { name: 'Luar Angkasa', pieces: ['🚀', '🌟', '⭐', '🪐', '🌙', '☄️', '👽', '🛸', '🌌'] },
  { name: 'Kebun Binatang', pieces: ['🦁', '🐯', '🐻', '🐼', '🐨', '🦒', '🐘', '🦓', '🐵'] },
];

interface Question {
  prompt: string;
  answer: number;
  options: number[];
}

function makeQuestion(): Question {
  if (Math.random() > 0.5) {
    const a = randInt(5, 18);
    const b = randInt(1, a - 1);
    return { prompt: `${a} − ${b} = ?`, answer: a - b, options: shuffleArr(numericOptions(a - b, 4)) };
  }
  const a = randInt(2, 15);
  const b = randInt(1, Math.max(1, 18 - a));
  return { prompt: `${a} + ${b} = ?`, answer: a + b, options: shuffleArr(numericOptions(a + b, 4)) };
}

const TOTAL = 9;

export default function PuzzleGame({ onComplete }: Props) {
  const theme = useThemeStyles();
  const { playSound } = useSoundEffect();

  const themeData = useMemo(() => THEMES[randInt(0, THEMES.length - 1)], []);
  const [revealed, setRevealed] = useState<boolean[]>(() => Array(TOTAL).fill(false));
  const [step, setStep] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [question, setQuestion] = useState<Question>(() => makeQuestion());
  const [selected, setSelected] = useState<number | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [done, setDone] = useState(false);
  const [finalStars, setFinalStars] = useState(0);

  const handleAnswer = (opt: number) => {
    if (selected !== null) return;
    setSelected(opt);
    const ok = opt === question.answer;
    setIsCorrect(ok);
    playSound(ok ? 'correct' : 'wrong');
    const newCorrect = ok ? correctCount + 1 : correctCount;
    setCorrectCount(newCorrect);

    setTimeout(() => {
      // Kepingan tetap terbuka meski salah, supaya gambarnya selalu selesai & anak tidak macet —
      // bintang di akhir tetap mencerminkan berapa yang benar.
      setRevealed((r) => {
        const next = [...r];
        next[step] = true;
        return next;
      });

      if (step >= TOTAL - 1) {
        const stars = newCorrect >= 8 ? 3 : newCorrect >= 6 ? 2 : 1;
        setFinalStars(stars);
        setDone(true);
        playSound(stars === 3 ? 'win' : 'reward');
        setTimeout(() => onComplete(stars, { score: newCorrect, total: TOTAL }), 1300);
      } else {
        setStep((s) => s + 1);
        setQuestion(makeQuestion());
        setSelected(null);
        setIsCorrect(null);
      }
    }, 1000);
  };

  const card = {
    background: theme.bgCard,
    border: `1px solid ${theme.border}`,
    borderRadius: '18px',
    boxShadow: theme.shadow,
  } as const;

  return (
    <div style={{ maxWidth: '480px', margin: '0 auto', padding: '4px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
        <span style={{ fontWeight: 800, color: theme.heading, fontSize: '14px' }}>🧩 Puzzle {themeData.name}</span>
        <span style={{ fontWeight: 800, color: '#f97316', fontSize: '13px' }}>Kepingan {Math.min(step + 1, TOTAL)}/{TOTAL}</span>
      </div>

      {/* papan puzzle 3x3 — terisi sedikit demi sedikit */}
      <div
        style={{
          ...card,
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '6px',
          padding: '10px',
          marginBottom: '14px',
        }}
      >
        {Array.from({ length: TOTAL }, (_, i) => (
          <div
            key={i}
            style={{
              aspectRatio: '1',
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '30px',
              background: revealed[i] ? '#fff7ed' : theme.bgHover,
              border: i === step && !done ? '2px solid #f97316' : `1px solid ${theme.border}`,
              transition: 'background 0.3s',
              animation: revealed[i] ? 'pop 0.4s ease-out' : undefined,
            }}
          >
            {revealed[i] ? themeData.pieces[i] : '🧩'}
          </div>
        ))}
      </div>

      {!done ? (
        <>
          <div style={{ ...card, textAlign: 'center', padding: '20px 16px', marginBottom: '14px' }}>
            <h3 style={{ fontSize: '26px', fontWeight: 900, color: theme.heading, margin: 0 }}>{question.prompt}</h3>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', maxWidth: '320px', margin: '0 auto' }}>
            {question.options.map((opt, i) => {
              const isSelectedOpt = selected === opt;
              return (
                <button
                  key={i}
                  onClick={() => handleAnswer(opt)}
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

          {selected !== null && (
            <div
              style={{
                marginTop: '12px',
                textAlign: 'center',
                padding: '10px',
                borderRadius: '10px',
                background: isCorrect ? '#d1fae5' : '#fee2e2',
                color: isCorrect ? '#065f46' : '#991b1b',
                fontWeight: 700,
                fontSize: '15px',
              }}
            >
              {isCorrect ? '🎉 Benar! Kepingan terbuka!' : `❌ Jawaban: ${question.answer} — kepingan tetap dibuka ya`}
            </div>
          )}
        </>
      ) : (
        <div style={{ ...card, textAlign: 'center', padding: '26px 16px' }}>
          <div style={{ fontSize: '46px', marginBottom: '6px', animation: 'float 2s ease-in-out infinite' }}>🎉</div>
          <h3 style={{ fontSize: '20px', fontWeight: 900, color: theme.heading, margin: '0 0 4px' }}>Puzzle Selesai!</h3>
          <p style={{ fontSize: '14px', color: theme.textSecondary, margin: '0 0 8px' }}>
            Benar {correctCount} dari {TOTAL} soal
          </p>
          <div style={{ fontSize: '32px' }}>{'⭐'.repeat(finalStars)}{'☆'.repeat(3 - finalStars)}</div>
        </div>
      )}

      <style>{`
        @keyframes pop { 0%{transform:scale(0.7);opacity:0} 80%{transform:scale(1.08)} 100%{transform:scale(1);opacity:1} }
        @keyframes float { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-8px)} }
      `}</style>
    </div>
  );
}
