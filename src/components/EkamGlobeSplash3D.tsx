import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { motion, AnimatePresence } from 'motion/react';
import { EkamWordmark } from './EkamBrand';

interface EkamGlobeSplash3DProps {
  onFinish: () => void;
  reducedMotion?: boolean;
}

export function EkamGlobeSplash3D({ onFinish, reducedMotion = false }: EkamGlobeSplash3DProps) {
  const mountRef = useRef<HTMLDivElement>(null);
  const [phase, setPhase] = useState<'spark' | 'earth' | 'connecting' | 'reveal' | 'final'>('spark');
  const [showBrand, setShowBrand] = useState(false);
  const startTimeRef = useRef<number>(performance.now());
  const animFrameRef = useRef<number>(0);

  useEffect(() => {
    if (!mountRef.current) return;
    const container = mountRef.current;
    const width = container.clientWidth || window.innerWidth;
    const height = container.clientHeight || window.innerHeight;

    // 1. Scene, Camera & Renderer
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x071426);

    const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 1000);
    camera.position.set(0, 0, 6.2);

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
    } catch {
      renderer = new THREE.WebGLRenderer();
    }
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    // 2. Cinematic Lighting
    const ambientLight = new THREE.AmbientLight(0x0f2b48, 2.8);
    scene.add(ambientLight);

    const sunLight = new THREE.DirectionalLight(0xffffff, 2.4);
    sunLight.position.set(6, 4, 5);
    scene.add(sunLight);

    const orangeRimLight = new THREE.PointLight(0xF26A2E, 4.0, 18);
    orangeRimLight.position.set(-5, -3, 3);
    scene.add(orangeRimLight);

    // 3. Earth Sphere Hero (Occupying 30% screen height)
    const earthGroup = new THREE.Group();
    scene.add(earthGroup);

    const sphereGeo = new THREE.SphereGeometry(0.85, 64, 64);
    const earthMat = new THREE.MeshStandardMaterial({
      roughness: 0.45,
      metalness: 0.3,
      bumpScale: 0.03,
    });

    const textureLoader = new THREE.TextureLoader();
    textureLoader.load(
      '/public/assets/aistudio/image_71aec3e1.png',
      (tex) => {
        tex.wrapS = THREE.RepeatWrapping;
        tex.wrapT = THREE.ClampToEdgeWrapping;
        earthMat.map = tex;
        earthMat.needsUpdate = true;
      },
      undefined,
      () => {
        const canvas = document.createElement('canvas');
        canvas.width = 1024;
        canvas.height = 512;
        const ctx = canvas.getContext('2d')!;
        ctx.fillStyle = '#071829';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        earthMat.map = new THREE.CanvasTexture(canvas);
        earthMat.needsUpdate = true;
      }
    );

    const earthMesh = new THREE.Mesh(sphereGeo, earthMat);
    earthGroup.add(earthMesh);

    // 4. Blue Atmospheric Glow Rim
    const atmosGeo = new THREE.SphereGeometry(0.95, 64, 64);
    const atmosMat = new THREE.ShaderMaterial({
      vertexShader: `
        varying vec3 vNormal;
        void main() {
          vNormal = normalize(normalMatrix * normal);
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        varying vec3 vNormal;
        void main() {
          float intensity = pow(0.55 - dot(vNormal, vec3(0, 0, 1.0)), 2.4);
          gl_FragColor = vec4(0.15, 0.55, 1.0, 1.0) * intensity * 1.8;
        }
      `,
      blending: THREE.AdditiveBlending,
      side: THREE.BackSide,
      transparent: true,
    });
    const atmosMesh = new THREE.Mesh(atmosGeo, atmosMat);
    earthGroup.add(atmosMesh);

    // 5. Global Connection Nodes, Arcs & Outer Constellation Web (Matching reference image)
    const cities = [
      { lat: 40.7128, lon: -74.0060 }, // NY
      { lat: 51.5074, lon: -0.1278 },  // London
      { lat: 25.2048, lon: 55.2708 },  // Dubai
      { lat: 35.6762, lon: 139.6503 }, // Tokyo
      { lat: 1.3521, lon: 103.8198 },  // Singapore
      { lat: -33.8688, lon: 151.2093 },// Sydney
      { lat: 19.0760, lon: 72.8777 },  // Mumbai
      { lat: -23.5505, lon: -46.6333 },// Sao Paulo
    ];

    const latLonToVector3 = (lat: number, lon: number, radius: number) => {
      const phi = (90 - lat) * (Math.PI / 180);
      const theta = (lon + 180) * (Math.PI / 180);
      const x = -(radius * Math.sin(phi) * Math.cos(theta));
      const z = radius * Math.sin(phi) * Math.sin(theta);
      const y = radius * Math.cos(phi);
      return new THREE.Vector3(x, y, z);
    };

    const nodeGeo = new THREE.SphereGeometry(0.02, 16, 16);
    const nodeMat = new THREE.MeshBasicMaterial({ color: 0xFFB45C });
    const nodesGroup = new THREE.Group();

    const cityVectors = cities.map((c) => {
      const v = latLonToVector3(c.lat, c.lon, 0.87);
      const mesh = new THREE.Mesh(nodeGeo, nodeMat);
      mesh.position.copy(v);
      nodesGroup.add(mesh);
      return v;
    });
    earthGroup.add(nodesGroup);

    // Surface Arcs
    const arcsGroup = new THREE.Group();
    const arcMat = new THREE.LineBasicMaterial({ color: 0xF26A2E, transparent: true, opacity: 0.85 });

    for (let i = 0; i < cityVectors.length; i++) {
      for (let j = i + 1; j < cityVectors.length; j++) {
        if (Math.random() > 0.3) {
          const v1 = cityVectors[i];
          const v2 = cityVectors[j];
          const mid = v1.clone().add(v2).multiplyScalar(0.5).normalize().multiplyScalar(1.15);
          const curve = new THREE.QuadraticBezierCurve3(v1, mid, v2);
          const points = curve.getPoints(60);
          const geom = new THREE.BufferGeometry().setFromPoints(points);
          const line = new THREE.Line(geom, arcMat);
          arcsGroup.add(line);
        }
      }
    }
    earthGroup.add(arcsGroup);

    // Outer Space Constellation Web & Nodes (Matching user reference image_71aec3e1.png)
    const outerGroup = new THREE.Group();
    const outerNodeMat = new THREE.MeshBasicMaterial({ color: 0xFFB45C });
    const outerLineMat = new THREE.LineBasicMaterial({ color: 0x268BFF, transparent: true, opacity: 0.55 });

    cityVectors.forEach((v) => {
      // Create 2 outer nodes radiating from each city
      for (let k = 0; k < 2; k++) {
        const dir = v.clone().normalize().add(new THREE.Vector3((Math.random()-0.5)*1.2, (Math.random()-0.5)*1.2, (Math.random()-0.5)*1.2)).normalize();
        const outerPos = dir.multiplyScalar(1.35 + Math.random() * 0.35);
        
        const outerMesh = new THREE.Mesh(nodeGeo, outerNodeMat);
        outerMesh.position.copy(outerPos);
        outerGroup.add(outerMesh);

        // Connect surface city to outer node
        const lineGeom = new THREE.BufferGeometry().setFromPoints([v, outerPos]);
        const outerLine = new THREE.Line(lineGeom, outerLineMat);
        outerGroup.add(outerLine);

        // Interconnect outer nodes
        if (k === 1) {
          const neighborDir = cityVectors[(Math.floor(Math.random() * cityVectors.length))].clone().normalize().multiplyScalar(1.4);
          const interGeom = new THREE.BufferGeometry().setFromPoints([outerPos, neighborDir]);
          const interLine = new THREE.Line(interGeom, outerLineMat);
          outerGroup.add(interLine);
        }
      }
    });
    earthGroup.add(outerGroup);

    // Orbital Rings
    const ringGeo = new THREE.BufferGeometry();
    const ringPoints: THREE.Vector3[] = [];
    for (let i = 0; i <= 100; i++) {
      const theta = (i / 100) * Math.PI * 2;
      ringPoints.push(new THREE.Vector3(Math.cos(theta) * 1.22, Math.sin(theta) * 0.35, Math.sin(theta) * 1.22));
    }
    ringGeo.setFromPoints(ringPoints);
    const ringMat = new THREE.LineBasicMaterial({ color: 0x268BFF, transparent: true, opacity: 0.6 });
    const ring1 = new THREE.Line(ringGeo, ringMat);
    ring1.rotation.x = 0.4;
    earthGroup.add(ring1);

    const ring2 = new THREE.Line(ringGeo, ringMat);
    ring2.rotation.z = -0.5;
    earthGroup.add(ring2);

    // 6. Floating Particles
    const particleCount = 500;
    const particleGeo = new THREE.BufferGeometry();
    const particlePos = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount * 3; i += 3) {
      particlePos[i] = (Math.random() - 0.5) * 14;
      particlePos[i + 1] = (Math.random() - 0.5) * 14;
      particlePos[i + 2] = (Math.random() - 0.5) * 14;
    }
    particleGeo.setAttribute('position', new THREE.BufferAttribute(particlePos, 3));
    const particleMat = new THREE.PointsMaterial({ color: 0x268BFF, size: 0.035, transparent: true, opacity: 0.65 });
    const particleSystem = new THREE.Points(particleGeo, particleMat);
    scene.add(particleSystem);

    // 7. Cinematic Animation Timeline (6 seconds total)
    startTimeRef.current = performance.now();
    const duration = 6200;

    const animateLoop = (now: number) => {
      const elapsed = now - startTimeRef.current;
      const t = Math.min(1, elapsed / duration);

      // Phase transitions
      if (t < 0.15) setPhase('spark');
      else if (t < 0.33) setPhase('earth');
      else if (t < 0.65) setPhase('connecting');
      else if (t < 0.82) {
        setPhase('reveal');
        setShowBrand(true);
      } else {
        setPhase('final');
        setShowBrand(true);
      }

      // Smooth continuous globe rotation
      earthGroup.rotation.y = elapsed * 0.0003;
      particleSystem.rotation.y = elapsed * 0.0001;

      // Camera push-in matching storyboard
      if (t < 0.35) {
        camera.position.z = THREE.MathUtils.lerp(7.2, 5.6, t / 0.35);
      } else if (t > 0.65) {
        camera.position.z = THREE.MathUtils.lerp(5.6, 5.3, (t - 0.65) / 0.35);
      }

      renderer.render(scene, camera);

      if (elapsed >= duration) {
        onFinish();
        return;
      }

      animFrameRef.current = requestAnimationFrame(animateLoop);
    };

    animFrameRef.current = requestAnimationFrame(animateLoop);

    const handleResize = () => {
      if (!mountRef.current || !renderer) return;
      const w = mountRef.current.clientWidth;
      const h = mountRef.current.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animFrameRef.current);
      window.removeEventListener('resize', handleResize);
      if (renderer && renderer.domElement) {
        renderer.dispose();
        container.removeChild(renderer.domElement);
      }
    };
  }, [onFinish]);

  return (
    <div
      onClick={onFinish}
      className="absolute inset-0 bg-[#071426] text-white flex flex-col items-center justify-center overflow-hidden select-none cursor-pointer"
      title="Click to enter app"
    >
      {/* 3D WebGL Canvas Mount with Reanimated-style Cinematic Push-In */}
      <motion.div
        initial={reducedMotion ? { scale: 1 } : { scale: 0.95 }}
        animate={reducedMotion ? { scale: 1 } : { scale: 1.04 }}
        transition={{ duration: 6.2, ease: [0.22, 1, 0.36, 1] }}
        ref={mountRef}
        className="absolute inset-0 z-0"
      />

      {/* Cinematic Vignette */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_35%,rgba(7,20,38,0.82)_85%)] pointer-events-none z-15" />

      {/* Pure Cinematic Brand Reveal Overlay (No Cards, No Buttons, No UI Chrome) */}
      <div className="relative z-25 flex flex-col items-center text-center px-6 pointer-events-none mt-20">
        <AnimatePresence>
          {showBrand && (
            <motion.div
              initial={reducedMotion ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.9, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
              className="flex flex-col items-center drop-shadow-[0_12px_32px_rgba(0,0,0,0.8)]"
            >
              <EkamWordmark light size="lg" animated={!reducedMotion} reducedMotion={reducedMotion} />

              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.25, duration: 0.6 }}
                className="mt-3 text-xs font-bold tracking-[0.32em] uppercase text-sky-400 drop-shadow-[0_2px_8px_rgba(38,139,255,0.6)]"
              >
                EKAM GLOBAL NETWORK
              </motion.div>

              <motion.p
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5, duration: 0.6 }}
                className="mt-2 text-sm font-medium text-slate-200 tracking-wide italic drop-shadow-[0_2px_6px_rgba(0,0,0,0.9)]"
              >
                &ldquo;Connecting Businesses. Creating Opportunities.&rdquo;
              </motion.p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
