// app/components/games/GeoQuest.tsx
'use client';

import { useState, useCallback, useRef } from 'react';
import { useThemeStyles } from '@/hooks/useThemeStyles';

interface GeoQuestProps {
  onComplete: (stars: number, extra?: any) => void;
}

interface Shape {
  id: string; name: string; emoji: string; color: string; formula: string;
  unlocked: boolean; mastered: boolean; questions: number; correct: number;
}

interface Question {
  id: number; shape: string; type: 'area' | 'perimeter';
  params: Record<string, number>; question: string; answer: number;
  options: number[]; points: number; visual: string;
}

const SHAPES: Shape[] = [
  { id: 'square', name: 'Persegi', emoji: '🟨', color: '#FBBF24', formula: 'L = s × s, K = 4 × s', unlocked: true, mastered: false, questions: 0, correct: 0 },
  { id: 'rectangle', name: 'Persegi Panjang', emoji: '🟩', color: '#34D399', formula: 'L = p × l, K = 2 × (p + l)', unlocked: true, mastered: false, questions: 0, correct: 0 },
  { id: 'triangle', name: 'Segitiga', emoji: '🔺', color: '#F87171', formula: 'L = ½ × a × t, K = a + b + c', unlocked: false, mastered: false, questions: 0, correct: 0 },
  { id: 'circle', name: 'Lingkaran', emoji: '🟡', color: '#60A5FA', formula: 'L = π × r², K = 2 × π × r', unlocked: false, mastered: false, questions: 0, correct: 0 },
];

