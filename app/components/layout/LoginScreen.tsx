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

// Pesan WhatsApp
const WA_MESSAGE = encodeURIComponent(
  "Halo Admin Next Generation! 👋 Saya tertarik dan ingin tahu lebih lanjut tentang program belajar di Next Generation. Mohon info lebih detail ya. Terima kasih! 🙏"
);

export default function LoginScreen({ 
  inputName, setInputName, isLoading, onLogin, error 
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
          <div key={i} className="absolute animate-float opacity-30"
            style={{
              left: `${10 + (i * 11) % 80}%`, top: `${8 + (i * 13) % 80}%`,
              animationDelay: `${i * 0.5}s`, animationDuration: `${3 + (i % 2) * 2}s`,
              fontSize: `${20 + (i % 3) * 12}px`,
            }}>
            {icon}
          </div>
        ))}
      </div>

      {/* ========== FLOATING WA - KANAN BAWAH ========== */}
      <a 
        href={`https://wa.me/6289518727462?text=${WA_MESSAGE}`}
        target="_blank" rel="noopener noreferrer"
        className="fixed bottom-6 right-6 z-50 group flex items-center gap-3"
        title="Konsultasi Gratis - Next Generation Ecosystem"
      >
        {/* Text - muncul saat hover */}
        <span className="text-sm font-bold text-white bg-gradient-to-r from-[#25D366] to-[#128C7E] px-5 py-2.5 rounded-2xl shadow-xl opacity-0 group-hover:opacity-100 transition-all duration-300 whitespace-nowrap translate-x-4 group-hover:translate-x-0">
          🎮→📚 Dari Game ke Bimbel
        </span>
        
        {/* WA Icon */}
        <div className="relative flex-shrink-0">
          <div className="absolute inset-0 rounded-full bg-[#25D366]/25 animate-ping" style={{ animationDuration: '3s' }}></div>
          <div className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-[#25D366]/60 animate-ping" style={{ animationDuration: '1.5s' }}></div>
          <div className="absolute -bottom-0.5 -left-0.5 w-1.5 h-1.5 rounded-full bg-[#25D366]/50 animate-ping" style={{ animationDuration: '2s', animationDelay: '0.7s' }}></div>
          
          <div className="relative w-12 h-12 rounded-full bg-gradient-to-br from-[#25D366] to-[#128C7E] flex items-center justify-center shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110"
            style={{ animation: 'soft-float 3s ease-in-out infinite' }}>
            <svg viewBox="0 0 24 24" className="w-6 h-6 fill-white">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347"/>
            </svg>
          </div>
        </div>
      </a>

      {/* Main Card */}
      <div className="relative z-10 w-full max-w-sm animate-slide-up">
        <div className="bg-white/70 backdrop-blur-xl rounded-3xl p-8 shadow-2xl border border-white/50 text-center">
          
          <div className="text-7xl mb-4 animate-float">🎮</div>
          
          <h1 className="text-3xl font-extrabold mb-1 bg-gradient-to-r from-purple-600 via-pink-500 to-orange-400 bg-clip-text text-transparent">
            Kid Arcade!
          </h1>
          <p className="text-gray-500 text-sm mb-6">Game Matematika Seru & Gratis untuk Anak</p>

          {error && (
            <div className="mb-4 p-2 bg-red-50 border border-red-200 rounded-xl text-sm text-red-500 animate-shake">⚠️ {error}</div>
          )}

          <input ref={inputRef} type="text" placeholder="Tulis nama kamu..." value={inputName}
            onChange={(e) => setInputName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleStartClick()}
            className="w-full p-4 border-2 border-gray-200 rounded-2xl text-center text-lg mb-4 focus:border-purple-400 focus:outline-none transition-colors"
            autoFocus maxLength={20} disabled={isLoading} />

          <button onClick={handleStartClick} disabled={!inputName.trim() || isLoading}
            className={`w-full py-4 rounded-2xl font-bold text-lg transition-all duration-200 ${
              inputName.trim() && !isLoading
                ? 'bg-gradient-to-r from-purple-500 via-pink-500 to-orange-400 text-white shadow-lg hover:scale-[1.02] active:scale-95'
                : 'bg-gray-200 text-gray-400 cursor-not-allowed'}`}>
            {isLoading ? 'Menyiapkan...' : '🚀 Mulai Petualangan!'}
          </button>

          <p className="mt-4 text-xs text-gray-400">Tidak perlu daftar • Main langsung ✨</p>
        </div>

        {/* Powered by */}
        <p className="mt-3 text-center">
          <a href="https://xgeneration.netlify.app/pricing" target="_blank" rel="noopener noreferrer"
            className="text-[10px] text-white/50 hover:text-white/80 transition-all">
            🚀 Powered by Next Generation Ecosystem
          </a>
        </p>
      </div>

      <p className="absolute bottom-4 text-xs text-white/50">Dibuat dengan ❤️ untuk anak Indonesia</p>
    </main>
  );
}