// Synthesized combat sounds. There are no audio files: every tone is an
// oscillator. Playback stays silent until a user gesture unlocks the audio
// context, and silent whenever the Sound Effects option is off.

const soundEffects = {
    storageKey: 'permitQuest-soundEffects',
    enabled: true,
    context: null,

    init() {
        const saved = localStorage.getItem(this.storageKey);
        if (saved !== null) this.enabled = saved === 'on';

        const box = document.getElementById('sound-effects');
        if (!box) return;

        box.checked = this.enabled;
        box.addEventListener('change', () => {
            this.enabled = box.checked;
            localStorage.setItem(this.storageKey, this.enabled ? 'on' : 'off');
            // Turning it on is itself a gesture, so the player hears that it works
            if (this.enabled) this.play('hit');
        });
    },

    play(kind) {
        if (!this.enabled) return;
        const ctx = this.audioContext();
        if (!ctx) return;

        const start = () => this.schedule(kind, ctx);
        if (ctx.state === 'suspended') {
            ctx.resume().then(start).catch(() => {});
        } else {
            start();
        }
    },

    audioContext() {
        if (this.context) return this.context;
        const AudioCtx = window.AudioContext || window.webkitAudioContext;
        if (!AudioCtx) return null;
        this.context = new AudioCtx();
        return this.context;
    },

    schedule(kind, ctx) {
        const patterns = {
            hit: [
                { freq: 523, type: 'square', at: 0, dur: 0.07, gain: 0.12 },
                { freq: 784, type: 'square', at: 0.08, dur: 0.1, gain: 0.12 }
            ],
            miss: [
                { freq: 196, type: 'triangle', at: 0, dur: 0.18, gain: 0.14, slideTo: 90 }
            ],
            defeat: [
                { freq: 523, type: 'sine', at: 0, dur: 0.12, gain: 0.16 },
                { freq: 659, type: 'sine', at: 0.13, dur: 0.12, gain: 0.16 },
                { freq: 784, type: 'sine', at: 0.26, dur: 0.22, gain: 0.16 }
            ],
            artifact: [
                { freq: 880, type: 'sine', at: 0, dur: 0.35, gain: 0.12 },
                { freq: 1320, type: 'sine', at: 0.06, dur: 0.4, gain: 0.08 },
                { freq: 1760, type: 'sine', at: 0.12, dur: 0.45, gain: 0.05 }
            ]
        };

        (patterns[kind] || []).forEach(note => this.tone(ctx, note));
    },

    tone(ctx, note) {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        const start = ctx.currentTime + note.at;

        osc.type = note.type;
        osc.frequency.setValueAtTime(note.freq, start);
        if (note.slideTo) {
            osc.frequency.exponentialRampToValueAtTime(note.slideTo, start + note.dur);
        }

        // Gain ramps must stay above zero, so the envelope ends just above silence
        gain.gain.setValueAtTime(0.0001, start);
        gain.gain.exponentialRampToValueAtTime(note.gain, start + 0.01);
        gain.gain.exponentialRampToValueAtTime(0.0001, start + note.dur);

        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(start);
        osc.stop(start + note.dur + 0.02);
    }
};
