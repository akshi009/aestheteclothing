import { Suspense, useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Environment, ContactShadows, Html } from "@react-three/drei";
import * as THREE from "three";
import { RotateCw, ZoomIn, Maximize2 } from "lucide-react";

type Props = {
  color?: string;
  label?: string;
};

function GarmentMesh({ color = "#1a1a1a", autoRotate }: { color?: string; autoRotate: boolean }) {
  const group = useRef<THREE.Group>(null);

  useFrame((_, delta) => {
    if (autoRotate && group.current) {
      group.current.rotation.y += delta * 0.35;
    }
  });

  // Stylized mannequin / garment composed of primitives —
  // gives a believable rotatable "product" without an external GLTF asset.
  return (
    <group ref={group} position={[0, -0.6, 0]}>
      {/* Body / torso */}
      <mesh castShadow position={[0, 1.1, 0]}>
        <capsuleGeometry args={[0.55, 1.1, 12, 24]} />
        <meshPhysicalMaterial
          color={color}
          roughness={0.55}
          clearcoat={0.15}
          sheen={1}
          sheenColor={new THREE.Color(color).lerp(new THREE.Color("#ffffff"), 0.25)}
        />
      </mesh>
      {/* Shoulders */}
      <mesh castShadow position={[0, 1.55, 0]}>
        <sphereGeometry args={[0.62, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2]} />
        <meshPhysicalMaterial color={color} roughness={0.5} sheen={1} />
      </mesh>
      {/* Sleeves */}
      {[-1, 1].map((s) => (
        <mesh key={s} castShadow position={[s * 0.7, 1.15, 0]} rotation={[0, 0, s * 0.18]}>
          <capsuleGeometry args={[0.18, 1.05, 8, 16]} />
          <meshPhysicalMaterial color={color} roughness={0.55} sheen={1} />
        </mesh>
      ))}
      {/* Collar */}
      <mesh castShadow position={[0, 1.85, 0]}>
        <torusGeometry args={[0.22, 0.06, 16, 32]} />
        <meshStandardMaterial color={new THREE.Color(color).offsetHSL(0, 0, -0.05)} roughness={0.4} />
      </mesh>
      {/* Neck */}
      <mesh castShadow position={[0, 2.0, 0]}>
        <cylinderGeometry args={[0.16, 0.18, 0.25, 24]} />
        <meshStandardMaterial color="#d9c8b3" roughness={0.8} />
      </mesh>
      {/* Head */}
      <mesh castShadow position={[0, 2.35, 0]}>
        <sphereGeometry args={[0.28, 32, 32]} />
        <meshStandardMaterial color="#e6d4bd" roughness={0.7} />
      </mesh>
      {/* Hem flare */}
      <mesh castShadow position={[0, 0.45, 0]}>
        <cylinderGeometry args={[0.7, 0.85, 0.25, 32, 1, true]} />
        <meshPhysicalMaterial color={color} roughness={0.55} sheen={1} side={THREE.DoubleSide} />
      </mesh>
    </group>
  );
}

function Loader() {
  return (
    <Html center>
      <div className="text-[10px] tracking-[0.2em] uppercase text-ink-soft">Loading model…</div>
    </Html>
  );
}

export function Product3DViewer({ color = "#222222", label = "Click and drag to rotate" }: Props) {
  const [autoRotate, setAutoRotate] = useState(true);
  const controlsRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleZoom = (delta: number) => {
    if (controlsRef.current) {
      const c = controlsRef.current;
      const dir = new THREE.Vector3();
      c.object.getWorldDirection(dir);
      c.object.position.addScaledVector(dir, delta);
      c.update();
    }
  };

  const handleFullscreen = () => {
    const el = containerRef.current;
    if (!el) return;
    if (document.fullscreenElement) document.exitFullscreen();
    else el.requestFullscreen?.();
  };

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full bg-surface-dim rounded-sm overflow-hidden"
    >
      <Canvas
        shadows
        camera={{ position: [0, 1.4, 4.2], fov: 35 }}
        dpr={[1, 2]}
        gl={{ antialias: true, alpha: true }}
      >
        <color attach="background" args={["#f1efe9"]} />
        <ambientLight intensity={0.4} />
        <directionalLight
          position={[3, 5, 4]}
          intensity={1.1}
          castShadow
          shadow-mapSize-width={1024}
          shadow-mapSize-height={1024}
        />
        <directionalLight position={[-4, 2, -2]} intensity={0.35} color="#cfd6e6" />

        <Suspense fallback={<Loader />}>
          <GarmentMesh color={color} autoRotate={autoRotate} />
          <ContactShadows
            position={[0, -0.61, 0]}
            opacity={0.45}
            scale={6}
            blur={2.4}
            far={3}
          />
          <Environment preset="studio" />
        </Suspense>

        <OrbitControls
          ref={controlsRef}
          enablePan={false}
          minDistance={2.5}
          maxDistance={6.5}
          minPolarAngle={Math.PI / 3.2}
          maxPolarAngle={Math.PI / 1.9}
          onStart={() => setAutoRotate(false)}
        />
      </Canvas>

      {autoRotate && (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <div className="glass rounded-full px-6 py-3 flex items-center gap-3 shadow-lg">
            <RotateCw className="w-4 h-4 animate-spin-slow" />
            <span className="text-[10px] tracking-[0.2em] uppercase">{label}</span>
          </div>
        </div>
      )}

      <div className="absolute bottom-4 right-4 flex gap-2">
        <button
          onClick={() => handleZoom(0.4)}
          aria-label="Zoom in"
          className="w-10 h-10 rounded-full glass border border-hairline flex items-center justify-center hover:border-primary transition"
        >
          <ZoomIn className="w-4 h-4" />
        </button>
        <button
          onClick={handleFullscreen}
          aria-label="Fullscreen"
          className="w-10 h-10 rounded-full glass border border-hairline flex items-center justify-center hover:border-primary transition"
        >
          <Maximize2 className="w-4 h-4" />
        </button>
      </div>

      <div className="absolute top-4 left-4">
        <button
          onClick={() => setAutoRotate((v) => !v)}
          className="glass border border-hairline rounded-full px-4 py-2 text-[10px] tracking-[0.2em] uppercase hover:border-primary transition"
        >
          {autoRotate ? "Pause Rotation" : "Auto Rotate"}
        </button>
      </div>
    </div>
  );
}
