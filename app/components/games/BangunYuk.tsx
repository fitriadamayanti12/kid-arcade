'use client';

import { useState } from 'react';

interface BangunYukProps {
  onComplete: (stars: number, extra?: any) => void;
}

interface ShapeProblem {
  params: Record<string, number>;
  area: number;
  perimeter: number;
  visual: string;
  formulaHint: (type: 'area' | 'perimeter') => string;
}

interface ShapeDef {
  id: string;
  name: string;
  emoji: string;
  learnText: string;
  formula: string;
  generate: () => ShapeProblem;
}

const SHAPES: ShapeDef[] = [
  { 
    id: 'square', name: 'Persegi', emoji: '🟨',
    learnText: 'Persegi punya 4 sisi SAMA PANJANG.\nLuas = sisi × sisi\nKeliling = 4 × sisi',
    formula: 'L = s × s\nK = 4 × s',
    generate: () => {
      const s = Math.floor(Math.random() * 8) + 3;
      return { params: { s }, area: s * s, perimeter: 4 * s, visual: `sisi = ${s} cm`, formulaHint: (type) => type === 'area' ? `${s} × ${s}` : `4 × ${s}` };
    }
  },
  {
    id: 'rectangle', name: 'Persegi Panjang', emoji: '🟩',
    learnText: 'Persegi panjang punya PANJANG dan LEBAR.\nLuas = panjang × lebar\nKeliling = 2 × (panjang + lebar)',
    formula: 'L = p × l\nK = 2 × (p + l)',
    generate: () => {
      const p = Math.floor(Math.random() * 10) + 4;
      const l = Math.floor(Math.random() * 6) + 2;
      return { params: { p, l }, area: p * l, perimeter: 2 * (p + l), visual: `p=${p}cm, l=${l}cm`, formulaHint: (type) => type === 'area' ? `${p} × ${l}` : `2 × (${p} + ${l})` };
    }
  },
  {
    id: 'triangle', name: 'Segitiga', emoji: '🔺',
    learnText: 'Segitiga punya ALAS dan TINGGI.\nLuas = ½ × alas × tinggi\nKeliling = jumlah semua sisi',
    formula: 'L = ½ × a × t\nK = a + b + c',
    generate: () => {
      const a = Math.floor(Math.random() * 8) + 3;
      const t = Math.floor(Math.random() * 8) + 3;
      const b = Math.floor(Math.random() * 6) + 3;
      const c = Math.floor(Math.random() * 6) + 3;
      return { params: { a, t, b, c }, area: Math.round((a * t) / 2), perimeter: a + b + c, visual: `alas=${a}cm, t=${t}cm`, formulaHint: (type) => type === 'area' ? `½ × ${a} × ${t}` : `${a} + ${b} + ${c}` };
    }
  },
  {
    id: 'circle', name: 'Lingkaran', emoji: '🟡',
    learnText: 'Lingkaran punya JARI-JARI (r).\nLuas = π × r × r\nKeliling = 2 × π × r\n(π = 22/7)',
    formula: 'L = π × r²\nK = 2 × π × r',
    generate: () => {
      const r = Math.floor(Math.random() * 7) + 3;
      return { params: { r }, area: Math.round((22/7) * r * r), perimeter: Math.round(2 * (22/7) * r), visual: `r = ${r}cm (π=22/7)`, formulaHint: (type) => type === 'area' ? `22/7 × ${r} × ${r}` : `2 × 22/7 × ${r}` };
    }
  },
];

