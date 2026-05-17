"use client";

import { Canvas } from "@react-three/fiber";
import { OrbitControls, Environment, useGLTF } from "@react-three/drei";
import { Suspense } from "react";

function Model({ url }: { url: string }) {
  const { scene } = useGLTF(url, true);
  return <primitive object={scene.clone()} />;
}

function LoadingFallback() {
  return (
    <mesh>
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial color="#e5e7eb" wireframe />
    </mesh>
  );
}

interface Props {
  url: string;
  className?: string;
}

export default function ModelPreview({ url, className = "" }: Props) {
  if (!url || url === "/placeholder.glb" || url === "") {
    return (
      <div className={`flex items-center justify-center bg-gray-100 rounded-xl ${className}`}>
        <svg className="w-10 h-10 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
        </svg>
      </div>
    );
  }

  return (
    <div className={`bg-gray-100 rounded-xl overflow-hidden ${className}`}>
      <Canvas
        camera={{ position: [2, 1.5, 2], fov: 40 }}
        gl={{ preserveDrawingBuffer: true, antialias: true }}
        style={{ background: "#f3f4f6" }}
      >
        <Suspense fallback={null}>
          <ambientLight intensity={0.7} />
          <directionalLight position={[3, 5, 3]} intensity={1} />
          <Model url={url} />
          <OrbitControls enableZoom enablePan={false} autoRotate autoRotateSpeed={1.5} />
          <Environment preset="apartment" />
        </Suspense>
      </Canvas>
    </div>
  );
}
