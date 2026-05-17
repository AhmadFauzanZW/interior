import { create } from "zustand";

interface UIState {
  showRoomModal: boolean;
  showCatalog: boolean;
  showActionBar: boolean;
  isDragging: boolean;
  loadingProductId: string | null;
  setShowRoomModal: (show: boolean) => void;
  setShowCatalog: (show: boolean) => void;
  setShowActionBar: (show: boolean) => void;
  setIsDragging: (dragging: boolean) => void;
  setLoadingProductId: (id: string | null) => void;
}

export const useUIStore = create<UIState>((set) => ({
  showRoomModal: true,
  showCatalog: true,
  showActionBar: false,
  isDragging: false,
  loadingProductId: null,
  setShowRoomModal: (show) => set({ showRoomModal: show }),
  setShowCatalog: (show) => set({ showCatalog: show }),
  setShowActionBar: (show) => set({ showActionBar: show }),
  setIsDragging: (dragging) => set({ isDragging: dragging }),
  setLoadingProductId: (id) => set({ loadingProductId: id }),
}));
