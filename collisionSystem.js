/**
 * Gods of Egypt MMORPG - High-Performance 3D Collision, Physics & Elevation Engine
 * Tüm diyarlarda katı duvarlar, sütunlar, kayalar, rampalar, merdivenler,
 * yerçekimi/zıplama fiziği ve manyetik eşya çekimini yönetir.
 */

(function(window) {
    'use strict';

    class EgyptCollisionEngine {
        constructor() {
            this.colliders = []; // { type: 'cylinder'|'box', x, z, r, minX, maxX, minZ, maxZ, minY, maxY, isRamp, rampSlope }
            this.groundElevationFunc = null;
            this.gravity = 24.0;
            this.jumpForce = 9.8;
            this.velocityY = 0;
            this.isGrounded = true;
            this.playerRadius = 0.45;
            this.magneticOrbs = []; // { mesh, type, x, y, z, value, active }
        }

        clearColliders() {
            this.colliders = [];
            this.magneticOrbs = [];
        }

        // Silindirik engel (Sütunlar, heykeller, ağaçlar)
        addCylinderCollider(x, z, radius, minY = -5, maxY = 50) {
            this.colliders.push({
                type: 'cylinder',
                x: x,
                z: z,
                radius: radius,
                minY: minY,
                maxY: maxY
            });
        }

        // Kutu engel (Duvarlar, tapınak blokları, saray odaları, kapılar)
        addBoxCollider(minX, maxX, minZ, maxZ, minY = -5, maxY = 50) {
            this.colliders.push({
                type: 'box',
                minX: Math.min(minX, maxX),
                maxX: Math.max(minX, maxX),
                minZ: Math.min(minZ, maxZ),
                maxZ: Math.max(minZ, maxZ),
                minY: minY,
                maxY: maxY
            });
        }

        // Rampa / Merdiven (Yüksekliğe pürüzsüz tırmanış)
        addRampCollider(minX, maxX, minZ, maxZ, startY, endY, alongZ = true) {
            this.colliders.push({
                type: 'ramp',
                minX: Math.min(minX, maxX),
                maxX: Math.max(minX, maxX),
                minZ: Math.min(minZ, maxZ),
                maxZ: Math.max(minZ, maxZ),
                startY: startY,
                endY: endY,
                alongZ: alongZ
            });
        }

        setGroundElevation(fn) {
            this.groundElevationFunc = fn;
        }

        // Kayarak Çarpışma Kontrolü (Sliding Collision)
        resolvePosition(currentPos, targetPos, playerRadius = this.playerRadius, pY = 0) {
            let nextX = targetPos.x;
            let nextZ = targetPos.z;

            // X Ekseni Kontrolü
            for (let i = 0; i < this.colliders.length; i++) {
                const c = this.colliders[i];
                if (pY < c.minY || pY > c.maxY) continue;

                if (c.type === 'cylinder') {
                    const dx = nextX - c.x;
                    const dz = currentPos.z - c.z;
                    const distSq = dx * dx + dz * dz;
                    const minDist = c.radius + playerRadius;
                    if (distSq < minDist * minDist) {
                        const dist = Math.sqrt(distSq) || 0.001;
                        nextX = c.x + (dx / dist) * minDist;
                    }
                } else if (c.type === 'box') {
                    const expandedMinX = c.minX - playerRadius;
                    const expandedMaxX = c.maxX + playerRadius;
                    const expandedMinZ = c.minZ - playerRadius;
                    const expandedMaxZ = c.maxZ + playerRadius;

                    if (nextX >= expandedMinX && nextX <= expandedMaxX && currentPos.z >= expandedMinZ && currentPos.z <= expandedMaxZ) {
                        if (currentPos.x <= c.minX) nextX = expandedMinX;
                        else if (currentPos.x >= c.maxX) nextX = expandedMaxX;
                    }
                }
            }

            // Z Ekseni Kontrolü
            for (let i = 0; i < this.colliders.length; i++) {
                const c = this.colliders[i];
                if (pY < c.minY || pY > c.maxY) continue;

                if (c.type === 'cylinder') {
                    const dx = nextX - c.x;
                    const dz = nextZ - c.z;
                    const distSq = dx * dx + dz * dz;
                    const minDist = c.radius + playerRadius;
                    if (distSq < minDist * minDist) {
                        const dist = Math.sqrt(distSq) || 0.001;
                        nextZ = c.z + (dz / dist) * minDist;
                    }
                } else if (c.type === 'box') {
                    const expandedMinX = c.minX - playerRadius;
                    const expandedMaxX = c.maxX + playerRadius;
                    const expandedMinZ = c.minZ - playerRadius;
                    const expandedMaxZ = c.maxZ + playerRadius;

                    if (nextX >= expandedMinX && nextX <= expandedMaxX && nextZ >= expandedMinZ && nextZ <= expandedMaxZ) {
                        if (currentPos.z <= c.minZ) nextZ = expandedMinZ;
                        else if (currentPos.z >= c.maxZ) nextZ = expandedMaxZ;
                    }
                }
            }

            return { x: nextX, z: nextZ };
        }

        // Zemin ve Rampa Yüksekliği Hesaplama
        getSurfaceHeight(x, z) {
            let surfaceY = 0;
            if (this.groundElevationFunc) {
                surfaceY = this.groundElevationFunc(x, z);
            }

            // Rampalar üzerinde mi?
            for (let i = 0; i < this.colliders.length; i++) {
                const c = this.colliders[i];
                if (c.type === 'ramp') {
                    if (x >= c.minX && x <= c.maxX && z >= c.minZ && z <= c.maxZ) {
                        let t = 0;
                        if (c.alongZ) {
                            t = (z - c.minZ) / (c.maxZ - c.minZ);
                        } else {
                            t = (x - c.minX) / (c.maxX - c.minX);
                        }
                        const rampY = c.startY + (c.endY - c.startY) * Math.max(0, Math.min(1, t));
                        surfaceY = Math.max(surfaceY, rampY);
                    }
                }
            }

            return surfaceY;
        }

        // Zıplama ve Yerçekimi Güncellemesi
        updatePhysics(playerMesh, delta) {
            if (!playerMesh || !playerMesh.root) return;

            // İlahi Tanrı Uçuşu Aktifken Yerçekimini İptal Et
            if (window.EgyptFlightEngine && window.EgyptFlightEngine.isFlying) {
                this.isGrounded = false;
                this.velocityY = 0;
                return;
            }

            const px = playerMesh.root.position.x;
            const pz = playerMesh.root.position.z;
            const groundY = this.getSurfaceHeight(px, pz);

            if (!this.isGrounded) {
                this.velocityY -= this.gravity * delta;
                playerMesh.root.position.y += this.velocityY * delta;

                if (playerMesh.root.position.y <= groundY) {
                    playerMesh.root.position.y = groundY;
                    this.velocityY = 0;
                    this.isGrounded = true;

                    // Yere iniş darbe yaylanması (Landing squash)
                    playerMesh.landingSquash = 1.0;
                }
            } else {
                // Pürüzsüz merdiven/yükseklik adımı
                playerMesh.root.position.y = THREE.MathUtils.lerp(playerMesh.root.position.y, groundY, 0.25);
            }
        }

        jump(playerMesh) {
            if (this.isGrounded && playerMesh) {
                this.isGrounded = false;
                // Tanrılar daha yükseğe sıçrar!
                const isGod = playerMesh.scale > 1.8;
                this.velocityY = this.jumpForce * (isGod ? 1.35 : 1.0);
                if (window.GameAudio) window.GameAudio.playSfx('combat_slash');
                return true;
            }
            return false;
        }

        // Manyetik Altın Kan & Eşya Toplama Sistemi
        spawnDrop(scene, x, y, z, type = 'golden_blood', value = 1) {
            const geom = new THREE.DodecahedronGeometry(type === 'golden_blood' ? 0.22 : 0.18);
            const mat = new THREE.MeshStandardMaterial({
                color: type === 'golden_blood' ? 0xfbbf24 : 0x38bdf8,
                emissive: type === 'golden_blood' ? 0xd97706 : 0x0284c7,
                emissiveIntensity: 0.85,
                metalness: 0.9,
                roughness: 0.1
            });
            const mesh = new THREE.Mesh(geom, mat);
            mesh.position.set(x, y + 0.35, z);
            scene.add(mesh);

            const drop = {
                mesh,
                type,
                value,
                baseY: y + 0.35,
                phase: Math.random() * Math.PI * 2,
                active: true
            };
            this.magneticOrbs.push(drop);
            return drop;
        }

        updateMagneticDrops(playerPos, delta, elapsed) {
            for (let i = this.magneticOrbs.length - 1; i >= 0; i--) {
                const orb = this.magneticOrbs[i];
                if (!orb.active) continue;

                // Süzülme ve dönüş
                orb.mesh.rotation.y += delta * 3.5;
                orb.mesh.rotation.x = Math.sin(elapsed * 4.0 + orb.phase) * 0.35;
                orb.mesh.position.y = orb.baseY + Math.sin(elapsed * 3.0 + orb.phase) * 0.18;

                const dx = playerPos.x - orb.mesh.position.x;
                const dy = (playerPos.y + 0.8) - orb.mesh.position.y;
                const dz = playerPos.z - orb.mesh.position.z;
                const distSq = dx * dx + dz * dz;

                // Manyetik Çekim Alanı (4 metre)
                if (distSq < 16.0) {
                    const dist = Math.sqrt(distSq);
                    const pullSpeed = (12.0 / Math.max(0.4, dist)) * delta;
                    orb.mesh.position.x += (dx / dist) * pullSpeed;
                    orb.mesh.position.y += (dy / (dist || 1)) * pullSpeed;
                    orb.mesh.position.z += (dz / dist) * pullSpeed;

                    // Toplama Mesafesi (0.75 metre)
                    if (dist < 0.75) {
                        orb.active = false;
                        if (orb.mesh.parent) orb.mesh.parent.remove(orb.mesh);
                        this.magneticOrbs.splice(i, 1);

                        if (window.GameState) {
                            if (orb.type === 'golden_blood') {
                                window.GameState.addResource('golden_blood', orb.value);
                                if (window.GameHUD) window.GameHUD.showToast(`✨ +${orb.value} ALTIN KAN TOPLANDI!`, 'gold');
                            } else {
                                window.GameState.addResource('gold', orb.value * 15);
                                if (window.GameHUD) window.GameHUD.showToast(`🪙 +${orb.value * 15} ALTIN KAZANILDI!`, 'system');
                            }
                        }
                        if (window.GameAudio) window.GameAudio.playSfx('golden_blood');
                    }
                }
            }
        }
    }

    window.EgyptCollisionEngine = new EgyptCollisionEngine();
})(window);
