// app/components/games/kelas3/SprintKali60.tsx
// ⚡ Sprint Kali 60 Detik — mad-minute: jawab sebanyak mungkin dalam 60 detik, hanya 3 pilihan
// (bukan ngetik) supaya larinya cepat. Sesi super singkat + rekor pribadi = gampang dicoba berkali-kali.
'use client';

import { useEffect, useRef, useState } from 'react';
import { useThemeStyles } from '@/hooks/useThemeStyles';
import { useSoundEffect } from '@/hooks/useSoundEffect';
import { randInt, numericOptions, shuffleArr } from '../shared/PowerBattle';

interface Props {
  onComplete: (stars: number, extra?: any) => void;
  playerName?: string;
}

const DURATION = 60;

function bestKey(name?: string) {
  return `kidarcade:sprintkali:best:${(name || 'tamu').toLowerCase()}`;
}

function makeFact() {
  const a = randInt(2, 10);
  const b = randInt(2, 10);
  const answer = a * b;
  return { prompt: `${a} × ${b}`, answer, options: shuffleArr(numericOptions(answer, 10, 3)) };
}

export default function SprintKali60({ onComplete, playerName }: Props) {
  const theme = useThemeStyles();
  const { playSound } = useSoundEffect();

  const [phase, setPhase] = useState<'ready' | 'playing' | 'done'>('ready');
  const [timeLeft, setTimeLeft] = useState(DURATION);
  const [fact, setFact] = useState(() => makeFact());
  const [correct, setCorrect] = useState(0);
  const [wrong, setWrong] = useState(0);
  const [flash, setFlash] = useState<'ok' | 'no' | null>(null);
  const [best, setBest] = useState(0);
  const [isNewBest, setIsNewBest] = useState(false);

  const finishedRef = useRef(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const flashTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    try {
      const v = Number(window.localStorage.getItem(bestKey(playerName)) || '0');
      setBest(Number.isFinite(v) ? v : 0);
    } catch { /* localStorage tidak tersedia — abaikan */ }
  }, [playerName]);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (flashTimeoutRef.current) clearTimeout(flashTimeoutRef.current);
    };
  }, []);

  const finish = (finalCorrect: number) => {
    if (finishedRef.current) return;
    finishedRef.current = true;
    if (timerRef.current) clearInterval(timerRef.current);
    const beat = finalCorrect > best;
    setIsNewBest(beat);
    if (beat) {
      setBest(finalCorrect);
      try { window.localStorage.setItem(bestKey(playerName), String(finalCorrect)); } catch { /* abaikan */ }
    }
    const stars = finalCorrect >= 25 ? 3 : finalCorrect >= 15 ? 2 : 1;
    setPhase('done');
    playSound(beat ? 'win' : 'reward');
    setTimeout(() => onComplete(stars, { score: finalCorrect, streak: finalCorrect, total: finalCorrect + wrong }), 1200);
  };

  const start = () => {
    finishedRef.current = false;
    setCorrect(0);
    setWrong(0);
    setTimeLeft(DURATION);
    setFact(makeFact());
    setPhase('playing');
    playSound('click');
    timerRef.current = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          if (timerRef.current) clearInterval(timerRef.current);
          return 0;
        }
        return t - 1;
      });
    }, 1000);
  };

  // waktu habis → selesaikan (pakai state terbaru lewat functional read)
  useEffect(() => {
    if (phase === 'playing' && timeLeft === 0) {
      setCorrect((c) => {
        finish(c);
        return c;
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timeLeft, phase]);

  const answer = (opt: number) => {
    if (phase !== 'playing') return;
    const ok = opt === fact.answer;
    setFlash(ok ? 'ok' : 'no');
    playSound(ok ? 'correct' : 'wrong');
    if (ok) setCorrect((c) => c + 1);
    else setWrong((w) => w + 1);
    setFact(makeFact());
    if (flashTimeoutRef.current) clearTimeout(flashTimeoutRef.current);
    flashTimeoutRef.current = setTimeout(() => setFlash(null), 150);
  };

  const card = { background: theme.bgCard, border: `1px solid ${theme.border}`, borderRadius: '18px', boxShadow: theme.shadow } as const;

  if (phase === 'ready') {
    return (
      <div style={{ maxWidth: '440px', margin: '0 auto', textAlign: 'center' }}>
        <div style={{ ...card, padding: '28px 18px' }}>
          <div style={{ fontSize: '44px' }}>⚡</div>
          <h2 style={{ fontSize: '20px', fontWeight: 900, color: theme.heading, margin: '4px 0' }}>Sprint Kali 60 Detik</h2>
          <p style={{ fontSize: '14px', color: theme.textSecondary, margin: '0 0 4px' }}>
            Jawab perkalian secepat mungkin dalam 60 detik. Salah? Lanjut aja, jangan berhenti!
          </p>
          {best > 0 && <p style={{ fontSize: '13px', fontWeight: 800, color: '#f59e0b', margin: '8px 0 0' }}>🏆 Rekormu: {best} benar</p>}
          <button
            onClick={start}
            style={{ marginTop: '16px', width: '100%', padding: '14px', borderRadius: '14px', border: 'none', background: '#f59e0b', color: '#fff', fontWeight: 800, fontSize: '16px', cursor: 'pointer' }}
          >
            ▶ Mulai Sprint!
          </button>
        </div>
      </div>
    );
  }

  if (phase === 'done') {
    return (
      <div style={{ maxWidth: '440px', margin: '0 auto', textAlign: 'center' }}>
        <div style={{ ...card, padding: '28px 18px' }}>
          <div style={{ fontSize: '46px' }}>{isNewBest ? '🏆' : '⏱️'}</div>
          <h2 style={{ fontSize: '20px', fontWeight: 900, color: theme.heading, margin: '4px 0' }}>
            {isNewBest ? 'REKOR BARU!' : 'Waktu Habis!'}
          </h2>
          <p style={{ fontSize: '15px', color: theme.text, margin: '4px 0' }}>
            <strong>{correct}</strong> benar · {wrong} salah
          </p>
          {!isNewBest && <p style={{ fontSize: '12px', color: theme.textMuted }}>Rekor terbaik: {best} benar</p>}
        </div>
      </div>
    );
  }

  const pct = (timeLeft / DURATION) * 100;
  return (
    <div style={{ maxWidth: '440px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
        <span style={{ fontWeight: 800, color: theme.heading, fontSize: '13px' }}>⚡ Sprint Kali</span>
        <span style={{ fontWeight: 900, fontSize: '16px', color: timeLeft <= 10 ? '#ef4444' : theme.heading }}>⏱️ {timeLeft}s</span>
      </div>
      <div style={{ width: '100%', height: '8px', background: theme.border, borderRadius: '4px', overflow: 'hidden', marginBottom: '14px' }}>
        <div style={{ width: `${pct}%`, height: '100%', background: timeLeft <= 10 ? '#ef4444' : '#f59e0b', transition: 'width 1s linear' }} />
      </div>

      <div
        style={{
          ...card,
          textAlign: 'center',
          padding: '26px 16px',
          marginBottom: '14px',
          background: flash === 'ok' ? '#d1fae5' : flash === 'no' ? '#fee2e2' : theme.bgCard,
          transition: 'background 0.1s',
        }}
      >
        <h3 style={{ fontSize: '30px', fontWeight: 900, color: theme.heading, margin: 0 }}>{fact.prompt} = ?</h3>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px' }}>
        {fact.options.map((opt, i) => (
          <button
            key={i}
            onClick={() => answer(opt)}
            style={{ padding: '18px 6px', fontSize: '20px', fontWeight: 800, borderRadius: '14px', border: 'none', background: theme.bgHover, color: theme.text, cursor: 'pointer' }}
          >
            {opt}
          </button>
        ))}
      </div>

      <p style={{ textAlign: 'center', fontSize: '12px', color: theme.textMuted, marginTop: '10px' }}>✅ {correct} benar</p>
    </div>
  );
}
