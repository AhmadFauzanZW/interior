import { create } from "zustand";

export interface CatalogProduct {
  id: string;
  name: string;
  basePrice: string;
  glbUrl: string;
  thumbnailUrl: string | null;
  dimensions: { width: number; height: number; depth: number } | null;
  categoryId: string;
  variants: CatalogVariant[];
}

export interface CatalogVariant {
  id: string;
  colorHex: string | null;
  materialType: string | null;
  additionalPrice: string;
}

interface CatalogState {
  products: CatalogProduct[];
  categories: { id: string; name: string; slug: string }[];
  selectedCategory: string | null;
  isPanelOpen: boolean;
  setProducts: (products: CatalogProduct[]) => void;
  setCategories: (categories: { id: string; name: string; slug: string }[]) => void;
  setSelectedCategory: (id: string | null) => void;
  togglePanel: () => void;
}

export const useCatalogStore = create<CatalogState>((set) => ({
  products: [],
  categories: [],
  selectedCategory: null,
  isPanelOpen: true,
  setProducts: (products) => set({ products }),
  setCategories: (categories) => set({ categories }),
  setSelectedCategory: (id) => set({ selectedCategory: id }),
  togglePanel: () => set((s) => ({ isPanelOpen: !s.isPanelOpen })),
}));
