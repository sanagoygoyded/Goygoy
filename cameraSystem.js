/**
 * Gods of Egypt MMORPG - Unified Global Camera Engine
 * Seamless First-Person (FPV) & Third-Person (TPV) System with Scale-Aware Eye Heights & Head Bob
 * Kısayol: [V] tuşu veya Arayüzdeki Kamera Düğmesi ile 1. Şahıs / 3. Şahıs geçişi
 */
(function(window) {
    'use strict';

    const CAMERA_STYLES = [
        { id: 'follow', label: 'Sinematik takip', icon: '🎬', fov: 0 },
        { id: 'orbit', label: 'Yavaş 360° orbit', icon: '🌀', fov: 2 },
        { id: 'shoulder', label: 'Omuz kamerası', icon: '🎥', fov: -2 },
        { id: 'hero', label: 'Alçak kahraman açısı', icon: '🦅', fov: 1 },
        { id: 'overhead', label: 'Yukarıdan tanrı bakışı', icon: '☀️', fov: 5 },
        { id: 'close', label: 'Detay yakın plan', icon: '🔍', fov: -4 }
    ];

    class EgyptCameraSystem {
        constructor() {
            this.isFirstPerson = false;
            this.camYaw = 0.45;
            this.camPitch = 0.22;
            this.camDist = 8.5;
            this.desiredDist = 8.5;
            this.minDist = 2.2;
            this.maxDist = 280.0;
            this.headBobTimer = 0;
            this.bodyGuardDistance = 1.25;
            this.transitionAlpha = 1.0;
            this.targetAlpha = 1.0;
            this.currentCamPos = null;
            this.currentLookAt = null;
            this.weaponSway = { x: 0, y: 0 };
            this.activePointers = new Map();
            this.lastPinchDist = 0;
            this.isPointerLocked = false;
            this.mouseSensitivity = 0.0022;
            this.lastAppliedViewMode = null;
            this.lastAppliedPlayer = null;
            this.cameraFocus = new THREE.Vector3();
            this.cameraOffset = new THREE.Vector3();
            this.cameraFovBase = new WeakMap();
            this.cameraCollisionState = new WeakMap();
            this.playerMotion = new WeakMap();
            this.motionSpeed = 0;
            this.motionDirection = new THREE.Vector3();
            this.followMotionPhase = 0;
            this.cameraStyleIndex = 0;
            this.cameraStyleStates = new WeakMap();

            this.init();
        }

        init() {
            // Hotkey [V] ile dilediğin an kamera modu değiştirme
            window.addEventListener('keydown', (e) => {
                const isInput = document.activeElement && (
                    document.activeElement.tagName === 'INPUT' || 
                    document.activeElement.tagName === 'TEXTAREA'
                );
                if (isInput) return;

                if (e.key.toLowerCase() === 'v' && !e.repeat) {
                    this.toggleFirstPerson();
                }
            });

            // Fare Tekerleği ile Yakınlaştırma / Uzaklaştırma (Sonuna kadar yaklaşınca otomatik 1. şahsa geçer)
            window.addEventListener('wheel', (e) => {
                if (this.isFirstPerson) {
                    if (e.deltaY > 60) {
                        this.setFirstPerson(false);
                        this.desiredDist = 4.2;
                    }
                    return;
                }
                this.desiredDist = Math.max(this.minDist, Math.min(this.maxDist, this.desiredDist + e.deltaY * 0.015));
                if (this.desiredDist <= 1.4 && e.deltaY < -40) {
                    this.setFirstPerson(true);
                }
            }, { passive: true });

            // 1. Şahıstayken Sağ Tık ile Mouse Look (Pointer Lock Opsiyonu)
            window.addEventListener('contextmenu', (e) => {
                if (this.isFirstPerson && e.target && e.target.tagName === 'CANVAS') {
                    e.preventDefault();
                }
            });

            window.addEventListener('mousemove', (e) => {
                if (document.pointerLockElement) {
                    this.camYaw -= e.movementX * this.mouseSensitivity;
                    this.camPitch = Math.max(-1.42, Math.min(1.42, this.camPitch + e.movementY * this.mouseSensitivity));
                }
            });
        }

        getEyeHeight(player) {
            if (!player) return 1.55;
            const state = window.GameState ? window.GameState.state : null;
            const role = player.role || ((state && state.player) ? state.player.role : 'bek');
            const scaleY = (player.root && player.root.scale) ? player.root.scale.y : 1.0;

            if (role === 'god_set' || role === 'set_god' || role === 'set') {
                return 3.55 * scaleY;
            } else if (role === 'god_horus' || role === 'horus_god' || role === 'horus') {
                return 3.42 * scaleY;
            } else if (role === 'horus_human') {
                return 2.75 * scaleY;
            } else if (['hathor', 'nephthys', 'isis', 'astarte', 'anat', 'bastet'].includes(role)) {
                return 1.58 * scaleY;
            } else if (['zaya', 'female_villager', 'dancer'].includes(role)) {
                return 1.52 * scaleY;
            } else if (role === 'villager') {
                return 1.45 * scaleY;
            } else {
                // Bek / Ölümlü Hırsız (1.05m model, göz yüksekliği ~1.50m)
                return 1.52 * scaleY;
            }
        }

        toggleFirstPerson() {
            this.setFirstPerson(!this.isFirstPerson);
        }

        cycleCameraStyle() {
            this.cameraStyleIndex = (this.cameraStyleIndex + 1) % CAMERA_STYLES.length;
            const style = CAMERA_STYLES[this.cameraStyleIndex];
            this.updateCameraStyleUI();
            if (window.GameHUD) window.GameHUD.showToast(`${style.icon} Kamera: ${style.label}`, 'gold');
            return style;
        }

        getCameraStyle() {
            return CAMERA_STYLES[this.cameraStyleIndex];
        }

        updateCameraStyleUI() {
            const style = this.getCameraStyle();
            for (const id of ['hud-camera-style-btn', 'hud-camera-style-mobile']) {
                const button = document.getElementById(id);
                if (!button) continue;
                button.title = `${style.label} · Kamera açısını değiştirmek için dokun`;
                const icon = button.querySelector('[data-camera-style-icon]');
                const label = button.querySelector('[data-camera-style-label]');
                if (icon) icon.textContent = style.icon;
                if (label) label.textContent = style.label;
            }
        }

        setFirstPerson(enabled) {
            this.isFirstPerson = enabled;
            this.transitionAlpha = 0.0;
            
            if (window.GameHUD) {
                const modeText = this.isFirstPerson 
                    ? '👁️ 1. ŞAHIS (Karakterin Gözünden) Moduna Geçildi [V]' 
                    : '🎥 3. ŞAHIS (Geniş Açı) Moduna Geçildi [V]';
                window.GameHUD.showToast(modeText, 'gold');
                window.GameHUD.updateCameraModeUI(this.isFirstPerson);
            }
        }

        updateCamera(camera, player, moving, speedMag, delta, elapsed) {
            if (!camera) return;

            // Sinematik TikTok & Reklam Stüdyosu Aktifse Kamerayı Yönet
            if (window.EgyptCinematicStudio && window.EgyptCinematicStudio.isActive()) {
                window.EgyptCinematicStudio.update(camera, player, delta, elapsed);
                return;
            }

            if (!player || !player.root) return;

            this.applyViewMode(player);
            const velocity = this.getPlayerVelocity(player, delta);
            const speed = Math.hypot(velocity.x, velocity.z);
            this.motionSpeed += (speed - this.motionSpeed) * (1 - Math.exp(-delta * 5));
            this.motionDirection.set(velocity.x, 0, velocity.z);
            if (this.motionDirection.lengthSq() > 0.01) this.motionDirection.normalize();
            const eyeHeight = this.getEyeHeight(player);
            const posX = player.root.position.x;
            const posY = player.root.position.y;
            const posZ = player.root.position.z;

            // Kamera Dikey Açı Sınırları (-85° ile +85° arası tam kubbe/gökyüzü ve yer bakışı)
            this.camPitch = Math.max(-1.42, Math.min(1.42, this.camPitch));

            if (this.isFirstPerson) {
                // 1. ŞAHIS MODU: karakterin gövdesinin içine girilmesin; sadece baş ve göze odaklan
                player.root.visible = true;

                if (moving) {
                    this.headBobTimer += delta * (8.5 * Math.max(0.45, speedMag || 1.0));
                } else {
                    this.headBobTimer += delta * 1.8;
                }
                const bobY = moving ? Math.sin(this.headBobTimer) * 0.045 : Math.sin(this.headBobTimer) * 0.012;
                const bobX = moving ? Math.cos(this.headBobTimer * 0.5) * 0.025 : 0;

                const eyeX = posX + bobX;
                const eyeY = posY + eyeHeight + bobY;
                const eyeZ = posZ;

                const lookDirX = -Math.sin(this.camYaw) * Math.cos(this.camPitch);
                const lookDirY = Math.sin(this.camPitch);
                const lookDirZ = -Math.cos(this.camYaw) * Math.cos(this.camPitch);

                const targetPos = new THREE.Vector3(eyeX, eyeY, eyeZ);
                const targetLook = new THREE.Vector3(
                    eyeX + lookDirX * 12.0 + this.motionDirection.x * 0.12,
                    eyeY + lookDirY * 12.0,
                    eyeZ + lookDirZ * 12.0 + this.motionDirection.z * 0.12
                );

                if (!this.currentCamPos) this.currentCamPos = targetPos.clone();
                if (!this.currentLookAt) this.currentLookAt = targetLook.clone();

                const positionBlend = 1 - Math.exp(-delta * 24);
                const lookBlend = 1 - Math.exp(-delta * 30);
                this.currentCamPos.lerp(targetPos, positionBlend);
                this.currentLookAt.lerp(targetLook, lookBlend);

                const bodyCenter = new THREE.Vector3(posX, posY + eyeHeight * 0.48, posZ);
                const bodyToCam = this.currentCamPos.clone().sub(bodyCenter);
                const bodyRadius = Math.max(0.95, (player.root && player.root.scale ? player.root.scale.x : 1.0) * 1.25);
                if (bodyToCam.length() < bodyRadius) {
                    bodyToCam.setLength(bodyRadius + 0.18);
                    this.currentCamPos.copy(bodyCenter.clone().add(bodyToCam));
                }

                camera.position.copy(this.currentCamPos);
                camera.lookAt(this.currentLookAt);
            } else {
                player.root.visible = true;

                const scaleValue = player.root && player.root.scale ? Math.max(1.0, player.root.scale.x || 1.0) : 1.0;
                const desiredDistance = Math.max(this.minDist, Math.min(this.desiredDist, this.maxDist));
                this.camDist = THREE.MathUtils.lerp(this.camDist, desiredDistance, 1 - Math.exp(-delta * 7));

                const lookAhead = Math.min(0.7, this.motionSpeed * 0.12);
                this.followMotionPhase += delta * (2.1 + Math.min(this.motionSpeed, 5) * 0.8);
                const stepBob = moving ? Math.sin(this.followMotionPhase * 2) * Math.min(0.022, this.motionSpeed * 0.0035) : 0;
                const focusX = posX + this.motionDirection.x * lookAhead;
                const focusY = posY + eyeHeight * 0.85 + stepBob;
                const focusZ = posZ + this.motionDirection.z * lookAhead;

                const offsetX = Math.sin(this.camYaw) * Math.cos(this.camPitch) * this.camDist;
                const offsetZ = Math.cos(this.camYaw) * Math.cos(this.camPitch) * this.camDist;
                const offsetY = Math.sin(this.camPitch) * this.camDist;

                const targetPos = new THREE.Vector3(focusX + offsetX, Math.max(posY + 0.45, focusY + offsetY), focusZ + offsetZ);
                const targetLook = new THREE.Vector3(focusX, focusY, focusZ);

                const bodyCenter = new THREE.Vector3(posX, posY + eyeHeight * 0.5, posZ);
                const bodyToCam = targetPos.clone().sub(bodyCenter);
                const safeDist = Math.max(this.bodyGuardDistance + 0.15, scaleValue * 1.15);
                if (bodyToCam.length() < safeDist) {
                    bodyToCam.setLength(safeDist);
                    targetPos.copy(bodyCenter.clone().add(bodyToCam));
                }

                if (!this.currentCamPos) this.currentCamPos = targetPos.clone();
                if (!this.currentLookAt) this.currentLookAt = targetLook.clone();

                const positionBlend = 1 - Math.exp(-delta * 8);
                const lookBlend = 1 - Math.exp(-delta * 10);
                this.currentCamPos.lerp(targetPos, positionBlend);
                this.currentLookAt.lerp(targetLook, lookBlend);

                camera.position.copy(this.currentCamPos);
                camera.lookAt(this.currentLookAt);
            }
            this.applyCameraStyle(camera, player, elapsed, delta);
        }

        getPlayerVelocity(player, delta) {
            const position = player.root.position;
            const previous = this.playerMotion.get(player);
            if (!previous) {
                this.playerMotion.set(player, { x: position.x, z: position.z, vx: 0, vz: 0 });
                return { x: 0, z: 0 };
            }

            const elapsed = Math.max(0.001, Math.min(delta || 0.016, 0.1));
            const dx = position.x - previous.x;
            const dz = position.z - previous.z;
            const distance = Math.hypot(dx, dz);
            if (distance > 25) {
                previous.vx = 0;
                previous.vz = 0;
            } else {
                const smoothing = 1 - Math.exp(-elapsed * 10);
                previous.vx += (dx / elapsed - previous.vx) * smoothing;
                previous.vz += (dz / elapsed - previous.vz) * smoothing;
            }
            previous.x = position.x;
            previous.z = position.z;
            const speed = Math.hypot(previous.vx, previous.vz);
            if (speed > 8) {
                previous.vx *= 8 / speed;
                previous.vz *= 8 / speed;
            }
            return { x: previous.vx, z: previous.vz };
        }

        applyViewMode(player) {
            if (this.lastAppliedViewMode === this.isFirstPerson && this.lastAppliedPlayer === player) return;
            if (this.lastAppliedPlayer && this.lastAppliedPlayer !== player) {
                this.setCharacterOpacity(this.lastAppliedPlayer, false);
            }
            this.lastAppliedViewMode = this.isFirstPerson;
            this.lastAppliedPlayer = player;
            this.setCharacterOpacity(player, this.isFirstPerson);
        }

        setCharacterOpacity(player, translucent) {
            if (!player || !player.root) return;
            player.root.visible = true;
            player.root.traverse && player.root.traverse(child => {
                if (!child.material) return;
                const materials = Array.isArray(child.material) ? child.material : [child.material];
                for (const material of materials) {
                    if (!material.userData) material.userData = {};
                    if (!Object.prototype.hasOwnProperty.call(material.userData, 'cameraViewOpacity')) {
                        material.userData.cameraViewOpacity = {
                            transparent: material.transparent,
                            opacity: material.opacity
                        };
                    }
                    const original = material.userData.cameraViewOpacity;
                    material.transparent = translucent ? true : original.transparent;
                    material.opacity = translucent ? Math.min(original.opacity === undefined ? 1 : original.opacity, 0.92) : original.opacity;
                }
            });
        }

        refineCamera(camera, player, delta) {
            if (!camera || !player || !player.root
                || (window.EgyptCinematicStudio && window.EgyptCinematicStudio.isActive())) return false;
            this.updateCameraFov(camera, delta);
            if (this.isFirstPerson) return false;
            let styleState = this.cameraStyleStates.get(camera);
            if (!styleState || !styleState.appliedThisFrame) {
                this.applyCameraStyle(camera, player, performance.now() / 1000, delta);
                styleState = this.cameraStyleStates.get(camera);
            }
            if (styleState) styleState.appliedThisFrame = false;
            const collisionEngine = window.EgyptCollisionEngine;
            const colliders = collisionEngine && collisionEngine.colliders;

            const position = player.root.position;
            this.cameraFocus.set(position.x, position.y + this.getEyeHeight(player) * 0.78, position.z);
            this.cameraOffset.copy(camera.position).sub(this.cameraFocus);

            if (!colliders || !colliders.length) return this.releaseCameraCollision(camera, delta);
            const dx = this.cameraOffset.x;
            const dz = this.cameraOffset.z;
            const dy = this.cameraOffset.y;
            const lengthSq = dx * dx + dy * dy + dz * dz;
            if (lengthSq < 0.01) return this.releaseCameraCollision(camera, delta);

            let nearestT = 1;
            const cameraRadius = 0.24;
            for (const collider of colliders) {
                if (collider.type === 'ramp') continue;
                let enter = -Infinity;
                let exit = Infinity;

                if (collider.type === 'cylinder') {
                    const ox = this.cameraFocus.x - collider.x;
                    const oz = this.cameraFocus.z - collider.z;
                    const radius = collider.radius + cameraRadius;
                    const a = dx * dx + dz * dz;
                    const b = 2 * (ox * dx + oz * dz);
                    const c = ox * ox + oz * oz - radius * radius;
                    if (a < 1e-8) {
                        if (c > 0) continue;
                    } else {
                        const discriminant = b * b - 4 * a * c;
                        if (discriminant < 0) continue;
                        const root = Math.sqrt(discriminant);
                        enter = (-b - root) / (2 * a);
                        exit = (-b + root) / (2 * a);
                    }
                } else if (collider.type === 'box') {
                    for (const [origin, direction, min, max] of [
                        [this.cameraFocus.x, dx, collider.minX - cameraRadius, collider.maxX + cameraRadius],
                        [this.cameraFocus.z, dz, collider.minZ - cameraRadius, collider.maxZ + cameraRadius]
                    ]) {
                        if (Math.abs(direction) < 1e-8) {
                            if (origin < min || origin > max) {
                                enter = Infinity;
                                break;
                            }
                            continue;
                        }
                        const first = (min - origin) / direction;
                        const second = (max - origin) / direction;
                        enter = Math.max(enter, Math.min(first, second));
                        exit = Math.min(exit, Math.max(first, second));
                    }
                } else continue;

                if (enter > exit || exit < 0 || enter > 1) continue;
                if (enter < 0) continue;
                let verticalEnter = -Infinity;
                let verticalExit = Infinity;
                if (Math.abs(dy) < 1e-8) {
                    if (this.cameraFocus.y < collider.minY || this.cameraFocus.y > collider.maxY) continue;
                } else {
                    const first = (collider.minY - this.cameraFocus.y) / dy;
                    const second = (collider.maxY - this.cameraFocus.y) / dy;
                    verticalEnter = Math.min(first, second);
                    verticalExit = Math.max(first, second);
                }
                const hitT = Math.max(0, enter, verticalEnter);
                if (hitT > Math.min(1, exit, verticalExit) || hitT >= nearestT) continue;
                nearestT = hitT;
            }

            if (nearestT >= 1) return this.releaseCameraCollision(camera, delta);
            const safeT = Math.max(0.08, nearestT - cameraRadius / Math.sqrt(lengthSq));
            const collisionState = this.getCameraCollisionState(camera);
            collisionState.wasColliding = true;
            camera.position.copy(this.cameraFocus).add(this.cameraOffset.multiplyScalar(safeT));
            camera.lookAt(this.cameraFocus);
            collisionState.position.copy(camera.position);
            if (this.currentCamPos) this.currentCamPos.copy(camera.position);
            if (this.currentLookAt) this.currentLookAt.copy(this.cameraFocus);
            return true;
        }

        applyCameraStyle(camera, player, elapsed, delta) {
            if (!camera || !player || !player.root || this.isFirstPerson
                || (window.EgyptCinematicStudio && window.EgyptCinematicStudio.isActive())) return;
            const style = this.getCameraStyle();
            let state = this.cameraStyleStates.get(camera);
            if (!state) {
                state = {
                    position: new THREE.Vector3().copy(camera.position),
                    lookAt: new THREE.Vector3(),
                    initialized: false,
                    appliedThisFrame: false
                };
                this.cameraStyleStates.set(camera, state);
            }

            const root = player.root;
            const scale = Math.max(0.7, root.scale && root.scale.y ? root.scale.y : 1);
            const focus = new THREE.Vector3(
                root.position.x,
                root.position.y + this.getEyeHeight(player) * 0.78,
                root.position.z
            );
            const basePosition = camera.position.clone();
            const baseOffset = basePosition.clone().sub(focus);
            const distance = Math.max(0.01, baseOffset.length());
            const yaw = this.camYaw;
            const rightX = Math.cos(yaw);
            const rightZ = -Math.sin(yaw);
            const targetPosition = basePosition.clone();
            const targetLookAt = focus.clone();

            if (style.id === 'orbit') {
                const angle = elapsed * 0.16;
                const cos = Math.cos(angle);
                const sin = Math.sin(angle);
                targetPosition.x = focus.x + baseOffset.x * cos - baseOffset.z * sin;
                targetPosition.z = focus.z + baseOffset.x * sin + baseOffset.z * cos;
                targetLookAt.y += this.getEyeHeight(player) * 0.08;
            } else if (style.id === 'shoulder') {
                targetPosition.x += rightX * 0.42 * scale;
                targetPosition.z += rightZ * 0.42 * scale;
                targetLookAt.x += rightX * 0.25 * scale;
                targetLookAt.z += rightZ * 0.25 * scale;
                targetLookAt.y += this.getEyeHeight(player) * 0.12;
            } else if (style.id === 'hero') {
                targetPosition.y = Math.max(root.position.y + 0.28 * scale, targetPosition.y - 0.38 * scale);
                targetLookAt.y += this.getEyeHeight(player) * 0.2;
            } else if (style.id === 'overhead') {
                const overheadDistance = Math.max(distance, this.getEyeHeight(player) * 2.2);
                targetPosition.set(
                    focus.x + Math.sin(yaw) * overheadDistance * 0.18,
                    focus.y + overheadDistance * 0.9,
                    focus.z + Math.cos(yaw) * overheadDistance * 0.18
                );
            } else if (style.id === 'close') {
                const closeDistance = Math.max(this.getEyeHeight(player) * 0.82, distance * 0.62);
                targetPosition.copy(focus).add(baseOffset.multiplyScalar(closeDistance / distance));
                targetLookAt.y += this.getEyeHeight(player) * 0.16;
            }

            const blend = state.initialized
                ? 1 - Math.exp(-Math.max(0.001, delta || 0.016) * 4.2)
                : 1;
            if (!state.initialized) {
                state.position.copy(targetPosition);
                state.lookAt.copy(targetLookAt);
                state.initialized = true;
            } else {
                state.position.lerp(targetPosition, blend);
                state.lookAt.lerp(targetLookAt, blend);
            }
            camera.position.copy(state.position);
            camera.lookAt(state.lookAt);
            state.appliedThisFrame = true;
        }

        getCameraCollisionState(camera) {
            let state = this.cameraCollisionState.get(camera);
            if (!state) {
                state = { wasColliding: false, position: new THREE.Vector3() };
                this.cameraCollisionState.set(camera, state);
            }
            return state;
        }

        releaseCameraCollision(camera, delta) {
            const state = this.cameraCollisionState.get(camera);
            if (!state || !state.wasColliding) return false;
            const target = camera.position.clone();
            state.position.lerp(target, 1 - Math.exp(-Math.max(0.001, delta || 0.016) * 5));
            camera.position.copy(state.position);
            const focus = this.cameraFocus;
            camera.lookAt(focus);
            if (this.currentCamPos) this.currentCamPos.copy(camera.position);
            if (this.currentLookAt) this.currentLookAt.copy(focus);
            if (state.position.distanceToSquared(target) < 0.0025) {
                state.position.copy(target);
                state.wasColliding = false;
            }
            return true;
        }

        updateCameraFov(camera, delta) {
            if (!camera || !Number.isFinite(camera.fov)) return;
            if (!this.cameraFovBase.has(camera)) this.cameraFovBase.set(camera, camera.fov);
            const baseFov = this.cameraFovBase.get(camera);
            const aspect = camera.aspect || window.innerWidth / Math.max(1, window.innerHeight);
            const portraitBoost = aspect < 0.9 ? Math.min(14, (0.9 - aspect) * 22) : 0;
            const flightBoost = window.EgyptFlightEngine && window.EgyptFlightEngine.isFlying ? 3.5 : 0;
            const motionBoost = Math.min(3, this.motionSpeed * 0.28);
            const styleBoost = this.isFirstPerson ? 0 : this.getCameraStyle().fov;
            const targetFov = Math.max(35, Math.min(100, baseFov + portraitBoost + flightBoost + motionBoost + styleBoost));
            const blend = 1 - Math.exp(-Math.max(0.001, delta || 0.016) * 5);
            const nextFov = camera.fov + (targetFov - camera.fov) * blend;
            if (Math.abs(nextFov - camera.fov) > 0.01) {
                camera.fov = nextFov;
                camera.updateProjectionMatrix();
            }
        }
    }

    window.EgyptCameraSystem = new EgyptCameraSystem();
})(window);
