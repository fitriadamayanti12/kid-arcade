// app/components/games/MagicTable.tsx
'use client';

import { useState, useEffect } from 'react';

interface MagicTableProps {
  onComplete: (stars: number, extra?: any) => void;
}

export default function MagicTable({ onComplete }: MagicTableProps) {
  const [step, setStep] = useState<'intro' | 'learn' | 'practice' | 'quiz' | 'complete'>('intro');
  const [currentTable, setCurrentTable] = useState(2);
  const [currentMultiplier, setCurrentMultiplier] = useState(1);
  const [showAnswer, setShowAnswer] = useState(false);
  const [practiceAnswer, setPracticeAnswer] = useState('');
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);
  const [score, setScore] = useState(0);
  const [totalQuestions, setTotalQuestions] = useState(0);
  const [stars, setStars] = useState(0);
  const [learnedTables, setLearnedTables] = useState<number[]>([]);
  const [quizQuestions, setQuizQuestions] = useState<{ q: string; a: number }[]>([]);
  const [quizIndex, setQuizIndex] = useState(0);
  const [quizAnswer, setQuizAnswer] = useState('');

  // Generate quiz questions
  const generateQuiz = (table: number) => {
    const questions = [];
    const multipliers = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
    // Shuffle
    for (let i = multipliers.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [multipliers[i], multipliers[j]] = [multipliers[j], multipliers[i]];
    }
    
    for (const m of multipliers) {
      questions.push({
        q: `${table} × ${m} = ?`,
        a: table * m,
      });
    }
    return questions.slice(0, 5);
  };

  // Cara visual: Menampilkan perkalian sebagai baris × kolom dengan emoji
  const renderVisualMultiplication = (table: number, multiplier: number) => {
    const rows = Math.min(table, 5); // Max 5 rows for display
    const cols = Math.min(multiplier, 10); // Max 10 cols
    
    const displayRows = table <= 5 ? table : 5;
    const displayCols = multiplier <= 10 ? multiplier : 10;
    
    const emojis = ['🌟', '⭐', '💛', '✨', '🔸'];
    
    return (
      <div style={{ 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center',
        gap: '4px',
        padding: '16px',
        background: '#FFFBEB',
        borderRadius: '16px',
        marginBottom: '16px',
      }}>
        <div style={{ fontSize: '14px', color: '#92400E', marginBottom: '8px', fontWeight: 'bold' }}>
          {table} × {multiplier} = {table} baris × {multiplier} kolom
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
          {Array.from({ length: displayRows }).map((_, row) => (
            <div key={row} style={{ display: 'flex', gap: '3px' }}>
              {Array.from({ length: displayCols }).map((_, col) => (
                <div key={col} style={{
                  width: '28px',
                  height: '28px',
                  borderRadius: '6px',
                  background: `hsl(${(row * displayCols + col) * 30}, 70%, 60%)`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '16px',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                }}>
                  {emojis[(row * displayCols + col) % emojis.length]}
                </div>
              ))}
            </div>
          ))}
        </div>
        
        {/* Counter visual */}
        <div style={{ 
          marginTop: '12px', 
          padding: '8px 16px', 
          background: '#FEF3C7', 
          borderRadius: '20px',
          fontSize: '14px',
          color: '#92400E',
        }}>
          Hitung semua: {Array.from({ length: Math.min(displayRows * displayCols, table * multiplier) }).map((_, i) => '⭐').join(' ')}
        </div>
        
        <div style={{ 
          marginTop: '8px',
          fontSize: '24px',
          fontWeight: 'bold',
          color: '#7C3AED',
        }}>
          {table} × {multiplier} = <span style={{ 
            background: '#7C3AED', 
            color: 'white', 
            padding: '4px 16px', 
            borderRadius: '12px',
            display: 'inline-block',
            minWidth: '40px',
          }}>{table * multiplier}</span>
        </div>
      </div>
    );
  };

  // Render pola perkalian (semua hasil dalam 1 tampilan)
  const renderTablePattern = (table: number) => {
    return (
      <div style={{ 
        background: 'white', 
        borderRadius: '16px', 
        padding: '16px',
        boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
        marginBottom: '16px',
      }}>
        <h3 style={{ textAlign: 'center', color: '#7C3AED', marginBottom: '12px' }}>
          📊 Tabel Perkalian {table}
        </h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          {Array.from({ length: 10 }).map((_, i) => {
            const multiplier = i + 1;
            const result = table * multiplier;
            const isHighlighted = currentMultiplier === multiplier;
            
            return (
              <div 
                key={i}
                onClick={() => {
                  setCurrentMultiplier(multiplier);
                  setShowAnswer(true);
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  padding: '8px 12px',
                  borderRadius: '10px',
                  background: isHighlighted ? '#EDE9FE' : 'transparent',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  border: isHighlighted ? '2px solid #7C3AED' : '1px solid #E5E7EB',
                }}
              >
                <span style={{ fontWeight: 'bold', width: '80px' }}>
                  {table} × {multiplier}
                </span>
                <span style={{ flex: 1, textAlign: 'center' }}>=</span>
                <span style={{ 
                  fontWeight: 'bold',
                  fontSize: '18px',
                  color: isHighlighted ? '#7C3AED' : '#374151',
                  background: isHighlighted ? '#DDD6FE' : 'transparent',
                  padding: '4px 12px',
                  borderRadius: '8px',
                  minWidth: '40px',
                  textAlign: 'center',
                }}>
                  {result}
                </span>
                {/* Progress dots */}
                <div style={{ marginLeft: '8px', display: 'flex', gap: '2px' }}>
                  {Array.from({ length: multiplier }).map((_, j) => (
                    <div key={j} style={{
                      width: '6px',
                      height: '6px',
                      borderRadius: '50%',
                      background: j < multiplier ? '#7C3AED' : '#E5E7EB',
                    }} />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
        
        {/* Pattern hint */}
        <div style={{ 
          marginTop: '12px', 
          padding: '10px', 
          background: '#F0FDF4', 
          borderRadius: '10px',
          fontSize: '13px',
          color: '#065F46',
        }}>
          💡 <strong>Pola:</strong> {table === 1 ? 'Semua angka tetap sama' :
            table === 2 ? 'Semua angka GENAP (loncat 2)' :
            table === 5 ? 'Akhiran selalu 0 atau 5' :
            table === 9 ? 'Jumlah digit selalu 9 (9,18,27,36...)' :
            table === 10 ? 'Tambah 0 di belakang' :
            `Tambah ${table} setiap langkah`}
        </div>
      </div>
    );
  };

  const handlePracticeSubmit = () => {
    const answer = parseInt(practiceAnswer);
    const correct = answer === currentTable * currentMultiplier;
    
    if (correct) {
      setFeedback('correct');
      setScore(s => s + 1);
      
      setTimeout(() => {
        if (currentMultiplier < 10) {
          setCurrentMultiplier(m => m + 1);
          setPracticeAnswer('');
          setFeedback(null);
          setShowAnswer(false);
        } else {
          // Table mastered!
          setLearnedTables(prev => [...prev, currentTable]);
          setStep('quiz');
          setQuizQuestions(generateQuiz(currentTable));
          setQuizIndex(0);
          setQuizAnswer('');
          setFeedback(null);
        }
      }, 800);
    } else {
      setFeedback('wrong');
      setTimeout(() => {
        setFeedback(null);
        setPracticeAnswer('');
      }, 1000);
    }
    setTotalQuestions(t => t + 1);
  };

  const handleQuizSubmit = () => {
    const answer = parseInt(quizAnswer);
    const correct = answer === quizQuestions[quizIndex]?.a;
    
    if (correct) {
      setScore(s => s + 2);
      setFeedback('correct');
      
      setTimeout(() => {
        if (quizIndex < quizQuestions.length - 1) {
          setQuizIndex(i => i + 1);
          setQuizAnswer('');
          setFeedback(null);
        } else {
          // Quiz complete!
          setStars(s => s + 1);
          if (currentTable < 10) {
            setCurrentTable(t => t + 1);
            setCurrentMultiplier(1);
            setStep('learn');
            setShowAnswer(false);
            setFeedback(null);
          } else {
            setStep('complete');
          }
        }
      }, 600);
    } else {
      setFeedback('wrong');
      setTimeout(() => {
        setFeedback(null);
        setQuizAnswer('');
      }, 1000);
    }
  };

  const handleComplete = () => {
    onComplete(stars >= 3 ? 3 : stars >= 1 ? 2 : 1, { 
      score, 
      tablesLearned: learnedTables.length,
      stars 
    });
  };

  // INTRO SCREEN
  if (step === 'intro') {
    return (
      <div style={{ maxWidth: '500px', margin: '0 auto', padding: '30px', textAlign: 'center' }}>
        <div style={{ fontSize: '70px', marginBottom: '16px' }}>🌟</div>
        <h2 style={{ fontSize: '30px', fontWeight: 'bold', color: '#7C3AED', marginBottom: '8px' }}>
          Tabel Ajaib!
        </h2>
        <p style={{ color: '#666', marginBottom: '24px', lineHeight: '1.6' }}>
          Belajar perkalian itu <strong>MUDAH</strong>!<br/>
          Lihat gambar → Hitung bareng → Hafal otomatis! 🎯
        </p>
        
        <div style={{ 
          background: '#F5F3FF', 
          borderRadius: '20px', 
          padding: '20px', 
          marginBottom: '24px',
          textAlign: 'left',
        }}>
          <h3 style={{ fontWeight: 'bold', marginBottom: '12px', textAlign: 'center' }}>📚 Cara Belajar:</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {[
              { emoji: '👀', text: 'LIHAT gambar kotak-kotak' },
              { emoji: '👆', text: 'HITUNG jumlahnya bareng-bareng' },
              { emoji: '✍️', text: 'LATIHAN isi jawaban' },
              { emoji: '🎯', text: 'KUIS untuk uji hafalan' },
              { emoji: '🏆', text: 'Dapat bintang & lanjut tabel berikutnya!' },
            ].map((item, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ fontSize: '24px' }}>{item.emoji}</span>
                <span>{item.text}</span>
              </div>
            ))}
          </div>
        </div>
        
        <button
          onClick={() => setStep('learn')}
          style={{
            padding: '16px 40px',
            fontSize: '20px',
            fontWeight: 'bold',
            borderRadius: '999px',
            border: 'none',
            background: 'linear-gradient(135deg, #F59E0B, #EF4444)',
            color: 'white',
            cursor: 'pointer',
            boxShadow: '0 4px 20px rgba(245,158,11,0.4)',
          }}
        >
          🌟 Mulai Belajar!
        </button>
      </div>
    );
  }

  // LEARN SCREEN
  if (step === 'learn') {
    return (
      <div style={{ maxWidth: '500px', margin: '0 auto', padding: '20px' }}>
        <div style={{ textAlign: 'center', marginBottom: '16px' }}>
          <div style={{ fontSize: '14px', color: '#7C3AED', fontWeight: 'bold' }}>
            📖 BELAJAR Tabel {currentTable}
          </div>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '4px', marginTop: '4px' }}>
            {Array.from({ length: 10 }).map((_, i) => (
              <div key={i} style={{
                width: '20px',
                height: '4px',
                borderRadius: '2px',
                background: i < currentTable - 1 ? '#10B981' : i === currentTable - 1 ? '#7C3AED' : '#E5E7EB',
              }} />
            ))}
          </div>
        </div>

        {/* Visual multiplication */}
        {renderVisualMultiplication(currentTable, currentMultiplier)}
        
        {/* Table pattern */}
        {renderTablePattern(currentTable)}
        
        <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
          {currentMultiplier > 1 && (
            <button
              onClick={() => {
                setCurrentMultiplier(m => m - 1);
                setShowAnswer(false);
              }}
              style={navBtnStyle('#6B7280')}
            >
              ◀ Sebelumnya
            </button>
          )}
          <button
            onClick={() => setStep('practice')}
            style={navBtnStyle('#7C3AED')}
          >
            ✍️ Latihan Tabel {currentTable}
          </button>
          {currentMultiplier < 10 && (
            <button
              onClick={() => {
                setCurrentMultiplier(m => m + 1);
                setShowAnswer(false);
              }}
              style={navBtnStyle('#6B7280')}
            >
              Selanjutnya ▶
            </button>
          )}
        </div>
      </div>
    );
  }

  // PRACTICE SCREEN
  if (step === 'practice') {
    return (
      <div style={{ maxWidth: '500px', margin: '0 auto', padding: '20px', textAlign: 'center' }}>
        <div style={{ marginBottom: '16px' }}>
          <div style={{ fontSize: '14px', color: '#7C3AED', fontWeight: 'bold' }}>
            ✍️ LATIHAN Tabel {currentTable} ({currentMultiplier}/10)
          </div>
          <div style={{ 
            width: '100%', 
            height: '8px', 
            background: '#E5E7EB', 
            borderRadius: '4px',
            marginTop: '8px',
            overflow: 'hidden',
          }}>
            <div style={{
              width: `${(currentMultiplier / 10) * 100}%`,
              height: '100%',
              background: 'linear-gradient(to right, #7C3AED, #EC4899)',
              borderRadius: '4px',
              transition: 'width 0.3s',
            }} />
          </div>
        </div>

        {/* Visual hint */}
        <div style={{ 
          background: '#FFFBEB', 
          borderRadius: '16px', 
          padding: '20px',
          marginBottom: '20px',
        }}>
          <div style={{ fontSize: '14px', color: '#92400E', marginBottom: '8px' }}>
            Ingat: {currentTable} baris × {currentMultiplier} kolom
          </div>
          <div style={{ 
            display: 'flex', 
            justifyContent: 'center',
            gap: '3px',
            marginBottom: '12px',
          }}>
            {Array.from({ length: currentMultiplier }).map((_, i) => (
              <div key={i} style={{
                width: '24px',
                height: '24px',
                borderRadius: '4px',
                background: `hsl(${i * 30}, 70%, 60%)`,
              }}>
                ⭐
              </div>
            ))}
          </div>
          {currentTable > 1 && (
            <div style={{ fontSize: '12px', color: '#92400E' }}>
              × {currentTable} baris
            </div>
          )}
        </div>
        
        <div style={{ fontSize: '32px', fontWeight: 'bold', marginBottom: '20px', color: '#374151' }}>
          {currentTable} × {currentMultiplier} = ?
        </div>
        
        <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', alignItems: 'center' }}>
          <input
            type="number"
            value={practiceAnswer}
            onChange={e => setPracticeAnswer(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handlePracticeSubmit()}
            placeholder="?"
            style={{
              width: '100px',
              padding: '14px',
              fontSize: '24px',
              textAlign: 'center',
              borderRadius: '12px',
              border: `2px solid ${feedback === 'wrong' ? '#EF4444' : '#7C3AED'}`,
            }}
            autoFocus
          />
          <button
            onClick={handlePracticeSubmit}
            style={{
              padding: '14px 24px',
              fontSize: '18px',
              fontWeight: 'bold',
              borderRadius: '12px',
              border: 'none',
              background: '#10B981',
              color: 'white',
              cursor: 'pointer',
            }}
          >
            ✅ Jawab
          </button>
        </div>

        <button
          onClick={() => setShowAnswer(!showAnswer)}
          style={{
            marginTop: '12px',
            padding: '8px 16px',
            border: 'none',
            background: 'none',
            color: '#7C3AED',
            cursor: 'pointer',
            fontSize: '14px',
            textDecoration: 'underline',
          }}
        >
          {showAnswer ? 'Sembunyikan' : '💡 Lihat Jawaban'}
        </button>
        
        {showAnswer && (
          <div style={{
            marginTop: '8px',
            padding: '10px',
            background: '#EDE9FE',
            borderRadius: '10px',
            fontSize: '20px',
            fontWeight: 'bold',
            color: '#7C3AED',
          }}>
            {currentTable} × {currentMultiplier} = {currentTable * currentMultiplier}
          </div>
        )}

        {feedback && (
          <div style={{
            marginTop: '12px',
            padding: '10px',
            borderRadius: '10px',
            background: feedback === 'correct' ? '#D1FAE5' : '#FEE2E2',
            color: feedback === 'correct' ? '#065F46' : '#991B1B',
            fontWeight: 'bold',
            fontSize: '18px',
          }}>
            {feedback === 'correct' ? '🎉 Benar! Hebat!' : '❌ Coba lagi!'}
          </div>
        )}
      </div>
    );
  }

  // QUIZ SCREEN
  if (step === 'quiz') {
    const currentQ = quizQuestions[quizIndex];
    
    return (
      <div style={{ maxWidth: '500px', margin: '0 auto', padding: '20px', textAlign: 'center' }}>
        <div style={{ marginBottom: '16px' }}>
          <div style={{ fontSize: '14px', color: '#7C3AED', fontWeight: 'bold' }}>
            🎯 KUIS Tabel {currentTable} ({quizIndex + 1}/{quizQuestions.length})
          </div>
          <div style={{ 
            width: '100%', 
            height: '8px', 
            background: '#E5E7EB', 
            borderRadius: '4px',
            marginTop: '8px',
          }}>
            <div style={{
              width: `${((quizIndex) / quizQuestions.length) * 100}%`,
              height: '100%',
              background: 'linear-gradient(to right, #F59E0B, #EF4444)',
              borderRadius: '4px',
              transition: 'width 0.3s',
            }} />
          </div>
        </div>

        <div style={{ 
          background: 'white', 
          borderRadius: '20px', 
          padding: '30px',
          boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
          marginBottom: '20px',
        }}>
          <div style={{ fontSize: '50px', marginBottom: '16px' }}>🤔</div>
          <div style={{ fontSize: '36px', fontWeight: 'bold', color: '#374151' }}>
            {currentQ?.q}
          </div>
        </div>
        
        <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', alignItems: 'center' }}>
          <input
            type="number"
            value={quizAnswer}
            onChange={e => setQuizAnswer(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleQuizSubmit()}
            placeholder="?"
            style={{
              width: '100px',
              padding: '14px',
              fontSize: '24px',
              textAlign: 'center',
              borderRadius: '12px',
              border: `2px solid ${feedback === 'wrong' ? '#EF4444' : '#7C3AED'}`,
            }}
            autoFocus
          />
          <button
            onClick={handleQuizSubmit}
            style={{
              padding: '14px 24px',
              fontSize: '18px',
              fontWeight: 'bold',
              borderRadius: '12px',
              border: 'none',
              background: '#F59E0B',
              color: 'white',
              cursor: 'pointer',
            }}
          >
            ✅ Jawab
          </button>
        </div>

        {feedback && (
          <div style={{
            marginTop: '12px',
            padding: '10px',
            borderRadius: '10px',
            background: feedback === 'correct' ? '#D1FAE5' : '#FEE2E2',
            color: feedback === 'correct' ? '#065F46' : '#991B1B',
            fontWeight: 'bold',
            fontSize: '18px',
          }}>
            {feedback === 'correct' 
              ? `🎉 Benar! ${currentQ?.q} ${currentQ?.a}` 
              : `❌ Jawaban: ${currentQ?.q} ${currentQ?.a}`}
          </div>
        )}
      </div>
    );
  }

  // COMPLETE SCREEN
  if (step === 'complete') {
    return (
      <div style={{ maxWidth: '500px', margin: '0 auto', padding: '30px', textAlign: 'center' }}>
        <div style={{ fontSize: '80px', marginBottom: '16px' }}>🏆</div>
        <h2 style={{ fontSize: '28px', color: '#7C3AED', marginBottom: '8px' }}>
          KAMU HEBAT!
        </h2>
        <p style={{ color: '#666', marginBottom: '20px' }}>
          Kamu sudah belajar perkalian 1-10! 🎉
        </p>
        
        <div style={{ 
          background: '#F5F3FF', 
          borderRadius: '20px', 
          padding: '20px', 
          marginBottom: '20px' 
        }}>
          <p>⭐ Skor: <strong>{score}</strong></p>
          <p>🌟 Bintang: <strong>{'⭐'.repeat(stars >= 3 ? 3 : stars >= 1 ? 2 : 1)}</strong></p>
          <p>📚 Tabel Dipelajari: <strong>{learnedTables.length}/10</strong></p>
        </div>
        
        <div style={{ fontSize: '40px' }}>
          {'⭐'.repeat(stars >= 3 ? 3 : stars >= 1 ? 2 : 1)}
        </div>
        
        <button
          onClick={handleComplete}
          style={{
            marginTop: '16px',
            padding: '14px 32px',
            fontSize: '18px',
            fontWeight: 'bold',
            borderRadius: '999px',
            border: 'none',
            background: '#F59E0B',
            color: 'white',
            cursor: 'pointer',
          }}
        >
          🏆 Klaim Hadiah
        </button>
      </div>
    );
  }

  return null;
}

function navBtnStyle(color: string): React.CSSProperties {
  return {
    padding: '10px 20px',
    fontSize: '14px',
    fontWeight: 'bold',
    borderRadius: '999px',
    border: 'none',
    background: color,
    color: 'white',
    cursor: 'pointer',
  };
}