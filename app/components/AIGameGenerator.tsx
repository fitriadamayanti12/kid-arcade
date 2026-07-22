// app/components/AIGameGenerator.tsx
'use client';

import { useState } from 'react';
import { useThemeStyles } from '@/hooks/useThemeStyles';

interface AIGameGeneratorProps {
  playerName: string;
  onComplete: (stars: number, extra?: any) => void;
}

// Built-in mini games (tanpa API)
const MINI_GAMES = [
  {
    id: 'math-quiz',
    title: '🧮 Kuis Matematika',
    desc: 'Soal penjumlahan & pengurangan acak',
    generate: () => {
      const a = Math.floor(Math.random() * 20) + 1;
      const b = Math.floor(Math.random() * 20) + 1;
      const ops = ['+', '-', '×'];
      const op = ops[Math.floor(Math.random() * ops.length)];
      let answer: number;
      switch(op) {
        case '+': answer = a + b; break;
        case '-': answer = a - b; break;
        case '×': answer = a * b; break;
        default: answer = 0;
      }
      return { question: `${a} ${op} ${b} = ?`, answer };
    }
  },
  {
    id: 'emoji-count',
    title: '🎯 Hitung Emoji',
    desc: 'Hitung jumlah emoji yang muncul',
    generate: () => {
      const emojis = ['⭐', '🌟', '💛', '🎈', '🌸', '🍎'];
      const emoji = emojis[Math.floor(Math.random() * emojis.length)];
      const count = Math.floor(Math.random() * 8) + 2;
      return { display: emoji.repeat(count), count, emoji };
    }
  },
  {
    id: 'color-match',
    title: '🎨 Tebak Warna',
    desc: 'Cocokkan warna dengan namanya',
    generate: () => {
      const colors = [
        { name: 'Merah', code: '#ef4444', emoji: '🔴' },
        { name: 'Biru', code: '#3b82f6', emoji: '🔵' },
        { name: 'Hijau', code: '#10b981', emoji: '🟢' },
        { name: 'Kuning', code: '#f59e0b', emoji: '🟡' },
        { name: 'Ungu', code: '#8b5cf6', emoji: '🟣' },
      ];
      return colors[Math.floor(Math.random() * colors.length)];
    }
  },
  {
    id: 'animal-sound',
    title: '🐮 Suara Hewan',
    desc: 'Tebak hewan dari suaranya',
    generate: () => {
      const animals = [
        { name: 'Kucing', sound: 'Meong! 🐱', emoji: '🐱' },
        { name: 'Anjing', sound: 'Guk Guk! 🐶', emoji: '🐶' },
        { name: 'Sapi', sound: 'Moo! 🐮', emoji: '🐮' },
        { name: 'Ayam', sound: 'Kukuruyuk! 🐔', emoji: '🐔' },
        { name: 'Kambing', sound: 'Mbeeek! 🐐', emoji: '🐐' },
      ];
      return animals[Math.floor(Math.random() * animals.length)];
    }
  },
  {
    id: 'flag-quiz',
    title: '🏳️ Tebak Bendera',
    desc: 'Kenali bendera negara',
    generate: () => {
      const flags = [
        { country: 'Indonesia', flag: '🇮🇩', hint: 'Merah Putih' },
        { country: 'Jepang', flag: '🇯🇵', hint: 'Matahari Terbit' },
        { country: 'USA', flag: '🇺🇸', hint: 'Bintang & Garis' },
        { country: 'UK', flag: '🇬🇧', hint: 'Union Jack' },
        { country: 'China', flag: '🇨🇳', hint: 'Bintang Kuning' },
      ];
      return flags[Math.floor(Math.random() * flags.length)];
    }
  },
];

