"use client";

import { useRef, useState, useEffect, useMemo } from "react";
import { useThree } from "@react-three/fiber";
import { RigidBody } from "@react-three/rapier";
import { Html, useGLTF } from "@react-three/drei";
import { useCanvasStore, PlacedItem } from "@/stores/canvas-store";
import { useUIStore } from "@/stores/ui-store";
import * as THREE from "three";

interface Props {
  item: PlacedItem;
}

function Model({ url, colorHex, targetScale }: { url: string; colorHex: string | null; targetScale: number }) {
  const { scene } = useGLTF(url, true);
  const cloned = useMemo(() => scene.clone(), [scene]);

  useEffect(() => {
    if (colorHex) {
      cloned.traverse((child) => {
        if ((child as THREE.Mesh).isMesh) {
          const mat = (child as THREE.Mesh).material as THREE.MeshStandardMaterial;
          if (Array.isArray(mat)) return;
          mat.color.set(colorHex);
        }
      });
    }
  }, [cloned, colorHex]);

  return <primitive object={cloned} scale={targetScale} />;
}

export default function PlacedFurniture({ item }: Props) {
  const [hovered, setHovered] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);
  const [loading, setLoading] = useState(true);
  const selectItem = useCanvasStore((s) => s.selectItem);
  const selectedItemId = useCanvasStore((s) => s.selectedItemId);
  const setLoadingProductId = useUIStore((s) => s.setLoadingProductId);
  const isSelected = selectedItemId === item.instanceId;
  const bodyRef = useRef<any>(null);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 2000);
    return () => clearTimeout(timer);
  }, [item.instanceId]);

  useEffect(() => {
    if (!loading) setLoadingProductId(null);
  }, [loading, setLoadingProductId]);

  // Calculate model scale from stored dimensions
  // Default model bounding box: ~1m cube; scale to match stored dimensions
  const scale = useMemo(() => {
    if (!item.dimensions) return 1;
    // Use the largest dimension as reference for uniform scaling
    const maxDim = Math.max(item.dimensions.width, item.dimensions.height, item.dimensions.depth);
    // Assume base model is ~1 unit, scale to match
    return maxDim;
  }, [item.dimensions]);

  const tooltipDelay = useRef<ReturnType<typeof setTimeout>>(undefined);
  const handlePointerOver = () => {
    setHovered(true);
    tooltipDelay.current = setTimeout(() => setShowTooltip(true), 300);
  };
  const handlePointerOut = () => {
    setHovered(false);
    setShowTooltip(false);
    clearTimeout(tooltipDelay.current);
  };

  const hasModel = item.glbUrl && item.glbUrl !== "/placeholder.glb" && item.glbUrl !== "";

  return (
    <RigidBody
      ref={bodyRef}
      type={isSelected ? "dynamic" : "dynamic"}
      colliders="hull"
      position={item.position}
      rotation={item.rotation as any}
      mass={5}
      linearDamping={0.9}
      angularDamping={0.9}
      lockRotations
      scale={scale}
    >
      <group
        onClick={(e) => {
          e.stopPropagation();
          selectItem(isSelected ? null : item.instanceId);
        }}
        onPointerOver={handlePointerOver}
        onPointerOut={handlePointerOut}
      >
        {/* Loading spinner */}
        {loading && hasModel && (
          <Html center position={[0, 0.5 / scale, 0]}>
            <div className="flex items-center gap-2 glass px-3 py-2 text-sm whitespace-nowrap">
              <svg className="animate-spin h-4 w-4 text-[var(--color-accent)]" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              {item.name}
            </div>
          </Html>
        )}

        {/* 3D Model */}
        {hasModel ? (
          <Model url={item.glbUrl} colorHex={item.colorHex} targetScale={1} />
        ) : (
          <mesh castShadow>
            <boxGeometry args={[0.6, 0.8, 0.6]} />
            <meshStandardMaterial color="#c0b8a8" wireframe />
          </mesh>
        )}

        {/* Selection indicator ring */}
        {isSelected && (
          <>
            <mesh position={[0, -0.01, 0]} rotation={[-Math.PI / 2, 0, 0]} renderOrder={1}>
              <ringGeometry args={[0.45, 0.5, 64]} />
              <meshBasicMaterial color="#4F46E5" transparent opacity={0.6} depthTest={false} />
            </mesh>
            <mesh renderOrder={1}>
              <boxGeometry args={[1.1, 1.15, 1.1]} />
              <meshBasicMaterial color="#4F46E5" transparent opacity={0.1} depthTest={false} wireframe />
            </mesh>
            {/* Pulses */}
            <mesh position={[0, 0, 0]} renderOrder={-1}>
              <cylinderGeometry args={[0.55, 0.55, 0.02, 64]} />
              <meshBasicMaterial color="#818cf8" transparent opacity={0.15} />
            </mesh>
          </>
        )}

        {/* Hover glow */}
        {hovered && !isSelected && hasModel && (
          <mesh>
            <boxGeometry args={[1.15, 1.2, 1.15]} />
            <meshBasicMaterial color="#818cf8" transparent opacity={0.08} depthWrite={false} />
          </mesh>
        )}
      </group>

      {/* Tooltip */}
      {showTooltip && !isSelected && (
        <Html center position={[0, 1 / scale, 0]} style={{ pointerEvents: "none" }}>
          <div className="glass-dark px-3 py-1.5 text-sm whitespace-nowrap">
            <p className="font-medium">{item.name}</p>
            <p className="text-emerald-400 text-xs">Rp {item.price.toLocaleString("id-ID")}</p>
          </div>
        </Html>
      )}
    </RigidBody>
  );
}
