"use client";

import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useCatalogStore, CatalogProduct } from "@/stores/catalog-store";
import { useCanvasStore } from "@/stores/canvas-store";
import { useUIStore } from "@/stores/ui-store";

export default function CatalogPanel() {
  const {
    products,
    categories,
    selectedCategory,
    isPanelOpen,
    setProducts,
    setCategories,
    setSelectedCategory,
    togglePanel,
  } = useCatalogStore();

  const addItem = useCanvasStore((s) => s.addItem);
  const setLoadingProductId = useUIStore((s) => s.setLoadingProductId);

  useEffect(() => {
    async function fetchData() {
      const [prodRes, catRes] = await Promise.all([
        fetch("/api/products"),
        fetch("/api/categories"),
      ]);
      if (prodRes.ok) {
        const data = await prodRes.json();
        setProducts(data);
      }
      if (catRes.ok) {
        const data = await catRes.json();
        setCategories(data);
      }
    }
    fetchData();
  }, [setProducts, setCategories]);

  const filtered = selectedCategory
    ? products.filter((p) => p.categoryId === selectedCategory)
    : products;

  function handleDragStart(e: React.DragEvent, product: CatalogProduct) {
    e.dataTransfer.setData("application/json", JSON.stringify({
      id: product.id,
      name: product.name,
      basePrice: product.basePrice,
      glbUrl: product.glbUrl,
      dimensions: product.dimensions,
    }));
    e.dataTransfer.effectAllowed = "copy";
  }

  function handleClickPlace(product: CatalogProduct) {
    setLoadingProductId(product.id);
    const instanceId = crypto.randomUUID();
    const price = Number(product.basePrice);

    addItem({
      instanceId,
      productId: product.id,
      name: product.name,
      price,
      glbUrl: product.glbUrl || "",
      dimensions: product.dimensions,
      position: [2.5, 0, 2],
      rotation: [0, 0, 0],
      variantId: null,
      colorHex: null,
    });
  }

  return (
    <>
      <AnimatePresence>
        {isPanelOpen && (
          <motion.div
            initial={{ x: -340, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -340, opacity: 0 }}
            transition={{ duration: 0.5, ease: [0.17, 0.67, 0.83, 0.67] }}
            className="absolute left-4 top-20 bottom-20 w-72 z-30 glass overflow-hidden flex flex-col shadow-xl"
          >
            <div className="p-4 border-b border-gray-200/50">
              <h2 className="font-serif text-lg font-semibold">Katalog</h2>
              <p className="text-xs text-[var(--color-text-secondary)] mt-0.5">
                {filtered.length} furnitur
              </p>
            </div>

            <div className="flex gap-1 p-2 overflow-x-auto border-b border-gray-200/50">
              <button
                onClick={() => setSelectedCategory(null)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
                  !selectedCategory
                    ? "bg-[var(--color-accent)] text-white"
                    : "text-[var(--color-text-secondary)] hover:bg-gray-100"
                }`}
              >
                Semua
              </button>
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
                    selectedCategory === cat.id
                      ? "bg-[var(--color-accent)] text-white"
                      : "text-[var(--color-text-secondary)] hover:bg-gray-100"
                  }`}
                >
                  {cat.name}
                </button>
              ))}
            </div>

            <div className="flex-1 overflow-y-auto p-3 space-y-2">
              {filtered.map((product) => (
                <motion.div
                  key={product.id}
                  layout
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  draggable
                  onDragStart={(e) => handleDragStart(e as any, product)}
                  onClick={() => handleClickPlace(product)}
                  className="flex items-center gap-3 p-3 rounded-xl bg-white/60 hover:bg-white/90 cursor-grab active:cursor-grabbing transition-all border border-transparent hover:border-[var(--color-accent)]/30 hover:shadow-sm"
                >
                  <div className="w-14 h-14 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0 overflow-hidden">
                    {product.thumbnailUrl ? (
                      <img
                        src={product.thumbnailUrl}
                        alt={product.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <svg
                        className="w-6 h-6 text-gray-400"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={1.5}
                          d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                        />
                      </svg>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{product.name}</p>
                    <p className="text-xs text-[var(--color-accent)] font-semibold mt-0.5">
                      Rp {Number(product.basePrice).toLocaleString("id-ID")}
                    </p>
                    {product.dimensions && (
                      <p className="text-xs text-[var(--color-text-secondary)]">
                        {product.dimensions.width}m x {product.dimensions.height}m x{" "}
                        {product.dimensions.depth}m
                      </p>
                    )}
                  </div>
                </motion.div>
              ))}
              {filtered.length === 0 && (
                <div className="text-center py-8 text-sm text-[var(--color-text-secondary)]">
                  Belum ada furnitur di kategori ini.
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <button
        onClick={togglePanel}
        className="absolute left-4 top-20 z-40 glass w-10 h-10 flex items-center justify-center rounded-xl hover:bg-white/90 transition-colors"
        style={{ left: isPanelOpen ? 308 : 16 }}
      >
        <svg
          className={`w-5 h-5 transition-transform ${isPanelOpen ? "rotate-180" : ""}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 5l7 7-7 7"
          />
        </svg>
      </button>
    </>
  );
}
