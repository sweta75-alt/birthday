import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { FontLoader } from 'three/addons/loaders/FontLoader.js';
import { TextGeometry } from 'three/addons/geometries/TextGeometry.js';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';

// ============================================
//   🏰 DISNEY PRINCESS BIRTHDAY WORLD 🏰
// ============================================

const DISNEY = {
    cinderellaBlue:   0x4A8FD4,
    auroraPink:       0xF7A8C4,
    auroraPinkDeep:   0xE8749E,
    rapunzelPurple:   0x8E6BBF,
    belleGold:        0xF5C542,
    belleGoldGlow:    0xFFE17A,
    snowRed:          0xD94F5C,
    arielTeal:        0x2ECDC0,
    fairyWhite:       0xFFF8F0,
    skyTop:           0x1a1040,
    skyBottom:        0x2d1b69,
    grass:            0x2a6e3f,
    cakeWhite:        0xFFF5EE,
    cakePink:         0xFFC0CB,
    cakeLavender:     0xD8BFD8,
};

let celebrationActive = false;

// --- SCENE, CAMERA, RENDERER ---
const scene = new THREE.Scene();
scene.fog = new THREE.FogExp2(0x1a1040, 0.008);

const camera = new THREE.PerspectiveCamera(65, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(0, 10, 35);

const canvas = document.querySelector('#birthday-canvas');
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: false });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;

// Dreamy gradient sky
const skyCanvas = document.createElement('canvas');
skyCanvas.width = 2;
skyCanvas.height = 512;
const skyCtx = skyCanvas.getContext('2d');
const skyGrad = skyCtx.createLinearGradient(0, 0, 0, 512);
skyGrad.addColorStop(0.0, '#0d0826');
skyGrad.addColorStop(0.3, '#1a1040');
skyGrad.addColorStop(0.6, '#2d1b69');
skyGrad.addColorStop(0.85, '#4a2080');
skyGrad.addColorStop(1.0, '#6b3fa0');
skyCtx.fillStyle = skyGrad;
skyCtx.fillRect(0, 0, 2, 512);
const skyTexture = new THREE.CanvasTexture(skyCanvas);
scene.background = skyTexture;

// Controls
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.05;
controls.enableZoom = true;
controls.maxPolarAngle = Math.PI / 2.1;
controls.minDistance = 15;
controls.maxDistance = 60;

// --- POST PROCESSING (Dreamy Bloom) ---
const composer = new EffectComposer(renderer);
composer.addPass(new RenderPass(scene, camera));

const bloomPass = new UnrealBloomPass(
    new THREE.Vector2(window.innerWidth, window.innerHeight),
    1.2, 0.6, 0.7
);
composer.addPass(bloomPass);

// --- LIGHTING (Warm, Magical) ---
const ambientLight = new THREE.AmbientLight(0xb8a0d8, 0.6);
scene.add(ambientLight);

// Moonlight from above
const moonLight = new THREE.DirectionalLight(0xc8c0f0, 0.8);
moonLight.position.set(-20, 40, 20);
moonLight.castShadow = true;
scene.add(moonLight);

// Warm spotlight on cake
const cakeSpot = new THREE.SpotLight(DISNEY.belleGold, 60, 60, 0.6, 0.8);
cakeSpot.position.set(0, 25, 10);
cakeSpot.target.position.set(0, 0, 0);
cakeSpot.castShadow = true;
scene.add(cakeSpot);
scene.add(cakeSpot.target);

// Pink side fill
const pinkFill = new THREE.PointLight(DISNEY.auroraPink, 15, 50);
pinkFill.position.set(15, 10, 10);
scene.add(pinkFill);

// Blue side fill
const blueFill = new THREE.PointLight(DISNEY.cinderellaBlue, 15, 50);
blueFill.position.set(-15, 10, 10);
scene.add(blueFill);

// ======================================
//   ✨ TWINKLING STARS
// ======================================
const starCount = 3000;
const starGeo = new THREE.BufferGeometry();
const starPos = new Float32Array(starCount * 3);
const starSizes = new Float32Array(starCount);
for (let i = 0; i < starCount; i++) {
    starPos[i * 3]     = THREE.MathUtils.randFloatSpread(600);
    starPos[i * 3 + 1] = THREE.MathUtils.randFloat(20, 300);
    starPos[i * 3 + 2] = THREE.MathUtils.randFloatSpread(600);
    starSizes[i] = THREE.MathUtils.randFloat(0.3, 1.5);
}
starGeo.setAttribute('position', new THREE.Float32BufferAttribute(starPos, 3));
starGeo.setAttribute('size', new THREE.Float32BufferAttribute(starSizes, 1));

const starMat = new THREE.PointsMaterial({
    color: 0xFFFFFF,
    size: 0.8,
    transparent: true,
    opacity: 0.9,
    blending: THREE.AdditiveBlending,
    sizeAttenuation: true,
});
const stars = new THREE.Points(starGeo, starMat);
scene.add(stars);

