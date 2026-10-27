/**
 * Gods of Egypt MMORPG - Unified Global HUD & Modal Interface
 * Tüm 5 Diyar ve Karakter Vitrinine Entegre Olan Zengin Arayüz
 */

(function(window) {
    'use strict';

    const REALMS = [
        { id: 'misir', file: 'mısır.html', name: 'Nil Nehri & Başkent', icon: '🏛️', desc: 'Açık Dünya: Tarım, Madencilik, Avcılık, Devasa Obelisk İnşası' },
        { id: 'saray', file: 'saray.html', name: 'Kraliyet Sarayı', icon: '👑', desc: 'Set\'in Taht Salonu, Vergi ve İbadet Merkezi' },
        { id: 'horustapinak', file: 'horustapınak.html', name: 'Tuzaklı Hazine Tapınağı', icon: '⚔️', desc: 'Ölümcül Tuzaklar & Horus\'un Gözü Hırsızlık Görevi' },
        { id: 'raningemisi', file: 'raningemisi.html', name: 'Ra\'nın Güneş Gemisi', icon: '☀️', desc: 'Kozmik Uzay & Dev Kaos Yılanı Apophis Gece Savaşı' },
        { id: 'ahiret', file: 'ahiret.html', name: 'Ahiret (Duat) & Anubis', icon: '💀', desc: 'Ruhlar Nehri, Anubis\'in Terazisi & Yeraltı Madenciliği' },
        { id: 'karaktertanrilar', file: 'karaktertanrilar.html', name: 'Tanrı Zırhı & Atölye', icon: '🦅', desc: 'Karakter ve Zırh Seçimi (Bek, Horus, Set Formları)' }
    ];

    class GameHUDManager {
        constructor() {
            this.activeModal = null;
            this.currentRealm = this.detectCurrentRealm();
            this.activeChatFilter = 'all';
            this.init();
        }

        detectCurrentRealm() {
            const path = decodeURIComponent(window.location.pathname.toLowerCase());
            for (const r of REALMS) {
                if (path.includes(r.file.toLowerCase()) || path.includes(r.id)) {
                    return r;
                }
            }
            return REALMS[0];
        }

        init() {
            // Load CSS
            if (!document.getElementById('mmo-hud-css')) {
                const link = document.createElement('link');
                link.id = 'mmo-hud-css';
                link.rel = 'stylesheet';
                link.href = 'gameHud.css';
                document.head.appendChild(link);
            }

            // Load SVG Icons
            if (!document.getElementById('svg-icons-js')) {
                const script = document.createElement('script');
                script.id = 'svg-icons-js';
                script.src = 'svg-icons.js';
                document.head.appendChild(script);
            }

            // Load Global Camera System (1. Şahıs / 3. Şahıs Motoru)
            if (!document.getElementById('mmo-camera-system-js')) {
                const script = document.createElement('script');
                script.id = 'mmo-camera-system-js';
                script.src = 'cameraSystem.js';
                document.head.appendChild(script);
            }

            // Load MMORPG Gathering, Harvesting & Auto-Questing Engine
            if (!document.getElementById('mmo-gathering-system-js')) {
                const script = document.createElement('script');
                script.id = 'mmo-gathering-system-js';
                script.src = 'mmoGatheringSystem.js';
                document.head.appendChild(script);
            }

            // Load Cinematic Social Media & TikTok Studio Engine
            if (!document.getElementById('mmo-cinematic-studio-js')) {
                const script = document.createElement('script');
                script.id = 'mmo-cinematic-studio-js';
                script.src = 'cinematicStudio.js';
                document.head.appendChild(script);
            }

            this.createHudDOM();
            this.bindEvents();

            if (window.GameState) {
                window.GameState.subscribe(state => this.updateUI(state));
            }
        }

        createHudDOM() {
            const container = document.createElement('div');
            container.id = 'mmo-master-hud';
            container.className = 'mmo-hud fixed inset-0 z-50 pointer-events-none overflow-hidden';
            container.innerHTML = `
                <!-- ========================================== -->
                <!-- PC & UNIFIED TOP BAR -->
                <!-- ========================================== -->

                <!-- SOL ÜST: OYUNCU PORTRESİ, BİLGİ VE BÖLÜMLENDİRİLMİŞ STATÜ ÇUBUKLARI -->
                <div class="mmo-pc-unitframe">
                    <div id="hud-avatar-box" class="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-600 via-amber-800 to-amber-950 border-2 border-amber-400 flex items-center justify-center text-2xl shadow-xl cursor-pointer hover:border-yellow-300 transition-all flex-shrink-0" onclick="window.GameHUD.openModal('ascend')" title="Tanrı Yükselişi / Karakter [C]">
                        <span id="hud-avatar-icon" class="icon-player"></span>
                    </div>
                    <div class="flex flex-col gap-1 min-w-[180px] sm:min-w-[210px]">
                        <!-- İsim, Rol ve Level -->
                        <div class="flex items-center justify-between gap-1">
                            <div class="flex flex-col">
                                <span id="hud-player-name" class="font-black text-xs sm:text-sm text-amber-200 tracking-wide drop-shadow">Bek</span>
                                <span id="hud-player-role" class="text-[10px] text-amber-400/80 font-medium">Ölümlü Bek</span>
                            </div>
                            <span id="hud-player-level" class="text-[10px] font-black px-2 py-0.5 rounded-md bg-amber-500/25 text-amber-300 border border-amber-400/50 shadow-sm">LVL 1</span>
                        </div>
                        
                        <!-- Can / HP Bar (Büyük, Kalın & Net) -->
                        <div class="w-full bg-black/80 rounded-full h-3 overflow-hidden border border-red-900/80 relative shadow-inner">
                            <div id="hud-hp-bar" class="h-full bg-gradient-to-r from-red-600 via-rose-500 to-emerald-400 transition-all duration-300 shadow-lg" style="width: 100%;"></div>
                            <span id="hud-hp-text" class="absolute inset-0 flex items-center justify-center text-[9px] font-black text-white drop-shadow tracking-wider">100 / 100 HP</span>
                        </div>
                        
                        <!-- Mana / İlahi Enerji Barı -->
                        <div class="w-full bg-black/80 rounded-full h-2.5 overflow-hidden border border-amber-900/80 relative shadow-inner">
                            <div id="hud-energy-bar" class="h-full bg-gradient-to-r from-amber-600 via-amber-400 to-yellow-300 transition-all duration-300" style="width: 100%;"></div>
                            <span id="hud-energy-text" class="absolute inset-0 flex items-center justify-center text-[8px] font-black text-amber-100 drop-shadow">100 / 100 EN</span>
                        </div>

                        <!-- Dayanıklılık / Stamina Barı -->
                        <div class="w-full bg-black/80 rounded-full h-2 overflow-hidden border border-emerald-950/80 relative shadow-inner">
                            <div id="hud-stamina-bar" class="h-full bg-gradient-to-r from-teal-600 to-emerald-400 transition-all duration-300" style="width: 100%;"></div>
                            <span id="hud-stamina-text" class="absolute inset-0 flex items-center justify-center text-[7px] font-extrabold text-emerald-100 drop-shadow">100 / 100 ST</span>
                        </div>
                    </div>
                </div>

                <!-- ORTA ÜST: AKTİF DİYAR BANNERI (Cartouche), HARİTA [M] VE 1. ŞAHIS KAMERA [V] -->
                <div class="mmo-pc-realmbanner">
                    <button onclick="window.GameHUD.openModal('realm')" class="flex items-center gap-2 text-xs sm:text-sm font-black text-amber-300 hover:text-white transition-all group">
                        <span id="hud-realm-icon" class="icon-realm text-amber-400 group-hover:scale-110 transition-transform"></span>
                        <span id="hud-realm-title" class="hud-font-title tracking-wider uppercase text-amber-200">${this.currentRealm.name}</span>
                        <span class="text-[10px] px-2 py-0.5 rounded-lg bg-amber-400 text-black font-extrabold flex items-center gap-1 shadow group-hover:bg-amber-300 transition-colors">
                            <span id="map-icon" class="icon-nav"></span>
                            <span>[M] HARİTA</span>
                        </span>
                    </button>
                    <!-- 1. ŞAHIS / 3. ŞAHIS KAMERA MODU DÜĞMESİ [V] -->
                    <button onclick="window.EgyptCameraSystem && window.EgyptCameraSystem.toggleFirstPerson()" id="hud-cam-btn" class="flex items-center gap-1.5 text-xs font-black text-amber-200 bg-amber-500/20 hover:bg-amber-400 hover:text-black border border-amber-400/50 px-2.5 py-1 rounded-xl shadow-lg transition-all active:scale-95 ml-1" title="Kamera Modunu Değiştir (1. Şahıs / 3. Şahıs) [V]">
                        <span id="cam-icon">👁️</span>
                        <span id="cam-label">[V] 1. ŞAHIS</span>
                    </button>
                    <!-- TİKTOK & SİNEMATİK VİDEO STÜDYOSU [K] -->
                    <button onclick="window.openCinematicStudio ? window.openCinematicStudio() : (window.EgyptCinematicStudio && window.EgyptCinematicStudio.openStudioModal())" id="hud-studio-btn" class="flex items-center gap-1.5 text-xs font-black text-yellow-300 bg-gradient-to-r from-red-600/35 via-amber-600/35 to-yellow-600/35 hover:from-red-500 hover:to-yellow-400 hover:text-black border border-amber-400/60 px-2.5 py-1 rounded-xl shadow-lg transition-all active:scale-95 ml-1 animate-pulse" title="TikTok, Reels & YouTube Sinematik Video Stüdyosu [K]">
                        <span>🎬</span>
                        <span>TİKTOK & VİDEO [K]</span>
                    </button>
                    <!-- İLAHİ TANRI UÇUŞU DÜĞMESİ [F] -->
                    <button onclick="window.EgyptFlightEngine && window.EgyptFlightEngine.toggleFlight()" id="hud-flight-btn" class="flex items-center gap-1.5 text-xs font-black text-cyan-200 bg-gradient-to-r from-sky-600/40 via-cyan-600/40 to-amber-600/40 hover:from-sky-500 hover:to-amber-400 hover:text-black border border-cyan-400/70 px-2.5 py-1 rounded-xl shadow-lg transition-all active:scale-95 ml-1" title="İlahi Tanrı Uçuşu (Göklere ve Ra'nın Gemisine Yüksel) [F / G]">
                        <span id="flight-icon">🦅</span>
                        <span id="flight-label">[F] UÇUŞ</span>
                    </button>
                </div>

                <!-- SAĞ ÜST: HAZİNE, İLAHİ KAYNAKLAR & SİSTEM BUTONLARI -->
                <div class="mmo-pc-topright">
                    <div class="hud-glass rounded-2xl px-3 py-1.5 flex items-center gap-2.5 sm:gap-3 text-xs font-bold shadow-2xl">
                        <!-- Altın Kan -->
                        <div class="flex items-center gap-1 text-amber-300 golden-blood-pulse px-2 py-0.5 rounded-lg bg-amber-500/20 border border-amber-400/50" title="Altın Kan (En değerli ilahi craft malzemesi!)">
                            <span id="hud-blood-icon" class="icon-resource"></span>
                            <span id="hud-blood-val" class="font-black text-amber-200">2</span>
                            <span class="text-[9px] font-bold text-amber-400/90 hidden sm:inline">KAN</span>
                        </div>

                        <!-- Altın -->
                        <div class="flex items-center gap-1 text-yellow-300 px-1.5 py-0.5 rounded bg-yellow-500/10 border border-yellow-500/20" title="Altın Hazinesi">
                            <span id="hud-gold-icon" class="icon-resource"></span>
                            <span id="hud-gold-val" class="font-extrabold">120</span>
                        </div>

                        <!-- Buğday & Papirüs -->
                        <div class="flex items-center gap-1 text-lime-300 px-1.5 py-0.5 rounded bg-lime-500/10 border border-lime-500/20" title="Nil Buğdayı & Papirüs">
                            <span id="hud-wheat-icon" class="icon-resource"></span>
                            <span id="hud-wheat-val" class="font-extrabold">15B / 20P</span>
                        </div>

                        <!-- Bakır & Taş -->
                        <div class="flex items-center gap-1 text-orange-300 px-1.5 py-0.5 rounded bg-orange-500/10 border border-orange-500/20" title="Madenler (Bakır & Taş)">
                            <span id="hud-stone-icon" class="icon-resource"></span>
                            <span id="hud-stone-val" class="font-extrabold">25T / 10B</span>
                        </div>

                        <!-- Obelisk -->
                        <div class="flex items-center gap-1 text-amber-400 px-1.5 py-0.5 rounded bg-amber-500/10 border border-amber-500/20" title="Devasa Obelisk İnşaat Tamamlanma Yüzdesi">
                            <span id="hud-obelisk-icon" class="icon-resource"></span>
                            <span id="hud-obelisk-val" class="font-black">%38</span>
                        </div>

                        <!-- Horus'un Gözü Rozeti -->
                        <div id="hud-eye-badge" class="hidden items-center gap-1 text-cyan-300 px-2 py-0.5 rounded-lg bg-cyan-500/20 border border-cyan-400">
                            <span id="hud-eye-icon" class="icon-resource"></span>
                            <span class="text-[10px] font-black">HORUS'UN GÖZÜ</span>
                        </div>
                    </div>

                    <!-- Ses Aç/Kapat Butonu -->
                    <button onclick="window.GameHUD.toggleAudio()" id="hud-audio-btn" class="hud-glass p-2 rounded-xl text-xs font-bold text-amber-300 hover:text-white border border-amber-500/40 hover:border-amber-300 shadow-xl transition-all" title="Ses Aç/Kapat">
                        <span id="audio-icon" class="icon-nav"></span>
                    </button>

                    <!-- Ana Menüye Dön Butonu -->
                    <button onclick="window.GameHUD.exitToMainMenu()" class="hud-glass-gold px-3.5 py-2 rounded-xl text-xs font-black text-amber-200 hover:text-white border border-amber-400 shadow-2xl flex items-center gap-1.5 hover:scale-105 active:scale-95 transition-all" title="Ana Menüye Dön">
                        <span>✕</span>
                        <span class="hud-font-title tracking-wider">ANA MENÜ</span>
                    </button>
                </div>

                <!-- ========================================== -->
                <!-- PC MMORPG HOTBAR (Bottom-Center) [1]-[6] -->
                <!-- ========================================== -->
                <div class="mmo-pc-hotbar mmo-pc-only">
                    <!-- Slot 1: Saldırı Kombo -->
                    <div id="hotbar-slot-1" class="mmo-hotbar-slot" onclick="window.EgyptCombatEngine && window.EgyptCombatEngine.performAttack(); window.GameHUD.animateHotbarSlot(1);" title="Saldırı / Kombo [1] ya da Sol Tık">
                        <span class="mmo-key-badge">1</span>
                        <span id="hotbar-attack-icon" class="text-xl">⚔️</span>
                        <span class="mmo-hotbar-label">Saldır</span>
                    </div>

                    <!-- Slot 2: Zıpla & Süzül -->
                    <div id="hotbar-slot-2" class="mmo-hotbar-slot" onclick="window.EgyptCombatEngine && window.EgyptCombatEngine.performJump(); window.GameHUD.animateHotbarSlot(2);" title="Zıpla & Süzül [Space]">
                        <span class="mmo-key-badge">Space</span>
                        <span id="hotbar-jump-icon" class="text-xl">🦘</span>
                        <span class="mmo-hotbar-label">Zıpla</span>
                    </div>

                    <!-- Slot 3: Bağlamsal Etkileşim / Hasat / Maden -->
                    <div id="hotbar-slot-3" class="mmo-hotbar-slot border-amber-400" onclick="window.GameHUD.triggerContextAction(); window.GameHUD.animateHotbarSlot(3);" title="Diyar Etkileşimi / Hasat / Maden [E]">
                        <span class="mmo-key-badge">E</span>
                        <span id="hud-hotbar-context-icon" class="text-xl">🌾</span>
                        <span id="hud-hotbar-context-label" class="mmo-hotbar-label text-amber-300">Topla</span>
                    </div>

                    <!-- Slot 4: Tanrıya Yükseliş -->
                    <div id="hotbar-slot-4" class="mmo-hotbar-slot border-yellow-400/70" onclick="window.GameHUD.openModal('ascend'); window.GameHUD.animateHotbarSlot(4);" title="İlahi Tanrıya Yükseliş [R]">
                        <span class="mmo-key-badge">R</span>
                        <span id="hotbar-ascend-icon" class="text-xl">⚡</span>
                        <span class="mmo-hotbar-label text-yellow-300">Dönüşüm</span>
                    </div>

                    <!-- Slot 5: Nil İksiri -->
                    <div id="hotbar-slot-5" class="mmo-hotbar-slot border-rose-500/60" onclick="window.GameHUD.useHealthPotion(); window.GameHUD.animateHotbarSlot(5);" title="Nil İksiri İç (+35 HP) [Q]">
                        <span class="mmo-key-badge">Q</span>
                        <span id="hotbar-potion-icon" class="text-xl">🧪</span>
                        <span class="mmo-hotbar-label text-rose-300">İksir</span>
                    </div>

                    <!-- Slot 6: Demirhane -->
                    <div id="hotbar-slot-6" class="mmo-hotbar-slot" onclick="window.GameHUD.openModal('craft'); window.GameHUD.animateHotbarSlot(6);" title="Altın Kan Demirhanesi [X]">
                        <span class="mmo-key-badge">X</span>
                        <span id="hotbar-craft-icon" class="text-xl">🔨</span>
                        <span class="mmo-hotbar-label">Üretim</span>
                    </div>
                </div>

                <!-- ========================================== -->
                <!-- PC MICRO MENU (Bottom-Right) [C]-[H] -->
                <!-- ========================================== -->
                <div class="mmo-pc-micromenu mmo-pc-only">
                    <button onclick="window.GameHUD.openModal('ascend')" class="action-pill-btn px-2.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1" title="Karakter & Zırh [C]">
                        <span class="text-amber-400 font-mono text-[10px] font-black">[C]</span>
                        <span>Karakter</span>
                    </button>
                    <button onclick="window.GameHUD.openModal('inventory')" class="action-pill-btn px-2.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1" title="Envanter Çantası [B]">
                        <span class="text-amber-400 font-mono text-[10px] font-black">[B]</span>
                        <span>Çanta</span>
                    </button>
                    <button onclick="window.GameHUD.openModal('quests')" class="action-pill-btn px-2.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1" title="Görev Listesi [J]">
                        <span class="text-amber-400 font-mono text-[10px] font-black">[J]</span>
                        <span>Görevler</span>
                    </button>
                    <button onclick="window.GameHUD.openModal('obelisk')" class="action-pill-btn px-2.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1" title="Obelisk İnşaatı [O]">
                        <span class="text-amber-400 font-mono text-[10px] font-black">[O]</span>
                        <span>Obelisk</span>
                    </button>
                    <button onclick="window.TutorialSystem && window.TutorialSystem.showTutorialStep()" class="action-pill-btn px-2.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1" title="Rehber & Bilgi [H]">
                        <span class="text-amber-400 font-mono text-[10px] font-black">[H]</span>
                        <span>Rehber</span>
                    </button>
                </div>

                <!-- ========================================== -->
                <!-- PC LIVE REALM CHAT (Bottom-Left) -->
                <!-- ========================================== -->
                <div id="hud-pc-chat" class="mmo-pc-chat mmo-pc-only">
                    <div class="mmo-chat-header">
                        <span class="flex items-center gap-1.5">
                            <span id="chat-icon" class="icon-nav"></span>
                            <span>DİYAR GÜNLÜĞÜ · YEREL</span>
                        </span>
                        <div class="flex items-center gap-2">
                            <span id="hud-online-count" class="text-[10px] text-amber-300 font-bold">TEK OYUNCU</span>
                            <button onclick="window.GameHUD.toggleChatMinimize()" class="text-amber-400 hover:text-white px-1.5 font-mono text-sm leading-none font-black" title="Küçült / Büyüt" id="hud-chat-toggle-btn">–</button>
                        </div>
                    </div>
                    <div class="mmo-chat-tabs">
                        <button class="mmo-chat-tab active" onclick="window.GameHUD.setChatFilter('all', this)">[Tümü]</button>
                        <button class="mmo-chat-tab" onclick="window.GameHUD.setChatFilter('realm', this)">[Diyar]</button>
                        <button class="mmo-chat-tab" onclick="window.GameHUD.setChatFilter('combat', this)">[Savaş]</button>
                        <button class="mmo-chat-tab" onclick="window.GameHUD.setChatFilter('system', this)">[Sistem]</button>
                    </div>
                    <div id="hud-chat-messages" class="mmo-chat-log mmo-scroll">
                        <!-- Mesajlar dinamik akar -->
                    </div>
                    <div class="mmo-chat-input-bar">
                        <input id="hud-chat-input" type="text" placeholder="Yerel oyun günlüğüne not yaz..." class="w-full bg-black/60 border border-amber-500/40 rounded-lg px-2.5 py-1 text-xs text-amber-100 placeholder-amber-400/40 focus:outline-none focus:border-amber-400">
                        <button onclick="window.GameHUD.sendChatMsg()" class="gold-btn px-3 py-1 rounded-lg text-xs font-black">Gönder</button>
                    </div>
                </div>

                <div id="quest-tracker" aria-live="polite"></div>

                <!-- ========================================== -->
                <!-- MOBİL TOUCH FALLBACK (Sadece Mobilde Görünür) -->
                <!-- ========================================== -->
                <div id="hud-mobile-controls" class="mmo-mobile-only fixed bottom-6 right-6 z-30 flex flex-col items-end gap-2.5">
                    <button id="hud-context-action-btn" onclick="window.GameHUD.triggerContextAction()" class="gold-btn px-5 py-3.5 rounded-2xl text-sm font-black flex items-center gap-2 shadow-2xl">
                        <span id="hud-context-icon" class="icon-action"></span>
                        <span id="hud-context-label">SALDIR / TOPLA</span>
                    </button>
                    <div class="flex flex-wrap justify-end gap-1.5 max-w-[90vw]">
                        <button onclick="window.TutorialSystem && window.TutorialSystem.showTutorialStep()" class="action-pill-btn px-2.5 py-1.5 rounded-xl text-xs font-bold">Rehber</button>
                        <button onclick="window.GameHUD.openModal('ascend')" class="action-pill-btn px-2.5 py-1.5 rounded-xl text-xs font-bold">Tanrı</button>
                        <button onclick="window.GameHUD.openModal('craft')" class="action-pill-btn px-2.5 py-1.5 rounded-xl text-xs font-bold">Demirhane</button>
                        <button onclick="window.GameHUD.openModal('inventory')" class="action-pill-btn px-2.5 py-1.5 rounded-xl text-xs font-bold">Çanta</button>
                        <button onclick="window.GameHUD.openModal('quests')" class="action-pill-btn px-2.5 py-1.5 rounded-xl text-xs font-bold">Görevler</button>
                    </div>
                </div>

                <!-- MODAL KAPLAYICI (Pop-up pencereler) -->
                <div id="mmo-modal-container" class="fixed inset-0 mmo-modal-backdrop z-50 hidden flex items-center justify-center p-4">
                    <div id="mmo-modal-content" class="hud-glass-gold w-full max-w-xl max-h-[88vh] rounded-3xl p-5 sm:p-6 overflow-y-auto mmo-scroll flex flex-col gap-4 shadow-2xl border-2 border-amber-400">
                        <!-- İçerik dinamik enjekte edilir -->
                    </div>
                </div>

                <!-- BİLDİRİM TOAST ALANI -->
                <div id="hud-toast-area" class="fixed top-20 left-1/2 -translate-x-1/2 z-50 flex flex-col items-center gap-2 pointer-events-none"></div>
            `;

            document.body.appendChild(container);
            this.adjustJoystickPosition();
            this.initializeSVGIcons();
            if (window.TutorialSystem) window.TutorialSystem.updateQuestTracker();
        }

        adjustJoystickPosition() {
            // PC'de (geniş ekranlarda) joystick'i tamamen gizle, mobilde alt sol pozisyona al
            const joy = document.getElementById('joystick-zone');
            if (joy) {
                if (window.innerWidth >= 1025) {
                    joy.style.display = 'none';
                } else {
                    joy.style.display = 'flex';
                    joy.style.bottom = 'calc(8rem + max(0px, env(safe-area-inset-bottom)))';
                    joy.style.left = 'max(1rem, env(safe-area-inset-left))';
                    joy.style.zIndex = '25';
                }
            }
        }

        initializeSVGIcons() {
            const checkAndInit = () => {
                if (typeof getIcon === 'function') {
                    const iconMap = {
                        'hud-avatar-icon': 'player',
                        'hud-realm-icon': this.getRealmIconName(this.currentRealm.id),
                        'map-icon': 'map',
                        'hud-gold-icon': 'gold',
                        'hud-blood-icon': 'goldenBlood',
                        'hud-wheat-icon': 'wheat',
                        'hud-stone-icon': 'mining',
                        'hud-obelisk-icon': 'obelisk',
                        'hud-eye-icon': 'eye',
                        'audio-icon': 'audio',
                        'chat-icon': 'chat',
                        'hud-context-icon': 'attack',
                        'hotbar-attack-icon': 'attack',
                        'hotbar-jump-icon': 'lightning',
                        'hotbar-ascend-icon': 'ascend',
                        'hotbar-potion-icon': 'heart',
                        'hotbar-craft-icon': 'craft',
                        'hud-hotbar-context-icon': 'wheat'
                    };

                    for (const [id, iconName] of Object.entries(iconMap)) {
                        const el = document.getElementById(id);
                        if (el) {
                            el.innerHTML = getIcon(iconName, 'normal');
                        }
                    }
                } else {
                    setTimeout(checkAndInit, 100);
                }
            };

            checkAndInit();
        }

        getRealmIconName(realmId) {
            const iconMap = {
                'misir': 'obelisk',
                'saray': 'palace',
                'horustapinak': 'temple',
                'raningemisi': 'sun',
                'ahiret': 'anubis',
                'karaktertanrilar': 'horus'
            };
            return iconMap[realmId] || 'obelisk';
        }

        bindEvents() {
            window.addEventListener('keydown', (e) => {
                const isInput = document.activeElement && (
                    document.activeElement.tagName === 'INPUT' || 
                    document.activeElement.tagName === 'TEXTAREA'
                );

                // Enter tuşuyla sohbete odaklanma / gönderme
                if (e.key === 'Enter') {
                    const input = document.getElementById('hud-chat-input');
                    if (isInput) {
                        this.sendChatMsg();
                        if (input) input.blur();
                    } else if (input) {
                        e.preventDefault();
                        input.focus();
                    }
                    return;
                }

                // Escape tuşuyla modal / sohbet kapatma
                if (e.key === 'Escape') {
                    if (isInput) {
                        document.activeElement.blur();
                    } else if (this.activeModal) {
                        this.closeModal();
                    }
                    return;
                }

                // Yazı yazılıyorsa oyun kısayollarını tetikleme
                if (isInput) return;

                const key = e.key.toLowerCase();

                // 1: Saldırı / Kombo
                if (e.key === '1') {
                    if (window.EgyptCombatEngine) window.EgyptCombatEngine.performAttack();
                    this.animateHotbarSlot(1);
                }
                // Space: Zıplama & Süzülme
                else if (e.code === 'Space') {
                    e.preventDefault();
                    if (window.EgyptCombatEngine) window.EgyptCombatEngine.performJump();
                    this.animateHotbarSlot(2);
                }
                // E: Diyar Etkileşimi / Hasat / Maden
                else if (key === 'e') {
                    this.triggerContextAction();
                    this.animateHotbarSlot(3);
                }
                // R: İlahi Tanrıya Yükseliş
                else if (key === 'r') {
                    this.openModal('ascend');
                    this.animateHotbarSlot(4);
                }
                // Q: Nil İksiri İç (+35 HP)
                else if (key === 'q') {
                    this.useHealthPotion();
                    this.animateHotbarSlot(5);
                }
                // X veya 6: Altın Kan Demirhanesi
                else if (key === 'x' || key === '6') {
                    this.openModal('craft');
                    this.animateHotbarSlot(6);
                }
                // C: Karakter / Zırh Vitrini
                else if (key === 'c') {
                    this.openModal('ascend');
                }
                // B: Çanta / Envanter
                else if (key === 'b') {
                    this.openModal('inventory');
                }
                // J: Görev Listesi
                else if (key === 'j') {
                    this.openModal('quests');
                }
                // M: Diyar Haritası
                else if (key === 'm') {
                    this.openModal('realm');
                }
                // O: Obelisk İnşaatı
                else if (key === 'o') {
                    this.openModal('obelisk');
                }
                // H: Rehber
                else if (key === 'h') {
                    if (window.TutorialSystem) window.TutorialSystem.showTutorialStep();
                }
                // V: Kamera Modu Değiştir (1. Şahıs / 3. Şahıs)
                else if (key === 'v') {
                    if (window.EgyptCameraSystem) window.EgyptCameraSystem.toggleFirstPerson();
                }
                // K: Sinematik TikTok & Reklam Stüdyosu
                else if (key === 'k') {
                    if (window.EgyptCinematicStudio) {
                        if (window.EgyptCinematicStudio.isActive()) {
                            window.EgyptCinematicStudio.stopCinematic('Kullanıcı durdurdu');
                        } else {
                            window.EgyptCinematicStudio.openStudioModal();
                        }
                    }
                }
            });

            // Ekran yeniden boyutlandığında joystick durumunu güncelle
            window.addEventListener('resize', () => {
                this.adjustJoystickPosition();
            });
        }

        updateCameraModeUI(isFirstPerson) {
            const label = document.getElementById('cam-label');
            const icon = document.getElementById('cam-icon');
            const btn = document.getElementById('hud-cam-btn');
            if (label) label.textContent = isFirstPerson ? '[V] 3. ŞAHIS' : '[V] 1. ŞAHIS';
            if (icon) icon.textContent = isFirstPerson ? '🎥' : '👁️';
            if (btn) {
                if (isFirstPerson) {
                    btn.className = 'flex items-center gap-1.5 text-xs font-black text-black bg-amber-300 hover:bg-amber-400 border border-white px-2.5 py-1 rounded-xl shadow-lg transition-all active:scale-95 animate-pulse ml-1';
                } else {
                    btn.className = 'flex items-center gap-1.5 text-xs font-black text-amber-200 bg-amber-500/20 hover:bg-amber-400 hover:text-black border border-amber-400/50 px-2.5 py-1 rounded-xl shadow-lg transition-all active:scale-95 ml-1';
                }
            }
        }

        animateHotbarSlot(num) {
            const slot = document.getElementById(`hotbar-slot-${num}`);
            if (slot) {
                slot.classList.add('pressed');
                setTimeout(() => slot.classList.remove('pressed'), 180);
            }
        }

        useHealthPotion() {
            const state = window.GameState ? window.GameState.state : null;
            if (!state) return;
            const p = state.player;
            if (p.hp >= p.maxHp) {
                this.showToast('Canın zaten maksimum seviyede! (%100)', 'system');
                return;
            }
            const healAmount = 35;
            p.hp = Math.min(p.maxHp, p.hp + healAmount);
            if (window.GameAudio) window.GameAudio.playSfx('pickup_gold');
            this.showToast(`🧪 Nil İksiri içtin! +${healAmount} Can yenilendi! (${p.hp}/${p.maxHp})`, 'gold');
            window.GameState.saveState();
        }

        toggleChatMinimize() {
            const chat = document.getElementById('hud-pc-chat');
            const btn = document.getElementById('hud-chat-toggle-btn');
            if (chat) {
                chat.classList.toggle('minimized');
                if (btn) {
                    btn.textContent = chat.classList.contains('minimized') ? '+' : '–';
                }
            }
        }

        setChatFilter(type, btnEl) {
            this.activeChatFilter = type;
            if (btnEl && btnEl.parentNode) {
                btnEl.parentNode.querySelectorAll('.mmo-chat-tab').forEach(b => b.classList.remove('active'));
                btnEl.classList.add('active');
            }
            if (window.GameState) {
                this.renderChatMessages(window.GameState.state.chatLog);
            }
        }

        exitToMainMenu() {
            if (window.parent && typeof window.parent.exitGameFrame === 'function') {
                window.parent.exitGameFrame();
            } else {
                window.location.href = 'index.html';
            }
        }

        updateUI(state) {
            const p = state.player;
            const inv = state.inventory;

            // Player Info
            const nameEl = document.getElementById('hud-player-name');
            const roleEl = document.getElementById('hud-player-role');
            const levelEl = document.getElementById('hud-player-level');
            const hpBar = document.getElementById('hud-hp-bar');
            const hpText = document.getElementById('hud-hp-text');
            const energyBar = document.getElementById('hud-energy-bar');
            const energyText = document.getElementById('hud-energy-text');
            const staminaBar = document.getElementById('hud-stamina-bar');
            const staminaText = document.getElementById('hud-stamina-text');
            const avatarIcon = document.getElementById('hud-avatar-icon');

            if (nameEl) nameEl.textContent = p.name || 'Bek';
            if (roleEl) roleEl.textContent = this.getRoleLabel(p.role);
            if (levelEl) levelEl.textContent = `LVL ${p.level}`;
            
            const hpPct = Math.max(0, Math.min(100, (p.hp / p.maxHp) * 100));
            if (hpBar) hpBar.style.width = `${hpPct}%`;
            if (hpText) hpText.textContent = `${p.hp} / ${p.maxHp} HP (${Math.round(hpPct)}%)`;
            
            const energyPct = Math.max(0, Math.min(100, (p.energy / p.maxEnergy) * 100));
            if (energyBar) energyBar.style.width = `${energyPct}%`;
            if (energyText) energyText.textContent = `${p.energy} / ${p.maxEnergy} EN`;

            const staminaVal = p.stamina !== undefined ? p.stamina : 100;
            const maxStamina = p.maxStamina || 100;
            const staminaPct = Math.max(0, Math.min(100, (staminaVal / maxStamina) * 100));
            if (staminaBar) staminaBar.style.width = `${staminaPct}%`;
            if (staminaText) staminaText.textContent = `${staminaVal} / ${maxStamina} ST`;

            if (avatarIcon) {
                let iconName = 'player';
                if (p.role === 'god_horus' || p.role === 'horus_god' || p.role === 'horus') iconName = 'horus';
                else if (p.role === 'god_set' || p.role === 'set_god' || p.role === 'set') iconName = 'set';
                else if (p.role === 'horus_human') iconName = 'palace';
                else if (p.role === 'villager') iconName = 'wheat';
                else if (['zaya', 'hathor', 'nephthys', 'isis', 'astarte', 'anat', 'bastet', 'dancer'].includes(p.role)) iconName = 'sparkle';
                else if (p.role === 'female_villager') iconName = 'wheat';
                
                if (typeof getIcon === 'function') {
                    avatarIcon.innerHTML = getIcon(iconName, 'large');
                }
            }

            // Resources
            const goldVal = document.getElementById('hud-gold-val');
            const bloodVal = document.getElementById('hud-blood-val');
            const wheatVal = document.getElementById('hud-wheat-val');
            const stoneVal = document.getElementById('hud-stone-val');
            const obeliskVal = document.getElementById('hud-obelisk-val');
            const eyeBadge = document.getElementById('hud-eye-badge');

            if (goldVal) goldVal.textContent = inv.gold;
            if (bloodVal) bloodVal.textContent = inv.golden_blood;
            if (wheatVal) wheatVal.textContent = `${inv.wheat}B / ${inv.papyrus}P`;
            if (stoneVal) stoneVal.textContent = `${inv.copper}B / ${inv.stone}T`;
            if (obeliskVal) obeliskVal.textContent = `%${state.obelisk.progress}`;
            if (eyeBadge) {
                if (p.hasEyeOfHorus) {
                    eyeBadge.classList.remove('hidden');
                    eyeBadge.classList.add('flex');
                } else {
                    eyeBadge.classList.add('hidden');
                    eyeBadge.classList.remove('flex');
                }
            }

            // Realm specific context action button
            this.updateContextActionButton(state);

            // Chat Messages
            this.renderChatMessages(state.chatLog);

            // Ahiret check: Eğer can 0 ve ahiret sayfasında değilsek uyarı göster
            if (p.hp <= 0 && this.currentRealm.id !== 'ahiret') {
                this.showToast('Canın tükendi! Anubis\'in huzuruna Duat\'a gönderiliyorsun...', 'danger');
            }
        }

        getRoleLabel(role) {
            switch(role) {
                case 'god_horus':
                case 'horus_god':
                case 'horus':
                    return 'Horus (Altın Şahin 3.5m)';
                case 'god_set':
                case 'set_god':
                case 'set':
                    return 'Set (Altın Çakal 3.6m)';
                case 'horus_human':
                    return 'İnsan Horus (2.8m Prens)';
                case 'zaya':
                    return 'Zaya (Ölümlü Gezgin)';
                case 'hathor':
                    return 'Hathor (Aşk ve Bereket Tanrıçası)';
                case 'nephthys':
                    return 'Nephthys (Koruyucu Tanrıça)';
                case 'isis':
                    return 'İsis (Büyü Kraliçesi)';
                case 'astarte':
                    return 'Astarte (Savaş Tanrıçası)';
                case 'anat':
                    return 'Anat (Fırtına Tanrıçası)';
                case 'bastet':
                    return 'Bastet (Kedi Tanrıçası)';
                case 'female_villager':
                    return 'Nil Köylüsü';
                case 'dancer':
                    return 'Tapınak Dansçısı';
                case 'villager':
                    return 'Mısırlı Köylü';
                case 'bek':
                case 'thief':
                default:
                    return 'Ölümlü Bek (Hırsız)';
            }
        }

        updateContextActionButton(state) {
            const btn = document.getElementById('hud-context-action-btn');
            const icon = document.getElementById('hud-context-icon');
            const label = document.getElementById('hud-context-label');
            const hotbarIcon = document.getElementById('hud-hotbar-context-icon');
            const hotbarLabel = document.getElementById('hud-hotbar-context-label');

            const realmId = this.currentRealm.id;
            const p = state.player;

            let iconKey = 'attack';
            let mainText = 'SALDIR / TOPLA (E)';
            let shortText = 'Topla';

            if (realmId === 'raningemisi') {
                iconKey = 'sparkle';
                mainText = 'GÜNEŞ DUASI BAĞIŞLA (E)';
                shortText = 'Güneş Duası';
            } else if (realmId === 'horustapinak') {
                if (!p.hasEyeOfHorus) {
                    iconKey = 'eye';
                    mainText = 'HORUS\'UN GÖZÜNÜ ÇAL! (E)';
                    shortText = 'Gözü Çal!';
                } else {
                    iconKey = 'arrowRight';
                    mainText = 'TAPINAKTAN KAÇ! (E)';
                    shortText = 'Kaçış';
                }
            } else if (realmId === 'ahiret') {
                if (state.inventory.gold >= 50) {
                    iconKey = 'scale';
                    mainText = 'VERGİYİ ÖDE (50 Altın) & DİRİL (E)';
                    shortText = 'Diriliş (50A)';
                } else {
                    iconKey = 'mining';
                    mainText = `YERALTI TAŞI KIR (E) [${state.ahiretDebt || 5}]`;
                    shortText = `Taş Kır (${state.ahiretDebt || 5})`;
                }
            } else if (realmId === 'saray') {
                iconKey = 'palace';
                mainText = 'SET\'E BOYUN EĞ / İSYAN ET (E)';
                shortText = 'İsyan Et';
            } else {
                // Mısır Açık Dünya
                if (p.role.startsWith('god') || ['hathor', 'nephthys', 'isis', 'astarte', 'anat', 'bastet'].includes(p.role)) {
                    iconKey = 'lightning';
                    mainText = 'İLAHİ GÜÇLE SALDIR (E)';
                    shortText = 'İlahi Saldırı';
                } else {
                    iconKey = 'wheat';
                    mainText = 'NİL HASADI & MADENCİLİK (E)';
                    shortText = 'Nil Hasadı';
                }
            }

            // Mobil düğmeyi güncelle
            if (label) label.textContent = mainText;
            if (icon && typeof getIcon === 'function') icon.innerHTML = getIcon(iconKey, 'normal');

            // PC Hotbar Slot 3 düğmesini güncelle
            if (hotbarLabel) hotbarLabel.textContent = shortText;
            if (hotbarIcon && typeof getIcon === 'function') hotbarIcon.innerHTML = getIcon(iconKey, 'normal');
        }

        updateContextAction(labelStr, iconType) {
            const label = document.getElementById('hud-context-label');
            const icon = document.getElementById('hud-context-icon');
            const hotbarLabel = document.getElementById('hud-hotbar-context-label');
            const hotbarIcon = document.getElementById('hud-hotbar-context-icon');

            if (label && labelStr) label.textContent = `${labelStr.toUpperCase()} (E)`;
            if (hotbarLabel && labelStr) hotbarLabel.textContent = labelStr;

            const iconMap = {
                'pickaxe': 'mining',
                'wheat': 'wheat',
                'sparkle': 'sparkle',
                'attack': 'attack'
            };
            const mapped = iconMap[iconType] || iconType || 'wheat';

            if (typeof getIcon === 'function') {
                if (icon) icon.innerHTML = getIcon(mapped, 'normal');
                if (hotbarIcon) hotbarIcon.innerHTML = getIcon(mapped, 'normal');
            }
        }

        triggerContextAction() {
            const state = window.GameState ? window.GameState.state : null;
            if (!state) return;
            const realmId = this.currentRealm.id;

            if (realmId === 'raningemisi') {
                const res = window.GameState.donatePrayerToRa(25);
                if (res.success) {
                    this.showToast(`✨ Ra\'nın Güneş Gemisine dua bağışladın! Apophis\'in Kalan Canı: ${res.apophisHp}`, 'gold');
                } else {
                    this.showToast(res.msg, 'danger');
                }
            } else if (realmId === 'horustapinak') {
                if (!state.player.hasEyeOfHorus) {
                    state.player.hasEyeOfHorus = true;
                    window.GameState.updateQuestProgress('steal_eye', 1);
                    window.GameState.addResource('golden_blood', 2);
                    window.GameState.addChatMessage('SOYGUN BAŞARILI', 'Horus\'un Gözü çalındı! Piramidin koruma büyüleri çöktü! Tanrı gücü seninle!', 'god');
                    if (window.GameAudio) window.GameAudio.playSfx('god_ascend');
                    this.showToast('👁️ HORUS\'UN GÖZÜNÜ ÇALDIN! Tanrıya yükseliş gücü açıldı!', 'gold');
                    window.GameState.saveState();
                } else {
                    this.showToast('Çıkış kapısına doğru ilerle!', 'system');
                }
            } else if (realmId === 'ahiret') {
                if (state.inventory.gold >= 50) {
                    window.GameState.payAhiretTax();
                    this.showToast('Anubis vergini kabul etti. Dünyaya diriliyorsun!', 'gold');
                } else {
                    const res = window.GameState.mineUnderworldRock();
                    if (!res.finished) {
                        this.showToast(`Yeraltı taşı kırıldı! Kalan taş: ${res.remaining}`, 'system');
                    } else {
                        this.showToast('Cezan doldu! Dünyaya diriliyorsun...', 'gold');
                    }
                }
            } else if (realmId === 'saray') {
                this.showToast('Set kükredi: "Bana altın sunmayan ölümlüler ezilecektir!"', 'danger');
            } else {
                // Açık Dünya: Gerçek MMORPG Kaynak Toplama, Hasat ve Madencilik
                const divineRoles = ['god_horus', 'god_set', 'horus_god', 'set_god', 'hathor', 'nephthys', 'isis', 'astarte', 'anat', 'bastet'];
                if (divineRoles.includes(state.player.role)) {
                    if (window.EgyptCombatEngine) window.EgyptCombatEngine.performAttack();
                } else if (window.EgyptGatheringEngine) {
                    window.EgyptGatheringEngine.interactClosest();
                } else {
                    this.showToast('⚠️ Yakınında toplanacak kaynak yok! Nil buğday tarlasına yaklaş!', 'danger');
                }
            }
        }

        renderChatMessages(chatLog) {
            const container = document.getElementById('hud-chat-messages');
            if (!container) return;
            container.innerHTML = '';

            let filtered = chatLog || [];
            if (this.activeChatFilter === 'realm') {
                filtered = filtered.filter(m => m.type === 'player' || m.type === 'realm');
            } else if (this.activeChatFilter === 'combat') {
                filtered = filtered.filter(m => m.type === 'combat' || m.type === 'danger');
            } else if (this.activeChatFilter === 'system') {
                filtered = filtered.filter(m => m.type === 'system' || m.type === 'god' || m.type === 'blood');
            }

            filtered.slice(-16).forEach(msg => {
                const row = document.createElement('div');
                let colorClass = 'text-amber-100/90';
                let tag = '';
                if (msg.type === 'god') {
                    colorClass = 'text-yellow-300 font-bold';
                    tag = '<span class="text-[9px] px-1 py-0.2 rounded bg-yellow-500/20 text-yellow-300 mr-1">TANRI</span>';
                } else if (msg.type === 'blood') {
                    colorClass = 'text-amber-400 font-black';
                    tag = '<span class="text-[9px] px-1 py-0.2 rounded bg-amber-500/20 text-amber-300 mr-1">ALTIN KAN</span>';
                } else if (msg.type === 'system') {
                    colorClass = 'text-cyan-300 font-semibold';
                    tag = '<span class="text-[9px] px-1 py-0.2 rounded bg-cyan-500/20 text-cyan-300 mr-1">SİSTEM</span>';
                } else if (msg.type === 'danger') {
                    colorClass = 'text-red-400 font-bold';
                    tag = '<span class="text-[9px] px-1 py-0.2 rounded bg-red-500/20 text-red-300 mr-1">UYARI</span>';
                } else if (msg.type === 'combat') {
                    colorClass = 'text-orange-300 font-semibold';
                    tag = '<span class="text-[9px] px-1 py-0.2 rounded bg-orange-500/20 text-orange-300 mr-1">SAVAŞ</span>';
                } else {
                    tag = '<span class="text-[9px] px-1 py-0.2 rounded bg-blue-500/20 text-sky-300 mr-1">DİYAR</span>';
                }

                row.className = `leading-tight text-[11px] py-0.5 border-b border-white/5 ${colorClass}`;
                row.innerHTML = `<span class="text-[9px] text-amber-500/60 font-mono">[${msg.time}]</span> ${tag} <strong class="text-amber-200">${msg.sender}:</strong> <span>${msg.text}</span>`;
                container.appendChild(row);
            });
            container.scrollTop = container.scrollHeight;
        }

        sendChatMsg() {
            const input = document.getElementById('hud-chat-input');
            if (!input || !input.value.trim()) return;
            const text = input.value.trim();
            input.value = '';

            const p = window.GameState ? window.GameState.state.player : { name: 'Oyuncu' };

            // Özel komutlar
            if (text === '/altin') {
                window.GameState.addResource('gold', 100);
                window.GameState.addChatMessage('HİLE', '100 Altın eklendi!', 'system');
                return;
            }
            if (text === '/kan') {
                window.GameState.addResource('golden_blood', 5);
                window.GameState.addChatMessage('HİLE', '5 Altın Kan eklendi!', 'system');
                return;
            }
            if (text === '/iksir') {
                this.useHealthPotion();
                return;
            }

            window.GameState.addChatMessage(p.name, text, 'player');
        }

        toggleAudio() {
            if (window.GameAudio) {
                const isMuted = window.GameAudio.toggleMute();
                const iconEl = document.getElementById('audio-icon');
                if (iconEl && typeof getIcon === 'function') {
                    iconEl.innerHTML = getIcon(isMuted ? 'audioMuted' : 'audio', 'normal');
                }
                this.showToast(isMuted ? 'Ses Kapatıldı' : 'Ses Açıldı', 'system');
            }
        }

        // ==========================================
        // POP-UP MODALLAR
        // ==========================================
        openModal(modalType) {
            const container = document.getElementById('mmo-modal-container');
            const content = document.getElementById('mmo-modal-content');
            if (!container || !content) return;

            const state = window.GameState ? window.GameState.state : null;
            if (!state) return;

            let html = '';

            switch(modalType) {
                case 'realm':
                    html = `
                        <div class="flex items-center justify-between border-b border-amber-500/30 pb-3">
                            <h2 class="hud-font-title text-xl font-black text-amber-300 flex items-center gap-2">
                                <span>🗺️</span> DİYAR HARİTASI & HIZLI SEYAHAT
                            </h2>
                            <button onclick="window.GameHUD.closeModal()" class="text-amber-400 text-2xl font-bold hover:text-white">&times;</button>
                        </div>
                        <p class="text-xs text-amber-200/80">Mısır Tanrıları evreninde istediğin diyara anında ışınlanabilirsin. Karakterin ve eşyaların korunur.</p>
                        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-2">
                            ${REALMS.map(r => `
                                <div class="hud-glass rounded-2xl p-3.5 flex flex-col justify-between gap-2 border ${r.id === this.currentRealm.id ? 'border-amber-400 bg-amber-950/40' : 'border-amber-500/30'} hover:border-amber-400 transition-all">
                                    <div class="flex items-center gap-2.5">
                                        <span class="text-2xl">${r.icon}</span>
                                        <div>
                                            <h3 class="font-black text-sm text-amber-200">${r.name}</h3>
                                            <p class="text-[11px] text-amber-300/70">${r.desc}</p>
                                        </div>
                                    </div>
                                    <button onclick="window.GameState.teleportTo('${r.file}')" class="${r.id === this.currentRealm.id ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40 cursor-default' : 'gold-btn'} py-1.5 px-3 rounded-xl text-xs font-bold text-center mt-1">
                                        ${r.id === this.currentRealm.id ? '📍 Şu An Buradasın' : 'Işınlan →'}
                                    </button>
                                </div>
                            `).join('')}
                        </div>
                    `;
                    break;

                case 'ascend':
                    const canAscend = window.GameState.canAscend();
                    html = `
                        <div class="flex items-center justify-between border-b border-amber-500/30 pb-3">
                            <h2 class="hud-font-title text-xl font-black text-amber-300 flex items-center gap-2">
                                <span>⚡</span> İLÂHİ TANRIYA YÜKSELİŞ & ŞEKİL DEĞİŞTİRME
                            </h2>
                            <button onclick="window.GameHUD.closeModal()" class="text-amber-400 text-2xl font-bold hover:text-white">&times;</button>
                        </div>
                        <div class="text-xs text-amber-100 flex flex-col gap-2">
                            <p>Filmdeki gibi, yeterli güce veya <strong>Horus'un Gözü</strong> kalıntısına ulaşan ölümlüler <strong>2.5 kat devasa boyutta</strong> altın zırhlı Tanrılara dönüşebilir!</p>
                            <div class="hud-glass rounded-xl p-3 flex items-center justify-between">
                                <div>
                                    <div class="font-bold text-amber-300">İlahi Lütuf Puanın: ${state.player.divineFavor} / 50</div>
                                    <div class="text-[11px] text-amber-400/80">Horus'un Gözü: ${state.player.hasEyeOfHorus ? '✅ Elde Edildi' : '❌ Henüz çalınmadı'}</div>
                                </div>
                                <span class="text-xs px-2.5 py-1 rounded-full ${canAscend ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-400' : 'bg-red-500/20 text-red-300 border border-red-400'} font-bold">
                                    ${canAscend ? 'Yükselişe Hazır' : 'Yetersiz Güç'}
                                </span>
                            </div>
                        </div>

                        <div class="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-5 gap-2.5 mt-1">
                            <div class="hud-glass rounded-2xl p-2.5 flex flex-col items-center text-center gap-1.5 border border-amber-500/40">
                                <span class="text-3xl">🦅</span>
                                <h3 class="font-black text-xs text-yellow-300">Horus (Altın Şahin)</h3>
                                <p class="text-[10px] text-amber-200/80">3.5m Devasa Zırh, Biyomekanik Kanatlar, Şahin Miğferi.</p>
                                <button onclick="window.GameState.setCharacterRole('horus_god'); window.GameHUD.closeModal();" class="gold-btn w-full py-1.5 rounded-xl text-[11px] font-black mt-auto">
                                    Horus Zırh (3.5m)
                                </button>
                            </div>

                            <div class="hud-glass rounded-2xl p-2.5 flex flex-col items-center text-center gap-1.5 border border-amber-500/40">
                                <span class="text-3xl">🐺</span>
                                <h3 class="font-black text-xs text-red-400">Set (Altın Çakal)</h3>
                                <p class="text-[10px] text-amber-200/80">3.6m Devasa Zırh, Çakal Miğferi, Kızıl Pelerin, Kaos Asası.</p>
                                <button onclick="window.GameState.setCharacterRole('set_god'); window.GameHUD.closeModal();" class="gold-btn w-full py-1.5 rounded-xl text-[11px] font-black mt-auto">
                                    Set Zırh (3.6m)
                                </button>
                            </div>

                            <div class="hud-glass rounded-2xl p-2.5 flex flex-col items-center text-center gap-1.5 border border-amber-500/40">
                                <span class="text-3xl">👑</span>
                                <h3 class="font-black text-xs text-amber-300">İnsan Horus (2.8m)</h3>
                                <p class="text-[10px] text-amber-200/80">Prens Formu, Altın Usekh Gerdanlık, Kraliyet Tacı.</p>
                                <button onclick="window.GameState.setCharacterRole('horus_human'); window.GameHUD.closeModal();" class="action-pill-btn w-full py-1.5 rounded-xl text-[11px] font-bold mt-auto">
                                    İnsan Horus
                                </button>
                            </div>

                            <div class="hud-glass rounded-2xl p-2.5 flex flex-col items-center text-center gap-1.5 border border-amber-500/40">
                                <span class="text-3xl">🧑</span>
                                <h3 class="font-black text-xs text-amber-300">Ölümlü Bek (Hırsız)</h3>
                                <p class="text-[10px] text-amber-200/80">1.05m Çevik Form, Çift Khopesh Hançeri, Tapınak Casusu.</p>
                                <button onclick="window.GameState.setCharacterRole('bek'); window.GameHUD.closeModal();" class="action-pill-btn w-full py-1.5 rounded-xl text-[11px] font-bold mt-auto">
                                    Bek Formu
                                </button>
                            </div>

                            <div class="hud-glass rounded-2xl p-2.5 flex flex-col items-center text-center gap-1.5 border border-amber-500/40">
                                <span class="text-3xl">🌾</span>
                                <h3 class="font-black text-xs text-amber-200">Mısırlı Köylü</h3>
                                <p class="text-[10px] text-amber-200/80">0.98m Sade Keten Tünik, Tarım ve Madencilik Kölesi.</p>
                                <button onclick="window.GameState.setCharacterRole('villager'); window.GameHUD.closeModal();" class="action-pill-btn w-full py-1.5 rounded-xl text-[11px] font-bold mt-auto">
                                    Köylü Formu
                                </button>
                            </div>
                        </div>

                        <div class="flex items-center justify-between border-t border-amber-500/20 pt-2 text-xs">
                            <span class="text-amber-400/80">Modelleri 360° döndürerek detaylı incelemek ister misin?</span>
                            <button onclick="window.GameState.teleportTo('karaktertanrilar.html')" class="gold-btn px-3 py-1 rounded-xl text-[11px] font-bold">
                                🔍 Karakter & Zırh Vitrinine Git
                            </button>
                        </div>
                    `;
                    break;

                case 'craft':
                    const inv = state.inventory;
                    html = `
                        <div class="flex items-center justify-between border-b border-amber-500/30 pb-3">
                            <h2 class="hud-font-title text-xl font-black text-amber-300 flex items-center gap-2">
                                <span>🔨</span> EFSANEVİ ALTIN KAN DEMİRHANESİ
                            </h2>
                            <button onclick="window.GameHUD.closeModal()" class="text-amber-400 text-2xl font-bold hover:text-white">&times;</button>
                        </div>
                        <p class="text-xs text-amber-200/80">Tanrılar hasar aldığında dökülen <strong>Altın Kan (Golden Blood)</strong> ile Mısır'ın en güçlü silahlarını üret!</p>

                        <div class="flex flex-col gap-2.5 mt-1">
                            <div class="hud-glass rounded-2xl p-3 flex items-center justify-between gap-3 border border-amber-500/40">
                                <div class="flex items-center gap-3">
                                    <span class="text-3xl">🔱</span>
                                    <div>
                                        <h4 class="font-black text-sm text-amber-200">Horus'un Altın Mızrağı</h4>
                                        <p class="text-[11px] text-amber-300/70">+45 Saldırı • Gereksinim: 3 Altın Kan, 6 Bakır, 40 Altın</p>
                                    </div>
                                </div>
                                <button onclick="window.GameHUD.craft('horus_spear')" class="gold-btn px-4 py-2 rounded-xl text-xs font-black whitespace-nowrap">
                                    Üret
                                </button>
                            </div>

                            <div class="hud-glass rounded-2xl p-3 flex items-center justify-between gap-3 border border-amber-500/40">
                                <div class="flex items-center gap-3">
                                    <span class="text-3xl">⚔️</span>
                                    <div>
                                        <h4 class="font-black text-sm text-amber-200">Set'in Çöl Khopesh'i</h4>
                                        <p class="text-[11px] text-amber-300/70">+60 Saldırı • Gereksinim: 5 Altın Kan, 10 Bakır, 60 Altın</p>
                                    </div>
                                </div>
                                <button onclick="window.GameHUD.craft('set_khopesh')" class="gold-btn px-4 py-2 rounded-xl text-xs font-black whitespace-nowrap">
                                    Üret
                                </button>
                            </div>

                            <div class="hud-glass rounded-2xl p-3 flex items-center justify-between gap-3 border border-amber-500/40">
                                <div class="flex items-center gap-3">
                                    <span class="text-3xl">☀️</span>
                                    <div>
                                        <h4 class="font-black text-sm text-amber-200">Ra'nın Güneş Asası</h4>
                                        <p class="text-[11px] text-amber-300/70">+120 Saldırı • Gereksinim: 8 Altın Kan, Güneş Kristali, 100 Altın</p>
                                    </div>
                                </div>
                                <button onclick="window.GameHUD.craft('ra_staff')" class="gold-btn px-4 py-2 rounded-xl text-xs font-black whitespace-nowrap">
                                    Üret
                                </button>
                            </div>

                            <div class="hud-glass rounded-2xl p-3 flex items-center justify-between gap-3 border border-amber-500/40">
                                <div class="flex items-center gap-3">
                                    <span class="text-3xl">🛡️</span>
                                    <div>
                                        <h4 class="font-black text-sm text-amber-200">Altın Tanrı Zırhı</h4>
                                        <p class="text-[11px] text-amber-300/70">+150 Can • Gereksinim: 6 Altın Kan, 12 Bakır, 80 Altın</p>
                                    </div>
                                </div>
                                <button onclick="window.GameHUD.craft('god_cuirass')" class="gold-btn px-4 py-2 rounded-xl text-xs font-black whitespace-nowrap">
                                    Üret
                                </button>
                            </div>
                        </div>
                    `;
                    break;

                case 'obelisk':
                    html = `
                        <div class="flex items-center justify-between border-b border-amber-500/30 pb-3">
                            <h2 class="hud-font-title text-xl font-black text-amber-300 flex items-center gap-2">
                                <span>🏛️</span> DEVASA DİKİLİTAŞ (OBELİSK) İNŞAATI
                            </h2>
                            <button onclick="window.GameHUD.closeModal()" class="text-amber-400 text-2xl font-bold hover:text-white">&times;</button>
                        </div>
                        <p class="text-xs text-amber-200/80">Tanrı Set'in emriyle tüm ölümlüler göğe uzanan devasa dikilitaşları inşa etmek için odun ve taş taşır. İnşaata katılanlara altın ve İlahi Lütuf dağıtılır!</p>

                        <div class="hud-glass rounded-2xl p-4 flex flex-col gap-3 my-2">
                            <div class="flex items-center justify-between font-bold text-sm">
                                <span class="text-amber-300">Sunucu İnşaat İlerlemesi:</span>
                                <span class="text-yellow-400 text-lg font-black">%${state.obelisk.progress}</span>
                            </div>
                            <div class="w-full bg-black/70 rounded-full h-4 overflow-hidden border border-amber-500/40 relative">
                                <div class="h-full bg-gradient-to-r from-amber-600 via-amber-400 to-yellow-300 transition-all duration-500" style="width: ${state.obelisk.progress}%;"></div>
                            </div>
                            <div class="flex items-center justify-between text-xs text-amber-300/80">
                                <span>Senin Katkın: ${state.obelisk.playerContributed} Kez</span>
                                <span>Kalan Taş: ${state.inventory.stone} • Odun: ${state.inventory.wood}</span>
                            </div>
                        </div>

                        <button onclick="window.GameHUD.contributeObelisk()" class="gold-btn py-3 rounded-2xl text-sm font-black flex items-center justify-center gap-2 shadow-xl">
                            <span>🪵</span> 5 Taş ve 5 Odun Bağışla (+35 Altın, +8 Lütuf)
                        </button>
                    `;
                    break;

                case 'inventory':
                    html = `
                        <div class="flex items-center justify-between border-b border-amber-500/30 pb-3">
                            <h2 class="hud-font-title text-xl font-black text-amber-300 flex items-center gap-2">
                                <span>🎒</span> OYUNCU ÇANTASI & ENVANTER
                            </h2>
                            <button onclick="window.GameHUD.closeModal()" class="text-amber-400 text-2xl font-bold hover:text-white">&times;</button>
                        </div>
                        <div class="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mt-2">
                            <div class="hud-glass p-3 rounded-2xl flex flex-col items-center text-center gap-1">
                                <span class="text-3xl">🪙</span>
                                <span class="text-xs font-bold text-yellow-300">Altın</span>
                                <span class="text-base font-black">${state.inventory.gold}</span>
                            </div>
                            <div class="hud-glass p-3 rounded-2xl flex flex-col items-center text-center gap-1 border border-amber-400">
                                <span class="text-3xl">🩸</span>
                                <span class="text-xs font-bold text-amber-400">Altın Kan</span>
                                <span class="text-base font-black">${state.inventory.golden_blood}</span>
                            </div>
                            <div class="hud-glass p-3 rounded-2xl flex flex-col items-center text-center gap-1">
                                <span class="text-3xl">🌾</span>
                                <span class="text-xs font-bold text-lime-300">Nil Buğdayı</span>
                                <span class="text-base font-black">${state.inventory.wheat}</span>
                            </div>
                            <div class="hud-glass p-3 rounded-2xl flex flex-col items-center text-center gap-1">
                                <span class="text-3xl">📜</span>
                                <span class="text-xs font-bold text-amber-200">Papirüs</span>
                                <span class="text-base font-black">${state.inventory.papyrus}</span>
                            </div>
                            <div class="hud-glass p-3 rounded-2xl flex flex-col items-center text-center gap-1">
                                <span class="text-3xl">🧱</span>
                                <span class="text-xs font-bold text-stone-300">Taş Blok</span>
                                <span class="text-base font-black">${state.inventory.stone}</span>
                            </div>
                            <div class="hud-glass p-3 rounded-2xl flex flex-col items-center text-center gap-1">
                                <span class="text-3xl">🪵</span>
                                <span class="text-xs font-bold text-amber-600">Sedir Odunu</span>
                                <span class="text-base font-black">${state.inventory.wood}</span>
                            </div>
                            <div class="hud-glass p-3 rounded-2xl flex flex-col items-center text-center gap-1">
                                <span class="text-3xl">🪓</span>
                                <span class="text-xs font-bold text-orange-400">Bakır Külçe</span>
                                <span class="text-base font-black">${state.inventory.copper}</span>
                            </div>
                            <div class="hud-glass p-3 rounded-2xl flex flex-col items-center text-center gap-1">
                                <span class="text-3xl">🐊</span>
                                <span class="text-xs font-bold text-emerald-400">Timsah Derisi</span>
                                <span class="text-base font-black">${state.inventory.croc_hide}</span>
                            </div>
                        </div>

                        <div class="mt-3 border-t border-amber-500/30 pt-3">
                            <h4 class="font-bold text-xs text-amber-300 mb-2">KUŞANILAN SİLAHLAR:</h4>
                            <div class="flex flex-wrap gap-2">
                                ${state.inventory.weapons.map(w => `
                                    <span class="px-3 py-1.5 rounded-xl bg-amber-500/20 border border-amber-400 text-xs font-bold text-amber-200 flex items-center gap-1">
                                        <span>⚔️</span> ${w}
                                    </span>
                                `).join('')}
                            </div>
                        </div>
                    `;
                    break;

                case 'quests':
                    // Use new TutorialSystem for quests
                    if (window.TutorialSystem) {
                        window.TutorialSystem.renderQuestModal();
                        container.classList.remove('hidden');
                        this.activeModal = modalType;
                        return;
                    }
                    // Fallback to old system
                    html = `
                        <div class="flex items-center justify-between border-b border-amber-500/30 pb-3">
                            <h2 class="hud-font-title text-xl font-black text-amber-300 flex items-center gap-2">
                                <span>📜</span> MISIR TANRILARI GÖREV LİSTESİ
                            </h2>
                            <button onclick="window.GameHUD.closeModal()" class="text-amber-400 text-2xl font-bold hover:text-white">&times;</button>
                        </div>
                        <div class="flex flex-col gap-2.5 mt-2">
                            ${state.quests.map(q => `
                                <div class="hud-glass rounded-2xl p-3 flex flex-col gap-1.5 border ${q.done ? 'border-emerald-500/50 bg-emerald-950/20' : 'border-amber-500/40'}">
                                    <div class="flex items-center justify-between">
                                        <h4 class="font-black text-sm text-amber-200 flex items-center gap-1.5">
                                            <span>${q.done ? '✅' : '⏳'}</span> ${q.title}
                                        </h4>
                                        <span class="text-[11px] font-bold ${q.done ? 'text-emerald-400' : 'text-amber-400'}">${q.progress} / ${q.target}</span>
                                    </div>
                                    <p class="text-xs text-amber-300/80">${q.desc}</p>
                                    <div class="text-[10px] text-yellow-400 font-semibold">Ödül: ${q.reward}</div>
                                </div>
                            `).join('')}
                        </div>
                    `;
                    break;
            }

            content.innerHTML = html;
            container.classList.remove('hidden');
            this.activeModal = modalType;
        }

        closeModal() {
            const container = document.getElementById('mmo-modal-container');
            if (container) container.classList.add('hidden');
            this.activeModal = null;
        }

        craft(recipeId) {
            const res = window.GameState.craftLegendaryWeapon(recipeId);
            if (res.success) {
                this.showToast(`🎉 ${res.item} başarıyla dövüldü!`, 'gold');
                this.openModal('craft'); // Refresh modal
            } else {
                this.showToast(res.msg, 'danger');
            }
        }

        contributeObelisk(openAfterContribution = true) {
            const res = window.GameState.contributeToObelisk(5, 5);
            if (res.success) {
                this.showToast(`Obelisk %${res.progress} seviyesine yükseltildi!`, 'gold');
                if (openAfterContribution) this.openModal('obelisk');
            } else {
                this.showToast(res.msg, 'danger');
            }
        }

        showToast(msg, type = 'system') {
            const area = document.getElementById('hud-toast-area');
            if (!area) return;

            const toast = document.createElement('div');
            let border = 'border-amber-400';
            let bg = 'rgba(20, 12, 5, 0.95)';
            let icon = '';
            
            if (type === 'gold') {
                border = 'border-yellow-300';
                bg = 'linear-gradient(135deg, rgba(50, 30, 10, 0.95), rgba(30, 15, 5, 0.95))';
                if (typeof getIcon === 'function') icon = getIcon('sparkle', 'normal');
            } else if (type === 'danger') {
                border = 'border-red-500';
                bg = 'rgba(50, 10, 10, 0.95)';
                if (typeof getIcon === 'function') icon = getIcon('alert', 'normal');
            } else {
                if (typeof getIcon === 'function') icon = getIcon('check', 'normal');
            }

            toast.className = `hud-floating-toast px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-black text-amber-200 border-2 ${border} shadow-2xl flex items-center gap-2`;
            toast.style.background = bg;
            
            // Remove emojis from message if present
            let cleanMsg = msg
                .replace(/⚡/g, '')
                .replace(/✨/g, '')
                .replace(/👁️/g, '')
                .replace(/🎉/g, '')
                .trim();
            
            toast.innerHTML = `${icon}<span>${cleanMsg}</span>`;

            area.appendChild(toast);
            setTimeout(() => {
                if (toast.parentNode) toast.parentNode.removeChild(toast);
            }, 2500);
        }

        updateCameraModeUI(isFirstPerson) {
            const btn = document.getElementById('hud-cam-btn');
            const label = document.getElementById('cam-label');
            const icon = document.getElementById('cam-icon');
            if (!btn || !label) return;
            if (isFirstPerson) {
                btn.classList.add('bg-amber-400', 'text-black', 'shadow-amber-400/50');
                btn.classList.remove('bg-amber-500/20', 'text-amber-200');
                if (icon) icon.textContent = '🎥';
                label.textContent = '[V] 3. ŞAHIS';
            } else {
                btn.classList.remove('bg-amber-400', 'text-black', 'shadow-amber-400/50');
                btn.classList.add('bg-amber-500/20', 'text-amber-200');
                if (icon) icon.textContent = '👁️';
                label.textContent = '[V] 1. ŞAHIS';
            }
        }
    }

    // Auto initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            window.GameHUD = new GameHUDManager();
        });
    } else {
        window.GameHUD = new GameHUDManager();
    }
})(window);
