import React, { useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence } from 'motion/react';
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { RectAreaLightUniformsLib } from 'three/addons/lights/RectAreaLightUniformsLib.js';
import { ArrowUpRight, Compass, Eye, Pause, Play, RotateCcw } from 'lucide-react';
import { ScreenId } from '../types/ekam';
import { ThreeStageSkeletonOverlay } from './EkamSkeletons';

export interface BusinessPillarNode {
  id: string;
  label: string;
  shortLabel: string;
  metric: string;
  targetScreen: ScreenId;
  accentHex: string;
}

interface BusinessCoreStage3DProps {
  connectionsCount: number;
  visitorsCount: number;
  referralsCount: number;
  meetingsCount: number;
  testimonialsCount: number;
  reducedMotion?: boolean;
  onNavigate: (screen: ScreenId) => void;
}

type StageCameraView = 'overview' | 'core' | 'top';

const STAGE_CAMERA_VIEWS: Record<
  StageCameraView,
  { pos: [number, number, number]; target: [number, number, number]; label: string }
> = {
  overview: { pos: [6.8, 4.3, 7.6], target: [0, 1.35, 0], label: 'Orbit' },
  core: { pos: [3.6, 2.35, 4.1], target: [0, 1.55, 0], label: 'Core' },
  top: { pos: [0.1, 9.6, 2.8], target: [0, 0.9, 0], label: 'Aerial' },
};

// Pre-allocated scratch helpers (zero GC inside animation loop)
const _vec3 = new THREE.Vector3();
const _targetCamPos = new THREE.Vector3();
const _targetLook = new THREE.Vector3();
const _mat4 = new THREE.Matrix4();
const _quat = new THREE.Quaternion();
const _scale = new THREE.Vector3();
const _euler = new THREE.Euler();

function createBrushedMetalRoughnessMap(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d')!;
  ctx.fillStyle = '#808080';
  ctx.fillRect(0, 0, 256, 256);
  for (let y = 0; y < 256; y++) {
    const shade = 114 + Math.floor(Math.sin(y * 0.65) * 14 + (Math.random() - 0.5) * 26);
    ctx.fillStyle = `rgb(${shade},${shade},${shade})`;
    ctx.fillRect(0, y, 256, 1);
  }
  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(3, 3);
  return tex;
}

function createArchitecturalFloorTexture(maxAnisotropy: number): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d')!;
  ctx.fillStyle = '#0b1824';
  ctx.fillRect(0, 0, 512, 512);

  ctx.strokeStyle = 'rgba(148, 184, 212, 0.13)';
  ctx.lineWidth = 1;
  const step = 32;
  for (let i = 0; i <= 512; i += step) {
    ctx.beginPath();
    ctx.moveTo(i, 0);
    ctx.lineTo(i, 512);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(0, i);
    ctx.lineTo(512, i);
    ctx.stroke();
  }

  ctx.strokeStyle = 'rgba(216, 93, 39, 0.28)';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.arc(256, 256, 178, 0, Math.PI * 2);
  ctx.stroke();

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = maxAnisotropy;
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(4, 4);
  return tex;
}

function createRadialShadowTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d')!;
  const grad = ctx.createRadialGradient(128, 128, 14, 128, 128, 124);
  grad.addColorStop(0, 'rgba(0, 0, 0, 0.72)');
  grad.addColorStop(0.55, 'rgba(0, 0, 0, 0.28)');
  grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 256, 256);
  return new THREE.CanvasTexture(canvas);
}