// ======================================
//   🌙 CRESCENT MOON
// ======================================
function createMoon() {
    const moonGroup = new THREE.Group();
    const moonGeo = new THREE.SphereGeometry(5, 32, 32);
    const moonMat = new THREE.MeshPhongMaterial({
        color: 0xFFF8DC,
        emissive: 0xFFF8DC,
        emissiveIntensity: 0.4,
        shininess: 30
    });
    const moon = new THREE.Mesh(moonGeo, moonMat);

    // "bite" to make crescent
    const bite = new THREE.Mesh(
        new THREE.SphereGeometry(4.5, 32, 32),
        new THREE.MeshBasicMaterial({ color: 0x1a1040 })
    );
    bite.position.set(3, 1, 0);

    moonGroup.add(moon);
    moonGroup.add(bite);
    moonGroup.position.set(-40, 50, -60);

    // Moon glow
    const glowGeo = new THREE.SphereGeometry(7, 32, 32);
    const glowMat = new THREE.MeshBasicMaterial({
        color: 0xFFF8DC,
        transparent: true,
        opacity: 0.08,
    });
    moonGroup.add(new THREE.Mesh(glowGeo, glowMat));

    scene.add(moonGroup);
    return moonGroup;
}
const moon = createMoon();

// ======================================
//   🏰 ENCHANTED CASTLE
// ======================================
function createCastle() {
    const castle = new THREE.Group();
    const stoneMat = new THREE.MeshPhongMaterial({
        color: 0xd4c5f0,
        emissive: 0x3d1a6e,
        emissiveIntensity: 0.15,
        shininess: 20,
    });
    const roofMat = new THREE.MeshPhongMaterial({
        color: DISNEY.cinderellaBlue,
        emissive: 0x2255aa,
        emissiveIntensity: 0.2,
        shininess: 60,
    });
    const roofPinkMat = new THREE.MeshPhongMaterial({
        color: DISNEY.auroraPink,
        emissive: DISNEY.auroraPinkDeep,
        emissiveIntensity: 0.15,
        shininess: 60,
    });

    const towers = [
        { x: -8,  z: -35, h: 18, r: 2,   roof: roofMat },
        { x: 8,   z: -35, h: 18, r: 2,   roof: roofMat },
        { x: -5,  z: -40, h: 26, r: 2.5, roof: roofPinkMat },
        { x: 5,   z: -40, h: 26, r: 2.5, roof: roofPinkMat },
        { x: 0,   z: -45, h: 38, r: 3.5, roof: roofMat },     // Center tall tower
        { x: -12, z: -42, h: 15, r: 1.8, roof: roofPinkMat },
        { x: 12,  z: -42, h: 15, r: 1.8, roof: roofPinkMat },
    ];

    towers.forEach(t => {
        // Tower body
        const cyl = new THREE.Mesh(new THREE.CylinderGeometry(t.r, t.r * 1.1, t.h, 24), stoneMat);
        cyl.position.set(t.x, t.h / 2 - 5, t.z);
        cyl.castShadow = true;
        castle.add(cyl);

        // Pointed roof
        const cone = new THREE.Mesh(new THREE.ConeGeometry(t.r + 0.8, t.h * 0.35, 24), t.roof);
        cone.position.set(t.x, t.h - 5 + (t.h * 0.35) / 2, t.z);
        cone.castShadow = true;
        castle.add(cone);

        // Gold trim at roof base
        const trim = new THREE.Mesh(
            new THREE.TorusGeometry(t.r + 0.5, 0.1, 8, 32),
            new THREE.MeshPhongMaterial({ color: DISNEY.belleGold })
        );
        trim.position.set(t.x, t.h - 5, t.z);
        trim.rotation.x = Math.PI / 2;
        castle.add(trim);

        // Waving Flag on top
        const flagGroup = new THREE.Group();
        const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 1.5), new THREE.MeshPhongMaterial({ color: 0x333333 }));
        pole.position.y = 0.75;
        flagGroup.add(pole);

        const flagGeo = new THREE.PlaneGeometry(1, 0.6, 10, 1);
        const flagMat = new THREE.MeshPhongMaterial({ color: t.roof.color, side: THREE.DoubleSide });
        const flag = new THREE.Mesh(flagGeo, flagMat);
        flag.position.set(0.5, 1.1, 0);
        flag.name = 'flag';
        flagGroup.add(flag);

        flagGroup.position.set(t.x, t.h - 5 + t.h * 0.35 + 0.5, t.z);
        castle.add(flagGroup);

        // Gold ball on top
        const ball = new THREE.Mesh(
            new THREE.SphereGeometry(0.3, 16, 16),
            new THREE.MeshPhongMaterial({ color: DISNEY.belleGold, emissive: DISNEY.belleGold, emissiveIntensity: 0.6 })
        );
        ball.position.set(t.x, t.h - 5 + t.h * 0.35 + 0.2, t.z);
        castle.add(ball);
    });

    // Castle walls
    const wallMat = new THREE.MeshPhongMaterial({ color: 0xc8b8e8, emissive: 0x2d1b69, emissiveIntensity: 0.1 });
    const wall1 = new THREE.Mesh(new THREE.BoxGeometry(16, 10, 1.5), wallMat);
    wall1.position.set(0, 0, -35);
    castle.add(wall1);

    const wall2 = new THREE.Mesh(new THREE.BoxGeometry(24, 8, 1.5), wallMat);
    wall2.position.set(0, -1, -40);
    castle.add(wall2);

    // Castle windows (glowing)
    const windowMat = new THREE.MeshBasicMaterial({ color: DISNEY.belleGoldGlow });
    const windowPositions = [
        { x: -3, y: 2, z: -34.2 }, { x: 3, y: 2, z: -34.2 },
        { x: -6, y: 0, z: -34.2 }, { x: 6, y: 0, z: -34.2 },
        { x: 0, y: 4, z: -34.2 },
    ];
    windowPositions.forEach(p => {
        const win = new THREE.Mesh(new THREE.PlaneGeometry(1, 1.6), windowMat);
        win.position.set(p.x, p.y, p.z);
        castle.add(win);

        // Window glow light
        const wLight = new THREE.PointLight(DISNEY.belleGoldGlow, 2, 8);
        wLight.position.set(p.x, p.y, p.z + 1);
        castle.add(wLight);
    });

    // Entrance arch
    const archGeo = new THREE.TorusGeometry(2.5, 0.4, 16, 32, Math.PI);
    const arch = new THREE.Mesh(archGeo, new THREE.MeshPhongMaterial({ color: DISNEY.belleGold }));
    arch.position.set(0, -2.5, -34.2);
    arch.rotation.z = Math.PI;
    castle.add(arch);

    scene.add(castle);
    return castle;
}
const castleGroup = createCastle();

