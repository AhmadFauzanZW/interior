"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";

const ModelPreview = dynamic(() => import("@/components/admin/ModelPreview"), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center bg-gray-100 rounded-xl h-64">
      <svg className="animate-spin h-6 w-6 text-gray-400" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
      </svg>
    </div>
  ),
});

interface Category {
  id: string;
  name: string;
}

type Step = "form" | "uploading";

export default function NewProductPage() {
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [step, setStep] = useState<Step>("form");

  // Upload state
  const [glbFile, setGlbFile] = useState<File | null>(null);
  const [glbDragging, setGlbDragging] = useState(false);
  const [uploadedUrl, setUploadedUrl] = useState("");
  const [uploadedKey, setUploadedKey] = useState("");
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [thumbnailUrl, setThumbnailUrl] = useState("");
  const [uploadProgress, setUploadProgress] = useState("");

  useEffect(() => {
    fetch("/api/categories")
      .then((r) => r.json())
      .then(setCategories);
  }, []);

  function handleGlbDrop(e: React.DragEvent) {
    e.preventDefault();
    setGlbDragging(false);
    const f = e.dataTransfer.files?.[0];
    if (f) {
      setGlbFile(f);
      setUploadedUrl("");
      setUploadedKey("");
    }
  }

  const uploadFile = useCallback(async (file: File, folder: string): Promise<{ url: string; key: string } | null> => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("folder", folder);
    try {
      const res = await fetch("/api/upload", { method: "POST", body: formData });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Upload gagal");
      }
      return await res.json();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload gagal");
      return null;
    }
  }, []);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    setStep("uploading");

    const form = new FormData(e.currentTarget);

    // Upload .glb file first if present
    let glbUrl = (form.get("glbUrl") as string) || "";
    if (glbFile) {
      setUploadProgress("Mengupload model 3D...");
      const result = await uploadFile(glbFile, "models");
      if (!result) { setSubmitting(false); setStep("form"); return; }
      glbUrl = result.url;
      setUploadedUrl(result.url);
      setUploadedKey(result.key);
    }

    // Upload thumbnail if present
    let thumbUrl = (form.get("thumbnailUrl") as string) || "";
    if (thumbnailFile) {
      setUploadProgress("Mengupload thumbnail...");
      const result = await uploadFile(thumbnailFile, "thumbnails");
      if (result) thumbUrl = result.url;
      setThumbnailUrl(thumbUrl);
    }

    setUploadProgress("Menyimpan produk...");

    const data = {
      categoryId: form.get("categoryId"),
      name: form.get("name"),
      description: form.get("description") || "",
      basePrice: form.get("basePrice") || "0",
      glbUrl: glbUrl || "",
      thumbnailUrl: thumbUrl || "",
      dimensions: {
        width: parseFloat(form.get("dimWidth") as string) || 1,
        height: parseFloat(form.get("dimHeight") as string) || 1,
        depth: parseFloat(form.get("dimDepth") as string) || 1,
      },
    };

    const res = await fetch("/api/products", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    if (res.ok) {
      router.push("/admin");
      router.refresh();
    } else {
      const err = await res.json();
      setError(typeof err.error === "string" ? err.error : "Gagal menambah produk");
      setStep("form");
    }

    setSubmitting(false);
  }

  return (
    <div className="max-w-2xl">
      <h1 className="font-serif text-3xl font-bold mb-8">Produk Baru</h1>

      {step === "uploading" && (
        <div className="glass p-8 text-center mb-6">
          <svg className="animate-spin h-8 w-8 text-[var(--color-accent)] mx-auto mb-3" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          <p className="text-[var(--color-text-secondary)]">{uploadProgress}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Category */}
        <div className="glass p-6 space-y-4">
          <h3 className="font-serif text-lg font-semibold">Informasi Dasar</h3>

          <div>
            <label className="block text-sm font-medium mb-1.5">Kategori</label>
            <select
              name="categoryId"
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
            <input
              name="name"
              required
              placeholder="Contoh: Kursi Kantor Ergonomis"
              className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white/80 focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1.5">Deskripsi</label>
            <textarea
              name="description"
              rows={2}
              placeholder="Deskripsi singkat produk..."
              className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white/80 focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1.5">Harga Dasar (Rp)</label>
            <input
              name="basePrice"
              type="number"
              required
              min="0"
              placeholder="2499000"
              className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white/80 focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]"
            />
          </div>
        </div>

        {/* 3D Model Upload */}
        <div className="glass p-6 space-y-4">
          <h3 className="font-serif text-lg font-semibold">Model 3D (.glb)</h3>

          <div
            onDragOver={(e) => { e.preventDefault(); setGlbDragging(true); }}
            onDragLeave={() => setGlbDragging(false)}
            onDrop={handleGlbDrop}
            className={`border-2 border-dashed rounded-xl p-6 text-center transition-all cursor-pointer ${
              glbDragging ? "border-[var(--color-accent)] bg-[var(--color-accent)]/5" : "border-gray-300 hover:border-[var(--color-accent)]/50"
            } ${glbFile ? "bg-emerald-50 border-emerald-300" : ""}`}
          >
            <input
              type="file"
              accept=".glb,.gltf"
              onChange={(e) => {
                setGlbFile(e.target.files?.[0] || null);
                setUploadedUrl("");
                setUploadedKey("");
              }}
              className="hidden"
              id="glb-input"
            />
            <label htmlFor="glb-input" className="cursor-pointer">
              {glbFile ? (
                <div>
                  <svg className="w-8 h-8 text-emerald-500 mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p className="font-medium text-emerald-700">{glbFile.name}</p>
                  <p className="text-sm text-emerald-600">{(glbFile.size / 1024 / 1024).toFixed(2)} MB</p>
                </div>
              ) : (
                <div>
                  <svg className="w-10 h-10 text-gray-400 mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                  </svg>
                  <p className="font-medium text-gray-600">Drag & drop model .glb</p>
                  <p className="text-sm text-[var(--color-text-secondary)]">atau klik untuk memilih (max 50MB)</p>
                </div>
              )}
            </label>
          </div>

          {uploadedUrl && (
            <div className="p-3 bg-emerald-50 rounded-xl">
              <p className="text-sm text-emerald-700 font-medium mb-1">Model terupload!</p>
              <ModelPreview url={uploadedUrl} className="h-48" />
            </div>
          )}

          <div className="flex items-center gap-3">
            <div className="flex-1 h-px bg-gray-200" />
            <span className="text-xs text-[var(--color-text-secondary)]">atau</span>
            <div className="flex-1 h-px bg-gray-200" />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1.5">URL Model .glb (jika sudah ada)</label>
            <input
              name="glbUrl"
              type="url"
              placeholder="https://..."
              disabled={!!glbFile}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white/80 focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] disabled:opacity-50"
            />
          </div>
        </div>

        {/* Thumbnail Upload */}
        <div className="glass p-6 space-y-4">
          <h3 className="font-serif text-lg font-semibold">Thumbnail (Opsional)</h3>
          <div>
            <input
              type="file"
              accept=".jpg,.jpeg,.png,.webp"
              onChange={(e) => setThumbnailFile(e.target.files?.[0] || null)}
              className="w-full text-sm file:mr-4 file:py-2.5 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-medium file:bg-[var(--color-accent)]/10 file:text-[var(--color-accent)] hover:file:bg-[var(--color-accent)]/20 transition-colors"
            />
            {thumbnailFile && (
              <p className="text-xs text-[var(--color-text-secondary)] mt-2">
                {thumbnailFile.name} ({(thumbnailFile.size / 1024).toFixed(0)} KB)
              </p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5">Atau URL Thumbnail</label>
            <input
              name="thumbnailUrl"
              type="url"
              placeholder="https://..."
              className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white/80 focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]"
            />
          </div>
        </div>

        {/* Dimensions */}
        <div className="glass p-6 space-y-4">
          <h3 className="font-serif text-lg font-semibold">Dimensi (meter)</h3>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-xs text-[var(--color-text-secondary)] mb-1">Lebar</label>
              <input name="dimWidth" type="number" step="0.01" min="0.01" defaultValue="1" className="w-full px-3 py-2.5 rounded-xl border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]" />
            </div>
            <div>
              <label className="block text-xs text-[var(--color-text-secondary)] mb-1">Tinggi</label>
              <input name="dimHeight" type="number" step="0.01" min="0.01" defaultValue="1" className="w-full px-3 py-2.5 rounded-xl border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]" />
            </div>
            <div>
              <label className="block text-xs text-[var(--color-text-secondary)] mb-1">Kedalaman</label>
              <input name="dimDepth" type="number" step="0.01" min="0.01" defaultValue="1" className="w-full px-3 py-2.5 rounded-xl border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]" />
            </div>
          </div>
        </div>

        {error && (
          <div className="p-4 bg-red-50 text-red-700 text-sm rounded-xl">{error}</div>
        )}

        <button
          type="submit"
          disabled={submitting}
          className="w-full py-3.5 bg-[var(--color-accent)] text-white rounded-xl font-medium hover:bg-[#4338ca] transition-colors disabled:opacity-50 shadow-lg shadow-[var(--color-accent)]/20"
        >
          {submitting ? "Menyimpan..." : "Simpan & Upload Produk"}
        </button>
      </form>
    </div>
  );
}
