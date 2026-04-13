// hooks/useSoundEffect.ts
'use client';

import { useEffect, useRef, useCallback } from 'react';

// UPDATE: Tambahkan 'match' ke SoundType
export type SoundType = 'correct' | 'wrong' | 'win' | 'click' | 'levelUp' | 'reward' | 'timer' | 'match';

interface SoundOptions {
  volume?: number;
  loop?: boolean;
}

class SoundGenerator {
  private audioContext: AudioContext | null = null;
  private enabled: boolean = true;
  private initialized: boolean = false;

  private initAudioContext() {
    if (!this.audioContext && typeof window !== 'undefined') {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
  }

  // Enable audio after user interaction
  public enable() {
    if (!this.initialized) {
      this.initAudioContext();
      if (this.audioContext && this.audioContext.state === 'suspended') {
        this.audioContext.resume();
      }
      this.initialized = true;
    }
  }

  private playTone(frequency: number, duration: number, volume: number = 0.2, delay: number = 0) {
    if (!this.enabled) return;
    
    setTimeout(() => {
      this.initAudioContext();
      if (!this.audioContext) return;

      const oscillator = this.audioContext.createOscillator();
      const gainNode = this.audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(this.audioContext.destination);
      
      oscillator.frequency.value = frequency;
      gainNode.gain.value = volume;
      
      oscillator.start();
      gainNode.gain.exponentialRampToValueAtTime(0.00001, this.audioContext.currentTime + duration);
      oscillator.stop(this.audioContext.currentTime + duration);
    }, delay);
  }

  playCorrect() {
    this.playTone(880, 0.3, 0.25); // A5
    this.playTone(1046.5, 0.3, 0.25, 0.15); // C6
  }

  playWrong() {
    this.playTone(220, 0.4, 0.2); // A3
    this.playTone(196, 0.4, 0.2, 0.2); // G3
  }

  playWin() {
    const notes = [523.25, 659.25, 783.99, 1046.5];
    notes.forEach((freq, i) => {
      this.playTone(freq, 0.5, 0.2, i * 0.15);
    });
  }

  playClick() {
    this.playTone(440, 0.08, 0.1);
  }

  playLevelUp() {
    const notes = [440, 554.37, 659.25, 880];
    notes.forEach((freq, i) => {
      this.playTone(freq, 0.3, 0.15, i * 0.1);
    });
  }

  playReward() {
    const notes = [523.25, 659.25, 783.99, 1046.5, 1318.52];
    notes.forEach((freq, i) => {
      this.playTone(freq, 0.4, 0.2, i * 0.12);
    });
  }

  playTimer() {
    this.playTone(880, 0.1, 0.15);
    this.playTone(880, 0.1, 0.15, 0.2);
    this.playTone(880, 0.2, 0.15, 0.4);
  }

  // UPDATE: Tambahkan method playMatch
  playMatch() {
    this.playTone(659.25, 0.2, 0.2);
    this.playTone(783.99, 0.2, 0.2, 0.1);
  }

  play(type: SoundType) {
    this.enable();
    switch(type) {
      case 'correct': this.playCorrect(); break;
      case 'wrong': this.playWrong(); break;
      case 'win': this.playWin(); break;
      case 'click': this.playClick(); break;
      case 'levelUp': this.playLevelUp(); break;
      case 'reward': this.playReward(); break;
      case 'timer': this.playTimer(); break;
      case 'match': this.playMatch(); break;
      default: break;
    }
  }

  toggleSound() {
    this.enabled = !this.enabled;
    return this.enabled;
  }

  isEnabled() {
    return this.enabled;
  }
}

const soundGenerator = new SoundGenerator();

export const useSoundEffect = () => {
  const playSound = useCallback((type: SoundType) => {
    soundGenerator.play(type);
  }, []);

  const toggleSound = useCallback(() => {
    return soundGenerator.toggleSound();
  }, []);

  const isSoundEnabled = useCallback(() => {
    return soundGenerator.isEnabled();
  }, []);

  return { playSound, toggleSound, isSoundEnabled };
};

export const playSound = (type: SoundType) => {
  soundGenerator.play(type);
};