// ======================================
//   🌿 ENCHANTED GROUND (Rolling hills)
// ======================================
function createGround() {
    const groundGeo = new THREE.PlaneGeometry(200, 200, 60, 60);
    const posAttr = groundGeo.attributes.position;
    for (let i = 0; i < posAttr.count; i++) {
        const x = posAttr.getX(i);
        const y = posAttr.getY(i);
        const z = Math.sin(x * 0.05) * 2 + Math.cos(y * 0.08) * 1.5 + Math.random() * 0.3;
        posAttr.setZ(i, z);
    }
    groundGeo.computeVertexNormals();

    const groundMat = new THREE.MeshPhongMaterial({
        color: 0x1a4430,
        emissive: 0x0a2218,
        emissiveIntensity: 0.2,
        shininess: 5,
        flatShading: true,
    });
    const ground = new THREE.Mesh(groundGeo, groundMat);
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = -5;
    ground.receiveShadow = true;
    scene.add(ground);
}
createGround();

// ======================================
//   🎃 MAGIC PUMPKIN CARRIAGE
// ======================================
function createCarriage() {
    const carriage = new THREE.Group();
    const goldMat = new THREE.MeshPhongMaterial({ color: DISNEY.belleGold, emissive: DISNEY.belleGold, emissiveIntensity: 0.2, shininess: 100 });

    // Main pumpkin body
    const bodyGeo = new THREE.SphereGeometry(3, 32, 32);
    const bodyMat = new THREE.MeshPhongMaterial({ color: 0xFFFFFF, transparent: true, opacity: 0.4, shininess: 100 });
    const body = new THREE.Mesh(bodyGeo, bodyMat);
    carriage.add(body);

    // Decorative ribs
    for (let i = 0; i < 8; i++) {
        const ray = new THREE.Mesh(new THREE.TorusGeometry(3.1, 0.1, 16, 100), goldMat);
        ray.rotation.y = (i / 8) * Math.PI;
        carriage.add(ray);
    }

    // Wheels
    const wheelGeo = new THREE.TorusGeometry(1.2, 0.15, 16, 32);
    const wheels = [
        { x: -2.5, y: -2.5, z: 2 },
        { x: 2.5, y: -2.5, z: 2 },
        { x: -2.5, y: -2.5, z: -2 },
        { x: 2.5, y: -2.5, z: -2 }
    ];
    wheels.forEach(w => {
        const wheel = new THREE.Mesh(wheelGeo, goldMat);
        wheel.position.set(w.x, w.y, w.z);
        carriage.add(wheel);
    });

    // Top crown
    const crown = new THREE.Mesh(new THREE.ConeGeometry(0.8, 1, 8), goldMat);
    crown.position.y = 3.5;
    carriage.add(crown);

    carriage.position.set(20, -1, 5);
    carriage.rotation.y = -Math.PI / 4;
    scene.add(carriage);
    return carriage;
}
const carriageGroup = createCarriage();

// ======================================
//   🏮 FLOATING LANTERNS
// ======================================
const lanterns = [];
function createLantern() {
    const group = new THREE.Group();
    const geo = new THREE.CylinderGeometry(0.4, 0.4, 1.2, 12);
    const mat = new THREE.MeshBasicMaterial({ color: DISNEY.belleGoldGlow, transparent: true, opacity: 0.8 });
    const lantern = new THREE.Mesh(geo, mat);
    group.add(lantern);

    const light = new THREE.PointLight(DISNEY.belleGoldGlow, 5, 15);
    group.add(light);

    group.position.set(
        THREE.MathUtils.randFloatSpread(100),
        THREE.MathUtils.randFloat(-10, 0),
        THREE.MathUtils.randFloatSpread(100)
    );
    scene.add(group);
    lanterns.push({ group, speed: THREE.MathUtils.randFloat(0.05, 0.15), phase: Math.random() * Math.PI });
}
for (let i = 0; i < 40; i++) createLantern();
const cakeGroup = new THREE.Group();

