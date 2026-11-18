import React, { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { RectAreaLightUniformsLib } from 'three/addons/lights/RectAreaLightUniformsLib.js';
import { ArrowUpRight, ChevronDown, ChevronUp, Compass, Layers, RotateCcw } from 'lucide-react';
import { ScreenId } from '../types/ekam';
import { ThreeStageSkeletonOverlay } from './EkamSkeletons';

export interface NexusModuleInfo {
  id: string;
  label: string;
  metric: string;
  subtitle: string;
  targetScreen: ScreenId;
  accentHex: string;
}

interface ThreeChapterNexusProps {
  metrics: {
    connectionsCount: number;
    referralsCount: number;
    meetingsCount: number;
    groupsCount: number;
    creditsInr: number;
  };
  reducedMotion: boolean;
  onNavigateScreen: (screen: ScreenId) => void;
  onGlobeInteraction?: () => void;
}

type FinishPreset = 'copper' | 'obsidian' | 'cobalt';
type CameraPreset = 'overview' | 'core' | 'top' | 'spires';

const CAMERA_PRESETS: Record<CameraPreset, { pos: [number, number, number]; target: [number, number, number] }> = {
  overview: { pos: [7.8, 4.9, 8.6], target: [0, 1.35, 0] },
  core: { pos: [3.8, 2.4, 4.2], target: [0, 1.55, 0] },
  top: { pos: [0.1, 11.2, 3.2], target: [0, 0.8, 0] },
  spires: { pos: [-7.2, 3.2, 6.4], target: [0, 1.3, 0] },
};

const FINISH_COLORS: Record<FinishPreset, { primary: number; secondary: number; crystal: number; label: string }> = {
  copper: { primary: 0xd85d27, secondary: 0x1a3e54, crystal: 0xffb38a, label: 'Signature Copper' },
  obsidian: { primary: 0xd99b38, secondary: 0x16181f, crystal: 0xfde68a, label: 'Obsidian Gold' },
  cobalt: { primary: 0x3b6cff, secondary: 0x11253c, crystal: 0x93c5fd, label: 'Cobalt Titanium' },
};

// Pre-allocated scratch helpers (zero GC inside animation loop)
const _vec3 = new THREE.Vector3();
const _targetCamPos = new THREE.Vector3();
const _targetLook = new THREE.Vector3();
const _mat4 = new THREE.Matrix4();
const _quat = new THREE.Quaternion();
const _scale = new THREE.Vector3();
const _euler = new THREE.Euler();

function createBrushedMetalTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d')!;
  ctx.fillStyle = '#808080';
  ctx.fillRect(0, 0, 256, 256);
  for (let y = 0; y < 256; y++) {
    const v = 112 + Math.floor(Math.sin(y * 0.7) * 14 + (Math.random() - 0.5) * 28);
    ctx.fillStyle = `rgb(${v},${v},${v})`;
    ctx.fillRect(0, y, 256, 1);
  }
  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(3, 3);
  return tex;
}

function createFloorGridTexture(maxAnisotropy: number): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d')!;
  ctx.fillStyle = '#0c1824';
  ctx.fillRect(0, 0, 512, 512);

  ctx.strokeStyle = 'rgba(148, 184, 212, 0.14)';
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

  ctx.strokeStyle = 'rgba(216, 93, 39, 0.25)';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.arc(256, 256, 180, 0, Math.PI * 2);
  ctx.stroke();

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = maxAnisotropy;
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(4, 4);
  return tex;
}

function createContactShadowTexture(): THREE.CanvasTexture {
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
  const tex = new THREE.CanvasTexture(canvas);
  return tex;
}

