// app/components/layout/LoginScreen.tsx
'use client';

import { useRef } from 'react';

interface LoginScreenProps {
  inputName: string;
  setInputName: (name: string) => void;
  isLoading: boolean;
  onLogin: (name: string) => void;
  error?: string;
}

export default function LoginScreen({ 
  inputName, 
  setInputName, 
  isLoading, 
  onLogin,
  error 
}: LoginScreenProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleStartClick = () => {
    const name = inputName.trim();
    if (name && !isLoading) onLogin(name);
  };

  return (
    <main className="min-h-screen relative overflow-hidden flex items-center justify-center p-4 bg-gradient-to-br from-purple-400 via-pink-400 to-orange-300">
      
      {/* Animated background blobs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-20 -right-20 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-3xl opacity-40 animate-pulse"></div>
        <div className="absolute -bottom-20 -left-20 w-72 h-72 bg-pink-300 rounded-full mix-blend-multiply filter blur-3xl opacity-40 animate-pulse" style={{ animationDelay: '1s' }}></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-yellow-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse" style={{ animationDelay: '2s' }}></div>
      </div>

      {/* Floating icons */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {['🎮', '⭐', '🌟', '💫', '🎯', '🎨', '🚀', '✨'].map((icon, i) => (
          <div
            key={i}
            className="absolute animate-float opacity-30"
            style={{
              left: `${10 + (i * 11) % 80}%`,
              top: `${8 + (i * 13) % 80}%`,
              animationDelay: `${i * 0.5}s`,
              animationDuration: `${3 + (i % 2) * 2}s`,
              fontSize: `${20 + (i % 3) * 12}px`,
            }}
          >
            {icon}
          </div>
        ))}
      </div>

      {/* Main Card */}
      <div className="relative z-10 w-full max-w-sm animate-slide-up">
        <div className="bg-white/70 backdrop-blur-xl rounded-3xl p-8 shadow-2xl border border-white/50 text-center">
          
          {/* Logo */}
          <div className="text-7xl mb-4 animate-float">🎮</div>
          
          {/* Title */}
          <h1 className="text-3xl font-extrabold mb-1 bg-gradient-to-r from-purple-600 via-pink-500 to-orange-400 bg-clip-text text-transparent">
            Kid Arcade!
          </h1>
          <p className="text-gray-500 text-sm mb-6">
            Game Matematika Seru & Gratis untuk Anak
          </p>

          {/* Error */}
          {error && (
            <div className="mb-4 p-2 bg-red-50 border border-red-200 rounded-xl text-sm text-red-500 animate-shake">
              ⚠️ {error}
            </div>
          )}

          {/* Input */}
          <input 
            ref={inputRef}
            type="text" 
            placeholder="Tulis nama kamu..."
            value={inputName}
            onChange={(e) => setInputName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleStartClick()}
            className="w-full p-4 border-2 border-gray-200 rounded-2xl text-center text-lg mb-4 focus:border-purple-400 focus:outline-none transition-colors"
            autoFocus 
            maxLength={20}
            disabled={isLoading}
          />

          {/* Button */}
          <button 
            onClick={handleStartClick}
            disabled={!inputName.trim() || isLoading}
            className={`w-full py-4 rounded-2xl font-bold text-lg transition-all duration-200 ${
              inputName.trim() && !isLoading
                ? 'bg-gradient-to-r from-purple-500 via-pink-500 to-orange-400 text-white shadow-lg hover:scale-[1.02] active:scale-95'
                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
            }`}
          >
            {isLoading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Menyiapkan...
              </span>
            ) : (
              '🚀 Mulai Petualangan!'
            )}
          </button>

          {/* Footer */}
          <p className="mt-4 text-xs text-gray-400">
            Tidak perlu daftar • Main langsung ✨
          </p>
        </div>

        {/* Powered by Next Generation Ecosystem */}
        <div className="mt-4 text-center">
          <a 
            href="https://xgeneration.netlify.app" 
            target="_blank" 
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur-md rounded-full text-xs text-white/80 hover:bg-white/30 hover:text-white transition-all duration-300 hover:scale-105 border border-white/20"
          >
            <span className="opacity-70">Powered by</span>
            <span className="font-bold tracking-wide">NEXT GENERATION ECOSYSTEM</span>
            <span className="text-lg">🚀</span>
          </a>
        </div>
      </div>

      {/* Bottom text */}
      <p className="absolute bottom-4 text-xs text-white/50">
        Dibuat dengan ❤️ untuk anak Indonesia
      </p>
    </main>
  );
}