function createPrincessCake() {
    // Tier 1: Base (white with pink frosting dots)
    const tier1 = new THREE.Mesh(
        new THREE.CylinderGeometry(4.5, 5, 3.5, 64),
        new THREE.MeshPhongMaterial({ color: DISNEY.cakeWhite, shininess: 80 })
    );
    tier1.position.y = 0;
    tier1.castShadow = true;
    cakeGroup.add(tier1);

    // Tier 1 frosting ring
    addFrostingRing(5, 0, 1.75, DISNEY.auroraPink);
    addFrostingRing(4.5, 0, -1.75, DISNEY.auroraPink);

    // Tier 2: Middle (pink)
    const tier2 = new THREE.Mesh(
        new THREE.CylinderGeometry(3.2, 3.5, 3, 64),
        new THREE.MeshPhongMaterial({ color: DISNEY.cakePink, shininess: 80 })
    );
    tier2.position.y = 3.25;
    tier2.castShadow = true;
    cakeGroup.add(tier2);

    addFrostingRing(3.5, 0, 4.75, DISNEY.fairyWhite);
    addFrostingRing(3.2, 0, 1.75, DISNEY.fairyWhite);

    // Tier 3: Top (lavender)
    const tier3 = new THREE.Mesh(
        new THREE.CylinderGeometry(2, 2.3, 2.5, 64),
        new THREE.MeshPhongMaterial({ color: DISNEY.cakeLavender, shininess: 80 })
    );
    tier3.position.y = 6;
    tier3.castShadow = true;
    cakeGroup.add(tier3);

    addFrostingRing(2.3, 0, 7.25, DISNEY.belleGold);

    // Decorative pearls around each tier
    addPearls(5, 0, 0, 20, DISNEY.fairyWhite);
    addPearls(3.5, 0, 3.25, 15, DISNEY.belleGoldGlow);
    addPearls(2.3, 0, 6, 12, DISNEY.auroraPink);

    // Tiara on top!
    createTiara(0, 7.8, 0);

    // Candles (princess-colored)
    const candleColors = [DISNEY.auroraPink, DISNEY.cinderellaBlue, DISNEY.rapunzelPurple, DISNEY.belleGold, DISNEY.arielTeal];
    for (let i = 0; i < 5; i++) {
        const angle = (i / 5) * Math.PI * 2;
        const cx = Math.cos(angle) * 1.5;
        const cz = Math.sin(angle) * 1.5;
        createCandle(cx, 7.25, cz, candleColors[i]);
    }

    cakeGroup.position.y = -2.5;
    scene.add(cakeGroup);
}

function addFrostingRing(radius, x, y, color) {
    const torus = new THREE.Mesh(
        new THREE.TorusGeometry(radius, 0.2, 12, 80),
        new THREE.MeshPhongMaterial({ color: color, shininess: 60 })
    );
    torus.position.set(x, y, 0);
    torus.rotation.x = Math.PI / 2;
    cakeGroup.add(torus);
}

function addPearls(radius, x, y, count, color) {
    for (let i = 0; i < count; i++) {
        const angle = (i / count) * Math.PI * 2;
        const pearl = new THREE.Mesh(
            new THREE.SphereGeometry(0.15, 12, 12),
            new THREE.MeshPhongMaterial({ color, shininess: 100 })
        );
        pearl.position.set(
            x + Math.cos(angle) * (radius + 0.1),
            y,
            Math.sin(angle) * (radius + 0.1)
        );
        cakeGroup.add(pearl);
    }
}

function createTiara(x, y, z) {
    const tiaraGroup = new THREE.Group();
    const tiaraMat = new THREE.MeshPhongMaterial({
        color: DISNEY.belleGold,
        emissive: DISNEY.belleGold,
        emissiveIntensity: 0.5,
        shininess: 100,
    });

    // Base band
    const band = new THREE.Mesh(new THREE.TorusGeometry(1.2, 0.08, 8, 40, Math.PI), tiaraMat);
    band.rotation.x = Math.PI / 2;
    tiaraGroup.add(band);

    // Points
    for (let i = 0; i < 5; i++) {
        const angle = (i / 4) * Math.PI;
        const px = Math.cos(angle) * 1.2;
        const pz = Math.sin(angle) * 1.2;
        const h = i === 2 ? 1.2 : 0.7;
        const point = new THREE.Mesh(
            new THREE.ConeGeometry(0.12, h, 8),
            tiaraMat
        );
        point.position.set(px, h / 2, pz);
        tiaraGroup.add(point);

        // Gem on top
        const gem = new THREE.Mesh(
            new THREE.OctahedronGeometry(0.15),
            new THREE.MeshPhongMaterial({
                color: i % 2 === 0 ? DISNEY.cinderellaBlue : DISNEY.auroraPink,
                emissive: i % 2 === 0 ? DISNEY.cinderellaBlue : DISNEY.auroraPink,
                emissiveIntensity: 0.6,
                shininess: 100,
            })
        );
        gem.position.set(px, h, pz);
        tiaraGroup.add(gem);
    }

    tiaraGroup.position.set(x, y, z);
    tiaraGroup.scale.setScalar(0.8);
    cakeGroup.add(tiaraGroup);
}