export function ThreeChapterNexus({
  metrics,
  reducedMotion,
  onNavigateScreen,
  onGlobeInteraction,
}: ThreeChapterNexusProps) {
  const mountRef = useRef<HTMLDivElement | null>(null);

  const [dockOpen, setDockOpen] = useState(true);
  const [explodeFactor, setExplodeFactor] = useState(0.18);
  const [finish, setFinish] = useState<FinishPreset>('copper');
  const [cameraPreset, setCameraPreset] = useState<CameraPreset>('overview');
  const [paused, setPaused] = useState(false);
  const [webglUnavailable, setWebglUnavailable] = useState(false);
  const [sceneReady, setSceneReady] = useState(false);
  const [shakeTrigger, setShakeTrigger] = useState(0);

  const modules: NexusModuleInfo[] = [
    {
      id: 'mod-biz',
      label: 'Business Opportunities',
      metric: `${metrics.referralsCount} Active Referrals`,
      subtitle: 'Core chapter referral & closed-value loop',
      targetScreen: 'opportunity',
      accentHex: '#D85D27',
    },
    {
      id: 'mod-conn',
      label: 'Fortune Connections',
      metric: `${metrics.connectionsCount} Chapter Members`,
      subtitle: 'Trusted business owners & direct chat threads',
      targetScreen: 'connections',
      accentHex: '#38BDF8',
    },
    {
      id: 'mod-meet',
      label: 'Chapter Meetings & P2P',
      metric: `${metrics.meetingsCount} Scheduled Sessions`,
      subtitle: 'Thursday 07:30 In-Person & 1-to-1s',
      targetScreen: 'meetings',
      accentHex: '#F59E0B',
    },
    {
      id: 'mod-prof',
      label: 'Professional Network',
      metric: 'Cross-Region Feed',
      subtitle: 'Updates, endorsements & industry reach',
      targetScreen: 'prof_home',
      accentHex: '#818CF8',
    },
    {
      id: 'mod-grp',
      label: 'Interest Groups',
      metric: `${metrics.groupsCount} Circles`,
      subtitle: 'Focused roundtables beyond your chapter',
      targetScreen: 'groups_home',
      accentHex: '#34D399',
    },
  ];

  const [selectedModule, setSelectedModule] = useState<NexusModuleInfo>(modules[0]);

  const stateRef = useRef({
    explode: 0.18,
    finish: 'copper' as FinishPreset,
    paused: false,
    reducedMotion,
    camTransitionActive: false,
    camPreset: 'overview' as CameraPreset,
  });

  stateRef.current.explode = explodeFactor;
  stateRef.current.finish = finish;
  stateRef.current.paused = paused;
  stateRef.current.reducedMotion = reducedMotion;

  const modulesRef = useRef(modules);
  modulesRef.current = modules;

  // Keyboard shortcut 'H' to toggle dock visibility
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'h' || e.key === 'H') {
        if (document.activeElement?.tagName !== 'INPUT' && document.activeElement?.tagName !== 'TEXTAREA') {
          setDockOpen((prev) => !prev);
        }
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  const triggerPreset = (preset: CameraPreset) => {
    setCameraPreset(preset);
    stateRef.current.camPreset = preset;
    stateRef.current.camTransitionActive = true;
  };

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;
    setSceneReady(false);

    // 1. Software WebGL probe
    const isSoftwareGl = (() => {
      const probeCanvas = document.createElement('canvas');
      const gl = probeCanvas.getContext('webgl2');
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

    const width = container.clientWidth || window.innerWidth;
    const height = container.clientHeight || window.innerHeight;

    renderer.setSize(width, height);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.1;
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

    // 2. Scene, Camera, Fog & RoomEnvironment
    const scene = new THREE.Scene();
    const skyColor = new THREE.Color(0x0b1620);
    scene.background = skyColor;
    scene.fog = new THREE.FogExp2(0x0b1620, 0.032);

    const pmremGenerator = new THREE.PMREMGenerator(renderer);
    const roomEnvTexture = pmremGenerator.fromScene(new RoomEnvironment(), 0.04).texture;
    scene.environment = roomEnvTexture;
    pmremGenerator.dispose();

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(...CAMERA_PRESETS.overview.pos);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.target.set(...CAMERA_PRESETS.overview.target);
    controls.enableDamping = !isSoftwareGl;
    controls.dampingFactor = 0.06;
    controls.minDistance = 4.2;
    controls.maxDistance = 18;
    controls.maxPolarAngle = Math.PI * 0.47;
    controls.addEventListener('start', () => {
      stateRef.current.camTransitionActive = false;
    });

    // 3. Studio 3-Point Lighting Rig
    const hemiLight = new THREE.HemisphereLight(0x9ec5e8, 0x0f1a24, 0.78);
    scene.add(hemiLight);

    const keyLight = new THREE.DirectionalLight(0xfff2e0, 2.2);
    keyLight.position.set(7.5, 11.5, 6.5);
    keyLight.castShadow = !isSoftwareGl;
    keyLight.shadow.mapSize.width = 1024;
    keyLight.shadow.mapSize.height = 1024;
    keyLight.shadow.camera.near = 1;
    keyLight.shadow.camera.far = 30;
    keyLight.shadow.camera.left = -8;
    keyLight.shadow.camera.right = 8;
    keyLight.shadow.camera.top = 8;
    keyLight.shadow.camera.bottom = -8;
    keyLight.shadow.bias = -0.0005;
    keyLight.shadow.normalBias = 0.02;
    scene.add(keyLight);

    const rimLight = new THREE.DirectionalLight(0x6ea8ff, 0.95);
    rimLight.position.set(-7, 6, -6);
    scene.add(rimLight);

    if (!isSoftwareGl) {
      RectAreaLightUniformsLib.init();
      const softbox = new THREE.RectAreaLight(0xffeedd, 3.2, 5, 2.5);
      softbox.position.set(0, 6.8, -4.5);
      softbox.lookAt(0, 1.5, 0);
      scene.add(softbox);
    }

    // 4. Procedural Textures & Ground Plane
    const brushedTex = createBrushedMetalTexture();
    const maxAniso = renderer.capabilities.getMaxAnisotropy();
    const gridTex = createFloorGridTexture(maxAniso);
    const shadowTex = createContactShadowTexture();

    const floorGeo = new THREE.CircleGeometry(28, 64);
    const floorMat = new THREE.MeshStandardMaterial({
      map: gridTex,
      roughness: 0.78,
      metalness: 0.15,
      polygonOffset: true,
      polygonOffsetFactor: -1,
      polygonOffsetUnits: -1,
    });
    const floor = new THREE.Mesh(floorGeo, floorMat);
    floor.rotation.x = -Math.PI / 2;
    floor.position.y = -0.02;
    floor.receiveShadow = !isSoftwareGl;
    scene.add(floor);

    const contactShadowGeo = new THREE.PlaneGeometry(7.2, 7.2);
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

    // 5. Composite 8-Part Procedural Hero Model (EKAM Nexus Monument)
    const monumentGroup = new THREE.Group();
    scene.add(monumentGroup);

    // Shared materials
    const plinthMat = new THREE.MeshStandardMaterial({
      color: 0x161b24,
      roughness: 0.68,
      metalness: 0.22,
    });

    const primaryMetalMat = new THREE.MeshPhysicalMaterial({
      color: FINISH_COLORS.copper.primary,
      roughness: 0.2,
      metalness: 0.92,
      roughnessMap: brushedTex,
      anisotropy: 0.8,
      clearcoat: 0.4,
    });

    const secondaryMetalMat = new THREE.MeshStandardMaterial({
      color: FINISH_COLORS.copper.secondary,
      roughness: 0.28,
      metalness: 0.82,
    });

    const crystalMat = new THREE.MeshPhysicalMaterial({
      color: FINISH_COLORS.copper.crystal,
      roughness: 0.08,
      metalness: 0.05,
      transmission: isSoftwareGl ? 0 : 0.92,
      ior: 1.75,
      thickness: 1.4,
      clearcoat: 1.0,
      transparent: true,
      opacity: isSoftwareGl ? 0.58 : 1.0,
    });

    // Part 1: Stepped Obsidian Plinth via LatheGeometry (flush at y = 0)
    const plinthPoints = [
      new THREE.Vector2(0.01, 0),
      new THREE.Vector2(2.65, 0),
      new THREE.Vector2(2.65, 0.14),
      new THREE.Vector2(2.38, 0.18),
      new THREE.Vector2(2.38, 0.32),
      new THREE.Vector2(1.92, 0.36),
      new THREE.Vector2(1.92, 0.46),
      new THREE.Vector2(0.01, 0.46),
    ];
    const plinthGeo = new THREE.LatheGeometry(plinthPoints, 48);
    const plinthMesh = new THREE.Mesh(plinthGeo, plinthMat);
    plinthMesh.castShadow = !isSoftwareGl;
    plinthMesh.receiveShadow = !isSoftwareGl;
    monumentGroup.add(plinthMesh);

    // Part 2: Bevelled EKAM Core Ring (ExtrudeGeometry)
    const ringShape = new THREE.Shape();
    ringShape.absarc(0, 0, 1.45, 0, Math.PI * 2, false);
    const ringHole = new THREE.Path();
    ringHole.absarc(0, 0, 1.08, 0, Math.PI * 2, true);
    ringShape.holes.push(ringHole);

    const coreRingGeo = new THREE.ExtrudeGeometry(ringShape, {
      depth: 0.16,
      bevelEnabled: true,
      bevelThickness: 0.04,
      bevelSize: 0.04,
      bevelSegments: 3,
      curveSegments: 48,
    });
    coreRingGeo.center();
    const coreRing = new THREE.Mesh(coreRingGeo, primaryMetalMat);
    coreRing.rotation.x = Math.PI / 2;
    coreRing.position.y = 0.62;
    coreRing.castShadow = !isSoftwareGl;
    monumentGroup.add(coreRing);

    // Part 3: Tilted Indigo-Steel Gimbal Ring
    const gimbalGeo = new THREE.TorusGeometry(1.75, 0.065, 20, 72);
    const gimbalRing = new THREE.Mesh(gimbalGeo, secondaryMetalMat);
    gimbalRing.position.y = 1.72;
    gimbalRing.rotation.set(Math.PI / 4, 0, Math.PI / 6);
    gimbalRing.castShadow = !isSoftwareGl;
    monumentGroup.add(gimbalRing);

    // Part 4: Outer Orbital Telemetry Track
    const outerTrackGeo = new THREE.TorusGeometry(2.15, 0.032, 16, 84);
    const outerTrack = new THREE.Mesh(outerTrackGeo, primaryMetalMat);
    outerTrack.position.y = 1.72;
    outerTrack.rotation.set(-Math.PI / 3.2, Math.PI / 5, 0);
    monumentGroup.add(outerTrack);

    // Part 5: Faceted Central Sapphire-Copper Crystal Prism
    const crystalGeo = new THREE.OctahedronGeometry(0.66, 0);
    crystalGeo.scale(0.82, 1.38, 0.82);
    const crystalMesh = new THREE.Mesh(crystalGeo, crystalMat);
    crystalMesh.position.y = 1.78;
    crystalMesh.renderOrder = 2;
    monumentGroup.add(crystalMesh);

    // Inner glowing energy core inside crystal
    const innerCoreGeo = new THREE.OctahedronGeometry(0.24, 0);
    const innerCoreMat = new THREE.MeshStandardMaterial({
      color: 0xff7b39,
      emissive: 0xd85d27,
      emissiveIntensity: 1.6,
      roughness: 0.2,
    });
    const innerCore = new THREE.Mesh(innerCoreGeo, innerCoreMat);
    innerCore.position.y = 1.78;
    monumentGroup.add(innerCore);

    // Part 6: 5 Clickable Module Monolith Spires (Layer 1 for Raycasting)
    const spireShape = new THREE.Shape();
    const sRadius = 0.24;
    for (let i = 0; i < 6; i++) {
      const a = (i / 6) * Math.PI * 2;
      const sx = Math.cos(a) * sRadius;
      const sy = Math.sin(a) * sRadius;
      if (i === 0) spireShape.moveTo(sx, sy);
      else spireShape.lineTo(sx, sy);
    }
    spireShape.closePath();

    const spireGeo = new THREE.ExtrudeGeometry(spireShape, {
      depth: 1.15,
      bevelEnabled: true,
      bevelThickness: 0.03,
      bevelSize: 0.03,
      bevelSegments: 2,
    });
    spireGeo.rotateX(-Math.PI / 2);

    const spireCapGeo = new THREE.TorusGeometry(0.16, 0.028, 12, 24);
    const spireGroups: { group: THREE.Group; baseRadius: number; angle: number; hitbox: THREE.Mesh; moduleIndex: number }[] = [];
    const clickableMeshes: THREE.Mesh[] = [];

    for (let i = 0; i < 5; i++) {
      const angle = (i / 5) * Math.PI * 2 - Math.PI / 2;
      const baseRadius = 2.85;
      const spireGroup = new THREE.Group();
      spireGroup.position.set(Math.cos(angle) * baseRadius, 0, Math.sin(angle) * baseRadius);

      const spireBody = new THREE.Mesh(spireGeo, i === 0 ? primaryMetalMat : secondaryMetalMat);
      spireBody.castShadow = !isSoftwareGl;
      spireBody.receiveShadow = !isSoftwareGl;
      spireGroup.add(spireBody);

      const capMat = new THREE.MeshStandardMaterial({
        color: modulesRef.current[i].accentHex,
        emissive: modulesRef.current[i].accentHex,
        emissiveIntensity: 0.85,
        roughness: 0.25,
        metalness: 0.7,
      });
      const capRing = new THREE.Mesh(spireCapGeo, capMat);
      capRing.rotation.x = Math.PI / 2;
      capRing.position.y = 1.24;
      spireGroup.add(capRing);

      // Simplified proxy hitbox for crisp raycasting on layer 1
      const hitGeo = new THREE.CylinderGeometry(0.42, 0.42, 1.5, 8);
      const hitMat = new THREE.MeshBasicMaterial({ visible: false });
      const hitbox = new THREE.Mesh(hitGeo, hitMat);
      hitbox.position.y = 0.75;
      hitbox.layers.set(1);
      hitbox.userData.moduleIndex = i;
      spireGroup.add(hitbox);

      clickableMeshes.push(hitbox);
      spireGroups.push({ group: spireGroup, baseRadius, angle, hitbox, moduleIndex: i });
      monumentGroup.add(spireGroup);

      // Part 7: Referral Energy Conduit (TubeGeometry) connecting each spire to core ring
      const curve = new THREE.CatmullRomCurve3([
        new THREE.Vector3(Math.cos(angle) * baseRadius, 0.85, Math.sin(angle) * baseRadius),
        new THREE.Vector3(Math.cos(angle) * (baseRadius * 0.62), 1.32, Math.sin(angle) * (baseRadius * 0.62)),
        new THREE.Vector3(Math.cos(angle) * 0.75, 1.72, Math.sin(angle) * 0.75),
      ]);
      const tubeGeo = new THREE.TubeGeometry(curve, 24, 0.022, 8, false);
      const tubeMesh = new THREE.Mesh(tubeGeo, primaryMetalMat);
      monumentGroup.add(tubeMesh);
    }

    // 6. InstancedMesh Chapter Constellation (36 orbital member nodes)
    const nodeCount = 36;
    const nodeGeo = new THREE.IcosahedronGeometry(0.085, 1);
    const nodeMat = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      roughness: 0.25,
      metalness: 0.75,
    });
    const instancedNodes = new THREE.InstancedMesh(nodeGeo, nodeMat, nodeCount);
    instancedNodes.frustumCulled = false;

    const nodeMeta: { radius: number; angle: number; yBase: number; speed: number; scale: number }[] = [];
    const palette = [new THREE.Color(0xd85d27), new THREE.Color(0x38bdf8), new THREE.Color(0xfbbf24), new THREE.Color(0xe2e8f0)];
    for (let i = 0; i < nodeCount; i++) {
      const radius = 3.6 + (i % 3) * 0.85;
      const angle = (i / nodeCount) * Math.PI * 2;
      const yBase = 0.65 + ((i * 7) % 10) * 0.22;
      const speed = (i % 2 === 0 ? 1 : -1) * (0.12 + (i % 4) * 0.035);
      const scale = 0.85 + ((i % 5) - 2) * 0.075; // ±15% variation
      nodeMeta.push({ radius, angle, yBase, speed, scale });
      instancedNodes.setColorAt(i, palette[i % palette.length]);
    }
    if (instancedNodes.instanceColor) instancedNodes.instanceColor.needsUpdate = true;
    scene.add(instancedNodes);

    const updateInstances = (elapsed: number, explodeVal: number) => {
      for (let i = 0; i < nodeCount; i++) {
        const m = nodeMeta[i];
        const a = m.angle + elapsed * m.speed;
        const r = m.radius + explodeVal * 1.35;
        _vec3.set(Math.cos(a) * r, m.yBase + Math.sin(elapsed * 1.1 + i) * 0.14 + explodeVal * 0.45, Math.sin(a) * r);
        _euler.set(elapsed * 0.4, a, 0);
        _quat.setFromEuler(_euler);
        _scale.setScalar(m.scale);
        _mat4.compose(_vec3, _quat, _scale);
        instancedNodes.setMatrixAt(i, _mat4);
      }
      instancedNodes.instanceMatrix.needsUpdate = true;
    };
    updateInstances(0, stateRef.current.explode);
    instancedNodes.computeBoundingSphere();

    // 7. Raycasting for 3D Spire Click & Hover
    const raycaster = new THREE.Raycaster();
    raycaster.layers.set(1);
    const pointer = new THREE.Vector2();
    let pointerDownPos = { x: 0, y: 0 };

    const updatePointer = (e: PointerEvent) => {
      const rect = renderer.domElement.getBoundingClientRect();
      pointer.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      pointer.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
    };

    const onPointerDown = (e: PointerEvent) => {
      pointerDownPos = { x: e.clientX, y: e.clientY };
    };

    const onPointerUp = (e: PointerEvent) => {
      const dist = Math.hypot(e.clientX - pointerDownPos.x, e.clientY - pointerDownPos.y);
      if (dist > 6) return; // Ignore orbit drag
      updatePointer(e);
      raycaster.setFromCamera(pointer, camera);
      const hits = raycaster.intersectObjects(clickableMeshes, false);
      if (hits.length > 0) {
        const idx = hits[0].object.userData.moduleIndex as number;
        const mod = modulesRef.current[idx];
        if (mod) setSelectedModule(mod);
      }
    };

    let lastHoverCheck = 0;
    const onPointerMove = (e: PointerEvent) => {
      const now = performance.now();
      if (now - lastHoverCheck < 50) return;
      lastHoverCheck = now;
      updatePointer(e);
      raycaster.setFromCamera(pointer, camera);
      const hits = raycaster.intersectObjects(clickableMeshes, false);
      renderer.domElement.style.cursor = hits.length > 0 ? 'pointer' : 'grab';
    };

    renderer.domElement.addEventListener('pointerdown', onPointerDown);
    renderer.domElement.addEventListener('pointerup', onPointerUp);
    renderer.domElement.addEventListener('pointermove', onPointerMove);

    // 8. Resize handling
    const onResize = () => {
      if (!container) return;
      const w = container.clientWidth || window.innerWidth;
      const h = container.clientHeight || window.innerHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', onResize);

    if (!isSoftwareGl) {
      renderer.compile(scene, camera);
    }

    // 9. Animation Loop with software-WebGL afterDraw pacing
    const clock = new THREE.Clock();
    let frameId = 0;
    let disposed = false;
    let isFirstFrame = true;
    let simTime = 0;
    let dampedExplode = stateRef.current.explode;
    let activeFinish: FinishPreset = stateRef.current.finish;

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
      const { explode, finish: desiredFinish, paused: isPaused, reducedMotion: isReduced, camTransitionActive, camPreset } =
        stateRef.current;

      if (!isPaused && !isReduced) {
        simTime += delta;
      }

      // Apply finish preset changes cleanly
      if (desiredFinish !== activeFinish) {
        activeFinish = desiredFinish;
        const f = FINISH_COLORS[activeFinish];
        primaryMetalMat.color.setHex(f.primary);
        secondaryMetalMat.color.setHex(f.secondary);
        crystalMat.color.setHex(f.crystal);
      }

      // Exponentially damped exploded view
      dampedExplode = THREE.MathUtils.damp(dampedExplode, explode, 6.5, delta);

      crystalMesh.position.y = 1.78 + dampedExplode * 1.15 + Math.sin(simTime * 1.4) * 0.06;
      crystalMesh.rotation.y = simTime * 0.35;
      innerCore.position.y = crystalMesh.position.y;
      innerCore.rotation.y = -simTime * 0.7;

      gimbalRing.position.y = 1.72 + dampedExplode * 0.55;
      gimbalRing.rotation.z = Math.PI / 6 + simTime * 0.22;

      outerTrack.position.y = 1.72 + dampedExplode * 0.85;
      outerTrack.rotation.y = Math.PI / 5 - simTime * 0.16;

      coreRing.position.y = 0.62 + dampedExplode * 0.2;

      for (const s of spireGroups) {
        const r = s.baseRadius + dampedExplode * 0.95;
        s.group.position.x = Math.cos(s.angle) * r;
        s.group.position.z = Math.sin(s.angle) * r;
      }

      updateInstances(simTime, dampedExplode);

      // Smooth damped camera preset transition
      if (camTransitionActive) {
        const preset = CAMERA_PRESETS[camPreset];
        _targetCamPos.set(...preset.pos);
        _targetLook.set(...preset.target);
        const alpha = 1 - Math.exp(-5.5 * delta);
        camera.position.lerp(_targetCamPos, alpha);
        controls.target.lerp(_targetLook, alpha);
        if (camera.position.distanceTo(_targetCamPos) < 0.03 && controls.target.distanceTo(_targetLook) < 0.03) {
          stateRef.current.camTransitionActive = false;
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
      window.removeEventListener('resize', onResize);
      renderer.domElement.removeEventListener('pointerdown', onPointerDown);
      renderer.domElement.removeEventListener('pointerup', onPointerUp);
      renderer.domElement.removeEventListener('pointermove', onPointerMove);
      renderer.domElement.removeEventListener('webglcontextlost', onContextLost);
      renderer.domElement.removeEventListener('webglcontextrestored', onContextRestored);

      controls.dispose();
      roomEnvTexture.dispose();
      brushedTex.dispose();
      gridTex.dispose();
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
      <div className="relative w-full h-[calc(100vh-64px)] bg-[#0B1620] text-white flex flex-col items-center justify-center p-8 text-center">
        <Compass className="w-12 h-12 text-[#D85D27] mb-4" />
        <h2 className="font-display text-2xl font-bold">3D Chapter Nexus</h2>
        <p className="mt-2 text-sm text-slate-300 max-w-md">
          WebGL rendering is paused or unavailable in this browser context. You can still inspect every redesigned EKAM module directly.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          {modules.map((m) => (
            <button
              key={m.id}
              type="button"
              onClick={() => onNavigateScreen(m.targetScreen)}
              className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-sm font-medium transition-colors cursor-pointer"
            >
              {m.label}
            </button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <motion.div
      animate={shakeTrigger > 0 ? { x: [0, -8, 8, -6, 6, -3, 3, 0], scale: [1, 1.012, 1] } : {}}
      transition={{ duration: 0.4 }}
      onClick={() => {
        setShakeTrigger((s) => s + 1);
        onGlobeInteraction?.();
      }}
      className="relative w-full h-[calc(100vh-64px)] overflow-hidden bg-[#0B1620] cursor-pointer"
    >
      {/* Isolated WebGL Canvas Mount */}
      <div ref={mountRef} className="absolute inset-0 w-full h-full pointer-events-none" />

      {/* Branded 3D WebGL Initialization Skeleton (no backdrop-filter over WebGL) */}
      <AnimatePresence>
        {!sceneReady && !webglUnavailable && (
          <ThreeStageSkeletonOverlay
            variant="fullscreen"
            label="Mapping Chapter Constellation"
            reducedMotion={reducedMotion}
          />
        )}
      </AnimatePresence>

      {/* Top-Left Minimal Spec & Selected Spire Card (solid/rgba surface, NO backdrop-filter over WebGL) */}
      <div className="pointer-events-none absolute top-5 left-5 z-10 max-w-sm">
        <div className="pointer-events-auto rounded-2xl bg-[#0D1A26]/92 border border-white/12 p-4 text-white shadow-xl">
          <div className="flex items-center justify-between gap-4">
            <span className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#F59E0B]">
              Fortune Chapter · Spatial Hub
            </span>
            <span className="text-xs font-mono-tabular text-slate-400">
              Rs. {metrics.creditsInr.toLocaleString('en-IN')}
            </span>
          </div>
          <h2 className="mt-1.5 font-display text-lg font-bold tracking-tight text-white">
            {selectedModule.label}
          </h2>
          <p className="mt-0.5 text-xs text-slate-300">{selectedModule.subtitle}</p>
          <div className="mt-3 pt-3 border-t border-white/10 flex items-center justify-between gap-3">
            <span className="text-xs font-medium text-slate-200 font-mono-tabular">{selectedModule.metric}</span>
            <button
              type="button"
              onClick={() => onNavigateScreen(selectedModule.targetScreen)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#D85D27] hover:bg-[#BE4D14] text-xs font-semibold text-white transition-colors cursor-pointer whitespace-nowrap shrink-0"
            >
              <span>Open Module</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Collapsible Bottom Control Dock (<= 15% viewport footprint, zero backdrop-filter) */}
      <div
        className={`absolute bottom-4 left-1/2 -translate-x-1/2 z-10 w-[min(920px,94vw)] transition-transform duration-200 ${
          dockOpen ? 'translate-y-0' : 'translate-y-[calc(100%-36px)]'
        }`}
      >
        <div className="flex justify-center mb-1.5">
          <button
            type="button"
            onClick={() => setDockOpen((v) => !v)}
            className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-[#0D1A26]/95 border border-white/15 text-xs font-medium text-slate-200 hover:text-white transition-colors cursor-pointer"
          >
            {dockOpen ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronUp className="w-3.5 h-3.5" />}
            <span>{dockOpen ? 'Hide Controls (H)' : 'Show Controls (H)'}</span>
          </button>
        </div>

        <div className="rounded-2xl bg-[#0D1A26]/95 border border-white/12 px-4 py-3 text-white shadow-2xl">
          <div className="flex flex-wrap items-center justify-between gap-4">
            {/* Camera Presets */}
            <div className="flex items-center gap-1.5">
              <span className="text-[11px] font-medium text-slate-400 mr-1 whitespace-nowrap">View</span>
              {(['overview', 'core', 'top', 'spires'] as CameraPreset[]).map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => triggerPreset(preset)}
                  className={`px-2.5 py-1.5 rounded-lg text-xs font-medium capitalize transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                    cameraPreset === preset
                      ? 'bg-[#D85D27] text-white'
                      : 'bg-white/8 text-slate-300 hover:bg-white/14 hover:text-white'
                  }`}
                >
                  {preset}
                </button>
              ))}
            </div>

            {/* Exploded Constellation Spread */}
            <div className="flex items-center gap-2.5 min-w-[180px] flex-1 max-w-[230px]">
              <Layers className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <label htmlFor="nexus-spread" className="text-[11px] font-medium text-slate-300 whitespace-nowrap">
                Spread
              </label>
              <input
                id="nexus-spread"
                type="range"
                min={0}
                max={1}
                step={0.02}
                value={explodeFactor}
                onChange={(e) => setExplodeFactor(parseFloat(e.target.value))}
                className="w-full accent-[#D85D27] cursor-pointer"
              />
            </div>

            {/* Finish Swatches */}
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-medium text-slate-400 whitespace-nowrap">Finish</span>
              {(Object.keys(FINISH_COLORS) as FinishPreset[]).map((key) => {
                const hex = `#${FINISH_COLORS[key].primary.toString(16).padStart(6, '0')}`;
                return (
                  <button
                    key={key}
                    type="button"
                    title={FINISH_COLORS[key].label}
                    aria-label={FINISH_COLORS[key].label}
                    onClick={() => setFinish(key)}
                    className={`w-6 h-6 rounded-full border-2 transition-transform cursor-pointer ${
                      finish === key ? 'border-white scale-110' : 'border-white/25 hover:scale-105'
                    }`}
                    style={{ backgroundColor: hex }}
                  />
                );
              })}
            </div>

            {/* Motion & Reset */}
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => setPaused((p) => !p)}
                className="px-2.5 py-1.5 rounded-lg bg-white/8 hover:bg-white/14 text-xs font-medium text-slate-200 cursor-pointer whitespace-nowrap shrink-0"
              >
                {paused ? 'Resume Orbit' : 'Pause Orbit'}
              </button>
              <button
                type="button"
                onClick={() => {
                  setExplodeFactor(0.18);
                  triggerPreset('overview');
                }}
                aria-label="Reset 3D View"
                className="p-1.5 rounded-lg bg-white/8 hover:bg-white/14 text-slate-200 cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
