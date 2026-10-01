// app/components/ui/GameCard.tsx
'use client';

import { useThemeStyles } from '@/hooks/useThemeStyles';

interface GameCardProps {
  /** 'category' = kartu besar pilih tingkat, 'game' = kartu kecil pilih game */
  variant?: 'game' | 'category';
  label: string;
  color: string;
  textColor?: string;
  selected?: boolean;
  /** 1 = mudah, 2 = sedang, 3 = menantang — dipakai variant 'game' */
  difficulty?: 1 | 2 | 3;
  isNew?: boolean;
  isHot?: boolean;
  /** jumlah game — dipakai variant 'category' */
  count?: number;
  onClick: () => void;
}

export default function GameCard({
  variant = 'game',
  label,
  color,
  textColor,
  selected = false,
  difficulty,
  isNew,
  isHot,
  count,
  onClick,
}: GameCardProps) {
  const theme = useThemeStyles();
  const d = theme.isDark;

  if (variant === 'category') {
    return (
      <button
        onClick={onClick}
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '5px',
          minHeight: '104px',
          padding: '18px 8px',
          borderRadius: '20px',
          border: `2px solid ${color}33`,
          background: d ? `${color}26` : `${color}14`,
          cursor: 'pointer',
          transition: 'transform 0.15s ease, box-shadow 0.15s ease',
          boxShadow: `0 3px 10px ${color}22`,
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'translateY(-4px) scale(1.03)';
          e.currentTarget.style.boxShadow = `0 10px 20px ${color}40`;
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'translateY(0) scale(1)';
          e.currentTarget.style.boxShadow = `0 3px 10px ${color}22`;
        }}
      >
        <span style={{ fontSize: '36px', lineHeight: 1 }}>{label.split(' ')[0]}</span>
        <span style={{ fontSize: '14.5px', fontWeight: 800, color: d ? '#f1f5f9' : '#0f172a' }}>
          {label.split(' ').slice(1).join(' ')}
        </span>
        {typeof count === 'number' && (
          <span
            style={{
              fontSize: '11px',
              fontWeight: 700,
              color,
              background: d ? 'rgba(255,255,255,0.1)' : '#ffffff',
              borderRadius: '999px',
              padding: '3px 10px',
              marginTop: '2px',
            }}
          >
            {count} game
          </span>
        )}
      </button>
    );
  }

  const stars = difficulty ? '⭐'.repeat(difficulty) + '☆'.repeat(3 - difficulty) : null;

  return (
    <button
      onClick={onClick}
      style={{
        position: 'relative',
        width: '100%',
        minHeight: '92px',
        padding: '16px 10px 14px',
        borderRadius: '18px',
        border: selected ? `2px solid ${textColor || color}` : `1px solid ${theme.border}`,
        background: selected ? color : theme.bgCard,
        color: selected ? textColor || theme.text : theme.text,
        fontWeight: selected ? 800 : 600,
        fontSize: '15px',
        lineHeight: 1.3,
        cursor: 'pointer',
        transition: 'transform 0.15s ease, box-shadow 0.15s ease',
        boxShadow: selected ? `0 6px 16px ${color}80` : theme.shadowSm,
        transform: selected ? 'scale(1.04)' : 'scale(1)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '7px',
        textAlign: 'center',
      }}
      onMouseEnter={(e) => {
        if (!selected) e.currentTarget.style.transform = 'translateY(-3px)';
      }}
      onMouseLeave={(e) => {
        if (!selected) e.currentTarget.style.transform = 'translateY(0)';
      }}
    >
      {(isNew || isHot) && (
        <span
          style={{
            position: 'absolute',
            top: '-8px',
            right: '-6px',
            fontSize: '9px',
            fontWeight: 800,
            color: '#fff',
            background: isHot ? '#f43f5e' : '#22c55e',
            borderRadius: '999px',
            padding: '2px 7px',
            boxShadow: '0 2px 6px rgba(0,0,0,0.25)',
            transform: 'rotate(6deg)',
          }}
        >
          {isHot ? '🔥 HOT' : 'BARU'}
        </span>
      )}
      <span>{label}</span>
      {stars && <span style={{ fontSize: '11px', letterSpacing: '1px', opacity: 0.85 }}>{stars}</span>}
    </button>
  );
}
