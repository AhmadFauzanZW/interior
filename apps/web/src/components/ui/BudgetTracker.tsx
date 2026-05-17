"use client";

import { motion } from "framer-motion";
import { useState, useEffect } from "react";

export default function BudgetTracker() {
  const [total, setTotal] = useState(0);
  const [displayTotal, setDisplayTotal] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => setDisplayTotal(total), 300);
    return () => clearTimeout(timer);
  }, [total]);

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