export function BusinessCoreStage3D({
  connectionsCount,
  visitorsCount,
  referralsCount,
  meetingsCount,
  testimonialsCount,
  reducedMotion = false,
  onNavigate,
}: BusinessCoreStage3DProps) {
  const mountRef = useRef<HTMLDivElement | null>(null);

  const pillars: BusinessPillarNode[] = useMemo(
    () => [
      {
        id: 'referrals',
        label: 'Business Opportunity',
        shortLabel: 'Referrals',
        metric: `${referralsCount} referrals logged`,
        targetScreen: 'opportunity',
        accentHex: '#D85D27',
      },
      {
        id: 'connections',
        label: 'Chapter Connections',
        shortLabel: 'Links',
        metric: `${connectionsCount} active members`,
        targetScreen: 'connections',
        accentHex: '#38BDF8',
      },
      {
        id: 'visitors',
        label: 'Visitor Pipeline',
        shortLabel: 'Visitors',
        metric: `${visitorsCount} guests invited`,
        targetScreen: 'visitors',
        accentHex: '#34D399',
      },
      {
        id: 'meetings',
        label: 'Meetings & P2P',
        shortLabel: 'Meetings',
        metric: `${meetingsCount} chapter sessions`,
        targetScreen: 'meetings',
        accentHex: '#F59E0B',
      },
      {
        id: 'recognition',
        label: 'Proof & Testimonials',
        shortLabel: 'Proof',
        metric: `${testimonialsCount} endorsements`,
        targetScreen: 'testimonials',
        accentHex: '#F38B1E',
      },
    ],
    [referralsCount, connectionsCount, visitorsCount, meetingsCount, testimonialsCount]
  );

  const [selectedIndex, setSelectedIndex] = useState(0);
  const [cameraView, setCameraView] = useState<StageCameraView>('overview');
  const [paused, setPaused] = useState(false);
  const [webglUnavailable, setWebglUnavailable] = useState(false);
  const [sceneReady, setSceneReady] = useState(false);

  const selectedPillar = pillars[selectedIndex] || pillars[0];

  const runtimeRef = useRef({
    selectedIndex: 0,
    paused: false,
    reducedMotion,
    camTransitionActive: false,
    camView: 'overview' as StageCameraView,
  });

  runtimeRef.current.selectedIndex = selectedIndex;
  runtimeRef.current.paused = paused;
  runtimeRef.current.reducedMotion = reducedMotion;

  const pillarsRef = useRef(pillars);
  pillarsRef.current = pillars;

  const triggerCameraView = (view: StageCameraView) => {
    setCameraView(view);
    runtimeRef.current.camView = view;
    runtimeRef.current.camTransitionActive = true;
  };

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;
    setSceneReady(false);

    // 1. Software WebGL probe
    const isSoftwareGl = (() => {
      const probe = document.createElement('canvas');
      const gl = probe.getContext('webgl2');
      if (!gl) return true;
      const ext = gl.getExtension('WEBGL_debug_renderer_info');
      const param = ext ? ext.UNMASKED_RENDERER_WEBGL : gl.RENDERER;
      const gpu = String(gl.getParameter(param));
      gl.getExtension('WEBGL_lose_context')?.loseContext();
      return /SwiftShader|llvmpipe|softpipe|Software|Basic Render/i.test(gpu);
    })();

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({
        antialias: !isSoftwareGl,
        powerPreference: 'high-performance',
      });
    } catch {
      setWebglUnavailable(true);
      return;
    }

    const initW = container.clientWidth || 380;
    const initH = container.clientHeight || 355;

    renderer.setSize(initW, initH);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.12;
    renderer.setPixelRatio(isSoftwareGl ? 1 : Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = !isSoftwareGl;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    container.appendChild(renderer.domElement);

    const onContextLost = (e: Event) => {
      e.preventDefault();
      setWebglUnavailable(true);
    };
    const onContextRestored = () => {
      setWebglUnavailable(false);
    };
    renderer.domElement.addEventListener('webglcontextlost', onContextLost);
    renderer.domElement.addEventListener('webglcontextrestored', onContextRestored);

    // 2. Scene, Fog & Studio Environment
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0b1620);
    scene.fog = new THREE.FogExp2(0x0b1620, 0.036);

    const pmremGenerator = new THREE.PMREMGenerator(renderer);
    const roomEnvTexture = pmremGenerator.fromScene(new RoomEnvironment(), 0.04).texture;
    scene.environment = roomEnvTexture;
    pmremGenerator.dispose();

    const camera = new THREE.PerspectiveCamera(44, initW / initH, 0.1, 90);
    camera.position.set(...STAGE_CAMERA_VIEWS.overview.pos);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.target.set(...STAGE_CAMERA_VIEWS.overview.target);
    controls.enableZoom = false; // Allow natural vertical scrolling in parent container
    controls.enablePan = false;
    controls.enableDamping = !isSoftwareGl;
    controls.dampingFactor = 0.06;
    controls.maxPolarAngle = Math.PI * 0.46;
    controls.minPolarAngle = Math.PI * 0.14;
    controls.addEventListener('start', () => {
      runtimeRef.current.camTransitionActive = false;
    });

    // 3. 3-Point Studio Lighting Rig
    const hemiLight = new THREE.HemisphereLight(0xa3c9ec, 0x0e1924, 0.8);
    scene.add(hemiLight);

    const keyLight = new THREE.DirectionalLight(0xfff1dc, 2.3);
    keyLight.position.set(7, 11, 6);
    keyLight.castShadow = !isSoftwareGl;
    keyLight.shadow.mapSize.width = 1024;
    keyLight.shadow.mapSize.height = 1024;
    keyLight.shadow.camera.near = 1;
    keyLight.shadow.camera.far = 28;
    keyLight.shadow.camera.left = -7;
    keyLight.shadow.camera.right = 7;
    keyLight.shadow.camera.top = 7;
    keyLight.shadow.camera.bottom = -7;
    keyLight.shadow.bias = -0.0005;
    keyLight.shadow.normalBias = 0.02;
    scene.add(keyLight);

    const rimLight = new THREE.DirectionalLight(0x6ea8ff, 1.0);
    rimLight.position.set(-6.5, 5.5, -5.5);
    scene.add(rimLight);

    if (!isSoftwareGl) {
      RectAreaLightUniformsLib.init();
      const softbox = new THREE.RectAreaLight(0xffeedd, 3.0, 4.5, 2.2);
      softbox.position.set(0, 6.2, -4.2);
      softbox.lookAt(0, 1.4, 0);
      scene.add(softbox);
    }

    // 4. Architectural Grid Floor & Radial Contact Shadow
    const brushedTex = createBrushedMetalRoughnessMap();
    const maxAniso = renderer.capabilities.getMaxAnisotropy();
    const floorTex = createArchitecturalFloorTexture(maxAniso);
    const shadowTex = createRadialShadowTexture();

    const floorGeo = new THREE.CircleGeometry(24, 64);
    const floorMat = new THREE.MeshStandardMaterial({
      map: floorTex,
      roughness: 0.78,
      metalness: 0.16,
      polygonOffset: true,
      polygonOffsetFactor: -1,
      polygonOffsetUnits: -1,
    });
    const floor = new THREE.Mesh(floorGeo, floorMat);
    floor.rotation.x = -Math.PI / 2;
    floor.position.y = -0.02;
    floor.receiveShadow = !isSoftwareGl;
    scene.add(floor);

    const contactShadowGeo = new THREE.PlaneGeometry(7.0, 7.0);
    const contactShadowMat = new THREE.MeshBasicMaterial({
      map: shadowTex,
      transparent: true,
      depthWrite: false,
      opacity: 0.52,
    });
    const contactShadow = new THREE.Mesh(contactShadowGeo, contactShadowMat);
    contactShadow.rotation.x = -Math.PI / 2;
    contactShadow.position.y = 0.005;
    scene.add(contactShadow);

    // 5. Composite Multi-Part Procedural Business Nexus Model
    const nexusGroup = new THREE.Group();
    scene.add(nexusGroup);

    const plinthMat = new THREE.MeshStandardMaterial({
      color: 0x151b24,
      roughness: 0.65,
      metalness: 0.24,
    });

    const copperMetalMat = new THREE.MeshPhysicalMaterial({
      color: 0xd85d27,
      roughness: 0.2,
      metalness: 0.92,
      roughnessMap: brushedTex,
      anisotropy: 0.8,
      clearcoat: 0.42,
    });

    const navySteelMat = new THREE.MeshStandardMaterial({
      color: 0x1b4259,
      roughness: 0.28,
      metalness: 0.84,
    });

    const crystalMat = new THREE.MeshPhysicalMaterial({
      color: 0xffb88c,
      roughness: 0.08,
      metalness: 0.05,
      transmission: isSoftwareGl ? 0 : 0.9,
      ior: 1.75,
      thickness: 1.3,
      clearcoat: 1.0,
      transparent: true,
      opacity: isSoftwareGl ? 0.58 : 1.0,
    });

    // Part 1: Stepped Lathe Plinth (flush at y = 0)
    const plinthProfile = [
      new THREE.Vector2(0.01, 0),
      new THREE.Vector2(2.45, 0),
      new THREE.Vector2(2.45, 0.14),
      new THREE.Vector2(2.15, 0.18),
      new THREE.Vector2(2.15, 0.3),
      new THREE.Vector2(1.72, 0.34),
      new THREE.Vector2(1.72, 0.44),
      new THREE.Vector2(0.01, 0.44),
    ];
    const plinthMesh = new THREE.Mesh(new THREE.LatheGeometry(plinthProfile, 48), plinthMat);
    plinthMesh.castShadow = !isSoftwareGl;
    plinthMesh.receiveShadow = !isSoftwareGl;
    nexusGroup.add(plinthMesh);

    // Part 2: Bevelled Copper Gyroscope Ring
    const ringShape = new THREE.Shape();
    ringShape.absarc(0, 0, 1.38, 0, Math.PI * 2, false);
    const ringHole = new THREE.Path();
    ringHole.absarc(0, 0, 1.04, 0, Math.PI * 2, true);
    ringShape.holes.push(ringHole);

    const coreRingGeo = new THREE.ExtrudeGeometry(ringShape, {
      depth: 0.15,
      bevelEnabled: true,
      bevelThickness: 0.038,
      bevelSize: 0.038,
      bevelSegments: 3,
      curveSegments: 48,
    });
    coreRingGeo.center();
    const coreRing = new THREE.Mesh(coreRingGeo, copperMetalMat);
    coreRing.rotation.x = Math.PI / 2;
    coreRing.position.y = 0.6;
    coreRing.castShadow = !isSoftwareGl;
    nexusGroup.add(coreRing);

    // Part 3: Inner Steel Gimbal Ring
    const gimbalRing = new THREE.Mesh(new THREE.TorusGeometry(1.62, 0.06, 20, 72), navySteelMat);
    gimbalRing.position.y = 1.65;
    gimbalRing.rotation.set(Math.PI / 4, 0, Math.PI / 6);
    gimbalRing.castShadow = !isSoftwareGl;
    nexusGroup.add(gimbalRing);

    // Part 4: Outer Orbital Copper Track
    const outerTrack = new THREE.Mesh(new THREE.TorusGeometry(1.98, 0.03, 16, 84), copperMetalMat);
    outerTrack.position.y = 1.65;
    outerTrack.rotation.set(-Math.PI / 3.1, Math.PI / 5, 0);
    nexusGroup.add(outerTrack);

    // Part 5: Faceted Central Business Prism + Inner Glowing Core
    const crystalGeo = new THREE.OctahedronGeometry(0.62, 0);
    crystalGeo.scale(0.84, 1.36, 0.84);
    const crystalMesh = new THREE.Mesh(crystalGeo, crystalMat);
    crystalMesh.position.y = 1.72;
    crystalMesh.renderOrder = 2;
    nexusGroup.add(crystalMesh);

    const innerCoreMat = new THREE.MeshStandardMaterial({
      color: 0xff813d,
      emissive: 0xd85d27,
      emissiveIntensity: 1.65,
      roughness: 0.2,
    });
    const innerCore = new THREE.Mesh(new THREE.OctahedronGeometry(0.22, 0), innerCoreMat);
    innerCore.position.y = 1.72;
    nexusGroup.add(innerCore);

    // Part 6: 5 Interactive Hexagonal Business Pillars + Curved Tube Conduits
    const hexShape = new THREE.Shape();
    const hexR = 0.23;
    for (let i = 0; i < 6; i++) {
      const a = (i / 6) * Math.PI * 2;
      const hx = Math.cos(a) * hexR;
      const hy = Math.sin(a) * hexR;
      if (i === 0) hexShape.moveTo(hx, hy);
      else hexShape.lineTo(hx, hy);
    }
    hexShape.closePath();

    const pillarGeo = new THREE.ExtrudeGeometry(hexShape, {
      depth: 1.08,
      bevelEnabled: true,
      bevelThickness: 0.03,
      bevelSize: 0.03,
      bevelSegments: 2,
    });
    pillarGeo.rotateX(-Math.PI / 2);

    const capRingGeo = new THREE.TorusGeometry(0.16, 0.03, 12, 24);
    const clickableHitboxes: THREE.Mesh[] = [];
    const pillarNodes: {
      group: THREE.Group;
      capMat: THREE.MeshStandardMaterial;
      capRing: THREE.Mesh;
      pillarIndex: number;
    }[] = [];

    for (let i = 0; i < 5; i++) {
      const angle = (i / 5) * Math.PI * 2 - Math.PI / 2;
      const radius = 2.65;
      const pGroup = new THREE.Group();
      pGroup.position.set(Math.cos(angle) * radius, 0, Math.sin(angle) * radius);

      const pillarBody = new THREE.Mesh(pillarGeo, i === 0 ? copperMetalMat : navySteelMat);
      pillarBody.castShadow = !isSoftwareGl;
      pillarBody.receiveShadow = !isSoftwareGl;
      pGroup.add(pillarBody);

      const accentColor = pillarsRef.current[i].accentHex;
      const capMat = new THREE.MeshStandardMaterial({
        color: accentColor,
        emissive: accentColor,
        emissiveIntensity: i === 0 ? 1.45 : 0.65,
        roughness: 0.22,
        metalness: 0.72,
      });
      const capRing = new THREE.Mesh(capRingGeo, capMat);
      capRing.rotation.x = Math.PI / 2;
      capRing.position.y = 1.18;
      pGroup.add(capRing);

      // Raycast proxy mesh on layer 1
      const hitbox = new THREE.Mesh(
        new THREE.CylinderGeometry(0.42, 0.42, 1.45, 8),
        new THREE.MeshBasicMaterial({ visible: false })
      );
      hitbox.position.y = 0.72;
      hitbox.layers.set(1);
      hitbox.userData.pillarIndex = i;
      pGroup.add(hitbox);

      clickableHitboxes.push(hitbox);
      pillarNodes.push({ group: pGroup, capMat, capRing, pillarIndex: i });
      nexusGroup.add(pGroup);

      // Curved TubeGeometry conduit back into core
      const conduitCurve = new THREE.CatmullRomCurve3([
        new THREE.Vector3(Math.cos(angle) * radius, 0.82, Math.sin(angle) * radius),
        new THREE.Vector3(Math.cos(angle) * (radius * 0.62), 1.28, Math.sin(angle) * (radius * 0.62)),
        new THREE.Vector3(Math.cos(angle) * 0.72, 1.65, Math.sin(angle) * 0.72),
      ]);
      const conduit = new THREE.Mesh(new THREE.TubeGeometry(conduitCurve, 22, 0.02, 8, false), copperMetalMat);
      nexusGroup.add(conduit);
    }

    // 6. InstancedMesh Orbital Deal-Flow Nodes (32 nodes)
    const nodeCount = 32;
    const instancedNodes = new THREE.InstancedMesh(
      new THREE.IcosahedronGeometry(0.078, 1),
      new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.24, metalness: 0.76 }),
      nodeCount
    );
    instancedNodes.frustumCulled = false;

    const palette = [
      new THREE.Color(0xd85d27),
      new THREE.Color(0x38bdf8),
      new THREE.Color(0xfbbf24),
      new THREE.Color(0xe2e8f0),
    ];
    const nodeMeta: { radius: number; angle: number; yBase: number; speed: number; scale: number }[] = [];
    for (let i = 0; i < nodeCount; i++) {
      const radius = 3.35 + (i % 3) * 0.72;
      const angle = (i / nodeCount) * Math.PI * 2;
      const yBase = 0.62 + ((i * 7) % 9) * 0.22;
      const speed = (i % 2 === 0 ? 1 : -1) * (0.14 + (i % 4) * 0.035);
      const scale = 0.85 + ((i % 5) - 2) * 0.075;
      nodeMeta.push({ radius, angle, yBase, speed, scale });
      instancedNodes.setColorAt(i, palette[i % palette.length]);
    }
    if (instancedNodes.instanceColor) instancedNodes.instanceColor.needsUpdate = true;
    scene.add(instancedNodes);

    const updateNodes = (elapsed: number) => {
      for (let i = 0; i < nodeCount; i++) {
        const m = nodeMeta[i];
        const a = m.angle + elapsed * m.speed;
        _vec3.set(Math.cos(a) * m.radius, m.yBase + Math.sin(elapsed * 1.15 + i) * 0.13, Math.sin(a) * m.radius);
        _euler.set(elapsed * 0.38, a, 0);
        _quat.setFromEuler(_euler);
        _scale.setScalar(m.scale);
        _mat4.compose(_vec3, _quat, _scale);
        instancedNodes.setMatrixAt(i, _mat4);
      }
      instancedNodes.instanceMatrix.needsUpdate = true;
    };
    updateNodes(0);
    instancedNodes.computeBoundingSphere();

    // 7. Raycasting on Layer 1 for Pillar Selection
    const raycaster = new THREE.Raycaster();
    raycaster.layers.set(1);
    const pointer = new THREE.Vector2();
    let downPos = { x: 0, y: 0 };

    const updatePointer = (e: PointerEvent) => {
      const rect = renderer.domElement.getBoundingClientRect();
      pointer.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      pointer.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
    };

    const onPointerDown = (e: PointerEvent) => {
      downPos = { x: e.clientX, y: e.clientY };
    };

    const onPointerUp = (e: PointerEvent) => {
      const dist = Math.hypot(e.clientX - downPos.x, e.clientY - downPos.y);
      if (dist > 6) return;
      updatePointer(e);
      raycaster.setFromCamera(pointer, camera);
      const hits = raycaster.intersectObjects(clickableHitboxes, false);
      if (hits.length > 0) {
        const idx = hits[0].object.userData.pillarIndex as number;
        if (typeof idx === 'number') setSelectedIndex(idx);
      }
    };

    let lastHover = 0;
    const onPointerMove = (e: PointerEvent) => {
      const now = performance.now();
      if (now - lastHover < 50) return;
      lastHover = now;
      updatePointer(e);
      raycaster.setFromCamera(pointer, camera);
      const hits = raycaster.intersectObjects(clickableHitboxes, false);
      renderer.domElement.style.cursor = hits.length > 0 ? 'pointer' : 'grab';
    };

    renderer.domElement.addEventListener('pointerdown', onPointerDown);
    renderer.domElement.addEventListener('pointerup', onPointerUp);
    renderer.domElement.addEventListener('pointermove', onPointerMove);

    // 8. Responsive Container Resize
    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth || 380;
      const h = container.clientHeight || 355;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    const resizeObserver = new ResizeObserver(handleResize);
    resizeObserver.observe(container);

    if (!isSoftwareGl) {
      renderer.compile(scene, camera);
    }

    // 9. Animation Loop with software-WebGL pacing
    const clock = new THREE.Clock();
    let frameId = 0;
    let disposed = false;
    let isFirstFrame = true;
    let simTime = 0;

    function afterDraw(cb: () => void) {
      const gl = renderer.getContext() as WebGL2RenderingContext;
      const sync = gl.fenceSync(gl.SYNC_GPU_COMMANDS_COMPLETE, 0);
      gl.flush();
      const poll = () => {
        if (disposed) return;
        const state = sync && gl.getSyncParameter(sync, gl.SYNC_STATUS);
        if (state === gl.UNSIGNALED) {
          frameId = window.setTimeout(poll, 5);
        } else {
          if (sync) gl.deleteSync(sync);
          frameId = window.setTimeout(cb, 80);
        }
      };
      frameId = window.setTimeout(poll, 5);
    }

    function tick() {
      if (disposed) return;
      const delta = Math.min(clock.getDelta(), 0.1);
      const {
        selectedIndex: activeIdx,
        paused: isPaused,
        reducedMotion: isReduced,
        camTransitionActive,
        camView,
      } = runtimeRef.current;

      if (!isPaused && !isReduced) {
        simTime += delta;
      }

      crystalMesh.position.y = 1.72 + Math.sin(simTime * 1.45) * 0.055;
      crystalMesh.rotation.y = simTime * 0.36;
      innerCore.position.y = crystalMesh.position.y;
      innerCore.rotation.y = -simTime * 0.72;

      gimbalRing.rotation.z = Math.PI / 6 + simTime * 0.22;
      outerTrack.rotation.y = Math.PI / 5 - simTime * 0.16;

      // Damped selected pillar highlight lift & emissive pulse
      for (const node of pillarNodes) {
        const isSelected = node.pillarIndex === activeIdx;
        const targetCapY = isSelected ? 1.32 + Math.sin(simTime * 2.4) * 0.04 : 1.18;
        const targetIntensity = isSelected ? 1.55 : 0.6;
        node.capRing.position.y = THREE.MathUtils.damp(node.capRing.position.y, targetCapY, 8, delta);
        node.capMat.emissiveIntensity = THREE.MathUtils.damp(
          node.capMat.emissiveIntensity,
          targetIntensity,
          8,
          delta
        );
        const targetScale = isSelected ? 1.16 : 1.0;
        const s = THREE.MathUtils.damp(node.capRing.scale.x, targetScale, 8, delta);
        node.capRing.scale.setScalar(s);
      }

      updateNodes(simTime);

      // Gentle auto-orbit unless paused/reducedMotion or camera preset animating
      if (!isPaused && !isReduced && !camTransitionActive) {
        nexusGroup.rotation.y = simTime * 0.08;
      }

      if (camTransitionActive) {
        const preset = STAGE_CAMERA_VIEWS[camView];
        _targetCamPos.set(...preset.pos);
        _targetLook.set(...preset.target);
        const alpha = 1 - Math.exp(-5.5 * delta);
        camera.position.lerp(_targetCamPos, alpha);
        controls.target.lerp(_targetLook, alpha);
        if (camera.position.distanceTo(_targetCamPos) < 0.03 && controls.target.distanceTo(_targetLook) < 0.03) {
          runtimeRef.current.camTransitionActive = false;
        }
      }

      controls.update();
      renderer.render(scene, camera);
      if (isFirstFrame) {
        isFirstFrame = false;
        setSceneReady(true);
      }

      if (isSoftwareGl) {
        afterDraw(tick);
      } else {
        frameId = requestAnimationFrame(tick);
      }
    }

    tick();

    return () => {
      disposed = true;
      cancelAnimationFrame(frameId);
      clearTimeout(frameId);
      resizeObserver.disconnect();
      renderer.domElement.removeEventListener('pointerdown', onPointerDown);
      renderer.domElement.removeEventListener('pointerup', onPointerUp);
      renderer.domElement.removeEventListener('pointermove', onPointerMove);
      renderer.domElement.removeEventListener('webglcontextlost', onContextLost);
      renderer.domElement.removeEventListener('webglcontextrestored', onContextRestored);

      controls.dispose();
      roomEnvTexture.dispose();
      brushedTex.dispose();
      floorTex.dispose();
      shadowTex.dispose();

      scene.traverse((obj) => {
        if (obj instanceof THREE.Mesh) {
          obj.geometry.dispose();
          if (Array.isArray(obj.material)) obj.material.forEach((m) => m.dispose());
          else obj.material.dispose();
        }
      });

      renderer.dispose();
      if (renderer.domElement.parentNode === container) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  if (webglUnavailable) {
    return (
      <div className="relative bg-gradient-to-br from-[#0D2331] via-[#123142] to-[#19455C] px-5 pt-6 pb-8 text-white rounded-b-[28px] overflow-hidden">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h1 className="font-display text-[28px] font-bold tracking-tight leading-none text-white">
              <span className="bg-gradient-to-r from-white via-white to-[#F9C68E] bg-clip-text text-transparent">
                Business
              </span>
              <span className="text-[#F38B1E]">.</span>
            </h1>
            <div className="mt-2 flex items-center gap-2">
              <span className="h-[3px] w-7 rounded-full bg-gradient-to-r from-[#F38B1E] to-[#D85D27]" />
              <span className="text-[11.5px] font-medium text-slate-300/90 tabular-nums">
                {referralsCount} referrals · {connectionsCount} members
              </span>
            </div>
          </div>
          <Compass className="w-7 h-7 text-[#F38B1E] shrink-0" />
        </div>
      </div>
    );
  }

  return (
    <div className="relative h-[360px] sm:h-[385px] w-full bg-[#0B1620] rounded-b-[28px] overflow-hidden shadow-[0_18px_40px_-14px_rgba(11,22,32,0.55)]">
      {/* Isolated WebGL Mount */}
      <div ref={mountRef} className="absolute inset-0 w-full h-full" />

      {/* Branded 3D WebGL Initialization Skeleton (no backdrop-filter over WebGL) */}
      <AnimatePresence>
        {!sceneReady && !webglUnavailable && (
          <ThreeStageSkeletonOverlay
            variant="compact"
            label="Initializing 3D Business Stage"
            reducedMotion={reducedMotion}
          />
        )}
      </AnimatePresence>

      {/* Top Overlay: Bold Highlighted Title + Camera View Controls (Zero backdrop-filter over WebGL) */}
      <div className="pointer-events-none absolute top-0 left-0 right-0 z-10 px-4 pt-4 flex items-start justify-between gap-2">
        <div className="min-w-0">
          <h1 className="font-display text-[27px] font-bold tracking-tight leading-none text-white drop-shadow-[0_2px_10px_rgba(0,0,0,0.45)]">
            <span className="bg-gradient-to-r from-white via-white to-[#F9C68E] bg-clip-text text-transparent">
              Business
            </span>
            <span className="text-[#F38B1E]">.</span>
          </h1>
          <div className="mt-1.5 flex items-center gap-2">
            <span className="h-[3px] w-7 rounded-full bg-gradient-to-r from-[#F38B1E] to-[#D85D27]" />
            <span className="text-[11px] font-medium text-slate-200/90 tabular-nums">
              {referralsCount} referrals · {connectionsCount} links
            </span>
          </div>
        </div>

        <div className="pointer-events-auto flex items-center gap-1 rounded-xl bg-[#0D1A26]/90 border border-white/12 p-1 shrink-0">
          {(['overview', 'core', 'top'] as StageCameraView[]).map((view) => (
            <button
              key={view}
              type="button"
              onClick={() => triggerCameraView(view)}
              className={`px-2 py-1 rounded-lg text-[10.5px] font-semibold transition-colors cursor-pointer whitespace-nowrap ${
                cameraView === view
                  ? 'bg-[#D85D27] text-white'
                  : 'text-slate-300 hover:text-white hover:bg-white/10'
              }`}
            >
              {STAGE_CAMERA_VIEWS[view].label}
            </button>
          ))}
          <button
            type="button"
            onClick={() => setPaused((p) => !p)}
            aria-label={paused ? 'Resume 3D orbit' : 'Pause 3D orbit'}
            className="w-6.5 h-6.5 rounded-lg text-slate-300 hover:text-white hover:bg-white/10 flex items-center justify-center cursor-pointer"
          >
            {paused ? <Play className="w-3 h-3" /> : <Pause className="w-3 h-3" />}
          </button>
          <button
            type="button"
            onClick={() => triggerCameraView('overview')}
            aria-label="Reset camera"
            className="w-6.5 h-6.5 rounded-lg text-slate-300 hover:text-white hover:bg-white/10 flex items-center justify-center cursor-pointer"
          >
            <RotateCcw className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* Bottom Interactive HUD Dock inside 3D Stage (Zero backdrop-filter) */}
      <div className="pointer-events-none absolute bottom-3 left-3 right-3 z-10 space-y-2">
        {/* 5 Pillar Selector Strip */}
        <div className="pointer-events-auto flex items-center justify-center gap-1 flex-wrap">
          {pillars.map((pillar, idx) => {
            const active = idx === selectedIndex;
            return (
              <button
                key={pillar.id}
                type="button"
                onClick={() => setSelectedIndex(idx)}
                className={`px-2.5 py-1 rounded-lg text-[10.5px] font-semibold inline-flex items-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap ${
                  active
                    ? 'bg-[#D85D27] text-white shadow-sm'
                    : 'bg-[#0D1A26]/88 text-slate-300 border border-white/10 hover:text-white'
                }`}
              >
                <span
                  className="w-1.5 h-1.5 rounded-full shrink-0"
                  style={{ backgroundColor: active ? '#FFFFFF' : pillar.accentHex }}
                />
                <span>{pillar.shortLabel}</span>
              </button>
            );
          })}
        </div>

        {/* Active 3D Pillar Inspector Card */}
        <div className="pointer-events-auto rounded-2xl bg-[#0D1A26]/92 border border-white/12 px-3.5 py-2.5 text-white flex items-center justify-between gap-3 shadow-lg">
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <Eye className="w-3 h-3 text-[#F38B1E] shrink-0" />
              <span className="text-[10px] font-semibold uppercase tracking-[0.1em] text-slate-400">
                Tap any 3D spire or drag to orbit
              </span>
            </div>
            <div className="mt-0.5 flex items-baseline gap-2 min-w-0">
              <span className="font-display text-sm font-bold text-white truncate">
                {selectedPillar.label}
              </span>
              <span className="text-[11px] text-[#F38B1E] font-medium tabular-nums shrink-0">
                {selectedPillar.metric}
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={() => onNavigate(selectedPillar.targetScreen)}
            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-[#D85D27] hover:bg-[#BE4D14] text-xs font-semibold text-white transition-colors cursor-pointer shrink-0 whitespace-nowrap"
          >
            <span>Open</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
