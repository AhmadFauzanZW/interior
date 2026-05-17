"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";

export default function HomePage() {
  const router = useRouter();
  const [showModal, setShowModal] = useState(true);
  const [length, setLength] = useState("");
  const [width, setWidth] = useState("");
  const [error, setError] = useState("");

  function handleStart() {
    const l = parseFloat(length);
    const w = parseFloat(width);

    if (!l || !w || l <= 0 || w <= 0) {
      setError("Masukkan ukuran panjang dan lebar yang valid (minimal 1 meter).");
      return;
    }

    if (l > 20 || w > 20) {
      setError("Ukuran maksimal ruangan adalah 20m x 20m.");
      return;
    }

    router.push(`/design?length=${l}&width=${w}`);
  }

  return (
    <main className="fixed inset-0 flex items-center justify-center bg-gradient-to-br from-[#faf9f6] via-[#f0f0eb] to-[#e8e6e0]">
      <div className="text-center z-10">
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.17, 0.67, 0.83, 0.67] }}
          className="font-serif text-6xl font-bold text-[var(--color-text-primary)] mb-4"
        >
          Interior
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2, ease: [0.17, 0.67, 0.83, 0.67] }}
          className="text-lg text-[var(--color-text-secondary)] mb-12"
        >
          Live 3D Room Designer — Visualisasikan furnitur impian Anda
        </motion.p>
      </div>

      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.5, ease: [0.17, 0.67, 0.83, 0.67] }}
              className="glass w-full max-w-md mx-4 p-8 shadow-2xl"
            >
              <h2 className="font-serif text-2xl font-semibold mb-2">
                Ukuran Ruangan Anda
              </h2>
              <p className="text-[var(--color-text-secondary)] text-sm mb-6">
                Masukkan ukuran asli ruangan dalam meter untuk memulai simulasi.
              </p>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1.5">
                    Panjang (meter)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min="1"
                    max="20"
                    value={length}
                    onChange={(e) => {
                      setLength(e.target.value);
                      setError("");
                    }}
                    placeholder="Contoh: 5"
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white/80 focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] focus:border-transparent transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1.5">
                    Lebar (meter)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min="1"
                    max="20"
                    value={width}
                    onChange={(e) => {
                      setWidth(e.target.value);
                      setError("");
                    }}
                    placeholder="Contoh: 4"
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white/80 focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] focus:border-transparent transition-all"
                  />
                </div>

                {error && (
                  <motion.p
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-red-500 text-sm"
                  >
                    {error}
                  </motion.p>
                )}

                <button
                  onClick={handleStart}
                  className="w-full py-3.5 bg-[var(--color-accent)] text-white rounded-xl font-medium hover:bg-[#4338ca] transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] focus:ring-offset-2"
                >
                  Mulai Simulasi
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}
