"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useCanvasStore } from "@/stores/canvas-store";

export default function ActionBar() {
  const selectedItemId = useCanvasStore((s) => s.selectedItemId);
  const placedItems = useCanvasStore((s) => s.placedItems);
  const removeItem = useCanvasStore((s) => s.removeItem);
  const rotateItem = useCanvasStore((s) => s.rotateItem);
  const selectItem = useCanvasStore((s) => s.selectItem);

  const selectedItem = placedItems.find((i) => i.instanceId === selectedItemId);

  function handleDelete() {
    if (selectedItemId) {
      removeItem(selectedItemId);
    }
  }

  function handleRotate() {
    if (selectedItem) {
      const [, y] = selectedItem.rotation;
      const newRotation: [number, number, number] = [0, y + Math.PI / 4, 0];
      rotateItem(selectedItem.instanceId, newRotation);
    }
  }

  return (
    <AnimatePresence>
      {selectedItem && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          className="absolute bottom-6 left-1/2 -translate-x-1/2 z-40 glass-dark px-4 py-3 flex items-center gap-3 shadow-2xl"
        >
          <div className="text-sm font-medium text-white pr-3 border-r border-white/10">
            {selectedItem.name}
          </div>

          <button
            onClick={handleRotate}
            className="p-2 rounded-lg hover:bg-white/10 transition-colors text-white/80"
            title="Putar 45°"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              />
            </svg>
          </button>

          <button
            onClick={handleDelete}
            className="p-2 rounded-lg hover:bg-red-500/20 transition-colors text-red-400"
            title="Hapus"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
              />
            </svg>
          </button>

          <button
            onClick={() => selectItem(null)}
            className="p-2 rounded-lg hover:bg-white/10 transition-colors text-white/60"
            title="Tutup"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
