import { create } from "zustand";

export interface PlacedItem {
  instanceId: string;
  productId: string;
  name: string;
  price: number;
  glbUrl: string;
  dimensions: { width: number; height: number; depth: number } | null;
  position: [number, number, number];
  rotation: [number, number, number];
  variantId: string | null;
  colorHex: string | null;
}

interface CanvasState {
  placedItems: PlacedItem[];
  selectedItemId: string | null;
  totalPrice: number;
  addItem: (item: PlacedItem) => void;
  removeItem: (instanceId: string) => void;
  moveItem: (instanceId: string, position: [number, number, number]) => void;
  rotateItem: (instanceId: string, rotation: [number, number, number]) => void;
  selectItem: (instanceId: string | null) => void;
  updateVariant: (instanceId: string, variantId: string, colorHex: string | null, priceChange: number) => void;
}

export const useCanvasStore = create<CanvasState>((set) => ({
  placedItems: [],
  selectedItemId: null,
  totalPrice: 0,
  addItem: (item) =>
    set((s) => ({
      placedItems: [...s.placedItems, item],
      totalPrice: s.totalPrice + item.price,
    })),
  removeItem: (instanceId) =>
    set((s) => {
      const item = s.placedItems.find((i) => i.instanceId === instanceId);
      return {
        placedItems: s.placedItems.filter((i) => i.instanceId !== instanceId),
        selectedItemId: s.selectedItemId === instanceId ? null : s.selectedItemId,
        totalPrice: s.totalPrice - (item?.price ?? 0),
      };
    }),
  moveItem: (instanceId, position) =>
    set((s) => ({
      placedItems: s.placedItems.map((i) =>
        i.instanceId === instanceId ? { ...i, position } : i
      ),
    })),
  rotateItem: (instanceId, rotation) =>
    set((s) => ({
      placedItems: s.placedItems.map((i) =>
        i.instanceId === instanceId ? { ...i, rotation } : i
      ),
    })),
  selectItem: (instanceId) => set({ selectedItemId: instanceId }),
  updateVariant: (instanceId, variantId, colorHex, priceChange) =>
    set((s) => ({
      placedItems: s.placedItems.map((i) =>
        i.instanceId === instanceId
          ? { ...i, variantId, colorHex, price: i.price + priceChange }
          : i
      ),
      totalPrice: s.totalPrice + priceChange,
    })),
}));
