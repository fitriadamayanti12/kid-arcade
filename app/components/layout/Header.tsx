// app/components/layout/Header.tsx
'use client';

import { useState } from 'react';
import { useThemeStyles } from '@/hooks/useThemeStyles';

interface HeaderProps {
  playerName: string;
  selectedAvatar: string;
  soundEnabled: boolean;
  onToggleSound: () => void;
  onLogout: () => void;
  selectedGrade: string;
  onGradeChange: (grade: string) => void;
}

const GRADES = [
  { id: 'all', label: 'Semua', emoji: '🎮', color: '#7c3aed' },
  { id: 'paud', label: 'PAUD', emoji: '👶', color: '#f59e0b' },
  { id: 'tk', label: 'TK', emoji: '🎨', color: '#ec4899' },
  { id: '1', label: 'Kelas 1', emoji: '📚', color: '#10b981' },
  { id: '2', label: 'Kelas 2', emoji: '✏️', color: '#3b82f6' },
  { id: '3', label: 'Kelas 3', emoji: '🌟', color: '#8b5cf6' },
  { id: '4', label: 'Kelas 4', emoji: '🚀', color: '#ef4444' },
  { id: '5', label: 'Kelas 5', emoji: '💡', color: '#f97316' },
  { id: '6', label: 'Kelas 6', emoji: '🏆', color: '#06b6d4' },
];

export default function Header({
  playerName, selectedAvatar, soundEnabled, onToggleSound, onLogout,
  selectedGrade, onGradeChange,
}: HeaderProps) {
  const theme = useThemeStyles();
  const [showGrades, setShowGrades] = useState(false);

  const toggleDark = () => {
    document.documentElement.classList.toggle('dark');
    localStorage.setItem('kid-arcade-theme', 
      document.documentElement.classList.contains('dark') ? 'dark' : 'light'
    );
  };

  const currentGrade = GRADES.find(g => g.id === selectedGrade);
  const d = theme.isDark;

  return (
    <div style={{ marginBottom: '16px' }}>
      {/* TOP BAR */}
      <div style={{
        background: d ? '#1e293b' : '#ffffff',
        borderRadius: '20px', padding: '12px 20px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        flexWrap: 'wrap', gap: '10px',
        boxShadow: d ? '0 2px 12px rgba(0,0,0,0.3)' : '0 2px 12px rgba(0,0,0,0.06)',
        border: `1px solid ${d ? '#334155' : '#e2e8f0'}`,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ fontSize: '36px' }}>{selectedAvatar}</div>
          <div>
            <h1 style={{ fontSize: '20px', fontWeight: '800', color: d ? '#f1f5f9' : '#0f172a', margin: 0 }}>
              🎮 {playerName}&apos;s Arcade
            </h1>
            <p style={{ fontSize: '12px', color: d ? '#94a3b8' : '#64748b', margin: 0 }}>
              Game Matematika Seru!
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <button onClick={toggleDark} style={{
            background: d ? '#fbbf24' : '#334155', color: d ? '#000' : '#fff',
            border: 'none', borderRadius: '12px', width: '40px', height: '40px', fontSize: '18px', cursor: 'pointer',
          }}>{d ? '☀️' : '🌙'}</button>

          <button onClick={onToggleSound} style={{
            background: d ? '#334155' : '#f1f5f9', border: 'none',
            borderRadius: '12px', width: '40px', height: '40px', fontSize: '18px', cursor: 'pointer',
          }}>{soundEnabled ? '🔊' : '🔇'}</button>

          <button onClick={onLogout} style={{
            background: d ? '#3b0a0a' : '#fee2e2', color: d ? '#fca5a5' : '#991b1b',
            border: 'none', borderRadius: '12px', padding: '8px 12px', fontSize: '14px', fontWeight: '600', cursor: 'pointer',
          }}>🚪</button>
        </div>
      </div>

      {/* GRADE FILTER */}
      <div style={{ marginTop: '8px' }}>
        <button onClick={() => setShowGrades(!showGrades)} style={{
          background: selectedGrade !== 'all' ? currentGrade?.color : d ? '#1e293b' : '#ffffff',
          color: selectedGrade !== 'all' ? '#fff' : d ? '#e2e8f0' : '#1e293b',
          border: selectedGrade !== 'all' ? 'none' : `1px solid ${d ? '#334155' : '#e2e8f0'}`,
          borderRadius: '14px', padding: '10px 18px', fontSize: '14px', fontWeight: '700',
          cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px',
          boxShadow: selectedGrade !== 'all' ? `0 2px 8px ${currentGrade?.color}40` : 'none',
        }}>
          <span style={{ fontSize: '18px' }}>{currentGrade?.emoji || '🎮'}</span>
          <span style={{ color: selectedGrade !== 'all' ? '#fff' : d ? '#e2e8f0' : '#1e293b' }}>
            {currentGrade?.label || 'Pilih Kelas'}
          </span>
          <span style={{ fontSize: '10px', color: selectedGrade !== 'all' ? '#fff' : d ? '#e2e8f0' : '#1e293b' }}>
            {showGrades ? '▲' : '▼'}
          </span>
        </button>

        {showGrades && (
          <div style={{ marginTop: '8px', display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
            {GRADES.map((grade) => {
              const isActive = selectedGrade === grade.id;
              return (
                <button key={grade.id} onClick={() => { onGradeChange(grade.id); setShowGrades(false); }} style={{
                  background: isActive ? grade.color : d ? '#334155' : '#ffffff',
                  color: isActive ? '#fff' : d ? '#e2e8f0' : '#1e293b',
                  border: isActive ? `2px solid ${grade.color}` : `1px solid ${d ? '#475569' : '#e2e8f0'}`,
                  borderRadius: '20px', padding: '8px 14px', fontSize: '13px', fontWeight: '600',
                  cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px',
                  boxShadow: isActive ? `0 2px 8px ${grade.color}40` : 'none',
                  transform: isActive ? 'scale(1.05)' : 'scale(1)',
                }}>
                  <span style={{ fontSize: '16px' }}>{grade.emoji}</span>
                  <span style={{ color: isActive ? '#fff' : d ? '#e2e8f0' : '#1e293b' }}>{grade.label}</span>
                  {isActive && <span style={{ fontSize: '10px', color: '#fff', background: 'rgba(255,255,255,0.3)', borderRadius: '50%', width: '18px', height: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✓</span>}
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}