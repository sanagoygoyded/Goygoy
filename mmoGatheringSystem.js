/**
 * Gods of Egypt MMORPG - Unified Gathering, Harvesting & Auto-Questing Engine
 * Gerçek MMORPG Kaynak Toplama, Hasat/Madencilik Cast Barı, Ultra Gerçekçi İnsansı Animasyonlar
 * ve Otomatik Göreve Gitme / Otomatik Kasılma (Auto-Pathfinding & Auto-Grind) Sistemi
 */

(function(window) {
    'use strict';

    // Dünyadaki Gerçek Fiziksel Kaynak Noktaları (Resource Nodes)
    const WORLD_NODES = {
        misir: [
            // Nil Papirüs Sazlıkları (Nehir Kıyısı)
            { id: 'papyrus_bed_1', name: 'Nil Kıyı Papirüsü', type: 'harvest', resource: 'papyrus', yield: 3, exp: 16, x: 30.5, y: 0.05, z: -25.0, castTime: 3.0, respawnSec: 15, icon: '📜' },
            { id: 'papyrus_bed_2', name: 'Kraliyet Papirüs Sazlığı', type: 'harvest', resource: 'papyrus', yield: 4, exp: 18, x: 31.0, y: 0.05, z: 32.0, castTime: 3.0, respawnSec: 15, icon: '📜' },
            { id: 'papyrus_bed_3', name: 'Doğu Kıyı Papirüs Kümesi', type: 'harvest', resource: 'papyrus', yield: 3, exp: 16, x: 84.0, y: 0.05, z: -45.0, castTime: 3.0, respawnSec: 15, icon: '📜' },

            // Firavun Taş ve Bakır Ocağı (Güneybatı Kanyon Terası)
            { id: 'copper_vein_1', name: 'Zengin Bakır Damarı', type: 'mine', resource: 'copper', yield: 3, exp: 25, x: -82.0, y: 0.8, z: 108.0, castTime: 3.6, respawnSec: 18, icon: '🪓' },
            { id: 'copper_vein_2', name: 'Doğal Bakır Yatağı', type: 'mine', resource: 'copper', yield: 4, exp: 28, x: -88.0, y: 0.8, z: 128.0, castTime: 3.6, respawnSec: 20, icon: '🪓' },
            { id: 'stone_quarry_1', name: 'Piramit Kireçtaşı Bloğu', type: 'mine', resource: 'stone', yield: 5, exp: 22, x: -94.0, y: 0.8, z: 118.0, castTime: 3.4, respawnSec: 16, icon: '🧱' },
            { id: 'stone_quarry_2', name: 'Granit Taş Yatağı', type: 'mine', resource: 'stone', yield: 6, exp: 24, x: -74.0, y: 0.8, z: 124.0, castTime: 3.4, respawnSec: 16, icon: '🧱' },

            // Obelisk İnşaat Sahası
            { id: 'obelisk_site', name: 'Horus Dikilitaşı', type: 'obelisk', resource: 'obelisk', yield: 0, exp: 35, x: -14.5, y: 0.2, z: -14.0, castTime: 2.5, respawnSec: 1, icon: '🏛️' }
        ],
        ahiret: [
            { id: 'underworld_ore_1', name: 'Ruhlar Kanyonu Taşı', type: 'mine', resource: 'stone', yield: 4, exp: 30, x: -15.0, y: 0.2, z: -20.0, castTime: 3.2, respawnSec: 12, icon: '💀' },
            { id: 'underworld_ore_2', name: 'Obsidyen Mezar Damarı', type: 'mine', resource: 'stone', yield: 5, exp: 35, x: 25.0, y: 0.2, z: 35.0, castTime: 3.5, respawnSec: 14, icon: '🧱' }
        ],
        raningemisi: [
            { id: 'solar_altar', name: 'Ra\'nın Güneş Sunağı', type: 'pray', resource: 'divine_favor', yield: 10, exp: 50, x: 0.0, y: 2.2, z: -15.0, castTime: 3.0, respawnSec: 5, icon: '☀️' }
        ],
        horustapinak: [
            { id: 'horus_eye_altar', name: 'Horus\'un Gözü Sunağı', type: 'steal', resource: 'eye_of_horus', yield: 1, exp: 200, x: 0.0, y: 1.5, z: -115.0, castTime: 3.5, respawnSec: 1, icon: '👁️' }
        ]
    };

    class EgyptGatheringEngine {
        constructor() {
            this.nodes = [];
            this.activeHarvest = null;
            this.nearestNode = null;
            this.interactionDist = 4.0;
            this.castTimer = 0;
            this.castDuration = 0;
            this.isChanneling = false;
            this.channelNode = null;
            this.wheatInteractionNode = null;
            this.domElements = {};
            this.waypointMarker = null;

            // Otomatik Göreve Gitme ve Otomatik Kasılma (Auto-Grind) Durumu
            this.autoState = {
                active: false,
                type: null, // 'quest' | 'resource'
                targetObj: null,
                questId: null,
                targetPos: null,
                remainingToGather: 0,
                statusText: '',
                stuckTimer: 0,
                lastPos: null,
                path: null,
                pathIndex: 0,
                pathGoal: null,
                crossingDirection: null,
                crossingBridgeZ: null
            };

            this.init();
        }

        init() {
            if (document.body) {
                this.createDOM();
            } else {
                document.addEventListener('DOMContentLoaded', () => this.createDOM());
            }
            this.loadRealmNodes();

            // Klavye ve fare ile iptal dinleyicisi
            window.addEventListener('keydown', (e) => {
                const k = e.key.toLowerCase();
                if (['w', 'a', 's', 'd', 'arrowup', 'arrowdown', 'arrowleft', 'arrowright', ' '].includes(k)) {
                    if (this.isChanneling) {
                        this.cancelGathering('Hareket edildiği için hasat iptal edildi!');
                    }
                    if (this.autoState.active) {
                        this.cancelAutoNavigation('Oyuncu yön kontrolünü devraldı.');
                    }
                }
            });
        }

        detectRealm() {
            const path = decodeURIComponent(window.location.pathname.toLowerCase());
            if (path.includes('saray')) return 'saray';
            if (path.includes('raningemisi')) return 'raningemisi';
            if (path.includes('ahiret')) return 'ahiret';
            if (path.includes('horustap')) return 'horustapinak';
            if (path.includes('karakter')) return 'karaktertanrilar';
            return 'misir';
        }

        loadRealmNodes() {
            const realm = this.detectRealm();
            const defs = WORLD_NODES[realm] || WORLD_NODES.misir;
            this.nodes = defs.map(d => Object.assign({}, d, {
                depleted: false,
                depletedUntil: 0,
                mesh: null
            }));

            if (realm !== 'misir') return;

            const fields = [
                { id: 'west', name: 'Batı Nil Buğdayı', minX: 8.2, maxX: 25.8, minZ: -210, maxZ: 210, roads: [[0, 6], [24, 2.8], [-24, 2.8], [75, 5.5], [-75, 5.5], [150, 5.5], [-150, 5.5]] },
                { id: 'east', name: 'Doğu Nil Buğdayı', minX: 88.5, maxX: 105.5, minZ: -160, maxZ: 160, roads: [[0, 6], [75, 5.5], [-75, 5.5]] }
            ];

            fields.forEach(field => {
                for (let x = field.minX + 1.2; x <= field.maxX - 1.2; x += 2.4) {
                    for (let z = field.minZ + 1.6; z <= field.maxZ - 1.6; z += 3.2) {
                        if (field.roads.some(([center, halfWidth]) => Math.abs(z - center) < halfWidth)) continue;
                        this.nodes.push({
                            id: `wheat_${field.id}_${Math.round(x)}_${Math.round(z)}`,
                            name: field.name,
                            type: 'harvest',
                            resource: 'wheat',
                            yield: 4,
                            exp: 15,
                            x,
                            y: 0.1,
                            z,
                            castTime: 2.8,
                            respawnSec: 12,
                            icon: '🌾',
                            depleted: false,
                            depletedUntil: 0,
                            mesh: null
                        });
                    }
                }
            });
        }

        createDOM() {
            if (!document.body || document.getElementById('mmo-harvest-prompt')) return;
            // 1. Etkileşim İpucu (E'ye Basınız Prompter)
            const prompt = document.createElement('div');
            prompt.id = 'mmo-harvest-prompt';
            prompt.className = 'mmo-harvest-prompt hidden';
            prompt.innerHTML = `
                <div class="mmo-prompt-inner">
                    <span id="mmo-prompt-icon" class="mmo-prompt-icon">🌾</span>
                    <div class="mmo-prompt-text">
                        <span id="mmo-prompt-title" class="font-black text-amber-200 text-sm">Nil Buğdayı</span>
                        <span class="text-[10px] text-amber-400/80 font-bold">[E] Tuşuna Bas veya Tıkla</span>
                    </div>
                    <button id="mmo-prompt-btn" class="mmo-prompt-action-btn">TOPLA</button>
                </div>
            `;
            document.body.appendChild(prompt);

            // 2. MMORPG İlerleme / Cast Barı (Hasat Ediliyor...)
            const castBar = document.createElement('div');
            castBar.id = 'mmo-cast-container';
            castBar.className = 'mmo-cast-container hidden';
            castBar.innerHTML = `
                <div class="mmo-cast-box">
                    <div class="mmo-cast-header">
                        <span id="mmo-cast-icon" class="text-base">🌾</span>
                        <span id="mmo-cast-title" class="mmo-cast-title">Nil Buğdayı Hasat Ediliyor...</span>
                        <span id="mmo-cast-timer" class="mmo-cast-time">0.0s / 2.8s</span>
                    </div>
                    <div class="mmo-cast-bar-bg">
                        <div id="mmo-cast-bar-fill" class="mmo-cast-bar-fill"></div>
                        <div class="mmo-cast-shimmer"></div>
                    </div>
                    <span class="text-[9px] text-amber-300/70 text-center tracking-wide mt-1">İptal etmek için hareket et [WASD]</span>
                </div>
            `;
            document.body.appendChild(castBar);

            // 3. Otomatik Görev & Kasılma Durum Bildirimi (Auto-Quest Banner)
            const autoBanner = document.createElement('div');
            autoBanner.id = 'mmo-auto-banner';
            autoBanner.className = 'mmo-auto-banner hidden';
            autoBanner.innerHTML = `
                <div class="mmo-auto-banner-inner">
                    <div class="mmo-auto-pulsing-radar"></div>
                    <div class="flex flex-col">
                        <span id="mmo-auto-title" class="font-black text-xs sm:text-sm text-amber-200 uppercase tracking-wide">🤖 OTO-GÖREV İLERLİYOR</span>
                        <span id="mmo-auto-desc" class="text-[10px] sm:text-xs text-amber-400 font-semibold">Nil Buğdayı Tarlasına Gidiliyor...</span>
                    </div>
                    <button id="mmo-auto-cancel-btn" class="mmo-auto-cancel-btn">İPTAL [WASD]</button>
                </div>
            `;
            document.body.appendChild(autoBanner);

            this.domElements = {
                prompt,
                promptTitle: document.getElementById('mmo-prompt-title'),
                promptIcon: document.getElementById('mmo-prompt-icon'),
                promptBtn: document.getElementById('mmo-prompt-btn'),
                castContainer: castBar,
                castTitle: document.getElementById('mmo-cast-title'),
                castIcon: document.getElementById('mmo-cast-icon'),
                castTimer: document.getElementById('mmo-cast-timer'),
                castFill: document.getElementById('mmo-cast-bar-fill'),
                autoBanner,
                autoTitle: document.getElementById('mmo-auto-title'),
                autoDesc: document.getElementById('mmo-auto-desc'),
                autoCancelBtn: document.getElementById('mmo-auto-cancel-btn')
            };

            // Buton Tıklamaları
            this.domElements.promptBtn.addEventListener('click', () => {
                if (this.nearestNode) this.startGathering(this.nearestNode);
            });
            this.domElements.autoCancelBtn.addEventListener('click', () => {
                this.cancelAutoNavigation('Oyuncu iptal butonuna bastı.');
            });
        }

        // ==========================================
        // DÜNYA VE YAKINLIK GÜNCELLEMESİ (HER KAREDE ÇALIŞIR)
        // ==========================================
        update(player, delta, elapsed) {
            if (!player || !player.root) return;
            if (this.waypointMarker) {
                this.waypointMarker.rotation.y += delta * 0.8;
                this.waypointMarker.children[0].position.y = 1.6 + Math.sin(elapsed * 2.4) * 0.15;
            }
            const px = player.root.position.x;
            const pz = player.root.position.z;

            // Yeniden doğma (Respawn) sürelerini kontrol et
            const now = elapsed;
            for (let i = 0; i < this.nodes.length; i++) {
                const node = this.nodes[i];
                if (node.depleted && now >= node.depletedUntil) {
                    node.depleted = false;
                }
            }

            // En yakın kaynak noktasını bul
            let closest = null;
            let minDist = Infinity;

            for (let i = 0; i < this.nodes.length; i++) {
                const n = this.nodes[i];
                if (n.depleted || n.resource === 'wheat') continue;
                const dist = Math.hypot(px - n.x, pz - n.z);
                if (dist < minDist) {
                    minDist = dist;
                    closest = n;
                }
            }

            if (typeof window.getNearestWheatStalk === 'function') {
                const stalk = window.getNearestWheatStalk(px, pz, this.interactionDist);
                if (stalk && stalk.distance < minDist) {
                    if (!this.wheatInteractionNode) {
                        this.wheatInteractionNode = {
                            name: 'Nil Buğdayı',
                            type: 'harvest',
                            resource: 'wheat',
                            yield: 4,
                            exp: 15,
                            castTime: 2.8,
                            respawnSec: 12,
                            icon: '🌾'
                        };
                    }
                    Object.assign(this.wheatInteractionNode, {
                        id: `wheat_stalk_${stalk.index}`,
                        x: stalk.x,
                        y: 0.1,
                        z: stalk.z,
                        wheatIndex: stalk.index,
                        depleted: false
                    });
                    minDist = stalk.distance;
                    closest = this.wheatInteractionNode;
                }
            }

            // Etkileşim Prompter'ını Göster / Gizle
            if (closest && minDist <= this.interactionDist && !this.isChanneling) {
                this.nearestNode = closest;
                this.showPrompt(closest, minDist);
                if (window.GameHUD && typeof window.GameHUD.updateContextAction === 'function') {
                    window.GameHUD.updateContextAction(closest.name, closest.type === 'mine' ? 'pickaxe' : 'wheat');
                }
            } else {
                this.nearestNode = null;
                this.hidePrompt();
                if (window.GameHUD && typeof window.GameHUD.updateContextAction === 'function' && !this.isChanneling) {
                    window.GameHUD.updateContextAction('Diyar Etkileşimi', 'sparkle');
                }
            }

            // Aktif Hasat / Madencilik Cast Barını Güncelle
            if (this.isChanneling) {
                this.updateGatheringCast(player, delta, elapsed);
            }

            // Otomatik Görev / Yürüme Motorunu Güncelle
            if (this.autoState.active) {
                this.updateAutoNavigation(player, delta, elapsed);
            }
        }

        showPrompt(node, dist) {
            if (!this.domElements.prompt) return;
            this.domElements.promptTitle.textContent = `${node.name} (${dist.toFixed(1)}m)`;
            this.domElements.promptIcon.textContent = node.icon || '🌾';
            this.domElements.prompt.classList.remove('hidden');
        }

        hidePrompt() {
            if (this.domElements.prompt) {
                this.domElements.prompt.classList.add('hidden');
            }
        }

        // ==========================================
        // GERÇEKÇİ MMORPG HASAT / MADENCİLİK KANALLAMA (CAST BAR)
        // ==========================================
        interactClosest() {
            if (this.nearestNode) {
                this.startGathering(this.nearestNode);
            } else {
                // Eğer hiçbir kaynağın yanında değilse MMORPG uyarısı ver
                if (window.GameHUD) {
                    const realm = this.detectRealm();
                    if (realm === 'misir') {
                        window.GameHUD.showToast('Yakında kaynak yok. Aktif görev kartındaki OTO-GİT düğmesi seni buğdaya veya madene götürür.', 'system');
                    } else if (realm === 'horustapinak') {
                        window.GameHUD.showToast('⚠️ Horus\'un Gözü tapınak sunağının tepesinde! [z: -115]', 'danger');
                    } else if (realm === 'ahiret') {
                        window.GameHUD.showToast('⚠️ Yeraltı maden yataklarının yanına yaklaşmalısın!', 'danger');
                    } else {
                        window.GameHUD.showToast('⚠️ Yakınında etkileşime girilecek bir kaynak bulunamadı.', 'danger');
                    }
                }
            }
        }

        startGathering(node) {
            if (this.isChanneling) return;
            if (node.depleted) {
                if (window.GameHUD) window.GameHUD.showToast('⏳ Bu kaynak yeni hasat edildi, lütfen yeniden büyümesini bekle!', 'system');
                return;
            }

            const state = window.GameState ? window.GameState.state : null;
            if (!state) return;

            if (node.resource === 'wheat' && !Number.isInteger(node.wheatIndex)) {
                const stalk = typeof window.getNearestWheatStalk === 'function'
                    ? window.getNearestWheatStalk(node.x, node.z, 3)
                    : null;
                if (!stalk) {
                    if (window.GameHUD) window.GameHUD.showToast('Yakında hasat edilebilir bir buğday başağı yok.', 'system');
                    return;
                }
                Object.assign(node, {
                    x: stalk.x,
                    z: stalk.z,
                    wheatIndex: stalk.index
                });
            }

            // Obelisk İnşaatı Özel Kontrolü
            if (node.type === 'obelisk') {
                const contributionBefore = state.obelisk.playerContributed;
                if (window.GameHUD) window.GameHUD.contributeObelisk(false);
                if (state.obelisk.playerContributed > contributionBefore) {
                    if (window.TutorialSystem) window.TutorialSystem.updateQuestProgress('donate_obelisk', 1);
                    if (this.autoState.active && this.autoState.type === 'donate_obelisk') {
                        this.completeAutoNavigation('Dikilitaşa malzeme bağışladın.');
                    }
                }
                return;
            }

            // Dayanıklılık / Stamina Kontrolü (15 ST gerekir)
            const curEnergy = state.player.energy || 100;
            if (curEnergy < 12) {
                if (window.GameHUD) window.GameHUD.showToast('⚠️ Çok yorgunsun! Hasat yapmak için dinlen veya Nil iksiri iç!', 'danger');
                return;
            }

            // Kanallamayı Başlat
            this.isChanneling = true;
            this.channelNode = node;
            this.castTimer = 0;
            this.castDuration = node.castTime || 2.8;

            // Oyuncu Modeline İnsansı Hasat Animasyonunu Bildir
            if (window.player) {
                window.player.isGathering = true;
                window.player.gatherType = node.type;
            }

            // Cast Bar UI'sini Göster
            if (this.domElements && this.domElements.castTitle) {
                this.domElements.castTitle.textContent = `${node.name} ${node.type === 'mine' ? 'Kazılıyor...' : 'Hasat Ediliyor...'}`;
                this.domElements.castIcon.textContent = node.icon || '🌾';
                this.domElements.castFill.style.width = '0%';
                this.domElements.castContainer.classList.remove('hidden');
            }
            this.hidePrompt();

            // İlk ses efekti
            if (window.GameAudio) {
                window.GameAudio.playSfx(node.type === 'mine' ? 'combat_clash' : 'harvest');
            }
        }

        updateGatheringCast(player, delta, elapsed) {
            this.castTimer += delta;
            const progress = Math.min(1.0, this.castTimer / this.castDuration);
            const pct = Math.floor(progress * 100);

            if (this.domElements && this.domElements.castFill) {
                this.domElements.castFill.style.width = `${pct}%`;
                this.domElements.castTimer.textContent = `${this.castTimer.toFixed(1)}s / ${this.castDuration.toFixed(1)}s (%${pct})`;
            }

            // Periyodik ses ve çekiçleme darbesi (Madencilikte her vuruşta ses)
            if (this.channelNode && this.channelNode.type === 'mine') {
                if (Math.floor(this.castTimer * 3.5) !== Math.floor((this.castTimer - delta) * 3.5)) {
                    if (window.GameAudio) window.GameAudio.playSfx('combat_clash');
                }
            }

            // Hasat Başarıyla Tamamlandı
            if (this.castTimer >= this.castDuration) {
                this.completeGathering(player, elapsed);
            }
        }

        completeGathering(player, elapsed) {
            const node = this.channelNode;
            this.isChanneling = false;
            this.channelNode = null;
            if (this.domElements && this.domElements.castContainer) {
                this.domElements.castContainer.classList.add('hidden');
            }

            if (player) {
                player.isGathering = false;
            }

            if (!node) return;

            const collectResource = () => {
                if (window.GameState) {
                    window.GameState.addResource(node.resource, node.yield);
                }
                if (window.GameHUD) {
                    window.GameHUD.showToast(`🎉 +${node.yield} ${resName} toplandı! (+${node.exp} XP)`, 'gold');
                }
            };

            const resName = node.resource === 'wheat' ? 'Nil Buğdayı' : (node.resource === 'copper' ? 'Bakır Külçe' : (node.resource === 'stone' ? 'Taş Blok' : 'Papirüs'));
            const hasWheatHarvestAnimation = node.resource === 'wheat'
                && typeof window.harvestWheatStalk === 'function';
            const animatedWheatHarvest = node.resource === 'wheat'
                && hasWheatHarvestAnimation
                && window.harvestWheatStalk(node.wheatIndex, collectResource, elapsed);
            if (hasWheatHarvestAnimation && !animatedWheatHarvest) {
                if (window.GameHUD) window.GameHUD.showToast('Buğday başağı artık hasat edilemiyor; yakındaki başka bir başağı dene.', 'system');
                return;
            }

            // Kaynak noktasını tüket ve yeniden doğma süresi koy.
            node.depleted = true;
            node.depletedUntil = elapsed + node.respawnSec;

            // Envantere ekle ve animasyon tamamlanınca buğday hasadını kaydet.
            if (!animatedWheatHarvest) {
                collectResource();
            }
            if (window.GameState) {
                window.GameState.gainExp(node.exp);

                // Dayanıklılık Tüket (10 ST)
                if (window.GameState.state && window.GameState.state.player) {
                    window.GameState.state.player.energy = Math.max(0, (window.GameState.state.player.energy || 100) - 10);
                }
            }

            // Eğer Otomatik Kasılma (Auto-Grind) Aktifse:
            if (this.autoState.active) {
                this.autoState.remainingToGather -= node.yield;
                if (this.autoState.remainingToGather <= 0) {
                    // Görev tamamlandı!
                    this.completeAutoNavigation('Tebrikler! Görev için gerekli tüm kaynaklar toplandı!');
                } else {
                    // Sonraki en yakın tarlaya / madene otomatik yürü
                    setTimeout(() => {
                        if (this.autoState.active) {
                            this.seekNextAutoNode();
                        }
                    }, 400);
                }
            }
        }

        cancelGathering(reason) {
            if (!this.isChanneling) return;
            this.isChanneling = false;
            this.channelNode = null;
            if (this.domElements && this.domElements.castContainer) {
                this.domElements.castContainer.classList.add('hidden');
            }

            if (window.player) {
                window.player.isGathering = false;
            }

            if (window.GameHUD) {
                window.GameHUD.showToast(reason || '⚠️ Hasat iptal edildi!', 'system');
            }
        }

        // ==========================================
        // OTOMATİK GÖREVE GİTME VE KASILMA (AUTO-PATHFINDING & AUTO-GRIND)
        // ==========================================
        startAutoQuest(questId, objectiveType, countNeeded = 5) {
            // Aktif diyar kontrolü
            const realm = this.detectRealm();
            const templeObjective = realm === 'horustapinak' && objectiveType === 'steal_eye';
            if (realm !== 'misir' && !templeObjective) {
                if (window.GameHUD) window.GameHUD.showToast('Işınlanılıyor: Bu görev Nil Nehri & Başkent diyarında yer alıyor!', 'gold');
                setTimeout(() => window.location.href = 'mısır.html', 500);
                return;
            }

            this.autoState.active = true;
            this.autoState.questId = questId;
            this.autoState.type = objectiveType || 'harvest_wheat';
            this.autoState.remainingToGather = countNeeded;
            this.autoState.stuckTimer = 0;
            this.autoState.lastPos = null;
            this.autoState.path = null;
            this.autoState.pathIndex = 0;
            this.autoState.pathGoal = null;
            this.autoState.crossingDirection = null;
            this.autoState.crossingBridgeZ = null;

            // Hedef Noktayı Belirle
            this.seekNextAutoNode();

            // Auto Banner'ı Aç
            if (this.domElements && this.domElements.autoBanner) {
                this.domElements.autoBanner.classList.remove('hidden');
            }
            if (window.GameHUD) {
                window.GameHUD.showToast('🤖 Otomatik Göreve Gitme Aktif! Karakter hedefe doğru yürüyor...', 'gold');
            }
        }

        setWaypoint(node) {
            const scene = window.scene;
            if (!scene || !window.THREE || !node) return;

            if (!this.waypointMarker) {
                const marker = new THREE.Group();
                const arrow = new THREE.Mesh(
                    new THREE.ConeGeometry(0.32, 0.8, 4),
                    new THREE.MeshBasicMaterial({ color: 0xfff1a6 })
                );
                arrow.position.y = 1.6;
                marker.add(arrow);

                this.waypointMarker = marker;
                scene.add(marker);
            }

            this.waypointMarker.position.set(node.x, node.y || 0, node.z);
            this.waypointMarker.visible = true;
        }

        clearWaypoint() {
            if (this.waypointMarker) this.waypointMarker.visible = false;
            const targetInfo = document.getElementById('quest-target-info');
            if (targetInfo) targetInfo.textContent = '';
        }

        seekNextAutoNode() {
            if (!window.player) return;
            const px = window.player.root.position.x;
            const pz = window.player.root.position.z;

            let targetRes = 'wheat';
            if (this.autoState.type.includes('copper')) targetRes = 'copper';
            else if (this.autoState.type.includes('stone')) targetRes = 'stone';
            else if (this.autoState.type.includes('papyrus')) targetRes = 'papyrus';
            else if (this.autoState.type.includes('obelisk')) targetRes = 'obelisk';

            // En yakın tüketilmemiş hedefi bul
            let bestNode = null;
            let minDist = Infinity;

            let candidates = this.nodes.filter(node => node.resource === targetRes && !node.depleted);
            if (targetRes === 'wheat' && typeof window.getNearestWheatStalk === 'function') {
                const stalk = window.getNearestWheatStalk(px, pz);
                candidates = stalk ? [{
                    id: `wheat_stalk_${stalk.index}`,
                    name: 'Nil Buğdayı',
                    type: 'harvest',
                    resource: 'wheat',
                    yield: 4,
                    exp: 15,
                    x: stalk.x,
                    y: 0.1,
                    z: stalk.z,
                    castTime: 2.8,
                    respawnSec: 12,
                    icon: '🌾',
                    wheatIndex: stalk.index,
                    depleted: false
                }] : [];
            }
            if (this.autoState.type === 'hunt_croc' && window.EgyptCombatEngine) {
                candidates = window.EgyptCombatEngine.targets
                    .filter(target => target.name === 'Nil Timsahı' && !target.isDead && target.mesh)
                    .map((target, index) => ({
                        id: `croc_target_${index}`,
                        name: target.name,
                        resource: 'croc_hide',
                        x: target.mesh.position.x,
                        y: target.mesh.position.y,
                        z: target.mesh.position.z,
                        combatTarget: target
                    }));
            } else if (this.autoState.type === 'enter_realm_horustapinak') {
                const portal = (window.realmPortals || []).find(item => item.data.file.toLowerCase().includes('horustap'));
                candidates = portal ? [{
                    id: 'horus_temple_portal',
                    name: 'Horus Tapınağı Portalı',
                    resource: 'realm',
                    x: portal.data.x,
                    z: portal.data.z
                }] : [];
            } else if (this.autoState.type === 'steal_eye' && this.detectRealm() === 'horustapinak') {
                candidates = [{
                    id: 'horus_eye_altar',
                    name: 'Horus\'un Gözü Sunağı',
                    resource: 'eye_of_horus',
                    x: 0,
                    z: -115
                }];
            }

            for (let i = 0; i < candidates.length; i++) {
                const n = candidates[i];
                if (n.resource === targetRes && !n.depleted) {
                    const d = Math.hypot(px - n.x, pz - n.z);
                    if (d < minDist) {
                        minDist = d;
                        bestNode = n;
                    }
                } else if (n.resource === 'croc_hide' || n.resource === 'realm') {
                    const d = Math.hypot(px - n.x, pz - n.z);
                    if (d < minDist) {
                        minDist = d;
                        bestNode = n;
                    }
                }
            }

            // Eğer kaynakların hepsi tükenmişse bile birinin başına git
            const isSpecialTarget = ['hunt_croc', 'enter_realm_horustapinak', 'steal_eye'].includes(this.autoState.type);
            if (!bestNode && !isSpecialTarget) {
                for (let i = 0; i < this.nodes.length; i++) {
                    const n = this.nodes[i];
                    if (n.resource === targetRes) {
                        bestNode = n;
                        break;
                    }
                }
            }

            if (bestNode) {
                this.autoState.targetNode = bestNode;
                this.autoState.targetPos = { x: bestNode.x, z: bestNode.z };
                this.autoState.path = null;
                this.autoState.pathIndex = 0;
                this.autoState.pathGoal = null;
                this.autoState.crossingDirection = null;
                this.autoState.crossingBridgeZ = null;
                this.setWaypoint(bestNode);
                if (this.domElements && this.domElements.autoTitle) {
                    this.domElements.autoTitle.textContent = `🤖 OTO-KASILMA: ${bestNode.name}`;
                    this.domElements.autoDesc.textContent = `Hedefe gidiliyor... Kalan: ${this.autoState.remainingToGather} Adet`;
                }
            } else {
                this.cancelAutoNavigation('Bölgede toplanabilecek uygun kaynak bulunamadı.');
            }
        }

        updateAutoNavigation(player, delta, elapsed) {
            if (!this.autoState.targetPos || !player) return;

            // Eğer şu an hasat yapılıyorsa yürüme, hasat bitmesini bekle
            if (this.isChanneling) return;

            const px = player.root.position.x;
            const pz = player.root.position.z;
            let tx = this.autoState.targetPos.x;
            let tz = this.autoState.targetPos.z;
            if (this.autoState.type === 'hunt_croc' && this.autoState.targetNode && this.autoState.targetNode.combatTarget) {
                const targetPosition = this.autoState.targetNode.combatTarget.mesh.position;
                tx = targetPosition.x;
                tz = targetPosition.z;
                this.autoState.targetPos = { x: tx, z: tz };
            }

            const dx = tx - px;
            const dz = tz - pz;
            const dist = Math.hypot(dx, dz);

            if (this.domElements && this.domElements.autoDesc) {
                this.domElements.autoDesc.textContent = `Hedefe Kalan: ${dist.toFixed(1)}m | Gereken: ${this.autoState.remainingToGather} Adet`;
            }
            const targetInfo = document.getElementById('quest-target-info');
            if (targetInfo) {
                targetInfo.textContent = `${this.autoState.targetNode ? this.autoState.targetNode.name : 'Hedef'} · ${dist.toFixed(1)} m`;
            }

            // Hedefe Ulaşıldı mı? (< 2.2m)
            if (dist <= 2.2) {
                if (this.autoState.type === 'visit_obelisk') {
                    if (window.TutorialSystem) window.TutorialSystem.updateQuestProgress('visit_obelisk', 1);
                    this.completeAutoNavigation('Dikilitaş şantiyesine ulaştın.');
                    return;
                }
                if (this.autoState.type === 'enter_realm_horustapinak') {
                    if (window.TutorialSystem) window.TutorialSystem.updateQuestProgress('enter_realm_horustapinak', 1);
                    this.completeAutoNavigation('Horus Tapınağı portalına ulaştın.');
                    return;
                }
                if (this.autoState.type === 'steal_eye') {
                    if (window.GameState && window.GameState.state.player.hasEyeOfHorus) {
                        this.completeAutoNavigation('Horus\'un Gözü ele geçirildi.');
                    } else if (window.GameHUD) {
                        window.GameHUD.triggerContextAction();
                    }
                    return;
                }
                if (this.autoState.type === 'hunt_croc') {
                    if (this.autoState.targetNode && this.autoState.targetNode.combatTarget && !this.autoState.targetNode.combatTarget.isDead) {
                        const attackYaw = Math.atan2(-dx, -dz);
                        let attackDiff = attackYaw - player.root.rotation.y;
                        while (attackDiff > Math.PI) attackDiff -= Math.PI * 2;
                        while (attackDiff < -Math.PI) attackDiff += Math.PI * 2;
                        player.root.rotation.y += attackDiff * Math.min(1.0, delta * 9.0);
                        if (window.EgyptCombatEngine) window.EgyptCombatEngine.performAttack();
                    } else {
                        this.seekNextAutoNode();
                    }
                    return;
                }
                // Hedefe ulaşıldı! Otomatik hasatı başlat
                if (this.autoState.targetNode && !this.autoState.targetNode.depleted) {
                    this.startGathering(this.autoState.targetNode);
                } else {
                    // Node tükenmişse sonraki node'u ara
                    this.seekNextAutoNode();
                }
                return;
            }

            let routeGoal = { x: tx, z: tz };
            const playerWest = px <= 28;
            const targetEast = tx >= 86;
            const playerEast = px >= 86;
            const targetWest = tx <= 28;
            if (!this.autoState.crossingDirection && ((playerWest && targetEast) || (playerEast && targetWest))) {
                this.autoState.crossingDirection = playerWest ? 'east' : 'west';
                const bridges = [0, 75, -75];
                this.autoState.crossingBridgeZ = bridges.reduce((best, bridgeZ) => {
                    const cost = Math.abs(pz - bridgeZ) + Math.abs(tz - bridgeZ);
                    return !best || cost < best.cost ? { z: bridgeZ, cost } : best;
                }, null).z;
            }
            if (this.autoState.crossingDirection === 'east') {
                const bridgeZ = this.autoState.crossingBridgeZ;
                if (px < 28) {
                    routeGoal = { x: 28, z: bridgeZ };
                } else if (px < 86) {
                    routeGoal = { x: 86, z: bridgeZ };
                } else {
                    this.autoState.crossingDirection = null;
                    this.autoState.crossingBridgeZ = null;
                }
            } else if (this.autoState.crossingDirection === 'west') {
                const bridgeZ = this.autoState.crossingBridgeZ;
                if (px > 86) {
                    routeGoal = { x: 86, z: bridgeZ };
                } else if (px > 28) {
                    routeGoal = { x: 28, z: bridgeZ };
                } else {
                    this.autoState.crossingDirection = null;
                    this.autoState.crossingBridgeZ = null;
                }
            }

            const collisionEngine = window.EgyptCollisionEngine;
            if (collisionEngine && (!this.autoState.pathGoal
                || Math.hypot(routeGoal.x - this.autoState.pathGoal.x, routeGoal.z - this.autoState.pathGoal.z) > 2.0)) {
                this.autoState.path = collisionEngine.findPath(
                    player.root.position,
                    routeGoal,
                    (player.scale || 1) * 0.45,
                    player.root.position.y
                );
                this.autoState.pathIndex = 0;
                this.autoState.pathGoal = routeGoal;
                if (!this.autoState.path) {
                    this.cancelAutoNavigation('Hedefe güvenli bir yol bulunamadı; görev otomatik hareketi durduruldu.');
                    return;
                }
            }

            let navTarget = { x: tx, z: tz };
            if (this.autoState.path && this.autoState.pathIndex < this.autoState.path.length) {
                let waypoint = this.autoState.path[this.autoState.pathIndex];
                while (waypoint && Math.hypot(waypoint.x - px, waypoint.z - pz) < 0.55) {
                    this.autoState.pathIndex++;
                    waypoint = this.autoState.path[this.autoState.pathIndex];
                }
                if (waypoint) navTarget = waypoint;
            }

            const navDx = navTarget.x - px;
            const navDz = navTarget.z - pz;
            const navDist = Math.hypot(navDx, navDz);
            if (navDist < 0.05) return;

            // Karakteri rotanın bir sonraki görünür noktasına çevirip yürüt.
            const targetYaw = Math.atan2(navDx, navDz);
            let diff = targetYaw - player.root.rotation.y;
            while (diff > Math.PI) diff -= Math.PI * 2;
            while (diff < -Math.PI) diff += Math.PI * 2;
            player.root.rotation.y += diff * Math.min(1.0, delta * 9.0);

            const walkSpeed = 8.2;
            const moveDistance = Math.min(walkSpeed * delta, navDist);
            const nextX = px + (navDx / navDist) * moveDistance;
            const nextZ = pz + (navDz / navDist) * moveDistance;

            if (collisionEngine) {
                const resolved = collisionEngine.resolvePosition(
                    player.root.position,
                    { x: nextX, z: nextZ },
                    (player.scale || 1) * 0.45,
                    player.root.position.y
                );
                const moved = Math.hypot(resolved.x - px, resolved.z - pz);
                player.root.position.x = resolved.x;
                player.root.position.z = resolved.z;
                if (moved < 0.01 && navDist > 0.55) {
                    this.autoState.path = null;
                    this.autoState.pathGoal = null;
                }
            } else {
                player.root.position.x = nextX;
                player.root.position.z = nextZ;
            }

            // Karakter Canlı Yürüme Animasyonunu Çağır
            if (window.EgyptCharacterEngine && window.EgyptCharacterEngine.animateEgyptCharacter) {
                window.EgyptCharacterEngine.animateEgyptCharacter(player, true, 1.0, delta, elapsed);
            }
        }

        cancelAutoNavigation(reason) {
            this.autoState.active = false;
            this.autoState.targetPos = null;
            this.autoState.targetNode = null;
            this.autoState.path = null;
            this.autoState.pathGoal = null;
            this.autoState.crossingDirection = null;
            this.autoState.crossingBridgeZ = null;
            this.clearWaypoint();
            if (this.domElements && this.domElements.autoBanner) {
                this.domElements.autoBanner.classList.add('hidden');
            }
            if (window.GameHUD) {
                window.GameHUD.showToast(reason || '🛑 Otomatik ilerleme durduruldu.', 'system');
            }
        }

        completeAutoNavigation(message) {
            this.autoState.active = false;
            this.autoState.targetPos = null;
            this.autoState.targetNode = null;
            this.autoState.path = null;
            this.autoState.pathGoal = null;
            this.autoState.crossingDirection = null;
            this.autoState.crossingBridgeZ = null;
            this.clearWaypoint();
            if (this.domElements && this.domElements.autoBanner) {
                this.domElements.autoBanner.classList.add('hidden');
            }
            if (window.GameHUD) {
                window.GameHUD.showToast(`🎉 ${message}`, 'gold');
            }
            if (window.GameAudio) {
                window.GameAudio.playSfx('quest_complete');
            }
        }

        onTargetDefeated(target) {
            if (!this.autoState.active || this.autoState.type !== 'hunt_croc' || target.name !== 'Nil Timsahı') return;
            this.autoState.remainingToGather -= 1;
            if (this.autoState.remainingToGather <= 0) {
                this.completeAutoNavigation('Nil kıyısındaki timsahlar alt edildi.');
            } else {
                setTimeout(() => {
                    if (this.autoState.active) this.seekNextAutoNode();
                }, 400);
            }
        }
    }

    window.EgyptGatheringEngine = new EgyptGatheringEngine();
})(window);
