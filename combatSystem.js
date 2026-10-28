/**
 * Gods of Egypt MMORPG - Cinematic Combat & Slash VFX Engine
 * Saldırı komboları, kılıç/mızrak savurma izleri, düşman can barları,
 * süzülen hasar sayıları (floating damage numbers) ve darbe parçacıklarını yönetir.
 */

(function(window) {
    'use strict';

    class EgyptCombatEngine {
        constructor() {
            this.targets = []; // { id, mesh, hp, maxHp, radius, name, onHit, isDead }
            this.damageTexts = []; // { element, x, y, z, lifetime }
            this.slashArcs = []; // { mesh, lifetime }
            this.comboCounter = 0;
            this.lastAttackTime = 0;
            this.attackDuration = 0.38;
            this.initOverlay();
        }

        clearTargets() {
            this.targets = [];
        }

        registerTarget(mesh, hp, maxHp, radius, name, onHit) {
            const target = {
                mesh,
                hp,
                maxHp,
                radius,
                name,
                onHit,
                isDead: false,
                flashTimer: 0
            };
            this.targets.push(target);
            return target;
        }

        initOverlay() {
            if (!document.body) {
                if (document.readyState === 'loading') {
                    document.addEventListener('DOMContentLoaded', () => this.initOverlay());
                } else {
                    setTimeout(() => this.initOverlay(), 50);
                }
                return;
            }
            // Süzülen hasar sayıları için 2D DOM katmanı
            if (!document.getElementById('mmo-damage-overlay')) {
                const overlay = document.createElement('div');
                overlay.id = 'mmo-damage-overlay';
                overlay.className = 'fixed inset-0 pointer-events-none z-30 overflow-hidden';
                document.body.appendChild(overlay);
            }

            // Mobil için Savaş / Zıplama Butonları (PC'de Hotbar kullanılır)
            if (!document.getElementById('mmo-combat-buttons')) {
                const btnContainer = document.createElement('div');
                btnContainer.id = 'mmo-combat-buttons';
                btnContainer.className = 'fixed bottom-6 right-6 z-30 flex items-center gap-3.5 mmo-mobile-only';

                btnContainer.innerHTML = `
                    <!-- ZIPLAMA BUTONU -->
                    <button id="btn-mmo-jump" onclick="window.EgyptCombatEngine.performJump()" class="w-16 h-16 rounded-full hud-glass-gold flex flex-col items-center justify-center border-2 border-yellow-400/80 shadow-2xl active:scale-90 transition-transform">
                        <span class="text-2xl">🦘</span>
                        <span class="text-[10px] font-black text-amber-200">ZIPLA</span>
                    </button>

                    <!-- SALDIRI / SİLAH VURUŞ BUTONU -->
                    <button id="btn-mmo-attack" onclick="window.EgyptCombatEngine.performAttack()" class="w-20 h-20 rounded-full bg-gradient-to-tr from-amber-600 via-amber-400 to-yellow-200 flex flex-col items-center justify-center border-3 border-white shadow-2xl active:scale-90 transition-transform">
                        <span class="text-3xl filter drop-shadow">⚔️</span>
                        <span class="text-[11px] font-black text-black tracking-wider">SALDIR</span>
                    </button>
                `;

                document.body.appendChild(btnContainer);
            }

            // Klavye ve Fare Kısayolları (Sol Tık = Saldır, 1 = Saldır, Space = Zıpla)
            window.addEventListener('keydown', (e) => {
                if (e.code === 'Space' && !e.repeat) {
                    if (document.activeElement.tagName !== 'INPUT') {
                        e.preventDefault();
                        this.performJump();
                    }
                }
                if (e.key === '1' && !e.repeat) {
                    if (document.activeElement.tagName !== 'INPUT') {
                        this.performAttack();
                    }
                }
            });

            window.addEventListener('pointerdown', (e) => {
                // Sadece 3D canvas'a tıklandığında saldırı yap (HUD butonlarına tıklandığında değil)
                if (e.target.tagName === 'CANVAS') {
                    if (e.button === 0) { // Sol tık
                        this.performAttack();
                    }
                }
            });
        }

        performJump() {
            if (window.EgyptCollisionEngine && window.player) {
                window.EgyptCollisionEngine.jump(window.player);
            }
        }

        performAttack() {
            if (!window.player) return;
            if (window.player.isAttacking) return;
            const now = performance.now() / 1000;
            if (now - this.lastAttackTime < 0.22) return; // Saldırı cooldown
            this.lastAttackTime = now;

            const player = window.player;
            player.isAttacking = true;
            player.attackProgress = 0;
            this.comboCounter = (this.comboCounter % 3) + 1;
            player.attackCombo = this.comboCounter;

            // Kılıç savurma sesi
            if (window.GameAudio) window.GameAudio.playSfx('combat_slash');

            // 3D Kavisli Altın Işık Halesi (Slash Arc VFX)
            this.createSlashVFX(player);

            // Yakındaki Düşmanlara Hasar Verme Kontrolü
            this.checkHitEnemies(player);
        }

        createSlashVFX(player, targetScene) {
            const scn = targetScene || window.scene || (player.root && player.root.parent);
            if (!scn || !player || !player.root) return;

            const isGod = player.scale > 1.8;
            const arcRadius = (isGod ? 3.2 : 1.7) * player.scale * 0.75;
            const arcGeo = new THREE.RingGeometry(arcRadius * 0.75, arcRadius, 24, 1, 0, Math.PI * 0.75);
            arcGeo.rotateX(-Math.PI / 2);

            const arcMat = new THREE.MeshBasicMaterial({
                color: isGod ? 0xfef08a : 0xfbbf24,
                transparent: true,
                opacity: 0.85,
                side: THREE.DoubleSide
            });

            const arcMesh = new THREE.Mesh(arcGeo, arcMat);
            arcMesh.position.copy(player.root.position);
            arcMesh.position.y += (isGod ? 1.8 : 1.0);
            arcMesh.rotation.y = player.root.rotation.y + Math.PI * 0.15;
            arcMesh.rotation.z = (this.comboCounter % 2 === 0 ? -0.25 : 0.25);
            scn.add(arcMesh);

            this.slashArcs.push({ mesh: arcMesh, lifetime: 0.18, maxLife: 0.18 });
        }

        checkHitEnemies(player) {
            const pPos = player.root.position;
            const pRot = player.root.rotation.y;
            const divineRoles = ['god_horus', 'god_set', 'horus_god', 'set_god', 'hathor', 'nephthys', 'isis', 'astarte', 'anat', 'bastet'];
            const isGod = player.scale > 1.8 || divineRoles.includes(player.role);
            const attackRange = (isGod ? 4.2 : 2.5);
            const baseDamage = isGod ? 120 : (player.role === 'horus_human' ? 65 : 40);
            const damage = Math.floor(baseDamage * (0.9 + Math.random() * 0.25) * (1 + this.comboCounter * 0.15));

            const fwdX = -Math.sin(pRot);
            const fwdZ = -Math.cos(pRot);

            for (let i = 0; i < this.targets.length; i++) {
                const t = this.targets[i];
                if (t.isDead || !t.mesh) continue;

                const dx = t.mesh.position.x - pPos.x;
                const dz = t.mesh.position.z - pPos.z;
                const dist = Math.hypot(dx, dz);

                // Saldırı menzilinde mi?
                if (dist < attackRange + t.radius) {
                    // Oyuncunun önünde mi? (Dot product ile ön açı kontrolü)
                    const dot = (dx / dist) * fwdX + (dz / dist) * fwdZ;
                    if (dot > 0.25) { // 120 derecelik ön vuruş konisi
                        t.hp = Math.max(0, t.hp - damage);
                        t.flashTimer = 0.2;

                        // Darbe Geri İtmesi (Knockback)
                        t.mesh.position.x += (dx / dist) * (isGod ? 1.4 : 0.6);
                        t.mesh.position.z += (dz / dist) * (isGod ? 1.4 : 0.6);

                        // Süzülen Hasar Sayısı
                        this.spawnDamageNumber(t.mesh.position, damage, isGod);

                        // Vuruş Kıvılcımı & Ses
                        if (window.GameAudio) window.GameAudio.playSfx('combat_slash');

                        if (t.onHit) t.onHit(damage, t.hp);

                        // Düşman Öldü mü?
                        if (t.hp <= 0) {
                            t.isDead = true;
                            if (window.GameHUD) window.GameHUD.showToast(`☠️ ${t.name} YENİLDİ! Ganimetler Saçıldı!`, 'gold');

                            if (t.name === 'Nil Timsahı' && window.GameState) {
                                window.GameState.addResource('croc_hide', 1);
                            }
                            if (window.EgyptGatheringEngine) {
                                window.EgyptGatheringEngine.onTargetDefeated(t);
                            }

                            // Yere Altın Kan veya Altın Düşür
                            if (window.EgyptCollisionEngine) {
                                window.EgyptCollisionEngine.spawnDrop(window.scene, t.mesh.position.x, t.mesh.position.y, t.mesh.position.z, 'golden_blood', 1);
                                window.EgyptCollisionEngine.spawnDrop(window.scene, t.mesh.position.x + 0.5, t.mesh.position.y, t.mesh.position.z + 0.5, 'gold', 2);
                            }

                            // Düşmanı sahneden yavaşça kaybet
                            setTimeout(() => {
                                if (t.mesh.parent) t.mesh.parent.remove(t.mesh);
                            }, 800);
                        }
                    }
                }
            }
        }

        spawnDamageNumber(pos3D, amount, isCritical = false) {
            const overlay = document.getElementById('mmo-damage-overlay');
            if (!overlay || !window.camera) return;

            const el = document.createElement('div');
            el.className = `absolute font-black transform -translate-x-1/2 -translate-y-1/2 pointer-events-none transition-all duration-700 ${isCritical ? 'text-2xl text-yellow-300 drop-shadow-[0_4px_8px_rgba(234,179,8,0.9)]' : 'text-xl text-amber-200 drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]'}`;
            el.textContent = `-${amount}`;
            overlay.appendChild(el);

            this.damageTexts.push({
                element: el,
                worldX: pos3D.x + (Math.random() - 0.5) * 0.4,
                worldY: pos3D.y + 1.8 + Math.random() * 0.3,
                worldZ: pos3D.z + (Math.random() - 0.5) * 0.4,
                life: 0.85,
                maxLife: 0.85
            });
        }

        update(delta, currentCamera) {
            const cam = currentCamera || window.camera;
            // Slash VFX Güncellemesi
            for (let i = this.slashArcs.length - 1; i >= 0; i--) {
                const arc = this.slashArcs[i];
                arc.lifetime -= delta;
                if (arc.lifetime <= 0) {
                    if (arc.mesh.parent) arc.mesh.parent.remove(arc.mesh);
                    this.slashArcs.splice(i, 1);
                } else {
                    arc.mesh.material.opacity = (arc.lifetime / arc.maxLife) * 0.9;
                    arc.mesh.scale.multiplyScalar(1.0 + delta * 2.5);
                }
            }

            // Süzülen Hasar Yazıları Güncellemesi (3B -> 2B Ekran İzdüşümü)
            if (cam) {
                const widthHalf = window.innerWidth / 2;
                const heightHalf = window.innerHeight / 2;
                const tempVec = new THREE.Vector3();

                for (let i = this.damageTexts.length - 1; i >= 0; i--) {
                    const dt = this.damageTexts[i];
                    dt.life -= delta;
                    dt.worldY += delta * 1.5; // Yukarı süzülüş

                    if (dt.life <= 0) {
                        if (dt.element.parentNode) dt.element.parentNode.removeChild(dt.element);
                        this.damageTexts.splice(i, 1);
                    } else {
                        tempVec.set(dt.worldX, dt.worldY, dt.worldZ);
                        tempVec.project(cam);

                        // Kamera arkasındaysa gizle
                        if (tempVec.z > 1.0) {
                            dt.element.style.display = 'none';
                        } else {
                            dt.element.style.display = 'block';
                            const screenX = (tempVec.x * widthHalf) + widthHalf;
                            const screenY = -(tempVec.y * heightHalf) + heightHalf;
                            dt.element.style.left = `${screenX}px`;
                            dt.element.style.top = `${screenY}px`;
                            dt.element.style.opacity = `${dt.life / dt.maxLife}`;
                        }
                    }
                }
            }
        }
    }

    window.EgyptCombatEngine = new EgyptCombatEngine();
})(window);
