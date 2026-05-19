"use client";

import { useRef, useCallback, Component, Suspense, type ReactNode } from "react";
import { Canvas, useThree } from "@react-three/fiber";
import { Environment, PerspectiveCamera, OrbitControls, useProgress } from "@react-three/drei";
import { Physics } from "@react-three/rapier";
import * as THREE from "three";
import Room from "./Room";
import PlacedFurniture from "./PlacedFurniture";
import { useCanvasStore } from "@/stores/canvas-store";
import { useRoomStore } from "@/stores/room-store";

function FloorClickHandler() {
  const { camera, raycaster, gl } = useThree();
  const selectedItemId = useCanvasStore((s) => s.selectedItemId);
  const moveItem = useCanvasStore((s) => s.moveItem);
  const { length, width } = useRoomStore();
  const mouse = useRef(new THREE.Vector2());
  const plane = useRef(new THREE.Plane(new THREE.Vector3(0, 1, 0), 0));

  const handleClick = useCallback(
    (e: any) => {
      if (!selectedItemId) return;

      mouse.current.x = (e.clientX / gl.domElement.clientWidth) * 2 - 1;
      mouse.current.y = -(e.clientY / gl.domElement.clientHeight) * 2 + 1;

      raycaster.setFromCamera(mouse.current, camera);
      const point = new THREE.Vector3();
      const hit = raycaster.ray.intersectPlane(plane.current, point);

      if (hit) {
        const margin = 0.5;
        const x = Math.max(margin, Math.min(length - margin, hit.x));
        const z = Math.max(margin, Math.min(width - margin, hit.z));
        moveItem(selectedItemId, [x, 0, z]);
      }
    },
    [selectedItemId, camera, raycaster, gl, length, width, moveItem]
  );

  return (
    <mesh
      position={[length / 2, 0.005, width / 2]}
      rotation={[-Math.PI / 2, 0, 0]}
      onClick={handleClick}
      visible={false}
    >
      <planeGeometry args={[length, width]} />
      <meshBasicMaterial transparent opacity={0} />
    </mesh>
  );
}

function SceneContent() {
  const placedItems = useCanvasStore((s) => s.placedItems);
  const selectedItemId = useCanvasStore((s) => s.selectedItemId);
  const { length, width } = useRoomStore();

  return (
    <>
      <PerspectiveCamera
        makeDefault
        position={[length / 2, Math.max(length, width) * 0.7, width / 2 + 4]}
        fov={50}
        near={0.1}
        far={100}
      />
      <OrbitControls
        target={[length / 2, 0, width / 2]}
        maxPolarAngle={Math.PI / 2.2}
        minDistance={2}
        maxDistance={20}
        enableDamping
        dampingFactor={0.08}
        enabled={!selectedItemId}
      />

      <ambientLight intensity={0.6} />
      <directionalLight
        position={[5, 8, 5]}
        intensity={1.2}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-far={30}
        shadow-camera-left={-10}
        shadow-camera-right={10}
        shadow-camera-top={10}
        shadow-camera-bottom={-10}
      />
      <hemisphereLight args={["#faf9f6", "#b0a8a0", 0.5]} />

      <Room />

      {placedItems.map((item) => (
        <PlacedFurniture key={item.instanceId} item={item} />
      ))}

      <FloorClickHandler />

      <Environment preset="apartment" />
    </>
  );
}

class ErrorBoundary extends Component<
  { children: ReactNode; fallback?: ReactNode },
  { hasError: boolean }
> {
  constructor(props: { children: ReactNode; fallback?: ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError() {
    return { hasError: true };
  }
  render() {
    if (this.state.hasError) {
      return (
        this.props.fallback || (
          <div className="absolute inset-0 flex items-center justify-center bg-[color:var(--color-background)]">
            <p className="text-sm text-[var(--color-text-secondary)]">
              Gagal memuat aset 3D
            </p>
          </div>
        )
      );
    }
    return this.props.children;
  }
}

function LoaderOverlay() {
  const { progress, active } = useProgress();
  if (!active) return null;
  return (
    <div className="absolute inset-0 flex items-center justify-center bg-[color:var(--color-background)] z-50">
      <div className="text-center">
        <div className="w-32 h-1.5 bg-gray-200 rounded-full overflow-hidden mx-auto mb-2">
          <div
            className="h-full bg-[var(--color-accent)] rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
        <p className="text-xs text-[var(--color-text-secondary)]">
          Memuat aset 3D... {Math.round(progress)}%
        </p>
      </div>
    </div>
  );
}

export default function Scene() {
  return (
    <div className="absolute inset-0">
      <LoaderOverlay />
      <Canvas
        shadows
        gl={{
          antialias: true,
          toneMapping: THREE.ACESFilmicToneMapping,
          toneMappingExposure: 1.1,
        }}
        style={{ background: "linear-gradient(to bottom, #f0efe9, #e8e5df)" }}
        onCreated={({ gl }) => {
          gl.setClearColor(new THREE.Color("#f0efe9"));
        }}
      >
        <ErrorBoundary>
          <Suspense fallback={null}>
            <Physics
              gravity={[0, -9.81, 0]}
              colliders={false}
              timeStep="vary"
            >
              <SceneContent />
            </Physics>
          </Suspense>
        </ErrorBoundary>
      </Canvas>
    </div>
  );
}
