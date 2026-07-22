// app/components/ui/GameCard.tsx
'use client';

import { useThemeStyles } from '@/hooks/useThemeStyles';

export default function GameCard({ children }: { children: React.ReactNode }) {
  const theme = useThemeStyles();
  
  return (
    <div style={{ 
      background: theme.bgCard, 
      color: theme.text,
      borderRadius: '20px',
      padding: '24px',
      boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
      minHeight: '400px',
    }}>
      {children}
    </div>
  );
}