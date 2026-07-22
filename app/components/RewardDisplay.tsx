// app/components/RewardDisplay.tsx
'use client';

import { useState, useEffect } from 'react';
import { useThemeStyles } from '@/hooks/useThemeStyles';

interface RewardProps {
  playerName: string;
  starsEarned: number;
  newBadge?: string;
  newSticker?: string;
  selectedGrade?: string;
  onClose: () => void;
}

const PRAISES: Record<string, string[]> = {
  paud: [
    "Kamu sudah BERUSAHA! Itu hebat! 🌟",
    "Kamu tidak menyerah! Bagus sekali! 💪",
    "Lihat! Kamu BISA setelah mencoba! 🎉",
    "Otakmu bertumbuh karena kamu belajar! 🧠✨",
    "Kamu fokus dan terus mencoba! Keren! 👏",
  ],
  tk: [
    "Kamu belajar dari kesalahan! Itu PINTAR! 🧠",
    "Usahamu membuat kamu lebih MAHIR! ⭐",
    "Kamu tidak takut mencoba hal baru! 👏",
    "Setiap latihan membuatmu lebih HEBAT! 💪",
    "Kamu menemukan cara baru untuk menyelesaikan! 🤩",
  ],
  '1-3': [
    "Strategimu keren! Kamu terus mencari cara! 🔍",
    "Kamu TIDAK MENYERAH meskipun sulit! Itu luar biasa! 💪",
    "Otakmu tumbuh setiap kali kamu berlatih! 🧠⚡",
    "Kesalahanmu adalah GURU terbaik! Kamu belajar! 📚",
    "Kamu membuktikan bahwa USAHA mengalahkan bakat! 🏆",
  ],
  '4-6': [
    "Kamu menunjukkan GRIT! Ketekunan adalah superpower! 🦸",
    "Kamu menghadapi tantangan dengan BERANI! 💎",
    "Proses belajarmu MENGINSPIRASI! Terus tumbuh! 🌱",
    "Kamu membuktikan kemampuan bisa DILATIH! 🧠🔥",
    "Mindset berkembangmu membuatmu TAK TERHENTIKAN! 🚀",
  ],
  all: [
    "Usahamu LUAR BIASA! Teruslah bertumbuh! 🌟",
    "Kamu membuktikan belajar itu MENYENANGKAN! 🎯",
    "Setiap langkah kecil adalah KEMAJUAN! 👣",
  ],
};

// 👏 Suara tepuk tangan sederhana
const playClapSound = () => {
  try {
    const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
    const ctx = new AudioContext();
    
    const playClap = (delay: number, vol: number) => {
      const bufferSize = ctx.sampleRate * 0.15;
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (ctx.sampleRate * 0.02));
      }
      
      setTimeout(() => {
        const source = ctx.createBufferSource();
        source.buffer = buffer;
        const gain = ctx.createGain();
        gain.gain.setValueAtTime(vol, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.15);
        source.connect(gain);
        gain.connect(ctx.destination);
        source.start();
      }, delay);
    };

    playClap(0, 0.3);
    playClap(120, 0.2);
    playClap(250, 0.25);
    playClap(400, 0.15);
    playClap(550, 0.1);
  } catch (e) {
    // Audio tidak support, skip
  }
};

