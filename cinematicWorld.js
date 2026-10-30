/**
 * Shared cinematic atmosphere for the playable Egyptian realms.
 * Procedural effects are intentionally lightweight and require no external assets.
 */
(function(window) {
    'use strict';

    function isMobileViewport() {
        const nav = window.navigator || {};
        return window.innerWidth < 720
            || (nav.maxTouchPoints > 0 && window.innerHeight < 720);
    }

    if (window.THREE && window.THREE.WebGLRenderer) {
        const OriginalWebGLRenderer = window.THREE.WebGLRenderer;
        const MobileOptimizedWebGLRenderer = function(parameters = {}) {
            const rendererOptions = Object.assign({}, parameters);
            if (isMobileViewport()) rendererOptions.antialias = false;
            return new OriginalWebGLRenderer(rendererOptions);
        };
        MobileOptimizedWebGLRenderer.prototype = OriginalWebGLRenderer.prototype;
        Object.setPrototypeOf(MobileOptimizedWebGLRenderer, OriginalWebGLRenderer);
        window.THREE.WebGLRenderer = MobileOptimizedWebGLRenderer;
    }

    const WORLD_PROFILES = [
        {
            match: /raningemisi/,
            fog: 0x080d20,
            fogDensity: 0.0007,
            sky: 0xb9c9ff,
            ground: 0x100c27,
            skyTop: '#030611',
            skyMid: '#161d48',
            skyHorizon: '#b68c75',
            skyBottom: '#21152a',
            skyGlow: '#f1a86c',
            cloudTint: '#a8bbff',
            cloudOpacity: 0.14,
            glowX: 690,
            glowY: 350,
            particleStyle: 'starlight',
            wind: 0.016,
            surfaces: {
                stone: [184, 192, 211], sand: [198, 180, 159], cloth: [196, 198, 211],
                organic: [155, 176, 171], metal: [211, 199, 168]
            },
            stars: 420,
            mote: 0xa8c7ff,
            density: 0.1,
            drift: 0.018,
            moteCount: 220
        },
        {
            match: /ahiret/,
            fog: 0x100e20,
            fogDensity: 0.0022,
            sky: 0xb9a6ff,
            ground: 0x170d1b,
            skyTop: '#05050c',
            skyMid: '#11152a',
            skyHorizon: '#49334f',
            skyBottom: '#110c19',
            skyGlow: '#ed7954',
            cloudTint: '#a885ba',
            cloudOpacity: 0.22,
            glowX: 720,
            glowY: 340,
            particleStyle: 'ash',
            wind: 0.027,
            surfaces: {
                stone: [176, 163, 183], sand: [184, 157, 145], cloth: [191, 176, 200],
                organic: [154, 171, 152], metal: [211, 183, 157]
            },
            stars: 180,
            mote: 0xc3a5ff,
            density: 0.2,
            drift: 0.042,
            moteCount: 150
        },
        {
            match: /horustap/,
            fog: 0x16100f,
            fogDensity: 0.0025,
            sky: 0xffd18a,
            ground: 0x21100b,
            skyTop: '#0a0c12',
            skyMid: '#24170f',
            skyHorizon: '#9e5931',
            skyBottom: '#1e120d',
            skyGlow: '#f4b65f',
            cloudTint: '#ffc47a',
            cloudOpacity: 0.2,
            glowX: 715,
            glowY: 350,
            particleStyle: 'ember',
            wind: 0.04,
            surfaces: {
                stone: [217, 192, 164], sand: [224, 194, 153], cloth: [222, 209, 182],
                organic: [183, 172, 124], metal: [234, 205, 143]
            },
            stars: 0,
            mote: 0xffb35c,
            density: 0.16,
            drift: 0.055,
            moteCount: 150
        },
        {
            match: /saray/,
            fog: 0x2a160c,
            fogDensity: 0.0016,
            sky: 0xffd58f,
            ground: 0x391a0b,
            skyTop: '#141323',
            skyMid: '#562b23',
            skyHorizon: '#ed914b',
            skyBottom: '#452114',
            skyGlow: '#fff0bd',
            cloudTint: '#ffd9a1',
            cloudOpacity: 0.26,
            glowX: 690,
            glowY: 340,
            particleStyle: 'dust',
            wind: 0.025,
            surfaces: {
                stone: [222, 198, 168], sand: [232, 205, 162], cloth: [228, 216, 190],
                organic: [190, 179, 128], metal: [239, 211, 151]
            },
            stars: 0,
            mote: 0xffd17a,
            density: 0.14,
            drift: 0.032,
            moteCount: 150
        },
        {
            match: /karakter|kiz\.html/,
            fog: 0x241509,
            fogDensity: 0.0035,
            sky: 0xffd79c,
            ground: 0x2b1409,
            skyTop: '#171425',
            skyMid: '#4d2a20',
            skyHorizon: '#d4874b',
            skyBottom: '#32190f',
            skyGlow: '#ffe5ae',
            cloudTint: '#ffcb83',
            cloudOpacity: 0.18,
            glowX: 700,
            glowY: 345,
            particleStyle: 'gold',
            wind: 0.02,
            surfaces: {
                stone: [222, 195, 160], sand: [229, 198, 151], cloth: [233, 215, 183],
                organic: [190, 176, 125], metal: [239, 207, 142]
            },
            stars: 0,
            mote: 0xffc76a,
            density: 0.1,
            drift: 0.024,
            moteCount: 150
        },
        {
            match: /misir|mısır/,
            fog: 0xc78b55,
            fogDensity: 0.0012,
            sky: 0xffe0a1,
            ground: 0x4c3019,
            skyTop: '#11182b',
            skyMid: '#72412c',
            skyHorizon: '#f2a45d',
            skyBottom: '#66341c',
            skyGlow: '#fff0b0',
            cloudTint: '#ffe2aa',
            cloudOpacity: 0.3,
            glowX: 690,
            glowY: 345,
            particleStyle: 'dust',
            wind: 0.048,
            surfaces: {
                stone: [224, 206, 177], sand: [236, 216, 174], cloth: [235, 222, 196],
                organic: [184, 191, 135], metal: [239, 210, 149]
            },
            stars: 0,
            mote: 0xffd475,
            density: 0.12,
            drift: 0.065,
            moteCount: 150
        }
    ];

    function getPerformanceProfile() {
        const nav = window.navigator || {};
        const isMobile = isMobileViewport();
        const lowPower = isMobile
            || (nav.hardwareConcurrency > 0 && nav.hardwareConcurrency <= 4)
            || (nav.deviceMemory > 0 && nav.deviceMemory <= 4);
        return {
            lowPower,
            pixelRatio: isMobile ? 0.75 : lowPower ? 1.25 : 1.5,
            minPixelRatio: isMobile ? 0.55 : 0.8,
            shadowMapSize: lowPower ? 512 : 1024,
            surfaceSize: lowPower ? 64 : 256,
            moteScale: lowPower ? 0.35 : 1,
            maxAnisotropy: lowPower ? 2 : 8
        };
    }

    function chooseProfile() {
        const path = decodeURIComponent(window.location.pathname.toLowerCase());
        return WORLD_PROFILES.find(profile => profile.match.test(path)) || WORLD_PROFILES[WORLD_PROFILES.length - 1];
    }

    function createSkyTexture(profile) {
        const canvas = document.createElement('canvas');
        canvas.width = 1024;
        canvas.height = 512;
        const context = canvas.getContext('2d');
        const gradient = context.createLinearGradient(0, 0, 0, canvas.height);
        gradient.addColorStop(0, profile.skyTop);
        gradient.addColorStop(0.42, profile.skyMid);
        gradient.addColorStop(0.73, profile.skyHorizon);
        gradient.addColorStop(1, profile.skyBottom);
        context.fillStyle = gradient;
        context.fillRect(0, 0, canvas.width, canvas.height);

        const glow = context.createRadialGradient(profile.glowX, profile.glowY, 4, profile.glowX, profile.glowY, 190);
        glow.addColorStop(0, `${profile.skyGlow}cc`);
        glow.addColorStop(0.18, `${profile.skyGlow}75`);
        glow.addColorStop(1, `${profile.skyGlow}00`);
        context.fillStyle = glow;
        context.fillRect(profile.glowX - 210, profile.glowY - 210, 420, 420);

        let seed = 1987;
        const random = () => {
            seed = (seed * 16807) % 2147483647;
            return (seed - 1) / 2147483646;
        };
        context.save();
        context.filter = 'blur(13px)';
        for (let i = 0; i < 34; i++) {
            const x = random() * canvas.width;
            const y = canvas.height * (0.39 + random() * 0.28);
            const length = 34 + random() * 125;
            const height = 2 + random() * 9;
            context.globalAlpha = profile.cloudOpacity * (0.28 + random() * 0.55);
            context.fillStyle = profile.cloudTint;
            context.beginPath();
            context.ellipse(x, y, length, height, (random() - 0.5) * 0.12, 0, Math.PI * 2);
            context.ellipse(x + length * 0.28, y - height, length * 0.44, height * 1.4, 0, 0, Math.PI * 2);
            context.fill();
        }
        context.restore();

        if (profile.stars === 0) {
            const sun = context.createRadialGradient(profile.glowX, profile.glowY, 2, profile.glowX, profile.glowY, 34);
            sun.addColorStop(0, '#fff9df');
            sun.addColorStop(0.3, profile.skyGlow);
            sun.addColorStop(1, `${profile.skyGlow}00`);
            context.fillStyle = sun;
            context.beginPath();
            context.arc(profile.glowX, profile.glowY, 34, 0, Math.PI * 2);
            context.fill();
        }
        for (let i = 0; i < profile.stars; i++) {
            const x = random() * canvas.width;
            const y = random() * canvas.height * 0.72;
            const radius = 0.45 + random() * 1.15;
            context.globalAlpha = 0.35 + random() * 0.55;
            context.fillStyle = random() > 0.55 ? '#fff1c8' : '#b9ccff';
            context.beginPath();
            context.arc(x, y, radius, 0, Math.PI * 2);
            context.fill();
        }
        context.globalAlpha = 1;

        const texture = new THREE.CanvasTexture(canvas);
        texture.encoding = THREE.sRGBEncoding;
        return texture;
    }

    function createMotes(scene, camera, profile, quality) {
        const count = Math.max(40, Math.round(profile.moteCount * quality.moteScale));
        const positions = new Float32Array(count * 3);
        const velocities = new Float32Array(count * 3);
        const colors = new Float32Array(count * 3);
        const baseColor = new THREE.Color(profile.mote);
        for (let i = 0; i < count; i++) {
            const offset = i * 3;
            positions[offset] = (Math.random() - 0.5) * 76;
            positions[offset + 1] = (Math.random() - 0.5) * 38;
            positions[offset + 2] = -Math.random() * 58 - 2;
            velocities[offset] = (Math.random() - 0.35) * profile.drift;
            velocities[offset + 1] = (Math.random() - 0.5) * profile.drift * 0.35;
            velocities[offset + 2] = (Math.random() - 0.5) * profile.drift * 0.55;
            const brightness = 0.72 + Math.random() * 0.45;
            colors[offset] = Math.min(1, baseColor.r * brightness);
            colors[offset + 1] = Math.min(1, baseColor.g * brightness);
            colors[offset + 2] = Math.min(1, baseColor.b * brightness);
        }

        const geometry = new THREE.BufferGeometry();
        const positionAttribute = new THREE.BufferAttribute(positions, 3);
        positionAttribute.setUsage(THREE.DynamicDrawUsage);
        geometry.setAttribute('position', positionAttribute);
        geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

        const spriteCanvas = document.createElement('canvas');
        spriteCanvas.width = 32;
        spriteCanvas.height = 32;
        const spriteContext = spriteCanvas.getContext('2d');
        const spriteGradient = spriteContext.createRadialGradient(16, 16, 0, 16, 16, 16);
        const spriteCore = profile.particleStyle === 'ash' ? 'rgba(238,207,222,0.85)' : 'rgba(255,255,255,1)';
        const spriteMid = profile.particleStyle === 'dust' ? 'rgba(255,221,157,0.58)' : 'rgba(255,255,255,0.72)';
        spriteGradient.addColorStop(0, spriteCore);
        spriteGradient.addColorStop(0.18, spriteMid);
        spriteGradient.addColorStop(0.58, 'rgba(255,255,255,0.16)');
        spriteGradient.addColorStop(1, 'rgba(255,255,255,0)');
        spriteContext.fillStyle = spriteGradient;
        spriteContext.fillRect(0, 0, 32, 32);
        if (profile.particleStyle === 'starlight') {
            spriteContext.save();
            spriteContext.globalAlpha = 0.62;
            spriteContext.fillStyle = '#ffffff';
            spriteContext.beginPath();
            spriteContext.ellipse(16, 16, 1, 13, 0, 0, Math.PI * 2);
            spriteContext.ellipse(16, 16, 13, 1, 0, 0, Math.PI * 2);
            spriteContext.fill();
            spriteContext.restore();
        }
        const spriteTexture = new THREE.CanvasTexture(spriteCanvas);

        const material = new THREE.PointsMaterial({
            color: 0xffffff,
            map: spriteTexture,
            vertexColors: true,
            size: profile.particleStyle === 'starlight' ? 0.16 : 0.12,
            transparent: true,
            opacity: profile.density,
            alphaTest: 0.01,
            depthWrite: false,
            sizeAttenuation: true,
            blending: THREE.AdditiveBlending
        });
        const motes = new THREE.Points(geometry, material);
        motes.frustumCulled = false;
        scene.add(motes);

        const cameraPosition = new THREE.Vector3();
        const cameraRotation = new THREE.Quaternion();
        return (delta, elapsed) => {
            camera.getWorldPosition(cameraPosition);
            camera.getWorldQuaternion(cameraRotation);
            motes.position.copy(cameraPosition);
            motes.quaternion.copy(cameraRotation);
            const gust = Math.sin(elapsed * 0.24) * profile.wind
                + Math.sin(elapsed * 0.61 + 1.7) * profile.wind * 0.34;

            for (let i = 0; i < count; i++) {
                const offset = i * 3;
                positions[offset] += (velocities[offset] + gust) * delta * 60;
                positions[offset + 1] += (velocities[offset + 1] + Math.sin(elapsed * 0.52 + i * 0.39) * profile.wind * 0.025) * delta * 60;
                positions[offset + 2] += velocities[offset + 2] * delta * 60;
                positions[offset + 1] += Math.sin(elapsed * 0.7 + i * 1.7) * 0.0007;

                if (positions[offset] < -38) positions[offset] = 38;
                else if (positions[offset] > 38) positions[offset] = -38;
                if (positions[offset + 1] < -19) positions[offset + 1] = 19;
                else if (positions[offset + 1] > 19) positions[offset + 1] = -19;
                if (positions[offset + 2] > -2) positions[offset + 2] = -60;
                else if (positions[offset + 2] < -60) positions[offset + 2] = -2;
            }
            positionAttribute.needsUpdate = true;
        };
    }

    function createSurfaceMaps(kind, maxAnisotropy, profile, quality) {
        const size = quality.surfaceSize;
        const heights = new Uint8Array(size * size);
        const roughness = new Uint8Array(size * size);
        const albedo = new Uint8Array(size * size * 4);
        const fade = value => value * value * (3 - 2 * value);
        const hash = (x, y, period) => {
            const wrappedX = ((x % period) + period) % period;
            const wrappedY = ((y % period) + period) % period;
            let value = Math.imul(wrappedX, 374761393) + Math.imul(wrappedY, 668265263) + Math.imul(period, 1442695041);
            value = Math.imul(value ^ (value >>> 13), 1274126177);
            value ^= value >>> 16;
            return (value >>> 0) / 2147483647 - 1;
        };
        const noise = (u, v, period) => {
            const x = u * period;
            const y = v * period;
            const x0 = Math.floor(x);
            const y0 = Math.floor(y);
            const tx = fade(x - x0);
            const ty = fade(y - y0);
            const top = THREE.MathUtils.lerp(hash(x0, y0, period), hash(x0 + 1, y0, period), tx);
            const bottom = THREE.MathUtils.lerp(hash(x0, y0 + 1, period), hash(x0 + 1, y0 + 1, period), tx);
            return THREE.MathUtils.lerp(top, bottom, ty);
        };
        const baseColor = profile.surfaces[kind] || (kind === 'sand' ? [239, 222, 194]
            : kind === 'cloth' ? [234, 224, 204]
                : kind === 'organic' ? [218, 226, 194]
                    : kind === 'metal' ? [238, 230, 207]
                        : kind === 'skin' ? [218, 183, 157] : [222, 217, 207]);
        for (let y = 0; y < size; y++) {
            for (let x = 0; x < size; x++) {
                const u = x / size;
                const v = y / size;
                const tau = Math.PI * 2;
                const broad = noise(u, v, 8);
                const medium = noise(u, v, 32);
                const fine = noise(u, v, 128);
                const grain = broad * 0.52 + medium * 0.32 + fine * 0.16;
                let detail = grain;
                if (kind === 'sand') {
                    const dune = Math.sin(tau * (v * 22 + Math.sin(u * tau * 3 + broad) * 0.035));
                    detail = dune * 0.18 + grain * 0.42;
                } else if (kind === 'cloth') {
                    const weave = Math.sin(tau * u * 96) * Math.sin(tau * v * 92);
                    detail = grain * 0.28 + weave * 0.12 + medium * 0.08;
                } else if (kind === 'metal') {
                    const brushed = Math.sin(tau * (v * 170 + broad * 0.018));
                    detail = grain * 0.18 + brushed * 0.06;
                } else if (kind === 'organic') {
                    const fibers = Math.sin(tau * (u * 11 + broad * 0.3)) * 0.08;
                    detail = grain * 0.4 + fibers;
                } else if (kind === 'stone') {
                    const fissure = Math.pow(Math.max(0, 0.18 - Math.abs(medium + broad * 0.28)), 2);
                    const toolMarks = Math.sin(tau * (u * 54 + v * 0.16 + medium * 0.035));
                    detail = grain * 0.55 - fissure * 0.7 + toolMarks * 0.025;
                } else if (kind === 'skin') {
                    const pores = Math.sin(tau * (u * 192 + fine * 0.1))
                        * Math.sin(tau * (v * 184 + medium * 0.08));
                    detail = grain * 0.22 + pores * 0.018;
                }

                const index = y * size + x;
                heights[index] = Math.max(0, Math.min(255, Math.round(128 + detail * 72)));
                const roughBase = kind === 'metal' ? 148
                    : kind === 'cloth' ? 228
                        : kind === 'organic' ? 198 : kind === 'sand' ? 232 : kind === 'skin' ? 194 : 216;
                roughness[index] = Math.max(0, Math.min(255, Math.round(roughBase + grain * 34)));
                const albedoOffset = index * 4;
                const colorVariation = detail * 27;
                albedo[albedoOffset] = Math.max(0, Math.min(255, Math.round(baseColor[0] + colorVariation)));
                albedo[albedoOffset + 1] = Math.max(0, Math.min(255, Math.round(baseColor[1] + colorVariation)));
                albedo[albedoOffset + 2] = Math.max(0, Math.min(255, Math.round(baseColor[2] + colorVariation)));
                albedo[albedoOffset + 3] = 255;
            }
        }

        const createTexture = (pixels, colorSpace = false) => {
            const canvas = document.createElement('canvas');
            canvas.width = size;
            canvas.height = size;
            const context = canvas.getContext('2d');
            const image = context.createImageData(size, size);
            if (colorSpace) {
                image.data.set(pixels);
            } else {
                for (let i = 0; i < pixels.length; i++) {
                    const offset = i * 4;
                    image.data[offset] = pixels[i];
                    image.data[offset + 1] = pixels[i];
                    image.data[offset + 2] = pixels[i];
                    image.data[offset + 3] = 255;
                }
            }
            context.putImageData(image, 0, 0);
            const texture = new THREE.CanvasTexture(canvas);
            if (colorSpace) texture.encoding = THREE.sRGBEncoding;
            texture.wrapS = THREE.RepeatWrapping;
            texture.wrapT = THREE.RepeatWrapping;
            texture.repeat.set(kind === 'cloth' ? 1 : 2, kind === 'cloth' ? 1 : 2);
            texture.generateMipmaps = true;
            texture.minFilter = THREE.LinearMipmapLinearFilter;
            texture.magFilter = THREE.LinearFilter;
            texture.anisotropy = maxAnisotropy;
            return texture;
        };

        const normalCanvas = document.createElement('canvas');
        normalCanvas.width = size;
        normalCanvas.height = size;
        const normalContext = normalCanvas.getContext('2d');
        const normalImage = normalContext.createImageData(size, size);
        for (let y = 0; y < size; y++) {
            for (let x = 0; x < size; x++) {
                const index = y * size + x;
                const left = heights[y * size + (x + size - 1) % size];
                const right = heights[y * size + (x + 1) % size];
                const up = heights[((y + size - 1) % size) * size + x];
                const down = heights[((y + 1) % size) * size + x];
                const offset = index * 4;
                normalImage.data[offset] = Math.max(0, Math.min(255, Math.round(128 + (left - right) * 1.7)));
                normalImage.data[offset + 1] = Math.max(0, Math.min(255, Math.round(128 + (up - down) * 1.7)));
                normalImage.data[offset + 2] = 250;
                normalImage.data[offset + 3] = 255;
            }
        }
        normalContext.putImageData(normalImage, 0, 0);
        const normalMap = new THREE.CanvasTexture(normalCanvas);
        normalMap.wrapS = THREE.RepeatWrapping;
        normalMap.wrapT = THREE.RepeatWrapping;
        normalMap.repeat.set(2, 2);
        normalMap.generateMipmaps = true;
        normalMap.minFilter = THREE.LinearMipmapLinearFilter;
        normalMap.magFilter = THREE.LinearFilter;
        normalMap.anisotropy = maxAnisotropy;

        return {
            map: createTexture(albedo, true),
            normalMap,
            roughnessMap: createTexture(roughness),
            bumpMap: createTexture(heights)
        };
    }

    function getSurfaceKind(material) {
        if (material.metalness >= 0.58) return 'metal';
        const color = material.color;
        if (!color) return 'stone';
        const hsl = color.getHSL({ h: 0, s: 0, l: 0 });
        if (hsl.h >= 0.015 && hsl.h <= 0.12 && hsl.s >= 0.18 && hsl.s <= 0.72 && hsl.l >= 0.28 && hsl.l <= 0.78) {
            return 'skin';
        }
        if (hsl.h > 0.19 && hsl.h < 0.43 && hsl.s > 0.14) return 'organic';
        if (hsl.s > 0.36 && (hsl.h < 0.72 || hsl.h > 0.88)) return 'cloth';
        if (hsl.l > 0.53 && (hsl.h < 0.16 || hsl.h > 0.88)) return 'sand';
        return 'stone';
    }

    function addSurfaceDetail(scene, skyTexture, maxAnisotropy, profile, quality) {
        const surfaceMaps = {};
        const treatedMaterials = new Set();
        const treatedTextures = new Set();
        scene.traverse(object => {
            if (!object.isMesh || !object.material) return;
            const sphereRadius = object.geometry && object.geometry.parameters && object.geometry.parameters.radius;
            if (sphereRadius > 400) {
                for (const skyMaterial of Array.isArray(object.material) ? object.material : [object.material]) {
                    if (skyMaterial.isMeshBasicMaterial && skyMaterial.map) {
                        skyMaterial.map = skyTexture;
                        skyMaterial.needsUpdate = true;
                    }
                }
            }
            const materials = Array.isArray(object.material) ? object.material : [object.material];
            for (const material of materials) {
                if ((!material.isMeshStandardMaterial && !material.isMeshPhysicalMaterial)
                    || treatedMaterials.has(material)) continue;
                treatedMaterials.add(material);
                for (const mapName of ['map', 'normalMap', 'roughnessMap', 'metalnessMap', 'bumpMap', 'aoMap', 'emissiveMap']) {
                    const texture = material[mapName];
                    if (!texture || texture.isCubeTexture || treatedTextures.has(texture)) continue;
                    treatedTextures.add(texture);
                    if (texture.anisotropy < maxAnisotropy) {
                        texture.anisotropy = maxAnisotropy;
                        texture.needsUpdate = true;
                    }
                }
                const kind = getSurfaceKind(material);
                const maps = surfaceMaps[kind] || (surfaceMaps[kind] = createSurfaceMaps(kind, maxAnisotropy, profile, quality));
                const fallbackMaps = {};
                if (!material.map) material.map = fallbackMaps.map = maps.map;
                if (!material.normalMap) material.normalMap = fallbackMaps.normalMap = maps.normalMap;
                if (!material.roughnessMap) material.roughnessMap = fallbackMaps.roughnessMap = maps.roughnessMap;
                if (!material.bumpMap) {
                    material.bumpMap = fallbackMaps.bumpMap = maps.bumpMap;
                    material.bumpScale = kind === 'skin' ? 0.0015
                        : kind === 'sand' ? 0.012
                            : kind === 'metal' ? 0.004
                                : kind === 'cloth' ? 0.006 : 0.009;
                }
                if (!material.normalScale) material.normalScale = new THREE.Vector2(0.13, 0.13);
                else material.normalScale.multiplyScalar(0.82);
                material.needsUpdate = true;
            }
        });
        return treatedMaterials.size;
    }

    function addFrame() {
        if (document.getElementById('cinematic-world-frame')) return;
        const frame = document.createElement('div');
        frame.id = 'cinematic-world-frame';
        frame.setAttribute('aria-hidden', 'true');
        frame.style.cssText = [
            'position:fixed',
            'inset:0',
            'z-index:8',
            'pointer-events:none',
            'background:radial-gradient(ellipse at 50% 46%, transparent 49%, rgba(12,8,10,.12) 76%, rgba(8,6,9,.34) 100%)'
        ].join(';');
        document.body.appendChild(frame);
    }

    function install(scene, renderer, camera) {
        if (!scene || !renderer || !camera || scene.userData.cinematicWorldInstalled) return;
        scene.userData.cinematicWorldInstalled = true;

        const profile = chooseProfile();
        const quality = getPerformanceProfile();
        const skyTexture = createSkyTexture(profile);
        scene.background = skyTexture;
        const pixelRatio = Math.min(window.devicePixelRatio || 1, quality.pixelRatio);
        renderer.setPixelRatio(pixelRatio);
        renderer.setSize(window.innerWidth, window.innerHeight);
        if ('outputEncoding' in renderer && THREE.sRGBEncoding !== undefined) {
            renderer.outputEncoding = THREE.sRGBEncoding;
        }
        renderer.toneMapping = THREE.ACESFilmicToneMapping;
        renderer.shadowMap.enabled = !quality.lowPower;
        renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        const maxAnisotropy = renderer.capabilities && renderer.capabilities.getMaxAnisotropy
            ? Math.min(renderer.capabilities.getMaxAnisotropy(), quality.maxAnisotropy)
            : 1;
        skyTexture.anisotropy = maxAnisotropy;

        if (scene.fog && scene.fog.color) {
            scene.fog.color.setHex(profile.fog);
        } else {
            scene.fog = new THREE.FogExp2(profile.fog, profile.fogDensity);
        }
        scene.add(new THREE.HemisphereLight(profile.sky, profile.ground, profile.moteCount > 200 ? 0.12 : 0.16));
        const updateMotes = createMotes(scene, camera, profile, quality);
        addFrame();

        const render = renderer.render.bind(renderer);
        let lastFrameTime = 0;
        let qualitySampleStart = performance.now();
        let qualityFrameCount = 0;
        let currentPixelRatio = pixelRatio;
        let shadowQualityApplied = false;
        let surfaceDetailReady = false;
        const initializeSurfaceDetail = () => {
            if (surfaceDetailReady) return;
            if (!quality.lowPower) {
                addSurfaceDetail(scene, skyTexture, maxAnisotropy, profile, quality);
            }
            surfaceDetailReady = true;
        };
        if (window.requestIdleCallback) {
            window.requestIdleCallback(initializeSurfaceDetail, { timeout: 1600 });
        } else {
            window.setTimeout(initializeSurfaceDetail, 0);
        }
        renderer.render = function(activeScene, activeCamera) {
            if (activeScene === scene && activeCamera) {
                if (!shadowQualityApplied) {
                    activeScene.traverse(object => {
                        if (!object.isLight || !object.castShadow || !object.shadow || !object.shadow.mapSize) return;
                        if (object.shadow.mapSize.x > quality.shadowMapSize
                            || object.shadow.mapSize.y > quality.shadowMapSize) {
                            object.shadow.mapSize.set(quality.shadowMapSize, quality.shadowMapSize);
                            object.shadow.needsUpdate = true;
                        }
                    });
                    shadowQualityApplied = true;
                }
                const now = performance.now() / 1000;
                const delta = lastFrameTime ? Math.min(now - lastFrameTime, 0.05) : 0;
                lastFrameTime = now;
                updateMotes(delta, now);

                if (quality.lowPower) {
                    const studio = window.EgyptCinematicStudio;
                    if (studio && (studio.isRecording || studio.isPreparingRecording)) {
                        qualitySampleStart = performance.now();
                        qualityFrameCount = 0;
                    } else {
                        qualityFrameCount++;
                        const sampleNow = performance.now();
                        const sampleDuration = sampleNow - qualitySampleStart;
                        if (sampleDuration >= 1000) {
                            const framesPerSecond = qualityFrameCount * 1000 / sampleDuration;
                            let nextPixelRatio = currentPixelRatio;
                            if (framesPerSecond < 27) {
                                nextPixelRatio = Math.max(quality.minPixelRatio, currentPixelRatio - 0.1);
                            } else if (framesPerSecond > 42) {
                                nextPixelRatio = Math.min(pixelRatio, currentPixelRatio + 0.05);
                            }
                            if (Math.abs(nextPixelRatio - currentPixelRatio) >= 0.02) {
                                currentPixelRatio = nextPixelRatio;
                                renderer.setPixelRatio(currentPixelRatio);
                                renderer.setSize(window.innerWidth, window.innerHeight);
                            }
                            qualitySampleStart = sampleNow;
                            qualityFrameCount = 0;
                        }
                    }
                }
            }
            return render(activeScene, activeCamera);
        };
    }

    window.EgyptCinematicWorld = { install };
})(window);
