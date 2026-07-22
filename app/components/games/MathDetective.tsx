// app/components/games/MathDetective.tsx
'use client';

import { useState } from 'react';
import { useThemeStyles } from '@/hooks/useThemeStyles';

interface MathDetectiveProps {
  onComplete: (stars: number, extra?: any) => void;
}

interface Case {
  id: number; title: string; story: string; clues: string[];
  questions: { id: number; question: string; type: 'multiple' | 'input'; options?: string[]; answer: string; hint: string; points: number }[];
  suspect: string; difficulty: 'easy' | 'medium' | 'hard'; solved: boolean;
}

const CASES: Case[] = [
  { id: 1, title: "Misteri Kue Hilang", story: "🔍 Kue 8 bagian. Kucing makan 3/8, Tikus 1/4. Sisa?", clues: ["Kue utuh = 8/8", "Kucing: 3/8", "Tikus: 2/8"], questions: [{ id: 1, question: "Berapa yang sudah dimakan? (per 8)", type: 'multiple', options: ['3/8', '5/8', '6/8', '4/8'], answer: '5/8', hint: "3/8 + 2/8 = ?", points: 20 }, { id: 2, question: "Berapa sisa kue?", type: 'multiple', options: ['3/8', '2/8', '1/4', '3/4'], answer: '3/8', hint: "8/8 - 5/8", points: 30 }, { id: 3, question: "Harga kue hilang? (total Rp80.000)", type: 'multiple', options: ['Rp 30.000', 'Rp 50.000', 'Rp 40.000', 'Rp 60.000'], answer: 'Rp 50.000', hint: "5/8 × 80.000", points: 50 }], suspect: "Kucing & Tikus!", difficulty: 'easy', solved: false },
  { id: 2, title: "Pencurian Toko Mainan", story: "🎯 150 mainan, 2/5 dicuri. 3/10 di rumah A, sisanya di B.", clues: ["Total: 150", "Dicuri: 2/5 × 150", "A: 3/10 × dicuri"], questions: [{ id: 1, question: "Berapa mainan dicuri?", type: 'input', answer: '60', hint: "2/5 × 150", points: 25 }, { id: 2, question: "Berapa di rumah A?", type: 'multiple', options: ['15', '18', '20', '24'], answer: '18', hint: "3/10 × 60", points: 35 }, { id: 3, question: "Persen di B dari yang dicuri?", type: 'multiple', options: ['60%', '70%', '75%', '80%'], answer: '70%', hint: "42/60 × 100%", points: 40 }], suspect: "Tersangka B!", difficulty: 'medium', solved: false },
  { id: 3, title: "Misteri Bangun Datar", story: "📐 Taman 24×16m, kolam d=14m. Hitung luas rumput.", clues: ["Luas taman = p×l", "Luas kolam = πr²", "d=14 → r=7"], questions: [{ id: 1, question: "Luas taman?", type: 'input', answer: '384', hint: "24×16", points: 20 }, { id: 2, question: "Luas kolam? (π=22/7)", type: 'multiple', options: ['154 m²', '144 m²', '164 m²', '174 m²'], answer: '154 m²', hint: "22/7×7×7", points: 40 }, { id: 3, question: "Luas rumput?", type: 'multiple', options: ['220 m²', '230 m²', '240 m²', '250 m²'], answer: '230 m²', hint: "384-154", points: 40 }], suspect: "230m² rumput!", difficulty: 'hard', solved: false },
  { id: 4, title: "Skala Harta Karun", story: "🗺️ Skala 1:250.000. Jarak peta: 8+12+5=25cm.", clues: ["1cm = 250.000cm = 2,5km", "Total peta = 25cm"], questions: [{ id: 1, question: "Jarak start-gua sebenarnya?", type: 'multiple', options: ['15 km', '20 km', '25 km', '30 km'], answer: '20 km', hint: "8×2,5", points: 30 }, { id: 2, question: "Total jarak peta?", type: 'input', answer: '25', hint: "8+12+5", points: 20 }, { id: 3, question: "Total perjalanan sebenarnya?", type: 'multiple', options: ['60,5 km', '62,5 km', '65 km', '67,5 km'], answer: '62,5 km', hint: "25×2,5", points: 50 }], suspect: "62,5 km!", difficulty: 'hard', solved: false },
];

