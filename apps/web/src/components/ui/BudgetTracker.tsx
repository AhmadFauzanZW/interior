"use client";

import { motion } from "framer-motion";
import { useCanvasStore } from "@/stores/canvas-store";
import { useEffect, useState, useRef } from "react";

export default function BudgetTracker() {
  const totalPrice = useCanvasStore((s) => s.totalPrice);
  const [displayTotal, setDisplayTotal] = useState(0);
  const prevRef = useRef(0);

  useEffect(() => {
    const from = prevRef.current;
    prevRef.current = totalPrice;
    const diff = totalPrice - from;
    const duration = Math.min(400, Math.abs(diff) * 10);
    const start = performance.now();

    function animate(now: number) {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      setDisplayTotal(Math.round(from + diff * progress));
      if (progress < 1) requestAnimationFrame(animate);
    }
    requestAnimationFrame(animate);
  }, [totalPrice]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.3, ease: "easeOut" }}
      className="absolute bottom-6 right-6 z-40 glass-dark px-5 py-3"
    >
      <p className="text-xs uppercase tracking-wider text-gray-400 mb-1">
        Estimasi Total
      </p>
      <motion.p
        key={displayTotal}
        initial={{ scale: 1.1 }}
        animate={{ scale: 1 }}
        className="text-xl font-bold text-white tabular-nums"
      >
        Rp {displayTotal.toLocaleString("id-ID")}
      </motion.p>
    </motion.div>
  );
}
