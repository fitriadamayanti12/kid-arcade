// app/components/FillBlanks.tsx
'use client';

import { useState, useEffect } from 'react';
import { useSoundEffect } from '@/hooks/useSoundEffect';
import { useThemeStyles } from '@/hooks/useThemeStyles';

interface FillBlanksProps {
  playerName: string;
  onComplete: (stars: number, extra?: any) => void;
}

// Data built-in (tidak perlu database)
const WORDS = [
  { word: 'KUCING', hint: 'Hewan yang mengeong', category: 'hewan' },
  { word: 'SEKOLAH', hint: 'Tempat kita belajar', category: 'tempat' },
  { word: 'PELANGI', hint: 'Muncul setelah hujan, warnanya indah', category: 'alam' },
  { word: 'MATEMATIKA', hint: 'Pelajaran menghitung', category: 'pelajaran' },
  { word: 'INDONESIA', hint: 'Nama negara kita', category: 'umum' },
  { word: 'KOMPUTER', hint: 'Alat untuk mengetik dan belajar online', category: 'teknologi' },
  { word: 'PERPUSTAKAAN', hint: 'Tempat banyak buku', category: 'tempat' },
  { word: 'LINGKARAN', hint: 'Bentuk bulat dalam matematika', category: 'matematika' },
  { word: 'PESAWAT', hint: 'Kendaraan yang terbang', category: 'transportasi' },
  { word: 'DOKTER', hint: 'Orang yang menyembuhkan orang sakit', category: 'pekerjaan' },
  { word: 'BAHAGIA', hint: 'Perasaan senang sekali', category: 'perasaan' },
  { word: 'PANCASILA', hint: 'Dasar negara Indonesia', category: 'umum' },
];

