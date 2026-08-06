import { Injectable } from '@angular/core';

/**
 * Synthesizes all UI sounds with the Web Audio API - no audio assets needed.
 * The AudioContext is created lazily on the first call, because browsers
 * only allow audio after a user gesture (swipe/click/send all qualify).
 */
@Injectable({ providedIn: 'root' })
export class SoundService {
  private audioContext: AudioContext | null = null;

  private get context(): AudioContext {
    if (!this.audioContext) {
      this.audioContext = new AudioContext();
    }
    if (this.audioContext.state === 'suspended') {
      void this.audioContext.resume();
    }
    return this.audioContext;
  }

  private tone(options: {
    frequency: number;
    endFrequency?: number;
    duration: number;
    type?: OscillatorType;
    volume?: number;
    delay?: number;
  }): void {
    const { frequency, endFrequency, duration, type = 'sine', volume = 0.15, delay = 0 } = options;
    const ctx = this.context;
    const start = ctx.currentTime + delay;

    const oscillator = ctx.createOscillator();
    oscillator.type = type;
    oscillator.frequency.setValueAtTime(frequency, start);
    if (endFrequency) {
      oscillator.frequency.exponentialRampToValueAtTime(endFrequency, start + duration);
    }

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0, start);
    gain.gain.linearRampToValueAtTime(volume, start + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);

    oscillator.connect(gain).connect(ctx.destination);
    oscillator.start(start);
    oscillator.stop(start + duration);
  }

  /** Deep filtered-noise whoosh with a low-end thump; pitch rises for like, falls for nope. */
  playSwipe(toRight: boolean): void {
    const ctx = this.context;
    const duration = 0.3;
    const bufferSize = Math.floor(ctx.sampleRate * duration);
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    const noise = ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(toRight ? 220 : 700, ctx.currentTime);
    filter.frequency.exponentialRampToValueAtTime(toRight ? 700 : 220, ctx.currentTime + duration);

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.25, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);

    noise.connect(filter).connect(gain).connect(ctx.destination);
    noise.start();
    noise.stop(ctx.currentTime + duration);

    // Low "fwump" body underneath the whoosh
    this.tone({ frequency: 130, endFrequency: 60, duration: 0.22, type: 'sine', volume: 0.28 });
  }

  /** Warm, low-rooted chord swell instead of a high-pitched arpeggio. */
  playMatch(): void {
    this.tone({ frequency: 196, duration: 0.5, type: 'sine', volume: 0.18 });
    this.tone({ frequency: 392, duration: 0.18, type: 'triangle', volume: 0.22 });
    this.tone({ frequency: 494, duration: 0.18, type: 'triangle', volume: 0.22, delay: 0.12 });
    this.tone({ frequency: 587, duration: 0.4, type: 'triangle', volume: 0.22, delay: 0.24 });
  }

  /** Rounded, deep "pop" for outgoing messages. */
  playSend(): void {
    this.tone({ frequency: 320, endFrequency: 520, duration: 0.14, type: 'triangle', volume: 0.2 });
    this.tone({ frequency: 130, duration: 0.1, type: 'sine', volume: 0.18 });
  }

  /** Mellow low two-tone knock for incoming cat replies. */
  playReceive(): void {
    this.tone({ frequency: 523, duration: 0.15, type: 'triangle', volume: 0.18 });
    this.tone({ frequency: 392, duration: 0.28, type: 'triangle', volume: 0.18, delay: 0.1 });
    this.tone({ frequency: 196, duration: 0.2, type: 'sine', volume: 0.12 });
  }
}