export default function RewardDisplay({ 
  playerName, starsEarned, newBadge, newSticker, selectedGrade = 'all', onClose 
}: RewardProps) {
  const theme = useThemeStyles();
  const [show, setShow] = useState(false);
  const [particles, setParticles] = useState<{ id: number; emoji: string; x: number; y: number; delay: number }[]>([]);

  useEffect(() => {
    setShow(true);
    playClapSound(); // 👏👏👏

    const emojis = ['⭐', '🌟', '✨', '💫', '🧠', '💪', '🔥', '🌱'];
    const newParticles = Array.from({ length: 25 }, (_, i) => ({
      id: i, emoji: emojis[i % emojis.length],
      x: Math.random() * 100, y: -10 - Math.random() * 20, delay: Math.random() * 2,
    }));
    setParticles(newParticles);

    const timer = setTimeout(() => { setShow(false); setTimeout(onClose, 300); }, 5000);
    return () => clearTimeout(timer);
  }, []);

  const praiseList = PRAISES[selectedGrade] || PRAISES['all'];
  const randomPraise = praiseList[Math.floor(Math.random() * praiseList.length)];

  const starsVisual = starsEarned === 3 ? '🌟🌟🌟' : starsEarned === 2 ? '🌟🌟' : '🌟';

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 100,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'rgba(0,0,0,0.75)', opacity: show ? 1 : 0,
      transition: 'opacity 0.3s', padding: '16px',
    }} onClick={onClose}>
      
      {particles.map(p => (
        <div key={p.id} style={{
          position: 'absolute', left: `${p.x}%`, top: `${p.y}%`,
          fontSize: `${16 + Math.random() * 20}px`,
          animation: `confetti-fall ${2 + Math.random() * 2}s ease-out ${p.delay}s forwards`,
          pointerEvents: 'none',
        }}>{p.emoji}</div>
      ))}

      <div style={{
        background: 'linear-gradient(135deg, #7c3aed, #a855f7, #c084fc)',
        borderRadius: '28px', padding: '28px 22px', maxWidth: '400px', width: '100%',
        textAlign: 'center', boxShadow: '0 25px 50px rgba(124,58,237,0.4)',
        transform: show ? 'scale(1)' : 'scale(0.9)',
        transition: 'transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
      }} onClick={e => e.stopPropagation()}>
        
        <div style={{ fontSize: '50px', marginBottom: '8px', animation: 'float 2s ease-in-out infinite' }}>🧠</div>
        <h2 style={{ fontSize: '22px', fontWeight: '800', color: '#fff', marginBottom: '2px' }}>{playerName}!</h2>
        <div style={{ fontSize: '36px', marginBottom: '12px' }}>{starsVisual}</div>

        <div style={{ background: 'rgba(255,255,255,0.2)', borderRadius: '16px', padding: '16px', marginBottom: '16px', border: '1px solid rgba(255,255,255,0.3)' }}>
          <p style={{ fontSize: '18px', fontWeight: '700', color: '#fff', lineHeight: 1.5, margin: 0, fontStyle: 'italic' }}>"{randomPraise}"</p>
        </div>

        <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.8)', marginBottom: '16px', lineHeight: 1.5 }}>
          {selectedGrade === 'paud' || selectedGrade === 'tk' 
            ? 'Setiap kali kamu belajar, otakmu jadi LEBIH PINTAR! 🧠✨'
            : selectedGrade === '1-3'
            ? 'Ingat: KEMAMPUAN itu bisa DILATIH. Kamu buktikan hari ini! 💪'
            : 'Kamu punya GROWTH MINDSET! Ini lebih penting dari nilai! 🚀'}
        </p>

        {newBadge && (
          <div style={{ background: 'rgba(251,191,36,0.4)', borderRadius: '14px', padding: '10px', marginBottom: '10px', animation: 'pop 0.4s ease-out' }}>
            <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.8)', margin: 0 }}>🏅 Lencana Baru</p>
            <p style={{ fontSize: '16px', fontWeight: '700', color: '#fff', margin: '2px 0' }}>{newBadge}</p>
          </div>
        )}

        {newSticker && (
          <div style={{ background: 'rgba(236,72,153,0.4)', borderRadius: '14px', padding: '10px', marginBottom: '10px' }}>
            <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.8)', margin: 0 }}>📌 Stiker Baru</p>
            <p style={{ fontSize: '36px', margin: '4px 0' }}>{newSticker}</p>
          </div>
        )}

        <div style={{ marginBottom: '16px' }}>
          <span style={{ background: 'rgba(255,255,255,0.25)', borderRadius: '20px', padding: '6px 16px', fontSize: '15px', fontWeight: '700', color: '#fff' }}>
            +{starsEarned * 10} Poin ⭐
          </span>
        </div>

        <button onClick={onClose} style={{
          background: '#fff', color: '#7c3aed', border: 'none', borderRadius: '999px',
          padding: '12px 28px', fontSize: '16px', fontWeight: '700', cursor: 'pointer',
          boxShadow: '0 4px 12px rgba(0,0,0,0.2)', transition: 'all 0.2s', width: '100%',
        }}>🚀 Aku Siap Belajar Lagi!</button>
      </div>

      <style>{`
        @keyframes confetti-fall {
          0% { transform: translateY(0) rotate(0deg); opacity: 1; }
          100% { transform: translateY(100vh) rotate(720deg); opacity: 0; }
        }
        @keyframes float { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-8px)} }
        @keyframes pop { 0%{transform:scale(0);opacity:0} 80%{transform:scale(1.1)} 100%{transform:scale(1);opacity:1} }
      `}</style>
    </div>
  );
}