export default function FillBlanks({ playerName, onComplete }: FillBlanksProps) {
  const theme = useThemeStyles();
  const [q, setQ] = useState({ word: '', hint: '', display: '', answer: '' });
  const [userAnswer, setUserAnswer] = useState('');
  const [score, setScore] = useState(0);
  const [total, setTotal] = useState(0);
  const [streak, setStreak] = useState(0);
  const [showHint, setShowHint] = useState(false);
  const [feedback, setFeedback] = useState('');
  const [used, setUsed] = useState<Set<number>>(new Set());
  const { playSound } = useSoundEffect();

  const generate = () => {
    const available = WORDS.filter((_, i) => !used.has(i));
    if (available.length === 0) {
      const stars = score >= 8 ? 3 : score >= 5 ? 2 : 1;
      onComplete(stars, { score, total });
      return;
    }

    const idx = Math.floor(Math.random() * available.length);
    const word = available[idx];
    const realIdx = WORDS.indexOf(word);
    setUsed(prev => new Set([...prev, realIdx]));

    // Buat display dengan beberapa huruf hilang
    const missingCount = Math.max(1, Math.floor(word.word.length / 4));
    const missingIndices = new Set<number>();
    while (missingIndices.size < missingCount) {
      missingIndices.add(Math.floor(Math.random() * word.word.length));
    }

    const display = word.word.split('').map((c, i) => missingIndices.has(i) ? '_' : c).join('');
    const answer = word.word.split('').filter((_, i) => missingIndices.has(i)).join('');

    setQ({ word: word.word, hint: word.hint, display, answer });
  };

  useEffect(() => { generate(); }, []);

  const handleSubmit = () => {
    if (!userAnswer) return;
    const correct = userAnswer.toUpperCase() === q.answer;
    setTotal(t => t + 1);
    
    if (correct) {
      setScore(s => s + 1);
      setStreak(s => s + 1);
      setFeedback(`✅ Benar! +10 poin`);
      playSound('win');
    } else {
      setStreak(0);
      setFeedback(`❌ Yang benar: ${q.answer}`);
      playSound('click');
    }

    setTimeout(() => {
      setUserAnswer('');
      setFeedback('');
      setShowHint(false);
      generate();
    }, 1500);
  };

  return (
    <div style={{ padding: '16px', maxWidth: '500px', margin: '0 auto', textAlign: 'center' }}>
      {/* Header */}
      <div style={{ marginBottom: '16px' }}>
        <h2 style={{ fontSize: '22px', fontWeight: '800', color: theme.heading, marginBottom: '4px' }}>
          ✏️ Lengkapi Kata
        </h2>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', fontSize: '13px', color: theme.textSecondary }}>
          <span>⭐ {score}</span>
          <span>📝 {total}/{WORDS.length}</span>
          {streak >= 3 && <span style={{ color: '#f59e0b', fontWeight: '700' }}>🔥 {streak}x</span>}
        </div>
      </div>

      {/* Progress */}
      <div style={{ width: '100%', height: '6px', background: theme.border, borderRadius: '3px', marginBottom: '20px' }}>
        <div style={{
          width: `${(total / WORDS.length) * 100}%`, height: '100%',
          background: 'linear-gradient(90deg, #14b8a6, #0d9488)',
          borderRadius: '3px', transition: 'width 0.3s',
        }} />
      </div>

      {/* Word Card */}
      <div style={{
        background: theme.bgCard, borderRadius: '20px', padding: '24px',
        boxShadow: theme.shadow, marginBottom: '16px',
      }}>
        <p style={{ fontSize: '13px', color: theme.textMuted, marginBottom: '12px' }}>
          Lengkapi huruf yang hilang:
        </p>
        <div style={{ fontSize: '36px', fontWeight: '900', letterSpacing: '8px', color: theme.heading, marginBottom: '16px' }}>
          {q.display.split('').map((c, i) => (
            <span key={i} style={{
              color: c === '_' ? '#ef4444' : theme.heading,
              textDecoration: c === '_' ? 'underline' : 'none',
              textUnderlineOffset: '6px',
            }}>{c === '_' ? '_' : c}</span>
          ))}
        </div>

        <button onClick={() => setShowHint(!showHint)} style={{
          background: 'none', border: 'none', color: '#14b8a6',
          fontSize: '13px', cursor: 'pointer', textDecoration: 'underline',
        }}>
          {showHint ? 'Sembunyikan' : '💡 Petunjuk'}
        </button>
        {showHint && (
          <div style={{
            marginTop: '8px', padding: '10px', background: '#fef3c7',
            borderRadius: '10px', fontSize: '13px', color: '#92400e',
          }}>
            {q.hint}
          </div>
        )}
      </div>

      {/* Input */}
      <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', marginBottom: '12px' }}>
        <input
          type="text"
          value={userAnswer}
          onChange={e => setUserAnswer(e.target.value.toUpperCase())}
          onKeyDown={e => e.key === 'Enter' && handleSubmit()}
          placeholder="Jawaban..."
          maxLength={q.answer.length}
          style={{
            padding: '12px 16px', fontSize: '20px', textAlign: 'center',
            borderRadius: '12px', border: `2px solid ${theme.border}`,
            background: theme.input, color: theme.text,
            width: '150px', outline: 'none',
          }}
          autoFocus
        />
        <button onClick={handleSubmit} style={{
          padding: '12px 20px', fontSize: '16px', fontWeight: '700',
          borderRadius: '12px', border: 'none', background: '#14b8a6',
          color: '#fff', cursor: 'pointer',
        }}>
          ✅ Jawab
        </button>
      </div>

      {/* Feedback */}
      {feedback && (
        <div style={{
          padding: '10px', borderRadius: '10px',
          background: feedback.includes('✅') ? '#d1fae5' : '#fee2e2',
          color: feedback.includes('✅') ? '#065f46' : '#991b1b',
          fontWeight: '600', fontSize: '15px',
          animation: 'pop 0.3s ease-out',
        }}>
          {feedback}
        </div>
      )}
    </div>
  );
}