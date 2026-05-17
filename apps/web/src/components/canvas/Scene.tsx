"use client";

import { useRef, useCallback } from "react";
import { Canvas, useThree } from "@react-three/fiber";
import { Physics } from "@react-three/rapier";
import { Environment, PerspectiveCamera, OrbitControls } from "@react-three/drei";
import { Suspense } from "react";
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
        const halfL = length / 2;
        const halfW = width / 2;
        const margin = 0.5;
        const x = Math.max(margin, Math.min(length - margin, hit.x));
        const z = Math.max(margin, Math.min(width - margin, hit.z));
        moveItem(selectedItemId, [x, 0.5, z]);
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

export default function Scene() {
  return (
    <div className="absolute inset-0">
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
        <Suspense fallback={null}>
          <Physics gravity={[0, -9.81, 0]} debug={false}>
            <SceneContent />
          </Physics>
        </Suspense>
      </Canvas>
    </div>
  );
}
