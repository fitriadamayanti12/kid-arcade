// app/components/AIGameGenerator.tsx
'use client';

import { useState } from 'react';
import { useSoundEffect } from '@/hooks/useSoundEffect';
import { enhanceGameHTML } from '@/lib/aiGameEnhancer';

interface AIGameGeneratorProps {
  playerName: string;
  onComplete?: (stars: number, score: number) => void;
}

const examplePrompts = [
  "Buat game tebak gambar hewan untuk anak 6 tahun dengan 5 soal",
  "Buat game matematika sederhana penjumlahan 1-10",
  "Buat game mencocokkan warna dengan benda",
  "Buat game tebak huruf depan dari nama hewan",
  "Buat game hitung jumlah buah yang muncul"
];

export default function AIGameGenerator({ playerName, onComplete }: AIGameGeneratorProps) {
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [gameHtml, setGameHtml] = useState('');
  const [score, setScore] = useState(0);
  const { playSound } = useSoundEffect();

  const generateGame = async () => {
    if (!prompt.trim()) return;
    
    setLoading(true);
    playSound('click');
    setGameHtml('');
    
    try {
      const response = await fetch('/api/generate-game', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          prompt: `${prompt}. Buat game untuk anak 6 tahun dengan tampilan CERAH, FONT BESAR, TOMBOL BESAR, dan MUDAH DIMENGERTI.`
        })
      });
      
      let html = await response.text();
      html = enhanceGameHTML(html);
      
      setGameHtml(html);
      playSound('win');
      
      const newScore = score + 10;
      setScore(newScore);
      if (onComplete && newScore >= 50) onComplete(3, newScore);
      
    } catch (error) {
      console.error('Error:', error);
      alert('Gagal generate game. Coba lagi!');
      playSound('wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-3 sm:p-4 md:p-6">
      <div className="text-center mb-4 sm:mb-6">
        <h2 className="text-xl sm:text-2xl md:text-3xl font-bold bg-gradient-to-r from-purple-500 to-pink-500 bg-clip-text text-transparent mb-2">
          🤖 AI Game Generator
        </h2>
        <p className="text-xs sm:text-sm text-gray-600">Ceritakan game yang kamu mau, AI akan membuatkannya!</p>
        {onComplete && <div className="mt-2 text-sm font-bold text-purple-600">⭐ Skor AI: {score} / 50</div>}
      </div>

      {/* Contoh Prompt */}
      <div className="mb-4">
        <p className="text-xs sm:text-sm text-gray-500 mb-2">💡 Contoh ide game:</p>
        <div className="flex flex-wrap gap-2">
          {examplePrompts.map((example, i) => (
            <button
              key={i}
              onClick={() => { setPrompt(example); playSound('click'); }}
              className="text-xs bg-gray-100 hover:bg-gray-200 px-2 sm:px-3 py-1 rounded-full transition"
            >
              {example.length > 30 ? example.substring(0, 30) + '...' : example}
            </button>
          ))}
        </div>
      </div>

      {/* Input Prompt */}
      <textarea
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        placeholder="Contoh: Buat game tebak gambar hewan untuk anak 6 tahun dengan 5 soal tentang hewan laut..."
        className="w-full p-3 sm:p-4 border-2 rounded-xl h-28 sm:h-32 text-sm focus:outline-none focus:border-purple-400 resize-none mb-4"
        disabled={loading}
      />

      {/* Tombol Generate */}
      <button
        onClick={generateGame}
        disabled={loading || !prompt.trim()}
        className={`w-full py-3 sm:py-4 rounded-xl font-bold text-base sm:text-lg transition flex items-center justify-center gap-2 ${
          loading || !prompt.trim()
            ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
            : 'bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:scale-105 shadow-lg'
        }`}
      >
        {loading ? (
          <><div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div> 🤖 AI Sedang Membuat Game...</>
        ) : (
          '🚀 Generate Game dengan AI'
        )}
      </button>

      {/* Hasil Game */}
      {gameHtml && (
        <div className="mt-6">
          <div className="flex justify-between items-center mb-2">
            <h3 className="font-bold text-sm sm:text-base">✨ Game Buatan AI:</h3>
            <button onClick={() => setGameHtml('')} className="text-xs text-gray-500 hover:text-red-500">Tutup ✕</button>
          </div>
          <div className="bg-gray-100 rounded-xl p-2 sm:p-3">
            <iframe
              srcDoc={gameHtml}
              title="AI Generated Game"
              className="w-full h-[550px] sm:h-[650px] rounded-lg border-0"
              sandbox="allow-same-origin allow-scripts allow-popups allow-forms allow-modals"
            />
          </div>
        </div>
      )}

      <div className="mt-6 p-3 bg-purple-50 rounded-xl">
        <p className="text-xs text-purple-600 text-center">
          🧠 AI akan membuat game sesuai keinginanmu! Semakin detail deskripsimu, semakin seru game yang dibuat.
        </p>
      </div>
    </div>
  );
}