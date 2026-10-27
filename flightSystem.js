/**
 * Gods of Egypt MMORPG - Ultra 3D Divine Flight & Ra's Celestial Sun Barque Engine (flightSystem.js)
 * Tamamen Bağımsız, Çakışmasız, Gerçekçi Uçuş Fiziği ve Animasyonu:
 * 1. Doğrudan Baktığın Yöne Uçuş (Kafanı göğe/Ra'nın gemisine çevirip W'ye bastığında doğrudan göğe uçar!).
 * 2. 6-DOF Aerodinamik Uçuş (W: İleri/Baktığın Yön, S: Geri, A/D: Sağa-Sola Süzülüş & Bank Roll, Space: Yüksel, C: Alçal, Shift: 75m/s Boost).
 * 3. Bağımsız Klavye & Dokunmatik Dinleyicisi (HTML içi değişken bağımlılığı yok, F tuşu sadece uçuşu açar/kapatır).
 * 4. Ultra Gerçekçi Tanrı Uçuş Pozu (Omurga öne yatar, bacaklar geriye uzatılır, kollar rüzgarı yönlendirir, kanatlar çırpar).
 * 5. Yüksek Stratosferde (Y: 195m) Süzülen 88m Ra'nın Güneş Gemisi, İniş Güvertesi ve Güneş Sunağı.
 * 6. Kanat Ucu Altın Vorteks Duman İzleri, Ses Duvarı Patlama Halkaları ve Yere İniş Krateri.
 * 7. Prosedürel Web Audio Rüzgar, Kanat Çırpışı ve Sonik Patlama Sentezleyicisi.
 */

