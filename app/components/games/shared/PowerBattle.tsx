// app/components/games/shared/PowerBattle.tsx
// 🔋 Mesin game bersama untuk semua "Game Super" per tingkat.
// Satu mesin, dipakai ulang di 8 game andalan (PAUD s/d Kelas 6), supaya:
// - Mekanik nyawa, combo, power-up 50:50, dan ronde bos konsisten & teruji di satu tempat
// - Tiap file game tingkat tinggal fokus mendefinisikan SOAL-nya saja
'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useSoundEffect } from '@/hooks/useSoundEffect';
import { useThemeStyles } from '@/hooks/useThemeStyles';

export interface PowerQuestion {
  prompt: string;
  /** opsional: baris emoji besar di atas soal (cocok untuk PAUD/TK) */
  visual?: string;
  answer: number | string;
  options: (number | string)[];
  /** opsional: petunjuk strategi yang muncul SETELAH anak menjawab */
  hint?: string;
}

// ---- helper kecil dipakai bersama oleh semua game "Super" ----
export function randInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/** Fisher-Yates shuffle — lebih adil dari sort(() => Math.random() - 0.5) */
export function shuffleArr<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/** Bikin 4 opsi angka (1 jawaban benar + pengecoh unik di sekitar jawaban) */
export function numericOptions(answer: number, spread: number, count = 4): number[] {
  const opts = new Set<number>([answer]);
  let guard = 0;
  while (opts.size < count && guard < 50) {
    guard++;
    const delta = randInt(1, spread) * (Math.random() > 0.5 ? 1 : -1);
    const val = answer + delta;
    if (val >= 0 && val !== answer) opts.add(val);
  }
  return shuffleArr(Array.from(opts));
}

interface PowerBattleProps {
  title: string;
  emoji: string;
  themeColor: string;
  totalRounds?: number;
  lives?: number;
  generateQuestion: (round: number, tier: 1 | 2 | 3) => PowerQuestion;
  onComplete: (stars: number, extra?: any) => void;
}

