/**
 * Gods of Egypt MMORPG - Unified Global Camera Engine
 * Seamless First-Person (FPV) & Third-Person (TPV) System with Scale-Aware Eye Heights & Head Bob
 * Kısayol: [V] tuşu veya Arayüzdeki Kamera Düğmesi ile 1. Şahıs / 3. Şahıs geçişi
 */
(function(window) {
    'use strict';

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
            const role = (state && state.player) ? state.player.role : 'bek';
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

            const eyeHeight = this.getEyeHeight(player);
            const posX = player.root.position.x;
            const posY = player.root.position.y;
            const posZ = player.root.position.z;

            // Kamera Dikey Açı Sınırları (-85° ile +85° arası tam kubbe/gökyüzü ve yer bakışı)
            this.camPitch = Math.max(-1.42, Math.min(1.42, this.camPitch));

            if (this.isFirstPerson) {
                // 1. ŞAHIS MODU: karakterin gövdesinin içine girilmesin; sadece baş ve göze odaklan
                player.root.visible = true;
                player.root.traverse && player.root.traverse((child) => {
                    if (child.material) child.material.transparent = true;
                    if (child.material) child.material.opacity = 0.92;
                });

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
                    eyeX + lookDirX * 12.0,
                    eyeY + lookDirY * 12.0,
                    eyeZ + lookDirZ * 12.0
                );

                if (!this.currentCamPos) this.currentCamPos = targetPos.clone();
                if (!this.currentLookAt) this.currentLookAt = targetLook.clone();

                this.currentCamPos.lerp(targetPos, 0.45);
                this.currentLookAt.lerp(targetLook, 0.55);

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
                player.root.traverse && player.root.traverse((child) => {
                    if (child.material) child.material.transparent = false;
                    if (child.material) child.material.opacity = 1;
                });

                const scaleValue = player.root && player.root.scale ? Math.max(1.0, player.root.scale.x || 1.0) : 1.0;
                const desiredDistance = Math.max(this.minDist, Math.min(this.desiredDist, this.maxDist));
                this.camDist = THREE.MathUtils.lerp(this.camDist, desiredDistance, 0.12);

                const focusX = posX;
                const focusY = posY + eyeHeight * 0.85;
                const focusZ = posZ;

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

                this.currentCamPos.lerp(targetPos, 0.22);
                this.currentLookAt.lerp(targetLook, 0.28);

                camera.position.copy(this.currentCamPos);
                camera.lookAt(this.currentLookAt);
            }
        }
    }

    window.EgyptCameraSystem = new EgyptCameraSystem();
})(window);