export default function AIGameGenerator({ playerName, onComplete }: AIGameGeneratorProps) {
  const theme = useThemeStyles();
  const [selectedGame, setSelectedGame] = useState<any>(null);
  const [q, setQ] = useState<any>(null);
  const [userAnswer, setUserAnswer] = useState('');
  const [selected, setSelected] = useState<number | string | null>(null);
  const [correct, setCorrect] = useState(false);
  const [score, setScore] = useState(0);
  const [total, setTotal] = useState(0);
  const [streak, setStreak] = useState(0);
  const [feedback, setFeedback] = useState('');

  const selectGame = (game: any) => {
    setSelectedGame(game);
    setScore(0);
    setTotal(0);
    setStreak(0);
    setFeedback('');
    setQ(game.generate());
    setUserAnswer('');
    setSelected(null);
  };

  const handleSubmit = (ans?: string | number) => {
    const answer = ans !== undefined ? ans : userAnswer;
    if (answer === '' && !ans) return;

    let isCorrect = false;
    if (selectedGame.id === 'math-quiz') isCorrect = Number(answer) === q.answer;
    else if (selectedGame.id === 'emoji-count') isCorrect = Number(answer) === q.count;
    else if (selectedGame.id === 'color-match') isCorrect = String(answer).toLowerCase() === q.name.toLowerCase();
    else if (selectedGame.id === 'animal-sound') isCorrect = String(answer).toLowerCase() === q.name.toLowerCase();
    else if (selectedGame.id === 'flag-quiz') isCorrect = String(answer).toLowerCase() === q.country.toLowerCase();

    setCorrect(isCorrect);
    setTotal(t => t + 1);
    if (isCorrect) { 
      setScore(s => s + 1); 
      setStreak(s => s + 1);
      setFeedback('🎉 Benar!');
    } else {
      setStreak(0);
      setFeedback('❌ Coba lagi!');
    }

    setTimeout(() => {
      setQ(selectedGame.generate());
      setUserAnswer('');
      setSelected(null);
      setFeedback('');
      
      if (total >= 9 && isCorrect) {
        const stars = score >= 8 ? 3 : score >= 6 ? 2 : 1;
        onComplete(stars, { score: score + 1, total: total + 1, game: selectedGame.title });
      }
    }, 1000);
  };

  // Menu
  if (!selectedGame) return (
    <div style={{ padding: '20px', maxWidth: '600px', margin: '0 auto', textAlign: 'center' }}>
      <div style={{ fontSize: '60px', marginBottom: '12px' }}>🤖</div>
      <h2 style={{ fontSize: '26px', fontWeight: '800', color: theme.heading, marginBottom: '4px' }}>
        AI Game Generator
      </h2>
      <p style={{ fontSize: '14px', color: theme.textSecondary, marginBottom: '24px' }}>
        Pilih game seru di bawah ini! 🎮
      </p>

      <div style={{ display: 'grid', gap: '12px' }}>
        {MINI_GAMES.map(game => (
          <button key={game.id} onClick={() => selectGame(game)} style={{
            padding: '16px', borderRadius: '16px', border: `1px solid ${theme.border}`,
            background: theme.bgCard, textAlign: 'left', cursor: 'pointer',
            transition: 'all 0.2s', boxShadow: theme.shadow,
          }}>
            <div style={{ fontSize: '18px', fontWeight: '700', color: theme.heading }}>{game.title}</div>
            <div style={{ fontSize: '13px', color: theme.textSecondary, marginTop: '4px' }}>{game.desc}</div>
          </button>
        ))}
      </div>
    </div>
  );

  // Playing
  return (
    <div style={{ padding: '20px', maxWidth: '500px', margin: '0 auto', textAlign: 'center' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
        <button onClick={() => setSelectedGame(null)} style={{
          background: 'none', border: 'none', color: theme.textSecondary, fontSize: '13px', cursor: 'pointer',
        }}>← Kembali</button>
        <span style={{ fontSize: '14px', fontWeight: '700', color: theme.textSecondary }}>
          ⭐ {score} | {total + 1}/10
        </span>
        {streak >= 3 && <span style={{ color: '#f59e0b', fontWeight: '700', fontSize: '13px' }}>🔥 {streak}x</span>}
      </div>

      {/* Progress */}
      <div style={{ width: '100%', height: '6px', background: theme.border, borderRadius: '3px', marginBottom: '20px' }}>
        <div style={{
          width: `${((total) / 10) * 100}%`, height: '100%',
          background: 'linear-gradient(90deg, #7c3aed, #a78bfa)', borderRadius: '3px', transition: 'width 0.3s',
        }} />
      </div>

      {/* Game Card */}
      <div style={{ background: theme.bgCard, borderRadius: '20px', padding: '24px', boxShadow: theme.shadow, marginBottom: '16px' }}>
        {selectedGame.id === 'math-quiz' && (
          <h3 style={{ fontSize: '32px', fontWeight: '900', color: theme.heading }}>{q.question}</h3>
        )}
        {selectedGame.id === 'emoji-count' && (
          <>
            <div style={{ fontSize: '50px', letterSpacing: '8px', marginBottom: '12px' }}>{q.display}</div>
            <h3 style={{ fontSize: '22px', color: theme.heading }}>Ada berapa {q.emoji}?</h3>
          </>
        )}
        {selectedGame.id === 'color-match' && (
          <>
            <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: q.code, margin: '0 auto 12px', boxShadow: '0 4px 12px rgba(0,0,0,0.2)' }} />
            <h3 style={{ fontSize: '22px', color: theme.heading }}>Warna apa ini?</h3>
          </>
        )}
        {selectedGame.id === 'animal-sound' && (
          <>
            <div style={{ fontSize: '60px', marginBottom: '8px' }}>🔊</div>
            <h3 style={{ fontSize: '28px', fontWeight: '900', color: theme.heading, marginBottom: '4px' }}>{q.sound}</h3>
            <p style={{ fontSize: '16px', color: theme.textSecondary }}>Hewan apa ini?</p>
          </>
        )}
        {selectedGame.id === 'flag-quiz' && (
          <>
            <div style={{ fontSize: '80px', marginBottom: '8px' }}>{q.flag}</div>
            <p style={{ fontSize: '14px', color: theme.textMuted }}>Hint: {q.hint}</p>
            <h3 style={{ fontSize: '22px', color: theme.heading }}>Negara apa ini?</h3>
          </>
        )}
      </div>

      {/* Input/Options */}
      {selectedGame.id !== 'color-match' && selectedGame.id !== 'flag-quiz' && (
        <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', marginBottom: '12px' }}>
          <input
            type={selectedGame.id === 'math-quiz' || selectedGame.id === 'emoji-count' ? 'number' : 'text'}
            value={userAnswer}
            onChange={e => setUserAnswer(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSubmit()}
            placeholder="Jawaban..."
            style={{
              padding: '12px 16px', fontSize: '20px', textAlign: 'center',
              borderRadius: '12px', border: `2px solid ${theme.border}`,
              background: theme.input, color: theme.text, width: '140px', outline: 'none',
            }}
            autoFocus
          />
          <button onClick={() => handleSubmit()} style={{
            padding: '12px 20px', borderRadius: '12px', border: 'none',
            background: '#7c3aed', color: '#fff', fontWeight: '700', fontSize: '15px', cursor: 'pointer',
          }}>✅ Jawab</button>
        </div>
      )}

      {/* Options for color/flag */}
      {(selectedGame.id === 'color-match' || selectedGame.id === 'flag-quiz') && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', maxWidth: '300px', margin: '0 auto' }}>
          {(selectedGame.id === 'color-match' 
            ? ['Merah', 'Biru', 'Hijau', 'Kuning', 'Ungu']
            : ['Indonesia', 'Jepang', 'USA', 'UK', 'China']
          ).sort(() => Math.random() - 0.5).slice(0, 4).map((opt, i) => (
            <button key={i} onClick={() => handleSubmit(opt)} style={{
              padding: '12px', borderRadius: '12px', border: 'none',
              background: theme.bgHover, color: theme.text,
              fontWeight: '600', fontSize: '14px', cursor: 'pointer',
            }}>{opt}</button>
          ))}
        </div>
      )}

      {/* Feedback */}
      {feedback && (
        <div style={{
          marginTop: '12px', padding: '10px', borderRadius: '10px',
          background: feedback.includes('🎉') ? '#d1fae5' : '#fee2e2',
          color: feedback.includes('🎉') ? '#065f46' : '#991b1b',
          fontWeight: '600', fontSize: '15px',
          animation: 'pop 0.3s ease-out',
        }}>
          {feedback}
        </div>
      )}
    </div>
  );
}