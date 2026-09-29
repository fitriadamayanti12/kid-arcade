// app/components/games/kelas3/KartuBerpasangan.tsx
// 🎴 Kartu Berpasangan — cocokkan kartu soal ("6×7") dengan kartu jawaban ("42").
// Tanpa tekanan waktu, tanpa nyawa — santai tapi tetap melatih ingatan fakta kali.
'use client';

import { useMemo, useState } from 'react';
import { useThemeStyles } from '@/hooks/useThemeStyles';
import { useSoundEffect } from '@/hooks/useSoundEffect';
import { randInt, shuffleArr } from '../shared/PowerBattle';

interface Props {
  onComplete: (stars: number, extra?: any) => void;
}

interface Card {
  id: number;
  pairId: number;
  label: string;
  isQuestion: boolean;
}

function makeDeck(): Card[] {
  const used = new Set<number>();
  const facts: { a: number; b: number; product: number }[] = [];
  let guard = 0;
  while (facts.length < 6 && guard < 200) {
    guard++;
    const a = randInt(2, 10);
    const b = randInt(2, 10);
    const product = a * b;
    if (used.has(product)) continue; // hindari 2 soal beda dengan hasil sama (misal 2×6 dan 3×4)
    used.add(product);
    facts.push({ a, b, product });
  }
  const cards: Card[] = [];
  facts.forEach((f, i) => {
    cards.push({ id: i * 2, pairId: i, label: `${f.a} × ${f.b}`, isQuestion: true });
    cards.push({ id: i * 2 + 1, pairId: i, label: String(f.product), isQuestion: false });
  });
  return shuffleArr(cards);
}

export default function KartuBerpasangan({ onComplete }: Props) {
  const theme = useThemeStyles();
  const { playSound } = useSoundEffect();

  const [deck] = useState<Card[]>(() => makeDeck());
  const [flipped, setFlipped] = useState<number[]>([]);
  const [matched, setMatched] = useState<Set<number>>(new Set());
  const [moves, setMoves] = useState(0);
  const [wrongPairIds, setWrongPairIds] = useState<number[]>([]);
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);

  const totalPairs = deck.length / 2;

  const finish = (finalMoves: number) => {
    const stars = finalMoves <= totalPairs + 2 ? 3 : finalMoves <= totalPairs + 6 ? 2 : 1;
    setDone(true);
    playSound(stars === 3 ? 'win' : 'reward');
    setTimeout(() => onComplete(stars, { score: totalPairs, streak: totalPairs, total: finalMoves }), 1300);
  };

  const flip = (idx: number) => {
    if (busy || matched.has(deck[idx].pairId) || flipped.includes(idx) || flipped.length === 2) return;
    const nextFlipped = [...flipped, idx];
    setFlipped(nextFlipped);
    playSound('click');

    if (nextFlipped.length === 2) {
      setBusy(true);
      const [i1, i2] = nextFlipped;
      const c1 = deck[i1];
      const c2 = deck[i2];
      const isMatch = c1.pairId === c2.pairId && c1.isQuestion !== c2.isQuestion;
      const newMoves = moves + 1;
      setMoves(newMoves);

      setTimeout(() => {
        if (isMatch) {
          playSound('match');
          const newMatched = new Set(matched);
          newMatched.add(c1.pairId);
          setMatched(newMatched);
          setFlipped([]);
          setBusy(false);
          if (newMatched.size === totalPairs) finish(newMoves);
        } else {
          playSound('wrong');
          setWrongPairIds([i1, i2]);
          setTimeout(() => {
            setFlipped([]);
            setWrongPairIds([]);
            setBusy(false);
          }, 550);
        }
      }, 550);
    }
  };

  const card = { background: theme.bgCard, border: `1px solid ${theme.border}`, borderRadius: '18px', boxShadow: theme.shadow } as const;

  if (done) {
    return (
      <div style={{ maxWidth: '420px', margin: '0 auto', textAlign: 'center' }}>
        <div style={{ ...card, padding: '28px 18px' }}>
          <div style={{ fontSize: '44px' }}>🎴</div>
          <h2 style={{ fontSize: '20px', fontWeight: 900, color: theme.heading, margin: '4px 0' }}>Semua Cocok!</h2>
          <p style={{ fontSize: '14px', color: theme.textSecondary }}>{moves} kali buka kartu untuk {totalPairs} pasang</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '420px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
        <span style={{ fontWeight: 800, color: theme.heading, fontSize: '13px' }}>🎴 Kartu Berpasangan</span>
        <span style={{ fontWeight: 800, color: '#8b5cf6', fontSize: '13px' }}>Cocok {matched.size}/{totalPairs} · {moves}x buka</span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px' }}>
        {deck.map((c, i) => {
          const isFlipped = flipped.includes(i) || matched.has(c.pairId);
          const isMatchedCard = matched.has(c.pairId);
          const isWrong = wrongPairIds.includes(i);
          return (
            <button
              key={c.id}
              onClick={() => flip(i)}
              disabled={isFlipped}
              style={{
                aspectRatio: '3/4',
                borderRadius: '12px',
                border: 'none',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: c.isQuestion ? '15px' : '18px',
                fontWeight: 800,
                cursor: isFlipped ? 'default' : 'pointer',
                background: isMatchedCard ? '#d1fae5' : isWrong ? '#fee2e2' : isFlipped ? '#ede9fe' : '#8b5cf6',
                color: isFlipped ? (isMatchedCard ? '#065f46' : isWrong ? '#991b1b' : '#5b21b6') : '#fff',
                transition: 'background 0.2s, transform 0.2s',
                transform: isFlipped ? 'scale(1)' : 'scale(1)',
              }}
            >
              {isFlipped ? c.label : '❔'}
            </button>
          );
        })}
      </div>
    </div>
  );
}
