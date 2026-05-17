import { create } from "zustand";

interface RoomState {
  length: number;
  width: number;
  wallHeight: number;
  wallThickness: number;
  setDimensions: (length: number, width: number) => void;
}

export const useRoomStore = create<RoomState>((set) => ({
  length: 5,
  width: 4,
  wallHeight: 3,
  wallThickness: 0.15,
  setDimensions: (length, width) => set({ length, width }),
}));