(function(window) {
    'use strict';

    // =========================================================================
    // 1. PROSEDÜREL HOLLYWOOD UÇUŞ SES SENTEZLEYİCİSİ (WEB AUDIO API)
    // =========================================================================
    class FlightAudioSynthesizer {
        constructor() {
            this.ctx = null;
            this.windNode = null;
            this.windGain = null;
            this.windFilter = null;
            this.isPlayingWind = false;
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

        startWind() {
            this.init();
            if (!this.ctx || this.isPlayingWind) return;

            const bufferSize = this.ctx.sampleRate * 2;
            const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
            const data = buffer.getChannelData(0);
            for (let i = 0; i < bufferSize; i++) {
                data[i] = (Math.random() * 2 - 1) * 0.5;
            }

            this.windNode = this.ctx.createBufferSource();
            this.windNode.buffer = buffer;
            this.windNode.loop = true;

            this.windFilter = this.ctx.createBiquadFilter();
            this.windFilter.type = 'lowpass';
            this.windFilter.frequency.setValueAtTime(320, this.ctx.currentTime);

            this.windGain = this.ctx.createGain();
            this.windGain.gain.setValueAtTime(0.001, this.ctx.currentTime);
            this.windGain.gain.linearRampToValueAtTime(0.20, this.ctx.currentTime + 1.0);

            this.windNode.connect(this.windFilter);
            this.windFilter.connect(this.windGain);
            this.windGain.connect(this.ctx.destination);

            this.windNode.start();
            this.isPlayingWind = true;
        }

        updateWind(speedRatio) {
            if (!this.isPlayingWind || !this.windFilter || !this.windGain || !this.ctx) return;
            const targetFreq = 280 + speedRatio * 3400;
            const targetGain = 0.08 + speedRatio * 0.45;
            this.windFilter.frequency.setTargetAtTime(targetFreq, this.ctx.currentTime, 0.15);
            this.windGain.gain.setTargetAtTime(targetGain, this.ctx.currentTime, 0.15);
        }

        stopWind() {
            if (!this.isPlayingWind || !this.windGain || !this.ctx) return;
            this.windGain.gain.linearRampToValueAtTime(0.001, this.ctx.currentTime + 0.5);
            setTimeout(() => {
                if (this.windNode) {
                    try { this.windNode.stop(); } catch(e){}
                    this.windNode = null;
                }
                this.isPlayingWind = false;
            }, 600);
        }

        playFlap() {
            this.init();
            if (!this.ctx) return;
            const now = this.ctx.currentTime;
            const osc = this.ctx.createOscillator();
            osc.type = 'sine';
            osc.frequency.setValueAtTime(95, now);
            osc.frequency.exponentialRampToValueAtTime(35, now + 0.32);

            const gain = this.ctx.createGain();
            gain.gain.setValueAtTime(0.5, now);
            gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

            osc.connect(gain);
            gain.connect(this.ctx.destination);
            osc.start(now);
            osc.stop(now + 0.36);
        }

        playSonicBoom() {
            this.init();
            if (!this.ctx) return;
            const now = this.ctx.currentTime;
            const osc = this.ctx.createOscillator();
            osc.type = 'sawtooth';
            osc.frequency.setValueAtTime(140, now);
            osc.frequency.exponentialRampToValueAtTime(24, now + 0.85);

            const filter = this.ctx.createBiquadFilter();
            filter.type = 'lowpass';
            filter.frequency.setValueAtTime(2000, now);
            filter.frequency.exponentialRampToValueAtTime(110, now + 0.85);

            const gain = this.ctx.createGain();
            gain.gain.setValueAtTime(0.9, now);
            gain.gain.exponentialRampToValueAtTime(0.001, now + 1.2);

            osc.connect(filter);
            filter.connect(gain);
            gain.connect(this.ctx.destination);
            osc.start(now);
            osc.stop(now + 1.25);
        }

        playLandingImpact() {
            this.init();
            if (!this.ctx) return;
            const now = this.ctx.currentTime;
            const osc = this.ctx.createOscillator();
            osc.type = 'triangle';
            osc.frequency.setValueAtTime(130, now);
            osc.frequency.exponentialRampToValueAtTime(28, now + 0.65);

            const gain = this.ctx.createGain();
            gain.gain.setValueAtTime(0.95, now);
            gain.gain.exponentialRampToValueAtTime(0.001, now + 0.7);

            osc.connect(gain);
            gain.connect(this.ctx.destination);
            osc.start(now);
            osc.stop(now + 0.75);
        }

        playSolarBlessing() {
            this.init();
            if (!this.ctx) return;
            const now = this.ctx.currentTime;
            [220, 277.18, 329.63, 440, 554.37].forEach((f, idx) => {
                const osc = this.ctx.createOscillator();
                osc.type = 'sine';
                osc.frequency.setValueAtTime(f, now);

                const gain = this.ctx.createGain();
                gain.gain.setValueAtTime(0.001, now);
                gain.gain.linearRampToValueAtTime(0.12, now + 0.3 + idx * 0.1);
                gain.gain.exponentialRampToValueAtTime(0.001, now + 2.8);

                osc.connect(gain);
                gain.connect(this.ctx.destination);
                osc.start(now);
                osc.stop(now + 3.0);
            });
        }
    }

    // =========================================================================
    // 2. EGYPT FLIGHT ENGINE (ANA İLAHİ UÇUŞ MOTORU)
    // =========================================================================
    class EgyptFlightEngine {
        constructor() {
            this.isFlying = false;
            this.flySpeed = 38.0;         // Normal süzülüş hızı (m/s)
            this.boostSpeed = 78.0;       // Süpersonik hız (m/s)
            this.ascendSpeed = 26.0;      // Gökyüzüne tırmanış hızı (m/s)
            this.descendSpeed = 26.0;     // Alçalış / pike hızı (m/s)

            this.pitch = 0.0;
            this.roll = 0.0;
            this.targetRoll = 0.0;
            this.isBoosting = false;

            // Dahili Güvenilir Klavye Takipçisi (Harici değişkenlere bağımlı değil!)
            this.activeKeys = {
                w: false, a: false, s: false, d: false,
                space: false, shift: false, c: false,
                ascend: false, descend: false, boost: false
            };

            // Mobil Joystick Girişi
            this.mobileVector = { x: 0, y: 0 };

            // Çift Space Zamanlayıcısı
            this.lastSpaceTime = 0;

            // Ra'nın Güneş Gemisi Referansı
            this.raBarque = null;
            this.blessingCooldown = 0;

            // Ses Motoru
            this.audio = new FlightAudioSynthesizer();

            // Parçacıklar & Efektler
            this.trailParticles = null;
            this.trailData = [];
            this.shockwaveRings = [];
            this.etherealWings = null;

            this.init();
        }

        init() {
            this.bindKeyboard();
            this.createMobileFlightUI();
        }

        // Aktif Oyuncu Referansını Bul (misir.html, karaktertanrilar.html vb. her yerde çalışır)
        getPlayer() {
            if (window.player && window.player.root) return window.player;
            if (this.lastActivePlayer && this.lastActivePlayer.root) return this.lastActivePlayer;
            if (window.characters && window.activeIndex !== undefined && window.characters[window.activeIndex]) {
                return window.characters[window.activeIndex];
            }
            if (window.characters && window.characters.length > 0) {
                return window.characters[0];
            }
            return null;
        }

        // =====================================================================
        // %100 BAĞIMSIZ GÜVENİLİR KLAVYE DİNLEYİCİSİ
        // =====================================================================
        bindKeyboard() {
            window.addEventListener('keydown', (e) => {
                const isInput = document.activeElement && (
                    document.activeElement.tagName === 'INPUT' || 
                    document.activeElement.tagName === 'TEXTAREA'
                );
                if (isInput) return;

                const key = e.key.toLowerCase();

                // F veya G: Sadece ve sadece uçuşu aç/kapat!
                if ((key === 'f' || key === 'g') && !e.repeat) {
                    this.toggleFlight();
                    return;
                }

                if (key === 'w' || e.code === 'ArrowUp') this.activeKeys.w = true;
                if (key === 's' || e.code === 'ArrowDown') this.activeKeys.s = true;
                if (key === 'a' || e.code === 'ArrowLeft') this.activeKeys.a = true;
                if (key === 'd' || e.code === 'ArrowRight') this.activeKeys.d = true;

                if (e.code === 'Space') {
                    const now = performance.now();
                    if (!this.isFlying && (now - this.lastSpaceTime < 380)) {
                        this.startFlight();
                    }
                    this.lastSpaceTime = now;
                    this.activeKeys.space = true;
                    this.activeKeys.ascend = true;
                }

                if (e.key === 'Shift') {
                    this.activeKeys.shift = true;
                    this.activeKeys.boost = true;
                }

                if (key === 'c') {
                    this.activeKeys.c = true;
                    this.activeKeys.descend = true;
                }
            });

            window.addEventListener('keyup', (e) => {
                const key = e.key.toLowerCase();
                if (key === 'w' || e.code === 'ArrowUp') this.activeKeys.w = false;
                if (key === 's' || e.code === 'ArrowDown') this.activeKeys.s = false;
                if (key === 'a' || e.code === 'ArrowLeft') this.activeKeys.a = false;
                if (key === 'd' || e.code === 'ArrowRight') this.activeKeys.d = false;
                if (e.code === 'Space') {
                    this.activeKeys.space = false;
                    this.activeKeys.ascend = false;
                }
                if (e.key === 'Shift') {
                    this.activeKeys.shift = false;
                    this.activeKeys.boost = false;
                }
                if (key === 'c') {
                    this.activeKeys.c = false;
                    this.activeKeys.descend = false;
                }
            });
        }

        // =====================================================================
        // MOBİL UÇUŞ BUTONLARI (▲ YÜKSEL, ▼ ALÇAL, ⚡ BOOST)
        // =====================================================================
        createMobileFlightUI() {
            if (!document.body) {
                if (document.readyState === 'loading') {
                    document.addEventListener('DOMContentLoaded', () => this.createMobileFlightUI());
                } else {
                    setTimeout(() => this.createMobileFlightUI(), 50);
                }
                return;
            }
            if (document.getElementById('mobile-flight-controls')) return;

            const container = document.createElement('div');
            container.id = 'mobile-flight-controls';
            container.className = 'fixed right-6 bottom-28 flex flex-col gap-3 z-30 pointer-events-auto select-none';
            container.style.display = 'none';

            container.innerHTML = `
                <!-- YÜKSEL BUTONU -->
                <button id="btn-flight-ascend" class="w-14 h-14 rounded-2xl bg-gradient-to-t from-amber-600 via-amber-500 to-yellow-300 border-2 border-white/90 shadow-[0_0_25px_rgba(245,158,11,0.8)] flex flex-col items-center justify-center text-black font-black active:scale-90 transition-transform">
                    <span class="text-xl leading-none">▲</span>
                    <span class="text-[9px] font-black tracking-tighter">YÜKSEL</span>
                </button>

                <!-- BOOST BUTONU -->
                <button id="btn-flight-boost" class="w-14 h-14 rounded-2xl bg-gradient-to-t from-red-600 via-rose-500 to-amber-300 border-2 border-white/90 shadow-[0_0_25px_rgba(239,68,68,0.8)] flex flex-col items-center justify-center text-white font-black active:scale-90 transition-transform">
                    <span class="text-lg leading-none">⚡</span>
                    <span class="text-[9px] font-black tracking-tighter">BOOST</span>
                </button>

                <!-- ALÇAL / İN BUTONU -->
                <button id="btn-flight-descend" class="w-14 h-14 rounded-2xl bg-gradient-to-t from-stone-800 via-stone-700 to-amber-700 border-2 border-amber-400/80 shadow-2xl flex flex-col items-center justify-center text-amber-200 font-black active:scale-90 transition-transform">
                    <span class="text-xl leading-none">▼</span>
                    <span class="text-[9px] font-black tracking-tighter">ALÇAL</span>
                </button>
            `;

            document.body.appendChild(container);

            const bindBtn = (id, keyName) => {
                const btn = document.getElementById(id);
                if (!btn) return;
                const press = (e) => { e.preventDefault(); this.activeKeys[keyName] = true; };
                const release = (e) => { e.preventDefault(); this.activeKeys[keyName] = false; };
                btn.addEventListener('touchstart', press, { passive: false });
                btn.addEventListener('touchend', release, { passive: false });
                btn.addEventListener('mousedown', press);
                btn.addEventListener('mouseup', release);
                btn.addEventListener('mouseleave', release);
            };

            bindBtn('btn-flight-ascend', 'ascend');
            bindBtn('btn-flight-descend', 'descend');
            bindBtn('btn-flight-boost', 'boost');
        }

        // =====================================================================
        // UÇUŞU BAŞLATMA / DURDURMA MANTIĞI
        // =====================================================================
        toggleFlight() {
            const now = performance.now();
            if (this.lastToggleTime && (now - this.lastToggleTime < 350)) {
                return; // 350ms debounce guard (çift tetiklenmeyi engeller)
            }
            this.lastToggleTime = now;

            if (this.isFlying) {
                this.stopFlight('İlahi uçuş sonlandırıldı.');
            } else {
                this.startFlight();
            }
        }

        startFlight() {
            let player = this.getPlayer();
            if (!player || !player.root) {
                if (this.lastActivePlayer && this.lastActivePlayer.root) player = this.lastActivePlayer;
                else if (window.characters && window.characters.length > 0) player = window.characters[window.activeIndex || 0];
            }
            if (!player || !player.root) {
                console.warn('Uçuş başlatılamadı: Oyuncu modeli bulunamadı.');
                return;
            }
            this.lastActivePlayer = player;
            window.player = player;

            this.isFlying = true;
            this.takeoffGraceTimer = 2.0; // İlk 2 saniye iniş tetiklenemez
            player.root.position.y += 5.5; // Güvenli şekilde yerden yüksel

            // Kanat donanımını kontrol et (Ölümlü formdaysa altın kanat ekle)
            this.ensurePlayerWings(player);

            // Sesler & Şok Dalgaları
            this.audio.playFlap();
            this.audio.playSonicBoom();
            this.audio.startWind();

            this.spawnShockwave(player.root.position.x, player.root.position.y, player.root.position.z, 0xfde047);
            this.updateFlightUI(true);

            if (window.GameHUD) {
                window.GameHUD.showToast(`🦅 İLAHİ TANRI UÇUŞU AKTİF! [W] Baktığın Yöne Uç • [Space] Yüksel • [Shift] 78m/s Boost!`, 'gold');
            }
        }

        stopFlight(reason) {
            this.isFlying = false;
            this.audio.stopWind();
            this.updateFlightUI(false);

            const player = this.getPlayer();
            if (player && player.root) {
                player.root.rotation.z = 0;
                player.root.rotation.x = 0;
                if (player.spine) player.spine.rotation.x = 0;
            }

            if (window.GameHUD && reason) {
                window.GameHUD.showToast(`🛑 ${reason}`, 'system');
            }
        }

        updateFlightUI(active) {
            const mobUI = document.getElementById('mobile-flight-controls');
            if (mobUI) mobUI.style.display = active ? 'flex' : 'none';

            const hudBtn = document.getElementById('hud-flight-btn');
            const hudLabel = document.getElementById('flight-label');
            if (hudBtn && hudLabel) {
                if (active) {
                    hudBtn.classList.add('border-yellow-300', 'bg-amber-500/40', 'animate-pulse');
                    hudLabel.textContent = '[F] UÇUYORSUN';
                } else {
                    hudBtn.classList.remove('border-yellow-300', 'bg-amber-500/40', 'animate-pulse');
                    hudLabel.textContent = '[F] UÇUŞ';
                }
            }
        }

        ensurePlayerWings(player) {
            if (!player || player.wings) return;

            if (!this.etherealWings && window.scene) {
                const wingGroup = new THREE.Group();
                const wingMat = new THREE.MeshStandardMaterial({
                    color: 0xfef08a,
                    emissive: 0xf59e0b,
                    emissiveIntensity: 0.9,
                    metalness: 0.9,
                    roughness: 0.15,
                    transparent: true,
                    opacity: 0.88,
                    side: THREE.DoubleSide
                });

                [-1, 1].forEach(side => {
                    const wPivot = new THREE.Group();
                    wPivot.position.set(side * 0.28, 0.25, -0.15);

                    for (let f = 0; f < 8; f++) {
                        const len = 1.3 + f * 0.35;
                        const featherGeo = new THREE.ConeGeometry(0.08, len, 4);
                        featherGeo.scale(1.4, 1.0, 0.2);
                        featherGeo.rotateZ(-side * (0.45 + f * 0.14));
                        featherGeo.translate(side * len * 0.45, len * 0.35, -f * 0.04);
                        const m = new THREE.Mesh(featherGeo, wingMat);
                        wPivot.add(m);
                    }
                    wingGroup.add(wPivot);
                });

                if (player.torso) {
                    player.torso.add(wingGroup);
                } else if (player.root) {
                    wingGroup.position.y = 1.2;
                    player.root.add(wingGroup);
                }
                this.etherealWings = wingGroup;
            }
        }

        spawnShockwave(x, y, z, color = 0xfde047) {
            if (!window.scene) return;
            const geo = new THREE.TorusGeometry(1.2, 0.22, 8, 24);
            geo.rotateX(Math.PI / 2);
            const mat = new THREE.MeshBasicMaterial({
                color: color,
                transparent: true,
                opacity: 0.95,
                blending: THREE.AdditiveBlending,
                depthWrite: false
            });
            const ring = new THREE.Mesh(geo, mat);
            ring.position.set(x, y + 0.15, z);
            window.scene.add(ring);

            this.shockwaveRings.push({
                mesh: ring,
                scale: 1.0,
                opacity: 0.95
            });
        }

        initTrailParticles(scene) {
            if (this.trailParticles || !scene) return;

            const count = 180;
            const geo = new THREE.BufferGeometry();
            const pos = new Float32Array(count * 3);
            const colors = new Float32Array(count * 3);

            for (let i = 0; i < count; i++) {
                pos[i * 3] = 0; pos[i * 3 + 1] = -500; pos[i * 3 + 2] = 0;
                colors[i * 3] = 1.0;
                colors[i * 3 + 1] = 0.85;
                colors[i * 3 + 2] = 0.25;
                this.trailData.push({ x: 0, y: -500, z: 0, alpha: 0, life: 0 });
            }

            geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
            geo.setAttribute('color', new THREE.BufferAttribute(colors, 3));

            const mat = new THREE.PointsMaterial({
                size: 2.8,
                vertexColors: true,
                transparent: true,
                opacity: 0.85,
                blending: THREE.AdditiveBlending,
                depthWrite: false
            });

            this.trailParticles = new THREE.Points(geo, mat);
            scene.add(this.trailParticles);
        }

        emitWingtipTrails(player) {
            if (!this.trailParticles || !player || !player.root) return;

            const px = player.root.position.x;
            const py = player.root.position.y + 1.4;
            const pz = player.root.position.z;
            const rotY = player.root.rotation.y;

            const wingSpan = (player.scale || 2.0) * 1.8;
            const cosY = Math.cos(rotY);
            const sinY = Math.sin(rotY);

            const leftX = px - cosY * wingSpan;
            const leftZ = pz + sinY * wingSpan;
            const rightX = px + cosY * wingSpan;
            const rightZ = pz - sinY * wingSpan;

            for (let k = 0; k < 2; k++) {
                const targetX = k === 0 ? leftX : rightX;
                const targetZ = k === 0 ? leftZ : rightZ;
                for (let i = 0; i < this.trailData.length; i++) {
                    const p = this.trailData[i];
                    if (p.life <= 0) {
                        p.x = targetX + (Math.random() - 0.5) * 0.2;
                        p.y = py + (Math.random() - 0.5) * 0.2;
                        p.z = targetZ + (Math.random() - 0.5) * 0.2;
                        p.alpha = 0.95;
                        p.life = 1.0;
                        break;
                    }
                }
            }

            const posAttr = this.trailParticles.geometry.attributes.position;
            for (let i = 0; i < this.trailData.length; i++) {
                const p = this.trailData[i];
                if (p.life > 0) {
                    p.life -= 0.025;
                    p.y += 0.04;
                    posAttr.setXYZ(i, p.x, p.y, p.z);
                } else {
                    posAttr.setXYZ(i, 0, -500, 0);
                }
            }
            posAttr.needsUpdate = true;
        }

        // =====================================================================
        // 3. GÖKYÜZÜNDE SÜZÜLEN DEVAZ RA'NIN GÜNEŞ GEMİSİ (SOLAR SUN BARQUE)
        // =====================================================================
        spawnRaSolarBarque(scene) {
            if (this.raBarque || !scene) return;

            const barqueGroup = new THREE.Group();
            barqueGroup.name = "Celestial_Ra_Sun_Barque";
            barqueGroup.position.set(35, 195, -45);
            barqueGroup.scale.setScalar(1.0);

            const goldMat = new THREE.MeshStandardMaterial({
                color: 0xf59e0b,
                emissive: 0x78350f,
                emissiveIntensity: 0.35,
                metalness: 0.92,
                roughness: 0.18,
                fog: false
            });

            const obsidianMat = new THREE.MeshStandardMaterial({
                color: 0x090d16,
                metalness: 0.85,
                roughness: 0.2,
                fog: false
            });

            const plasmaMat = new THREE.MeshBasicMaterial({
                color: 0xfffbeb,
                fog: false
            });

            // 1. Ana Gövde (88m Altın Omurga)
            const hullGeo = new THREE.BoxGeometry(19.5, 5.0, 88.0, 12, 4, 24);
            const hPos = hullGeo.attributes.position;
            for (let i = 0; i < hPos.count; i++) {
                const vx = hPos.getX(i), vy = hPos.getY(i), vz = hPos.getZ(i);
                const zn = Math.abs(vz) / 44.0;
                const taper = Math.max(0.28, 1.0 - Math.pow(zn, 2.0) * 0.65);
                const sheer = Math.pow(zn, 2.2) * 1.8;
                hPos.setXYZ(i, vx * taper, vy + sheer, vz);
            }
            hullGeo.computeVertexNormals();
            const hullMesh = new THREE.Mesh(hullGeo, goldMat);
            hullMesh.position.y = -2.5;
            barqueGroup.add(hullMesh);

            // 2. Yürünebilir Düz Altın Güverte
            const deckGeo = new THREE.BoxGeometry(18.0, 1.2, 86.0);
            const deckMesh = new THREE.Mesh(deckGeo, obsidianMat);
            deckMesh.position.y = 0.0;
            barqueGroup.add(deckMesh);

            // Baş Taraf Şahin Başı
            const prowNeck = new THREE.Mesh(new THREE.CylinderGeometry(1.6, 3.2, 16.0, 12), goldMat);
            prowNeck.position.set(0, 7.2, -49.0);
            prowNeck.rotation.x = -0.45;
            barqueGroup.add(prowNeck);

            const falconHead = new THREE.Mesh(new THREE.ConeGeometry(2.2, 6.5, 8), goldMat);
            falconHead.position.set(0, 13.5, -54.0);
            falconHead.rotation.x = -Math.PI * 0.65;
            barqueGroup.add(falconHead);

            // Kıç Taraf Güneş Çapası
            const sternRing = new THREE.Mesh(new THREE.TorusGeometry(3.2, 0.65, 8, 24), goldMat);
            sternRing.position.set(0, 5.5, 43.5);
            barqueGroup.add(sternRing);

            // Merkez Güneş Sunağı & Sütunlar
            const sanctumGroup = new THREE.Group();
            sanctumGroup.position.set(0, 1.0, 2.0);
            barqueGroup.add(sanctumGroup);

            [-4.8, 4.8].forEach(sx => {
                [-6, -2, 2, 6].forEach(sz => {
                    const col = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.65, 9.5, 12), goldMat);
                    col.position.set(sx, 4.75, sz);
                    sanctumGroup.add(col);
                });
            });

            const altar = new THREE.Mesh(new THREE.CylinderGeometry(2.2, 3.0, 1.8, 12), goldMat);
            altar.position.set(0, 0.9, 0);
            sanctumGroup.add(altar);

            const prayerCore = new THREE.Mesh(new THREE.OctahedronGeometry(1.6, 2), plasmaMat);
            prayerCore.position.set(0, 3.8, 0);
            sanctumGroup.add(prayerCore);

            const astrolabeRings = [];
            [2.6, 3.6, 4.6].forEach((r, idx) => {
                const ring = new THREE.Mesh(new THREE.TorusGeometry(r, 0.16, 8, 32), goldMat);
                ring.position.set(0, 3.8, 0);
                sanctumGroup.add(ring);
                astrolabeRings.push({ mesh: ring, speed: (idx % 2 === 0 ? 1 : -1) * (0.8 + idx * 0.4) });
            });

            // 8 Dev Şahin Kanadı
            const wingPivots = [];
            [-28, -10, 8, 26].forEach((wz, wIdx) => {
                [-1, 1].forEach(side => {
                    const wp = new THREE.Group();
                    wp.position.set(side * 9.5, 1.2, wz);
                    barqueGroup.add(wp);

                    for (let f = 0; f < 12; f++) {
                        const fLen = 12.0 + f * 1.4;
                        const fGeo = new THREE.ConeGeometry(0.75, fLen, 4);
                        fGeo.scale(1.4, 1.0, 0.18);
                        fGeo.rotateX(Math.PI / 2);
                        fGeo.translate(0, 0, fLen * 0.48);
                        const feather = new THREE.Mesh(fGeo, f % 3 === 0 ? plasmaMat : goldMat);
                        feather.position.set(side * (f * 0.8), 0, f * 0.35);
                        feather.rotation.y = side * (0.2 + f * 0.08);
                        wp.add(feather);
                    }
                    wingPivots.push({ pivot: wp, side, phase: wIdx * 0.8 });
                });
            });

            // Çekilen Güneş Topu & Korona
            const chainedSun = new THREE.Group();
            chainedSun.position.set(0, 16.0, 82.0);
            barqueGroup.add(chainedSun);

            const sunSphere = new THREE.Mesh(
                new THREE.SphereGeometry(16.0, 24, 24),
                new THREE.MeshBasicMaterial({ color: 0xfffbeb, fog: false })
            );
            chainedSun.add(sunSphere);

            const sunCorona = new THREE.Mesh(
                new THREE.RingGeometry(16.0, 48.0, 32),
                new THREE.MeshBasicMaterial({
                    color: 0xfde047,
                    transparent: true,
                    opacity: 0.65,
                    side: THREE.DoubleSide,
                    fog: false
                })
            );
            chainedSun.add(sunCorona);

            // Yeryüzüne Doğru İnen Işık Sütunu (Navigasyon Feneri)
            const beamGeo = new THREE.CylinderGeometry(1.5, 16.0, 240, 16, 1, true);
            beamGeo.translate(0, -120, 0);
            const beamMat = new THREE.MeshBasicMaterial({
                color: 0xfde047,
                transparent: true,
                opacity: 0.24,
                side: THREE.DoubleSide,
                depthWrite: false,
                fog: false
            });
            const lightBeam = new THREE.Mesh(beamGeo, beamMat);
            barqueGroup.add(lightBeam);

            scene.add(barqueGroup);

            this.raBarque = {
                group: barqueGroup,
                prayerCore,
                astrolabeRings,
                wingPivots,
                chainedSun,
                sunCorona,
                lightBeam
            };
        }

        checkBarqueInteractions(player, delta, elapsed) {
            if (!this.raBarque || !player || !player.root) return;

            const bg = this.raBarque.group;
            const px = player.root.position.x;
            const py = player.root.position.y;
            const pz = player.root.position.z;

            const relX = px - bg.position.x;
            const relY = py - bg.position.y;
            const relZ = pz - bg.position.z;

            const onDeckArea = Math.abs(relX) < 9.5 && Math.abs(relZ) < 43.0;
            const atDeckHeight = relY >= -0.3 && relY <= 3.5;

            if (onDeckArea && atDeckHeight) {
                if (this.isFlying && this.activeKeys.descend) {
                    this.stopFlight('Ra\'nın Güneş Gemisi Güvertesine Başarıyla İndin!');
                    player.root.position.y = bg.position.y + 0.6;
                } else if (!this.isFlying) {
                    player.root.position.y = bg.position.y + 0.6;
                }

                // Sunak Kutsaması
                const distToAltar = Math.hypot(relX, relZ - 2.0);
                if (distToAltar < 4.5) {
                    if (window.GameHUD) {
                        window.GameHUD.updateContextAction('RA\'NIN İLAHİ KUTSAMASINI AL', 'sparkle');
                    }
                    if (this.blessingCooldown > 0) this.blessingCooldown -= delta;

                    // E Tuşu
                    if (this.activeKeys.e || (window.keys && window.keys.e)) {
                        if (this.blessingCooldown <= 0) {
                            this.blessingCooldown = 8.0;
                            this.audio.playSolarBlessing();

                            if (window.GameState) {
                                window.GameState.state.player.hp = window.GameState.state.player.maxHp;
                                window.GameState.state.player.energy = window.GameState.state.player.maxEnergy;
                                window.GameState.addResource('golden_blood', 5);
                                window.GameState.gainExp(150);
                            }
                            if (window.GameHUD) {
                                window.GameHUD.showToast('☀️ GÜNEŞ TANRISI RA SENİ KUTSADI! +5 Altın Kan • Can ve Enerji Fullendi • İlahi Uçuş Hızı Arttı!', 'gold');
                            }
                            this.spawnShockwave(px, py, pz, 0xfffbeb);
                        }
                    }
                }

                // Uzay Portalı
                const distToSpaceGate = Math.hypot(relX, relZ - 43.5);
                if (distToSpaceGate < 4.5) {
                    if (window.GameHUD) {
                        window.GameHUD.updateContextAction('UZAY BOYUTUNA VE APOPHIS SAVAŞINA GİR', 'sparkle');
                    }
                    if (this.activeKeys.e || (window.keys && window.keys.e)) {
                        if (window.GameState) {
                            window.GameState.teleportTo('raningemisi.html');
                        } else {
                            window.location.href = 'raningemisi.html';
                        }
                    }
                }
            }
        }

        // =====================================================================
        // %100 GERÇEKÇİ 3 BOYUTLU UÇUŞ HAREKETİ VE ANİMASYON MOTORU
        // =====================================================================
        update(playerParam, delta, elapsed, cameraParam) {
            const player = playerParam || this.getPlayer();
            if (!player || !player.root) return;
            this.lastActivePlayer = player;
            if (!window.player) window.player = player;
            const camera = cameraParam || window.camera;

            // Ra'nın Gemisi Animasyonu
            if (this.raBarque) {
                const b = this.raBarque;
                b.group.position.x = 35 + Math.sin(elapsed * 0.15) * 25.0;
                b.group.position.z = -45 + Math.cos(elapsed * 0.12) * 20.0;
                b.group.position.y = 195 + Math.sin(elapsed * 0.4) * 2.5;

                b.astrolabeRings.forEach(ar => {
                    ar.mesh.rotation.x += delta * ar.speed;
                    ar.mesh.rotation.y += delta * (ar.speed * 0.7);
                });

                b.prayerCore.rotation.y += delta * 1.4;
                b.prayerCore.scale.setScalar(1.0 + Math.sin(elapsed * 4.0) * 0.12);

                b.wingPivots.forEach(w => {
                    const flap = Math.sin(elapsed * 1.4 + w.phase) * 0.24;
                    w.pivot.rotation.z = w.side * flap;
                });

                b.sunCorona.rotation.z += delta * 0.35;
                this.checkBarqueInteractions(player, delta, elapsed);
            }

            // Şok Halkaları
            for (let i = this.shockwaveRings.length - 1; i >= 0; i--) {
                const s = this.shockwaveRings[i];
                s.scale += delta * 18.0;
                s.opacity -= delta * 1.2;
                s.mesh.scale.set(s.scale, s.scale, s.scale);
                s.mesh.material.opacity = Math.max(0, s.opacity);
                if (s.opacity <= 0) {
                    if (window.scene) window.scene.remove(s.mesh);
                    this.shockwaveRings.splice(i, 1);
                }
            }

            // Uçuş aktif değilse devam etme
            if (!this.isFlying) return;

            // Zemin Yüksekliği
            let groundY = 0;
            if (window.EgyptCollisionEngine) {
                groundY = window.EgyptCollisionEngine.getSurfaceHeight(player.root.position.x, player.root.position.z);
            }

            // Girdi Değerleri
            let inputForward = 0; // W: +1 (Baktığın yöne uç), S: -1 (Geri uç)
            let inputStrafe = 0;  // D: +1 (Sağa süzül), A: -1 (Sola süzül)
            let inputLift = 0;    // Space: +1 (Dikey yüksel), C: -1 (Dikey alçal)

            if (this.activeKeys.w) inputForward += 1;
            if (this.activeKeys.s) inputForward -= 1;
            if (this.activeKeys.d) inputStrafe += 1;
            if (this.activeKeys.a) inputStrafe -= 1;

            if (this.activeKeys.space || this.activeKeys.ascend) inputLift += 1;
            if (this.activeKeys.c || this.activeKeys.descend) inputLift -= 1;

            // Mobil Joystick Entegrasyonu
            if (window.joyActive && window.joyVec) {
                inputStrafe += window.joyVec.x;
                inputForward -= window.joyVec.y; // joyVec.y < 0 ileri itildiğinde
            }

            // Kamera 3D Bakış Vektörü (Kafanı göğe/Ra'nın gemisine çevirdiğinde W seni doğrudan göğe uçurur!)
            const camFwd = new THREE.Vector3();
            if (camera && camera.getWorldDirection) {
                camera.getWorldDirection(camFwd);
            } else {
                const cyaw = (window.EgyptCameraSystem ? window.EgyptCameraSystem.camYaw : (window.camYaw || 0));
                const cpitch = (window.EgyptCameraSystem ? window.EgyptCameraSystem.camPitch : (window.camPitch || 0));
                camFwd.set(-Math.sin(cyaw) * Math.cos(cpitch), Math.sin(cpitch), -Math.cos(cyaw) * Math.cos(cpitch));
            }

            // Kamera Sağ Vektörü (Yatay kayma için)
            const camRight = new THREE.Vector3();
            camRight.crossVectors(camFwd, new THREE.Vector3(0, 1, 0)).normalize();
            if (camRight.lengthSq() < 0.001) {
                if (camera) {
                    camRight.set(1, 0, 0).applyQuaternion(camera.quaternion);
                    camRight.y = 0;
                    camRight.normalize();
                } else {
                    camRight.set(1, 0, 0);
                }
            }

            // 3D Uçuş Vektörünü Hesapla
            const moveVec = new THREE.Vector3(0, 0, 0);
            const hasDirectionalInput = (Math.abs(inputForward) > 0.05 || Math.abs(inputStrafe) > 0.05);

            if (hasDirectionalInput) {
                // W basıldığında: Kameranın baktığı 3D istikamete doğru uçar (Gökyüzü, dağ, piramit vb.)
                moveVec.addScaledVector(camFwd, inputForward);
                moveVec.addScaledVector(camRight, inputStrafe);
            }

            // Space (Yüksel) veya C (Alçal) ile bağımsız dikey yükseklik değişimi
            if (Math.abs(inputLift) > 0.05) {
                moveVec.y += inputLift * 1.35;
                if (inputLift > 0 && Math.random() < 0.08) this.audio.playFlap();
            }

            const inputMag = moveVec.length();
            const isMoving = inputMag > 0.05;

            // Hızlanma / Supersonic Boost (Shift tuşu veya mobil ⚡ BOOST butonu)
            this.isBoosting = (this.activeKeys.boost || this.activeKeys.shift) && isMoving;
            const currentSpeed = this.isBoosting ? this.boostSpeed : this.flySpeed;

            if (isMoving) {
                moveVec.normalize().multiplyScalar(currentSpeed);
            }

            // Pozisyon Güncellemesi
            player.root.position.x += moveVec.x * delta;
            player.root.position.y += moveVec.y * delta;
            player.root.position.z += moveVec.z * delta;

            // Hareketsizken Havada Ağırlıksız Süzülüş Dalgalanması (Buoyancy Floating)
            if (!isMoving) {
                player.root.position.y += Math.sin(elapsed * 2.6) * (0.018 * delta * 60);
            }

            // Yere İniş Kontrolü (Sadece C tuşuna veya ALÇAL butonuna basarak yere inildiğinde)
            if (this.takeoffGraceTimer > 0) {
                this.takeoffGraceTimer -= delta;
            } else if (player.root.position.y <= groundY + 0.35 && (this.activeKeys.descend || this.activeKeys.c)) {
                player.root.position.y = groundY;
                this.stopFlight('Yere Başarıyla İndin!');
                this.spawnShockwave(player.root.position.x, groundY, player.root.position.z, 0xf59e0b);
                this.audio.playLandingImpact();
                return;
            }

            // Karakter Yatay Yönü (Yaw)
            if (isMoving && (Math.abs(moveVec.x) > 0.1 || Math.abs(moveVec.z) > 0.1)) {
                const targetYaw = Math.atan2(moveVec.x, moveVec.z);
                let dYaw = targetYaw - player.root.rotation.y;
                while (dYaw > Math.PI) dYaw -= Math.PI * 2;
                while (dYaw < -Math.PI) dYaw += Math.PI * 2;
                player.root.rotation.y += dYaw * 0.20;

                // 6-DOF Aerodinamik Bank (Virajlarda yana yatış)
                const targetRoll = THREE.MathUtils.clamp(-dYaw * 2.8, -0.65, 0.65);
                this.roll = THREE.MathUtils.lerp(this.roll, targetRoll, 0.16);
            } else {
                this.roll = THREE.MathUtils.lerp(this.roll, 0.0, 0.15);
            }
            player.root.rotation.z = this.roll;

            // Pitch Eğimi (Yukarı tırmanışta burnu göğe kaldır, pike dalışında öne yatır)
            if (isMoving) {
                const horizSpeed = Math.hypot(moveVec.x, moveVec.z);
                const flightAngle = Math.atan2(moveVec.y, Math.max(0.1, horizSpeed));
                const targetPitch = -flightAngle * 0.75;
                this.pitch = THREE.MathUtils.lerp(this.pitch, targetPitch, 0.16);
            } else {
                this.pitch = THREE.MathUtils.lerp(this.pitch, 0.0, 0.15);
            }
            player.root.rotation.x = this.pitch;

            // Rüzgar Sesi Modülasyonu
            const totalSpeed = moveVec.length();
            this.audio.updateWind(totalSpeed / this.boostSpeed);

            // Kanat Ucu Vorteks Duman İzleri
            this.emitWingtipTrails(player);

            // Kamera FOV Dinamik Genişlemesi (Süpersonik Hız Hissi)
            if (camera) {
                const targetFov = this.isBoosting ? 66 : (isMoving ? 48 : 45);
                camera.fov = THREE.MathUtils.lerp(camera.fov, targetFov, 0.08);
                camera.updateProjectionMatrix();
            }

            // =================================================================
            // ULTRA-GERÇEKÇİ TANRI UÇUŞ POZU & BİYOMEKANİK KANAT ÇIRPIŞI
            // =================================================================
            // 1. Omurga ve Gövde (Rüzgar Tüneli / Aerodinamik Yatış)
            if (player.spine) {
                const forwardLean = isMoving ? (this.isBoosting ? -1.20 : -0.78) : -0.16;
                player.spine.rotation.x = THREE.MathUtils.lerp(player.spine.rotation.x, forwardLean, 0.18);
                player.spine.rotation.y = THREE.MathUtils.lerp(player.spine.rotation.y, 0, 0.18);
                player.spine.rotation.z = THREE.MathUtils.lerp(player.spine.rotation.z, 0, 0.18);
            }
            if (player.head) {
                // Kafa daima uçuş yönünü gözler (Çene yukarıda, bakışlar ileride)
                const headPitch = isMoving ? (this.isBoosting ? 0.88 : 0.65) : 0.12;
                player.head.rotation.x = THREE.MathUtils.lerp(player.head.rotation.x, headPitch, 0.18);
                player.head.rotation.y = THREE.MathUtils.lerp(player.head.rotation.y, 0, 0.18);
            }

            // 2. Bacaklar (Aerodinamik Olarak Geriye Uzatılmış Füze Formu)
            if (player.legs) {
                const legPitch = isMoving ? (this.isBoosting ? 0.88 : 0.72) : 0.22;
                player.legs.left.hip.rotation.x = THREE.MathUtils.lerp(player.legs.left.hip.rotation.x, legPitch, 0.18);
                player.legs.right.hip.rotation.x = THREE.MathUtils.lerp(player.legs.right.hip.rotation.x, legPitch, 0.18);
                player.legs.left.hip.rotation.z = THREE.MathUtils.lerp(player.legs.left.hip.rotation.z, -0.06, 0.18);
                player.legs.right.hip.rotation.z = THREE.MathUtils.lerp(player.legs.right.hip.rotation.z, 0.06, 0.18);

                const kneeFlutter = isMoving ? (this.isBoosting ? 0.02 : (0.10 + Math.sin(elapsed * 4.5) * 0.03)) : 0.16;
                if (player.legs.left.continuousLeg && player.legs.left.continuousLeg.updateBend) {
                    player.legs.left.continuousLeg.updateBend(kneeFlutter);
                    player.legs.right.continuousLeg.updateBend(kneeFlutter);
                } else if (player.legs.left.knee) {
                    player.legs.left.knee.rotation.x = -kneeFlutter;
                    player.legs.right.knee.rotation.x = -kneeFlutter;
                }
                if (player.legs.left.foot) player.legs.left.foot.rotation.x = 0.55;
                if (player.legs.right.foot) player.legs.right.foot.rotation.x = 0.55;
            }

            // 3. Kollar (Rüzgarı Yönlendiren Aerodinamik Kanatçıklar)
            if (player.arms) {
                const armX = isMoving ? (this.isBoosting ? -0.22 : -0.75) : -0.32;
                const armZ = isMoving ? (this.isBoosting ? 0.14 : 0.48) : 0.32;
                player.arms.left.shoulder.rotation.x = THREE.MathUtils.lerp(player.arms.left.shoulder.rotation.x, armX, 0.18);
                player.arms.right.shoulder.rotation.x = THREE.MathUtils.lerp(player.arms.right.shoulder.rotation.x, armX, 0.18);
                player.arms.left.shoulder.rotation.z = THREE.MathUtils.lerp(player.arms.left.shoulder.rotation.z, -armZ, 0.18);
                player.arms.right.shoulder.rotation.z = THREE.MathUtils.lerp(player.arms.right.shoulder.rotation.z, armZ, 0.18);

                const elbowBend = isMoving ? (this.isBoosting ? -0.10 : -0.25) : -0.20;
                if (player.arms.left.continuousArm && player.arms.left.continuousArm.updateBend) {
                    player.arms.left.continuousArm.updateBend(elbowBend);
                    player.arms.right.continuousArm.updateBend(elbowBend);
                } else if (player.arms.left.elbow) {
                    player.arms.left.elbow.rotation.x = elbowBend;
                    player.arms.right.elbow.rotation.x = elbowBend;
                }
            }

            // 4. Biyomekanik Kanatların Güçlü Çırpınışı ve Süpersonik Delta Formu
            if (player.wings) {
                const isClimbing = moveVec.y > 1.5;
                if (isClimbing) {
                    // Dik tırmanış: Güçlü itme çırpışları
                    const flapSpeed = 10.5;
                    const flap = Math.sin(elapsed * flapSpeed) * 0.55;
                    player.wings.leftInner.rotation.y = THREE.MathUtils.lerp(player.wings.leftInner.rotation.y, -flap, 0.25);
                    player.wings.rightInner.rotation.y = THREE.MathUtils.lerp(player.wings.rightInner.rotation.y, flap, 0.25);
                    player.wings.leftInner.rotation.z = THREE.MathUtils.lerp(player.wings.leftInner.rotation.z, -0.65 - flap * 0.5, 0.25);
                    player.wings.rightInner.rotation.z = THREE.MathUtils.lerp(player.wings.rightInner.rotation.z, 0.65 + flap * 0.5, 0.25);
                    if (player.wings.leftOuter) player.wings.leftOuter.rotation.z = THREE.MathUtils.lerp(player.wings.leftOuter.rotation.z, -0.4 - flap * 0.3, 0.25);
                    if (player.wings.rightOuter) player.wings.rightOuter.rotation.z = THREE.MathUtils.lerp(player.wings.rightOuter.rotation.z, 0.4 + flap * 0.3, 0.25);
                } else if (this.isBoosting) {
                    // Süpersonik hız: Arkaya çekilmiş Delta Kanat (Swept Delta Wings)
                    player.wings.leftInner.rotation.y = THREE.MathUtils.lerp(player.wings.leftInner.rotation.y, 0.88, 0.25);
                    player.wings.rightInner.rotation.y = THREE.MathUtils.lerp(player.wings.rightInner.rotation.y, -0.88, 0.25);
                    player.wings.leftInner.rotation.z = THREE.MathUtils.lerp(player.wings.leftInner.rotation.z, -0.85, 0.25);
                    player.wings.rightInner.rotation.z = THREE.MathUtils.lerp(player.wings.rightInner.rotation.z, 0.85, 0.25);
                    if (player.wings.leftOuter) player.wings.leftOuter.rotation.z = THREE.MathUtils.lerp(player.wings.leftOuter.rotation.z, -0.55, 0.25);
                    if (player.wings.rightOuter) player.wings.rightOuter.rotation.z = THREE.MathUtils.lerp(player.wings.rightOuter.rotation.z, 0.55, 0.25);
                } else if (isMoving) {
                    // Düz süzülüş: Aerodinamik kavis ve yumuşak dalgalanma
                    const flap = Math.sin(elapsed * 4.2) * 0.22;
                    player.wings.leftInner.rotation.y = THREE.MathUtils.lerp(player.wings.leftInner.rotation.y, 0.22 - flap, 0.20);
                    player.wings.rightInner.rotation.y = THREE.MathUtils.lerp(player.wings.rightInner.rotation.y, -0.22 + flap, 0.20);
                    player.wings.leftInner.rotation.z = THREE.MathUtils.lerp(player.wings.leftInner.rotation.z, -0.48 - flap * 0.35, 0.20);
                    player.wings.rightInner.rotation.z = THREE.MathUtils.lerp(player.wings.rightInner.rotation.z, 0.48 + flap * 0.35, 0.20);
                    if (player.wings.leftOuter) player.wings.leftOuter.rotation.z = THREE.MathUtils.lerp(player.wings.leftOuter.rotation.z, -0.25 - flap * 0.2, 0.20);
                    if (player.wings.rightOuter) player.wings.rightOuter.rotation.z = THREE.MathUtils.lerp(player.wings.rightOuter.rotation.z, 0.25 + flap * 0.2, 0.20);
                } else {
                    // Havada asılı duruş: Yavaş yükselme çırpışları
                    const flap = Math.sin(elapsed * 5.2) * 0.32;
                    player.wings.leftInner.rotation.y = THREE.MathUtils.lerp(player.wings.leftInner.rotation.y, -flap, 0.20);
                    player.wings.rightInner.rotation.y = THREE.MathUtils.lerp(player.wings.rightInner.rotation.y, flap, 0.20);
                    player.wings.leftInner.rotation.z = THREE.MathUtils.lerp(player.wings.leftInner.rotation.z, -0.38 - flap * 0.25, 0.20);
                    player.wings.rightInner.rotation.z = THREE.MathUtils.lerp(player.wings.rightInner.rotation.z, 0.38 + flap * 0.25, 0.20);
                    if (player.wings.leftOuter) player.wings.leftOuter.rotation.z = THREE.MathUtils.lerp(player.wings.leftOuter.rotation.z, -0.2 - flap * 0.15, 0.20);
                    if (player.wings.rightOuter) player.wings.rightOuter.rotation.z = THREE.MathUtils.lerp(player.wings.rightOuter.rotation.z, 0.2 + flap * 0.15, 0.20);
                }
            }

            // 5. Ölümlüler İçin Çağrılan Ethereal Kanatların Çırpınışı
            if (this.etherealWings && this.etherealWings.children.length >= 2) {
                const wSpeed = isMoving ? (this.isBoosting ? 3.5 : 5.5) : 4.5;
                const wAmp = isMoving ? 0.35 : 0.45;
                const flap = Math.sin(elapsed * wSpeed) * wAmp;
                this.etherealWings.children[0].rotation.z = -0.45 - flap * 0.4;
                this.etherealWings.children[1].rotation.z = 0.45 + flap * 0.4;
            }
        }
    }

    // Singleton Örneğini Pencereye Ekle
    window.EgyptFlightEngine = new EgyptFlightEngine();

})(window);
