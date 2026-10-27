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

        isPositionBlocked(x, z, playerRadius = this.playerRadius, pY = 0) {
            for (const collider of this.colliders) {
                if (collider.type === 'ramp' || pY < collider.minY || pY > collider.maxY) continue;

                if (collider.type === 'cylinder') {
                    const minDist = collider.radius + playerRadius;
                    const dx = x - collider.x;
                    const dz = z - collider.z;
                    if (dx * dx + dz * dz < minDist * minDist) return true;
                } else if (collider.type === 'box') {
                    const closestX = Math.max(collider.minX, Math.min(x, collider.maxX));
                    const closestZ = Math.max(collider.minZ, Math.min(z, collider.maxZ));
                    const dx = x - closestX;
                    const dz = z - closestZ;
                    if (dx * dx + dz * dz < playerRadius * playerRadius) return true;
                }
            }
            return false;
        }

        findPath(start, target, playerRadius = this.playerRadius, pY = 0, cellSize = 1.25) {
            if (!start || !target || !Number.isFinite(start.x) || !Number.isFinite(start.z)
                || !Number.isFinite(target.x) || !Number.isFinite(target.z)) return null;

            const startNode = { x: 0, z: 0 };
            const goal = {
                x: Math.round((target.x - start.x) / cellSize),
                z: Math.round((target.z - start.z) / cellSize)
            };
            const cellPosition = node => ({
                x: start.x + node.x * cellSize,
                z: start.z + node.z * cellSize
            });
            const isWalkable = node => {
                const position = cellPosition(node);
                return !this.isPositionBlocked(position.x, position.z, playerRadius, pY);
            };

            let goalNode = goal;
            if (!isWalkable(goalNode)) {
                let nearest = null;
                for (let radius = 1; radius <= 5 && !nearest; radius++) {
                    for (let x = -radius; x <= radius; x++) {
                        for (let z = -radius; z <= radius; z++) {
                            if (Math.max(Math.abs(x), Math.abs(z)) !== radius) continue;
                            const candidate = { x: goal.x + x, z: goal.z + z };
                            if (!isWalkable(candidate)) continue;
                            const p = cellPosition(candidate);
                            const distanceSq = (p.x - target.x) ** 2 + (p.z - target.z) ** 2;
                            if (!nearest || distanceSq < nearest.distanceSq) nearest = { node: candidate, distanceSq };
                        }
                    }
                    if (nearest) goalNode = nearest.node;
                }
                if (!nearest) return null;
            }

            if (!isWalkable(startNode)) return null;

            const margin = 24;
            const minX = Math.min(startNode.x, goalNode.x) - margin;
            const maxX = Math.max(startNode.x, goalNode.x) + margin;
            const minZ = Math.min(startNode.z, goalNode.z) - margin;
            const maxZ = Math.max(startNode.z, goalNode.z) + margin;
            const key = node => `${node.x},${node.z}`;
            const heuristic = node => Math.hypot(goalNode.x - node.x, goalNode.z - node.z);
            const open = [];
            const bestCost = new Map([[key(startNode), 0]]);
            const parents = new Map();

            const push = item => {
                let index = open.length;
                open.push(item);
                while (index > 0) {
                    const parentIndex = Math.floor((index - 1) / 2);
                    if (open[parentIndex].score <= item.score) break;
                    open[index] = open[parentIndex];
                    index = parentIndex;
                }
                open[index] = item;
            };
            const pop = () => {
                const first = open[0];
                const last = open.pop();
                if (open.length) {
                    let index = 0;
                    while (true) {
                        const left = index * 2 + 1;
                        const right = left + 1;
                        if (left >= open.length) break;
                        const child = right < open.length && open[right].score < open[left].score ? right : left;
                        if (open[child].score >= last.score) break;
                        open[index] = open[child];
                        index = child;
                    }
                    open[index] = last;
                }
                return first;
            };

            push({ node: startNode, score: heuristic(startNode) });
            let expanded = 0;
            while (open.length && expanded < 40000) {
                const current = pop();
                const currentKey = key(current.node);
                const currentCost = bestCost.get(currentKey);
                if (current.score > currentCost + heuristic(current.node) + 1e-8) continue;
                expanded++;

                if (current.node.x === goalNode.x && current.node.z === goalNode.z) {
                    const path = [];
                    let cursor = currentKey;
                    while (cursor !== key(startNode)) {
                        const [x, z] = cursor.split(',').map(Number);
                        path.push(cellPosition({ x, z }));
                        cursor = parents.get(cursor);
                    }
                    return path.reverse();
                }

                for (let dx = -1; dx <= 1; dx++) {
                    for (let dz = -1; dz <= 1; dz++) {
                        if (!dx && !dz) continue;
                        const next = { x: current.node.x + dx, z: current.node.z + dz };
                        if (next.x < minX || next.x > maxX || next.z < minZ || next.z > maxZ || !isWalkable(next)) continue;
                        if (dx && dz && (!isWalkable({ x: current.node.x + dx, z: current.node.z })
                            || !isWalkable({ x: current.node.x, z: current.node.z + dz }))) continue;

                        const nextKey = key(next);
                        const nextCost = currentCost + (dx && dz ? Math.SQRT2 : 1);
                        if (nextCost >= (bestCost.get(nextKey) ?? Infinity)) continue;
                        bestCost.set(nextKey, nextCost);
                        parents.set(nextKey, currentKey);
                        push({ node: next, score: nextCost + heuristic(next) });
                    }
                }
            }

            return null;
        }

        resolvePosition(currentPos, targetPos, playerRadius = this.playerRadius, pY = 0) {
            const dx = targetPos.x - currentPos.x;
            const dz = targetPos.z - currentPos.z;
            const distance = Math.hypot(dx, dz);
            const stepLength = Math.max(0.15, playerRadius * 0.5);
            const steps = Math.max(1, Math.ceil(distance / stepLength));
            let x = currentPos.x;
            let z = currentPos.z;
            const stepX = dx / steps;
            const stepZ = dz / steps;

            for (let step = 0; step < steps; step++) {
                const nextX = x + stepX;
                const nextZ = z + stepZ;
                if (!this.isPositionBlocked(nextX, nextZ, playerRadius, pY)) {
                    x = nextX;
                    z = nextZ;
                    continue;
                }

                const canMoveX = !this.isPositionBlocked(nextX, z, playerRadius, pY);
                const canMoveZ = !this.isPositionBlocked(x, nextZ, playerRadius, pY);
                if (canMoveX && canMoveZ) {
                    if (Math.abs(dx) >= Math.abs(dz)) x = nextX;
                    else z = nextZ;
                } else if (canMoveX) {
                    x = nextX;
                } else if (canMoveZ) {
                    z = nextZ;
                }
            }

            return { x, z };
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
