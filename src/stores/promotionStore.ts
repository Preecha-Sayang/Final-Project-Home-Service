import { create } from "zustand";

interface PromotionState {
  discount: number;
  setDiscount: (disVal: number) => void;
}

export const usePromotionStore = create<PromotionState>((set) => ({
  discount: 0,
  setDiscount: (disVal) => set({ discount: disVal }),
}));
