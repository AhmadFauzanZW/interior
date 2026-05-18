"use client";

import { useRef, useState, useEffect, useMemo, Suspense } from "react";
import { Html, useGLTF } from "@react-three/drei";
import { useCanvasStore, PlacedItem } from "@/stores/canvas-store";
import { useUIStore } from "@/stores/ui-store";
import * as THREE from "three";

interface Props {
  item: PlacedItem;
}

function getVisualSize(dimensions: Props["item"]["dimensions"]) {
  return {
    width: Math.max(dimensions?.width ?? 0.6, 0.24),
    height: Math.max(dimensions?.height ?? 0.8, 0.12),
    depth: Math.max(dimensions?.depth ?? 0.6, 0.24),
  };
}

// Model loads GLB, computes bounding box, and auto-scales
// This component can suspend without affecting Rapier physics
function Model({
  url,
  colorHex,
  dimensions,
  hovered,
  isSelected,
}: {
  url: string;
  colorHex: string | null;
  dimensions: { width: number; height: number; depth: number } | null;
  hovered: boolean;
  isSelected: boolean;
}) {
  const { scene } = useGLTF(url, true);
  const cloned = useMemo(() => scene.clone(), [scene]);

  const { modelScale, modelOffset, scaledSize } = useMemo(() => {
    const box = new THREE.Box3().setFromObject(cloned);
    const size = box.getSize(new THREE.Vector3());
    const center = box.getCenter(new THREE.Vector3());
    const nativeMax = Math.max(size.x, size.y, size.z);
    if (nativeMax < 0.01) {
      return {
        modelScale: 1,
        modelOffset: new THREE.Vector3(),
        scaledSize: new THREE.Vector3(0.3, 0.3, 0.3),
      };
    }

    const scale = dimensions
      ? Math.max(dimensions.width, dimensions.height, dimensions.depth) / nativeMax
      : 1 / nativeMax;

    return {
      modelScale: scale,
      modelOffset: new THREE.Vector3(
        -center.x * scale,
        -box.min.y * scale + 0.01,
        -center.z * scale
      ),
      scaledSize: size.multiplyScalar(scale),
    };
  }, [cloned, dimensions]);

  const visualSize = useMemo(() => ({
    width: Math.max(scaledSize.x, 0.24),
    height: Math.max(scaledSize.y, 0.06),
    depth: Math.max(scaledSize.z, 0.24),
  }), [scaledSize]);

  const footprint = useMemo(() => ({
    width: visualSize.width * 0.98,
    depth: visualSize.depth * 0.98,
  }), [visualSize]);

  const selectionBounds = useMemo(() => {
    const padding = Math.min(Math.max(Math.max(visualSize.width, visualSize.depth) * 0.06, 0.04), 0.1);
    const heightPadding = Math.max(visualSize.height * 0.16, 0.035);

    return {
      width: visualSize.width + padding,
      depth: visualSize.depth + padding,
      height: visualSize.height + heightPadding,
      y: (visualSize.height + heightPadding) / 2 + 0.004,
    };
  }, [visualSize]);

  const isLowProfile = useMemo(() => {
    return visualSize.height < 0.18 || visualSize.height < Math.min(visualSize.width, visualSize.depth) * 0.22;
  }, [visualSize]);

  const contactFootprint = useMemo(() => {
    if (!isLowProfile) return null;

    return {
      width: footprint.width * 0.94,
      depth: footprint.depth * 0.94,
      y: 0.003,
    };
  }, [footprint, isLowProfile]);

  useEffect(() => {
    cloned.traverse((child) => {
      if (!(child as THREE.Mesh).isMesh) return;

      const mesh = child as THREE.Mesh;
      mesh.castShadow = true;
      mesh.receiveShadow = true;

      const materials = Array.isArray(mesh.material)
        ? mesh.material
        : [mesh.material];

      materials.forEach((material) => {
        if (!(material instanceof THREE.Material)) return;
        material.side = THREE.DoubleSide;

        if (colorHex && material instanceof THREE.MeshStandardMaterial) {
          material.color.set(colorHex);
        } else if (material instanceof THREE.MeshStandardMaterial) {
          const avgColor = (material.color.r + material.color.g + material.color.b) / 3;
          if (avgColor > 0.82) {
            material.color.multiplyScalar(0.88);
          }
        }

        material.needsUpdate = true;
      });
    });
  }, [cloned, colorHex]);

  return (
    <group position={[modelOffset.x, modelOffset.y, modelOffset.z]}>
      {contactFootprint && (
        <mesh position={[0, contactFootprint.y, 0]} rotation={[-Math.PI / 2, 0, 0]} renderOrder={-1}>
          <planeGeometry args={[contactFootprint.width, contactFootprint.depth]} />
          <meshBasicMaterial color="#9d7c58" transparent opacity={0.2} depthWrite={false} />
        </mesh>
      )}
      <primitive object={cloned} scale={modelScale} />

      {isSelected && (
        <>
          <mesh position={[0, 0.006, 0]} rotation={[-Math.PI / 2, 0, 0]} renderOrder={1}>
            <planeGeometry args={[selectionBounds.width, selectionBounds.depth]} />
            <meshBasicMaterial color="#4F46E5" transparent opacity={0.12} depthTest={false} />
          </mesh>
          <mesh position={[0, selectionBounds.y, 0]} renderOrder={1}>
            <boxGeometry args={[selectionBounds.width, selectionBounds.height, selectionBounds.depth]} />
            <meshBasicMaterial color="#4F46E5" transparent opacity={0.18} depthTest={false} wireframe />
          </mesh>
        </>
      )}

      {hovered && !isSelected && (
        <mesh position={[0, 0.004, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[selectionBounds.width, selectionBounds.depth]} />
          <meshBasicMaterial color="#818cf8" transparent opacity={0.08} depthWrite={false} />
        </mesh>
      )}
    </group>
  );
}

export default function PlacedFurniture({ item }: Props) {
  const [hovered, setHovered] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);
  const [loading, setLoading] = useState(true);
  const selectItem = useCanvasStore((s) => s.selectItem);
  const selectedItemId = useCanvasStore((s) => s.selectedItemId);
  const setLoadingProductId = useUIStore((s) => s.setLoadingProductId);
  const isSelected = selectedItemId === item.instanceId;

  const hasModel = item.glbUrl && item.glbUrl !== "/placeholder.glb" && item.glbUrl !== "";
  const fallbackSize = useMemo(() => getVisualSize(item.dimensions), [item.dimensions]);

  useEffect(() => {
    if (!hasModel) {
      setLoading(false);
      return;
    }
    const timer = setTimeout(() => setLoading(false), 600);
    return () => clearTimeout(timer);
  }, [hasModel]);

  useEffect(() => {
    setLoadingProductId(loading ? item.productId : null);
  }, [loading, item.productId, setLoadingProductId]);

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

  return (
    <group
      position={item.position}
      rotation={item.rotation as any}
    >
      <group
        onClick={(e) => {
          e.stopPropagation();
          selectItem(isSelected ? null : item.instanceId);
        }}
        onPointerOver={handlePointerOver}
        onPointerOut={handlePointerOut}
      >
        {loading && hasModel && (
          <Html center position={[0, 0.5, 0]}>
            <div className="flex items-center gap-2 glass px-3 py-2 text-sm whitespace-nowrap">
              <svg className="animate-spin h-4 w-4 text-[var(--color-accent)]" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              {item.name}
            </div>
          </Html>
        )}

        {hasModel ? (
          <Suspense fallback={
            <mesh castShadow>
              <boxGeometry args={[0.6, 0.8, 0.6]} />
              <meshStandardMaterial color="#c0b8a8" wireframe />
            </mesh>
          }>
            <Model
              url={item.glbUrl}
              colorHex={item.colorHex}
              dimensions={item.dimensions}
              hovered={hovered}
              isSelected={isSelected}
            />
          </Suspense>
        ) : (
          <mesh castShadow>
            <boxGeometry args={[0.6, 0.8, 0.6]} />
            <meshStandardMaterial color="#c0b8a8" wireframe />
          </mesh>
        )}

        {isSelected && !hasModel && (
          <>
            <mesh position={[0, 0.006, 0]} rotation={[-Math.PI / 2, 0, 0]} renderOrder={1}>
              <planeGeometry args={[fallbackSize.width + 0.08, fallbackSize.depth + 0.08]} />
              <meshBasicMaterial color="#4F46E5" transparent opacity={0.12} depthTest={false} />
            </mesh>
            <mesh position={[0, fallbackSize.height / 2 + 0.02, 0]} renderOrder={1}>
              <boxGeometry args={[fallbackSize.width + 0.08, fallbackSize.height + 0.04, fallbackSize.depth + 0.08]} />
              <meshBasicMaterial color="#4F46E5" transparent opacity={0.18} depthTest={false} wireframe />
            </mesh>
          </>
        )}

        {hovered && !isSelected && !hasModel && (
          <mesh position={[0, 0.004, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            <planeGeometry args={[fallbackSize.width + 0.08, fallbackSize.depth + 0.08]} />
            <meshBasicMaterial color="#818cf8" transparent opacity={0.08} depthWrite={false} />
          </mesh>
        )}
      </group>

      {showTooltip && !isSelected && (
        <Html center position={[0, 1, 0]} style={{ pointerEvents: "none" }}>
          <div className="glass-dark px-3 py-1.5 text-sm whitespace-nowrap">
            <p className="font-medium">{item.name}</p>
            <p className="text-emerald-400 text-xs">Rp {item.price.toLocaleString("id-ID")}</p>
          </div>
        </Html>
      )}
    </group>
  );
}
