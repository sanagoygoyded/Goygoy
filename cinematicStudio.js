/**
 * Gods of Egypt MMORPG - Ultra Hollywood Cinema & TikTok Video Studio Engine
 * Dev Güncelleme: Procedural Hollywood Web Audio (Braams, Whooshes, Clashes, Drones),
 * 5 Profesyonel Sinematik Kurgu (30-45s), Anamorfik Mercek Parlaması, Kesme Flaşları,
 * Altın Tapınak Tozları, Dinamik Hız Değişimi (Slow-Motion Ramping),
 * %100 Tıklanabilir Engellenemez [✕ DURDUR] Butonu ve MP4 Video Kaydı.
 */

(function(window) {
    'use strict';

    // =========================================================================
    // 1. THREE.JS WEBGL RENDERER PRESERVE-DRAWING-BUFFER MÜDAHALESİ
    // Canvas video kaydının siyah kare kaydetmesini %100 engeller
    // =========================================================================
    if (window.THREE && window.THREE.WebGLRenderer) {
        try {
            const OriginalWebGLRenderer = window.THREE.WebGLRenderer;
            window.THREE.WebGLRenderer = function(parameters) {
                parameters = parameters || {};
                parameters.preserveDrawingBuffer = true;
                return new OriginalWebGLRenderer(parameters);
            };
            window.THREE.WebGLRenderer.prototype = OriginalWebGLRenderer.prototype;
        } catch(e) {
            console.warn('WebGLRenderer hook skipped:', e);
        }
    }

    // =========================================================================
    // 2. HOLLYWOOD WEB AUDIO PROCEDURAL SYNTHESIZER
    // Hans Zimmer / Inception tarzı düşük pirinç Braam sesleri, sub-bass darbeleri,
    // kamera geçiş rüzgarları ve kılıç çarpışma efektleri (Harici dosya gerektirmez!)
    // =========================================================================
    class HollywoodSoundEngine {
        constructor() {
            this.ctx = null;
            this.enabled = true;
            this.droneOsc1 = null;
            this.droneOsc2 = null;
            this.droneGain = null;
        }

        init() {
            if (!this.ctx) {
                const AudioCtx = window.AudioContext || window.webkitAudioContext;
                if (AudioCtx) this.ctx = new AudioCtx();
            }
            if (this.ctx && this.ctx.state === 'suspended') {
                this.ctx.resume().catch(() => {});
            }
        }

        routeOutput(node) {
            node.connect(this.ctx.destination);
            if (this.recordDestination) node.connect(this.recordDestination);
        }

        // Inception / Dune Tarzı Low-Brass BRAAM Sesi (Tüyleri Diken Diken Eden Sinema Trombonu)
        playBraam() {
            if (!this.enabled) return;
            this.init();
            if (!this.ctx) return;
            const now = this.ctx.currentTime;

            // 1. Detuned Sawtooth Çifti (55 Hz Low A)
            const osc1 = this.ctx.createOscillator();
            const osc2 = this.ctx.createOscillator();
            osc1.type = 'sawtooth';
            osc2.type = 'sawtooth';
            osc1.frequency.setValueAtTime(55.0, now);
            osc2.frequency.setValueAtTime(55.5, now);

            // 2. Sub-Bass Sinüs (27.5 Hz) - Koltuk Titreten Alt Frekans
            const sub = this.ctx.createOscillator();
            sub.type = 'sine';
            sub.frequency.setValueAtTime(27.5, now);

            // 3. Rezonanslı Low-pass Filtre Süpürmesi
            const filter = this.ctx.createBiquadFilter();
            filter.type = 'lowpass';
            filter.Q.setValueAtTime(7.5, now);
            filter.frequency.setValueAtTime(3200, now);
            filter.frequency.exponentialRampToValueAtTime(140, now + 2.4);

            // 4. Sinematik Doygunluk (Saturation Shaper)
            const shaper = this.ctx.createWaveShaper();
            const curve = new Float32Array(256);
            for (let i = 0; i < 256; i++) {
                const x = (i * 2) / 256 - 1;
                curve[i] = Math.tanh(x * 2.2);
            }
            shaper.curve = curve;

            // 5. Kazanç Zarfı (Explosive Attack + Long Decaying Tail)
            const gain = this.ctx.createGain();
            gain.gain.setValueAtTime(0.001, now);
            gain.gain.linearRampToValueAtTime(0.85, now + 0.06);
            gain.gain.exponentialRampToValueAtTime(0.001, now + 3.2);

            osc1.connect(filter);
            osc2.connect(filter);
            filter.connect(shaper);
            shaper.connect(gain);

            const subGain = this.ctx.createGain();
            subGain.gain.setValueAtTime(0.7, now);
            subGain.gain.exponentialRampToValueAtTime(0.001, now + 2.2);
            sub.connect(subGain);
            subGain.connect(gain);

            this.routeOutput(gain);

            osc1.start(now);
            osc2.start(now);
            sub.start(now);
            osc1.stop(now + 3.3);
            osc2.stop(now + 3.3);
            sub.stop(now + 3.3);
        }

        // Hızlı Kamera Geçişi / Rüzgar Uçuşu (Whoosh)
        playWhoosh() {
            if (!this.enabled) return;
            this.init();
            if (!this.ctx) return;
            const now = this.ctx.currentTime;
            const dur = 0.9;

            const bufferSize = Math.floor(this.ctx.sampleRate * dur);
            const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
            const data = buffer.getChannelData(0);
            for (let i = 0; i < bufferSize; i++) {
                data[i] = (Math.random() * 2 - 1) * 0.8;
            }

            const noise = this.ctx.createBufferSource();
            noise.buffer = buffer;

            const bpf = this.ctx.createBiquadFilter();
            bpf.type = 'bandpass';
            bpf.Q.setValueAtTime(3.0, now);
            bpf.frequency.setValueAtTime(240, now);
            bpf.frequency.exponentialRampToValueAtTime(3600, now + 0.42);
            bpf.frequency.exponentialRampToValueAtTime(200, now + dur);

            const gain = this.ctx.createGain();
            gain.gain.setValueAtTime(0.001, now);
            gain.gain.linearRampToValueAtTime(0.65, now + 0.42);
            gain.gain.exponentialRampToValueAtTime(0.001, now + dur);

            noise.connect(bpf);
            bpf.connect(gain);
            this.routeOutput(gain);

            noise.start(now);
            noise.stop(now + dur);
        }

        // Aksiyon Sahnesi Kılıç Çarpışması / İlahi Kıvılcım (Clash Stinger)
        playClash() {
            if (!this.enabled) return;
            this.init();
            if (!this.ctx) return;
            const now = this.ctx.currentTime;

            const osc = this.ctx.createOscillator();
            osc.type = 'sawtooth';
            osc.frequency.setValueAtTime(1600, now);
            osc.frequency.exponentialRampToValueAtTime(280, now + 0.35);

            const metalOsc = this.ctx.createOscillator();
            metalOsc.type = 'sine';
            metalOsc.frequency.setValueAtTime(3200, now);
            metalOsc.frequency.exponentialRampToValueAtTime(500, now + 0.5);

            const gain = this.ctx.createGain();
            gain.gain.setValueAtTime(0.75, now);
            gain.gain.exponentialRampToValueAtTime(0.001, now + 0.7);

            osc.connect(gain);
            metalOsc.connect(gain);
            this.routeOutput(gain);

            osc.start(now);
            metalOsc.start(now);
            osc.stop(now + 0.7);
            metalOsc.stop(now + 0.7);
        }

        // Sub-Bass Sahne Geçiş Darbesi (Impact Drop)
        playImpact() {
            if (!this.enabled) return;
            this.init();
            if (!this.ctx) return;
            const now = this.ctx.currentTime;

            const osc = this.ctx.createOscillator();
            osc.type = 'sine';
            osc.frequency.setValueAtTime(150, now);
            osc.frequency.exponentialRampToValueAtTime(32, now + 0.85);

            const gain = this.ctx.createGain();
            gain.gain.setValueAtTime(0.9, now);
            gain.gain.exponentialRampToValueAtTime(0.001, now + 1.1);

            osc.connect(gain);
            this.routeOutput(gain);

            osc.start(now);
            osc.stop(now + 1.15);
        }

        // Sinematik Gerilim & Çöl Gecesi Uğultusu (Ambient Cinema Drone)
        startDrone() {
            if (!this.enabled) return;
            this.init();
            if (!this.ctx || this.droneOsc1) return;
            const now = this.ctx.currentTime;

            this.droneOsc1 = this.ctx.createOscillator();
            this.droneOsc2 = this.ctx.createOscillator();
            this.droneOsc1.type = 'triangle';
            this.droneOsc2.type = 'sawtooth';
            this.droneOsc1.frequency.setValueAtTime(65.4, now); // C2
            this.droneOsc2.frequency.setValueAtTime(98.0, now); // G2

            const filter = this.ctx.createBiquadFilter();
            filter.type = 'lowpass';
            filter.frequency.setValueAtTime(260, now);

            this.droneGain = this.ctx.createGain();
            this.droneGain.gain.setValueAtTime(0.001, now);
            this.droneGain.gain.linearRampToValueAtTime(0.24, now + 1.8);

            this.droneOsc1.connect(filter);
            this.droneOsc2.connect(filter);
            filter.connect(this.droneGain);
            this.routeOutput(this.droneGain);

            this.droneOsc1.start(now);
            this.droneOsc2.start(now);
        }

        stopDrone() {
            if (this.droneGain && this.ctx) {
                const now = this.ctx.currentTime;
                this.droneGain.gain.linearRampToValueAtTime(0.001, now + 0.6);
                setTimeout(() => {
                    if (this.droneOsc1) { try { this.droneOsc1.stop(); } catch(e){} this.droneOsc1 = null; }
                    if (this.droneOsc2) { try { this.droneOsc2.stop(); } catch(e){} this.droneOsc2 = null; }
                    this.droneGain = null;
                }, 700);
            }
        }
    }

    // =========================================================================
    // 3. EGYPT CINEMATIC STUDIO CORE ENGINE
    // =========================================================================
    class EgyptCinematicStudio {
        constructor() {
            this.active = false;
            this.isGameplayRecording = false;
            this.currentPreset = 'trailer_45s';
            this.sequenceTimer = 0;
            this.totalDuration = 45.0;
            this.timeScale = 1.0;
            this.currentShotIndex = -1;
            this.lastTitle = '';
            
            // Format & VFX Ayarları
            this.format = '9:16'; // '16:9' | '9:16' | '1:1' | '2.39:1'
            this.outputQuality = 1080;
            this.showTitles = true;
            this.showFlares = true;
            this.allowShake = true;
            this.hideHudDuringPlay = true;
            this.soundEnabled = true;

            // Ses Motoru
            this.audio = new HollywoodSoundEngine();

            // Kamera Sarsıntı Efekti
            this.shakeTrauma = 0;
            this.lastCinePos = null;
            this.lastCineLook = null;

            // Dahili Video Kayıt Sistemi (MediaRecorder)
            this.isRecording = false;
            this.mediaRecorder = null;
            this.recordedChunks = [];
            this.lastRecordedBlob = null;
            this.lastRecordedUrl = null;
            this.lastRecordedFileName = '';
            this.ffmpegPromise = null;
            this.isPreparingRecording = false;
            this.hiddenRecordingElements = new Map();

            // DOM Referansları
            this.dom = {};

            this.init();
        }

        init() {
            // DOM henüz hazır değilse bekle, hazırsa hemen oluştur
            if (document.readyState === 'complete' || document.readyState === 'interactive' || document.body) {
                this.createDOM();
            } else {
                document.addEventListener('DOMContentLoaded', () => this.createDOM());
                window.addEventListener('load', () => this.createDOM());
            }

            // Global Tuş Dinleyicisi: [K] Stüdyo Aç/Durdur, [ESC] Anında Sinematikten Çıkış
            window.addEventListener('keydown', (e) => {
                const isInput = document.activeElement && (
                    document.activeElement.tagName === 'INPUT' || 
                    document.activeElement.tagName === 'TEXTAREA'
                );
                if (isInput) return;

                if (e.key === 'Escape') {
                    if (this.active || this.isGameplayRecording) {
                        this.stopCinematic('Kullanıcı [ESC] ile durdurdu');
                    } else {
                        this.closeStudioModal();
                    }
                } else if (e.key.toLowerCase() === 'k' && !e.repeat) {
                    if (this.active || this.isGameplayRecording) {
                        this.stopCinematic('Kullanıcı [K] ile durdurdu');
                    } else {
                        this.openStudioModal();
                    }
                }
            });
        }

        // =====================================================================
        // DOM OLUŞTURMA: %100 HATASIZ, ENGELLENEMEZ, Z-INDEX 2147483647
        // =====================================================================
        createDOM() {
            if (!document.body || document.getElementById('cinematic-studio-overlay')) return;

            // 1. Ana Sinematik Overlay Katmanı
            const overlay = document.createElement('div');
            overlay.id = 'cinematic-studio-overlay';
            overlay.className = 'fixed inset-0 pointer-events-none z-[120] overflow-hidden select-none transition-all duration-300';
            overlay.innerHTML = `
                <!-- 2.39:1 Sinemaskop Siyah Bantlar -->
                <div id="cine-letterbox-top" class="absolute top-0 left-0 right-0 bg-black transition-all duration-700 h-0 border-b border-amber-500/30 z-20"></div>
                <div id="cine-letterbox-bottom" class="absolute bottom-0 left-0 right-0 bg-black transition-all duration-700 h-0 border-t border-amber-500/30 z-20"></div>

                <!-- 9:16 Dikey TikTok & Reels Maskesi -->
                <div id="cine-tiktok-mask" class="absolute inset-0 flex items-center justify-between pointer-events-none hidden z-20">
                    <div class="h-full bg-black/90 backdrop-blur-[4px] border-r-2 border-amber-400/60 shadow-2xl transition-all duration-500" style="width:max(0px,calc((100vw - min(100vw,56.25vh))/2));"></div>
                    <div class="relative flex flex-col justify-between items-center py-6 pointer-events-none border-x border-amber-400/60" style="width:min(100vw,56.25vh);height:min(100vh,177.7778vw);">
                        <div class="bg-black/80 px-4 py-1.5 rounded-full border border-amber-400/70 text-[11px] font-black text-amber-200 tracking-widest shadow-2xl animate-pulse">
                            📱 TIKTOK & REELS VİRAL (9:16)
                        </div>
                        <div class="w-full flex justify-between px-4 text-[9px] text-amber-300/60 font-mono">
                            <span>▲ GÜVENLİ ALAN</span>
                            <span>▲ TİKTOK ALANI</span>
                        </div>
                    </div>
                    <div class="h-full bg-black/90 backdrop-blur-[4px] border-l-2 border-amber-400/60 shadow-2xl transition-all duration-500" style="width:max(0px,calc((100vw - min(100vw,56.25vh))/2));"></div>
                    <div class="absolute inset-x-0 top-0 bg-black/90 border-b border-amber-400/30" style="height:max(0px,calc((100vh - min(100vh,177.7778vw))/2));"></div>
                    <div class="absolute inset-x-0 bottom-0 bg-black/90 border-t border-amber-400/30" style="height:max(0px,calc((100vh - min(100vh,177.7778vw))/2));"></div>
                </div>

                <!-- Hollywood Beyaz / Altın Perde Kesme Flaşı (Cut Flash) -->
                <div id="cine-cut-flash" class="absolute inset-0 pointer-events-none opacity-0 transition-opacity duration-150 bg-radial from-amber-100 via-amber-300/40 to-transparent mix-blend-screen z-30"></div>

                <!-- Anamorfik Altın / Mavi Mercek Çizgisi (Anamorphic Lens Flare Beam) -->
                <div id="cine-lens-flare" class="absolute inset-0 pointer-events-none opacity-0 transition-opacity duration-700 bg-gradient-to-r from-transparent via-amber-300/25 to-transparent mix-blend-screen z-20"></div>

                <!-- Altın Tapınak Tozları ve Köz Parçacıkları Tuvali -->
                <canvas id="cine-dust-canvas" class="absolute inset-0 pointer-events-none opacity-60 z-10"></canvas>

                <!-- Canlı Kayıt / Oynatma Durum Göstergesi (REC Banner) -->
                <div id="cine-rec-banner" class="absolute top-5 left-1/2 -translate-x-1/2 pointer-events-auto hidden z-40">
                    <div class="bg-black/95 border-2 border-amber-400/80 shadow-[0_0_30px_rgba(245,158,11,0.5)] rounded-2xl px-6 py-2.5 flex items-center gap-4 text-xs font-bold text-amber-100 backdrop-blur-xl">
                        <div class="flex items-center gap-2.5">
                            <span id="cine-rec-dot" class="w-3.5 h-3.5 rounded-full bg-red-600 animate-ping"></span>
                            <span id="cine-rec-status" class="font-black text-red-400 tracking-wider text-sm">REC [00:00 / 00:45]</span>
                        </div>
                        <span id="cine-shot-name" class="text-amber-300 text-xs font-bold border-l border-amber-500/40 pl-3">Nil Vadisi Uçuşu</span>
                    </div>
                </div>

                <!-- Sinematik Başlık ve Altyazı Kartı (Hollywood Title Card) -->
                <div id="cine-title-card" class="absolute bottom-16 sm:bottom-20 left-1/2 -translate-x-1/2 text-center pointer-events-none opacity-0 transition-all duration-700 transform translate-y-4 z-30 max-w-[92vw]">
                    <div class="inline-flex flex-col items-center bg-gradient-to-t from-black/90 via-black/75 to-transparent px-10 py-5 rounded-3xl border-2 border-amber-400/60 backdrop-blur-md shadow-[0_0_40px_rgba(0,0,0,0.9)]">
                        <span id="cine-main-title" class="hud-font-title text-2xl sm:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-100 via-amber-300 to-yellow-500 tracking-widest drop-shadow-[0_4px_12px_rgba(245,158,11,0.7)]">
                            ✦ GODS OF EGYPT ✦
                        </span>
                        <span id="cine-sub-title" class="text-xs sm:text-base font-bold text-amber-200 tracking-wider mt-1.5 drop-shadow">
                            Devasa Açık Dünya Nil Nehri & Başkent
                        </span>
                        <div class="w-48 h-0.5 bg-gradient-to-r from-transparent via-amber-400 to-transparent mt-3"></div>
                    </div>
                </div>
            `;
            document.body.appendChild(overlay);

            // 2. KESİNLİKLE ENGELLENEMEZ, DOĞRUDAN BODY'YE BAĞLI YÜZEN [✕ DURDUR] BUTONU
            // Z-INDEX: 2147483647 (CSS'teki mutlak maksimum katman)
            const exitBtnContainer = document.createElement('div');
            exitBtnContainer.id = 'cine-unblockable-exit-container';
            exitBtnContainer.style.cssText = `
                position: fixed !important;
                top: 18px !important;
                right: 22px !important;
                z-index: 2147483647 !important;
                pointer-events: auto !important;
                display: none;
            `;
            exitBtnContainer.innerHTML = `
                <button id="cine-unblockable-exit-btn" style="
                    background: linear-gradient(135deg, #ef4444 0%, #b91c1c 50%, #7f1d1d 100%) !important;
                    border: 2px solid #fde047 !important;
                    color: #ffffff !important;
                    padding: 10px 22px !important;
                    border-radius: 9999px !important;
                    font-family: system-ui, -apple-system, sans-serif !important;
                    font-size: 13px !important;
                    font-weight: 900 !important;
                    letter-spacing: 0.8px !important;
                    box-shadow: 0 0 25px rgba(239, 68, 68, 0.9), 0 0 10px rgba(253, 224, 71, 0.7), 0 8px 20px rgba(0,0,0,0.85) !important;
                    cursor: pointer !important;
                    pointer-events: auto !important;
                    user-select: none !important;
                    display: flex !important;
                    align-items: center !important;
                    gap: 8px !important;
                    transition: transform 0.15s ease, box-shadow 0.15s ease !important;
                " onmouseover="this.style.transform='scale(1.05)'" onmouseout="this.style.transform='scale(1)'">
                    <span style="font-size: 18px; font-weight: 900; line-height: 1;">✕</span>
                    <span>SİNEMATİĞİ / KAYDI DURDUR [ESC]</span>
                </button>
            `;
            document.body.appendChild(exitBtnContainer);

            // Çarpı butonuna tıklama dinleyicilerini her olaya (click, pointerdown, touchend) bağla
            const exitBtn = exitBtnContainer.querySelector('#cine-unblockable-exit-btn');
            const handleStopClick = (e) => {
                if (e) {
                    e.preventDefault();
                    e.stopPropagation();
                }
                if (document.exitPointerLock) {
                    try { document.exitPointerLock(); } catch(err){}
                }
                this.stopCinematic('Kullanıcı durdurdu');
            };
            exitBtn.addEventListener('click', handleStopClick);
            exitBtn.addEventListener('pointerdown', handleStopClick);
            exitBtn.addEventListener('touchend', handleStopClick);

            // 3. Ultra Hollywood Sinematik Stüdyo Kontrol Modalı
            const modal = document.createElement('div');
            modal.id = 'cinematic-studio-modal';
            modal.style.cssText = `
                position: fixed !important;
                inset: 0 !important;
                z-index: 2147483640 !important;
                display: none;
                align-items: center !important;
                justify-content: center !important;
                background: rgba(0, 0, 0, 0.88) !important;
                backdrop-filter: blur(14px) !important;
                -webkit-backdrop-filter: blur(14px) !important;
                padding: 16px !important;
                pointer-events: auto !important;
            `;
            modal.innerHTML = `
                <div class="bg-gradient-to-b from-[#221408] via-[#160d05] to-[#0d0703] border-2 border-amber-400 rounded-3xl max-w-2xl w-full max-h-[92vh] overflow-y-auto shadow-[0_0_50px_rgba(245,158,11,0.4)] p-6 text-amber-100 flex flex-col gap-5 relative">
                    <!-- Üst Başlık & Kapat Çarpı Butonu -->
                    <div class="flex items-center justify-between border-b border-amber-500/40 pb-4">
                        <div class="flex items-center gap-3">
                            <span class="text-3xl animate-bounce">🎬</span>
                            <div>
                                <h2 class="hud-font-title text-xl sm:text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-200 via-amber-300 to-yellow-500">
                                    HOLLYWOOD & TİKTOK SİNEMATİK STÜDYOSU
                                </h2>
                                <p class="text-xs text-amber-400/90 font-medium">Hans Zimmer tarzı Braam sesleri, 30-45s fragmanlar ve tek tıkla video kaydı</p>
                            </div>
                        </div>
                        <button onclick="window.EgyptCinematicStudio.closeStudioModal()" class="w-10 h-10 rounded-full bg-red-600/30 hover:bg-red-500 hover:text-white border-2 border-red-400 flex items-center justify-center font-black text-lg transition-all shadow-lg active:scale-90" title="Kapat [ESC]">✕</button>
                    </div>

                    <!-- Bölüm 1: 5 Adet Hazır Hollywood & TikTok Senaryosu -->
                    <div class="flex flex-col gap-2.5">
                        <span class="text-xs font-black uppercase text-amber-300 tracking-wider flex items-center gap-1.5">
                            <span>🎥</span> 1. Sinematik Senaryoyu Seç (30 - 45 Saniye)
                        </span>
                        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <!-- Senaryo 1: Fragman Mastercut -->
                            <div onclick="window.EgyptCinematicStudio.selectPreset('trailer_45s', this)" class="cine-preset-card active p-3.5 rounded-2xl border-2 border-amber-400 bg-amber-500/20 cursor-pointer hover:border-yellow-300 transition-all flex flex-col justify-between gap-1 shadow-lg">
                                <div class="flex items-center justify-between">
                                    <span class="font-black text-sm text-yellow-200">🎬 45s Sinematik Fragman</span>
                                    <span class="text-[10px] px-2 py-0.5 rounded bg-amber-400 text-black font-extrabold">MASTER REEL</span>
                                </div>
                                <p class="text-[11px] text-amber-300/90 leading-snug">
                                    Göklerden piramitlere dalış, Nil buğdayında slow-mo kahraman yürüyüşü, 360° tanrı dönüşümü ve logo kapanışı!
                                </p>
                            </div>

                            <!-- Senaryo 2: Tanrı Hype -->
                            <div onclick="window.EgyptCinematicStudio.selectPreset('god_hype_30s', this)" class="cine-preset-card p-3.5 rounded-2xl border border-amber-500/40 bg-black/50 cursor-pointer hover:border-amber-400 transition-all flex flex-col justify-between gap-1">
                                <div class="flex items-center justify-between">
                                    <span class="font-black text-sm text-amber-100">⚡ 30s Tanrıların Gazabı</span>
                                    <span class="text-[10px] px-2 py-0.5 rounded bg-red-600/40 text-red-200 border border-red-400 font-extrabold">COMBAT HYPE</span>
                                </div>
                                <p class="text-[11px] text-amber-300/80 leading-snug">
                                    Hızlı kılıç kesmeleri, vuruş anı ekran sarsıntısı, braam patlaması ve 3.6m altın Horus & Set kanat açılışı!
                                </p>
                            </div>

                            <!-- Senaryo 3: Nil & Doğa -->
                            <div onclick="window.EgyptCinematicStudio.selectPreset('nile_nature_35s', this)" class="cine-preset-card p-3.5 rounded-2xl border border-amber-500/40 bg-black/50 cursor-pointer hover:border-amber-400 transition-all flex flex-col justify-between gap-1">
                                <div class="flex items-center justify-between">
                                    <span class="font-black text-sm text-amber-100">🌾 35s Nil & Doğa Harikaları</span>
                                    <span class="text-[10px] px-2 py-0.5 rounded bg-emerald-500/40 text-emerald-200 border border-emerald-400 font-extrabold">AESTHETIC</span>
                                </div>
                                <p class="text-[11px] text-amber-300/80 leading-snug">
                                    5.200 canlı altın buğdayın dalgalanışı, Nil'in zümrüt ışık kostikleri, su dolapları ve mavi nilüferler.
                                </p>
                            </div>

                            <!-- Senaryo 4: 1. Şahıs Macera -->
                            <div onclick="window.EgyptCinematicStudio.selectPreset('first_person_30s', this)" class="cine-preset-card p-3.5 rounded-2xl border border-amber-500/40 bg-black/50 cursor-pointer hover:border-amber-400 transition-all flex flex-col justify-between gap-1">
                                <div class="flex items-center justify-between">
                                    <span class="font-black text-sm text-amber-100">👁️ 30s 1. Şahıs POV Keşif</span>
                                    <span class="text-[10px] px-2 py-0.5 rounded bg-cyan-500/40 text-cyan-200 border border-cyan-400 font-extrabold">IMMERSIVE</span>
                                </div>
                                <p class="text-[11px] text-amber-300/80 leading-snug">
                                    Karakterin kendi gözünden tapınak sokakları, taş köprüler ve altın Ra heykeline doğru adım adım yürüyüş!
                                </p>
                            </div>

                            <!-- Senaryo 5: TikTok Viral 9:16 -->
                            <div onclick="window.EgyptCinematicStudio.selectPreset('drone_flyby_30s', this)" class="cine-preset-card p-3.5 rounded-2xl border border-amber-500/40 bg-black/50 cursor-pointer hover:border-amber-400 transition-all flex flex-col justify-between gap-1 sm:col-span-2">
                                <div class="flex items-center justify-between">
                                    <span class="font-black text-sm text-amber-100">🦅 30s TikTok & Drone Flyby</span>
                                    <span class="text-[10px] px-2 py-0.5 rounded bg-amber-400 text-black font-extrabold">TIKTOK VIRAL</span>
                                </div>
                                <p class="text-[11px] text-amber-300/80 leading-snug">
                                    TikTok ve Reels için dikey format, dinamik açı değişimleri ve yüksek hızlı şahin drone kamerasıyla tapınak uçuşu!
                                </p>
                            </div>
                        </div>
                    </div>

                    <!-- Bölüm 2: Sosyal Medya Formatı & Hollywood Ses Tasarımı -->
                    <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 border-t border-amber-500/30 pt-4">
                        <!-- Format Seçimi -->
                        <div class="flex flex-col gap-2">
                            <span class="text-xs font-black uppercase text-amber-300 tracking-wider">📱 Video / Sinema Formatı</span>
                            <div class="grid grid-cols-2 sm:grid-cols-4 gap-2">
                                <button onclick="window.EgyptCinematicStudio.setFormat('9:16', this)" id="btn-format-tiktok" class="flex-1 py-2 rounded-xl text-xs font-extrabold border-2 border-amber-400 bg-amber-500/25 text-yellow-200 hover:border-amber-300 transition-all">
                                    📱 9:16 TikTok
                                </button>
                                <button onclick="window.EgyptCinematicStudio.setFormat('16:9', this)" id="btn-format-yt" class="flex-1 py-2 rounded-xl text-xs font-extrabold border border-amber-500/40 bg-black/50 hover:border-amber-300 transition-all">
                                    🖥️ 16:9 YouTube
                                </button>
                                <button onclick="window.EgyptCinematicStudio.setFormat('1:1', this)" id="btn-format-square" class="flex-1 py-2 rounded-xl text-xs font-extrabold border border-amber-500/40 bg-black/50 hover:border-amber-300 transition-all">
                                    ◼️ 1:1 Kare
                                </button>
                                <button onclick="window.EgyptCinematicStudio.setFormat('2.39:1', this)" id="btn-format-cine" class="flex-1 py-2 rounded-xl text-xs font-extrabold border border-amber-500/40 bg-black/50 hover:border-amber-300 transition-all">
                                    🎬 2.39:1 Sinema
                                </button>
                            </div>
                        </div>

                        <!-- Ses & VFX Ayarları -->
                        <div class="flex flex-col gap-2">
                            <span class="text-xs font-black uppercase text-amber-300 tracking-wider">🔊 Hollywood Ses & VFX</span>
                            <div class="flex items-center gap-2">
                                <button onclick="window.EgyptCinematicStudio.toggleSound(this)" id="btn-sound-toggle" class="flex-1 py-2 rounded-xl text-xs font-extrabold border-2 border-amber-400 bg-amber-500/25 text-yellow-200 transition-all">
                                    🔊 Braam & SFX: AÇIK
                                </button>
                                <button onclick="window.EgyptCinematicStudio.setTimeScale(1.0, this)" id="btn-speed-normal" class="flex-1 py-2 rounded-xl text-xs font-extrabold border-2 border-amber-400 bg-amber-500/25 text-yellow-200 transition-all">
                                    ⚡ Hız: 1.0x Normal
                                </button>
                            </div>
                        </div>
                    </div>

                    <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 border-t border-amber-500/20 pt-3">
                        <label class="flex flex-col gap-1 text-xs font-bold text-amber-200">
                            <span>🎞️ Çıktı kalitesi</span>
                            <select onchange="window.EgyptCinematicStudio.setOutputQuality(this.value)" class="rounded-xl border border-amber-500/40 bg-black/60 px-3 py-2 text-amber-100">
                                <option value="1080" selected>1080p HD · Önerilen</option>
                                <option value="720">720p · Daha hafif kayıt</option>
                            </select>
                        </label>
                        <label class="flex flex-col gap-1 text-xs font-bold text-amber-200">
                            <span>✍️ Paylaşım açıklaması</span>
                            <input id="cine-custom-caption" type="text" maxlength="180" placeholder="Klip için kısa bir kanca yaz..." class="rounded-xl border border-amber-500/40 bg-black/60 px-3 py-2 text-amber-100 placeholder:text-amber-200/40">
                        </label>
                        <label class="flex flex-col gap-1 text-xs font-bold text-amber-200 sm:col-span-2">
                            <span>🏷️ İsteğe bağlı video imzası</span>
                            <input id="cine-creator-tag" type="text" maxlength="32" placeholder="@kullaniciadi" class="rounded-xl border border-amber-500/40 bg-black/60 px-3 py-2 text-amber-100 placeholder:text-amber-200/40">
                        </label>
                    </div>

                    <!-- Bölüm 3: Gelişmiş VFX Seçenekleri -->
                    <div class="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-bold text-amber-200/90 border-t border-amber-500/20 pt-3">
                        <label class="flex items-center gap-1.5 cursor-pointer">
                            <input type="checkbox" id="chk-cine-titles" checked onchange="window.EgyptCinematicStudio.showTitles = this.checked" class="rounded accent-amber-400">
                            <span>Altın Başlıklar</span>
                        </label>
                        <label class="flex items-center gap-1.5 cursor-pointer">
                            <input type="checkbox" id="chk-cine-flares" checked onchange="window.EgyptCinematicStudio.showFlares = this.checked" class="rounded accent-amber-400">
                            <span>Anamorfik Mercek</span>
                        </label>
                        <label class="flex items-center gap-1.5 cursor-pointer">
                            <input type="checkbox" id="chk-cine-shake" checked onchange="window.EgyptCinematicStudio.allowShake = this.checked" class="rounded accent-amber-400">
                            <span>Vuruş Sarsıntısı</span>
                        </label>
                        <label class="flex items-center gap-1.5 cursor-pointer">
                            <input type="checkbox" id="chk-cine-hidehud" checked onchange="window.EgyptCinematicStudio.hideHudDuringPlay = this.checked" class="rounded accent-amber-400">
                            <span>HUD'u Gizle</span>
                        </label>
                    </div>

                    <!-- Bölüm 4: Büyük Aksiyon Butonları -->
                    <div class="flex flex-col sm:flex-row items-center gap-3 border-t border-amber-500/40 pt-4">
                        <!-- Kayıt Yaparak Başlat Butonu -->
                        <button onclick="window.EgyptCinematicStudio.startCinematic(true)" class="flex-1 w-full py-4 rounded-2xl bg-gradient-to-r from-red-600 via-rose-600 to-amber-600 hover:from-red-500 hover:to-amber-500 text-white font-black text-sm tracking-wider shadow-[0_0_30px_rgba(239,68,68,0.7)] transition-all active:scale-95 flex items-center justify-center gap-2 border border-white/50 animate-pulse">
                            <span class="w-3.5 h-3.5 rounded-full bg-white animate-ping"></span>
                            <span>🔴 KAYDI BAŞLAT VE SİNEMATİĞİ OYNAT</span>
                        </button>

                        <!-- Sadece İzle Butonu -->
                        <button onclick="window.EgyptCinematicStudio.startCinematic(false)" class="w-full sm:w-auto px-6 py-4 rounded-2xl bg-amber-500/25 hover:bg-amber-400 hover:text-black border-2 border-amber-400 text-amber-200 font-black text-sm tracking-wide shadow-xl transition-all active:scale-95 flex items-center justify-center gap-2">
                            <span>▶️ SADECE İZLE</span>
                        </button>
                    </div>

                    <button onclick="window.EgyptCinematicStudio.startGameplayRecording()" class="w-full py-3 rounded-2xl bg-gradient-to-r from-cyan-800 to-blue-800 hover:from-cyan-700 hover:to-blue-700 border border-cyan-300/70 text-white font-black text-sm tracking-wide shadow-lg transition-all active:scale-95">
                        🎮 SERBEST OYUN KAYDINI BAŞLAT · KENDİ ANINI YAKALA
                    </button>

                    <!-- Alt Bilgi & Kapat -->
                    <div class="flex items-center justify-between text-[11px] text-amber-300/80 pt-1 border-t border-amber-500/20">
                        <span>💡 Oynatma sırasında dilediğin an sağ üstteki <b>[✕ DURDUR]</b> veya <b>[ESC]</b> ile çıkabilirsin.</span>
                        <button onclick="window.EgyptCinematicStudio.copyHashtags()" class="text-amber-200 hover:text-white font-black underline flex items-center gap-1">
                            📋 TikTok Hashtaglerini Kopyala
                        </button>
                    </div>
                </div>
            `;
            document.body.appendChild(modal);

            const sharePanel = document.createElement('div');
            sharePanel.id = 'cine-share-panel';
            sharePanel.style.cssText = `
                position: fixed !important;
                inset: 0 !important;
                z-index: 2147483642 !important;
                display: none;
                align-items: center !important;
                justify-content: center !important;
                background: rgba(0, 0, 0, 0.9) !important;
                backdrop-filter: blur(12px) !important;
                -webkit-backdrop-filter: blur(12px) !important;
                padding: 16px !important;
                pointer-events: auto !important;
            `;
            sharePanel.innerHTML = `
                <section style="width:min(100%,760px);max-height:92vh;overflow-y:auto;background:linear-gradient(160deg,#221408,#0d0703);border:2px solid #fbbf24;border-radius:24px;padding:20px;color:#fef3c7;box-shadow:0 0 50px rgba(245,158,11,.3)">
                    <header style="display:flex;align-items:center;justify-content:space-between;gap:12px;margin-bottom:12px">
                        <div>
                            <h2 style="margin:0;color:#fde68a;font-size:20px;font-weight:900">Klibin paylaşmaya hazır</h2>
                            <p id="cine-share-file-details" style="margin:4px 0 0;color:#fcd34d;font-size:12px"></p>
                        </div>
                        <button onclick="window.EgyptCinematicStudio.closeSharePanel()" aria-label="Kapat" style="width:40px;height:40px;border:1px solid #f87171;border-radius:50%;background:#7f1d1d;color:white;font-size:20px;font-weight:900">✕</button>
                    </header>
                    <video id="cine-share-preview" controls playsinline style="display:block;width:100%;max-height:52vh;background:#050403;border-radius:14px"></video>
                    <label for="cine-share-caption" style="display:block;margin:14px 0 6px;font-size:12px;font-weight:800;color:#fcd34d">PAYLAŞIM AÇIKLAMASI</label>
                    <textarea id="cine-share-caption" rows="3" maxlength="500" style="box-sizing:border-box;width:100%;resize:vertical;border:1px solid #b45309;border-radius:12px;background:#100a05;color:#fff7d6;padding:10px;font:inherit"></textarea>
                    <div style="display:flex;flex-wrap:wrap;gap:8px;margin-top:12px">
                        <button onclick="window.EgyptCinematicStudio.shareRecordedVideo()" style="flex:1;min-width:180px;padding:12px;border:1px solid #fde68a;border-radius:12px;background:linear-gradient(90deg,#7c3aed,#db2777);color:white;font-weight:900">📲 Paylaş...</button>
                        <button onclick="window.EgyptCinematicStudio.downloadRecordedVideo()" style="flex:1;min-width:150px;padding:12px;border:1px solid #fbbf24;border-radius:12px;background:#78350f;color:#fff7d6;font-weight:900">⬇ Videoyu indir</button>
                        <button onclick="window.EgyptCinematicStudio.copyShareCaption()" style="flex:1;min-width:150px;padding:12px;border:1px solid #fbbf24;border-radius:12px;background:#292016;color:#fff7d6;font-weight:900">📋 Açıklamayı kopyala</button>
                    </div>
                    <p style="margin:10px 0 0;color:#d6b879;font-size:11px">Paylaşım, cihazının desteklediği uygulama seçicisini açar. Desteklenmiyorsa videoyu indirip uygulamaya ekleyebilirsin.</p>
                </section>
            `;
            document.body.appendChild(sharePanel);

            // DOM Elemanlarını Önbelleğe Al
            this.dom = {
                overlay,
                modal,
                sharePanel,
                sharePreview: document.getElementById('cine-share-preview'),
                shareCaption: document.getElementById('cine-share-caption'),
                shareFileDetails: document.getElementById('cine-share-file-details'),
                exitBtnContainer,
                exitBtn,
                letterboxTop: document.getElementById('cine-letterbox-top'),
                letterboxBottom: document.getElementById('cine-letterbox-bottom'),
                tiktokMask: document.getElementById('cine-tiktok-mask'),
                cutFlash: document.getElementById('cine-cut-flash'),
                dustCanvas: document.getElementById('cine-dust-canvas'),
                recBanner: document.getElementById('cine-rec-banner'),
                recStatus: document.getElementById('cine-rec-status'),
                recDot: document.getElementById('cine-rec-dot'),
                shotName: document.getElementById('cine-shot-name'),
                titleCard: document.getElementById('cine-title-card'),
                mainTitle: document.getElementById('cine-main-title'),
                subTitle: document.getElementById('cine-sub-title'),
                lensFlare: document.getElementById('cine-lens-flare')
            };

            this.initDustParticles();
            this.currentPreset = 'trailer_45s';
            this.updateStudioFormatButtons();
        }

        // =====================================================================
        // ALTIN TAPINAK TOZLARI (ATMOSPHERIC FLOATING EMBERS)
        // =====================================================================
        initDustParticles() {
            const canvas = this.dom.dustCanvas;
            if (!canvas) return;
            const ctx = canvas.getContext('2d');
            if (!ctx) return;

            const resize = () => {
                canvas.width = window.innerWidth;
                canvas.height = window.innerHeight;
            };
            resize();
            window.addEventListener('resize', resize);

            const particles = [];
            const count = 48;
            for (let i = 0; i < count; i++) {
                particles.push({
                    x: Math.random() * canvas.width,
                    y: Math.random() * canvas.height,
                    radius: Math.random() * 2.2 + 0.8,
                    speedX: (Math.random() - 0.5) * 0.4,
                    speedY: -Math.random() * 0.6 - 0.2,
                    alpha: Math.random() * 0.6 + 0.2,
                    pulse: Math.random() * Math.PI * 2
                });
            }

            const animateDust = () => {
                if (this.active) {
                    ctx.clearRect(0, 0, canvas.width, canvas.height);
                    for (let p of particles) {
                        p.x += p.speedX;
                        p.y += p.speedY;
                        p.pulse += 0.04;
                        if (p.y < -10) p.y = canvas.height + 10;
                        if (p.x < -10) p.x = canvas.width + 10;
                        if (p.x > canvas.width + 10) p.x = -10;

                        const curAlpha = p.alpha * (0.6 + 0.4 * Math.sin(p.pulse));
                        ctx.beginPath();
                        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
                        ctx.fillStyle = `rgba(253, 224, 71, ${curAlpha})`;
                        ctx.shadowBlur = 6;
                        ctx.shadowColor = 'rgba(245, 158, 11, 0.8)';
                        ctx.fill();
                    }
                }
                requestAnimationFrame(animateDust);
            };
            animateDust();
        }

        // =====================================================================
        // MODAL VE FORMAT KONTROLLERİ: %100 HATASIZ
        // =====================================================================
        openStudioModal() {
            let modal = document.getElementById('cinematic-studio-modal');
            if (!modal) {
                this.createDOM();
                modal = document.getElementById('cinematic-studio-modal');
            }
            if (modal) {
                modal.classList.remove('hidden');
                modal.style.display = 'flex';
                modal.style.zIndex = '2147483640';
                modal.style.pointerEvents = 'auto';
                modal.style.visibility = 'visible';
                modal.style.opacity = '1';
            }
        }

        closeStudioModal() {
            const modal = document.getElementById('cinematic-studio-modal') || this.dom.modal;
            if (modal) {
                modal.style.display = 'none';
            }
        }

        closeSharePanel() {
            if (this.dom.sharePreview) {
                this.dom.sharePreview.pause();
                this.dom.sharePreview.removeAttribute('src');
                this.dom.sharePreview.load();
            }
            if (this.lastRecordedUrl) {
                URL.revokeObjectURL(this.lastRecordedUrl);
                this.lastRecordedUrl = null;
            }
            if (this.dom.sharePanel) this.dom.sharePanel.style.display = 'none';
        }

        selectPreset(presetKey, el) {
            this.currentPreset = presetKey;
            if (el && el.parentNode) {
                el.parentNode.querySelectorAll('.cine-preset-card').forEach(c => {
                    c.classList.remove('active', 'border-2', 'border-amber-400', 'bg-amber-500/20');
                    c.classList.add('border', 'border-amber-500/40', 'bg-black/50');
                });
                el.classList.add('active', 'border-2', 'border-amber-400', 'bg-amber-500/20');
                el.classList.remove('border-amber-500/40', 'bg-black/50');
            }
        }

        setFormat(fmt, el) {
            if (!['9:16', '16:9', '1:1', '2.39:1'].includes(fmt)) {
                throw new Error(`Desteklenmeyen video formatı: ${fmt}`);
            }
            this.format = fmt;
            if (el && el.parentNode) {
                el.parentNode.querySelectorAll('button').forEach(b => {
                    b.classList.remove('border-2', 'border-amber-400', 'bg-amber-500/25', 'text-yellow-200');
                    b.classList.add('border', 'border-amber-500/40', 'bg-black/50');
                });
                el.classList.add('border-2', 'border-amber-400', 'bg-amber-500/25', 'text-yellow-200');
                el.classList.remove('border-amber-500/40', 'bg-black/50');
            }
            if (this.active) this.applyFormatOverlay();
        }

        updateStudioFormatButtons() {
            const buttonIds = {
                '9:16': 'btn-format-tiktok',
                '16:9': 'btn-format-yt',
                '1:1': 'btn-format-square',
                '2.39:1': 'btn-format-cine'
            };
            const activeId = buttonIds[this.format];
            for (const id of Object.values(buttonIds)) {
                const button = document.getElementById(id);
                if (!button) continue;
                const selected = id === activeId;
                button.classList.toggle('border-2', selected);
                button.classList.toggle('border-amber-400', selected);
                button.classList.toggle('bg-amber-500/25', selected);
                button.classList.toggle('text-yellow-200', selected);
                button.classList.toggle('border', !selected);
                button.classList.toggle('border-amber-500/40', !selected);
                button.classList.toggle('bg-black/50', !selected);
            }
        }

        setOutputQuality(quality) {
            const value = Number(quality);
            if (value !== 720 && value !== 1080) {
                throw new Error(`Desteklenmeyen çıktı kalitesi: ${quality}`);
            }
            this.outputQuality = value;
        }

        getOutputDimensions() {
            const aspectByFormat = {
                '9:16': 9 / 16,
                '16:9': 16 / 9,
                '1:1': 1,
                '2.39:1': 2.39
            };
            const aspect = aspectByFormat[this.format];
            if (!aspect) throw new Error(`Desteklenmeyen video formatı: ${this.format}`);
            return {
                aspect,
                width: aspect < 1 ? this.outputQuality : Math.round(this.outputQuality * aspect),
                height: aspect < 1 ? Math.round(this.outputQuality / aspect) : this.outputQuality
            };
        }

        getShareCaption() {
            const customCaption = document.getElementById('cine-custom-caption');
            const caption = customCaption && customCaption.value.trim();
            const tags = this.format === '9:16'
                ? '#TikTok #Reels #Shorts'
                : (this.format === '1:1' ? '#Instagram #Reels' : '#YouTube #Gaming');
            return `${caption || this.lastTitle || 'Kadim Mısır dünyasında sinematik bir macera!'}\n\n${tags} #GodsOfEgypt #IndieGame`;
        }

        async copyShareCaption() {
            if (!navigator.clipboard || !navigator.clipboard.writeText) {
                if (window.GameHUD) window.GameHUD.showToast('Bu tarayıcı panoya kopyalamayı desteklemiyor.', 'system');
                return;
            }
            try {
                await navigator.clipboard.writeText(this.dom.shareCaption ? this.dom.shareCaption.value : this.getShareCaption());
                if (window.GameHUD) window.GameHUD.showToast('Paylaşım açıklaması kopyalandı.', 'gold');
            } catch (error) {
                console.error('Paylaşım açıklaması kopyalanamadı:', error);
                if (window.GameHUD) window.GameHUD.showToast('Açıklama panoya kopyalanamadı.', 'danger');
            }
        }

        async shareRecordedVideo() {
            if (!this.lastRecordedBlob) {
                throw new Error('Paylaşılacak kayıt bulunamadı.');
            }
            if (typeof File === 'undefined') {
                if (window.GameHUD) window.GameHUD.showToast('Bu tarayıcı videoyu doğrudan paylaşamıyor; indirip paylaşabilirsin.', 'system');
                this.downloadRecordedVideo();
                return;
            }
            const file = new File([this.lastRecordedBlob], this.lastRecordedFileName, { type: this.lastRecordedBlob.type || 'video/webm' });
            const shareData = {
                files: [file],
                title: 'Gods of Egypt',
                text: this.dom.shareCaption ? this.dom.shareCaption.value : this.getShareCaption()
            };
            let canShareFiles = typeof navigator.share === 'function';
            if (canShareFiles && navigator.canShare) {
                try {
                    canShareFiles = navigator.canShare({ files: shareData.files });
                } catch (error) {
                    console.warn('Dosya paylaşım desteği doğrulanamadı:', error);
                    canShareFiles = false;
                }
            }
            if (!canShareFiles) {
                if (window.GameHUD) window.GameHUD.showToast('Dosya paylaşımı desteklenmiyor; video indiriliyor.', 'system');
                this.downloadRecordedVideo();
                return;
            }
            try {
                await navigator.share(shareData);
            } catch (error) {
                if (error.name === 'AbortError') return;
                console.error('Video paylaşılamadı:', error);
                if (window.GameHUD) window.GameHUD.showToast('Video paylaşımı başarısız oldu; videoyu indirip deneyebilirsin.', 'danger');
            }
        }

        downloadRecordedVideo() {
            if (!this.lastRecordedBlob) {
                throw new Error('İndirilecek kayıt bulunamadı.');
            }
            const url = this.lastRecordedUrl || URL.createObjectURL(this.lastRecordedBlob);
            const link = document.createElement('a');
            link.href = url;
            link.download = this.lastRecordedFileName;
            document.body.appendChild(link);
            link.click();
            link.remove();
            if (!this.lastRecordedUrl) setTimeout(() => URL.revokeObjectURL(url), 60000);
            if (window.GameHUD) window.GameHUD.showToast(`Video indiriliyor: ${this.lastRecordedFileName}`, 'gold');
        }

        setTimeScale(scale, el) {
            this.timeScale = scale;
            if (el) {
                el.textContent = `⚡ Hız: ${scale}x`;
            }
        }

        toggleSound(el) {
            this.soundEnabled = !this.soundEnabled;
            this.audio.enabled = this.soundEnabled;
            if (el) {
                el.textContent = this.soundEnabled ? '🔊 Braam & SFX: AÇIK' : '🔇 Braam & SFX: KAPALI';
                el.className = this.soundEnabled 
                    ? 'flex-1 py-2 rounded-xl text-xs font-extrabold border-2 border-amber-400 bg-amber-500/25 text-yellow-200 transition-all'
                    : 'flex-1 py-2 rounded-xl text-xs font-extrabold border border-amber-500/40 bg-black/50 text-stone-400 transition-all';
            }
        }

        copyHashtags() {
            const tags = this.getShareCaption();
            if (navigator.clipboard && navigator.clipboard.writeText) {
                navigator.clipboard.writeText(tags)
                    .then(() => window.GameHUD && window.GameHUD.showToast('📋 Paylaşım açıklaması kopyalandı!', 'gold'))
                    .catch(error => {
                        console.error('Paylaşım açıklaması kopyalanamadı:', error);
                        if (window.GameHUD) window.GameHUD.showToast('Açıklama panoya kopyalanamadı.', 'danger');
                    });
            } else if (window.GameHUD) {
                window.GameHUD.showToast('Bu tarayıcı panoya kopyalamayı desteklemiyor.', 'system');
            }
        }

        isActive() {
            return this.active;
        }

        // =====================================================================
        // SİNEMATİK OYNATMA VE VİDEO KAYIT MOTORU
        // =====================================================================
        startCinematic(recordVideo = false) {
            this.closeStudioModal();
            this.active = true;
            this.isGameplayRecording = false;
            this.sequenceTimer = 0;
            this.currentShotIndex = -1;

            const durationMap = {
                'trailer_45s': 45.0,
                'god_hype_30s': 30.0,
                'nile_nature_35s': 35.0,
                'first_person_30s': 30.0,
                'drone_flyby_30s': 30.0
            };
            this.totalDuration = durationMap[this.currentPreset] || 45.0;

            // Format maskelerini uygula
            this.applyFormatOverlay();

            // Arayüzü gizle
            if (this.hideHudDuringPlay) {
                this.hideGameHUD();
            }

            // REC Banner'ını yalnız gerçek kayıt sırasında göster.
            if (this.dom.recBanner) {
                this.dom.recBanner.classList.remove('hidden');
                this.dom.recBanner.style.display = recordVideo ? 'block' : 'none';
            }
            if (this.dom.exitBtnContainer) {
                this.dom.exitBtnContainer.style.display = 'block';
            }

            // İsteğe bağlı canvas video kaydını başlat
            if (recordVideo) {
                this.startCanvasRecording();
                if (this.isRecording) {
                    this.hideRecordingInterface();
                } else if (this.dom.exitBtnContainer) {
                    this.dom.exitBtnContainer.style.display = 'none';
                    this.showGameHUD();
                }
            }
            if (!this.isRecording && this.dom.recBanner) this.dom.recBanner.style.display = 'none';

            // Start the soundtrack after the recorder is connected to its output.
            if (this.soundEnabled) {
                this.audio.startDrone();
                this.audio.playBraam();
            }

            if (window.GameHUD) {
                window.GameHUD.showToast(`🎬 Sinematik Çekim Başladı! Durdurmak için sağ üstteki [✕ DURDUR] butonuna basabilirsin.`, 'gold');
            }
        }

        startGameplayRecording() {
            if (this.isGameplayRecording) {
                this.stopCinematic('Serbest kayıt durduruldu');
                return;
            }
            if (this.active) return;

            this.closeStudioModal();
            this.isGameplayRecording = true;
            this.currentPreset = 'gameplay';
            this.lastTitle = '✦ GODS OF EGYPT ✦';
            const caption = document.getElementById('cine-custom-caption');
            if (this.dom.mainTitle) this.dom.mainTitle.textContent = this.lastTitle;
            if (this.dom.subTitle) this.dom.subTitle.textContent = caption && caption.value.trim()
                ? caption.value.trim()
                : 'Kendi oyun anını yakala';
            this.applyFormatOverlay();
            if (this.dom.recBanner) {
                this.dom.recBanner.classList.remove('hidden');
                this.dom.recBanner.style.display = 'block';
            }
            if (this.dom.shotName) this.dom.shotName.textContent = 'Serbest oyun kaydı';
            if (this.dom.exitBtnContainer) this.dom.exitBtnContainer.style.display = 'block';

            this.startCanvasRecording();
            if (!this.isRecording) {
                this.isGameplayRecording = false;
                if (this.dom.recBanner) this.dom.recBanner.style.display = 'none';
                if (this.dom.exitBtnContainer) this.dom.exitBtnContainer.style.display = 'none';
                return;
            }
            this.hideRecordingInterface();
        }

        applyFormatOverlay() {
            if (this.format === '9:16') {
                if (this.dom.tiktokMask) {
                    this.dom.tiktokMask.classList.remove('hidden');
                    this.dom.tiktokMask.style.display = 'flex';
                }
                if (this.dom.letterboxTop) this.dom.letterboxTop.style.height = '0';
                if (this.dom.letterboxBottom) this.dom.letterboxBottom.style.height = '0';
            } else if (this.format === '2.39:1') {
                if (this.dom.tiktokMask) this.dom.tiktokMask.style.display = 'none';
                if (this.dom.letterboxTop) this.dom.letterboxTop.style.height = '12vh';
                if (this.dom.letterboxBottom) this.dom.letterboxBottom.style.height = '12vh';
            } else {
                // 16:9 Full
                if (this.dom.tiktokMask) this.dom.tiktokMask.style.display = 'none';
                if (this.dom.letterboxTop) this.dom.letterboxTop.style.height = '0';
                if (this.dom.letterboxBottom) this.dom.letterboxBottom.style.height = '0';
            }
        }

        hideGameHUD() {
            const hud = document.getElementById('mmo-master-hud');
            if (hud) hud.style.display = 'none';
            const joy = document.getElementById('joystick-zone');
            if (joy) joy.style.display = 'none';
        }

        showGameHUD() {
            const hud = document.getElementById('mmo-master-hud');
            if (hud) hud.style.display = 'block';
            if (window.innerWidth < 1025) {
                const joy = document.getElementById('joystick-zone');
                if (joy) joy.style.display = 'flex';
            }
        }

        hideRecordingInterface() {
            const sourceCanvas = (window.renderer && window.renderer.domElement)
                || document.querySelector('body > canvas');
            const preservedElements = new Set();
            [sourceCanvas, this.dom.exitBtnContainer].forEach(element => {
                for (let current = element; current && current !== document.body; current = current.parentElement) {
                    preservedElements.add(current);
                }
            });
            if (this.dom.exitBtnContainer) {
                this.dom.exitBtnContainer.querySelectorAll('*').forEach(element => preservedElements.add(element));
            }

            document.body.querySelectorAll('*').forEach(element => {
                if (preservedElements.has(element) || this.hiddenRecordingElements.has(element)) return;
                const style = element.style;
                this.hiddenRecordingElements.set(element, {
                    visibility: style.getPropertyValue('visibility'),
                    visibilityPriority: style.getPropertyPriority('visibility'),
                    pointerEvents: style.getPropertyValue('pointer-events'),
                    pointerEventsPriority: style.getPropertyPriority('pointer-events')
                });
                style.setProperty('visibility', 'hidden', 'important');
                style.setProperty('pointer-events', 'none', 'important');
            });
        }

        restoreRecordingInterface() {
            this.hiddenRecordingElements.forEach((previousStyle, element) => {
                if (!element.isConnected) return;
                if (previousStyle.visibility) {
                    element.style.setProperty('visibility', previousStyle.visibility, previousStyle.visibilityPriority);
                } else {
                    element.style.removeProperty('visibility');
                }
                if (previousStyle.pointerEvents) {
                    element.style.setProperty('pointer-events', previousStyle.pointerEvents, previousStyle.pointerEventsPriority);
                } else {
                    element.style.removeProperty('pointer-events');
                }
            });
            this.hiddenRecordingElements.clear();
        }

        // =====================================================================
        // MP4 canvas kaydedici; MP4 kaydı yoksa yerel WebM -> MP4 dönüşümü kullanır.
        // =====================================================================
        startCanvasRecording() {
            try {
                if (this.isPreparingRecording) {
                    if (window.GameHUD) window.GameHUD.showToast('Önceki video hazırlanıyor; lütfen birkaç saniye bekle.', 'system');
                    return;
                }
                const sourceCanvas = (window.renderer && window.renderer.domElement)
                    || document.querySelector('body > canvas');
                if (!sourceCanvas || typeof sourceCanvas.captureStream !== 'function' || typeof MediaRecorder === 'undefined') {
                    if (window.GameHUD) window.GameHUD.showToast('ℹ️ Tarayıcın doğrudan canvas kaydını desteklemiyor, harici ekran kaydedici kullanabilirsin.', 'system');
                    return;
                }

                const outputCanvas = document.createElement('canvas');
                const { aspect, width, height } = this.getOutputDimensions();
                outputCanvas.width = width;
                outputCanvas.height = height;
                const outputContext = outputCanvas.getContext('2d');
                if (!outputContext) throw new Error('Video kompozisyon tuvali başlatılamadı.');

                this.audio.init();
                const audioContexts = [
                    { owner: this.audio, context: this.audio.ctx },
                    { owner: window.GameAudio, context: window.GameAudio && window.GameAudio.getContext() }
                ];
                const audioDestinations = audioContexts
                    .filter(entry => entry.context && entry.context.createMediaStreamDestination)
                    .map(entry => {
                        const destination = entry.context.createMediaStreamDestination();
                        entry.owner.recordDestination = destination;
                        return destination;
                    });

                const videoStream = outputCanvas.captureStream(30);
                const tracks = [...videoStream.getVideoTracks()];
                audioDestinations.forEach(destination => tracks.push(...destination.stream.getAudioTracks()));
                this.recordStream = new MediaStream(tracks);
                this.recordCanvas = outputCanvas;
                this.recordContext = outputContext;
                this.recordedChunks = [];
                this.lastRecordedBlob = null;
                this.closeSharePanel();

                const supportedTypes = [
                    'video/mp4;codecs=avc1.42E01E,mp4a.40.2',
                    'video/mp4;codecs=avc1',
                    'video/mp4',
                    'video/webm;codecs=vp9',
                    'video/webm;codecs=vp8',
                    'video/webm'
                ];
                const mimeType = supportedTypes.find(type => MediaRecorder.isTypeSupported && MediaRecorder.isTypeSupported(type));
                this.mediaRecorder = mimeType
                    ? new MediaRecorder(this.recordStream, { mimeType })
                    : new MediaRecorder(this.recordStream);
                this.mediaRecorder.ondataavailable = (e) => {
                    if (e.data && e.data.size > 0) {
                        this.recordedChunks.push(e.data);
                    }
                };

                this.mediaRecorder.onstop = async () => {
                    this.isPreparingRecording = true;
                    try {
                        await this.saveRecordedVideoFile();
                    } catch (error) {
                        console.error('Kayıt sonlandırılırken video hazırlanamadı:', error);
                        if (window.GameHUD) window.GameHUD.showToast('Kayıt tamamlandı ancak paylaşım paneli hazırlanamadı.', 'danger');
                    } finally {
                        if (this.recordStream) this.recordStream.getTracks().forEach(track => track.stop());
                        this.recordStream = null;
                        this.recordCanvas = null;
                        this.recordContext = null;
                        this.isRecording = false;
                        this.isPreparingRecording = false;
                        if (this.audio) this.audio.recordDestination = null;
                        if (window.GameAudio) window.GameAudio.recordDestination = null;
                    }
                };
                this.mediaRecorder.onerror = (event) => {
                    console.error('Video kaydı sırasında hata:', event.error);
                    if (window.GameHUD) window.GameHUD.showToast('Video kaydı sırasında hata oluştu; cihaz depolamasını kontrol et.', 'danger');
                };

                this.mediaRecorder.start(250);
                this.isRecording = true;
                this.recordStartedAt = performance.now();
                const drawFrame = () => {
                    if (!this.isRecording || !this.recordCanvas || !this.recordContext) return;
                    const elapsedSeconds = Math.floor((performance.now() - this.recordStartedAt) / 1000);
                    const pad = (value) => String(value).padStart(2, '0');
                    if (this.dom.recStatus) {
                        this.dom.recStatus.textContent = this.active
                            ? `REC [00:${pad(Math.floor(this.sequenceTimer))} / 00:${pad(Math.floor(this.totalDuration))}] • ${this.format}`
                            : `REC [${pad(Math.floor(elapsedSeconds / 60))}:${pad(elapsedSeconds % 60)}] • ${this.format}`;
                    }
                    if (this.isGameplayRecording && elapsedSeconds >= 60) {
                        this.stopCinematic('Serbest kayıt 60 saniye sınırına ulaştı');
                        return;
                    }
                    const sourceWidth = sourceCanvas.width;
                    const sourceHeight = sourceCanvas.height;
                    if (!sourceWidth || !sourceHeight) {
                        this.recordFrameId = requestAnimationFrame(drawFrame);
                        return;
                    }
                    const sourceAspect = sourceWidth / sourceHeight;
                    let cropWidth = sourceWidth;
                    let cropHeight = sourceHeight;
                    let cropX = 0;
                    let cropY = 0;
                    if (sourceAspect > aspect) {
                        cropWidth = sourceHeight * aspect;
                        cropX = (sourceWidth - cropWidth) / 2;
                    } else {
                        cropHeight = sourceWidth / aspect;
                        cropY = (sourceHeight - cropHeight) / 2;
                    }
                    outputContext.fillStyle = '#090604';
                    outputContext.fillRect(0, 0, outputCanvas.width, outputCanvas.height);
                    outputContext.drawImage(sourceCanvas, cropX, cropY, cropWidth, cropHeight, 0, 0, outputCanvas.width, outputCanvas.height);

                    const titleText = this.dom.mainTitle && this.dom.mainTitle.textContent.trim();
                    const subtitleText = this.dom.subTitle && this.dom.subTitle.textContent.trim();
                    if (!this.isGameplayRecording && this.showTitles && (titleText || subtitleText)) {
                        const baseY = outputCanvas.height * (aspect < 1 ? 0.72 : 0.82);
                        outputContext.textAlign = 'center';
                        outputContext.shadowColor = '#000000';
                        outputContext.shadowBlur = 10;
                        outputContext.fillStyle = '#ffe08a';
                        outputContext.font = `bold ${Math.max(20, outputCanvas.width * (aspect < 1 ? 0.046 : 0.035))}px system-ui`;
                        if (titleText) outputContext.fillText(titleText, outputCanvas.width / 2, baseY, outputCanvas.width * 0.86);
                        outputContext.fillStyle = '#fff4d1';
                        outputContext.font = `${Math.max(14, outputCanvas.width * (aspect < 1 ? 0.026 : 0.018))}px system-ui`;
                        if (subtitleText) outputContext.fillText(subtitleText, outputCanvas.width / 2, baseY + outputCanvas.height * 0.04, outputCanvas.width * 0.86);
                        outputContext.shadowBlur = 0;
                    }
                    const creatorTag = document.getElementById('cine-creator-tag');
                    const creatorText = creatorTag && creatorTag.value.trim();
                    if (creatorText) {
                        const safeTag = creatorText.startsWith('@') ? creatorText : `@${creatorText}`;
                        outputContext.textAlign = 'left';
                        outputContext.font = `bold ${Math.max(16, outputCanvas.width * 0.022)}px system-ui`;
                        outputContext.fillStyle = '#fff4d1';
                        outputContext.shadowColor = '#000000';
                        outputContext.shadowBlur = 8;
                        outputContext.fillText(safeTag, outputCanvas.width * 0.055, outputCanvas.height * 0.065, outputCanvas.width * 0.75);
                        outputContext.shadowBlur = 0;
                    }
                    this.recordFrameId = requestAnimationFrame(drawFrame);
                };
                this.recordFrameId = requestAnimationFrame(drawFrame);
                if (this.dom.recDot) this.dom.recDot.className = 'w-3.5 h-3.5 rounded-full bg-red-600 animate-ping';
            } catch (err) {
                console.error('Canvas recorder init error:', err);
                if (this.recordFrameId) cancelAnimationFrame(this.recordFrameId);
                if (this.recordStream) this.recordStream.getTracks().forEach(track => track.stop());
                this.recordFrameId = null;
                this.recordStream = null;
                this.recordCanvas = null;
                this.recordContext = null;
                this.isRecording = false;
                if (this.audio) this.audio.recordDestination = null;
                if (window.GameAudio) window.GameAudio.recordDestination = null;
                if (window.GameHUD) window.GameHUD.showToast('Video kaydı başlatılamadı. Tarayıcı izinlerini ve MP4/WebM kayıt desteğini kontrol et.', 'danger');
            }
        }

        stopCanvasRecording() {
            if (this.isRecording && this.mediaRecorder && this.mediaRecorder.state !== 'inactive') {
                this.mediaRecorder.stop();
                this.isRecording = false;
            }
            if (this.recordFrameId) cancelAnimationFrame(this.recordFrameId);
            this.recordFrameId = null;
        }

        async loadFFmpeg() {
            if (!this.ffmpegPromise) {
                this.ffmpegPromise = (async () => {
                    if (!window.FFmpeg) {
                        await new Promise((resolve, reject) => {
                            const script = document.createElement('script');
                            script.src = 'https://unpkg.com/@ffmpeg/ffmpeg@0.11.6/dist/ffmpeg.min.js';
                            script.onload = resolve;
                            script.onerror = () => reject(new Error('MP4 dönüştürme motoru yüklenemedi.'));
                            document.head.appendChild(script);
                        });
                    }
                    if (!window.FFmpeg || typeof window.FFmpeg.createFFmpeg !== 'function') {
                        throw new Error('MP4 dönüştürme motoru bu tarayıcıda kullanılamıyor.');
                    }
                    const ffmpeg = window.FFmpeg.createFFmpeg({
                        log: false,
                        corePath: 'https://unpkg.com/@ffmpeg/core@0.11.0/dist/ffmpeg-core.js'
                    });
                    await ffmpeg.load();
                    return ffmpeg;
                })();
            }
            try {
                return await this.ffmpegPromise;
            } catch (error) {
                this.ffmpegPromise = null;
                throw error;
            }
        }

        async convertWebmToMp4(webmBlob) {
            const ffmpeg = await this.loadFFmpeg();
            const inputPath = `recording-${Date.now()}.webm`;
            const outputPath = `recording-${Date.now()}.mp4`;
            try {
                ffmpeg.FS('writeFile', inputPath, new Uint8Array(await webmBlob.arrayBuffer()));
                await ffmpeg.run(
                    '-i', inputPath,
                    '-c:v', 'libx264',
                    '-preset', 'ultrafast',
                    '-crf', '23',
                    '-c:a', 'aac',
                    '-b:a', '128k',
                    '-movflags', '+faststart',
                    outputPath
                );
                const output = ffmpeg.FS('readFile', outputPath);
                if (!output.length) throw new Error('MP4 dönüştürme boş dosya oluşturdu.');
                return new Blob([output], { type: 'video/mp4' });
            } finally {
                for (const path of [inputPath, outputPath]) {
                    try {
                        ffmpeg.FS('unlink', path);
                    } catch (error) {
                        console.warn(`Geçici video dosyası temizlenemedi (${path}):`, error);
                    }
                }
            }
        }

        async saveRecordedVideoFile() {
            if (this.recordedChunks.length === 0) {
                if (window.GameHUD) window.GameHUD.showToast('Kayıt verisi alınamadı; kayıt indirme paneli oluşturulmadı.', 'danger');
                return;
            }
            const mimeType = (this.mediaRecorder && this.mediaRecorder.mimeType)
                || this.recordedChunks.find(chunk => chunk.type)?.type
                || 'video/webm';
            const originalBlob = new Blob(this.recordedChunks, { type: mimeType });
            let outputBlob = originalBlob;
            let extension = mimeType.includes('mp4') ? 'mp4' : 'webm';
            let conversionFailed = false;
            if (extension === 'webm') {
                if (window.GameHUD) window.GameHUD.showToast('MP4 video hazırlanıyor; ilk dönüşüm biraz sürebilir.', 'system');
                try {
                    outputBlob = await this.convertWebmToMp4(originalBlob);
                    extension = 'mp4';
                } catch (error) {
                    conversionFailed = true;
                    console.error('WebM kaydı MP4’e dönüştürülemedi:', error);
                }
            }
            this.lastRecordedBlob = outputBlob;
            const safePreset = String(this.currentPreset).replace(/[^a-z0-9_-]/gi, '_');
            this.lastRecordedFileName = `GodsOfEgypt_${safePreset}_${this.format.replace(':', 'x').replace('.', '_')}.${extension}`;
            if (this.lastRecordedUrl) URL.revokeObjectURL(this.lastRecordedUrl);
            this.lastRecordedUrl = URL.createObjectURL(this.lastRecordedBlob);

            if (this.dom.sharePreview) this.dom.sharePreview.src = this.lastRecordedUrl;
            if (this.dom.shareCaption) this.dom.shareCaption.value = this.getShareCaption();
            if (this.dom.shareFileDetails) {
                const sizeMb = (this.lastRecordedBlob.size / (1024 * 1024)).toFixed(1);
                this.dom.shareFileDetails.textContent = `${this.format} · ${this.outputQuality}p · ${sizeMb} MB · ${this.lastRecordedFileName}`;
            }
            if (this.dom.sharePanel) this.dom.sharePanel.style.display = 'flex';
            if (window.GameHUD) {
                if (conversionFailed) {
                    window.GameHUD.showToast('MP4 dönüştürülemedi; WebM yedeği hazır. İnternet bağlantını kontrol edip tekrar deneyebilirsin.', 'danger');
                } else {
                    window.GameHUD.showToast('MP4 klip hazır. Önizleyebilir, indirebilir veya cihazının paylaşım menüsünü açabilirsin.', 'gold');
                }
            }
        }

        // =====================================================================
        // SİNEMATİK DURDURMA: ANINDA TEMİZLEME & ÇIKIŞ
        // =====================================================================
        stopCinematic(reason) {
            this.active = false;
            this.isGameplayRecording = false;
            if (this.isRecording) {
                this.stopCanvasRecording();
            }

            // Sesi Durdur
            if (this.audio) {
                this.audio.stopDrone();
            }

            // Overlay ve maskeleri sıfırla
            if (this.dom.recBanner) this.dom.recBanner.style.display = 'none';
            if (this.dom.exitBtnContainer) this.dom.exitBtnContainer.style.display = 'none';
            if (this.dom.titleCard) this.dom.titleCard.style.opacity = '0';
            if (this.dom.letterboxTop) this.dom.letterboxTop.style.height = '0';
            if (this.dom.letterboxBottom) this.dom.letterboxBottom.style.height = '0';
            if (this.dom.tiktokMask) this.dom.tiktokMask.style.display = 'none';
            if (this.dom.lensFlare) this.dom.lensFlare.style.opacity = '0';
            if (this.dom.cutFlash) this.dom.cutFlash.style.opacity = '0';

            this.restoreRecordingInterface();
            this.showGameHUD();

            if (window.GameHUD) {
                window.GameHUD.showToast(`🛑 ${reason || 'Sinematik mod tamamlandı.'}`, 'gold');
            }
        }

        // =====================================================================
        // HOLLYWOOD SAHNE KESME FLAŞI & SES TETİKLEYİCİ
        // =====================================================================
        triggerShotCut(newShotIndex, soundType = 'braam') {
            if (this.currentShotIndex !== newShotIndex) {
                this.currentShotIndex = newShotIndex;

                // 1. Görsel Kesme Flaşı (120ms)
                if (this.dom.cutFlash) {
                    this.dom.cutFlash.style.opacity = '0.9';
                    setTimeout(() => {
                        if (this.dom.cutFlash) this.dom.cutFlash.style.opacity = '0';
                    }, 120);
                }

                // 2. Hollywood Ses Tetiklemesi
                if (this.soundEnabled && this.audio) {
                    if (soundType === 'braam') {
                        this.audio.playBraam();
                    } else if (soundType === 'whoosh') {
                        this.audio.playWhoosh();
                    } else if (soundType === 'clash') {
                        this.audio.playClash();
                    } else if (soundType === 'impact') {
                        this.audio.playImpact();
                    }
                }

                // 3. Kamera Sarsıntısı
                this.shakeTrauma = 0.25;
            }
        }

        // =====================================================================
        // HER KAREDE ÇALIŞAN SİNEMATİK YÖNETMEN VE KAMERA EĞRİLERİ
        // =====================================================================
        update(camera, player, delta, elapsed) {
            if (!this.active || !camera) return;

            this.sequenceTimer += delta * this.timeScale;
            const tTotal = this.sequenceTimer;

            // Süre doldu mu?
            if (tTotal >= this.totalDuration) {
                this.stopCinematic('Sinematik Tanıtım Başarıyla Tamamlandı!');
                return;
            }

            // REC Banner Metnini Güncelle
            if (this.dom.recStatus) {
                const curSec = Math.floor(tTotal);
                const maxSec = Math.floor(this.totalDuration);
                const pad = (n) => n < 10 ? '0' + n : n;
                this.dom.recStatus.textContent = `REC [00:${pad(curSec)} / 00:${pad(maxSec)}] • ${this.format}`;
            }

            // Senaryo Çekimlerini Çalıştır
            if (this.currentPreset === 'trailer_45s') {
                this.playTrailer45s(camera, player, tTotal, delta, elapsed);
            } else if (this.currentPreset === 'god_hype_30s') {
                this.playGodHype30s(camera, player, tTotal, delta, elapsed);
            } else if (this.currentPreset === 'nile_nature_35s') {
                this.playNileNature35s(camera, player, tTotal, delta, elapsed);
            } else if (this.currentPreset === 'first_person_30s') {
                this.playFirstPerson30s(camera, player, tTotal, delta, elapsed);
            } else if (this.currentPreset === 'drone_flyby_30s') {
                this.playDroneFlyby30s(camera, player, tTotal, delta, elapsed);
            }

            // Kamera Sarsıntı Efekti (Trauma Damping)
            if (this.allowShake && this.shakeTrauma > 0.001) {
                const shakeX = (Math.random() - 0.5) * this.shakeTrauma * 0.4;
                const shakeY = (Math.random() - 0.5) * this.shakeTrauma * 0.4;
                camera.position.x += shakeX;
                camera.position.y += shakeY;
                this.shakeTrauma = Math.max(0, this.shakeTrauma - delta * 0.6);
            }
        }

        // =====================================================================
        // SENARYO 1: 45 SANİYELİK BÜYÜK TANITIM FRAGMANI (HOLLYWOOD MASTERCUT)
        // =====================================================================
        playTrailer45s(camera, player, t, delta, elapsed) {
            const px = player ? player.root.position.x : 0;
            const py = player ? player.root.position.y : 0;
            const pz = player ? player.root.position.z : 0;

            if (t < 9.0) {
                // Sahne 1: Göklerden Piramitlere Epik Dalış (0s - 9s)
                this.triggerShotCut(1, 'braam');
                this.updateTitle('✦ GODS OF EGYPT ✦', 'Kadim Mısır Açık Dünyasına Hoş Geldin', 'Göklerden Piramitlere Dalış');
                
                const prog = t / 9.0;
                const smooth = prog * prog * (3 - 2 * prog);
                
                const startX = -120, startY = 85, startZ = -180;
                const endX = 45, endY = 16, endZ = -45;

                const cinematicPos = new THREE.Vector3(
                    THREE.MathUtils.lerp(startX, endX, smooth),
                    THREE.MathUtils.lerp(startY, endY, smooth),
                    THREE.MathUtils.lerp(startZ, endZ, smooth)
                );
                const lookPos = new THREE.Vector3(57, 1.2, 0);
                this.safeFrameCamera(camera, cinematicPos, lookPos, player, { minDistance: 2.6, maxHeight: 90 });
                camera.fov = 68;
                camera.updateProjectionMatrix();

                if (this.dom.lensFlare) this.dom.lensFlare.style.opacity = `${0.2 + Math.sin(t * 3) * 0.15}`;

            } else if (t < 18.0) {
                // Sahne 2: Altın Nil Buğdayında Kahraman Ağır Çekim Yürüyüşü (9s - 18s)
                this.triggerShotCut(2, 'whoosh');
                this.updateTitle('✦ BEREKETLİ NİL BUĞDAYI ✦', '5.200 Canlı Başak & Rüzgar Dalgalanması', 'Kahraman Ağır Çekim Takibi');
                
                // Karakteri ağır çekimde ileri doğru yürüt
                if (player) {
                    player.root.position.z += delta * 2.8;
                    player.root.position.x = 18.0;
                    if (window.EgyptCharacterEngine) {
                        window.EgyptCharacterEngine.animateEgyptCharacter(player, true, 0.75, delta, elapsed);
                    }
                }

                // Düşük açıdan altın başakların arasından güneşe karşı takip
                const camX = (player ? player.root.position.x : 18) - 1.8;
                const camY = (player ? player.root.position.y : 0) + 0.82;
                const camZ = (player ? player.root.position.z : 0) - 5.2;

                const camPos = new THREE.Vector3(camX, camY, camZ);
                const lookPos = new THREE.Vector3(
                    player ? player.root.position.x : 18,
                    (player ? player.root.position.y : 0) + 1.35,
                    (player ? player.root.position.z : 0) + 12.0
                );
                this.safeFrameCamera(camera, camPos, lookPos, player, { minDistance: 2.6, maxHeight: 18 });
                camera.fov = 50;
                camera.updateProjectionMatrix();

                if (this.dom.lensFlare) this.dom.lensFlare.style.opacity = `${0.4 + Math.sin(t * 2) * 0.25}`;

            } else if (t < 27.0) {
                // Sahne 3: 3.6 Metre Altın Tanrı Dönüşümü (18s - 27s)
                this.triggerShotCut(3, 'braam');
                this.updateTitle('✦ 3.6 METRE ALTIN TANRILAR ✦', 'Horus & Set İlahi Form Dönüşümü', '360° İlahi Kahraman Çekimi');
                
                const prog = (t - 18.0) / 9.0;
                const orbitAngle = prog * Math.PI * 2 + 0.5;

                if (player && window.EgyptCharacterEngine) {
                    window.EgyptCharacterEngine.animateEgyptCharacter(player, false, 0, delta, elapsed);
                }

                const dist = 5.6;
                const camX = px + Math.sin(orbitAngle) * dist;
                const camZ = pz + Math.cos(orbitAngle) * dist;
                const camY = py + 2.2 + Math.sin(prog * Math.PI) * 1.4;

                const orbitPos = new THREE.Vector3(camX, camY, camZ);
                const orbitLook = new THREE.Vector3(px, py + 1.8, pz);
                this.safeFrameCamera(camera, orbitPos, orbitLook, player, { minDistance: 2.4, maxHeight: 20 });
                camera.fov = 46;
                camera.updateProjectionMatrix();

            } else if (t < 36.0) {
                // Sahne 4: Nil Rıhtımı, Su Dolapları ve Gemiler (27s - 36s)
                this.triggerShotCut(4, 'whoosh');
                this.updateTitle('✦ DEVASA YAŞAYAN ŞEHİR ✦', 'Su Dolapları, Kademeli Şelaleler & Nil Gemileri', 'Rıhtım Dolly Çekimi');
                
                const prog = (t - 27.0) / 9.0;
                const curZ = THREE.MathUtils.lerp(-110, 85, prog);
                camera.position.set(29.5, 4.2, curZ);
                camera.lookAt(57, 1.0, curZ + 35);
                camera.fov = 62;
                camera.updateProjectionMatrix();

            } else {
                // Sahne 5: Büyük Final - Gökyüzü Panoraması ve Logo (36s - 45s)
                this.triggerShotCut(5, 'braam');
                this.updateTitle('✦ HEMEN ŞİMDİ OYNA! ✦', 'Tarayıcıda oynanabilir mitoloji prototipi', 'Büyük Final Panoraması');
                
                const prog = (t - 36.0) / 9.0;
                const smooth = prog * prog * (3 - 2 * prog);

                camera.position.set(
                    THREE.MathUtils.lerp(15, -45, smooth),
                    THREE.MathUtils.lerp(8, 75, smooth),
                    THREE.MathUtils.lerp(20, -110, smooth)
                );
                camera.lookAt(20, 2.0, 0);
                camera.fov = 72;
                camera.updateProjectionMatrix();
            }
        }

        // =====================================================================
        // SENARYO 2: 30 SANİYELİK EPİK TANRI AKSİYONU (COMBAT HYPE)
        // =====================================================================
        playGodHype30s(camera, player, t, delta, elapsed) {
            const px = player ? player.root.position.x : 0;
            const py = player ? player.root.position.y : 0;
            const pz = player ? player.root.position.z : 0;

            if (t < 8.0) {
                this.triggerShotCut(1, 'braam');
                this.updateTitle('✦ İLAHİ SAVAŞA HAZIRLAN ✦', 'Tanrıların Gazabı Mısır\'ın Üzerinde', 'Kılıç Çekiş Açısı');

                camera.position.set(px + 2.2, py + 0.65, pz + 3.2);
                camera.lookAt(px, py + 1.8, pz);
                camera.rotation.z = 0.06;
                camera.fov = 44;
                camera.updateProjectionMatrix();

            } else if (t < 18.0) {
                this.triggerShotCut(2, 'clash');
                this.updateTitle('✦ HIZLI KOMBO SALDIRILARI ✦', 'Gerçek Zamanlı Hack & Slash Aksiyon', 'Aksiyon Kamerası');
                
                if (player && window.EgyptCombatEngine) {
                    if (Math.floor(t * 2.5) !== Math.floor((t - delta) * 2.5)) {
                        window.EgyptCombatEngine.performAttack();
                        this.audio.playClash();
                        this.shakeTrauma = 0.22;
                    }
                }

                const ang = t * 3.5;
                camera.position.set(px + Math.sin(ang) * 4.2, py + 1.8, pz + Math.cos(ang) * 4.2);
                camera.lookAt(px, py + 1.5, pz);
                camera.fov = 54;
                camera.updateProjectionMatrix();

            } else {
                this.triggerShotCut(3, 'impact');
                this.updateTitle('✦ MISIR\'IN KADERİNİ BELİRLE ✦', 'Tanrı Katına Yüksel ve Hükmet', 'Yıkıcı Darbe Finali');
                
                const prog = (t - 18.0) / 12.0;
                camera.position.set(px, py + 1.2 + prog * 4.5, pz + 6.5 + prog * 8.0);
                camera.lookAt(px, py + 2.2, pz);
                camera.fov = 60;
                camera.updateProjectionMatrix();
            }
        }

        // =====================================================================
        // SENARYO 3: 35 SANİYELİK NİL & DOĞA HARİKALARI (AESTHETIC REEL)
        // =====================================================================
        playNileNature35s(camera, player, t, delta, elapsed) {
            if (t < 12.0) {
                this.triggerShotCut(1, 'whoosh');
                this.updateTitle('✦ ALTIN BUĞDAY DENİZİ ✦', 'Rüzgarla Dalgalanan Antik Emmer Tarlaları', 'Buğday Üstü Dolly');
                
                const prog = t / 12.0;
                const wz = THREE.MathUtils.lerp(-120, 100, prog);

                camera.position.set(16.5, 1.45, wz);
                camera.lookAt(18.0, 1.25, wz + 22.0);
                camera.fov = 48;
                camera.updateProjectionMatrix();

            } else if (t < 24.0) {
                this.triggerShotCut(2, 'whoosh');
                this.updateTitle('✦ KUTSAL NİL NEHRİ ✦', 'Güneş Kırılma Kostikleri & Mavi Nilüferler', 'Su Seviyesi Akışı');
                
                const prog = (t - 12.0) / 12.0;
                const rz = THREE.MathUtils.lerp(-150, 60, prog);

                camera.position.set(31.8, 0.45, rz);
                camera.lookAt(32.5, 0.15, rz + 18.0);
                camera.fov = 52;
                camera.updateProjectionMatrix();

            } else {
                this.triggerShotCut(3, 'braam');
                this.updateTitle('✦ GÜNEŞ TANRISI RA\'NIN DİYARI ✦', 'Büyüleyici Mısır Günbatımı', 'Piramit Silüeti');
                
                const prog = (t - 24.0) / 11.0;
                camera.position.set(-65, 12.0 + prog * 15, -45);
                camera.lookAt(57, 1.0, 0);
                camera.fov = 65;
                camera.updateProjectionMatrix();
            }
        }

        // =====================================================================
        // SENARYO 4: 30 SANİYELİK 1. ŞAHIS POV KEŞİF
        // =====================================================================
        playFirstPerson30s(camera, player, t, delta, elapsed) {
            const px = player ? player.root.position.x : 0;
            const py = player ? player.root.position.y : 0;
            const pz = player ? player.root.position.z : 0;

            this.triggerShotCut(1, 'whoosh');
            this.updateTitle('✦ BİR ÖLÜMLÜNÜN GÖZÜNDEN ✦', '1. Şahıs (FPV) Açık Dünya Macerası', 'Sokak Yürüyüşü');
            
            if (player) {
                player.root.position.z += delta * 4.2;
                if (window.EgyptCharacterEngine) {
                    window.EgyptCharacterEngine.animateEgyptCharacter(player, true, 1.0, delta, elapsed);
                }
            }

            const bobY = Math.sin(t * 8.5) * 0.05;
            const bobX = Math.cos(t * 4.2) * 0.03;

            camera.position.set(px + bobX, py + 1.62 + bobY, pz);
            camera.lookAt(px + bobX, py + 1.62 + bobY, pz + 30.0);
            camera.fov = 72;
            camera.updateProjectionMatrix();
        }

        // =====================================================================
        // SENARYO 5: 30 SANİYELİK TİKTOK & ŞAHİN DRONE VİRAL ÇEKİMİ
        // =====================================================================
        playDroneFlyby30s(camera, player, t, delta, elapsed) {
            this.triggerShotCut(1, 'braam');
            this.updateTitle('✦ HORUS\'UN GÖZÜ ✦', 'Yüksek İrtifa Şahin Uçuşu & Devasa Şehir', 'Yüksek Hızlı Drone');
            
            const prog = t / 30.0;
            const ang = prog * Math.PI * 2.5;

            const radius = 95.0;
            const camX = 20 + Math.cos(ang) * radius;
            const camZ = Math.sin(ang) * radius;
            const camY = 32.0 + Math.sin(prog * 5.0) * 12.0;

            camera.position.set(camX, camY, camZ);
            camera.lookAt(20, 2.0, 0);
            camera.fov = 68;
            camera.updateProjectionMatrix();
        }

        // =====================================================================
        // GÜVENLİ KAMERA KUTUSU: ÇAKIŞMA / İÇ İÇE GİRME / AŞIRI YAKINLAŞMA ÖNLENİR
        // =====================================================================
        safeFrameCamera(camera, desiredPos, lookAtPos, player, options = {}) {
            if (!camera) return;
            const minDistance = options.minDistance ?? 2.2;
            const maxHeight = options.maxHeight ?? 90;
            const safePos = desiredPos.clone();

            if (player && player.root) {
                const bodyCenter = new THREE.Vector3(
                    player.root.position.x,
                    player.root.position.y + (player.root.scale ? player.root.scale.y * 0.75 : 0.75),
                    player.root.position.z
                );
                const toCam = safePos.clone().sub(bodyCenter);
                const guardRadius = Math.max(minDistance, (player.root.scale ? player.root.scale.x : 1.0) * 1.25);
                if (toCam.length() < guardRadius) {
                    toCam.setLength(guardRadius);
                    safePos.copy(bodyCenter.clone().add(toCam));
                }
                safePos.y = Math.max(player.root.position.y + 0.35, Math.min(maxHeight, safePos.y));
            }

            if (!this.lastCinePos) this.lastCinePos = safePos.clone();
            if (!this.lastCineLook) this.lastCineLook = lookAtPos.clone();

            this.lastCinePos.lerp(safePos, 0.12);
            this.lastCineLook.lerp(lookAtPos, 0.18);

            camera.position.copy(this.lastCinePos);
            camera.lookAt(this.lastCineLook);
        }

        // =====================================================================
        // BAŞLIK KARTI YÖNETİMİ
        // =====================================================================
        updateTitle(main, sub, shot) {
            if (this.dom.shotName && shot) {
                this.dom.shotName.textContent = shot;
            }

            if (!this.showTitles) {
                if (this.dom.titleCard) this.dom.titleCard.style.opacity = '0';
                return;
            }

            if (this.lastTitle !== main) {
                this.lastTitle = main;
                if (this.dom.mainTitle) this.dom.mainTitle.textContent = main;
                if (this.dom.subTitle) this.dom.subTitle.textContent = sub;
                if (this.dom.titleCard) {
                    this.dom.titleCard.style.opacity = '1';
                    this.dom.titleCard.style.transform = 'translate(-50%, 0)';
                }
            }
        }
    }

    // Singleton Örneğini Pencereye Ata
    window.EgyptCinematicStudio = new EgyptCinematicStudio();

    // Global Kolay Arayüz Çağrısı
    window.openCinematicStudio = function() {
        if (window.EgyptCinematicStudio) {
            window.EgyptCinematicStudio.openStudioModal();
        } else {
            console.warn('Cinematic Studio yükleniyor...');
        }
    };

})(window);
