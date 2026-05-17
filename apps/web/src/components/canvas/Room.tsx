"use client";

import { useRoomStore } from "@/stores/room-store";
import { RigidBody } from "@react-three/rapier";
import { useMemo } from "react";
import * as THREE from "three";

function Wall({
  position,
  size,
  rotation,
}: {
  position: [number, number, number];
  size: [number, number, number];
  rotation?: [number, number, number];
}) {
  return (
    <RigidBody type="fixed" colliders="cuboid" position={position} rotation={rotation}>
      <mesh receiveShadow castShadow>
        <boxGeometry args={size} />
        <meshStandardMaterial color="#e8e4de" roughness={0.85} metalness={0.02} />
      </mesh>
    </RigidBody>
  );
}

export default function Room() {
  const { length, width, wallHeight, wallThickness } = useRoomStore();

  const floorMaterial = useMemo(
    () => new THREE.MeshStandardMaterial({
      color: "#d4c9b8",
      roughness: 0.6,
      metalness: 0.05,
    }),
    []
  );

  const halfThickness = wallThickness / 2;
  const halfLength = length / 2;
  const halfWidth = width / 2;
  const halfHeight = wallHeight / 2;

  return (
    <group>
      {/* Floor */}
      <RigidBody type="fixed" colliders="cuboid">
        <mesh
          rotation={[-Math.PI / 2, 0, 0]}
          position={[halfLength, -0.01, halfWidth]}
          receiveShadow
        >
          <planeGeometry args={[length + 0.1, width + 0.1]} />
          <primitive object={floorMaterial} attach="material" />
        </mesh>
      </RigidBody>

      {/* Wall - Back (z = 0) */}
      <Wall
        position={[halfLength, halfHeight, -halfThickness]}
        size={[length + wallThickness * 2, wallHeight, wallThickness]}
      />

      {/* Wall - Front (z = width) */}
      <Wall
        position={[halfLength, halfHeight, width + halfThickness]}
        size={[length + wallThickness * 2, wallHeight, wallThickness]}
      />

      {/* Wall - Left (x = 0) */}
      <Wall
        position={[-halfThickness, halfHeight, halfWidth]}
        size={[wallThickness, wallHeight, width]}
      />

      {/* Wall - Right (x = length) */}
      <Wall
        position={[length + halfThickness, halfHeight, halfWidth]}
        size={[wallThickness, wallHeight, width]}
      />

      {/* Floor grid lines for visual reference */}
      <gridHelper
        args={[Math.max(length, width) + 2, Math.floor(Math.max(length, width)) + 2, "#c0b8a8", "#c0b8a8"]}
        position={[halfLength, 0.001, halfWidth]}
      />
    </group>
  );
}