export default function BangunYuk({ onComplete }: BangunYukProps) {
  const [step, setStep] = useState<'intro' | 'learn' | 'practice' | 'complete'>('intro');
  const [currentShape, setCurrentShape] = useState(0);
  const [practiceType, setPracticeType] = useState<'area' | 'perimeter'>('area');
  const [currentProblem, setCurrentProblem] = useState<ShapeProblem | null>(null);
  const [answer, setAnswer] = useState('');
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);
  const [score, setScore] = useState(0);
  const [totalQuestions, setTotalQuestions] = useState(0);
  const [correctInRow, setCorrectInRow] = useState(0);
  const [showHint, setShowHint] = useState(false);
  const [learnedShapes, setLearnedShapes] = useState<string[]>([]);

  const shape = SHAPES[currentShape];

  const generateProblem = () => {
    setCurrentProblem(shape.generate());
    setAnswer('');
    setFeedback(null);
    setShowHint(false);
  };

  const handleSubmit = () => {
    if (!currentProblem) return;
    const userAnswer = parseInt(answer);
    if (isNaN(userAnswer)) return;
    const correctAnswer = practiceType === 'area' ? currentProblem.area : currentProblem.perimeter;
    const correct = userAnswer === correctAnswer;
    setFeedback(correct ? 'correct' : 'wrong');
    setTotalQuestions(t => t + 1);
    if (correct) {
      setScore(s => s + 1);
      setCorrectInRow(c => c + 1);
      if (correctInRow + 1 >= 3 && !learnedShapes.includes(shape.id)) setLearnedShapes(prev => [...prev, shape.id]);
      setTimeout(() => {
        if (totalQuestions + 1 >= 5) {
          if (currentShape < SHAPES.length - 1) { setCurrentShape(s => s + 1); setCorrectInRow(0); setTotalQuestions(0); setStep('learn'); }
          else setStep('complete');
        } else generateProblem();
      }, 1000);
    } else { setCorrectInRow(0); setTimeout(() => { setFeedback(null); setAnswer(''); }, 1500); }
  };

  const handleComplete = () => {
    const stars = learnedShapes.length >= 4 ? 3 : learnedShapes.length >= 2 ? 2 : 1;
    onComplete(stars, { score, learnedShapes: learnedShapes.length });
  };

  const renderSVG = (shapeId: string, params: Record<string, number>) => {
    const svgStyle = { width: '160px', height: '120px', margin: '0 auto' };
    switch (shapeId) {
      case 'square': return <svg viewBox="0 0 160 120" style={svgStyle}><rect x="40" y="10" width="80" height="80" fill="#FCD34D" stroke="#F59E0B" strokeWidth="3" rx="4"/><text x="80" y="55" textAnchor="middle" fontSize="16" fill="#92400E" fontWeight="bold">{params.s} cm</text></svg>;
      case 'rectangle': return <svg viewBox="0 0 180 120" style={svgStyle}><rect x="20" y="15" width="140" height="70" fill="#6EE7B7" stroke="#10B981" strokeWidth="3" rx="4"/><text x="90" y="55" textAnchor="middle" fontSize="16" fill="#064E3B" fontWeight="bold">{params.p}×{params.l} cm</text></svg>;
      case 'triangle': return <svg viewBox="0 0 160 120" style={svgStyle}><polygon points="80,5 10,105 150,105" fill="#FCA5A5" stroke="#EF4444" strokeWidth="3"/><text x="80" y="70" textAnchor="middle" fontSize="14" fill="#7F1D1D" fontWeight="bold">alas {params.a}cm</text></svg>;
      case 'circle': return <svg viewBox="0 0 160 120" style={svgStyle}><circle cx="80" cy="60" r="40" fill="#93C5FD" stroke="#3B82F6" strokeWidth="3"/><line x1="80" y1="60" x2="120" y2="60" stroke="#1E3A5F" strokeWidth="2" strokeDasharray="4"/><text x="80" y="65" textAnchor="middle" fontSize="16" fill="#1E3A5F" fontWeight="bold">r={params.r}cm</text></svg>;
      default: return null;
    }
  };

  // ===== INTRO =====
  if (step === 'intro') return (
    <div className="max-w-lg mx-auto p-8 text-center">
      <div className="text-7xl mb-4">🏠</div>
      <h2 className="text-3xl font-bold text-emerald-600 dark:text-emerald-400 mb-2">Bangun Yuk!</h2>
      <p className="text-gray-600 dark:text-gray-300 mb-6">Belajar <strong>Luas & Keliling</strong> bangun datar dengan cara paling <strong>MUDAH</strong>! 🎯</p>
      <div className="bg-emerald-50 dark:bg-emerald-900/30 rounded-2xl p-5 mb-6">
        <h3 className="font-bold text-emerald-700 dark:text-emerald-300 mb-3">📐 Yang Akan Dipelajari:</h3>
        <div className="flex justify-center gap-4 text-5xl mb-4 flex-wrap">{SHAPES.map(s => <span key={s.id} title={s.name}>{s.emoji}</span>)}</div>
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 text-left text-sm text-gray-700 dark:text-gray-300">
          <p className="mb-2">📏 <strong>Luas</strong> = ukuran di DALAM bangun</p>
          <p>📐 <strong>Keliling</strong> = ukuran di SEKELILING bangun</p>
        </div>
      </div>
      <button onClick={() => { setStep('learn'); generateProblem(); }} className="px-8 py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-full font-bold text-lg transition">🏠 Mulai Belajar!</button>
    </div>
  );

  // ===== LEARN =====
  if (step === 'learn') return (
    <div className="max-w-lg mx-auto p-5 text-center">
      <p className="text-sm text-emerald-600 dark:text-emerald-400 font-bold mb-2">📖 BELAJAR: {shape.name} ({currentShape + 1}/{SHAPES.length})</p>
      <div className="flex justify-center gap-1.5 mb-5">{SHAPES.map((_, i) => <div key={i} className="rounded-full transition-all" style={{ width: i === currentShape ? '30px' : '10px', height: '10px', background: i < currentShape ? '#10B981' : i === currentShape ? '#059669' : '#D1D5DB' }}/>)}</div>
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg mb-5">
        <div className="text-6xl mb-3">{shape.emoji}</div>
        <h3 className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 mb-4">{shape.name}</h3>
        {currentProblem && <div className="mb-4">{renderSVG(shape.id, currentProblem.params)}</div>}
        <div className="bg-emerald-50 dark:bg-emerald-900/30 rounded-xl p-4 text-left text-sm whitespace-pre-line text-emerald-700 dark:text-emerald-300">{shape.learnText}</div>
        <div className="mt-3 p-3.5 bg-yellow-50 dark:bg-yellow-900/30 rounded-xl font-bold text-yellow-700 dark:text-yellow-300 text-sm whitespace-pre-line">📝 <strong>Rumus:</strong><br/>{shape.formula}</div>
      </div>
      <button onClick={() => setStep('practice')} className="px-8 py-3.5 bg-purple-600 hover:bg-purple-700 text-white rounded-full font-bold text-lg transition">✍️ Lanjut Latihan {shape.name}</button>
    </div>
  );

  // ===== PRACTICE =====
  if (step === 'practice') return (
    <div className="max-w-lg mx-auto p-5 text-center">
      <p className="text-sm text-emerald-600 dark:text-emerald-400 font-bold mb-3">✍️ LATIHAN {shape.name} ({totalQuestions + 1}/5)</p>
      <div className="flex justify-center gap-2 mb-4">
        <button onClick={() => { setPracticeType('area'); setAnswer(''); setFeedback(null); }} className={`px-5 py-2 rounded-full font-bold text-sm transition ${practiceType === 'area' ? 'bg-purple-600 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'}`}>📏 Luas</button>
        <button onClick={() => { setPracticeType('perimeter'); setAnswer(''); setFeedback(null); }} className={`px-5 py-2 rounded-full font-bold text-sm transition ${practiceType === 'perimeter' ? 'bg-purple-600 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'}`}>📐 Keliling</button>
      </div>
      {currentProblem && (
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg mb-5">
          <div className="text-5xl mb-2">{shape.emoji}</div>
          <div className="mb-3">{renderSVG(shape.id, currentProblem.params)}</div>
          <p className="text-gray-700 dark:text-gray-300 mb-2">{currentProblem.visual}</p>
          <p className={`inline-block px-4 py-2 rounded-xl text-xl font-bold ${practiceType === 'area' ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300' : 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300'}`}>{practiceType === 'area' ? 'LUAS' : 'KELILING'} = ?</p>
        </div>
      )}
      <div className="flex gap-2 justify-center items-center mb-3">
        <input type="number" value={answer} onChange={e => setAnswer(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleSubmit()} placeholder="Jawaban"
          className={`w-28 p-3.5 text-xl text-center rounded-xl border-3 outline-none transition bg-white dark:bg-gray-700 text-gray-900 dark:text-white ${feedback === 'wrong' ? 'border-red-500' : feedback === 'correct' ? 'border-green-500' : 'border-emerald-500'}`} autoFocus />
        <span className="text-gray-600 dark:text-gray-400 font-bold">cm{practiceType === 'area' ? '²' : ''}</span>
        <button onClick={handleSubmit} disabled={!answer} className="px-5 py-3.5 bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white rounded-xl font-bold transition">✅ Jawab</button>
      </div>
      <button onClick={() => setShowHint(!showHint)} className="text-purple-600 dark:text-purple-400 underline text-sm mb-2">{showHint ? '🙈 Sembunyikan' : '💡 Butuh bantuan?'}</button>
      {showHint && currentProblem && (
        <div className="bg-purple-50 dark:bg-purple-900/30 rounded-xl p-3.5 text-sm text-purple-700 dark:text-purple-300">
          <strong>📝 Rumus:</strong> {shape.formula.split('\n')[practiceType === 'area' ? 0 : 1]}<br/>
          <strong>🔢 Hitung:</strong> {currentProblem.formulaHint(practiceType)}<br/>
          <strong>✅ Jawaban:</strong> {practiceType === 'area' ? currentProblem.area : currentProblem.perimeter} cm{practiceType === 'area' ? '²' : ''}
        </div>
      )}
      {feedback && (
        <div className={`mt-3 p-3.5 rounded-xl font-bold text-base border-2 ${feedback === 'correct' ? 'bg-green-50 dark:bg-green-900/30 border-green-300 dark:border-green-700 text-green-700 dark:text-green-300' : 'bg-red-50 dark:bg-red-900/30 border-red-300 dark:border-red-700 text-red-700 dark:text-red-300'}`}>
          {feedback === 'correct' ? `🎉 Benar! = ${currentProblem?.[practiceType]} cm${practiceType === 'area' ? '²' : ''}` : `❌ Jawaban: ${currentProblem?.[practiceType]} cm${practiceType === 'area' ? '²' : ''}`}
        </div>
      )}
      <p className="mt-3 text-sm text-gray-500 dark:text-gray-400">Benar: {score} | Beruntun: {correctInRow}</p>
    </div>
  );

  // ===== COMPLETE =====
  if (step === 'complete') {
    const stars = learnedShapes.length >= 4 ? 3 : learnedShapes.length >= 2 ? 2 : 1;
    return (
      <div className="max-w-lg mx-auto p-8 text-center">
        <div className="text-8xl mb-4 animate-bounce">🏆</div>
        <h2 className="text-3xl font-bold text-emerald-600 dark:text-emerald-400 mb-2">KAMU HEBAT! 🎉</h2>
        <p className="text-gray-600 dark:text-gray-300 mb-5">Kamu sudah belajar luas & keliling 4 bangun datar!</p>
        <div className="bg-emerald-50 dark:bg-emerald-900/30 rounded-2xl p-5 mb-5">
          <p className="text-lg mb-2 text-gray-700 dark:text-gray-300">⭐ Skor: <strong>{score}</strong></p>
          <p className="text-lg mb-4 text-gray-700 dark:text-gray-300">📐 Bangun Dipelajari: <strong>{learnedShapes.length}/4</strong></p>
          <div className="text-5xl">{learnedShapes.map(s => <span key={s} className="mx-1">{SHAPES.find(sh => sh.id === s)?.emoji}</span>)}{Array.from({ length: 4 - learnedShapes.length }).map((_, i) => <span key={i} className="mx-1 opacity-30">❓</span>)}</div>
        </div>
        <div className="text-5xl mb-4">{'⭐'.repeat(stars)}{'☆'.repeat(3 - stars)}</div>
        <button onClick={handleComplete} className="px-8 py-3.5 bg-amber-500 hover:bg-amber-600 text-white rounded-full font-bold text-lg transition">🏆 Klaim Hadiah!</button>
      </div>
    );
  }

  return null;
}