export default function PowerBattle({
  title,
  emoji,
  themeColor,
  totalRounds = 10,
  lives: startingLives = 3,
  generateQuestion,
  onComplete,
}: PowerBattleProps) {
  const theme = useThemeStyles();
  const { playSound } = useSoundEffect();

  const [round, setRound] = useState(0);
  const [lives, setLives] = useState(startingLives);
  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(0);
  const [bestCombo, setBestCombo] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [question, setQuestion] = useState<PowerQuestion | null>(null);
  const [hiddenOptions, setHiddenOptions] = useState<(number | string)[]>([]);
  const [fiftyUsed, setFiftyUsed] = useState(false);
  const [selected, setSelected] = useState<number | string | null>(null);
  const [isCorrect, setIsCorrect] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [isBossResult, setIsBossResult] = useState(false);

  const finishedRef = useRef(false);
  const lastPromptRef = useRef<string>('');
  const isBoss = round === totalRounds - 1;

  const tierFor = (r: number): 1 | 2 | 3 => {
    const third = Math.ceil(totalRounds / 3);
    if (r < third) return 1;
    if (r < third * 2) return 2;
    return 3;
  };

  // Generate soal baru setiap ganti ronde, dengan anti-duplikat
  useEffect(() => {
    if (gameOver) return;
    let newQ = generateQuestion(round, tierFor(round));
    let guard = 0;
    // Kalau prompt sama dengan soal sebelumnya, coba lagi (max 5x)
    while (newQ.prompt === lastPromptRef.current && guard < 5) {
      newQ = generateQuestion(round, tierFor(round));
      guard++;
    }
    lastPromptRef.current = newQ.prompt;
    setQuestion(newQ);
    setHiddenOptions([]);
    setSelected(null);
    setIsCorrect(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [round]);

  const finish = useCallback(
    (finalScore: number, finalBest: number, finalCorrect: number, roundsPlayed: number, bossCleared: boolean) => {
      if (finishedRef.current) return;
      finishedRef.current = true;
      const accuracy = roundsPlayed > 0 ? Math.round((finalCorrect / roundsPlayed) * 100) : 0;
      const stars = accuracy >= 85 ? 3 : accuracy >= 60 ? 2 : 1;
      setIsBossResult(bossCleared);
      setGameOver(true);
      playSound(stars === 3 ? 'win' : 'reward');
      setTimeout(() => {
        onComplete(stars, {
          score: finalScore,
          streak: finalBest,
          maxCombo: finalBest,   // agar useGameComplete bisa hitung bonus kombo
          total: totalRounds,
          correctAnswers: finalCorrect,
          accuracy,
          bossCleared,
          roundsPlayed,
        });
      }, 1200);
    },
    [onComplete, playSound, totalRounds]
  );

  const handleUseFifty = () => {
    if (fiftyUsed || !question || selected !== null) return;
    const wrongs = question.options.filter((o) => o !== question.answer);
    const toHide = wrongs.slice(0, Math.max(0, wrongs.length - 1));
    setHiddenOptions(toHide);
    setFiftyUsed(true);
    playSound('click');
  };

  const handleAnswer = (opt: number | string) => {
    if (selected !== null || !question || gameOver) return;
    setSelected(opt);
    const ok = opt === question.answer;
    setIsCorrect(ok);

    const bonus = isBoss ? 2 : 1;
    let newScore = score;
    let newCombo = combo;
    let newBest = bestCombo;
    let newCorrect = correctCount;
    let newLives = lives;

    if (ok) {
      newCombo = combo + 1;
      newBest = Math.max(bestCombo, newCombo);
      const multiplier = newCombo >= 8 ? 3 : newCombo >= 4 ? 2 : 1;
      newScore = score + 10 * bonus * multiplier;
      newCorrect = correctCount + 1;
      playSound('correct');
    } else {
      newCombo = 0;
      newLives = lives - 1;
      playSound('wrong');
    }

    setScore(newScore);
    setCombo(newCombo);
    setBestCombo(newBest);
    setCorrectCount(newCorrect);
    setLives(newLives);

    const roundsPlayed = round + 1;
    const isLastRound = round >= totalRounds - 1;
    const outOfLives = newLives <= 0;

    setTimeout(() => {
      if (isLastRound || outOfLives) {
        finish(newScore, newBest, newCorrect, roundsPlayed, isBoss && ok);
      } else {
        setRound((r) => r + 1);
      }
    }, ok ? 700 : 950);
  };

  if (!question) return null;

  const comboFire = combo >= 8 ? '🔥🔥🔥' : combo >= 4 ? '🔥🔥' : combo >= 2 ? '🔥' : '';
  const showHint = selected !== null && !!question.hint;

  return (
    <div style={{ padding: '4px', maxWidth: '560px', margin: '0 auto' }}>
      {/* HEADER: nyawa + judul + skor */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '10px',
          flexWrap: 'wrap',
          gap: '8px',
        }}
      >
        <span style={{ fontSize: '18px' }}>
          {'❤️'.repeat(Math.max(0, lives))}
          {'🖤'.repeat(Math.max(0, startingLives - lives))}
        </span>
        <span style={{ fontWeight: 800, color: theme.heading, fontSize: '13px' }}>
          {emoji} {title}
        </span>
        <span style={{ fontWeight: 800, color: themeColor, fontSize: '14px' }}>⭐ {score}</span>
      </div>

      {/* PROGRESS BAR */}
      <div
        style={{
          width: '100%',
          height: '8px',
          background: theme.border,
          borderRadius: '4px',
          overflow: 'hidden',
          marginBottom: '12px',
        }}
      >
        <div
          style={{
            width: `${(Math.min(round + 1, totalRounds) / totalRounds) * 100}%`,
            height: '100%',
            background: isBoss
              ? 'linear-gradient(90deg,#ef4444,#f59e0b)'
              : `linear-gradient(90deg, ${themeColor}, ${themeColor}aa)`,
            transition: 'width 0.4s',
          }}
        />
      </div>

      {combo >= 2 && !gameOver && (
        <div
          style={{
            textAlign: 'center',
            marginBottom: '8px',
            fontWeight: 800,
            color: '#f59e0b',
            fontSize: '14px',
            animation: 'pop 0.3s ease-out',
          }}
        >
          {comboFire} Combo x{combo}!
        </div>
      )}

      {!gameOver && (
        <>
          {isBoss && (
            <div
              style={{
                textAlign: 'center',
                fontWeight: 900,
                color: '#fff',
                background: 'linear-gradient(135deg,#dc2626,#f97316)',
                borderRadius: '12px',
                padding: '6px',
                marginBottom: '10px',
                fontSize: '13px',
                letterSpacing: '1px',
                boxShadow: '0 4px 12px rgba(220,38,38,0.4)',
              }}
            >
              👑 RONDE BOS — Poin x2!
            </div>
          )}

          <div
            style={{
              background: theme.bgCard,
              borderRadius: '20px',
              padding: '22px 16px',
              boxShadow: theme.shadow,
              border: `1px solid ${theme.border}`,
              textAlign: 'center',
              marginBottom: '14px',
            }}
          >
            {question.visual && (
              <div
                style={{
                  fontSize: '30px',
                  letterSpacing: '4px',
                  marginBottom: '10px',
                  lineHeight: 1.3,
                  whiteSpace: 'pre-line',
                }}
              >
                {question.visual}
              </div>
            )}
            <h3
              style={{
                fontSize: question.prompt.length > 40 ? '17px' : '26px',
                fontWeight: '900',
                color: theme.heading,
                margin: 0,
                whiteSpace: 'pre-line',
                lineHeight: 1.5,
              }}
            >
              {question.prompt}
            </h3>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '10px',
              maxWidth: '360px',
              margin: '0 auto',
            }}
          >
            {question.options.map((opt, i) => {
              if (hiddenOptions.includes(opt)) {
                return <div key={i} style={{ visibility: 'hidden' }} />;
              }
              const isSelectedOpt = selected === opt;
              const isCorrectAnswer = opt === question.answer;
              // Tampilkan jawaban benar (hijau) kalau anak sudah jawab
              const showAsCorrect = selected !== null && isCorrectAnswer;
              const bg = isSelectedOpt
                ? isCorrect
                  ? '#10b981'
                  : '#ef4444'
                : showAsCorrect
                  ? '#10b981'
                  : theme.bgHover;
              const color = isSelectedOpt || showAsCorrect ? '#fff' : theme.text;
              return (
                <button
                  key={i}
                  onClick={() => handleAnswer(opt)}
                  disabled={selected !== null}
                  style={{
                    padding: '16px',
                    fontSize: '20px',
                    fontWeight: '800',
                    borderRadius: '14px',
                    border: 'none',
                    background: bg,
                    color,
                    cursor: selected !== null ? 'default' : 'pointer',
                    transition: 'transform 0.15s, background 0.2s',
                  }}
                >
                  {opt}
                </button>
              );
            })}
          </div>

          <div style={{ textAlign: 'center', marginTop: '12px' }}>
            <button
              onClick={handleUseFifty}
              disabled={fiftyUsed || selected !== null}
              style={{
                padding: '8px 16px',
                borderRadius: '999px',
                fontSize: '12px',
                fontWeight: 700,
                border: `1px solid ${theme.border}`,
                background: fiftyUsed ? theme.bgHover : '#ede9fe',
                color: fiftyUsed ? theme.textMuted : '#5b21b6',
                cursor: fiftyUsed || selected !== null ? 'default' : 'pointer',
                opacity: fiftyUsed ? 0.5 : 1,
              }}
            >
              ✂️ 50:50 {fiftyUsed ? '(terpakai)' : ''}
            </button>
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
                fontWeight: '700',
                fontSize: '15px',
                animation: 'pop 0.3s ease-out',
              }}
            >
              {isCorrect ? '🎉 Benar!' : `❌ Jawaban: ${question.answer}`}
              {showHint && (
                <div
                  style={{
                    marginTop: '6px',
                    fontSize: '12px',
                    fontWeight: 500,
                    opacity: 0.9,
                    lineHeight: 1.4,
                    textAlign: 'left',
                    background: 'rgba(255,255,255,0.5)',
                    padding: '6px 8px',
                    borderRadius: '6px',
                  }}
                >
                  💡 {question.hint}
                </div>
              )}
            </div>
          )}

          <p style={{ textAlign: 'center', fontSize: '11px', color: theme.textMuted, marginTop: '10px' }}>
            Ronde {round + 1} / {totalRounds}
          </p>
        </>
      )}

      {gameOver && (
        <div style={{ textAlign: 'center', padding: '30px 16px' }}>
          <div
            style={{
              fontSize: '50px',
              marginBottom: '8px',
              animation: 'float 2s ease-in-out infinite',
            }}
          >
            {lives <= 0 ? '💫' : isBossResult ? '👑' : '🏆'}
          </div>
          <h3 style={{ fontSize: '20px', fontWeight: '900', color: theme.heading }}>
            {lives <= 0 ? 'Coba Lagi, Kamu Pasti Bisa!' : isBossResult ? 'Bos Dikalahkan!' : 'Selesai!'}
          </h3>
          <p style={{ fontSize: '14px', color: theme.textSecondary, marginTop: '4px' }}>
            Skor: <strong>{score}</strong> · Combo terbaik: <strong>{bestCombo}x</strong>
          </p>
        </div>
      )}

      <style>{`
        @keyframes pop { 0%{transform:scale(0.8);opacity:0} 80%{transform:scale(1.05)} 100%{transform:scale(1);opacity:1} }
        @keyframes float { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-8px)} }
      `}</style>
    </div>
  );
}