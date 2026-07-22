// app/components/games/MathScrabble.tsx
'use client';

import { useState, useEffect } from 'react';
import { useThemeStyles } from '@/hooks/useThemeStyles';

interface MathScrabbleProps {
  onComplete: (stars: number, extra?: any) => void;
}

const TARGETS = [100, 250, 500, 1000];
const SIZE = 6;

export default function MathScrabble({ onComplete }: MathScrabbleProps) {
  const theme = useThemeStyles();
  const [board, setBoard] = useState<(string | null)[][]>([]);
  const [rack, setRack] = useState<string[]>([]);
  const [score, setScore] = useState(0);
  const [level, setLevel] = useState(1);
  const [target, setTarget] = useState(TARGETS[0]);
  const [selectedRack, setSelectedRack] = useState<number | null>(null);
  const [placed, setPlaced] = useState<{ r: number; c: number; v: string }[]>([]);
  const [msg, setMsg] = useState('');
  const [moves, setMoves] = useState(15);
  const [step, setStep] = useState<'play' | 'complete'>('play');

  const genTiles = () => {
    const nums = Array.from({ length: 5 }, () => String(Math.floor(Math.random() * 9) + 1));
    const ops = ['+', '-', '×', '='];
    const all = [...nums, ops[Math.floor(Math.random() * 4)], ops[Math.floor(Math.random() * 4)]];
    setRack(all.sort(() => Math.random() - 0.5));
  };

  const initBoard = () => {
    const b: (string | null)[][] = Array.from({ length: SIZE }, () => Array(SIZE).fill(null));
    setBoard(b); setPlaced([]); setSelectedRack(null); setMsg('');
  };

  const start = () => { initBoard(); genTiles(); setScore(0); setLevel(1); setTarget(TARGETS[0]); setMoves(15); setStep('play'); };

  useEffect(() => { start(); }, []);

  // Klik tile di rack → select
  const selectRackTile = (idx: number) => {
    setSelectedRack(selectedRack === idx ? null : idx);
  };

  // Klik cell di board → place selected tile
  const placeOnBoard = (r: number, c: number) => {
    if (selectedRack === null) {
      // Remove tile dari board
      if (board[r][c]) {
        const tile = board[r][c]!;
        const newBoard = board.map(row => [...row]);
        newBoard[r][c] = null;
        setBoard(newBoard);
        setRack(p => [...p, tile]);
        setPlaced(p => p.filter(t => !(t.r === r && t.c === c)));
      }
      return;
    }

    if (board[r][c]) return;

    const tile = rack[selectedRack];
    const newBoard = board.map(row => [...row]);
    newBoard[r][c] = tile;
    setBoard(newBoard);
    setPlaced(p => [...p, { r, c, v: tile }]);
    setRack(p => p.filter((_, i) => i !== selectedRack));
    setSelectedRack(null);
  };

  const checkEquation = () => {
    if (placed.length < 3) { setMsg('Minimal 3 tile di board!'); return; }

    // Cek horizontal
    const row = placed[0].r;
    if (placed.every(t => t.r === row)) {
      const sorted = [...placed].sort((a, b) => a.c - b.c);
      const eq = sorted.map(t => t.v).join('');
      evaluate(eq);
      return;
    }

    // Cek vertical
    const col = placed[0].c;
    if (placed.every(t => t.c === col)) {
      const sorted = [...placed].sort((a, b) => a.r - b.r);
      const eq = sorted.map(t => t.v).join('');
      evaluate(eq);
      return;
    }

    setMsg('Tile harus sejajar (1 baris/kolom)!');
  };

  const evaluate = (eq: string) => {
    const parts = eq.split('=');
    if (parts.length !== 2) { setMsg('Harus ada tanda = !'); return; }
    try {
      const left = parts[0].replace(/×/g, '*');
      const right = parts[1].replace(/×/g, '*');
      const lv = Function(`'use strict'; return (${left})`)();
      const rv = Function(`'use strict'; return (${right})`)();
      if (Math.abs(lv - rv) < 0.001) {
        const pts = placed.length * 10;
        const ns = score + pts;
        setScore(ns); setMoves(m => m - 1);
        setMsg(`✅ Benar! +${pts} poin`);
        if (ns >= target && level < 4) {
          const nl = level + 1;
          setLevel(nl);
          setTarget(TARGETS[Math.min(nl - 1, TARGETS.length - 1)]);
        }
        if (moves <= 1) { setStep('complete'); return; }
        initBoard(); genTiles();
      } else {
        setMsg(`❌ ${parts[0]} ≠ ${parts[1]} (${lv} ≠ ${rv})`);
      }
    } catch { setMsg('Persamaan tidak valid!'); }
  };

  const handleComplete = () => {
    const stars = score >= 1000 ? 3 : score >= 500 ? 2 : 1;
    onComplete(stars, { score, level, moves });
  };

  if (step === 'complete') {
    const stars = score >= 1000 ? 3 : score >= 500 ? 2 : 1;
    return (
      <div style={{ maxWidth: '500px', margin: '0 auto', padding: '24px', textAlign: 'center', background: theme.bg, minHeight: '400px' }}>
        <div style={{ fontSize: '60px' }}>🏆</div>
        <h2 style={{ fontSize: '24px', fontWeight: '800', color: theme.heading }}>MathScrabble Selesai!</h2>
        <p style={{ color: theme.textSecondary }}>Skor: {score} | Level: {level}</p>
        <div style={{ fontSize: '40px' }}>{'⭐'.repeat(stars)}</div>
        <button onClick={handleComplete} style={{ marginTop: '16px', padding: '12px 24px', borderRadius: '999px', border: 'none', background: '#f59e0b', color: '#fff', fontWeight: '700', cursor: 'pointer' }}>🏆 Klaim!</button>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '500px', margin: '0 auto', padding: '16px', background: theme.bg, minHeight: '400px' }}>
      {/* HUD */}
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '13px', flexWrap: 'wrap', gap: '4px' }}>
        <span style={{ background: '#fef3c7', borderRadius: '20px', padding: '4px 10px', fontWeight: '700', color: '#1e293b' }}>⭐ {score}/{target}</span>
        <span style={{ background: '#eff6ff', borderRadius: '20px', padding: '4px 10px', fontWeight: '700', color: '#1e293b' }}>📝 {moves}</span>
        <span style={{ background: '#ede9fe', borderRadius: '20px', padding: '4px 10px', fontWeight: '700', color: '#1e293b' }}>🎯 Lv.{level}</span>
      </div>

      {/* Board */}
      <div style={{ display: 'grid', gridTemplateColumns: `repeat(${SIZE}, 1fr)`, gap: '4px', marginBottom: '12px', background: '#d1fae5', borderRadius: '12px', padding: '8px' }}>
        {board.map((row, r) => row.map((cell, c) => (
          <button key={`${r}-${c}`} onClick={() => placeOnBoard(r, c)} style={{
            aspectRatio: '1', borderRadius: '8px', border: '1px solid #d1d5db',
            background: cell ? (['+','-','×','='].includes(cell) ? '#fbbf24' : '#93c5fd') : '#fff',
            color: cell ? '#1e293b' : '#94a3b8', fontWeight: '700', fontSize: '16px',
            cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>{cell || ''}</button>
        )))}
      </div>

      {/* Rack */}
      <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '12px', justifyContent: 'center' }}>
        {rack.map((t, i) => (
          <button key={i} onClick={() => selectRackTile(i)} style={{
            width: '44px', height: '44px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: ['+','-','×','='].includes(t) ? '#fbbf24' : '#6366f1', color: '#fff',
            fontWeight: '700', fontSize: '18px', boxShadow: '0 2px 6px rgba(0,0,0,0.15)',
            border: selectedRack === i ? '3px solid #f59e0b' : '3px solid transparent',
            transform: selectedRack === i ? 'scale(1.1)' : 'scale(1)',
            cursor: 'pointer', transition: 'all 0.15s',
          }}>{t}</button>
        ))}
        {rack.length === 0 && <p style={{ fontSize: '12px', color: theme.textMuted }}>Tile habis!</p>}
      </div>

      {/* Actions */}
      <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', marginBottom: '8px' }}>
        <button onClick={checkEquation} style={{ padding: '10px 20px', borderRadius: '10px', border: 'none', background: '#10b981', color: '#fff', fontWeight: '700', cursor: 'pointer' }}>✅ Cek</button>
        <button onClick={() => { initBoard(); genTiles(); }} style={{ padding: '10px 20px', borderRadius: '10px', border: 'none', background: '#ef4444', color: '#fff', fontWeight: '700', cursor: 'pointer' }}>🔄 Reset</button>
      </div>
      {msg && (
        <div style={{ padding: '10px', borderRadius: '10px', background: msg.includes('✅') ? '#d1fae5' : '#fee2e2', color: msg.includes('✅') ? '#065f46' : '#991b1b', fontWeight: '600', fontSize: '14px', textAlign: 'center', animation: 'pop 0.3s ease-out' }}>{msg}</div>
      )}
      <p style={{ textAlign: 'center', fontSize: '11px', color: theme.textMuted, marginTop: '8px' }}>💡 Pilih tile di rak → klik papan. Susun persamaan yang benar!</p>
    </div>
  );
}