const flames = [];
function createCandle(x, y, z, color) {
    const candle = new THREE.Mesh(
        new THREE.CylinderGeometry(0.12, 0.12, 1, 12),
        new THREE.MeshPhongMaterial({ color })
    );
    candle.position.set(x, y + 0.5, z);
    cakeGroup.add(candle);

    const flame = new THREE.Mesh(
        new THREE.SphereGeometry(0.18, 12, 12),
        new THREE.MeshBasicMaterial({ color: 0xFFDD44 })
    );
    flame.position.set(x, y + 1.2, z);
    flame.visible = false;
    cakeGroup.add(flame);

    const fLight = new THREE.PointLight(0xFFAA00, 0, 6);
    fLight.position.set(x, y + 1.3, z);
    cakeGroup.add(fLight);

    flames.push({ flame, light: fLight });
}

createPrincessCake();

// ======================================
//   🦋 BUTTERFLIES
// ======================================
const butterflies = [];
function createButterfly(color) {
    const bGroup = new THREE.Group();
    const wingMat = new THREE.MeshPhongMaterial({
        color,
        emissive: color,
        emissiveIntensity: 0.3,
        transparent: true,
        opacity: 0.85,
        side: THREE.DoubleSide,
    });

    // Wings (simple flat ellipsoids)
    const wingShape = new THREE.Shape();
    wingShape.ellipse(0.5, 0, 0.8, 0.5, 0, Math.PI * 2, false, 0);
    const wingGeo = new THREE.ShapeGeometry(wingShape);

    const leftWing = new THREE.Mesh(wingGeo, wingMat);
    leftWing.position.x = -0.3;
    leftWing.name = 'leftWing';
    bGroup.add(leftWing);

    const rightWing = new THREE.Mesh(wingGeo, wingMat.clone());
    rightWing.position.x = 0.3;
    rightWing.scale.x = -1;
    rightWing.name = 'rightWing';
    bGroup.add(rightWing);

    // Body
    const body = new THREE.Mesh(
        new THREE.CylinderGeometry(0.05, 0.05, 0.6, 6),
        new THREE.MeshPhongMaterial({ color: 0x333333 })
    );
    body.rotation.z = Math.PI / 2;
    bGroup.add(body);

    bGroup.position.set(
        THREE.MathUtils.randFloatSpread(40),
        THREE.MathUtils.randFloat(2, 20),
        THREE.MathUtils.randFloatSpread(30)
    );
    bGroup.scale.setScalar(THREE.MathUtils.randFloat(0.4, 0.8));

    scene.add(bGroup);
    butterflies.push({
        group: bGroup,
        speed: THREE.MathUtils.randFloat(0.5, 1.5),
        radius: THREE.MathUtils.randFloat(5, 15),
        yOffset: bGroup.position.y,
        phase: Math.random() * Math.PI * 2,
    });
}

const bColors = [DISNEY.auroraPink, DISNEY.cinderellaBlue, DISNEY.rapunzelPurple, DISNEY.belleGold, DISNEY.arielTeal];
for (let i = 0; i < 12; i++) {
    createButterfly(bColors[i % bColors.length]);
}

// ======================================
//   💖 FLOATING HEARTS
// ======================================
const hearts = [];
function createHeartShape() {
    const shape = new THREE.Shape();
    shape.moveTo(0, 0.3);
    shape.bezierCurveTo(0, 0.5, -0.1, 0.7, -0.35, 0.7);
    shape.bezierCurveTo(-0.7, 0.7, -0.7, 0.35, -0.7, 0.3);
    shape.bezierCurveTo(-0.7, 0.1, -0.5, -0.2, 0, -0.5);
    shape.bezierCurveTo(0.5, -0.2, 0.7, 0.1, 0.7, 0.3);
    shape.bezierCurveTo(0.7, 0.35, 0.7, 0.7, 0.35, 0.7);
    shape.bezierCurveTo(0.1, 0.7, 0, 0.5, 0, 0.3);
    return shape;
}

function createFloatingHeart(color) {
    const shape = createHeartShape();
    const heartGeo = new THREE.ExtrudeGeometry(shape, {
        depth: 0.2, bevelEnabled: true, bevelThickness: 0.05, bevelSize: 0.05, bevelSegments: 3
    });
    const heartMat = new THREE.MeshPhongMaterial({
        color,
        emissive: color,
        emissiveIntensity: 0.4,
        shininess: 80,
        transparent: true,
        opacity: 0.8,
    });
    const heart = new THREE.Mesh(heartGeo, heartMat);
    heart.position.set(
        THREE.MathUtils.randFloatSpread(50),
        THREE.MathUtils.randFloat(5, 30),
        THREE.MathUtils.randFloatSpread(40)
    );
    heart.scale.setScalar(THREE.MathUtils.randFloat(0.3, 0.8));
    heart.rotation.z = Math.PI;
    scene.add(heart);
    hearts.push({
        mesh: heart,
        speed: THREE.MathUtils.randFloat(0.3, 0.8),
        yBase: heart.position.y,
        phase: Math.random() * Math.PI * 2,
    });
}

const heartColors = [DISNEY.auroraPink, DISNEY.snowRed, DISNEY.auroraPinkDeep, DISNEY.rapunzelPurple];
for (let i = 0; i < 15; i++) {
    createFloatingHeart(heartColors[i % heartColors.length]);
}

