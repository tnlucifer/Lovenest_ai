// Ambient Audio Synthesizer & Player using Web Audio API
// Guarantees zero broken URLs, zero copyright issues, and instant loading on any mobile/desktop browser!

export interface AudioTrackInfo {
  id: 'happy-birthday' | 'celebration' | 'warm-piano' | 'music-box' | 'acoustic' | 'lofi-rain' | 'custom' | 'youtube' | 'upload' | 'none';
  name: string;
  mood: string;
  badge?: string;
}

export const AUDIO_TRACKS: AudioTrackInfo[] = [
  { 
    id: 'youtube', 
    name: 'Special Song (YouTube Link)', 
    mood: 'Play your favorite song from YouTube' 
  },
  { 
    id: 'upload', 
    name: 'Upload Your Audio File', 
    mood: 'Original MP3/WAV from your phone or PC' 
  },
  { 
    id: 'none', 
    name: 'No Music', 
    mood: 'Silent peaceful reading' 
  },
];

interface MelodicNote {
  f: number;
  dur: number;
  time: number;
  accent?: boolean;
}

// "Happy Birthday to You" notes (Key of C)
const HAPPY_BIRTHDAY_NOTES: MelodicNote[] = [
  // 1: Hap-py Birth-day to you
  { f: 392.00, dur: 0.35, time: 0.0 },
  { f: 392.00, dur: 0.35, time: 0.4 },
  { f: 440.00, dur: 0.70, time: 0.8 },
  { f: 392.00, dur: 0.70, time: 1.5 },
  { f: 523.25, dur: 0.70, time: 2.2 },
  { f: 493.88, dur: 1.30, time: 2.9, accent: true },

  // 2: Hap-py Birth-day to you
  { f: 392.00, dur: 0.35, time: 4.4 },
  { f: 392.00, dur: 0.35, time: 4.8 },
  { f: 440.00, dur: 0.70, time: 5.2 },
  { f: 392.00, dur: 0.70, time: 5.9 },
  { f: 587.33, dur: 0.70, time: 6.6 },
  { f: 523.25, dur: 1.30, time: 7.3, accent: true },

  // 3: Hap-py Birth-day dear someone
  { f: 392.00, dur: 0.35, time: 8.8 },
  { f: 392.00, dur: 0.35, time: 9.2 },
  { f: 783.99, dur: 0.75, time: 9.6, accent: true },
  { f: 659.25, dur: 0.75, time: 10.4 },
  { f: 523.25, dur: 0.70, time: 11.2 },
  { f: 493.88, dur: 0.70, time: 11.9 },
  { f: 440.00, dur: 1.20, time: 12.6, accent: true },

  // 4: Hap-py Birth-day to you!
  { f: 698.46, dur: 0.35, time: 14.0 },
  { f: 698.46, dur: 0.35, time: 14.4 },
  { f: 659.25, dur: 0.70, time: 14.8 },
  { f: 523.25, dur: 0.70, time: 15.5 },
  { f: 587.33, dur: 0.70, time: 16.2 },
  { f: 523.25, dur: 2.00, time: 16.9, accent: true },
];

const HAPPY_BIRTHDAY_CHORDS = [
  { f: [130.81, 196.00, 329.63], time: 0.0, dur: 2.0 },  // C
  { f: [196.00, 246.94, 293.66], time: 2.2, dur: 2.0 },  // G
  { f: [196.00, 246.94, 293.66], time: 4.4, dur: 2.0 },  // G
  { f: [130.81, 196.00, 261.63], time: 6.6, dur: 2.0 },  // C
  { f: [130.81, 196.00, 329.63], time: 8.8, dur: 2.5 },  // C
  { f: [174.61, 220.00, 261.63], time: 11.9, dur: 2.0 }, // F
  { f: [130.81, 196.00, 261.63], time: 14.8, dur: 1.4 }, // C
  { f: [196.00, 246.94, 293.66], time: 16.2, dur: 1.2 }, // G
  { f: [130.81, 196.00, 261.63, 329.63, 523.25], time: 16.9, dur: 2.5 }, // C Final
];

// Uplifting Celebration Fanfare
const CELEBRATION_NOTES: MelodicNote[] = [
  { f: 523.25, dur: 0.3, time: 0.0 },
  { f: 659.25, dur: 0.3, time: 0.3 },
  { f: 783.99, dur: 0.4, time: 0.6 },
  { f: 1046.50, dur: 0.8, time: 1.0, accent: true },
  { f: 880.00, dur: 0.4, time: 1.8 },
  { f: 783.99, dur: 0.6, time: 2.2 },
  { f: 659.25, dur: 0.8, time: 2.8 },

  { f: 587.33, dur: 0.3, time: 3.8 },
  { f: 659.25, dur: 0.3, time: 4.1 },
  { f: 783.99, dur: 0.4, time: 4.4 },
  { f: 880.00, dur: 0.8, time: 4.8, accent: true },
  { f: 783.99, dur: 0.4, time: 5.6 },
  { f: 659.25, dur: 0.5, time: 6.0 },
  { f: 523.25, dur: 1.2, time: 6.5, accent: true },
];

