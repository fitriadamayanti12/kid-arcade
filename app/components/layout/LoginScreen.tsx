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
    <main className="min-h-screen relative overflow-hidden flex items-center justify-center p-4"
      style={{ 
        background: 'linear-gradient(135deg, #0d0221 0%, #1a0a3e 30%, #2d1b69 60%, #4c1d95 100%)',
      }}>
      
      {/* BINTANG - Partikel Kecil */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {Array.from({ length: 50 }).map((_, i) => (
          <div key={i} className="absolute rounded-full"
            style={{
              width: `${2 + Math.random() * 3}px`,
              height: `${2 + Math.random() * 3}px`,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              background: '#ffffff',
              boxShadow: '0 0 4px #ffffff, 0 0 8px #00f5ff',
              opacity: 0.3 + Math.random() * 0.7,
              animation: `twinkle ${2 + Math.random() * 3}s ease-in-out infinite`,
              animationDelay: `${Math.random() * 3}s`,
            }}
          />
        ))}
      </div>

      {/* AURORA BLOB - Energi Cosmic */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-[600px] h-[600px] rounded-full filter blur-7xl opacity-25 animate-pulse"
          style={{ background: 'radial-gradient(circle, #00f5ff, transparent)', animationDuration: '4s' }}></div>
        <div className="absolute -bottom-40 -left-40 w-[600px] h-[600px] rounded-full filter blur-7xl opacity-25 animate-pulse" 
          style={{ background: 'radial-gradient(circle, #ff2d95, transparent)', animationDuration: '5s', animationDelay: '1s' }}></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full filter blur-7xl opacity-20 animate-pulse" 
          style={{ background: 'radial-gradient(circle, #ffd700, transparent)', animationDuration: '6s', animationDelay: '2s' }}></div>
      </div>

      {/* FLOATING ICONS - Cepat Energik */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {['🎮', '🕹️', '👾', '⭐', '💫', '🚀', '✨', '🎯', '💎', '🔥', '⚡', '🌟'].map((icon, i) => (
          <div key={i} className="absolute animate-float"
            style={{
              left: `${5 + (i * 9) % 90}%`, 
              top: `${5 + (i * 11) % 90}%`,
              animationDelay: `${i * 0.3}s`, 
              animationDuration: `${2.5 + (i % 3) * 1.5}s`,
              fontSize: `${18 + (i % 3) * 14}px`,
              opacity: 0.4,
              filter: 'drop-shadow(0 0 6px rgba(0,245,255,0.4))',
            }}>
            {icon}
          </div>
        ))}
      </div>

      {/* ========== FLOATING WA ========== */}
      <a 
        href={`https://wa.me/6289518727462?text=${WA_MESSAGE}`}
        target="_blank" rel="noopener noreferrer"
        className="fixed bottom-6 right-6 z-50 group flex items-center gap-3"
        title="Konsultasi Gratis - Next Generation Ecosystem"
      >
        <span className="text-sm font-bold text-white bg-gradient-to-r from-[#25D366] to-[#128C7E] px-5 py-2.5 rounded-2xl shadow-xl opacity-0 group-hover:opacity-100 transition-all duration-300 whitespace-nowrap translate-x-4 group-hover:translate-x-0"
          style={{ fontFamily: "'Plus Jakarta Sans', 'Inter', system-ui, sans-serif", boxShadow: '0 0 20px rgba(37,211,102,0.5)' }}>
          Dari Game ke Bimbel
        </span>
        
        <div className="relative flex-shrink-0">
          <div className="absolute inset-0 rounded-full bg-[#25D366]/30 animate-ping" style={{ animationDuration: '2s' }}></div>
          <div className="relative w-14 h-14 rounded-full bg-gradient-to-br from-[#25D366] to-[#128C7E] flex items-center justify-center shadow-2xl hover:scale-110 transition-all duration-300"
            style={{ animation: 'soft-float 2.5s ease-in-out infinite', boxShadow: '0 0 25px rgba(37,211,102,0.6)' }}>
            <svg viewBox="0 0 24 24" className="w-7 h-7 fill-white">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347"/>
            </svg>
          </div>
        </div>
      </a>

      {/* Main Card - COSMIC GLASS */}
      <div className="relative z-10 w-full max-w-sm animate-slide-up">
        <div className="rounded-3xl p-8 shadow-2xl border text-center"
          style={{
            background: 'rgba(255,255,255,0.04)',
            backdropFilter: 'blur(40px)',
            borderColor: 'rgba(0,245,255,0.2)',
            boxShadow: '0 0 40px rgba(0,245,255,0.1), 0 0 80px rgba(255,45,149,0.05), inset 0 0 30px rgba(255,255,255,0.03)',
          }}>
          
          {/* Next Generation Badge */}
          <div className="inline-flex items-center gap-2 mb-5 px-4 py-1.5 rounded-full"
            style={{
              background: 'rgba(0,245,255,0.08)',
              border: '1px solid rgba(0,245,255,0.25)',
              boxShadow: '0 0 15px rgba(0,245,255,0.15)',
            }}>
            <span className="w-5 h-5 rounded-md flex items-center justify-center text-white font-black text-[10px]"
              style={{ 
                background: 'linear-gradient(135deg, #00f5ff, #ff2d95)',
                fontFamily: "'Plus Jakarta Sans', 'Inter', system-ui, sans-serif",
                boxShadow: '0 0 10px rgba(0,245,255,0.5)',
              }}>N</span>
            <span className="text-[10px] font-bold tracking-wide"
              style={{ 
                color: '#00f5ff',
                fontFamily: "'Plus Jakarta Sans', 'Inter', system-ui, sans-serif",
                textShadow: '0 0 8px rgba(0,245,255,0.5)',
              }}>NEXT GENERATION ECOSYSTEM</span>
          </div>

          {/* Emoji Glowing */}
          <div className="text-7xl mb-4 animate-float" 
            style={{ filter: 'drop-shadow(0 0 20px rgba(0,245,255,0.4))' }}>🎮</div>
          
          {/* JUDUL - CYAN GLOW */}
          <h1 className="text-4xl font-black mb-2 tracking-tight" style={{ 
            fontFamily: "'Plus Jakarta Sans', 'Clash Display', 'Inter', system-ui, sans-serif",
            color: '#ffffff',
            textShadow: '0 0 20px rgba(0,245,255,0.6), 0 0 40px rgba(0,245,255,0.3), 0 2px 4px rgba(0,0,0,0.5)',
            letterSpacing: '-0.02em',
            lineHeight: '1.1',
          }}>
            Kid Arcade!
          </h1>
          
          {/* SUBTITLE - PINK GLOW */}
          <p className="text-base font-bold mb-1" style={{ 
            fontFamily: "'Plus Jakarta Sans', 'Inter', system-ui, sans-serif",
            color: '#ffd700',
            textShadow: '0 0 12px rgba(255,45,149,0.4), 0 1px 3px rgba(0,0,0,0.5)',
          }}>
            Game Matematika Seru &amp; Gratis
          </p>
          
          {/* TAGLINE - WHITE SOFT GLOW */}
          <p className="text-sm font-semibold mb-6" style={{ 
            fontFamily: "'Plus Jakarta Sans', 'Inter', system-ui, sans-serif",
            color: '#e0e7ff',
            textShadow: '0 0 8px rgba(0,245,255,0.2), 0 1px 2px rgba(0,0,0,0.4)',
          }}>
            Bagian dari <span style={{ color: '#ffffff', fontWeight: '800', textShadow: '0 0 12px rgba(0,245,255,0.5)' }}>Next Generation Ecosystem</span> 🚀
          </p>

          {error && (
            <div className="mb-4 p-3 rounded-xl text-sm font-semibold animate-shake"
              style={{ 
                background: 'rgba(255,45,149,0.15)', 
                border: '1px solid rgba(255,45,149,0.4)', 
                color: '#ffb8d9',
                textShadow: '0 0 6px rgba(255,45,149,0.3)',
              }}>
              ⚠️ {error}
            </div>
          )}

          {/* INPUT - CYAN BORDER GLOW */}
          <input ref={inputRef} type="text" placeholder="Tulis nama kamu..." value={inputName}
            onChange={(e) => setInputName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleStartClick()}
            className="w-full p-4 rounded-2xl text-center text-lg mb-4 focus:outline-none transition-all"
            style={{ 
              fontFamily: "'Plus Jakarta Sans', 'Inter', system-ui, sans-serif",
              background: 'rgba(255,255,255,0.06)',
              border: '2px solid rgba(0,245,255,0.3)',
              color: '#ffffff',
              boxShadow: '0 0 15px rgba(0,245,255,0.1)',
            }}
            autoFocus maxLength={20} disabled={isLoading} />

          {/* BUTTON - GOLD GLOW ENERGY */}
          <button onClick={handleStartClick} disabled={!inputName.trim() || isLoading}
            className={`w-full py-4 rounded-2xl font-bold text-lg transition-all duration-200 ${
              inputName.trim() && !isLoading
                ? 'shadow-xl hover:scale-[1.03] active:scale-95'
                : 'cursor-not-allowed'
            }`}
            style={{ 
              fontFamily: "'Plus Jakarta Sans', 'Inter', system-ui, sans-serif",
              background: inputName.trim() && !isLoading 
                ? 'linear-gradient(135deg, #00f5ff, #ff2d95, #ffd700)' 
                : 'rgba(255,255,255,0.06)',
              color: inputName.trim() && !isLoading ? '#0d0221' : 'rgba(255,255,255,0.3)',
              fontWeight: '900',
              boxShadow: inputName.trim() && !isLoading 
                ? '0 0 30px rgba(0,245,255,0.4), 0 0 60px rgba(255,45,149,0.2)' 
                : 'none',
            }}>
            {isLoading ? '⏳ Menyiapkan...' : '🚀 MULAI PETUALANGAN!'}
          </button>

          <p className="mt-4 text-xs font-medium" style={{ 
            fontFamily: "'Plus Jakarta Sans', 'Inter', system-ui, sans-serif",
            color: 'rgba(255,255,255,0.4)',
          }}>
            Tidak perlu daftar • Main langsung ✨
          </p>

          {/* Divider + Upsell */}
          <div className="mt-5 pt-4" style={{ borderTop: '1px solid rgba(0,245,255,0.12)' }}>
            <p className="text-[11px] font-semibold mb-2" style={{ 
              fontFamily: "'Plus Jakarta Sans', 'Inter', system-ui, sans-serif",
              color: 'rgba(255,255,255,0.5)',
              textShadow: '0 1px 2px rgba(0,0,0,0.3)',
            }}>
              Butuh bimbingan lebih?
            </p>
            <a
              href="https://xgeneration.netlify.app"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold transition-all hover:scale-105"
              style={{ 
                fontFamily: "'Plus Jakarta Sans', 'Inter', system-ui, sans-serif",
                background: 'rgba(0,245,255,0.08)',
                border: '1px solid rgba(0,245,255,0.25)',
                color: '#00f5ff',
                textShadow: '0 0 8px rgba(0,245,255,0.4)',
              }}>
              <span className="w-4 h-4 rounded flex items-center justify-center text-white font-black text-[8px]"
                style={{ background: 'linear-gradient(135deg, #00f5ff, #ff2d95)', boxShadow: '0 0 10px rgba(0,245,255,0.5)' }}>N</span>
              Bimbel • Programming • English
            </a>
          </div>
        </div>

        {/* Powered by */}
        <div className="mt-3 text-center">
          <a 
            href="https://xgeneration.netlify.app" 
            target="_blank" 
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-[11px] font-semibold transition-all group"
            style={{ 
              fontFamily: "'Plus Jakarta Sans', 'Inter', system-ui, sans-serif",
              color: 'rgba(255,255,255,0.45)',
              textShadow: '0 1px 2px rgba(0,0,0,0.4)',
            }}>
            <span className="w-4 h-4 rounded flex items-center justify-center text-white font-black text-[8px] transition-all"
              style={{ background: 'rgba(0,245,255,0.12)', boxShadow: '0 0 6px rgba(0,245,255,0.2)' }}>N</span>
            Powered by <span style={{ color: '#00f5ff', fontWeight: '700', textShadow: '0 0 10px rgba(0,245,255,0.5)' }}>Next Generation Ecosystem</span>
          </a>
        </div>
      </div>

      {/* Footer */}
      <div className="absolute bottom-4 left-0 right-0 text-center">
        <p className="text-xs font-medium" style={{ 
          fontFamily: "'Plus Jakarta Sans', 'Inter', system-ui, sans-serif",
          color: 'rgba(255,255,255,0.3)',
          textShadow: '0 1px 2px rgba(0,0,0,0.3)',
        }}>
          Dibuat dengan ❤️ untuk anak Indonesia{' '}
        </p>
      </div>

      {/* Fonts + Animations */}
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&display=swap');
        @import url('https://api.fontshare.com/v2/css?f[]=clash-display@600,700,900&display=swap');
        
        * {
          font-family: 'Plus Jakarta Sans', 'Inter', system-ui, sans-serif;
        }
        
        @keyframes twinkle {
          0%, 100% { opacity: 0.2; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.5); }
        }
        
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(5deg); }
        }
        
        @keyframes soft-float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-8px); }
        }
        
        @keyframes slide-up {
          from { opacity: 0; transform: translateY(40px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-5px); }
          75% { transform: translateX(5px); }
        }
        
        .animate-float { animation: float 3s ease-in-out infinite; }
        .animate-slide-up { animation: slide-up 0.8s ease-out; }
        .animate-shake { animation: shake 0.3s ease-in-out; }
        
        input::placeholder {
          color: rgba(255,255,255,0.35) !important;
        }
        
        input:focus {
          border-color: #00f5ff !important;
          box-shadow: 0 0 25px rgba(0,245,255,0.3) !important;
        }
      `}</style>
    </main>
  );
}