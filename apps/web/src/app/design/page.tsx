"use client";

import { useSearchParams } from "next/navigation";
import { Suspense, useCallback } from "react";
import dynamic from "next/dynamic";
import Header from "@/components/ui/Header";
import BudgetTracker from "@/components/ui/BudgetTracker";
import CatalogPanel from "@/components/ui/CatalogPanel";
import ActionBar from "@/components/ui/ActionBar";
import { useRoomStore } from "@/stores/room-store";
import { useCanvasStore } from "@/stores/canvas-store";
import { useUIStore } from "@/stores/ui-store";

const Scene = dynamic(() => import("@/components/canvas/Scene"), {
  ssr: false,
  loading: () => (
    <div className="absolute inset-0 flex items-center justify-center bg-[color:var(--color-background)]">
      <div className="text-center">
        <svg
          className="animate-spin h-8 w-8 text-[var(--color-accent)] mx-auto mb-3"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
            fill="none"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
          />
        </svg>
        <p className="text-[var(--color-text-secondary)] text-sm">
          Memuat kanvas 3D...
        </p>
      </div>
    </div>
  ),
});

function DesignContent() {
  const searchParams = useSearchParams();
  const length = parseFloat(searchParams.get("length") || "5");
  const width = parseFloat(searchParams.get("width") || "4");
  const setDimensions = useRoomStore((s) => s.setDimensions);
  const addItem = useCanvasStore((s) => s.addItem);
  const setLoadingProductId = useUIStore((s) => s.setLoadingProductId);

  setDimensions(length, width);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "copy";
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      try {
        const data = JSON.parse(e.dataTransfer.getData("application/json"));
        if (!data?.id || !data?.name || !data?.basePrice) return;

        setLoadingProductId(data.id);

        const instanceId = crypto.randomUUID();
        const price = Number(data.basePrice);

        const x = 1 + Math.random() * (length - 2);
        const z = 1 + Math.random() * (width - 2);

        addItem({
          instanceId,
          productId: data.id,
          name: data.name,
          price,
          glbUrl: data.glbUrl || "",
          dimensions: data.dimensions || null,
          position: [x, 0.5, z],
          rotation: [0, 0, 0],
          variantId: null,
          colorHex: null,
        });
      } catch {
        // Ignore invalid drops
      }
    },
    [length, width, addItem, setLoadingProductId]
  );

  return (
    <div
      className="relative h-full w-full bg-[var(--color-background)]"
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      <Header roomInfo={`${length}m x ${width}m Ruangan`} />

      <Scene />

      <CatalogPanel />

      <ActionBar />

      <BudgetTracker />
    </div>
  );
}

export default function DesignPage() {
  return (
    <Suspense
      fallback={
        <div className="h-full flex items-center justify-center">Loading...</div>
      }
    >
      <DesignContent />
    </Suspense>
  );
}
