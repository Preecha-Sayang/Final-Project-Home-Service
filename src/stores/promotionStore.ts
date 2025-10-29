import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

interface PromotionState {
  promotionId: number | null;
  promotionCode: string | null;
  discountType: 'fixed' | 'percent' | null;
  discountValue: number;
  discount: number; // ยอดส่วนลดจริงเป็นเงิน
  
  setPromotion: (data: {
    promotionId: number;
    promotionCode: string;
    discountType: 'fixed' | 'percent';
    discountValue: number;
    discount: number;
  }) => void;
  
  setDiscount: (disVal: number) => void;
  clearPromotion: () => void;
}

export const usePromotionStore = create<PromotionState>()(
  persist(
    (set) => ({
      promotionId: null,
      promotionCode: null,
      discountType: null,
      discountValue: 0,
      discount: 0,
      
      setPromotion: (data) => set({
        promotionId: data.promotionId,
        promotionCode: data.promotionCode,
        discountType: data.discountType,
        discountValue: data.discountValue,
        discount: data.discount,
      }),
      
      setDiscount: (disVal) => set({ discount: disVal }),
      
      clearPromotion: () => set({
        promotionId: null,
        promotionCode: null,
        discountType: null,
        discountValue: 0,
        discount: 0,
      }),
    }),
    {
      name: 'promotion-storage',
      storage: createJSONStorage(() => sessionStorage),
    }
  )
);