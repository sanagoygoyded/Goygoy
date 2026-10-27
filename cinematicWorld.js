/**
 * Shared cinematic atmosphere for the playable Egyptian realms.
 * Procedural effects are intentionally lightweight and require no external assets.
 */
(function(window) {
    'use strict';

    const WORLD_PROFILES = [
        {
            match: /raningemisi/,
            fog: 0x080d20,
            sky: 0xb9c9ff,
            ground: 0x100c27,
            skyTop: '#030611',
            skyMid: '#161d48',
            skyHorizon: '#b68c75',
            skyBottom: '#21152a',
            skyGlow: '#f1a86c',
            stars: 420,
            mote: 0xa8c7ff,
            density: 0.1,
            drift: 0.018,
            moteCount: 220
        },
        {
            match: /ahiret/,
            fog: 0x100e20,
            sky: 0xb9a6ff,
            ground: 0x170d1b,
            skyTop: '#05050c',
            skyMid: '#11152a',
            skyHorizon: '#49334f',
            skyBottom: '#110c19',
            skyGlow: '#ed7954',
            stars: 180,
            mote: 0xc3a5ff,
            density: 0.2,
            drift: 0.042,
            moteCount: 150
        },
        {
            match: /horustap/,
            fog: 0x16100f,
            sky: 0xffd18a,
            ground: 0x21100b,
            skyTop: '#0a0c12',
            skyMid: '#24170f',
            skyHorizon: '#9e5931',
            skyBottom: '#1e120d',
            skyGlow: '#f4b65f',
            stars: 0,
            mote: 0xffb35c,
            density: 0.16,
            drift: 0.055,
            moteCount: 150
        },
        {
            match: /saray/,
            fog: 0x2a160c,
            sky: 0xffd58f,
            ground: 0x391a0b,
            skyTop: '#141323',
            skyMid: '#562b23',
            skyHorizon: '#ed914b',
            skyBottom: '#452114',
            skyGlow: '#fff0bd',
            stars: 0,
            mote: 0xffd17a,
            density: 0.14,
            drift: 0.032,
            moteCount: 150
        },
        {
            match: /karakter|kiz\.html/,
            fog: 0x241509,
            sky: 0xffd79c,
            ground: 0x2b1409,
            skyTop: '#171425',
            skyMid: '#4d2a20',
            skyHorizon: '#d4874b',
            skyBottom: '#32190f',
            skyGlow: '#ffe5ae',
            stars: 0,
            mote: 0xffc76a,
            density: 0.1,
            drift: 0.024,
            moteCount: 150
        },
        {
            match: /misir|mısır/,
            fog: 0xc78b55,
            sky: 0xffe0a1,
            ground: 0x4c3019,
            skyTop: '#11182b',
            skyMid: '#72412c',
            skyHorizon: '#f2a45d',
            skyBottom: '#66341c',
            skyGlow: '#fff0b0',
            stars: 0,
            mote: 0xffd475,
            density: 0.12,
            drift: 0.065,
            moteCount: 150
        }
    ];

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

        const glow = context.createRadialGradient(690, 350, 4, 690, 350, 170);
        glow.addColorStop(0, `${profile.skyGlow}cc`);
        glow.addColorStop(0.18, `${profile.skyGlow}75`);
        glow.addColorStop(1, `${profile.skyGlow}00`);
        context.fillStyle = glow;
        context.fillRect(500, 160, 380, 380);

        let seed = 1987;
        const random = () => {
            seed = (seed * 16807) % 2147483647;
            return (seed - 1) / 2147483646;
        };
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

    function createMotes(scene, camera, profile) {
        const count = profile.moteCount;
        const positions = new Float32Array(count * 3);
        const velocities = new Float32Array(count * 3);
        for (let i = 0; i < count; i++) {
            const offset = i * 3;
            positions[offset] = (Math.random() - 0.5) * 76;
            positions[offset + 1] = (Math.random() - 0.5) * 38;
            positions[offset + 2] = -Math.random() * 58 - 2;
            velocities[offset] = (Math.random() - 0.35) * profile.drift;
            velocities[offset + 1] = (Math.random() - 0.5) * profile.drift * 0.35;
            velocities[offset + 2] = (Math.random() - 0.5) * profile.drift * 0.55;
        }

        const geometry = new THREE.BufferGeometry();
        const positionAttribute = new THREE.BufferAttribute(positions, 3);
        positionAttribute.setUsage(THREE.DynamicDrawUsage);
        geometry.setAttribute('position', positionAttribute);

        const material = new THREE.PointsMaterial({
            color: profile.mote,
            size: 0.055,
            transparent: true,
            opacity: profile.density,
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

            for (let i = 0; i < count; i++) {
                const offset = i * 3;
                positions[offset] += velocities[offset] * delta * 60;
                positions[offset + 1] += velocities[offset + 1] * delta * 60;
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
        scene.background = createSkyTexture(profile);
        if ('outputEncoding' in renderer && THREE.sRGBEncoding !== undefined) {
            renderer.outputEncoding = THREE.sRGBEncoding;
        }
        renderer.toneMapping = THREE.ACESFilmicToneMapping;
        renderer.shadowMap.enabled = true;
        renderer.shadowMap.type = THREE.PCFSoftShadowMap;

        if (scene.fog && scene.fog.color) scene.fog.color.setHex(profile.fog);
        scene.add(new THREE.HemisphereLight(profile.sky, profile.ground, profile.moteCount > 200 ? 0.12 : 0.16));
        const updateMotes = createMotes(scene, camera, profile);
        addFrame();

        const render = renderer.render.bind(renderer);
        let lastFrameTime = 0;
        renderer.render = function(activeScene, activeCamera) {
            if (activeScene === scene && activeCamera) {
                const now = performance.now() / 1000;
                const delta = lastFrameTime ? Math.min(now - lastFrameTime, 0.05) : 0;
                lastFrameTime = now;
                updateMotes(delta, now);
            }
            return render(activeScene, activeCamera);
        };
    }

    window.EgyptCinematicWorld = { install };
})(window);
