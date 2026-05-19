"use client";

import { useRoomStore } from "@/stores/room-store";
import { useMemo } from "react";
import { RigidBody } from "@react-three/rapier";
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
    <mesh position={position} rotation={rotation} receiveShadow castShadow>
      <boxGeometry args={size} />
      <meshStandardMaterial color="#e8e4de" roughness={0.85} metalness={0.02} />
    </mesh>
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
      {/* Floor — thin cuboid collider so physics can catch items */}
      <RigidBody type="fixed" colliders="cuboid">
        <mesh
          position={[halfLength, -0.025, halfWidth]}
          receiveShadow
        >
          <boxGeometry args={[length + 0.1, 0.05, width + 0.1]} />
          <primitive object={floorMaterial} attach="material" />
        </mesh>
      </RigidBody>

      {/* Walls — each wrapped in a collider so furniture bounces off them */}
      <RigidBody type="fixed" colliders="cuboid">
        <Wall
          position={[halfLength, halfHeight, -halfThickness]}
          size={[length + wallThickness * 2, wallHeight, wallThickness]}
        />
      </RigidBody>

      <RigidBody type="fixed" colliders="cuboid">
        <Wall
          position={[halfLength, halfHeight, width + halfThickness]}
          size={[length + wallThickness * 2, wallHeight, wallThickness]}
        />
      </RigidBody>

      <RigidBody type="fixed" colliders="cuboid">
        <Wall
          position={[-halfThickness, halfHeight, halfWidth]}
          size={[wallThickness, wallHeight, width]}
        />
      </RigidBody>

      <RigidBody type="fixed" colliders="cuboid">
        <Wall
          position={[length + halfThickness, halfHeight, halfWidth]}
          size={[wallThickness, wallHeight, width]}
        />
      </RigidBody>

      {/* Floor grid lines for visual reference */}
      <gridHelper
        args={[Math.max(length, width) + 2, Math.floor(Math.max(length, width)) + 2, "#c0b8a8", "#c0b8a8"]}
        position={[halfLength, 0.001, halfWidth]}
      />
    </group>
  );
}