export default function GeoQuest({ onComplete }: GeoQuestProps) {
  const theme = useThemeStyles();
  const [step, setStep] = useState<'menu' | 'play' | 'complete'>('menu');
  const [shapes, setShapes] = useState<Shape[]>(SHAPES);
  const [q, setQ] = useState<Question | null>(null);
  const [qIndex, setQIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [feedback, setFeedback] = useState(false);
  const [correct, setCorrect] = useState(false);
  const [showFormula, setShowFormula] = useState(false);
  const [msg, setMsg] = useState('');

  const generateQuestion = useCallback((shapeId: string): Question => {
    const type = Math.random() > 0.5 ? 'area' : 'perimeter';
    let params: Record<string, number> = {}, question = '', answer = 0, visual = '';

    switch (shapeId) {
      case 'square': {
        const s = Math.floor(Math.random() * 10) + 3;
        params = { s };
        answer = type === 'area' ? s * s : 4 * s;
        question = `Persegi sisi ${s} cm. ${type === 'area' ? 'LUAS' : 'KELILING'} = ?`;
        visual = type === 'area' ? `${s} × ${s}` : `4 × ${s}`;
        break;
      }
      case 'rectangle': {
        const p = Math.floor(Math.random() * 12) + 4;
        const l = Math.floor(Math.random() * 8) + 2;
        params = { p, l };
        answer = type === 'area' ? p * l : 2 * (p + l);
        question = `Persegi panjang ${p}×${l} cm. ${type === 'area' ? 'LUAS' : 'KELILING'} = ?`;
        visual = type === 'area' ? `${p} × ${l}` : `2×(${p}+${l})`;
        break;
      }
      case 'triangle': {
        const a = Math.floor(Math.random() * 10) + 3;
        const t = Math.floor(Math.random() * 10) + 3;
        params = { a, t };
        answer = type === 'area' ? Math.round((a * t) / 2) : a + t + Math.floor(Math.random() * 8) + 3;
        question = `Segitiga alas ${a}cm, tinggi ${t}cm. ${type === 'area' ? 'LUAS' : 'KELILING'} = ?`;
        visual = type === 'area' ? `½×${a}×${t}` : `${a}+${t}+...`;
        break;
      }
      case 'circle': {
        const r = Math.floor(Math.random() * 7) + 3;
        params = { r };
        answer = type === 'area' ? Math.round((22/7) * r * r) : Math.round(2 * (22/7) * r);
        question = `Lingkaran r=${r}cm (π=22/7). ${type === 'area' ? 'LUAS' : 'KELILING'} = ?`;
        visual = type === 'area' ? `22/7×${r}×${r}` : `2×22/7×${r}`;
        break;
      }
    }

    const opts = new Set([answer]);
    while (opts.size < 4) {
      const off = Math.floor(Math.random() * 20) + 1;
      const o = Math.random() > 0.5 ? answer + off : Math.max(0, answer - off);
      if (o !== answer) opts.add(o);
    }

    return { id: Date.now(), shape: shapeId, type, params, question, answer, options: Array.from(opts).sort(() => Math.random() - 0.5), points: type === 'area' ? 15 : 10, visual };
  }, []);

  const start = () => {
    const available = shapes.filter(s => s.unlocked);
    if (available.length === 0) return;
    setQ(generateQuestion(available[Math.floor(Math.random() * available.length)].id));
    setStep('play'); setScore(0); setCombo(0); setQIndex(0);
  };

  const handle = (ans: number) => {
    if (feedback || !q) return;
    setSelected(ans);
    const ok = ans === q.answer;
    setCorrect(ok); setFeedback(true);
    if (ok) {
      const bonus = Math.floor(combo / 3) * 5;
      setScore(s => s + q.points + bonus);
      setCombo(c => c + 1);
      setMsg(`🎉 +${q.points + bonus} poin!`);
      setShapes(prev => prev.map(s => s.id === q.shape ? { ...s, correct: s.correct + 1, mastered: s.correct + 1 >= 3, questions: s.questions + 1 } : s));
    } else { setCombo(0); setMsg(`❌ ${q.answer} cm${q.type === 'area' ? '²' : ''}`); }
    setTimeout(() => {
      if (qIndex < 9) {
        const available = shapes.filter(s => s.unlocked);
        setQ(generateQuestion(available[Math.floor(Math.random() * available.length)].id));
        setQIndex(i => i + 1); setSelected(null); setFeedback(false); setMsg(''); setShowFormula(false);
      } else setStep('complete');
    }, 1200);
  };

  const handleComplete = () => {
    const mastered = shapes.filter(s => s.mastered).length;
    const stars = mastered >= 3 ? 3 : mastered >= 2 ? 2 : 1;
    onComplete(stars, { score, totalMastered: mastered });
  };

  const renderSVG = (shapeId: string, params: Record<string, number>) => {
    const s = { width: '140px', height: '100px', margin: '0 auto' };
    switch (shapeId) {
      case 'square': return <svg viewBox="0 0 140 100" style={s}><rect x="30" y="10" width="80" height="80" fill="#FCD34D" stroke="#F59E0B" strokeWidth="3" rx="4"/><text x="70" y="55" textAnchor="middle" fontSize="16" fontWeight="bold" fill="#92400E">{params.s} cm</text></svg>;
      case 'rectangle': return <svg viewBox="0 0 160 100" style={s}><rect x="15" y="15" width="130" height="60" fill="#6EE7B7" stroke="#10B981" strokeWidth="3" rx="4"/><text x="80" y="50" textAnchor="middle" fontSize="14" fontWeight="bold" fill="#064E3B">{params.p}×{params.l} cm</text></svg>;
      case 'triangle': return <svg viewBox="0 0 140 100" style={s}><polygon points="70,5 10,90 130,90" fill="#FCA5A5" stroke="#EF4444" strokeWidth="3"/><text x="70" y="65" textAnchor="middle" fontSize="13" fontWeight="bold" fill="#7F1D1D">alas {params.a}cm</text></svg>;
      case 'circle': return <svg viewBox="0 0 140 100" style={s}><circle cx="70" cy="50" r="35" fill="#93C5FD" stroke="#3B82F6" strokeWidth="3"/><text x="70" y="55" textAnchor="middle" fontSize="14" fontWeight="bold" fill="#1E3A5F">r={params.r}cm</text></svg>;
      default: return null;
    }
  };

  if (step === 'menu') return (
    <div style={{ maxWidth: '500px', margin: '0 auto', padding: '24px', textAlign: 'center', background: theme.bg, minHeight: '400px' }}>
      <div style={{ fontSize: '60px', marginBottom: '8px' }}>📐</div>
      <h2 style={{ fontSize: '28px', fontWeight: '800', color: theme.heading }}>GeoQuest!</h2>
      <p style={{ fontSize: '14px', color: theme.textSecondary, marginBottom: '20px' }}>Kuasai Luas & Keliling Bangun Datar!</p>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px', marginBottom: '20px' }}>
        {shapes.map(s => (
          <div key={s.id} style={{ padding: '10px', borderRadius: '12px', background: s.mastered ? '#d1fae5' : s.unlocked ? theme.bgCard : theme.bgHover, border: `2px solid ${s.unlocked ? s.color : theme.border}`, opacity: s.unlocked ? 1 : 0.5 }}>
            <div style={{ fontSize: '28px' }}>{s.emoji}</div>
            <div style={{ fontSize: '10px', fontWeight: '600', color: theme.text }}>{s.name}</div>
            <div style={{ fontSize: '10px', color: theme.textMuted }}>{s.mastered ? '✅' : s.unlocked ? `${s.correct}/3` : '🔒'}</div>
          </div>
        ))}
      </div>
      <button onClick={start} style={{ padding: '14px 32px', borderRadius: '999px', border: 'none', background: '#7c3aed', color: '#fff', fontWeight: '700', fontSize: '16px', cursor: 'pointer' }}>🎮 Mulai!</button>
    </div>
  );

  if (step === 'complete') {
    const mastered = shapes.filter(s => s.mastered).length;
    const stars = mastered >= 3 ? 3 : mastered >= 2 ? 2 : 1;
    return (
      <div style={{ maxWidth: '500px', margin: '0 auto', padding: '24px', textAlign: 'center', background: theme.bg, minHeight: '400px' }}>
        <div style={{ fontSize: '60px' }}>🏆</div>
        <h2 style={{ fontSize: '24px', fontWeight: '800', color: theme.heading }}>Quest Selesai!</h2>
        <p style={{ color: theme.textSecondary }}>Skor: {score} | Kombo: {combo}x</p>
        <p style={{ color: theme.textSecondary }}>Bangun Dikuasai: {mastered}/{shapes.length}</p>
        <div style={{ fontSize: '40px' }}>{'⭐'.repeat(stars)}</div>
        <button onClick={handleComplete} style={{ marginTop: '16px', padding: '12px 28px', borderRadius: '999px', border: 'none', background: '#f59e0b', color: '#fff', fontWeight: '700', fontSize: '16px', cursor: 'pointer' }}>🏆 Klaim!</button>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '500px', margin: '0 auto', padding: '16px', textAlign: 'center', background: theme.bg, minHeight: '400px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '13px' }}>
        <span style={{ color: theme.textSecondary }}>Soal {qIndex + 1}/10</span>
        <span style={{ color: '#10b981', fontWeight: '700' }}>⭐ {score}</span>
        {combo >= 3 && <span style={{ color: '#f59e0b' }}>🔥 {combo}x</span>}
      </div>
      <div style={{ width: '100%', height: '6px', background: theme.border, borderRadius: '3px', marginBottom: '16px' }}>
        <div style={{ width: `${(qIndex / 10) * 100}%`, height: '100%', background: '#7c3aed', borderRadius: '3px', transition: 'width 0.3s' }} />
      </div>

      {q && (
        <div style={{ background: theme.bgCard, borderRadius: '20px', padding: '20px', boxShadow: theme.shadow, marginBottom: '16px' }}>
          <p style={{ fontSize: '13px', color: '#7c3aed', fontWeight: '700' }}>{q.type === 'area' ? '📏 LUAS' : '📐 KELILING'}</p>
          {renderSVG(q.shape, q.params)}
          <p style={{ fontSize: '12px', color: theme.textMuted }}>{q.visual}</p>
          <h3 style={{ fontSize: '20px', fontWeight: '700', color: theme.heading, marginTop: '8px' }}>{q.question}</h3>
          <button onClick={() => setShowFormula(!showFormula)} style={{ background: 'none', border: 'none', color: '#7c3aed', fontSize: '12px', cursor: 'pointer', textDecoration: 'underline', marginTop: '6px' }}>
            {showFormula ? 'Sembunyikan' : '💡 Rumus'}
          </button>
          {showFormula && <p style={{ marginTop: '6px', padding: '8px', background: '#fef3c7', borderRadius: '8px', fontSize: '13px', color: '#92400e', fontWeight: '600' }}>{shapes.find(s => s.id === q.shape)?.formula}</p>}
        </div>
      )}

      {q && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', maxWidth: '280px', margin: '0 auto' }}>
          {q.options.map((opt, i) => (
            <button key={i} onClick={() => handle(opt)} disabled={feedback} style={{
              padding: '14px', fontSize: '20px', fontWeight: '700', borderRadius: '14px', border: 'none',
              background: feedback && opt === q.answer ? '#10b981' : feedback && opt === selected ? '#ef4444' : theme.bgHover,
              color: (feedback && (opt === q.answer || opt === selected)) ? '#fff' : theme.text,
              cursor: feedback ? 'default' : 'pointer',
            }}>{opt}</button>
          ))}
        </div>
      )}

      {msg && (
        <div style={{ marginTop: '12px', padding: '10px', borderRadius: '10px', background: msg.includes('🎉') ? '#d1fae5' : '#fee2e2', color: msg.includes('🎉') ? '#065f46' : '#991b1b', fontWeight: '600', fontSize: '14px', animation: 'pop 0.3s ease-out' }}>{msg}</div>
      )}
    </div>
  );
}