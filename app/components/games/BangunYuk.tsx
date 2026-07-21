// app/components/games/BangunYuk.tsx
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
      return { 
        params: { s }, 
        area: s * s, 
        perimeter: 4 * s, 
        visual: `sisi = ${s} cm`,
        formulaHint: (type) => type === 'area' ? `${s} × ${s}` : `4 × ${s}`,
      };
    }
  },
  {
    id: 'rectangle', name: 'Persegi Panjang', emoji: '🟩',
    learnText: 'Persegi panjang punya PANJANG dan LEBAR.\nLuas = panjang × lebar\nKeliling = 2 × (panjang + lebar)',
    formula: 'L = p × l\nK = 2 × (p + l)',
    generate: () => {
      const p = Math.floor(Math.random() * 10) + 4;
      const l = Math.floor(Math.random() * 6) + 2;
      return { 
        params: { p, l }, 
        area: p * l, 
        perimeter: 2 * (p + l), 
        visual: `panjang = ${p} cm, lebar = ${l} cm`,
        formulaHint: (type) => type === 'area' ? `${p} × ${l}` : `2 × (${p} + ${l})`,
      };
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
      return { 
        params: { a, t, b, c }, 
        area: Math.round((a * t) / 2), 
        perimeter: a + b + c, 
        visual: `alas = ${a} cm, tinggi = ${t} cm, sisi = ${b} cm, ${c} cm`,
        formulaHint: (type) => type === 'area' ? `½ × ${a} × ${t}` : `${a} + ${b} + ${c}`,
      };
    }
  },
  {
    id: 'circle', name: 'Lingkaran', emoji: '🟡',
    learnText: 'Lingkaran punya JARI-JARI (r).\nLuas = π × r × r\nKeliling = 2 × π × r\n(π = 22/7 untuk r kelipatan 7)',
    formula: 'L = π × r²\nK = 2 × π × r',
    generate: () => {
      const r = Math.floor(Math.random() * 7) + 3;
      return { 
        params: { r }, 
        area: Math.round((22/7) * r * r), 
        perimeter: Math.round(2 * (22/7) * r), 
        visual: `jari-jari = ${r} cm (π = 22/7)`,
        formulaHint: (type) => type === 'area' ? `22/7 × ${r} × ${r}` : `2 × 22/7 × ${r}`,
      };
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
    const problem = shape.generate();
    setCurrentProblem(problem);
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
      
      if (correctInRow + 1 >= 3 && !learnedShapes.includes(shape.id)) {
        setLearnedShapes(prev => [...prev, shape.id]);
      }
      
      setTimeout(() => {
        if (totalQuestions + 1 >= 5) {
          if (currentShape < SHAPES.length - 1) {
            setCurrentShape(s => s + 1);
            setCorrectInRow(0);
            setTotalQuestions(0);
            setStep('learn');
          } else {
            setStep('complete');
          }
        } else {
          generateProblem();
        }
      }, 1000);
    } else {
      setCorrectInRow(0);
      setTimeout(() => {
        setFeedback(null);
        setAnswer('');
      }, 1500);
    }
  };

  const handleComplete = () => {
    const stars = learnedShapes.length >= 4 ? 3 : learnedShapes.length >= 2 ? 2 : 1;
    onComplete(stars, { score, learnedShapes: learnedShapes.length });
  };

  // ===== RENDER FUNCTIONS =====

  const renderSVG = (shapeId: string, params: Record<string, number>) => {
    const style = { width: '160px', height: '120px', margin: '0 auto' };
    
    switch (shapeId) {
      case 'square':
        return (
          <svg viewBox="0 0 160 120" style={style}>
            <rect x="40" y="10" width="80" height="80" fill="#FCD34D" stroke="#F59E0B" strokeWidth="3" rx="4"/>
            <text x="80" y="55" textAnchor="middle" fontSize="16" fill="#92400E" fontWeight="bold">{params.s} cm</text>
            <text x="80" y="100" textAnchor="middle" fontSize="12" fill="#666">{params.s} cm</text>
          </svg>
        );
      case 'rectangle':
        return (
          <svg viewBox="0 0 180 120" style={style}>
            <rect x="20" y="15" width="140" height="70" fill="#6EE7B7" stroke="#10B981" strokeWidth="3" rx="4"/>
            <text x="90" y="55" textAnchor="middle" fontSize="16" fill="#064E3B" fontWeight="bold">{params.p} × {params.l} cm</text>
          </svg>
        );
      case 'triangle':
        return (
          <svg viewBox="0 0 160 120" style={style}>
            <polygon points="80,5 10,105 150,105" fill="#FCA5A5" stroke="#EF4444" strokeWidth="3"/>
            <text x="80" y="70" textAnchor="middle" fontSize="14" fill="#7F1D1D" fontWeight="bold">alas {params.a} cm</text>
            <text x="80" y="90" textAnchor="middle" fontSize="11" fill="#7F1D1D">t = {params.t} cm</text>
          </svg>
        );
      case 'circle':
        return (
          <svg viewBox="0 0 160 120" style={style}>
            <circle cx="80" cy="60" r="40" fill="#93C5FD" stroke="#3B82F6" strokeWidth="3"/>
            <line x1="80" y1="60" x2="120" y2="60" stroke="#1E3A5F" strokeWidth="2" strokeDasharray="4"/>
            <text x="80" y="65" textAnchor="middle" fontSize="16" fill="#1E3A5F" fontWeight="bold">r = {params.r} cm</text>
          </svg>
        );
      default:
        return null;
    }
  };

  // ===== INTRO SCREEN =====
  if (step === 'intro') {
    return (
      <div style={{ maxWidth: '500px', margin: '0 auto', padding: '30px 20px', textAlign: 'center' }}>
        <div style={{ fontSize: '70px', marginBottom: '16px' }}>🏠</div>
        <h2 style={{ fontSize: '30px', fontWeight: 'bold', color: '#059669', marginBottom: '8px' }}>
          Bangun Yuk!
        </h2>
        <p style={{ color: '#666', marginBottom: '24px', lineHeight: '1.6', fontSize: '16px' }}>
          Belajar <strong>Luas & Keliling</strong> bangun datar<br/>
          dengan cara paling <strong>MUDAH</strong>! 🎯
        </p>
        
        <div style={{ 
          background: '#ECFDF5', 
          borderRadius: '20px', 
          padding: '20px', 
          marginBottom: '24px' 
        }}>
          <h3 style={{ fontWeight: 'bold', marginBottom: '12px', color: '#065F46' }}>📐 Yang Akan Dipelajari:</h3>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', fontSize: '45px', marginBottom: '16px', flexWrap: 'wrap' }}>
            {SHAPES.map(s => (
              <span key={s.id} title={s.name} style={{ cursor: 'default' }}>{s.emoji}</span>
            ))}
          </div>
          <div style={{ textAlign: 'left', fontSize: '15px', color: '#065F46', background: 'white', borderRadius: '12px', padding: '16px' }}>
            <p style={{ marginBottom: '8px' }}>📏 <strong>Luas</strong> = ukuran di <u>DALAM</u> bangun</p>
            <p>📐 <strong>Keliling</strong> = ukuran di <u>SEKELILING</u> bangun</p>
          </div>
        </div>
        
        <button 
          onClick={() => { 
            setStep('learn'); 
            generateProblem(); 
          }} 
          style={bigBtn('#059669')}
        >
          🏠 Mulai Belajar!
        </button>
      </div>
    );
  }

  // ===== LEARN SCREEN =====
  if (step === 'learn') {
    return (
      <div style={{ maxWidth: '500px', margin: '0 auto', padding: '20px', textAlign: 'center' }}>
        <div style={{ fontSize: '14px', color: '#059669', fontWeight: 'bold', marginBottom: '8px' }}>
          📖 BELAJAR: {shape.name} ({currentShape + 1}/{SHAPES.length})
        </div>
        
        {/* Progress dots */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: '6px', marginBottom: '20px' }}>
          {SHAPES.map((_, i) => (
            <div key={i} style={{
              width: i === currentShape ? '30px' : '10px',
              height: '10px',
              borderRadius: '5px',
              background: i < currentShape ? '#10B981' : i === currentShape ? '#059669' : '#D1D5DB',
              transition: 'all 0.3s',
            }} />
          ))}
        </div>
        
        <div style={{ 
          background: 'white', 
          borderRadius: '20px', 
          padding: '24px', 
          boxShadow: '0 4px 15px rgba(0,0,0,0.1)', 
          marginBottom: '20px' 
        }}>
          <div style={{ fontSize: '60px', marginBottom: '12px' }}>{shape.emoji}</div>
          <h3 style={{ fontSize: '26px', color: '#059669', marginBottom: '16px', fontWeight: 'bold' }}>
            {shape.name}
          </h3>
          
          {/* Visual SVG */}
          <div style={{ marginBottom: '16px' }}>
            {currentProblem && renderSVG(shape.id, currentProblem.params)}
          </div>
          
          {/* Penjelasan */}
          <div style={{ 
            background: '#ECFDF5', 
            borderRadius: '12px', 
            padding: '16px', 
            textAlign: 'left',
            lineHeight: '1.8',
            fontSize: '15px',
            whiteSpace: 'pre-line',
            color: '#065F46',
          }}>
            {shape.learnText}
          </div>
          
          {/* Rumus */}
          <div style={{ 
            marginTop: '12px', 
            padding: '14px', 
            background: '#FEF3C7', 
            borderRadius: '12px',
            fontWeight: 'bold',
            color: '#92400E',
            fontSize: '16px',
            whiteSpace: 'pre-line',
          }}>
            📝 <strong>Rumus:</strong>
            <br/>{shape.formula}
          </div>
        </div>
        
        <button onClick={() => setStep('practice')} style={bigBtn('#7C3AED')}>
          ✍️ Lanjut Latihan {shape.name}
        </button>
      </div>
    );
  }

  // ===== PRACTICE SCREEN =====
  if (step === 'practice') {
    return (
      <div style={{ maxWidth: '500px', margin: '0 auto', padding: '20px', textAlign: 'center' }}>
        {/* Header */}
        <div style={{ marginBottom: '16px' }}>
          <div style={{ fontSize: '14px', color: '#059669', fontWeight: 'bold' }}>
            ✍️ LATIHAN {shape.name} ({totalQuestions + 1}/5)
          </div>
          
          {/* Toggle Luas/Keliling */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginTop: '10px' }}>
            <button 
              onClick={() => { setPracticeType('area'); setAnswer(''); setFeedback(null); setShowHint(false); }}
              style={toggleBtnStyle(practiceType === 'area')}
            >
              📏 Luas
            </button>
            <button 
              onClick={() => { setPracticeType('perimeter'); setAnswer(''); setFeedback(null); setShowHint(false); }}
              style={toggleBtnStyle(practiceType === 'perimeter')}
            >
              📐 Keliling
            </button>
          </div>
        </div>

        {currentProblem && (
          <>
            {/* Soal Card */}
            <div style={{ 
              background: 'white', 
              borderRadius: '20px', 
              padding: '24px', 
              boxShadow: '0 4px 15px rgba(0,0,0,0.1)', 
              marginBottom: '20px' 
            }}>
              <div style={{ fontSize: '50px', marginBottom: '8px' }}>{shape.emoji}</div>
              
              {/* SVG Visual */}
              <div style={{ marginBottom: '12px' }}>
                {renderSVG(shape.id, currentProblem.params)}
              </div>
              
              <div style={{ fontSize: '15px', color: '#374151', marginBottom: '8px' }}>
                {currentProblem.visual}
              </div>
              
              <div style={{ 
                fontSize: '24px', 
                fontWeight: 'bold', 
                color: practiceType === 'area' ? '#7C3AED' : '#059669',
                background: practiceType === 'area' ? '#EDE9FE' : '#ECFDF5',
                padding: '8px 16px',
                borderRadius: '12px',
                display: 'inline-block',
              }}>
                {practiceType === 'area' ? 'LUAS' : 'KELILING'} = ?
              </div>
            </div>

            {/* Input Jawaban */}
            <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', alignItems: 'center', marginBottom: '12px' }}>
              <input
                type="number"
                value={answer}
                onChange={e => setAnswer(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSubmit()}
                placeholder="Jawaban"
                style={{
                  width: '110px',
                  padding: '14px',
                  fontSize: '22px',
                  textAlign: 'center',
                  borderRadius: '12px',
                  border: `3px solid ${feedback === 'wrong' ? '#EF4444' : feedback === 'correct' ? '#10B981' : '#059669'}`,
                  outline: 'none',
                  transition: 'border-color 0.2s',
                }}
                autoFocus
              />
              <span style={{ fontSize: '15px', color: '#666', fontWeight: 'bold' }}>
                cm{practiceType === 'area' ? '²' : ''}
              </span>
              <button 
                onClick={handleSubmit}
                disabled={!answer}
                style={{
                  ...navBtn('#10B981'),
                  opacity: answer ? 1 : 0.5,
                }}
              >
                ✅ Jawab
              </button>
            </div>
          </>
        )}

        {/* Hint Button */}
        <button 
          onClick={() => setShowHint(!showHint)} 
          style={{ 
            border: 'none', 
            background: 'none', 
            color: '#7C3AED', 
            cursor: 'pointer', 
            fontSize: '14px',
            textDecoration: 'underline',
            marginBottom: '8px',
          }}
        >
          {showHint ? '🙈 Sembunyikan Bantuan' : '💡 Butuh bantuan?'}
        </button>
        
        {/* Hint Content */}
        {showHint && currentProblem && (
          <div style={{ 
            padding: '14px', 
            background: '#EDE9FE', 
            borderRadius: '12px', 
            fontSize: '14px', 
            color: '#5B21B6',
            lineHeight: '1.6',
          }}>
            <strong>📝 Rumus:</strong> {shape.formula.split('\n')[practiceType === 'area' ? 0 : 1]}
            <br/>
            <strong>🔢 Hitung:</strong> {currentProblem.formulaHint(practiceType)}
            <br/>
            <strong>✅ Jawaban:</strong> {practiceType === 'area' ? currentProblem.area : currentProblem.perimeter} cm{practiceType === 'area' ? '²' : ''}
          </div>
        )}

        {/* Feedback */}
        {feedback && (
          <div style={{ 
            marginTop: '12px', 
            padding: '14px', 
            borderRadius: '12px', 
            background: feedback === 'correct' ? '#D1FAE5' : '#FEE2E2', 
            color: feedback === 'correct' ? '#065F46' : '#991B1B', 
            fontWeight: 'bold', 
            fontSize: '17px',
            border: `2px solid ${feedback === 'correct' ? '#6EE7B7' : '#FCA5A5'}`,
          }}>
            {feedback === 'correct' 
              ? `🎉 Benar! ${practiceType === 'area' ? 'Luas' : 'Keliling'} = ${currentProblem?.[practiceType]} cm${practiceType === 'area' ? '²' : ''}`
              : `❌ Jawaban yang benar: ${currentProblem?.[practiceType]} cm${practiceType === 'area' ? '²' : ''}`}
          </div>
        )}

        {/* Score */}
        <div style={{ marginTop: '12px', fontSize: '13px', color: '#666' }}>
          Benar: {score} | Beruntun: {correctInRow}
        </div>
      </div>
    );
  }

  // ===== COMPLETE SCREEN =====
  if (step === 'complete') {
    const stars = learnedShapes.length >= 4 ? 3 : learnedShapes.length >= 2 ? 2 : 1;
    return (
      <div style={{ maxWidth: '500px', margin: '0 auto', padding: '30px 20px', textAlign: 'center' }}>
        <div style={{ fontSize: '80px', marginBottom: '16px', animation: 'bounce 1s infinite' }}>🏆</div>
        <h2 style={{ fontSize: '28px', color: '#059669', marginBottom: '8px', fontWeight: 'bold' }}>
          KAMU HEBAT! 🎉
        </h2>
        <p style={{ color: '#666', marginBottom: '20px', fontSize: '16px' }}>
          Kamu sudah belajar luas & keliling 4 bangun datar!
        </p>
        
        <div style={{ 
          background: '#ECFDF5', 
          borderRadius: '20px', 
          padding: '20px', 
          margin: '20px 0' 
        }}>
          <p style={{ fontSize: '16px', marginBottom: '8px' }}>⭐ Skor: <strong>{score}</strong></p>
          <p style={{ fontSize: '16px', marginBottom: '16px' }}>📐 Bangun Dipelajari: <strong>{learnedShapes.length}/4</strong></p>
          <div style={{ fontSize: '45px' }}>
            {learnedShapes.map(s => {
              const shape = SHAPES.find(sh => sh.id === s);
              return <span key={s} title={shape?.name} style={{ margin: '0 4px' }}>{shape?.emoji}</span>;
            })}
            {Array.from({ length: 4 - learnedShapes.length }).map((_, i) => (
              <span key={i} style={{ opacity: 0.3, margin: '0 4px' }}>❓</span>
            ))}
          </div>
        </div>
        
        <div style={{ fontSize: '50px', marginBottom: '16px' }}>
          {'⭐'.repeat(stars)}{'☆'.repeat(3 - stars)}
        </div>
        
        <button onClick={handleComplete} style={bigBtn('#F59E0B')}>
          🏆 Klaim Hadiah!
        </button>
      </div>
    );
  }

  return null;
}

// ===== STYLE HELPERS =====

function bigBtn(color: string): React.CSSProperties {
  return {
    padding: '14px 36px',
    fontSize: '18px',
    fontWeight: 'bold',
    borderRadius: '999px',
    border: 'none',
    background: color,
    color: 'white',
    cursor: 'pointer',
    boxShadow: '0 4px 20px rgba(0,0,0,0.2)',
    transition: 'transform 0.2s',
  };
}

function navBtn(color: string): React.CSSProperties {
  return {
    padding: '14px 20px',
    fontSize: '16px',
    fontWeight: 'bold',
    borderRadius: '12px',
    border: 'none',
    background: color,
    color: 'white',
    cursor: 'pointer',
  };
}

function toggleBtnStyle(active: boolean): React.CSSProperties {
  return { 
    padding: '8px 20px', 
    borderRadius: '20px', 
    border: 'none',
    background: active ? '#7C3AED' : '#E5E7EB',
    color: active ? 'white' : '#374151',
    fontWeight: 'bold',
    cursor: 'pointer',
    fontSize: '14px',
    transition: 'all 0.2s',
  };
}