class AudioController {
  private ctx: AudioContext | null = null;
  private isPlaying = false;
  private currentTrack: string = 'none';
  private timer: number | null = null;
  private externalAudio: HTMLAudioElement | null = null;
  private masterGain: GainNode | null = null;
  private volume: number = 0.6;
  private onStateChangeListeners: Array<(playing: boolean) => void> = [];

  private initContext() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtx();
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(this.volume, Math.max(0, this.ctx.currentTime));
      this.masterGain.connect(this.ctx.destination);
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public subscribe(cb: (playing: boolean) => void) {
    this.onStateChangeListeners.push(cb);
    return () => {
      this.onStateChangeListeners = this.onStateChangeListeners.filter(l => l !== cb);
    };
  }

  private notify() {
    this.onStateChangeListeners.forEach(cb => cb(this.isPlaying));
  }

  public setVolume(val: number) {
    this.volume = Math.max(0, Math.min(1, val));
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setValueAtTime(this.volume, Math.max(0, this.ctx.currentTime));
    }
    if (this.externalAudio) {
      this.externalAudio.volume = this.volume;
    }
  }

  public play(trackId: string = 'none', customUrl?: string) {
    this.stop();
    this.currentTrack = trackId;

    // Strictly ONLY play uploaded/custom audio files. NEVER play sample musics!
    if ((trackId === 'custom' || trackId === 'upload') && customUrl && customUrl.length > 50) {
      try {
        if (!this.externalAudio || this.externalAudio.src !== customUrl) {
          this.externalAudio = new Audio(customUrl);
          this.externalAudio.volume = this.volume;
          this.externalAudio.loop = true;
        }
        const promise = this.externalAudio.play();
        if (promise !== undefined) {
          promise
            .then(() => {
              this.isPlaying = true;
              this.notify();
            })
            .catch(e => {
              console.warn("Uploaded audio playback waiting for user tap:", e);
              this.isPlaying = false;
              this.notify();
            });
        }
      } catch (err) {
        console.warn("Error starting custom/uploaded audio", err);
        this.isPlaying = false;
        this.notify();
      }
      return;
    }

    // For all other tracks (youtube, none, or any sample melody): NO synthesized sounds!
    this.isPlaying = false;
    this.notify();
  }

  private playTone(
    freq: number,
    delaySeconds: number,
    durationSeconds: number,
    isAccent = false,
    isHarmony = false
  ) {
    if (!this.ctx || !this.isPlaying || !this.masterGain) return;
    try {
      const baseTime = Math.max(0, this.ctx.currentTime);
      const startTime = baseTime + Math.max(0, delaySeconds);

      // Primary oscillator
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = isHarmony ? 'triangle' : 'sine';
      osc.frequency.setValueAtTime(freq, startTime);

      const peakVolume = isHarmony ? 0.035 : (isAccent ? 0.085 : 0.06);
      gain.gain.setValueAtTime(0.0001, startTime);
      gain.gain.exponentialRampToValueAtTime(peakVolume, startTime + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, startTime + durationSeconds);

      osc.connect(gain);
      gain.connect(this.masterGain);

      osc.start(startTime);
      osc.stop(startTime + durationSeconds + 0.05);

      // Delicate sparkling overtone for melody
      if (!isHarmony) {
        const overtoneOsc = this.ctx.createOscillator();
        const overtoneGain = this.ctx.createGain();
        overtoneOsc.type = 'sine';
        overtoneOsc.frequency.setValueAtTime(freq * 2, startTime);

        overtoneGain.gain.setValueAtTime(0.0001, startTime);
        overtoneGain.gain.exponentialRampToValueAtTime(peakVolume * 0.25, startTime + 0.015);
        overtoneGain.gain.exponentialRampToValueAtTime(0.0001, startTime + Math.min(durationSeconds, 0.8));

        overtoneOsc.connect(overtoneGain);
        overtoneGain.connect(this.masterGain);

        overtoneOsc.start(startTime);
        overtoneOsc.stop(startTime + Math.min(durationSeconds, 0.8) + 0.05);
      }
    } catch (err) {
      console.warn("Audio chime scheduling error", err);
    }
  }

  private startSynthesizer(trackId: string) {
    this.initContext();
    if (!this.ctx || !this.masterGain) return;

    this.isPlaying = true;
    this.notify();

    // 1. "Happy Birthday to You" dedicated melody engine
    if (trackId === 'happy-birthday') {
      const runBirthdaySequence = () => {
        if (!this.isPlaying || !this.ctx) return;

        // Schedule melody notes
        HAPPY_BIRTHDAY_NOTES.forEach(n => {
          this.playTone(n.f, n.time, n.dur, n.accent, false);
        });

        // Schedule gentle harmony chords
        HAPPY_BIRTHDAY_CHORDS.forEach(c => {
          c.f.forEach((freq, idx) => {
            this.playTone(freq, c.time + idx * 0.04, c.dur, false, true);
          });
        });

        // Loop after full song finishes + 2s breathing pause
        this.timer = window.setTimeout(runBirthdaySequence, 20500);
      };

      runBirthdaySequence();
      return;
    }

    // 2. Uplifting Birthday Celebration Fanfare
    if (trackId === 'celebration') {
      const runCelebrationSequence = () => {
        if (!this.isPlaying || !this.ctx) return;

        CELEBRATION_NOTES.forEach(n => {
          this.playTone(n.f, n.time, n.dur, n.accent, false);
        });

        // Chords beneath
        [
          { f: [130.81, 196.00, 329.63], time: 0.0, dur: 3.5 },
          { f: [174.61, 220.00, 261.63], time: 3.8, dur: 4.0 },
        ].forEach(c => {
          c.f.forEach((freq, idx) => {
            this.playTone(freq, c.time + idx * 0.04, c.dur, false, true);
          });
        });

        this.timer = window.setTimeout(runCelebrationSequence, 9000);
      };

      runCelebrationSequence();
      return;
    }

    // 3. Ambient Chords Progression (Warm Piano, Music Box, Acoustic, Lofi)
    const chordProgressions: Record<string, number[][]> = {
      'warm-piano': [
        [261.63, 329.63, 392.00, 493.88], // Cmaj7
        [220.00, 261.63, 329.63, 392.00], // Am7
        [174.61, 220.00, 261.63, 329.63], // Fmaj7
        [196.00, 246.94, 293.66, 392.00], // G7
      ],
      'music-box': [
        [523.25, 659.25, 783.99, 1046.50], // High C
        [440.00, 523.25, 659.25, 880.00],  // High A
        [349.23, 440.00, 523.25, 698.46],  // High F
        [392.00, 493.88, 587.33, 783.99],  // High G
      ],
      'acoustic': [
        [130.81, 196.00, 261.63, 329.63], // Low C
        [110.00, 164.81, 220.00, 261.63], // Low A
        [87.31, 130.81, 174.61, 220.00],  // Low F
        [98.00, 146.83, 196.00, 246.94],  // Low G
      ],
      'lofi-rain': [
        [246.94, 293.66, 369.99, 440.00], // Bm7
        [220.00, 277.18, 329.63, 392.00], // A7
        [185.00, 220.00, 277.18, 329.63], // F#m7
        [196.00, 246.94, 293.66, 369.99], // Gmaj7
      ]
    };

    const chords = chordProgressions[trackId] || chordProgressions['warm-piano'];
    let step = 0;

    const scheduleLoop = () => {
      if (!this.isPlaying || !this.ctx) return;
      const currentChord = chords[step % chords.length];

      currentChord.forEach((note, index) => {
        const jitter = Math.random() * 0.02;
        const delay = index * 0.4 + jitter;
        this.playTone(note, delay, trackId === 'music-box' ? 2.2 : 3.5, index >= 2, false);
      });

      if (Math.random() > 0.4) {
        const melodyNote = currentChord[Math.floor(Math.random() * currentChord.length)] * 2;
        this.playTone(melodyNote, 1.8, 2.5, true, false);
      }

      step++;
      this.timer = window.setTimeout(scheduleLoop, 2800);
    };

    scheduleLoop();
  }

  public stop() {
    this.isPlaying = false;
    if (this.timer) {
      clearTimeout(this.timer);
      this.timer = null;
    }
    if (this.externalAudio) {
      this.externalAudio.pause();
      this.externalAudio = null;
    }
    this.notify();
  }

  public toggle(trackId: string = 'happy-birthday', customUrl?: string) {
    if (this.isPlaying) {
      this.stop();
    } else {
      this.play(trackId, customUrl);
    }
  }

  public getIsPlaying(): boolean {
    return this.isPlaying;
  }

  public getCurrentTrack(): string {
    return this.currentTrack;
  }
}

export const audioController = new AudioController();
