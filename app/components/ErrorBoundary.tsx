'use client';

import React from 'react';

interface Props {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export default class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('🔴 ErrorBoundary:', error.message);
    console.error('Component stack:', errorInfo.componentStack);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: undefined });
  };

  handleReload = () => {
    if (typeof window !== 'undefined') {
      window.location.reload();
    }
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback;

      const isDark = typeof document !== 'undefined' && document.documentElement.classList.contains('dark');

      return (
        <div style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: isDark ? '#0f172a' : '#f8fafc',
          padding: '20px',
        }}>
          <div style={{
            background: isDark ? '#1e293b' : '#ffffff',
            borderRadius: '24px',
            padding: '32px 24px',
            maxWidth: '400px',
            textAlign: 'center',
            boxShadow: '0 10px 40px rgba(0,0,0,0.1)',
            border: `1px solid ${isDark ? '#334155' : '#e2e8f0'}`,
          }}>
            <div style={{ fontSize: '60px', marginBottom: '16px' }}>🔧</div>
            <h2 style={{
              fontSize: '22px',
              fontWeight: '800',
              color: isDark ? '#f1f5f9' : '#0f172a',
              marginBottom: '8px',
            }}>
              Ups! Ada Kesalahan
            </h2>
            <p style={{
              fontSize: '14px',
              color: isDark ? '#94a3b8' : '#64748b',
              marginBottom: '20px',
            }}>
              Jangan khawatir, ini bukan salahmu! Coba salah satu tombol di bawah:
            </p>

            {/* Error details (development only) */}
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <div style={{
                background: isDark ? '#334155' : '#f1f5f9',
                borderRadius: '10px',
                padding: '10px',
                marginBottom: '16px',
                fontSize: '11px',
                textAlign: 'left',
                color: isDark ? '#f87171' : '#ef4444',
                maxHeight: '100px',
                overflow: 'auto',
              }}>
                {this.state.error.message}
              </div>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <button onClick={this.handleReset} style={{
                padding: '12px 20px',
                borderRadius: '12px',
                border: 'none',
                background: '#7c3aed',
                color: '#fff',
                fontSize: '15px',
                fontWeight: '700',
                cursor: 'pointer',
                transition: 'transform 0.2s',
              }}>
                🔄 Coba Lagi
              </button>

              <button onClick={this.handleReload} style={{
                padding: '12px 20px',
                borderRadius: '12px',
                border: 'none',
                background: isDark ? '#334155' : '#f1f5f9',
                color: isDark ? '#e2e8f0' : '#1e293b',
                fontSize: '15px',
                fontWeight: '700',
                cursor: 'pointer',
                transition: 'transform 0.2s',
              }}>
                🏠 Kembali ke Awal
              </button>
            </div>

            <p style={{
              marginTop: '16px',
              fontSize: '11px',
              color: isDark ? '#64748b' : '#94a3b8',
            }}>
              Jika masalah berlanjut, coba muat ulang halaman
            </p>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}