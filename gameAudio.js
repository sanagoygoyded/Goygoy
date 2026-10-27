/**
 * Gods of Egypt MMORPG - Web Audio API Procedural Sound Engine
 * Harici ses dosyasına ihtiyaç duymadan, %100 saf Web Audio sentezleyicisi
 */

(function(window) {
    'use strict';

    class SoundEngine {
        constructor() {
            this.ctx = null;
            this.muted = false;
            this.ambientPlaying = false;
            this.recordDestination = null;
            this.initOnFirstInteraction();
        }

        initOnFirstInteraction() {
            const unlock = () => {
                if (!this.ctx) {
                    const AudioContext = window.AudioContext || window.webkitAudioContext;
                    if (AudioContext) {
                        this.ctx = new AudioContext();
                        if (this.ctx.state === 'suspended') {
                            this.ctx.resume();
                        }
                    }
                }
                window.removeEventListener('pointerdown', unlock);
                window.removeEventListener('keydown', unlock);
            };
            window.addEventListener('pointerdown', unlock);
            window.addEventListener('keydown', unlock);
        }

        getContext() {
            if (!this.ctx) {
                const AudioContext = window.AudioContext || window.webkitAudioContext;
                if (AudioContext) {
                    this.ctx = new AudioContext();
                }
            }
            if (this.ctx && this.ctx.state === 'suspended') {
                this.ctx.resume();
            }
            return this.ctx;
        }

        routeOutput(ctx, node) {
            node.connect(ctx.destination);
            if (this.recordDestination) node.connect(this.recordDestination);
        }

        toggleMute() {
            this.muted = !this.muted;
            return this.muted;
        }

        playSfx(type) {
            if (this.muted) return;
            const ctx = this.getContext();
            if (!ctx) return;

            const t = ctx.currentTime;

            switch(type) {
                case 'harvest': {
                    // Organik başak/papirüs hışırtısı ve tohum pıtırtısı
                    const osc = ctx.createOscillator();
                    const gain = ctx.createGain();
                    osc.type = 'triangle';
                    osc.frequency.setValueAtTime(320, t);
                    osc.frequency.exponentialRampToValueAtTime(740, t + 0.12);
                    gain.gain.setValueAtTime(0.25, t);
                    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.16);
                    osc.connect(gain);
                    this.routeOutput(ctx, gain);
                    osc.start(t);
                    osc.stop(t + 0.16);
                    break;
                }

                case 'mine': {
                    // Kazma vuruşu: Taş kırılma klik ve metal tınlaması
                    const osc = ctx.createOscillator();
                    const gain = ctx.createGain();
                    osc.type = 'sawtooth';
                    osc.frequency.setValueAtTime(480, t);
                    osc.frequency.exponentialRampToValueAtTime(140, t + 0.15);
                    gain.gain.setValueAtTime(0.35, t);
                    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.18);
                    osc.connect(gain);
                    this.routeOutput(ctx, gain);
                    osc.start(t);
                    osc.stop(t + 0.18);

                    // Metalik çınlama
                    const bell = ctx.createOscillator();
                    const bGain = ctx.createGain();
                    bell.type = 'sine';
                    bell.frequency.setValueAtTime(1850, t);
                    bGain.gain.setValueAtTime(0.18, t);
                    bGain.gain.exponentialRampToValueAtTime(0.001, t + 0.35);
                    bell.connect(bGain);
                    this.routeOutput(ctx, bGain);
                    bell.start(t);
                    bell.stop(t + 0.35);
                    break;
                }

                case 'golden_blood': {
                    // Altın Kan damlası: Büyülü, kristalize altın arp akoru
                    const freqs = [659.25, 830.61, 987.77, 1318.51, 1661.22];
                    freqs.forEach((freq, idx) => {
                        const osc = ctx.createOscillator();
                        const gain = ctx.createGain();
                        osc.type = 'sine';
                        osc.frequency.setValueAtTime(freq, t + idx * 0.05);
                        gain.gain.setValueAtTime(0.18, t + idx * 0.05);
                        gain.gain.exponentialRampToValueAtTime(0.0001, t + idx * 0.05 + 0.65);
                        osc.connect(gain);
                        this.routeOutput(ctx, gain);
                        osc.start(t + idx * 0.05);
                        osc.stop(t + idx * 0.05 + 0.65);
                    });
                    break;
                }

                case 'combat_slash': {
                    // Kılıç savurma ve metal darbesi
                    const osc = ctx.createOscillator();
                    const gain = ctx.createGain();
                    osc.type = 'sawtooth';
                    osc.frequency.setValueAtTime(800, t);
                    osc.frequency.exponentialRampToValueAtTime(80, t + 0.14);
                    gain.gain.setValueAtTime(0.4, t);
                    gain.gain.exponentialRampToValueAtTime(0.01, t + 0.14);
                    osc.connect(gain);
                    this.routeOutput(ctx, gain);
                    osc.start(t);
                    osc.stop(t + 0.15);
                    break;
                }

                case 'god_ascend': {
                    // İlahi Tanrıya Yükseliş: Muazzam Mısır Pirinç Borusu ve Alt Bas Patlaması
                    const bass = ctx.createOscillator();
                    const bGain = ctx.createGain();
                    bass.type = 'sawtooth';
                    bass.frequency.setValueAtTime(65.4, t);
                    bass.frequency.exponentialRampToValueAtTime(130.8, t + 0.8);
                    bGain.gain.setValueAtTime(0.5, t);
                    bGain.gain.exponentialRampToValueAtTime(0.001, t + 1.2);
                    bass.connect(bGain);
                    this.routeOutput(ctx, bGain);
                    bass.start(t);
                    bass.stop(t + 1.2);

                    const chords = [261.63, 329.63, 392.00, 523.25, 659.25];
                    chords.forEach(f => {
                        const osc = ctx.createOscillator();
                        const g = ctx.createGain();
                        osc.type = 'triangle';
                        osc.frequency.setValueAtTime(f, t + 0.15);
                        g.gain.setValueAtTime(0.14, t + 0.15);
                        g.gain.exponentialRampToValueAtTime(0.001, t + 1.5);
                        osc.connect(g);
                        this.routeOutput(ctx, g);
                        osc.start(t + 0.15);
                        osc.stop(t + 1.5);
                    });
                    break;
                }

                case 'trap_damage': {
                    // Ağır giyotin / balta darbesi ve kemik çıtırtısı
                    const osc = ctx.createOscillator();
                    const gain = ctx.createGain();
                    osc.type = 'square';
                    osc.frequency.setValueAtTime(140, t);
                    osc.frequency.exponentialRampToValueAtTime(40, t + 0.22);
                    gain.gain.setValueAtTime(0.5, t);
                    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.25);
                    osc.connect(gain);
                    this.routeOutput(ctx, gain);
                    osc.start(t);
                    osc.stop(t + 0.25);
                    break;
                }

                case 'solar_beam': {
                    // Ra'nın Güneş Işını: Yüksek enerjili lazer şarjı ve infilak
                    const osc = ctx.createOscillator();
                    const gain = ctx.createGain();
                    osc.type = 'sawtooth';
                    osc.frequency.setValueAtTime(120, t);
                    osc.frequency.exponentialRampToValueAtTime(1600, t + 0.25);
                    osc.frequency.exponentialRampToValueAtTime(320, t + 0.55);
                    gain.gain.setValueAtTime(0.35, t);
                    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.6);
                    osc.connect(gain);
                    this.routeOutput(ctx, gain);
                    osc.start(t);
                    osc.stop(t + 0.6);
                    break;
                }

                case 'anubis': {
                    // Duat & Ahiret Çanı: Derin yeraltı gongu ve hayalet fısıltısı
                    const osc = ctx.createOscillator();
                    const gain = ctx.createGain();
                    osc.type = 'sine';
                    osc.frequency.setValueAtTime(92, t);
                    osc.frequency.exponentialRampToValueAtTime(64, t + 1.8);
                    gain.gain.setValueAtTime(0.45, t);
                    gain.gain.exponentialRampToValueAtTime(0.0001, t + 2.0);
                    osc.connect(gain);
                    this.routeOutput(ctx, gain);
                    osc.start(t);
                    osc.stop(t + 2.0);
                    break;
                }

                case 'level_up': {
                    // Zafer Fanfarı
                    const notes = [440, 554.37, 659.25, 880];
                    notes.forEach((f, i) => {
                        const o = ctx.createOscillator();
                        const g = ctx.createGain();
                        o.type = 'triangle';
                        o.frequency.setValueAtTime(f, t + i * 0.1);
                        g.gain.setValueAtTime(0.2, t + i * 0.1);
                        g.gain.exponentialRampToValueAtTime(0.001, t + i * 0.1 + 0.4);
                        o.connect(g);
                        this.routeOutput(ctx, g);
                        o.start(t + i * 0.1);
                        o.stop(t + i * 0.1 + 0.4);
                    });
                    break;
                }
            }
        }
    }

    window.GameAudio = new SoundEngine();
})(window);