// ======================================
//   ✨ PIXIE DUST PARTICLES
// ======================================
const pixieCount = 1500;
const pixieGeo = new THREE.BufferGeometry();
const pixiePos = new Float32Array(pixieCount * 3);
const pixieVel = [];
const pixieColors = new Float32Array(pixieCount * 3);

const dustPalette = [
    new THREE.Color(DISNEY.belleGold),
    new THREE.Color(DISNEY.auroraPink),
    new THREE.Color(DISNEY.cinderellaBlue),
    new THREE.Color(DISNEY.rapunzelPurple),
    new THREE.Color(DISNEY.fairyWhite),
];

for (let i = 0; i < pixieCount; i++) {
    pixiePos[i * 3]     = THREE.MathUtils.randFloatSpread(60);
    pixiePos[i * 3 + 1] = THREE.MathUtils.randFloat(-5, 35);
    pixiePos[i * 3 + 2] = THREE.MathUtils.randFloatSpread(60);

    pixieVel.push(new THREE.Vector3(
        THREE.MathUtils.randFloatSpread(0.03),
        THREE.MathUtils.randFloat(0.01, 0.06),
        THREE.MathUtils.randFloatSpread(0.03)
    ));

    const c = dustPalette[Math.floor(Math.random() * dustPalette.length)];
    pixieColors[i * 3]     = c.r;
    pixieColors[i * 3 + 1] = c.g;
    pixieColors[i * 3 + 2] = c.b;
}

pixieGeo.setAttribute('position', new THREE.Float32BufferAttribute(pixiePos, 3));
pixieGeo.setAttribute('color', new THREE.Float32BufferAttribute(pixieColors, 3));

const pixieMat = new THREE.PointsMaterial({
    size: 0.25,
    transparent: true,
    opacity: 0.85,
    blending: THREE.AdditiveBlending,
    vertexColors: true,
    sizeAttenuation: true,
});
const pixieDust = new THREE.Points(pixieGeo, pixieMat);
scene.add(pixieDust);

// ======================================
//   🌸 FLOWERS ON THE GROUND
// ======================================
function createFlower(x, z) {
    const flowerGroup = new THREE.Group();
    const petalColor = [DISNEY.auroraPink, DISNEY.rapunzelPurple, DISNEY.cinderellaBlue, DISNEY.snowRed][Math.floor(Math.random() * 4)];

    // Stem
    const stem = new THREE.Mesh(
        new THREE.CylinderGeometry(0.05, 0.05, 1.5, 6),
        new THREE.MeshPhongMaterial({ color: 0x228B22 })
    );
    stem.position.y = 0.75;
    flowerGroup.add(stem);

    // Petals
    for (let i = 0; i < 5; i++) {
        const angle = (i / 5) * Math.PI * 2;
        const petal = new THREE.Mesh(
            new THREE.SphereGeometry(0.3, 8, 8),
            new THREE.MeshPhongMaterial({ color: petalColor, emissive: petalColor, emissiveIntensity: 0.2 })
        );
        petal.scale.set(1, 0.4, 1);
        petal.position.set(Math.cos(angle) * 0.3, 1.5, Math.sin(angle) * 0.3);
        flowerGroup.add(petal);
    }

    // Center
    const center = new THREE.Mesh(
        new THREE.SphereGeometry(0.15, 8, 8),
        new THREE.MeshPhongMaterial({ color: DISNEY.belleGold })
    );
    center.position.y = 1.5;
    flowerGroup.add(center);

    flowerGroup.position.set(x, -5, z);
    flowerGroup.scale.setScalar(THREE.MathUtils.randFloat(0.6, 1.2));
    scene.add(flowerGroup);
}

for (let i = 0; i < 30; i++) {
    createFlower(
        THREE.MathUtils.randFloatSpread(50),
        THREE.MathUtils.randFloat(-15, 15)
    );
}

// ======================================
//   ✨ INTERACTIVE MOUSE SPARKLE TRAIL
// ======================================
const mouseSparkleCount = 100;
const mouseSparkles = [];
const mouse = new THREE.Vector2();

window.addEventListener('mousemove', (event) => {
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
    
    // Spawn a sparkle
    if (mouseSparkles.length < mouseSparkleCount) {
        const sparkleGeo = new THREE.SphereGeometry(0.1, 8, 8);
        const sparkleMat = new THREE.MeshBasicMaterial({ 
            color: dustPalette[Math.floor(Math.random() * dustPalette.length)],
            transparent: true,
            opacity: 1
        });
        const mesh = new THREE.Mesh(sparkleGeo, sparkleMat);
        
        // Convert mouse to 3D position
        const vector = new THREE.Vector3(mouse.x, mouse.y, 0.5);
        vector.unproject(camera);
        const dir = vector.sub(camera.position).normalize();
        const distance = -camera.position.z / dir.z;
        const pos = camera.position.clone().add(dir.multiplyScalar(distance));
        
        mesh.position.copy(pos);
        scene.add(mesh);
        mouseSparkles.push({ 
            mesh, 
            vel: new THREE.Vector3(Math.random() * 0.05 - 0.025, Math.random() * 0.05 - 0.025, Math.random() * 0.05 - 0.025),
            life: 1.0 
        });
    }
});