export default function MathDetective({ onComplete }: MathDetectiveProps) {
  const theme = useThemeStyles();
  const [cases, setCases] = useState<Case[]>(CASES);
  const [currentCase, setCurrentCase] = useState<Case | null>(null);
  const [qIdx, setQIdx] = useState(0);
  const [selected, setSelected] = useState('');
  const [inputAns, setInputAns] = useState('');
  const [feedback, setFeedback] = useState(false);
  const [correct, setCorrect] = useState(false);
  const [score, setScore] = useState(0);
  const [showHint, setShowHint] = useState(false);
  const [hintUsed, setHintUsed] = useState(false);
  const [phase, setPhase] = useState<'menu' | 'brief' | 'quiz' | 'result' | 'complete'>('menu');
  const [solved, setSolved] = useState<number[]>([]);
  const [msg, setMsg] = useState('');

  const startCase = (c: Case) => { setCurrentCase(c); setQIdx(0); setScore(0); setPhase('brief'); };

  const handleAnswer = () => {
    if (!currentCase || feedback) return;
    const q = currentCase.questions[qIdx];
    const ans = q.type === 'input' ? inputAns : selected;
    if (!ans) return;
    const ok = ans.toString().toLowerCase() === q.answer.toString().toLowerCase();
    setCorrect(ok); setFeedback(true);
    if (ok) { const pts = hintUsed ? Math.floor(q.points / 2) : q.points; setScore(s => s + pts); setMsg(`🎉 +${pts} poin!`); }
    else setMsg('❌ Belum tepat');
    setTimeout(() => {
      if (qIdx < currentCase.questions.length - 1) {
        setQIdx(i => i + 1); setSelected(''); setInputAns(''); setFeedback(false); setShowHint(false); setHintUsed(false); setMsg('');
      } else {
        const newSolved = [...solved, currentCase.id];
        setSolved(newSolved);
        setCases(p => p.map(c => c.id === currentCase.id ? { ...c, solved: true } : c));
        setPhase('result');
      }
    }, 1500);
  };

  const finish = () => {
    setPhase('complete');
    const stars = solved.length >= 3 ? 3 : solved.length >= 2 ? 2 : 1;
    onComplete(stars, { solvedCases: solved.length, totalCases: cases.length, score });
  };

  if (phase === 'complete') {
    const stars = solved.length >= 3 ? 3 : solved.length >= 2 ? 2 : 1;
    return (
      <div style={{ maxWidth: '500px', margin: '0 auto', padding: '24px', textAlign: 'center', background: theme.bg, minHeight: '400px' }}>
        <div style={{ fontSize: '60px' }}>🏆</div>
        <h2 style={{ fontSize: '24px', fontWeight: '800', color: theme.heading }}>Detektif Hebat!</h2>
        <p style={{ color: theme.textSecondary }}>{solved.length}/{cases.length} kasus terpecahkan</p>
        <div style={{ fontSize: '40px' }}>{'⭐'.repeat(stars)}</div>
        <button onClick={finish} style={{ marginTop: '16px', padding: '12px 24px', borderRadius: '999px', border: 'none', background: '#f59e0b', color: '#fff', fontWeight: '700', cursor: 'pointer' }}>🏆 Klaim!</button>
      </div>
    );
  }

  if (phase === 'menu') return (
    <div style={{ maxWidth: '500px', margin: '0 auto', padding: '24px', textAlign: 'center', background: theme.bg, minHeight: '400px' }}>
      <div style={{ fontSize: '60px', marginBottom: '8px' }}>🔍</div>
      <h2 style={{ fontSize: '28px', fontWeight: '800', color: theme.heading }}>Math Detective!</h2>
      <p style={{ fontSize: '14px', color: theme.textSecondary, marginBottom: '16px' }}>Pecahkan misteri dengan matematika!</p>
      <div style={{ display: 'grid', gap: '8px' }}>
        {cases.map(c => (
          <button key={c.id} onClick={() => startCase(c)} disabled={c.solved} style={{
            padding: '14px', borderRadius: '14px', border: c.solved ? '2px solid #10b981' : `1px solid ${theme.border}`,
            background: c.solved ? '#d1fae5' : theme.bgCard, cursor: c.solved ? 'default' : 'pointer',
            display: 'flex', alignItems: 'center', gap: '10px', textAlign: 'left', opacity: c.solved ? 0.7 : 1,
          }}>
            <span style={{ fontSize: '28px' }}>{c.solved ? '✅' : c.difficulty === 'easy' ? '⭐' : c.difficulty === 'medium' ? '⭐⭐' : '⭐⭐⭐'}</span>
            <div>
              <p style={{ fontWeight: '700', color: theme.heading, margin: 0 }}>{c.title}</p>
              <p style={{ fontSize: '12px', color: theme.textSecondary, margin: 0 }}>{c.questions.length} pertanyaan</p>
            </div>
          </button>
        ))}
      </div>
      {solved.length > 0 && <button onClick={finish} style={{ marginTop: '16px', padding: '14px 24px', borderRadius: '999px', border: 'none', background: '#f59e0b', color: '#fff', fontWeight: '700', cursor: 'pointer', width: '100%' }}>🏆 Selesaikan ({solved.length}/{cases.length})</button>}
    </div>
  );

  if (phase === 'brief' && currentCase) return (
    <div style={{ maxWidth: '500px', margin: '0 auto', padding: '24px', background: theme.bg, minHeight: '400px' }}>
      <div style={{ background: 'linear-gradient(135deg, #1e3a5f, #2e1065)', borderRadius: '16px', padding: '20px', color: '#fff', marginBottom: '16px' }}>
        <h3 style={{ fontSize: '20px', fontWeight: '800', marginBottom: '4px' }}>📋 {currentCase.title}</h3>
        <span style={{ display: 'inline-block', padding: '4px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: '700', background: currentCase.difficulty === 'easy' ? '#10b981' : currentCase.difficulty === 'medium' ? '#f59e0b' : '#ef4444' }}>{currentCase.difficulty === 'easy' ? '⭐ Mudah' : currentCase.difficulty === 'medium' ? '⭐⭐ Sedang' : '⭐⭐⭐ Sulit'}</span>
        <p style={{ marginTop: '10px', fontSize: '14px', opacity: 0.9 }}>{currentCase.story}</p>
        <div style={{ background: 'rgba(255,255,255,0.1)', borderRadius: '10px', padding: '10px', marginTop: '10px' }}>
          <p style={{ fontWeight: '700', marginBottom: '4px' }}>🔑 Petunjuk:</p>
          {currentCase.clues.map((c, i) => <p key={i} style={{ fontSize: '12px', margin: '2px 0' }}>▶ {c}</p>)}
        </div>
      </div>
      <button onClick={() => setPhase('quiz')} style={{ padding: '14px 24px', borderRadius: '999px', border: 'none', background: '#7c3aed', color: '#fff', fontWeight: '700', fontSize: '16px', cursor: 'pointer', width: '100%' }}>🔍 Mulai Investigasi!</button>
    </div>
  );

  if (phase === 'quiz' && currentCase) {
    const q = currentCase.questions[qIdx];
    return (
      <div style={{ maxWidth: '500px', margin: '0 auto', padding: '16px', textAlign: 'center', background: theme.bg, minHeight: '400px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '13px' }}>
          <span style={{ color: theme.textSecondary }}>{qIdx + 1}/{currentCase.questions.length}</span>
          <span style={{ color: '#f59e0b', fontWeight: '700' }}>⭐ {score}</span>
        </div>
        <div style={{ width: '100%', height: '6px', background: theme.border, borderRadius: '3px', marginBottom: '16px' }}>
          <div style={{ width: `${(qIdx / currentCase.questions.length) * 100}%`, height: '100%', background: '#7c3aed', borderRadius: '3px', transition: 'width 0.3s' }} />
        </div>
        <div style={{ background: theme.bgCard, borderRadius: '16px', padding: '20px', boxShadow: theme.shadow, marginBottom: '16px' }}>
          <div style={{ fontSize: '40px', marginBottom: '8px' }}>🤔</div>
          <h3 style={{ fontSize: '18px', fontWeight: '700', color: theme.heading }}>{q.question}</h3>
          <p style={{ fontSize: '12px', color: theme.textMuted }}>+{q.points} poin {hintUsed ? '(-50%)' : ''}</p>
        </div>
        {q.type === 'multiple' ? (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', maxWidth: '350px', margin: '0 auto' }}>
            {q.options?.map((opt, i) => (
              <button key={i} onClick={() => setSelected(opt)} style={{
                padding: '12px', borderRadius: '12px', border: selected === opt ? '2px solid #7c3aed' : `1px solid ${theme.border}`,
                background: selected === opt ? '#ede9fe' : theme.bgCard, color: theme.text, fontWeight: '600', cursor: 'pointer',
              }}>{opt}</button>
            ))}
          </div>
        ) : (
          <input type="text" value={inputAns} onChange={e => setInputAns(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleAnswer()} placeholder="Jawaban..." style={{ width: '200px', padding: '12px', fontSize: '18px', textAlign: 'center', borderRadius: '12px', border: `2px solid ${theme.border}`, background: theme.input, color: theme.text, outline: 'none' }} autoFocus />
        )}
        <button onClick={() => { setShowHint(!showHint); if (!showHint) setHintUsed(true); }} style={{ background: 'none', border: 'none', color: '#f59e0b', fontSize: '12px', cursor: 'pointer', marginTop: '8px' }}>💡 {showHint ? 'Sembunyikan' : 'Petunjuk (-50%)'}</button>
        {showHint && <p style={{ fontSize: '12px', color: '#92400e', background: '#fef3c7', borderRadius: '8px', padding: '8px', marginTop: '4px' }}>{q.hint}</p>}
        <button onClick={handleAnswer} disabled={!selected && !inputAns} style={{ marginTop: '12px', padding: '12px 20px', borderRadius: '10px', border: 'none', background: (!selected && !inputAns) ? '#d1d5db' : '#10b981', color: '#fff', fontWeight: '700', cursor: (!selected && !inputAns) ? 'default' : 'pointer' }}>✅ Jawab</button>
        {msg && <div style={{ marginTop: '10px', padding: '10px', borderRadius: '10px', background: msg.includes('🎉') ? '#d1fae5' : '#fee2e2', color: msg.includes('🎉') ? '#065f46' : '#991b1b', fontWeight: '600', animation: 'pop 0.3s ease-out' }}>{msg}</div>}
      </div>
    );
  }

  if (phase === 'result' && currentCase) return (
    <div style={{ maxWidth: '500px', margin: '0 auto', padding: '24px', textAlign: 'center', background: theme.bg, minHeight: '400px' }}>
      <div style={{ fontSize: '60px' }}>🎉</div>
      <h2 style={{ fontSize: '24px', fontWeight: '800', color: '#10b981' }}>Kasus Terpecahkan!</h2>
      <p style={{ color: theme.textSecondary }}>{currentCase.suspect}</p>
      <p style={{ color: theme.textSecondary }}>Skor: {score}</p>
      <button onClick={() => setPhase('menu')} style={{ marginTop: '16px', padding: '12px 24px', borderRadius: '999px', border: 'none', background: '#7c3aed', color: '#fff', fontWeight: '700', cursor: 'pointer' }}>🔍 Kasus Lain</button>
    </div>
  );

  return null;
}