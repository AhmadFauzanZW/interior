"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";

interface Category {
  id: string;
  name: string;
}

export default function EditProductPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [name, setName] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [description, setDescription] = useState("");
  const [basePrice, setBasePrice] = useState("");
  const [glbUrl, setGlbUrl] = useState("");
  const [thumbnailUrl, setThumbnailUrl] = useState("");
  const [dimWidth, setDimWidth] = useState("1");
  const [dimHeight, setDimHeight] = useState("1");
  const [dimDepth, setDimDepth] = useState("1");

  useEffect(() => {
    async function fetchData() {
      const [prodRes, catRes] = await Promise.all([
        fetch(`/api/products/${id}`),
        fetch("/api/categories"),
      ]);
      if (catRes.ok) setCategories(await catRes.json());
      if (prodRes.ok) {
        const p = await prodRes.json();
        setName(p.name);
        setCategoryId(p.categoryId);
        setDescription(p.description || "");
        setBasePrice(String(p.basePrice));
        setGlbUrl(p.glbUrl || "");
        setThumbnailUrl(p.thumbnailUrl || "");
        if (p.dimensions) {
          setDimWidth(String(p.dimensions.width));
          setDimHeight(String(p.dimensions.height));
          setDimDepth(String(p.dimensions.depth));
        }
      } else {
        setError("Produk tidak ditemukan");
      }
      setLoading(false);
    }
    fetchData();
  }, [id]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");

    const data = {
      categoryId,
      name,
      description,
      basePrice,
      glbUrl,
      thumbnailUrl,
      dimensions: {
        width: parseFloat(dimWidth) || 1,
        height: parseFloat(dimHeight) || 1,
        depth: parseFloat(dimDepth) || 1,
      },
    };

    const res = await fetch(`/api/products/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    if (res.ok) {
      router.push("/admin");
      router.refresh();
    } else {
      const err = await res.json();
      setError(err.error || "Gagal menyimpan");
    }
    setSaving(false);
  }

  if (loading) {
    return <div className="text-center py-12 text-[var(--color-text-secondary)]">Memuat...</div>;
  }

  return (
    <div className="max-w-2xl">
      <h1 className="font-serif text-3xl font-bold mb-8">Edit Produk</h1>

      <form onSubmit={handleSubmit} className="glass p-6 space-y-5">
        <div>
          <label className="block text-sm font-medium mb-1.5">Kategori</label>
          <select
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
            required
            className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white/80 focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]"
          >
            <option value="">Pilih kategori...</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1.5">Nama Produk</label>
          <input value={name} onChange={(e) => setName(e.target.value)} required className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white/80 focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1.5">Deskripsi</label>
          <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={2} className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white/80 focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1.5">Harga Dasar (Rp)</label>
          <input value={basePrice} onChange={(e) => setBasePrice(e.target.value)} type="number" required min="0" className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white/80 focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1.5">URL Model .glb</label>
          <input value={glbUrl} onChange={(e) => setGlbUrl(e.target.value)} type="url" className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white/80 focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1.5">URL Thumbnail</label>
          <input value={thumbnailUrl} onChange={(e) => setThumbnailUrl(e.target.value)} type="url" className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white/80 focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]" />
        </div>
        <fieldset className="border border-gray-200 rounded-xl p-4">
          <legend className="text-sm font-medium px-2">Dimensi (meter)</legend>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-xs text-[var(--color-text-secondary)] mb-1">Lebar</label>
              <input value={dimWidth} onChange={(e) => setDimWidth(e.target.value)} type="number" step="0.01" min="0.01" className="w-full px-3 py-2.5 rounded-xl border border-gray-200 bg-white" />
            </div>
            <div>
              <label className="block text-xs text-[var(--color-text-secondary)] mb-1">Tinggi</label>
              <input value={dimHeight} onChange={(e) => setDimHeight(e.target.value)} type="number" step="0.01" min="0.01" className="w-full px-3 py-2.5 rounded-xl border border-gray-200 bg-white" />
            </div>
            <div>
              <label className="block text-xs text-[var(--color-text-secondary)] mb-1">Kedalaman</label>
              <input value={dimDepth} onChange={(e) => setDimDepth(e.target.value)} type="number" step="0.01" min="0.01" className="w-full px-3 py-2.5 rounded-xl border border-gray-200 bg-white" />
            </div>
          </div>
        </fieldset>

        {error && <div className="p-4 bg-red-50 text-red-700 text-sm rounded-xl">{error}</div>}

        <button type="submit" disabled={saving} className="w-full py-3.5 bg-[var(--color-accent)] text-white rounded-xl font-medium hover:bg-[#4338ca] transition-colors disabled:opacity-50">
          {saving ? "Menyimpan..." : "Simpan Perubahan"}
        </button>
      </form>
    </div>
  );
}