function updateMouseSparkles() {
    for (let i = mouseSparkles.length - 1; i >= 0; i--) {
        const s = mouseSparkles[i];
        s.mesh.position.add(s.vel);
        s.life -= 0.02;
        s.mesh.material.opacity = s.life;
        s.mesh.scale.setScalar(s.life);
        
        if (s.life <= 0) {
            scene.remove(s.mesh);
            mouseSparkles.splice(i, 1);
        }
    }
}

// ======================================
//   🎀 3D BANNER TEXT
// ======================================
const bannerGroup = new THREE.Group();
const fontLoader = new FontLoader();
fontLoader.load('https://unpkg.com/three@0.160.0/examples/fonts/helvetiker_bold.typeface.json', (font) => {
    const textGeo = new TextGeometry('Happy Birthday', {
        font, size: 2.8, height: 0.6, curveSegments: 16,
        bevelEnabled: true, bevelThickness: 0.15, bevelSize: 0.08
    });
    textGeo.computeBoundingBox();
    const offset = -0.5 * (textGeo.boundingBox.max.x - textGeo.boundingBox.min.x);

    const textMat = new THREE.MeshPhongMaterial({
        color: DISNEY.belleGold,
        emissive: DISNEY.belleGold,
        emissiveIntensity: 0.7,
        shininess: 100,
    });
    const textMesh = new THREE.Mesh(textGeo, textMat);
    textMesh.position.set(offset, 18, -10);
    bannerGroup.add(textMesh);

    // Sub text
    const subGeo = new TextGeometry('My Forever Girl', {
        font, size: 1.4, height: 0.3, curveSegments: 12,
        bevelEnabled: true, bevelThickness: 0.08, bevelSize: 0.04
    });
    subGeo.computeBoundingBox();
    const subOffset = -0.5 * (subGeo.boundingBox.max.x - subGeo.boundingBox.min.x);

    const subMat = new THREE.MeshPhongMaterial({
        color: DISNEY.auroraPink,
        emissive: DISNEY.auroraPink,
        emissiveIntensity: 0.6,
        shininess: 80,
    });
    const subMesh = new THREE.Mesh(subGeo, subMat);
    subMesh.position.set(subOffset, 14.5, -10);
    bannerGroup.add(subMesh);
});
scene.add(bannerGroup);

// ======================================
//   🎉 CELEBRATION LOGIC
// ======================================
// Confetti system for celebration
const confettiCount = 500;
const confettiGeo = new THREE.BufferGeometry();
const confettiPos = new Float32Array(confettiCount * 3);
const confettiVel = [];
const confettiCols = new Float32Array(confettiCount * 3);
const confettiPalette = [
    new THREE.Color(DISNEY.auroraPink),
    new THREE.Color(DISNEY.cinderellaBlue),
    new THREE.Color(DISNEY.belleGold),
    new THREE.Color(DISNEY.rapunzelPurple),
    new THREE.Color(DISNEY.arielTeal),
    new THREE.Color(DISNEY.snowRed),
    new THREE.Color(DISNEY.fairyWhite),
];

for (let i = 0; i < confettiCount; i++) {
    confettiPos[i * 3]     = THREE.MathUtils.randFloatSpread(30);
    confettiPos[i * 3 + 1] = THREE.MathUtils.randFloat(25, 55);
    confettiPos[i * 3 + 2] = THREE.MathUtils.randFloatSpread(30);
    confettiVel.push(new THREE.Vector3(
        THREE.MathUtils.randFloatSpread(0.1),
        -THREE.MathUtils.randFloat(0.08, 0.2),
        THREE.MathUtils.randFloatSpread(0.1)
    ));
    const cc = confettiPalette[Math.floor(Math.random() * confettiPalette.length)];
    confettiCols[i * 3] = cc.r;
    confettiCols[i * 3 + 1] = cc.g;
    confettiCols[i * 3 + 2] = cc.b;
}

confettiGeo.setAttribute('position', new THREE.Float32BufferAttribute(confettiPos, 3));
confettiGeo.setAttribute('color', new THREE.Float32BufferAttribute(confettiCols, 3));

const confettiMat = new THREE.PointsMaterial({
    size: 0.5,
    transparent: true,
    opacity: 0,
    blending: THREE.AdditiveBlending,
    vertexColors: true,
    sizeAttenuation: true,
});
const confettiSystem = new THREE.Points(confettiGeo, confettiMat);
scene.add(confettiSystem);

function startCelebration() {
    if (celebrationActive) return;
    celebrationActive = true;

    // Light all candles
    flames.forEach(f => {
        f.flame.visible = true;
        f.light.intensity = 4;
    });

    // Bloom burst
    bloomPass.strength = 2.2;

    // Confetti!
    confettiMat.opacity = 0.9;

    // Extra princess glow
    const celebLight = new THREE.PointLight(DISNEY.belleGold, 30, 50);
    celebLight.position.set(0, 10, 5);
    scene.add(celebLight);

    // Body class for CSS celebration effects
    document.body.classList.add('celebrating');

    console.log('✨ CELEBRATION STARTED! HAPPY BIRTHDAY PRINCESS! ✨');

    // Gradually settle
    setTimeout(() => {
        bloomPass.strength = 1.2;
    }, 5000);
}

// Button
document.getElementById('test-trigger')?.addEventListener('click', startCelebration);

