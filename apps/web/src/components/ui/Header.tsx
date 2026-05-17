"use client";

import { motion } from "framer-motion";

interface HeaderProps {
  roomInfo: string;
}

export default function Header({ roomInfo }: HeaderProps) {
  return (
    <motion.header
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: [0.17, 0.67, 0.83, 0.67] }}
      className="absolute top-0 left-0 right-0 z-40 flex items-center justify-between px-6 py-4"
    >
      <div className="flex items-center gap-4">
        <h1 className="font-serif text-xl font-bold text-[var(--color-text-primary)]">
          Interior
        </h1>
        <span className="text-xs px-3 py-1 rounded-full glass text-[var(--color-text-secondary)]">
          {roomInfo}
        </span>
      </div>

      <div className="flex items-center gap-4">
        <button className="text-sm px-4 py-2 rounded-xl glass font-medium hover:bg-white/90 transition-colors">
          Bagikan
        </button>
        <button className="text-sm px-4 py-2 rounded-xl bg-[var(--color-accent)] text-white font-medium hover:bg-[#4338ca] transition-colors">
          Pesan Sekarang
        </button>
      </div>
    </motion.header>
  );
}
