"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";

const ModelPreview = dynamic(() => import("@/components/admin/ModelPreview"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-80 bg-gray-100 rounded-xl flex items-center justify-center">
      <svg className="animate-spin h-8 w-8 text-gray-400" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
      </svg>
    </div>
  ),
});

interface Product {
  id: string;
  name: string;
  basePrice: string;
  categoryId: string;
  glbUrl: string;
  thumbnailUrl: string | null;
  createdAt: string;
}

interface Category {
  id: string;
  name: string;
  slug: string;
}

export default function AdminPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [previewProduct, setPreviewProduct] = useState<Product | null>(null);

  useEffect(() => {
    async function fetchData() {
      const [prodRes, catRes] = await Promise.all([
        fetch("/api/products"),
        fetch("/api/categories"),
      ]);
      if (prodRes.ok) setProducts(await prodRes.json());
      if (catRes.ok) setCategories(await catRes.json());
      setLoading(false);
    }
    fetchData();
  }, []);

  async function handleDelete(id: string) {
    if (!confirm("Hapus produk ini?")) return;
    await fetch(`/api/products/${id}`, { method: "DELETE" });
    setProducts((p) => p.filter((pr) => pr.id !== id));
  }

  function getCategoryName(categoryId: string) {
    return categories.find((c) => c.id === categoryId)?.name || "-";
  }

  function hasModel(product: Product) {
    return product.glbUrl && product.glbUrl !== "/placeholder.glb" && product.glbUrl !== "";
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-serif text-3xl font-bold text-[var(--color-text-primary)]">
            Dashboard Admin
          </h1>
          <p className="text-[var(--color-text-secondary)] mt-1">
            {products.length} produk terdaftar
          </p>
        </div>
        <Link
          href="/admin/products/new"
          className="px-5 py-3 bg-[var(--color-accent)] text-white rounded-xl font-medium hover:bg-[#4338ca] transition-colors shadow-lg shadow-[var(--color-accent)]/20"
        >
          + Produk Baru
        </Link>
      </div>

      {loading ? (
        <div className="text-center py-12 text-[var(--color-text-secondary)]">
          Memuat data...
        </div>
      ) : (
        <div className="glass overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-gray-50/50">
                <tr>
                  <th className="px-3 py-3 text-xs font-semibold uppercase tracking-wider text-[var(--color-text-secondary)]">
                    Nama
                  </th>
                  <th className="px-3 py-3 text-xs font-semibold uppercase tracking-wider text-[var(--color-text-secondary)]">
                    Kategori
                  </th>
                  <th className="px-3 py-3 text-xs font-semibold uppercase tracking-wider text-[var(--color-text-secondary)]">
                    Harga
                  </th>
                  <th className="px-3 py-3 text-xs font-semibold uppercase tracking-wider text-[var(--color-text-secondary)]">
                    Model 3D
                  </th>
                  <th className="px-3 py-3 text-xs font-semibold uppercase tracking-wider text-[var(--color-text-secondary)]">
                    Aksi
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {products.map((product) => (
                  <tr key={product.id} className="hover:bg-gray-50/30 transition-colors">
                    <td className="px-3 py-3 font-medium">{product.name}</td>
                    <td className="px-3 py-3 text-[var(--color-text-secondary)] text-sm">
                      {getCategoryName(product.categoryId)}
                    </td>
                    <td className="px-3 py-3 text-sm">
                      Rp {Number(product.basePrice).toLocaleString("id-ID")}
                    </td>
                    <td className="px-3 py-3">
                      {hasModel(product) ? (
                        <button
                          onClick={() => setPreviewProduct(product)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-700 text-xs font-medium hover:bg-emerald-100 transition-colors"
                        >
                          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                          Lihat 3D
                        </button>
                      ) : (
                        <span className="text-xs text-amber-600 bg-amber-50 px-2 py-1 rounded-full">
                          Belum ada
                        </span>
                      )}
                    </td>
                    <td className="px-3 py-3">
                      <div className="flex items-center gap-2">
                        <Link
                          href={`/admin/products/${product.id}/edit`}
                          className="text-sm text-[var(--color-accent)] hover:underline"
                        >
                          Edit
                        </Link>
                        <button
                          onClick={() => handleDelete(product.id)}
                          className="text-sm text-red-500 hover:text-red-700 transition-colors"
                        >
                          Hapus
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {products.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-[var(--color-text-secondary)]">
                      Belum ada produk.{" "}
                      <Link href="/admin/products/new" className="text-[var(--color-accent)] hover:underline">
                        Tambahkan produk pertama Anda →
                      </Link>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 3D Preview Modal — only ONE canvas at a time */}
      {previewProduct && hasModel(previewProduct) && (
        <div
          className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setPreviewProduct(null)}
        >
          <div
            className="glass p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-serif text-lg font-semibold">{previewProduct.name}</h3>
                <p className="text-sm text-[var(--color-text-secondary)]">
                  Rp {Number(previewProduct.basePrice).toLocaleString("id-ID")}
                </p>
              </div>
              <button
                onClick={() => setPreviewProduct(null)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <ModelPreview url={previewProduct.glbUrl} className="h-72" />
            <p className="text-xs text-[var(--color-text-secondary)] mt-3 break-all font-mono">
              {previewProduct.glbUrl}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