// ======================================
//   🎬 ANIMATION LOOP
// ======================================
function animate() {
    requestAnimationFrame(animate);
    const time = Date.now() * 0.001;

    // Midnight celebration trigger
    const now = new Date();
    if (now.getHours() === 0 && now.getMinutes() === 0 && now.getSeconds() === 0) {
        startCelebration();
    }

    // --- Pixie Dust ---
    const pPositions = pixieGeo.attributes.position.array;
    for (let i = 0; i < pixieCount; i++) {
        const i3 = i * 3;
        pPositions[i3]     += pixieVel[i].x;
        pPositions[i3 + 1] += pixieVel[i].y;
        pPositions[i3 + 2] += pixieVel[i].z;

        // Swirl
        pPositions[i3] += Math.sin(time + i) * 0.01;

        if (pPositions[i3 + 1] > 40) {
            pPositions[i3 + 1] = -5;
            pPositions[i3] = THREE.MathUtils.randFloatSpread(60);
            pPositions[i3 + 2] = THREE.MathUtils.randFloatSpread(60);
        }
    }
    pixieGeo.attributes.position.needsUpdate = true;
    pixieMat.opacity = 0.65 + Math.sin(time * 2) * 0.2;

    // --- Confetti (if celebrating) ---
    if (celebrationActive) {
        const cPos = confettiGeo.attributes.position.array;
        for (let i = 0; i < confettiCount; i++) {
            const i3 = i * 3;
            cPos[i3]     += confettiVel[i].x + Math.sin(time * 3 + i) * 0.02;
            cPos[i3 + 1] += confettiVel[i].y;
            cPos[i3 + 2] += confettiVel[i].z;
            if (cPos[i3 + 1] < -5) {
                cPos[i3 + 1] = THREE.MathUtils.randFloat(30, 50);
                cPos[i3] = THREE.MathUtils.randFloatSpread(30);
            }
        }
        confettiGeo.attributes.position.needsUpdate = true;
    }

    // --- Butterflies ---
    butterflies.forEach(b => {
        const t = time * b.speed + b.phase;
        b.group.position.x = Math.sin(t * 0.6) * b.radius;
        b.group.position.y = b.yOffset + Math.sin(t) * 2;
        b.group.position.z = Math.cos(t * 0.6) * b.radius * 0.6;
        b.group.rotation.y = t * 0.6 + Math.PI / 2;

        // Wing flap
        const wingAngle = Math.sin(time * 8 * b.speed) * 0.6;
        b.group.children.forEach(child => {
            if (child.name === 'leftWing') child.rotation.y = wingAngle;
            if (child.name === 'rightWing') child.rotation.y = -wingAngle;
        });
    });

    // --- Floating Hearts ---
    hearts.forEach(h => {
        h.mesh.position.y = h.yBase + Math.sin(time * h.speed + h.phase) * 2;
        h.mesh.rotation.y = time * 0.3;
        h.mesh.rotation.x = Math.sin(time * 0.5 + h.phase) * 0.15;
    });

    // --- Waving Flags ---
    castleGroup.traverse(child => {
        if (child.name === 'flag') {
            const pos = child.geometry.attributes.position;
            for (let i = 0; i < pos.count; i++) {
                const x = pos.getX(i);
                if (x > 0) {
                    pos.setZ(i, Math.sin(time * 3 + x * 2) * 0.2);
                }
            }
            pos.needsUpdate = true;
        }
    });

    // --- Floating Lanterns ---
    lanterns.forEach(l => {
        l.group.position.y += l.speed;
        l.group.position.x += Math.sin(time + l.phase) * 0.02;
        if (l.group.position.y > 60) l.group.position.y = -10;
        l.group.children[0].material.opacity = 0.6 + Math.sin(time * 2 + l.phase) * 0.3;
    });

    // --- Mouse Sparkles ---
    updateMouseSparkles();

    // --- Carriage Gentle Sway ---
    carriageGroup.position.y = -1 + Math.sin(time * 0.5) * 0.1;

    // --- Cake gentle bob & rotate ---
    cakeGroup.rotation.y += 0.003;
    cakeGroup.position.y = -2.5 + Math.sin(time * 0.8) * 0.3;

    // --- Flame flicker ---
    flames.forEach((f, idx) => {
        if (f.flame.visible) {
            const flicker = 0.15 + Math.sin(time * 15 + idx * 2) * 0.05;
            f.flame.scale.set(1 + Math.sin(time * 12 + idx) * 0.2, 1.2 + Math.sin(time * 10 + idx) * 0.3, 1);
            f.light.intensity = 3 + Math.sin(time * 10 + idx) * 1.5;
        }
    });

    // --- Banner sway ---
    bannerGroup.position.y = Math.sin(time * 0.4) * 0.8;
    bannerGroup.rotation.y = Math.sin(time * 0.15) * 0.06;

    // --- Stars twinkle ---
    starMat.opacity = 0.7 + Math.sin(time * 1.5) * 0.2;

    // --- Camera gentle orbit ---
    camera.position.x = Math.sin(time * 0.08) * 12;
    camera.position.z = 30 + Math.cos(time * 0.08) * 8;
    camera.position.y = 10 + Math.sin(time * 0.12) * 2;
    camera.lookAt(0, 5, -5);

    controls.update();
    composer.render();
}

// --- RESIZE ---
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    composer.setSize(window.innerWidth, window.innerHeight);
});

animate();
